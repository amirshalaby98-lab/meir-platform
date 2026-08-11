import { createLogger } from "../_core/logger";
const log = createLogger("saved-filters");
import { Router, Request, Response, NextFunction } from 'express';
import {
  saveTechnicianFilter,
  getSavedFilters,
  getSavedFilterById,
  updateSavedFilter,
  deleteSavedFilter,
  updateFilterUsageCount,
  setDefaultFilter,
  getDefaultFilter,
} from '../db';
import { sdk } from '../_core/sdk';

const router = Router();

/**
 * Middleware: Authenticate user from session cookie.
 * Attaches user to req.user if valid session exists.
 */
const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await sdk.authenticateRequest(req);
    (req as any).user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'غير مصرح - يرجى تسجيل الدخول' });
  }
};

/**
 * Middleware: Require admin role.
 * Must be used after requireAuth.
 */
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'غير مصرح - صلاحيات المدير مطلوبة' });
  }
  next();
};

/**
 * GET /api/saved-filters
 * جلب جميع الفلاتر المحفوظة للمستخدم الحالي
 */
router.get('/', requireAuth, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const filters = await getSavedFilters(userId);

    res.json(filters);
  } catch (error) {
    log.error('Error fetching saved filters:', error);
    res.status(500).json({ error: 'فشل تحميل الفلاتر المحفوظة' });
  }
});

/**
 * GET /api/saved-filters/default
 * جلب الفلتر الافتراضي للمستخدم
 */
router.get('/default', requireAuth, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const defaultFilter = await getDefaultFilter(userId);

    if (!defaultFilter) {
      return res.status(404).json({ error: 'لا يوجد فلتر افتراضي' });
    }

    res.json(defaultFilter);
  } catch (error) {
    log.error('Error fetching default filter:', error);
    res.status(500).json({ error: 'فشل تحميل الفلتر الافتراضي' });
  }
});

/**
 * GET /api/saved-filters/:id
 * جلب فلتر محدد
 */
router.get('/:id', requireAuth, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const filterId = parseInt(req.params.id);

    if (isNaN(filterId)) {
      return res.status(400).json({ error: 'معرف الفلتر غير صحيح' });
    }

    const filter = await getSavedFilterById(filterId, userId);

    if (!filter) {
      return res.status(404).json({ error: 'الفلتر غير موجود' });
    }

    res.json(filter);
  } catch (error) {
    log.error('Error fetching saved filter:', error);
    res.status(500).json({ error: 'فشل تحميل الفلتر' });
  }
});

/**
 * POST /api/saved-filters
 * حفظ فلتر جديد
 */
router.post('/', requireAuth, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const {
      name,
      description,
      startDate,
      endDate,
      technicianId,
      minRating,
      maxRating,
      minReviews,
      sortBy,
      isDefault,
    } = req.body;

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'اسم الفلتر مطلوب' });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({ error: 'اسم الفلتر طويل جداً (الحد الأقصى 100 حرف)' });
    }

    if (minRating !== undefined && maxRating !== undefined) {
      if (minRating < 1 || maxRating > 5 || minRating > maxRating) {
        return res.status(400).json({ error: 'نطاق التقييم غير صحيح' });
      }
    }

    const result = await saveTechnicianFilter(userId, {
      name,
      description,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      technicianId,
      minRating,
      maxRating,
      minReviews,
      sortBy,
      isDefault,
    });

    if (!result) {
      return res.status(500).json({ error: 'فشل حفظ الفلتر' });
    }

    res.status(201).json({ message: 'تم حفظ الفلتر بنجاح', result });
  } catch (error) {
    log.error('Error saving filter:', error);
    res.status(500).json({ error: 'فشل حفظ الفلتر' });
  }
});

/**
 * PUT /api/saved-filters/:id
 * تحديث فلتر موجود
 */
