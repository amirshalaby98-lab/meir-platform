import React from 'react';
import { Star, TrendingUp, Users, Award } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface TechnicianStats {
  totalRating: number;
  reviewCount: number;
  averageRating: number;
  completedJobs: number;
  successRate: number;
  qualityRating: number;
  priceRating: number;
  serviceRating: number;
  recentReviews: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

interface TechnicianDashboardStatsProps {
  stats: TechnicianStats;
  isLoading?: boolean;
}

/**
 * Technician Dashboard Stats Component
 * يعرض إحصائيات الأداء الشخصية للفني
 */
export const TechnicianDashboardStats: React.FC<TechnicianDashboardStatsProps> = ({
  stats,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  const getTrendColor = () => {
    switch (stats.trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getTrendIcon = () => {
    switch (stats.trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '→';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Overall Rating */}
      <Tooltip
        content="متوسط التقييمات من جميع العملاء"
        position="bottom"
        trigger="hover"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              التقييم العام
            </span>
            <Star className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.averageRating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              / 5.0
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {stats.reviewCount} تقييم
          </div>
        </div>
      </Tooltip>

      {/* Completed Jobs */}
      <Tooltip
        content="إجمالي الوظائف المكتملة بنجاح"
        position="bottom"
        trigger="hover"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              الوظائف المكتملة
            </span>
            <Award className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.completedJobs}
            </span>
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {getTrendIcon()} {stats.trendPercentage}%
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            معدل النجاح: {stats.successRate}%
          </div>
        </div>
      </Tooltip>

      {/* Quality Rating */}
      <Tooltip
        content="تقييم جودة العمل من قبل العملاء"
        position="bottom"
        trigger="hover"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              جودة العمل
            </span>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.qualityRating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              / 5.0
            </span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${(stats.qualityRating / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </Tooltip>

      {/* Recent Reviews */}
      <Tooltip
        content="عدد التقييمات المستلمة في الآونة الأخيرة"
        position="bottom"
        trigger="hover"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              التقييمات الأخيرة
            </span>
            <Users className="w-5 h-5 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.recentReviews}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              في آخر 30 يوم
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            متوسط: {(stats.recentReviews / 30).toFixed(1)} يومياً
          </div>
        </div>
      </Tooltip>
    </div>
  );
};

/**
 * Detailed Ratings Breakdown Component
 * يعرض تفصيل التقييمات حسب الفئات
 */
export const DetailedRatingsBreakdown: React.FC<{
  qualityRating: number;
  priceRating: number;
  serviceRating: number;
}> = ({ qualityRating, priceRating, serviceRating }) => {
  const ratings = [
    { label: 'جودة العمل', value: qualityRating, color: 'bg-blue-500' },
    { label: 'السعر', value: priceRating, color: 'bg-green-500' },
    { label: 'الخدمة', value: serviceRating, color: 'bg-purple-500' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        تفصيل التقييمات
      </h3>

      <div className="space-y-4">
        {ratings.map((rating, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {rating.label}
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {rating.value.toFixed(1)}/5.0
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className={`${rating.color} h-3 rounded-full transition-all`}
                style={{ width: `${(rating.value / 5) * 100}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {Math.round((rating.value / 5) * 100)}% من الحد الأقصى
            </div>
          </div>
        ))}
      </div>

      {/* Average */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            المتوسط العام
          </span>
          <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
            {((qualityRating + priceRating + serviceRating) / 3).toFixed(1)}/5.0
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Performance Trend Component
 * يعرض اتجاه الأداء على مدى الوقت
 */
export const PerformanceTrend: React.FC<{
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  message?: string;
}> = ({ trend, trendPercentage, message }) => {
  const getTrendInfo = () => {
    switch (trend) {
      case 'up':
        return {
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          icon: '📈',
          label: 'تحسن الأداء',
        };
      case 'down':
        return {
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          icon: '📉',
          label: 'انخفاض الأداء',
        };
      default:
        return {
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          icon: '➡️',
          label: 'أداء مستقرة',
        };
    }
  };

  const info = getTrendInfo();

  return (
    <div className={`${info.bgColor} rounded-lg p-4`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{info.icon}</span>
        <div>
          <p className={`text-sm font-medium ${info.color}`}>{info.label}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {trendPercentage > 0 ? '+' : ''}{trendPercentage}% مقارنة بالشهر الماضي
          </p>
          {message && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Quick Stats Component
 * إحصائيات سريعة للفني
 */
export const QuickStats: React.FC<{
  stats: TechnicianStats;
}> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10 rounded-lg p-3">
        <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
          التقييم
        </div>
        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
          {stats.averageRating.toFixed(1)}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          ⭐ {stats.reviewCount}
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg p-3">
        <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
          الوظائف
        </div>
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {stats.completedJobs}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          ✓ {stats.successRate}%
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-lg p-3">
        <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
          الجودة
        </div>
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
          {stats.qualityRating.toFixed(1)}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          ✓ ممتاز
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-lg p-3">
        <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
          الاتجاه
        </div>
        <div className={`text-2xl font-bold ${
          stats.trend === 'up'
            ? 'text-green-600 dark:text-green-400'
            : stats.trend === 'down'
            ? 'text-red-600 dark:text-red-400'
            : 'text-gray-600 dark:text-gray-400'
        }`}>
          {stats.trend === 'up' ? '↑' : stats.trend === 'down' ? '↓' : '→'}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {stats.trendPercentage > 0 ? '+' : ''}{stats.trendPercentage}%
        </div>
      </div>
    </div>
  );
};
