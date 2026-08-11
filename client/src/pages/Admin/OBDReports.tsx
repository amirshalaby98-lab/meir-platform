import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "../../lib/trpc";
import {
  FileText, Activity, AlertTriangle, CheckCircle, Clock,
  ChevronDown, ChevronUp, Wrench, Car, RefreshCw, Filter
} from "lucide-react";

type ReviewStatus = "pending" | "reviewed" | "action_required";

const statusConfig: Record<ReviewStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: "قيد المراجعة",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  reviewed: {
    label: "تمت المراجعة",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  action_required: {
    label: "يحتاج إجراء",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
  },
};

interface DtcCode {
  code: string;
  description?: string;
  severity?: string;
  system?: string;
}

function HealthBar({ score }: { score: number }) {
  const color = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-bold ${score >= 80 ? "text-green-600" : score >= 60 ? "text-yellow-600" : "text-red-600"}`}>
        {score}%
      </span>
    </div>
  );
}

function ReportRow({ report, onUpdate }: { report: any; onUpdate: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(report.technicianNotes || "");
  const [selectedStatus, setSelectedStatus] = useState<ReviewStatus>(report.reviewStatus as ReviewStatus);

  const updateMutation = trpc.obdReports.adminUpdateReviewStatus.useMutation({
    onSuccess: () => {
      setEditingNotes(false);
      onUpdate();
    },
  });

  const dtcCodes = (report.dtcCodes as DtcCode[] | null) ?? [];
  const status = (report.reviewStatus as ReviewStatus) ?? "pending";
  const statusInfo = statusConfig[status];
  const vehicleLabel = [report.make, report.model, report.year].filter(Boolean).join(" ");
  const scanDate = new Date(report.scanDate || report.createdAt);

  const handleSave = () => {
    updateMutation.mutate({
      id: report.id,
      reviewStatus: selectedStatus,
      technicianNotes: notes || undefined,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Car className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-900 text-sm">
                  {vehicleLabel || "سيارة غير محددة"}
                </h3>
                <span className="text-xs text-gray-400">#{report.id}</span>
              </div>
              <p className="text-xs text-gray-400">
                {scanDate.toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" })}
                {" · "}
                المستخدم: {report.userId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border font-medium ${statusInfo.color}`}>
              {statusInfo.icon}
              {statusInfo.label}
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-3 grid grid-cols-4 gap-2">
          <div className="text-center">
            <div className="text-base font-bold text-red-500">{dtcCodes.length}</div>
            <div className="text-[10px] text-gray-400">أعطال</div>
          </div>
          <div className="text-center">
            <div className="text-base font-bold text-gray-700">{report.healthScore ?? 0}%</div>
            <div className="text-[10px] text-gray-400">الصحة</div>
          </div>
          <div className="text-center col-span-2">
            <HealthBar score={report.healthScore ?? 0} />
          </div>
        </div>

        {/* VIN */}
        {report.vin && (
          <p className="mt-2 text-xs font-mono text-gray-400">VIN: {report.vin}</p>
        )}
      </div>

      {/* Expanded Section */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-4">
          {/* DTC Codes */}
          {dtcCodes.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-600 mb-2">أكواد الأعطال ({dtcCodes.length})</h4>
              <div className="flex flex-wrap gap-1.5">
                {dtcCodes.map((dtc, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-lg px-2 py-1.5">
                    <span className={`text-xs font-mono font-bold ${
                      dtc.severity === "high" ? "text-red-600" :
                      dtc.severity === "medium" ? "text-orange-600" :
                      "text-yellow-600"
                    }`}>
                      {dtc.code}
                    </span>
                    {dtc.description && (
                      <p className="text-[10px] text-gray-500 mt-0.5 max-w-xs">{dtc.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technician Notes & Status Update */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs font-bold text-gray-700">ملاحظات الفني وتحديث الحالة</span>
              </div>
              {!editingNotes && (
                <button
                  onClick={() => setEditingNotes(true)}
                  className="text-xs text-blue-500 hover:text-blue-700"
                >
                  تعديل
                </button>
              )}
            </div>

            {editingNotes ? (
              <div className="space-y-2">
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value as ReviewStatus)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="pending">قيد المراجعة</option>
                  <option value="reviewed">تمت المراجعة</option>
                  <option value="action_required">يحتاج إجراء</option>
                </select>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="ملاحظات الفني..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="flex-1 bg-yellow-400 text-black font-bold text-sm py-1.5 rounded-lg hover:bg-yellow-500 transition disabled:opacity-50"
                  >
                    {updateMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                  </button>
                  <button
                    onClick={() => { setEditingNotes(false); setNotes(report.technicianNotes || ""); setSelectedStatus(report.reviewStatus); }}
                    className="px-4 bg-gray-100 text-gray-700 text-sm py-1.5 rounded-lg hover:bg-gray-200 transition"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                {report.technicianNotes || <span className="text-gray-400 italic">لا توجد ملاحظات</span>}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOBDReports() {
  const [filterStatus, setFilterStatus] = useState<ReviewStatus | "all">("all");
  const [page, setPage] = useState(0);
  const limit = 20;

  const statsQuery = trpc.obdReports.adminGetStats.useQuery();
  const reportsQuery = trpc.obdReports.adminGetAllReports.useQuery({
    limit,
    offset: page * limit,
    reviewStatus: filterStatus !== "all" ? filterStatus : undefined,
  });

  const stats = statsQuery.data;

  return (
    <AdminLayout title="تقارير فحص OBD" description="مراجعة تقارير فحص عملاء مير">
      <div className="p-6 space-y-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-xs text-gray-500 mt-1">إجمالي التقارير</div>
            </div>
            <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 text-center">
              <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
              <div className="text-xs text-yellow-600 mt-1">قيد المراجعة</div>
            </div>
            <div className="bg-green-50 rounded-xl border border-green-200 p-4 text-center">
              <div className="text-2xl font-bold text-green-700">{stats.reviewed}</div>
              <div className="text-xs text-green-600 mt-1">تمت المراجعة</div>
            </div>
            <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-center">
              <div className="text-2xl font-bold text-red-700">{stats.actionRequired}</div>
              <div className="text-xs text-red-600 mt-1">يحتاج إجراء</div>
            </div>
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">{stats.avgHealthScore}%</div>
              <div className="text-xs text-blue-600 mt-1">متوسط الصحة</div>
            </div>
          </div>
        )}

        {/* Filter + Refresh */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value as ReviewStatus | "all"); setPage(0); }}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="all">جميع التقارير</option>
              <option value="pending">قيد المراجعة</option>
              <option value="reviewed">تمت المراجعة</option>
              <option value="action_required">يحتاج إجراء</option>
            </select>
          </div>
          <button
            onClick={() => { reportsQuery.refetch(); statsQuery.refetch(); }}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
            تحديث
          </button>
        </div>

        {/* Reports List */}
        {reportsQuery.isLoading ? (
          <div className="text-center py-12 text-gray-400">
            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            جاري التحميل...
          </div>
        ) : reportsQuery.data && reportsQuery.data.length > 0 ? (
          <>
            <div className="space-y-3">
              {reportsQuery.data.map(report => (
                <ReportRow
                  key={report.id}
                  report={report}
                  onUpdate={() => { reportsQuery.refetch(); statsQuery.refetch(); }}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-3 mt-4">
              {page > 0 && (
                <button
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition"
                >
                  السابق
                </button>
              )}
              {reportsQuery.data.length === limit && (
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition"
                >
                  التالي
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <Activity className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-2">لا توجد تقارير</h3>
            <p className="text-gray-400 text-sm">
              {filterStatus !== "all" ? "لا توجد تقارير بهذه الحالة" : "لم يُجرِ أي عميل فحصاً بعد"}
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
