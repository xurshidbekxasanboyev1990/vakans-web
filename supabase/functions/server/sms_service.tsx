/**
 * SMS Verification Service - Eskiz.uz Integration
 * O'zbekiston uchun SMS xabarlari yuborish
 */

// Types
export interface EskizAuthResponse {
  data: {
    token: string;
  };
  message: string;
}

export interface EskizSendResponse {
  id: string;
  status: string;
  message: string;
}

export interface OTPRecord {
  phone: string;
  code: string;
  expiresAt: Date;
  attempts: number;
}

/**
 * Eskiz.uz SMS Service
 */
export class EskizService {
  private baseUrl = 'https://notify.eskiz.uz/api';
  private token: string | null = null;
  private tokenExpiresAt: Date | null = null;

  /**
   * Get authentication token from Eskiz.uz
   */
  async getToken(email: string, password: string): Promise<string> {
    // Return cached token if valid
    if (this.token && this.tokenExpiresAt && new Date() < this.tokenExpiresAt) {
      return this.token;
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error(`Eskiz auth failed: ${response.statusText}`);
      }

      const data: EskizAuthResponse = await response.json();
      this.token = data.data.token;
      
      // Token 30 kun amal qiladi
      this.tokenExpiresAt = new Date();
      this.tokenExpiresAt.setDate(this.tokenExpiresAt.getDate() + 29);

      return this.token;
    } catch (error) {
      console.error('Eskiz authentication error:', error);
      throw new Error('SMS xizmati bilan bog\'lanishda xatolik');
    }
  }

  /**
   * Send SMS via Eskiz.uz
   */
  async sendSMS(
    phone: string,
    message: string,
    email: string,
    password: string,
    from: string = '4546'
  ): Promise<EskizSendResponse> {
    const token = await this.getToken(email, password);

    // Format phone number (remove + if present)
    const formattedPhone = phone.startsWith('+') ? phone.substring(1) : phone;

    try {
      const response = await fetch(`${this.baseUrl}/message/sms/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobile_phone: formattedPhone,
          message,
          from,
          callback_url: '', // Optional webhook
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`SMS yuborishda xatolik: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Eskiz send SMS error:', error);
      throw new Error('SMS yuborishda xatolik');
    }
  }

  /**
   * Generate 6-digit OTP code
   */
  generateOTP(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';
    
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
    
    return otp;
  }

  /**
   * Send OTP code to phone number
   */
  async sendOTP(
    phone: string,
    email: string,
    password: string,
    from: string = '4546',
    otpLength: number = 6
  ): Promise<{ code: string; expiresAt: Date }> {
    const code = this.generateOTP(otpLength);
    
    const message = `Tasdiqlash kodi: ${code}\n\nBu kodni hech kimga bermang!\n\nVakans.uz`;

    await this.sendSMS(phone, message, email, password, from);

    // OTP expires in 5 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    return { code, expiresAt };
  }

  /**
   * Send custom message
   */
  async sendCustomMessage(
    phone: string,
    message: string,
    email: string,
    password: string,
    from: string = '4546'
  ): Promise<EskizSendResponse> {
    return this.sendSMS(phone, message, email, password, from);
  }
}

// Singleton instance
export const eskizService = new EskizService();

/**
 * OTP Storage Service (In-memory for Deno)
 * Production da Redis yoki Database ishlatish kerak
 */
export class OTPStorage {
  private otps: Map<string, OTPRecord> = new Map();

  /**
   * Store OTP code
   */
  store(phone: string, code: string, expiresAt: Date): void {
    this.otps.set(phone, {
      phone,
      code,
      expiresAt,
      attempts: 0,
    });
  }

  /**
   * Verify OTP code
   */
  verify(phone: string, code: string): { success: boolean; message: string } {
    const record = this.otps.get(phone);

    if (!record) {
      return { success: false, message: 'OTP topilmadi. Qaytadan yuboring.' };
    }

    // Check expiry
    if (new Date() > record.expiresAt) {
      this.otps.delete(phone);
      return { success: false, message: 'OTP muddati tugagan. Qaytadan yuboring.' };
    }

    // Check attempts (max 3)
    if (record.attempts >= 3) {
      this.otps.delete(phone);
      return { success: false, message: 'Juda ko\'p urinish. Qaytadan yuboring.' };
    }

    // Verify code
    if (record.code !== code) {
      record.attempts++;
      return { success: false, message: 'Noto\'g\'ri kod. Qaytadan urining.' };
    }

    // Success - delete record
    this.otps.delete(phone);
    return { success: true, message: 'Telefon raqam tasdiqlandi!' };
  }

  /**
   * Check if OTP exists and not expired
   */
  exists(phone: string): boolean {
    const record = this.otps.get(phone);
    if (!record) return false;
    
    if (new Date() > record.expiresAt) {
      this.otps.delete(phone);
      return false;
    }
    
    return true;
  }

  /**
   * Delete OTP
   */
  delete(phone: string): void {
    this.otps.delete(phone);
  }

  /**
   * Clean expired OTPs (call periodically)
   */
  cleanup(): void {
    const now = new Date();
    for (const [phone, record] of this.otps.entries()) {
      if (now > record.expiresAt) {
        this.otps.delete(phone);
      }
    }
  }
}

// Singleton instance
export const otpStorage = new OTPStorage();

// Cleanup every 5 minutes
if (typeof Deno !== 'undefined') {
  setInterval(() => {
    otpStorage.cleanup();
  }, 5 * 60 * 1000);
}
