import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, DollarSign, Package, Car, Calendar, Download } from "lucide-react";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
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
import { Line, Bar, Pie } from 'react-chartjs-2';

// تسجيل مكونات Chart.js
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

type Period = 'today' | 'week' | 'month' | 'year';

export default function Reports() {
  const [period, setPeriod] = useState<Period>('month');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<number | undefined>();

  // جلب بيانات التقارير
  const { data: revenueData, isLoading: revenueLoading } = trpc.reports.getRevenue.useQuery({ period });
  const { data: bookingsData, isLoading: bookingsLoading } = trpc.reports.getBookingsByStatus.useQuery();
  const { data: topParts, isLoading: partsLoading } = trpc.reports.getTopParts.useQuery({ period, limit: 10 });
  type TopPart = { partName: string; count: number };
  type TopBrand = { brandName: string; count: number };
  const { data: topBrands, isLoading: brandsLoading } = trpc.reports.getTopBrands.useQuery({ period, limit: 10 });
  const { data: stats, isLoading: statsLoading } = trpc.reports.getStats.useQuery({ period });
  const { data: topTechniciansData } = trpc.reports.getTopTechnicians.useQuery({ limit: 10 });
  const { data: cancelledData } = trpc.reports.getCancelledBookings.useQuery();

  // دالة تصدير CSV
  const exportToCSV = () => {
    const rows: string[][] = [
      ['التقرير', 'الفترة: ' + period],
      [],
      ['إجمالي الإيرادات', String(stats?.totalRevenue?.toFixed(2) || 0)],
      ['عدد الحجوزات', String(stats?.totalBookings || 0)],
      ['متوسط قيمة الحجز', String(stats?.avgBookingValue?.toFixed(2) || 0)],
      ['معدل الإتمام', String(stats?.completionRate?.toFixed(1) || 0) + '%'],
      [],
      ['القطعة', 'عدد الطلبات'],
      ...(topParts?.map((p: TopPart) => [p.partName, String(p.count)]) || []),
      [],
      ['الماركة', 'عدد الطلبات'],
      ...(topBrands?.map((b: TopBrand) => [b.brandName, String(b.count)]) || []),
    ];

    if (topTechniciansData && topTechniciansData.length > 0) {
      rows.push([], ['الفني', 'التخصص', 'التقييم', 'مكتملة', 'معدل النجاح']);
      topTechniciansData.forEach((t: any) => {
        rows.push([t.name, t.specialty || '', String(t.rating?.toFixed(1)), String(t.completedJobs), t.successRate + '%']);
      });
    }

    if (cancelledData && cancelledData.length > 0) {
      rows.push([], ['العميل', 'السيارة', 'التاريخ', 'السبب']);
      cancelledData.forEach((b: any) => {
        rows.push([b.customerName, b.carBrand + ' ' + b.carModel, b.date, b.reason]);
      });
    }

    const BOM = '\uFEFF';
    const csvContent = BOM + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'meir-report-' + period + '-' + new Date().toISOString().split('T')[0] + '.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // بيانات رسم الإيرادات (Line Chart)
  const revenueChartData = {
    labels: revenueData?.labels || [],
    datasets: [
      {
        label: 'الإيرادات (ريال)',
        data: revenueData?.values || [],
        borderColor: 'rgb(250, 204, 21)',
        backgroundColor: 'rgba(250, 204, 21, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // بيانات رسم الحجوزات حسب الحالة (Pie Chart)
  const bookingsChartData = {
    labels: ['معلق', 'مؤكد', 'مكتمل', 'ملغي'],
    datasets: [
      {
        data: [
          bookingsData?.pending || 0,
          bookingsData?.confirmed || 0,
          bookingsData?.completed || 0,
          bookingsData?.cancelled || 0,
        ],
        backgroundColor: [
          'rgba(251, 191, 36, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(250, 204, 21)',
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // بيانات رسم القطع الأكثر طلباً (Bar Chart)
  const partsChartData = {
    labels: topParts?.map((p: TopPart) => p.partName) || [],
    datasets: [
      {
        label: 'عدد الطلبات',
        data: topParts?.map((p: TopPart) => p.count) || [],
        backgroundColor: 'rgba(250, 204, 21, 0.8)',
        borderColor: 'rgb(250, 204, 21)',
        borderWidth: 2,
      },
    ],
  };

  // بيانات رسم الماركات الأكثر طلباً (Bar Chart)
  const brandsChartData = {
    labels: topBrands?.map((b: TopBrand) => b.brandName) || [],
    datasets: [
      {
        label: 'عدد الطلبات',
        data: topBrands?.map((b: TopBrand) => b.count) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        rtl: true,
        labels: {
          font: {
            family: 'Cairo, sans-serif',
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            family: 'Cairo, sans-serif',
          },
        },
      },
      y: {
        ticks: {
          font: {
            family: 'Cairo, sans-serif',
          },
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        rtl: true,
        labels: {
          font: {
            family: 'Cairo, sans-serif',
          },
        },
      },
    },
  };

  if (revenueLoading || bookingsLoading || partsLoading || brandsLoading || statsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* العنوان والفلتر */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">التقارير والإحصائيات</h1>
          <p className="text-muted-foreground mt-1">تقارير شاملة عن أداء النظام</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCSV()}
            className="flex items-center gap-1"
          >
            <Download className="w-4 h-4" />
            تصدير CSV
          </Button>
          <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="اختر الفترة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">اليوم</SelectItem>
              <SelectItem value="week">هذا الأسبوع</SelectItem>
              <SelectItem value="month">هذا الشهر</SelectItem>
              <SelectItem value="year">هذه السنة</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRevenue?.toFixed(2) || 0} ريال</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.revenueGrowth && stats.revenueGrowth > 0 ? (
                <span className="text-green-500 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +{stats.revenueGrowth.toFixed(1)}% عن الفترة السابقة
                </span>
              ) : (
                <span className="text-red-500 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  {stats?.revenueGrowth?.toFixed(1)}% عن الفترة السابقة
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط قيمة الحجز</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgBookingValue?.toFixed(2) || 0} ريال</div>
            <p className="text-xs text-muted-foreground mt-1">
              لكل حجز في الفترة المحددة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عدد الحجوزات</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBookings || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.bookingsGrowth && stats.bookingsGrowth > 0 ? (
                <span className="text-green-500 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +{stats.bookingsGrowth.toFixed(1)}% عن الفترة السابقة
                </span>
              ) : (
                <span className="text-red-500 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  {stats?.bookingsGrowth?.toFixed(1)}% عن الفترة السابقة
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل الإتمام</CardTitle>
            <Car className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completionRate?.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              من إجمالي الحجوزات
            </p>
          </CardContent>
        </Card>
      </div>

      {/* الرسوم البيانية */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* رسم الإيرادات */}
        <Card>
          <CardHeader>
            <CardTitle>الإيرادات</CardTitle>
            <CardDescription>تطور الإيرادات خلال الفترة المحددة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Line data={revenueChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* رسم الحجوزات حسب الحالة */}
        <Card>
          <CardHeader>
            <CardTitle>الحجوزات حسب الحالة</CardTitle>
            <CardDescription>توزيع الحجوزات حسب حالتها</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Pie data={bookingsChartData} options={pieOptions} />
            </div>
          </CardContent>
        </Card>

        {/* رسم القطع الأكثر طلباً */}
        <Card>
          <CardHeader>
            <CardTitle>القطع الأكثر طلباً</CardTitle>
            <CardDescription>أكثر 10 قطع غيار مطلوبة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Bar data={partsChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* رسم الماركات الأكثر طلباً */}
        <Card>
          <CardHeader>
            <CardTitle>الماركات الأكثر طلباً</CardTitle>
            <CardDescription>أكثر 10 ماركات سيارات مطلوبة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Bar data={brandsChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أفضل الفنيين أداءً */}
      <Card>
        <CardHeader>
          <CardTitle>أفضل الفنيين أداءً</CardTitle>
          <CardDescription>الفنيين الأكثر إنجازاً للحجوزات</CardDescription>
        </CardHeader>
        <CardContent>
          {topTechniciansData && topTechniciansData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">#</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">الاسم</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">التخصص</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">التقييم</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">مكتملة</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">معدل النجاح</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {topTechniciansData.map((tech: any, idx: number) => (
                    <tr key={tech.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">{idx + 1}</td>
                      <td className="px-4 py-2 text-sm font-medium">{tech.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{tech.specialty || '—'}</td>
                      <td className="px-4 py-2 text-sm">⭐ {tech.rating?.toFixed(1)}</td>
                      <td className="px-4 py-2 text-sm">{tech.completedJobs}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${tech.successRate >= 80 ? 'bg-green-100 text-green-800' : tech.successRate >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {tech.successRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">لا توجد بيانات</p>
          )}
        </CardContent>
      </Card>

      {/* تقرير الحجوزات الملغاة */}
      <Card>
        <CardHeader>
          <CardTitle>الحجوزات الملغاة</CardTitle>
          <CardDescription>تقرير الحجوزات الملغاة مع الأسباب</CardDescription>
        </CardHeader>
        <CardContent>
          {cancelledData && cancelledData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">العميل</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">السيارة</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">التاريخ</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">السبب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cancelledData.map((b: any) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm font-medium">{b.customerName}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{b.carBrand} {b.carModel}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{b.date}</td>
                      <td className="px-4 py-2 text-sm text-red-600">{b.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">لا توجد حجوزات ملغاة</p>
          )}
        </CardContent>
      </Card>

      {/* قسم الرسوم البيانية التفاعلية */}
      <div className="mt-8 border-t-2 border-yellow-400 pt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-black">إحصائيات أداء الفنيين</h2>
          <Button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
          >
            {showAnalytics ? 'إخفاء الإحصائيات' : 'عرض الإحصائيات'}
          </Button>
        </div>

        {showAnalytics && (
          <AnalyticsDashboard
            technicianId={selectedTechnicianId}
            showComparison={!selectedTechnicianId}
          />
        )}
      </div>
    </div>
  );
}
