import React from 'react';
import { PackageCheck, Sparkles, Truck, CheckCircle } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-zinc-800/80">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-4xl font-black text-white mb-3">
          كيف تطلب من متجرنا في 3 خطوات بسيطة؟
        </h2>
        <p className="text-zinc-400 text-sm max-w-xl mx-auto">
          تسوق آمن ومباشر بدون تعقيدات أو حاجة لبطاقة ائتمان
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {/* Step 1 */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 text-center relative">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 font-black text-xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
            1
          </div>
          <h3 className="text-lg font-bold text-white mb-2">اختر الباقة المناسبة</h3>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
            حدد باقة 2، 3 أو 4 عطور حسب احتياجك للحصول على أنسب سعر.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 text-center relative">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 font-black text-xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
            2
          </div>
          <h3 className="text-lg font-bold text-white mb-2">اختر تشكيلة عطورك</h3>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
            تصفح مجموعاتنا النسائية والرجالية الفاخرة وحدد عطورك المفضلة.
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 text-center relative">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 font-black text-xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
            3
          </div>
          <h3 className="text-lg font-bold text-white mb-2">استلم وادفع عند الباب</h3>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
            أدخل عنوانك ورقماً صالحاً، وسنوصل طلبك مع الدفع عند الاستلام.
          </p>
        </div>
      </div>
    </section>
  );
};
