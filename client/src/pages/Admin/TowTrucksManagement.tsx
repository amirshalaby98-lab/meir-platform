import { useState, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Plus, Edit2, Trash2, CheckCircle2, Clock, XCircle, ChevronRight, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 10;

type TowTruck = {
  id: number;
  name: string;
  phone: string;
  area: string;
  city: string;
  status: string;
  rating: string | null;
  createdAt: Date | string | null;
  reviews?: number | null;
  services?: string | null;
  price?: string | null;
  updatedAt?: Date | string | null;
};

export default function TowTrucksManagement() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TowTruck | null>(null);
  const [formData, setFormData] = useState({ name: "", phone: "", area: "", city: "" });

  const { data: towTrucks, isLoading, refetch } = trpc.pricing.getTowTrucks.useQuery();
  const addMutation = trpc.pricing.addTowTruck.useMutation({
    onSuccess: () => {
      toast({ title: "تمت الإضافة", description: "تم إضافة السطحة بنجاح" });
      refetch();
    },
    onError: () => toast({ title: "خطأ", description: "فشل في إضافة السطحة", variant: "destructive" }),
  });
  const updateMutation = trpc.pricing.updateTowTruck.useMutation({
    onSuccess: () => {
      toast({ title: "تم التحديث", description: "تم تحديث البيانات بنجاح" });
      refetch();
    },
    onError: () => toast({ title: "خطأ", description: "فشل في تحديث البيانات", variant: "destructive" }),
  });
  const deleteMutation = trpc.pricing.deleteTowTruck.useMutation({
    onSuccess: () => {
      toast({ title: "تم الحذف", description: "تم حذف السطحة بنجاح" });
      refetch();
    },
    onError: () => toast({ title: "خطأ", description: "فشل في حذف السطحة", variant: "destructive" }),
  });

  // Filtered data
  const filtered = useMemo(() => {
    if (!towTrucks) return [];
    return towTrucks.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.area.toLowerCase().includes(search.toLowerCase()) ||
        t.city.toLowerCase().includes(search.toLowerCase()) ||
        t.phone.includes(search);
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [towTrucks, search, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  // Reset page when filter changes
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // Handlers
  const handleAdd = async () => {
    if (!formData.name || !formData.phone || !formData.area || !formData.city) return;
    await addMutation.mutateAsync(formData);
    setFormData({ name: "", phone: "", area: "", city: "" });
    setIsAddOpen(false);
  };

  const handleEdit = (truck: TowTruck) => {
    setEditingItem({ ...truck });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    await updateMutation.mutateAsync({
      id: editingItem.id,
      name: editingItem.name,
      phone: editingItem.phone,
      area: editingItem.area,
      city: editingItem.city,
      status: editingItem.status as "pending" | "approved" | "rejected",
    });
    setIsEditOpen(false);
    setEditingItem(null);
  };

  const handleApprove = async (id: number) => {
    await updateMutation.mutateAsync({ id, status: "approved" });
  };

  const handleReject = async (id: number) => {
    await updateMutation.mutateAsync({ id, status: "rejected" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه السطحة؟")) return;
    await deleteMutation.mutateAsync({ id });
  };

  const stats = [
    { label: "إجمالي السطحات", value: towTrucks?.length || 0, color: "bg-blue-50 text-blue-700" },
    { label: "معتمدة", value: towTrucks?.filter((t) => t.status === "approved").length || 0, color: "bg-green-50 text-green-700" },
    { label: "قيد المراجعة", value: towTrucks?.filter((t) => t.status === "pending").length || 0, color: "bg-yellow-50 text-yellow-700" },
    { label: "مرفوضة", value: towTrucks?.filter((t) => t.status === "rejected").length || 0, color: "bg-red-50 text-red-700" },
  ];

  return (
    <AdminLayout title="إدارة السطحات">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <Card key={i} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleStatusFilterChange(i === 0 ? "all" : i === 1 ? "approved" : i === 2 ? "pending" : "rejected")}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold rounded-lg inline-block px-3 py-1 ${stat.color}`}>{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search, Filter & Add */}
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="ابحث بالاسم أو المنطقة أو الهاتف..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="flex-1"
          />
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="فلتر الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="pending">قيد المراجعة</SelectItem>
              <SelectItem value="approved">معتمدة</SelectItem>
              <SelectItem value="rejected">مرفوضة</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-500 hover:bg-yellow-600 whitespace-nowrap">
                <Plus className="w-4 h-4 ml-2" />
                إضافة سطحة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة سطحة جديدة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="اسم السطحة" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                <Input placeholder="رقم الهاتف" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                <Input placeholder="المدينة" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                <Input placeholder="المنطقة" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} />
                <Button onClick={handleAdd} disabled={addMutation.isPending} className="w-full bg-yellow-500 hover:bg-yellow-600">
                  {addMutation.isPending ? "جاري الإضافة..." : "إضافة"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">قائمة السطحات</CardTitle>
            <span className="text-sm text-gray-500">{filtered.length} نتيجة</span>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-gray-500">لا توجد نتائج</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-right py-3 px-4 font-medium">#</th>
                        <th className="text-right py-3 px-4 font-medium">الاسم</th>
                        <th className="text-right py-3 px-4 font-medium">الهاتف</th>
                        <th className="text-right py-3 px-4 font-medium">المدينة</th>
                        <th className="text-right py-3 px-4 font-medium">المنطقة</th>
                        <th className="text-right py-3 px-4 font-medium">الحالة</th>
                        <th className="text-right py-3 px-4 font-medium">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((truck, idx) => (
                        <tr key={truck.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-gray-500">{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                          <td className="py-3 px-4 font-medium">{truck.name}</td>
                          <td className="py-3 px-4">{truck.phone}</td>
                          <td className="py-3 px-4">{truck.city}</td>
                          <td className="py-3 px-4">{truck.area}</td>
                          <td className="py-3 px-4">
                            <StatusBadge status={truck.status} />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1 flex-wrap">
                              {truck.status === "pending" && (
                                <>
                                  <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50 h-8 px-2" onClick={() => handleApprove(truck.id)} disabled={updateMutation.isPending}>
                                    <CheckCircle2 className="w-3.5 h-3.5 ml-1" />
                                    قبول
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 h-8 px-2" onClick={() => handleReject(truck.id)} disabled={updateMutation.isPending}>
                                    <XCircle className="w-3.5 h-3.5 ml-1" />
                                    رفض
                                  </Button>
                                </>
                              )}
                              {truck.status === "rejected" && (
                                <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50 h-8 px-2" onClick={() => handleApprove(truck.id)} disabled={updateMutation.isPending}>
                                  <CheckCircle2 className="w-3.5 h-3.5 ml-1" />
                                  اعتماد
                                </Button>
                              )}
                              {truck.status === "approved" && (
                                <Button size="sm" variant="outline" className="text-yellow-600 border-yellow-200 hover:bg-yellow-50 h-8 px-2" onClick={() => handleReject(truck.id)} disabled={updateMutation.isPending}>
                                  <XCircle className="w-3.5 h-3.5 ml-1" />
                                  إلغاء
                                </Button>
                              )}
                              <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => handleEdit(truck as TowTruck)}>
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="sm" variant="destructive" className="h-8 px-2" onClick={() => handleDelete(truck.id)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      صفحة {currentPage} من {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                        <ChevronRight className="w-4 h-4 ml-1" />
                        السابق
                      </Button>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let page: number;
                        if (totalPages <= 5) {
                          page = i + 1;
                        } else if (currentPage <= 3) {
                          page = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          page = totalPages - 4 + i;
                        } else {
                          page = currentPage - 2 + i;
                        }
                        return (
                          <Button key={page} size="sm" variant={currentPage === page ? "default" : "outline"} onClick={() => setCurrentPage(page)} className="w-8 h-8 p-0">
                            {page}
                          </Button>
                        );
                      })}
                      <Button size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                        التالي
                        <ChevronLeft className="w-4 h-4 mr-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعديل بيانات السطحة</DialogTitle>
            </DialogHeader>
            {editingItem && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">الاسم</label>
                  <Input value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">رقم الهاتف</label>
                  <Input value={editingItem.phone} onChange={(e) => setEditingItem({ ...editingItem, phone: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">المدينة</label>
                  <Input value={editingItem.city} onChange={(e) => setEditingItem({ ...editingItem, city: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">المنطقة</label>
                  <Input value={editingItem.area} onChange={(e) => setEditingItem({ ...editingItem, area: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">الحالة</label>
                  <Select value={editingItem.status} onValueChange={(value) => setEditingItem({ ...editingItem, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">قيد المراجعة</SelectItem>
                      <SelectItem value="approved">معتمدة</SelectItem>
                      <SelectItem value="rejected">مرفوضة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSaveEdit} disabled={updateMutation.isPending} className="flex-1 bg-yellow-500 hover:bg-yellow-600">
                    {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditOpen(false)} className="flex-1">
                    إلغاء
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "approved":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle2 className="w-3 h-3 ml-1" />
          معتمدة
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock className="w-3 h-3 ml-1" />
          قيد المراجعة
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          <XCircle className="w-3 h-3 ml-1" />
          مرفوضة
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
