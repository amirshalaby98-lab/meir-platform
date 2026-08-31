export default function ServicesSection() {
  const services = [
    { icon: "🔋", title: "بطارية", description: "استبدال وصيانة البطاريات" },
    { icon: "⚡", title: "سلف", description: "خدمة بدء التشغيل الطارئ" },
    { icon: "🔌", title: "دينمو", description: "إصلاح واستبدال الدينمو" },
    { icon: "🧠", title: "تشخيص ECU", description: "فحص الأعطال الإلكترونية" },
    { icon: "⛽", title: "طرمبة بنزين", description: "صيانة نظام الوقود" },
    { icon: "🛠️", title: "أعطال الطريق", description: "إصلاح سريع وآمن" },
  ];

  return (
    <section id="services" className="py-20 bg-white">
      <div className="container">
        <h2 className="text-4xl font-bold text-center text-black mb-16">
          خدمات مير
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-8 text-center hover:shadow-lg transition-shadow duration-300 hover:border-yellow-300"
            >
              <div className="text-5xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-bold text-black mb-2">{service.title}</h3>
              <p className="text-gray-600 text-sm">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
