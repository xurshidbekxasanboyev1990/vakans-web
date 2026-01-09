import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../../lib/api';
import { logger } from '../../../lib/logger';

// ============================================
// TYPES
// ============================================

interface SMSSettings {
  enabled: boolean;
  provider: 'eskiz' | 'playmobile' | 'demo';
  eskizEmail: string;
  eskizPassword: string;
  eskizFrom: string;
  types: {
    otp: boolean;
    passwordReset: boolean;
    applicationStatus: boolean;
    newJob: boolean;
    welcome: boolean;
    reminder: boolean;
  };
  limits: {
    dailyPerUser: number;
    totalDaily: number;
    minIntervalSeconds: number;
  };
  stats: {
    todaySent: number;
    todayFailed: number;
    totalSent: number;
    lastSentAt: string | null;
    balance: number;
  };
}

interface SMSType {
  key: keyof SMSSettings['types'];
  label: string;
  description: string;
}

const SMS_TYPES: SMSType[] = [
  { key: 'otp', label: 'Tasdiqlash kodi', description: 'Ro\'yxatdan o\'tish/kirish uchun OTP' },
  { key: 'passwordReset', label: 'Parol tiklash', description: 'Parolni tiklash uchun SMS' },
  { key: 'applicationStatus', label: 'Ariza holati', description: 'Ariza qabul/rad etilganda' },
  { key: 'newJob', label: 'Yangi ish', description: 'Yangi mos ish e\'loni' },
  { key: 'welcome', label: 'Xush kelibsiz', description: 'Ro\'yxatdan o\'tganda' },
  { key: 'reminder', label: 'Eslatmalar', description: 'Tizim eslatmalari' },
];

// ============================================
// COMPONENT
// ============================================

