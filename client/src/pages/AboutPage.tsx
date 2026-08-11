import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { Wrench, MapPin, Clock, Users, Shield, Phone, Star, CheckCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>من نحن - مير | منصة صيانة سيارات متنقلة في مكة وجدة</title>
        <meta name="description" content="مير هي منصة سعودية لخدمات صيانة السيارات المتنقلة. نوفر فنيين محترفين لتشخيص وإصلاح السيارات عند بابك في مكة المكرمة وجدة. تعرف على قصتنا وفريقنا." />
        <meta name="keywords" content="من نحن مير، شركة مير، صيانة سيارات متنقلة، فني سيارات مكة، ميكانيكي متنقل جدة، عن مير" />
        <link rel="canonical" href="https://meirservic.co/about" />
      </Helmet>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        {/* Hero Section */}
        <section className="bg-gradient-to-bl from-gray-900 via-gray-800 to-gray-900 text-white py-20">
          <div className="container mx-auto px-4 max-w-5xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
              من نحن - <span className="text-yellow-400">مير</span>
            </h1>
            <p className="text-xl text-gray-300 text-center max-w-3xl mx-auto leading-relaxed">
              منصة سعودية متخصصة في خدمات صيانة السيارات المتنقلة. نوصلك الفني وين ما كنت في مكة المكرمة وجدة.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">قصتنا</h2>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
              <p>
                بدأت <strong>مير</strong> من فكرة بسيطة: ليش لازم تسحب سيارتك للورشة وتنتظر أيام عشان تصلح عطل بسيط؟ 
                في عام 2023، أطلقنا منصة مير لتقديم خدمات صيانة السيارات المتنقلة في مكة المكرمة وجدة، 
                بهدف توفير الوقت والجهد على أصحاب السيارات.
              </p>
              <p>
                نؤمن بأن صيانة السيارة لازم تكون سهلة ومريحة. عشان كذا، صممنا خدمتنا بحيث 
                الفني يوصلك وين ما كنت - عند بيتك، مكان عملك، أو حتى على جنب الطريق في حالات الطوارئ.
                فريقنا من الفنيين المحترفين مجهز بأحدث أجهزة التشخيص الإلكتروني وقطع الغيار الأصلية.
              </p>
              <p>
                اليوم، <strong>مير</strong> تخدم مئات العملاء شهرياً في مكة وجدة، بمتوسط وقت وصول 24 دقيقة فقط.
                نفتخر بتقييم عملائنا الممتاز وثقتهم المستمرة فينا.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-yellow-50">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-yellow-600">+799</div>
                <div className="text-gray-600 mt-1">عميل خدمناهم</div>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-yellow-600">24 دقيقة</div>
                <div className="text-gray-600 mt-1">متوسط وقت الوصول</div>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-yellow-600">3.9</div>
                <div className="text-gray-600 mt-1">تقييم العملاء</div>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-yellow-600">24/7</div>
                <div className="text-gray-600 mt-1">خدمة على مدار الساعة</div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Overview */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-10 text-center text-gray-800">خدماتنا</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Wrench, title: 'تشخيص إلكتروني', desc: 'فحص كمبيوتر السيارة بأحدث الأجهزة لتحديد الأعطال بدقة' },
                { icon: Shield, title: 'بطاريات سيارات', desc: 'توصيل وتركيب بطارية جديدة عند بابك مع ضمان' },
                { icon: Wrench, title: 'سلف ودينمو', desc: 'إصلاح واستبدال السلف والدينمو في موقعك' },
                { icon: Clock, title: 'خدمة طوارئ 24/7', desc: 'فني متاح على مدار الساعة لحالات الطوارئ' },
                { icon: MapPin, title: 'خدمة متنقلة', desc: 'نوصلك وين ما كنت في مكة وجدة' },
                { icon: Star, title: 'فحص قبل الشراء', desc: 'فحص شامل للسيارات المستعملة قبل الشراء' },
              ].map((service, i) => (
                <div key={i} className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
                  <service.icon className="w-10 h-10 text-yellow-500 mb-4" />
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{service.title}</h3>
                  <p className="text-gray-600">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Coverage Areas */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-10 text-center text-gray-800">مناطق التغطية</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-sm">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="text-yellow-500" />
                  مكة المكرمة
                </h3>
                <p className="text-gray-600 mb-4">نغطي جميع أحياء مكة المكرمة بما فيها:</p>
                <div className="flex flex-wrap gap-2">
                  {['العزيزية', 'الشوقية', 'العوالي', 'النسيم', 'الرصيفة', 'العمرة', 'الحمراء', 'الصفا', 'الروضة', 'المرسلات', 'الكعكية', 'الزاهر'].map(area => (
                    <span key={area} className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm">{area}</span>
                  ))}
                </div>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="text-yellow-500" />
                  جدة
                </h3>
                <p className="text-gray-600 mb-4">نغطي جميع أحياء جدة بما فيها:</p>
                <div className="flex flex-wrap gap-2">
                  {['السلامة', 'الحمراء', 'الروضة', 'المروة', 'الصفا', 'النسيم', 'البوادي', 'الفيصلية', 'المحمدية', 'أبحر', 'الشاطئ', 'الأندلس'].map(area => (
                    <span key={area} className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm">{area}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-10 text-center text-gray-800">لماذا تختار مير؟</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                'فنيون محترفون ومعتمدون بخبرة سنوات',
                'أجهزة تشخيص إلكترونية متقدمة (OBD2)',
                'وصول سريع - متوسط 24 دقيقة',
                'أسعار شفافة ومعروفة مسبقاً',
                'خدمة 24/7 بما فيها أيام العطل',
                'قطع غيار أصلية مع ضمان',
                'تغطية شاملة لمكة وجدة',
                'حجز سهل عبر الموقع أو واتساب',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-yellow-400 to-yellow-500">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">جاهز تحجز فني؟</h2>
            <p className="text-gray-800 text-lg mb-8">احجز الآن واحصل على خدمة صيانة سيارات متنقلة احترافية</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <a className="px-8 py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors">
                  احجز خدمة الآن
                </a>
              </Link>
              <a href="https://wa.me/966543257872" target="_blank" rel="noopener noreferrer"
                className="px-8 py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                <Phone className="w-5 h-5" />
                تواصل واتساب
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
