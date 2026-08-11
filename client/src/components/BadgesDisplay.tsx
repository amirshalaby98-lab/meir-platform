import React from 'react';
import { Award, Star, Zap, Trophy, Heart, Flame } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface Badge {
  id: number;
  name: string;
  description?: string;
  icon: string;
  color: string;
  type: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  earnedAt: string;
  expiresAt?: string;
  isPinned: boolean;
}

interface BadgesDisplayProps {
  badges: Badge[];
  isLoading?: boolean;
  maxDisplay?: number;
}

/**
 * Get rarity color and styling
 */
const getRarityStyle = (rarity: string) => {
  const styles = {
    common: {
      bg: 'bg-gray-100 dark:bg-gray-700',
      border: 'border-gray-300 dark:border-gray-600',
      text: 'text-gray-700 dark:text-gray-300',
      glow: 'shadow-sm',
    },
    uncommon: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      border: 'border-green-300 dark:border-green-700',
      text: 'text-green-700 dark:text-green-300',
      glow: 'shadow-md shadow-green-200 dark:shadow-green-900/50',
    },
    rare: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      border: 'border-blue-300 dark:border-blue-700',
      text: 'text-blue-700 dark:text-blue-300',
      glow: 'shadow-md shadow-blue-200 dark:shadow-blue-900/50',
    },
    epic: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      border: 'border-purple-300 dark:border-purple-700',
      text: 'text-purple-700 dark:text-purple-300',
      glow: 'shadow-lg shadow-purple-200 dark:shadow-purple-900/50',
    },
    legendary: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      border: 'border-yellow-300 dark:border-yellow-700',
      text: 'text-yellow-700 dark:text-yellow-300',
      glow: 'shadow-lg shadow-yellow-200 dark:shadow-yellow-900/50',
    },
  };

  return styles[rarity as keyof typeof styles] || styles.common;
};

/**
 * Get badge icon based on type
 */
const getBadgeIcon = (type: string, icon: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    rating: <Star className="w-5 h-5" />,
    jobs: <Trophy className="w-5 h-5" />,
    reviews: <Heart className="w-5 h-5" />,
    consistency: <Zap className="w-5 h-5" />,
    growth: <Flame className="w-5 h-5" />,
    special: <Award className="w-5 h-5" />,
  };

  return iconMap[type] || <Award className="w-5 h-5" />;
};

/**
 * Badges Display Component
 * عرض الشارات المكتسبة
 */
export const BadgesDisplay: React.FC<BadgesDisplayProps> = ({
  badges,
  isLoading = false,
  maxDisplay = 6,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-200 dark:bg-gray-700 rounded-lg p-3 animate-pulse h-24"
          />
        ))}
      </div>
    );
  }

  if (badges.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
        <Award className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-400">لم تكسب أي شارات حتى الآن</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
          حسّن أدائك لكسب شارات حصرية
        </p>
      </div>
    );
  }

  const displayedBadges = badges.slice(0, maxDisplay);
  const remainingCount = Math.max(0, badges.length - maxDisplay);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {displayedBadges.map((badge) => {
          const rarityStyle = getRarityStyle(badge.rarity);
          const isExpired = badge.expiresAt && new Date(badge.expiresAt) < new Date();

          return (
            <Tooltip
              key={badge.id}
              content={`${badge.name}${badge.description ? ': ' + badge.description : ''}`}
              position="top"
              trigger="hover"
            >
              <div
                className={`
                  relative p-3 rounded-lg border-2 transition-all
                  ${rarityStyle.bg} ${rarityStyle.border} ${rarityStyle.glow}
                  hover:scale-105 cursor-pointer
                  ${isExpired ? 'opacity-50' : ''}
                `}
              >
                {badge.isPinned && (
                  <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1">
                    <Star className="w-3 h-3 text-white fill-white" />
                  </div>
                )}

                <div className="flex flex-col items-center gap-1">
                  <div className={`${rarityStyle.text}`}>
                    {getBadgeIcon(badge.type, badge.icon)}
                  </div>
                  <p className="text-xs font-semibold text-center line-clamp-2">
                    {badge.name}
                  </p>
                  {isExpired && (
                    <p className="text-xs text-red-600 dark:text-red-400">منتهية</p>
                  )}
                </div>
              </div>
            </Tooltip>
          );
        })}

        {remainingCount > 0 && (
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-3 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                +{remainingCount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">شارات أخرى</p>
            </div>
          </div>
        )}
      </div>

      {/* Badge Statistics */}
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2">
          <p className="text-blue-600 dark:text-blue-400 font-semibold">{badges.length}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">إجمالي الشارات</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-2">
          <p className="text-purple-600 dark:text-purple-400 font-semibold">
            {badges.filter(b => b.rarity === 'legendary' || b.rarity === 'epic').length}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">نادرة</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded p-2">
          <p className="text-yellow-600 dark:text-yellow-400 font-semibold">
            {badges.filter(b => b.isPinned).length}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">مثبتة</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Badge Card Component
 * بطاقة الشارة المفردة
 */
export const BadgeCard: React.FC<{ badge: Badge }> = ({ badge }) => {
  const rarityStyle = getRarityStyle(badge.rarity);
  const isExpired = badge.expiresAt && new Date(badge.expiresAt) < new Date();

  return (
    <div
      className={`
        p-4 rounded-lg border-2 transition-all
        ${rarityStyle.bg} ${rarityStyle.border} ${rarityStyle.glow}
      `}
    >
      <div className="flex items-start gap-3">
        <div className={`text-2xl ${rarityStyle.text}`}>
          {getBadgeIcon(badge.type, badge.icon)}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {badge.name}
            </h3>
            <span className={`text-xs px-2 py-1 rounded ${rarityStyle.bg} ${rarityStyle.text}`}>
              {badge.rarity}
            </span>
          </div>

          {badge.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {badge.description}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>حصلت عليها: {new Date(badge.earnedAt).toLocaleDateString('ar-SA')}</span>
            {isExpired && <span className="text-red-600 dark:text-red-400">منتهية</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Badge List Component
 * قائمة الشارات
 */
export const BadgeList: React.FC<BadgesDisplayProps> = ({
  badges,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 animate-pulse h-20"
          />
        ))}
      </div>
    );
  }

  if (badges.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        لا توجد شارات
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {badges.map((badge) => (
        <BadgeCard key={badge.id} badge={badge} />
      ))}
    </div>
  );
};
