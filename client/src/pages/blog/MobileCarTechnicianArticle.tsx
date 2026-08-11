import { Helmet } from 'react-helmet-async';
import { Link } from "wouter";
import Header from "@/components/Header";
import { CheckCircle, Phone, ArrowRight, Clock, MapPin, Wrench, AlertTriangle, Star } from "lucide-react";

export default function MobileCarTechnicianArticle() {
  return (
    <>
      <Helmet>
        <title>متى تحتاج فني سيارات متنقل؟ 8 حالات تستدعي الاتصال فوراً | مير</title>
        <meta name="description" content="تعرف على أهم الحالات التي تحتاج فيها فني سيارات متنقل يأتي إليك في مكة وجدة. خدمة طوارئ سيارات 24 ساعة مع ضمان." />
        <meta name="keywords" content="فني سيارات متنقل، فني سيارات يجي البيت، ميكانيكي متنقل مكة، فني سيارات جدة، طوارئ سيارات، بطارية سيارة خربانة، سيارة ما تشتغل" />
        <link rel="canonical" href="https://meirservic.co/blog/mobile-car-technician" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "متى تحتاج فني سيارات متنقل؟ 8 حالات تستدعي الاتصال فوراً",
          "description": "تعرف على أهم الحالات التي تحتاج فيها فني سيارات متنقل يأتي إليك في مكة وجدة",
          "author": { "@type": "Organization", "name": "مير" },
          "publisher": { "@type": "Organization", "name": "مير", "url": "https://meirservic.co" },
          "datePublished": "2025-01-10",
          "dateModified": "2025-01-10",
          "mainEntityOfPage": "https://meirservic.co/blog/mobile-car-technician"
        })}</script>
      </Helmet>

      <Header />

      <div className="min-h-screen bg-white" dir="rtl">
        {/* Breadcrumb */}
        <div className="bg-gray-50 py-3 border-b">
          <div className="container mx-auto px-4 max-w-4xl">
            <nav className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/"><a className="hover:text-yellow-600">الرئيسية</a></Link>
              <span>/</span>
              <Link href="/blog"><a className="hover:text-yellow-600">المدونة</a></Link>
              <span>/</span>
              <span className="text-gray-800">فني سيارات متنقل</span>
            </nav>
          </div>
        </div>

        {/* Article */}
        <article className="py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Header */}
            <header className="mb-10">
              <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">نصائح السيارات</span>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-4">
                متى تحتاج فني سيارات متنقل؟ 8 حالات تستدعي الاتصال فوراً
              </h1>
              <p className="text-gray-500">10 يناير 2025 • 6 دقائق قراءة</p>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8 p-5 bg-yellow-50 rounded-2xl border border-yellow-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">24 دقيقة</div>
                  <div className="text-xs text-gray-500 mt-1">متوسط وقت الوصول</div>
                </div>
                <div className="text-center border-x border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-600">200 ر.س</div>
                  <div className="text-xs text-gray-500 mt-1">رسوم الكشف فقط</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">24/7</div>
                  <div className="text-xs text-gray-500 mt-1">خدمة طوارئ</div>
                </div>
              </div>
            </header>

            {/* Article Body */}
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              <p>
                كثير منا مر بموقف محرج — السيارة ما تشتغل في الصباح، أو تتعطل في وسط الطريق، 
                وما تعرف وش تسوي. الحل الأسرع والأذكى في هذه الحالات هو <strong>فني سيارات متنقل</strong> 
                يجيك في مكانك بدل ما تدفع سطحة وتضيع وقتك في الورشة.
              </p>
              <p>
                في هذا المقال، نشرح لك <strong>8 حالات محددة</strong> تحتاج فيها فني متنقل، 
                وكيف تعرف الفرق بين المشكلة اللي تحل في موقعك والمشكلة اللي تحتاج ورشة.
              </p>

              {/* Case 1 */}
              <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                السيارة ما تشتغل (Dead Battery أو Starter)
              </h2>
              <p>
                أكثر حالة طوارئ شائعة. إذا ضغطت على السويتش وما سمعت أي صوت، أو سمعت صوت "كلك كلك" 
                متكرر — هذي علامة واضحة على <strong>بطارية فارغة أو سلف تالف</strong>.
              </p>
              <p>
                الفني المتنقل يقدر يفحص البطارية والسلف في موقعك ويغير اللي يحتاج تغيير خلال 30 دقيقة. 
                ما تحتاج سطحة ولا ورشة في هذه الحالة.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 my-4">
                <div className="flex items-center gap-2 text-green-700 font-bold mb-2">
                  <CheckCircle className="w-5 h-5" />
                  تُحل في الموقع ✓
                </div>
                <p className="text-green-700 text-sm">تغيير البطارية أو تشحين بطارية ضعيفة — الفني يحمل بطاريات أصلية معه.</p>
              </div>

              {/* Case 2 */}
              <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                إضاءة لمبة المحرك (Check Engine)
              </h2>
              <p>
                لمبة Check Engine تنور لأسباب كثيرة — بعضها بسيط وبعضها خطير. 
                الفني المتنقل يحمل معه <strong>جهاز OBD2 للفحص الإلكتروني</strong> يقرأ كود العطل فوراً 
                ويخبرك بالمشكلة بالضبط بدون تخمين.
              </p>
              <p>
                إذا كانت المشكلة بسيطة (مثل غطاء خزان الوقود مش مسكّر، أو حساس O2 تالف) 
                تُحل في موقعك. إذا كانت أعمق، الفني يشرح لك وش تحتاج وتقدر تقرر.
              </p>

              {/* Case 3 */}
              <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                ارتفاع حرارة المحرك (Overheating)
              </h2>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 my-4">
                <div className="flex items-center gap-2 text-red-700 font-bold mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  تحذير: أوقف السيارة فوراً
                </div>
                <p className="text-red-700 text-sm">
                  إذا شفت مؤشر الحرارة وصل للأحمر أو طلع بخار من تحت الكبوت — أوقف السيارة فوراً 
                  وأطفئ المحرك. الاستمرار بالقيادة قد يتلف المحرك بالكامل.
                </p>
              </div>
              <p>
                أسباب ارتفاع الحرارة الشائعة: تسريب في نظام التبريد، مياه تبريد ناقصة، 
                ثرموستات تالف، أو مروحة تبريد لا تشتغل. الفني المتنقل يفحص النظام ويحدد المشكلة 
                ويصلح ما يمكن إصلاحه في الموقع.
              </p>

              {/* Case 4 */}
              <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                تسريب زيت أو سوائل تحت السيارة
              </h2>
              <p>
                إذا لاحظت بقعة زيت أو سائل تحت سيارتك في موقف البيت أو العمل، 
                لا تتجاهلها. الفني المتنقل يقدر يحدد مصدر التسريب (زيت المحرك، ماء التبريد، 
                زيت القير، أو سائل الفرامل) ويصلحه قبل ما يتفاقم.
              </p>

              {/* Case 5 */}
              <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">5</span>
                أصوات غريبة من المحرك أو العجلات
              </h2>
              <p>
                أصوات مثل: طرق في المحرك عند التشغيل، صرير من الفرامل، أو طنين من العجلات — 
                كلها تحتاج فحص فوري. الفني المتنقل يشخّص الصوت ويخبرك هل المشكلة عاجلة أو تحتمل.
              </p>
              <div className="grid grid-cols-2 gap-3 my-6">
                {[
                  { sound: "طرق في المحرك", cause: "ربما تالف في المحرك — خطير", urgent: true },
                  { sound: "صرير الفرامل", cause: "تآكل الفرامل — يحتاج تغيير", urgent: true },
                  { sound: "طنين عند الدوران", cause: "بيرينج عجلة — يحتاج فحص", urgent: false },
                  { sound: "صوت عند التشغيل فقط", cause: "ربما سلف أو بكرة", urgent: false },
                ].map((item, i) => (
                  <div key={i} className={`p-3 rounded-xl border ${item.urgent ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"}`}>
                    <div className="font-bold text-sm text-gray-800">{item.sound}</div>
                    <div className="text-xs text-gray-600 mt-1">{item.cause}</div>
                    {item.urgent && <div className="text-xs text-red-600 font-bold mt-1">⚠️ عاجل</div>}
                  </div>
                ))}
              </div>

              {/* Case 6 */}
              <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">6</span>
                مشاكل الكهرباء والإلكترونيات
              </h2>
              <p>
                أنوار تومض، شاشة تتعطل، نوافذ كهربائية لا تشتغل، أو مفتاح السيارة لا يستجيب — 
                هذه كلها مشاكل كهربائية يقدر الفني المتنقل المتخصص يصلحها في موقعك 
                بدون الحاجة لورشة.
              </p>

              {/* Case 7 */}
              <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">7</span>
                الصيانة الدورية في موقعك
              </h2>
              <p>
                ما تحتاج تروح الورشة لتغيير الزيت، فلتر الهواء، البوجيات، أو فلتر الوقود. 
                الفني المتنقل يجيك في البيت أو العمل ويسوي الصيانة الدورية بنفس جودة الورشة 
                وبدون ما تضيع وقتك في الانتظار.
              </p>
              <div className="space-y-2 my-6">
                {[
                  "تغيير زيت المحرك والفلتر",
                  "تغيير فلتر الهواء وفلتر الكابين",
                  "تغيير البوجيات وكويلات الإشعال",
                  "فحص وتغيير سائل الفرامل",
                  "فحص وشحن مكيف السيارة",
                  "تغيير أحزمة المحرك (سير)",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Case 8 */}
              <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">8</span>
                فحص السيارة قبل الشراء أو السفر
              </h2>
              <p>
                قبل ما تشتري سيارة مستعملة أو تسافر رحلة طويلة، الفني المتنقل يجيك ويسوي 
                <strong> فحص شامل بجهاز OBD2</strong> يكشف الأعطال المخفية، ويفحص الفرامل والإطارات 
                والمحرك ويعطيك تقرير كامل.
              </p>

              {/* Comparison Table */}
              <h2 className="text-2xl font-bold text-gray-800 mt-12 mb-6">فني متنقل مقابل الورشة التقليدية</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-800 text-white">
                      <th className="p-3 text-right">المعيار</th>
                      <th className="p-3 text-center">فني مير المتنقل</th>
                      <th className="p-3 text-center">الورشة التقليدية</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { criteria: "وقت الانتظار", mobile: "24 دقيقة وصول", workshop: "ساعات أو يوم كامل" },
                      { criteria: "تكلفة السطحة", mobile: "لا تحتاج سطحة", workshop: "100-300 ر.س إضافية" },
                      { criteria: "الراحة", mobile: "في بيتك أو عملك", workshop: "تحتاج توصيل وانتظار" },
                      { criteria: "الشفافية", mobile: "تشوف الفحص بعينك", workshop: "ما تعرف وش يصير" },
                      { criteria: "الفحص الإلكتروني", mobile: "OBD2 في الموقع", workshop: "متوفر في بعضها" },
                      { criteria: "الضمان", mobile: "ضمان على الخدمة", workshop: "يختلف من ورشة لأخرى" },
                    ].map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                        <td className="p-3 font-medium text-gray-700 border border-gray-200">{row.criteria}</td>
                        <td className="p-3 text-center text-green-700 font-medium border border-gray-200">
                          <CheckCircle className="w-4 h-4 inline ml-1" />{row.mobile}
                        </td>
                        <td className="p-3 text-center text-gray-500 border border-gray-200">{row.workshop}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* When NOT to use mobile */}
              <h2 className="text-2xl font-bold text-gray-800 mt-12 mb-4">متى تحتاج ورشة وليس فني متنقل؟</h2>
              <p>
                الفني المتنقل يحل معظم المشاكل، لكن هناك حالات تحتاج ورشة متخصصة:
              </p>
              <div className="space-y-3 my-4">
                {[
                  "إصلاح المحرك من الداخل (تغيير رأس السيلندر أو الكباسات)",
                  "إصلاح ناقل الحركة (القير) من الداخل",
                  "دهان وسمكرة الهيكل",
                  "إصلاح حوادث كبيرة",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-gray-600">
                    <span className="text-red-400 mt-1">✗</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <p>
                في هذه الحالات، الفني المتنقل يشخّص المشكلة ويحيلك لأقرب ورشة موثوقة.
              </p>

              {/* Testimonials */}
              <h2 className="text-2xl font-bold text-gray-800 mt-12 mb-6">تجارب عملاء مير</h2>
              <div className="space-y-4">
                {[
                  { name: "محمد العتيبي", city: "مكة المكرمة", text: "سيارتي ما اشتغلت الصبح وعندي اجتماع مهم. الفني وصل خلال 20 دقيقة وغير البطارية وأنا في البيت. ممتاز!", stars: 5 },
                  { name: "سارة الغامدي", city: "جدة", text: "لمبة المحرك نورت وما أعرف السبب. الفني فحص بجهاز OBD وشرح لي المشكلة بالضبط وحلها في موقفي. خدمة احترافية.", stars: 5 },
                  { name: "خالد الزهراني", city: "مكة المكرمة", text: "عملت الصيانة الدورية في البيت. وفرت وقت الورشة والسطحة. الفني شاطر ومعه كل الأدوات.", stars: 5 },
                ].map((review, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: review.stars }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 italic mb-3">"{review.text}"</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="font-medium text-gray-700">{review.name}</span>
                      <span>•</span>
                      <MapPin className="w-3 h-3" />
                      <span>{review.city}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <h2 className="text-2xl font-bold text-gray-800 mt-12 mb-4">الخلاصة</h2>
              <p>
                الفني المتنقل هو الحل الأذكى لمعظم مشاكل السيارات اليومية. 
                يوفر عليك وقت الانتظار، تكلفة السطحة، وإزعاج الورشة — مع نفس جودة الخدمة 
                أو أفضل لأنك تشوف كل شيء بعينك.
              </p>
              <p>
                <strong>القاعدة البسيطة:</strong> إذا السيارة تقدر تشتغل أو المشكلة في الخارج (بطارية، 
                كهرباء، زيوت، صيانة دورية) — الفني المتنقل هو خيارك. 
                إذا المشكلة تحتاج رفع السيارة أو فك المحرك — الورشة أنسب.
              </p>
            </div>

            {/* CTA */}
            <div className="mt-12 p-8 bg-yellow-50 rounded-2xl border border-yellow-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">اطلب فني سيارات متنقل الآن</h3>
                  <p className="text-gray-600 mb-2">فني متخصص يصلك في مكة وجدة خلال 24 دقيقة</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-5">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 24/7 طوارئ</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> مكة وجدة</span>
                    <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> رسوم الكشف 200 ر.س</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/service-request">
                      <a className="px-6 py-3 bg-yellow-500 text-gray-900 rounded-lg font-bold hover:bg-yellow-400 transition-colors text-center block">
                        اطلب فني الآن
                      </a>
                    </Link>
                    <a href="https://wa.me/966543257872?text=أبي فني سيارات يجي عندي" target="_blank" rel="noopener noreferrer"
                      className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors text-center flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4" />
                      واتساب
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Articles */}
            <div className="mt-10">
              <h3 className="text-lg font-bold text-gray-800 mb-4">مقالات ذات صلة</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/blog/battery-signs">
                  <a className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-yellow-300 transition-colors block">
                    <div className="text-xs text-yellow-600 mb-1">بطاريات</div>
                    <div className="font-medium text-gray-800">كيف تعرف إن بطارية سيارتك خربانة؟ 7 علامات واضحة</div>
                  </a>
                </Link>
                <Link href="/blog/starter-alternator">
                  <a className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-yellow-300 transition-colors block">
                    <div className="text-xs text-yellow-600 mb-1">كهرباء</div>
                    <div className="font-medium text-gray-800">السلف والدينمو: كيف تعرف أيهما المشكلة؟</div>
                  </a>
                </Link>
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
