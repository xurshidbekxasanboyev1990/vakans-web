import { useState } from 'react';
import { AnalyticsOverview } from './AnalyticsOverview';
import { AdvancedAnalytics } from './AdvancedAnalytics';
import { UsersManagement } from './UsersManagement';
import { JobsManagement } from './JobsManagement';
import { ApplicationsManagement } from './ApplicationsManagement';
import { CategoriesManagement } from './CategoriesManagement';
import { SystemSettings } from './SystemSettings';
import { ReportsLogs } from './ReportsLogs';
import { SupportManagement } from './SupportManagement';
import { SecurityCenter } from './SecurityCenter';
import { MarketingTools } from './MarketingTools';
import { AutoNotifySystem } from './AutoNotifySystem';
import { DuplicateDetection } from './DuplicateDetection';
import BoostPromote from './BoostPromote';
import JobTemplates from './JobTemplates';
import { Button } from '../ui/button';
import { ThemeToggle } from '../ThemeToggle';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  LogOut,
  Menu,
  X,
  ClipboardList,
  Settings,
  BarChart3,
  FolderTree,
  Shield,
  MessageCircle,
  ShieldCheck,
  Megaphone,
  Bell,
  Copy,
  Rocket,
  BookTemplate
} from 'lucide-react';
import type { Job, User, Application } from '../../../lib/types';

interface AdminDashboardProps {
  adminName: string;
  jobs: Job[];
  users: User[];
  applications?: Application[];
  onLogout: () => void;
  onDeleteJob: (jobId: string) => void;
  onBlockUser: (userId: string) => void;
  onToggleFeatured?: (jobId: string) => void;
  onUpdateUser?: (userId: string, updates: Partial<User>) => void;
  onResetPassword?: (userId: string) => void;
  onSendMessage?: (userId: string, message: string) => void;
  onChangeRole?: (userId: string, newRole: 'worker' | 'employer') => void;
  onApproveJob?: (jobId: string) => void;
  onRejectJob?: (jobId: string, reason: string) => void;
  onExtendDeadline?: (jobId: string, newDeadline: string) => void;
  onApproveApplication?: (applicationId: string) => void;
  onRejectApplication?: (applicationId: string, reason: string) => void;
  onDeleteUser?: (userId: string) => void;
}

type TabType = 'overview' | 'analytics' | 'users' | 'jobs' | 'applications' | 'categories' | 'support' | 'settings' | 'reports' | 'security' | 'marketing' | 'autonotify' | 'duplicates' | 'boost' | 'templates';

export function AdminDashboard({
  adminName,
  jobs,
  users,
  applications = [],
  onLogout,
  onDeleteJob,
  onBlockUser,
  onToggleFeatured,
  onUpdateUser,
  onResetPassword,
  onSendMessage,
  onChangeRole,
  onApproveJob,
  onRejectJob,
  onExtendDeadline,
  onApproveApplication,
  onRejectApplication,
  onDeleteUser,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'overview', label: 'Umumiy ko\'rinish', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analitika', icon: BarChart3 },
    { id: 'users', label: 'Foydalanuvchilar', icon: Users },
    { id: 'jobs', label: 'Ishlar', icon: Briefcase },
    { id: 'applications', label: 'Arizalar', icon: ClipboardList },
    { id: 'categories', label: 'Kategoriyalar', icon: FolderTree },
    { id: 'security', label: 'Xavfsizlik', icon: ShieldCheck },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
    { id: 'autonotify', label: 'Avto-bildirishnoma', icon: Bell },
    { id: 'duplicates', label: 'Takroriy e\'lonlar', icon: Copy },
    { id: 'boost', label: 'Boost/Reklama', icon: Rocket },
    { id: 'templates', label: 'Shablonlar', icon: BookTemplate },
    { id: 'support', label: 'Qo\'llab-quvvatlash', icon: MessageCircle },
    { id: 'settings', label: 'Sozlamalar', icon: Settings },
    { id: 'reports', label: 'Hisobotlar', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 dark:from-gray-900 dark:via-slate-900 dark:to-gray-950 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800/50">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
                Vakans.uz
              </h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{adminName.charAt(0)}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{adminName}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800/50">
          <Button
            variant="ghost"
            onClick={onLogout}
            className="w-full justify-start text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Chiqish
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
          <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">Vakans.uz</h1>
                  <p className="text-xs text-gray-500">Admin Panel</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="px-4 py-3">
              <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{adminName.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{adminName}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
            </div>
            
            <nav className="flex-1 p-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as TabType);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <Button
                variant="ghost"
                onClick={onLogout}
                className="w-full justify-start text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Chiqish
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800/50 px-4 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-violet-500 dark:text-violet-400" />
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Vakans Admin</h1>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800/50 px-8 py-5 sticky top-0 z-40 items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Boshqaruv paneli</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-violet-100 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 rounded-xl">
              <span className="text-sm font-medium text-violet-600 dark:text-violet-400">Online</span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-950">
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {activeTab === 'overview' && (
              <AnalyticsOverview jobs={jobs} users={users} />
            )}
            {activeTab === 'analytics' && (
              <AdvancedAnalytics jobs={jobs} users={users} applications={applications} />
            )}
            {activeTab === 'users' && (
              <UsersManagement 
                users={users} 
                onBlockUser={onBlockUser}
                onUpdateUser={onUpdateUser}
                onResetPassword={onResetPassword}
                onSendMessage={onSendMessage}
                onChangeRole={onChangeRole}
                onDeleteUser={onDeleteUser}
              />
            )}
            {activeTab === 'jobs' && (
              <JobsManagement 
                jobs={jobs} 
                onDeleteJob={onDeleteJob} 
                onToggleFeatured={onToggleFeatured}
                onApproveJob={onApproveJob}
                onRejectJob={onRejectJob}
                onExtendDeadline={onExtendDeadline}
              />
            )}
            {activeTab === 'applications' && (
              <ApplicationsManagement 
                applications={applications}
                onApprove={onApproveApplication}
                onReject={onRejectApplication}
              />
            )}
            {activeTab === 'categories' && (
              <CategoriesManagement />
            )}
            {activeTab === 'security' && (
              <SecurityCenter />
            )}
            {activeTab === 'marketing' && (
              <MarketingTools />
            )}
            {activeTab === 'autonotify' && (
              <AutoNotifySystem />
            )}
            {activeTab === 'duplicates' && (
              <DuplicateDetection jobs={jobs} onDeleteJob={onDeleteJob} />
            )}
            {activeTab === 'boost' && (
              <BoostPromote />
            )}
            {activeTab === 'templates' && (
              <JobTemplates />
            )}
            {activeTab === 'support' && (
              <SupportManagement />
            )}
            {activeTab === 'settings' && (
              <SystemSettings />
            )}
            {activeTab === 'reports' && (
              <ReportsLogs jobs={jobs} users={users} applications={applications} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
