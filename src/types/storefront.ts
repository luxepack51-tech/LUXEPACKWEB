export interface Package {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  perfumes_count: number; // or allowed_perfumes / perfume_count
  is_active: boolean;
  sort_order?: number;
}

export interface Perfume {
  id: string;
  name: string;
  description?: string | null;
  image_url: string;
  category: 'نسائية' | 'رجالية' | 'جميع العطور' | string;
  category_id?: string | null;
  is_active: boolean;
  sort_order?: number;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  is_active?: boolean;
}

export interface Wilaya {
  id: string | number;
  code: string;
  name: string;
  name_ar?: string;
  is_active: boolean;
  sort_order?: number;
}

export interface Commune {
  id: string | number;
  wilaya_id: string | number;
  name: string;
  name_ar?: string;
  home_delivery_price: number;
  office_delivery_price: number;
  is_active: boolean;
  sort_order?: number;
}

export type DeliveryType = 'home' | 'office';

export interface CustomerDetails {
  fullName: string;
  phone: string;
  wilayaId: string;
  wilayaName: string;
  communeId: string;
  communeName: string;
  deliveryType: DeliveryType;
  address: string;
  notes?: string;
}

export interface OrderPayload {
  id?: string;
  customer_name: string;
  phone: string;
  wilaya_id: string;
  wilaya_name: string;
  commune_id: string;
  commune_name: string;
  delivery_type: DeliveryType;
  address: string;
  notes?: string;
  package_id: string;
  package_name: string;
  package_price: number;
  selected_perfumes: Array<{ id: string; name: string; image_url?: string; category?: string }>;
  delivery_price: number;
  total_price: number;
  status: string;
}

export interface CreatedOrder extends OrderPayload {
  id: string;
  order_number?: string;
  created_at: string;
}

export interface StoreSettings {
  store_name: string;
  currency: string;
  phone_number?: string;
  whatsapp_number?: string;
  pixel_id?: string;
  hero_title?: string;
  hero_subtitle?: string;
}
