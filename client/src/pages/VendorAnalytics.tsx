import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { useAuth } from "../_core/hooks/useAuth";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  ShoppingCart,
  Star,
  Users,
  DollarSign,
  Calendar,
} from "lucide-react";

export function VendorAnalytics() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  if (!user || (user.role !== "admin")) {
    setLocation("/");
    return null;
  }

  // جلب الإحصائيات الأساسية
  const { data: stats, isLoading: statsLoading } =
    trpc.analytics.getVendorStats.useQuery(
      { vendorId: user.id },
      { enabled: !!user }
    );

  // جلب الأرباح الشهرية
  const { data: monthlyData, isLoading: monthlyLoading } =
    trpc.analytics.getMonthlyRevenue.useQuery(
      { vendorId: user.id, year: parseInt(selectedMonth.split("-")[0]) },
      { enabled: !!user }
    );

  // جلب الخدمات الأكثر طلباً
  const { data: topServices, isLoading: servicesLoading } =
    trpc.analytics.getTopServices.useQuery(
      { vendorId: user.id, limit: 10 },
      { enabled: !!user }
    );

  // جلب مقاييس العملاء
  const { data: customerMetrics, isLoading: customersLoading } =
    trpc.analytics.getCustomerMetrics.useQuery(
      { vendorId: user.id, limit: 10 },
      { enabled: !!user }
    );

  // جلب الملخص الشامل
  const { data: summary, isLoading: summaryLoading } =
    trpc.analytics.getSummary.useQuery(
      { vendorId: user.id },
      { enabled: !!user }
    );

  // تحضير بيانات الرسم البياني الخطي
  const chartData = monthlyData?.map((item) => ({
    month: item.month,
    revenue: parseFloat(item.revenue),
    orders: item.orders,
  })) || [];

  // تحضير بيانات الخدمات الأكثر طلباً
  const servicesChartData = topServices?.map((service) => ({
    name: service.serviceName,
    requests: service.totalRequests,
    revenue: parseFloat(service.totalRevenue),
  })) || [];

  // الألوان
  const COLORS = [
    "#FCD34D",
    "#FBBF24",
    "#F59E0B",
    "#D97706",
    "#B45309",
    "#92400E",
    "#78350F",
    "#3F2305",
  ];

  if (statsLoading || summaryLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* رأس الصفحة */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            لوحة التحكم التحليلية
          </h1>
          <p className="text-gray-600">
            مراقبة أداء عملك والإحصائيات الشاملة
          </p>
        </div>

        {/* البطاقات الأساسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* إجمالي الأرباح */}
          <Card className="p-6 bg-white border-l-4 border-l-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  إجمالي الأرباح
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.totalRevenue ? `${stats.totalRevenue} ر.س` : "0"}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          {/* الأرباح الشهرية */}
          <Card className="p-6 bg-white border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  الأرباح الشهرية
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.monthlyRevenue ? `${stats.monthlyRevenue} ر.س` : "0"}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          {/* إجمالي الطلبات */}
          <Card className="p-6 bg-white border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  إجمالي الطلبات
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.totalOrders || 0}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          {/* متوسط التقييم */}
          <Card className="p-6 bg-white border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  متوسط التقييم
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.averageRating ? `${stats.averageRating} / 5` : "0"}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* الرسوم البيانية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* رسم بياني خطي للأرباح الشهرية */}
          <Card className="p-6 bg-white">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              الأرباح الشهرية
            </h2>
            {monthlyLoading ? (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">جاري تحميل البيانات...</p>
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#FCD34D"
                    strokeWidth={2}
                    name="الإيرادات (ر.س)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">لا توجد بيانات متاحة</p>
              </div>
            )}
          </Card>

          {/* رسم بياني دائري للخدمات الأكثر طلباً */}
          <Card className="p-6 bg-white">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              توزيع الطلبات حسب الخدمة
            </h2>
            {servicesLoading ? (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">جاري تحميل البيانات...</p>
              </div>
            ) : servicesChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={servicesChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, requests }) =>
                      `${name}: ${requests}`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="requests"
                  >
                    {servicesChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">لا توجد بيانات متاحة</p>
              </div>
            )}
          </Card>
        </div>

        {/* رسم بياني عمودي للخدمات */}
        <Card className="p-6 bg-white mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            أداء الخدمات
          </h2>
          {servicesLoading ? (
            <div className="h-80 flex items-center justify-center">
              <p className="text-gray-500">جاري تحميل البيانات...</p>
            </div>
          ) : servicesChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={servicesChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="requests" fill="#FCD34D" name="عدد الطلبات" />
                <Bar dataKey="revenue" fill="#FBBF24" name="الإيرادات (ر.س)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <p className="text-gray-500">لا توجد بيانات متاحة</p>
            </div>
          )}
        </Card>

        {/* جدول العملاء المتكررين */}
        <Card className="p-6 bg-white">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            أفضل العملاء
          </h2>
          {customersLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-gray-500">جاري تحميل البيانات...</p>
            </div>
          ) : customerMetrics && customerMetrics.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">
                      معرّف العميل
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">
                      عدد الطلبات
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">
                      إجمالي المبلغ
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">
                      متوسط الطلب
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">
                      آخر طلب
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customerMetrics.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-gray-900">
                        #{customer.customerId}
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {customer.totalOrders}
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {customer.totalSpent} ر.س
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {customer.averageOrderValue} ر.س
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {customer.lastOrderDate
                          ? new Date(customer.lastOrderDate).toLocaleDateString(
                              "ar-SA"
                            )
                          : "لم يوجد"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-gray-500">لا توجد بيانات متاحة</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