router.put('/:id', requireAuth, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const filterId = parseInt(req.params.id);

    if (isNaN(filterId)) {
      return res.status(400).json({ error: 'معرف الفلتر غير صحيح' });
    }

    const {
      name,
      description,
      startDate,
      endDate,
      technicianId,
      minRating,
      maxRating,
      minReviews,
      sortBy,
      isDefault,
    } = req.body;

    // Verify ownership
    const filter = await getSavedFilterById(filterId, userId);
    if (!filter) {
      return res.status(404).json({ error: 'الفلتر غير موجود' });
    }

    // Validation
    if (name !== undefined && name.trim().length === 0) {
      return res.status(400).json({ error: 'اسم الفلتر لا يمكن أن يكون فارغاً' });
    }

    if (minRating !== undefined || maxRating !== undefined) {
      const min = minRating ?? parseFloat(filter.minRating);
      const max = maxRating ?? parseFloat(filter.maxRating);
      if (min < 1 || max > 5 || min > max) {
        return res.status(400).json({ error: 'نطاق التقييم غير صحيح' });
      }
    }

    const result = await updateSavedFilter(filterId, userId, {
      name,
      description,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      technicianId,
      minRating,
      maxRating,
      minReviews,
      sortBy,
      isDefault,
    });

    if (!result) {
      return res.status(500).json({ error: 'فشل تحديث الفلتر' });
    }

    res.json({ message: 'تم تحديث الفلتر بنجاح' });
  } catch (error) {
    log.error('Error updating filter:', error);
    res.status(500).json({ error: 'فشل تحديث الفلتر' });
  }
});

/**
 * DELETE /api/saved-filters/:id
 * حذف فلتر
 */
router.delete('/:id', requireAuth, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const filterId = parseInt(req.params.id);

    if (isNaN(filterId)) {
      return res.status(400).json({ error: 'معرف الفلتر غير صحيح' });
    }

    // Verify ownership
    const filter = await getSavedFilterById(filterId, userId);
    if (!filter) {
      return res.status(404).json({ error: 'الفلتر غير موجود' });
    }

    const success = await deleteSavedFilter(filterId, userId);

    if (!success) {
      return res.status(500).json({ error: 'فشل حذف الفلتر' });
    }

    res.json({ message: 'تم حذف الفلتر بنجاح' });
  } catch (error) {
    log.error('Error deleting filter:', error);
    res.status(500).json({ error: 'فشل حذف الفلتر' });
  }
});

/**
 * POST /api/saved-filters/:id/use
 * تحديث عدد مرات استخدام الفلتر
 */
router.post('/:id/use', requireAuth, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const filterId = parseInt(req.params.id);

    if (isNaN(filterId)) {
      return res.status(400).json({ error: 'معرف الفلتر غير صحيح' });
    }

    // Verify ownership
    const filter = await getSavedFilterById(filterId, userId);
    if (!filter) {
      return res.status(404).json({ error: 'الفلتر غير موجود' });
    }

    const result = await updateFilterUsageCount(filterId);

    if (!result) {
      return res.status(500).json({ error: 'فشل تحديث عدد الاستخدامات' });
    }

    res.json({ message: 'تم تحديث عدد الاستخدامات' });
  } catch (error) {
    log.error('Error updating filter usage:', error);
    res.status(500).json({ error: 'فشل تحديث عدد الاستخدامات' });
  }
});

/**
 * POST /api/saved-filters/:id/default
 * تعيين فلتر كافتراضي
 */
router.post('/:id/default', requireAuth, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const filterId = parseInt(req.params.id);

    if (isNaN(filterId)) {
      return res.status(400).json({ error: 'معرف الفلتر غير صحيح' });
    }

    // Verify ownership
    const filter = await getSavedFilterById(filterId, userId);
    if (!filter) {
      return res.status(404).json({ error: 'الفلتر غير موجود' });
    }

    const result = await setDefaultFilter(filterId, userId);

    if (!result) {
      return res.status(500).json({ error: 'فشل تعيين الفلتر الافتراضي' });
    }

    res.json({ message: 'تم تعيين الفلتر الافتراضي بنجاح' });
  } catch (error) {
    log.error('Error setting default filter:', error);
    res.status(500).json({ error: 'فشل تعيين الفلتر الافتراضي' });
  }
});

export default router;
