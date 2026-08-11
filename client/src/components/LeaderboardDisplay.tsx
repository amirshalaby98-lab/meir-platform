import React from 'react';
import { Trophy, TrendingUp, Star, Zap } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface LeaderboardEntry {
  rank: number;
  technicianId: number;
  name: string;
  ratingScore: number;
  jobsScore: number;
  reviewsScore: number;
  totalScore: number;
}

interface LeaderboardDisplayProps {
  entries: LeaderboardEntry[];
  currentTechnicianId?: number;
  isLoading?: boolean;
  period?: 'weekly' | 'monthly' | 'yearly' | 'all_time';
}

/**
 * Get medal icon for top 3 positions
 */
const getMedalIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Trophy className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Trophy className="w-5 h-5 text-orange-600" />;
  return null;
};

/**
 * Get rank color
 */
const getRankColor = (rank: number) => {
  if (rank === 1) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
  if (rank === 2) return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  if (rank === 3) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
  return 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300';
};

/**
 * Leaderboard Display Component
 * عرض لوحة الصدارة
 */
export const LeaderboardDisplay: React.FC<LeaderboardDisplayProps> = ({
  entries,
  currentTechnicianId,
  isLoading = false,
  period = 'monthly',
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 animate-pulse h-16"
          />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
        <Trophy className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-400">لا توجد بيانات متاحة</p>
      </div>
    );
  }

  const periodLabel = {
    weekly: 'أسبوعي',
    monthly: 'شهري',
    yearly: 'سنوي',
    all_time: 'كل الوقت',
  }[period];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          لوحة الصدارة ({periodLabel})
        </h3>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {entries.length} فني
        </span>
      </div>

      <div className="space-y-2">
        {entries.map((entry, index) => {
          const isCurrentUser = entry.technicianId === currentTechnicianId;
          const medal = getMedalIcon(entry.rank);
          const rankColor = getRankColor(entry.rank);

          return (
            <Tooltip
              key={entry.technicianId}
              content={`التقييم: ${entry.ratingScore.toFixed(1)} | الوظائف: ${entry.jobsScore} | التقييمات: ${entry.reviewsScore}`}
              position="left"
              trigger="hover"
            >
              <div
                className={`
                  p-3 rounded-lg border-2 transition-all
                  ${rankColor}
                  ${isCurrentUser ? 'border-blue-500 dark:border-blue-400 shadow-md' : 'border-gray-200 dark:border-gray-700'}
                  hover:shadow-md
                `}
              >
                <div className="flex items-center gap-3">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center font-bold text-lg">
                    {medal ? (
                      medal
                    ) : (
                      <span className="text-gray-700 dark:text-gray-300">
                        #{entry.rank}
                      </span>
                    )}
                  </div>

                  {/* Technician Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {entry.name}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">
                          أنت
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      النقاط: {entry.totalScore.toFixed(1)}
                    </p>
                  </div>

                  {/* Scores */}
                  <div className="flex-shrink-0 flex gap-2">
                    <Tooltip
                      content="نقاط التقييم"
                      position="top"
                      trigger="hover"
                    >
                      <div className="flex items-center gap-1 bg-white dark:bg-gray-700 px-2 py-1 rounded text-xs">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="font-semibold">
                          {entry.ratingScore.toFixed(0)}
                        </span>
                      </div>
                    </Tooltip>

                    <Tooltip
                      content="نقاط الوظائف"
                      position="top"
                      trigger="hover"
                    >
                      <div className="flex items-center gap-1 bg-white dark:bg-gray-700 px-2 py-1 rounded text-xs">
                        <Zap className="w-3 h-3 text-blue-500" />
                        <span className="font-semibold">
                          {entry.jobsScore}
                        </span>
                      </div>
                    </Tooltip>

                    <Tooltip
                      content="نقاط التقييمات"
                      position="top"
                      trigger="hover"
                    >
                      <div className="flex items-center gap-1 bg-white dark:bg-gray-700 px-2 py-1 rounded text-xs">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="font-semibold">
                          {entry.reviewsScore}
                        </span>
                      </div>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </Tooltip>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
          شرح النقاط:
        </p>
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-500" />
            <span>التقييم (0-100)</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-blue-500" />
            <span>الوظائف (0-100)</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span>التقييمات (0-100)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Leaderboard Card Component
 * بطاقة لوحة الصدارة
 */
export const LeaderboardCard: React.FC<{ entry: LeaderboardEntry }> = ({ entry }) => {
  const medal = getMedalIcon(entry.rank);
  const rankColor = getRankColor(entry.rank);

  return (
    <div className={`p-4 rounded-lg border-2 ${rankColor}`}>
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center font-bold text-xl">
          {medal || `#${entry.rank}`}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {entry.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            النقاط الإجمالية: {entry.totalScore.toFixed(1)}
          </p>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {entry.totalScore.toFixed(0)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">نقطة</p>
        </div>
      </div>
    </div>
  );
};
