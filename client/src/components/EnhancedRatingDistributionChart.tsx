import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { BarChartTooltip } from './ChartTooltip';

interface RatingData {
  rating: number;
  count: number;
  percentage: number;
  color: string;
}

interface EnhancedRatingDistributionChartProps {
  data: RatingData[];
  title?: string;
  showTooltips?: boolean;
  showLegend?: boolean;
  height?: number;
  onBarClick?: (rating: number) => void;
}

/**
 * Enhanced Rating Distribution Chart with Tooltips
 * رسم بياني لتوزيع التقييمات مع تلميحات متقدمة
 */
export const EnhancedRatingDistributionChart: React.FC<EnhancedRatingDistributionChartProps> = ({
  data,
  title = 'توزيع التقييمات',
  showTooltips = true,
  showLegend = true,
  height = 300,
  onBarClick,
}) => {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <BarChartTooltip
          label={`${data.rating} نجوم`}
          value={data.count}
          percentage={data.percentage}
          color={data.color}
          unit=" تقييم"
          comparison={
            hoveredRating && hoveredRating !== data.rating
              ? Math.round(((data.count - hoveredRating) / hoveredRating) * 100)
              : undefined
          }
        />
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {title}
        </h3>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="rating"
            label={{ value: 'التقييم', position: 'insideBottomRight', offset: -5 }}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis
            label={{ value: 'عدد التقييمات', angle: -90, position: 'insideLeft' }}
            tick={{ fill: '#6b7280' }}
          />
          {showTooltips && <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(249, 198, 0, 0.1)' }} />}
          {showLegend && <Legend />}
          <Bar
            dataKey="count"
            fill="#f9c600"
            radius={[8, 8, 0, 0]}
            onMouseEnter={(data) => setHoveredRating(data.rating)}
            onMouseLeave={() => setHoveredRating(null)}
            onClick={(data) => onBarClick?.(data.rating)}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                opacity={hoveredRating === null || hoveredRating === entry.rating ? 1 : 0.5}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Statistics */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">إجمالي التقييمات</div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{totalCount}</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">المتوسط</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {(
              data.reduce((sum, item) => sum + item.rating * item.count, 0) / totalCount
            ).toFixed(1)}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">الأكثر شيوعاً</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {Math.max(...data.map(d => d.rating))} ⭐
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Performance Metrics Chart with Tooltips
 * رسم بياني لمقاييس الأداء مع تلميحات
 */
export const EnhancedPerformanceMetricsChart: React.FC<{
  data: Array<{
    name: string;
    value: number;
    target?: number;
    color: string;
  }>;
  title?: string;
  height?: number;
}> = ({ data, title = 'مقاييس الأداء', height = 300 }) => {
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const achievement = data.target
        ? Math.round((data.value / data.target) * 100)
        : null;

      return (
        <div className="bg-gray-900 dark:bg-gray-800 text-white p-3 rounded-lg shadow-lg border border-gray-700 dark:border-gray-600">
          <div className="font-semibold text-sm mb-1">{data.name}</div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-lg font-bold" style={{ color: data.color }}>
              {data.value}
            </span>
            {data.target && (
              <span className="text-xs text-gray-400">/ {data.target}</span>
            )}
          </div>
          {achievement && (
            <div
              className={`text-xs font-medium ${
                achievement >= 100 ? 'text-green-400' : 'text-yellow-400'
              }`}
            >
              {achievement}% من الهدف
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {title}
        </h3>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" tick={{ fill: '#6b7280' }} />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fill: '#6b7280' }}
            width={180}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(249, 198, 0, 0.1)' }} />
          <Bar
            dataKey="value"
            fill="#f9c600"
            radius={[0, 8, 8, 0]}
            onMouseEnter={(data) => setHoveredMetric(data.name)}
            onMouseLeave={() => setHoveredMetric(null)}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                opacity={hoveredMetric === null || hoveredMetric === entry.name ? 1 : 0.5}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Detailed Ratings Chart with Tooltips
 * رسم بياني للتقييمات المفصلة مع تلميحات
 */
export const EnhancedDetailedRatingsChart: React.FC<{
  data: Array<{
    category: string;
    quality: number;
    price: number;
    service: number;
  }>;
  title?: string;
  height?: number;
}> = ({ data, title = 'التقييمات المفصلة', height = 300 }) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const average = (data.quality + data.price + data.service) / 3;

      return (
        <div className="bg-gray-900 dark:bg-gray-800 text-white p-3 rounded-lg shadow-lg border border-gray-700 dark:border-gray-600">
          <div className="font-semibold text-sm mb-2">{data.category}</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">الجودة</span>
              <span className="font-medium text-blue-400">{data.quality}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">السعر</span>
              <span className="font-medium text-green-400">{data.price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">الخدمة</span>
              <span className="font-medium text-purple-400">{data.service}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-gray-700 dark:border-gray-600">
              <span className="text-gray-400">المتوسط</span>
              <span className="font-medium text-yellow-400">{average.toFixed(1)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {title}
        </h3>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="category"
            tick={{ fill: '#6b7280' }}
          />
          <YAxis tick={{ fill: '#6b7280' }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(249, 198, 0, 0.1)' }} />
          <Legend />
          <Bar
            dataKey="quality"
            fill="#3b82f6"
            radius={[8, 8, 0, 0]}
            onMouseEnter={(data) => setHoveredCategory(data.category)}
            onMouseLeave={() => setHoveredCategory(null)}
          />
          <Bar
            dataKey="price"
            fill="#10b981"
            radius={[8, 8, 0, 0]}
            onMouseEnter={(data) => setHoveredCategory(data.category)}
            onMouseLeave={() => setHoveredCategory(null)}
          />
          <Bar
            dataKey="service"
            fill="#a855f7"
            radius={[8, 8, 0, 0]}
            onMouseEnter={(data) => setHoveredCategory(data.category)}
            onMouseLeave={() => setHoveredCategory(null)}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
