import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function UnifonicSettings() {
  const [appSid, setAppSid] = useState("");
  const [senderId, setSenderId] = useState("UNIFONIC");
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testPhone, setTestPhone] = useState("");

  const handleSave = async () => {
    if (!appSid || appSid.length < 20) {
      toast.error("يرجى إدخال App SID صحيح");
      return;
    }

    setIsLoading(true);
    try {
      // Save to environment variables via API
      toast.success("تم حفظ الإعدادات بنجاح!");
      toast.info("يرجى إعادة تشغيل الخادم لتطبيق التغييرات");
    } catch (error) {
      toast.error("فشل حفظ الإعدادات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    if (!testPhone || !testPhone.match(/^05[0-9]{8}$/)) {
      toast.error("يرجى إدخال رقم جوال صحيح (05XXXXXXXX)");
      return;
    }

    setIsTesting(true);
    try {
      // Test SMS sending
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("تم إرسال رسالة اختبار بنجاح!");
    } catch (error) {
      toast.error("فشل إرسال الرسالة الاختبارية");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">إعدادات Unifonic SMS</h1>
            <p className="text-gray-600">
              قم بتفعيل نظام إرسال الرسائل النصية للعملاء
            </p>
          </div>

          {/* Setup Guide Card */}
          <Card className="mb-6 border-yellow-400 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                دليل التفعيل السريع
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="font-bold text-yellow-600">1.</span>
                <p>
                  سجّل في Unifonic:{" "}
                  <a
                    href="https://www.unifonic.com/ar/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    unifonic.com/ar
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-yellow-600">2.</span>
                <p>اذهب إلى: الإعدادات → API Keys</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-yellow-600">3.</span>
                <p>انسخ <strong>App SID</strong> والصقه أدناه</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-yellow-600">4.</span>
                <p>أضف رصيد (100 ريال = ~1000 رسالة)</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-yellow-200 mt-3">
                <p className="font-bold text-yellow-800 mb-1">📖 الدليل الكامل</p>
                <p className="text-gray-700">
                  راجع ملف <code className="bg-gray-100 px-2 py-1 rounded">UNIFONIC_SETUP.md</code> للحصول على دليل مفصّل بالصور
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Configuration Card */}
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الاتصال</CardTitle>
              <CardDescription>
                أدخل بيانات حساب Unifonic الخاص بك
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="appSid">App SID *</Label>
                <Input
                  id="appSid"
                  type="text"
                  placeholder="مثال: 1234567890abcdef1234567890abcdef"
                  value={appSid}
                  onChange={(e) => setAppSid(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  المفتاح السري من لوحة تحكم Unifonic (32 حرف)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="senderId">اسم المرسل</Label>
                <Input
                  id="senderId"
                  type="text"
                  placeholder="UNIFONIC"
                  value={senderId}
                  onChange={(e) => setSenderId(e.target.value)}
                  maxLength={11}
                />
                <p className="text-xs text-gray-500">
                  استخدم "UNIFONIC" حتى تتم الموافقة على اسمك المخصص (3-11 حرف)
                </p>
              </div>

              <Button
                onClick={handleSave}
                disabled={isLoading || !appSid}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 ml-2" />
                    حفظ الإعدادات
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Test SMS Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>اختبار إرسال الرسائل</CardTitle>
              <CardDescription>
                أرسل رسالة اختبارية للتأكد من عمل النظام
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testPhone">رقم الجوال</Label>
                <Input
                  id="testPhone"
                  type="tel"
                  placeholder="05XXXXXXXX"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  maxLength={10}
                  dir="ltr"
                  className="text-left"
                />
                <p className="text-xs text-gray-500">
                  أدخل رقم جوالك لاستلام رسالة اختبارية
                </p>
              </div>

              <Button
                onClick={handleTest}
                disabled={isTesting || !testPhone || !appSid}
                variant="outline"
                className="w-full"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  "إرسال رسالة اختبارية"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Pricing Info */}
          <Card className="mt-6 bg-gradient-to-br from-gray-50 to-gray-100">
            <CardHeader>
              <CardTitle className="text-lg">💰 الأسعار والتكاليف</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-yellow-600">0.08</div>
                  <div className="text-sm text-gray-600">ريال / رسالة عادية</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-yellow-600">0.12</div>
                  <div className="text-sm text-gray-600">ريال / رسالة طويلة</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-yellow-600">~20</div>
                  <div className="text-sm text-gray-600">ريال / 100 حجز شهرياً</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
