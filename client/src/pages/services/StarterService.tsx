import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Zap, Phone, Clock, Shield, MapPin, CheckCircle, Wrench } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function StarterService() {
  return (
    <>
      <Helmet>
        <title>خدمة سلف سيارة متنقل في مكة وجدة | إصلاح واستبدال - مير</title>
        <meta name="description" content="خدمة إصلاح واستبدال سلف السيارة متنقلة في مكة وجدة. فني كهربائي سيارات متخصص يوصلك. تشخيص دقيق وإصلاح سريع. اتصل 0543257872" />
        <meta name="keywords" content="سلف سيارة متنقل، إصلاح سلف مكة، استبدال سلف جدة، كهربائي سيارات متنقل، سيارة ما تشتغل، صوت طقطقة سلف" />
        <link rel="canonical" href="https://meirservic.co/services/starter" />
      </Helmet>

      <div className="min-h-screen bg-white">
        <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 md:py-28">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-400 px-4 py-2 rounded-full mb-6">
              <Zap className="w-5 h-5" />
              <span className="font-semibold">خدمة السلف المتنقلة</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
              سلف سيارة متنقل في <span className="text-yellow-400">مكة وجدة</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              سيارتك تطقطق ولا تشتغل؟ فني كهربائي سيارات متخصص يوصلك ويشخص المشكلة ويصلح السلف أو يستبدله عندك.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/service-request">
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg px-8 py-6 rounded-xl">
                  <Wrench className="w-5 h-5 ml-2" />
                  اطلب الخدمة الآن
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
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">خدمات السلف المتنقلة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">تشخيص فوري</h3>
                <p className="text-gray-600">نفحص السلف بجهاز تشخيص متقدم لتحديد المشكلة بدقة</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <Wrench className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">إصلاح أو استبدال</h3>
                <p className="text-gray-600">نصلح السلف إذا أمكن أو نستبدله بقطعة أصلية جديدة</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">ضمان على القطعة</h3>
                <p className="text-gray-600">ضمان على قطع الغيار المستبدلة وعلى العمل المنجز</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <MapPin className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">نجيك وين ما كنت</h3>
                <p className="text-gray-600">خدمة متنقلة في جميع أحياء مكة وجدة 24/7</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">كل ما تحتاج معرفته عن سلف السيارة</h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
              <p>
                سلف السيارة (Starter Motor) هو المحرك الكهربائي المسؤول عن تدوير محرك السيارة عند التشغيل. عندما يتعطل السلف، لن تتمكن من تشغيل سيارتك حتى لو كانت البطارية جديدة. مع خدمة مير المتنقلة، نوفر لك فني كهربائي سيارات متخصص يشخص المشكلة ويحلها في مكانك.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-8">أعراض تلف سلف السيارة</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>صوت طقطقة عند محاولة التشغيل بدون دوران المحرك</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>صوت صرير أو احتكاك معدني عند التشغيل</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>السيارة تشتغل أحياناً ولا تشتغل أحياناً أخرى</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>خروج دخان أو رائحة حريق من منطقة السلف</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>الأنوار تشتغل لكن المحرك لا يدور</span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mt-8">الفرق بين مشكلة السلف والبطارية</h3>
              <p>
                كثير من الناس يخلطون بين مشكلة السلف ومشكلة البطارية. إذا كانت الأنوار والإلكترونيات تعمل بشكل طبيعي لكن المحرك لا يدور، فالمشكلة غالباً في السلف. أما إذا كان كل شيء ضعيف (أنوار خافتة، شاشة لا تعمل)، فالمشكلة في البطارية. فني مير يشخص المشكلة بدقة بجهاز فحص متقدم.
              </p>
            </div>

            <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">سيارتك ما تشتغل؟</h3>
              <p className="text-gray-600 mb-6">لا تشيل هم - فني متخصص يوصلك ويحل المشكلة</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/service-request">
                  <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8 py-4 rounded-xl">
                    اطلب فني سلف الآن
                  </Button>
                </Link>
                <a href="https://wa.me/966543257872?text=سيارتي ما تشتغل، أحتاج فني سلف" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50 font-bold px-8 py-4 rounded-xl">
                    واتساب مباشر
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
