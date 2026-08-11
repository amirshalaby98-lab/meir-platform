import { useState } from "react";
import { trpc } from "../lib/trpc";
import { useAuth } from "../_core/hooks/useAuth";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import {
  Loader2,
  CheckCircle,
  Clock,
  MapPin,
  Car,
  Phone,
  FileText,
  CreditCard,
  Navigation,
  Wrench,
  AlertTriangle,
  ChevronLeft,
  Package,
} from "lucide-react";

// مراحل الطلب بالترتيب
const ORDER_STAGES = [
  { key: "pending_payment", label: "بانتظار الدفع", icon: CreditCard },
  { key: "paid", label: "تم الدفع", icon: CheckCircle },
  { key: "assigned", label: "تم تعيين فني", icon: Package },
  { key: "en_route", label: "الفني في الطريق", icon: Navigation },
  { key: "arrived", label: "وصل الفني", icon: MapPin },
  { key: "diagnosing", label: "جاري التشخيص", icon: Wrench },
  { key: "diagnosis_complete", label: "اكتمل التشخيص", icon: FileText },
  { key: "quote_sent", label: "عرض الصيانة", icon: FileText },
  { key: "repairing", label: "جاري الصيانة", icon: Wrench },
  { key: "repair_complete", label: "انتهت الصيانة", icon: CheckCircle },
  { key: "completed", label: "مكتمل", icon: CheckCircle },
];

function getStageIndex(status: string): number {
  // Map various statuses to stage index
  const statusMap: Record<string, number> = {
    pending_payment: 0,
    paid: 1,
    assigned: 2,
    accepted: 2,
    en_route: 3,
    arrived: 4,
    diagnosing: 5,
    diagnosis_complete: 6,
    quote_sent: 7,
    quote_approved: 7,
    repair_payment_pending: 7,
    repair_paid: 8,
    repairing: 8,
    repair_complete: 9,
    completed: 10,
  };
  return statusMap[status] ?? 0;
}

