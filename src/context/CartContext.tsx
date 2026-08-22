import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { CartItem, Package, Perfume, FeaturedPerfume, CartCalculation } from '../types/storefront';
import { trackTikTokAddToCart } from '../services/tiktok';
import { trackMetaAddToCart } from '../services/meta';

const CART_STORAGE_KEY = 'store_cart';
export const FEATURED_DISCOUNT_THRESHOLD = 2;
export const FEATURED_DISCOUNT_RATE = 0.20;

interface CartContextType extends CartCalculation {
  cartItems: CartItem[];
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  addPackageToCart: (pkg: Package, selectedPerfumes: Perfume[], quantity?: number) => void;
  addFeaturedPerfumeToCart: (featuredPerfume: FeaturedPerfume, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  discountMessage: string;
  itemJustAdded: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load cart from localStorage:', e);
    }
    return [];
  });

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [itemJustAdded, setItemJustAdded] = useState<string | null>(null);

  // Persist cart to localStorage on changes
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      }
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e);
    }
  }, [cartItems]);

  const openCart = () => setIsCartDrawerOpen(true);
  const closeCart = () => setIsCartDrawerOpen(false);

  // Trigger feedback when item is added
  const triggerAddedFeedback = (name: string) => {
    setItemJustAdded(name);
    setTimeout(() => {
      setItemJustAdded(null);
    }, 2500);
  };

  /**
   * Add a package with its chosen perfumes to the cart
   */
  const addPackageToCart = (pkg: Package, selectedPerfumes: Perfume[], quantity: number = 1) => {
    if (!pkg || quantity <= 0) return;

    // Create a deterministic signature based on package id and selected perfume ids
    const sortedPerfumeIds = selectedPerfumes.map(p => p.id).sort().join('_');
    const signature = `pkg_${pkg.id}_${sortedPerfumeIds}`;

    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => item.id === signature);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + quantity
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: signature,
          type: 'package',
          name: pkg.name,
          unit_price: Number(pkg.price) || 0,
          quantity,
          package_id: pkg.id,
          perfumes_count: pkg.perfumes_count,
          selected_perfumes: selectedPerfumes.map(p => ({
            id: p.id,
            name: p.name,
            image_url: p.image_url,
            category: p.category
          }))
        };
        return [...prev, newItem];
      }
    });

    triggerAddedFeedback(pkg.name);

    // Track TikTok AddToCart event (strictly valid content_type: 'product_group')
    trackTikTokAddToCart({
      id: pkg.id,
      name: pkg.name,
      price: Number(pkg.price) || 0,
      quantity,
      type: 'product_group',
      category: 'باقات عطور'
    });

    // Track Meta AddToCart event
    trackMetaAddToCart({
      id: pkg.id,
      name: pkg.name,
      price: Number(pkg.price) || 0,
      quantity,
      type: 'product_group',
      category: 'باقات عطور'
    });
  };

  /**
   * Add a featured perfume to the cart (increment quantity if already present)
   */
  const addFeaturedPerfumeToCart = (featuredPerfume: FeaturedPerfume, quantity: number = 1) => {
    if (!featuredPerfume || quantity <= 0) return;

    const signature = `feat_${featuredPerfume.id}`;

    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => item.id === signature || (item.type === 'featured_perfume' && item.featured_perfume_id === featuredPerfume.id));
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + quantity
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: signature,
          type: 'featured_perfume',
          name: featuredPerfume.name,
          image_url: featuredPerfume.image_url,
          unit_price: Number(featuredPerfume.price) || 0,
          quantity,
          featured_perfume_id: featuredPerfume.id,
          gender: featuredPerfume.gender,
          description: featuredPerfume.description
        };
        return [...prev, newItem];
      }
    });

    triggerAddedFeedback(featuredPerfume.name);

    // Track TikTok AddToCart event (strictly valid content_type: 'product')
    trackTikTokAddToCart({
      id: featuredPerfume.id,
      name: featuredPerfume.name,
      price: Number(featuredPerfume.price) || 0,
      quantity,
      type: 'product',
      category: 'عطور مميزة'
    });

    // Track Meta AddToCart event
    trackMetaAddToCart({
      id: featuredPerfume.id,
      name: featuredPerfume.name,
      price: Number(featuredPerfume.price) || 0,
      quantity,
      type: 'product',
      category: 'عطور مميزة'
    });
  };

  /**
   * Remove an item completely from cart
   */
  const removeFromCart = (cartItemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== cartItemId));
  };

  /**
   * Update quantity of an item. If <= 0, remove it.
   */
  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.id === cartItemId ? { ...item, quantity: Math.floor(newQuantity) } : item
      )
    );
  };

  /**
   * Clear entire cart
   */
  const clearCart = () => {
    setCartItems([]);
  };

  /**
   * Centralized Cart Calculations
   */
  const calculations: CartCalculation = useMemo(() => {
    let packageSubtotal = 0;
    let featuredSubtotal = 0;
    let totalFeaturedQuantity = 0;
    let totalItemsCount = 0;

    for (const item of cartItems) {
      const qty = Number(item.quantity) || 1;
      const price = Number(item.unit_price) || 0;
      totalItemsCount += qty;

      if (item.type === 'package') {
        packageSubtotal += price * qty;
      } else if (item.type === 'featured_perfume') {
        featuredSubtotal += price * qty;
        totalFeaturedQuantity += qty;
      }
    }

    // 20% discount on all featured perfumes if total featured quantity >= 2
    let featuredDiscount = 0;
    const isDiscountActive = totalFeaturedQuantity >= FEATURED_DISCOUNT_THRESHOLD;

    if (isDiscountActive) {
      featuredDiscount = Math.round(featuredSubtotal * FEATURED_DISCOUNT_RATE);
    }

    const productsSubtotal = packageSubtotal + featuredSubtotal;
    const productsTotal = Math.max(0, productsSubtotal - featuredDiscount);

    return {
      packageSubtotal,
      featuredSubtotal,
      totalFeaturedQuantity,
      featuredDiscount,
      productsSubtotal,
      productsTotal,
      totalItemsCount,
      isDiscountActive
    };
  }, [cartItems]);

  const discountMessage = useMemo(() => {
    if (calculations.totalFeaturedQuantity === 1) {
      return 'أضف عطراً مميزاً آخر لتحصل على خصم 20% على العطور المميزة 🎁';
    }
    if (calculations.totalFeaturedQuantity >= 2) {
      return '🎁 تم تفعيل خصم 20% على العطور المميزة!';
    }
    return '👑 خصم 20% على كل عطر عند شراء 2 أو أكثر من العطور المميزة';
  }, [calculations.totalFeaturedQuantity]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        openCart,
        closeCart,
        addPackageToCart,
        addFeaturedPerfumeToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemJustAdded,
        discountMessage,
        ...calculations
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
