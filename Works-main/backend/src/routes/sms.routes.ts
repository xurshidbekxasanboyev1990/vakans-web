import { Router, Response } from 'express';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { setCache, getCache, deleteCache } from '../config/redis';
import { logger } from '../utils/logger';

const router = Router();

// ============================================
// SMS SETTINGS TYPES
// ============================================

interface SMSSettings {
  // Umumiy sozlamalar
  enabled: boolean; // SMS xizmati yoqiq/o'chiq
  provider: 'eskiz' | 'playmobile' | 'demo'; // SMS provayder
  
  // Eskiz credentials
  eskizEmail: string;
  eskizPassword: string;
  eskizFrom: string;
  
  // SMS turlari
  types: {
    otp: boolean; // Tasdiqlash kodi
    passwordReset: boolean; // Parol tiklash
    applicationStatus: boolean; // Ariza holati
    newJob: boolean; // Yangi ish xabari
    welcome: boolean; // Xush kelibsiz
    reminder: boolean; // Eslatmalar
  };
  
  // Limitlar
  limits: {
    dailyPerUser: number; // Kunlik limit har bir user uchun
    totalDaily: number; // Umumiy kunlik limit
    minIntervalSeconds: number; // SMS orasidagi minimal vaqt
  };
  
  // Statistika
  stats: {
    todaySent: number;
    todayFailed: number;
    totalSent: number;
    lastSentAt: string | null;
    balance: number;
  };
}

const DEFAULT_SMS_SETTINGS: SMSSettings = {
  enabled: true,
  provider: 'demo',
  eskizEmail: '',
  eskizPassword: '',
  eskizFrom: '4546',
  types: {
    otp: true,
    passwordReset: true,
    applicationStatus: true,
    newJob: false,
    welcome: false,
    reminder: false,
  },
  limits: {
    dailyPerUser: 10,
    totalDaily: 1000,
    minIntervalSeconds: 60,
  },
  stats: {
    todaySent: 0,
    todayFailed: 0,
    totalSent: 0,
    lastSentAt: null,
    balance: 0,
  },
};

const SMS_SETTINGS_KEY = 'sms:settings';
const SMS_STATS_KEY = 'sms:stats';

// ============================================
// GET SMS SETTINGS
// ============================================

router.get('/settings', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const cached = await getCache<SMSSettings>(SMS_SETTINGS_KEY);
    const settings = cached || DEFAULT_SMS_SETTINGS;
    
    // Parolni yashirish
    const safeSettings = {
      ...settings,
      eskizPassword: settings.eskizPassword ? '********' : '',
    };
    
    res.json({
      success: true,
      data: safeSettings,
    });
  } catch (error) {
    logger.error('Get SMS settings error', error);
    res.status(500).json({
      success: false,
      error: 'SMS sozlamalarini olishda xatolik',
    });
  }
});

// ============================================
// UPDATE SMS SETTINGS
// ============================================

router.put('/settings', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const updates = req.body as Partial<SMSSettings>;
    const current = await getCache<SMSSettings>(SMS_SETTINGS_KEY) || DEFAULT_SMS_SETTINGS;
    
    // Parolni saqlash (agar yangi parol kiritilmagan bo'lsa, eskisini saqlaymiz)
    if (updates.eskizPassword === '********' || !updates.eskizPassword) {
      updates.eskizPassword = current.eskizPassword;
    }
    
    const newSettings: SMSSettings = {
      ...current,
      ...updates,
      types: {
        ...current.types,
        ...(updates.types || {}),
      },
      limits: {
        ...current.limits,
        ...(updates.limits || {}),
      },
      stats: current.stats, // Stats ni o'zgartirmaymiz
    };
    
    await setCache(SMS_SETTINGS_KEY, newSettings, 0); // 0 = never expire
    
    logger.info('SMS settings updated', { adminId: req.user?.id });
    
    res.json({
      success: true,
      message: 'SMS sozlamalari yangilandi',
      data: {
        ...newSettings,
        eskizPassword: newSettings.eskizPassword ? '********' : '',
      },
    });
  } catch (error) {
    logger.error('Update SMS settings error', error);
    res.status(500).json({
      success: false,
      error: 'SMS sozlamalarini yangilashda xatolik',
    });
  }
});

// ============================================
// TOGGLE SMS SERVICE
// ============================================

