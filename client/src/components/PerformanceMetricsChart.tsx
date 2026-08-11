import React, { useMemo } from 'react';
import { TrendingUp, Award, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface PerformanceMetric {
  label: string;
  value: number;
  maxValue: number;
  icon: React.ReactNode;
  color: string;
  unit: string;
}

interface PerformanceMetricsChartProps {
  completedJobs: number;
  averageRating: number;
  responseTime: number; // in minutes
  successRate: number; // percentage
  totalReviews: number;
}

export const PerformanceMetricsChart: React.FC<PerformanceMetricsChartProps> = ({
  completedJobs,
  averageRating,
  responseTime,
  successRate,
  totalReviews,
}) => {
  const metrics: PerformanceMetric[] = useMemo(() => {
    return [
      {
        label: 'الوظائف المكتملة',
        value: completedJobs,
        maxValue: Math.max(completedJobs, 100),
        icon: <CheckCircle size={24} />,
        color: 'from-green-400 to-green-500',
        unit: 'وظيفة',
      },
      {
        label: 'متوسط التقييم',
        value: averageRating,
        maxValue: 5,
        icon: <Award size={24} />,
        color: 'from-yellow-400 to-yellow-500',
        unit: 'من 5',
      },
      {
        label: 'معدل النجاح',
        value: successRate,
        maxValue: 100,
        icon: <TrendingUp size={24} />,
        color: 'from-blue-400 to-blue-500',
        unit: '%',
      },
      {
        label: 'وقت الرد',
        value: Math.max(0, 60 - responseTime),
        maxValue: 60,
        icon: <Clock size={24} />,
        color: 'from-purple-400 to-purple-500',
        unit: 'دقيقة',
      },
    ];
  }, [completedJobs, averageRating, responseTime, successRate]);

  const getPercentage = (value: number, maxValue: number) => {
    return Math.min((value / maxValue) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const percentage = getPercentage(metric.value, metric.maxValue);
          const isGood = percentage >= 75;

          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-400 hover:shadow-xl transition"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-600">{metric.label}</p>
                <div className={`text-${isGood ? 'green' : 'orange'}-500`}>
                  {metric.icon}
                </div>
              </div>

              {/* Value */}
              <div className="mb-4">
                <p className="text-3xl font-bold text-black">
                  {metric.value.toFixed(metric.label === 'متوسط التقييم' ? 1 : 0)}
                </p>
                <p className="text-xs text-gray-500">{metric.unit}</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`bg-gradient-to-r ${metric.color} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Percentage */}
              <p className="text-xs text-gray-600 mt-2">
                {percentage.toFixed(0)}% من الهدف
              </p>
            </div>
          );
        })}
      </div>

      {/* Performance Summary */}
      <div className="bg-gradient-to-r from-yellow-50 to-white rounded-lg shadow-lg p-6 border border-yellow-200">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <TrendingUp className="text-yellow-600" size={32} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-black mb-2">ملخص الأداء</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">إجمالي التقييمات</p>
                <p className="text-2xl font-bold text-black">{totalReviews}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">معدل الرضا</p>
                <p className="text-2xl font-bold text-green-600">
                  {((averageRating / 5) * 100).toFixed(0)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">الحالة</p>
                <div className="flex items-center gap-2">
                  {successRate >= 90 ? (
                    <>
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <p className="text-sm font-semibold text-green-700">ممتاز</p>
                    </>
                  ) : successRate >= 75 ? (
                    <>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                      <p className="text-sm font-semibold text-yellow-700">جيد</p>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <p className="text-sm font-semibold text-red-700">يحتاج تحسين</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
