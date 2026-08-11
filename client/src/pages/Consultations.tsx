import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useToast } from "../hooks/use-toast";

type Step = "type" | "vehicle" | "describe" | "result";

export default function Consultations() {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("type");
  const [consultationType, setConsultationType] = useState<"quick" | "detailed" | "emergency">("quick");
  const [vehicleInfo, setVehicleInfo] = useState({ make: "", model: "", year: "", mileage: 0 });
  const [description, setDescription] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(false);

  const aiAnalysis = trpc.consultations.aiAnalysis.useMutation();
  const createConsultation = trpc.consultations.create.useMutation();

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
      await createConsultation.mutateAsync({
        consultationType,
        vehicleInfo,
        description,
      });
      toast({ title: "تم الإرسال", description: "تم إرسال الاستشارة بنجاح، سيتم الرد عليك قريباً" });
    } catch (e) {
      toast({ title: "خطأ", description: "يجب تسجيل الدخول أولاً", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">الاستشارات الهندسية</h1>
        <p className="text-gray-600 text-center mb-8">احصل على تشخيص من مهندسين متخصصين</p>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {["type", "vehicle", "describe", "result"].map((s, i) => (
            <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === s ? "bg-yellow-400 text-black" : i < ["type", "vehicle", "describe", "result"].indexOf(step) ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
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
              <div className="flex gap-2">
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
      </div>
    </div>
  );
}
