import { useState } from "react";
import { trpc } from "../../lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";
import { Loader2, Eye, CheckCircle, Package, Filter, Truck } from "lucide-react";

const ALL_STATUSES = [
  { value: "", label: "الكل" },
  { value: "pending_payment", label: "بانتظار الدفع" },
  { value: "paid", label: "تم تأكيد الدفع" },
  { value: "processing", label: "جاري التجهيز" },
  { value: "shipped", label: "تم الشحن" },
  { value: "delivered", label: "تم التسليم" },
  { value: "cancelled", label: "ملغي" },
];

const STATUS_COLORS: Record<string, string> = {
  pending_payment: "bg-red-100 text-red-800",
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-yellow-100 text-yellow-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default function ProductOrdersAdmin() {
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const { data: orders, isLoading, refetch } = trpc.productOrders.getAllOrders.useQuery(
    statusFilter ? { status: statusFilter } : undefined
  );
  const { data: orderDetails, isLoading: detailsLoading } = trpc.productOrders.getOrderDetails.useQuery(
    { orderId: selectedOrderId! },
    { enabled: !!selectedOrderId }
  );

  const confirmPaymentMutation = trpc.productOrders.confirmPayment.useMutation({
    onSuccess: () => {
      toast.success("تم تأكيد الدفع");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateFulfillmentMutation = trpc.productOrders.updateFulfillmentStatus.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة الطلب");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <AdminLayout title="طلبات المتجر" description="متابعة طلبات المنتجات والدفعات">
      <div className="flex items-center gap-3 mb-4">
        <Filter className="w-4 h-4 text-gray-500" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">
          {ALL_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <span className="text-sm text-gray-500">{orders?.length || 0} طلب</span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
        </div>
      ) : !orders?.length ? (
        <Card className="p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
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
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-gray-900">#{order.orderNumber}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>{statusLabel}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div><strong>المنتج:</strong> {order.productNameSnapshot} × {order.quantity}</div>
                        <div><strong>العميل:</strong> {order.customerName} - {order.customerPhone}</div>
                        <div><strong>الشحن إلى:</strong> {order.shippingCity} - {order.shippingAddress}</div>
                        <div><strong>الإجمالي:</strong> {order.totalPrice} ريال</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedOrderId(isSelected ? null : order.id)}>
                        <Eye className="w-4 h-4" />
                      </Button>

                      {order.status === "paid" && (
                        <Button
                          size="sm"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                          onClick={() => updateFulfillmentMutation.mutate({ orderId: order.id, status: "processing" })}
                        >
                          <Truck className="w-3 h-3 ml-1" /> بدء التجهيز
                        </Button>
                      )}
                      {order.status === "processing" && (
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                          onClick={() => updateFulfillmentMutation.mutate({ orderId: order.id, status: "shipped" })}
                        >
                          تم الشحن
                        </Button>
                      )}
                      {order.status === "shipped" && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white text-xs"
                          onClick={() => updateFulfillmentMutation.mutate({ orderId: order.id, status: "delivered" })}
                        >
                          تم التسليم
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="border-t bg-gray-50 p-4">
                    {detailsLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : orderDetails ? (
                      <div className="bg-white border rounded-lg p-3">
                        <h4 className="font-bold text-sm mb-2">المدفوعات</h4>
                        {!orderDetails.payments?.length ? (
                          <p className="text-sm text-gray-400">لا توجد دفعات مسجّلة بعد</p>
                        ) : (
                          orderDetails.payments.map((p: any) => (
                            <div key={p.id} className="border-b last:border-0 py-2 space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span>{p.paymentMethod} - {p.amount} ريال</span>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded text-xs ${p.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
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
                              {p.receiptUrl && (
                                <a href={p.receiptUrl} target="_blank" rel="noreferrer">
                                  <img src={p.receiptUrl} alt="إيصال" className="max-h-32 rounded-lg border" />
                                </a>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    ) : null}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
