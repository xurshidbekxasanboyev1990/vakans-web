import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Label } from './ui/label';
import { Loader2, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { projectId } from '../../../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-5b47a45d`;

interface PhoneVerificationProps {
  phone: string;
  onVerified: () => void;
  onCancel?: () => void;
}

/**
 * Phone Verification Component
 * Sends OTP code and verifies phone number
 */
export function PhoneVerification({ phone, onVerified, onCancel }: PhoneVerificationProps) {
  const [step, setStep] = useState<'send' | 'verify'>('send');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [testMode, setTestMode] = useState(false);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  /**
   * Send OTP code
   */
  const handleSendOTP = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `${API_URL}/sms/send-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phone }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'SMS yuborishda xatolik');
      }

      setSuccess(data.message);
      setStep('verify');
      setCountdown(60); // 60 seconds cooldown

      // Check if test mode
      if (data.testMode) {
        setTestMode(true);
        setSuccess(`Test rejimda. Kod: ${data.code}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify OTP code
   */
  const handleVerifyOTP = async () => {
    if (code.length !== 6) {
      setError('Kod 6 ta raqamdan iborat bo\'lishi kerak');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/sms/verify-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phone, code }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Tasdiqlashda xatolik');
      }

      setSuccess(data.message);
      
      // Call parent callback after 1 second
      setTimeout(() => {
        onVerified();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resend OTP code
   */
  const handleResend = async () => {
    setCode('');
    setStep('send');
    await handleSendOTP();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Telefon raqamni tasdiqlash
        </CardTitle>
        <CardDescription>
          {step === 'send' 
            ? 'Tasdiqlash kodini yuborish' 
            : 'SMS orqali kelgan kodni kiriting'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Phone Display */}
        <div>
          <Label>Telefon raqam</Label>
          <Input value={phone} disabled className="mt-1" />
        </div>

        {/* Send OTP Step */}
        {step === 'send' && (
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <CheckCircle2 className="w-4 h-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleSendOTP}
                disabled={loading}
                className="flex-1"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                SMS yuborish
              </Button>
              {onCancel && (
                <Button onClick={onCancel} variant="outline">
                  Bekor qilish
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Verify OTP Step */}
        {step === 'verify' && (
          <div className="space-y-4">
            {testMode && (
              <Alert>
                <CheckCircle2 className="w-4 h-4" />
                <AlertDescription className="font-mono">
                  Test rejimda. Kod: 123456
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <CheckCircle2 className="w-4 h-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="otp-code">Tasdiqlash kodi</Label>
              <Input
                id="otp-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setCode(val);
                }}
                placeholder="123456"
                className="mt-1 text-center text-2xl tracking-widest font-mono"
                disabled={loading}
                autoFocus
              />
              <p className="text-sm text-muted-foreground mt-1">
                6 raqamli kodni kiriting
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleVerifyOTP}
                disabled={loading || code.length !== 6}
                className="flex-1"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Tasdiqlash
              </Button>
            </div>

            {/* Resend */}
            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Qayta yuborish: {countdown} soniya
                </p>
              ) : (
                <Button
                  variant="link"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-sm"
                >
                  Kodni qayta yuborish
                </Button>
              )}
            </div>

            {onCancel && (
              <Button onClick={onCancel} variant="outline" className="w-full">
                Bekor qilish
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Inline Phone Verification (for forms)
 */
interface InlinePhoneVerificationProps {
  phone: string;
  onVerified: () => void;
}

export function InlinePhoneVerification({ phone, onVerified }: InlinePhoneVerificationProps) {
  const [showVerification, setShowVerification] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerified = () => {
    setVerified(true);
    onVerified();
  };

  if (verified) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle2 className="w-4 h-4" />
        <span className="text-sm font-medium">Tasdiqlangan</span>
      </div>
    );
  }

  if (showVerification) {
    return (
      <PhoneVerification
        phone={phone}
        onVerified={handleVerified}
        onCancel={() => setShowVerification(false)}
      />
    );
  }

  return (
    <Button
      onClick={() => setShowVerification(true)}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Send className="w-4 h-4" />
      Telefon raqamni tasdiqlash
    </Button>
  );
}

/**
 * Verification Badge (show verification status)
 */
interface VerificationBadgeProps {
  verified: boolean;
  phone?: string;
  onVerify?: () => void;
}

export function VerificationBadge({ verified, phone, onVerify }: VerificationBadgeProps) {
  if (verified) {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
        <CheckCircle2 className="w-3 h-3" />
        Tasdiqlangan
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1">
      <div className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
        <AlertCircle className="w-3 h-3 inline mr-1" />
        Tasdiqlanmagan
      </div>
      {phone && onVerify && (
        <Button
          onClick={onVerify}
          variant="link"
          size="sm"
          className="text-xs h-auto p-0"
        >
          Tasdiqlash
        </Button>
      )}
    </div>
  );
}
