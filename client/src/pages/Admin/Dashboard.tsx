import { useState, useEffect } from "react";
import { Link } from "wouter";
import { trpc } from "../../lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import {
  LayoutDashboard,
  Users,
  Car,
  Wrench,
  Calendar,
  TrendingUp,
  Package,
  Clock,
  BarChart3,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  AlertCircle,
  XCircle,
  DollarSign,
  Activity,
  Zap,
  UserPlus,
  Bell,
  Store,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function AdminDashboardContent() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalUsers: 0,
    totalTechnicians: 0,
    availableTechnicians: 0,
    totalBrands: 0,
    totalModels: 0,
    totalParts: 0,
    todayBookings: 0,
    totalRevenue: 0,
    avgRating: 0,
  });

  const { data: bookings } = trpc.admin.getBookings.useQuery();
  const { data: users } = trpc.getUsers.useQuery();
  const { data: technicians } = trpc.technician.getAll.useQuery();
  const { data: brands } = trpc.getCarBrands.useQuery();
  const { data: models } = trpc.getCarModels.useQuery();
  const { data: parts } = trpc.getServiceParts.useQuery();
  const { data: reviews } = trpc.review.getAll.useQuery();
  const { data: revenueData } = trpc.reports.getRevenue.useQuery({ period: 'week' });
  const { data: pendingTechs } = trpc.technician.getPending.useQuery(undefined, { retry: false });
  const { data: pendingVendors } = trpc.vendors.getPendingVendors.useQuery(undefined, { retry: false });

  useEffect(() => {
    if (bookings && users && technicians && brands && models && parts) {
      const today = new Date().toISOString().split("T")[0];
      const todayBookingsCount = bookings.filter(
        (b: any) => b.createdAt?.toISOString?.()?.split("T")[0] === today
      ).length;

      const avgRating = reviews?.length
        ? (reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : "0";

      setStats({
        totalBookings: bookings.length,
        pendingBookings: bookings.filter((b: any) => b.status === "pending").length,
        confirmedBookings: bookings.filter((b: any) => b.status === "confirmed").length,
        completedBookings: bookings.filter((b: any) => b.status === "completed").length,
        cancelledBookings: bookings.filter((b: any) => b.status === "cancelled").length,
        totalUsers: users.length,
        totalTechnicians: technicians.length,
        availableTechnicians: technicians.filter((t: any) => t.status === "available").length,
        totalBrands: brands.length,
        totalModels: models.length,
        totalParts: parts.length,
        todayBookings: todayBookingsCount,
        totalRevenue: revenueData?.values?.reduce((a: number, b: number) => a + b, 0) || 0,
        avgRating: parseFloat(avgRating as string),
      });
    }
  }, [bookings, users, technicians, brands, models, parts, reviews, revenueData]);

  // بيانات رسم الحجوزات (آخر 7 أيام)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const bookingsByDay = last7Days.map(date => {
    return bookings?.filter((b: any) =>
      b.createdAt?.toISOString?.()?.split('T')[0] === date
    ).length || 0;
  });

  const bookingsChartData = {
    labels: last7Days.map(date => {
      const d = new Date(date);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    }),
    datasets: [
      {
        label: 'الحجوزات',
        data: bookingsByDay,
        borderColor: 'rgb(234, 179, 8)',
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(234, 179, 8)',
        pointBorderWidth: 2,
      },
    ],
  };

  const revenueChartData = {
    labels: revenueData?.labels || last7Days.map(date => {
      const d = new Date(date);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    }),
    datasets: [
      {
        label: 'الإيرادات (ريال)',
        data: revenueData?.values || [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  // بيانات الدونت لحالات الحجوزات
  const statusDoughnutData = {
    labels: ['مكتمل', 'مؤكد', 'معلق', 'ملغي'],
    datasets: [
      {
        data: [stats.completedBookings, stats.confirmedBookings, stats.pendingBookings, stats.cancelledBookings],
        backgroundColor: ['#22c55e', '#3b82f6', '#eab308', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Cairo, sans-serif', size: 11 } },
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { font: { family: 'Cairo, sans-serif', size: 11 } },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        rtl: true,
        labels: { font: { family: 'Cairo, sans-serif', size: 12 }, padding: 15 },
      },
    },
    cutout: '70%',
  };

  const completionRate = stats.totalBookings > 0
    ? Math.round((stats.completedBookings / stats.totalBookings) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* حجوزات اليوم */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="w-3 h-3 ml-0.5" />
              اليوم
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.todayBookings}</p>
          <p className="text-sm text-gray-500 mt-1">حجوزات اليوم</p>
        </div>

        {/* إجمالي الإيرادات */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="w-3 h-3 ml-0.5" />
              هذا الأسبوع
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString()} <span className="text-sm font-normal text-gray-500">ر.س</span></p>
          <p className="text-sm text-gray-500 mt-1">إيرادات الأسبوع</p>
        </div>

        {/* الفنيين المتاحين */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
              {stats.totalTechnicians} إجمالي
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.availableTechnicians}</p>
          <p className="text-sm text-gray-500 mt-1">فنيين متاحين الآن</p>
        </div>

        {/* نسبة الإنجاز */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <span className="flex items-center text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              <Star className="w-3 h-3 ml-0.5" />
              {stats.avgRating}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
          <p className="text-sm text-gray-500 mt-1">نسبة إتمام الحجوزات</p>
        </div>
      </div>

      {/* حالات الحجوزات السريعة */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/admin/bookings">
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-center cursor-pointer hover:bg-yellow-100 transition-colors">
            <AlertCircle className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-yellow-700">{stats.pendingBookings}</p>
            <p className="text-xs text-yellow-600">معلق</p>
          </div>
        </Link>
        <Link href="/admin/bookings">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center cursor-pointer hover:bg-blue-100 transition-colors">
            <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-blue-700">{stats.confirmedBookings}</p>
            <p className="text-xs text-blue-600">مؤكد</p>
          </div>
        </Link>
        <Link href="/admin/bookings">
          <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center cursor-pointer hover:bg-green-100 transition-colors">
            <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-green-700">{stats.completedBookings}</p>
            <p className="text-xs text-green-600">مكتمل</p>
          </div>
        </Link>
        <Link href="/admin/bookings">
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center cursor-pointer hover:bg-red-100 transition-colors">
            <XCircle className="w-5 h-5 text-red-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-red-700">{stats.cancelledBookings}</p>
            <p className="text-xs text-red-600">ملغي</p>
          </div>
        </Link>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Bookings Chart */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">الحجوزات الأخيرة</CardTitle>
                <CardDescription>آخر 7 أيام</CardDescription>
              </div>
              <Link href="/admin/bookings">
                <span className="text-xs text-yellow-600 hover:text-yellow-700 font-medium cursor-pointer">عرض الكل ←</span>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <Line data={bookingsChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Status Doughnut */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">توزيع الحالات</CardTitle>
            <CardDescription>إجمالي {stats.totalBookings} حجز</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <Doughnut data={statusDoughnutData} options={doughnutOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">الإيرادات</CardTitle>
              <CardDescription>إيرادات هذا الأسبوع</CardDescription>
            </div>
            <Link href="/admin/reports">
              <span className="text-xs text-yellow-600 hover:text-yellow-700 font-medium cursor-pointer">تقرير مفصل ←</span>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <Bar data={revenueChartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* إشعارات تحتاج انتباه */}
      {((pendingTechs && pendingTechs.length > 0) || (pendingVendors && pendingVendors.length > 0) || stats.pendingBookings > 0) && (
        <div className="bg-white rounded-xl border border-orange-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-gray-900">تحتاج انتباهك</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {stats.pendingBookings > 0 && (
              <Link href="/admin/bookings">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-100 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors">
                  <div className="w-9 h-9 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-yellow-700" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-yellow-800">{stats.pendingBookings}</p>
                    <p className="text-xs text-yellow-600">حجوزات معلقة</p>
                  </div>
                </div>
              </Link>
            )}
            {pendingTechs && pendingTechs.length > 0 && (
              <Link href="/admin/pending-technicians">
                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserPlus className="w-4 h-4 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-800">{pendingTechs.length}</p>
                    <p className="text-xs text-blue-600">طلبات فنيين جديدة</p>
                  </div>
                </div>
              </Link>
            )}
            {pendingVendors && pendingVendors.length > 0 && (
              <Link href="/admin/vendor-approvals">
                <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-100 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
                  <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center">
                    <Store className="w-4 h-4 text-purple-700" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-purple-800">{pendingVendors.length}</p>
                    <p className="text-xs text-purple-600">طلبات بائعين جديدة</p>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Bottom Section: Recent Bookings + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Bookings Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">آخر الحجوزات</h3>
            <Link href="/admin/bookings">
              <span className="text-xs text-yellow-600 hover:text-yellow-700 font-medium cursor-pointer">عرض الكل ←</span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">العميل</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">الخدمة</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">الحالة</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings?.slice(0, 6).map((booking: any) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{booking.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{booking.service}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        booking.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        booking.status === "confirmed" ? "bg-blue-100 text-blue-700" :
                        booking.status === "completed" ? "bg-green-100 text-green-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {booking.status === "pending" ? "معلق" :
                         booking.status === "confirmed" ? "مؤكد" :
                         booking.status === "completed" ? "مكتمل" : "ملغي"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(booking.createdAt).toLocaleDateString("ar-SA")}
                    </td>
                  </tr>
                ))}
                {(!bookings || bookings.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">
                      لا توجد حجوزات بعد
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions + Stats */}
        <div className="space-y-4">
          {/* إجراءات سريعة */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-3">إجراءات سريعة</h3>
            <div className="space-y-2">
              <Link href="/admin/bookings">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 hover:bg-yellow-100 cursor-pointer transition-colors">
                  <Zap className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">مراجعة الحجوزات المعلقة ({stats.pendingBookings})</span>
                </div>
              </Link>
              <Link href="/admin/brands">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors">
                  <Car className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">إضافة ماركة/موديل</span>
                </div>
              </Link>
              <Link href="/admin/promotions">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 cursor-pointer transition-colors">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">إدارة العروض</span>
                </div>
              </Link>
              <Link href="/admin/reports">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 cursor-pointer transition-colors">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">عرض التقارير</span>
                </div>
              </Link>
            </div>
          </div>

          {/* إحصائيات البيانات */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-3">قاعدة البيانات</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">الماركات</span>
                <span className="text-sm font-bold text-gray-900">{stats.totalBrands}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">الموديلات</span>
                <span className="text-sm font-bold text-gray-900">{stats.totalModels}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">القطع</span>
                <span className="text-sm font-bold text-gray-900">{stats.totalParts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">العملاء</span>
                <span className="text-sm font-bold text-gray-900">{stats.totalUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">التقييمات</span>
                <span className="text-sm font-bold text-gray-900">{reviews?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminLayout title="لوحة التحكم" description="نظرة عامة على أداء المنصة">
      <AdminDashboardContent />
    </AdminLayout>
  );
}
