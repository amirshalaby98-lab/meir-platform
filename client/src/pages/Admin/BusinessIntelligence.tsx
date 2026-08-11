import { trpc } from "../../lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function BusinessIntelligence() {
  const dashboardStats = trpc.stats.getDashboard.useQuery();
  const bookingsTrend = trpc.adminDashboard.getBookingsTrend.useQuery();

  // Mock data for charts
  const revenueData = [
    { month: "يناير", revenue: 45000, bookings: 120 },
    { month: "فبراير", revenue: 52000, bookings: 145 },
    { month: "مارس", revenue: 48000, bookings: 130 },
    { month: "أبريل", revenue: 61000, bookings: 168 },
    { month: "مايو", revenue: 55000, bookings: 152 },
    { month: "يونيو", revenue: 67000, bookings: 185 },
  ];

  const serviceDistribution = [
    { name: "صيانة دورية", value: 35 },
    { name: "إصلاح أعطال", value: 25 },
    { name: "كهرباء", value: 20 },
    { name: "تكييف", value: 12 },
    { name: "أخرى", value: 8 },
  ];

  const COLORS = ["#FBBF24", "#34D399", "#60A5FA", "#F87171", "#A78BFA"];

  const cityData = [
    { city: "الرياض", bookings: 450 },
    { city: "جدة", bookings: 320 },
    { city: "الدمام", bookings: 180 },
    { city: "مكة", bookings: 150 },
    { city: "المدينة", bookings: 120 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">لوحة ذكاء الأعمال</h1>
        <p className="text-gray-600 mb-8">تحليلات شاملة لأداء المنصة</p>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-yellow-600">{dashboardStats.data?.totalBookings || 0}</p>
              <p className="text-sm text-gray-500">إجمالي الحجوزات</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{dashboardStats.data?.totalTechnicians || 0}</p>
              <p className="text-sm text-gray-500">الفنيين</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{dashboardStats.data?.totalReviews || 0}</p>
              <p className="text-sm text-gray-500">التقييمات</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-purple-600">67,000</p>
              <p className="text-sm text-gray-500">إيرادات الشهر (ريال)</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <Card>
            <CardHeader><CardTitle>الإيرادات الشهرية</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#FBBF24" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Service Distribution */}
          <Card>
            <CardHeader><CardTitle>توزيع الخدمات</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={serviceDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {serviceDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bookings by City */}
          <Card>
            <CardHeader><CardTitle>الحجوزات حسب المدينة</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={cityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="city" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#FBBF24" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bookings Trend */}
          <Card>
            <CardHeader><CardTitle>اتجاه الحجوزات</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="bookings" stroke="#34D399" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Summary Tables */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>أفضل الفنيين</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="text-right py-2">الفني</th><th className="text-center">الحجوزات</th><th className="text-center">التقييم</th></tr></thead>
                <tbody>
                  <tr className="border-b"><td className="py-2">أحمد محمد</td><td className="text-center">45</td><td className="text-center">4.9 ★</td></tr>
                  <tr className="border-b"><td className="py-2">خالد العمري</td><td className="text-center">38</td><td className="text-center">4.8 ★</td></tr>
                  <tr className="border-b"><td className="py-2">محمد السالم</td><td className="text-center">32</td><td className="text-center">4.7 ★</td></tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>أكثر الخدمات طلباً</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="text-right py-2">الخدمة</th><th className="text-center">العدد</th><th className="text-center">الإيرادات</th></tr></thead>
                <tbody>
                  <tr className="border-b"><td className="py-2">تغيير زيت</td><td className="text-center">185</td><td className="text-center">18,500 ر.س</td></tr>
                  <tr className="border-b"><td className="py-2">فحص شامل</td><td className="text-center">120</td><td className="text-center">24,000 ر.س</td></tr>
                  <tr className="border-b"><td className="py-2">إصلاح فرامل</td><td className="text-center">95</td><td className="text-center">19,000 ر.س</td></tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
