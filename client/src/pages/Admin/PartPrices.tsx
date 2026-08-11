import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Pencil, Trash2, DollarSign } from "lucide-react";

interface PartPrice {
  id: number;
  brandName: string;
  modelName: string;
  partName: string;
  partType: string;
  priceMin: number;
  priceMax: number;
  priceAverage: number;
}

export default function PartPrices() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBrand, setFilterBrand] = useState<string>("all");
  const [filterPart, setFilterPart] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    brandId: "",
    modelId: "",
    partId: "",
    partType: "original",
    priceMin: "",
    priceMax: "",
    priceAverage: "",
  });

  // Queries
  const { data: partPrices, isLoading, refetch } = trpc.pricing.getAllPartPrices.useQuery();
  const partPricesData = partPrices as PartPrice[] | undefined;
  const { data: brands } = trpc.pricing.getBrands.useQuery();
  const { data: models } = trpc.pricing.getModelsByBrand.useQuery(
    { brandId: parseInt(formData.brandId) },
    { enabled: !!formData.brandId }
  );
  const { data: parts } = trpc.pricing.getParts.useQuery();

  // Mutations
  const addMutation = trpc.pricing.addPartPrice.useMutation({
    onSuccess: () => {
      toast({ title: "تم إضافة السعر بنجاح" });
      refetch();
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "خطأ", description: error.message });
    },
  });

  const updateMutation = trpc.pricing.updatePartPrice.useMutation({
    onSuccess: () => {
      toast({ title: "تم تحديث السعر بنجاح" });
      refetch();
      setEditingId(null);
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "خطأ", description: error.message });
    },
  });

  const deleteMutation = trpc.pricing.deletePartPrice.useMutation({
    onSuccess: () => {
      toast({ title: "تم حذف السعر بنجاح" });
      refetch();
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "خطأ", description: error.message });
    },
  });

  // Filter and search
  const filteredPrices = useMemo(() => {
    if (!partPricesData) return [];
    
    return partPricesData.filter((price) => {
      const matchesSearch =
        searchTerm === "" ||
        price.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        price.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        price.partName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBrand = filterBrand === "all" || price.brandName === filterBrand;
      const matchesPart = filterPart === "all" || price.partName === filterPart;
      const matchesType = filterType === "all" || price.partType === filterType;

      return matchesSearch && matchesBrand && matchesPart && matchesType;
    });
  }, [partPricesData, searchTerm, filterBrand, filterPart, filterType]);

  // Get unique values for filters
  const uniqueBrands = useMemo(() => {
    if (!partPricesData) return [];
    return Array.from(new Set(partPricesData.map((p) => p.brandName)));
  }, [partPricesData]);

  const uniqueParts = useMemo(() => {
    if (!partPricesData) return [];
    return Array.from(new Set(partPricesData.map((p) => p.partName)));
  }, [partPricesData]);

  const resetForm = () => {
    setFormData({
      brandId: "",
      modelId: "",
      partId: "",
      partType: "original",
      priceMin: "",
      priceMax: "",
      priceAverage: "",
    });
  };

  const handleAdd = () => {
    if (!formData.brandId || !formData.modelId || !formData.partId) {
      toast({ variant: "destructive", title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة" });
      return;
    }

    addMutation.mutate({
      brandId: parseInt(formData.brandId),
      modelId: parseInt(formData.modelId),
      partId: parseInt(formData.partId),
      partType: formData.partType as "original" | "aftermarket",
      priceMin: parseFloat(formData.priceMin) || 0,
      priceMax: parseFloat(formData.priceMax) || 0,
      priceAverage: parseFloat(formData.priceAverage) || 0,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا السعر؟")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <AdminLayout title="إدارة أسعار قطع الغيار">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <DollarSign className="w-8 h-8 text-yellow-500" />
              إدارة أسعار قطع الغيار
            </h1>
            <p className="text-gray-600 mt-1">
              إضافة وتعديل وحذف أسعار القطع لجميع الموديلات
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                <Plus className="w-4 h-4 mr-2" />
                إضافة سعر جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>إضافة سعر قطعة جديد</DialogTitle>
                <DialogDescription>
                  أدخل تفاصيل السعر للقطعة
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label>الماركة</Label>
                  <Select
                    value={formData.brandId}
                    onValueChange={(value) => setFormData({ ...formData, brandId: value, modelId: "" })}
                  >
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

                <div>
                  <Label>الموديل</Label>
                  <Select
                    value={formData.modelId}
                    onValueChange={(value) => setFormData({ ...formData, modelId: value })}
                    disabled={!formData.brandId}
                  >
                    <SelectTrigger>
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

                <div>
                  <Label>القطعة</Label>
                  <Select
                    value={formData.partId}
                    onValueChange={(value) => setFormData({ ...formData, partId: value })}
                  >
                    <SelectTrigger>
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

                <div>
                  <Label>نوع القطعة</Label>
                  <Select
                    value={formData.partType}
                    onValueChange={(value) => setFormData({ ...formData, partType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="original">أصلي (Original)</SelectItem>
                      <SelectItem value="aftermarket">تجاري (Aftermarket)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>السعر الأدنى (ريال)</Label>
                  <Input
                    type="number"
                    placeholder="مثال: 500"
                    value={formData.priceMin}
                    onChange={(e) => setFormData({ ...formData, priceMin: e.target.value })}
                  />
                </div>

                <div>
                  <Label>السعر الأعلى (ريال)</Label>
                  <Input
                    type="number"
                    placeholder="مثال: 800"
                    value={formData.priceMax}
                    onChange={(e) => setFormData({ ...formData, priceMax: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <Label>السعر المتوسط (ريال)</Label>
                  <Input
                    type="number"
                    placeholder="مثال: 650"
                    value={formData.priceAverage}
                    onChange={(e) => setFormData({ ...formData, priceAverage: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button
                  onClick={handleAdd}
                  disabled={addMutation.isPending}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  {addMutation.isPending ? "جاري الإضافة..." : "إضافة"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600">إجمالي الأسعار</div>
            <div className="text-2xl font-bold">{partPricesData?.length || 0}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">الماركات</div>
            <div className="text-2xl font-bold">{uniqueBrands.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">القطع</div>
            <div className="text-2xl font-bold">{uniqueParts.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">النتائج المفلترة</div>
            <div className="text-2xl font-bold">{filteredPrices.length}</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>بحث</Label>
              <div className="relative">
                <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="ابحث عن ماركة، موديل، أو قطعة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            <div>
              <Label>فلترة حسب الماركة</Label>
              <Select value={filterBrand} onValueChange={setFilterBrand}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الماركات</SelectItem>
                  {uniqueBrands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>فلترة حسب القطعة</Label>
              <Select value={filterPart} onValueChange={setFilterPart}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع القطع</SelectItem>
                  {uniqueParts.map((part) => (
                    <SelectItem key={part} value={part}>
                      {part}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>فلترة حسب النوع</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="original">أصلي</SelectItem>
                  <SelectItem value="aftermarket">تجاري</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>الماركة</TableHead>
                  <TableHead>الموديل</TableHead>
                  <TableHead>القطعة</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>السعر الأدنى</TableHead>
                  <TableHead>السعر الأعلى</TableHead>
                  <TableHead>السعر المتوسط</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      جاري التحميل...
                    </TableCell>
                  </TableRow>
                ) : filteredPrices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      لا توجد نتائج
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPrices.map((price, index) => (
                    <TableRow key={price.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{price.brandName}</TableCell>
                      <TableCell>{price.modelName}</TableCell>
                      <TableCell>{price.partName}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            price.partType === "original"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {price.partType === "original" ? "أصلي" : "تجاري"}
                        </span>
                      </TableCell>
                      <TableCell>{price.priceMin} ر.س</TableCell>
                      <TableCell>{price.priceMax} ر.س</TableCell>
                      <TableCell className="font-bold">{price.priceAverage} ر.س</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(price.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
