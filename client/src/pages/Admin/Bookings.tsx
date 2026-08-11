import { useState } from "react";
import { trpc } from "../../lib/trpc";
import { Calendar, Filter, Search, Phone, MapPin, Car, Clock, Eye, X, UserCheck, CheckCircle, XCircle, ArrowLeft, Wrench, Navigation, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "sonner";

export default function BookingsManagement() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const utils = trpc.useUtils();
  const { data: bookings, refetch } = trpc.admin.getBookings.useQuery();
  const { data: technicians } = trpc.technician.getAll.useQuery();
  const updateStatus = trpc.admin.updateBookingStatus.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة الحجز بنجاح");
      refetch();
    },
    onError: (err) => toast.error("خطأ: " + err.message),
  });
  const deleteBooking = trpc.admin.deleteBooking.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الحجز بنجاح");
      utils.admin.getBookings.invalidate();
      setSelectedBooking(null);
    },
    onError: (err) => toast.error("خطأ في الحذف: " + err.message),
  });
  const deleteMultipleBookings = trpc.admin.deleteMultipleBookings.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الحجوزات بنجاح");
      utils.admin.getBookings.invalidate();
    },
    onError: (err) => toast.error("خطأ في الحذف: " + err.message),
  });
  const assignTechnician = trpc.technician.assignToBooking.useMutation({
    onSuccess: () => {
      toast.success("تم تعيين الفني بنجاح");
      refetch();
    },
    onError: (err) => toast.error("خطأ: " + err.message),
  });

  // فلترة وبحث
  const filteredBookings = bookings?.filter((b: any) => {
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    const matchesSearch = !searchQuery ||
      b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone?.includes(searchQuery) ||
      b.service?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesDate = true;
    if (dateFilter !== "all" && b.createdAt) {
      const bookingDate = new Date(b.createdAt);
      const now = new Date();
      if (dateFilter === "today") {
        matchesDate = bookingDate.toDateString() === now.toDateString();
      } else if (dateFilter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = bookingDate >= weekAgo;
      } else if (dateFilter === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = bookingDate >= monthAgo;
      }
    }
    
    return matchesStatus && matchesSearch && matchesDate;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      confirmed: "bg-blue-100 text-blue-800 border border-blue-200",
      completed: "bg-green-100 text-green-800 border border-green-200",
      cancelled: "bg-red-100 text-red-800 border border-red-200",
    };
    const labels: Record<string, string> = {
      pending: "معلق",
      confirmed: "مؤكد",
      completed: "مكتمل",
      cancelled: "ملغي",
    };
    return (
      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${styles[status] || "bg-gray-100 text-gray-800"}`}>
        {labels[status] || status}
      </span>
    );
  };

  const statusCounts = {
    all: bookings?.length || 0,
    pending: bookings?.filter((b: any) => b.status === "pending").length || 0,
    confirmed: bookings?.filter((b: any) => b.status === "confirmed").length || 0,
    completed: bookings?.filter((b: any) => b.status === "completed").length || 0,
    cancelled: bookings?.filter((b: any) => b.status === "cancelled").length || 0,
  };

  // رحلة الطلب المرئية
  const getOrderJourney = (status: string) => {
    const steps = [
      { key: "pending", label: "معلق", icon: Clock },
      { key: "confirmed", label: "مؤكد", icon: CheckCircle },
      { key: "completed", label: "مكتمل", icon: CheckCircle },
    ];
    const currentIndex = steps.findIndex(s => s.key === status);
    if (status === "cancelled") return null;
    
    return (
      <div className="flex items-center gap-1 mt-3">
        {steps.map((step, i) => {
          const StepIcon = step.icon;
          const isActive = i <= currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <div key={step.key} className="flex items-center">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${
                isCurrent ? "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-300" :
                isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-400"
              }`}>
                <StepIcon className="w-3 h-3" />
                {step.label}
              </div>
              {i < steps.length - 1 && (
                <ArrowLeft className={`w-3 h-3 mx-0.5 ${isActive ? "text-green-400" : "text-gray-300"}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <AdminLayout title="إدارة الحجوزات" description={`إجمالي ${bookings?.length || 0} حجز`}>
      <div className="space-y-4">
        {/* فلاتر سريعة */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "الكل", color: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
            { key: "pending", label: "معلق", color: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100" },
            { key: "confirmed", label: "مؤكد", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
            { key: "completed", label: "مكتمل", color: "bg-green-50 text-green-700 hover:bg-green-100" },
            { key: "cancelled", label: "ملغي", color: "bg-red-50 text-red-700 hover:bg-red-100" },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setStatusFilter(filter.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                statusFilter === filter.key
                  ? "ring-2 ring-yellow-400 shadow-sm " + filter.color
                  : filter.color
              }`}
            >
              {filter.label} ({statusCounts[filter.key as keyof typeof statusCounts]})
            </button>
          ))}
        </div>

        {/* زر حذف الكل */}
        {filteredBookings && filteredBookings.length > 0 && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              className="text-red-500 hover:text-red-700 hover:bg-red-50 text-sm"
              onClick={() => {
                const ids = filteredBookings.map((b: any) => b.id);
                deleteMultipleBookings.mutate({ ids });
              }}
              disabled={deleteMultipleBookings.isPending}
            >
              <Trash2 className="w-4 h-4 ml-1.5" />
              {deleteMultipleBookings.isPending ? "جاري الحذف..." : `حذف الكل (${filteredBookings.length})`}
            </Button>
          </div>
        )}

        {/* بحث + فلترة تاريخ */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="بحث بالاسم، الهاتف، أو الخدمة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="all">كل الأوقات</option>
                <option value="today">اليوم</option>
                <option value="week">آخر أسبوع</option>
                <option value="month">آخر شهر</option>
              </select>
            </div>
          </div>
        </div>

        {/* بطاقات الحجوزات */}
        <div className="space-y-3">
          {filteredBookings?.map((booking: any) => (
            <div key={booking.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* معلومات الحجز */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono text-gray-400">#{booking.id}</span>
                    {getStatusBadge(booking.status)}
                    {booking.technicianName && (
                      <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Wrench className="w-3 h-3" />
                        {booking.technicianName}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-base font-bold text-gray-900 mb-1">{booking.name}</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <a href={`tel:${booking.phone}`} className="hover:text-yellow-600">{booking.phone}</a>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-gray-400" />
                      {booking.service}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {booking.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {booking.date} - {booking.time}
                    </span>
                  </div>

                  {booking.carBrand && (
                    <span className="inline-flex items-center gap-1 mt-2 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                      <Car className="w-3 h-3" />
                      {booking.carBrand} {booking.carModel} {booking.carYear || ""}
                    </span>
                  )}

                  {/* رحلة الطلب */}
                  {getOrderJourney(booking.status)}
                </div>

                {/* أزرار الإجراءات */}
                <div className="flex flex-col gap-2 min-w-[180px]">
                  {booking.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white w-full"
                        onClick={() => updateStatus.mutate({ id: booking.id, status: "confirmed" })}
                      >
                        <CheckCircle className="w-4 h-4 ml-1.5" />
                        قبول الطلب
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="w-full"
                        onClick={() => updateStatus.mutate({ id: booking.id, status: "cancelled" })}
                      >
                        <XCircle className="w-4 h-4 ml-1.5" />
                        إلغاء الطلب
                      </Button>
                    </>
                  )}
                  
                  {booking.status === "confirmed" && (
                    <>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                        onClick={() => updateStatus.mutate({ id: booking.id, status: "completed" })}
                      >
                        <CheckCircle className="w-4 h-4 ml-1.5" />
                        إتمام الطلب
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => updateStatus.mutate({ id: booking.id, status: "cancelled" })}
                      >
                        <XCircle className="w-4 h-4 ml-1.5" />
                        إلغاء
                      </Button>
                    </>
                  )}

                  {(booking.status === "pending" || booking.status === "confirmed") && (
                    <Select
                      onValueChange={(techId) => {
                        const tech = technicians?.find((t: any) => t.id.toString() === techId);
                        assignTechnician.mutate({ bookingId: booking.id, technicianId: parseInt(techId), technicianName: tech?.name || "" });
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="تخصيص فني..." />
                      </SelectTrigger>
                      <SelectContent>
                        {technicians?.filter((t: any) => t.status === "available").map((tech: any) => (
                          <SelectItem key={tech.id} value={tech.id.toString()}>
                            {tech.name} - {tech.specialization || "عام"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full text-gray-500 hover:text-blue-600"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <Eye className="w-4 h-4 ml-1.5" />
                    التفاصيل
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => deleteBooking.mutate({ id: booking.id })}
                  >
                    <Trash2 className="w-4 h-4 ml-1.5" />
                    حذف
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {(!filteredBookings || filteredBookings.length === 0) && (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">لا توجد حجوزات مطابقة</p>
            </div>
          )}
        </div>

        {/* Modal تفاصيل الحجز */}
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedBooking(null)}>
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">تفاصيل الحجز #{selectedBooking.id}</h3>
                <button onClick={() => setSelectedBooking(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">العميل</p>
                    <p className="text-sm font-medium">{selectedBooking.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">الهاتف</p>
                    <p className="text-sm font-medium" dir="ltr">{selectedBooking.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">الخدمة</p>
                    <p className="text-sm font-medium">{selectedBooking.service}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">الموقع</p>
                    <p className="text-sm font-medium">{selectedBooking.location}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">التاريخ</p>
                    <p className="text-sm font-medium">{selectedBooking.date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">الوقت</p>
                    <p className="text-sm font-medium">{selectedBooking.time}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">السيارة</p>
                    <p className="text-sm font-medium">
                      {selectedBooking.carBrand && selectedBooking.carModel
                        ? `${selectedBooking.carBrand} ${selectedBooking.carModel} ${selectedBooking.carYear || ""}`
                        : "غير محدد"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">الحالة</p>
                    {getStatusBadge(selectedBooking.status)}
                  </div>
                </div>

                {selectedBooking.technicianName && (
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs text-purple-600 mb-1">الفني المعين</p>
                    <p className="text-sm font-bold text-purple-800">{selectedBooking.technicianName}</p>
                  </div>
                )}

                {selectedBooking.notes && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">ملاحظات</p>
                    <p className="text-sm bg-gray-50 rounded-lg p-3">{selectedBooking.notes}</p>
                  </div>
                )}

                {/* رحلة الطلب في التفاصيل */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-500 mb-2">رحلة الطلب</p>
                  {selectedBooking.status === "cancelled" ? (
                    <div className="bg-red-50 rounded-lg p-3 text-center">
                      <XCircle className="w-6 h-6 text-red-500 mx-auto mb-1" />
                      <p className="text-sm font-medium text-red-700">تم إلغاء هذا الطلب</p>
                    </div>
                  ) : (
                    getOrderJourney(selectedBooking.status)
                  )}
                </div>

                {/* تعيين فني */}
                {(selectedBooking.status === "pending" || selectedBooking.status === "confirmed") && (
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                      <UserCheck className="w-3 h-3" /> تعيين فني
                    </p>
                    <Select
                      onValueChange={(techId) => {
                        const tech = technicians?.find((t: any) => t.id.toString() === techId);
                        assignTechnician.mutate({ bookingId: selectedBooking.id, technicianId: parseInt(techId), technicianName: tech?.name || "" });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر فني..." />
                      </SelectTrigger>
                      <SelectContent>
                        {technicians?.filter((t: any) => t.status === "available").map((tech: any) => (
                          <SelectItem key={tech.id} value={tech.id.toString()}>
                            {tech.name} - {tech.specialization || "عام"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* أزرار الإجراءات */}
                <div className="border-t border-gray-100 pt-4 flex flex-wrap gap-2">
                  {selectedBooking.status === "pending" && (
                    <>
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white flex-1"
                        onClick={() => {
                          updateStatus.mutate({ id: selectedBooking.id, status: "confirmed" });
                          setSelectedBooking({ ...selectedBooking, status: "confirmed" });
                        }}
                      >
                        <CheckCircle className="w-4 h-4 ml-1.5" />
                        قبول
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => {
                          updateStatus.mutate({ id: selectedBooking.id, status: "cancelled" });
                          setSelectedBooking({ ...selectedBooking, status: "cancelled" });
                        }}
                      >
                        <XCircle className="w-4 h-4 ml-1.5" />
                        إلغاء
                      </Button>
                    </>
                  )}
                  {selectedBooking.status === "confirmed" && (
                    <>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                        onClick={() => {
                          updateStatus.mutate({ id: selectedBooking.id, status: "completed" });
                          setSelectedBooking({ ...selectedBooking, status: "completed" });
                        }}
                      >
                        <CheckCircle className="w-4 h-4 ml-1.5" />
                        إتمام
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => {
                          updateStatus.mutate({ id: selectedBooking.id, status: "cancelled" });
                          setSelectedBooking({ ...selectedBooking, status: "cancelled" });
                        }}
                      >
                        <XCircle className="w-4 h-4 ml-1.5" />
                        إلغاء
                      </Button>
                    </>
                  )}
                </div>

                {/* زر الحذف النهائي */}
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <Button
                    variant="ghost"
                    className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => deleteBooking.mutate({ id: selectedBooking.id })}
                  >
                    <Trash2 className="w-4 h-4 ml-1.5" />
                    حذف الحجز نهائياً
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
