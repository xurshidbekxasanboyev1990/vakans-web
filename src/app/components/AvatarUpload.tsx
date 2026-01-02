import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Upload, Camera, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AvatarUploadProps {
  currentAvatar?: string;
  userName: string;
  onUpload: (file: File) => Promise<string>;
  onDelete?: () => Promise<void>;
  isLoading?: boolean;
}

export function AvatarUpload({ 
  currentAvatar, 
  userName, 
  onUpload, 
  onDelete,
  isLoading = false 
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Faqat rasm yuklash mumkin');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Rasm hajmi 5MB dan kichik bo\'lishi kerak');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const avatarUrl = await onUpload(file);
      toast.success('Profil rasmi yuklandi!');
      setPreview(avatarUrl);
    } catch (error) {
      toast.error('Yuklashda xato: ' + (error as Error).message);
      setPreview(currentAvatar || null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setUploading(true);
    try {
      await onDelete();
      setPreview(null);
      toast.success('Profil rasmi o\'chirildi');
    } catch (error) {
      toast.error('O\'chirishda xato: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Profil rasmi
        </CardTitle>
        <CardDescription>
          Profilingizga rasm qo'shing (maksimal 5MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {/* Avatar Display */}
        <Avatar className="w-32 h-32">
          <AvatarImage src={preview || undefined} alt={userName} />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || isLoading}
            className="gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Yuklanmoqda...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                {preview ? 'Rasmni almashtirish' : 'Rasm yuklash'}
              </>
            )}
          </Button>

          {preview && onDelete && (
            <Button
              variant="destructive"
              size="icon"
              onClick={handleDelete}
              disabled={uploading || isLoading}
              title="Rasmni o'chirish"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Guidelines */}
        <div className="text-xs text-muted-foreground text-center">
          <p>Tavsiya: 400x400 piksel, JPG yoki PNG format</p>
          <p>Maksimal hajm: 5MB</p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Inline Avatar Uploader - smaller version
 */
interface InlineAvatarUploadProps {
  currentAvatar?: string;
  userName: string;
  onUpload: (file: File) => Promise<string>;
  size?: 'sm' | 'md' | 'lg';
}

export function InlineAvatarUpload({ 
  currentAvatar, 
  userName, 
  onUpload,
  size = 'md'
}: InlineAvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32'
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Faqat rasm yuklash mumkin');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Rasm hajmi 5MB dan kichik bo\'lishi kerak');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const avatarUrl = await onUpload(file);
      setPreview(avatarUrl);
      toast.success('Rasm yuklandi!');
    } catch (error) {
      toast.error('Xato yuz berdi');
      setPreview(currentAvatar || null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative inline-block group">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={preview || undefined} alt={userName} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      {/* Upload Overlay */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
      >
        {uploading ? (
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        ) : (
          <Camera className="w-6 h-6 text-white" />
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
