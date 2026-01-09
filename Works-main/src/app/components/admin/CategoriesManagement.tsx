import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  FolderPlus, Edit, Trash2, GripVertical, Check, X, 
  Briefcase, Wrench, Code, Truck, UtensilsCrossed, Stethoscope,
  GraduationCap, Palette, ShoppingBag, Building, Phone, Settings
} from 'lucide-react';
import type { JobCategory } from '../../../lib/types';

interface CategoriesManagementProps {
  categories?: JobCategory[];
  onAddCategory?: (category: Omit<JobCategory, 'id' | 'createdAt'>) => void;
  onUpdateCategory?: (id: string, updates: Partial<JobCategory>) => void;
  onDeleteCategory?: (id: string) => void;
  onReorderCategories?: (categories: JobCategory[]) => void;
}

const iconOptions = [
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Wrench', icon: Wrench },
  { name: 'Code', icon: Code },
  { name: 'Truck', icon: Truck },
  { name: 'UtensilsCrossed', icon: UtensilsCrossed },
  { name: 'Stethoscope', icon: Stethoscope },
  { name: 'GraduationCap', icon: GraduationCap },
  { name: 'Palette', icon: Palette },
  { name: 'ShoppingBag', icon: ShoppingBag },
  { name: 'Building', icon: Building },
  { name: 'Phone', icon: Phone },
  { name: 'Settings', icon: Settings },
];

const defaultCategories: JobCategory[] = [
  { id: '1', name: 'Qurilish', icon: 'Wrench', description: 'Qurilish ishlari', jobCount: 45, isActive: true, order: 1, createdAt: new Date().toISOString() },
  { id: '2', name: 'IT/Dasturlash', icon: 'Code', description: 'Dasturchilar va IT mutaxassislari', jobCount: 32, isActive: true, order: 2, createdAt: new Date().toISOString() },
  { id: '3', name: 'Yetkazib berish', icon: 'Truck', description: 'Kuryer va haydovchi ishlari', jobCount: 28, isActive: true, order: 3, createdAt: new Date().toISOString() },
  { id: '4', name: 'Oshpazlik', icon: 'UtensilsCrossed', description: 'Restoran va katering', jobCount: 19, isActive: true, order: 4, createdAt: new Date().toISOString() },
  { id: '5', name: 'Tibbiyot', icon: 'Stethoscope', description: 'Tibbiyot xodimlari', jobCount: 15, isActive: true, order: 5, createdAt: new Date().toISOString() },
  { id: '6', name: 'Ta\'lim', icon: 'GraduationCap', description: 'O\'qituvchi va repetitor', jobCount: 22, isActive: true, order: 6, createdAt: new Date().toISOString() },
  { id: '7', name: 'Dizayn', icon: 'Palette', description: 'Grafik va web dizayn', jobCount: 12, isActive: true, order: 7, createdAt: new Date().toISOString() },
  { id: '8', name: 'Savdo', icon: 'ShoppingBag', description: 'Sotuvchi va menedjer', jobCount: 38, isActive: true, order: 8, createdAt: new Date().toISOString() },
];

