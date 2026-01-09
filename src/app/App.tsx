import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { ThemeToggle } from './components/ThemeToggle';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { QueryProvider } from '../lib/QueryProvider';
import { ErrorBoundary } from '../lib/ErrorBoundary';
import { apiService } from '../lib/api';
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    // Redirect to select-role instead of /login
    return <Navigate to="/select-role" state={{ from: location }} replace />;
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
    const result = await signIn(phone, password);
    if (!result.error && result.user) {
      // Use user from signIn response directly
      const targetPath = result.user.userType === 'admin' ? '/admin' : `/${result.user.userType}`;
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

  const handleUpdateUser = async (updates: Partial<UserType>) => {
    if (!user) return;
    
    try {
      const response = await apiService.updateProfile(updates);
      if (response.success) {
        toast.success('Profil yangilandi!');
        setTimeout(() => window.location.reload(), 500);
      } else {
        toast.error(response.error || 'Xatolik');
      }
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
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

  const handleUpdateUser = async (updates: Partial<UserType>) => {
    if (!user) return;
    
    try {
      const response = await apiService.updateProfile(updates);
      if (response.success) {
        toast.success('Profil yangilandi!');
        setTimeout(() => window.location.reload(), 500);
      } else {
        toast.error(response.error || 'Xatolik');
      }
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
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
  
  // API'dan ishlarni yuklash
  const [allJobs, setAllJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);

  const backendJobToJobData = (job: any): JobData => {
    const employerName =
      job?.employer?.companyName ||
      [job?.employer?.firstName, job?.employer?.lastName].filter(Boolean).join(' ') ||
      job?.employerName ||
      'Noma\'lum';

    const approvalStatus: any =
      job?.status === 'pending' ? 'pending' : job?.status === 'rejected' ? 'rejected' : 'approved';

    const status: any =
      job?.status === 'active'
        ? 'active'
        : job?.status === 'paused'
          ? 'paused'
          : job?.status === 'closed' || job?.status === 'expired'
            ? 'completed'
            : 'paused';

    const salary = typeof job?.salaryMin === 'number' ? job.salaryMin : typeof job?.salaryMax === 'number' ? job.salaryMax : undefined;

    return {
      id: job.id,
      employerName,
      employerRegion: job?.employer?.region || job.region || '',
      employerPhone: job?.employer?.phone,
      title: job.title,
      description: job.description || '',
      category: job.category,
      startDate: job.createdAt || new Date().toISOString(),
      durationType: 'few-days',
      status,
      approvalStatus,
      rejectionReason: job.rejectionReason,
      salary,
      paymentType: job.salaryType || 'negotiable',
      featured: !!job.isFeatured,
      isUrgent: !!job.isUrgent,
      createdAt: job.createdAt || new Date().toISOString(),
      deadline: job.deadline,
    };
  };

  // API'dan ishlarni yuklash
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await apiService.getJobs();
        if (response.success && response.data) {
          const jobsData = response.data.jobs || response.data;
          setAllJobs(Array.isArray(jobsData) ? jobsData.map(backendJobToJobData) : []);
        }
      } catch (error) {
        console.error('Jobs load error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadJobs();
    // Har 30 sekundda yangilash
    const interval = setInterval(loadJobs, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const handleApply = async (jobId: string, message: string) => {
    if (!user) return;
    
    try {
      const response = await apiService.applyToJob(jobId, message);
      if (response.success) {
        toast.success('Ariza yuborildi!');
      } else {
        toast.error(response.error || 'Xatolik yuz berdi');
      }
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleUpdateUser = async (updates: Partial<UserType>) => {
    if (!user) return;
    
    try {
      const response = await apiService.updateProfile(updates);
      if (response.success) {
        toast.success('Profil yangilandi!');
        window.location.reload();
      } else {
        toast.error(response.error || 'Xatolik');
      }
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
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
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [categories, setCategories] = useState<Array<{id: string; name: string}>>([]);
  const [loading, setLoading] = useState(true);

  const backendApplicationToApplication = (app: any): Application => {
    const workerName =
      app?.worker?.fullName ||
      [app?.worker?.firstName, app?.worker?.lastName].filter(Boolean).join(' ') ||
      app?.workerName ||
      'Noma\'lum';

    const status: any =
      app?.status === 'accepted' || app?.status === 'rejected' || app?.status === 'pending'
        ? app.status
        : 'pending';

    return {
      id: String(app?.id ?? ''),
      jobId: String(app?.jobId ?? app?.job?.id ?? ''),
      workerId: String(app?.workerId ?? app?.worker?.id ?? ''),
      workerName,
      workerRegion: String(app?.worker?.region ?? app?.workerRegion ?? ''),
      workerPhone: app?.worker?.phone ?? app?.workerPhone,
      message: String(app?.coverLetter ?? app?.message ?? ''),
      status,
      createdAt: String(app?.createdAt ?? new Date().toISOString()),
    };
  };

  const backendJobToJobData = (job: any): JobData => {
    const employerName =
      job?.employer?.companyName ||
      [job?.employer?.firstName, job?.employer?.lastName].filter(Boolean).join(' ') ||
      job?.employerName ||
      user?.firstName ||
      'Noma\'lum';

    const approvalStatus: any =
      job?.status === 'pending' ? 'pending' : job?.status === 'rejected' ? 'rejected' : 'approved';

    const status: any =
      job?.status === 'active'
        ? 'active'
        : job?.status === 'paused'
          ? 'paused'
          : job?.status === 'closed' || job?.status === 'expired'
            ? 'completed'
            : 'paused';

    const salary = typeof job?.salaryMin === 'number' ? job.salaryMin : typeof job?.salaryMax === 'number' ? job.salaryMax : undefined;

    return {
      id: job.id,
      employerName,
      employerRegion: job?.employer?.region || job.region || user?.region || '',
      employerPhone: job?.employer?.phone || user?.phone,
      title: job.title,
      description: job.description || '',
      category: job.category,
      startDate: job.createdAt || new Date().toISOString(),
      durationType: 'few-days',
      status,
      approvalStatus,
      rejectionReason: job.rejectionReason,
      salary,
      paymentType: job.salaryType || 'negotiable',
      featured: !!job.isFeatured,
      isUrgent: !!job.isUrgent,
      createdAt: job.createdAt || new Date().toISOString(),
      deadline: job.deadline,
    };
  };

  // API'dan ishlarni yuklash
  const loadJobs = async () => {
    try {
      const response = await apiService.getJobs();
      if (response.success && response.data) {
        const jobsData = response.data.jobs || response.data;
        // Faqat o'z ishlarini ko'rsatish
        const myJobsRaw = Array.isArray(jobsData)
          ? jobsData.filter((job: any) => job.employer?.id === user?.id || job.employerId === user?.id)
          : [];
        setJobs(myJobsRaw.map(backendJobToJobData));
      }
    } catch (error) {
      console.error('Jobs load error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Arizalarni yuklash
  const loadApplications = async () => {
    try {
      const response = await apiService.getApplications();
      if (response.success && response.data) {
        const appsData = response.data.applications || response.data;
        setApplications(Array.isArray(appsData) ? appsData.map(backendApplicationToApplication) : []);
      }
    } catch (error) {
      console.error('Applications load error:', error);
    }
  };

  // Komponent yuklanganida
  useEffect(() => {
    loadJobs();
    loadApplications();

    const interval = setInterval(() => {
      loadJobs();
      loadApplications();
    }, 5000);

    return () => clearInterval(interval);
  }, [user?.id]);

  // Kategoriyalarni yuklash
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await apiService.getCategories();
        if (response.success && response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Categories load error:', error);
      }
    };
    loadCategories();
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const handlePostJob = async (jobData: any) => {
    console.log('=== handlePostJob CALLED ===');
    console.log('jobData:', jobData);
    console.log('user:', user);
    
    if (!user) {
      toast.error('Login qiling!');
      return;
    }
    
    try {
      const normalizeUzPhone = (phone?: string | null): string | undefined => {
        if (!phone) return undefined;
        const digits = String(phone).replace(/\D/g, '');
        if (digits.length === 12 && digits.startsWith('998')) return `+${digits}`;
        if (digits.length === 9) return `+998${digits}`;
        if (/^\+998\d{9}$/.test(phone)) return phone;
        return undefined;
      };

      const mapPaymentTypeToSalaryType = (paymentType: any): 'hourly' | 'daily' | 'monthly' | 'fixed' => {
        switch (paymentType) {
          case 'hourly':
            return 'hourly';
          case 'daily':
            return 'daily';
          case 'monthly':
            return 'monthly';
          case 'weekly':
            // Backend/DB enum'da weekly yo'q, fixed sifatida yuboramiz
            return 'fixed';
          case 'negotiable':
          default:
            // Kelishiladi -> salaryMin yubormaymiz, salaryType fixed
            return 'fixed';
        }
      };

      const salaryType = mapPaymentTypeToSalaryType(jobData.paymentType);
      const salaryMin = typeof jobData.salary === 'number'
        ? jobData.salary
        : (typeof jobData.salary === 'string' && jobData.salary.trim() ? parseFloat(jobData.salary) : undefined);

      // Kategoriya ID topish
      let categoryId: string | undefined = undefined;
      if (jobData.category && categories.length > 0) {
        const cat = categories.find(c => c.name.toLowerCase().includes(jobData.category.toLowerCase()));
        categoryId = cat?.id || categories[0]?.id;
      }
      
      console.log('categoryId:', categoryId);
      console.log('categories:', categories);

      const data = {
        title: jobData.title,
        description: jobData.description,
        categoryId: categoryId,
        salaryMin: jobData.paymentType === 'negotiable' ? undefined : (Number.isFinite(salaryMin as number) ? salaryMin : undefined),
        salaryMax: undefined,
        salaryType,
        currency: 'UZS',
        location: '',
        region: user.region || 'Toshkent shahri',
        address: undefined,
        workType: 'full-time',
        experienceRequired: undefined,
        educationRequired: undefined,
        languagesRequired: [],
        requirements: [],
        benefits: [],
        contactPhone: normalizeUzPhone(user.phone),
        contactEmail: user.email || undefined,
        isUrgent: false,
        deadline: jobData.deadline || undefined
      };
      
      console.log('Sending to API:', data);

      const response = await apiService.postJob(data);
      
      console.log('API Response:', response);
      
      if (response.success) {
        toast.success("Ish yaratildi!");
        await loadJobs();
      } else {
        const details = (response as any)?.details;
        const firstDetailMessage = Array.isArray(details) && details.length ? details[0]?.message : undefined;
        toast.error(firstDetailMessage || response.error || "Xatolik!");
        console.error('API Error:', response.error, details);
      }
    } catch (error) {
      console.error('handlePostJob Error:', error);
      toast.error("Xatolik yuz berdi!");
    }
  };

  const handleJobStatusChange = async (jobId: string, newStatus: string) => {
    try {
      const mapUiStatusToApiStatus = (status: string) => {
        // Backend uses: pending | active | paused | rejected | closed | expired
        // UI uses: active | paused | completed | cancelled
        switch (status) {
          case 'paused':
            return 'paused';
          case 'completed':
          case 'cancelled':
            return 'closed';
          default:
            return status;
        }
      };

      const apiStatus = mapUiStatusToApiStatus(newStatus);

      const response = await apiService.updateJob(jobId, { status: apiStatus });
      if (response.success) {
        toast.success(`Ish holati o'zgartirildi: ${newStatus}`);
        await loadJobs();
      } else {
        toast.error(response.error || 'Xatolik');
      }
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleAcceptApplication = async (appId: string) => {
    try {
      const response = await apiService.updateApplication(appId, 'accepted');
      if (response.success) {
        toast.success('Ariza qabul qilindi');
        await loadApplications();
      } else {
        toast.error(response.error || 'Xatolik');
      }
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleRejectApplication = async (appId: string) => {
    try {
      const response = await apiService.updateApplication(appId, 'rejected');
      if (response.success) {
        toast.success('Ariza rad etildi');
        await loadApplications();
      } else {
        toast.error(response.error || 'Xatolik');
      }
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      const response = await apiService.deleteJob(jobId);
      if (response.success) {
        toast.success("Ish o'chirildi!");
        await loadJobs();
      } else {
        toast.error(response.error || 'Xatolik');
      }
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleUpdateUser = async (updates: Partial<UserType>) => {
    if (!user) return;
    
    try {
      const response = await apiService.updateProfile(updates);
      if (response.success) {
        toast.success('Profil yangilandi!');
        window.location.reload();
      } else {
        toast.error(response.error || 'Xatolik');
      }
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
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
  const [jobs, setJobs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const mapBackendJobToAdminJob = (job: any) => {
    const employerName =
      job?.employer?.companyName ||
      [job?.employer?.firstName, job?.employer?.lastName].filter(Boolean).join(' ') ||
      'Noma\'lum';

    const approvalStatus =
      job?.status === 'pending' ? 'pending' : job?.status === 'rejected' ? 'rejected' : 'approved';

    return {
      id: job.id,
      title: job.title,
      description: job.description,
      category: job.category || '',
      location: job.location || '',
      employerId: job?.employer?.id || '',
      employerName,
      employerPhone: job?.employer?.phone || '',
      employerRegion: job.region || '',
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      salary: job.salaryMin ?? job.salaryMax,
      price: undefined,
      status: job.status || 'active',
      featured: !!job.isFeatured,
      isVip: !!job.isFeatured,
      isUrgent: !!job.isUrgent,
      viewCount: job.viewsCount,
      applicationCount: job.applicationsCount,
      deadline: job.deadline,
      createdAt: job.createdAt,
      approvalStatus,
      rejectionReason: job.rejectionReason,
      imageUrl: undefined,
      startDate: job.createdAt,
      durationType: 'few-days',
      paymentType: job.salaryType,
    };
  };

  const mapBackendUserToAdminUser = (u: any) => {
    return {
      id: u.id,
      phone: u.phone || '',
      email: u.email || '',
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      userType: u.userType,
      region: u.region || '',
      blocked: !!u.isBlocked,
      isAdmin: u.userType === 'admin',
      createdAt: u.createdAt,
      updatedAt: undefined,
      plainPassword: undefined,
    };
  };

  const mapBackendAdminApplication = (a: any) => {
    return {
      id: a.id,
      jobId: a.jobId,
      jobTitle: a.jobTitle,
      workerId: '',
      workerName: a.workerName || '',
      workerPhone: '',
      employerId: '',
      employerName: a.employerName || '',
      status: a.status,
      createdAt: a.createdAt,
    };
  };

  // API'dan ma'lumotlarni yuklash
  const loadData = async () => {
    try {
      // Ishlarni yuklash
      const jobsResponse = await apiService.getJobs();
      if (jobsResponse.success && jobsResponse.data) {
        const jobsData = jobsResponse.data.jobs || jobsResponse.data;
        setJobs(Array.isArray(jobsData) ? jobsData.map(mapBackendJobToAdminJob) : []);
      }

      // Foydalanuvchilarni yuklash
      const usersResponse = await apiService.getAllUsers();
      if (usersResponse.success && usersResponse.data) {
        const usersData = usersResponse.data.users || usersResponse.data;
        setUsers(Array.isArray(usersData) ? usersData.map(mapBackendUserToAdminUser) : []);
      }

      // Arizalarni yuklash
      const appsResponse = await apiService.getAdminApplications();
      if (appsResponse.success && appsResponse.data) {
        const appsData = appsResponse.data.applications || appsResponse.data;
        setApplications(Array.isArray(appsData) ? appsData.map(mapBackendAdminApplication) : []);
      }
    } catch (error) {
      console.error('Admin data load error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      const response = await apiService.deleteJob(jobId);
      if (response.success) {
        toast.success(`Ish o'chirildi!`);
        await loadData();
      } else {
        toast.error(response.error || 'Xatolik');
      }
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleBlockUser = async (userId: string) => {
    try {
      const targetUser = users.find(u => u.id === userId);
      const response = await apiService.toggleAdminUserBlock(userId);
      if (response.success) {
        toast.success(targetUser?.blocked ? 'Blokdan chiqarildi' : 'Bloklandi');
        await loadData();
      }
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    toast.info('Tahrirlash funksiyasi hali tayyor emas');
  };

  const handleResetPassword = async (userId: string) => {
    toast.info('Parol tiklash funksiyasi hali tayyor emas');
  };

  const handleSendMessage = async (userId: string, message: string) => {
    toast.success('Xabar yuborildi');
  };

  const handleChangeRole = async (userId: string, newRole: 'worker' | 'employer') => {
    toast.info('Rol o\'zgartirish funksiyasi hali tayyor emas');
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await apiService.deleteUser(userId);
      if (response.success) {
        toast.success(`Foydalanuvchi o'chirildi`);
        await loadData();
      }
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleToggleFeatured = async (jobId: string) => {
    try {
      const response = await apiService.toggleAdminJobFeatured(jobId);
      if (response.success) {
        toast.success(`VIP status o'zgartirildi!`);
        await loadData();
      }
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleApproveJob = async (jobId: string) => {
    try {
      const response = await apiService.approveAdminJob(jobId, false);
      if (response.success) {
        toast.success(`Ish tasdiqlandi!`);
        await loadData();
      }
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleRejectJob = async (jobId: string, reason: string) => {
    try {
      const response = await apiService.rejectAdminJob(jobId, reason);
      if (response.success) {
        toast.success(`Ish rad etildi!`);
        await loadData();
      }
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleApproveApplication = async (appId: string) => {
    try {
      const response = await apiService.updateApplication(appId, 'accepted');
      if (response.success) {
        toast.success(`Ariza tasdiqlandi!`);
        await loadData();
      }
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleRejectApplication = async (appId: string, reason: string) => {
    try {
      const response = await apiService.updateApplication(appId, 'rejected', { rejectionReason: reason });
      if (response.success) {
        toast.success(`Ariza rad etildi!`);
        await loadData();
      }
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  if (!user) return null;
  if (loading) return <LoadingSpinner />;

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AdminDashboard
        adminName={`${user.firstName} ${user.lastName}`}
        jobs={jobs}
        users={users}
        applications={applications}
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

function LoginRedirect() {
  const { user } = useAuth();
  
  if (user) {
    const targetPath = user.userType === 'admin' ? '/admin' : `/${user.userType}`;
    return <Navigate to={targetPath} replace />;
  }
  
  return <Navigate to="/select-role" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/select-role" element={<RoleSelectionPage />} />
      <Route path="/login" element={<LoginRedirect />} />
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
