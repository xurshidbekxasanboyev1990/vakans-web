import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/database';
import { authenticate, AuthRequest, requireAdmin } from '../middleware/auth';
import { deleteCachePattern } from '../config/redis';
import { io } from '../socket/index';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

// ============================================
// GET /admin/stats - Statistika
// ============================================
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const [usersCount, jobsCount, applicationsCount, pendingJobs] = await Promise.all([
      query('SELECT COUNT(*) FROM users WHERE user_type != $1', ['admin']),
      query('SELECT COUNT(*) FROM jobs'),
      query('SELECT COUNT(*) FROM applications'),
      query("SELECT COUNT(*) FROM jobs WHERE status = 'pending'")
    ]);

    const [workersCount, employersCount, activeJobs, blockedUsers] = await Promise.all([
      query("SELECT COUNT(*) FROM users WHERE user_type = 'worker'"),
      query("SELECT COUNT(*) FROM users WHERE user_type = 'employer'"),
      query("SELECT COUNT(*) FROM jobs WHERE status = 'active'"),
      query('SELECT COUNT(*) FROM users WHERE is_blocked = true')
    ]);

    res.json({
      success: true,
      data: {
        totalUsers: parseInt(usersCount.rows[0].count),
        workers: parseInt(workersCount.rows[0].count),
        employers: parseInt(employersCount.rows[0].count),
        blockedUsers: parseInt(blockedUsers.rows[0].count),
        totalJobs: parseInt(jobsCount.rows[0].count),
        activeJobs: parseInt(activeJobs.rows[0].count),
        pendingJobs: parseInt(pendingJobs.rows[0].count),
        totalApplications: parseInt(applicationsCount.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// GET /admin/users - Foydalanuvchilar
// ============================================
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;
    const userType = req.query.userType as string;
    const search = req.query.search as string;

    let whereConditions = ["user_type != 'admin'"];
    const params: any[] = [];
    let paramIndex = 1;

    if (userType && userType !== 'all') {
      whereConditions.push(`user_type = $${paramIndex}`);
      params.push(userType);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR phone ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const countResult = await query(`SELECT COUNT(*) FROM users ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT id, phone, email, first_name, last_name, user_type, region, 
              is_verified, is_blocked, created_at, last_login_at
       FROM users ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    const users = result.rows.map(user => ({
      id: user.id,
      phone: user.phone,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      userType: user.user_type,
      region: user.region,
      isVerified: user.is_verified,
      isBlocked: user.is_blocked,
      createdAt: user.created_at,
      lastLoginAt: user.last_login_at
    }));

    res.json({
      success: true,
      data: {
        users,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// PUT /admin/users/:id/block - Bloklash
// ============================================
router.put('/users/:id/block', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      'UPDATE users SET is_blocked = NOT is_blocked WHERE id = $1 RETURNING is_blocked',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Foydalanuvchi topilmadi' });
      return;
    }

    const isBlocked = result.rows[0].is_blocked;

    // Log activity
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, 'user', $3, $4)`,
      [req.user!.id, isBlocked ? 'block_user' : 'unblock_user', id, JSON.stringify({ targetUserId: id })]
    );

    // Real-time: Force logout blocked user
    if (isBlocked) {
      io.to(id).emit('user:blocked', { 
        message: 'Sizning akkauntingiz bloklandi' 
      });
    }

    res.json({
      success: true,
      data: { isBlocked },
      message: isBlocked ? 'Foydalanuvchi bloklandi' : 'Foydalanuvchi blokdan chiqarildi'
    });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// DELETE /admin/users/:id - O'chirish
// ============================================
router.delete('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM users WHERE id = $1 AND user_type != $2 RETURNING id', [id, 'admin']);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Foydalanuvchi topilmadi' });
      return;
    }

    res.json({ success: true, message: 'Foydalanuvchi o\'chirildi' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// GET /admin/jobs - Ishlar
// ============================================
router.get('/jobs', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;

    let whereClause = '';
    const params: any[] = [];

    if (status && status !== 'all') {
      whereClause = 'WHERE j.status = $1';
      params.push(status);
    }

    const countResult = await query(`SELECT COUNT(*) FROM jobs j ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT j.*, u.first_name as employer_first_name, u.company_name, c.name as category_name
       FROM jobs j
       LEFT JOIN users u ON j.employer_id = u.id
       LEFT JOIN categories c ON j.category_id = c.id
       ${whereClause}
       ORDER BY j.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    const jobs = result.rows.map(job => ({
      id: job.id,
      title: job.title,
      category: job.category_name,
      region: job.region,
      status: job.status,
      isFeatured: job.is_featured,
      viewsCount: job.views_count,
      applicationsCount: job.applications_count,
      createdAt: job.created_at,
      employerName: job.company_name || job.employer_first_name
    }));

    res.json({
      success: true,
      data: {
        jobs,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    console.error('Get admin jobs error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// PUT /admin/jobs/:id/approve - Tasdiqlash
// ============================================
router.put('/jobs/:id/approve', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;

    const result = await query(
      `UPDATE jobs SET status = 'active', is_featured = $1 WHERE id = $2 RETURNING employer_id`,
      [featured || false, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Ish topilmadi' });
      return;
    }

    // Notify employer
    await query(
      `INSERT INTO notifications (user_id, type, title, message, data)
       VALUES ($1, 'job_approved', 'Ish tasdiqlandi', 'Sizning ish eloningiz tasdiqlandi', $2)`,
      [result.rows[0].employer_id, JSON.stringify({ jobId: id })]
    );

    // Real-time: Notify employer about approval
    io.to(result.rows[0].employer_id).emit('notification:new', {
      type: 'job_approved',
      title: 'Ish tasdiqlandi',
      message: 'Sizning ish eloningiz tasdiqlandi',
      data: { jobId: id }
    });

    // Real-time: Notify all users about new job
    io.emit('job:approved', { id });

    // Clear cache
    await deleteCachePattern('jobs:*');

    res.json({ success: true, message: 'Ish tasdiqlandi' });
  } catch (error) {
    console.error('Approve job error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// PUT /admin/jobs/:id/reject - Rad etish
// ============================================
router.put('/jobs/:id/reject', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      res.status(400).json({ success: false, error: 'Sabab kiritilmagan' });
      return;
    }

    const result = await query(
      `UPDATE jobs SET status = 'rejected', rejection_reason = $1 WHERE id = $2 RETURNING employer_id`,
      [reason, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Ish topilmadi' });
      return;
    }

    // Notify employer
    await query(
      `INSERT INTO notifications (user_id, type, title, message, data)
       VALUES ($1, 'job_rejected', 'Ish rad etildi', $2, $3)`,
      [result.rows[0].employer_id, `Sabab: ${reason}`, JSON.stringify({ jobId: id })]
    );

    // Real-time: Notify employer about rejection
    io.to(result.rows[0].employer_id).emit('notification:new', {
      type: 'job_rejected',
      title: 'Ish rad etildi',
      message: `Sabab: ${reason}`,
      data: { jobId: id }
    });

    res.json({ success: true, message: 'Ish rad etildi' });
  } catch (error) {
    console.error('Reject job error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// PUT /admin/jobs/:id/feature - VIP qilish
// ============================================
router.put('/jobs/:id/feature', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      'UPDATE jobs SET is_featured = NOT is_featured WHERE id = $1 RETURNING is_featured',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Ish topilmadi' });
      return;
    }

    await deleteCachePattern('jobs:*');

    res.json({
      success: true,
      data: { isFeatured: result.rows[0].is_featured },
      message: result.rows[0].is_featured ? 'VIP qilindi' : 'VIP olib tashlandi'
    });
  } catch (error) {
    console.error('Feature job error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// GET /admin/applications - Arizalar
// ============================================
router.get('/applications', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const countResult = await query('SELECT COUNT(*) FROM applications');
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT a.*, j.title as job_title,
              w.first_name as worker_first_name, w.last_name as worker_last_name,
              e.first_name as employer_first_name, e.company_name
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN users w ON a.worker_id = w.id
       JOIN users e ON j.employer_id = e.id
       ORDER BY a.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const applications = result.rows.map(app => ({
      id: app.id,
      jobId: app.job_id,
      jobTitle: app.job_title,
      workerName: `${app.worker_first_name} ${app.worker_last_name}`,
      employerName: app.company_name || app.employer_first_name,
      status: app.status,
      createdAt: app.created_at
    }));

    res.json({
      success: true,
      data: {
        applications,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    console.error('Get admin applications error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// GET /admin/support - Support xabarlar
// ============================================
router.get('/support', async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT * FROM support_messages ORDER BY created_at DESC LIMIT 100`
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get support messages error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// PUT /admin/support/:id/reply - Javob berish
// ============================================
router.put('/support/:id/reply', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    if (!reply) {
      res.status(400).json({ success: false, error: 'Javob kiritilmagan' });
      return;
    }

    await query(
      `UPDATE support_messages 
       SET admin_reply = $1, admin_id = $2, replied_at = NOW(), status = 'resolved'
       WHERE id = $3`,
      [reply, req.user!.id, id]
    );

    res.json({ success: true, message: 'Javob yuborildi' });
  } catch (error) {
    console.error('Reply support error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// GET /admin/logs - Activity logs
// ============================================
router.get('/logs', async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT al.*, u.first_name, u.last_name
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT 100`
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// PUT /admin/credentials - Admin parolini o'zgartirish
// ============================================
router.put('/credentials', async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword, newPin, newPhone } = req.body;

    // Get admin user
    const userResult = await query(
      'SELECT id, password_hash FROM users WHERE id = $1 AND user_type = $2',
      [req.user!.id, 'admin']
    );

    if (userResult.rows.length === 0) {
      res.status(403).json({ success: false, error: 'Admin topilmadi' });
      return;
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!isValid) {
      res.status(401).json({ success: false, error: 'Joriy parol noto\'g\'ri' });
      return;
    }

    // Build update query
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      updates.push(`password_hash = $${paramIndex++}`);
      params.push(hashedPassword);
    }

    if (newPhone) {
      updates.push(`phone = $${paramIndex++}`);
      params.push(newPhone);
    }

    if (updates.length > 0) {
      updates.push(`updated_at = NOW()`);
      params.push(req.user!.id);
      
      await query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
        params
      );
    }

    // Log activity
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, details)
       VALUES ($1, 'admin_credentials_update', 'user', $2)`,
      [req.user!.id, JSON.stringify({ changedFields: updates.map(u => u.split('=')[0].trim()) })]
    );

    res.json({ success: true, message: 'Admin ma\'lumotlari yangilandi' });
  } catch (error) {
    console.error('Update admin credentials error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

export default router;