export function CategoriesManagement({
  categories: propCategories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}: CategoriesManagementProps) {
  const [categories, setCategories] = useState<JobCategory[]>(propCategories || defaultCategories);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<JobCategory | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    icon: 'Briefcase',
    description: '',
    isActive: true
  });

  const getIcon = (iconName?: string) => {
    const iconOption = iconOptions.find(opt => opt.name === iconName);
    const IconComponent = iconOption?.icon || Briefcase;
    return <IconComponent className="w-5 h-5" />;
  };

  const openAddModal = () => {
    setIsAdding(true);
    setFormData({ name: '', icon: 'Briefcase', description: '', isActive: true });
    setEditModalOpen(true);
  };

  const openEditModal = (category: JobCategory) => {
    setIsAdding(false);
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon || 'Briefcase',
      description: category.description || '',
      isActive: category.isActive
    });
    setEditModalOpen(true);
  };

  const openDeleteModal = (category: JobCategory) => {
    setSelectedCategory(category);
    setDeleteModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;

    if (isAdding) {
      const newCategory: JobCategory = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        icon: formData.icon,
        description: formData.description.trim(),
        isActive: formData.isActive,
        order: categories.length + 1,
        jobCount: 0,
        createdAt: new Date().toISOString()
      };
      setCategories([...categories, newCategory]);
      onAddCategory?.(newCategory);
    } else if (selectedCategory) {
      const updated = categories.map(c => 
        c.id === selectedCategory.id 
          ? { ...c, ...formData }
          : c
      );
      setCategories(updated);
      onUpdateCategory?.(selectedCategory.id, formData);
    }
    setEditModalOpen(false);
  };

  const handleDelete = () => {
    if (selectedCategory) {
      setCategories(categories.filter(c => c.id !== selectedCategory.id));
      onDeleteCategory?.(selectedCategory.id);
      setDeleteModalOpen(false);
    }
  };

  const toggleActive = (category: JobCategory) => {
    const updated = categories.map(c =>
      c.id === category.id ? { ...c, isActive: !c.isActive } : c
    );
    setCategories(updated);
    onUpdateCategory?.(category.id, { isActive: !category.isActive });
  };

  const activeCount = categories.filter(c => c.isActive).length;
  const totalJobs = categories.reduce((sum, c) => sum + (c.jobCount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Kategoriyalar boshqaruvi</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activeCount} ta faol kategoriya / {totalJobs} ta ish
          </p>
        </div>
        <Button onClick={openAddModal}>
          <FolderPlus className="w-4 h-4 mr-2" />
          Yangi kategoriya
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-sm text-muted-foreground">Jami kategoriyalar</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
            <p className="text-sm text-muted-foreground">Faol</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">{categories.length - activeCount}</div>
            <p className="text-sm text-muted-foreground">Nofaol</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{totalJobs}</div>
            <p className="text-sm text-muted-foreground">Jami ishlar</p>
          </CardContent>
        </Card>
      </div>

      {/* Categories list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Kategoriyalar ro'yxati</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories.map(category => (
              <div
                key={category.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  category.isActive 
                    ? 'bg-background hover:bg-muted/50' 
                    : 'bg-muted/30 opacity-60'
                }`}
              >
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  category.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  {getIcon(category.icon)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{category.name}</span>
                    {!category.isActive && (
                      <Badge variant="secondary">Nofaol</Badge>
                    )}
                  </div>
                  {category.description && (
                    <p className="text-sm text-muted-foreground truncate">{category.description}</p>
                  )}
                </div>
                
                <Badge variant="outline">{category.jobCount || 0} ta ish</Badge>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleActive(category)}
                    title={category.isActive ? 'O\'chirish' : 'Yoqish'}
                  >
                    {category.isActive ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEditModal(category)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => openDeleteModal(category)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit/Add Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isAdding ? 'Yangi kategoriya qo\'shish' : 'Kategoriyani tahrirlash'}
            </DialogTitle>
            <DialogDescription>
              Kategoriya ma'lumotlarini kiriting
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nomi *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masalan: Qurilish"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Ikonka</Label>
              <div className="grid grid-cols-6 gap-2">
                {iconOptions.map(opt => {
                  const IconComp = opt.icon;
                  return (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: opt.name })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.icon === opt.name
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-transparent bg-muted hover:bg-muted/80'
                      }`}
                      title={opt.name}
                    >
                      <IconComp className="w-5 h-5 mx-auto" />
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Tavsif</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Kategoriya haqida qisqacha ma'lumot"
                rows={2}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isActive">Faol holati</Label>
                <p className="text-xs text-muted-foreground">Kategoriya ko'rinadi</p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Bekor
            </Button>
            <Button onClick={handleSave} disabled={!formData.name.trim()}>
              {isAdding ? 'Qo\'shish' : 'Saqlash'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Kategoriyani o'chirish</DialogTitle>
            <DialogDescription>
              <strong>{selectedCategory?.name}</strong> kategoriyasini o'chirishni xohlaysizmi?
              {(selectedCategory?.jobCount || 0) > 0 && (
                <span className="block mt-2 text-orange-600">
                  ⚠️ Bu kategoriyada {selectedCategory?.jobCount} ta ish mavjud!
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Bekor
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              O'chirish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
