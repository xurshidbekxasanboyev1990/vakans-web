import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';

interface ApplicationModalProps {
  jobTitle: string;
  employerName: string;
  onSubmit: (message: string) => void;
  onClose: () => void;
}

export function ApplicationModal({ jobTitle, employerName, onSubmit, onClose }: ApplicationModalProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSubmit(message);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <Card className="w-full sm:max-w-md bg-card rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-auto">
        <CardHeader className="pb-4 sticky top-0 bg-card z-10 border-b border-border sm:border-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg sm:text-xl">Ariza yuborish</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full w-10 h-10 p-0">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 p-3 bg-muted rounded-xl">
              <p className="text-sm text-muted-foreground">Ish:</p>
              <p className="font-medium text-sm sm:text-base line-clamp-2">{jobTitle}</p>
              <p className="text-sm text-muted-foreground">Ish beruvchi:</p>
              <p className="font-medium text-sm sm:text-base">{employerName}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Arizangiz</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="O'zingiz haqingizda yozing. Tajribangiz, ko'nikmalaringiz, nima uchun siz bu ishga mos ekanligingizni tushuntiring..."
                rows={5}
                required
                className="resize-none text-base min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">
                Yaxshi ariza sizning imkoniyatingizni oshiradi
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11 rounded-xl">
                Bekor qilish
              </Button>
              <Button type="submit" className="flex-1 h-11 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600" disabled={!message.trim()}>
                <Send className="w-4 h-4 mr-2" />
                Yuborish
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
