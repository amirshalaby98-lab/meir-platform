import { useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "../../lib/trpc";
import { ArrowRight, User, Mail, Phone, Calendar, Shield, Activity, Wrench, Star, DollarSign, ClipboardList, Save } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/AdminLayout";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function UserDetail() {
  const [, params] = useRoute("/admin/users/:id");
  const userId = params?.id ? parseInt(params.id) : 0;
  const { toast } = useToast();

  const { data: user, isLoading } = trpc.users.getById.useQuery({ id: userId }, { enabled: userId > 0 });

  // Technician stats
  const { data: techStats } = trpc.technician.getStats.useQuery(
    { technicianId: userId },
    { enabled: userId > 0 && (user?.role === "technician" || user?.userType === "technician") }
  );

  // Technician info edit state
  const [specialization, setSpecialization] = useState("");
  const [region, setRegion] = useState("");
  const [editingTechInfo, setEditingTechInfo] = useState(false);

  const updateTechInfo = trpc.technician.updateInfo.useMutation({
    onSuccess: () => {
      toast({ title: "تم التحديث", description: "تم تحديث معلومات الفني بنجاح" });
      setEditingTechInfo(false);
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل تحديث معلومات الفني", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <AdminLayout title="تفاصيل المستخدم">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout title="تفاصيل المستخدم">
        <div className="text-center py-12">
          <p className="text-gray-500">المستخدم غير موجود</p>
          <Link href="/admin/users">
            <Button variant="outline" className="mt-4">
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة للمستخدمين
            </Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const isTechnician = user.role === "technician" || user.userType === "technician";

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = { admin: "مدير", technician: "فني", user: "عميل" };
    return labels[role] || role;
  };

  const getUserTypeLabel = (type: string | null | undefined) => {
    if (!type) return "لم يحدد";
    const labels: Record<string, string> = { customer: "عميل", technician: "فني", service_provider: "مقدم خدمة" };
    return labels[type] || type;
  };

  return (
    <AdminLayout title={`تفاصيل المستخدم: ${user.name || "بدون اسم"}`}>
      <div className="space-y-6">
        <Link href="/admin/users">
          <Button variant="outline" size="sm">
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للمستخدمين
          </Button>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* معلومات أساسية */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5" />
                المعلومات الأساسية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-500">الاسم</span>
                <span className="font-medium">{user.name || "—"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-500 flex items-center gap-1"><Mail className="w-4 h-4" /> البريد</span>
                <span className="font-medium text-sm">{user.email || "—"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-500 flex items-center gap-1"><Phone className="w-4 h-4" /> الهاتف</span>
                <span className="font-medium">{user.phone || "—"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-500">طريقة الدخول</span>
                <span className="font-medium">{user.loginMethod || "—"}</span>
              </div>
            </CardContent>
          </Card>

          {/* الصلاحيات والحالة */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5" />
                الصلاحيات والحالة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-500">الدور</span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                  {getRoleLabel(user.role)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-500">نوع المستخدم</span>
                <span className="font-medium">{getUserTypeLabel(user.userType)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-500">الحالة</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.isActive !== false ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {user.isActive !== false ? "نشط" : "معطل"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* التواريخ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5" />
                التواريخ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-500">تاريخ التسجيل</span>
                <span className="font-medium text-sm">{new Date(user.createdAt).toLocaleDateString("ar-SA")}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-500">آخر تحديث</span>
                <span className="font-medium text-sm">{new Date(user.updatedAt).toLocaleDateString("ar-SA")}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-500">آخر دخول</span>
                <span className="font-medium text-sm">{new Date(user.lastSignedIn).toLocaleDateString("ar-SA")}</span>
              </div>
            </CardContent>
          </Card>

          {/* معرفات النظام */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5" />
                معرفات النظام
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-500">ID</span>
                <span className="font-mono text-sm">{user.id}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-500">OpenID</span>
                <span className="font-mono text-xs truncate max-w-[200px]">{user.openId}</span>
              </div>
            </CardContent>
          </Card>

          {/* إحصائيات الفني */}
          {isTechnician && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wrench className="w-5 h-5 text-yellow-600" />
                  إحصائيات الفني
                </CardTitle>
              </CardHeader>
              <CardContent>
                {techStats ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <ClipboardList className="w-6 h-6 mx-auto text-blue-600 mb-2" />
                      <p className="text-2xl font-bold text-blue-700">{techStats.completedJobs || 0}</p>
                      <p className="text-sm text-gray-600">إجمالي الحجوزات</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <ClipboardList className="w-6 h-6 mx-auto text-green-600 mb-2" />
                      <p className="text-2xl font-bold text-green-700">{techStats.reviewCount || 0}</p>
                      <p className="text-sm text-gray-600">التقييمات</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4 text-center">
                      <Star className="w-6 h-6 mx-auto text-yellow-600 mb-2" />
                      <p className="text-2xl font-bold text-yellow-700">{techStats.averageRating ? Number(techStats.averageRating).toFixed(1) : "—"}</p>
                      <p className="text-sm text-gray-600">متوسط التقييم</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <DollarSign className="w-6 h-6 mx-auto text-purple-600 mb-2" />
                      <p className="text-2xl font-bold text-purple-700">{techStats.successRate || 0}%</p>
                      <p className="text-sm text-gray-600">نسبة النجاح</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">لا توجد إحصائيات بعد</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* تعديل معلومات الفني */}
          {isTechnician && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wrench className="w-5 h-5 text-green-600" />
                  معلومات الفني (التخصص والمنطقة)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editingTechInfo ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">التخصص</label>
                      <input
                        type="text"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        placeholder="مثال: كهرباء، ميكانيكا، برمجة"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">المنطقة</label>
                      <input
                        type="text"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        placeholder="مثال: مكة، جدة، الرياض"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateTechInfo.mutate({ id: userId, specialty: specialization, location: region })}
                        disabled={updateTechInfo.isPending}
                      >
                        <Save className="w-4 h-4 ml-1" />
                        حفظ
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingTechInfo(false)}>
                        إلغاء
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-500">التخصص</span>
                      <span className="font-medium">{(user as any).specialization || "لم يحدد"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-500">المنطقة</span>
                      <span className="font-medium">{(user as any).region || "لم يحدد"}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSpecialization((user as any).specialization || "");
                        setRegion((user as any).region || "");
                        setEditingTechInfo(true);
                      }}
                    >
                      تعديل المعلومات
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
