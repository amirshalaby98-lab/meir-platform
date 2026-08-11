import { useRoute } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Award, Download, Share2, CheckCircle2, Calendar, User } from "lucide-react";
import { toast } from "sonner";

export default function Certificate() {
  const [, params] = useRoute("/certificates/:id");
  const certificateId = params?.id;

  // بيانات تجريبية للشهادة
  const certificate = {
    id: "CERT-2024-001",
    certificateNumber: "MEIR-CERT-2024-001",
    studentName: "أحمد محمد السعيد",
    courseName: "تدريب صيانة البطاريات",
    completionDate: "2024-12-15",
    issueDate: "2024-12-16",
    instructor: "م. أحمد السعيد",
    verificationCode: "VER-2024-ABC123",
    grade: "ممتاز",
    score: 95,
  };

  const handleDownload = () => {
    toast.success("جاري تحميل الشهادة...");
    // TODO: Implement PDF download
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `شهادة ${certificate.courseName}`,
        text: `حصلت على شهادة في ${certificate.courseName} من منصة مير للتدريب`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("تم نسخ رابط الشهادة");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-gray-50">
      <Header />

      <section className="pt-32 pb-16">
        <div className="container max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 px-4 py-2 rounded-full mb-4">
              <Award className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-700">شهادة إتمام</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              شهادة إتمام الدورة
            </h1>
            <p className="text-xl text-gray-600">
              تهانينا على إتمام الدورة التدريبية بنجاح
            </p>
          </div>

          {/* Certificate Card */}
          <Card className="overflow-hidden mb-8 shadow-2xl">
            <div className="relative bg-gradient-to-br from-white via-yellow-50 to-white p-12 border-8 border-yellow-400">
              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-400/10 rounded-full -translate-x-16 -translate-y-16" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-yellow-400/10 rounded-full translate-x-20 translate-y-20" />

              {/* Logo/Badge */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-400 rounded-full mb-4">
                  <Award className="w-12 h-12 text-black" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">منصة مير للتدريب</h2>
                <p className="text-gray-600">Meir Training Platform</p>
              </div>

              {/* Certificate Content */}
              <div className="text-center space-y-6 mb-8">
                <div>
                  <p className="text-lg text-gray-600 mb-2">هذه الشهادة تُمنح إلى</p>
                  <h3 className="text-4xl font-bold text-gray-900 mb-2">
                    {certificate.studentName}
                  </h3>
                  <p className="text-gray-600">لإتمامه بنجاح دورة</p>
                </div>

                <div className="py-6">
                  <h4 className="text-3xl font-bold text-yellow-600 mb-2">
                    {certificate.courseName}
                  </h4>
                  <div className="flex items-center justify-center gap-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span>التقدير: {certificate.grade}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-2">
                      <span>الدرجة: {certificate.score}%</span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto pt-6 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">تاريخ الإتمام</p>
                    <p className="font-semibold text-gray-900">{certificate.completionDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">تاريخ الإصدار</p>
                    <p className="font-semibold text-gray-900">{certificate.issueDate}</p>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <div className="h-16 flex items-end justify-center mb-2">
                    <div className="border-b-2 border-gray-900 w-48" />
                  </div>
                  <p className="font-semibold text-gray-900">{certificate.instructor}</p>
                  <p className="text-sm text-gray-600">المدرب</p>
                </div>
                <div className="text-center">
                  <div className="h-16 flex items-end justify-center mb-2">
                    <div className="border-b-2 border-gray-900 w-48" />
                  </div>
                  <p className="font-semibold text-gray-900">إدارة منصة مير</p>
                  <p className="text-sm text-gray-600">مدير التدريب</p>
                </div>
              </div>

              {/* Certificate Number */}
              <div className="text-center mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  رقم الشهادة: <span className="font-mono font-semibold">{certificate.certificateNumber}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  كود التحقق: <span className="font-mono">{certificate.verificationCode}</span>
                </p>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Button
              onClick={handleDownload}
              size="lg"
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
            >
              <Download className="w-5 h-5 ml-2" />
              تحميل الشهادة PDF
            </Button>
            <Button onClick={handleShare} size="lg" variant="outline">
              <Share2 className="w-5 h-5 ml-2" />
              مشاركة الشهادة
            </Button>
          </div>

          {/* Certificate Info */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">شهادة صادرة من الجهة التدريبية</h4>
                  <p className="text-sm text-gray-600">
                    هذه الشهادة صادرة من الجهة التدريبية الشريكة ويمكن التحقق منها
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">صالحة مدى الحياة</h4>
                  <p className="text-sm text-gray-600">
                    هذه الشهادة لا تنتهي صلاحيتها ويمكن استخدامها في أي وقت
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">قابلة للمشاركة</h4>
                  <p className="text-sm text-gray-600">
                    شارك شهادتك على LinkedIn وسيرتك الذاتية
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Legal Disclaimer */}
          <Card className="p-6 mt-8 bg-yellow-50 border-2 border-yellow-200">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-black text-xs font-bold">!</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">إخلاء مسؤولية</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  منصة مير تعمل كوسيط تقني لربط المتدربين بالجهات التدريبية الشريكة، ولا تتحمل أي مسؤولية قانونية أو تعليمية عن محتوى البرامج أو نتائج التدريب أو الشهادات الصادرة. جميع البرامج تخضع لشروط وأحكام الجهة المقدمة. هذه الشهادة صادرة من الجهة التدريبية الشريكة وليس من منصة مير.
                </p>
              </div>
            </div>
          </Card>

          {/* Verification Section */}
          <Card className="p-8 mt-8 bg-gradient-to-br from-gray-50 to-white">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              التحقق من صحة الشهادة
            </h3>
            <p className="text-center text-gray-600 mb-6">
              يمكن لأي شخص التحقق من صحة هذه الشهادة باستخدام رقم الشهادة أو كود التحقق
            </p>
            <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="أدخل رقم الشهادة أو كود التحقق"
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none"
              />
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold">
                تحقق الآن
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
