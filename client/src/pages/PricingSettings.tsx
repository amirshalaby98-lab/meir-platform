import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, DollarSign, Navigation } from "lucide-react";

export default function PricingSettings() {
  const { data: settings, isLoading, refetch } = trpc.pricing.getSettings.useQuery();
  const updateMutation = trpc.pricing.updateSettings.useMutation();

  const [hourlyRate, setHourlyRate] = useState<number>(0);
  const [pricePerKm, setPricePerKm] = useState<number>(0);

  // Initialize form when settings load
  useState(() => {
    if (settings) {
      setHourlyRate(settings.hourlyRate);
      setPricePerKm(settings.pricePerKm);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hourlyRate < 1 || hourlyRate > 1000) {
      toast.error("سعر الساعة يجب أن يكون بين 1 و 1000 ريال");
      return;
    }

    if (pricePerKm < 1 || pricePerKm > 100) {
      toast.error("سعر الكيلو يجب أن يكون بين 1 و 100 ريال");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        hourlyRate,
        pricePerKm,
      });
      
      toast.success("تم تحديث الأسعار بنجاح!");
      refetch();
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث الأسعار");
      console.error(error);
    }
  };

  const handleReset = () => {
    if (settings) {
      setHourlyRate(settings.hourlyRate);
      setPricePerKm(settings.pricePerKm);
      toast.info("تم إعادة تعيين القيم");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mb-4">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            إعدادات الأسعار
          </h1>
          <p className="text-gray-600">
            قم بتعديل أسعار الخدمات والمسافات
          </p>
        </div>

        {/* Current Settings Card */}
        <Card className="p-8 mb-8 bg-white shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-yellow-500 rounded-full"></span>
            الأسعار الحالية
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700">سعر الساعة</h3>
              </div>
              <p className="text-4xl font-bold text-blue-600">
                {settings?.hourlyRate} <span className="text-2xl">ريال</span>
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700">سعر الكيلو</h3>
              </div>
              <p className="text-4xl font-bold text-green-600">
                {settings?.pricePerKm} <span className="text-2xl">ريال</span>
              </p>
            </div>
          </div>
        </Card>

        {/* Update Form */}
        <Card className="p-8 bg-white shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-yellow-500 rounded-full"></span>
            تحديث الأسعار
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                سعر الساعة (ريال) *
              </label>
              <Input
                type="number"
                value={hourlyRate || ""}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                placeholder="مثال: 150"
                min={1}
                max={1000}
                required
                className="text-lg"
              />
              <p className="text-sm text-gray-500 mt-1">
                القيمة يجب أن تكون بين 1 و 1000 ريال
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                سعر الكيلو (ريال) *
              </label>
              <Input
                type="number"
                value={pricePerKm || ""}
                onChange={(e) => setPricePerKm(Number(e.target.value))}
                placeholder="مثال: 5"
                min={1}
                max={100}
                required
                className="text-lg"
              />
              <p className="text-sm text-gray-500 mt-1">
                القيمة يجب أن تكون بين 1 و 100 ريال
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold py-6 text-lg"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                    جاري التحديث...
                  </>
                ) : (
                  "حفظ التغييرات"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="px-8 py-6 text-lg"
              >
                إعادة تعيين
              </Button>
            </div>
          </form>

          {/* Warning */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>تنبيه:</strong> تغيير الأسعار سيؤثر على جميع الحسابات الجديدة في حاسبة الأسعار.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
