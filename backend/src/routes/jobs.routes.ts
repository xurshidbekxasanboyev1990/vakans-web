import { Router, Response } from 'express';
import { query } from '../config/database';
import { authenticate, optionalAuth, AuthRequest, requireRole } from '../middleware/auth';
import { createJobSchema, updateJobSchema, searchJobsSchema } from '../utils/validation';
import { setCache, getCache, deleteCache, deleteCachePattern } from '../config/redis';

const router = Router();

// ============================================
// GET /jobs - Ishlar ro'yxati
// ============================================
router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const validation = searchJobsSchema.safeParse(req.query);
    if (!validation.success) {
      res.status(400).json({ success: false, error: 'Validatsiya xatosi', details: validation.error.errors });
      return;
    }

    const { q, category, region, salaryMin, salaryMax, workType, sortBy, sortOrder, page, limit } = validation.data;
    const offset = (page - 1) * limit;

    // Build query
    let whereConditions = ["j.status = 'active'"];
    const params: any[] = [];
    let paramIndex = 1;

    if (q) {
      whereConditions.push(`(j.title ILIKE $${paramIndex} OR j.description ILIKE $${paramIndex})`);
      params.push(`%${q}%`);
      paramIndex++;
    }

    if (category) {
      whereConditions.push(`c.name = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (region) {
      whereConditions.push(`j.region = $${paramIndex}`);
      params.push(region);
      paramIndex++;
    }

    if (salaryMin) {
      whereConditions.push(`j.salary_max >= $${paramIndex}`);
      params.push(salaryMin);
      paramIndex++;
    }

    if (salaryMax) {
      whereConditions.push(`j.salary_min <= $${paramIndex}`);
      params.push(salaryMax);
      paramIndex++;
    }

    if (workType) {
      whereConditions.push(`j.work_type = $${paramIndex}`);
      params.push(workType);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Map sortBy to actual columns
    const sortColumn = sortBy === 'salary_min' ? 'j.salary_min' : sortBy === 'views_count' ? 'j.views_count' : 'j.created_at';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM jobs j 
       LEFT JOIN categories c ON j.category_id = c.id 
       ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Get jobs
    const jobsResult = await query(
      `SELECT j.*, c.name as category_name, c.icon as category_icon,
              u.first_name as employer_first_name, u.last_name as employer_last_name,
              u.company_name as employer_company, u.avatar_url as employer_avatar
       FROM jobs j
       LEFT JOIN categories c ON j.category_id = c.id
       LEFT JOIN users u ON j.employer_id = u.id
       ${whereClause}
       ORDER BY j.is_featured DESC, ${sortColumn} ${sortOrder}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    const jobs = jobsResult.rows.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      category: job.category_name,
      categoryIcon: job.category_icon,
      salaryMin: job.salary_min,
      salaryMax: job.salary_max,
      salaryType: job.salary_type,
      currency: job.currency,
      location: job.location,
      region: job.region,
      workType: job.work_type,
      requirements: job.requirements || [],
      benefits: job.benefits || [],
      isFeatured: job.is_featured,
      isUrgent: job.is_urgent,
      viewsCount: job.views_count,
      applicationsCount: job.applications_count,
      deadline: job.deadline,
      createdAt: job.created_at,
      employer: {
        id: job.employer_id,
        firstName: job.employer_first_name,
        lastName: job.employer_last_name,
        companyName: job.employer_company,
        avatarUrl: job.employer_avatar
      }
    }));

    res.json({
      success: true,
      data: {
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
    console.error('Get jobs error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// GET /jobs/featured - VIP ishlar
// ============================================
router.get('/featured', async (req: AuthRequest, res: Response) => {
  try {
    // Try cache first
    const cached = await getCache('jobs:featured');
    if (cached) {
      res.json({ success: true, data: cached });
      return;
    }

    const result = await query(
      `SELECT j.*, c.name as category_name, c.icon as category_icon,
              u.first_name as employer_first_name, u.company_name as employer_company
       FROM jobs j
       LEFT JOIN categories c ON j.category_id = c.id
       LEFT JOIN users u ON j.employer_id = u.id
       WHERE j.status = 'active' AND j.is_featured = true
       ORDER BY j.created_at DESC
       LIMIT 10`
    );

    const jobs = result.rows.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description?.substring(0, 200),
      category: job.category_name,
      categoryIcon: job.category_icon,
      salaryMin: job.salary_min,
      salaryMax: job.salary_max,
      region: job.region,
      workType: job.work_type,
      isFeatured: true,
      isUrgent: job.is_urgent,
      createdAt: job.created_at,
      employerName: job.employer_company || job.employer_first_name
    }));

    // Cache for 5 minutes
    await setCache('jobs:featured', jobs, 300);

    res.json({ success: true, data: jobs });
  } catch (error) {
    console.error('Get featured jobs error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// GET /jobs/:id - Bitta ish
// ============================================
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT j.*, c.name as category_name, c.icon as category_icon,
              u.id as employer_id, u.first_name as employer_first_name, 
              u.last_name as employer_last_name, u.company_name as employer_company,
              u.avatar_url as employer_avatar, u.region as employer_region,
              u.phone as employer_phone, u.is_verified as employer_verified
       FROM jobs j
       LEFT JOIN categories c ON j.category_id = c.id
       LEFT JOIN users u ON j.employer_id = u.id
       WHERE j.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Ish topilmadi' });
      return;
    }

    const job = result.rows[0];

    // Increment view count (async, don't wait)
    query('UPDATE jobs SET views_count = views_count + 1 WHERE id = $1', [id]).catch(console.error);

    // Check if user has applied
    let hasApplied = false;
    if (req.user) {
      const appResult = await query(
        'SELECT id FROM applications WHERE job_id = $1 AND worker_id = $2',
        [id, req.user.id]
      );
      hasApplied = appResult.rows.length > 0;
    }

    res.json({
      success: true,
      data: {
        id: job.id,
        title: job.title,
        description: job.description,
        category: job.category_name,
        categoryIcon: job.category_icon,
        requirements: job.requirements || [],
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
        salaryType: job.salary_type,
        currency: job.currency,
        location: job.location,
        region: job.region,
        address: job.address,
        workType: job.work_type,
        experienceRequired: job.experience_required,
        educationRequired: job.education_required,
        languagesRequired: job.languages_required || [],
        benefits: job.benefits || [],
        contactPhone: job.contact_phone,
        contactEmail: job.contact_email,
        isFeatured: job.is_featured,
        isUrgent: job.is_urgent,
        status: job.status,
        viewsCount: job.views_count + 1,
        applicationsCount: job.applications_count,
        deadline: job.deadline,
        createdAt: job.created_at,
        hasApplied,
        employer: {
          id: job.employer_id,
          firstName: job.employer_first_name,
          lastName: job.employer_last_name,
          companyName: job.employer_company,
          avatarUrl: job.employer_avatar,
          region: job.employer_region,
          phone: job.employer_phone,
          isVerified: job.employer_verified
        }
      }
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// POST /jobs - Yangi ish yaratish
// ============================================
router.post('/', authenticate, requireRole('employer', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const validation = createJobSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ success: false, error: 'Validatsiya xatosi', details: validation.error.errors });
      return;
    }

    const data = validation.data;
    const employerId = req.user!.id;

    // Get category ID if name provided
    let categoryId = data.categoryId;
    if (!categoryId && data.categoryId) {
      const catResult = await query('SELECT id FROM categories WHERE name = $1', [data.categoryId]);
      categoryId = catResult.rows[0]?.id;
    }

    const result = await query(
      `INSERT INTO jobs (
        employer_id, category_id, title, description, requirements,
        salary_min, salary_max, salary_type, currency, location, region, address,
        work_type, experience_required, education_required, languages_required,
        benefits, contact_phone, contact_email, is_urgent, deadline, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, 'pending')
      RETURNING *`,
      [
        employerId, categoryId, data.title, data.description, data.requirements || [],
        data.salaryMin || null, data.salaryMax || null, data.salaryType, data.currency,
        data.location || null, data.region, data.address || null,
        data.workType, data.experienceRequired || null, data.educationRequired || null,
        data.languagesRequired || [], data.benefits || [],
        data.contactPhone || null, data.contactEmail || null,
        data.isUrgent, data.deadline || null
      ]
    );

    const job = result.rows[0];

    // Clear cache
    await deleteCachePattern('jobs:*');

    res.status(201).json({
      success: true,
      data: {
        id: job.id,
        title: job.title,
        status: job.status,
        createdAt: job.created_at
      },
      message: 'Ish yaratildi va moderatsiyaga yuborildi'
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// PUT /jobs/:id - Ishni yangilash
// ============================================
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check ownership
    const jobCheck = await query('SELECT employer_id, status FROM jobs WHERE id = $1', [id]);
    if (jobCheck.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Ish topilmadi' });
      return;
    }

    if (jobCheck.rows[0].employer_id !== req.user!.id && req.user!.userType !== 'admin') {
      res.status(403).json({ success: false, error: 'Ruxsat yo\'q' });
      return;
    }

    const validation = updateJobSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ success: false, error: 'Validatsiya xatosi', details: validation.error.errors });
      return;
    }

    const updates = validation.data;
    
    // Build update query
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const fieldMap: Record<string, string> = {
      title: 'title',
      description: 'description',
      requirements: 'requirements',
      salaryMin: 'salary_min',
      salaryMax: 'salary_max',
      salaryType: 'salary_type',
      location: 'location',
      region: 'region',
      address: 'address',
      workType: 'work_type',
      experienceRequired: 'experience_required',
      educationRequired: 'education_required',
      languagesRequired: 'languages_required',
      benefits: 'benefits',
      contactPhone: 'contact_phone',
      contactEmail: 'contact_email',
      isUrgent: 'is_urgent',
      deadline: 'deadline'
    };

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && fieldMap[key]) {
        setClauses.push(`${fieldMap[key]} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (setClauses.length === 0) {
      res.status(400).json({ success: false, error: 'Yangilash uchun maydon topilmadi' });
      return;
    }

    values.push(id);

    const result = await query(
      `UPDATE jobs SET ${setClauses.join(', ')}, updated_at = NOW()
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    // Clear cache
    await deleteCachePattern('jobs:*');

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Ish yangilandi'
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// DELETE /jobs/:id - Ishni o'chirish
// ============================================
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check ownership
    const jobCheck = await query('SELECT employer_id FROM jobs WHERE id = $1', [id]);
    if (jobCheck.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Ish topilmadi' });
      return;
    }

    if (jobCheck.rows[0].employer_id !== req.user!.id && req.user!.userType !== 'admin') {
      res.status(403).json({ success: false, error: 'Ruxsat yo\'q' });
      return;
    }

    await query('DELETE FROM jobs WHERE id = $1', [id]);

    // Clear cache
    await deleteCachePattern('jobs:*');

    res.json({ success: true, message: 'Ish o\'chirildi' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// GET /jobs/my/posted - Mening ishlarim (employer)
// ============================================
router.get('/my/posted', authenticate, requireRole('employer', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT j.*, c.name as category_name
       FROM jobs j
       LEFT JOIN categories c ON j.category_id = c.id
       WHERE j.employer_id = $1
       ORDER BY j.created_at DESC`,
      [req.user!.id]
    );

    const jobs = result.rows.map(job => ({
      id: job.id,
      title: job.title,
      category: job.category_name,
      status: job.status,
      viewsCount: job.views_count,
      applicationsCount: job.applications_count,
      createdAt: job.created_at
    }));

    res.json({ success: true, data: jobs });
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

export default router;
