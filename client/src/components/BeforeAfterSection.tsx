export default function BeforeAfterSection() {
  const cases = [
    {
      title: "استبدال بطارية - كامري 2019",
      before: "بطارية ضعيفة لا تشغل المحرك",
      after: "بطارية جديدة مع ضمان سنتين",
      duration: "25 دقيقة",
      icon: "🔋",
    },
    {
      title: "إصلاح دينمو - سوناتا 2020",
      before: "شحن ضعيف وإضاءة لمبة البطارية",
      after: "دينمو جديد يعمل بكفاءة 100%",
      duration: "45 دقيقة",
      icon: "🔌",
    },
    {
      title: "تشخيص ECU - أكورد 2018",
      before: "لمبة Check Engine مضيئة + تقطيع",
      after: "تم حل مشكلة حساس الأكسجين",
      duration: "30 دقيقة",
      icon: "🧠",
    },
    {
      title: "سلف - باثفايندر 2017",
      before: "صوت طقطقة عند التشغيل",
      after: "سلف جديد أصلي مع ضمان",
      duration: "35 دقيقة",
      icon: "⚡",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">من أعمالنا</h2>
          <p className="text-gray-600">نماذج حقيقية من خدماتنا المنجزة</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {cases.map((item, i) => (
            <div key={i} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-gray-900 text-white p-4 text-center">
                <span className="text-2xl">{item.icon}</span>
                <h3 className="font-bold text-sm mt-2">{item.title}</h3>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                    <span className="text-xs font-semibold text-red-600">قبل</span>
                  </div>
                  <p className="text-sm text-gray-600 pr-4">{item.before}</p>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span className="text-xs font-semibold text-green-600">بعد</span>
                  </div>
                  <p className="text-sm text-gray-600 pr-4">{item.after}</p>
                </div>
                <div className="border-t border-gray-200 pt-3 text-center">
                  <span className="text-xs text-gray-500">مدة الخدمة: <strong>{item.duration}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
