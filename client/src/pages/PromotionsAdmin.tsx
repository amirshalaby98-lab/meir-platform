import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Tag, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PromotionsAdmin() {
  const { data: promotions, isLoading, refetch } = trpc.promotions.getAll.useQuery();
  const { data: parts } = trpc.pricing.getParts.useQuery();
  const createMutation = trpc.promotions.create.useMutation();
  const updateMutation = trpc.promotions.update.useMutation();
  const deleteMutation = trpc.promotions.delete.useMutation();
  const toggleMutation = trpc.promotions.toggleActive.useMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState(0);
  const [targetType, setTargetType] = useState<"all" | "specific_parts">("all");
  const [targetPartIds, setTargetPartIds] = useState<number[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const resetForm = () => {
    setName("");
    setDescription("");
    setDiscountType("percentage");
    setDiscountValue(0);
    setTargetType("all");
    setTargetPartIds([]);
    setStartDate("");
    setEndDate("");
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !startDate || !endDate || discountValue <= 0) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      toast.error("تاريخ النهاية يجب أن يكون بعد تاريخ البداية");
      return;
    }

    try {
      const data = {
        name,
        description: description || undefined,
        discountType,
        discountValue,
        targetType,
        targetPartIds: targetType === "specific_parts" ? targetPartIds.join(",") : undefined,
        startDate: start,
        endDate: end,
        isActive: true,
      };

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...data });
        toast.success("تم تحديث العرض بنجاح!");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("تم إضافة العرض بنجاح!");
      }

      resetForm();
      setIsDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ");
    }
  };

  const handleEdit = (promo: any) => {
    setEditingId(promo.id);
    setName(promo.name);
    setDescription(promo.description || "");
    setDiscountType(promo.discountType);
    setDiscountValue(promo.discountValue);
    setTargetType(promo.targetType);
    setTargetPartIds(promo.targetPartIds ? promo.targetPartIds.split(",").map(Number) : []);
    setStartDate(new Date(promo.startDate).toISOString().slice(0, 16));
    setEndDate(new Date(promo.endDate).toISOString().slice(0, 16));
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا العرض؟")) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("تم حذف العرض بنجاح!");
      refetch();
    } catch (error) {
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const handleToggle = async (id: number, isActive: boolean) => {
    try {
      await toggleMutation.mutateAsync({ id, isActive: !isActive });
      toast.success(isActive ? "تم تعطيل العرض" : "تم تفعيل العرض");
      refetch();
    } catch (error) {
      toast.error("حدث خطأ");
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mb-4">
              <Tag className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              إدارة العروض والخصومات
            </h1>
            <p className="text-gray-600">
              قم بإنشاء وإدارة العروض الموسمية والخصومات
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={resetForm}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold"
              >
                <Plus className="w-5 h-5 ml-2" />
                إضافة عرض جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "تعديل العرض" : "إضافة عرض جديد"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>اسم العرض *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: خصم الجمعة البيضاء"
                    required
                  />
                </div>

                <div>
                  <Label>الوصف</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="وصف العرض (اختياري)"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>نوع الخصم *</Label>
                    <Select value={discountType} onValueChange={(v: any) => setDiscountType(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">نسبة مئوية (%)</SelectItem>
                        <SelectItem value="fixed">مبلغ ثابت (ريال)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>قيمة الخصم *</Label>
                    <Input
                      type="number"
                      value={discountValue || ""}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      placeholder={discountType === "percentage" ? "مثال: 10" : "مثال: 50"}
                      min={1}
                      max={discountType === "percentage" ? 100 : undefined}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>الهدف *</Label>
                  <Select value={targetType} onValueChange={(v: any) => setTargetType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الخدمات</SelectItem>
                      <SelectItem value="specific_parts">قطع محددة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {targetType === "specific_parts" && (
                  <div>
                    <Label>اختر القطع المستهدفة *</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto p-2 border rounded">
                      {parts?.map((part) => (
                        <label key={part.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={targetPartIds.includes(part.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setTargetPartIds([...targetPartIds, part.id]);
                              } else {
                                setTargetPartIds(targetPartIds.filter((id) => id !== part.id));
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{part.nameAr}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>تاريخ البداية *</Label>
                    <Input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label>تاريخ النهاية *</Label>
                    <Input
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600"
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري الحفظ...</>
                    ) : (
                      editingId ? "تحديث العرض" : "إضافة العرض"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Promotions List */}
        <div className="space-y-4">
          {promotions?.length === 0 ? (
            <Card className="p-12 text-center">
              <Tag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                لا توجد عروض حالياً
              </h3>
              <p className="text-gray-500">
                ابدأ بإضافة عرض جديد لجذب المزيد من العملاء
              </p>
            </Card>
          ) : (
            promotions?.map((promo) => {
              const now = new Date();
              const start = new Date(promo.startDate);
              const end = new Date(promo.endDate);
              const isActive = promo.isActive && now >= start && now <= end;
              const isUpcoming = now < start;
              const isExpired = now > end;

              return (
                <Card key={promo.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {promo.name}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            isActive
                              ? "bg-green-100 text-green-700"
                              : isUpcoming
                              ? "bg-blue-100 text-blue-700"
                              : isExpired
                              ? "bg-gray-100 text-gray-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {isActive
                            ? "نشط"
                            : isUpcoming
                            ? "قادم"
                            : isExpired
                            ? "منتهي"
                            : "معطل"}
                        </span>
                      </div>

                      {promo.description && (
                        <p className="text-gray-600 mb-3">{promo.description}</p>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">الخصم:</span>
                          <span className="font-semibold text-yellow-600 mr-2">
                            {promo.discountType === "percentage"
                              ? `${promo.discountValue}%`
                              : `${promo.discountValue} ريال`}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">الهدف:</span>
                          <span className="font-semibold mr-2">
                            {promo.targetType === "all" ? "جميع الخدمات" : "قطع محددة"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">
                            {new Date(promo.startDate).toLocaleDateString("ar-SA")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">
                            {new Date(promo.endDate).toLocaleDateString("ar-SA")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggle(promo.id, promo.isActive)}
                        disabled={toggleMutation.isPending}
                      >
                        {promo.isActive ? (
                          <ToggleRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-gray-400" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(promo)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(promo.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
