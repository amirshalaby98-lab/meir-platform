import { createLogger } from "../_core/logger";
const log = createLogger("technician-route");
import express, { Request, Response } from 'express';
import { getTechnicianStats, getTechnicianReviews, getTechnicianReviewsCount, getTechnicianMonthlyStats, getTechnicianRatingDistribution } from '../db';
// Authentication middleware can be added here

const router = express.Router();

/**
 * GET /api/technician/stats/:technicianId
 * الحصول على إحصائيات الفني
 */
router.get('/stats/:technicianId', async (req: Request, res: Response) => {
  try {
    const { technicianId } = req.params;
    const id = parseInt(technicianId);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid technician ID' });
    }

    const stats = await getTechnicianStats(id);

    if (!stats) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    res.json(stats);
  } catch (error) {
    log.error('Error fetching technician stats:', error);
    res.status(500).json({ error: 'Failed to fetch technician stats' });
  }
});

/**
 * GET /api/technician/reviews/:technicianId
 * الحصول على تقييمات الفني
 */
router.get('/reviews/:technicianId', async (req: Request, res: Response) => {
  try {
    const { technicianId } = req.params;
    const { limit = '10', offset = '0' } = req.query;

    const id = parseInt(technicianId);
    const limitNum = Math.min(parseInt(limit as string) || 10, 100);
    const offsetNum = parseInt(offset as string) || 0;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid technician ID' });
    }

    const reviews = await getTechnicianReviews(id, limitNum, offsetNum);
    const total = await getTechnicianReviewsCount(id);

    res.json({
      data: reviews,
      total,
      limit: limitNum,
      offset: offsetNum,
    });
  } catch (error) {
    log.error('Error fetching technician reviews:', error);
    res.status(500).json({ error: 'Failed to fetch technician reviews' });
  }
});

/**
 * GET /api/technician/reviews/:technicianId/count
 * عدد التقييمات للفني
 */
router.get('/reviews/:technicianId/count', async (req: Request, res: Response) => {
  try {
    const { technicianId } = req.params;
    const id = parseInt(technicianId);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid technician ID' });
    }

    const count = await getTechnicianReviewsCount(id);

    res.json({ count });
  } catch (error) {
    log.error('Error counting technician reviews:', error);
    res.status(500).json({ error: 'Failed to count technician reviews' });
  }
});

/**
 * GET /api/technician/monthly-stats/:technicianId
 * الإحصائيات الشهرية للفني
 */
router.get('/monthly-stats/:technicianId', async (req: Request, res: Response) => {
  try {
    const { technicianId } = req.params;
    const id = parseInt(technicianId);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid technician ID' });
    }

    const stats = await getTechnicianMonthlyStats(id);

    if (!stats) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    res.json(stats);
  } catch (error) {
    log.error('Error fetching monthly stats:', error);
    res.status(500).json({ error: 'Failed to fetch monthly stats' });
  }
});

/**
 * GET /api/technician/rating-distribution/:technicianId
 * توزيع التقييمات للفني
 */
router.get('/rating-distribution/:technicianId', async (req: Request, res: Response) => {
  try {
    const { technicianId } = req.params;
    const id = parseInt(technicianId);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid technician ID' });
    }

    const distribution = await getTechnicianRatingDistribution(id);

    res.json({ data: distribution });
  } catch (error) {
    log.error('Error fetching rating distribution:', error);
    res.status(500).json({ error: 'Failed to fetch rating distribution' });
  }
});

export default router;
