import { Router, Response } from 'express';
import { query } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { sendNotification, isUserOnline } from '../socket/index';

const router = Router();

// ============================================
// GET /chat/rooms - Chat xonalari ro'yxati
// ============================================
router.get('/rooms', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const result = await query(
      `SELECT 
        cr.id,
        cr.job_id,
        cr.last_message_at,
        cr.created_at,
        CASE 
          WHEN cr.participant1_id = $1 THEN cr.participant2_id
          ELSE cr.participant1_id
        END as other_user_id,
        u.first_name as other_user_first_name,
        u.last_name as other_user_last_name,
        u.avatar_url as other_user_avatar,
        u.user_type as other_user_type,
        j.title as job_title,
        (SELECT message FROM chat_messages WHERE chat_id = cr.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT COUNT(*) FROM chat_messages WHERE chat_id = cr.id AND receiver_id = $1 AND is_read = false) as unread_count
       FROM chat_rooms cr
       LEFT JOIN users u ON (CASE WHEN cr.participant1_id = $1 THEN cr.participant2_id ELSE cr.participant1_id END) = u.id
       LEFT JOIN jobs j ON cr.job_id = j.id
       WHERE cr.participant1_id = $1 OR cr.participant2_id = $1
       ORDER BY cr.last_message_at DESC`,
      [userId]
    );

    const rooms = result.rows.map(room => ({
      id: room.id,
      jobId: room.job_id,
      jobTitle: room.job_title,
      lastMessageAt: room.last_message_at,
      lastMessage: room.last_message,
      unreadCount: parseInt(room.unread_count) || 0,
      otherUser: {
        id: room.other_user_id,
        firstName: room.other_user_first_name,
        lastName: room.other_user_last_name,
        avatarUrl: room.other_user_avatar,
        userType: room.other_user_type,
        isOnline: isUserOnline(room.other_user_id),
      },
    }));

    res.json({ success: true, data: rooms });
  } catch (error) {
    logger.error('Get chat rooms error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// POST /chat/rooms - Yangi chat yaratish
// ============================================
router.post('/rooms', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { participantId, jobId } = req.body;

    if (!participantId) {
      res.status(400).json({ success: false, error: 'participantId kerak' });
      return;
    }

    // Check if chat already exists
    const existing = await query(
      `SELECT id FROM chat_rooms 
       WHERE (participant1_id = $1 AND participant2_id = $2)
          OR (participant1_id = $2 AND participant2_id = $1)`,
      [userId, participantId]
    );

    if (existing.rows.length > 0) {
      res.json({ success: true, data: { id: existing.rows[0].id, isNew: false } });
      return;
    }

    // Create new chat room
    const result = await query(
      `INSERT INTO chat_rooms (participant1_id, participant2_id, job_id)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [userId, participantId, jobId || null]
    );

    res.status(201).json({ 
      success: true, 
      data: { id: result.rows[0].id, isNew: true } 
    });
  } catch (error) {
    logger.error('Create chat room error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// GET /chat/rooms/:id/messages - Xabarlar
// ============================================
router.get('/rooms/:id/messages', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const chatId = req.params.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    // Verify user is participant
    const roomCheck = await query(
      `SELECT id FROM chat_rooms 
       WHERE id = $1 AND (participant1_id = $2 OR participant2_id = $2)`,
      [chatId, userId]
    );

    if (roomCheck.rows.length === 0) {
      res.status(403).json({ success: false, error: 'Ruxsat yo\'q' });
      return;
    }

    // Get messages
    const result = await query(
      `SELECT 
        cm.id,
        cm.sender_id,
        cm.receiver_id,
        cm.message,
        cm.is_read,
        cm.created_at,
        u.first_name as sender_first_name,
        u.last_name as sender_last_name,
        u.avatar_url as sender_avatar
       FROM chat_messages cm
       LEFT JOIN users u ON cm.sender_id = u.id
       WHERE cm.chat_id = $1
       ORDER BY cm.created_at DESC
       LIMIT $2 OFFSET $3`,
      [chatId, limit, offset]
    );

    // Mark messages as read
    await query(
      `UPDATE chat_messages 
       SET is_read = true 
       WHERE chat_id = $1 AND receiver_id = $2 AND is_read = false`,
      [chatId, userId]
    );

    const messages = result.rows.reverse().map(msg => ({
      id: msg.id,
      senderId: msg.sender_id,
      receiverId: msg.receiver_id,
      message: msg.message,
      isRead: msg.is_read,
      createdAt: msg.created_at,
      sender: {
        firstName: msg.sender_first_name,
        lastName: msg.sender_last_name,
        avatarUrl: msg.sender_avatar,
      },
      isMine: msg.sender_id === userId,
    }));

    res.json({ success: true, data: messages });
  } catch (error) {
    logger.error('Get messages error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// POST /chat/rooms/:id/messages - Xabar yuborish
// ============================================
router.post('/rooms/:id/messages', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const chatId = req.params.id;
    const { message } = req.body;

    if (!message || !message.trim()) {
      res.status(400).json({ success: false, error: 'Xabar kiritilmagan' });
      return;
    }

    // Get chat room and other participant
    const roomResult = await query(
      `SELECT 
        cr.*,
        CASE 
          WHEN cr.participant1_id = $2 THEN cr.participant2_id
          ELSE cr.participant1_id
        END as receiver_id
       FROM chat_rooms cr
       WHERE cr.id = $1 AND (cr.participant1_id = $2 OR cr.participant2_id = $2)`,
      [chatId, userId]
    );

    if (roomResult.rows.length === 0) {
      res.status(403).json({ success: false, error: 'Ruxsat yo\'q' });
      return;
    }

    const room = roomResult.rows[0];
    const receiverId = room.receiver_id;

    // Insert message
    const result = await query(
      `INSERT INTO chat_messages (chat_id, sender_id, receiver_id, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id, created_at`,
      [chatId, userId, receiverId, message.trim()]
    );

    const messageData = {
      id: result.rows[0].id,
      chatId,
      senderId: userId,
      receiverId,
      message: message.trim(),
      isRead: false,
      createdAt: result.rows[0].created_at,
    };

    // Send real-time notification
    sendNotification(receiverId, {
      id: messageData.id,
      type: 'new_message',
      title: 'Yangi xabar',
      message: message.trim().substring(0, 50) + (message.length > 50 ? '...' : ''),
      data: { chatId, senderId: userId },
    });

    res.status(201).json({ success: true, data: messageData });
  } catch (error) {
    logger.error('Send message error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

// ============================================
// GET /chat/unread - O'qilmagan xabarlar soni
// ============================================
router.get('/unread', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const result = await query(
      `SELECT COUNT(*) as count FROM chat_messages 
       WHERE receiver_id = $1 AND is_read = false`,
      [userId]
    );

    res.json({ 
      success: true, 
      data: { unreadCount: parseInt(result.rows[0].count) || 0 } 
    });
  } catch (error) {
    logger.error('Get unread count error:', error);
    res.status(500).json({ success: false, error: 'Serverda xatolik' });
  }
});

export default router;
