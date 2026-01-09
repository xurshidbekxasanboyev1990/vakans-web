import { Router, Response } from 'express';
import { query } from '../config/database';
import { logger } from '../utils/logger';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// ============================================
// GET ALL CATEGORIES
// ============================================

router.get('/', async (req, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        id, 
        name, 
        name_uz,
        name_ru,
        icon,
        slug,
        parent_id,
        job_count,
        created_at
      FROM categories 
      ORDER BY name ASC
    `);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    logger.error('Get categories error', error);
    res.status(500).json({
      success: false,
      error: 'Kategoriyalarni olishda xatolik',
    });
  }
});

// ============================================
// GET CATEGORY BY ID
// ============================================

router.get('/:id', async (req, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT 
        id, 
        name, 
        name_uz,
        name_ru,
        icon,
        slug,
        parent_id,
        job_count,
        created_at
      FROM categories 
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Kategoriya topilmadi',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Get category error', error);
    res.status(500).json({
      success: false,
      error: 'Kategoriyani olishda xatolik',
    });
  }
});

// ============================================
// CREATE CATEGORY (Admin only)
// ============================================

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Faqat admin kategoriya yaratishi mumkin',
      });
    }

    const { name, name_uz, name_ru, icon, slug, parent_id } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Kategoriya nomi kiritilishi shart',
      });
    }

    const result = await query(`
      INSERT INTO categories (name, name_uz, name_ru, icon, slug, parent_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [name, name_uz || name, name_ru || name, icon, slug || name.toLowerCase().replace(/\s+/g, '-'), parent_id || null]);

    res.status(201).json({
      success: true,
      message: 'Kategoriya yaratildi',
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Create category error', error);
    res.status(500).json({
      success: false,
      error: 'Kategoriya yaratishda xatolik',
    });
  }
});

// ============================================
// UPDATE CATEGORY (Admin only)
// ============================================

router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Faqat admin kategoriyani tahrirlashi mumkin',
      });
    }

    const { id } = req.params;
    const { name, name_uz, name_ru, icon, slug, parent_id } = req.body;

    const result = await query(`
      UPDATE categories 
      SET 
        name = COALESCE($1, name),
        name_uz = COALESCE($2, name_uz),
        name_ru = COALESCE($3, name_ru),
        icon = COALESCE($4, icon),
        slug = COALESCE($5, slug),
        parent_id = COALESCE($6, parent_id),
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `, [name, name_uz, name_ru, icon, slug, parent_id, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Kategoriya topilmadi',
      });
    }

    res.json({
      success: true,
      message: 'Kategoriya yangilandi',
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Update category error', error);
    res.status(500).json({
      success: false,
      error: 'Kategoriyani yangilashda xatolik',
    });
  }
});

// ============================================
// DELETE CATEGORY (Admin only)
// ============================================

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Faqat admin kategoriyani o\'chirishi mumkin',
      });
    }

    const { id } = req.params;

    const result = await query(`
      DELETE FROM categories WHERE id = $1 RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Kategoriya topilmadi',
      });
    }

    res.json({
      success: true,
      message: 'Kategoriya o\'chirildi',
    });
  } catch (error) {
    logger.error('Delete category error', error);
    res.status(500).json({
      success: false,
      error: 'Kategoriyani o\'chirishda xatolik',
    });
  }
});

export default router;