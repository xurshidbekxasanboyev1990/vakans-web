import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { FileText, Copy, Eye, Briefcase, Wrench, Code, Truck, UtensilsCrossed, Palette, ShoppingBag } from 'lucide-react';
import type { JobTemplate } from '../../lib/types';

interface JobTemplatesProps {
  onSelectTemplate: (template: JobTemplate) => void;
}

const defaultTemplates: JobTemplate[] = [
  {
    id: '1',
    name: 'Qurilish ishchisi',
    title: 'Qurilish ishchisi kerak',
    description: 'Yangi qurilish obyektida ishlash uchun tajribali qurilish ishchisi kerak. Ish vaqti 8:00-17:00. Ish haqi kunlik to\'lanadi.',
    category: 'Qurilish',
    requirements: ['Qurilish tajribasi', 'Jismoniy sog\'lom', 'Mas\'uliyatli'],
    salaryMin: 150000,
    salaryMax: 300000,
    salaryType: 'daily',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Dasturchi',
    title: 'Frontend dasturchi',
    description: 'Web sayt va mobil ilovalar yaratish uchun tajribali frontend dasturchi kerak. Remote ishlash imkoniyati mavjud.',
    category: 'IT/Dasturlash',
    requirements: ['React/Vue bilish', 'JavaScript/TypeScript', '2+ yil tajriba', 'Git bilish'],
    salaryMin: 5000000,
    salaryMax: 15000000,
    salaryType: 'monthly',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Yetkazib beruvchi',
    title: 'Kuryer (yetkazib beruvchi)',
    description: 'Shahar bo\'ylab buyurtmalarni yetkazib berish uchun kuryer kerak. O\'z transporti bo\'lsa afzal.',
    category: 'Yetkazib berish',
    requirements: ['Haydovchilik guvohnomasi', 'Shaharni yaxshi bilish', 'Kommunikabel'],
    salaryMin: 200000,
    salaryMax: 400000,
    salaryType: 'daily',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Oshpaz',
    title: 'Tajribali oshpaz kerak',
    description: 'Restoranda ishlash uchun milliy va yevropa oshxonasi bo\'yicha tajribali oshpaz kerak.',
    category: 'Oshpazlik',
    requirements: ['Oshpazlik tajribasi 3+ yil', 'Sanitariya qoidalarini bilish', 'Milliy taomlar'],
    salaryMin: 4000000,
    salaryMax: 8000000,
    salaryType: 'monthly',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Dizayner',
    title: 'Grafik dizayner',
    description: 'Reklama va brendlash ishlari uchun kreativ grafik dizayner kerak. Adobe dasturlarini bilishi shart.',
    category: 'Dizayn',
    requirements: ['Adobe Photoshop/Illustrator', 'Portfolio', 'Kreativlik'],
    salaryMin: 3000000,
    salaryMax: 7000000,
    salaryType: 'monthly',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Sotuvchi',
    title: 'Sotuvchi-konsultant',
    description: 'Do\'konda mijozlarga xizmat ko\'rsatish va mahsulotlarni sotish uchun sotuvchi kerak.',
    category: 'Savdo',
    requirements: ['Kommunikabel', 'Savdo tajribasi', 'Kompyuter bilishi'],
    salaryMin: 2500000,
    salaryMax: 5000000,
    salaryType: 'monthly',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
];

const categoryIcons: Record<string, React.ElementType> = {
  'Qurilish': Wrench,
  'IT/Dasturlash': Code,
  'Yetkazib berish': Truck,
  'Oshpazlik': UtensilsCrossed,
  'Dizayn': Palette,
  'Savdo': ShoppingBag,
};

export function JobTemplates({ onSelectTemplate }: JobTemplatesProps) {
  const [templates] = useState<JobTemplate[]>(defaultTemplates);
  const [previewTemplate, setPreviewTemplate] = useState<JobTemplate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const formatSalary = (min?: number, max?: number, type?: string) => {
    if (!min && !max) return 'Kelishiladi';
    const typeLabel = type === 'daily' ? 'kunlik' : type === 'monthly' ? 'oylik' : '';
    if (min && max) {
      return `${min.toLocaleString()} - ${max.toLocaleString()} so'm/${typeLabel}`;
    }
    return `${(min || max)?.toLocaleString()} so'm/${typeLabel}`;
  };

  const handlePreview = (template: JobTemplate) => {
    setPreviewTemplate(template);
    setPreviewOpen(true);
  };

  const handleSelect = (template: JobTemplate) => {
    onSelectTemplate(template);
    setPreviewOpen(false);
  };

  const getCategoryIcon = (category: string) => {
    const IconComponent = categoryIcons[category] || Briefcase;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Tayyor shablonlar</h3>
        <Badge variant="secondary">{templates.length} ta</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(template => (
          <Card 
            key={template.id} 
            className="hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => handlePreview(template)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  {getCategoryIcon(template.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {template.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">{template.category}</p>
                  <p className="text-sm text-primary mt-1">
                    {formatSalary(template.salaryMin, template.salaryMax, template.salaryType)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreview(template);
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ko'rish
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(template);
                  }}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Tanlash
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewTemplate && getCategoryIcon(previewTemplate.category)}
              {previewTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              Shablon tafsilotlari
            </DialogDescription>
          </DialogHeader>
          
          {previewTemplate && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Sarlavha</h4>
                <p className="text-foreground">{previewTemplate.title}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Tavsif</h4>
                <p className="text-foreground text-sm">{previewTemplate.description}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Kategoriya</h4>
                <Badge variant="secondary">{previewTemplate.category}</Badge>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Ish haqi</h4>
                <p className="text-lg font-semibold text-primary">
                  {formatSalary(previewTemplate.salaryMin, previewTemplate.salaryMax, previewTemplate.salaryType)}
                </p>
              </div>
              
              {previewTemplate.requirements && previewTemplate.requirements.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Talablar</h4>
                  <ul className="space-y-1">
                    {previewTemplate.requirements.map((req, i) => (
                      <li key={i} className="text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Yopish
            </Button>
            <Button onClick={() => previewTemplate && handleSelect(previewTemplate)}>
              <Copy className="w-4 h-4 mr-2" />
              Shablonni tanlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
