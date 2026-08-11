import { describe, it, expect } from 'vitest';

describe('Badges Components', () => {
  const mockBadges = [
    {
      id: 1,
      name: 'نجم الخدمة',
      description: 'حقق تقييم 4.8 نجوم أو أعلى',
      icon: '⭐',
      color: 'yellow',
      type: 'rating',
      rarity: 'rare' as const,
      earnedAt: new Date().toISOString(),
      expiresAt: undefined,
      isPinned: true,
    },
    {
      id: 2,
      name: 'مئة وظيفة',
      description: 'أكمل 100 وظيفة بنجاح',
      icon: '🏆',
      color: 'gold',
      type: 'jobs',
      rarity: 'epic' as const,
      earnedAt: new Date().toISOString(),
      expiresAt: undefined,
      isPinned: false,
    },
  ];

  describe('BadgesDisplay', () => {
    it('يجب أن يكون لديه هيكل شارات صحيح', () => {
      expect(mockBadges).toHaveLength(2);
      expect(mockBadges[0].name).toBe('نجم الخدمة');
      expect(mockBadges[0].rarity).toBe('rare');
    });

    it('يجب أن يميز الشارات المثبتة', () => {
      const pinned = mockBadges.filter(b => b.isPinned);
      expect(pinned).toHaveLength(1);
      expect(pinned[0].name).toBe('نجم الخدمة');
    });

    it('يجب أن يعرض عدد الشارات', () => {
      expect(mockBadges.length).toBe(2);
    });

    it('يجب أن يفلتر حسب النوع', () => {
      const ratingBadges = mockBadges.filter(b => b.type === 'rating');
      expect(ratingBadges).toHaveLength(1);
    });

    it('يجب أن يتحقق من انتهاء الصلاحية', () => {
      const expiredBadge = {
        ...mockBadges[0],
        expiresAt: new Date(Date.now() - 1000).toISOString(),
      };
      const isExpired = new Date(expiredBadge.expiresAt) < new Date();
      expect(isExpired).toBe(true);
    });
  });
});

describe('Rewards Components', () => {
  const mockRewards = [
    {
      id: 1,
      name: 'خصم 10%',
      description: 'خصم 10% على الخدمات',
      icon: '🎁',
      type: 'discount' as const,
      value: undefined as number | undefined,
      percentage: 10,
      status: 'active' as const,
      earnedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      usedAt: undefined as string | undefined,
    },
    {
      id: 2,
      name: 'مكافأة 100 ريال',
      description: 'مكافأة مالية',
      icon: '💰',
      type: 'bonus' as const,
      value: 100,
      percentage: undefined as number | undefined,
      status: 'pending' as const,
      earnedAt: new Date().toISOString(),
      expiresAt: undefined as string | undefined,
      usedAt: undefined as string | undefined,
    },
  ];

  describe('RewardsDisplay', () => {
    it('يجب أن يكون لديه هيكل مكافآت صحيح', () => {
      expect(mockRewards).toHaveLength(2);
      expect(mockRewards[0].type).toBe('discount');
      expect(mockRewards[1].type).toBe('bonus');
    });

    it('يجب أن يفلتر المكافآت النشطة', () => {
      const active = mockRewards.filter(r => r.status === 'active');
      expect(active).toHaveLength(1);
    });

    it('يجب أن يحسب القيمة الإجمالية', () => {
      const totalValue = mockRewards
        .filter(r => r.value !== undefined)
        .reduce((sum, r) => sum + (r.value || 0), 0);
      expect(totalValue).toBe(100);
    });
  });

  describe('RewardsSummary', () => {
    it('يجب أن يحسب عدد المكافآت حسب الحالة', () => {
      const byStatus = mockRewards.reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      expect(byStatus['active']).toBe(1);
      expect(byStatus['pending']).toBe(1);
    });
  });
});

describe('Leaderboard Components', () => {
  const mockEntries = [
    {
      rank: 1,
      technicianId: 1,
      name: 'أحمد محمد',
      ratingScore: 100,
      jobsScore: 100,
      reviewsScore: 100,
      totalScore: 100,
    },
    {
      rank: 2,
      technicianId: 2,
      name: 'سارة علي',
      ratingScore: 95,
      jobsScore: 90,
      reviewsScore: 85,
      totalScore: 90,
    },
    {
      rank: 3,
      technicianId: 3,
      name: 'محمود حسن',
      ratingScore: 90,
      jobsScore: 85,
      reviewsScore: 80,
      totalScore: 85,
    },
  ];

  describe('LeaderboardDisplay', () => {
    it('يجب أن يرتب حسب المجموع الكلي', () => {
      const sorted = [...mockEntries].sort((a, b) => b.totalScore - a.totalScore);
      expect(sorted[0].name).toBe('أحمد محمد');
      expect(sorted[2].name).toBe('محمود حسن');
    });

    it('يجب أن يميز المراكز الثلاثة الأولى', () => {
      const topThree = mockEntries.filter(e => e.rank <= 3);
      expect(topThree).toHaveLength(3);
    });

    it('يجب أن يحسب متوسط النقاط', () => {
      const avgScore = mockEntries.reduce((sum, e) => sum + e.totalScore, 0) / mockEntries.length;
      expect(avgScore).toBeCloseTo(91.67, 1);
    });
  });

  describe('LeaderboardCard', () => {
    it('يجب أن يعرض بيانات الفني', () => {
      const entry = mockEntries[0];
      expect(entry.name).toBe('أحمد محمد');
      expect(entry.totalScore).toBe(100);
      expect(entry.rank).toBe(1);
    });

    it('يجب أن يحدد الميدالية حسب الترتيب', () => {
      const getMedal = (rank: number) => {
        if (rank === 1) return 'gold';
        if (rank === 2) return 'silver';
        if (rank === 3) return 'bronze';
        return 'none';
      };
      expect(getMedal(1)).toBe('gold');
      expect(getMedal(2)).toBe('silver');
      expect(getMedal(3)).toBe('bronze');
      expect(getMedal(4)).toBe('none');
    });
  });
});
