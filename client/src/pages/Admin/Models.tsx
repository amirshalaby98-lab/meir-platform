import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "../../lib/trpc";
import { Car, Plus, Edit, Trash2, Image, ToggleLeft, ToggleRight, Search, ArrowRight } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useToast } from "../../hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";

export default function ModelsManagement() {
  const { toast } = useToast();
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1]);
  const brandIdParam = urlParams.get('brandId');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingModel, setEditingModel] = useState<any>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(brandIdParam ? parseInt(brandIdParam) : null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({ 
    brandId: brandIdParam ? parseInt(brandIdParam) : 0,
    name: "", 
    nameAr: "",
    image: "",
    yearFrom: "",
    yearTo: ""
  });

  const { data: brands } = trpc.carData.getCarBrands.useQuery();
  const { data: models, refetch } = trpc.carData.getCarModels.useQuery();
  const createModel = trpc.carData.createCarModel.useMutation();
  const updateModel = trpc.carData.updateCarModel.useMutation();
  const deleteModel = trpc.carData.deleteCarModel.useMutation();

  const filteredModels = (selectedBrandId 
    ? models?.filter((m: any) => m.brandId === selectedBrandId)
    : models
  )?.filter((m: any) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.nameAr.includes(searchQuery)
  ) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        brandId: formData.brandId,
        name: formData.name,
        nameAr: formData.nameAr,
        image: formData.image || undefined,
        yearFrom: formData.yearFrom ? parseInt(formData.yearFrom) : undefined,
        yearTo: formData.yearTo ? parseInt(formData.yearTo) : undefined,
      };

      if (editingModel) {
        await updateModel.mutateAsync({ id: editingModel.id, ...data });
        toast({ title: "تم التحديث", description: "تم تحديث الموديل بنجاح" });
      } else {
        await createModel.mutateAsync(data);
        toast({ title: "تم الإضافة", description: "تم إضافة الموديل بنجاح" });
      }
      resetForm();
      refetch();
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ أثناء الحفظ" });
    }
  };

  const resetForm = () => {
    setFormData({ brandId: selectedBrandId || 0, name: "", nameAr: "", image: "", yearFrom: "", yearTo: "" });
    setShowAddForm(false);
    setEditingModel(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الموديل؟")) return;
    try {
      await deleteModel.mutateAsync({ id });
      toast({ title: "تم الحذف", description: "تم حذف الموديل بنجاح" });
      refetch();
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ أثناء الحذف" });
    }
  };

  const handleEdit = (model: any) => {
    setEditingModel(model);
    setFormData({ 
      brandId: model.brandId,
      name: model.name, 
      nameAr: model.nameAr,
      image: model.image || "",
      yearFrom: model.yearFrom?.toString() || "",
      yearTo: model.yearTo?.toString() || ""
    });
    setShowAddForm(true);
  };

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    try {
      await updateModel.mutateAsync({ id, isActive: !currentActive });
      toast({ title: !currentActive ? "تم التفعيل" : "تم التعطيل" });
      refetch();
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ" });
    }
  };

  const getBrandName = (brandId: number) => {
    return brands?.find((b: any) => b.id === brandId)?.nameAr || "";
  };

  const selectedBrandName = selectedBrandId ? getBrandName(selectedBrandId) : null;
  const activeModels = models?.filter((m: any) => m.isActive !== false) || [];
  const inactiveModels = models?.filter((m: any) => m.isActive === false) || [];

  return (
    <AdminLayout title={selectedBrandName ? `موديلات ${selectedBrandName}` : "إدارة الموديلات"} description="إضافة وتعديل وحذف موديلات السيارات">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-sm text-gray-500">إجمالي الموديلات</p>
            <p className="text-2xl font-bold text-gray-900">{models?.length || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-sm text-gray-500">موديلات نشطة</p>
            <p className="text-2xl font-bold text-green-600">{activeModels.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-sm text-gray-500">موديلات معطلة</p>
            <p className="text-2xl font-bold text-red-600">{inactiveModels.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-sm text-gray-500">معروضة حالياً</p>
            <p className="text-2xl font-bold text-blue-600">{filteredModels.length}</p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Brand Filter */}
            <div className="w-full sm:w-56">
              <Select value={selectedBrandId?.toString() || "all"} onValueChange={(v) => setSelectedBrandId(v === "all" ? null : parseInt(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="فلترة حسب الماركة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الماركات</SelectItem>
                  {brands?.map((brand: any) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.nameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="ابحث عن موديل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/brands">
              <Button variant="outline" className="gap-2">
                <ArrowRight className="w-4 h-4" />
                الماركات
              </Button>
            </Link>
            <Button onClick={() => { setShowAddForm(true); setEditingModel(null); setFormData({ brandId: selectedBrandId || 0, name: "", nameAr: "", image: "", yearFrom: "", yearTo: "" }); }} className="gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold">
              <Plus className="w-4 h-4" />
              إضافة موديل
            </Button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-yellow-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingModel ? "تعديل الموديل" : "إضافة موديل جديد"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="brandId">الماركة *</Label>
                  <Select value={formData.brandId.toString()} onValueChange={(v) => setFormData({ ...formData, brandId: parseInt(v) })}>
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
                <div>
                  <Label htmlFor="nameAr">الاسم بالعربية *</Label>
                  <Input
                    id="nameAr"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    placeholder="كامري"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name">الاسم بالإنجليزية *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Camry"
                    dir="ltr"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="image">رابط الصورة (اختياري)</Label>
                  <Input
                    id="image"
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://..."
                    dir="ltr"
                  />
                </div>
                <div>
                  <Label htmlFor="yearFrom">سنة البداية (اختياري)</Label>
                  <Input
                    id="yearFrom"
                    type="number"
                    value={formData.yearFrom}
                    onChange={(e) => setFormData({ ...formData, yearFrom: e.target.value })}
                    placeholder="2020"
                    min="1900"
                    max="2100"
                  />
                </div>
                <div>
                  <Label htmlFor="yearTo">سنة النهاية (اختياري)</Label>
                  <Input
                    id="yearTo"
                    type="number"
                    value={formData.yearTo}
                    onChange={(e) => setFormData({ ...formData, yearTo: e.target.value })}
                    placeholder="2026"
                    min="1900"
                    max="2100"
                  />
                </div>
              </div>
              {formData.image && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <img src={formData.image} alt="معاينة الصورة" className="w-16 h-10 object-contain rounded border" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  <span className="text-sm text-gray-500">معاينة الصورة</span>
                </div>
              )}
              <div className="flex gap-2">
                <Button type="submit" className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold">
                  {editingModel ? "تحديث" : "إضافة"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Models Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الصورة</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الماركة</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم بالعربية</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم بالإنجليزية</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">السنوات</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredModels.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-500">
                      {searchQuery || selectedBrandId ? "لا توجد نتائج" : "لا توجد موديلات بعد"}
                    </td>
                  </tr>
                ) : (
                  filteredModels.map((model: any, index: number) => (
                    <tr key={model.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                      <td className="px-4 py-3">
                        {model.image ? (
                          <img src={model.image} alt={model.name} className="w-12 h-8 object-contain rounded border bg-white" />
                        ) : (
                          <div className="w-12 h-8 bg-gray-100 rounded border flex items-center justify-center">
                            <Image className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{getBrandName(model.brandId)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{model.nameAr}</td>
                      <td className="px-4 py-3 text-sm text-gray-600" dir="ltr">{model.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {model.yearFrom && model.yearTo 
                          ? `${model.yearFrom} - ${model.yearTo}` 
                          : model.yearFrom 
                            ? `${model.yearFrom}+`
                            : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleActive(model.id, model.isActive !== false)}
                          className="flex items-center gap-1 text-sm"
                        >
                          {model.isActive !== false ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <ToggleRight className="w-5 h-5" /> نشط
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-500">
                              <ToggleLeft className="w-5 h-5" /> معطل
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(model)} title="تعديل" className="h-8 w-8 p-0">
                            <Edit className="w-4 h-4 text-yellow-600" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(model.id)} title="حذف" className="h-8 w-8 p-0">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
