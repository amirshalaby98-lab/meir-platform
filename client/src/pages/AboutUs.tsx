import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "wouter";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">من نحن</h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              منصة مير - شريكك الموثوق في صيانة السيارات المتنقلة
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-6 text-gray-900">قصتنا</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    بدأت منصة مير من فكرة بسيطة: لماذا يجب أن تذهب بسيارتك المعطلة إلى الورشة بينما يمكن للورشة أن تأتي إليك؟
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    انطلقنا من مكة المكرمة وجدة بفريق من الفنيين المحترفين المعتمدين، ونسعى لتقديم خدمة صيانة سيارات متنقلة بأعلى معايير الجودة والشفافية.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    نؤمن بأن كل عميل يستحق خدمة سريعة، شفافة، وبأسعار عادلة. لذلك طورنا حاسبة أسعار مباشرة ونظام تتبع للحجوزات يضمن لك الراحة التامة.
                  </p>
                </div>
                <div className="bg-gray-100 rounded-2xl p-8">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">🎯</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">رؤيتنا</h3>
                        <p className="text-gray-600 text-sm">أن نكون المنصة الأولى لصيانة السيارات المتنقلة في المملكة العربية السعودية</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">💡</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">مهمتنا</h3>
                        <p className="text-gray-600 text-sm">تسهيل صيانة السيارات بتقديم خدمة متنقلة احترافية وشفافة تصل إليك أينما كنت</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">⭐</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">قيمنا</h3>
                        <p className="text-gray-600 text-sm">الشفافية، الجودة، السرعة، والأمانة في كل خدمة نقدمها</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">لماذا تختار مير؟</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { icon: "🚗", title: "خدمة متنقلة", desc: "نصل إليك أينما كنت في مكة وجدة" },
                { icon: "👨‍🔧", title: "فنيون معتمدون", desc: "فريق مدرب ومعتمد بخبرة عالية" },
                { icon: "💰", title: "أسعار شفافة", desc: "حاسبة أسعار مباشرة بدون مفاجآت" },
                { icon: "⏰", title: "24/7 طوارئ", desc: "خدمة طوارئ على مدار الساعة" },
                { icon: "🛡️", title: "ضمان الخدمة", desc: "ضمان على جميع الخدمات والقطع" },
                { icon: "📱", title: "تتبع مباشر", desc: "تتبع حالة طلبك لحظة بلحظة" },
                { icon: "🔧", title: "قطع أصلية", desc: "نستخدم قطع غيار أصلية ومضمونة" },
                { icon: "📋", title: "تقارير مفصلة", desc: "تقرير شامل بعد كل خدمة" },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">فريقنا</h2>
            <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
              فريق من المتخصصين في صيانة السيارات والتقنية، يعملون معاً لتقديم أفضل تجربة لك
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="w-24 h-24 bg-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl">👨‍💼</span>
                </div>
                <h3 className="font-bold text-gray-900">إدارة العمليات</h3>
                <p className="text-gray-500 text-sm mt-1">تنسيق وإدارة الطلبات</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl">👨‍🔧</span>
                </div>
                <h3 className="font-bold text-gray-900">الفنيون المعتمدون</h3>
                <p className="text-gray-500 text-sm mt-1">خبرة +5 سنوات في الصيانة</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl">💻</span>
                </div>
                <h3 className="font-bold text-gray-900">الفريق التقني</h3>
                <p className="text-gray-500 text-sm mt-1">تطوير المنصة والتشخيص الذكي</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-yellow-400">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">جاهز تجرب خدماتنا؟</h2>
            <p className="text-gray-800 mb-8 max-w-lg mx-auto">اطلب خدمة الآن واستمتع بصيانة احترافية تصل إليك أينما كنت</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/service-request">
                <button className="bg-black text-white font-bold px-8 py-4 rounded-lg hover:bg-gray-900 transition">
                  اطلب خدمة الآن
                </button>
              </Link>
              <Link href="/obd-scanner">
                <button className="bg-gray-900 text-white font-bold px-8 py-4 rounded-lg hover:bg-gray-800 transition border border-white">
                  تشخيص ذكي مجاني
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
