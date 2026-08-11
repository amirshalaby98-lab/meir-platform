import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plug, Phone, Clock, Shield, MapPin, CheckCircle, Wrench } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function AlternatorService() {
  return (
    <>
      <Helmet>
        <title>خدمة دينمو سيارة متنقل في مكة وجدة | إصلاح واستبدال - مير</title>
        <meta name="description" content="خدمة إصلاح واستبدال دينمو السيارة متنقلة في مكة وجدة. فني كهربائي متخصص يفحص ويصلح الدينمو عندك. ضمان على القطعة والعمل. اتصل 0543257872" />
        <meta name="keywords" content="دينمو سيارة، إصلاح دينمو مكة، استبدال دينمو جدة، شحن بطارية ضعيف، كهربائي سيارات، دينمو متنقل" />
        <link rel="canonical" href="https://meirservic.co/services/alternator" />
      </Helmet>

      <div className="min-h-screen bg-white">
        <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 md:py-28">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-400 px-4 py-2 rounded-full mb-6">
              <Plug className="w-5 h-5" />
              <span className="font-semibold">خدمة الدينمو المتنقلة</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
              إصلاح دينمو سيارة في <span className="text-yellow-400">مكة وجدة</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              البطارية تخلص بسرعة؟ لمبة البطارية مضيئة؟ غالباً المشكلة في الدينمو. فني متخصص يوصلك ويشخص ويصلح المشكلة عندك.
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
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">خدمات الدينمو المتنقلة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">فحص شامل</h3>
                <p className="text-gray-600">فحص خرج الدينمو بالفولتميتر وتحديد المشكلة بدقة</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <Wrench className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">إصلاح أو استبدال</h3>
                <p className="text-gray-600">إصلاح الفحمات والمنظم أو استبدال الدينمو بالكامل</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">ضمان مكتوب</h3>
                <p className="text-gray-600">ضمان على القطعة والعمل لراحة بالك</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <MapPin className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">خدمة 24/7</h3>
                <p className="text-gray-600">متوفرين على مدار الساعة في مكة وجدة</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">كل ما تحتاج معرفته عن دينمو السيارة</h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
              <p>
                الدينمو (المولد الكهربائي / Alternator) هو المسؤول عن شحن بطارية السيارة أثناء القيادة وتغذية جميع الأنظمة الكهربائية. عندما يتعطل الدينمو، تبدأ البطارية بالنفاد تدريجياً حتى تتوقف السيارة. مع خدمة مير المتنقلة، نشخص ونصلح مشاكل الدينمو في مكانك.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-8">علامات تلف الدينمو</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>إضاءة لمبة البطارية في الطبلون أثناء القيادة</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>البطارية تخلص بسرعة رغم أنها جديدة</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>ضعف الأنوار أو تذبذبها أثناء القيادة</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>صوت صرير من سير الدينمو</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>رائحة حريق أو سخونة من منطقة الدينمو</span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mt-8">كيف نصلح الدينمو؟</h3>
              <p>
                يبدأ الفني بفحص خرج الدينمو بالفولتميتر (يجب أن يكون بين 13.5 - 14.5 فولت). إذا كان الخرج ضعيفاً، يفحص الفحمات (Carbon Brushes) والمنظم (Voltage Regulator) والبيرنقات (Bearings). في كثير من الحالات يمكن إصلاح الدينمو بتغيير الفحمات فقط بتكلفة أقل من الاستبدال الكامل.
              </p>
            </div>

            <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">مشكلة في الدينمو؟</h3>
              <p className="text-gray-600 mb-6">فني كهربائي متخصص يشخص ويصلح المشكلة عندك</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/service-request">
                  <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8 py-4 rounded-xl">
                    اطلب فني دينمو
                  </Button>
                </Link>
                <a href="https://wa.me/966543257872?text=عندي مشكلة في الدينمو" target="_blank" rel="noopener noreferrer">
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
