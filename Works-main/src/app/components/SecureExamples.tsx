import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../lib/api';
import { sanitizeInput } from '../../lib/sanitize';
import { jobSchema } from '../../lib/validation';
import { toast } from 'sonner';

/**
 * Example component demonstrating secure usage of the new authentication
 * and API system with XSS protection and validation
 */
export function SecureJobPostExample() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    salary: '',
    location: '',
    category: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      toast.error('Iltimos, tizimga kiring');
      return;
    }

    if (user?.userType !== 'employer') {
      toast.error('Faqat ish beruvchilar e\'lon qo\'ya oladi');
      return;
    }

    setLoading(true);

    try {
      // Client-side validation with Zod
      const validationResult = jobSchema.safeParse({
        title: formData.title,
        description: formData.description,
        salary: formData.salary ? Number(formData.salary) : undefined,
        location: formData.location,
        category: formData.category,
        employerId: user.id,
      });

      if (!validationResult.success) {
        toast.error(validationResult.error.issues[0].message);
        return;
      }

      // Data is automatically sanitized in apiService.postJob()
      const response = await apiService.postJob({
        title: formData.title,
        description: formData.description,
        salary: formData.salary ? Number(formData.salary) : undefined,
        location: formData.location,
        category: formData.category,
      });

      if (response.success) {
        toast.success('Ish e\'loni muvaffaqiyatli yaratildi!');
        // Reset form
        setFormData({
          title: '',
          description: '',
          salary: '',
          location: '',
          category: '',
        });
      } else {
        toast.error(response.error || 'Xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Job post error:', error);
      toast.error('Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Sanitize input on change to prevent XSS
    const sanitizedValue = sanitizeInput(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue,
    }));
  };

  if (!isAuthenticated()) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">
          Ish e'lon qilish uchun tizimga kirish kerak
        </p>
      </div>
    );
  }

  if (user?.userType !== 'employer') {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">
          Faqat ish beruvchilar e'lon qo'ya oladi
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Yangi Ish E'loni</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Ish nomi *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            minLength={5}
            maxLength={100}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Masalan: Frontend Developer"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Tavsif *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            minLength={20}
            maxLength={2000}
            rows={5}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Ish haqida batafsil ma'lumot..."
          />
        </div>

        <div>
          <label htmlFor="salary" className="block text-sm font-medium mb-1">
            Maosh (UZS)
          </label>
          <input
            type="number"
            id="salary"
            name="salary"
            value={formData.salary}
            onChange={handleInputChange}
            min={0}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="5000000"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-1">
            Joylashuv *
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Toshkent, O'zbekiston"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            Kategoriya *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tanlang</option>
            <option value="IT">IT va Dasturlash</option>
            <option value="Design">Dizayn</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Savdo</option>
            <option value="Construction">Qurilish</option>
            <option value="Education">Ta'lim</option>
            <option value="Healthcare">Sog'liqni saqlash</option>
            <option value="Other">Boshqa</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Yuklanmoqda...' : 'E\'lon Qo\'shish'}
        </button>
      </form>

      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-semibold text-green-800 mb-2">🔒 Xavfsizlik</h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>✅ Barcha ma'lumotlar XSS'dan himoyalangan</li>
          <li>✅ Zod yordamida validatsiya qilinadi</li>
          <li>✅ JWT token avtomatik yangilanadi</li>
          <li>✅ Rate limiting yoqilgan</li>
          <li>✅ HTTPS orqali yuboriladi</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Example of secure data fetching with automatic token refresh
 */
export function SecureJobsListExample() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await apiService.getJobs();
      
      if (response.success && response.data?.jobs) {
        setJobs(response.data.jobs);
      } else {
        toast.error(response.error || 'Ishlarni yuklashda xatolik');
      }
    } catch (error) {
      console.error('Fetch jobs error:', error);
      toast.error('Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useState(() => {
    fetchJobs();
  });

  if (loading) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Barcha Ishlar</h2>
      
      {jobs.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          Hech qanday ish e'loni topilmadi
        </p>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-6 border rounded-lg hover:shadow-md transition"
            >
              <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
              <p className="text-gray-600 mb-2">{job.description}</p>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>📍 {job.location}</span>
                {job.salary && <span>💰 {job.salary.toLocaleString()} UZS</span>}
                <span>🏷️ {job.category}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
