/**
 * Loyalty Points System for Meir
 *
 * Points Rules:
 * - Earn 10 points for each completed booking
 * - Redeem 50 points for 10 SAR discount
 * - Redeem 100 points for 25 SAR discount
 * - Redeem 200 points for 60 SAR discount
 */

import { eq } from "drizzle-orm";
import { getDb } from "../../shared/database";
import { loyaltyPoints, pointsHistory } from "../../../drizzle/schema";

// Points earning rules
export const POINTS_PER_BOOKING = 10;

// Rewards catalog
export const REWARDS = [
  {
    id: 1,
    name: "خصم 10 ريال",
    points: 50,
    discount: 10,
    description: "احصل على خصم 10 ريال على حجزك القادم",
  },
  {
    id: 2,
    name: "خصم 25 ريال",
    points: 100,
    discount: 25,
    description: "احصل على خصم 25 ريال على حجزك القادم",
  },
  {
    id: 3,
    name: "خصم 60 ريال",
    points: 200,
    discount: 60,
    description: "احصل على خصم 60 ريال على حجزك القادم",
  },
  {
    id: 4,
    name: "خدمة مجانية",
    points: 300,
    discount: 100,
    description: "احصل على خدمة صيانة مجانية كاملة",
  },
];

/**
 * Get or create customer loyalty points
 */
export async function getCustomerPoints(phone: string, name: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Try to find existing customer
  const existing = await db
    .select()
    .from(loyaltyPoints)
    .where(eq(loyaltyPoints.customerPhone, phone))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Create new customer
  await db.insert(loyaltyPoints).values({
    customerPhone: phone,
    customerName: name,
    points: 0,
    totalEarned: 0,
    totalRedeemed: 0,
  });

  const newCustomer = await db
    .select()
    .from(loyaltyPoints)
    .where(eq(loyaltyPoints.customerPhone, phone))
    .limit(1);

  return newCustomer[0];
}

/**
 * Award points to customer
 */
export async function awardPoints(
  phone: string,
  name: string,
  points: number,
  reason: string,
  bookingId?: number
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Get or create customer
  const customer = await getCustomerPoints(phone, name);

  // Update points
  await db
    .update(loyaltyPoints)
    .set({
      points: customer.points + points,
      totalEarned: customer.totalEarned + points,
    })
    .where(eq(loyaltyPoints.customerPhone, phone));

  // Record history
  await db.insert(pointsHistory).values({
    customerPhone: phone,
    points: points,
    type: "earn",
    reason: reason,
    bookingId: bookingId,
  });

  return {
    success: true,
    newBalance: customer.points + points,
    pointsEarned: points,
  };
}

/**
 * Redeem points for reward
 */
export async function redeemPoints(
  phone: string,
  rewardId: number
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Find reward
  const reward = REWARDS.find((r) => r.id === rewardId);
  if (!reward) {
    throw new Error("Reward not found");
  }

  // Get customer
  const customer = await db
    .select()
    .from(loyaltyPoints)
    .where(eq(loyaltyPoints.customerPhone, phone))
    .limit(1);

  if (customer.length === 0) {
    throw new Error("Customer not found");
  }

  // Check if customer has enough points
  if (customer[0].points < reward.points) {
    throw new Error("Insufficient points");
  }

  // Deduct points
  await db
    .update(loyaltyPoints)
    .set({
      points: customer[0].points - reward.points,
      totalRedeemed: customer[0].totalRedeemed + reward.points,
    })
    .where(eq(loyaltyPoints.customerPhone, phone));

  // Record history
  await db.insert(pointsHistory).values({
    customerPhone: phone,
    points: -reward.points,
    type: "redeem",
    reason: `استبدال: ${reward.name}`,
  });

  return {
    success: true,
    newBalance: customer[0].points - reward.points,
    pointsRedeemed: reward.points,
    reward: reward,
  };
}

/**
 * Get customer points history
 */
export async function getPointsHistory(phone: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const history = await db
    .select()
    .from(pointsHistory)
    .where(eq(pointsHistory.customerPhone, phone))
    .orderBy(pointsHistory.createdAt);

  return history;
}

/**
 * Get available rewards for customer
 */
export async function getAvailableRewards(phone: string) {
  const customer = await getCustomerPoints(phone, "");

  return REWARDS.map((reward) => ({
    ...reward,
    canRedeem: customer.points >= reward.points,
    pointsNeeded: Math.max(0, reward.points - customer.points),
  }));
}

/**
 * Get loyalty statistics
 */
export async function getLoyaltyStats() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const allCustomers = await db.select().from(loyaltyPoints);

  const totalCustomers = allCustomers.length;
  const totalPointsEarned = allCustomers.reduce((sum, c) => sum + c.totalEarned, 0);
  const totalPointsRedeemed = allCustomers.reduce((sum, c) => sum + c.totalRedeemed, 0);
  const activePoints = allCustomers.reduce((sum, c) => sum + c.points, 0);

  return {
    totalCustomers,
    totalPointsEarned,
    totalPointsRedeemed,
    activePoints,
    averagePoints: totalCustomers > 0 ? Math.round(activePoints / totalCustomers) : 0,
  };
}
