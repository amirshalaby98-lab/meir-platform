import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Shield, Users, UserPlus, Settings, Eye, Edit, Trash2, Check, X, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Role {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  color: string;
  permissions: string[];
  usersCount: number;
}

interface Permission {
  id: string;
  name: string;
  category: string;
}

const allPermissions: Permission[] = [
  // الحجوزات
  { id: "bookings.view", name: "عرض الحجوزات", category: "الحجوزات" },
  { id: "bookings.create", name: "إنشاء حجز", category: "الحجوزات" },
  { id: "bookings.edit", name: "تعديل الحجوزات", category: "الحجوزات" },
  { id: "bookings.delete", name: "حذف الحجوزات", category: "الحجوزات" },
  { id: "bookings.assign", name: "تعيين فني", category: "الحجوزات" },
  // الفنيين
  { id: "technicians.view", name: "عرض الفنيين", category: "الفنيين" },
  { id: "technicians.create", name: "إضافة فني", category: "الفنيين" },
  { id: "technicians.edit", name: "تعديل الفنيين", category: "الفنيين" },
  { id: "technicians.delete", name: "حذف الفنيين", category: "الفنيين" },
  // العملاء
  { id: "users.view", name: "عرض العملاء", category: "العملاء" },
  { id: "users.edit", name: "تعديل العملاء", category: "العملاء" },
  { id: "users.delete", name: "حذف العملاء", category: "العملاء" },
  // الأسعار
  { id: "pricing.view", name: "عرض الأسعار", category: "الأسعار" },
  { id: "pricing.edit", name: "تعديل الأسعار", category: "الأسعار" },
  // العروض
  { id: "promotions.view", name: "عرض العروض", category: "العروض" },
  { id: "promotions.create", name: "إنشاء عرض", category: "العروض" },
  { id: "promotions.edit", name: "تعديل العروض", category: "العروض" },
  { id: "promotions.delete", name: "حذف العروض", category: "العروض" },
  // التقارير
  { id: "reports.view", name: "عرض التقارير", category: "التقارير" },
  { id: "reports.export", name: "تصدير التقارير", category: "التقارير" },
  // الإعدادات
  { id: "settings.view", name: "عرض الإعدادات", category: "الإعدادات" },
  { id: "settings.edit", name: "تعديل الإعدادات", category: "الإعدادات" },
  { id: "roles.manage", name: "إدارة الأدوار", category: "الإعدادات" },
];

const defaultRoles: Role[] = [
  {
    id: "admin",
    name: "admin",
    nameAr: "مدير النظام",
    description: "صلاحيات كاملة على جميع أقسام النظام",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    permissions: allPermissions.map((p) => p.id),
    usersCount: 1,
  },
  {
    id: "supervisor",
    name: "supervisor",
    nameAr: "مشرف",
    description: "إدارة الحجوزات والفنيين والعملاء بدون صلاحيات الإعدادات",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    permissions: [
      "bookings.view", "bookings.create", "bookings.edit", "bookings.assign",
      "technicians.view", "technicians.edit",
      "users.view",
      "pricing.view",
      "promotions.view",
      "reports.view",
    ],
    usersCount: 0,
  },
  {
    id: "employee",
    name: "employee",
    nameAr: "موظف",
    description: "عرض وإدارة الحجوزات فقط",
    color: "bg-green-100 text-green-800 border-green-200",
    permissions: [
      "bookings.view", "bookings.create", "bookings.edit", "bookings.assign",
      "technicians.view",
      "users.view",
    ],
    usersCount: 0,
  },
  {
    id: "viewer",
    name: "viewer",
    nameAr: "مشاهد",
    description: "عرض فقط بدون أي صلاحيات تعديل",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    permissions: [
      "bookings.view",
      "technicians.view",
      "users.view",
      "pricing.view",
      "promotions.view",
      "reports.view",
    ],
    usersCount: 0,
  },
];

