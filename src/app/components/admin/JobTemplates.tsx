import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  Save,
  X,
  Check,
  Star,
  Clock,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Users,
  Search,
  Filter,
  MoreVertical,
  BookTemplate,
  FolderOpen,
  Tag,
  Sparkles,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface JobTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  workType: 'full-time' | 'part-time' | 'remote' | 'contract';
  experience: string;
  education: string;
  skills: string[];
  benefits: string[];
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  isPremium: boolean;
}

interface TemplateCategory {
  id: string;
  name: string;
  nameUz: string;
  icon: string;
  count: number;
  color: string;
}

const JobTemplates: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('templates');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingTemplate, setEditingTemplate] = useState<JobTemplate | null>(null);
  const [showNewTemplate, setShowNewTemplate] = useState(false);

  // Template categories
  const [categories] = useState<TemplateCategory[]>([
    { id: 'it', name: 'IT & Technology', nameUz: 'IT & Texnologiya', icon: '💻', count: 45, color: 'bg-blue-500' },
    { id: 'marketing', name: 'Marketing & Sales', nameUz: 'Marketing & Sotuv', icon: '📈', count: 32, color: 'bg-green-500' },
    { id: 'finance', name: 'Finance & Accounting', nameUz: 'Moliya & Buxgalteriya', icon: '💰', count: 28, color: 'bg-yellow-500' },
    { id: 'hr', name: 'HR & Admin', nameUz: 'HR & Admin', icon: '👥', count: 24, color: 'bg-purple-500' },
    { id: 'design', name: 'Design & Creative', nameUz: 'Dizayn & Kreativ', icon: '🎨', count: 19, color: 'bg-pink-500' },
    { id: 'service', name: 'Customer Service', nameUz: 'Mijozlarga xizmat', icon: '🎧', count: 22, color: 'bg-orange-500' },
    { id: 'education', name: 'Education', nameUz: 'Ta\'lim', icon: '📚', count: 18, color: 'bg-indigo-500' },
    { id: 'healthcare', name: 'Healthcare', nameUz: 'Sog\'liqni saqlash', icon: '🏥', count: 15, color: 'bg-red-500' }
  ]);

  // Demo templates
  const [templates, setTemplates] = useState<JobTemplate[]>([
    {
      id: '1',
      name: 'Frontend Developer',
      category: 'it',
      description: 'Biz jamoamizga tajribali Frontend Developer qidiryapmiz. Zamonaviy web texnologiyalar bilan ishlash, foydalanuvchi interfeyslarini yaratish va optimallashtirishda qatnashish.',
      requirements: [
        'JavaScript, TypeScript bilimi',
        'React yoki Vue.js tajribasi',
        'HTML5, CSS3 bilimi',
        'Git versiya boshqaruvi',
        'REST API bilan ishlash tajribasi'
      ],
      responsibilities: [
        'Foydalanuvchi interfeyslarini ishlab chiqish',
        'Mavjud kodlarni optimallashtirish',
        'Backend dasturchilar bilan hamkorlik',
        'Kod review va dokumentatsiya'
      ],
      salary: { min: 5000000, max: 15000000, currency: 'UZS' },
      workType: 'full-time',
      experience: '2-3 yil',
      education: 'Oliy ma\'lumot',
      skills: ['JavaScript', 'TypeScript', 'React', 'CSS', 'Git'],
      benefits: ['Masofadan ishlash imkoniyati', 'Bepul tushlik', 'Professional rivojlanish'],
      isActive: true,
      usageCount: 156,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15',
      isPremium: false
    },
    {
      id: '2',
      name: 'Backend Developer',
      category: 'it',
      description: 'Tajribali Backend Developer kerak. Server tomonida dasturlar yaratish, ma\'lumotlar bazasi bilan ishlash va API yaratish.',
      requirements: [
        'Node.js yoki Python bilimi',
        'SQL va NoSQL ma\'lumotlar bazasi',
        'REST/GraphQL API tajribasi',
        'Docker bilan tanishish',
        'CI/CD tushunchasi'
      ],
      responsibilities: [
        'Server arxitekturasini loyihalash',
        'API endpoint larni yaratish',
        'Ma\'lumotlar bazasini optimallashtirish',
        'Xavfsizlik choralarini amalga oshirish'
      ],
      salary: { min: 7000000, max: 20000000, currency: 'UZS' },
      workType: 'full-time',
      experience: '3-5 yil',
      education: 'Oliy ma\'lumot',
      skills: ['Node.js', 'Python', 'PostgreSQL', 'Docker', 'AWS'],
      benefits: ['Sug\'urta', 'Ta\'til', 'Bonuslar'],
      isActive: true,
      usageCount: 134,
      createdAt: '2024-01-02',
      updatedAt: '2024-01-14',
      isPremium: false
    },
    {
      id: '3',
      name: 'Marketing Manager',
      category: 'marketing',
      description: 'Marketing bo\'limini boshqarish va marketing strategiyalarini ishlab chiqish uchun tajribali Marketing Manager kerak.',
      requirements: [
        'Marketing sohasida 5+ yil tajriba',
        'Digital marketing bilimi',
        'Jamoa boshqarish tajribasi',
        'Analitika vositalari bilan ishlash',
        'O\'zbek va rus tillarini bilish'
      ],
      responsibilities: [
        'Marketing strategiyasini ishlab chiqish',
        'Reklama kampaniyalarini boshqarish',
        'Byudjetni rejalashtirish',
        'Jamoa ishini nazorat qilish'
      ],
      salary: { min: 10000000, max: 25000000, currency: 'UZS' },
      workType: 'full-time',
      experience: '5+ yil',
      education: 'Oliy ma\'lumot (MBA afzal)',
      skills: ['Digital Marketing', 'SEO', 'Analytics', 'Leadership'],
      benefits: ['Korporativ avtomobil', 'Bonus tizimi', 'Sug\'urta'],
      isActive: true,
      usageCount: 89,
      createdAt: '2024-01-03',
      updatedAt: '2024-01-12',
      isPremium: true
    },
    {
      id: '4',
      name: 'Buxgalter',
      category: 'finance',
      description: 'Kompaniya moliyaviy operatsiyalarini yuritish uchun tajribali Buxgalter talab qilinadi.',
      requirements: [
        'Buxgalteriya sohasida 3+ yil tajriba',
        '1C dasturini bilish',
        'Soliq qonunchiligini bilish',
        'MS Excel bilimi',
        'E\'tiborlilik va aniqlik'
      ],
      responsibilities: [
        'Moliyaviy hisobotlarni tayyorlash',
        'Soliq deklaratsiyalarini topshirish',
        'Kassani yuritish',
        'Audit tekshiruvlariga tayyorgarlik'
      ],
      salary: { min: 4000000, max: 8000000, currency: 'UZS' },
      workType: 'full-time',
      experience: '3+ yil',
      education: 'Oliy ma\'lumot',
      skills: ['1C', 'Excel', 'Soliq', 'Audit'],
      benefits: ['Rasmiy ish', 'Ta\'til', 'Kasallik varaqasi'],
      isActive: true,
      usageCount: 234,
      createdAt: '2024-01-04',
      updatedAt: '2024-01-10',
      isPremium: false
    },
    {
      id: '5',
      name: 'UI/UX Designer',
      category: 'design',
      description: 'Kreativ va tajribali UI/UX Designer kerak. Foydalanuvchi tajribasini yaxshilash va zamonaviy dizaynlar yaratish.',
      requirements: [
        'Figma, Sketch, Adobe XD bilimi',
        'UI/UX printsiplari',
        'Prototiplash tajribasi',
        'Portfolio mavjudligi',
        'Kommunikatsiya qobiliyati'
      ],
      responsibilities: [
        'Foydalanuvchi tadqiqotlarini o\'tkazish',
        'Wireframe va prototiplar yaratish',
        'Visual dizaynlar ishlab chiqish',
        'Dasturchilar bilan hamkorlik'
      ],
      salary: { min: 6000000, max: 15000000, currency: 'UZS' },
      workType: 'full-time',
      experience: '2+ yil',
      education: 'Oliy ma\'lumot (afzal)',
      skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
      benefits: ['Masofadan ishlash', 'Kurslar uchun byudjet', 'Zamonaviy qurilmalar'],
      isActive: true,
      usageCount: 112,
      createdAt: '2024-01-05',
      updatedAt: '2024-01-11',
      isPremium: false
    },
    {
      id: '6',
      name: 'HR Manager',
      category: 'hr',
      description: 'Xodimlar bilan ishlash va HR jarayonlarini boshqarish uchun tajribali HR Manager kerak.',
      requirements: [
        'HR sohasida 4+ yil tajriba',
        'Mehnat qonunchiligi bilimi',
        'Intervyu o\'tkazish tajribasi',
        'HR tizimlari bilan ishlash',
        'Kommunikatsiya qobiliyati'
      ],
      responsibilities: [
        'Xodimlarni tanlash va yollash',
        'HR siyosatlarini ishlab chiqish',
        'Kadrlar hujjatlarini yuritish',
        'Xodimlar rivojlanishini nazorat qilish'
      ],
      salary: { min: 8000000, max: 18000000, currency: 'UZS' },
      workType: 'full-time',
      experience: '4+ yil',
      education: 'Oliy ma\'lumot',
      skills: ['Recruiting', 'HR Systems', 'Labor Law', 'Leadership'],
      benefits: ['Bonus tizimi', 'Ta\'til', 'Tibbiy sug\'urta'],
      isActive: true,
      usageCount: 98,
      createdAt: '2024-01-06',
      updatedAt: '2024-01-09',
      isPremium: true
    }
  ]);

  // New template form state
  const [newTemplate, setNewTemplate] = useState<Partial<JobTemplate>>({
    name: '',
    category: 'it',
    description: '',
    requirements: [],
    responsibilities: [],
    salary: { min: 0, max: 0, currency: 'UZS' },
    workType: 'full-time',
    experience: '',
    education: '',
    skills: [],
    benefits: [],
    isActive: true,
    isPremium: false
  });

  const [newRequirement, setNewRequirement] = useState('');
  const [newResponsibility, setNewResponsibility] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newBenefit, setNewBenefit] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
  };

  const getWorkTypeBadge = (type: string) => {
    switch (type) {
      case 'full-time':
        return <Badge className="bg-green-500">To'liq kun</Badge>;
      case 'part-time':
        return <Badge className="bg-blue-500">Yarim kun</Badge>;
      case 'remote':
        return <Badge className="bg-purple-500">Masofaviy</Badge>;
      case 'contract':
        return <Badge className="bg-orange-500">Shartnoma</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getCategoryName = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? (language === 'uz' ? cat.nameUz : cat.name) : categoryId;
  };

  const getCategoryIcon = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat?.icon || '📋';
  };

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddItem = (type: 'requirement' | 'responsibility' | 'skill' | 'benefit', value: string) => {
    if (!value.trim()) return;
    
    setNewTemplate(prev => {
      const key = type === 'requirement' ? 'requirements' : 
                  type === 'responsibility' ? 'responsibilities' :
                  type === 'skill' ? 'skills' : 'benefits';
      return {
        ...prev,
        [key]: [...(prev[key] || []), value.trim()]
      };
    });

    // Clear input
    switch (type) {
      case 'requirement': setNewRequirement(''); break;
      case 'responsibility': setNewResponsibility(''); break;
      case 'skill': setNewSkill(''); break;
      case 'benefit': setNewBenefit(''); break;
    }
  };

  const handleRemoveItem = (type: 'requirements' | 'responsibilities' | 'skills' | 'benefits', index: number) => {
    setNewTemplate(prev => ({
      ...prev,
      [type]: (prev[type] || []).filter((_, i) => i !== index)
    }));
  };

  const handleSaveTemplate = () => {
    if (!newTemplate.name || !newTemplate.description) {
      alert('Iltimos, shablon nomi va tavsifini kiriting');
      return;
    }

    const template: JobTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name || '',
      category: newTemplate.category || 'it',
      description: newTemplate.description || '',
      requirements: newTemplate.requirements || [],
      responsibilities: newTemplate.responsibilities || [],
      salary: newTemplate.salary || { min: 0, max: 0, currency: 'UZS' },
      workType: newTemplate.workType || 'full-time',
      experience: newTemplate.experience || '',
      education: newTemplate.education || '',
      skills: newTemplate.skills || [],
      benefits: newTemplate.benefits || [],
      isActive: newTemplate.isActive ?? true,
      usageCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      isPremium: newTemplate.isPremium ?? false
    };

    setTemplates(prev => [...prev, template]);
    setShowNewTemplate(false);
    setNewTemplate({
      name: '',
      category: 'it',
      description: '',
      requirements: [],
      responsibilities: [],
      salary: { min: 0, max: 0, currency: 'UZS' },
      workType: 'full-time',
      experience: '',
      education: '',
      skills: [],
      benefits: [],
      isActive: true,
      isPremium: false
    });
  };

  const handleDuplicateTemplate = (template: JobTemplate) => {
    const newT: JobTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (nusxa)`,
      usageCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setTemplates(prev => [...prev, newT]);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Haqiqatan ham bu shablonni o\'chirmoqchimisiz?')) {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  const totalUsage = templates.reduce((sum, t) => sum + t.usageCount, 0);
  const activeTemplates = templates.filter(t => t.isActive).length;
  const premiumTemplates = templates.filter(t => t.isPremium).length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <BookTemplate className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Jami shablonlar</p>
                <p className="text-2xl font-bold">{templates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Faol shablonlar</p>
                <p className="text-2xl font-bold">{activeTemplates}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Premium shablonlar</p>
                <p className="text-2xl font-bold">{premiumTemplates}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Jami ishlatilgan</p>
                <p className="text-2xl font-bold">{totalUsage}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Shablonlar
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Kategoriyalar
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Sozlamalar
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          {!showNewTemplate ? (
            <>
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex gap-2 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Shablon qidirish..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[200px]" aria-label="Kategoriya filtri">
                      <SelectValue placeholder="Kategoriya" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Barcha kategoriyalar</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.icon} {language === 'uz' ? cat.nameUz : cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                  <Button onClick={() => setShowNewTemplate(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Yangi shablon
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className={`relative ${!template.isActive ? 'opacity-60' : ''}`}>
                    {template.isPremium && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-yellow-500">
                          <Star className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{getCategoryIcon(template.category)}</span>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription>{getCategoryName(template.category)}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {getWorkTypeBadge(template.workType)}
                        <Badge variant="outline">{template.experience}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {formatCurrency(template.salary.min)} - {formatCurrency(template.salary.max)}
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-1">
                        {template.skills.slice(0, 3).map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">{skill}</Badge>
                        ))}
                        {template.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">+{template.skills.length - 3}</Badge>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="text-sm text-gray-500">
                        <Users className="h-4 w-4 inline mr-1" />
                        {template.usageCount} marta ishlatilgan
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleDuplicateTemplate(template)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setEditingTemplate(template)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteTemplate(template.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            /* New Template Form */
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Yangi shablon yaratish</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setShowNewTemplate(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Shablon nomi *</Label>
                    <Input
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Masalan: Frontend Developer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Kategoriya *</Label>
                    <Select 
                      value={newTemplate.category} 
                      onValueChange={(v) => setNewTemplate(prev => ({ ...prev, category: v }))}
                    >
                      <SelectTrigger aria-label="Kategoriya tanlash">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.icon} {language === 'uz' ? cat.nameUz : cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tavsif *</Label>
                  <Textarea
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Ish haqida qisqacha ma'lumot..."
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Ish turi</Label>
                    <Select 
                      value={newTemplate.workType} 
                      onValueChange={(v: any) => setNewTemplate(prev => ({ ...prev, workType: v }))}
                    >
                      <SelectTrigger aria-label="Ish turi">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">To'liq kun</SelectItem>
                        <SelectItem value="part-time">Yarim kun</SelectItem>
                        <SelectItem value="remote">Masofaviy</SelectItem>
                        <SelectItem value="contract">Shartnoma</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tajriba</Label>
                    <Input
                      value={newTemplate.experience}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, experience: e.target.value }))}
                      placeholder="Masalan: 2-3 yil"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Minimal maosh (so'm)</Label>
                    <Input
                      type="number"
                      value={newTemplate.salary?.min || ''}
                      onChange={(e) => setNewTemplate(prev => ({ 
                        ...prev, 
                        salary: { ...prev.salary!, min: parseInt(e.target.value) || 0 }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Maksimal maosh (so'm)</Label>
                    <Input
                      type="number"
                      value={newTemplate.salary?.max || ''}
                      onChange={(e) => setNewTemplate(prev => ({ 
                        ...prev, 
                        salary: { ...prev.salary!, max: parseInt(e.target.value) || 0 }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ta'lim</Label>
                    <Input
                      value={newTemplate.education}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, education: e.target.value }))}
                      placeholder="Oliy ma'lumot"
                    />
                  </div>
                </div>

                {/* Requirements */}
                <div className="space-y-2">
                  <Label>Talablar</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      placeholder="Yangi talab qo'shish..."
                      onKeyPress={(e) => e.key === 'Enter' && handleAddItem('requirement', newRequirement)}
                    />
                    <Button type="button" onClick={() => handleAddItem('requirement', newRequirement)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newTemplate.requirements?.map((req, idx) => (
                      <Badge key={idx} variant="secondary" className="py-1 px-2">
                        {req}
                        <button 
                          onClick={() => handleRemoveItem('requirements', idx)}
                          className="ml-2 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Responsibilities */}
                <div className="space-y-2">
                  <Label>Vazifalar</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newResponsibility}
                      onChange={(e) => setNewResponsibility(e.target.value)}
                      placeholder="Yangi vazifa qo'shish..."
                      onKeyPress={(e) => e.key === 'Enter' && handleAddItem('responsibility', newResponsibility)}
                    />
                    <Button type="button" onClick={() => handleAddItem('responsibility', newResponsibility)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newTemplate.responsibilities?.map((resp, idx) => (
                      <Badge key={idx} variant="secondary" className="py-1 px-2">
                        {resp}
                        <button 
                          onClick={() => handleRemoveItem('responsibilities', idx)}
                          className="ml-2 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <Label>Ko'nikmalar</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Yangi ko'nikma qo'shish..."
                      onKeyPress={(e) => e.key === 'Enter' && handleAddItem('skill', newSkill)}
                    />
                    <Button type="button" onClick={() => handleAddItem('skill', newSkill)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newTemplate.skills?.map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="py-1 px-2">
                        {skill}
                        <button 
                          onClick={() => handleRemoveItem('skills', idx)}
                          className="ml-2 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-2">
                  <Label>Imtiyozlar</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newBenefit}
                      onChange={(e) => setNewBenefit(e.target.value)}
                      placeholder="Yangi imtiyoz qo'shish..."
                      onKeyPress={(e) => e.key === 'Enter' && handleAddItem('benefit', newBenefit)}
                    />
                    <Button type="button" onClick={() => handleAddItem('benefit', newBenefit)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newTemplate.benefits?.map((benefit, idx) => (
                      <Badge key={idx} className="bg-green-100 text-green-800 py-1 px-2">
                        {benefit}
                        <button 
                          onClick={() => handleRemoveItem('benefits', idx)}
                          className="ml-2 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Options */}
                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={newTemplate.isActive}
                      onCheckedChange={(checked) => setNewTemplate(prev => ({ ...prev, isActive: checked }))}
                    />
                    <Label htmlFor="isActive">Faol</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPremium"
                      checked={newTemplate.isPremium}
                      onCheckedChange={(checked) => setNewTemplate(prev => ({ ...prev, isPremium: checked }))}
                    />
                    <Label htmlFor="isPremium">Premium shablon</Label>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewTemplate(false)}>
                  Bekor qilish
                </Button>
                <Button onClick={handleSaveTemplate}>
                  <Save className="h-4 w-4 mr-2" />
                  Saqlash
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Shablon kategoriyalari</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yangi kategoriya
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{category.icon}</span>
                    <Badge className={category.color}>{category.count} ta</Badge>
                  </div>
                  <h4 className="font-medium">{language === 'uz' ? category.nameUz : category.name}</h4>
                  <div className="flex gap-2 mt-3">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shablon sozlamalari</CardTitle>
              <CardDescription>Shablon tizimi uchun umumiy sozlamalar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Avtomatik shablon taklifi</h4>
                  <p className="text-sm text-gray-500">E'lon yaratishda tegishli shablonlarni taklif qilish</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Premium shablonlar</h4>
                  <p className="text-sm text-gray-500">Premium shablonlarni faqat pullik foydalanuvchilarga ko'rsatish</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Statistika to'plash</h4>
                  <p className="text-sm text-gray-500">Shablon ishlatilish statistikasini to'plash</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">AI tavsiyalar</h4>
                  <p className="text-sm text-gray-500">AI yordamida shablon matnini yaxshilash</p>
                </div>
                <Switch />
              </div>

              <div className="space-y-2">
                <Label>Default maosh valyutasi</Label>
                <Select defaultValue="UZS">
                  <SelectTrigger className="w-[200px]" aria-label="Valyuta tanlash">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UZS">UZS - O'zbek so'mi</SelectItem>
                    <SelectItem value="USD">USD - AQSh dollari</SelectItem>
                    <SelectItem value="EUR">EUR - Yevro</SelectItem>
                    <SelectItem value="RUB">RUB - Rossiya rubli</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Saqlash
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Import/Export</CardTitle>
              <CardDescription>Shablonlarni import yoki export qilish</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Barcha shablonlarni export qilish (JSON)
                </Button>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Shablonlarni import qilish
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JobTemplates;
