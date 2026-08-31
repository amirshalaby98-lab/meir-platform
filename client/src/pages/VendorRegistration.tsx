import { useState } from "react";
import { useLocation } from "wouter";
import { GraduationCap, Phone, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { trpc } from "@/lib/trpc";

type VendorType = "trainer";
type Step = "type" | "form" | "otp" | "success";

const vendorTypes: { type: VendorType; label: string; icon: any; desc: string }[] = [
  { type: "trainer", label: "مدرب", icon: GraduationCap, desc: "تدريب فنيين على صيانة السيارات" },
];

export default function VendorRegistration() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("type");
  const [vendorType, setVendorType] = useState<VendorType | null>(null);
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    phone: "",
    email: "",
    city: "",
    area: "",
    address: "",
    description: "",
    commercialLicense: "",
    taxId: "",
  });

  const registerMutation = trpc.vendors.register.useMutation();
  const verifyMutation = trpc.vendors.verifyCode.useMutation();
  const resendMutation = trpc.vendors.resendCode.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorType) return;

    try {
      const result = await registerMutation.mutateAsync({
        vendorType,
        ...formData,
      });
      setVendorId(result.vendorId);
      setStep("otp");
      toast({ title: "تم الإرسال", description: "تم إرسال رمز التحقق إلى جوالك" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ", description: error.message });
    }
  };

  const handleVerify = async () => {
    if (!vendorId || otpCode.length !== 6) return;
    try {
      await verifyMutation.mutateAsync({ vendorId, code: otpCode });
      setStep("success");
      toast({ title: "تم التحقق", description: "تم تسجيلك بنجاح" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ", description: error.message });
    }
  };

  const handleResend = async () => {
    if (!vendorId) return;
    try {
      await resendMutation.mutateAsync({ vendorId });
      toast({ title: "تم الإرسال", description: "تم إرسال رمز جديد" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ", description: error.message });
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getFormFields = () => {
    const common = (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>الاسم الكامل *</Label>
            <Input value={formData.ownerName} onChange={(e) => updateField("ownerName", e.target.value)} required placeholder="اسمك الكامل" />
          </div>
          <div>
            <Label>رقم الجوال *</Label>
            <Input value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} required placeholder="05xxxxxxxx" dir="ltr" />
          </div>
          <div>
            <Label>البريد الإلكتروني *</Label>
            <Input type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} required placeholder="email@example.com" dir="ltr" />
          </div>
          <div>
            <Label>المدينة *</Label>
            <Input value={formData.city} onChange={(e) => updateField("city", e.target.value)} required placeholder="مثال: مكة المكرمة" />
          </div>
          <div>
            <Label>المنطقة/الحي *</Label>
            <Input value={formData.area} onChange={(e) => updateField("area", e.target.value)} required placeholder="مثال: حي العزيزية" />
          </div>
        </div>
      </>
    );

    switch (vendorType) {
      case "trainer":
        return (
          <>
            <div>
              <Label>اسم المدرب / المعهد *</Label>
              <Input value={formData.businessName} onChange={(e) => updateField("businessName", e.target.value)} required placeholder="مثال: أكاديمية التميز للتدريب" />
            </div>
            {common}
            <div>
              <Label>مجال التدريب والتخصص</Label>
              <Textarea value={formData.description} onChange={(e) => updateField("description", e.target.value)} placeholder="مثال: تدريب فنيين على تشخيص ECU، كهرباء السيارات" />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">انضم إلينا</h1>
          <p className="text-gray-600">سجّل خدمتك وانضم لشبكة مير</p>
        </div>

        {/* Step 1: اختيار النوع */}
        {step === "type" && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">اختر نوع الخدمة:</h2>
            {vendorTypes.map((vt) => {
              const Icon = vt.icon;
              return (
                <button
                  key={vt.type}
                  onClick={() => { setVendorType(vt.type); setStep("form"); }}
                  className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-yellow-400 hover:shadow-md transition-all text-right"
                >
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{vt.label}</h3>
                    <p className="text-sm text-gray-500">{vt.desc}</p>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-gray-400" />
                </button>
              );
            })}
          </div>
        )}

        {/* Step 2: النموذج */}
        {step === "form" && vendorType && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                تسجيل {vendorTypes.find(v => v.type === vendorType)?.label}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => { setStep("type"); setVendorType(null); }}>
                <ArrowRight className="w-4 h-4 ml-1" /> رجوع
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {getFormFields()}
              <Button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "جاري الإرسال..." : "إرسال وتحقق من الجوال"}
              </Button>
            </form>
          </div>
        )}

        {/* Step 3: OTP */}
        {step === "otp" && vendorId && (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <Phone className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">التحقق من رقم الجوال</h2>
            <p className="text-gray-600 mb-6">أدخل الرمز المرسل إلى {formData.phone}</p>
            <div className="max-w-xs mx-auto space-y-4">
              <Input
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="text-center text-2xl tracking-[0.5em] font-bold"
                dir="ltr"
              />
              <Button
                onClick={handleVerify}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                disabled={verifyMutation.isPending || otpCode.length !== 6}
              >
                {verifyMutation.isPending ? "جاري التحقق..." : "تحقق"}
              </Button>
              <Button variant="ghost" onClick={handleResend} className="w-full text-sm text-gray-500">
                إعادة إرسال الرمز
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: نجاح */}
        {step === "success" && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">تم التسجيل بنجاح!</h2>
            <p className="text-gray-600 mb-6">
              شكراً لانضمامك. سيتم مراجعة بياناتك والموافقة عليها قريباً.
            </p>
            <Button onClick={() => setLocation("/")} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
              العودة للرئيسية
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
