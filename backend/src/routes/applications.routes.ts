import { Router, Response } from 'express';
import { query } from '../config/database';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { createApplicationSchema, updateApplicationSchema } from '../utils/validation';
import { deleteCachePattern } from '../config/redis';

const router = Router();

// ============================================
// GET /applications - Mening arizalarim
// ============================================
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userType = req.user!.userType;

    let result;

    if (userType === 'worker') {
      // Ishchi - o'z arizalari
      result = await query(
        `SELECT a.*, j.title as job_title, j.region as job_region, j.salary_min, j.salary_max,
                u.first_name as employer_first_name, u.company_name as employer_company
         FROM applications a
         JOIN jobs j ON a.job_id = j.id
         JOIN users u ON j.employer_id = u.id
         WHERE a.worker_id = $1
         ORDER BY a.created_at DESC`,
        [userId]
      );
    } else if (userType === 'employer') {
      // Ish beruvchi - o'z ishlariga kelgan arizalar
      result = await query(
        `SELECT a.*, j.title as job_title, 
                u.first_name as worker_first_name, u.last_name as worker_last_name,
                u.phone as worker_phone, u.avatar_url as worker_avatar,
                u.skills as worker_skills, u.region as worker_region
         FROM applications a
         JOIN jobs j ON a.job_id = j.id
         JOIN users u ON a.worker_id = u.id
         WHERE j.employer_id = $1
         ORDER BY a.created_at DESC`,
        [userId]
      );
    } else {
      // Admin - barcha arizalar
      result = await query(
        `SELECT a.*, j.title as job_title,
                w.first_name as worker_first_name, w.last_name as worker_last_name,
                e.first_name as employer_first_name, e.company_name as employer_company
         FROM applications a
         JOIN jobs j ON a.job_id = j.id
         JOIN users w ON a.worker_id = w.id
         JOIN users e ON j.employer_id = e.id
         ORDER BY a.created_at DESC
         LIMIT 100`
      );
    }

    const applications = result.rows.map(app => ({
      id: app.id,
      jobId: app.job_id,
      jobTitle: app.job_title,
      jobRegion: app.job_region,
      salaryMin: app.salary_min,
      salaryMax: app.salary_max,
      coverLetter: app.cover_letter,
      status: app.status,
      employerNotes: app.employer_notes,
      rejectionReason: app.rejection_reason,
      createdAt: app.created_at,
      updatedAt: app.updated_at,
      // Worker info (for employers)
      worker: app.worker_first_name ? {
        id: app.worker_id,
        firstName: app.worker_first_name,
        lastName: app.worker_last_name,
        phone: app.worker_phone,
        avatarUrl: app.worker_avatar,
        skills: app.worker_skills || [],
        region: app.worker_region
      } : undefined,
      // Employer info (for workers)
      employer: app.employer_first_name ? {
        firstName: app.employer_first_name,
        companyName: app.employer_company
      } : undefined
    }));

    res.json({ success: true, data: applications });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// POST /applications - Ariza yuborish
