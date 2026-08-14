import React from 'react';

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-1.5">
          كيف تطلب من متجرنا في 3 خطوات بسيطة؟
        </h2>
        <p className="text-gray-500 text-xs sm:text-sm">
          تسوق آمن ومباشر — ادفع فقط عند استلام طلبك
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1 */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 text-center shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 font-black text-lg flex items-center justify-center mx-auto mb-3">
            1
          </div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">اختر الباقة المناسبة</h3>
          <p className="text-gray-500 text-xs leading-relaxed">
            حدد باقة 2، 3 أو 4 عطور حسب احتياجك للاستفادة من أفضل سعر.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 text-center shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 font-black text-lg flex items-center justify-center mx-auto mb-3">
            2
          </div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">اختر عطورك المفضلة</h3>
          <p className="text-gray-500 text-xs leading-relaxed">
            تصفح تشكيلتنا من العطور الرجالية والنسائية الأكثر طلباً.
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 text-center shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 font-black text-lg flex items-center justify-center mx-auto mb-3">
            3
          </div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">استلم وادفع عند الباب</h3>
          <p className="text-gray-500 text-xs leading-relaxed">
            أدخل عنوانك وسيتصل بك موظف التوصيل لتأكيد التسليم.
          </p>
        </div>
      </div>
    </section>
  );
};

