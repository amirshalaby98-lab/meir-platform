import React, { useMemo } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

interface DetailedRatingsChartProps {
  qualityRating: number;
  priceRating: number;
  serviceRating: number;
  overallRating: number;
}

export const DetailedRatingsChart: React.FC<DetailedRatingsChartProps> = ({
  qualityRating,
  priceRating,
  serviceRating,
  overallRating,
}) => {
  const ratings = useMemo(() => {
    return [
      {
        label: 'جودة الخدمة',
        value: qualityRating,
        icon: '⭐',
        color: 'from-blue-400 to-blue-500',
      },
      {
        label: 'القيمة مقابل السعر',
        value: priceRating,
        icon: '💰',
        color: 'from-green-400 to-green-500',
      },
      {
        label: 'جودة الخدمة العامة',
        value: serviceRating,
        icon: '✨',
        color: 'from-purple-400 to-purple-500',
      },
    ];
  }, [qualityRating, priceRating, serviceRating]);

  const getStarDisplay = (rating: number) => {
    return '⭐'.repeat(Math.round(rating));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="text-yellow-400" size={24} />
        <h3 className="text-xl font-bold text-black">التقييمات المفصلة</h3>
      </div>

      {/* Overall Rating */}
      <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
        <p className="text-sm text-gray-600 mb-2">التقييم الإجمالي</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-4xl font-bold text-black">{overallRating.toFixed(1)}</p>
            <p className="text-xs text-gray-600">من 5 نجوم</p>
          </div>
          <div className="text-5xl">{getStarDisplay(overallRating)}</div>
        </div>
      </div>

      {/* Detailed Ratings */}
      <div className="space-y-4">
        {ratings.map((rating, index) => {
          const percentage = (rating.value / 5) * 100;

          return (
            <div key={index} className="space-y-2">
              {/* Label */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{rating.icon}</span>
                  <p className="font-semibold text-black">{rating.label}</p>
                </div>
                <p className="text-lg font-bold text-black">{rating.value.toFixed(1)}</p>
              </div>

              {/* Bar */}
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className={`bg-gradient-to-r ${rating.color} h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                  style={{ width: `${percentage}%` }}
                >
                  {percentage > 20 && (
                    <span className="text-xs font-bold text-white">{percentage.toFixed(0)}%</span>
                  )}
                </div>
              </div>

              {/* Stars */}
              <p className="text-sm text-yellow-600">{getStarDisplay(rating.value)}</p>
            </div>
          );
        })}
      </div>

      {/* Comparison */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <TrendingUp className="text-blue-600 flex-shrink-0" size={20} />
          <div>
            <p className="font-semibold text-blue-900 mb-2">تحليل الأداء</p>
            <ul className="text-sm text-blue-800 space-y-1">
              {qualityRating >= 4.5 && (
                <li>✓ جودة الخدمة ممتازة</li>
              )}
              {priceRating >= 4 && (
                <li>✓ القيمة مقابل السعر جيدة</li>
              )}
              {serviceRating >= 4.5 && (
                <li>✓ الخدمة العامة متميزة</li>
              )}
              {overallRating >= 4.5 && (
                <li>✓ الأداء العام ممتاز</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
