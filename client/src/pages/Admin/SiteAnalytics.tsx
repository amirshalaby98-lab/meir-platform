import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  Users,
  Eye,
  Clock,
  Globe,
  Monitor,
  Smartphone,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Calendar,
  TrendingUp,
  MapPin,
  ExternalLink,
} from "lucide-react";

interface StatsData {
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
}

interface MetricItem {
  x: string;
  y: number;
}

interface PageviewData {
  pageviews: { x: string; y: number }[];
  sessions: { x: string; y: number }[];
}

const ANALYTICS_ENDPOINT = (import.meta.env.VITE_ANALYTICS_ENDPOINT || "").trim();
const WEBSITE_ID = (import.meta.env.VITE_ANALYTICS_WEBSITE_ID || "").trim();
const analyticsEnabled = Boolean(
  !import.meta.env.DEV &&
    ANALYTICS_ENDPOINT &&
    WEBSITE_ID &&
    !ANALYTICS_ENDPOINT.includes("%VITE_") &&
    !WEBSITE_ID.includes("%VITE_")
);

function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return `${Math.round(totalSeconds)} ثانية`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  if (minutes < 60) return `${minutes} دقيقة ${seconds > 0 ? `و ${seconds} ثانية` : ""}`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours} ساعة ${remainingMinutes > 0 ? `و ${remainingMinutes} دقيقة` : ""}`;
}

function getDateRange(period: string): { startAt: number; endAt: number } {
  const now = new Date();
  const endAt = now.getTime();
  let startAt: number;

  switch (period) {
    case "today":
      startAt = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      break;
    case "yesterday":
      const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      startAt = yesterday.getTime();
      break;
    case "7days":
      startAt = endAt - 7 * 24 * 60 * 60 * 1000;
      break;
    case "30days":
      startAt = endAt - 30 * 24 * 60 * 60 * 1000;
      break;
    case "90days":
      startAt = endAt - 90 * 24 * 60 * 60 * 1000;
      break;
    default:
      startAt = endAt - 7 * 24 * 60 * 60 * 1000;
  }

  return { startAt, endAt };
}

async function fetchUmamiData(endpoint: string, params: Record<string, string>) {
  if (!analyticsEnabled) {
    return null;
  }

  try {
    const url = new URL(`${ANALYTICS_ENDPOINT}/api/websites/${WEBSITE_ID}/${endpoint}`);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return null;
  }
}

function SiteAnalyticsContent() {
  const [period, setPeriod] = useState("7days");
  const [stats, setStats] = useState<StatsData | null>(null);
  const [activeVisitors, setActiveVisitors] = useState<number>(0);
  const [topPages, setTopPages] = useState<MetricItem[]>([]);
  const [topReferrers, setTopReferrers] = useState<MetricItem[]>([]);
  const [browsers, setBrowsers] = useState<MetricItem[]>([]);
  const [devices, setDevices] = useState<MetricItem[]>([]);
  const [countries, setCountries] = useState<MetricItem[]>([]);
  const [os, setOs] = useState<MetricItem[]>([]);
  const [pageviewsChart, setPageviewsChart] = useState<PageviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = async () => {
    if (!analyticsEnabled) {
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { startAt, endAt } = getDateRange(period);
    const params = { startAt: startAt.toString(), endAt: endAt.toString() };

    try {
      const [
        statsData,
        activeData,
        pagesData,
        referrersData,
        browsersData,
        devicesData,
        countriesData,
        osData,
        pageviewsData,
      ] = await Promise.all([
        fetchUmamiData("stats", params),
        fetchUmamiData("active", {}),
        fetchUmamiData("metrics", { ...params, type: "path" }),
        fetchUmamiData("metrics", { ...params, type: "referrer" }),
        fetchUmamiData("metrics", { ...params, type: "browser" }),
        fetchUmamiData("metrics", { ...params, type: "device" }),
        fetchUmamiData("metrics", { ...params, type: "country" }),
        fetchUmamiData("metrics", { ...params, type: "os" }),
        fetchUmamiData("pageviews", {
          ...params,
          unit: period === "today" || period === "yesterday" ? "hour" : "day",
          timezone: "Asia/Riyadh",
        }),
      ]);

      if (statsData) setStats(statsData);
      if (activeData) setActiveVisitors(activeData.visitors || 0);
      if (pagesData) setTopPages(pagesData.slice(0, 10));
      if (referrersData) setTopReferrers(referrersData.slice(0, 10));
      if (browsersData) setBrowsers(browsersData.slice(0, 5));
      if (devicesData) setDevices(devicesData);
      if (countriesData) setCountries(countriesData.slice(0, 10));
      if (osData) setOs(osData.slice(0, 5));
      if (pageviewsData) setPageviewsChart(pageviewsData);
    } catch (err) {
      setError("حدث خطأ أثناء جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [period]);

  // Refresh active visitors every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await fetchUmamiData("active", {});
      if (data) setActiveVisitors(data.visitors || 0);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const avgSessionTime = stats
    ? stats.visits > 0
      ? stats.totaltime / stats.visits / 1000
      : 0
    : 0;

  const bounceRate = stats
    ? stats.visits > 0
      ? ((stats.bounces / stats.visits) * 100).toFixed(1)
      : "0"
    : "0";

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-2">{error}</p>
          <p className="text-gray-500 text-sm">تأكد من إعدادات VITE_ANALYTICS_ENDPOINT و VITE_ANALYTICS_WEBSITE_ID</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-700">
              {activeVisitors} زائر الآن
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="today">اليوم</option>
            <option value="yesterday">أمس</option>
            <option value="7days">آخر 7 أيام</option>
            <option value="30days">آخر 30 يوم</option>
            <option value="90days">آخر 90 يوم</option>
          </select>
          <button
            onClick={fetchAllData}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            title="تحديث"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 animate-spin text-yellow-500" />
            <span className="text-gray-500">جاري تحميل الإحصائيات...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Main Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Users className="w-5 h-5 text-blue-600" />}
              label="الزوار الفريدين"
              value={stats?.visitors?.toLocaleString() || "0"}
              bgColor="bg-blue-50"
              borderColor="border-blue-100"
            />
            <StatCard
              icon={<Eye className="w-5 h-5 text-purple-600" />}
              label="مرات فتح الصفحات"
              value={stats?.pageviews?.toLocaleString() || "0"}
              bgColor="bg-purple-50"
              borderColor="border-purple-100"
            />
            <StatCard
              icon={<Clock className="w-5 h-5 text-green-600" />}
              label="متوسط مدة الجلسة"
              value={formatDuration(avgSessionTime)}
              bgColor="bg-green-50"
              borderColor="border-green-100"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5 text-orange-600" />}
              label="معدل الارتداد"
              value={`${bounceRate}%`}
              bgColor="bg-orange-50"
              borderColor="border-orange-100"
            />
          </div>

          {/* Pageviews Chart */}
          {pageviewsChart && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">الزيارات خلال الفترة</h3>
              <div className="overflow-x-auto">
                <div className="flex items-end gap-1 min-h-[200px] min-w-[500px]">
                  {pageviewsChart.pageviews.map((item, i) => {
                    const maxVal = Math.max(...pageviewsChart.pageviews.map((p) => p.y), 1);
                    const height = (item.y / maxVal) * 160;
                    const date = new Date(item.x);
                    const label =
                      period === "today" || period === "yesterday"
                        ? `${date.getHours()}:00`
                        : `${date.getDate()}/${date.getMonth() + 1}`;
                    return (
                      <div key={i} className="flex flex-col items-center flex-1 min-w-[30px]">
                        <span className="text-[10px] text-gray-500 mb-1">{item.y}</span>
                        <div
                          className="w-full bg-yellow-400 rounded-t-sm transition-all hover:bg-yellow-500"
                          style={{ height: `${Math.max(height, 4)}px` }}
                          title={`${label}: ${item.y} زيارة`}
                        />
                        <span className="text-[9px] text-gray-400 mt-1 rotate-[-45deg] origin-top-right whitespace-nowrap">
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Detailed Tables */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Pages */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-500" />
                  أكثر الصفحات زيارة
                </h3>
              </div>
              <div className="divide-y divide-gray-50">
                {topPages.length === 0 ? (
                  <p className="p-4 text-center text-gray-400 text-sm">لا توجد بيانات</p>
                ) : (
                  topPages.map((page, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs text-gray-400 w-5">{i + 1}</span>
                        <span className="text-sm text-gray-700 truncate" dir="ltr">
                          {page.x || "/"}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 whitespace-nowrap mr-2">
                        {page.y.toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Top Referrers */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-blue-500" />
                  مصادر الزيارات
                </h3>
              </div>
              <div className="divide-y divide-gray-50">
                {topReferrers.length === 0 ? (
                  <p className="p-4 text-center text-gray-400 text-sm">لا توجد بيانات (زيارات مباشرة)</p>
                ) : (
                  topReferrers.map((ref, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs text-gray-400 w-5">{i + 1}</span>
                        <span className="text-sm text-gray-700 truncate" dir="ltr">
                          {ref.x || "مباشر (Direct)"}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 whitespace-nowrap mr-2">
                        {ref.y.toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Devices */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-green-500" />
                  الأجهزة المستخدمة
                </h3>
              </div>
              <div className="p-5">
                {devices.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm">لا توجد بيانات</p>
                ) : (
                  <div className="space-y-3">
                    {devices.map((device, i) => {
                      const total = devices.reduce((sum, d) => sum + d.y, 0);
                      const percentage = total > 0 ? ((device.y / total) * 100).toFixed(1) : "0";
                      const icon =
                        device.x === "mobile" || device.x === "Mobile" ? (
                          <Smartphone className="w-4 h-4 text-blue-500" />
                        ) : (
                          <Monitor className="w-4 h-4 text-gray-500" />
                        );
                      return (
                        <div key={i} className="flex items-center gap-3">
                          {icon}
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-700">
                                {device.x === "mobile" ? "جوال" : device.x === "desktop" ? "كمبيوتر" : device.x === "tablet" ? "تابلت" : device.x}
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {percentage}% ({device.y})
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div
                                className="bg-yellow-400 h-2 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Browsers */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-500" />
                  المتصفحات
                </h3>
              </div>
              <div className="p-5">
                {browsers.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm">لا توجد بيانات</p>
                ) : (
                  <div className="space-y-3">
                    {browsers.map((browser, i) => {
                      const total = browsers.reduce((sum, b) => sum + b.y, 0);
                      const percentage = total > 0 ? ((browser.y / total) * 100).toFixed(1) : "0";
                      return (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">{browser.x}</span>
                          <span className="text-sm font-medium text-gray-900">
                            {percentage}% ({browser.y})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Operating Systems */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-teal-500" />
                  أنظمة التشغيل
                </h3>
              </div>
              <div className="p-5">
                {os.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm">لا توجد بيانات</p>
                ) : (
                  <div className="space-y-3">
                    {os.map((item, i) => {
                      const total = os.reduce((sum, o) => sum + o.y, 0);
                      const percentage = total > 0 ? ((item.y / total) * 100).toFixed(1) : "0";
                      return (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">{item.x}</span>
                          <span className="text-sm font-medium text-gray-900">
                            {percentage}% ({item.y})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Countries */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  الدول
                </h3>
              </div>
              <div className="divide-y divide-gray-50">
                {countries.length === 0 ? (
                  <p className="p-4 text-center text-gray-400 text-sm">لا توجد بيانات</p>
                ) : (
                  countries.map((country, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-5">{i + 1}</span>
                        <span className="text-sm text-gray-700">{country.x || "غير معروف"}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {country.y.toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  bgColor,
  borderColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <div className={`${bgColor} border ${borderColor} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-600 mt-1">{label}</p>
    </div>
  );
}

export default function SiteAnalytics() {
  return (
    <AdminLayout title="إحصائيات الزوار" description="تتبع زوار الموقع وسلوكهم">
      <SiteAnalyticsContent />
    </AdminLayout>
  );
}
