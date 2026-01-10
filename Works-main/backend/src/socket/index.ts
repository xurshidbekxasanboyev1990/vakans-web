import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';
import { logger } from '../utils/logger';
import { getJwtSecret } from '../middleware/auth';

// ============================================
// TYPES
// ============================================
interface AuthenticatedSocket extends Socket {
  userId?: string;
  userType?: string;
  userName?: string;
}

interface OnlineUser {
  odemonger: string;
  odemongerName: string;
  userType: string;
  socketId: string;
  connectedAt: Date;
}

// ============================================
// GLOBAL STATE
// ============================================
const onlineUsers = new Map<string, OnlineUser>();
export let io: Server;

// ============================================
// SOCKET SERVER SETUP
// ============================================
export function setupSocketServer(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, getJwtSecret()) as { userId: string; userType: string };
      
      // Get user info
      const result = await query(
        'SELECT id, first_name, last_name, user_type FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        return next(new Error('User not found'));
      }

      const user = result.rows[0];
      socket.userId = user.id;
      socket.userType = user.user_type;
      socket.userName = `${user.first_name} ${user.last_name || ''}`.trim();
      
      next();
    } catch (error) {
      logger.error('Socket auth error:', error);
      next(new Error('Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`🔌 User connected: ${socket.userName} (${socket.userId})`);

    // Add to online users
    if (socket.userId) {
      onlineUsers.set(socket.userId, {
        odemonger: socket.userId,
        odemongerName: socket.userName || 'Unknown',
        userType: socket.userType || 'worker',
        socketId: socket.id,
        connectedAt: new Date(),
      });

      // Join personal room
      socket.join(`user:${socket.userId}`);
      
      // Join role-based room
      socket.join(`role:${socket.userType}`);

      // Broadcast online status
      io.emit('user:online', {
        userId: socket.userId,
        userName: socket.userName,
        userType: socket.userType,
      });

      // Send online users count
      io.emit('users:count', onlineUsers.size);
    }

    // ========================================
    // CHAT EVENTS
    // ========================================
    
    // Join chat room
    socket.on('chat:join', (chatId: string) => {
      socket.join(`chat:${chatId}`);
      logger.info(`User ${socket.userId} joined chat ${chatId}`);
    });

    // Leave chat room
    socket.on('chat:leave', (chatId: string) => {
      socket.leave(`chat:${chatId}`);
    });

    // Send message
    socket.on('chat:message', async (data: { chatId: string; message: string; receiverId: string }) => {
      try {
        const { chatId, message, receiverId } = data;
        
        // Save to database
        const result = await query(
          `INSERT INTO chat_messages (chat_id, sender_id, receiver_id, message, created_at)
           VALUES ($1, $2, $3, $4, NOW())
           RETURNING id, created_at`,
          [chatId, socket.userId, receiverId, message]
        );

        const messageData = {
          id: result.rows[0].id,
          chatId,
          senderId: socket.userId,
          senderName: socket.userName,
          receiverId,
          message,
          createdAt: result.rows[0].created_at,
        };

        // Send to chat room
        io.to(`chat:${chatId}`).emit('chat:message', messageData);
        
        // Also send to receiver's personal room
        io.to(`user:${receiverId}`).emit('chat:new', messageData);

        logger.info(`Message sent from ${socket.userId} to ${receiverId}`);
      } catch (error) {
        logger.error('Chat message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('chat:typing', (data: { chatId: string; isTyping: boolean }) => {
      socket.to(`chat:${data.chatId}`).emit('chat:typing', {
        odemonger: socket.userId,
        userName: socket.userName,
        isTyping: data.isTyping,
      });
    });

    // Mark messages as read
    socket.on('chat:read', async (data: { chatId: string; messageIds: string[] }) => {
      try {
        await query(
          `UPDATE chat_messages SET is_read = true WHERE id = ANY($1)`,
          [data.messageIds]
        );
        
        io.to(`chat:${data.chatId}`).emit('chat:read', {
          chatId: data.chatId,
          messageIds: data.messageIds,
          readBy: socket.userId,
        });
      } catch (error) {
        logger.error('Mark read error:', error);
      }
    });

    // ========================================
    // NOTIFICATION EVENTS
    // ========================================
    
    // Mark notification as read
    socket.on('notification:read', async (notificationId: string) => {
      try {
        await query(
          'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
          [notificationId, socket.userId]
        );
        
        socket.emit('notification:updated', { id: notificationId, isRead: true });
      } catch (error) {
        logger.error('Notification read error:', error);
      }
    });

    // Mark all notifications as read
    socket.on('notification:readAll', async () => {
      try {
        await query(
          'UPDATE notifications SET is_read = true WHERE user_id = $1',
          [socket.userId]
        );
        
        socket.emit('notification:allRead');
      } catch (error) {
        logger.error('Read all notifications error:', error);
      }
    });

    // ========================================
    // JOB EVENTS (for employers)
    // ========================================
    
    // Watch job for real-time updates
    socket.on('job:watch', (jobId: string) => {
      socket.join(`job:${jobId}`);
    });

    socket.on('job:unwatch', (jobId: string) => {
      socket.leave(`job:${jobId}`);
    });

    // ========================================
    // APPLICATION EVENTS
    // ========================================
    
    // Watch applications
    socket.on('applications:watch', () => {
      socket.join(`applications:${socket.userId}`);
    });

    // ========================================
    // DISCONNECT
    // ========================================
    socket.on('disconnect', () => {
      logger.info(`🔌 User disconnected: ${socket.userName} (${socket.userId})`);
      
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        
        // Broadcast offline status
        io.emit('user:offline', {
          userId: socket.userId,
        });
        
        // Update online count
        io.emit('users:count', onlineUsers.size);
      }
    });
  });

  return io;
}

// ============================================
// HELPER FUNCTIONS - Export for use in routes
// ============================================

// Send notification to specific user
export function sendNotification(userId: string, notification: {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
}) {
  if (io) {
    io.to(`user:${userId}`).emit('notification:new', notification);
    logger.info(`📢 Notification sent to user ${userId}: ${notification.title}`);
  }
}

// Send to all users of specific type
export function broadcastToRole(role: 'worker' | 'employer' | 'admin', event: string, data: any) {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
    logger.info(`📢 Broadcast to ${role}s: ${event}`);
  }
}

