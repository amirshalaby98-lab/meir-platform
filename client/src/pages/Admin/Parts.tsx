import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "../../lib/trpc";
import { Package, Plus, Edit, Trash2, ArrowRight } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { useToast } from "../../hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";

export default function PartsManagement() {
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPart, setEditingPart] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", nameAr: "", description: "" });

  const { data: parts, refetch } = trpc.getServiceParts.useQuery();
  const createPart = trpc.createServicePart.useMutation();
  const updatePart = trpc.updateServicePart.useMutation();
  const deletePart = trpc.deleteServicePart.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPart) {
        await updatePart.mutateAsync({ id: editingPart.id, ...formData });
        toast({ title: "تم التحديث", description: "تم تحديث القطعة بنجاح" });
      } else {
        await createPart.mutateAsync(formData);
        toast({ title: "تم الإضافة", description: "تم إضافة القطعة بنجاح" });
      }
      setFormData({ name: "", nameAr: "", description: "" });
      setShowAddForm(false);
      setEditingPart(null);
      refetch();
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ أثناء الحفظ" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه القطعة؟")) return;
    try {
      await deletePart.mutateAsync({ id });
      toast({ title: "تم الحذف", description: "تم حذف القطعة بنجاح" });
      refetch();
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ أثناء الحذف" });
    }
  };

  const handleEdit = (part: any) => {
    setEditingPart(part);
    setFormData({ name: part.name, nameAr: part.nameAr, description: part.description || "" });
    setShowAddForm(true);
  };

  return (
    <AdminLayout title="إدارة القطع">
      <div className="space-y-6">
        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingPart ? "تعديل القطعة" : "إضافة قطعة جديدة"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nameAr">الاسم بالعربية</Label>
                <Input
                  id="nameAr"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="name">الاسم بالإنجليزية</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">الوصف (اختياري)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingPart ? "تحديث" : "إضافة"}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowAddForm(false); setEditingPart(null); setFormData({ name: "", nameAr: "", description: "" }); }}>
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Parts Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الاسم بالعربية
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الاسم بالإنجليزية
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الوصف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {parts?.map((part: any) => (
                <tr key={part.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {part.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {part.nameAr}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {part.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {part.description || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(part)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(part.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
