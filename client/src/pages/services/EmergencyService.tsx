import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Phone, Clock, Shield, MapPin, CheckCircle, Wrench } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function EmergencyService() {
  return (
    <>
      <Helmet>
        <title>خدمة طوارئ سيارات متنقلة 24 ساعة في مكة وجدة - مير</title>
        <meta name="description" content="خدمة طوارئ سيارات على الطريق 24/7 في مكة وجدة. تعطلت سيارتك؟ فني يوصلك في أسرع وقت. بنشر، بطارية، سلف، تشخيص. اتصل الآن 0543257872" />
        <meta name="keywords" content="طوارئ سيارات مكة، طوارئ سيارات جدة، خدمة طريق متنقلة، سيارة تعطلت، بنشر متنقل، فني سيارات 24 ساعة، مساعدة على الطريق" />
        <link rel="canonical" href="https://meirservic.co/services/emergency" />
      </Helmet>

      <div className="min-h-screen bg-white">
        <section className="bg-gradient-to-br from-red-900 via-red-800 to-gray-900 text-white py-20 md:py-28">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-red-400/20 text-red-300 px-4 py-2 rounded-full mb-6">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">خدمة الطوارئ 24/7</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
              طوارئ سيارات <span className="text-yellow-400">24 ساعة</span> في مكة وجدة
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              تعطلت سيارتك على الطريق؟ لا تقلق! فريق مير متوفر على مدار الساعة. نوصلك في أسرع وقت ممكن أينما كنت.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:+966543257872">
                <Button className="bg-red-500 hover:bg-red-600 text-white font-bold text-lg px-8 py-6 rounded-xl animate-pulse hover:animate-none">
                  <Phone className="w-5 h-5 ml-2" />
                  اتصل الآن: 054 325 7872
                </Button>
              </a>
              <a href="https://wa.me/966543257872?text=طوارئ! سيارتي تعطلت" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-white text-white hover:bg-white/10 font-bold text-lg px-8 py-6 rounded-xl">
                  <Wrench className="w-5 h-5 ml-2" />
                  واتساب طوارئ
                </Button>
              </a>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">خدمات الطوارئ المتوفرة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <Clock className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">وصول سريع</h3>
                <p className="text-gray-600">نوصلك في أقل من 20 دقيقة في حالات الطوارئ</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">متوفرين 24/7</h3>
                <p className="text-gray-600">خدمة على مدار الساعة، 7 أيام في الأسبوع</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <Wrench className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">إصلاح فوري</h3>
                <p className="text-gray-600">نصلح معظم الأعطال في مكانك بدون سحب</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <MapPin className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">تغطية واسعة</h3>
                <p className="text-gray-600">نغطي جميع الطرق والأحياء في مكة وجدة</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">خدمة طوارئ سيارات على الطريق</h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
              <p>
                تعطل السيارة على الطريق من أكثر المواقف إزعاجاً وخطورة، خصوصاً في الأجواء الحارة أو في ساعات الليل المتأخرة. خدمة طوارئ مير المتنقلة توفر لك فني متخصص يوصلك بأسرع وقت ممكن لحل المشكلة في مكانك.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-8">الحالات اللي نتعامل معها</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>السيارة ما تشتغل (بطارية / سلف / دينمو)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>بنشر (تغيير كفر أو إصلاح)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>ارتفاع حرارة المحرك (تسريب ماء / ثيرموستات)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>توقف مفاجئ أثناء القيادة</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>مفتاح السيارة لا يعمل أو ضاع</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>مشاكل كهربائية مفاجئة</span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mt-8">ماذا تفعل عند تعطل سيارتك؟</h3>
              <p>
                1. أوقف السيارة في مكان آمن بعيداً عن حركة المرور. 2. شغّل أضواء الطوارئ (الإشارات الأربع). 3. ضع مثلث التحذير خلف السيارة. 4. اتصل بنا على 0543257872 أو أرسل موقعك عبر واتساب. 5. ابقَ في مكان آمن حتى وصول الفني.
              </p>
            </div>

            <div className="mt-12 bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">تحتاج مساعدة فورية؟</h3>
              <p className="text-gray-600 mb-6">اتصل الآن ونوصلك في أسرع وقت</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="tel:+966543257872">
                  <Button className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-4 rounded-xl">
                    <Phone className="w-5 h-5 ml-2" />
                    اتصل الآن
                  </Button>
                </a>
                <a href="https://wa.me/966543257872?text=طوارئ! سيارتي تعطلت وأحتاج مساعدة" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50 font-bold px-8 py-4 rounded-xl">
                    أرسل موقعك واتساب
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