// Send new job notification to all workers
export function notifyNewJob(job: { id: string; title: string; region: string; salaryMin?: number; salaryMax?: number }) {
  if (io) {
    io.to('role:worker').emit('job:new', job);
    logger.info(`📢 New job notification: ${job.title}`);
  }
}

// Notify job owner about new application
export function notifyNewApplication(employerId: string, application: {
  id: string;
  jobId: string;
  jobTitle: string;
  workerName: string;
}) {
  if (io) {
    io.to(`user:${employerId}`).emit('application:new', application);
    sendNotification(employerId, {
      id: application.id,
      type: 'new_application',
      title: 'Yangi ariza!',
      message: `${application.workerName} "${application.jobTitle}" ishiga ariza yubordi`,
      data: application,
    });
  }
}

// Notify worker about application status change
export function notifyApplicationStatus(workerId: string, application: {
  id: string;
  jobId: string;
  jobTitle: string;
  status: 'viewed' | 'accepted' | 'rejected';
  employerName?: string;
}) {
  if (io) {
    const statusMessages = {
      viewed: 'ko\'rib chiqildi',
      accepted: 'qabul qilindi! 🎉',
      rejected: 'rad etildi',
    };
    
    io.to(`user:${workerId}`).emit('application:status', application);
    sendNotification(workerId, {
      id: application.id,
      type: `application_${application.status}`,
      title: application.status === 'accepted' ? 'Tabriklaymiz!' : 'Ariza holati',
      message: `"${application.jobTitle}" uchun arizangiz ${statusMessages[application.status]}`,
      data: application,
    });
  }
}

// Notify about job update
export function notifyJobUpdate(jobId: string, update: { type: 'update' | 'delete'; data?: any }) {
  if (io) {
    io.to(`job:${jobId}`).emit(`job:${update.type}`, { jobId, ...update.data });
  }
}

// Get online users
export function getOnlineUsers(): OnlineUser[] {
  return Array.from(onlineUsers.values());
}

// Check if user is online
export function isUserOnline(userId: string): boolean {
  return onlineUsers.has(userId);
}

// Get socket.io instance
export function getIO(): Server {
  return io;
}
