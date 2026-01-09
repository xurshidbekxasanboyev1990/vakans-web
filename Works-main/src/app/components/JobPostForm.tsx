import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Upload } from 'lucide-react';
import { JOB_CATEGORIES } from '../../lib/constants';

export type JobStatus = 'active' | 'paused' | 'completed' | 'cancelled';
export type DurationType = '1-day' | 'few-days' | 'week' | 'month' | 'ongoing';

export type PaymentType = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'negotiable';

export type GenderPreference = 'male' | 'female' | 'both';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface JobData {
  id: string;
  employerName: string;
  employerRegion: string;
  employerPhone?: string;
  employerTelegram?: string; // Ixtiyoriy Telegram
  title: string;
  description: string;
  category?: string; // Ish kategoriyasi
  startDate: string;
  endDate?: string;
  durationType: DurationType;
  status: JobStatus;
  approvalStatus: ApprovalStatus; // Admin tasdiqlash holati
  rejectionReason?: string; // Rad etish sababi
  imageUrl?: string;
  salary?: number; // Aniq narx
  paymentType?: PaymentType; // To'lov turi
  genderPreference?: GenderPreference; // Jins filtri
  featured?: boolean; // Admin tomonidan reklama qilingan
  isUrgent?: boolean; // Tezkor e'lon
  paymentStatus?: 'free' | 'pending' | 'paid'; // To'lov holati
  createdAt: string;
  // Stats
  viewsCount?: number;
  likesCount?: number;
  dislikesCount?: number;
  applicationsCount?: number;
  // Legacy support
  startTime?: string;
  deadline?: string;
  price?: string;
  salaryNegotiable?: boolean;
}

interface JobPostFormProps {
  employerName: string;
  employerRegion: string;
  onPostJob: (job: Omit<JobData, 'id' | 'employerName' | 'employerRegion' | 'createdAt' | 'status' | 'employerPhone' | 'approvalStatus'>) => void;
}

export function JobPostForm({ employerName, employerRegion, onPostJob }: JobPostFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [durationType, setDurationType] = useState<DurationType>('few-days');
  const [imageUrl, setImageUrl] = useState('');
  const [salary, setSalary] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('negotiable');
  const [telegram, setTelegram] = useState('');
  const [genderPreference, setGenderPreference] = useState<GenderPreference>('both');

  const durationTypeLabels: Record<DurationType, string> = {
    '1-day': '1 kun',
    'few-days': 'Bir necha kun',
    'week': '1 hafta',
    'month': '1 oy',
    'ongoing': 'Doimiy',
  };

  const paymentTypeLabels: Record<PaymentType, string> = {
    'hourly': 'Soatiga',
    'daily': 'Kuniga',
    'weekly': 'Haftasiga',
    'monthly': 'Oyiga',
    'negotiable': 'Suhbatda kelishamiz',
  };

  const genderPreferenceLabels: Record<GenderPreference, string> = {
    'male': 'Erkaklar uchun',
    'female': 'Ayollar uchun',
    'both': 'Erkak / Ayol (Ikkala jinsi ham)',
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !startDate) {
      // Validation failed - show toast instead of console
      return;
    }
    
    if (title && description && startDate) {
      onPostJob({
        title,
        description,
        category: category || undefined,
        startDate,
        endDate: endDate || undefined,
        durationType,
        imageUrl: imageUrl || undefined,
        salary: salary && paymentType !== 'negotiable' ? parseFloat(salary) : undefined,
        paymentType: paymentType,
        genderPreference: genderPreference,
        employerTelegram: telegram || undefined,
      });
      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      setStartDate('');
      setEndDate('');
      setDurationType('few-days');
      setImageUrl('');
      setSalary('');
      setPaymentType('negotiable');
      setTelegram('');
      setGenderPreference('both');
    }
  };

  return (
    <Card className="border border-border bg-white dark:bg-slate-900 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl">Ish ma'lumotlari</CardTitle>
        <CardDescription className="text-xs sm:text-sm">To'liq ma'lumot kiriting</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Ish turi</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: Idish yuvish, Bog' yig'ish, Uy ta'mirlash"
              required
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategoriya</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Kategoriyani tanlang" />
              </SelectTrigger>
              <SelectContent>
                {JOB_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Rasm (ixtiyoriy)</Label>
            <div className="space-y-3">
              {imageUrl ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full w-7 h-7 flex items-center justify-center hover:bg-destructive/90 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label htmlFor="image" className="block">
                  <div className="w-full h-32 bg-muted border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-secondary transition-colors">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Rasm yuklash</p>
                  </div>
                </label>
              )}
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Batafsil ma'lumot</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ish haqida to'liq ma'lumot bering. Masalan: kuniga necha soat, qayerda, qanday shart-sharoitlar"
              rows={4}
              required
              className="resize-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Boshlanish sanasi</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="durationType">Ish davomiyligi</Label>
              <Select value={durationType} onValueChange={(v) => setDurationType(v as DurationType)}>
                <SelectTrigger id="durationType" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(durationTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Tugash sanasi (agar kerak bo'lsa)</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              Ixtiyoriy
            </p>
          </div>

          {/* To'lov bo'limi */}
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
            <div className="space-y-2">
              <Label htmlFor="paymentType">To'lov turi</Label>
              <Select value={paymentType} onValueChange={(v) => setPaymentType(v as PaymentType)}>
                <SelectTrigger id="paymentType" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(paymentTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {paymentType !== 'negotiable' && (
              <div className="space-y-2">
                <Label htmlFor="salary">Miqdor (so'm)</Label>
                <Input
                  id="salary"
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="Masalan: 50000"
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">
                  {paymentType === 'hourly' && '💡 Soatiga qancha to\'lanadi'}
                  {paymentType === 'daily' && '💡 Kuniga qancha to\'lanadi'}
                  {paymentType === 'weekly' && '💡 Haftasiga qancha to\'lanadi'}
                  {paymentType === 'monthly' && '💡 Oyiga qancha to\'lanadi'}
                </p>
              </div>
            )}

            {paymentType === 'negotiable' && (
              <p className="text-sm text-muted-foreground">
                ✅ To'lov suhbat jarayonida kelishiladi
              </p>
            )}
          </div>

          {/* Bog'lanish bo'limi */}
          <div className="space-y-2">
            <Label htmlFor="telegram">Telegram manzil (ixtiyoriy)</Label>
            <Input
              id="telegram"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              placeholder="Masalan: @username"
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              Telefon raqam avtomatik qo'shiladi. Telegram ixtiyoriy.
            </p>
          </div>

          {/* Jins filtri */}
          <div className="space-y-2">
            <Label htmlFor="gender">Kimlar uchun ish?</Label>
            <Select value={genderPreference} onValueChange={(v) => setGenderPreference(v as GenderPreference)}>
              <SelectTrigger id="gender" className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">
                  <span className="flex items-center gap-2">
                    👥 {genderPreferenceLabels['both']}
                  </span>
                </SelectItem>
                <SelectItem value="male">
                  <span className="flex items-center gap-2">
                    👨 {genderPreferenceLabels['male']}
                  </span>
                </SelectItem>
                <SelectItem value="female">
                  <span className="flex items-center gap-2">
                    👩 {genderPreferenceLabels['female']}
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              💡 Qaysi jins vakillari uchun ish mavjud
            </p>
          </div>

          <Button type="submit" className="w-full h-10 mt-6">
            E'lon qilish
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}