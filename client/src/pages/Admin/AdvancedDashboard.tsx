import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "../../lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import {
  Users,
  Calendar,
  TrendingUp,
  Wrench,
  Star,
  MessageSquare,
  AlertTriangle,
  Activity,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Trophy,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

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

function AdvancedDashboardContent() {
  const [bookingsPeriod, setBookingsPeriod] = useState<"7days" | "30days" | "90days">("7days");
  const [usersPeriod, setUsersPeriod] = useState<"7days" | "30days" | "90days">("30days");

  // Fetch data
  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } =
    trpc.adminDashboard.getPlatformSummary.useQuery();
  const { data: recentActivity } =
    trpc.adminDashboard.getRecentUserActivity.useQuery({ limit: 15 });
  const { data: bookingsTrend } =
    trpc.adminDashboard.getBookingsTrend.useQuery({ period: bookingsPeriod });
  const { data: techPerformance } =
    trpc.adminDashboard.getTechnicianPerformance.useQuery();
  const { data: contentStats } =
    trpc.adminDashboard.getContentStats.useQuery();
  const { data: userGrowth } =
    trpc.adminDashboard.getUserGrowth.useQuery({ period: usersPeriod });
  const { data: alerts } =
    trpc.adminDashboard.getAlerts.useQuery();
  const { data: topServices } =
    trpc.adminDashboard.getTopServices.useQuery();
  const { data: topLocations } =
    trpc.adminDashboard.getTopLocations.useQuery();

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        rtl: true,
        labels: {
          font: { family: "Cairo, sans-serif", size: 12 },
        },
      },
    },
    scales: {
      x: {
        ticks: { font: { family: "Cairo, sans-serif", size: 11 } },
      },
      y: {
        ticks: { font: { family: "Cairo, sans-serif", size: 11 } },
        beginAtZero: true,
      },
    },
  };

  // Bookings trend chart data
  const bookingsChartData = {
    labels: bookingsTrend?.map((d: any) => {
      const date = new Date(d.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }) || [],
    datasets: [
      {
        label: "إجمالي الحجوزات",
        data: bookingsTrend?.map((d: any) => d.count) || [],
        borderColor: "rgb(250, 204, 21)",
        backgroundColor: "rgba(250, 204, 21, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "مكتملة",
        data: bookingsTrend?.map((d: any) => d.completed) || [],
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: false,
        tension: 0.4,
      },
      {
        label: "ملغاة",
        data: bookingsTrend?.map((d: any) => d.cancelled) || [],
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: false,
        tension: 0.4,
      },
    ],
  };

  // User growth chart data
  const userGrowthChartData = {
    labels: userGrowth?.map((d: any) => {
      const date = new Date(d.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }) || [],
    datasets: [
      {
        label: "مستخدمين جدد",
        data: userGrowth?.map((d: any) => d.count) || [],
        backgroundColor: "rgba(99, 102, 241, 0.8)",
        borderColor: "rgb(99, 102, 241)",
        borderWidth: 2,
      },
    ],
  };

  // Top services chart data
  const servicesChartData = {
    labels: topServices?.map((s: any) => s.service) || [],
    datasets: [
      {
        data: topServices?.map((s: any) => s.count) || [],
        backgroundColor: [
          "rgba(250, 204, 21, 0.8)",
          "rgba(99, 102, 241, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(14, 165, 233, 0.8)",
          "rgba(249, 115, 22, 0.8)",
          "rgba(236, 72, 153, 0.8)",
        ],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  // Rating distribution chart
  const ratingChartData = {
    labels: ["1 نجمة", "2 نجمة", "3 نجوم", "4 نجوم", "5 نجوم"],
    datasets: [
      {
        label: "عدد التقييمات",
        data: [1, 2, 3, 4, 5].map(
          (r) => contentStats?.ratingDistribution?.find((d: any) => d.rating === r)?.count || 0
        ),
        backgroundColor: [
          "rgba(239, 68, 68, 0.8)",
          "rgba(249, 115, 22, 0.8)",
          "rgba(250, 204, 21, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(99, 102, 241, 0.8)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeSince = (date: string | Date) => {
    const now = new Date();
    const d = new Date(date);
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `منذ ${days} يوم`;
    if (hours > 0) return `منذ ${hours} ساعة`;
    if (minutes > 0) return `منذ ${minutes} دقيقة`;
    return "الآن";
  };

  if (summaryLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-yellow-500 mx-auto mb-3" />
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alerts Banner */}
      {alerts && alerts.alertsCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-red-800">
              يوجد {alerts.alertsCount} تنبيه يتطلب انتباهك
            </p>
            <p className="text-sm text-red-600">
              {alerts.stalePendingBookings.length > 0 &&
                `${alerts.stalePendingBookings.length} حجز معلق لأكثر من 24 ساعة • `}
              {alerts.negativeReviews.length > 0 &&
                `${alerts.negativeReviews.length} تقييم سلبي جديد • `}
              {alerts.offlineTechnicians.length > 0 &&
                `${alerts.offlineTechnicians.length} فني غير متصل`}
            </p>
          </div>
          <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
            عرض التفاصيل
          </Button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* المستخدمين */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">المستخدمين</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {summary?.users.total || 0}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">
                    +{summary?.users.newThisWeek || 0} هذا الأسبوع
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* الحجوزات */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">الحجوزات</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {summary?.bookings.total || 0}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Calendar className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-yellow-600 font-medium">
                    {summary?.bookings.today || 0} اليوم
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* معدل الإنجاز */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">معدل الإنجاز</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {summary?.bookings.completionRate || 0}%
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">
                    {summary?.bookings.completed || 0} مكتمل
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* التقييم */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">متوسط التقييم</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {summary?.reviews.averageRating || 0}
                  <span className="text-lg text-gray-400">/5</span>
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm text-gray-500 font-medium">
                    {summary?.reviews.total || 0} تقييم
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-gray-500">حجوزات معلقة</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{summary?.bookings.pending || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Wrench className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-500">فنيين متاحين</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {summary?.technicians.available || 0}/{summary?.technicians.total || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-gray-500">رسائل غير مقروءة</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">{summary?.messages.unread || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-gray-500">تقييمات معلقة</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">{summary?.reviews.pending || 0}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bookings Trend */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">اتجاه الحجوزات</CardTitle>
                <CardDescription>تتبع الحجوزات خلال الفترة المحددة</CardDescription>
              </div>
              <div className="flex gap-1">
                {(["7days", "30days", "90days"] as const).map((p) => (
                  <Button
                    key={p}
                    variant={bookingsPeriod === p ? "default" : "ghost"}
                    size="sm"
                    className={bookingsPeriod === p ? "bg-yellow-500 hover:bg-yellow-600 text-white" : ""}
                    onClick={() => setBookingsPeriod(p)}
                  >
                    {p === "7days" ? "7 أيام" : p === "30days" ? "30 يوم" : "90 يوم"}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <Line data={bookingsChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">نمو المستخدمين</CardTitle>
                <CardDescription>المستخدمين الجدد خلال الفترة</CardDescription>
              </div>
              <div className="flex gap-1">
                {(["7days", "30days", "90days"] as const).map((p) => (
                  <Button
                    key={p}
                    variant={usersPeriod === p ? "default" : "ghost"}
                    size="sm"
                    className={usersPeriod === p ? "bg-indigo-500 hover:bg-indigo-600 text-white" : ""}
                    onClick={() => setUsersPeriod(p)}
                  >
                    {p === "7days" ? "7 أيام" : p === "30days" ? "30 يوم" : "90 يوم"}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <Bar data={userGrowthChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services & Ratings Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Services */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">الخدمات الأكثر طلباً</CardTitle>
            <CardDescription>توزيع الحجوزات حسب نوع الخدمة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center justify-center">
              <Doughnut
                data={servicesChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "right",
                      rtl: true,
                      labels: { font: { family: "Cairo, sans-serif", size: 11 } },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">توزيع التقييمات</CardTitle>
            <CardDescription>عدد التقييمات حسب النجوم</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <Bar
                data={ratingChartData}
                options={{
                  ...chartOptions,
                  indexAxis: "y" as const,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: { display: false },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technician Performance & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Technician Performance */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">أداء الفنيين</CardTitle>
                <CardDescription>ترتيب حسب عدد المهام المنجزة</CardDescription>
              </div>
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[350px] overflow-y-auto">
              {techPerformance?.slice(0, 8).map((tech: any, index: number) => (
                <div
                  key={tech.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0
                        ? "bg-yellow-100 text-yellow-700"
                        : index === 1
                        ? "bg-gray-200 text-gray-700"
                        : index === 2
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{tech.name}</p>
                    <p className="text-xs text-gray-500">
                      {tech.specialization || "عام"} • {tech.location}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-900">
                      {tech.completedBookings}/{tech.assignedBookings}
                    </p>
                    <p className="text-xs text-gray-500">{tech.completionRate}% إنجاز</p>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      tech.status === "available"
                        ? "bg-green-500"
                        : tech.status === "busy"
                        ? "bg-yellow-500"
                        : "bg-gray-400"
                    }`}
                  />
                </div>
              ))}
              {(!techPerformance || techPerformance.length === 0) && (
                <p className="text-center text-gray-500 py-8">لا يوجد فنيين بعد</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent User Activity */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">نشاط المستخدمين</CardTitle>
                <CardDescription>آخر تسجيلات الدخول</CardDescription>
              </div>
              <Activity className="w-5 h-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[350px] overflow-y-auto">
              {recentActivity?.map((user: any) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.name?.charAt(0) || "؟"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.name || "مستخدم"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email || "-"}</p>
                  </div>
                  <div className="text-left shrink-0">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                        user.role === "admin"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {user.role === "admin" ? "مدير" : "مستخدم"}
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {getTimeSince(user.lastSignedIn)}
                    </p>
                  </div>
                </div>
              ))}
              {(!recentActivity || recentActivity.length === 0) && (
                <p className="text-center text-gray-500 py-8">لا يوجد نشاط بعد</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Management Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Reviews */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">تقييمات بانتظار المراجعة</CardTitle>
                <CardDescription>
                  {contentStats?.pendingReviews?.length || 0} تقييم معلق
                </CardDescription>
              </div>
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="text-yellow-600">
                  عرض الكل
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {contentStats?.pendingReviews?.map((review: any) => (
                <div
                  key={review.id}
                  className="p-3 rounded-lg border border-gray-200 hover:border-yellow-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{review.name}</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{review.comment}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
              ))}
              {(!contentStats?.pendingReviews || contentStats.pendingReviews.length === 0) && (
                <div className="text-center py-8">
                  <CheckCircle className="w-10 h-10 text-green-300 mx-auto mb-2" />
                  <p className="text-gray-500">لا يوجد تقييمات معلقة</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Unread Messages */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">رسائل غير مقروءة</CardTitle>
                <CardDescription>
                  {contentStats?.unreadMessages?.length || 0} رسالة جديدة
                </CardDescription>
              </div>
              <Bell className="w-5 h-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {contentStats?.unreadMessages?.map((msg: any) => (
                <div
                  key={msg.id}
                  className="p-3 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{msg.name}</span>
                    <span className="text-xs text-gray-400">
                      {getTimeSince(msg.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{msg.message}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <span>{msg.phone}</span>
                    {msg.email && <span>• {msg.email}</span>}
                  </div>
                </div>
              ))}
              {(!contentStats?.unreadMessages || contentStats.unreadMessages.length === 0) && (
                <div className="text-center py-8">
                  <CheckCircle className="w-10 h-10 text-green-300 mx-auto mb-2" />
                  <p className="text-gray-500">لا يوجد رسائل غير مقروءة</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Locations */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">المواقع الأكثر طلباً</CardTitle>
          <CardDescription>توزيع الحجوزات حسب الموقع الجغرافي</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {topLocations?.map((loc: any, index: number) => (
              <div
                key={loc.location}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
              >
                <MapPin className="w-5 h-5 text-red-500 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{loc.location}</p>
                </div>
                <span className="text-sm font-bold text-gray-700">{loc.count}</span>
              </div>
            ))}
            {(!topLocations || topLocations.length === 0) && (
              <p className="text-gray-500 col-span-full text-center py-4">
                لا يوجد بيانات بعد
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alerts Detail Section */}
      {alerts && alerts.alertsCount > 0 && (
        <Card className="border-0 shadow-md border-t-4 border-t-red-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <CardTitle className="text-lg text-red-700">التنبيهات</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Stale Pending Bookings */}
              {alerts.stalePendingBookings.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">
                    حجوزات معلقة لأكثر من 24 ساعة ({alerts.stalePendingBookings.length})
                  </h4>
                  <div className="space-y-2">
                    {alerts.stalePendingBookings.slice(0, 5).map((booking: any) => (
                      <div
                        key={booking.id}
                        className="flex items-center gap-3 p-2 rounded bg-red-50"
                      >
                        <Clock className="w-4 h-4 text-red-500" />
                        <span className="text-sm flex-1">
                          {booking.name} - {booking.service}
                        </span>
                        <span className="text-xs text-red-600">
                          {getTimeSince(booking.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Negative Reviews */}
              {alerts.negativeReviews.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">
                    تقييمات سلبية حديثة ({alerts.negativeReviews.length})
                  </h4>
                  <div className="space-y-2">
                    {alerts.negativeReviews.map((review: any) => (
                      <div
                        key={review.id}
                        className="flex items-center gap-3 p-2 rounded bg-orange-50"
                      >
                        <Star className="w-4 h-4 text-orange-500" />
                        <span className="text-sm flex-1">
                          {review.name} - {review.rating}/5
                        </span>
                        <span className="text-xs text-orange-600">
                          {getTimeSince(review.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Offline Technicians */}
              {alerts.offlineTechnicians.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">
                    فنيين غير متصلين ({alerts.offlineTechnicians.length})
                  </h4>
                  <div className="space-y-2">
                    {alerts.offlineTechnicians.map((tech: any) => (
                      <div
                        key={tech.id}
                        className="flex items-center gap-3 p-2 rounded bg-gray-100"
                      >
                        <XCircle className="w-4 h-4 text-gray-500" />
                        <span className="text-sm flex-1">
                          {tech.name} - {tech.location}
                        </span>
                        <span className="text-xs text-gray-500">
                          {tech.specialization || "عام"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AdvancedDashboard() {
  return (
    <AdminLayout title="لوحة المراقبة المتقدمة" description="مراقبة نشاط المستخدمين وإدارة محتوى المنصة">
      <AdvancedDashboardContent />
    </AdminLayout>
  );
}
