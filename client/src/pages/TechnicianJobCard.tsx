import { useState, useRef } from "react";
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
  Camera,
  Wrench,
  Navigation,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Send,
  Plus,
  Trash2,
} from "lucide-react";

// حالات الطلب مع الترجمة
const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  assigned: { label: "معين لك", color: "bg-blue-100 text-blue-800", icon: Clock },
  accepted: { label: "مقبول", color: "bg-indigo-100 text-indigo-800", icon: CheckCircle },
  en_route: { label: "في الطريق", color: "bg-purple-100 text-purple-800", icon: Navigation },
  arrived: { label: "وصلت", color: "bg-cyan-100 text-cyan-800", icon: MapPin },
  diagnosing: { label: "جاري التشخيص", color: "bg-orange-100 text-orange-800", icon: Wrench },
  diagnosis_complete: { label: "اكتمل التشخيص", color: "bg-teal-100 text-teal-800", icon: FileText },
  quote_sent: { label: "تم إرسال العرض", color: "bg-yellow-100 text-yellow-800", icon: Send },
  quote_approved: { label: "العميل وافق", color: "bg-green-100 text-green-800", icon: CheckCircle },
  repair_payment_pending: { label: "بانتظار دفع الصيانة", color: "bg-amber-100 text-amber-800", icon: Clock },
  repair_paid: { label: "تم الدفع", color: "bg-lime-100 text-lime-800", icon: CheckCircle },
  repairing: { label: "جاري الصيانة", color: "bg-rose-100 text-rose-800", icon: Wrench },
  repair_complete: { label: "انتهت الصيانة", color: "bg-emerald-100 text-emerald-800", icon: CheckCircle },
  completed: { label: "مكتمل", color: "bg-green-100 text-green-800", icon: CheckCircle },
};

// الحالات التالية المسموحة لكل حالة
const NEXT_STATUS: Record<string, string[]> = {
  assigned: ["accepted"],
  accepted: ["en_route"],
  en_route: ["arrived"],
  arrived: ["diagnosing"],
  diagnosing: ["diagnosis_complete"],
  diagnosis_complete: ["quote_sent"],
  quote_approved: ["repair_payment_pending", "repairing"],
  repair_paid: ["repairing"],
  repairing: ["repair_complete"],
};

interface QuoteItem {
  description: string;
  partName?: string;
  partCost?: number;
  laborHours?: number;
  laborCost?: number;
  total: number;
}

