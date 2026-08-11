import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { ArrowRight, Phone, AlertTriangle } from 'lucide-react';

export default function StarterAlternatorArticle() {
  return (
    <>
      <Helmet>
        <title>أعراض خراب السلف والدينمو - دليل شامل | مدونة مير</title>
        <meta name="description" content="تعرف على الفرق بين أعراض خراب السلف وخراب الدينمو. كيف تشخص المشكلة بنفسك؟ ومتى تحتاج فني متخصص؟ دليل شامل من خبراء مير." />
        <meta name="keywords" content="أعراض خراب السلف، أعراض خراب الدينمو، سلف سيارة، دينمو سيارة، الفرق بين السلف والدينمو، إصلاح سلف متنقل، إصلاح دينمو مكة جدة" />
        <link rel="canonical" href="https://meirservic.co/blog/starter-alternator-symptoms" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "أعراض خراب السلف والدينمو - دليل شامل",
          "description": "تعرف على الفرق بين أعراض خراب السلف وخراب الدينمو وكيف تشخص المشكلة",
          "author": {"@type": "Organization", "name": "مير"},
          "publisher": {"@type": "Organization", "name": "مير", "url": "https://meirservic.co"},
          "datePublished": "2024-12-10",
          "dateModified": "2024-12-10",
          "mainEntityOfPage": "https://meirservic.co/blog/starter-alternator-symptoms"
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-white" dir="rtl">
        {/* Breadcrumb */}
        <div className="bg-gray-50 py-3 border-b">
          <div className="container mx-auto px-4 max-w-4xl">
            <nav className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/"><a className="hover:text-yellow-600">الرئيسية</a></Link>
              <span>/</span>
              <Link href="/blog"><a className="hover:text-yellow-600">المدونة</a></Link>
              <span>/</span>
              <span className="text-gray-800">أعراض خراب السلف والدينمو</span>
            </nav>
          </div>
        </div>

        {/* Article */}
        <article className="py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <header className="mb-10">
              <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">سلف ودينمو</span>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-4">
                أعراض خراب السلف والدينمو - دليل شامل
              </h1>
              <p className="text-gray-500">10 ديسمبر 2024 • 7 دقائق قراءة</p>
            </header>

            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              <p>
                السيارة ما تشتغل؟ قبل ما تقرر إن المشكلة في البطارية، ممكن يكون السبب هو 
                <strong> السلف (Starter Motor)</strong> أو <strong>الدينمو (Alternator)</strong>. 
                في هذا الدليل الشامل، نشرح لك الفرق بين أعراض كل واحد وكيف تشخص المشكلة.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">ما هو السلف (Starter Motor)؟</h2>
              <p>
                السلف هو المحرك الكهربائي اللي يدور محرك السيارة عند التشغيل. لما تدير المفتاح أو تضغط زر Start، 
                السلف هو اللي يبدأ عملية التشغيل بدوران المحرك.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">أعراض خراب السلف:</h2>
              <div className="space-y-4 my-6">
                {[
                  { title: 'صوت طقطقة عند التشغيل', desc: 'تسمع صوت "تك تك تك" سريع بدون ما المحرك يدور. هذا يعني إن السلف يستقبل كهرباء لكن ما يقدر يدور.' },
                  { title: 'صوت طحن أو صرير', desc: 'صوت معدني غير طبيعي عند محاولة التشغيل يدل على تلف تروس السلف.' },
                  { title: 'السيارة ما تستجيب نهائياً', desc: 'تدير المفتاح ولا يصدر أي صوت - ممكن يكون السلف محترق تماماً أو التوصيلات مقطوعة.' },
                  { title: 'السيارة تشتغل أحياناً وأحياناً لا', desc: 'مشكلة متقطعة تدل على بداية تلف السلف أو مشكلة في الريلاي.' },
                  { title: 'رائحة احتراق', desc: 'رائحة حرق كهربائي عند محاولة التشغيل تعني إن السلف يسحب تيار زائد.' },
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-red-50 rounded-lg border-r-4 border-red-400">
                    <h4 className="font-bold text-gray-800">{i + 1}. {item.title}</h4>
                    <p className="text-gray-600 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">ما هو الدينمو (Alternator)؟</h2>
              <p>
                الدينمو هو المولد الكهربائي اللي يشحن البطارية ويغذي الأجهزة الكهربائية أثناء تشغيل المحرك. 
                بدون دينمو سليم، البطارية تنفد بسرعة والسيارة تطفي.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">أعراض خراب الدينمو:</h2>
              <div className="space-y-4 my-6">
                {[
                  { title: 'لمبة البطارية تنور أثناء القيادة', desc: 'أوضح علامة - لمبة البطارية في الطبلون تنور وأنت ماشي تعني إن الدينمو ما يشحن.' },
                  { title: 'الأنوار تخفت وتقوى', desc: 'إذا لاحظت إن الأنوار تتذبذب (تخفت وترجع) خصوصاً عند الريلنتي، الدينمو ضعيف.' },
                  { title: 'البطارية تخلص بسرعة', desc: 'إذا غيرت البطارية وخلصت بسرعة (يوم أو يومين)، المشكلة في الدينمو مو البطارية.' },
                  { title: 'صوت صفير من المحرك', desc: 'صوت صفير أو أنين من منطقة الدينمو يدل على تلف البيرنقات (bearings) الداخلية.' },
                  { title: 'السيارة تطفي أثناء القيادة', desc: 'في الحالات المتقدمة، السيارة ممكن تطفي فجأة لأن البطارية نفدت بالكامل.' },
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-orange-50 rounded-lg border-r-4 border-orange-400">
                    <h4 className="font-bold text-gray-800">{i + 1}. {item.title}</h4>
                    <p className="text-gray-600 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">كيف تفرق بين مشكلة السلف والدينمو؟</h2>
              
              <div className="overflow-x-auto my-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 text-right border">العرض</th>
                      <th className="p-3 text-center border">السلف</th>
                      <th className="p-3 text-center border">الدينمو</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="p-3 border">السيارة ما تشتغل</td><td className="p-3 border text-center">✅</td><td className="p-3 border text-center">❌ (تشتغل لكن تطفي)</td></tr>
                    <tr className="bg-gray-50"><td className="p-3 border">لمبة البطارية تنور أثناء القيادة</td><td className="p-3 border text-center">❌</td><td className="p-3 border text-center">✅</td></tr>
                    <tr><td className="p-3 border">صوت طقطقة عند التشغيل</td><td className="p-3 border text-center">✅</td><td className="p-3 border text-center">❌</td></tr>
                    <tr className="bg-gray-50"><td className="p-3 border">الأنوار تخفت أثناء القيادة</td><td className="p-3 border text-center">❌</td><td className="p-3 border text-center">✅</td></tr>
                    <tr><td className="p-3 border">البطارية تخلص بسرعة</td><td className="p-3 border text-center">❌</td><td className="p-3 border text-center">✅</td></tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">متى تحتاج فني متخصص؟</h2>
              <p>
                إذا ما قدرت تحدد المشكلة بنفسك، أو إذا كنت متأكد إن المشكلة في السلف أو الدينمو، 
                الأفضل تطلب <strong>فني متخصص</strong> يفحص السيارة بجهاز تشخيص. الفني يقدر يقيس 
                جهد الشحن ويحدد بالضبط وين المشكلة.
              </p>
            </div>

            {/* CTA */}
            <div className="mt-12 p-8 bg-yellow-50 rounded-2xl border border-yellow-200">
              <h3 className="text-xl font-bold text-gray-800 mb-3">تحتاج فحص سلف أو دينمو؟</h3>
              <p className="text-gray-600 mb-6">فني مير يوصلك بجهاز تشخيص متقدم - يفحص ويصلح في موقعك</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/">
                  <a className="px-6 py-3 bg-yellow-500 text-gray-900 rounded-lg font-bold hover:bg-yellow-400 transition-colors text-center">
                    احجز فحص الآن
                  </a>
                </Link>
                <a href="https://wa.me/966543257872?text=سيارتي فيها مشكلة في السلف أو الدينمو" target="_blank" rel="noopener noreferrer"
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors text-center flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  واتساب
                </a>
              </div>
            </div>

            <div className="mt-8">
              <Link href="/blog">
                <a className="flex items-center gap-2 text-yellow-600 hover:text-yellow-700 font-medium">
                  <ArrowRight className="w-4 h-4" />
                  العودة للمدونة
                </a>
              </Link>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
