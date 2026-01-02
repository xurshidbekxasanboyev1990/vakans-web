import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Eye, EyeOff, Shield, Phone } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { REGIONS } from '../../lib/constants';

interface RegistrationFormProps {
  userType: 'worker' | 'employer';
  onRegister: (data: RegistrationData) => void;
  onSwitchToLogin?: () => void;
  isLoading?: boolean;
}

export interface RegistrationData {
  firstName: string;
  lastName: string;
  phone: string;
  region: string;
  password: string;
  userType: 'worker' | 'employer';
}

export function RegistrationForm({ userType, onRegister, onSwitchToLogin, isLoading }: RegistrationFormProps) {
  const { t } = useLanguage();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validatePhone = (phone: string) => {
    // +998 XX XXX XX XX formatini tekshirish
    const phoneRegex = /^\+998\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    
    if (score < 2) return { key: 'veryWeak', color: 'text-red-500', percent: 20 };
    if (score < 3) return { key: 'weak', color: 'text-orange-500', percent: 40 };
    if (score < 4) return { key: 'medium', color: 'text-yellow-500', percent: 60 };
    if (score < 5) return { key: 'good', color: 'text-blue-500', percent: 80 };
    return { key: 'strong', color: 'text-green-500', percent: 100 };
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {[key: string]: string} = {};

    // Validatsiyalar
    if (!firstName.trim()) newErrors.firstName = t('validationErrors.nameRequired');
    if (!lastName.trim()) newErrors.lastName = t('validationErrors.lastNameRequired');
    
    if (!phone.trim()) {
      newErrors.phone = t('phoneRequired');
    } else if (!validatePhone(phone)) {
      newErrors.phone = t('validationErrors.phoneFormat');
    }

    if (!region) newErrors.region = t('validationErrors.regionRequired');
    
    if (!password) {
      newErrors.password = t('passwordRequired');
    } else if (password.length < 8) {
      newErrors.password = t('validationErrors.passwordMin');
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = t('validationErrors.passwordUppercase');
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = t('validationErrors.passwordLowercase');
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = t('validationErrors.passwordNumber');
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = t('validationErrors.passwordMismatch');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Telefon raqamni tozalash (faqat raqamlar)
    const cleanPhone = phone.replace(/\s/g, '');
    
    onRegister({ 
      firstName: firstName.trim(), 
      lastName: lastName.trim(), 
      phone: cleanPhone,
      region, 
      password,
      userType 
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-card border-2 border-border shadow-xl">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl md:text-3xl font-bold">
          {userType === 'worker' ? t('findWork') : t('findWorker')}
        </CardTitle>
        <CardDescription className="text-sm">
          {userType === 'worker'
            ? t('registerAndFindWork')
            : t('registerAndHire')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">{t('firstName')}</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (errors.firstName) setErrors({...errors, firstName: ''});
              }}
              placeholder={t('yourName')}
              required
              className="h-11"
            />
            {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">{t('lastName')}</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                if (errors.lastName) setErrors({...errors, lastName: ''});
              }}
              placeholder={t('yourLastName')}
              required
              className="h-11"
            />
            {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-1.5">
              <Phone className="w-4 h-4" />
              {t('phone')}
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors({...errors, phone: ''});
              }}
              placeholder="+998 90 123 45 67"
              required
              className="h-11"
            />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            <p className="text-xs text-muted-foreground">{t('phoneAsLogin')}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="region">{t('region')}</Label>
            <Select value={region} onValueChange={(val) => {
              setRegion(val);
              if (errors.region) setErrors({...errors, region: ''});
            }} required>
              <SelectTrigger id="region" className="h-11">
                <SelectValue placeholder={t('selectRegion')} />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((regionName) => (
                  <SelectItem key={regionName} value={regionName}>
                    {regionName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.region && <p className="text-sm text-red-500">{errors.region}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              {t('password')}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({...errors, password: ''});
                }}
                placeholder={t('minChars')}
                required
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {password && (
              <p className={`text-xs ${getPasswordStrength(password).color}`}>
                {t(`passwordStrength.${getPasswordStrength(password).key}`)}
              </p>
            )}
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({...errors, confirmPassword: ''});
                }}
                placeholder={t('reenterPassword')}
                required
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
          </div>

          {/* reCAPTCHA yashirilgan - keyinroq production uchun qo'shiladi */}

          <Button type="submit" className="w-full h-11 mt-6" disabled={isLoading}>
            {isLoading ? t('loading') : t('register')}
          </Button>

          {onSwitchToLogin && (
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                {t('haveAccount')}{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-primary hover:underline font-medium"
                >
                  {t('login')}
                </button>
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}