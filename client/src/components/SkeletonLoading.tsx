import React from 'react';

interface SkeletonLoadingProps {
  count?: number;
  variant?: 'filter-item' | 'filter-list' | 'chart' | 'table-row';
}

/**
 * Skeleton Loading component for improved UX during data fetching
 * يعرض تأثير تحميل skeleton بدلاً من محتوى فارغ
 */
export const SkeletonLoading: React.FC<SkeletonLoadingProps> = ({
  count = 1,
  variant = 'filter-item',
}) => {
  const skeletonItems = Array.from({ length: count });

  if (variant === 'filter-item') {
    return (
      <div className="space-y-2">
        {skeletonItems.map((_, index) => (
          <div
            key={index}
            className="p-3 rounded-lg bg-gray-100 animate-pulse border border-gray-200"
          >
            {/* Filter name skeleton */}
            <div className="h-5 bg-gray-300 rounded w-1/3 mb-2"></div>

            {/* Filter description skeleton */}
            <div className="h-4 bg-gray-300 rounded w-2/3 mb-3"></div>

            {/* Filter details skeleton */}
            <div className="flex gap-3 mb-2">
              <div className="h-3 bg-gray-300 rounded w-1/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/4"></div>
            </div>

            {/* Action buttons skeleton */}
            <div className="flex gap-2 justify-end">
              <div className="h-8 bg-gray-300 rounded w-8"></div>
              <div className="h-8 bg-gray-300 rounded w-8"></div>
              <div className="h-8 bg-gray-300 rounded w-8"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'filter-list') {
    return (
      <div className="space-y-3">
        {skeletonItems.map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 animate-pulse">
        {/* Chart title skeleton */}
        <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>

        {/* Chart bars skeleton */}
        <div className="space-y-3">
          {skeletonItems.map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="h-4 bg-gray-300 rounded w-1/6"></div>
              <div className="h-8 bg-gray-300 rounded flex-1"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'table-row') {
    return (
      <div className="space-y-2">
        {skeletonItems.map((_, index) => (
          <div key={index} className="flex gap-4 animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-1/6"></div>
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/5"></div>
            <div className="h-4 bg-gray-300 rounded w-1/6"></div>
            <div className="h-4 bg-gray-300 rounded flex-1"></div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

/**
 * Skeleton Pulse Animation - CSS animation for skeleton loading
 */
export const SkeletonPulse = () => (
  <style>{`
    @keyframes skeleton-pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    .animate-pulse {
      animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `}</style>
);

/**
 * Skeleton Shimmer Animation - Advanced shimmer effect
 */
export const SkeletonShimmer = () => (
  <style>{`
    @keyframes skeleton-shimmer {
      0% {
        background-position: -1000px 0;
      }
      100% {
        background-position: 1000px 0;
      }
    }

    .animate-shimmer {
      background: linear-gradient(
        90deg,
        #f0f0f0 25%,
        #e0e0e0 50%,
        #f0f0f0 75%
      );
      background-size: 1000px 100%;
      animation: skeleton-shimmer 2s infinite;
    }
  `}</style>
);
