import { useState } from "react";
import { trpc } from "../../lib/trpc";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { toast } from "sonner";
import {
  Loader2,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  FileText,
  Eye,
  UserCheck,
  CreditCard,
  BarChart3,
  Filter,
  RefreshCw,
} from "lucide-react";

// حالات الطلب
const ALL_STATUSES = [
  { value: "", label: "الكل" },
  { value: "pending_payment", label: "بانتظار الدفع" },
  { value: "paid", label: "مدفوع" },
  { value: "assigned", label: "معين لفني" },
  { value: "accepted", label: "مقبول" },
  { value: "en_route", label: "في الطريق" },
  { value: "arrived", label: "وصل" },
  { value: "diagnosing", label: "جاري التشخيص" },
  { value: "diagnosis_complete", label: "اكتمل التشخيص" },
  { value: "quote_sent", label: "تم إرسال العرض" },
  { value: "quote_approved", label: "العميل وافق" },
  { value: "repair_payment_pending", label: "بانتظار دفع الصيانة" },
  { value: "repair_paid", label: "تم دفع الصيانة" },
  { value: "repairing", label: "جاري الصيانة" },
  { value: "repair_complete", label: "انتهت الصيانة" },
  { value: "completed", label: "مكتمل" },
];

const STATUS_COLORS: Record<string, string> = {
  pending_payment: "bg-red-100 text-red-800",
  paid: "bg-blue-100 text-blue-800",
  assigned: "bg-indigo-100 text-indigo-800",
  accepted: "bg-purple-100 text-purple-800",
  en_route: "bg-violet-100 text-violet-800",
  arrived: "bg-cyan-100 text-cyan-800",
  diagnosing: "bg-orange-100 text-orange-800",
  diagnosis_complete: "bg-teal-100 text-teal-800",
  quote_sent: "bg-yellow-100 text-yellow-800",
  quote_approved: "bg-lime-100 text-lime-800",
  repair_payment_pending: "bg-amber-100 text-amber-800",
  repair_paid: "bg-emerald-100 text-emerald-800",
  repairing: "bg-rose-100 text-rose-800",
  repair_complete: "bg-green-100 text-green-800",
  completed: "bg-green-200 text-green-900",
};

