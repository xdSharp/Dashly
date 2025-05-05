import { useState } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { useLocale } from "@/hooks/use-locale.tsx";
import { Menu, Sun, Moon, Globe, Bell } from "lucide-react";
import { Notifications } from "@/components/notifications";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export function Header({ onMenuClick, title }: HeaderProps) {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { locale, toggleLocale, t } = useLocale();
  const { user } = useAuth();
  
  // Page titles
  const pageTitle = title || getPageTitle(location, t);
  
  return (
    <header className="z-10 py-4 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        {/* Page title */}
        <div className="flex-1 flex items-center justify-between md:justify-start">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white ml-3 md:ml-0">
            {pageTitle}
          </h1>
        </div>
        
        {/* Header actions */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <Notifications />
          {/* Language Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Change language"
              >
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toggleLocale()}>
                {locale === 'en' ? 'Русский' : 'English'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          
          
          
          {/* Profile icon */}
          {user && (
            <Avatar className="h-8 w-8">
              <AvatarImage src="/avatar.png" alt={user.name} />
              <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          )}
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
