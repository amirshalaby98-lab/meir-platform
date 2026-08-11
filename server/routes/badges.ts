import { createLogger } from "../_core/logger";
const log = createLogger("badges-route");
import { Router, Request, Response, NextFunction } from "express";
import { sdk } from "../_core/sdk";

const router = Router();

/**
 * Middleware: Authenticate user from session cookie.
 */
const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await sdk.authenticateRequest(req);
    (req as any).user = user;
    next();
  } catch {
    return res.status(401).json({ error: "غير مصرح - يرجى تسجيل الدخول" });
  }
};

/**
 * Middleware: Require admin role.
 */
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "غير مصرح - صلاحيات المدير مطلوبة" });
  }
  next();
};

/**
 * GET /api/badges/leaderboard/top
 * Get top technicians leaderboard (public - for display)
 */
router.get("/leaderboard/top", async (req, res) => {
  try {
    const { getTopTechniciansLeaderboard } = await import("../db");
    const period = (req.query.period as string) || "monthly";
    const limit = parseInt(req.query.limit as string) || 10;

    // Validate period
    const validPeriods = ["weekly", "monthly", "yearly", "all_time"];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({ error: "فترة غير صحيحة" });
    }

    // Validate limit
    if (limit < 1 || limit > 100) {
      return res.status(400).json({ error: "الحد يجب أن يكون بين 1 و 100" });
    }

    const leaderboard = await getTopTechniciansLeaderboard(
      period as "weekly" | "monthly" | "yearly" | "all_time",
      limit
    );

    res.json({ success: true, leaderboard });
  } catch (error) {
    log.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

/**
 * GET /api/badges/:technicianId
 * Get all badges for a technician (protected - requires login)
 */
router.get("/:technicianId", requireAuth, async (req, res) => {
  try {
    const { getTechnicianBadges } = await import("../db");
    const technicianId = parseInt(req.params.technicianId);

    if (isNaN(technicianId)) {
      return res.status(400).json({ error: "معرف الفني غير صحيح" });
    }

    const badges = await getTechnicianBadges(technicianId);
    res.json({ success: true, badges });
  } catch (error) {
    log.error("Error fetching badges:", error);
    res.status(500).json({ error: "Failed to fetch badges" });
  }
});

/**
 * GET /api/badges/:technicianId/rewards
 * Get all rewards for a technician (protected - requires login)
 */
router.get("/:technicianId/rewards", requireAuth, async (req, res) => {
  try {
    const { getTechnicianRewards } = await import("../db");
    const technicianId = parseInt(req.params.technicianId);

    if (isNaN(technicianId)) {
      return res.status(400).json({ error: "معرف الفني غير صحيح" });
    }

    const rewards = await getTechnicianRewards(technicianId);
    res.json({ success: true, rewards });
  } catch (error) {
    log.error("Error fetching rewards:", error);
    res.status(500).json({ error: "Failed to fetch rewards" });
  }
});

/**
 * GET /api/badges/:technicianId/leaderboard
 * Get technician's leaderboard position (protected - requires login)
 */
router.get("/:technicianId/leaderboard", requireAuth, async (req, res) => {
  try {
    const { getTechnicianLeaderboardPosition } = await import("../db");
    const technicianId = parseInt(req.params.technicianId);
    const period = (req.query.period as string) || "monthly";

    if (isNaN(technicianId)) {
      return res.status(400).json({ error: "معرف الفني غير صحيح" });
    }

    // Validate period
    const validPeriods = ["weekly", "monthly", "yearly", "all_time"];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({ error: "فترة غير صحيحة" });
    }

    const position = await getTechnicianLeaderboardPosition(
      technicianId,
      period as "weekly" | "monthly" | "yearly" | "all_time"
    );

    res.json({ success: true, position });
  } catch (error) {
    log.error("Error fetching leaderboard position:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard position" });
  }
});

/**
 * POST /api/badges/:technicianId/check-and-award
 * Check and award badges for a technician (admin only)
 */
router.post("/:technicianId/check-and-award", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { checkAndAwardBadges } = await import("../db");
    const technicianId = parseInt(req.params.technicianId);

    if (isNaN(technicianId)) {
      return res.status(400).json({ error: "معرف الفني غير صحيح" });
    }

    const awardedBadges = await checkAndAwardBadges(technicianId);
    res.json({
      success: true,
      message: `تم منح ${awardedBadges.length} شارة`,
      badges: awardedBadges,
    });
  } catch (error) {
    log.error("Error awarding badges:", error);
    res.status(500).json({ error: "Failed to award badges" });
  }
});

/**
 * POST /api/badges/leaderboard/update
 * Update leaderboard (admin only)
 */
router.post("/leaderboard/update", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { updateLeaderboard } = await import("../db");

    const success = await updateLeaderboard();

    if (success) {
      res.json({ success: true, message: "تم تحديث لوحة الصدارة بنجاح" });
    } else {
      res.status(500).json({ error: "فشل تحديث لوحة الصدارة" });
    }
  } catch (error) {
    log.error("Error updating leaderboard:", error);
    res.status(500).json({ error: "Failed to update leaderboard" });
  }
});

export default router;
