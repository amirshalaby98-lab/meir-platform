import { Link } from "wouter";
import { trpc } from "../../lib/trpc";
import { ArrowRight, UserCog, Ban, CheckCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import AdminLayout from "@/components/AdminLayout";

export default function UsersManagement() {
  const { data: users, refetch: refetchUsers } = trpc.users.getAll.useQuery();
  const updateUserRole = trpc.users.updateRole.useMutation();
  const toggleUserActive = trpc.users.toggleActive.useMutation({
    onSuccess: () => refetchUsers(),
  });

  const handleUserRoleChange = async (userId: number, newRole: string) => {
    try {
      await updateUserRole.mutateAsync({ id: userId, role: newRole });
      refetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: "bg-purple-100 text-purple-800",
      technician: "bg-blue-100 text-blue-800",
      user: "bg-green-100 text-green-800",
    };
    const labels: Record<string, string> = {
      admin: "مدير",
      technician: "فني",
      user: "عميل",
    };
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[role as keyof typeof styles]}`}>
        {labels[role as keyof typeof labels]}
      </span>
    );
  };

  return (
    <AdminLayout title="إدارة المستخدمين والفنيين">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الاسم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  البريد الإلكتروني
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الدور
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users?.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <Link href={`/admin/users/${user.id}`} className="text-primary hover:underline">
                      {user.name || "بدون اسم"}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Select
                        value={user.role}
                        onValueChange={(v) => handleUserRoleChange(user.id, v)}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">عميل</SelectItem>
                          <SelectItem value="technician">فني</SelectItem>
                          <SelectItem value="admin">مدير</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant={user.isActive === false ? "default" : "destructive"}
                        size="sm"
                        onClick={() => toggleUserActive.mutate({ id: user.id, isActive: user.isActive === false })}
                        title={user.isActive === false ? "تفعيل الحساب" : "تعطيل الحساب"}
                      >
                        {user.isActive === false ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
