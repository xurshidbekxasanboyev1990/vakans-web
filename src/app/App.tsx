import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { ThemeToggle } from './components/ThemeToggle';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { QueryProvider } from '../lib/QueryProvider';
import { ErrorBoundary } from '../lib/ErrorBoundary';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Briefcase, Users, ArrowRight, Loader2, Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import type { JobData } from './components/JobPostForm';
import type { Application } from './components/ApplicationTypes';
import type { User as UserType } from '../lib/types';

const LoginForm = lazy(() => import('./components/LoginForm').then(m => ({ default: m.LoginForm })));
const RegistrationForm = lazy(() => import('./components/RegistrationForm').then(m => ({ default: m.RegistrationForm })));
const WorkerDashboard = lazy(() => import('./components/WorkerDashboard').then(m => ({ default: m.WorkerDashboard })));
const EmployerDashboard = lazy(() => import('./components/EmployerDashboard').then(m => ({ default: m.EmployerDashboard })));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const ProfilePage = lazy(() => import('./components/ProfilePage').then(m => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('./components/SettingsPage').then(m => ({ default: m.SettingsPage })));

function LoadingSpinner({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">{message || 'Yuklanmoqda...'}</p>
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3 mx-auto" />
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, requiredUserType }: { children: React.ReactNode; requiredUserType?: 'worker' | 'employer' | 'admin' }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('[ProtectedRoute] User:', user, 'Loading:', loading, 'RequiredType:', requiredUserType);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    console.log('[ProtectedRoute] No user, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin check
  if (requiredUserType === 'admin' && user.userType !== 'admin') {
    toast.error('Admin huquqi kerak!');
    return <Navigate to="/" replace />;
  }

  if (requiredUserType && requiredUserType !== 'admin' && user.userType !== requiredUserType) {
    if (user.userType === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to={user.userType === 'worker' ? '/worker' : '/employer'} replace />;
  }

  console.log('[ProtectedRoute] Access granted, rendering children');
  return <>{children}</>;
}

function LandingPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [logoClicks, setLogoClicks] = useState(0);

  // Debug translations
  useEffect(() => {
    console.log('[LandingPage] Current language:', language);
    console.log('[LandingPage] t("appName"):', t('appName'));
    console.log('[LandingPage] t("platformDescription"):', t('platformDescription'));
  }, [t, language]);

  useEffect(() => {
    if (user) {
      if (user.userType === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(user.userType === 'worker' ? '/worker' : '/employer', { replace: true });
      }
    }
  }, [user, navigate]);

  // Secret admin access - 5 clicks on logo
  useEffect(() => {
    if (logoClicks >= 5) {
      toast.info('🔐 Admin kirish topildi!');
      navigate('/login/admin');
      setLogoClicks(0);
    }
    
    // Reset after 3 seconds
    const timer = setTimeout(() => setLogoClicks(0), 3000);
    return () => clearTimeout(timer);
  }, [logoClicks, navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-5xl space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6 animate-fade-in-down">
            {/* Logo Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg animate-bounce-soft">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                50,000+ dan ortiq vakansiyalar
              </span>
            </div>

            {/* Main Title */}
            <h1 
              className="text-5xl md:text-7xl font-extrabold cursor-pointer select-none"
              onClick={() => setLogoClicks(prev => prev + 1)}
              title={logoClicks > 0 ? `${5 - logoClicks} ta bosish qoldi` : undefined}
            >
              <span className="text-gradient animate-gradient bg-[length:200%_auto]">
                {t('appName')}
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              {t('platformDescription')}
            </p>
            
            {/* Regions */}
            <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
              {['Toshkent', 'Samarqand', 'Buxoro', 'Andijon', "Farg'ona"].map((region, i) => (
                <span 
                  key={region}
                  className="px-3 py-1 text-xs font-medium bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {region}
                </span>
              ))}
              <span className="px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-600 dark:text-blue-400">
                +9 viloyat
              </span>
            </div>
          </div>

          {/* Cards Section */}
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {/* Worker Card */}
            <div 
              className="group relative animate-fade-in-up stagger-1"
              onClick={() => navigate('/login/worker')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
              <Card className="relative border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden rounded-2xl">
                {/* Decorative gradient line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                
                <CardHeader className="pb-4 pt-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold">{t('findWorkTitle')}</CardTitle>
                      <CardDescription className="text-base mt-1">
                        {t('findWorkDesc')}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3 pb-8">
                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {['Bepul', 'Tez', 'Oson'].map((feature) => (
                      <span key={feature} className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-md">
                        ✓ {feature}
                      </span>
                    ))}
                  </div>
                  
                  <Button 
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]"
                    onClick={(e) => { e.stopPropagation(); navigate('/login/worker'); }}
                  >
                    {t('login')} <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full h-10 text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    onClick={(e) => { e.stopPropagation(); navigate('/register/worker'); }}
                  >
                    {t('register')}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Employer Card */}
            <div 
              className="group relative animate-fade-in-up stagger-2"
              onClick={() => navigate('/login/employer')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
              <Card className="relative border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden rounded-2xl">
                {/* Decorative gradient line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                
                <CardHeader className="pb-4 pt-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
                      <Briefcase className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold">{t('postJobTitle')}</CardTitle>
                      <CardDescription className="text-base mt-1">
                        {t('postJobDesc')}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3 pb-8">
                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {['Tezkor', 'Samarali', 'Arzon'].map((feature) => (
                      <span key={feature} className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-md">
                        ✓ {feature}
                      </span>
                    ))}
                  </div>
                  
                  <Button 
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]"
                    onClick={(e) => { e.stopPropagation(); navigate('/login/employer'); }}
                  >
                    {t('login')} <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full h-10 text-gray-600 dark:text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                    onClick={(e) => { e.stopPropagation(); navigate('/register/employer'); }}
                  >
                    {t('register')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto animate-fade-in-up stagger-3">
            {[
              { value: '50K+', label: 'Vakansiyalar' },
              { value: '10K+', label: 'Ishchilar' },
              { value: '5K+', label: 'Ish beruvchilar' },
            ].map((stat, i) => (
              <div 
                key={stat.label}
                className="text-center p-4 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="text-2xl md:text-3xl font-bold text-gradient">{stat.value}</div>
                <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RoleSelectionPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">{t('selectRole')}</h1>
            <p className="text-muted-foreground">{t('platformDescription')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 hover:shadow-xl transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-600" />
                  {t('worker')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={() => navigate('/login/worker')}>
                  {t('login')}
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/register/worker')}>
                  {t('register')}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-purple-600" />
                  {t('employer')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={() => navigate('/login/employer')}>
                  {t('login')}
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/register/employer')}>
                  {t('register')}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button variant="ghost" onClick={() => navigate('/')}>
              {t('back')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginPage({ userType }: { userType: 'worker' | 'employer' }) {
  const { t } = useLanguage();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (phone: string, password: string) => {
    const { error } = await signIn(phone, password);
    if (!error) {
      // Check localStorage for user to get userType
      const cachedUser = localStorage.getItem('currentUser');
      if (cachedUser) {
        try {
          const user = JSON.parse(cachedUser);
          const targetPath = user.userType === 'admin' ? '/admin' : `/${user.userType}`;
          navigate(targetPath, { replace: true });
          return;
        } catch (e) {
          console.error('Failed to parse cached user:', e);
        }
      }
      // Fallback to userType prop
      const targetPath = `/${userType}`;
      navigate(targetPath, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md space-y-4">
        <Suspense fallback={<PageSkeleton />}>
          <LoginForm 
            userType={userType}
            onLogin={handleLogin}
            onSwitchToRegister={() => navigate(`/register/${userType}`)}
          />
        </Suspense>
        
        <div className="text-center">
          <Button variant="ghost" onClick={() => navigate('/select-role')}>
            {t('back')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function RegisterPage({ userType }: { userType: 'worker' | 'employer' }) {
  const { t } = useLanguage();
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (data: { 
    firstName: string; 
    lastName: string; 
    phone: string; 
    region: string; 
    password: string;
    userType: 'worker' | 'employer';
  }) => {
    // Phone raqamni email sifatida ishlatamiz (yoki fake email)
    const email = `${data.phone.replace(/\+/g, '')}@vakans.uz`;
    
    const result = await signUp(email, data.password, {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      region: data.region,
      userType: data.userType,
    });

    if (!result.error) {
      toast.success(t('success'));
      navigate(userType === 'worker' ? '/worker' : '/employer', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md space-y-4">
        <Suspense fallback={<PageSkeleton />}>
          <RegistrationForm 
            userType={userType}
            onRegister={handleRegister}
            onSwitchToLogin={() => navigate(`/login/${userType}`)}
          />
        </Suspense>
        
        <div className="text-center">
          <Button variant="ghost" onClick={() => navigate('/select-role')}>
            {t('back')}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Worker Profile Page
function WorkerProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleUpdateUser = (updates: Partial<UserType>) => {
    if (!user) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === user.id);
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      localStorage.setItem('users', JSON.stringify(users));
    }
    
    const currentUser = JSON.parse(localStorage.getItem('demo_current_user') || '{}');
    localStorage.setItem('demo_current_user', JSON.stringify({ ...currentUser, ...updates }));
    localStorage.setItem('currentUser', JSON.stringify({ ...currentUser, ...updates }));
    
    toast.success('Profil yangilandi!');
    setTimeout(() => window.location.reload(), 500);
  };

  if (!user) {
    navigate('/login/worker');
    return null;
  }

  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProfilePage user={user} onUpdateUser={handleUpdateUser} userType="worker" />
    </Suspense>
  );
}

// Employer Profile Page
function EmployerProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleUpdateUser = (updates: Partial<UserType>) => {
    if (!user) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === user.id);
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      localStorage.setItem('users', JSON.stringify(users));
    }
    
    const currentUser = JSON.parse(localStorage.getItem('demo_current_user') || '{}');
    localStorage.setItem('demo_current_user', JSON.stringify({ ...currentUser, ...updates }));
    localStorage.setItem('currentUser', JSON.stringify({ ...currentUser, ...updates }));
    
    toast.success('Profil yangilandi!');
    setTimeout(() => window.location.reload(), 500);
  };

  if (!user) {
    navigate('/login/employer');
    return null;
  }

  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProfilePage user={user} onUpdateUser={handleUpdateUser} userType="employer" />
    </Suspense>
  );
}

function WorkerDashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Barcha ish e'lonlarini yuklash (employer'lar joylashtirganlari)
  const [allJobs, setAllJobs] = useState<JobData[]>(() => {
    const savedJobs = localStorage.getItem('employer_jobs');
    return savedJobs ? JSON.parse(savedJobs) : [];
  });

  // Refresh - yangi ishlarni yuklash
  useEffect(() => {
    const handleStorageChange = () => {
      const savedJobs = localStorage.getItem('employer_jobs');
      setAllJobs(savedJobs ? JSON.parse(savedJobs) : []);
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Har 5 sekundda tekshirish
    const interval = setInterval(handleStorageChange, 5000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const handleApply = (jobId: string, message: string) => {
    if (!user) return;
    
    // Arizani saqlash
    const existingApps = JSON.parse(localStorage.getItem('employer_applications') || '[]');
    const newApplication: Application = {
      id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      jobId,
      workerId: user.id,
      workerName: `${user.firstName} ${user.lastName}`,
      workerRegion: user.region,
      workerPhone: user.phone,
      message,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    existingApps.push(newApplication);
    localStorage.setItem('employer_applications', JSON.stringify(existingApps));
    toast.success('Ariza yuborildi!');
  };

  const handleUpdateUser = (updates: Partial<UserType>) => {
    if (!user) return;
    
    // LocalStorage'dan foydalanuvchilarni olish
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === user.id);
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      localStorage.setItem('users', JSON.stringify(users));
    } else {
      // Agar user topilmasa, yangi qo'shamiz
      users.push({ ...user, ...updates });
      localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Demo mode uchun current user'ni yangilash (API bilan mos key)
    const currentUser = JSON.parse(localStorage.getItem('demo_current_user') || '{}');
    const updatedCurrentUser = { ...currentUser, ...updates };
    localStorage.setItem('demo_current_user', JSON.stringify(updatedCurrentUser));
    
    // Eski key uchun ham yangilash (backward compatibility)
    localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
    
    toast.success('Profil yangilandi!');
    // Sahifani yangilash uchun
    window.location.reload();
  };

  if (!user) return null;

  // Faqat aktiv ishlarni ko'rsatish
  const activeJobs = allJobs.filter(job => job.status === 'active');

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <WorkerDashboard
        workerName={`${user.firstName} ${user.lastName}`}
        workerRegion={user.region}
        jobs={activeJobs}
        onLogout={handleLogout}
        onApply={handleApply}
        currentUser={user}
        onUpdateUser={handleUpdateUser}
      />
    </Suspense>
  );
}

function EmployerDashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobData[]>(() => {
    // LocalStorage'dan ishlarni yuklash
    const savedJobs = localStorage.getItem('employer_jobs');
    return savedJobs ? JSON.parse(savedJobs) : [];
  });
  const [applications, setApplications] = useState<Application[]>(() => {
    const savedApps = localStorage.getItem('employer_applications');
    return savedApps ? JSON.parse(savedApps) : [];
  });

  // Notification qo'shish funksiyasi - worker uchun
  const addWorkerNotification = (workerId: string, notification: {
    type: 'application' | 'job_status' | 'message';
    title: string;
    message: string;
    jobId?: string;
  }) => {
    const notificationsKey = `worker_notifications_${workerId}`;
    const existingNotifications = JSON.parse(localStorage.getItem(notificationsKey) || '[]');
    const newNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...notification,
      timestamp: new Date().toISOString(),
      read: false,
    };
    localStorage.setItem(notificationsKey, JSON.stringify([newNotification, ...existingNotifications]));
  };

  // Ishlarni localStorage'ga saqlash
  const saveJobs = (newJobs: JobData[]) => {
    localStorage.setItem('employer_jobs', JSON.stringify(newJobs));
    setJobs(newJobs);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const handlePostJob = (jobData: Omit<JobData, 'id' | 'employerName' | 'employerRegion' | 'createdAt' | 'employerPhone' | 'status' | 'approvalStatus'>) => {
    if (!user) {
      console.error('User not found! Cannot post job.');
      toast.error('Foydalanuvchi topilmadi. Qayta kiring.');
      return;
    }
    
    const newJob: JobData = {
      ...jobData,
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      employerName: `${user.firstName} ${user.lastName}`,
      employerRegion: user.region,
      employerPhone: user.phone,
      status: 'active',
      approvalStatus: 'pending', // Admin tasdiqlashini kutadi
      createdAt: new Date().toISOString(),
    };
    
    const updatedJobs = [newJob, ...jobs];
    saveJobs(updatedJobs);
    toast.success("Ish e'lon qilindi! Admin tasdiqlashini kutmoqda.");
  };

  const handleJobStatusChange = (jobId: string, newStatus: string) => {
    const job = jobs.find(j => j.id === jobId);
    const updatedJobs = jobs.map(j => 
      j.id === jobId ? { ...j, status: newStatus as JobData['status'] } : j
    );
    saveJobs(updatedJobs);
    
    // Ish holatini o'zgartirganda arizachi ishchilarga xabar berish
    if (job) {
      const jobApps = applications.filter(app => app.jobId === jobId && app.status === 'accepted');
      jobApps.forEach(app => {
        addWorkerNotification(app.workerId, {
          type: 'job_status',
          title: newStatus === 'completed' ? '✅ Ish yakunlandi!' : newStatus === 'cancelled' ? '❌ Ish bekor qilindi' : '📋 Ish holati o\'zgardi',
          message: `"${job.title}" ishi ${newStatus === 'completed' ? 'muvaffaqiyatli yakunlandi' : newStatus === 'cancelled' ? 'bekor qilindi' : 'holati o\'zgardi'}`,
          jobId,
        });
      });
    }
    
    toast.success(`Ish holati o'zgartirildi: ${newStatus}`);
  };

  const handleAcceptApplication = (appId: string) => {
    const app = applications.find(a => a.id === appId);
    const updatedApps = applications.map(a =>
      a.id === appId ? { ...a, status: 'accepted' as const } : a
    );
    localStorage.setItem('employer_applications', JSON.stringify(updatedApps));
    setApplications(updatedApps);
    
    // Worker'ga notification yuborish
    if (app) {
      const job = jobs.find(j => j.id === app.jobId);
      addWorkerNotification(app.workerId, {
        type: 'application',
        title: '🎉 Arizangiz qabul qilindi!',
        message: `"${job?.title || 'Ish'}" uchun arizangiz qabul qilindi. Ish beruvchi bilan bog'lanishingiz mumkin.`,
        jobId: app.jobId,
      });
    }
    
    toast.success('Ariza qabul qilindi');
  };

  const handleRejectApplication = (appId: string) => {
    const app = applications.find(a => a.id === appId);
    const updatedApps = applications.map(a =>
      a.id === appId ? { ...a, status: 'rejected' as const } : a
    );
    localStorage.setItem('employer_applications', JSON.stringify(updatedApps));
    setApplications(updatedApps);
    
    // Worker'ga notification yuborish
    if (app) {
      const job = jobs.find(j => j.id === app.jobId);
      addWorkerNotification(app.workerId, {
        type: 'application',
        title: '😔 Arizangiz rad etildi',
        message: `"${job?.title || 'Ish'}" uchun arizangiz rad etildi. Boshqa imkoniyatlarni ko'ring.`,
        jobId: app.jobId,
      });
    }
    
    toast.success('Ariza rad etildi');
  };

  const handleDeleteJob = (jobId: string) => {
    const updatedJobs = jobs.filter(j => j.id !== jobId);
    saveJobs(updatedJobs);
    toast.success("Ish o'chirildi!");
  };

  const handleUpdateUser = (updates: Partial<UserType>) => {
    if (!user) return;
    
    // LocalStorage'dan foydalanuvchilarni olish
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === user.id);
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      localStorage.setItem('users', JSON.stringify(users));
    } else {
      // Agar user topilmasa, yangi qo'shamiz
      users.push({ ...user, ...updates });
      localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Demo mode uchun current user'ni yangilash (API bilan mos key)
    const currentUser = JSON.parse(localStorage.getItem('demo_current_user') || '{}');
    const updatedCurrentUser = { ...currentUser, ...updates };
    localStorage.setItem('demo_current_user', JSON.stringify(updatedCurrentUser));
    
    // Eski key uchun ham yangilash (backward compatibility)
    localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
    
    toast.success('Profil yangilandi!');
    // Sahifani yangilash uchun
    window.location.reload();
  };

  if (!user) return null;

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <EmployerDashboard
        employerName={`${user.firstName} ${user.lastName}`}
        employerRegion={user.region}
        jobs={jobs}
        applications={applications}
        onPostJob={handlePostJob}
        onLogout={handleLogout}
        onJobStatusChange={handleJobStatusChange}
        onDeleteJob={handleDeleteJob}
        onAcceptApplication={handleAcceptApplication}
        onRejectApplication={handleRejectApplication}
        currentUser={user}
        onUpdateUser={handleUpdateUser}
      />
    </Suspense>
  );
}

// Demo jobs va users
const DEMO_JOBS = [
  {
    id: '1',
    title: 'Uy tozalash',
    description: 'Haftalik uy tozalash ishlariga ishchi kerak',
    salary: 150000,
    price: '150,000 so\'m',
    location: 'Toshkent shahri',
    category: 'Xizmat ko\'rsatish',
    status: 'active' as const,
    employerId: 'employer-001',
    employerName: 'Nodira Saidova',
    employerPhone: '+998912345678',
    employerRegion: 'Samarqand viloyati',
    deadline: '2025-01-15',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Bog\' parvarishi',
    description: 'Hovlidagi bog\'ni parvarish qilish',
    salary: 200000,
    price: '200,000 so\'m',
    location: 'Toshkent viloyati',
    category: 'Qishloq xo\'jaligi',
    status: 'active' as const,
    employerId: 'employer-001',
    employerName: 'Nodira Saidova',
    employerPhone: '+998912345678',
    employerRegion: 'Samarqand viloyati',
    deadline: '2025-01-20',
    createdAt: new Date().toISOString(),
  },
];

function AdminLoginPage() {
  const { t } = useLanguage();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'pin' | 'login'>('pin');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Admin PIN kodi - production da .env dan olinadi
  const ADMIN_PIN = '2024';

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (attempts >= 3) {
      toast.error('Juda ko\'p urinish! 5 daqiqa kuting.');
      return;
    }
    
    if (pin === ADMIN_PIN) {
      setStep('login');
      toast.success('PIN tasdiqlandi');
    } else {
      setAttempts(prev => prev + 1);
      toast.error(`Noto'g'ri PIN! ${3 - attempts - 1} ta urinish qoldi`);
      setPin('');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await signIn(phone, password);
      if (!result.error) {
        toast.success('Admin paneliga xush kelibsiz!');
        navigate('/admin', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
      </div>
      
      <div className="w-full max-w-md space-y-4 relative z-10">
        <Card className="border-2 border-purple-500/30 bg-black/40 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl text-white font-bold">Admin sahifasi</CardTitle>
              <CardDescription className="text-gray-400 mt-2">
                {step === 'pin' ? 'Xavfsizlik PIN kodini kiriting' : 'Admin ma\'lumotlarini kiriting'}
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {step === 'pin' ? (
              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pin" className="text-gray-300">Xavfsizlik PIN</Label>
                  <div className="flex items-center w-full h-12 bg-white/10 border border-purple-500/30 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-purple-500/50">
                    <div className="flex items-center justify-center w-10 h-full">
                      <Lock className="w-5 h-5 text-gray-500" />
                    </div>
                    <input
                      id="pin"
                      type={showPin ? 'text' : 'password'}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="****"
                      className="flex-1 h-full bg-transparent text-center text-2xl tracking-[0.5em] text-white placeholder:text-gray-500 outline-none border-none"
                      maxLength={4}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="flex items-center justify-center w-10 h-10 mx-1 rounded-md bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-5"
                  disabled={pin.length !== 4 || attempts >= 3}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Tasdiqlash
                </Button>
                
                {attempts > 0 && (
                  <p className="text-center text-red-400 text-sm">
                    {attempts >= 3 ? 'Bloklangan - 5 daqiqa kuting' : `${3 - attempts} ta urinish qoldi`}
                  </p>
                )}
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-300">Telefon raqam</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-500"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">Parol</Label>
                  <div className="flex items-center w-full h-10 bg-white/10 border border-purple-500/30 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-purple-500/50">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="flex-1 h-full px-3 bg-transparent text-white placeholder:text-gray-500 outline-none border-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="flex items-center justify-center w-10 h-8 mx-1 rounded-md bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-5"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Kirish...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Admin sifatida kirish
                    </>
                  )}
                </Button>
              </form>
            )}
            
            {/* Step indicator */}
            <div className="flex justify-center gap-2">
              <div className={`w-2 h-2 rounded-full ${step === 'pin' ? 'bg-purple-500' : 'bg-gray-600'}`} />
              <div className={`w-2 h-2 rounded-full ${step === 'login' ? 'bg-purple-500' : 'bg-gray-600'}`} />
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center">
          <Button 
            variant="ghost" 
            className="text-gray-400 hover:text-white" 
            onClick={() => navigate('/')}
          >
            ← Bosh sahifaga qaytish
          </Button>
        </div>
      </div>
    </div>
  );
}

function AdminDashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Demo users from localStorage
  const getDemoUsersFromStorage = () => {
    const stored = localStorage.getItem('demo_users');
    return stored ? JSON.parse(stored) : [];
  };

  // Real jobs from localStorage
  const getJobsFromStorage = () => {
    const stored = localStorage.getItem('employer_jobs');
    return stored ? JSON.parse(stored) : DEMO_JOBS;
  };

  // Real applications from localStorage
  const getApplicationsFromStorage = () => {
    const stored = localStorage.getItem('employer_applications');
    return stored ? JSON.parse(stored) : [];
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const handleDeleteJob = (jobId: string) => {
    const jobs = getJobsFromStorage();
    const updatedJobs = jobs.filter((j: any) => j.id !== jobId);
    localStorage.setItem('employer_jobs', JSON.stringify(updatedJobs));
    toast.success(`Ish o'chirildi!`);
    window.location.reload();
  };

  const handleBlockUser = (userId: string) => {
    // Demo users dan o'zgartirish
    const users = getDemoUsersFromStorage();
    const updatedUsers = users.map((u: any) => 
      u.id === userId ? { ...u, blocked: !u.blocked } : u
    );
    localStorage.setItem('demo_users', JSON.stringify(updatedUsers));
    
    const blockedUser = users.find((u: any) => u.id === userId);
    if (blockedUser?.blocked) {
      toast.success(`Foydalanuvchi blokdan chiqarildi`);
    } else {
      toast.success(`Foydalanuvchi bloklandi`);
    }
    // Sahifani yangilash
    window.location.reload();
  };

  const handleUpdateUser = (userId: string, updates: any) => {
    const users = getDemoUsersFromStorage();
    const updatedUsers = users.map((u: any) => 
      u.id === userId ? { ...u, ...updates } : u
    );
    localStorage.setItem('demo_users', JSON.stringify(updatedUsers));
    toast.success('Foydalanuvchi ma\'lumotlari yangilandi');
    window.location.reload();
  };

  const handleResetPassword = (userId: string) => {
    const users = getDemoUsersFromStorage();
    const targetUser = users.find((u: any) => u.id === userId);
    if (targetUser) {
      // Demo uchun oddiy parol
      const newPassword = 'newpass123';
      const updatedUsers = users.map((u: any) => 
        u.id === userId ? { ...u, password: newPassword } : u
      );
      localStorage.setItem('demo_users', JSON.stringify(updatedUsers));
      toast.success(`Yangi parol: ${newPassword} (SMS yuborildi)`);
    }
  };

  const handleSendMessage = (userId: string, message: string) => {
    const users = getDemoUsersFromStorage();
    const targetUser = users.find((u: any) => u.id === userId);
    if (targetUser) {
      toast.success(`Xabar yuborildi: ${targetUser.firstName} ga`);
      console.log('Message sent to:', targetUser.phone, 'Content:', message);
    }
  };

  const handleChangeRole = (userId: string, newRole: 'worker' | 'employer') => {
    const users = getDemoUsersFromStorage();
    const updatedUsers = users.map((u: any) => 
      u.id === userId ? { ...u, userType: newRole } : u
    );
    localStorage.setItem('demo_users', JSON.stringify(updatedUsers));
    toast.success(`Rol o'zgartirildi: ${newRole === 'worker' ? 'Ishchi' : 'Ish beruvchi'}`);
    window.location.reload();
  };

  const handleDeleteUser = (userId: string) => {
    const users = getDemoUsersFromStorage();
    const updatedUsers = users.filter((u: any) => u.id !== userId);
    localStorage.setItem('demo_users', JSON.stringify(updatedUsers));
    toast.success(`Foydalanuvchi o'chirildi`);
    window.location.reload();
  };

  const handleToggleFeatured = (jobId: string) => {
    const jobs = getJobsFromStorage();
    const updatedJobs = jobs.map((j: any) => 
      j.id === jobId ? { ...j, featured: !j.featured } : j
    );
    localStorage.setItem('employer_jobs', JSON.stringify(updatedJobs));
    toast.success(`VIP status o'zgartirildi!`);
    window.location.reload();
  };

  // Ishni tasdiqlash
  const handleApproveJob = (jobId: string) => {
    const jobs = getJobsFromStorage();
    const job = jobs.find((j: any) => j.id === jobId);
    const updatedJobs = jobs.map((j: any) => 
      j.id === jobId ? { ...j, approvalStatus: 'approved', status: 'active' } : j
    );
    localStorage.setItem('employer_jobs', JSON.stringify(updatedJobs));
    
    // Ish beruvchiga xabar berish
    if (job) {
      const users = getDemoUsersFromStorage();
      const employer = users.find((u: any) => `${u.firstName} ${u.lastName}` === job.employerName);
      if (employer) {
        const notifications = JSON.parse(localStorage.getItem('employer_notifications') || '[]');
        notifications.push({
          id: `notif-${Date.now()}`,
          userId: employer.id,
          type: 'job_approved',
          title: '✅ Ish e\'loni tasdiqlandi!',
          message: `"${job.title}" e\'loningiz admin tomonidan tasdiqlandi va endi boshqalarga ko'rinadi.`,
          read: false,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('employer_notifications', JSON.stringify(notifications));
      }
    }
    
    toast.success(`Ish tasdiqlandi va aktiv holatga o'tkazildi!`);
    window.location.reload();
  };

  // Ishni rad etish
  const handleRejectJob = (jobId: string, reason: string) => {
    const jobs = getJobsFromStorage();
    const job = jobs.find((j: any) => j.id === jobId);
    const updatedJobs = jobs.map((j: any) => 
      j.id === jobId ? { ...j, approvalStatus: 'rejected', rejectionReason: reason } : j
    );
    localStorage.setItem('employer_jobs', JSON.stringify(updatedJobs));
    
    // Ish beruvchiga xabar berish
    if (job) {
      const users = getDemoUsersFromStorage();
      const employer = users.find((u: any) => `${u.firstName} ${u.lastName}` === job.employerName);
      if (employer) {
        const notifications = JSON.parse(localStorage.getItem('employer_notifications') || '[]');
        notifications.push({
          id: `notif-${Date.now()}`,
          userId: employer.id,
          type: 'job_rejected',
          title: '❌ Ish e\'loni rad etildi',
          message: `"${job.title}" e\'loningiz quyidagi sabab bilan rad etildi: ${reason}`,
          read: false,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('employer_notifications', JSON.stringify(notifications));
      }
    }
    
    toast.success(`Ish rad etildi!`);
    window.location.reload();
  };

  const handleApproveApplication = (appId: string) => {
    const applications = getApplicationsFromStorage();
    const updatedApps = applications.map((a: any) => 
      a.id === appId ? { ...a, status: 'accepted' } : a
    );
    localStorage.setItem('employer_applications', JSON.stringify(updatedApps));
    toast.success(`Ariza tasdiqlandi!`);
    window.location.reload();
  };

  const handleRejectApplication = (appId: string, reason: string) => {
    const applications = getApplicationsFromStorage();
    const updatedApps = applications.map((a: any) => 
      a.id === appId ? { ...a, status: 'rejected', rejectionReason: reason } : a
    );
    localStorage.setItem('employer_applications', JSON.stringify(updatedApps));
    toast.success(`Ariza rad etildi!`);
    window.location.reload();
  };

  if (!user) return null;

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AdminDashboard
        adminName={`${user.firstName} ${user.lastName}`}
        jobs={getJobsFromStorage()}
        users={getDemoUsersFromStorage()}
        applications={getApplicationsFromStorage()}
        onLogout={handleLogout}
        onDeleteJob={handleDeleteJob}
        onBlockUser={handleBlockUser}
        onToggleFeatured={handleToggleFeatured}
        onUpdateUser={handleUpdateUser}
        onResetPassword={handleResetPassword}
        onSendMessage={handleSendMessage}
        onChangeRole={handleChangeRole}
        onApproveJob={handleApproveJob}
        onRejectJob={handleRejectJob}
        onApproveApplication={handleApproveApplication}
        onRejectApplication={handleRejectApplication}
        onDeleteUser={handleDeleteUser}
      />
    </Suspense>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/select-role" element={<RoleSelectionPage />} />
      <Route path="/login" element={<Navigate to="/select-role" replace />} />
      <Route path="/login/worker" element={<LoginPage userType="worker" />} />
      <Route path="/login/employer" element={<LoginPage userType="employer" />} />
      <Route path="/login/admin" element={<AdminLoginPage />} />
      <Route path="/register/worker" element={<RegisterPage userType="worker" />} />
      <Route path="/register/employer" element={<RegisterPage userType="employer" />} />
      
      <Route 
        path="/worker" 
        element={
          <ProtectedRoute requiredUserType="worker">
            <WorkerDashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/employer" 
        element={
          <ProtectedRoute requiredUserType="employer">
            <EmployerDashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredUserType="admin">
            <AdminDashboardPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Profile va Settings sahifalari */}
      <Route 
        path="/worker/profile" 
        element={
          <ProtectedRoute requiredUserType="worker">
            <WorkerProfilePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/worker/settings" 
        element={
          <ProtectedRoute requiredUserType="worker">
            <Suspense fallback={<PageSkeleton />}>
              <SettingsPage userType="worker" />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/employer/profile" 
        element={
          <ProtectedRoute requiredUserType="employer">
            <EmployerProfilePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/employer/settings" 
        element={
          <ProtectedRoute requiredUserType="employer">
            <Suspense fallback={<PageSkeleton />}>
              <SettingsPage userType="employer" />
            </Suspense>
          </ProtectedRoute>
        } 
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <LanguageProvider>
            <ThemeProvider defaultTheme="light" storageKey="vakans-theme">
              <BrowserRouter>
                <AppRoutes />
                <Toaster />
              </BrowserRouter>
            </ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;