// ============================================
router.post('/', authenticate, requireRole('worker'), async (req: AuthRequest, res: Response) => {
  try {
    const validation = createApplicationSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ success: false, error: 'Validatsiya xatosi', details: validation.error.errors });
      return;
    }

    const { jobId, coverLetter } = validation.data;
    const workerId = req.user!.id;

    // Check if job exists and is active
    const jobCheck = await query(
      "SELECT id, employer_id, status FROM jobs WHERE id = $1 AND status = 'active'",
      [jobId]
    );

    if (jobCheck.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Ish topilmadi yoki faol emas' });
      return;
    }

    // Check if already applied
    const existingApp = await query(
      'SELECT id FROM applications WHERE job_id = $1 AND worker_id = $2',
      [jobId, workerId]
    );

    if (existingApp.rows.length > 0) {
      res.status(409).json({ success: false, error: 'Bu ishga allaqachon ariza yuborgansiz' });
      return;
    }

    // Create application
    const result = await query(
      `INSERT INTO applications (job_id, worker_id, cover_letter)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [jobId, workerId, coverLetter || null]
    );

    // Create notification for employer
    const job = jobCheck.rows[0];
    await query(
      `INSERT INTO notifications (user_id, type, title, message, data)
       VALUES ($1, 'new_application', 'Yangi ariza', 'Sizning ishingizga yangi ariza keldi', $2)`,
      [job.employer_id, JSON.stringify({ jobId, applicationId: result.rows[0].id })]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.rows[0].id,
        jobId: result.rows[0].job_id,
        status: result.rows[0].status,
        createdAt: result.rows[0].created_at
      },
      message: 'Ariza yuborildi'
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// PUT /applications/:id - Ariza statusini yangilash
// ============================================
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Get application with job info
    const appCheck = await query(
      `SELECT a.*, j.employer_id 
       FROM applications a 
       JOIN jobs j ON a.job_id = j.id 
       WHERE a.id = $1`,
      [id]
    );

    if (appCheck.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Ariza topilmadi' });
      return;
    }

    const app = appCheck.rows[0];
    const userId = req.user!.id;
    const userType = req.user!.userType;

    // Worker can only withdraw their own applications
    if (userType === 'worker') {
      if (app.worker_id !== userId) {
        res.status(403).json({ success: false, error: 'Ruxsat yo\'q' });
        return;
      }

      const { status } = req.body;
      if (status !== 'withdrawn') {
        res.status(400).json({ success: false, error: 'Siz faqat arizani qaytarib olishingiz mumkin' });
        return;
      }

      await query(
        'UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2',
        ['withdrawn', id]
      );

      res.json({ success: true, message: 'Ariza qaytarib olindi' });
      return;
    }

    // Employer can accept/reject applications for their jobs
    if (userType === 'employer') {
      if (app.employer_id !== userId) {
        res.status(403).json({ success: false, error: 'Ruxsat yo\'q' });
        return;
      }
    }

    const validation = updateApplicationSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ success: false, error: 'Validatsiya xatosi', details: validation.error.errors });
      return;
    }

    const { status, employerNotes, rejectionReason } = validation.data;

    await query(
      `UPDATE applications 
       SET status = $1, employer_notes = $2, rejection_reason = $3, updated_at = NOW()
       WHERE id = $4`,
      [status, employerNotes || null, rejectionReason || null, id]
    );

    // Create notification for worker
    const notificationTitle = status === 'accepted' ? 'Ariza qabul qilindi!' : 
                              status === 'rejected' ? 'Ariza rad etildi' : 'Ariza ko\'rib chiqildi';
    
    await query(
      `INSERT INTO notifications (user_id, type, title, message, data)
       VALUES ($1, 'application_update', $2, $3, $4)`,
      [app.worker_id, notificationTitle, `Arizangiz holati: ${status}`, JSON.stringify({ applicationId: id })]
    );

    res.json({ success: true, message: 'Ariza yangilandi' });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// DELETE /applications/:id - Arizani o'chirish
// ============================================
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check ownership
    const appCheck = await query(
      `SELECT a.worker_id, j.employer_id 
       FROM applications a 
       JOIN jobs j ON a.job_id = j.id 
       WHERE a.id = $1`,
      [id]
    );

    if (appCheck.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Ariza topilmadi' });
      return;
    }

    const app = appCheck.rows[0];
    const userId = req.user!.id;
    const userType = req.user!.userType;

    // Only worker (owner) or admin can delete
    if (app.worker_id !== userId && userType !== 'admin') {
      res.status(403).json({ success: false, error: 'Ruxsat yo\'q' });
      return;
    }

    await query('DELETE FROM applications WHERE id = $1', [id]);

    res.json({ success: true, message: 'Ariza o\'chirildi' });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// GET /applications/job/:jobId - Ishga kelgan arizalar
// ============================================
router.get('/job/:jobId', authenticate, requireRole('employer', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { jobId } = req.params;

    // Check job ownership
    const jobCheck = await query('SELECT employer_id FROM jobs WHERE id = $1', [jobId]);
    if (jobCheck.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Ish topilmadi' });
      return;
    }

    if (jobCheck.rows[0].employer_id !== req.user!.id && req.user!.userType !== 'admin') {
      res.status(403).json({ success: false, error: 'Ruxsat yo\'q' });
      return;
    }

    const result = await query(
      `SELECT a.*, 
              u.first_name, u.last_name, u.phone, u.email, u.avatar_url,
              u.skills, u.experience_years, u.region, u.bio
       FROM applications a
       JOIN users u ON a.worker_id = u.id
       WHERE a.job_id = $1
       ORDER BY a.created_at DESC`,
      [jobId]
    );

    const applications = result.rows.map(app => ({
      id: app.id,
      coverLetter: app.cover_letter,
      status: app.status,
      employerNotes: app.employer_notes,
      createdAt: app.created_at,
      worker: {
        id: app.worker_id,
        firstName: app.first_name,
        lastName: app.last_name,
        phone: app.phone,
        email: app.email,
        avatarUrl: app.avatar_url,
        skills: app.skills || [],
        experienceYears: app.experience_years,
        region: app.region,
        bio: app.bio
      }
    }));

    res.json({ success: true, data: applications });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

export default router;
