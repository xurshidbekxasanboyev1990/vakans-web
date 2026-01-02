import { JobPostForm, JobData } from './JobPostForm';
import { JobCard } from './JobCard';
import { FeaturedJobsCarousel } from './FeaturedJobsCarousel';
import { ApplicationsViewModal } from './ApplicationsViewModal';
import { AllApplicationsModal } from './AllApplicationsModal';
import { DashboardSidebar } from './DashboardSidebar';
import { Application } from './ApplicationTypes';
import { ChatWindow } from './ChatWindow';
import { Button } from './ui/button';
import { MapPin, Plus, Pause, Play, CheckCircle2, XCircle, Users, Briefcase, Clock, Trash2, Menu } from 'lucide-react';
import { useState, useRef } from 'react';
import type { User as UserType } from '../../lib/types';
import { useLanguage } from '../i18n/LanguageContext';

interface EmployerDashboardProps {
  employerName: string;
  employerRegion: string;
  jobs: JobData[];
  applications?: Application[];
  onPostJob: (job: Omit<JobData, 'id' | 'employerName' | 'employerRegion' | 'createdAt' | 'employerPhone' | 'status' | 'approvalStatus'>) => void;
  onLogout: () => void;
  onJobStatusChange?: (jobId: string, newStatus: string) => void;
  onDeleteJob?: (jobId: string) => void;
  onAcceptApplication?: (applicationId: string) => void;
  onRejectApplication?: (applicationId: string) => void;
  currentUser: UserType;
  onUpdateUser: (user: Partial<UserType>) => void;
}

