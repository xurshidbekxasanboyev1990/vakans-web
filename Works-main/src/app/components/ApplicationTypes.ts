export type ApplicationStatus = 'pending' | 'accepted' | 'rejected';

export interface Application {
  id: string;
  jobId: string;
  workerId: string;
  workerName: string;
  workerRegion: string;
  workerPhone?: string; // Chat uchun telefon raqami
  message: string;
  status: ApplicationStatus;
  createdAt: string;
}

export const ApplicationStatusLabels: Record<ApplicationStatus, string> = {
  pending: 'Kutilmoqda',
  accepted: 'Qabul qilindi',
  rejected: 'Rad etildi',
};

export const ApplicationStatusColors: Record<ApplicationStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  accepted: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
};