export default function OrderTracking() {
  const { user } = useAuth();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // جلب طلبات العميل
  const { data: orders, isLoading } = trpc.serviceOrders.getMyOrders.useQuery();

  // جلب تفاصيل الطلب المحدد
  const { data: orderDetails, isLoading: detailsLoading, refetch } = trpc.serviceOrders.getOrderDetails.useQuery(
    { orderId: selectedOrderId! },
    { enabled: !!selectedOrderId }
  );

  // موافقة على عرض الصيانة
  const approveQuoteMutation = trpc.serviceOrders.approveQuote.useMutation({
    onSuccess: () => {
      toast.success("تمت الموافقة على عرض الصيانة. يرجى دفع المبلغ.");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  // دفع ثاني (صيانة)
  const submitPaymentMutation = trpc.serviceOrders.submitPayment.useMutation({
    onSuccess: () => {
      toast.success("تم إرسال إثبات الدفع. سيتم التحقق منه قريباً.");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  // إلغاء الطلب
  const cancelOrderMutation = trpc.serviceOrders.cancelOrder.useMutation({
    onSuccess: () => {
      toast.success("تم إلغاء الطلب بنجاح");
      setSelectedOrderId(null);
      window.location.reload();
    },
    onError: (err) => toast.error(err.message),
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
        <Card className="p-8 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">يرجى تسجيل الدخول</h2>
          <p className="text-gray-600">لتتبع طلباتك يرجى تسجيل الدخول أولاً</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  // عرض تفاصيل طلب واحد
  if (selectedOrderId && orderDetails) {
    const stageIndex = getStageIndex(orderDetails.order.status);

    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6" dir="rtl">
        <div className="max-w-3xl mx-auto">
          {/* Back button */}
          <Button variant="ghost" onClick={() => setSelectedOrderId(null)} className="mb-4">
            <ChevronLeft className="w-4 h-4 ml-1" /> العودة للطلبات
          </Button>

          {/* Order Header */}
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">طلب #{orderDetails.order.orderNumber}</h2>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                {ORDER_STAGES[stageIndex]?.label || orderDetails.order.status}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="relative mb-6">
              <div className="flex justify-between items-center">
                {ORDER_STAGES.map((stage, idx) => {
                  const isCompleted = idx <= stageIndex;
                  const isCurrent = idx === stageIndex;
                  const StageIcon = stage.icon;
                  return (
                    <div key={stage.key} className="flex flex-col items-center relative z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs
                        ${isCompleted ? "bg-yellow-500 text-black" : "bg-gray-200 text-gray-500"}
                        ${isCurrent ? "ring-2 ring-yellow-300 ring-offset-2" : ""}
                      `}>
                        {isCompleted ? <CheckCircle className="w-4 h-4" /> : <StageIcon className="w-4 h-4" />}
                      </div>
                      <span className={`text-[10px] mt-1 text-center max-w-[60px] leading-tight ${isCurrent ? "font-bold text-yellow-700" : "text-gray-500"}`}>
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* Progress line */}
              <div className="absolute top-4 right-4 left-4 h-0.5 bg-gray-200 -z-0">
                <div
                  className="h-full bg-yellow-500 transition-all duration-500"
                  style={{ width: `${(stageIndex / (ORDER_STAGES.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Vehicle Info */}
          {orderDetails.vehicle && (
            <Card className="p-4 mb-4">
              <h3 className="font-bold text-sm mb-2 flex items-center gap-1">
                <Car className="w-4 h-4" /> بيانات السيارة
              </h3>
              <p className="text-sm text-gray-700">
                {orderDetails.vehicle.brand} {orderDetails.vehicle.model} {orderDetails.vehicle.year}
                {orderDetails.vehicle.plateNumber && ` - ${orderDetails.vehicle.plateNumber}`}
              </p>
            </Card>
          )}

          {/* Complaint */}
          <Card className="p-4 mb-4">
            <h3 className="font-bold text-sm mb-2">الشكوى</h3>
            <p className="text-sm text-gray-700">{orderDetails.order.complaint}</p>
          </Card>

          {/* Technician Info */}
          {orderDetails.order.technicianName && (
            <Card className="p-4 mb-4">
              <h3 className="font-bold text-sm mb-2 flex items-center gap-1">
                <Phone className="w-4 h-4" /> الفني المعين
              </h3>
              <p className="text-sm text-gray-700">{orderDetails.order.technicianName}</p>
            </Card>
          )}

          {/* OBD Scan Results */}
          {orderDetails.scanResults?.length > 0 && (
            <Card className="p-4 mb-4">
              <h3 className="font-bold text-sm mb-2">تقرير التشخيص</h3>
              {orderDetails.scanResults.map((scan: any, idx: number) => (
                <div key={idx} className="text-sm space-y-2">
                  {scan.storedCodes?.length > 0 && (
                    <div>
                      <p className="font-medium text-orange-700 mb-1">أكواد الأعطال المكتشفة:</p>
                      <div className="flex flex-wrap gap-1">
                        {scan.storedCodes.map((c: any, i: number) => (
                          <span key={i} className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                            {c.code} {c.description && `- ${c.description}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {scan.storedCodes?.length === 0 && (
                    <p className="text-green-600 font-medium">لا توجد أكواد أعطال مخزنة ✓</p>
                  )}
                  {scan.technicianDiagnosis && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2">
                      <p className="font-medium text-blue-800">تشخيص الفني:</p>
                      <p className="text-blue-700">{scan.technicianDiagnosis}</p>
                    </div>
                  )}
                  {scan.recommendations && (
                    <div className="bg-green-50 border border-green-200 rounded p-2">
                      <p className="font-medium text-green-800">التوصيات:</p>
                      <p className="text-green-700">{scan.recommendations}</p>
                    </div>
                  )}
                </div>
              ))}
            </Card>
          )}

          {/* Repair Quote - Customer Action */}
          {orderDetails.quotes?.length > 0 && (
            <Card className="p-4 mb-4 border-2 border-yellow-300">
              <h3 className="font-bold text-sm mb-3">عرض الصيانة</h3>
              {orderDetails.quotes.map((q: any) => (
                <div key={q.id} className="space-y-2">
                  {q.items && Array.isArray(q.items) && (
                    <div className="space-y-1">
                      {(q.items as any[]).map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm border-b py-1">
                          <span>{item.description}</span>
                          <span className="font-medium">{item.total} ريال</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between text-sm pt-2">
                    <span>المجموع الفرعي:</span>
                    <span>{q.subtotal} ريال</span>
                  </div>
                  {q.tax && parseFloat(q.tax) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>الضريبة (15%):</span>
                      <span>{q.tax} ريال</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base border-t pt-2">
                    <span>الإجمالي:</span>
                    <span>{q.totalAmount} ريال</span>
                  </div>
                  {q.notes && <p className="text-xs text-gray-500 mt-1">ملاحظات: {q.notes}</p>}

                  {/* Approve/Reject buttons */}
                  {q.status === "pending" && orderDetails.order.status === "quote_sent" && (
                    <div className="flex gap-2 mt-4">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => approveQuoteMutation.mutate({ quoteId: q.id, orderId: orderDetails.order.id })}
                        disabled={approveQuoteMutation.isPending}
                      >
                        {approveQuoteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-1" /> : <CheckCircle className="w-4 h-4 ml-1" />}
                        موافق - ابدأ الصيانة
                      </Button>
                    </div>
                  )}

                  {/* Payment for repair */}
                  {(q.status === "approved" && (orderDetails.order.status === "quote_approved" || orderDetails.order.status === "repair_payment_pending")) && (
                    <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mt-3">
                      <p className="text-sm font-medium text-yellow-800 mb-2">يرجى تحويل مبلغ {q.totalAmount} ريال</p>
                      <p className="text-xs text-yellow-700 mb-2">بنك الراجحي - SA0000000000000000000000</p>
                      <Button
                        size="sm"
                        className="bg-yellow-500 hover:bg-yellow-600 text-black"
                        onClick={() => {
                          submitPaymentMutation.mutate({
                            orderId: orderDetails.order.id,
                            paymentType: "repair",
                            amount: q.totalAmount,
                            paymentMethod: "bank_transfer",
                            reference: `REP-${Date.now()}`,
                          });
                        }}
                        disabled={submitPaymentMutation.isPending}
                      >
                        {submitPaymentMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin ml-1" /> : <CreditCard className="w-4 h-4 ml-1" />}
                        تأكيد التحويل
                      </Button>
                    </div>
                  )}

                  {q.status === "approved" && (
                    <p className="text-green-600 text-sm font-medium mt-2">✓ تمت الموافقة</p>
                  )}
                </div>
              ))}
            </Card>
          )}

          {/* Invoice */}
          {orderDetails.invoice && (
            <Card className="p-4 mb-4 bg-green-50 border-green-300">
              <h3 className="font-bold text-sm mb-2 text-green-800">الفاتورة النهائية</h3>
              <div className="text-sm space-y-1">
                <p>رقم الفاتورة: {orderDetails.invoice.invoiceNumber}</p>
                <p className="text-lg font-bold text-green-700">الإجمالي: {orderDetails.invoice.totalAmount} ريال</p>
              </div>
            </Card>
          )}

          {/* زر إلغاء الطلب */}
          {!['completed', 'cancelled', 'repairing', 'repair_complete'].includes(orderDetails.order.status) && (
            <Card className="p-4 mb-4 border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">هل تريد إلغاء هذا الطلب؟</p>
                  <p className="text-xs text-gray-500">لا يمكن التراجع بعد الإلغاء</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm('هل أنت متأكد من إلغاء الطلب؟')) {
                      cancelOrderMutation.mutate({ orderId: orderDetails.order.id });
                    }
                  }}
                  disabled={cancelOrderMutation.isPending}
                >
                  {cancelOrderMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin ml-1" /> : null}
                  إلغاء الطلب
                </Button>
              </div>
            </Card>
          )}

          {/* حالة ملغي */}
          {orderDetails.order.status === 'cancelled' && (
            <Card className="p-4 mb-4 bg-red-50 border-red-300">
              <p className="text-red-700 font-bold text-center">تم إلغاء هذا الطلب</p>
            </Card>
          )}

          {/* Status History */}
          {orderDetails.statusHistory?.length > 0 && (
            <Card className="p-4">
              <h3 className="font-bold text-sm mb-3">سجل التحديثات</h3>
              <div className="space-y-2">
                {orderDetails.statusHistory.map((h: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-gray-700">{h.notes || `${h.fromStatus || "جديد"} → ${h.toStatus}`}</p>
                      <p className="text-xs text-gray-400">{new Date(h.createdAt).toLocaleString("ar-SA")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Orders List
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">طلباتي</h1>

        {!orders?.length ? (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600">لا توجد طلبات</h3>
            <p className="text-gray-400 mt-2">يمكنك إنشاء طلب جديد من صفحة طلب الخدمة</p>
            <Button className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black" onClick={() => window.location.href = "/service-request"}>
              طلب خدمة جديد
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map((order: any) => {
              const stageIndex = getStageIndex(order.status);
              const stageLabel = ORDER_STAGES[stageIndex]?.label || order.status;

              return (
                <Card
                  key={order.id}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow border-r-4 border-r-yellow-400"
                  onClick={() => setSelectedOrderId(order.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold">#{order.orderNumber}</span>
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
                          {stageLabel}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-1">{order.complaint}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString("ar-SA")}</p>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-gray-400" />
                  </div>
                  {/* Mini progress */}
                  <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full transition-all"
                      style={{ width: `${((stageIndex + 1) / ORDER_STAGES.length) * 100}%` }}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
