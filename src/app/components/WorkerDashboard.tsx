import { JobCard } from './JobCard';
import { JobData } from './JobPostForm';
import { FeaturedJobsCarousel } from './FeaturedJobsCarousel';
import { DashboardSidebar } from './DashboardSidebar';
import { WorkerNotificationsPanel } from './WorkerNotificationsPanel';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Briefcase, Filter, TrendingUp, Menu, Grid3X3 } from 'lucide-react';
import { useState, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { ChatWindow } from './ChatWindow';
import { ApplicationModal } from './ApplicationModal';
import { REGIONS, getJobCategories } from '../../lib/constants';
import type { User as UserType } from '../../lib/types';
import { useLanguage } from '../i18n/LanguageContext';

interface WorkerDashboardProps {
  workerName: string;
  workerRegion: string;
  jobs: JobData[];
  onLogout: () => void;
  onApply?: (jobId: string, message: string) => void;
  currentUser: UserType;
  onUpdateUser: (user: Partial<UserType>) => void;
}

export function WorkerDashboard({
  workerName,
  workerRegion,
  jobs,
  onLogout,
  onApply,
  currentUser,
  onUpdateUser,
}: WorkerDashboardProps) {
  const { t, language } = useLanguage();
  const jobCategories = getJobCategories(language);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active'>('active');
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<{jobId: string, employerName: string, employerPhone: string} | null>(null);
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<{jobId: string, jobTitle: string, employerName: string} | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const jobsListRef = useRef<HTMLDivElement>(null);

  const handleOpenChat = (jobId: string, employerName: string, employerPhone: string) => {
    setSelectedChat({ jobId, employerName, employerPhone });
    setChatOpen(true);
  };

  const handleOpenApplication = (jobId: string, jobTitle: string, employerName: string) => {
    setSelectedJob({ jobId, jobTitle, employerName });
    setApplicationModalOpen(true);
  };

  const handleSubmitApplication = (message: string) => {
    if (selectedJob && onApply) {
      onApply(selectedJob.jobId, message);
    }
  };

  const handleCarouselJobClick = (jobId: string) => {
    jobsListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      (job.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = regionFilter === 'all' || job.employerRegion === regionFilter;
    const matchesCategory = categoryFilter === 'all' || job.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || job.status === 'active';
    // Faqat admin tomonidan tasdiqlangan ishlarni ko'rsatish
    const isApproved = job.approvalStatus === 'approved' || job.approvalStatus === undefined;
    return matchesSearch && matchesRegion && matchesCategory && matchesStatus && isApproved;
  });

  const regions = Array.from(new Set(jobs.map((job) => job.employerRegion)));
  const activeJobsCount = jobs.filter(j => j.status === 'active' && (j.approvalStatus === 'approved' || j.approvalStatus === undefined)).length;

  return (
    <div className="min-h-screen bg-[#dae1e7] dark:bg-gray-950">
      {/* Modern Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Sidebar Toggle - Left side */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all"
                aria-label="Sozlamalar"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>
              
              {/* Logo & Brand */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Vakans.uz
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('workerPanel')}</p>
                </div>
              </div>

              {/* User Info */}
              <div className="hidden sm:block h-8 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{workerName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {workerRegion}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Notifications */}
              <WorkerNotificationsPanel workerId={currentUser.id} />
            </div>
          </div>
        </div>
      </header>

      {/* Search & Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Stats Bar */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 rounded-xl shadow-md">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              <span className="text-green-600 font-bold">{activeJobsCount}</span> {t('activeJobs')}
            </span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent dark:from-blue-800" />
        </div>

        {/* VIP Reklamalar Carousel */}
        <FeaturedJobsCarousel 
          jobs={jobs} 
          onJobClick={handleCarouselJobClick}
        />

        {/* Search & Filter Section */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-xl shadow-blue-500/5 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('searchAndFilters')}</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
              <Input
                placeholder={t('searchJobs')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="h-11 w-full sm:w-48 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                <SelectValue placeholder={t('allRegions')} />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                <SelectItem value="all">{t('allRegions')}</SelectItem>
                {REGIONS.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-11 w-full sm:w-48 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                <div className="flex items-center gap-2">
                  <Grid3X3 className="w-4 h-4 text-gray-400" />
                  <SelectValue placeholder={t('allCategories')} />
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-64">
                <SelectItem value="all">{t('allCategories')}</SelectItem>
                {jobCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'active')}>
              <SelectTrigger className="h-11 w-full sm:w-40 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t('onlyActive')}</SelectItem>
                <SelectItem value="all">{t('allJobs')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8" ref={jobsListRef}>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {t('availableJobs')}
            </p>
          </div>
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
            {filteredJobs.length} {t('count')}
          </span>
        </div>
        
        {filteredJobs.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px] bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
            <div className="text-center space-y-4 p-8">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                <Search className="w-10 h-10 text-blue-500" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {regionFilter !== 'all' 
                    ? t('noJobsForRegion')
                    : jobs.length === 0 
                      ? t('noJobsYet')
                      : t('jobNotFound')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('tryDifferentSearch')}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredJobs.map((job) => (
              <JobCard 
                key={job.id} 
                job={job} 
                showApplyButton={true}
                onApply={() => handleOpenApplication(job.id, job.title, job.employerName)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Chat Window */}
      {chatOpen && selectedChat && (
        <ChatWindow
          jobId={selectedChat.jobId}
          employerName={selectedChat.employerName}
          employerPhone={selectedChat.employerPhone}
          currentUserName={workerName}
          currentUserType="worker"
          onClose={() => setChatOpen(false)}
        />
      )}

      {/* Application Modal */}
      {applicationModalOpen && selectedJob && (
        <ApplicationModal
          jobTitle={selectedJob.jobTitle}
          employerName={selectedJob.employerName}
          onSubmit={handleSubmitApplication}
          onClose={() => setApplicationModalOpen(false)}
        />
      )}

      {/* Sidebar */}
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={currentUser}
        userType="worker"
        onUpdateUser={onUpdateUser}
        onLogout={onLogout}
      />
    </div>
  );
}