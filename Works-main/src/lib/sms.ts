/**
 * Eskiz.uz SMS Service
 * O'zbekistonda SMS yuborish uchun Eskiz.uz API integratsiyasi
 * 
 * Dokumentatsiya: https://eskiz.uz/api-documentation
 */

interface EskizConfig {
  email: string;
  password: string;
  from?: string; // Sender ID (default: 4546)
}

interface EskizTokenResponse {
  message: string;
  data: {
    token: string;
  };
  status: string;
}

interface EskizSendResponse {
  id: string;
  message: string;
  status: string;
}

class EskizSMSService {
  private baseUrl = 'https://notify.eskiz.uz/api';
  private token: string | null = null;
  private tokenExpiry: Date | null = null;
  private config: EskizConfig;

  constructor(config: EskizConfig) {
    this.config = {
      ...config,
      from: config.from || '4546'
    };
  }

  /**
   * Eskiz.uz dan token olish
   */
  private async getToken(): Promise<string> {
    // Token hali amal qilayotgan bo'lsa, qaytaramiz
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.token;
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: this.config.email,
          password: this.config.password,
        }),
      });

      if (!response.ok) {
        throw new Error(`Eskiz auth xatosi: ${response.status}`);
      }

      const data: EskizTokenResponse = await response.json();
      
      this.token = data.data.token;
      // Token 30 kun amal qiladi, lekin biz 29 kun deb hisoblaymiz
      this.tokenExpiry = new Date(Date.now() + 29 * 24 * 60 * 60 * 1000);

      // Token olindi - silent in production
      return this.token;
    } catch (error) {
      // Eskiz auth error - rethrow
      throw error;
    }
  }

  /**
   * SMS yuborish
   * @param phone - Telefon raqami (+998901234567 yoki 998901234567)
   * @param message - SMS matni (160 belgigacha 1 SMS, undan ko'p bo'lsa bir nechta SMS)
   */
  async sendSMS(phone: string, message: string): Promise<EskizSendResponse> {
    const token = await this.getToken();

    // Telefon raqamini formatlash (+ belgisini olib tashlash)
    const formattedPhone = phone.replace(/^\+/, '');

    try {
      const response = await fetch(`${this.baseUrl}/message/sms/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobile_phone: formattedPhone,
          message: message,
          from: this.config.from,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Eskiz SMS xatosi: ${response.status} - ${errorText}`);
      }

      const data: EskizSendResponse = await response.json();
      // SMS sent successfully - silent in production
      return data;
    } catch (error) {
      // SMS error - rethrow
      throw error;
    }
  }

  /**
   * OTP (tasdiqlash kodi) yuborish
   * @param phone - Telefon raqami
   * @param code - 6 raqamli kod
   */
  async sendOTP(phone: string, code: string): Promise<EskizSendResponse> {
    const message = `Vakans.uz: Sizning tasdiqlash kodingiz: ${code}. Kodni hech kimga bermang!`;
    return this.sendSMS(phone, message);
  }

  /**
   * Ariza holati haqida xabar yuborish
   */
  async sendApplicationStatus(
    phone: string, 
    jobTitle: string, 
    status: 'accepted' | 'rejected' | 'pending'
  ): Promise<EskizSendResponse> {
    const statusMessages = {
      accepted: `Tabriklaymiz! "${jobTitle}" ish o'rniga arizangiz qabul qilindi. Vakans.uz`,
      rejected: `"${jobTitle}" ish o'rniga arizangiz rad etildi. Boshqa ishlarni ko'ring: vakans.uz`,
      pending: `"${jobTitle}" ish o'rniga arizangiz ko'rib chiqilmoqda. Vakans.uz`,
    };

    return this.sendSMS(phone, statusMessages[status]);
  }

  /**
   * Yangi ish haqida xabar yuborish
   */
  async sendNewJobNotification(
    phone: string,
    jobTitle: string,
    company: string,
    salary?: string
  ): Promise<EskizSendResponse> {
    let message = `Yangi ish: "${jobTitle}" - ${company}`;
    if (salary) {
      message += `. Maosh: ${salary}`;
    }
    message += `. Batafsil: vakans.uz`;

    return this.sendSMS(phone, message);
  }

  /**
   * Balansni tekshirish
   */
  async getBalance(): Promise<number> {
    const token = await this.getToken();

    try {
      const response = await fetch(`${this.baseUrl}/user/get-limit`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Eskiz balans xatosi: ${response.status}`);
      }

      const data = await response.json();
      return data.data?.balance || 0;
    } catch (error) {
      // Balance check error - rethrow
      throw error;
    }
  }
}

// Singleton instance
let eskizInstance: EskizSMSService | null = null;

/**
 * Eskiz SMS service ni olish
 */
export function getEskizService(): EskizSMSService {
  if (!eskizInstance) {
    // Environment variables dan config olish
    const config: EskizConfig = {
      email: import.meta.env.VITE_ESKIZ_EMAIL || '',
      password: import.meta.env.VITE_ESKIZ_PASSWORD || '',
      from: import.meta.env.VITE_ESKIZ_FROM || '4546',
    };

    // Credentials check - silent warning
    eskizInstance = new EskizSMSService(config);
  }

  return eskizInstance;
}

/**
 * Demo rejimda SMS yuborish (haqiqiy SMS yuborilmaydi)
 */
export async function sendSMSDemo(phone: string, message: string): Promise<void> {
  // Demo SMS - only log in development
  if (import.meta.env.DEV) {
    console.log('📱 [DEMO] SMS yuborildi:');
    console.log(`   Telefon: ${phone}`);
    console.log(`   Xabar: ${message}`);
  }
  
  // Demo uchun 1 soniya kutish
  await new Promise(resolve => setTimeout(resolve, 1000));
}

/**
 * OTP kod generatsiya qilish
 */
export function generateOTP(length: number = 6): string {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
}

/**
 * SMS yuborish (demo yoki real)
 */
export async function sendSMS(phone: string, message: string): Promise<boolean> {
  const isDemo = !import.meta.env.VITE_ESKIZ_EMAIL || !import.meta.env.VITE_ESKIZ_PASSWORD;

  if (isDemo) {
    await sendSMSDemo(phone, message);
    return true;
  }

  try {
    const eskiz = getEskizService();
    await eskiz.sendSMS(phone, message);
    return true;
  } catch (error) {
    console.error('SMS yuborishda xato:', error);
    return false;
  }
}

/**
 * OTP yuborish
 */
export async function sendOTPCode(phone: string): Promise<{ success: boolean; code?: string }> {
  const code = generateOTP(6);
  const message = `Vakans.uz: Sizning tasdiqlash kodingiz: ${code}. Kodni hech kimga bermang!`;

  const success = await sendSMS(phone, message);
  
  if (success) {
    return { success: true, code };
  }
  
  return { success: false };
}

export default EskizSMSService;
