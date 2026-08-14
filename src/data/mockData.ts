import { Package, Perfume, Category, Wilaya, Commune, StoreSettings } from '../types/storefront';

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  store_name: "Parfumerie Luxe Dz",
  currency: "دج",
  phone_number: "0697613169",
  whatsapp_number: "213697613169",
  pixel_id: "",
  hero_title: "اكتشف عطورك المباشرة من أضخم المجموعات الفاخرة",
  hero_subtitle: "اختر باقتك المفضلة، وحدد عطورك المميزة. التوصيل إلى 58 ولاية والدفع عند الاستلام."
};

export const DEFAULT_PACKAGES: Package[] = [];
export const DEFAULT_CATEGORIES: Category[] = [];
export const DEFAULT_PERFUMES: Perfume[] = [];
export const DEFAULT_WILAYAS: Wilaya[] = [];
export const DEFAULT_COMMUNES_BY_WILAYA: Record<string, Commune[]> = {};

