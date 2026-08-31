import { useState } from "react";
import { trpc } from "../../lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { toast } from "sonner";
import { Loader2, Eye, CheckCircle, MessageCircle, UserCheck, FileText } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "بانتظار الدفع",
  pending: "بانتظار تعيين مهندس",
  assigned: "معيّن لمهندس",
  in_progress: "جاري العمل عليها",
  completed: "مكتملة",
  cancelled: "ملغاة",
};

const STATUS_COLORS: Record<string, string> = {
  pending_payment: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
  assigned: "bg-indigo-100 text-indigo-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default function ConsultationsAdmin() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showAssignModal, setShowAssignModal] = useState<number | null>(null);
  const [showReportModal, setShowReportModal] = useState<number | null>(null);
  const [engineerId, setEngineerId] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [recommendations, setRecommendations] = useState("");

  const { data: consultations, isLoading, refetch } = trpc.consultations.getAll.useQuery();
  const { data: details, isLoading: detailsLoading } = trpc.consultations.getById.useQuery(
    { id: selectedId! },
    { enabled: !!selectedId }
  );

  const confirmPaymentMutation = trpc.consultations.confirmPayment.useMutation({
    onSuccess: () => {
      toast.success("تم تأكيد الدفع");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const assignEngineerMutation = trpc.consultations.assignEngineer.useMutation({
    onSuccess: () => {
      toast.success("تم تعيين المهندس");
      setShowAssignModal(null);
      setEngineerId("");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const addReportMutation = trpc.consultations.addReport.useMutation({
    onSuccess: () => {
      toast.success("تم إرسال التقرير");
      setShowReportModal(null);
      setDiagnosis("");
      setRecommendations("");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <AdminLayout title="الاستشارات الفنية" description="متابعة طلبات الاستشارة، الدفعات، وتعيين المهندسين">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">الاستشارات ({consultations?.length || 0})</h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
        </div>
      ) : !consultations?.length ? (
        <Card className="p-12 text-center">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">لا توجد استشارات بعد</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {consultations.map((c: any) => {
            const isSelected = selectedId === c.id;
            return (
              <Card key={c.id} className={`overflow-hidden ${isSelected ? "ring-2 ring-yellow-400" : ""}`}>
                <div className="p-4">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-gray-900">استشارة #{c.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.status] || "bg-gray-100 text-gray-800"}`}>
                          {STATUS_LABELS[c.status] || c.status}
                        </span>
                        <span className="text-xs text-gray-500">{c.consultationType} - {c.price} ريال</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1">{c.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedId(isSelected ? null : c.id)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      {c.status === "pending" && (
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs" onClick={() => setShowAssignModal(c.id)}>
                          <UserCheck className="w-3 h-3 ml-1" /> تعيين مهندس
                        </Button>
                      )}
                      {(c.status === "assigned" || c.status === "in_progress") && (
                        <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-black text-xs" onClick={() => setShowReportModal(c.id)}>
                          <FileText className="w-3 h-3 ml-1" /> إضافة تقرير
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="border-t bg-gray-50 p-4">
                    {detailsLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : details ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border rounded-lg p-3">
                          <h4 className="font-bold text-sm mb-2">بيانات السيارة والمشكلة</h4>
                          <p className="text-sm">{(details.vehicleInfo as any)?.make} {(details.vehicleInfo as any)?.model} {(details.vehicleInfo as any)?.year}</p>
                          <p className="text-sm text-gray-600 mt-1">{details.description}</p>
                        </div>
                        <div className="bg-white border rounded-lg p-3">
                          <h4 className="font-bold text-sm mb-2">الدفعات</h4>
                          {!details.payments?.length ? (
                            <p className="text-sm text-gray-400">لا توجد دفعات مسجّلة بعد</p>
                          ) : (
                            details.payments.map((p: any) => (
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
                                        onClick={() => confirmPaymentMutation.mutate({ paymentId: p.id, consultationId: c.id })}
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
                      </div>
                    ) : null}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* تعيين مهندس */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">تعيين مهندس للاستشارة</h3>
            <div>
              <label className="text-sm font-medium text-gray-700">رقم المهندس (ID)</label>
              <Input type="number" value={engineerId} onChange={(e) => setEngineerId(e.target.value)} placeholder="أدخل رقم المستخدم" />
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="ghost" onClick={() => setShowAssignModal(null)}>إلغاء</Button>
              <Button
                onClick={() => assignEngineerMutation.mutate({ consultationId: showAssignModal, engineerId: parseInt(engineerId, 10) })}
                disabled={assignEngineerMutation.isPending || !engineerId}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {assignEngineerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "تعيين"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* إضافة تقرير */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">إضافة تقرير المهندس</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">التشخيص</label>
                <textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} className="w-full mt-1 p-2 border rounded-md min-h-20" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">التوصيات</label>
                <textarea value={recommendations} onChange={(e) => setRecommendations(e.target.value)} className="w-full mt-1 p-2 border rounded-md min-h-20" />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="ghost" onClick={() => setShowReportModal(null)}>إلغاء</Button>
              <Button
                onClick={() =>
                  addReportMutation.mutate({
                    consultationId: showReportModal,
                    diagnosis,
                    recommendations,
                    severity: "medium",
                  })
                }
                disabled={addReportMutation.isPending || !diagnosis.trim() || !recommendations.trim()}
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                {addReportMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "إرسال"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
