import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Download, 
  Upload, 
  Plus, 
  Edit2, 
  Save, 
  X,
  Clock,
  Car,
  Wrench,
  Copy,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LaborTime {
  id: number;
  brandId: number | null;
  brandName: string | null;
  modelId: number;
  modelName: string | null;
  partId: number;
  partName: string | null;
  hours: string;
}

export default function LaborTimesAdvanced() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedPart, setSelectedPart] = useState<string>("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  // Add form state
  const [addForm, setAddForm] = useState({ brandId: "", modelId: "", partId: "", hours: "", notes: "" });
  // Copy form state
  const [copyForm, setCopyForm] = useState({ fromBrandId: "", fromModelId: "", toBrandId: "", toModelId: "" });

  // Queries
  const { data: laborTimes, isLoading, refetch } = trpc.pricing.getAllLaborTimes.useQuery();
  const { data: brands } = trpc.pricing.getBrands.useQuery();
  const { data: parts } = trpc.pricing.getParts.useQuery();
  const { data: addModels } = trpc.pricing.getModelsByBrand.useQuery(
    { brandId: parseInt(addForm.brandId) },
    { enabled: !!addForm.brandId }
  );
  const { data: copyFromModels } = trpc.pricing.getModelsByBrand.useQuery(
    { brandId: parseInt(copyForm.fromBrandId) },
    { enabled: !!copyForm.fromBrandId }
  );
  const { data: copyToModels } = trpc.pricing.getModelsByBrand.useQuery(
    { brandId: parseInt(copyForm.toBrandId) },
    { enabled: !!copyForm.toBrandId }
  );

  // Mutations
  const updateMutation = trpc.pricing.updateLaborTime.useMutation({
    onSuccess: () => {
      toast({ title: "تم التحديث بنجاح" });
      setEditingId(null);
      refetch();
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const createMutation = trpc.pricing.createLaborTime.useMutation({
    onSuccess: () => {
      toast({ title: "تم الإضافة بنجاح" });
      setIsAddDialogOpen(false);
      setAddForm({ brandId: "", modelId: "", partId: "", hours: "", notes: "" });
      refetch();
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = trpc.pricing.deleteLaborTime.useMutation({
    onSuccess: () => {
      toast({ title: "تم الحذف بنجاح" });
      refetch();
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const copyMutation = trpc.pricing.copyLaborTimes.useMutation({
    onSuccess: (data: any) => {
      toast({ title: data.success ? "تم النسخ بنجاح" : "خطأ", description: data.message, variant: data.success ? "default" : "destructive" });
      if (data.success) {
        setIsCopyDialogOpen(false);
        setCopyForm({ fromBrandId: "", fromModelId: "", toBrandId: "", toModelId: "" });
        refetch();
      }
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const bulkCreateMutation = trpc.pricing.bulkCreateLaborTimes.useMutation({
    onSuccess: (data: any) => {
      toast({ title: data.success ? "تم الاستيراد بنجاح" : "خطأ", description: data.message, variant: data.success ? "default" : "destructive" });
      if (data.success) {
        setIsImportDialogOpen(false);
        refetch();
      }
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  // Filter
  const filteredData = useMemo(() => {
    return laborTimes?.filter((item: LaborTime) => {
      const matchesSearch = 
        (item.brandName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (item.modelName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (item.partName?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesBrand = selectedBrand === "all" || (item.brandId !== null && item.brandId === parseInt(selectedBrand));
      const matchesPart = selectedPart === "all" || item.partId === parseInt(selectedPart);
      return matchesSearch && matchesBrand && matchesPart;
    }) || [];
  }, [laborTimes, searchQuery, selectedBrand, selectedPart]);

  // Handlers
  const handleEdit = (item: LaborTime) => {
    setEditingId(item.id);
    setEditValue(item.hours);
  };

  const handleSave = async (id: number) => {
    if (!editValue || parseFloat(editValue) <= 0) {
      toast({ title: "خطأ", description: "يرجى إدخال قيمة صحيحة", variant: "destructive" });
      return;
    }
    await updateMutation.mutateAsync({ id, hours: editValue });
  };

  const handleAdd = async () => {
    if (!addForm.modelId || !addForm.partId || !addForm.hours) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
    await createMutation.mutateAsync({
      modelId: parseInt(addForm.modelId),
      partId: parseInt(addForm.partId),
      hours: addForm.hours,
      notes: addForm.notes || undefined,
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف وقت العمل هذا؟")) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const handleCopy = async () => {
    if (!copyForm.fromModelId || !copyForm.toModelId) {
      toast({ title: "خطأ", description: "يرجى اختيار الموديل المصدر والموديل الهدف", variant: "destructive" });
      return;
    }
    await copyMutation.mutateAsync({
      fromModelId: parseInt(copyForm.fromModelId),
      toModelId: parseInt(copyForm.toModelId),
    });
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      // Skip header
      const dataLines = lines.slice(1);
      const items: { modelId: number; partId: number; hours: string; notes?: string }[] = [];

      for (const line of dataLines) {
        const cols = line.split(',');
        if (cols.length >= 3) {
          const modelId = parseInt(cols[0]?.trim());
          const partId = parseInt(cols[1]?.trim());
          const hours = cols[2]?.trim();
          const notes = cols[3]?.trim() || undefined;
          if (!isNaN(modelId) && !isNaN(partId) && hours) {
            items.push({ modelId, partId, hours, notes });
          }
        }
      }

      if (items.length === 0) {
        toast({ title: "خطأ", description: "لم يتم العثور على بيانات صالحة في الملف", variant: "destructive" });
        return;
      }

      bulkCreateMutation.mutate({ items });
    };
    reader.readAsText(file);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!filteredData.length) {
      toast({ title: "تنبيه", description: "لا توجد بيانات للتصدير", variant: "destructive" });
      return;
    }
    const headers = ["modelId", "partId", "hours", "الماركة", "الموديل", "القطعة"];
    const rows = filteredData.map((item: LaborTime) => [
      item.modelId, item.partId, item.hours, item.brandName, item.modelName, item.partName,
    ]);
    const csvContent = [headers.join(","), ...rows.map((row: any) => row.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `labor_times_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast({ title: "تم التصدير بنجاح" });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* العنوان */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-500" />
            إدارة أوقات العمل
          </h1>
          <p className="text-muted-foreground mt-1">إدارة شاملة لجميع أوقات العمل القياسية</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
                <Plus className="w-4 h-4 ml-2" />
                إضافة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة وقت عمل جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>الماركة</Label>
                  <Select value={addForm.brandId} onValueChange={(v) => setAddForm({ ...addForm, brandId: v, modelId: "" })}>
                    <SelectTrigger><SelectValue placeholder="اختر الماركة" /></SelectTrigger>
                    <SelectContent>
                      {brands?.map((b: any) => (
                        <SelectItem key={b.id} value={b.id.toString()}>{b.nameAr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>الموديل</Label>
                  <Select value={addForm.modelId} onValueChange={(v) => setAddForm({ ...addForm, modelId: v })} disabled={!addForm.brandId}>
                    <SelectTrigger><SelectValue placeholder="اختر الموديل" /></SelectTrigger>
                    <SelectContent>
                      {addModels?.map((m: any) => (
                        <SelectItem key={m.id} value={m.id.toString()}>{m.nameAr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>القطعة</Label>
                  <Select value={addForm.partId} onValueChange={(v) => setAddForm({ ...addForm, partId: v })}>
                    <SelectTrigger><SelectValue placeholder="اختر القطعة" /></SelectTrigger>
                    <SelectContent>
                      {parts?.map((p: any) => (
                        <SelectItem key={p.id} value={p.id.toString()}>{p.nameAr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ساعات العمل</Label>
                  <Input type="number" step="0.25" min="0.25" value={addForm.hours} onChange={(e) => setAddForm({ ...addForm, hours: e.target.value })} placeholder="مثال: 1.5" />
                </div>
                <div className="space-y-2">
                  <Label>ملاحظات (اختياري)</Label>
                  <Input value={addForm.notes} onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })} placeholder="ملاحظات إضافية" />
                </div>
                <Button onClick={handleAdd} disabled={createMutation.isPending} className="w-full bg-yellow-400 hover:bg-yellow-500 text-black">
                  {createMutation.isPending ? "جاري الإضافة..." : "إضافة"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Copy className="w-4 h-4 ml-2" />
                نسخ
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>نسخ أوقات العمل من موديل لآخر</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">سيتم نسخ جميع أوقات العمل من الموديل المصدر إلى الموديل الهدف</p>
                <div className="space-y-2">
                  <Label>ماركة المصدر</Label>
                  <Select value={copyForm.fromBrandId} onValueChange={(v) => setCopyForm({ ...copyForm, fromBrandId: v, fromModelId: "" })}>
                    <SelectTrigger><SelectValue placeholder="اختر الماركة" /></SelectTrigger>
                    <SelectContent>
                      {brands?.map((b: any) => (
                        <SelectItem key={b.id} value={b.id.toString()}>{b.nameAr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>موديل المصدر</Label>
                  <Select value={copyForm.fromModelId} onValueChange={(v) => setCopyForm({ ...copyForm, fromModelId: v })} disabled={!copyForm.fromBrandId}>
                    <SelectTrigger><SelectValue placeholder="اختر الموديل" /></SelectTrigger>
                    <SelectContent>
                      {copyFromModels?.map((m: any) => (
                        <SelectItem key={m.id} value={m.id.toString()}>{m.nameAr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ماركة الهدف</Label>
                  <Select value={copyForm.toBrandId} onValueChange={(v) => setCopyForm({ ...copyForm, toBrandId: v, toModelId: "" })}>
                    <SelectTrigger><SelectValue placeholder="اختر الماركة" /></SelectTrigger>
                    <SelectContent>
                      {brands?.map((b: any) => (
                        <SelectItem key={b.id} value={b.id.toString()}>{b.nameAr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>موديل الهدف</Label>
                  <Select value={copyForm.toModelId} onValueChange={(v) => setCopyForm({ ...copyForm, toModelId: v })} disabled={!copyForm.toBrandId}>
                    <SelectTrigger><SelectValue placeholder="اختر الموديل" /></SelectTrigger>
                    <SelectContent>
                      {copyToModels?.map((m: any) => (
                        <SelectItem key={m.id} value={m.id.toString()}>{m.nameAr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCopy} disabled={copyMutation.isPending} className="w-full bg-yellow-400 hover:bg-yellow-500 text-black">
                  {copyMutation.isPending ? "جاري النسخ..." : "نسخ أوقات العمل"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 ml-2" />
                استيراد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>استيراد أوقات العمل من CSV</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  صيغة الملف: modelId, partId, hours, notes (اختياري)
                  <br />
                  السطر الأول يجب أن يكون عناوين الأعمدة
                </p>
                <Input type="file" accept=".csv" onChange={handleImportCSV} />
                {bulkCreateMutation.isPending && <p className="text-sm text-yellow-600">جاري الاستيراد...</p>}
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={handleExportCSV} variant="outline">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي السجلات</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{laborTimes?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عدد الماركات</CardTitle>
            <Car className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{brands?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عدد القطع</CardTitle>
            <Wrench className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parts?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* البحث والفلترة */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والفلترة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>البحث</Label>
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن ماركة، موديل أو قطعة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>الماركة</Label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger><SelectValue placeholder="جميع الماركات" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الماركات</SelectItem>
                  {brands?.map((brand: any) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>{brand.nameAr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>القطعة</Label>
              <Select value={selectedPart} onValueChange={setSelectedPart}>
                <SelectTrigger><SelectValue placeholder="جميع القطع" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع القطع</SelectItem>
                  {parts?.map((part: any) => (
                    <SelectItem key={part.id} value={part.id.toString()}>{part.nameAr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            عرض {filteredData.length} من {laborTimes?.length || 0} سجل
          </div>
        </CardContent>
      </Card>

      {/* الجدول */}
      <Card>
        <CardHeader>
          <CardTitle>جدول أوقات العمل</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3 font-semibold">#</th>
                  <th className="text-right p-3 font-semibold">الماركة</th>
                  <th className="text-right p-3 font-semibold">الموديل</th>
                  <th className="text-right p-3 font-semibold">القطعة</th>
                  <th className="text-right p-3 font-semibold">ساعات العمل</th>
                  <th className="text-right p-3 font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item: LaborTime, index: number) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{item.brandName}</td>
                    <td className="p-3">{item.modelName}</td>
                    <td className="p-3">{item.partName}</td>
                    <td className="p-3">
                      {editingId === item.id ? (
                        <Input type="number" step="0.25" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-24" autoFocus />
                      ) : (
                        <span className="font-semibold">{item.hours} ساعة</span>
                      )}
                    </td>
                    <td className="p-3">
                      {editingId === item.id ? (
                        <div className="flex gap-1">
                          <Button size="sm" onClick={() => handleSave(item.id)} disabled={updateMutation.isPending}>
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredData.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                لا توجد نتائج مطابقة للبحث
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
