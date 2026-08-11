import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Star, AlertCircle } from 'lucide-react';
import { RatingDistributionChart } from './RatingDistributionChart';
import { PerformanceMetricsChart } from './PerformanceMetricsChart';
import { DetailedRatingsChart } from './DetailedRatingsChart';

interface TechnicianStats {
  id: number;
  name: string;
  averageRating: number;
  totalReviews: number;
  completedJobs: number;
  successRate: number;
  responseTime: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
  qualityRating: number;
  priceRating: number;
  serviceRating: number;
}

interface AnalyticsDashboardProps {
  technicianId?: number;
  showComparison?: boolean;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  technicianId,
  showComparison = false,
}) => {
  const [stats, setStats] = useState<TechnicianStats | null>(null);
  const [allStats, setAllStats] = useState<TechnicianStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<'rating' | 'jobs' | 'success'>('rating');

  useEffect(() => {
    fetchAnalyticsData();
  }, [technicianId]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (technicianId) {
        const response = await fetch(`/api/technicians/${technicianId}/analytics`);
        if (!response.ok) throw new Error('فشل تحميل البيانات');
        const data = await response.json();
        setStats(data);
      } else if (showComparison) {
        const response = await fetch('/api/technicians/analytics/all');
        if (!response.ok) throw new Error('فشل تحميل البيانات');
        const data = await response.json();
        setAllStats(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ ما');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full" />
        </div>
        <p className="text-gray-600 mt-4">جاري تحميل البيانات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-bold text-red-900 mb-1">خطأ</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (technicianId && !stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">لم يتم العثور على بيانات</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg shadow-lg p-6 text-black">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 size={32} />
          <h1 className="text-3xl font-bold">لوحة إحصائيات الأداء</h1>
        </div>
        <p className="text-black opacity-90">
          {technicianId ? 'تحليل أداء الفني' : 'مقارنة أداء جميع الفنيين'}
        </p>
      </div>

      {/* Single Technician View */}
      {technicianId && stats && (
        <div className="space-y-6">
          {/* Performance Metrics */}
          <PerformanceMetricsChart
            completedJobs={stats.completedJobs}
            averageRating={stats.averageRating}
            responseTime={stats.responseTime}
            successRate={stats.successRate}
            totalReviews={stats.totalReviews}
          />

          {/* Detailed Ratings */}
          <DetailedRatingsChart
            qualityRating={stats.qualityRating}
            priceRating={stats.priceRating}
            serviceRating={stats.serviceRating}
            overallRating={stats.averageRating}
          />

          {/* Rating Distribution */}
          <RatingDistributionChart
            fiveStarCount={stats.fiveStarCount}
            fourStarCount={stats.fourStarCount}
            threeStarCount={stats.threeStarCount}
            twoStarCount={stats.twoStarCount}
            oneStarCount={stats.oneStarCount}
            totalReviews={stats.totalReviews}
          />
        </div>
      )}

      {/* Comparison View */}
      {showComparison && allStats.length > 0 && (
        <div className="space-y-6">
          {/* Metric Selector */}
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'rating', label: 'التقييم', icon: Star },
              { id: 'jobs', label: 'الوظائف', icon: Users },
              { id: 'success', label: 'معدل النجاح', icon: TrendingUp },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedMetric(id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                  selectedMetric === id
                    ? 'bg-yellow-400 text-black shadow-lg'
                    : 'bg-white text-black border border-gray-200 hover:border-yellow-400'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black">
                  <tr>
                    <th className="px-6 py-3 text-right font-bold">الفني</th>
                    <th className="px-6 py-3 text-right font-bold">التقييم</th>
                    <th className="px-6 py-3 text-right font-bold">الوظائف</th>
                    <th className="px-6 py-3 text-right font-bold">معدل النجاح</th>
                    <th className="px-6 py-3 text-right font-bold">التقييمات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allStats
                    .sort((a, b) => {
                      if (selectedMetric === 'rating') return b.averageRating - a.averageRating;
                      if (selectedMetric === 'jobs') return b.completedJobs - a.completedJobs;
                      return b.successRate - a.successRate;
                    })
                    .map((tech, index) => (
                      <tr
                        key={tech.id}
                        className={`hover:bg-yellow-50 transition ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold">
                              {index + 1}
                            </div>
                            <span className="font-semibold text-black">{tech.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-black">
                              {tech.averageRating.toFixed(1)}
                            </span>
                            <span className="text-yellow-400">⭐</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-black">{tech.completedJobs}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${tech.successRate}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-black">
                              {tech.successRate.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-gray-600">
                            {tech.totalReviews} تقييم
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
