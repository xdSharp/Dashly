import { useState } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { useLocale } from "@/hooks/use-locale.tsx";
import { Menu, Sun, Moon, Globe, Bell, LogOut } from "lucide-react";
import { Notifications } from "@/components/notifications";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useBusiness } from "@/hooks/use-business";
import { BusinessSwitcher } from "./business/business-switcher";
import { NotificationsPopover } from "./notifications-popover";
import { UserMenu } from "./user-menu";
import { Logo } from "./logo";

// Language Toggle Component
function LanguageToggle() {
  const { locale, toggleLocale, t } = useLocale();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label={t("language")}
        >
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={toggleLocale} className="cursor-pointer">
          <span className={locale === "en" ? "font-bold" : ""}>English</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={toggleLocale} className="cursor-pointer">
          <span className={locale === "ru" ? "font-bold" : ""}>Русский</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Theme Toggle Component
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLocale();
  
  return (
    <Button 
      variant="ghost" 
      size="icon"
      onClick={toggleTheme}
      className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label={t("theme")}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
  isMenuOpen: boolean;
}

export function Header({ onMenuClick, title, isMenuOpen }: HeaderProps) {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { locale, toggleLocale, t } = useLocale();
  const { user, logoutMutation } = useAuth();
  const { currentBusiness } = useBusiness();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Проверяем, является ли пользователь администратором
  const isAdmin = user?.role === 'admin';
  
  // Page titles
  const pageTitle = title || getPageTitle(location, t);

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <header className={cn(
      "sticky top-0 z-40 w-full",
      "bg-white/5 dark:bg-gray-900/5 backdrop-blur-lg shadow-sm"
    )}>
      <div className="px-2 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-2 md:mr-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onMenuClick}
            className={cn(
              "md:hidden",
              "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
            aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="md:hidden">
            <Logo size="small" />
          </div>

          {/* Show title on mobile - Optional */}
          {!isAdmin && (
            <h1 className="text-lg font-semibold md:hidden truncate text-gray-900 dark:text-white">
              {title || (currentBusiness?.name || "")}
            </h1>
          )}
        </div>

        {/* Middle section for desktop */}
        <div className="hidden md:flex items-center flex-1 gap-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isAdmin ? title || t("dashboard") : (title || currentBusiness?.name || t("dashboard"))}
          </h1>
          
          {currentBusiness && !title && !isAdmin && (
            <div className="flex items-center">
              <span className={cn(
                "px-2 py-0.5 text-xs rounded-full",
                "bg-primary/10 text-primary"
              )}>
                {currentBusiness.industry || t("business")}
              </span>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1 mr-2">
          {/* Business Switcher - показываем только для не-админов */}
          {!isAdmin && (
            <div className="hidden md:flex">
              <BusinessSwitcher />
            </div>
          )}

          <NotificationsPopover>
            <Button 
              variant="ghost" 
              size="icon"
              className={cn(
                "text-gray-600 dark:text-gray-300",
                "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              aria-label={t("notifications.title")}
            >
              <Bell className="h-5 w-5" />
            </Button>
          </NotificationsPopover>

          <div className="hidden md:flex">
            <LanguageToggle />
          </div>

          <div className="hidden md:flex">
            <ThemeToggle />
          </div>

          <UserMenu />
        </div>
      </div>
    </header>
  );
}

// Helper function to get page title from URL
function getPageTitle(path: string, t: (key: string) => string): string {
  switch (path) {
    case '/': return t('pages.home');
    case '/dashboard': return t('pages.dashboard');
    case '/upload': return t('pages.upload');
    case '/sales': return t('pages.sales');
    case '/products': return t('pages.products');
    case '/categories': return t('pages.categories');
    case '/profile': return t('pages.profile');
    case '/users': return t('pages.users');
    default: return t('pages.notFound');
  }
}
