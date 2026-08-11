import React, { useMemo } from 'react';
import { Star } from 'lucide-react';

interface RatingDistributionChartProps {
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
  totalReviews: number;
}

export const RatingDistributionChart: React.FC<RatingDistributionChartProps> = ({
  fiveStarCount,
  fourStarCount,
  threeStarCount,
  twoStarCount,
  oneStarCount,
  totalReviews,
}) => {
  const distribution = useMemo(() => {
    if (totalReviews === 0) {
      return [
        { stars: 5, count: 0, percentage: 0 },
        { stars: 4, count: 0, percentage: 0 },
        { stars: 3, count: 0, percentage: 0 },
        { stars: 2, count: 0, percentage: 0 },
        { stars: 1, count: 0, percentage: 0 },
      ];
    }

    return [
      { stars: 5, count: fiveStarCount, percentage: (fiveStarCount / totalReviews) * 100 },
      { stars: 4, count: fourStarCount, percentage: (fourStarCount / totalReviews) * 100 },
      { stars: 3, count: threeStarCount, percentage: (threeStarCount / totalReviews) * 100 },
      { stars: 2, count: twoStarCount, percentage: (twoStarCount / totalReviews) * 100 },
      { stars: 1, count: oneStarCount, percentage: (oneStarCount / totalReviews) * 100 },
    ];
  }, [fiveStarCount, fourStarCount, threeStarCount, twoStarCount, oneStarCount, totalReviews]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-black mb-6">توزيع التقييمات</h3>

      <div className="space-y-4">
        {distribution.map(({ stars, count, percentage }) => (
          <div key={stars} className="space-y-2">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-black">{stars}</span>
                <Star size={16} className="fill-yellow-400 text-yellow-400" />
              </div>
              <span className="text-sm text-gray-600">{count} تقييم</span>
            </div>

            {/* Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* Percentage */}
            <div className="text-right">
              <span className="text-xs text-gray-500">{percentage.toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">التقييمات الإيجابية</p>
            <p className="text-2xl font-bold text-yellow-600">
              {((fiveStarCount + fourStarCount) / totalReviews * 100).toFixed(0)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">إجمالي التقييمات</p>
            <p className="text-2xl font-bold text-black">{totalReviews}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
