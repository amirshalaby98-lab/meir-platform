import React, { useState, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ChartTooltipProps {
  label: string;
  value: number | string;
  percentage?: number;
  color?: string;
  unit?: string;
  icon?: React.ReactNode;
  details?: Array<{
    label: string;
    value: string | number;
    color?: string;
  }>;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
}

/**
 * Chart Tooltip Component
 * تلميح متخصص للرسوم البيانية
 */
export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  label,
  value,
  percentage,
  color = '#f9c600',
  unit = '',
  icon,
  details,
  trend,
  trendValue,
}) => {
  return (
    <div className="bg-gray-900 dark:bg-gray-800 text-white p-3 rounded-lg shadow-lg border border-gray-700 dark:border-gray-600">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && <div className="flex-shrink-0">{icon}</div>}
          <span className="font-semibold text-sm">{label}</span>
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              trend === 'up'
                ? 'text-green-400'
                : trend === 'down'
                ? 'text-red-400'
                : 'text-gray-400'
            }`}
          >
            {trend === 'up' && <TrendingUp size={14} />}
            {trend === 'down' && <TrendingDown size={14} />}
            {trendValue && <span>{Math.abs(trendValue)}%</span>}
          </div>
        )}
      </div>

      {/* Main Value */}
      <div className="flex items-baseline gap-2 mb-2">
        <span
          className="text-2xl font-bold"
          style={{ color }}
        >
          {value}
        </span>
        {unit && <span className="text-sm text-gray-400">{unit}</span>}
        {percentage !== undefined && (
          <span className="text-sm text-gray-400">({percentage}%)</span>
        )}
      </div>

      {/* Details */}
      {details && details.length > 0 && (
        <div className="space-y-1 pt-2 border-t border-gray-700 dark:border-gray-600">
          {details.map((detail, index) => (
            <div key={index} className="flex justify-between text-xs">
              <span className="text-gray-400">{detail.label}</span>
              <span
                className="font-medium"
                style={{ color: detail.color || '#f9c600' }}
              >
                {detail.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Data Point Tooltip Component
 * تلميح لنقطة بيانات واحدة
 */
export const DataPointTooltip: React.FC<{
  x: number;
  y: number;
  label: string;
  value: number;
  color?: string;
  unit?: string;
  comparison?: {
    label: string;
    value: number;
    change: number;
  };
}> = ({
  x,
  y,
  label,
  value,
  color = '#f9c600',
  unit = '',
  comparison,
}) => {
  return (
    <div className="bg-gray-900 dark:bg-gray-800 text-white p-2 rounded-lg shadow-lg border border-gray-700 dark:border-gray-600 text-xs">
      <div className="font-semibold mb-1">{label}</div>
      <div className="flex items-baseline gap-1 mb-1">
        <span style={{ color }} className="font-bold">
          {value}
        </span>
        {unit && <span className="text-gray-400">{unit}</span>}
      </div>
      {comparison && (
        <div className="text-gray-400 text-xs">
          <div>{comparison.label}: {comparison.value}</div>
          <div
            className={comparison.change > 0 ? 'text-green-400' : 'text-red-400'}
          >
            {comparison.change > 0 ? '+' : ''}{comparison.change}%
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Hoverable Chart Point Component
 * نقطة بيانات قابلة للتفاعل مع تلميح
 */
export const HoverableChartPoint: React.FC<{
  x: number;
  y: number;
  value: number;
  label: string;
  color?: string;
  size?: number;
  tooltipContent: React.ReactNode;
  onHover?: (isHovered: boolean) => void;
}> = ({
  x,
  y,
  value,
  label,
  color = '#f9c600',
  size = 8,
  tooltipContent,
  onHover,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const pointRef = useRef<SVGCircleElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover?.(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHover?.(false);
  };

  return (
    <g>
      {/* Main point */}
      <circle
        ref={pointRef}
        cx={x}
        cy={y}
        r={size}
        fill={color}
        opacity={isHovered ? 1 : 0.8}
        className="transition-all duration-200 cursor-pointer hover:r-12"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />

      {/* Halo effect on hover */}
      {isHovered && (
        <circle
          cx={x}
          cy={y}
          r={size * 2}
          fill={color}
          opacity={0.2}
          className="animate-pulse"
        />
      )}

      {/* Tooltip */}
      {isHovered && (
        <foreignObject
          x={x - 60}
          y={y - 100}
          width={120}
          height={80}
          className="pointer-events-none"
        >
          <div className="flex justify-center">
            {tooltipContent}
          </div>
        </foreignObject>
      )}
    </g>
  );
};

/**
 * Bar Chart Tooltip Component
 * تلميح متخصص لرسوم بيانية العمود
 */
export const BarChartTooltip: React.FC<{
  label: string;
  value: number;
  percentage: number;
  color?: string;
  unit?: string;
  comparison?: number;
}> = ({
  label,
  value,
  percentage,
  color = '#f9c600',
  unit = '',
  comparison,
}) => {
  return (
    <div className="bg-gray-900 dark:bg-gray-800 text-white p-3 rounded-lg shadow-lg border border-gray-700 dark:border-gray-600 whitespace-nowrap">
      <div className="font-semibold text-sm mb-1">{label}</div>
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-3 h-3 rounded"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-bold">{value}{unit}</span>
      </div>
      <div className="text-xs text-gray-400">
        <div>{percentage}% من الإجمالي</div>
        {comparison !== undefined && (
          <div className={comparison > 0 ? 'text-green-400' : 'text-red-400'}>
            {comparison > 0 ? '+' : ''}{comparison}% مقارنة بالسابق
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Line Chart Tooltip Component
 * تلميح متخصص لرسوم بيانية الخطوط
 */
export const LineChartTooltip: React.FC<{
  date: string;
  values: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  average?: number;
}> = ({ date, values, average }) => {
  return (
    <div className="bg-gray-900 dark:bg-gray-800 text-white p-3 rounded-lg shadow-lg border border-gray-700 dark:border-gray-600">
      <div className="font-semibold text-sm mb-2">{date}</div>
      <div className="space-y-1">
        {values.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-400">{item.label}</span>
            </div>
            <span className="font-medium" style={{ color: item.color }}>
              {item.value}
            </span>
          </div>
        ))}
        {average !== undefined && (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-700 dark:border-gray-600">
            <span className="text-gray-400">المتوسط</span>
            <span className="font-medium text-yellow-400">{average}</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Pie Chart Tooltip Component
 * تلميح متخصص لرسوم بيانية الدائرة
 */
export const PieChartTooltip: React.FC<{
  label: string;
  value: number;
  percentage: number;
  color?: string;
  total?: number;
}> = ({
  label,
  value,
  percentage,
  color = '#f9c600',
  total,
}) => {
  return (
    <div className="bg-gray-900 dark:bg-gray-800 text-white p-3 rounded-lg shadow-lg border border-gray-700 dark:border-gray-600">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="font-semibold text-sm">{label}</span>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">القيمة</span>
          <span className="font-medium">{value}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">النسبة</span>
          <span className="font-medium" style={{ color }}>
            {percentage}%
          </span>
        </div>
        {total !== undefined && (
          <div className="flex justify-between pt-1 border-t border-gray-700 dark:border-gray-600">
            <span className="text-gray-400">من الإجمالي</span>
            <span className="font-medium">{total}</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Multi-Series Tooltip Component
 * تلميح لسلاسل بيانات متعددة
 */
export const MultiSeriesChartTooltip: React.FC<{
  label: string;
  series: Array<{
    name: string;
    value: number;
    color: string;
    unit?: string;
  }>;
  total?: number;
  average?: number;
}> = ({ label, series, total, average }) => {
  return (
    <div className="bg-gray-900 dark:bg-gray-800 text-white p-3 rounded-lg shadow-lg border border-gray-700 dark:border-gray-600">
      <div className="font-semibold text-sm mb-2">{label}</div>
      <div className="space-y-1.5">
        {series.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-400">{item.name}</span>
            </div>
            <span className="font-medium" style={{ color: item.color }}>
              {item.value}{item.unit || ''}
            </span>
          </div>
        ))}
        {(total !== undefined || average !== undefined) && (
          <div className="space-y-1 pt-1.5 border-t border-gray-700 dark:border-gray-600">
            {total !== undefined && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">الإجمالي</span>
                <span className="font-medium text-yellow-400">{total}</span>
              </div>
            )}
            {average !== undefined && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">المتوسط</span>
                <span className="font-medium text-yellow-400">{average}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
