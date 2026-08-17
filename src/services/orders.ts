import { supabase } from '../lib/supabase';
import { OrderPayload, CreatedOrder } from '../types/storefront';

export interface OrderCreationResult {
  success: boolean;
  order?: CreatedOrder;
  error?: {
    message: string;
    code?: string;
    details?: string;
    hint?: string;
  };
}

const isUuid = (val?: string | null): boolean => {
  if (!val) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
};

const memoryOrdersFallback: CreatedOrder[] = [];

const saveOrderLocally = (createdOrderRecord: CreatedOrder): boolean => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const existingStr = window.localStorage.getItem('local_orders') || '[]';
      const existing = JSON.parse(existingStr);
      existing.unshift(createdOrderRecord);
      window.localStorage.setItem('local_orders', JSON.stringify(existing));
      console.log('[ORDER DEBUG] ORDER SAVED TO LOCALSTORAGE:', createdOrderRecord);
      return true;
    }
  } catch (e) {
    console.error('[ORDER DEBUG] Local storage error:', e);
  }
  memoryOrdersFallback.unshift(createdOrderRecord);
  console.log('[ORDER DEBUG] ORDER SAVED TO MEMORY FALLBACK:', createdOrderRecord);
  return true;
};

export async function createOrder(payload: OrderPayload): Promise<OrderCreationResult> {
  console.log('[ORDER DEBUG] FINAL ORDER DATA:', {
    customer: payload.customer_name,
    package: payload.package_id,
    perfumes: payload.selected_perfumes,
    wilaya: payload.wilaya_id,
    commune: payload.commune_id,
    deliveryType: payload.delivery_type,
    deliveryPrice: payload.delivery_price,
    total: payload.total_price
  });

  // 1. Verify required fields before proceeding
  const missingFields: string[] = [];
  if (!payload.customer_name) missingFields.push('اسم الزبون');
  if (!payload.phone) missingFields.push('رقم الهاتف');
  if (!payload.package_id) missingFields.push('معرف الباقة');
  if (typeof payload.package_price !== 'number' || Number.isNaN(payload.package_price)) missingFields.push('سعر الباقة');
  if (!payload.selected_perfumes || payload.selected_perfumes.length === 0) missingFields.push('العطور المختارة');
  if (!payload.wilaya_id) missingFields.push('الولاية');
  if (!payload.commune_id) missingFields.push('البلدية');
  if (!payload.delivery_type) missingFields.push('نوع التوصيل');
  if (typeof payload.delivery_price !== 'number' || Number.isNaN(payload.delivery_price)) missingFields.push('سعر التوصيل');
  if (typeof payload.total_price !== 'number' || Number.isNaN(payload.total_price)) missingFields.push('المبلغ الإجمالي');
  if (payload.delivery_type === 'home' && !payload.address) missingFields.push('العنوان التفصيلي');

  if (missingFields.length > 0) {
    const errorMsg = `حقول مطلوبة مفقودة: ${missingFields.join(', ')}`;
    console.error('[ORDER DEBUG] MISSING REQUIRED FIELDS:', errorMsg);
    return {
      success: false,
      error: {
        message: errorMsg,
        code: 'VALIDATION_FAILED'
      }
    };
  }

  const generatedId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
  const timestamp = new Date().toISOString();

  const createdOrderRecord: CreatedOrder = {
    ...payload,
    id: generatedId,
    order_number: generatedId,
    created_at: timestamp
  };

  if (!supabase) {
    console.log('[ORDER DEBUG] Supabase client not configured, saving to local storage fallback');
    saveOrderLocally(createdOrderRecord);
    return { success: true, order: createdOrderRecord };
  }

  try {
    console.log('[ORDER DEBUG] STARTING ORDER CREATION IN SUPABASE');

    // Generate UUID for order if not provided
    const orderId = (payload.id && isUuid(payload.id)) ? payload.id : crypto.randomUUID();

    // Build payload mapping strictly to existing public.orders columns
    // Note: delivery_type must be 'home' or 'office' per orders_delivery_type_check constraint
    // Note: order_number is an identity column (GENERATED ALWAYS), so we do not include it
    const dbPayload: Record<string, any> = {
      id: orderId,
      customer_name: payload.customer_name,
      phone: payload.phone,
      wilaya_id: isUuid(payload.wilaya_id) ? payload.wilaya_id : null,
      wilaya_name: payload.wilaya_name,
      commune_id: isUuid(payload.commune_id) ? payload.commune_id : null,
      commune_name: payload.commune_name,
      delivery_type: payload.delivery_type === 'home' ? 'home' : 'office',
      delivery_price: Number(payload.delivery_price) || 0,
      address: payload.address || 'غير محدد',
      notes: payload.notes || '',
      package_id: isUuid(payload.package_id) ? payload.package_id : null,
      package_name: payload.package_name,
      total_price: Number(payload.total_price) || 0,
      status: payload.status || 'pending'
    };

    // Do NOT append .select() on insert to avoid 42501 RLS violation on RETURNING * (anon role has INSERT but not SELECT on orders)
    const { error } = await supabase
      .from('orders')
      .insert([dbPayload]);

    console.log('[ORDER TRACE 5] SUPABASE INSERT RESPONSE:', {
      error
    });

    if (error) {
      console.error('[ORDER TRACE SUPABASE ERROR]', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      });

      return {
        success: false,
        error: {
          message: error.message || 'تعذر إرسال الطلب إلى قاعدة البيانات',
          code: error.code,
          details: error.details,
          hint: error.hint
        }
      };
    }

    console.log('[ORDER TRACE 6] ORDER CREATED IN SUPABASE:', orderId);

    // Insert selected perfumes into order_items table
    if (payload.selected_perfumes && payload.selected_perfumes.length > 0) {
      try {
        const itemsToInsert = payload.selected_perfumes.map((perf: any) => {
          const isFeaturedPerfume =
            perf.category === 'عطور مميزة' ||
            perf.category_name === 'عطور مميزة' ||
            perf.type === 'featured' ||
            perf.type === 'featured_perfume' ||
            (typeof perf.name === 'string' && perf.name.includes('(عطر مميز'));

          // Extract quantity
          let itemQuantity = Number(perf.quantity) || 1;
          if (!perf.quantity && typeof perf.name === 'string') {
            const qtyMatch = perf.name.match(/\(عطر مميز\s*×\s*(\d+)\)/);
            if (qtyMatch && qtyMatch[1]) {
              itemQuantity = parseInt(qtyMatch[1], 10) || 1;
            }
          }

          // Clean perfume name (remove quantity suffix like "(عطر مميز × 1)")
          let cleanName = typeof perf.name === 'string' ? perf.name.trim() : '';
          if (isFeaturedPerfume) {
            cleanName = cleanName.replace(/\s*\(عطر مميز(?:\s*×\s*\d+)?\)\s*/g, '').trim();
          }

          if (isFeaturedPerfume) {
            const featuredItem = {
              id: crypto.randomUUID(),
              order_id: orderId,
              perfume_id: null,
              perfume_name: cleanName || perf.name,
              category_name: 'عطور مميزة',
              quantity: itemQuantity,
              image_url: perf.image_url || null
            };

            console.log('[ORDER DEBUG] FEATURED ORDER ITEM:', featuredItem);
            console.log('[ORDER DEBUG] FEATURED IMAGE URL:', featuredItem.image_url);

            return featuredItem;
          }

          const normalItem = {
            id: crypto.randomUUID(),
            order_id: orderId,
            perfume_id: isUuid(perf.id) ? perf.id : null,
            perfume_name: perf.name,
            category_name: perf.category || perf.category_name || null,
            quantity: itemQuantity,
            image_url: perf.image_url || null
          };

          console.log('[ORDER DEBUG] NORMAL ORDER ITEM:', normalItem);

          return normalItem;
        });

        console.log('[ORDER ITEMS] INSERT PAYLOAD:', itemsToInsert);

        if (itemsToInsert.length > 0) {
          const { data, error: itemsError } = await supabase
            .from('order_items')
            .insert(itemsToInsert);

          console.log('[ORDER DEBUG] ORDER ITEMS INSERT RESULT:', {
            data,
            error: itemsError
          });

          if (itemsError) {
            console.warn('[ORDER DEBUG] order_items insert error:', itemsError);
          } else {
            console.log('[ORDER DEBUG] ORDER ITEMS CREATED SUCCESSFULLY IN SUPABASE');
          }
        }
      } catch (itemErr) {
        console.warn('[ORDER DEBUG] Exception inserting order_items:', itemErr);
      }
    }

    const createdOrder: CreatedOrder = {
      ...payload,
      id: orderId,
      order_number: orderId,
      created_at: timestamp
    };

    return {
      success: true,
      order: createdOrder
    };
  } catch (err: any) {
    console.error('[ORDER DEBUG] UNEXPECTED ERROR:', err);
    return {
      success: false,
      error: {
        message: err.message || 'حدث خطأ غير متوقع أثناء إرسال الطلب',
        code: err.code || 'UNEXPECTED_EXCEPION',
        details: err.details,
        hint: err.hint
      }
    };
  }
}