export function EmployerDashboard({
  employerName,
  employerRegion,
  jobs,
  applications = [],
  onPostJob,
  onLogout,
  onJobStatusChange,
  onDeleteJob,
  onAcceptApplication,
  onRejectApplication,
  currentUser,
  onUpdateUser,
}: EmployerDashboardProps) {
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [applicationsModalJob, setApplicationsModalJob] = useState<JobData | null>(null);
  const [showAllApplications, setShowAllApplications] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<{ jobId: string; workerName: string; workerPhone: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const jobsListRef = useRef<HTMLDivElement>(null);
  
  // Barcha ishlarni ko'rsatish (filter olib tashlandi - App.tsx'da allaqachon foydalanuvchi ishlari keladi)
  const myJobs = jobs;

  // Statistika hisoblash
  const activeJobs = myJobs.filter(j => j.status === 'active' && (j.approvalStatus === 'approved' || !j.approvalStatus)).length;
  const pendingApprovalJobs = myJobs.filter(j => j.approvalStatus === 'pending').length;
  const rejectedJobs = myJobs.filter(j => j.approvalStatus === 'rejected').length;
  const completedJobs = myJobs.filter(j => j.status === 'completed').length;
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(a => a.status === 'pending').length;

  const handleOpenChat = (jobId: string, workerName: string, workerPhone: string) => {
    setSelectedChat({ jobId, workerName, workerPhone });
    setChatOpen(true);
  };

  const handlePostJob = (job: Omit<JobData, 'id' | 'employerName' | 'employerRegion' | 'createdAt' | 'employerPhone' | 'status' | 'approvalStatus'>) => {
    onPostJob(job);
    setShowForm(false);
  };

  const handleStatusChange = (jobId: string, newStatus: string) => {
    if (onJobStatusChange) {
      onJobStatusChange(jobId, newStatus);
    }
  };

  const handleCarouselJobClick = (jobId: string) => {
    jobsListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleOpenApplicationsModal = (job: JobData) => {
    setApplicationsModalJob(job);
  };

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
                className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 shadow-lg shadow-purple-500/30 transition-all"
                aria-label="Menyu"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>
              
              {/* Logo & Brand */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Vakans.uz
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('employerPanel')}</p>
                </div>
              </div>

              {/* User Info */}
              <div className="hidden sm:block h-8 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{employerName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {employerRegion}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {!showForm && (
                <Button 
                  onClick={() => setShowForm(true)} 
                  className="hidden sm:flex bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  {t('postJob')}
                </Button>
              )}
            </div>
          </div>
          
          {/* Mobile add button */}
          {!showForm && (
            <Button 
              onClick={() => setShowForm(true)} 
              className="w-full mt-4 sm:hidden bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('postJob')}
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Stats Cards */}
        {!showForm && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-md border border-gray-300 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeJobs}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('activeAds')}</p>
                </div>
              </div>
            </div>

            <div 
              onClick={() => setShowAllApplications(true)}
              className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-md border border-gray-300 dark:border-gray-700 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalApplications}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('totalApplications')} →</p>
                </div>
              </div>
            </div>

            <div 
              onClick={() => setShowAllApplications(true)}
              className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-md border border-gray-300 dark:border-gray-700 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingApplications}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('newApplications')} →</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-md border border-gray-300 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedJobs}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('completed')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIP Reklamalar Carousel */}
        {!showForm && (
          <FeaturedJobsCarousel 
            jobs={jobs} 
            onJobClick={handleCarouselJobClick}
          />
        )}

        {/* Job Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('postNewJob')}</h2>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {t('cancel')}
              </Button>
            </div>
            <JobPostForm
              employerName={employerName}
              employerRegion={employerRegion}
              onPostJob={handlePostJob}
            />
          </div>
        )}

        {/* My Jobs */}
        <div className="space-y-4" ref={jobsListRef}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {t('myAds')}
              </h2>
            </div>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
              {myJobs.length} {t('count')}
            </span>
          </div>
          
          {myJobs.length === 0 ? (
            <div className="flex items-center justify-center min-h-[400px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl">
              <div className="text-center space-y-4 p-8">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center">
                  <Briefcase className="w-10 h-10 text-purple-500" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {t('noAdsYet')}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('firstAdDesc')}
                  </p>
                </div>
                {!showForm && (
                  <Button 
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white shadow-lg shadow-purple-500/25"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('postFirstAd')}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {myJobs.map((job) => {
                const jobApplications = applications.filter(app => app.jobId === job.id);
                const pendingCount = jobApplications.filter(app => app.status === 'pending').length;
                
                return (
                  <div key={job.id} className="space-y-3">
                    <JobCard job={job} showStats={true} />
                    
                    {/* Approval Status Badge */}
                    {job.approvalStatus === 'pending' && (
                      <div className="flex items-center justify-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-yellow-700 dark:text-yellow-300 text-sm font-medium">
                        <Clock className="w-4 h-4 animate-pulse" />
                        {t('waitingAdminApproval')}
                      </div>
                    )}
                    {job.approvalStatus === 'rejected' && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
                        <div className="flex items-center gap-2 font-medium mb-1">
                          <XCircle className="w-4 h-4" />
                          {t('adRejected')}
                        </div>
                        {job.rejectionReason && (
                          <p className="text-xs opacity-80">{t('reason')}: {job.rejectionReason}</p>
                        )}
                      </div>
                    )}
                    
                    {/* Action Buttons Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-300 dark:border-gray-700 p-3 shadow-sm space-y-2">
                    {/* Applications Button - Opens Modal */}
                    {jobApplications.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        onClick={() => handleOpenApplicationsModal(job)}
                      >
                        <Users className="w-4 h-4 mr-2 text-purple-500" />
                        {t('applications')}: {jobApplications.length} {t('count')}
                        {pendingCount > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-full text-xs font-bold animate-pulse">
                            {pendingCount} {t('new')}
                          </span>
                        )}
                      </Button>
                    )}
                    
                    {/* Status Control Buttons */}
                    {onJobStatusChange && (
                      <div className="flex flex-col gap-2">
                        {job.status === 'active' && (
                          <>
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(job.id, 'paused')}
                                className="btn-status btn-pause border-amber-200 dark:border-amber-800 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                              >
                                <Pause className="w-4 h-4 mr-1.5 transition-transform group-hover:scale-110" />
                                {t('pause')}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(job.id, 'completed')}
                                className="btn-status btn-complete border-emerald-200 dark:border-emerald-800 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1.5 transition-transform group-hover:scale-110" />
                                {t('complete')}
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(job.id, 'cancelled')}
                                className="btn-status btn-cancel border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                              >
                                <XCircle className="w-4 h-4 mr-1.5 transition-transform group-hover:scale-110" />
                                {t('cancelJob')}
                              </Button>
                              {onDeleteJob && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onDeleteJob(job.id)}
                                  className="btn-status btn-delete border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                  <Trash2 className="w-4 h-4 mr-1.5 transition-transform group-hover:scale-110" />
                                  {t('delete')}
                                </Button>
                              )}
                            </div>
                          </>
                        )}
                      
                        {job.status === 'paused' && (
                          <>
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(job.id, 'active')}
                                className="btn-status btn-play border-green-200 dark:border-green-800 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                              >
                                <Play className="w-4 h-4 mr-1.5 transition-transform group-hover:scale-110" />
                                {t('continue')}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(job.id, 'completed')}
                                className="btn-status btn-complete border-emerald-200 dark:border-emerald-800 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1.5 transition-transform group-hover:scale-110" />
                                {t('complete')}
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(job.id, 'cancelled')}
                                className="btn-status btn-cancel border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                              >
                                <XCircle className="w-4 h-4 mr-1.5 transition-transform group-hover:scale-110" />
                                {t('cancelJob')}
                              </Button>
                              {onDeleteJob && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onDeleteJob(job.id)}
                                  className="btn-status btn-delete border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                  <Trash2 className="w-4 h-4 mr-1.5 transition-transform group-hover:scale-110" />
                                  {t('delete')}
                                </Button>
                              )}
                            </div>
                          </>
                        )}
                      
                        {(job.status === 'completed' || job.status === 'cancelled') && (
                          <div className="space-y-2">
                            <div className={`text-center text-sm py-3 rounded-xl font-medium ${
                              job.status === 'completed' 
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' 
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            }`}>
                              {job.status === 'completed' ? `✓ ${t('jobCompleted')}` : `✕ ${t('jobCancelled')}`}
                            </div>
                            {onDeleteJob && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDeleteJob(job.id)}
                                className="w-full btn-status btn-delete border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                              >
                                <Trash2 className="w-4 h-4 mr-1.5 transition-transform group-hover:scale-110" />
                                {t('delete')}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* All Applications Modal */}
      {showAllApplications && (
        <AllApplicationsModal
          jobs={myJobs}
          applications={applications}
          onAccept={(id: string) => onAcceptApplication?.(id)}
          onReject={(id: string) => onRejectApplication?.(id)}
          onOpenChat={handleOpenChat}
          onClose={() => setShowAllApplications(false)}
        />
      )}

      {/* Applications Modal for Single Job */}
      {applicationsModalJob && (
        <ApplicationsViewModal
          job={applicationsModalJob}
          applications={applications.filter(app => app.jobId === applicationsModalJob.id)}
          onAccept={(id: string) => onAcceptApplication?.(id)}
          onReject={(id: string) => onRejectApplication?.(id)}
          onOpenChat={handleOpenChat}
          onClose={() => setApplicationsModalJob(null)}
        />
      )}

      {/* Chat Window */}
      {chatOpen && selectedChat && (
        <ChatWindow
          jobId={selectedChat.jobId}
          employerName={selectedChat.workerName}
          employerPhone={selectedChat.workerPhone}
          currentUserName={employerName}
          currentUserType="employer"
          onClose={() => setChatOpen(false)}
        />
      )}

      {/* Sidebar */}
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={currentUser}
        userType="employer"
        onUpdateUser={onUpdateUser}
        onLogout={onLogout}
      />
    </div>
  );
}