export default function TechnicianJobCard() {
  const { user, loading } = useAuth();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([{ description: "", total: 0 }]);
  const [quoteNotes, setQuoteNotes] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoType, setPhotoType] = useState<"before" | "after" | "during">("before");

  // التحقق من حالة موافقة الفني
  const { data: myRegistration, isLoading: regLoading } = trpc.technician.getMyRegistration.useQuery(
    undefined,
    { enabled: !!user && user.role === 'technician' }
  );

  // جلب طلبات الفني
  const { data: orders, isLoading, refetch } = trpc.serviceOrders.getTechnicianOrders.useQuery();

  // جلب تفاصيل الطلب المحدد
  const { data: orderDetails, isLoading: detailsLoading } = trpc.serviceOrders.getOrderDetails.useQuery(
    { orderId: selectedOrderId! },
    { enabled: !!selectedOrderId }
  );

  // تحديث الحالة
  const updateStatusMutation = trpc.serviceOrders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة الطلب");
      refetch();
      setStatusNotes("");
    },
    onError: (err) => toast.error(err.message),
  });

  // رفع صورة
  const uploadPhotoMutation = trpc.serviceOrders.uploadPhoto.useMutation({
    onSuccess: () => {
      toast.success("تم رفع الصورة بنجاح");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  // إنشاء عرض صيانة
  const createQuoteMutation = trpc.serviceOrders.createRepairQuote.useMutation({
    onSuccess: () => {
      toast.success("تم إرسال عرض الصيانة للعميل");
      setShowQuoteForm(false);
      setQuoteItems([{ description: "", total: 0 }]);
      setQuoteNotes("");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  // حفظ نتائج OBD
  const saveScanMutation = trpc.serviceOrders.saveScanResults.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ نتائج الفحص");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  // حماية الصفحة - فقط الفنيين والمديرين
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  if (!user || (user.role !== 'technician' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <Card className="p-8 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">غير مصرح</h2>
          <p className="text-gray-500">هذه الصفحة متاحة للفنيين فقط. تواصل مع الإدارة لتفعيل حسابك كفني.</p>
        </Card>
      </div>
    );
  }

  // Guard: منع الفني غير الموافق عليه من الوصول
  if (user.role === 'technician' && !regLoading && myRegistration && myRegistration.status) {
    if (myRegistration.status === 'pending') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
          <Card className="p-8 text-center max-w-md">
            <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">طلبك قيد المراجعة</h2>
            <p className="text-gray-500">تم استلام طلب تسجيلك كفني وهو قيد المراجعة من الإدارة. سيتم إشعارك فور الموافقة.</p>
          </Card>
        </div>
      );
    }
    if (myRegistration.status === 'rejected') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
          <Card className="p-8 text-center max-w-md">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">تم رفض طلبك</h2>
            <p className="text-gray-500">للأسف تم رفض طلب تسجيلك كفني. يمكنك التواصل مع الإدارة لمزيد من التفاصيل.</p>
          </Card>
        </div>
      );
    }
  }
  if (user.role === 'technician' && !regLoading && !myRegistration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <Card className="p-8 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">لم تكمل التسجيل</h2>
          <p className="text-gray-500">يرجى إكمال نموذج تسجيل الفني أولاً.</p>
          <a href="/technician-registration" className="mt-4 inline-block text-yellow-600 underline">إكمال التسجيل</a>
        </Card>
      </div>
    );
  }

  const handleUpdateStatus = (orderId: number, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, newStatus, notes: statusNotes || undefined });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, orderId: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("حجم الصورة يتجاوز 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadPhotoMutation.mutate({ orderId, photoType, photoBase64: base64, caption: "" });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitQuote = (orderId: number) => {
    const validItems = quoteItems.filter((i) => i.description && i.total > 0);
    if (!validItems.length) {
      toast.error("أضف بند واحد على الأقل");
      return;
    }
    const subtotal = validItems.reduce((sum, i) => sum + i.total, 0);
    const tax = subtotal * 0.15; // 15% VAT
    const totalAmount = subtotal + tax;
    createQuoteMutation.mutate({
      orderId,
      items: validItems,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      notes: quoteNotes || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
        <Card className="p-8 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">يرجى تسجيل الدخول</h2>
          <p className="text-gray-600">هذه الصفحة مخصصة للفنيين المسجلين</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6" dir="rtl">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">لوحة الفني - طلبات الخدمة</h1>
            <p className="text-gray-500 text-sm mt-1">مرحباً {user.name || "فني"}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
              {orders?.length || 0} طلب
            </span>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-5xl mx-auto space-y-4">
        {!orders?.length ? (
          <Card className="p-12 text-center">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600">لا توجد طلبات حالياً</h3>
            <p className="text-gray-400 mt-2">ستظهر الطلبات المعينة لك هنا</p>
          </Card>
        ) : (
          orders.map((order: any) => {
            const statusInfo = STATUS_MAP[order.status] || { label: order.status, color: "bg-gray-100 text-gray-800", icon: Clock };
            const StatusIcon = statusInfo.icon;
            const isExpanded = expandedOrder === order.id;
            const nextStatuses = NEXT_STATUS[order.status] || [];

            return (
              <Card key={order.id} className="overflow-hidden border-r-4 border-r-yellow-400">
                {/* Order Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setExpandedOrder(isExpanded ? null : order.id);
                    if (!isExpanded) setSelectedOrderId(order.id);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-lg text-gray-900">#{order.orderNumber}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3 inline ml-1" />
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          <span>{order.customerName} - {order.customerPhone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{order.customerLocation || "لم يحدد"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(order.createdAt).toLocaleDateString("ar-SA")}</span>
                        </div>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t bg-white p-4 space-y-4">
                    {/* الشكوى */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <h4 className="font-bold text-red-800 text-sm mb-1">شكوى العميل:</h4>
                      <p className="text-red-700 text-sm">{order.complaint}</p>
                    </div>

                    {/* بيانات السيارة */}
                    {detailsLoading ? (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">جاري تحميل التفاصيل...</span>
                      </div>
                    ) : orderDetails?.vehicle ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h4 className="font-bold text-blue-800 text-sm mb-2 flex items-center gap-1">
                          <Car className="w-4 h-4" /> بيانات السيارة
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div><span className="text-blue-600">الماركة:</span> {orderDetails.vehicle.brand}</div>
                          <div><span className="text-blue-600">الموديل:</span> {orderDetails.vehicle.model}</div>
                          <div><span className="text-blue-600">السنة:</span> {orderDetails.vehicle.year}</div>
                          {orderDetails.vehicle.plateNumber && (
                            <div><span className="text-blue-600">اللوحة:</span> {orderDetails.vehicle.plateNumber}</div>
                          )}
                          {orderDetails.vehicle.vin && (
                            <div><span className="text-blue-600">VIN:</span> {orderDetails.vehicle.vin}</div>
                          )}
                          {orderDetails.vehicle.color && (
                            <div><span className="text-blue-600">اللون:</span> {orderDetails.vehicle.color}</div>
                          )}
                          {orderDetails.vehicle.mileage && (
                            <div><span className="text-blue-600">الكيلومتر:</span> {orderDetails.vehicle.mileage?.toLocaleString()}</div>
                          )}
                        </div>
                      </div>
                    ) : null}

                    {/* نتائج الفحص */}
                    {orderDetails?.scanResults?.length ? (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <h4 className="font-bold text-orange-800 text-sm mb-2">نتائج فحص OBD:</h4>
                        {orderDetails.scanResults.map((scan: any, idx: number) => (
                          <div key={idx} className="text-sm space-y-1">
                            {scan.storedCodes?.length > 0 && (
                              <div>
                                <span className="font-medium text-orange-700">أكواد مخزنة:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {scan.storedCodes.map((c: any, i: number) => (
                                    <span key={i} className="bg-orange-200 text-orange-800 px-2 py-0.5 rounded text-xs">
                                      {c.code} {c.description && `- ${c.description}`}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {scan.technicianDiagnosis && (
                              <p className="text-orange-700 mt-2"><strong>التشخيص:</strong> {scan.technicianDiagnosis}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {/* عرض الصيانة */}
                    {orderDetails?.quotes?.length ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <h4 className="font-bold text-green-800 text-sm mb-2">عرض الصيانة:</h4>
                        {orderDetails.quotes.map((q: any, idx: number) => (
                          <div key={idx} className="text-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">الإجمالي: {q.totalAmount} ريال</span>
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                q.status === "approved" ? "bg-green-200 text-green-800" :
                                q.status === "rejected" ? "bg-red-200 text-red-800" :
                                "bg-yellow-200 text-yellow-800"
                              }`}>
                                {q.status === "approved" ? "موافق" : q.status === "rejected" ? "مرفوض" : "بانتظار الموافقة"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {/* الإجراءات */}
                    <div className="border-t pt-4 space-y-3">
                      {/* أزرار تحديث الحالة */}
                      {nextStatuses.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="ملاحظات (اختياري)"
                              value={statusNotes}
                              onChange={(e) => setStatusNotes(e.target.value)}
                              className="flex-1 text-sm"
                            />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {nextStatuses.map((ns) => {
                              const nsInfo = STATUS_MAP[ns] || { label: ns, color: "" };
                              return (
                                <Button
                                  key={ns}
                                  size="sm"
                                  onClick={() => handleUpdateStatus(order.id, ns)}
                                  disabled={updateStatusMutation.isPending}
                                  className="bg-yellow-500 hover:bg-yellow-600 text-black text-xs"
                                >
                                  {updateStatusMutation.isPending ? (
                                    <Loader2 className="w-3 h-3 animate-spin ml-1" />
                                  ) : null}
                                  تحديث إلى: {nsInfo.label}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* رفع صورة */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <select
                          value={photoType}
                          onChange={(e) => setPhotoType(e.target.value as any)}
                          className="border rounded px-2 py-1 text-sm"
                        >
                          <option value="before">صورة قبل</option>
                          <option value="during">صورة أثناء</option>
                          <option value="after">صورة بعد (تأكيد الانتهاء)</option>
                        </select>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => photoInputRef.current?.click()}
                          disabled={uploadPhotoMutation.isPending}
                        >
                          <Camera className="w-4 h-4 ml-1" />
                          {uploadPhotoMutation.isPending ? "جاري الرفع..." : "رفع صورة"}
                        </Button>
                        <input
                          ref={photoInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(e, order.id)}
                        />
                      </div>

                      {/* فتح OBD Scanner مرتبط بالطلب */}
                      {(order.status === "arrived" || order.status === "diagnosing") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/obd-scanner?orderId=${order.id}`, '_blank')}
                          className="border-orange-500 text-orange-700 hover:bg-orange-50"
                        >
                          <Wrench className="w-4 h-4 ml-1" />
                          فتح جهاز OBD Scanner
                        </Button>
                      )}

                      {/* عرض صيانة */}
                      {(order.status === "diagnosis_complete" || order.status === "diagnosing") && (
                        <div>
                          {!showQuoteForm ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowQuoteForm(true)}
                              className="border-green-500 text-green-700 hover:bg-green-50"
                            >
                              <FileText className="w-4 h-4 ml-1" />
                              إنشاء عرض صيانة
                            </Button>
                          ) : (
                            <div className="bg-gray-50 border rounded-lg p-4 space-y-3">
                              <h4 className="font-bold text-sm">عرض الصيانة</h4>
                              {quoteItems.map((item, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                  <Input
                                    placeholder="وصف البند"
                                    value={item.description}
                                    onChange={(e) => {
                                      const newItems = [...quoteItems];
                                      newItems[idx].description = e.target.value;
                                      setQuoteItems(newItems);
                                    }}
                                    className="flex-1 text-sm"
                                  />
                                  <Input
                                    type="number"
                                    placeholder="المبلغ"
                                    value={item.total || ""}
                                    onChange={(e) => {
                                      const newItems = [...quoteItems];
                                      newItems[idx].total = parseFloat(e.target.value) || 0;
                                      setQuoteItems(newItems);
                                    }}
                                    className="w-24 text-sm"
                                  />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setQuoteItems(quoteItems.filter((_, i) => i !== idx))}
                                    className="text-red-500"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setQuoteItems([...quoteItems, { description: "", total: 0 }])}
                                className="text-blue-600"
                              >
                                <Plus className="w-4 h-4 ml-1" /> إضافة بند
                              </Button>
                              <Input
                                placeholder="ملاحظات إضافية"
                                value={quoteNotes}
                                onChange={(e) => setQuoteNotes(e.target.value)}
                                className="text-sm"
                              />
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-bold">
                                  الإجمالي (شامل الضريبة): {(quoteItems.reduce((s, i) => s + i.total, 0) * 1.15).toFixed(2)} ريال
                                </span>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="ghost" onClick={() => setShowQuoteForm(false)}>إلغاء</Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleSubmitQuote(order.id)}
                                    disabled={createQuoteMutation.isPending}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    {createQuoteMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin ml-1" /> : <Send className="w-4 h-4 ml-1" />}
                                    إرسال العرض
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
