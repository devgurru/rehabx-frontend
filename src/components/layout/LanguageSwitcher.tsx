import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const isEn = i18n.language.startsWith('en');
  const isAr = i18n.language.startsWith('ar');

  return (
    <DropdownMenu dir={i18n.dir()} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-full bg-muted/40 hover:bg-muted text-muted-foreground hover:text-primary transition-all duration-300 focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <Globe className="h-[18px] w-[18px]" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px] p-2 rounded-xl shadow-lg border-muted/50">
        <DropdownMenuItem 
          onClick={() => handleLanguageChange('en')}
          className={cn(
            "flex items-center justify-between rounded-lg px-3 py-2.5 cursor-pointer transition-all duration-200",
            isEn ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <span>English</span>
          {isEn && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleLanguageChange('ar')}
          className={cn(
            "flex items-center justify-between rounded-lg px-3 py-2.5 cursor-pointer transition-all duration-200 mt-1",
            isAr ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <span className="text-base leading-none mt-0.5">العربية</span>
          {isAr && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
