import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Shield, CheckCircle, Wrench, Star } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function JeddahPage() {
  const districts = [
    "الصفا", "الحمراء", "الروضة", "النزهة", "المرجان",
    "الشاطئ", "البوادي", "السلامة", "الرحاب", "أبحر",
    "الفيصلية", "المحمدية", "الزهراء", "النعيم", "الأمير فواز",
    "الواحة", "طيبة", "الجامعة"
  ];

  return (
    <>
      <Helmet>
        <title>فني سيارات متنقل في جدة | صيانة وإصلاح عند بابك - مير</title>
        <meta name="description" content="فني سيارات متنقل في جدة. صيانة وإصلاح وتشخيص عند بابك. نغطي جميع أحياء جدة: الصفا، الحمراء، الروضة، أبحر وغيرها. اتصل 0543257872" />
        <meta name="keywords" content="فني سيارات جدة، صيانة سيارات متنقلة جدة، كهربائي سيارات جدة، بطارية سيارة جدة، سلف سيارة جدة، تشخيص سيارة جدة، ميكانيكي متنقل جدة" />
        <link rel="canonical" href="https://meirservic.co/jeddah" />
      </Helmet>

      <div className="min-h-screen bg-white">
        <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 md:py-28">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-400 px-4 py-2 rounded-full mb-6">
              <MapPin className="w-5 h-5" />
              <span className="font-semibold">جدة</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
              فني سيارات متنقل في <span className="text-yellow-400">جدة</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              خدمة صيانة وإصلاح سيارات متنقلة في جميع أحياء جدة. فني محترف يوصلك وين ما كنت بأدوات وقطع غيار أصلية.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/service-request">
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg px-8 py-6 rounded-xl">
                  <Wrench className="w-5 h-5 ml-2" />
                  اطلب فني في جدة
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

        {/* الخدمات في جدة */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">خدماتنا في جدة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/services/battery">
                <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <h3 className="font-bold text-lg mb-2">استبدال بطارية السيارة</h3>
                  <p className="text-gray-600">بطاريات أصلية مع ضمان. توصيل وتركيب في مكانك خلال 20 دقيقة.</p>
                </div>
              </Link>
              <Link href="/services/starter">
                <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <h3 className="font-bold text-lg mb-2">إصلاح السلف</h3>
                  <p className="text-gray-600">تشخيص وإصلاح أو استبدال سلف السيارة بقطع أصلية.</p>
                </div>
              </Link>
              <Link href="/services/alternator">
                <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <h3 className="font-bold text-lg mb-2">إصلاح الدينمو</h3>
                  <p className="text-gray-600">فحص وإصلاح المولد الكهربائي. تغيير فحمات ومنظم.</p>
                </div>
              </Link>
              <Link href="/services/diagnostics">
                <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <h3 className="font-bold text-lg mb-2">تشخيص كمبيوتر</h3>
                  <p className="text-gray-600">فحص ECU وقراءة أكواد الأعطال بأجهزة احترافية.</p>
                </div>
              </Link>
              <Link href="/services/emergency">
                <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <h3 className="font-bold text-lg mb-2">طوارئ 24 ساعة</h3>
                  <p className="text-gray-600">خدمة طوارئ على مدار الساعة في جميع أحياء جدة.</p>
                </div>
              </Link>
              <Link href="/price-calculator">
                <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <h3 className="font-bold text-lg mb-2">حاسبة الأسعار</h3>
                  <p className="text-gray-600">احسب تكلفة الخدمة مسبقاً. أسعار شفافة بدون مفاجآت.</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* أحياء جدة */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">أحياء جدة اللي نغطيها</h2>
            <p className="text-gray-600 mb-8">
              نوفر خدمة صيانة السيارات المتنقلة في جميع أحياء ومناطق جدة. أينما كنت، نوصلك!
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {districts.map((district) => (
                <div key={district} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{district}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6 text-center">
              وغيرها من الأحياء والمناطق المحيطة بجدة
            </p>
          </div>
        </section>

        {/* لماذا مير في جدة */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">لماذا مير أفضل خيار في جدة؟</h2>
            <div className="space-y-6 text-gray-700">
              <div className="flex items-start gap-4">
                <Star className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg">تغطية شاملة</h3>
                  <p>من أبحر شمال إلى الأمير فواز جنوب، نغطي كل جدة بفنيين موزعين استراتيجياً.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg">سرعة الوصول</h3>
                  <p>فنيينا موزعين في أنحاء جدة. نوصلك في أقل من 20 دقيقة في معظم الأحياء.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg">خبرة بسيارات جدة</h3>
                  <p>نتعامل مع مشاكل الرطوبة والحرارة اللي تأثر على السيارات في جدة بشكل خاص.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">تحتاج فني سيارات في جدة؟</h3>
              <p className="text-gray-600 mb-6">اطلب الخدمة الآن ونوصلك في أسرع وقت</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/service-request">
                  <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8 py-4 rounded-xl">
                    اطلب خدمة في جدة
                  </Button>
                </Link>
                <a href="https://wa.me/966543257872?text=أحتاج فني سيارات في جدة" target="_blank" rel="noopener noreferrer">
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
