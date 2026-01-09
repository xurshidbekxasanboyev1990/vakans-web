import { MessageCircle } from 'lucide-react';
import { Button } from './ui/button';

interface ChatButtonProps {
  jobId: string;
  employerName: string;
  employerPhone: string;
  onOpenChat: (jobId: string, employerName: string, employerPhone: string) => void;
}

export function ChatButton({ jobId, employerName, employerPhone, onOpenChat }: ChatButtonProps) {
  return (
    <Button
      onClick={() => onOpenChat(jobId, employerName, employerPhone)}
      className="w-full h-10"
      size="sm"
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      Xabar yuborish
    </Button>
  );
}
