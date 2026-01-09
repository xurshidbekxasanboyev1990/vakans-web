import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  User, 
  Globe, 
  MapPin, 
  LogOut, 
  ChevronRight, 
  X, 
  Menu,
  Moon,
  Sun,
  Briefcase,
  Check,
  Edit2,
  Save,
  Info,
  MessageCircle,
  Send,
  Phone,
  ExternalLink,
  Settings
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { LANGUAGES } from '../i18n/translations';
import { REGIONS } from '../../lib/constants';
import type { User as UserType } from '../../lib/types';

interface DashboardSidebarProps {
  user: UserType;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onUpdateUser: (updates: Partial<UserType>) => void;
  userType: 'worker' | 'employer';
}

export function DashboardSidebar({ 
  user, 
  isOpen, 
  onClose, 
  onLogout, 
  onUpdateUser,
  userType 
}: DashboardSidebarProps) {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    region: user.region
  });

  // Update form when user changes
  useEffect(() => {
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      region: user.region
    });
  }, [user]);

  // Sidebar ochilganda body scroll qilmaslik
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLanguageChange = (langCode: typeof language) => {
    setLanguage(langCode);
    localStorage.setItem('app-language', langCode);
    window.location.reload();
  };

  const handleRegionChange = (region: string) => {
    // Update in localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map((u: UserType) => 
      u.id === user.id ? { ...u, region } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Update current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.id === user.id) {
      localStorage.setItem('currentUser', JSON.stringify({ ...currentUser, region }));
    }
    
    onUpdateUser({ region });
    setActiveSection(null);
  };

  const handleSaveProfile = () => {
    // Validate
    if (!editForm.firstName.trim() || !editForm.lastName.trim() || !editForm.phone.trim()) {
      alert(t('validationErrors.nameRequired'));
      return;
    }

    // Call parent to update - parent handles localStorage and reload
    onUpdateUser(editForm);
    setIsEditing(false);
  };

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('vakans-theme', newTheme);
    setIsDark(!isDark);
  };

  const menuItems = [
    {
      id: 'profile',
      icon: User,
      label: t('profile'),
      description: `${user.firstName} ${user.lastName}`,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      onClick: () => {
        onClose();
        navigate(`/${userType}/profile`);
      },
    },
    {
      id: 'settings',
      icon: Settings,
      label: t('settings'),
      description: t('appSettings') || 'Ilova sozlamalari',
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/10',
      onClick: () => {
        onClose();
        navigate(`/${userType}/settings`);
      },
    },
    {
      id: 'theme',
      icon: isDark ? Moon : Sun,
      label: t('theme'),
      description: isDark ? t('darkMode') : t('lightMode'),
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      onClick: toggleTheme,
    },
  ];

  // Get stats from localStorage
  const getStats = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    const workers = users.filter((u: UserType) => u.userType === 'worker').length;
    const employers = users.filter((u: UserType) => u.userType === 'employer').length;
    const completedJobs = jobs.filter((j: any) => j.status === 'completed').length;
    return { workers, employers, totalJobs: jobs.length, completedJobs };
  };

  // Support contact info from localStorage or default
  const getSupportInfo = () => {
    const stored = localStorage.getItem('supportInfo');
    if (stored) return JSON.parse(stored);
    return {
      telegram: '@vakans_support',
      phone: '+998 90 123 45 67',
      workHours: '9:00 - 18:00 (Dush-Jum)'
    };
  };

  // Support message form state
  const [supportMessage, setSupportMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  const handleSendSupportMessage = () => {
    if (!supportMessage.trim()) return;
    
    // Save message to localStorage (admin can see it)
    const messages = JSON.parse(localStorage.getItem('supportMessages') || '[]');
    const newMessage = {
      id: Date.now().toString(),
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userPhone: user.phone,
      userType: userType,
      message: supportMessage,
      createdAt: new Date().toISOString(),
      status: 'new'
    };
    messages.push(newMessage);
    localStorage.setItem('supportMessages', JSON.stringify(messages));
    
    setSupportMessage('');
    setMessageSent(true);
    setTimeout(() => setMessageSent(false), 3000);
  };

  if (!isOpen) return null;

  const stats = getStats();
  const supportInfo = getSupportInfo();

  return (
    <>
      {/* Backdrop - sekin fade in */}
      <div 
        className={`
          fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]
          transition-opacity duration-500 ease-out
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />
      
      {/* Sidebar - CHAP TOMONDA - sekin slide */}
      <aside className={`
        fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] z-[100]
        bg-white dark:bg-gray-900 
        border-r border-gray-200 dark:border-gray-800
        shadow-2xl
        transform transition-all duration-500 ease-out
        flex flex-col overflow-hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${userType === 'employer' ? 'bg-gradient-to-br from-purple-500 to-blue-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'} flex items-center justify-center shadow-lg`}>
                <span className="text-white font-bold text-lg">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  {userType === 'employer' ? t('employer') : t('worker')}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full w-10 h-10 p-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Menu Items - Scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${item.bgColor} flex items-center justify-center`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{item.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </div>

        {/* Footer - Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
          <Button
            onClick={onLogout}
            variant="outline"
            className="w-full h-12 border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 rounded-xl font-medium"
          >
            <LogOut className="w-5 h-5 mr-2" />
            {t('logout')}
          </Button>
          
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
            Vakans.uz © 2025
          </p>
        </div>
      </aside>
    </>
  );
}

// Sidebar trigger button component
export function SidebarTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      <Menu className="w-5 h-5" />
    </Button>
  );
}