export default function RolesManagement() {
  const [roles, setRoles] = useState<Role[]>(defaultRoles);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const permissionCategories = Array.from(new Set(allPermissions.map((p) => p.category)));

  const togglePermission = (permId: string) => {
    if (!selectedRole || !isEditing) return;
    if (selectedRole.id === "admin") {
      toast.error("لا يمكن تعديل صلاحيات المدير");
      return;
    }

    const newPermissions = selectedRole.permissions.includes(permId)
      ? selectedRole.permissions.filter((p) => p !== permId)
      : [...selectedRole.permissions, permId];

    setSelectedRole({ ...selectedRole, permissions: newPermissions });
  };

  const saveRole = () => {
    if (!selectedRole) return;
    setRoles(roles.map((r) => (r.id === selectedRole.id ? selectedRole : r)));
    setIsEditing(false);
    toast.success("تم حفظ التغييرات بنجاح");
  };

  return (
    <AdminLayout title="الصلاحيات والأدوار" description="إدارة أدوار المستخدمين وصلاحياتهم">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* قائمة الأدوار */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">الأدوار المتاحة</h3>
            <Button size="sm" variant="outline" className="text-xs" onClick={() => toast.info("قريباً - إضافة دور جديد")}>
              <UserPlus className="w-3 h-3 ml-1" />
              إضافة
            </Button>
          </div>

          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => { setSelectedRole(role); setIsEditing(false); }}
              className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedRole?.id === role.id ? "ring-2 ring-yellow-400 shadow-md" : "border-gray-100"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900">{role.nameAr}</span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${role.color}`}>
                  {role.permissions.length} صلاحية
                </span>
              </div>
              <p className="text-xs text-gray-500">{role.description}</p>
              <div className="flex items-center gap-1 mt-2">
                <Users className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-400">{role.usersCount} مستخدم</span>
              </div>
            </div>
          ))}
        </div>

        {/* تفاصيل الدور */}
        <div className="lg:col-span-2">
          {selectedRole ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-yellow-500" />
                    {selectedRole.nameAr}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">{selectedRole.description}</p>
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button size="sm" onClick={saveRole} className="bg-green-600 hover:bg-green-700 text-white">
                        <Check className="w-4 h-4 ml-1" />
                        حفظ
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setIsEditing(false); setSelectedRole(roles.find(r => r.id === selectedRole.id) || null); }}>
                        <X className="w-4 h-4 ml-1" />
                        إلغاء
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      disabled={selectedRole.id === "admin"}
                    >
                      <Edit className="w-4 h-4 ml-1" />
                      تعديل
                    </Button>
                  )}
                </div>
              </div>

              {/* Permissions Grid */}
              <div className="p-5 space-y-6">
                {permissionCategories.map((category) => {
                  const categoryPerms = allPermissions.filter((p) => p.category === category);
                  const enabledCount = categoryPerms.filter((p) => selectedRole.permissions.includes(p.id)).length;

                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-700">{category}</h4>
                        <span className="text-xs text-gray-400">{enabledCount}/{categoryPerms.length}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {categoryPerms.map((perm) => {
                          const isEnabled = selectedRole.permissions.includes(perm.id);
                          return (
                            <div
                              key={perm.id}
                              onClick={() => togglePermission(perm.id)}
                              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                                isEditing && selectedRole.id !== "admin" ? "cursor-pointer" : "cursor-default"
                              } ${
                                isEnabled
                                  ? "bg-green-50 border-green-200"
                                  : "bg-gray-50 border-gray-100"
                              }`}
                            >
                              <div className={`w-5 h-5 rounded flex items-center justify-center ${
                                isEnabled ? "bg-green-500" : "bg-gray-300"
                              }`}>
                                {isEnabled && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <span className={`text-sm ${isEnabled ? "text-green-800 font-medium" : "text-gray-500"}`}>
                                {perm.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Info */}
              {selectedRole.id === "admin" && (
                <div className="mx-5 mb-5 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                  <Lock className="w-4 h-4 text-yellow-600" />
                  <p className="text-xs text-yellow-700">دور المدير لا يمكن تعديله - يملك جميع الصلاحيات تلقائياً</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
              <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">اختر دوراً من القائمة لعرض صلاحياته</p>
            </div>
          )}
        </div>
      </div>

      {/* ملاحظة */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <h4 className="text-sm font-semibold text-blue-800 mb-1">ملاحظة مهمة</h4>
        <p className="text-xs text-blue-700">
          نظام الصلاحيات جاهز للتوسع. حالياً أنت المدير الوحيد بصلاحيات كاملة. 
          عند إضافة موظفين مستقبلاً، يمكنك تعيين أدوار مختلفة لكل موظف للتحكم في ما يمكنه الوصول إليه.
        </p>
      </div>
    </AdminLayout>
  );
}
