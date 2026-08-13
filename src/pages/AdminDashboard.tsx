import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  ShieldCheck, Package, ShoppingCart, RefreshCw, ArrowLeft, Clock, 
  Plus, Trash2, Sparkles, Image as ImageIcon, CheckCircle, AlertCircle,
  Eye, EyeOff, Layers, Layers3, X
} from 'lucide-react';
import { Perfume } from '../types/storefront';
import { 
  fetchAllAdminPerfumes, 
  addPerfume, 
  togglePerfumeActiveStatus, 
  deletePerfumeFromDatabase 
} from '../services/perfumes';

interface AdminDashboardProps {
  initialTab?: 'orders' | 'perfumes';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialTab = 'orders' }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'perfumes'>(initialTab);
  
  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState<boolean>(true);

  // Perfumes State
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [isPerfumesLoading, setIsPerfumesLoading] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Perfume Form State
  const [newPerfume, setNewPerfume] = useState({
    name: '',
    description: '',
    image_url: '',
    category: 'عطور نسائية',
    is_active: true,
    sort_order: 1
  });
  const [isSubmittingPerfume, setIsSubmittingPerfume] = useState<boolean>(false);

  // Fetch Orders
  const fetchOrders = async () => {
    setIsOrdersLoading(true);
    let dbOrders: any[] = [];
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          dbOrders = data;
        }
      } catch (e) {
        console.warn('Error fetching orders from database:', e);
      }
    }

    let localOrders: any[] = [];
    try {
      const stored = localStorage.getItem('local_orders');
      if (stored) {
        localOrders = JSON.parse(stored);
      }
    } catch (e) {}

    // Merge avoiding duplicates by id
    const dbIds = new Set(dbOrders.map(o => String(o.id)));
    const uniqueLocal = localOrders.filter((o: any) => !dbIds.has(String(o.id)));

    setOrders([...uniqueLocal, ...dbOrders]);
    setIsOrdersLoading(false);
  };

  const loadLocalOrders = () => {
    try {
      const stored = localStorage.getItem('local_orders');
      if (stored) {
        setOrders(JSON.parse(stored));
      } else {
        setOrders([]);
      }
    } catch (e) {
      setOrders([]);
    }
  };

  // Fetch Perfumes
  const fetchPerfumesList = async () => {
    setIsPerfumesLoading(true);
    const list = await fetchAllAdminPerfumes();
    setPerfumes(list);
    setIsPerfumesLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    fetchPerfumesList();
  }, []);

  // Handle Add Perfume Submit
  const handleAddPerfumeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPerfume.name.trim()) {
      setStatusMessage({ type: 'error', text: 'يرجى إدخال اسم العطر' });
      return;
    }

    setIsSubmittingPerfume(true);
    const result = await addPerfume({
      name: newPerfume.name,
      description: newPerfume.description,
      image_url: newPerfume.image_url || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800',
      category: newPerfume.category,
      is_active: newPerfume.is_active,
      sort_order: Number(newPerfume.sort_order) || 1
    });

    setIsSubmittingPerfume(false);

    if (result.success) {
      setStatusMessage({ type: 'success', text: 'تمت إضافة العطر بنجاح إلى قاعدة البيانات (public.perfumes)!' });
      setIsAddModalOpen(false);
      setNewPerfume({
        name: '',
        description: '',
        image_url: '',
        category: 'عطور نسائية',
        is_active: true,
        sort_order: perfumes.length + 1
      });
      fetchPerfumesList();
    } else {
      setStatusMessage({ type: 'error', text: 'حدث خطأ أثناء إضافة العطر إلى Supabase. يرجى المحاولة لاحقاً.' });
    }

    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Toggle Active/Disable Status
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    // Optimistic UI update
    setPerfumes(prev => prev.map(p => p.id === id ? { ...p, is_active: nextStatus } : p));

    const success = await togglePerfumeActiveStatus(id, nextStatus);
    if (!success) {
      // Revert if failed
      setPerfumes(prev => prev.map(p => p.id === id ? { ...p, is_active: currentStatus } : p));
      setStatusMessage({ type: 'error', text: 'تعذر تغيير حالة العطر في قاعدة البيانات' });
    } else {
      setStatusMessage({ 
        type: 'success', 
        text: nextStatus ? 'تم تفعيل العطر بنجاح وسيظهر للمستهلكين في المتجر!' : 'تم إيقاف العطر بنجاح ولن يظهر للمستهلكين.' 
      });
    }
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Delete Perfume
  const handleDeletePerfume = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت تأكد من رغبتك في حذف العطر "${name}" نهائياً؟`)) {
      return;
    }

    setPerfumes(prev => prev.filter(p => p.id !== id));
    const success = await deletePerfumeFromDatabase(id);
    if (success) {
      setStatusMessage({ type: 'success', text: `تم حذف العطر "${name}" بنجاح` });
    } else {
      fetchPerfumesList();
      setStatusMessage({ type: 'error', text: 'تعذر حذف العطر من قاعدة البيانات' });
    }
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 sm:p-8 font-sans dir-rtl">
      {/* Top Navigation Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">لوحة تحكم الأدمن (Admin Dashboard)</h1>
            <p className="text-xs text-zinc-400">إدارة الطلبات والمنتجات الفاخرة مباشرة عبر Supabase</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (activeTab === 'orders') fetchOrders();
              else fetchPerfumesList();
            }}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isOrdersLoading || isPerfumesLoading ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>

          <a
            href="/"
            className="px-4 py-2 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-amber-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>العودة للمتجر</span>
          </a>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="max-w-7xl mx-auto flex items-center gap-3 mb-8">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-amber-400 text-zinc-950 shadow-lg shadow-amber-400/10'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>الطلبات المستلمة ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('perfumes')}
          className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'perfumes'
              ? 'bg-amber-400 text-zinc-950 shadow-lg shadow-amber-400/10'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>إدارة العطور ({perfumes.length})</span>
        </button>
      </div>

      {/* Global Status Notification */}
      {statusMessage && (
        <div className={`max-w-7xl mx-auto mb-6 p-4 rounded-2xl border text-xs sm:text-sm flex items-center gap-3 shadow-lg animate-fade-in ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200' 
            : 'bg-rose-950/80 border-rose-500/40 text-rose-200'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* TAB 1: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-8 max-w-7xl mx-auto">
          {/* Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-semibold">إجمالي الطلبات</span>
                <ShoppingCart className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-3xl font-black text-white">{orders.length}</span>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-semibold">الطلبات الجديدة (Pending)</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-3xl font-black text-amber-400">
                {orders.filter(o => o.status === 'pending' || !o.status).length}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-semibold">إجمالي المبيعات المقدرة</span>
                <Package className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-3xl font-black text-emerald-400">
                {orders.reduce((acc, o) => acc + (Number(o.total_price) || 0), 0).toLocaleString()} دج
              </span>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-lg">قائمة الطلبات المستلمة من المتجر</h3>
              <span className="text-xs text-zinc-400">الدفع عند الاستلام COD</span>
            </div>

            {isOrdersLoading ? (
              <div className="p-12 text-center text-zinc-500 text-sm">جاري تحميل الطلبات من Supabase...</div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 text-sm">لا توجد طلبات مسجلة بعد.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs sm:text-sm">
                  <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800 uppercase font-semibold">
                    <tr>
                      <th className="p-4">رقم الطلب</th>
                      <th className="p-4">الزبون والهاتف</th>
                      <th className="p-4">الولاية والبلدية</th>
                      <th className="p-4">الباقة والعطور</th>
                      <th className="p-4">المجموع</th>
                      <th className="p-4">الحالة</th>
                      <th className="p-4">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80">
                    {orders.map((ord, idx) => (
                      <tr key={`${ord.id || 'ord'}-${idx}`} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="p-4 font-mono font-bold text-amber-400">{ord.order_number || ord.id}</td>
                        <td className="p-4 font-bold text-white">
                          {ord.customer_name}
                          <span className="block text-xs font-normal text-zinc-400 dir-ltr text-right">{ord.phone}</span>
                        </td>
                        <td className="p-4 text-zinc-300">
                          {ord.wilaya_name} - {ord.commune_name}
                          <span className="block text-[11px] text-zinc-500">
                            {ord.delivery_type === 'home' || ord.delivery_type === 'المنزل' ? '🏠 للمنزل' : '🏢 للمكتب'}
                          </span>
                        </td>
                        <td className="p-4 text-zinc-300">
                          <span className="font-bold text-amber-200 block">{ord.package_name}</span>
                          <span className="text-[11px] text-zinc-400 block max-w-xs truncate">
                            {ord.perfumes_list || (Array.isArray(ord.selected_perfumes) ? ord.selected_perfumes.map((p: any) => p.name).join(', ') : '')}
                          </span>
                        </td>
                        <td className="p-4 font-black text-amber-400">
                          {Number(ord.total_price || 0).toLocaleString()} دج
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            {ord.status || 'جديد'}
                          </span>
                        </td>
                        <td className="p-4 text-zinc-500 text-xs dir-ltr text-right">
                          {ord.created_at ? new Date(ord.created_at).toLocaleString('ar-DZ') : 'الآن'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PERFUMES MANAGEMENT */}
      {activeTab === 'perfumes' && (
        <div className="space-y-8 max-w-7xl mx-auto">
          {/* Action Bar */}
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>قائمة العطور المربوطة بـ Supabase (public.perfumes)</span>
              </h3>
              <p className="text-zinc-400 text-xs mt-1">
                أي عطر تضيفه أو تقوم بتفعيله/إيقافه هنا سيظهر أو يختفي فوراً في متجر المستهلكين.
              </p>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-400/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>إضافة عطر جديد</span>
            </button>
          </div>

          {/* Perfumes Table List */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            {isPerfumesLoading ? (
              <div className="p-12 text-center text-zinc-500 text-sm">جاري تحميل العطور من Supabase...</div>
            ) : perfumes.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 text-sm flex flex-col items-center justify-center gap-3">
                <p>لا توجد عطور مسجلة في جدول public.perfumes حالياً.</p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs"
                >
                  إضافة أول عطر الآن
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs sm:text-sm">
                  <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800 uppercase font-semibold">
                    <tr>
                      <th className="p-4">الصورة</th>
                      <th className="p-4">اسم العطر</th>
                      <th className="p-4">التصنيف</th>
                      <th className="p-4">الوصف</th>
                      <th className="p-4">الحالة (Active)</th>
                      <th className="p-4 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80">
                    {perfumes.map((perfume, idx) => (
                      <tr key={`${perfume.id || 'p'}-${idx}`} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="p-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0">
                            <img
                              src={perfume.image_url || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800'}
                              alt={perfume.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>
                        <td className="p-4 font-bold text-white text-sm">
                          {perfume.name}
                          <span className="block text-[10px] text-zinc-500 font-mono mt-0.5">ID: {perfume.id}</span>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-md bg-zinc-950 border border-zinc-800 text-amber-300 text-xs font-semibold">
                            {perfume.category}
                          </span>
                        </td>
                        <td className="p-4 text-zinc-400 text-xs max-w-xs truncate">
                          {perfume.description || 'بدون وصف'}
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleActive(perfume.id, perfume.is_active)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                              perfume.is_active
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                                : 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
                            }`}
                          >
                            {perfume.is_active ? (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                <span>مفعل (يعرض للزبون)</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>معطل (مخفي)</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleDeletePerfume(perfume.id, perfume.name)}
                            className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors cursor-pointer"
                            title="حذف العطر"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD PERFUME MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative animate-fade-in">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 left-4 p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>إضافة عطر جديد إلى Supabase</span>
            </h3>
            <p className="text-zinc-400 text-xs mb-6">أدخل بيانات العطر ليتم حفظها مباشرة في جدول public.perfumes</p>

            <form onSubmit={handleAddPerfumeSubmit} className="space-y-4 text-right">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">اسم العطر *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عطر بلاك عود الملكي"
                  value={newPerfume.name}
                  onChange={(e) => setNewPerfume({ ...newPerfume, name: e.target.value })}
                  className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">التصنيف *</label>
                <select
                  value={newPerfume.category}
                  onChange={(e) => setNewPerfume({ ...newPerfume, category: e.target.value })}
                  className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                >
                  <option value="عطور نسائية">🌸 عطور نسائية</option>
                  <option value="عطور رجالية">🎩 عطور رجالية</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">رابط الصورة (image_url) *</label>
                <input
                  type="text"
                  placeholder="https://... أو استخدم رابط صوره من Unsplash/Supabase Storage"
                  value={newPerfume.image_url}
                  onChange={(e) => setNewPerfume({ ...newPerfume, image_url: e.target.value })}
                  className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-amber-400 focus:outline-none dir-ltr text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">الوصف (اختياري)</label>
                <textarea
                  rows={2}
                  placeholder="وصف مختصر لمكونات ونفحات العطر..."
                  value={newPerfume.description}
                  onChange={(e) => setNewPerfume({ ...newPerfume, description: e.target.value })}
                  className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-300">
                  <input
                    type="checkbox"
                    checked={newPerfume.is_active}
                    onChange={(e) => setNewPerfume({ ...newPerfume, is_active: e.target.checked })}
                    className="w-4 h-4 accent-amber-400 rounded"
                  />
                  <span>تفعيل العطر فوراً ليظهر بالمتجر</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingPerfume}
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs shadow-md transition-colors flex items-center gap-2"
                >
                  {isSubmittingPerfume ? 'جاري الحفظ...' : 'حفظ العطر'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
