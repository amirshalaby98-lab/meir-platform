import { useRoute } from "wouter";
import { trpc } from "../../lib/trpc";
import { ArrowRight, User, Mail, Phone, Calendar, Shield, Activity } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/AdminLayout";
import { Link } from "wouter";

export default function UserDetail() {
  const [, params] = useRoute("/admin/users/:id");
  const userId = params?.id ? parseInt(params.id) : 0;

  const { data: user, isLoading } = trpc.users.getById.useQuery({ id: userId }, { enabled: userId > 0 });

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

        </div>
      </div>
    </AdminLayout>
  );
}
