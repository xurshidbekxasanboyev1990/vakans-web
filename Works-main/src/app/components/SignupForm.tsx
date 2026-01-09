import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Eye, EyeOff, Phone, MessageSquare, User, Lock, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { REGIONS } from '../../lib/constants';
import { useLanguage } from '../i18n/LanguageContext';

interface SignupFormProps {
  userType: 'worker' | 'employer';
  onSwitchToLogin: () => void;
}

// Step 1: Phone validation
const phoneSchema = z.object({
  phone: z.string().regex(/^\+998[0-9]{9}$/, 'Telefon raqami +998901234567 formatida bo\'lishi kerak'),
});

// Step 3: User info validation
const userInfoSchema = z.object({
  username: z.string().min(3, 'Username kamida 3 ta belgidan iborat bo\'lishi kerak').regex(/^[a-zA-Z0-9_]+$/, 'Faqat harflar, raqamlar va _ ishlatilishi mumkin'),
  password: z.string().min(6, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'Kamida 2 ta harf kiriting'),
  lastName: z.string().min(2, 'Kamida 2 ta harf kiriting'),
  region: z.string().min(1, 'Viloyatni tanlang'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Parollar mos kelmaydi',
  path: ['confirmPassword'],
});

type Step = 'phone' | 'otp' | 'userinfo';

export function SignupForm({ userType, onSwitchToLogin }: SignupFormProps) {
  const { signUp, loading } = useAuth();
  const { t } = useLanguage();
  
  // Step management
  const [currentStep, setCurrentStep] = useState<Step>('phone');
  
  // Step 1: Phone
  const [phone, setPhone] = useState('+998');
  
  // Step 2: OTP
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(0);
  const [generatedOtp, setGeneratedOtp] = useState(''); // Demo uchun
  
  // Step 3: User info
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [region, setRegion] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Generate random 6-digit OTP
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Start OTP timer
  const startOtpTimer = () => {
    setOtpTimer(120); // 2 minutes
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Send OTP to phone
  const handleSendOtp = async () => {
    setErrors({});
    
    const result = phoneSchema.safeParse({ phone });
    if (!result.success) {
      setErrors({ phone: result.error.issues[0].message });
      return;
    }

    setIsLoading(true);
    
    try {
      // Generate OTP
      const otp = generateOTP();
      setGeneratedOtp(otp);
      
      // TODO: Eskiz SMS API orqali yuborish
      // Demo rejimda alert bilan ko'rsatamiz
      if (import.meta.env.DEV) {
        console.log(`📱 SMS yuborildi: ${phone} -> Tasdiqlash kodi: ${otp}`);
      }
      
      // Demo alert (production da olib tashlash kerak)
      alert(`📱 Demo rejim!\n\nTelefon: ${phone}\nTasdiqlash kodi: ${otp}\n\n(Production da SMS yuboriladi)`);
      
      startOtpTimer();
      setCurrentStep('otp');
    } catch {
      setErrors({ phone: 'SMS yuborishda xatolik yuz berdi' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
      setOtpCode(newOtp.slice(0, 6));
    }
  };

  // Handle OTP backspace
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = () => {
    const enteredOtp = otpCode.join('');
    
    if (enteredOtp.length !== 6) {
      setErrors({ otp: 'Iltimos, 6 raqamli kodni to\'liq kiriting' });
      return;
    }

    if (enteredOtp !== generatedOtp) {
      setErrors({ otp: 'Noto\'g\'ri kod. Qaytadan urinib ko\'ring.' });
      return;
    }

    // OTP verified successfully
    setErrors({});
    setCurrentStep('userinfo');
  };

  // Resend OTP
  const handleResendOtp = () => {
    if (otpTimer > 0) return;
    
    const otp = generateOTP();
    setGeneratedOtp(otp);
    setOtpCode(['', '', '', '', '', '']);
    startOtpTimer();
    
    if (import.meta.env.DEV) {
      console.log(`📱 Qayta SMS yuborildi: ${phone} -> Tasdiqlash kodi: ${otp}`);
    }
    alert(`📱 Qayta yuborildi!\n\nTasdiqlash kodi: ${otp}`);
  };

  // Step 3: Complete registration
  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = userInfoSchema.safeParse({
      username,
      password,
      confirmPassword,
      firstName,
      lastName,
      region,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      await signUp(username, password, {
        firstName,
        lastName,
        region,
        userType,
        phone,
      });
    } catch {
      setErrors({ general: 'Ro\'yxatdan o\'tishda xatolik yuz berdi' });
    } finally {
      setIsLoading(false);
    }
  };

  // Format timer
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Step indicator
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
        currentStep === 'phone' ? 'bg-primary text-white' : 'bg-green-500 text-white'
      }`}>
        {currentStep === 'phone' ? '1' : <CheckCircle className="w-5 h-5" />}
      </div>
      <div className={`w-12 h-1 ${currentStep !== 'phone' ? 'bg-green-500' : 'bg-gray-300'}`} />
      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
        currentStep === 'otp' ? 'bg-primary text-white' : 
        currentStep === 'userinfo' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'
      }`}>
        {currentStep === 'userinfo' ? <CheckCircle className="w-5 h-5" /> : '2'}
      </div>
      <div className={`w-12 h-1 ${currentStep === 'userinfo' ? 'bg-green-500' : 'bg-gray-300'}`} />
      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
        currentStep === 'userinfo' ? 'bg-primary text-white' : 'bg-gray-300 text-gray-500'
      }`}>
        3
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-lg shadow-xl border-2">
      <CardHeader className="space-y-2 pb-4">
        <CardTitle className="text-2xl text-center">
          {userType === 'worker' ? t('registerAndFindWork') : t('registerAndHire')}
        </CardTitle>
        <CardDescription className="text-base text-center">
          {currentStep === 'phone' && t('phoneRequired')}
          {currentStep === 'otp' && t('enterOtpCode')}
          {currentStep === 'userinfo' && t('fillYourInfo')}
        </CardDescription>
        <StepIndicator />
      </CardHeader>
      
      <CardContent>
        {/* Step 1: Phone */}
        {currentStep === 'phone' && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {t('phoneNumber')}
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998901234567"
                className="h-14 text-lg text-center font-mono tracking-wider"
                maxLength={13}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
              <p className="text-sm text-gray-500 text-center">
                Ushbu raqamga SMS kod yuboriladi
              </p>
            </div>

            <Button 
              type="button"
              onClick={handleSendOtp} 
              className="w-full h-14 text-lg" 
              disabled={isLoading}
            >
              {isLoading ? 'Yuborilmoqda...' : (
                <>
                  SMS kod yuborish
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-base text-blue-600 hover:underline"
              >
                Akkauntingiz bormi? Kirish
              </button>
            </div>
          </div>
        )}

        {/* Step 2: OTP Verification */}
        {currentStep === 'otp' && (
          <div className="space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-1">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span className="text-sm text-gray-600">
                  {phone} raqamiga kod yuborildi
                </span>
              </div>
              
              <div className="flex justify-center gap-2">
                {otpCode.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={index === 0 ? handleOtpPaste : undefined}
                    className="w-12 h-14 text-center text-2xl font-bold"
                    maxLength={1}
                  />
                ))}
              </div>
              
              {errors.otp && (
                <p className="text-sm text-red-500 text-center">{errors.otp}</p>
              )}

              <div className="text-center">
                {otpTimer > 0 ? (
                  <p className="text-sm text-gray-500">
                    Qayta yuborish: <span className="font-mono font-bold">{formatTimer(otpTimer)}</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Kodni qayta yuborish
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                type="button"
                variant="outline"
                onClick={() => setCurrentStep('phone')} 
                className="flex-1 h-12"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Orqaga
              </Button>
              <Button 
                type="button"
                onClick={handleVerifyOtp} 
                className="flex-1 h-12"
                disabled={otpCode.join('').length !== 6}
              >
                Tasdiqlash
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: User Info */}
        {currentStep === 'userinfo' && (
          <form onSubmit={handleCompleteSignup} className="space-y-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Telefon tasdiqlandi: {phone}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-base">Ism</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ismingiz"
                  className="h-12"
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500">{errors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-base">Familiya</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Familiyangiz"
                  className="h-12"
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-base flex items-center gap-2">
                <User className="w-4 h-4" />
                Username (login)
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="masalan: ali_valiyev"
                className="h-12 font-mono"
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username}</p>
              )}
              <p className="text-xs text-gray-500">Faqat harflar, raqamlar va _ belgisi</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Parol
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kamida 6 ta belgi"
                  className="h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-base">Parolni tasdiqlang</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Parolni qayta kiriting"
                  className="h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="region" className="text-base">Viloyat</Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger id="region" className="h-12">
                  <SelectValue placeholder="Viloyatni tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((regionName) => (
                    <SelectItem key={regionName} value={regionName} className="py-3">
                      {regionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.region && (
                <p className="text-sm text-red-500">{errors.region}</p>
              )}
            </div>

            {errors.general && (
              <p className="text-sm text-red-500 text-center">{errors.general}</p>
            )}

            <Button type="submit" className="w-full h-14 text-lg" disabled={isLoading || loading}>
              {isLoading || loading ? 'Yuklanmoqda...' : 'Ro\'yxatdan o\'tish'}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Parolni unutsangiz, Support xizmatiga murojaat qiling
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
