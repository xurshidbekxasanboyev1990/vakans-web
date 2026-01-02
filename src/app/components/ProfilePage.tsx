import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, User, Phone, MapPin, Save, Briefcase, Check } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { REGIONS } from '../../lib/constants';
import type { User as UserType } from '../../lib/types';

interface ProfilePageProps {
  user: UserType;
  onUpdateUser: (updates: Partial<UserType>) => void;
  userType: 'worker' | 'employer';
}

export function ProfilePage({ user, onUpdateUser, userType }: ProfilePageProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    region: user.region
  });

  useEffect(() => {
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      region: user.region
    });
  }, [user]);

  const handleSave = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      return;
    }
    onUpdateUser(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const goBack = () => {
    navigate(userType === 'employer' ? '/employer' : '/worker');
  };

  return (
    <div className="min-h-screen bg-[#dae1e7] dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={goBack}
              className="rounded-full w-10 h-10 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('profile')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('personalInfo')}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Avatar Card */}
        <Card className="border border-gray-300 dark:border-gray-700 shadow-md bg-white dark:bg-gray-900">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={`w-20 h-20 rounded-2xl ${userType === 'employer' ? 'bg-gradient-to-br from-purple-500 to-blue-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'} flex items-center justify-center shadow-lg`}>
                <span className="text-white font-bold text-2xl">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {userType === 'employer' ? t('employer') : t('worker')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="border border-gray-300 dark:border-gray-700 shadow-md bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">{t('personalInfo')}</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">{t('editProfileDesc') || 'Ma\'lumotlaringizni tahrirlang'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  {t('firstName')}
                </label>
                <Input
                  value={form.firstName}
                  onChange={(e) => setForm({...form, firstName: e.target.value})}
                  className="h-12 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 text-gray-900 dark:text-white"
                  placeholder={t('firstName')}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('lastName')}
                </label>
                <Input
                  value={form.lastName}
                  onChange={(e) => setForm({...form, lastName: e.target.value})}
                  className="h-12 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 text-gray-900 dark:text-white"
                  placeholder={t('lastName')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                {t('phone')}
              </label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({...form, phone: e.target.value})}
                className="h-12 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                placeholder="+998"
                disabled
              />
              <p className="text-xs text-gray-500">{t('phoneCannotChange') || 'Telefon raqamni o\'zgartirish mumkin emas'}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                {t('region')}
              </label>
              <Select value={form.region} onValueChange={(v) => setForm({...form, region: v})}>
                <SelectTrigger className="h-12 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                  <SelectValue placeholder={t('selectRegion')} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  {REGIONS.map((region) => (
                    <SelectItem key={region} value={region} className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleSave}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/25"
              disabled={saved}
            >
              {saved ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  {t('saved') || 'Saqlandi!'}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  {t('save')}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
