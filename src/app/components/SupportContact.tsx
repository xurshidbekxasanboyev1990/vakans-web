import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Phone, Send, Users, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';

export function SupportContact() {
  return (
    <Card className="w-full border-2 border-border shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-primary" />
          Admin bilan bog'lanish
        </CardTitle>
        <CardDescription>
          Yordam kerakmi? Biz bilan bog'laning
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Phone */}
        <a 
          href="tel:+998996983806"
          className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-border group"
        >
          <div className="flex-shrink-0 w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
            <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground">Telefon raqam</p>
            <p className="text-lg font-semibold text-foreground">+998 99 698 38 06</p>
          </div>
        </a>

        {/* Telegram Admin */}
        <a 
          href="https://t.me/Sys_adms"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-border group"
        >
          <div className="flex-shrink-0 w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
            <Send className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground">Telegram Admin</p>
            <p className="text-lg font-semibold text-foreground">@Sys_adms</p>
          </div>
        </a>

        {/* Telegram Channel */}
        <a 
          href="https://t.me/Sys_masters"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-border group"
        >
          <div className="flex-shrink-0 w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
            <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground">Yangiliklar kanali</p>
            <p className="text-lg font-semibold text-foreground">@Sys_masters</p>
          </div>
        </a>

        {/* Info */}
        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm text-muted-foreground text-center">
            💬 Savol yoki takliflaringiz bo'lsa, bemalol murojaat qiling!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
