import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/database';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { updateProfileSchema } from '../utils/validation';
import { deleteCachePattern } from '../config/redis';

const router = Router();

// ============================================
// GET /users/profile - Profil olish
// ============================================
router.get('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT id, phone, first_name, last_name, user_type, email, region, avatar_url, 
              bio, skills, experience_years, education, languages, company_name, 
              company_description, website, is_verified, created_at, updated_at
       FROM users WHERE id = $1`,
      [req.user!.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Foydalanuvchi topilmadi' });
      return;
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        profile: {
          id: user.id,
          phone: user.phone,
          firstName: user.first_name,
          lastName: user.last_name,
          userType: user.user_type,
          email: user.email,
          region: user.region,
          avatarUrl: user.avatar_url,
          bio: user.bio,
          skills: user.skills || [],
          experienceYears: user.experience_years,
          education: user.education,
          languages: user.languages || [],
          companyName: user.company_name,
          companyDescription: user.company_description,
          website: user.website,
          isVerified: user.is_verified,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// PUT /users/profile - Profilni yangilash
// ============================================
router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const validation = updateProfileSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ 
        success: false, 
        error: 'Validatsiya xatosi', 
        details: validation.error.errors 
      });
      return;
    }

    const updates = validation.data;
    const userId = req.user!.id;

    // Build dynamic update query
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const fieldMap: Record<string, string> = {
      firstName: 'first_name',
      lastName: 'last_name',
      email: 'email',
      bio: 'bio',
      region: 'region',
      skills: 'skills',
      experienceYears: 'experience_years',
      education: 'education',
      languages: 'languages',
      companyName: 'company_name',
      companyDescription: 'company_description',
      website: 'website'
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

    values.push(userId);

    const result = await query(
      `UPDATE users SET ${setClauses.join(', ')}, updated_at = NOW()
       WHERE id = $${paramIndex}
       RETURNING id, phone, first_name, last_name, user_type, email, region, avatar_url, 
                 bio, skills, experience_years, education, languages, company_name, 
                 company_description, website, is_verified, created_at, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Foydalanuvchi topilmadi' });
      return;
    }

    const user = result.rows[0];

    // Clear cache
    await deleteCachePattern(`user:${userId}*`);

    res.json({
      success: true,
      data: {
        profile: {
          id: user.id,
          phone: user.phone,
          firstName: user.first_name,
          lastName: user.last_name,
          userType: user.user_type,
          email: user.email,
          region: user.region,
          avatarUrl: user.avatar_url,
          bio: user.bio,
          skills: user.skills || [],
          experienceYears: user.experience_years,
          education: user.education,
          languages: user.languages || [],
          companyName: user.company_name,
          companyDescription: user.company_description,
          website: user.website,
          isVerified: user.is_verified,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// PUT /users/password - Parolni o'zgartirish
// ============================================
router.put('/password', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, error: 'Joriy va yangi parol kiritilmagan' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, error: 'Yangi parol kamida 6 ta belgi bo\'lishi kerak' });
      return;
    }

    // Get current password
    const result = await query('SELECT password_hash FROM users WHERE id = $1', [req.user!.id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Foydalanuvchi topilmadi' });
      return;
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!isValid) {
      res.status(401).json({ success: false, error: 'Joriy parol noto\'g\'ri' });
      return;
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, req.user!.id]);

    res.json({ success: true, message: 'Parol muvaffaqiyatli o\'zgartirildi' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// DELETE /users/account - Akkauntni o'chirish
// ============================================
router.delete('/account', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { password } = req.body;

    if (!password) {
      res.status(400).json({ success: false, error: 'Parol kiritilmagan' });
      return;
    }

    // Verify password
    const result = await query('SELECT password_hash FROM users WHERE id = $1', [req.user!.id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Foydalanuvchi topilmadi' });
      return;
    }

    const isValid = await bcrypt.compare(password, result.rows[0].password_hash);
    if (!isValid) {
      res.status(401).json({ success: false, error: 'Parol noto\'g\'ri' });
      return;
    }

    // Delete user (cascade will delete related data)
    await query('DELETE FROM users WHERE id = $1', [req.user!.id]);

    // Clear cache
    await deleteCachePattern(`user:${req.user!.id}*`);

    res.json({ success: true, message: 'Akkount o\'chirildi' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// GET /users/:id - Foydalanuvchi ma'lumoti (public)
// ============================================
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT id, first_name, last_name, user_type, region, avatar_url, bio, 
              skills, experience_years, education, languages, company_name, 
              company_description, website, is_verified, created_at
       FROM users WHERE id = $1 AND is_blocked = false`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Foydalanuvchi topilmadi' });
      return;
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: user.user_type,
        region: user.region,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        skills: user.skills || [],
        experienceYears: user.experience_years,
        education: user.education,
        languages: user.languages || [],
        companyName: user.company_name,
        companyDescription: user.company_description,
        website: user.website,
        isVerified: user.is_verified,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

export default router;
