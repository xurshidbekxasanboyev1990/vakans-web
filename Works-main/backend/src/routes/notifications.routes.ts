import { Router, Response } from 'express';
import { query } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { io } from '../socket/index';

const router = Router();

// ============================================
// GET /notifications - Foydalanuvchi bildirshnomalari
// ============================================
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const result = await query(
      `SELECT id, type, title, message, data, is_read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user!.id, limit, offset]
    );

    // Get unread count
    const unreadResult = await query(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false`,
      [req.user!.id]
    );

    res.json({
      success: true,
      data: {
        notifications: result.rows,
        unreadCount: parseInt(unreadResult.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// PUT /notifications/:id/read - Bildirish o'qildi
// ============================================
router.put('/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await query(
      `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`,
      [id, req.user!.id]
    );

    // Real-time: Update notification count
    io.to(req.user!.id).emit('notification:read', { id });

    res.json({ success: true });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// PUT /notifications/read-all - Barchasini o'qildi
// ============================================
router.put('/read-all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await query(
      `UPDATE notifications SET is_read = true WHERE user_id = $1`,
      [req.user!.id]
    );

    // Real-time: Clear all notifications count
    io.to(req.user!.id).emit('notification:read-all');

    res.json({ success: true });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// DELETE /notifications/:id - Bildirish o'chirish
// ============================================
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await query(
      `DELETE FROM notifications WHERE id = $1 AND user_id = $2`,
      [id, req.user!.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// DELETE /notifications - Barchasini o'chirish
// ============================================
router.delete('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await query(
      `DELETE FROM notifications WHERE user_id = $1`,
      [req.user!.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Delete all notifications error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// Helper function: Create notification
// ============================================
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message?: string,
  data?: object
): Promise<void> {
  try {
    await query(
      `INSERT INTO notifications (user_id, type, title, message, data)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, type, title, message, data ? JSON.stringify(data) : null]
    );
  } catch (error) {
    console.error('Create notification error:', error);
    // Don't throw - notifications are not critical
  }
}

export default router;