router.post('/toggle', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { enabled } = req.body as { enabled: boolean };
    
    const current = await getCache<SMSSettings>(SMS_SETTINGS_KEY) || DEFAULT_SMS_SETTINGS;
    current.enabled = Boolean(enabled);
    
    await setCache(SMS_SETTINGS_KEY, current, 0);
    
    logger.info(`SMS service ${enabled ? 'enabled' : 'disabled'}`, { adminId: req.user?.id });
    
    res.json({
      success: true,
      message: enabled ? 'SMS xizmati yoqildi' : 'SMS xizmati o\'chirildi',
      data: { enabled: current.enabled },
    });
  } catch (error) {
    logger.error('Toggle SMS error', error);
    res.status(500).json({
      success: false,
      error: 'SMS xizmatini o\'zgartirishda xatolik',
    });
  }
});

// ============================================
// TOGGLE SMS TYPE
// ============================================

router.post('/toggle-type', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { type, enabled } = req.body as { type: string; enabled: boolean };
    
    const validTypes = ['otp', 'passwordReset', 'applicationStatus', 'newJob', 'welcome', 'reminder'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Noto\'g\'ri SMS turi',
      });
    }
    
    const current = await getCache<SMSSettings>(SMS_SETTINGS_KEY) || DEFAULT_SMS_SETTINGS;
    current.types[type as keyof SMSSettings['types']] = Boolean(enabled);
    
    await setCache(SMS_SETTINGS_KEY, current, 0);
    
    logger.info(`SMS type ${type} ${enabled ? 'enabled' : 'disabled'}`, { adminId: req.user?.id });
    
    res.json({
      success: true,
      message: `${type} SMS ${enabled ? 'yoqildi' : 'o\'chirildi'}`,
      data: { type, enabled: current.types[type as keyof SMSSettings['types']] },
    });
  } catch (error) {
    logger.error('Toggle SMS type error', error);
    res.status(500).json({
      success: false,
      error: 'SMS turini o\'zgartirishda xatolik',
    });
  }
});

// ============================================
// GET SMS STATS
// ============================================

router.get('/stats', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const settings = await getCache<SMSSettings>(SMS_SETTINGS_KEY) || DEFAULT_SMS_SETTINGS;
    
    res.json({
      success: true,
      data: {
        stats: settings.stats,
        limits: settings.limits,
        enabled: settings.enabled,
        provider: settings.provider,
      },
    });
  } catch (error) {
    logger.error('Get SMS stats error', error);
    res.status(500).json({
      success: false,
      error: 'SMS statistikasini olishda xatolik',
    });
  }
});

// ============================================
// TEST SMS
// ============================================

router.post('/test', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { phone, message } = req.body as { phone: string; message: string };
    
    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        error: 'Telefon raqami va xabar kiritilishi shart',
      });
    }
    
    const settings = await getCache<SMSSettings>(SMS_SETTINGS_KEY) || DEFAULT_SMS_SETTINGS;
    
    if (!settings.enabled) {
      return res.status(400).json({
        success: false,
        error: 'SMS xizmati o\'chirilgan',
      });
    }
    
    // Demo mode
    if (settings.provider === 'demo') {
      logger.info('Test SMS sent (demo mode)', { phone, message: message.substring(0, 50) });
      
      return res.json({
        success: true,
        message: 'Test SMS yuborildi (demo rejim)',
        data: {
          phone,
          messageLength: message.length,
          provider: 'demo',
        },
      });
    }
    
    // TODO: Real SMS yuborish
    // const eskiz = new EskizService(settings.eskizEmail, settings.eskizPassword);
    // await eskiz.sendSMS(phone, message);
    
    res.json({
      success: true,
      message: 'Test SMS yuborildi',
      data: {
        phone,
        messageLength: message.length,
        provider: settings.provider,
      },
    });
  } catch (error) {
    logger.error('Test SMS error', error);
    res.status(500).json({
      success: false,
      error: 'Test SMS yuborishda xatolik',
    });
  }
});

// ============================================
// RESET DAILY STATS
// ============================================

router.post('/reset-stats', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const current = await getCache<SMSSettings>(SMS_SETTINGS_KEY) || DEFAULT_SMS_SETTINGS;
    
    current.stats = {
      ...current.stats,
      todaySent: 0,
      todayFailed: 0,
    };
    
    await setCache(SMS_SETTINGS_KEY, current, 0);
    
    logger.info('SMS daily stats reset', { adminId: req.user?.id });
    
    res.json({
      success: true,
      message: 'Kunlik statistika tozalandi',
    });
  } catch (error) {
    logger.error('Reset SMS stats error', error);
    res.status(500).json({
      success: false,
      error: 'Statistikani tozalashda xatolik',
    });
  }
});

export default router;
