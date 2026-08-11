import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Battery, Phone, Clock, Shield, MapPin, CheckCircle, Wrench } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function BatteryService() {
  return (
    <>
      <Helmet>
        <title>خدمة بطارية سيارة متنقلة في مكة وجدة | استبدال وتوصيل فوري - مير</title>
        <meta name="description" content="خدمة استبدال وتوصيل بطارية السيارة متنقلة في مكة وجدة. فني متخصص يوصلك في 20 دقيقة. بطاريات أصلية مع ضمان. اتصل الآن 0543257872" />
        <meta name="keywords" content="بطارية سيارة توصيل، استبدال بطارية متنقل، بطارية سيارة مكة، بطارية سيارة جدة، تغيير بطارية عند البيت، بطارية سيارة طوارئ" />
        <link rel="canonical" href="https://meirservic.co/services/battery" />
        <meta property="og:title" content="خدمة بطارية سيارة متنقلة - مير" />
        <meta property="og:description" content="استبدال وتوصيل بطارية السيارة في مكة وجدة. وصول خلال 20 دقيقة مع ضمان." />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 md:py-28">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-400 px-4 py-2 rounded-full mb-6">
              <Battery className="w-5 h-5" />
              <span className="font-semibold">خدمة البطارية المتنقلة</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
              بطارية سيارة متنقلة في <span className="text-yellow-400">مكة وجدة</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              سيارتك ما تشتغل؟ لا تشيل هم! فني متخصص يوصلك ببطارية جديدة أصلية ويركبها عندك في أقل من 20 دقيقة.
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

        {/* المميزات */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">لماذا تختار خدمة بطارية مير؟</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">وصول سريع</h3>
                <p className="text-gray-600">نوصلك في أقل من 20 دقيقة أينما كنت في مكة أو جدة</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">ضمان سنة كاملة</h3>
                <p className="text-gray-600">جميع البطاريات أصلية مع ضمان المصنع لمدة سنة</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <Battery className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">جميع الماركات</h3>
                <p className="text-gray-600">نوفر بطاريات لجميع أنواع السيارات: تويوتا، هيونداي، فورد، شيفروليه وغيرها</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <MapPin className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">عند بابك</h3>
                <p className="text-gray-600">لا تحتاج تنقل سيارتك. نجيك وين ما كنت: بيت، عمل، أو طريق</p>
              </div>
            </div>
          </div>
        </section>

        {/* المحتوى التفصيلي - SEO Content */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">خدمة استبدال بطارية السيارة المتنقلة</h2>
            
            <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
              <p>
                هل تعطلت سيارتك فجأة ولم تستطع تشغيلها؟ في معظم الحالات يكون السبب هو ضعف أو تلف بطارية السيارة. مع خدمة مير المتنقلة لاستبدال البطاريات، لا تحتاج لسحب سيارتك أو الذهاب لورشة. فني متخصص يوصلك ببطارية جديدة أصلية ويركبها في مكانك خلال دقائق.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-8">متى تحتاج تغيير بطارية السيارة؟</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>السيارة لا تشتغل أو تشتغل ببطء (صوت السلف ضعيف)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>إضاءة لمبة البطارية في الطبلون</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>مرور أكثر من 3 سنوات على البطارية الحالية</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>انتفاخ أو تسريب حمض من البطارية</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>ضعف الأنوار والإلكترونيات عند تشغيل المكيف</span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mt-8">أسعار بطاريات السيارات</h3>
              <p>
                تختلف أسعار البطاريات حسب نوع السيارة وحجم البطارية المطلوبة. نوفر بطاريات من أفضل الماركات العالمية مثل AC Delco، Bosch، Varta، وExide بأسعار تنافسية تبدأ من 200 ريال شاملة التركيب والتوصيل.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-8">مناطق التغطية</h3>
              <p>
                نغطي جميع أحياء مكة المكرمة وجدة والمناطق المحيطة بها. سواء كنت في العزيزية، الشوقية، النسيم، أو أي حي في مكة، أو في حي الصفا، الحمراء، الروضة في جدة - نوصلك في أسرع وقت.
              </p>
            </div>

            {/* CTA */}
            <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">جاهز لاستبدال بطاريتك؟</h3>
              <p className="text-gray-600 mb-6">اطلب الخدمة الآن ونوصلك خلال 20 دقيقة</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/service-request">
                  <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8 py-4 rounded-xl">
                    اطلب خدمة البطارية
                  </Button>
                </Link>
                <a href="https://wa.me/966543257872?text=أحتاج بطارية سيارة" target="_blank" rel="noopener noreferrer">
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
