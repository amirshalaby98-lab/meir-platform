import React from 'react';
import { Gift, DollarSign, Percent, Zap, CheckCircle } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface Reward {
  id: number;
  name: string;
  description?: string;
  icon: string;
  type: 'discount' | 'bonus' | 'feature' | 'recognition' | 'priority';
  value?: number;
  percentage?: number;
  status: 'pending' | 'active' | 'used' | 'expired';
  earnedAt: string;
  expiresAt?: string;
  usedAt?: string;
}

interface RewardsDisplayProps {
  rewards: Reward[];
  isLoading?: boolean;
  onUseReward?: (rewardId: number) => void;
}

/**
 * Get reward type icon and color
 */
const getRewardStyle = (type: string) => {
  const styles = {
    discount: {
      icon: <Percent className="w-5 h-5" />,
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-300 dark:border-red-700',
      text: 'text-red-700 dark:text-red-300',
      badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    },
    bonus: {
      icon: <DollarSign className="w-5 h-5" />,
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-300 dark:border-green-700',
      text: 'text-green-700 dark:text-green-300',
      badge: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    },
    feature: {
      icon: <Zap className="w-5 h-5" />,
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-300 dark:border-yellow-700',
      text: 'text-yellow-700 dark:text-yellow-300',
      badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    },
    recognition: {
      icon: <Gift className="w-5 h-5" />,
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-300 dark:border-purple-700',
      text: 'text-purple-700 dark:text-purple-300',
      badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    },
    priority: {
      icon: <CheckCircle className="w-5 h-5" />,
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-300 dark:border-blue-700',
      text: 'text-blue-700 dark:text-blue-300',
      badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    },
  };

  return styles[type as keyof typeof styles] || styles.bonus;
};

/**
 * Get status badge
 */
const getStatusBadge = (status: string) => {
  const statuses = {
    pending: { text: 'قيد الانتظار', bg: 'bg-gray-100 dark:bg-gray-700', text_color: 'text-gray-700 dark:text-gray-300' },
    active: { text: 'نشطة', bg: 'bg-green-100 dark:bg-green-900/30', text_color: 'text-green-700 dark:text-green-300' },
    used: { text: 'مستخدمة', bg: 'bg-blue-100 dark:bg-blue-900/30', text_color: 'text-blue-700 dark:text-blue-300' },
    expired: { text: 'منتهية', bg: 'bg-red-100 dark:bg-red-900/30', text_color: 'text-red-700 dark:text-red-300' },
  };

  return statuses[status as keyof typeof statuses] || statuses.pending;
};

/**
 * Rewards Display Component
 * عرض المكافآت
 */
export const RewardsDisplay: React.FC<RewardsDisplayProps> = ({
  rewards,
  isLoading = false,
  onUseReward,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 animate-pulse h-24"
          />
        ))}
      </div>
    );
  }

  if (rewards.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
        <Gift className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-400">لا توجد مكافآت متاحة</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
          حسّن أدائك لكسب مكافآت حصرية
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rewards.map((reward) => {
        const style = getRewardStyle(reward.type);
        const statusStyle = getStatusBadge(reward.status);
        const isExpired = reward.expiresAt && new Date(reward.expiresAt) < new Date();
        const isActive = reward.status === 'active' && !isExpired;

        return (
          <Tooltip
            key={reward.id}
            content={reward.description || reward.name}
            position="left"
            trigger="hover"
          >
            <div
              className={`
                p-4 rounded-lg border-2 transition-all
                ${style.bg} ${style.border}
                ${isActive ? 'hover:shadow-md' : 'opacity-60'}
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`text-2xl ${style.text} flex-shrink-0`}>
                  {style.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {reward.name}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${statusStyle.bg} ${statusStyle.text_color}`}>
                      {statusStyle.text}
                    </span>
                  </div>

                  {reward.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {reward.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 flex-wrap gap-2">
                    <span>
                      {reward.value && `${reward.value} ر.س`}
                      {reward.percentage && `${reward.percentage}%`}
                    </span>
                    {reward.expiresAt && (
                      <span>
                        تنتهي: {new Date(reward.expiresAt).toLocaleDateString('ar-SA')}
                      </span>
                    )}
                  </div>
                </div>

                {isActive && onUseReward && (
                  <button
                    onClick={() => onUseReward(reward.id)}
                    className={`
                      px-3 py-1 rounded text-sm font-medium whitespace-nowrap
                      ${style.badge} hover:opacity-80 transition-opacity
                    `}
                  >
                    استخدم
                  </button>
                )}
              </div>
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
};

/**
 * Rewards Summary Component
 * ملخص المكافآت
 */
export const RewardsSummary: React.FC<{ rewards: Reward[] }> = ({ rewards }) => {
  const activeRewards = rewards.filter(r => r.status === 'active');
  const usedRewards = rewards.filter(r => r.status === 'used');
  const totalValue = rewards.reduce((sum, r) => sum + (r.value || 0), 0);

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
          {activeRewards.length}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">مكافآت نشطة</p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {usedRewards.length}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">مستخدمة</p>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
          {totalValue > 0 ? `${totalValue} ر.س` : rewards.length}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {totalValue > 0 ? 'القيمة الإجمالية' : 'إجمالي المكافآت'}
        </p>
      </div>
    </div>
  );
};
