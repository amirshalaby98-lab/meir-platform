import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Shield, AlertTriangle, FileText, Scale, Car, Wrench, CreditCard, Phone } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="pt-32 pb-16">
        <div className="container max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 px-4 py-2 rounded-full mb-4">
              <Scale className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-700">سياسة الاستخدام</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              شروط وأحكام الاستخدام
            </h1>
            <p className="text-xl text-gray-600">
              آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
            </p>
          </div>

          {/* Important Notice */}
          <Card className="p-6 mb-8 bg-yellow-50 border-2 border-yellow-400">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">تنبيه مهم</h3>
                <p className="text-gray-700 leading-relaxed">
                  باستخدامك لمنصة مير، فإنك توافق على جميع الشروط والأحكام الواردة في هذه الصفحة. 
                  يُرجى قراءة هذه الشروط بعناية قبل استخدام المنصة أو طلب أي خدمة.
                </p>
              </div>
            </div>
          </Card>

          {/* Content */}
          <div className="space-y-8">
            {/* Section 1 */}
            <Card className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">1. طبيعة المنصة</h2>
                </div>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  <strong>منصة مير</strong> هي منصة وسيطة (Marketplace / Platform) تعمل كوسيط تقني لربط المستخدمين 
                  بمقدمي الخدمات المستقلين، بما في ذلك:
                </p>
                <ul className="list-disc list-inside space-y-2 mr-6">
                  <li>فنيي صيانة السيارات المتنقلة</li>
                  <li>خدمات التشخيص الإلكتروني (OBD)</li>
                  <li>الجهات التدريبية الشريكة</li>
                  <li>محلات قطع الغيار والتشاليح</li>
                  <li>خدمات السطحات والنقل</li>
                </ul>
                <p className="font-semibold text-gray-900">
                  مير لا تقدم الخدمات بنفسها، ولا تتحمل أي مسؤولية مباشرة عن جودة الخدمات أو نتائجها.
                </p>
              </div>
            </Card>

            {/* Section 2 - خدمات الصيانة */}
            <Card className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">2. شروط خدمات الصيانة والإصلاح</h2>
                </div>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p><strong>2.1 رسوم الكشف والتشخيص:</strong></p>
                <ul className="list-disc list-inside space-y-2 mr-6">
                  <li>رسوم الكشف الميداني <strong>200 ريال</strong> غير قابلة للاسترداد بعد وصول الفني</li>
                  <li>رسوم الكشف تشمل: الانتقال + التشخيص الأولي + تقرير الحالة</li>
                  <li>رسوم الكشف <strong>لا تشمل</strong> تكاليف الإصلاح أو قطع الغيار</li>
                  <li>في حال إلغاء الطلب قبل انطلاق الفني، يتم استرداد المبلغ كاملاً</li>
                  <li>في حال إلغاء الطلب بعد انطلاق الفني، لا يتم الاسترداد</li>
                </ul>

                <p><strong>2.2 عرض الصيانة والإصلاح:</strong></p>
                <ul className="list-disc list-inside space-y-2 mr-6">
                  <li>بعد التشخيص يُرسل عرض صيانة مفصل يشمل القطع والأسعار</li>
                  <li>العرض <strong>صالح لمدة 48 ساعة</strong> من تاريخ إرساله</li>
                  <li>الأسعار قابلة للتغيير حسب توفر القطع في السوق</li>
                  <li>موافقة العميل على العرض تعني <strong>التزامه بالدفع</strong> عند إتمام العمل</li>
                  <li>العميل حر في رفض العرض دون أي التزام إضافي</li>
                </ul>

                <p><strong>2.3 ضمان الإصلاح:</strong></p>
                <ul className="list-disc list-inside space-y-2 mr-6">
                  <li>ضمان العمل (اليد العاملة): <strong>7 أيام</strong> من تاريخ الإصلاح</li>
                  <li>ضمان القطع: حسب ضمان المصنع أو المورد</li>
                  <li>الضمان <strong>لا يشمل</strong>: سوء الاستخدام، الحوادث، التعديلات غير المصرح بها</li>
                  <li>الضمان <strong>يسقط</strong> في حال تدخل فني آخر غير معتمد من مير</li>
                </ul>
              </div>
            </Card>

            {/* Section 3 - التشخيص الإلكتروني */}
            <Card className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Car className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">3. خدمة التشخيص الإلكتروني (OBD)</h2>
                </div>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <ul className="list-disc list-inside space-y-2 mr-6">
                  <li>خدمة التشخيص الذكي عبر الموقع هي <strong>أداة مساعدة</strong> وليست بديلاً عن الفحص الميداني</li>
                  <li>نتائج التشخيص الإلكتروني <strong>استرشادية</strong> وقد لا تعكس الحالة الكاملة للمركبة</li>
                  <li>مير <strong>لا تتحمل مسؤولية</strong> أي قرارات مبنية على نتائج التشخيص الإلكتروني فقط</li>
                  <li>بيانات الفحص تُخزن في نظامنا لأغراض <strong>تحسين الخدمة والتحليل</strong></li>
                  <li>يُنصح دائماً بالفحص الميداني للتأكد من صحة التشخيص</li>
                  <li>التوافق مع جميع أنواع السيارات <strong>غير مضمون</strong> - بعض المركبات قد لا تدعم بروتوكولات الفحص</li>
                </ul>
              </div>
            </Card>

            {/* Section 4 - المسؤولية */}
            <Card className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">4. إخلاء المسؤولية عن الأضرار</h2>
                </div>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p><strong>مير لا تتحمل المسؤولية عن:</strong></p>
                <ul className="list-disc list-inside space-y-2 mr-6">
                  <li>أي أضرار تلحق بالمركبة أثناء أو بعد عملية الإصلاح</li>
                  <li>تأخر وصول الفني عن الموعد المحدد</li>
                  <li>عدم توفر قطع الغيار المطلوبة</li>
                  <li>أي أضرار ناتجة عن عدم دقة المعلومات المقدمة من العميل</li>
                  <li>أعطال إضافية تظهر بعد الإصلاح لم تكن مرتبطة بالعمل المنجز</li>
                  <li>أي خسائر مادية أو معنوية غير مباشرة</li>
                  <li>أضرار ناتجة عن استخدام المركبة بعد التحذير من عدم صلاحيتها</li>
                </ul>
                <p className="font-semibold text-orange-700 mt-4">
                  المسؤولية المباشرة عن جودة العمل تقع على الفني المنفذ وليس على منصة مير.
                </p>
              </div>
            </Card>

            {/* Section 5 - التزامات العميل */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. التزامات العميل</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <ul className="list-disc list-inside space-y-2 mr-6">
                  <li>تقديم <strong>معلومات صحيحة ودقيقة</strong> عن المركبة والمشكلة</li>
                  <li>توفير <strong>مكان آمن ومناسب</strong> لعمل الفني</li>
                  <li>الحضور أو توكيل شخص <strong>أثناء عملية الإصلاح</strong></li>
                  <li><strong>عدم التدخل</strong> في عمل الفني أثناء التنفيذ</li>
                  <li>الالتزام بـ<strong>الدفع</strong> في حال الموافقة على عرض الصيانة</li>
                  <li>إبلاغ المنصة فوراً في حال وجود <strong>أي مشكلة</strong> خلال فترة الضمان</li>
                  <li>عدم استخدام المنصة لأغراض <strong>غير مشروعة</strong></li>
                </ul>
              </div>
            </Card>

            {/* Section 6 - الدفع والاسترداد */}
            <Card className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">6. سياسة الدفع والاسترداد</h2>
                </div>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <ul className="list-disc list-inside space-y-2 mr-6">
                  <li>جميع الأسعار بـ<strong>الريال السعودي</strong> وشاملة ضريبة القيمة المضافة (15%)</li>
                  <li>الدفع يتم عبر: تحويل بنكي / STC Pay / مدى / نقداً للفني</li>
                  <li>رسوم الكشف <strong>غير قابلة للاسترداد</strong> بعد وصول الفني</li>
                  <li>في حال عدم إتمام الإصلاح بسبب المنصة، يُسترد المبلغ كاملاً</li>
                  <li>طلبات الاسترداد تُعالج خلال <strong>5-7 أيام عمل</strong></li>
                  <li>أي نزاع مالي يُحل عبر التواصل مع إدارة المنصة أولاً</li>
                </ul>
              </div>
            </Card>

            {/* Section 7 - البرامج التدريبية */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. البرامج التدريبية</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <ul className="list-disc list-inside space-y-2 mr-6">
                  <li>مير <strong>ليست جهة تدريب رسمية</strong> - البرامج مقدمة من جهات شريكة مستقلة</li>
                  <li>إتمام التدريب <strong>لا يضمن التوظيف</strong> أو الانضمام كفني</li>
                  <li>الشهادات صادرة من <strong>الجهة التدريبية</strong> وليس من مير</li>
                  <li>رسوم التدريب <strong>غير قابلة للاسترداد</strong> بعد بدء البرنامج</li>
                </ul>
              </div>
            </Card>

            {/* Section 8 - الخصوصية */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. الخصوصية وحماية البيانات</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <ul className="list-disc list-inside space-y-2 mr-6">
                  <li>نجمع بيانات المركبة والفحص لأغراض <strong>تحسين الخدمة</strong></li>
                  <li>بيانات الدفع تُعالج عبر <strong>قنوات آمنة ومشفرة</strong></li>
                  <li>لا نشارك بياناتك الشخصية مع أطراف ثالثة إلا <strong>بموافقتك</strong></li>
                  <li>يحق لك طلب <strong>حذف بياناتك</strong> في أي وقت</li>
                  <li>نحتفظ ببيانات الفحوصات لأغراض <strong>التحليل والتطوير</strong></li>
                </ul>
              </div>
            </Card>

            {/* Section 9 - الملكية الفكرية */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. حقوق الملكية الفكرية</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  جميع حقوق الملكية الفكرية للمنصة (التصميم، الشعار، المحتوى، الأكواد، قاعدة البيانات) محفوظة لـ <strong>منصة مير</strong>.
                </p>
                <p>
                  يُحظر نسخ أو إعادة نشر أو استخدام أي محتوى من المنصة دون إذن كتابي مسبق.
                </p>
              </div>
            </Card>

            {/* Section 10 - التعديلات */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. التعديلات على الشروط</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  مير تحتفظ بالحق في <strong>تعديل هذه الشروط في أي وقت</strong>. سيتم إشعار المستخدمين بالتعديلات الجوهرية.
                </p>
                <p>
                  استمرارك في استخدام المنصة بعد التعديلات يعني <strong>موافقتك على الشروط الجديدة</strong>.
                </p>
              </div>
            </Card>

            {/* Section 11 - القانون */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. القانون الحاكم وحل النزاعات</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  تخضع هذه الشروط والأحكام لـ <strong>أنظمة وقوانين المملكة العربية السعودية</strong>.
                </p>
                <p>
                  أي نزاع ينشأ عن استخدام المنصة يُحل ودياً أولاً، وفي حال عدم التوصل لحل يخضع لاختصاص <strong>المحاكم السعودية المختصة</strong>.
                </p>
              </div>
            </Card>

            {/* Section 12 - إخلاء شامل */}
            <Card className="p-8 bg-red-50 border-2 border-red-200">
              <h2 className="text-2xl font-bold text-red-900 mb-4">12. إخلاء المسؤولية الشامل</h2>
              <div className="space-y-4 text-red-800 leading-relaxed font-medium">
                <p>
                  منصة مير تعمل كوسيط تقني فقط ولا تتحمل أي مسؤولية قانونية أو مالية أو فنية عن:
                </p>
                <ul className="list-disc list-inside space-y-2 mr-6">
                  <li>أي أضرار تلحق بالمركبة أثناء أو بعد الإصلاح</li>
                  <li>عدم دقة نتائج التشخيص الإلكتروني</li>
                  <li>تأخر أو عدم وصول الفني</li>
                  <li>جودة قطع الغيار المستخدمة</li>
                  <li>أي خسائر مادية أو معنوية مباشرة أو غير مباشرة</li>
                  <li>محتوى البرامج التدريبية أو نتائجها</li>
                  <li>قرارات التوظيف أو الانضمام للمنصة</li>
                  <li>أي التزامات تعاقدية بين المستخدمين ومقدمي الخدمات</li>
                  <li>أعطال المركبة التي لم يتم الإبلاغ عنها مسبقاً</li>
                </ul>
                <p className="text-xl font-bold mt-4 text-center">
                  استخدامك للمنصة يعني قبولك الكامل وغير المشروط لهذا الإخلاء من المسؤولية.
                </p>
              </div>
            </Card>
          </div>

          {/* Contact */}
          <Card className="p-8 mt-8 bg-gradient-to-br from-yellow-50 to-white">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              للاستفسارات القانونية
            </h3>
            <p className="text-center text-gray-600 mb-4">
              إذا كان لديك أي استفسار حول هذه الشروط، يُرجى التواصل معنا
            </p>
            <div className="text-center">
              <a
                href="https://wa.me/966543257872"
                className="inline-flex items-center gap-2 text-yellow-600 hover:text-yellow-700 font-semibold"
              >
                <Phone className="w-5 h-5" />
                0543257872
              </a>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