export function SMSAdminPanel() {
  const [settings, setSettings] = useState<SMSSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Test xabar');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // ============================================
  // FETCH SETTINGS
  // ============================================

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.request<SMSSettings>('/sms/settings');
      
      if (response.success && response.data) {
        setSettings(response.data);
      }
    } catch (err) {
      logger.error('SMS sozlamalarini olishda xatolik:', err);
      setError('SMS sozlamalarini yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // ============================================
  // TOGGLE SMS SERVICE
  // ============================================

  const toggleService = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const response = await apiService.request<{ enabled: boolean }>(
        '/sms/toggle',
        {
          method: 'POST',
          body: JSON.stringify({ enabled: !settings.enabled }),
        }
      );

      if (response.success) {
        setSettings(prev => prev ? { ...prev, enabled: response.data?.enabled ?? !prev.enabled } : null);
      }
    } catch (err) {
      logger.error('SMS toggle xatolik:', err);
      setError('SMS xizmatini o\'zgartirishda xatolik');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // TOGGLE SMS TYPE
  // ============================================

  const toggleType = async (type: keyof SMSSettings['types']) => {
    if (!settings) return;

    try {
      setSaving(true);
      const response = await apiService.request<{ type: string; enabled: boolean }>(
        '/sms/toggle-type',
        {
          method: 'POST',
          body: JSON.stringify({ 
            type, 
            enabled: !settings.types[type] 
          }),
        }
      );

      if (response.success && response.data) {
        setSettings(prev => prev ? {
          ...prev,
          types: {
            ...prev.types,
            [type]: response.data?.enabled ?? !prev.types[type],
          },
        } : null);
      }
    } catch (err) {
      logger.error('SMS type toggle xatolik:', err);
      setError('SMS turini o\'zgartirishda xatolik');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // UPDATE SETTINGS
  // ============================================

  const updateSettings = async (updates: Partial<SMSSettings>) => {
    try {
      setSaving(true);
      const response = await apiService.request<SMSSettings>(
        '/sms/settings',
        {
          method: 'PUT',
          body: JSON.stringify(updates),
        }
      );

      if (response.success && response.data) {
        setSettings(response.data);
      }
    } catch (err) {
      logger.error('SMS settings update xatolik:', err);
      setError('SMS sozlamalarini yangilashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // SEND TEST SMS
  // ============================================

  const sendTestSMS = async () => {
    if (!testPhone || !testMessage) {
      setTestResult({ success: false, message: 'Telefon va xabar kiritilishi shart' });
      return;
    }

    try {
      setSaving(true);
      setTestResult(null);
      
      const response = await apiService.request<{ message: string }>(
        '/sms/test',
        {
          method: 'POST',
          body: JSON.stringify({ phone: testPhone, message: testMessage }),
        }
      );

      setTestResult({
        success: response.success,
        message: response.data?.message ?? 'Test SMS yuborildi',
      });
    } catch (err) {
      logger.error('Test SMS xatolik:', err);
      setTestResult({ success: false, message: 'Test SMS yuborishda xatolik' });
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // RESET STATS
  // ============================================

  const resetStats = async () => {
    try {
      setSaving(true);
      await apiService.request('/sms/reset-stats', { method: 'POST' });
      await fetchSettings();
    } catch (err) {
      logger.error('Reset stats xatolik:', err);
      setError('Statistikani tozalashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3">Yuklanmoqda...</span>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12 text-red-500">
        {error || 'SMS sozlamalarini yuklab bo\'lmadi'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            📱 SMS Boshqaruvi
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            SMS xizmatini sozlang va boshqaring
          </p>
        </div>
        
        {/* Main Toggle */}
        <button
          onClick={toggleService}
          disabled={saving}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            settings.enabled
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          } disabled:opacity-50`}
        >
          {settings.enabled ? '✅ SMS Yoqilgan' : '❌ SMS O\'chirilgan'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-red-500 hover:text-red-700">
            ✕
          </button>
        </div>
      )}

      {/* Stats Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">📊 Statistika</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{settings.stats.todaySent}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Bugun yuborilgan</div>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{settings.stats.todayFailed}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Bugun xato</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{settings.stats.totalSent}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Jami yuborilgan</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{settings.stats.balance}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Balans (SMS)</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-sm font-medium text-purple-600">
              {settings.stats.lastSentAt 
                ? new Date(settings.stats.lastSentAt).toLocaleString('uz-UZ')
                : 'Hech qachon'
              }
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Oxirgi SMS</div>
          </div>
        </div>
        <button
          onClick={resetStats}
          disabled={saving}
          className="mt-4 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          🔄 Kunlik statistikani tozalash
        </button>
      </div>

      {/* SMS Types */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">📋 SMS Turlari</h3>
        <div className="space-y-3">
          {SMS_TYPES.map((smsType) => (
            <div
              key={smsType.key}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{smsType.label}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{smsType.description}</div>
              </div>
              <button
                onClick={() => toggleType(smsType.key)}
                disabled={saving || !settings.enabled}
                aria-label={`${smsType.label} ${settings.types[smsType.key] ? 'o\'chirish' : 'yoqish'}`}
                title={`${smsType.label} ${settings.types[smsType.key] ? 'o\'chirish' : 'yoqish'}`}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.types[smsType.key]
                    ? 'bg-green-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                } ${!settings.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.types[smsType.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Limits */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">⚙️ Limitlar</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="dailyPerUser" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kunlik limit (har bir user)
            </label>
            <input
              id="dailyPerUser"
              type="number"
              value={settings.limits.dailyPerUser}
              onChange={(e) => updateSettings({
                limits: { ...settings.limits, dailyPerUser: parseInt(e.target.value) || 5 }
              })}
              title="Kunlik limit (har bir user)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="totalDaily" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Umumiy kunlik limit
            </label>
            <input
              id="totalDaily"
              type="number"
              value={settings.limits.totalDaily}
              onChange={(e) => updateSettings({
                limits: { ...settings.limits, totalDaily: parseInt(e.target.value) || 1000 }
              })}
              title="Umumiy kunlik limit"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="minInterval" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Minimal interval (soniya)
            </label>
            <input
              id="minInterval"
              type="number"
              value={settings.limits.minIntervalSeconds}
              onChange={(e) => updateSettings({
                limits: { ...settings.limits, minIntervalSeconds: parseInt(e.target.value) || 60 }
              })}
              title="Minimal interval (soniya)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Provider Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">🔑 Provayder Sozlamalari</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="smsProvider" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              SMS Provayder
            </label>
            <select
              id="smsProvider"
              value={settings.provider}
              onChange={(e) => updateSettings({ provider: e.target.value as SMSSettings['provider'] })}
              title="SMS Provayder tanlash"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="demo">Demo (Test rejim)</option>
              <option value="eskiz">Eskiz.uz</option>
              <option value="playmobile">PlayMobile</option>
            </select>
          </div>
          
          {settings.provider === 'eskiz' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Eskiz Email
                </label>
                <input
                  type="email"
                  value={settings.eskizEmail}
                  onChange={(e) => updateSettings({ eskizEmail: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Eskiz Parol
                </label>
                <input
                  type="password"
                  value={settings.eskizPassword}
                  onChange={(e) => updateSettings({ eskizPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Yuboruvchi (From)
                </label>
                <input
                  type="text"
                  value={settings.eskizFrom}
                  onChange={(e) => updateSettings({ eskizFrom: e.target.value })}
                  placeholder="4546"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Test SMS */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">🧪 Test SMS</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Telefon raqam
              </label>
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+998901234567"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Xabar matni
              </label>
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Test xabar"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <button
            onClick={sendTestSMS}
            disabled={saving || !settings.enabled || !testPhone}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
          >
            📤 Test SMS Yuborish
          </button>

          {testResult && (
            <div className={`p-4 rounded-lg ${
              testResult.success 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
            }`}>
              {testResult.success ? '✅' : '❌'} {testResult.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SMSAdminPanel;
