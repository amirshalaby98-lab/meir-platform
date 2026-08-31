import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { useToast } from "../hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

type Step = "type" | "vehicle" | "describe" | "result" | "payment" | "confirmation";

export default function Consultations() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState<Step>("type");
  const [consultationType, setConsultationType] = useState<"quick" | "detailed" | "emergency">("quick");
  const [vehicleInfo, setVehicleInfo] = useState({ make: "", model: "", year: "", mileage: 0 });
  const [description, setDescription] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(false);

  const [consultationId, setConsultationId] = useState<number | null>(null);
  const [consultationPrice, setConsultationPrice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "stc_pay" | "mada" | "card" | "cash">("bank_transfer");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const aiAnalysis = trpc.consultations.aiAnalysis.useMutation();
  const createConsultation = trpc.consultations.create.useMutation();
  const submitPaymentMutation = trpc.consultations.submitPayment.useMutation({
    onSuccess: () => {
      setStep("confirmation");
      sonnerToast.success("تم تسجيل الدفع بنجاح! سيتم مراجعة طلبك");
    },
    onError: (err) => sonnerToast.error(err.message || "فشل تسجيل الدفع"),
  });

  const types = [
    { id: "quick" as const, name: "استشارة سريعة", price: "50 ريال", desc: "رد خلال ساعة", icon: "⚡" },
    { id: "detailed" as const, name: "استشارة تفصيلية", price: "150 ريال", desc: "تقرير مفصل + توصيات", icon: "📋" },
    { id: "emergency" as const, name: "استشارة طوارئ", price: "250 ريال", desc: "رد فوري + متابعة", icon: "🚨" },
  ];

  const handleAiAnalysis = async () => {
    setLoading(true);
    try {
      const result = await aiAnalysis.mutateAsync({ vehicleInfo, description });
      setAiResult(result.analysis);
      setStep("result");
    } catch (e) {
      toast({ title: "خطأ", description: "حدث خطأ أثناء التحليل", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleSubmitConsultation = async () => {
    setLoading(true);
    try {
      const result = await createConsultation.mutateAsync({
        consultationType,
        vehicleInfo,
        description,
      });
      setConsultationId(result.id);
      setConsultationPrice(result.price);
      setStep("payment");
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message || "حدث خطأ أثناء إرسال الاستشارة", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleReceiptSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      sonnerToast.error("حجم صورة الإيصال يتجاوز الحد الأقصى (5MB)");
      return;
    }
    setReceiptFile(file);
    const reader = new FileReader();
    reader.onload = () => setReceiptPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmitPayment = () => {
    if (!consultationId) return;
    submitPaymentMutation.mutate({
      consultationId,
      paymentMethod: paymentMethod === "card" ? ("credit_card" as const) : paymentMethod,
      reference: `CONSULT-PAY-${Date.now()}`,
      receiptBase64: receiptPreview ? receiptPreview.split(",")[1] : undefined,
      mimeType: receiptFile?.type,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
          <Card className="p-8 text-center max-w-md">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">يرجى تسجيل الدخول أولاً</h2>
            <p className="text-gray-600 mb-4">لحجز استشارة فنية يرجى تسجيل الدخول أو إنشاء حساب جديد</p>
            <Button
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-3"
              onClick={() => (window.location.href = getLoginUrl())}
            >
              تسجيل / دخول
            </Button>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  const stepsList: Step[] = ["type", "vehicle", "describe", "payment", "confirmation"];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />
      <div className="py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">الاستشارات الهندسية</h1>
        <p className="text-gray-600 text-center mb-8">احصل على تشخيص من مهندسين متخصصين</p>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {stepsList.map((s, i) => (
            <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === s ? "bg-yellow-400 text-black" : i < stepsList.indexOf(step === "result" ? "describe" : step) ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
              {i + 1}
            </div>
          ))}
        </div>

        {/* Step 1: Type */}
        {step === "type" && (
          <div className="grid gap-4">
            {types.map((t) => (
              <Card key={t.id} className={`cursor-pointer transition-all ${consultationType === t.id ? "ring-2 ring-yellow-400 bg-yellow-50" : "hover:shadow-md"}`} onClick={() => setConsultationType(t.id)}>
                <CardContent className="flex items-center gap-4 p-4">
                  <span className="text-3xl">{t.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-bold">{t.name}</h3>
                    <p className="text-sm text-gray-600">{t.desc}</p>
                  </div>
                  <span className="font-bold text-yellow-600">{t.price}</span>
                </CardContent>
              </Card>
            ))}
            <Button className="bg-yellow-400 text-black hover:bg-yellow-500 mt-4" onClick={() => setStep("vehicle")}>
              التالي
            </Button>
          </div>
        )}

        {/* Step 2: Vehicle */}
        {step === "vehicle" && (
          <Card>
            <CardHeader><CardTitle>معلومات السيارة</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">الماركة</label>
                  <input className="w-full border rounded-lg p-2" placeholder="تويوتا" value={vehicleInfo.make} onChange={(e) => setVehicleInfo({ ...vehicleInfo, make: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">الموديل</label>
                  <input className="w-full border rounded-lg p-2" placeholder="كامري" value={vehicleInfo.model} onChange={(e) => setVehicleInfo({ ...vehicleInfo, model: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">السنة</label>
                  <input className="w-full border rounded-lg p-2" placeholder="2022" value={vehicleInfo.year} onChange={(e) => setVehicleInfo({ ...vehicleInfo, year: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">الكيلومترات</label>
                  <input type="number" className="w-full border rounded-lg p-2" placeholder="50000" value={vehicleInfo.mileage || ""} onChange={(e) => setVehicleInfo({ ...vehicleInfo, mileage: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("type")}>رجوع</Button>
                <Button className="bg-yellow-400 text-black hover:bg-yellow-500 flex-1" onClick={() => setStep("describe")} disabled={!vehicleInfo.make || !vehicleInfo.model || !vehicleInfo.year}>
                  التالي
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Describe */}
        {step === "describe" && (
          <Card>
            <CardHeader><CardTitle>وصف المشكلة</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <textarea className="w-full border rounded-lg p-3 min-h-[150px]" placeholder="اشرح المشكلة بالتفصيل... مثال: صوت طقطقة عند الدوران يميناً، يزداد عند السرعات العالية" value={description} onChange={(e) => setDescription(e.target.value)} />
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" onClick={() => setStep("vehicle")}>رجوع</Button>
                <Button className="bg-blue-500 text-white hover:bg-blue-600" onClick={handleAiAnalysis} disabled={loading || description.length < 10}>
                  {loading ? "جاري التحليل..." : "🤖 تحليل AI مجاني"}
                </Button>
                <Button className="bg-yellow-400 text-black hover:bg-yellow-500" onClick={handleSubmitConsultation} disabled={loading || description.length < 10}>
                  إرسال لمهندس ({types.find(t => t.id === consultationType)?.price})
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Result */}
        {step === "result" && (
          <Card>
            <CardHeader><CardTitle>🤖 نتيجة التحليل الذكي</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-sm leading-relaxed">
                {aiResult}
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                <strong>ملاحظة:</strong> هذا تحليل أولي من الذكاء الاصطناعي. للحصول على تشخيص دقيق من مهندس متخصص، أرسل استشارة مدفوعة.
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("describe")}>تعديل الوصف</Button>
                <Button className="bg-yellow-400 text-black hover:bg-yellow-500 flex-1" onClick={handleSubmitConsultation} disabled={loading}>
                  إرسال لمهندس ({types.find(t => t.id === consultationType)?.price})
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Payment */}
        {step === "payment" && (
          <Card>
            <CardHeader><CardTitle>دفع رسوم الاستشارة</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-yellow-700">{consultationPrice} ريال</p>
                <p className="text-sm text-gray-500">رسوم الاستشارة الفنية</p>
              </div>

              <div>
                <Label className="text-base font-medium">اختر طريقة الدفع:</Label>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {[
                    { value: "bank_transfer", label: "تحويل بنكي" },
                    { value: "stc_pay", label: "STC Pay" },
                    { value: "mada", label: "مدى" },
                    { value: "card", label: "بطاقة ائتمانية" },
                  ].map((method) => (
                    <button
                      key={method.value}
                      onClick={() => setPaymentMethod(method.value as any)}
                      className={`p-3 border rounded-lg text-center transition-colors ${
                        paymentMethod === method.value
                          ? "border-yellow-500 bg-yellow-50 text-yellow-700 font-medium"
                          : "border-gray-200 hover:border-yellow-300"
                      }`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === "bank_transfer" && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="font-medium text-sm">معلومات التحويل:</p>
                  <div className="text-sm space-y-1">
                    <p>البنك: <span className="font-medium">الراجحي</span></p>
                    <p>رقم الحساب: <span className="font-medium">IBAN SA...</span></p>
                    <p>اسم المستفيد: <span className="font-medium">مؤسسة مير للخدمات</span></p>
                  </div>
                  <div className="pt-3">
                    <Label htmlFor="receipt">ارفق صورة الإيصال</Label>
                    <Input id="receipt" type="file" accept="image/*" onChange={handleReceiptSelect} className="mt-1" />
                    {receiptPreview && <img src={receiptPreview} alt="إيصال" className="mt-2 max-h-32 rounded-lg" />}
                  </div>
                </div>
              )}

              {paymentMethod === "stc_pay" && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-sm">حوّل المبلغ عبر STC Pay إلى:</p>
                  <p className="text-lg font-bold mt-1">05XXXXXXXX</p>
                  <div className="pt-3">
                    <Label htmlFor="receipt-stc">ارفق صورة الإيصال</Label>
                    <Input id="receipt-stc" type="file" accept="image/*" onChange={handleReceiptSelect} className="mt-1" />
                    {receiptPreview && <img src={receiptPreview} alt="إيصال" className="mt-2 max-h-32 rounded-lg" />}
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked === true)} className="mt-0.5" />
                <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                  أوافق على <a href="/terms" target="_blank" className="text-yellow-600 underline font-medium">الشروط والأحكام</a> وسياسة الاستخدام
                </label>
              </div>

              <Button
                onClick={handleSubmitPayment}
                disabled={submitPaymentMutation.isPending || !termsAccepted}
                className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
                size="lg"
              >
                {submitPaymentMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin ml-2" /> جاري التسجيل...
                  </>
                ) : (
                  "تأكيد الدفع"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 6: Confirmation */}
        {step === "confirmation" && (
          <Card>
            <CardContent className="text-center space-y-4 py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold">تم إرسال طلبك بنجاح!</h2>
              <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2 text-right">
                <p>سيتم مراجعة طلبك والتحقق من الدفع</p>
                <p>بعد التأكيد، سيتم تعيين مهندس لاستشارتك</p>
                <p>ستصلك النتيجة والتوصيات فور اكتمال التقرير</p>
              </div>
              <Button className="bg-yellow-400 text-black hover:bg-yellow-500" onClick={() => (window.location.href = "/")}>
                الرئيسية
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      </div>
      <Footer />
    </div>
  );
}
