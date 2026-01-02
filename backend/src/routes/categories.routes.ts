import { Router, Response } from 'express';
import { query } from '../config/database';
import { getCache, setCache } from '../config/redis';

const router = Router();

// ============================================
// GET /categories - Kategoriyalar
// ============================================
router.get('/', async (req, res: Response) => {
  try {
    // Try cache first
    const cached = await getCache('categories:all');
    if (cached) {
      res.json({ success: true, data: cached });
      return;
    }

    const result = await query(
      `SELECT id, name, name_uz, name_ru, name_en, icon, color, job_count
       FROM categories
       WHERE is_active = true
       ORDER BY job_count DESC, name ASC`
    );

    const categories = result.rows.map(cat => ({
      id: cat.id,
      name: cat.name,
      nameUz: cat.name_uz,
      nameRu: cat.name_ru,
      nameEn: cat.name_en,
      icon: cat.icon,
      color: cat.color,
      jobCount: cat.job_count
    }));

    // Cache for 10 minutes
    await setCache('categories:all', categories, 600);

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// GET /categories/:id - Bitta kategoriya
// ============================================
router.get('/:id', async (req, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT id, name, name_uz, name_ru, name_en, icon, color, job_count
       FROM categories
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Kategoriya topilmadi' });
      return;
    }

    const cat = result.rows[0];

    res.json({
      success: true,
      data: {
        id: cat.id,
        name: cat.name,
        nameUz: cat.name_uz,
        nameRu: cat.name_ru,
        nameEn: cat.name_en,
        icon: cat.icon,
        color: cat.color,
        jobCount: cat.job_count
      }
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// GET /categories/:id/jobs - Kategoriya ishlari
// ============================================
router.get('/:id/jobs', async (req, res: Response) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // Get category
    const catResult = await query('SELECT name FROM categories WHERE id = $1', [id]);
    if (catResult.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Kategoriya topilmadi' });
      return;
    }

    // Count jobs
    const countResult = await query(
      "SELECT COUNT(*) FROM jobs WHERE category_id = $1 AND status = 'active'",
      [id]
    );
    const total = parseInt(countResult.rows[0].count);

    // Get jobs
    const jobsResult = await query(
      `SELECT j.*, u.first_name as employer_first_name, u.company_name
       FROM jobs j
       LEFT JOIN users u ON j.employer_id = u.id
       WHERE j.category_id = $1 AND j.status = 'active'
       ORDER BY j.is_featured DESC, j.created_at DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    const jobs = jobsResult.rows.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description?.substring(0, 200),
      salaryMin: job.salary_min,
      salaryMax: job.salary_max,
      region: job.region,
      workType: job.work_type,
      isFeatured: job.is_featured,
      createdAt: job.created_at,
      employerName: job.company_name || job.employer_first_name
    }));

    res.json({
      success: true,
      data: {
        category: catResult.rows[0].name,
        jobs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get category jobs error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

export default router;
