import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, MapPin, Clock, DollarSign, Car, Wrench, Loader2, Navigation, AlertCircle, Plus, Trash2, Save, BarChart3, Printer, Share2, Check, TrendingDown, Zap } from "lucide-react";
import { Link, useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

// Types
interface Brand {
  id: number;
  nameAr: string;
  name: string;
}

interface Model {
  id: number;
  brandId: number;
  nameAr: string;
  name: string;
  year?: number;
}

interface Part {
  id: number;
  nameAr: string;
  name: string;
}

interface ServiceType {
  id: number;
  serviceTypeName: string;
  minHours: string;
  maxHours: string;
  skillLevel: string;
}

interface PartVariant {
  id: number;
  variantName: string;
  price: string;
  oemPartNumber: string;
}

interface PriceResult {
  hours?: number;
  laborCost?: number;
  distanceCost?: number;
  partPrice?: number;
  partPriceMin?: number;
  partPriceMax?: number;
  totalCost?: number;
  hourlyRate?: number;
  pricePerKm?: number;
  error?: string;
  discount?: number;
  finalPrice?: number;
}

interface CalculationItem {
  id: string;
  brandId: number;
  brandName: string;
  modelId: number;
  modelName: string;
  partId: number;
  partName: string;
  serviceId?: number;
  serviceName?: string;
  variantId?: number;
  variantName?: string;
  distance: number;
  result: PriceResult;
  timestamp: Date;
}

interface SavedCalculation {
  id: string;
  name: string;
  date: string;
  items: CalculationItem[];
  totalCost: number;
}

interface WorkshopLocation {
  lat: number;
  lng: number;
}

// Constants
const WORKSHOP_LOCATIONS: Record<string, WorkshopLocation> = {
  makkah: { lat: 21.4225, lng: 39.8262 },
  jeddah: { lat: 21.5433, lng: 39.1728 },
};

const EARTH_RADIUS_KM = 6371;

export default function PriceCalculator() {
  // State
  const calculatePriceMutation = trpc.pricing.calculatePrice.useMutation();
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedPart, setSelectedPart] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [distance, setDistance] = useState<string>("15");
  const [workshop, setWorkshop] = useState<"makkah" | "jeddah">("makkah");
  const [calculationItems, setCalculationItems] = useState<CalculationItem[]>([]);
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [calculationName, setCalculationName] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [viewMode, setViewMode] = useState<"calculator" | "history" | "comparison">("calculator");
  const { toast } = useToast();

  // Queries
  const { data: brands, isLoading: brandsLoading } = trpc.pricing.getBrands.useQuery();
  const { data: models, isLoading: modelsLoading } = trpc.pricing.getModelsByBrand.useQuery(
    { brandId: selectedBrand || 0 },
    { enabled: !!selectedBrand }
  );
  const { data: parts, isLoading: partsLoading } = trpc.pricing.getParts.useQuery();
  const { data: services, isLoading: servicesLoading } = trpc.advancedPricing.getServiceTypes.useQuery(
    selectedPart ? { partId: selectedPart, modelId: selectedModel || 0 } : { partId: 0, modelId: 0 },
    { enabled: !!selectedPart }
  );
  const { data: variants, isLoading: variantsLoading } = trpc.advancedPricing.getPartVariants.useQuery(
    { partId: selectedPart || 0, modelId: selectedModel || 0 },
    { enabled: !!selectedPart && !!selectedModel }
  );
  const { data: pricingSettings } = trpc.pricing.getSettings.useQuery();

  // Calculate distance
  const calculateDistance = (userLat: number, userLng: number, workshopLat: number, workshopLng: number): number => {
    const dLat = ((workshopLat - userLat) * Math.PI) / 180;
    const dLng = ((workshopLng - userLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLat * Math.PI) / 180) *
        Math.cos((workshopLat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
  };

  // Get user location
  const handleGetLocation = () => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          const workshopLoc = WORKSHOP_LOCATIONS[workshop];
          const dist = calculateDistance(latitude, longitude, workshopLoc.lat, workshopLoc.lng);
          setDistance(dist.toFixed(2));
          setIsLoadingLocation(false);
          toast({ title: "✅ تم تحديد الموقع", description: `المسافة: ${dist.toFixed(2)} كم` });
        },
        () => {
          setIsLoadingLocation(false);
          toast({ title: "❌ خطأ", description: "تعذر الوصول إلى موقعك. تأكد من تفعيل GPS" });
        }
      );
    }
  };

  // Calculate price
  const handleCalculate = async () => {
    if (!selectedBrand || !selectedModel || !selectedPart) {
      toast({ title: "❌ خطأ", description: "يرجى اختيار الماركة والموديل والقطعة" });
      return;
    }

    try {
      const result = await new Promise<PriceResult>((resolve, reject) => {
        calculatePriceMutation.mutate(
          {
            modelId: selectedModel,
            partId: selectedPart,
            distance: parseFloat(distance),
          },
          {
            onSuccess: resolve,
            onError: reject,
          }
        );
      });

      const brandName = brands?.find((b) => b.id === selectedBrand)?.nameAr || "";
      const modelName = models?.find((m) => m.id === selectedModel)?.nameAr || "";
      const partName = parts?.find((p) => p.id === selectedPart)?.nameAr || "";
      const serviceName = services?.find((s) => s.id === selectedService)?.serviceTypeName || "";
      const variantName = variants?.find((v) => v.id === selectedVariant)?.variantName || "";

      const newItem: CalculationItem = {
        id: Math.random().toString(36).substr(2, 9),
        brandId: selectedBrand,
        brandName,
        modelId: selectedModel,
        modelName,
        partId: selectedPart,
        partName,
        serviceId: selectedService || undefined,
        serviceName: serviceName || undefined,
        variantId: selectedVariant || undefined,
        variantName: variantName || undefined,
        distance: parseFloat(distance),
        result,
        timestamp: new Date(),
      };

      setCalculationItems([...calculationItems, newItem]);
      toast({ title: "✅ تم الحساب", description: `السعر الإجمالي: ${result.totalCost} ريال` });
    } catch (error) {
      toast({ title: "❌ خطأ", description: "حدث خطأ في حساب السعر" });
    }
  };

  // Remove calculation
  const handleRemoveCalculation = (id: string) => {
    setCalculationItems(calculationItems.filter((item) => item.id !== id));
  };

  // Save calculation
  const handleSaveCalculation = () => {
    if (!calculationName.trim()) {
      toast({ title: "❌ خطأ", description: "يرجى إدخال اسم للحساب" });
      return;
    }

    const totalCost = calculationItems.reduce((sum, item) => sum + (item.result.totalCost || 0), 0);
    const saved: SavedCalculation = {
      id: Math.random().toString(36).substr(2, 9),
      name: calculationName,
      date: new Date().toLocaleDateString("ar-SA"),
      items: calculationItems,
      totalCost,
    };

    setSavedCalculations([...savedCalculations, saved]);
    setCalculationName("");
    setShowSaveDialog(false);
    toast({ title: "✅ تم الحفظ", description: `تم حفظ الحساب: ${calculationName}` });
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (calculationItems.length === 0) {
      toast({ title: "❌ خطأ", description: "لا توجد عمليات حسابية للتصدير" });
      return;
    }

    const headers = ["الماركة", "الموديل", "القطعة", "الخدمة", "المتغير", "المسافة (كم)", "سعر القطعة", "تكلفة العمل", "تكلفة المسافة", "الإجمالي"];
    const rows = calculationItems.map((item) => [
      item.brandName,
      item.modelName,
      item.partName,
      item.serviceName || "-",
      item.variantName || "-",
      item.distance,
      item.result.partPrice || "-",
      item.result.laborCost || "-",
      item.result.distanceCost || "-",
      item.result.totalCost || "-",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `حسابات_الأسعار_${new Date().toLocaleDateString("ar-SA")}.csv`;
    link.click();
    toast({ title: "✅ تم التصدير", description: "تم تصدير الحسابات إلى ملف CSV" });
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calculator className="w-8 h-8 text-yellow-500" />
            <h1 className="text-4xl font-bold text-slate-900">حاسبة الأسعار المتقدمة</h1>
          </div>
          <p className="text-slate-600">احسب أسعار الخدمات والقطع بدقة مع دعم متغيرات متعددة وخدمات متنوعة</p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={viewMode === "calculator" ? "default" : "outline"}
            onClick={() => setViewMode("calculator")}
            className="gap-2"
          >
            <Calculator className="w-4 h-4" />
            حاسبة الأسعار
          </Button>
          <Button
            variant={viewMode === "history" ? "default" : "outline"}
            onClick={() => setViewMode("history")}
            className="gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            السجل ({savedCalculations.length})
          </Button>
          <Button
            variant={viewMode === "comparison" ? "default" : "outline"}
            onClick={() => setViewMode("comparison")}
            className="gap-2"
          >
            <TrendingDown className="w-4 h-4" />
            المقارنة
          </Button>
        </div>

        {viewMode === "calculator" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Panel */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-20">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-yellow-500" />
                  بيانات الحساب
                </h2>

                {/* Brand Selection */}
                <div className="mb-4">
                  <Label className="text-sm font-semibold mb-2 block">الماركة</Label>
                  <Select value={selectedBrand?.toString() || ""} onValueChange={(v) => setSelectedBrand(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الماركة" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands?.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id.toString()}>
                          {brand.nameAr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Model Selection */}
                <div className="mb-4">
                  <Label className="text-sm font-semibold mb-2 block">الموديل</Label>
                  <Select value={selectedModel?.toString() || ""} onValueChange={(v) => setSelectedModel(parseInt(v))}>
                    <SelectTrigger disabled={!selectedBrand}>
                      <SelectValue placeholder="اختر الموديل" />
                    </SelectTrigger>
                    <SelectContent>
                      {models?.map((model) => (
                        <SelectItem key={model.id} value={model.id.toString()}>
                          {model.nameAr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Year Selection */}
                <div className="mb-4">
                  <Label className="text-sm font-semibold mb-2 block">السنة (اختياري)</Label>
                  <Select value={selectedYear?.toString() || ""} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر السنة" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 35 }, (_, i) => 2025 - i).map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Part Selection */}
                <div className="mb-4">
                  <Label className="text-sm font-semibold mb-2 block">القطعة</Label>
                  <Select value={selectedPart?.toString() || ""} onValueChange={(v) => setSelectedPart(parseInt(v))}>
                    <SelectTrigger disabled={!selectedModel}>
                      <SelectValue placeholder="اختر القطعة" />
                    </SelectTrigger>
                    <SelectContent>
                      {parts?.map((part) => (
                        <SelectItem key={part.id} value={part.id.toString()}>
                          {part.nameAr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Service Selection */}
                {services && services.length > 0 && (
                  <div className="mb-4">
                    <Label className="text-sm font-semibold mb-2 block">الخدمة</Label>
                    <Select value={selectedService?.toString() || ""} onValueChange={(v) => setSelectedService(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الخدمة" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id.toString()}>
                            {service.serviceTypeName} ({service.minHours}-{service.maxHours}h)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Variant Selection */}
                {variants && variants.length > 0 && (
                  <div className="mb-4">
                    <Label className="text-sm font-semibold mb-2 block">نوع القطعة</Label>
                    <Select value={selectedVariant?.toString() || ""} onValueChange={(v) => setSelectedVariant(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر النوع" />
                      </SelectTrigger>
                      <SelectContent>
                        {variants.map((variant) => (
                          <SelectItem key={variant.id} value={variant.id.toString()}>
                            {variant.variantName} - {variant.price} ريال
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Distance */}
                <div className="mb-4">
                  <Label className="text-sm font-semibold mb-2 block">المسافة (كم)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      placeholder="15"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGetLocation}
                      disabled={isLoadingLocation}
                      className="gap-1"
                    >
                      {isLoadingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Workshop Selection */}
                <div className="mb-6">
                  <Label className="text-sm font-semibold mb-2 block">الورشة</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={workshop === "makkah" ? "default" : "outline"}
                      onClick={() => setWorkshop("makkah")}
                      className="flex-1"
                    >
                      مكة
                    </Button>
                    <Button
                      variant={workshop === "jeddah" ? "default" : "outline"}
                      onClick={() => setWorkshop("jeddah")}
                      className="flex-1"
                    >
                      جدة
                    </Button>
                  </div>
                </div>

                {/* Calculate Button */}
                <Button
                  onClick={handleCalculate}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 gap-2"
                >
                  <Calculator className="w-5 h-5" />
                  احسب السعر
                </Button>
              </Card>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-2">
              {calculationItems.length === 0 ? (
                <Card className="p-12 text-center">
                  <Calculator className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg">لم يتم إجراء أي حسابات بعد</p>
                  <p className="text-slate-400 text-sm">اختر الماركة والموديل والقطعة ثم اضغط "احسب السعر"</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {calculationItems.map((item) => (
                    <Card key={item.id} className="p-6 border-l-4 border-l-yellow-500">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">
                            {item.brandName} {item.modelName}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {item.partName}
                            {item.serviceName && ` - ${item.serviceName}`}
                            {item.variantName && ` (${item.variantName})`}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCalculation(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-xs text-slate-600 mb-1">ساعات العمل</p>
                          <p className="text-lg font-bold text-blue-600">{item.result.hours?.toFixed(2)} ساعة</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-xs text-slate-600 mb-1">تكلفة العمل</p>
                          <p className="text-lg font-bold text-green-600">{item.result.laborCost?.toFixed(0)} ريال</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <p className="text-xs text-slate-600 mb-1">تكلفة المسافة</p>
                          <p className="text-lg font-bold text-purple-600">{item.result.distanceCost?.toFixed(0)} ريال</p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <p className="text-xs text-slate-600 mb-1">سعر القطعة</p>
                          <p className="text-lg font-bold text-orange-600">{item.result.partPrice?.toFixed(0)} ريال</p>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg">
                        <p className="text-sm text-slate-600 mb-1">الإجمالي</p>
                        <p className="text-3xl font-bold text-yellow-600">{item.result.totalCost?.toFixed(0)} ريال</p>
                        <p className="text-xs text-slate-500 mt-2">المسافة: {item.distance} كم</p>
                      </div>
                    </Card>
                  ))}

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => setShowSaveDialog(true)}
                      className="gap-2 bg-green-500 hover:bg-green-600"
                    >
                      <Save className="w-4 h-4" />
                      حفظ الحساب
                    </Button>
                    <Button
                      onClick={handleExportCSV}
                      variant="outline"
                      className="gap-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                      تصدير CSV
                    </Button>
                    <Button
                      onClick={handlePrint}
                      variant="outline"
                      className="gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      طباعة
                    </Button>
                  </div>

                  {/* Total Summary */}
                  <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">الإجمالي الكلي</p>
                        <p className="text-3xl font-bold text-yellow-600">
                          {calculationItems.reduce((sum, item) => sum + (item.result.totalCost || 0), 0).toFixed(0)} ريال
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600 mb-1">عدد الحسابات</p>
                        <p className="text-2xl font-bold text-slate-900">{calculationItems.length}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === "history" && (
          <div className="space-y-4">
            {savedCalculations.length === 0 ? (
              <Card className="p-12 text-center">
                <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">لا توجد حسابات محفوظة</p>
              </Card>
            ) : (
              savedCalculations.map((calc) => (
                <Card key={calc.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold">{calc.name}</h3>
                      <p className="text-sm text-slate-600">{calc.date}</p>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">{calc.totalCost.toFixed(0)} ريال</p>
                  </div>
                  <p className="text-sm text-slate-600">عدد الحسابات: {calc.items.length}</p>
                </Card>
              ))
            )}
          </div>
        )}

        {viewMode === "comparison" && (
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-yellow-500" />
              مقارنة الأسعار
            </h2>
            <p className="text-slate-600 text-center py-12">
              سيتم عرض مقارنة الأسعار بين مير والورش التقليدية هنا
            </p>
          </Card>
        )}

        {/* Save Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">حفظ الحساب</h3>
              <Input
                placeholder="أدخل اسم الحساب"
                value={calculationName}
                onChange={(e) => setCalculationName(e.target.value)}
                className="mb-4"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveCalculation}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  حفظ
                </Button>
                <Button
                  onClick={() => setShowSaveDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
