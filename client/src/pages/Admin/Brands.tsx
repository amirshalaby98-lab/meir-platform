import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "../../lib/trpc";
import { Car, Plus, Edit, Trash2, Image, ToggleLeft, ToggleRight, Search } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useToast } from "../../hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";

export default function BrandsManagement() {
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({ name: "", nameAr: "", logo: "" });

  const { data: brands, refetch } = trpc.getCarBrands.useQuery();
  const createBrand = trpc.createCarBrand.useMutation();
  const updateBrand = trpc.updateCarBrand.useMutation();
  const deleteBrand = trpc.deleteCarBrand.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBrand) {
        await updateBrand.mutateAsync({
          id: editingBrand.id,
          name: formData.name || undefined,
          nameAr: formData.nameAr || undefined,
          logo: formData.logo || undefined,
        });
        toast({ title: "تم التحديث", description: "تم تحديث الماركة بنجاح" });
      } else {
        await createBrand.mutateAsync({
          name: formData.name,
          nameAr: formData.nameAr,
          logo: formData.logo || undefined,
        });
        toast({ title: "تم الإضافة", description: "تم إضافة الماركة بنجاح" });
      }
      setFormData({ name: "", nameAr: "", logo: "" });
      setShowAddForm(false);
      setEditingBrand(null);
      refetch();
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ أثناء الحفظ" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه الماركة؟ سيتم حذف جميع الموديلات المرتبطة بها.")) return;
    try {
      await deleteBrand.mutateAsync({ id });
      toast({ title: "تم الحذف", description: "تم حذف الماركة بنجاح" });
      refetch();
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ أثناء الحذف" });
    }
  };

  const handleEdit = (brand: any) => {
    setEditingBrand(brand);
    setFormData({ name: brand.name, nameAr: brand.nameAr, logo: brand.logo || "" });
    setShowAddForm(true);
  };

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    try {
      await updateBrand.mutateAsync({ id, isActive: !currentActive });
      toast({ title: !currentActive ? "تم التفعيل" : "تم التعطيل" });
      refetch();
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ" });
    }
  };

  const filteredBrands = brands?.filter((b: any) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.nameAr.includes(searchQuery)
  ) || [];

  const activeBrands = brands?.filter((b: any) => b.isActive !== false) || [];
  const inactiveBrands = brands?.filter((b: any) => b.isActive === false) || [];
  const withLogo = brands?.filter((b: any) => b.logo) || [];

  return (
    <AdminLayout title="إدارة الماركات" description="إضافة وتعديل وحذف ماركات السيارات مع الشعارات">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-sm text-gray-500">إجمالي الماركات</p>
            <p className="text-2xl font-bold text-gray-900">{brands?.length || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-sm text-gray-500">ماركات نشطة</p>
            <p className="text-2xl font-bold text-green-600">{activeBrands.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-sm text-gray-500">ماركات معطلة</p>
            <p className="text-2xl font-bold text-red-600">{inactiveBrands.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-sm text-gray-500">مع شعار</p>
            <p className="text-2xl font-bold text-blue-600">{withLogo.length}</p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="ابحث عن ماركة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-9"
            />
          </div>
          <div className="flex gap-2">
            <Link href="/admin/models">
              <Button variant="outline" className="gap-2">
                <Car className="w-4 h-4" />
                إدارة الموديلات
              </Button>
            </Link>
            <Button onClick={() => { setShowAddForm(true); setEditingBrand(null); setFormData({ name: "", nameAr: "", logo: "" }); }} className="gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold">
              <Plus className="w-4 h-4" />
              إضافة ماركة
            </Button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-yellow-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingBrand ? "تعديل الماركة" : "إضافة ماركة جديدة"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="nameAr">الاسم بالعربية *</Label>
                  <Input
                    id="nameAr"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    placeholder="تويوتا"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name">الاسم بالإنجليزية *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Toyota"
                    dir="ltr"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="logo">رابط الشعار (اختياري)</Label>
                  <Input
                    id="logo"
                    type="url"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    placeholder="https://..."
                    dir="ltr"
                  />
                </div>
              </div>
              {formData.logo && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <img src={formData.logo} alt="معاينة الشعار" className="w-12 h-12 object-contain rounded border" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  <span className="text-sm text-gray-500">معاينة الشعار</span>
                </div>
              )}
              <div className="flex gap-2">
                <Button type="submit" className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold">
                  {editingBrand ? "تحديث" : "إضافة"}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowAddForm(false); setEditingBrand(null); setFormData({ name: "", nameAr: "", logo: "" }); }}>
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Brands Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الشعار</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم بالعربية</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم بالإنجليزية</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBrands.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500">
                      {searchQuery ? "لا توجد نتائج للبحث" : "لا توجد ماركات بعد"}
                    </td>
                  </tr>
                ) : (
                  filteredBrands.map((brand: any, index: number) => (
                    <tr key={brand.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                      <td className="px-4 py-3">
                        {brand.logo ? (
                          <img src={brand.logo} alt={brand.name} className="w-10 h-10 object-contain rounded border bg-white" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded border flex items-center justify-center">
                            <Image className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{brand.nameAr}</td>
                      <td className="px-4 py-3 text-sm text-gray-600" dir="ltr">{brand.name}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleActive(brand.id, brand.isActive !== false)}
                          className="flex items-center gap-1 text-sm"
                        >
                          {brand.isActive !== false ? (
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
                          <Link href={`/admin/models?brandId=${brand.id}`}>
                            <Button size="sm" variant="ghost" title="عرض الموديلات" className="h-8 w-8 p-0">
                              <Car className="w-4 h-4 text-blue-600" />
                            </Button>
                          </Link>
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(brand)} title="تعديل" className="h-8 w-8 p-0">
                            <Edit className="w-4 h-4 text-yellow-600" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(brand.id)} title="حذف" className="h-8 w-8 p-0">
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
