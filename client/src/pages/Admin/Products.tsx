import { useState } from "react";
import { trpc } from "../../lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Package, X } from "lucide-react";

interface ProductForm {
  id?: number;
  name: string;
  description: string;
  category: string;
  price: string;
  stockQuantity: number;
  images: string[];
  status: "active" | "inactive";
}

const emptyForm: ProductForm = {
  name: "",
  description: "",
  category: "",
  price: "",
  stockQuantity: 0,
  images: [],
  status: "active",
};

export default function ProductsAdmin() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [uploading, setUploading] = useState(false);

  const { data: products, isLoading, refetch } = trpc.products.getAll.useQuery({ activeOnly: false });

  const uploadImageMutation = trpc.products.uploadImage.useMutation();
  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة المنتج بنجاح");
      setShowForm(false);
      setForm(emptyForm);
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });
  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث المنتج بنجاح");
      setShowForm(false);
      setForm(emptyForm);
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المنتج");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const { url } = await uploadImageMutation.mutateAsync({ imageBase64: base64, mimeType: file.type });
        setForm((prev) => ({ ...prev, images: [...prev.images, url] }));
      }
    } catch (err: any) {
      toast.error(err.message || "فشل رفع الصورة");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (url: string) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((i) => i !== url) }));
  };

  const startEdit = (product: any) => {
    setForm({
      id: product.id,
      name: product.name,
      description: product.description || "",
      category: product.category || "",
      price: product.price,
      stockQuantity: product.stockQuantity,
      images: product.images || [],
      status: product.status,
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.price.trim()) {
      toast.error("الاسم والسعر مطلوبان");
      return;
    }
    if (form.id) {
      updateMutation.mutate({
        id: form.id,
        name: form.name,
        description: form.description,
        category: form.category,
        price: form.price,
        stockQuantity: form.stockQuantity,
        images: form.images,
        status: form.status,
      });
    } else {
      createMutation.mutate({
        name: form.name,
        description: form.description,
        category: form.category,
        price: form.price,
        stockQuantity: form.stockQuantity,
        images: form.images,
        status: form.status,
      });
    }
  };

  return (
    <AdminLayout title="المنتجات" description="إدارة كتالوج المتجر">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">المنتجات ({products?.length || 0})</h1>
        <Button
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
          onClick={() => {
            setForm(emptyForm);
            setShowForm(true);
          }}
        >
          <Plus className="w-4 h-4 ml-1" /> إضافة منتج
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">{form.id ? "تعديل المنتج" : "منتج جديد"}</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>اسم المنتج *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: جهاز فحص مير OBD2" />
              </div>
              <div>
                <Label>الفئة</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="مثال: أجهزة فحص" />
              </div>
              <div>
                <Label>السعر (ريال) *</Label>
                <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="299.00" dir="ltr" />
              </div>
              <div>
                <Label>الكمية المتوفرة</Label>
                <Input
                  type="number"
                  value={form.stockQuantity}
                  onChange={(e) => setForm({ ...form, stockQuantity: parseInt(e.target.value) || 0 })}
                  dir="ltr"
                />
              </div>
            </div>
            <div>
              <Label>الوصف</Label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full mt-1 p-2 border rounded-md min-h-24"
                placeholder="وصف المنتج، المواصفات، محتويات العلبة..."
              />
            </div>
            <div>
              <Label>الصور</Label>
              <Input type="file" accept="image/*" multiple onChange={handleImageSelect} disabled={uploading} className="mt-1" />
              {uploading && <p className="text-xs text-gray-500 mt-1">جاري الرفع...</p>}
              {form.images.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {form.images.map((img) => (
                    <div key={img} className="relative">
                      <img src={img} alt="" className="w-20 h-20 object-cover rounded-lg border" />
                      <button
                        onClick={() => removeImage(img)}
                        className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Label>الحالة:</Label>
              <button
                onClick={() => setForm({ ...form, status: form.status === "active" ? "inactive" : "active" })}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  form.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"
                }`}
              >
                {form.status === "active" ? "مفعّل" : "معطّل"}
              </button>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold w-full"
            >
              {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : form.id ? "حفظ التعديلات" : "إضافة المنتج"}
            </Button>
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
        </div>
      ) : !products?.length ? (
        <Card className="p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">لا توجد منتجات بعد</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product: any) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-10 h-10 text-gray-300" />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-gray-900">{product.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${product.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"}`}>
                    {product.status === "active" ? "مفعّل" : "معطّل"}
                  </span>
                </div>
                <p className="text-yellow-600 font-bold mb-1">{product.price} ريال</p>
                <p className="text-xs text-gray-500 mb-3">المخزون: {product.stockQuantity}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => startEdit(product)}>
                    <Pencil className="w-3 h-3 ml-1" /> تعديل
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => {
                      if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) deleteMutation.mutate({ id: product.id });
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
