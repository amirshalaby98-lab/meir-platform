import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Wrench, Search, Phone, MapPin, Star, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";

const statusLabels: Record<string, string> = {
  available: "متاح",
  busy: "مشغول",
  offline: "غير متصل",
};

const statusStyles: Record<string, string> = {
  available: "bg-green-100 text-green-800",
  busy: "bg-yellow-100 text-yellow-800",
  offline: "bg-gray-100 text-gray-600",
};

export default function TechniciansManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: technicians, refetch, isLoading } = trpc.technician.getAll.useQuery();

  const updateStatusMutation = trpc.technician.updateStatus.useMutation({
    onSuccess: () => {
      toast({ title: "تم التحديث", description: "تم تحديث حالة الفني بنجاح" });
      refetch();
    },
    onError: (err) => {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    },
  });

  const filteredTechnicians = (technicians ?? [])
    .filter((t: any) => statusFilter === "all" || t.status === statusFilter)
    .filter(
      (t: any) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.phone.includes(searchQuery) ||
        (t.specialization ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    );

  const availableCount = (technicians ?? []).filter((t: any) => t.status === "available").length;
  const busyCount = (technicians ?? []).filter((t: any) => t.status === "busy").length;

  return (
    <AdminLayout title="إدارة الفنيين" description="عرض ومتابعة جميع الفنيين المسجلين على المنصة">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-sm text-gray-500">إجمالي الفنيين</p>
            <p className="text-2xl font-bold text-gray-900">{technicians?.length || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-sm text-gray-500">متاحين الآن</p>
            <p className="text-2xl font-bold text-green-600">{availableCount}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-sm text-gray-500">مشغولين</p>
            <p className="text-2xl font-bold text-yellow-600">{busyCount}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-sm text-gray-500">معروضين حاليًا</p>
            <p className="text-2xl font-bold text-blue-600">{filteredTechnicians.length}</p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="ابحث بالاسم أو الهاتف أو التخصص..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="فلترة حسب الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الحالات</SelectItem>
                  <SelectItem value="available">متاح</SelectItem>
                  <SelectItem value="busy">مشغول</SelectItem>
                  <SelectItem value="offline">غير متصل</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Link href="/admin/pending-technicians">
            <div className="flex items-center gap-2 text-sm text-yellow-700 hover:underline whitespace-nowrap">
              <Clock className="w-4 h-4" />
              طلبات التسجيل المعلقة
            </div>
          </Link>
        </div>

        {/* Technicians Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الهاتف</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">التخصص</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الموقع</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">التقييم</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">المهام المنجزة</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500">
                      جاري التحميل...
                    </td>
                  </tr>
                ) : filteredTechnicians.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500">
                      {searchQuery || statusFilter !== "all" ? "لا توجد نتائج" : "لا يوجد فنيين بعد"}
                    </td>
                  </tr>
                ) : (
                  filteredTechnicians.map((tech: any) => (
                    <tr key={tech.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <Link href={`/technician/${tech.id}`} className="text-sm font-medium text-gray-900 hover:text-yellow-600">
                          {tech.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <span dir="ltr">{tech.phone}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Wrench className="w-3.5 h-3.5 text-gray-400" />
                          {tech.specialization || "غير محدد"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {tech.location}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          {tech.rating ?? 0}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{tech.completedJobs ?? 0}</td>
                      <td className="px-4 py-3">
                        <Select
                          value={tech.status}
                          onValueChange={(v) =>
                            updateStatusMutation.mutate({ id: tech.id, status: v as "available" | "busy" | "offline" })
                          }
                        >
                          <SelectTrigger className={`w-28 h-8 text-xs border-0 ${statusStyles[tech.status] ?? ""}`}>
                            <SelectValue>{statusLabels[tech.status] ?? tech.status}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">متاح</SelectItem>
                            <SelectItem value="busy">مشغول</SelectItem>
                            <SelectItem value="offline">غير متصل</SelectItem>
                          </SelectContent>
                        </Select>
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
