import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Cpu, Phone, Clock, Shield, MapPin, CheckCircle, Wrench } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function DiagnosticsService() {
  return (
    <>
      <Helmet>
        <title>تشخيص أعطال سيارات متنقل في مكة وجدة | فحص كمبيوتر - مير</title>
        <meta name="description" content="خدمة تشخيص أعطال السيارات بالكمبيوتر متنقلة في مكة وجدة. فحص ECU، قراءة أكواد الأعطال، مسح اللمبات. فني متخصص يوصلك. اتصل 0543257872" />
        <meta name="keywords" content="تشخيص أعطال سيارات، فحص كمبيوتر سيارة، تشخيص ECU مكة، فحص سيارة جدة، قراءة أكواد أعطال، مسح لمبة المكينة، فحص سيارة قبل الشراء" />
        <link rel="canonical" href="https://meirservic.co/services/diagnostics" />
      </Helmet>

      <div className="min-h-screen bg-white">
        <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 md:py-28">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-400 px-4 py-2 rounded-full mb-6">
              <Cpu className="w-5 h-5" />
              <span className="font-semibold">تشخيص أعطال متنقل</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
              تشخيص كمبيوتر سيارة في <span className="text-yellow-400">مكة وجدة</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              لمبة المكينة مضيئة؟ السيارة ترجف؟ فني متخصص يوصلك بجهاز تشخيص متقدم يقرأ جميع أكواد الأعطال ويحدد المشكلة بدقة.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/service-request">
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg px-8 py-6 rounded-xl">
                  <Wrench className="w-5 h-5 ml-2" />
                  اطلب فحص الآن
                </Button>
              </Link>
              <a href="tel:+966543257872">
                <Button variant="outline" className="border-white text-white hover:bg-white/10 font-bold text-lg px-8 py-6 rounded-xl">
                  <Phone className="w-5 h-5 ml-2" />
                  اتصل: 054 325 7872
                </Button>
              </a>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">خدمات التشخيص المتنقلة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <Cpu className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">فحص ECU شامل</h3>
                <p className="text-gray-600">قراءة جميع أكواد الأعطال من كمبيوتر السيارة</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <CheckCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">فحص قبل الشراء</h3>
                <p className="text-gray-600">فحص شامل للسيارة المستعملة قبل اتخاذ قرار الشراء</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">تقرير مفصل</h3>
                <p className="text-gray-600">تقرير مكتوب بجميع الأعطال والتوصيات</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <MapPin className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">عندك في مكانك</h3>
                <p className="text-gray-600">لا تحتاج تروح ورشة - نجيك وين ما كنت</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">تشخيص أعطال السيارات بالكمبيوتر</h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
              <p>
                السيارات الحديثة تحتوي على عشرات الحساسات والأنظمة الإلكترونية المتصلة بكمبيوتر السيارة (ECU). عند حدوث أي خلل، يسجل الكمبيوتر كود عطل (DTC) ويضيء لمبة تحذيرية. خدمة تشخيص مير المتنقلة تقرأ هذه الأكواد بأجهزة احترافية وتترجمها لك بلغة مفهومة مع توصيات الإصلاح.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-8">ماذا يشمل فحص الكمبيوتر؟</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>قراءة أكواد الأعطال (DTC) من جميع أنظمة السيارة</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>فحص بيانات الحساسات الحية (Live Data)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>فحص نظام الوقود والحقن</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>فحص نظام الإشعال والملفات</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>فحص ناقل الحركة (القير)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>فحص نظام ABS والفرامل</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>فحص نظام الوسائد الهوائية (Airbag)</span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mt-8">فحص سيارة قبل الشراء</h3>
              <p>
                تفكر تشتري سيارة مستعملة؟ خدمة فحص ما قبل الشراء من مير تكشف لك جميع المشاكل المخفية: أعطال مسجلة سابقاً، حالة المحرك والقير، عداد الكيلومترات الحقيقي، وحالة جميع الأنظمة. لا تشتري سيارة بدون فحص!
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-8">رسوم الفحص</h3>
              <p>
                رسوم الكشف والتشخيص 200 ريال فقط شاملة الوصول والفحص والتقرير. إذا قررت الإصلاح معنا، تُخصم رسوم الكشف من قيمة الإصلاح.
              </p>
            </div>

            <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">احجز فحص كمبيوتر الآن</h3>
              <p className="text-gray-600 mb-6">رسوم الكشف 200 ريال فقط - تُخصم عند الإصلاح</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/service-request">
                  <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8 py-4 rounded-xl">
                    احجز فحص تشخيصي
                  </Button>
                </Link>
                <Link href="/obd-scanner">
                  <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50 font-bold px-8 py-4 rounded-xl">
                    تشخيص ذكي مجاني
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
