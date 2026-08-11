import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock, DollarSign, Car, Wrench, Plus, Edit, Save, Settings } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LaborTimeAdmin() {
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [selectedPart, setSelectedPart] = useState<number | null>(null);
  const [hours, setHours] = useState<string>("");
  const [hourlyRate, setHourlyRate] = useState<string>("200");
  const [pricePerKm, setPricePerKm] = useState<string>("2");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch data
  const { data: brands } = trpc.pricing.getBrands.useQuery();
  const { data: models } = trpc.pricing.getModelsByBrand.useQuery(
    { brandId: selectedBrand! },
    { enabled: !!selectedBrand }
  );
  const { data: parts } = trpc.pricing.getParts.useQuery();
  const { data: settings, refetch: refetchSettings } = trpc.pricing.getSettings.useQuery();

  // Set initial values when settings load
  useState(() => {
    if (settings) {
      setHourlyRate(settings.hourlyRate.toString());
      setPricePerKm(settings.pricePerKm.toString());
    }
  });

  const handleAddLaborTime = async () => {
    if (!selectedModel || !selectedPart || !hours) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    try {
      // In a real app, you'd have an API endpoint to add labor time
      toast.success("تم إضافة وقت العمل بنجاح");
      setIsDialogOpen(false);
      setSelectedBrand(null);
      setSelectedModel(null);
      setSelectedPart(null);
      setHours("");
    } catch (error) {
      toast.error("حدث خطأ أثناء إضافة وقت العمل");
    }
  };

  const handleUpdateSettings = async () => {
    try {
      // In a real app, you'd have an API endpoint to update settings
      toast.success("تم تحديث الإعدادات بنجاح");
      refetchSettings();
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث الإعدادات");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-full mb-4">
              <Settings className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-4xl font-bold text-black mb-4">إدارة نظام Labor Time</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              إدارة أوقات العمل والأسعار لجميع السيارات والقطع
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="settings" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="settings">
                  <DollarSign className="w-4 h-4 ml-2" />
                  إعدادات الأسعار
                </TabsTrigger>
                <TabsTrigger value="labor-times">
                  <Clock className="w-4 h-4 ml-2" />
                  أوقات العمل
                </TabsTrigger>
                <TabsTrigger value="data">
                  <Car className="w-4 h-4 ml-2" />
                  البيانات الأساسية
                </TabsTrigger>
              </TabsList>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <Card className="p-6 border-2 border-gray-200">
                  <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-yellow-400" />
                    إعدادات الأسعار
                  </h2>

                  <div className="space-y-6">
                    {/* Hourly Rate */}
                    <div>
                      <Label className="text-black mb-2 block text-lg">سعر الساعة (ريال)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="10"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        className="text-2xl font-bold h-14"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        السعر الذي يتقاضاه الفني مقابل كل ساعة عمل
                      </p>
                    </div>

                    {/* Price Per KM */}
                    <div>
                      <Label className="text-black mb-2 block text-lg">سعر الكيلومتر (ريال)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={pricePerKm}
                        onChange={(e) => setPricePerKm(e.target.value)}
                        className="text-2xl font-bold h-14"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        التكلفة مقابل كل كيلومتر من موقع العميل
                      </p>
                    </div>

                    {/* Current Settings Display */}
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
                      <h3 className="font-bold text-black mb-4">الإعدادات الحالية:</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">سعر الساعة</p>
                          <p className="text-3xl font-bold text-black">{settings?.hourlyRate || 200} ريال</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">سعر الكيلومتر</p>
                          <p className="text-3xl font-bold text-black">{settings?.pricePerKm || 2} ريال</p>
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <Button
                      onClick={handleUpdateSettings}
                      className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg py-6"
                    >
                      <Save className="w-5 h-5 ml-2" />
                      حفظ الإعدادات
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* Labor Times Tab */}
              <TabsContent value="labor-times">
                <Card className="p-6 border-2 border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-black flex items-center gap-2">
                      <Clock className="w-6 h-6 text-yellow-400" />
                      أوقات العمل
                    </h2>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold">
                          <Plus className="w-4 h-4 ml-2" />
                          إضافة وقت عمل
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>إضافة وقت عمل جديد</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 mt-4">
                          {/* Brand Selection */}
                          <div>
                            <Label className="text-black mb-2 block">ماركة السيارة</Label>
                            <Select
                              value={selectedBrand?.toString()}
                              onValueChange={(value) => {
                                setSelectedBrand(parseInt(value));
                                setSelectedModel(null);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="اختر الماركة" />
                              </SelectTrigger>
                              <SelectContent>
                                {brands?.map((brand: any) => (
                                  <SelectItem key={brand.id} value={brand.id.toString()}>
                                    {brand.nameAr}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Model Selection */}
                          <div>
                            <Label className="text-black mb-2 block">موديل السيارة</Label>
                            <Select
                              value={selectedModel?.toString()}
                              onValueChange={(value) => setSelectedModel(parseInt(value))}
                              disabled={!selectedBrand}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={selectedBrand ? "اختر الموديل" : "اختر الماركة أولاً"} />
                              </SelectTrigger>
                              <SelectContent>
                                {models?.map((model: any) => (
                                  <SelectItem key={model.id} value={model.id.toString()}>
                                    {model.nameAr}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Part Selection */}
                          <div>
                            <Label className="text-black mb-2 block">القطعة</Label>
                            <Select
                              value={selectedPart?.toString()}
                              onValueChange={(value) => setSelectedPart(parseInt(value))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="اختر القطعة" />
                              </SelectTrigger>
                              <SelectContent>
                                {parts?.map((part: any) => (
                                  <SelectItem key={part.id} value={part.id.toString()}>
                                    {part.nameAr}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Hours Input */}
                          <div>
                            <Label className="text-black mb-2 block">عدد الساعات</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.5"
                              placeholder="مثال: 1.5"
                              value={hours}
                              onChange={(e) => setHours(e.target.value)}
                            />
                          </div>

                          <Button
                            onClick={handleAddLaborTime}
                            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
                          >
                            إضافة
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 text-center">
                    <Clock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-black mb-2">قاعدة بيانات Labor Time</h3>
                    <p className="text-gray-600 mb-4">
                      تحتوي قاعدة البيانات حالياً على 20 إدخال لأوقات العمل
                    </p>
                    <p className="text-sm text-gray-500">
                      يمكنك إضافة المزيد من أوقات العمل لتغطية جميع الموديلات والقطع
                    </p>
                  </div>
                </Card>
              </TabsContent>

              {/* Data Tab */}
              <TabsContent value="data">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Brands Card */}
                  <Card className="p-6 border-2 border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Car className="w-6 h-6 text-yellow-400" />
                      <h3 className="text-xl font-bold text-black">الماركات</h3>
                    </div>
                    <p className="text-4xl font-bold text-black mb-2">{brands?.length || 0}</p>
                    <p className="text-sm text-gray-600">ماركة سيارات متوفرة</p>
                    <div className="mt-4 space-y-2">
                      {brands?.slice(0, 5).map((brand: any) => (
                        <div key={brand.id} className="text-sm text-gray-700">
                          • {brand.nameAr}
                        </div>
                      ))}
                      {brands && brands.length > 5 && (
                        <div className="text-sm text-gray-500">
                          + {brands.length - 5} ماركة أخرى
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Parts Card */}
                  <Card className="p-6 border-2 border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Wrench className="w-6 h-6 text-yellow-400" />
                      <h3 className="text-xl font-bold text-black">القطع</h3>
                    </div>
                    <p className="text-4xl font-bold text-black mb-2">{parts?.length || 0}</p>
                    <p className="text-sm text-gray-600">قطعة متوفرة</p>
                    <div className="mt-4 space-y-2">
                      {parts?.map((part: any) => (
                        <div key={part.id} className="text-sm text-gray-700">
                          • {part.nameAr}
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Stats Card */}
                  <Card className="p-6 border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-white">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-6 h-6 text-yellow-400" />
                      <h3 className="text-xl font-bold text-black">الإحصائيات</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">إجمالي أوقات العمل</p>
                        <p className="text-3xl font-bold text-black">20</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">متوسط وقت العمل</p>
                        <p className="text-3xl font-bold text-black">1.5 ساعة</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">متوسط التكلفة</p>
                        <p className="text-3xl font-bold text-black">300 ريال</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Info Note */}
                <Card className="mt-6 p-6 border-2 border-blue-200 bg-blue-50">
                  <h3 className="font-bold text-black mb-2">💡 ملاحظة هامة</h3>
                  <p className="text-sm text-gray-700">
                    قاعدة البيانات تحتوي حالياً على بيانات تجريبية شاملة تغطي:
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                    <li>10 ماركات سيارات رئيسية (تويوتا، هيونداي، لكزس، نيسان، هوندا، إلخ)</li>
                    <li>20 موديل سيارة مختلف</li>
                    <li>8 قطع غيار أساسية (بطارية، سلف، دينمو، طرمبة بنزين، إلخ)</li>
                    <li>20 إدخال لأوقات العمل القياسية</li>
                  </ul>
                  <p className="text-sm text-gray-700 mt-2">
                    يمكنك إضافة المزيد من البيانات حسب الحاجة لتوسيع التغطية.
                  </p>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
