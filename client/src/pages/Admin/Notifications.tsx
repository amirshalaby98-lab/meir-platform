import { useState } from "react";
import { Bell, Trash2, Check } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useToast } from "../../hooks/use-toast";
import { trpc } from "../../lib/trpc";
import AdminLayout from "@/components/AdminLayout";

export default function NotificationsManagement() {
  const { toast } = useToast();
  const [userId] = useState(1); // في الواقع يجب أن يكون من المستخدم الحالي

  const { data: notifications, refetch } = trpc.notifications.getNotifications.useQuery({ userId });
  const { data: unreadCount } = trpc.notifications.getUnreadNotifications.useQuery({ userId });
  
  const markAsRead = trpc.notifications.markNotificationAsRead.useMutation();
  const markAllAsRead = trpc.notifications.markAllNotificationsAsRead.useMutation();
  const deleteNotification = trpc.notifications.deleteNotification.useMutation();

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead.mutateAsync({ id });
      refetch();
      toast({ title: "تم", description: "تم تحديث الإشعار" });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ" });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync({ userId });
      refetch();
      toast({ title: "تم", description: "تم تحديث جميع الإشعارات" });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإشعار؟")) return;
    try {
      await deleteNotification.mutateAsync({ id });
      refetch();
      toast({ title: "تم الحذف", description: "تم حذف الإشعار بنجاح" });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ" });
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      booking: "bg-blue-100 text-blue-800",
      review: "bg-yellow-100 text-yellow-800",
      message: "bg-purple-100 text-purple-800",
      system: "bg-gray-100 text-gray-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      booking: "حجز",
      review: "تقييم",
      message: "رسالة",
      system: "نظام",
    };
    return labels[type] || type;
  };

  return (
    <AdminLayout title="إدارة الإشعارات">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">إجمالي الإشعارات</p>
                <p className="text-3xl font-bold text-gray-900">{notifications?.length || 0}</p>
              </div>
              <Bell className="w-10 h-10 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">إشعارات غير مقروءة</p>
                <p className="text-3xl font-bold text-red-600">{unreadCount?.length || 0}</p>
              </div>
              <Bell className="w-10 h-10 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <Button 
              onClick={handleMarkAllAsRead}
              className="w-full bg-yellow-500 hover:bg-yellow-600"
            >
              <Check className="w-4 h-4 ml-2" />
              تحديث الكل كمقروء
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {notifications && notifications.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {notifications.map((notif: any) => (
                <div
                  key={notif.id}
                  className={`p-6 hover:bg-gray-50 transition ${
                    !notif.isRead ? "bg-yellow-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(
                            notif.type
                          )}`}
                        >
                          {getTypeLabel(notif.type)}
                        </span>
                        {!notif.isRead && (
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {notif.title}
                      </h3>
                      <p className="text-gray-600 mb-2">{notif.message}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(notif.createdAt).toLocaleString("ar-SA")}
                      </p>
                    </div>

                    <div className="flex gap-2 ml-4">
                      {!notif.isRead && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(notif.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد إشعارات</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
