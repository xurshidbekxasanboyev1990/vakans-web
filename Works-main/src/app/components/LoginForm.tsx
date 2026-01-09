import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Eye, EyeOff, Phone, Shield, LogIn, Users, Briefcase, Sparkles, Globe, Info, MessageCircle, Key, Send, CheckCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { LANGUAGES } from '../i18n/translations';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface LoginFormProps {
  userType: 'worker' | 'employer';
  onLogin: (phone: string, password: string) => void;
  onSwitchToRegister: () => void;
  isLoading?: boolean;
}

export function LoginForm({ userType, onLogin, onSwitchToRegister, isLoading }: LoginFormProps) {
  const { t, language, setLanguage } = useLanguage();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showAbout, setShowAbout] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  // Get stats from localStorage
  const getStats = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    const workers = users.filter((u: any) => u.userType === 'worker').length;
    const employers = users.filter((u: any) => u.userType === 'employer').length;
    const completedJobs = jobs.filter((j: any) => j.status === 'completed').length;
    return { workers, employers, totalJobs: jobs.length, completedJobs };
  };

  // Support info
  const getSupportInfo = () => {
    const stored = localStorage.getItem('supportInfo');
    if (stored) return JSON.parse(stored);
    return { telegram: '@vakans_uz', phone: '+998 90 123 45 67' };
  };

  const handleLanguageChange = (langCode: typeof language) => {
    setLanguage(langCode);
    localStorage.setItem('app-language', langCode);
    window.location.reload();
  };

  const isWorker = userType === 'worker';
  const gradientClass = isWorker 
    ? 'from-blue-500 to-cyan-500' 
    : 'from-purple-500 to-pink-500';
  const accentColor = isWorker ? 'blue' : 'purple';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {[key: string]: string} = {};

    if (!phone.trim()) {
      newErrors.phone = t('phoneRequired');
    }

    if (!password) {
      newErrors.password = t('passwordRequired');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const cleanPhone = phone.replace(/\s/g, '');
    onLogin(cleanPhone, password);
  };

  return (
    <div className="w-full max-w-[95vw] xs:max-w-md mx-auto animate-fade-in-up px-2 xs:px-0">
      {/* Decorative glow */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradientClass} rounded-3xl blur-3xl opacity-20 -z-10`} />
      
      <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl rounded-xl sm:rounded-2xl overflow-hidden">
        {/* Top gradient bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r ${gradientClass}`} />
        
        {/* Language & Info Buttons - Top Right - RESPONSIVE */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex items-center gap-1 sm:gap-2 z-10">
          {/* About Button */}
          <button
            onClick={() => setShowAbout(!showAbout)}
            className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={t('aboutUs')}
          >
            <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
          </button>
          
          {/* Support Button */}
          <button
            onClick={() => setShowSupport(!showSupport)}
            className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={t('support')}
          >
            <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-md sm:rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  {LANGUAGES.find(l => l.code === language)?.flag}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 sm:w-40">
              {LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`flex items-center gap-2 cursor-pointer text-xs sm:text-sm ${language === lang.code ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                >
                  <span className="text-base sm:text-lg">{lang.flag}</span>
                  <span>{lang.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <CardHeader className="space-y-3 sm:space-y-4 pb-4 sm:pb-6 pt-14 sm:pt-16 md:pt-8 px-4 sm:px-6">
          {/* Icon Badge - RESPONSIVE - top margin increased for mobile */}
          <div className="flex justify-center mt-2 sm:mt-0">
            <div className={`w-14 h-14 sm:w-16 md:w-20 sm:h-16 md:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-xl animate-bounce-soft`}>
              {isWorker 
                ? <Users className="w-7 h-7 sm:w-8 md:w-10 sm:h-8 md:h-10 text-white" />
                : <Briefcase className="w-7 h-7 sm:w-8 md:w-10 sm:h-8 md:h-10 text-white" />
              }
            </div>
          </div>
          
          <div className="text-center space-y-1.5 sm:space-y-2">
            <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold">
              {t('login')}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base flex items-center justify-center gap-2">
              <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-${accentColor}-100 dark:bg-${accentColor}-900/50 text-${accentColor}-600 dark:text-${accentColor}-400`}>
                {isWorker ? t('worker') : t('employer')}
              </span>
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="pb-6 sm:pb-8 px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Phone Input */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium">
                <Phone className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-${accentColor}-500 flex-shrink-0`} />
                {t('phone')}
              </Label>
              <div className="relative">
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
                  className={`h-10 sm:h-12 pl-3 sm:pl-4 pr-3 sm:pr-4 text-sm sm:text-base border-2 rounded-lg sm:rounded-xl transition-all duration-300 focus:border-${accentColor}-500 focus:ring-2 focus:ring-${accentColor}-500/20`}
                />
              </div>
              {errors.phone && (
                <p className="text-xs sm:text-sm text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full flex-shrink-0" />
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="password" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium">
                <Shield className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-${accentColor}-500 flex-shrink-0`} />
                {t('password')}
              </Label>
              <div className={`flex items-center w-full h-10 sm:h-12 border-2 rounded-lg sm:rounded-xl overflow-hidden transition-all duration-300 focus-within:border-${accentColor}-500 focus-within:ring-2 focus-within:ring-${accentColor}-500/20 bg-background`}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({...errors, password: ''});
                  }}
                  placeholder="••••••••"
                  required
                  className="flex-1 h-full px-3 sm:px-4 text-sm sm:text-base bg-transparent outline-none border-none text-foreground placeholder:text-muted-foreground min-w-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`flex items-center justify-center w-8 h-7 sm:w-10 sm:h-9 mx-1 sm:mx-1.5 rounded-md sm:rounded-lg bg-${accentColor}-500 text-white hover:bg-${accentColor}-600 transition-colors flex-shrink-0`}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs sm:text-sm text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full flex-shrink-0" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className={`w-full h-10 sm:h-12 text-sm sm:text-base font-semibold bg-gradient-to-r ${gradientClass} hover:opacity-90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg sm:rounded-xl mt-2`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-sm sm:text-base">{t('loading')}</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">{t('login')}</span>
                </span>
              )}
            </Button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowSupport(true)}
                className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:underline"
              >
                Parolni unutdingizmi? Support ga yozing
              </button>
            </div>

            {/* Register Link */}
            <div className="text-center pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700 mt-4 sm:mt-6">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {t('noAccount')}{' '}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className={`text-${accentColor}-600 dark:text-${accentColor}-400 hover:underline font-semibold`}
                >
                  {t('register')}
                </button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* About Modal - RESPONSIVE */}
      {showAbout && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowAbout(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-xs sm:max-w-sm bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-2xl z-50 p-4 sm:p-6 max-h-[85vh] overflow-y-auto">
            <div className="text-center mb-3 sm:mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-2 sm:mb-3">
                <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Vakans.uz</h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{t('aboutDescription')}</p>
            </div>
            
            {(() => {
              const stats = getStats();
              return (
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                    <p className="text-lg sm:text-xl font-bold text-blue-600">{stats.workers}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">{t('worker')}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                    <p className="text-lg sm:text-xl font-bold text-purple-600">{stats.employers}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">{t('employer')}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-center">
                    <p className="text-lg sm:text-xl font-bold text-emerald-600">{stats.totalJobs}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">{t('jobs')}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-center">
                    <p className="text-lg sm:text-xl font-bold text-amber-600">{stats.completedJobs}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">{t('success')}</p>
                  </div>
                </div>
              );
            })()}
            
            <Button onClick={() => setShowAbout(false)} className="w-full h-9 sm:h-10 text-sm">{t('close')}</Button>
          </div>
        </>
      )}

      {/* Support Modal - RESPONSIVE */}
      {showSupport && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowSupport(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-xs sm:max-w-sm bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-2xl z-50 p-4 sm:p-6 max-h-[85vh] overflow-y-auto">
            <div className="text-center mb-3 sm:mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-xl sm:rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-2 sm:mb-3">
                <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{t('support')}</h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{t('contactUs')}</p>
            </div>
            
            {(() => {
              const supportInfo = getSupportInfo();
              return (
                <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                  {/* Parol tiklash so'rovi */}
                  <PasswordResetRequest onClose={() => setShowSupport(false)} />
                  
                  <div className="relative py-1.5 sm:py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] sm:text-xs">
                      <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">yoki</span>
                    </div>
                  </div>
                  
                  <a 
                    href={`https://t.me/${supportInfo.telegram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.46-1.901-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.015-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.121.1.154.234.169.331.015.097.034.318.019.49z"/>
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">Telegram</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">{supportInfo.telegram}</p>
                    </div>
                  </a>
                  
                  <a 
                    href={`tel:${supportInfo.phone.replace(/\s/g, '')}`}
                    className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">{t('phone')}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">{supportInfo.phone}</p>
                    </div>
                  </a>
                </div>
              );
            })()}
            
            <Button onClick={() => setShowSupport(false)} className="w-full h-9 sm:h-10 text-sm">{t('close')}</Button>
          </div>
        </>
      )}
    </div>
  );
}

// Parol tiklash so'rovi komponenti - RESPONSIVE
function PasswordResetRequest({ onClose }: { onClose: () => void }) {
  const [phoneNumber, setPhoneNumber] = useState('+998');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCheckStatus, setShowCheckStatus] = useState(false);
  const [statusPhone, setStatusPhone] = useState('+998');
  const [recoveryStatus, setRecoveryStatus] = useState<{
    status: string;
    adminReply: string | null;
    newPassword: string | null;
    repliedAt: string | null;
  } | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');

  const handleSubmit = async () => {
    if (!phoneNumber || phoneNumber.length < 13) {
      alert('Iltimos, telefon raqamingizni to\'liq kiriting');
      return;
    }

    setIsLoading(true);
    
    // Support ga so'rov yuborish
    const supportMessages = JSON.parse(localStorage.getItem('supportMessages') || '[]');
    const newRequest = {
      id: Date.now().toString(),
      userId: 'guest',
      userName: 'Parol tiklash so\'rovi',
      userPhone: phoneNumber,
      userType: 'worker' as const,
      message: message || `Parolni tiklash so'rovi. Telefon: ${phoneNumber}`,
      createdAt: new Date().toISOString(),
      status: 'pending' as const,
      reply: null,
      requestType: 'password_reset'
    };
    
    supportMessages.push(newRequest);
    localStorage.setItem('supportMessages', JSON.stringify(supportMessages));
    
    setIsLoading(false);
    setIsSubmitted(true);
  };

  const checkStatus = () => {
    if (!statusPhone || statusPhone.length < 13) {
      setStatusError('Telefon raqamini to\'liq kiriting');
      return;
    }
    
    setIsCheckingStatus(true);
    setStatusError('');
    
    // localStorage dan so'rovlarni tekshiramiz
    const supportMessages = JSON.parse(localStorage.getItem('supportMessages') || '[]');
    const userRequests = supportMessages
      .filter((m: any) => m.userPhone === statusPhone && m.requestType === 'password_reset')
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    if (userRequests.length === 0) {
      setStatusError('Bu telefon raqami uchun so\'rov topilmadi');
      setRecoveryStatus(null);
    } else {
      const latestRequest = userRequests[0];
      setRecoveryStatus({
        status: latestRequest.status,
        adminReply: latestRequest.reply,
        newPassword: latestRequest.newPassword || null,
        repliedAt: latestRequest.repliedAt || null
      });
    }
    
    setIsCheckingStatus(false);
  };

  if (isSubmitted) {
    return (
      <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
        <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-500 mx-auto mb-2" />
        <h4 className="font-semibold text-green-700 dark:text-green-400 text-sm sm:text-base">So'rov yuborildi!</h4>
        <p className="text-xs sm:text-sm text-green-600 dark:text-green-500 mt-1">
          Admin sizga tez orada javob beradi
        </p>
        <Button 
          onClick={() => {
            setIsSubmitted(false);
            setShowCheckStatus(true);
            setStatusPhone(phoneNumber);
          }}
          variant="outline"
          className="mt-2 sm:mt-3 h-8 sm:h-9 text-xs sm:text-sm"
          size="sm"
        >
          Javobni tekshirish
        </Button>
      </div>
    );
  }

  if (showCheckStatus) {
    return (
      <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Key className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
            <h4 className="font-semibold text-blue-700 dark:text-blue-400 text-xs sm:text-sm">Javobni tekshirish</h4>
          </div>
          <button 
            onClick={() => setShowCheckStatus(false)}
            className="text-[10px] sm:text-xs text-gray-500 hover:text-gray-700"
          >
            Orqaga
          </button>
        </div>
        
        <div className="space-y-2 sm:space-y-3">
          <div>
            <Label className="text-[10px] sm:text-xs text-gray-600">Telefon raqamingiz</Label>
            <div className="flex gap-1.5 sm:gap-2 mt-1">
              <Input
                type="tel"
                value={statusPhone}
                onChange={(e) => setStatusPhone(e.target.value)}
                placeholder="+998901234567"
                className="h-8 sm:h-10 flex-1 text-xs sm:text-sm"
                maxLength={13}
              />
              <Button 
                onClick={checkStatus}
                className="bg-blue-600 hover:bg-blue-700 h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm flex-shrink-0"
                disabled={isCheckingStatus}
              >
                {isCheckingStatus ? '...' : 'Tekshirish'}
              </Button>
            </div>
          </div>
          
          {statusError && (
            <div className="p-2 sm:p-3 bg-red-100 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-400 text-xs sm:text-sm">
              {statusError}
            </div>
          )}
          
          {recoveryStatus && (
            <div className={`p-3 sm:p-4 rounded-lg ${
              recoveryStatus.status === 'resolved' 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-yellow-100 dark:bg-yellow-900/30'
            }`}>
              {recoveryStatus.status === 'resolved' ? (
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="font-semibold text-xs sm:text-sm">Admin javob berdi!</span>
                  </div>
                  
                  {recoveryStatus.adminReply && (
                    <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Xabar:</span> {recoveryStatus.adminReply}
                    </div>
                  )}
                  
                  {recoveryStatus.newPassword && (
                    <div className="p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-green-500">
                      <span className="text-[10px] sm:text-xs text-gray-500 block mb-1">Yangi parolingiz:</span>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-base sm:text-xl font-bold text-green-600 dark:text-green-400 break-all">
                          {recoveryStatus.newPassword}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 sm:h-8 text-xs flex-shrink-0"
                          onClick={() => {
                            navigator.clipboard.writeText(recoveryStatus.newPassword!);
                            alert('Parol nusxalandi!');
                          }}
                        >
                          Nusxalash
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {recoveryStatus.repliedAt && (
                    <div className="text-[10px] sm:text-xs text-gray-500">
                      Javob vaqti: {new Date(recoveryStatus.repliedAt).toLocaleString('uz-UZ')}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                  <p className="font-medium text-yellow-700 dark:text-yellow-400 text-xs sm:text-sm">So'rov ko'rib chiqilmoqda</p>
                  <p className="text-[10px] sm:text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                    Admin tez orada javob beradi
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Key className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
          <h4 className="font-semibold text-purple-700 dark:text-purple-400 text-xs sm:text-sm">Parolni tiklash</h4>
        </div>
        <button 
          onClick={() => setShowCheckStatus(true)}
          className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-700 underline"
        >
          Javobni tekshirish
        </button>
      </div>
      <div className="space-y-2 sm:space-y-3">
        <div>
          <Label className="text-[10px] sm:text-xs text-gray-600">Telefon raqamingiz</Label>
          <Input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+998901234567"
            className="mt-1 h-8 sm:h-10 text-xs sm:text-sm"
            maxLength={13}
          />
        </div>
        <div>
          <Label className="text-[10px] sm:text-xs text-gray-600">Qo'shimcha xabar (ixtiyoriy)</Label>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Masalan: Ismim Ali, akkauntim..."
            className="mt-1 h-8 sm:h-10 text-xs sm:text-sm"
          />
        </div>
        <Button 
          onClick={handleSubmit} 
          className="w-full bg-purple-600 hover:bg-purple-700 h-8 sm:h-10 text-xs sm:text-sm"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Yuborilmoqda...</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 sm:gap-2">
              <Send className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>So'rov yuborish</span>
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
