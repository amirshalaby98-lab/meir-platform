import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { ArrowRight, Phone, CheckCircle } from 'lucide-react';

export default function BatterySignsArticle() {
  return (
    <>
      <Helmet>
        <title>كيف تعرف إن بطارية سيارتك خربانة؟ 7 علامات واضحة | مدونة مير</title>
        <meta name="description" content="تعرف على أهم 7 علامات تدل على ضعف أو تلف بطارية السيارة. متى يجب تغيير البطارية؟ وكيف تحافظ عليها؟ نصائح من فنيين محترفين في مير." />
        <meta name="keywords" content="بطارية سيارة خربانة، علامات ضعف بطارية السيارة، متى أغير بطارية السيارة، بطارية سيارة مكة، بطارية سيارة جدة، تغيير بطارية متنقل" />
        <link rel="canonical" href="https://meirservic.co/blog/car-battery-signs" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "كيف تعرف إن بطارية سيارتك خربانة؟ 7 علامات واضحة",
          "description": "تعرف على أهم العلامات التي تدل على ضعف أو تلف بطارية السيارة",
          "author": {"@type": "Organization", "name": "مير"},
          "publisher": {"@type": "Organization", "name": "مير", "url": "https://meirservic.co"},
          "datePublished": "2024-12-15",
          "dateModified": "2024-12-15",
          "mainEntityOfPage": "https://meirservic.co/blog/car-battery-signs"
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
              <span className="text-gray-800">بطارية سيارة خربانة</span>
            </nav>
          </div>
        </div>

        {/* Article */}
        <article className="py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <header className="mb-10">
              <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">بطاريات</span>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-4">
                كيف تعرف إن بطارية سيارتك خربانة؟ 7 علامات واضحة
              </h1>
              <p className="text-gray-500">15 ديسمبر 2024 • 5 دقائق قراءة</p>
            </header>

            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              <p>
                بطارية السيارة من أهم القطع اللي لو خربت فجأة، ممكن تعطلك في أسوأ وقت. 
                الخبر الحلو إن البطارية عادةً تعطيك <strong>إشارات تحذيرية</strong> قبل ما تخلص تماماً. 
                في هذا المقال، نشرح لك أهم 7 علامات تدل على ضعف أو تلف بطارية السيارة.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">1. السيارة تتأخر في التشغيل (Slow Cranking)</h2>
              <p>
                إذا لاحظت إن السيارة تاخذ وقت أطول من المعتاد عشان تشتغل، أو تسمع صوت "كرنك" بطيء، 
                هذي من أول العلامات إن البطارية بدأت تضعف. البطارية السليمة تشغل السيارة فوراً بدون تأخير.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">2. إضاءة لمبة البطارية في الطبلون</h2>
              <p>
                لمبة البطارية في لوحة القيادة (dashboard) تنور لما يكون فيه مشكلة في نظام الشحن. 
                ممكن تكون المشكلة في البطارية نفسها أو في الدينمو. في كلا الحالتين، لازم تفحص فوراً.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">3. ضعف الإضاءة الداخلية والخارجية</h2>
              <p>
                إذا لاحظت إن أنوار السيارة (الأمامية أو الداخلية) صارت خافتة أكثر من المعتاد، 
                خصوصاً عند تشغيل السيارة، هذا دليل على ضعف البطارية وعدم قدرتها على توفير الطاقة الكافية.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">4. انتفاخ أو تسريب من البطارية</h2>
              <p>
                إذا شفت انتفاخ في جسم البطارية أو تسريب سائل حمضي، هذا يعني إن البطارية تالفة 
                ولازم تتغير <strong>فوراً</strong>. التسريب الحمضي خطير وممكن يتلف أجزاء ثانية في السيارة.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">5. عمر البطارية أكثر من 3 سنوات</h2>
              <p>
                متوسط عمر بطارية السيارة في السعودية <strong>2-3 سنوات</strong> بسبب الحرارة العالية. 
                إذا بطاريتك عمرها أكثر من 3 سنوات، حتى لو ما ظهرت عليها مشاكل واضحة، 
                الأفضل تفحصها أو تغيرها احتياطياً.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">6. رائحة بيض فاسد من البطارية</h2>
              <p>
                إذا شميت رائحة كبريت (مثل البيض الفاسد) من منطقة البطارية، هذا يعني إن البطارية 
                تسرب غاز كبريتيد الهيدروجين. هذا خطير ويحتاج تغيير فوري.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">7. الأجهزة الإلكترونية تشتغل بشكل غريب</h2>
              <p>
                إذا لاحظت إن الشاشة، الراديو، أو النوافذ الكهربائية تشتغل ببطء أو بشكل متقطع، 
                ممكن يكون السبب ضعف البطارية وعدم قدرتها على تغذية الأجهزة بشكل كافي.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">نصائح للحفاظ على بطارية السيارة</h2>
              <div className="space-y-3 my-6">
                {[
                  'تأكد من نظافة أقطاب البطارية من الأكسدة',
                  'لا تترك السيارة بدون تشغيل لفترات طويلة',
                  'تجنب استخدام الأجهزة الكهربائية والسيارة مطفية',
                  'افحص البطارية كل 6 أشهر خصوصاً في الصيف',
                  'استخدم بطارية مناسبة لحجم سيارتك',
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">تحتاج تغيير بطارية؟</h2>
              <p>
                إذا لاحظت أي من العلامات المذكورة، لا تنتظر لين تتعطل! 
                <strong> مير</strong> توفر لك خدمة توصيل وتركيب بطارية سيارة جديدة عند بابك 
                في مكة وجدة. الفني يوصلك خلال 24 دقيقة مع بطارية أصلية وضمان.
              </p>
            </div>

            {/* CTA */}
            <div className="mt-12 p-8 bg-yellow-50 rounded-2xl border border-yellow-200">
              <h3 className="text-xl font-bold text-gray-800 mb-3">اطلب خدمة تغيير بطارية الآن</h3>
              <p className="text-gray-600 mb-6">فني متخصص يوصلك مع بطارية جديدة أصلية - رسوم الكشف 200 ريال فقط</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/">
                  <a className="px-6 py-3 bg-yellow-500 text-gray-900 rounded-lg font-bold hover:bg-yellow-400 transition-colors text-center">
                    احجز الآن
                  </a>
                </Link>
                <a href="https://wa.me/966543257872?text=أبي أغير بطارية سيارتي" target="_blank" rel="noopener noreferrer"
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors text-center flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  واتساب
                </a>
              </div>
            </div>

            {/* Back to blog */}
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