export default function ServiceOrdersAdmin() {
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [technicianId, setTechnicianId] = useState("");
  const [technicianName, setTechnicianName] = useState("");
  const [showAssignModal, setShowAssignModal] = useState<number | null>(null);

  // جلب الإحصائيات
  const { data: stats } = trpc.serviceOrders.getStats.useQuery();

  // جلب الطلبات
  const { data: orders, isLoading, refetch } = trpc.serviceOrders.getAllOrders.useQuery(
    statusFilter ? { status: statusFilter } : undefined
  );

  // جلب تفاصيل طلب
  const { data: orderDetails, isLoading: detailsLoading } = trpc.serviceOrders.getOrderDetails.useQuery(
    { orderId: selectedOrderId! },
    { enabled: !!selectedOrderId }
  );

  // تأكيد الدفع
  const confirmPaymentMutation = trpc.serviceOrders.confirmPayment.useMutation({
    onSuccess: () => {
      toast.success("تم تأكيد الدفع");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  // تعيين فني
  const assignTechMutation = trpc.serviceOrders.assignTechnician.useMutation({
    onSuccess: () => {
      toast.success("تم تعيين الفني");
      setShowAssignModal(null);
      setTechnicianId("");
      setTechnicianName("");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  // إصدار فاتورة
  const issueInvoiceMutation = trpc.serviceOrders.issueInvoice.useMutation({
    onSuccess: (data) => {
      toast.success(`تم إصدار الفاتورة رقم ${data.invoiceNumber}`);
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleAssignTechnician = (orderId: number) => {
    if (!technicianId || !technicianName) {
      toast.error("أدخل رقم الفني واسمه");
      return;
    }
    assignTechMutation.mutate({
      orderId,
      technicianId: parseInt(technicianId),
      technicianName,
    });
  };

  const handleIssueInvoice = (order: any) => {
    const items = [
      { description: "رسوم الكشف والتشخيص", quantity: 1, unitPrice: 200, total: 200 },
    ];
    if (order.repairCost && parseFloat(order.repairCost) > 0) {
      items.push({ description: "أعمال الصيانة والإصلاح", quantity: 1, unitPrice: parseFloat(order.repairCost), total: parseFloat(order.repairCost) });
    }
    const subtotal = items.reduce((s, i) => s + i.total, 0);
    const tax = subtotal * 0.15;
    issueInvoiceMutation.mutate({
      orderId: order.id,
      items,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      totalAmount: (subtotal + tax).toFixed(2),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">إدارة طلبات الخدمة</h1>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 ml-1" /> تحديث
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-gray-500">إجمالي الطلبات</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-gray-500">بانتظار الإجراء</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-xs text-gray-500">طلبات نشطة</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{parseFloat(stats.revenue || "0").toLocaleString()}</p>
                  <p className="text-xs text-gray-500">الإيرادات (ريال)</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm bg-white"
          >
            {ALL_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <span className="text-sm text-gray-500">{orders?.length || 0} طلب</span>
        </div>

        {/* Orders Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
          </div>
        ) : !orders?.length ? (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد طلبات</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map((order: any) => {
              const statusLabel = ALL_STATUSES.find((s) => s.value === order.status)?.label || order.status;
              const statusColor = STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800";
              const isSelected = selectedOrderId === order.id;

              return (
                <Card key={order.id} className={`overflow-hidden ${isSelected ? "ring-2 ring-yellow-400" : ""}`}>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-gray-900">#{order.orderNumber}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                            {statusLabel}
                          </span>
                          {order.technicianName && (
                            <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs">
                              <UserCheck className="w-3 h-3 inline ml-1" />
                              {order.technicianName}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-gray-600">
                          <div><strong>العميل:</strong> {order.customerName}</div>
                          <div><strong>الهاتف:</strong> {order.customerPhone}</div>
                          <div><strong>التاريخ:</strong> {new Date(order.createdAt).toLocaleDateString("ar-SA")}</div>
                          <div><strong>رسوم الكشف:</strong> {order.inspectionFee} ريال</div>
                        </div>
                        {order.complaint && (
                          <p className="text-sm text-gray-500 mt-2 line-clamp-1">
                            <strong>الشكوى:</strong> {order.complaint}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mr-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedOrderId(isSelected ? null : order.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {/* تأكيد الدفع */}
                        {order.status === "pending_payment" && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white text-xs"
                            onClick={() => {
                              // نحتاج paymentId - نجلب التفاصيل أولاً
                              setSelectedOrderId(order.id);
                            }}
                          >
                            <CreditCard className="w-3 h-3 ml-1" />
                            تأكيد الدفع
                          </Button>
                        )}

                        {/* تعيين فني */}
                        {order.status === "paid" && !order.technicianId && (
                          <Button
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                            onClick={() => setShowAssignModal(order.id)}
                          >
                            <UserCheck className="w-3 h-3 ml-1" />
                            تعيين فني
                          </Button>
                        )}

                        {/* إصدار فاتورة */}
                        {order.status === "repair_complete" && (
                          <Button
                            size="sm"
                            className="bg-yellow-500 hover:bg-yellow-600 text-black text-xs"
                            onClick={() => handleIssueInvoice(order)}
                            disabled={issueInvoiceMutation.isPending}
                          >
                            <FileText className="w-3 h-3 ml-1" />
                            إصدار فاتورة
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Details Panel */}
                  {isSelected && orderDetails && (
                    <div className="border-t bg-gray-50 p-4">
                      {detailsLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Vehicle Info */}
                          {orderDetails.vehicle && (
                            <div className="bg-white border rounded-lg p-3">
                              <h4 className="font-bold text-sm mb-2">بيانات السيارة</h4>
                              <div className="text-sm space-y-1">
                                <p>{orderDetails.vehicle.brand} {orderDetails.vehicle.model} {orderDetails.vehicle.year}</p>
                                {orderDetails.vehicle.plateNumber && <p>اللوحة: {orderDetails.vehicle.plateNumber}</p>}
                                {orderDetails.vehicle.vin && <p>VIN: {orderDetails.vehicle.vin}</p>}
                              </div>
                            </div>
                          )}

                          {/* Payments */}
                          {orderDetails.payments?.length > 0 && (
                            <div className="bg-white border rounded-lg p-3">
                              <h4 className="font-bold text-sm mb-2">المدفوعات</h4>
                              {orderDetails.payments.map((p: any) => (
                                <div key={p.id} className="flex items-center justify-between text-sm border-b last:border-0 py-1">
                                  <span>{p.paymentType === "inspection" ? "كشف" : "صيانة"} - {p.amount} ريال</span>
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-xs ${
                                      p.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                    }`}>
                                      {p.status === "confirmed" ? "مؤكد" : "بانتظار التأكيد"}
                                    </span>
                                    {p.status === "pending" && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-green-600 text-xs h-6"
                                        onClick={() => confirmPaymentMutation.mutate({ paymentId: p.id, orderId: order.id })}
                                        disabled={confirmPaymentMutation.isPending}
                                      >
                                        <CheckCircle className="w-3 h-3 ml-1" /> تأكيد
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Status History */}
                          {orderDetails.statusHistory?.length > 0 && (
                            <div className="bg-white border rounded-lg p-3 md:col-span-2">
                              <h4 className="font-bold text-sm mb-2">سجل الحالات</h4>
                              <div className="space-y-1 max-h-40 overflow-y-auto">
                                {orderDetails.statusHistory.map((h: any, idx: number) => (
                                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                                    <span className="text-gray-400">{new Date(h.createdAt).toLocaleString("ar-SA")}</span>
                                    <span className="font-medium">{h.fromStatus || "جديد"} → {h.toStatus}</span>
                                    {h.notes && <span className="text-gray-500">({h.notes})</span>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* OBD Results */}
                          {orderDetails.scanResults?.length > 0 && (
                            <div className="bg-white border rounded-lg p-3 md:col-span-2">
                              <h4 className="font-bold text-sm mb-2">نتائج فحص OBD</h4>
                              {orderDetails.scanResults.map((scan: any, idx: number) => (
                                <div key={idx} className="text-sm">
                                  {scan.storedCodes?.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {scan.storedCodes.map((c: any, i: number) => (
                                        <span key={i} className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs">
                                          {c.code}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {scan.technicianDiagnosis && <p className="mt-1 text-gray-600">{scan.technicianDiagnosis}</p>}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Invoice */}
                          {orderDetails.invoice && (
                            <div className="bg-white border rounded-lg p-3 md:col-span-2">
                              <h4 className="font-bold text-sm mb-2">الفاتورة</h4>
                              <div className="text-sm">
                                <p>رقم الفاتورة: {orderDetails.invoice.invoiceNumber}</p>
                                <p>الإجمالي: {orderDetails.invoice.totalAmount} ريال</p>
                                <p>الحالة: {orderDetails.invoice.status === "issued" ? "صادرة" : orderDetails.invoice.status}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Assign Technician Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md p-6">
              <h3 className="text-lg font-bold mb-4">تعيين فني للطلب</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">رقم الفني (ID)</label>
                  <Input
                    type="number"
                    value={technicianId}
                    onChange={(e) => setTechnicianId(e.target.value)}
                    placeholder="أدخل رقم الفني"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">اسم الفني</label>
                  <Input
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    placeholder="أدخل اسم الفني"
                  />
                </div>
                <div className="flex gap-2 justify-end mt-4">
                  <Button variant="ghost" onClick={() => setShowAssignModal(null)}>إلغاء</Button>
                  <Button
                    onClick={() => handleAssignTechnician(showAssignModal)}
                    disabled={assignTechMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {assignTechMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-1" /> : <UserCheck className="w-4 h-4 ml-1" />}
                    تعيين
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
