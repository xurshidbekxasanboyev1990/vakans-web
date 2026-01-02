import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { User, Phone, MapPin, Briefcase, Edit2, Save, X, ChevronRight, Clock, CheckCircle2, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { REGIONS } from '../../lib/constants';
import type { User as UserType } from '../../lib/types';
import { JobData } from './JobPostForm';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageSelector } from '../i18n/LanguageSelector';

interface UserProfileProps {
  user: UserType;
  onUpdate: (updatedUser: Partial<UserType>) => void;
  onClose: () => void;
  jobs?: JobData[];
  onJobClick?: (jobId: string) => void;
}

export function UserProfile({ user, onUpdate, onClose, jobs = [], onJobClick }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phone, setPhone] = useState(user.phone);
  const [region, setRegion] = useState(user.region);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showActiveJobs, setShowActiveJobs] = useState(false);
  const [showCompletedJobs, setShowCompletedJobs] = useState(false);
  const { t } = useLanguage();

  // Foydalanuvchining ishlari (employer uchun)
  const myJobs = jobs.filter(j => (j as any).employerId === user.id);
  const activeJobs = myJobs.filter(j => j.status === 'active' || j.status === 'paused');
  const completedJobs = myJobs.filter(j => j.status === 'completed' || j.status === 'cancelled');

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+998\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleSave = () => {
    const newErrors: {[key: string]: string} = {};

    if (!firstName.trim()) newErrors.firstName = t('validationErrors.nameRequired');
    if (!lastName.trim()) newErrors.lastName = t('validationErrors.lastNameRequired');
    
    if (!phone.trim()) {
      newErrors.phone = t('phoneRequired');
    } else if (!validatePhone(phone)) {
      newErrors.phone = t('validationErrors.phoneFormat');
    }

    if (!region) newErrors.region = t('validationErrors.regionRequired');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updatedUser = {
      ...user,
      firstName,
      lastName,
      phone,
      region,
    };

    onUpdate(updatedUser);
    setIsEditing(false);
    toast.success(t('profileUpdated'));
  };

  const handleCancel = () => {
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setPhone(user.phone);
    setRegion(user.region);
    setErrors({});
    setIsEditing(false);
  };

  const roleLabel = user.userType === 'worker' ? t('workerEmployee') : t('employerRole');
  const roleColor = user.userType === 'worker' ? 'text-blue-600' : 'text-green-600';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <Card className="w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-auto border-0 sm:border-2 shadow-2xl rounded-t-2xl sm:rounded-2xl">
        <CardHeader className="border-b bg-muted/30 sticky top-0 z-10 rounded-t-2xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-lg sm:text-xl truncate">{t('myProfile')}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">{t('personalInfo')}</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground rounded-full w-10 h-10 p-0 flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6 pb-8 px-4 sm:px-6">
          {/* Rol ko'rsatish */}
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border-2 border-border">
            <Briefcase className={`w-6 h-6 ${roleColor}`} />
            <div>
              <p className="text-sm text-muted-foreground">{t('myRole')}</p>
              <p className={`text-lg font-semibold ${roleColor}`}>
                {roleLabel}
              </p>
            </div>
          </div>

          {/* Ism */}
          <div className="space-y-2">
            <Label htmlFor="firstName" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {t('firstName')}
            </Label>
            {isEditing ? (
              <>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t('yourNamePlaceholder')}
                  className="h-11"
                />
                {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
              </>
            ) : (
              <div className="p-3 bg-muted rounded-lg border">
                <p className="font-medium">{user.firstName}</p>
              </div>
            )}
          </div>

          {/* Familiya */}
          <div className="space-y-2">
            <Label htmlFor="lastName" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {t('lastName')}
            </Label>
            {isEditing ? (
              <>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t('yourLastNamePlaceholder')}
                  className="h-11"
                />
                {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
              </>
            ) : (
              <div className="p-3 bg-muted rounded-lg border">
                <p className="font-medium">{user.lastName}</p>
              </div>
            )}
          </div>

          {/* Telefon */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {t('phoneNumber')}
            </Label>
            {isEditing ? (
              <>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998XXXXXXXXX"
                  className="h-11"
                />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </>
            ) : (
              <div className="p-3 bg-muted rounded-lg border">
                <p className="font-medium">{user.phone}</p>
              </div>
            )}
          </div>

          {/* Viloyat */}
          <div className="space-y-2">
            <Label htmlFor="region" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {t('region')}
            </Label>
            {isEditing ? (
              <>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={t('selectRegion')} />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.region && <p className="text-sm text-red-500">{errors.region}</p>}
              </>
            ) : (
              <div className="p-3 bg-muted rounded-lg border">
                <p className="font-medium">{user.region}</p>
              </div>
            )}
          </div>

          {/* Til o'zgartirish */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {t('languageLabel')}
            </Label>
            <LanguageSelector />
          </div>

          {/* Employer uchun - Faol e'lonlar */}
          {user.userType === 'employer' && myJobs.length > 0 && (
            <div className="space-y-3 pt-4 border-t">
              {/* Faol e'lonlar */}
              <div 
                className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                onClick={() => setShowActiveJobs(!showActiveJobs)}
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-400">{t('activeAds')}</p>
                    <p className="text-sm text-green-600 dark:text-green-500">{activeJobs.length} {t('activeAdsCount')}</p>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 text-green-600 transition-transform ${showActiveJobs ? 'rotate-90' : ''}`} />
              </div>
              
              {showActiveJobs && activeJobs.length > 0 && (
                <div className="space-y-2 pl-4">
                  {activeJobs.map(job => (
                    <div 
                      key={job.id}
                      className="p-3 bg-white dark:bg-gray-800 rounded-lg border hover:shadow-md transition-all cursor-pointer"
                      onClick={() => {
                        if (onJobClick) {
                          onJobClick(job.id);
                          onClose();
                        }
                      }}
                    >
                      <p className="font-medium text-gray-900 dark:text-white">{job.title}</p>
                      <p className="text-sm text-gray-500">{job.status === 'paused' ? `⏸️ ${t('pause')}` : `✅ ${t('onlyActive')}`}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Yakunlangan e'lonlar */}
              <div 
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setShowCompletedJobs(!showCompletedJobs)}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">{t('completed')}</p>
                    <p className="text-sm text-gray-500">{completedJobs.length} {t('completedAdsCount')}</p>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 text-gray-600 transition-transform ${showCompletedJobs ? 'rotate-90' : ''}`} />
              </div>
              
              {showCompletedJobs && completedJobs.length > 0 && (
                <div className="space-y-2 pl-4">
                  {completedJobs.map(job => (
                    <div 
                      key={job.id}
                      className="p-3 bg-white dark:bg-gray-800 rounded-lg border hover:shadow-md transition-all cursor-pointer"
                      onClick={() => {
                        if (onJobClick) {
                          onJobClick(job.id);
                          onClose();
                        }
                      }}
                    >
                      <p className="font-medium text-gray-900 dark:text-white">{job.title}</p>
                      <p className="text-sm text-gray-500">{job.status === 'completed' ? `✓ ${t('jobCompleted')}` : `✕ ${t('jobCancelled')}`}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tugmalar */}
          <div className="flex gap-3 pt-4 border-t">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSave}
                  className="flex-1 h-11"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {t('save')}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1 h-11"
                >
                  <X className="w-4 h-4 mr-2" />
                  {t('cancel')}
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 h-11"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  {t('edit')}
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 h-11"
                >
                  {t('close')}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
