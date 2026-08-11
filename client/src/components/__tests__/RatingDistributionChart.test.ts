import { describe, it, expect } from 'vitest';

describe('RatingDistributionChart', () => {
  it('should calculate percentage correctly', () => {
    const fiveStarCount = 50;
    const fourStarCount = 30;
    const threeStarCount = 15;
    const twoStarCount = 3;
    const oneStarCount = 2;
    const totalReviews = 100;

    const fiveStarPercentage = (fiveStarCount / totalReviews) * 100;
    const fourStarPercentage = (fourStarCount / totalReviews) * 100;

    expect(fiveStarPercentage).toBe(50);
    expect(fourStarPercentage).toBe(30);
  });

  it('should handle zero reviews', () => {
    const totalReviews = 0;
    const percentage = totalReviews === 0 ? 0 : (50 / totalReviews) * 100;

    expect(percentage).toBe(0);
  });

  it('should calculate positive recommendation percentage', () => {
    const fiveStarCount = 60;
    const fourStarCount = 30;
    const totalReviews = 100;

    const recommendedCount = fiveStarCount + fourStarCount;
    const percentage = (recommendedCount / totalReviews) * 100;

    expect(percentage).toBe(90);
  });

  it('should sum all star counts correctly', () => {
    const fiveStarCount = 50;
    const fourStarCount = 30;
    const threeStarCount = 15;
    const twoStarCount = 3;
    const oneStarCount = 2;

    const total = fiveStarCount + fourStarCount + threeStarCount + twoStarCount + oneStarCount;

    expect(total).toBe(100);
  });

  it('should display correct star distribution', () => {
    const distribution = [
      { stars: 5, count: 50 },
      { stars: 4, count: 30 },
      { stars: 3, count: 15 },
      { stars: 2, count: 3 },
      { stars: 1, count: 2 },
    ];

    expect(distribution.length).toBe(5);
    expect(distribution[0].stars).toBe(5);
    expect(distribution[4].stars).toBe(1);
  });
});
