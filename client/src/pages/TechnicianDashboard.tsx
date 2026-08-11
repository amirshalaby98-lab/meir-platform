import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { useAuth } from "../_core/hooks/useAuth";
import { TechnicianDashboardStats, DetailedRatingsBreakdown, PerformanceTrend, QuickStats } from "../components/TechnicianDashboardStats";
import { AnimatedChartContainer } from "../components/ChartAnimations";
import { Tooltip } from "../components/Tooltip";
import { BadgesDisplay } from "../components/BadgesDisplay";
import { RewardsDisplay, RewardsSummary } from "../components/RewardsDisplay";
import { LeaderboardDisplay } from "../components/LeaderboardDisplay";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Loader2,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  TrendingUp,
  Calendar,
  DollarSign,
  Star,
  Users,
  Trophy,
} from "lucide-react";

interface DashboardStats {
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  totalEarnings: number;
  monthlyEarnings: number;
  averageRating: number;
  totalReviews: number;
  unreadMessages: number;
}

interface Booking {
  id: number;
  customerName: string;
  serviceType: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  scheduledDate: Date;
  amount: number;
  location: string;
}

export function TechnicianDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "earnings" | "messages" | "badges">("overview");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch bookings for this technician
  const { data: bookingsData, isLoading: bookingsLoading } = trpc.technician.getBookings.useQuery(
    { technicianId: user?.id ?? 0 },
    { enabled: !!user }
  );

  useEffect(() => {
    if (bookingsData) {
      const mappedBookings: Booking[] = (bookingsData as any[]).map((b: any) => ({
        id: b.id,
        customerName: b.name || 'عميل',
        serviceType: b.service || 'خدمة',
        status: b.status || 'pending',
        scheduledDate: new Date(b.date),
        amount: 0,
        location: b.location || '',
      }));
      setBookings(mappedBookings);
      setStats({
        totalBookings: mappedBookings.length,
        completedBookings: mappedBookings.filter(b => b.status === 'completed').length,
        pendingBookings: mappedBookings.filter(b => b.status === 'pending').length,
        totalEarnings: 0,
        monthlyEarnings: 0,
        averageRating: 0,
        totalReviews: 0,
        unreadMessages: 0,
      });
    }
    setIsLoading(bookingsLoading);
  }, [bookingsData, bookingsLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم الفني</h1>
              <p className="text-gray-600 mt-1">مرحباً {user?.name}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={activeTab === "overview" ? "default" : "outline"}
                onClick={() => setActiveTab("overview")}
                className={activeTab === "overview" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
              >
                <BarChart3 className="w-4 h-4 ml-2" />
                نظرة عامة
              </Button>
              <Button
                variant={activeTab === "bookings" ? "default" : "outline"}
                onClick={() => setActiveTab("bookings")}
                className={activeTab === "bookings" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
              >
                <Calendar className="w-4 h-4 ml-2" />
                الحجوزات
              </Button>
              <Button
                variant={activeTab === "earnings" ? "default" : "outline"}
                onClick={() => setActiveTab("earnings")}
                className={activeTab === "earnings" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
              >
                <DollarSign className="w-4 h-4 ml-2" />
                الأرباح
              </Button>
              <Button
                variant={activeTab === "messages" ? "default" : "outline"}
                onClick={() => setActiveTab("messages")}
                className={activeTab === "messages" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
              >
                <MessageSquare className="w-4 h-4 ml-2" />
                الرسائل
              </Button>
              <Button
                variant={activeTab === "badges" ? "default" : "outline"}
                onClick={() => setActiveTab("badges")}
                className={activeTab === "badges" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
              >
                <Trophy className="w-4 h-4 ml-2" />
                🏆 الشارات
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "overview" && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">إجمالي الحجوزات</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.totalBookings}
                    </p>
                  </div>
                  <Calendar className="w-12 h-12 text-yellow-500 opacity-20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">الحجوزات المكتملة</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      {stats.completedBookings}
                    </p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">إجمالي الأرباح</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                      {stats.totalEarnings.toLocaleString()} ر.س
                    </p>
                  </div>
                  <DollarSign className="w-12 h-12 text-blue-500 opacity-20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">التقييم العام</p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-3xl font-bold text-yellow-600">
                        {stats.averageRating.toFixed(1)}
                      </p>
                      <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                    </div>
                  </div>
                  <Users className="w-12 h-12 text-yellow-500 opacity-20" />
                </div>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">الحجوزات هذا الشهر</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">قيد الانتظار</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-500"
                          style={{
                            width: `${
                              stats.totalBookings > 0
                                ? (stats.pendingBookings / stats.totalBookings) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="font-semibold">{stats.pendingBookings}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">مكتملة</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{
                            width: `${
                              stats.totalBookings > 0
                                ? (stats.completedBookings / stats.totalBookings) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="font-semibold">{stats.completedBookings}</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">الأرباح</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">هذا الشهر</span>
                    <span className="text-2xl font-bold text-green-600">
                      {stats.monthlyEarnings.toLocaleString()} ر.س
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">إجمالي</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {stats.totalEarnings.toLocaleString()} ر.س
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 text-sm mt-4">
                    <TrendingUp className="w-4 h-4" />
                    <span>زيادة بنسبة 15% عن الشهر الماضي</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">الحجوزات</h2>
              <Button className="bg-yellow-500 hover:bg-yellow-600">
                <Calendar className="w-4 h-4 ml-2" />
                عرض التقويم
              </Button>
            </div>

            {bookings.length === 0 ? (
              <Card className="p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد حجوزات حالياً</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {booking.customerName}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              booking.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : booking.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {booking.status === "completed"
                              ? "مكتملة"
                              : booking.status === "pending"
                              ? "قيد الانتظار"
                              : booking.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{booking.serviceType}</p>
                        <p className="text-sm text-gray-500">{booking.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {booking.amount} ر.س
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(booking.scheduledDate).toLocaleDateString("ar-SA")}
                        </p>
                        <Button
                          size="sm"
                          className="mt-3 bg-yellow-500 hover:bg-yellow-600"
                        >
                          التفاصيل
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "earnings" && stats && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">متابعة الأرباح</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
                <p className="text-gray-600 text-sm">إجمالي الأرباح</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">
                  {stats.totalEarnings.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-2">ر.س</p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
                <p className="text-gray-600 text-sm">أرباح هذا الشهر</p>
                <p className="text-4xl font-bold text-green-600 mt-2">
                  {stats.monthlyEarnings.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-2">ر.س</p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100">
                <p className="text-gray-600 text-sm">متوسط الحجز</p>
                <p className="text-4xl font-bold text-yellow-600 mt-2">
                  {stats.totalBookings > 0
                    ? Math.round(stats.totalEarnings / stats.totalBookings)
                    : 0}
                </p>
                <p className="text-xs text-gray-500 mt-2">ر.س</p>
              </Card>
            </div>

            {/* Earnings Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">الأرباح خلال آخر 6 أشهر</h3>
              <div className="space-y-4">
                {[
                  { month: "يناير", amount: 2500 },
                  { month: "فبراير", amount: 3200 },
                  { month: "مارس", amount: 2800 },
                  { month: "أبريل", amount: 3500 },
                  { month: "مايو", amount: 4100 },
                  { month: "يونيو", amount: stats.monthlyEarnings },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="w-20 text-sm text-gray-600">{item.month}</span>
                    <div className="flex-1 h-8 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
                        style={{ width: `${(item.amount / 5000) * 100}%` }}
                      ></div>
                    </div>
                    <span className="w-20 text-right font-semibold text-gray-900">
                      {item.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === "badges" && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">🏆 الشارات والمكافآت</h2>
              <div className="space-y-8">
                {/* Badges Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">الشارات المكتسبة</h3>
                  <BadgesDisplay badges={[]} maxDisplay={8} />
                </div>

                {/* Rewards Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">المكافآت المتاحة</h3>
                  <RewardsSummary rewards={[]} />
                  <div className="mt-6">
                    <RewardsDisplay rewards={[]} />
                  </div>
                </div>

                {/* Leaderboard Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">لوحة الصدارة</h3>
                  <LeaderboardDisplay entries={[]} currentTechnicianId={user?.id} period="monthly" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "messages" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">الرسائل</h2>
              <Button
                onClick={() => setLocation("/chat")}
                className="bg-yellow-500 hover:bg-yellow-600"
              >
                <MessageSquare className="w-4 h-4 ml-2" />
                عرض جميع الرسائل
              </Button>
            </div>

            {stats && stats.unreadMessages > 0 ? (
              <Card className="p-6 bg-yellow-50 border-2 border-yellow-200">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-yellow-900">
                      لديك {stats.unreadMessages} رسالة غير مقروءة
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      انقر على الزر أعلاه لعرض جميع الرسائل
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد رسائل غير مقروءة</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TechnicianDashboard;
