import { useState, useEffect } from "react";
import { Link } from "wouter";
import { trpc } from "../../lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import {
  Car,
  TrendingUp,
  BarChart3,
  Star,
  ArrowUpRight,
  DollarSign,
  Activity,
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
    totalUsers: 0,
    totalBrands: 0,
    totalModels: 0,
    totalParts: 0,
    totalRevenue: 0,
    avgRating: 0,
  });

  const { data: users } = trpc.users.getAll.useQuery();
  const { data: brands } = trpc.carData.getCarBrands.useQuery();
  const { data: models } = trpc.carData.getCarModels.useQuery();
  const { data: parts } = trpc.carData.getServiceParts.useQuery();
  const { data: reviews } = trpc.review.getAll.useQuery();
  const { data: revenueData } = trpc.reports.getRevenue.useQuery({ period: 'week' });
  const { data: pendingVendors } = trpc.vendors.getPendingVendors.useQuery(undefined, { retry: false });

  useEffect(() => {
    if (users && brands && models && parts) {
      const avgRating = reviews?.length
        ? (reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : "0";

      setStats({
        totalUsers: users.length,
        totalBrands: brands.length,
        totalModels: models.length,
        totalParts: parts.length,
        totalRevenue: revenueData?.values?.reduce((a: number, b: number) => a + b, 0) || 0,
        avgRating: parseFloat(avgRating as string),
      });
    }
  }, [users, brands, models, parts, reviews, revenueData]);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

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

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        {/* متوسط التقييم */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <span className="flex items-center text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              <Star className="w-3 h-3 ml-0.5" />
              {reviews?.length || 0} تقييم
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.avgRating}</p>
          <p className="text-sm text-gray-500 mt-1">متوسط التقييم</p>
        </div>
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
      {(pendingVendors && pendingVendors.length > 0) && (
        <div className="bg-white rounded-xl border border-orange-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-gray-900">تحتاج انتباهك</h3>
          </div>
          <div className="grid grid-cols-1 gap-3">
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

      {/* Bottom Section: Quick Actions + Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* إجراءات سريعة */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-3">إجراءات سريعة</h3>
          <div className="space-y-2">
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
  );
}

export default function AdminDashboard() {
  return (
    <AdminLayout title="لوحة التحكم" description="نظرة عامة على أداء المنصة">
      <AdminDashboardContent />
    </AdminLayout>
  );
}
