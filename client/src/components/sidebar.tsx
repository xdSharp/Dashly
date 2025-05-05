import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { useAuth } from "@/hooks/use-auth";
import { useLocale } from "@/hooks/use-locale.tsx";
import { 
  LayoutDashboard, 
  Upload, 
  LayoutList, 
  PackageOpen, 
  FolderOpen, 
  User, 
  Users, 
  LogOut,
  FileText,
  MessageSquare
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface SidebarProps {
  className?: string;
  isMobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ className, isMobile = false, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { t } = useLocale();

  // Handle navigation item click (closes mobile menu if needed)
  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
    if (isMobile && onClose) {
      onClose();
    }
  };

  // Get the first letter of user's name for avatar fallback
  const getAvatarInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // Navigation items for regular users
  const navItems = [
    { 
      path: '/dashboard', 
      label: t('sidebar.dashboard'), 
      icon: <LayoutDashboard className="h-5 w-5 mr-3" /> 
    },
    { 
      path: '/reports', 
      label: t('pages.reports'), 
      icon: <FileText className="h-5 w-5 mr-3" /> 
    },
    { 
      path: '/feedback', 
      label: t('pages.feedback'), 
      icon: <MessageSquare className="h-5 w-5 mr-3" /> 
    }
  ];

  // Regular user only items (hidden from admin)
  const regularItems = user?.role !== 'admin' ? [
    { 
      path: '/upload', 
      label: t('sidebar.upload'), 
      icon: <Upload className="h-5 w-5 mr-3" /> 
    },
    { 
      path: '/sales', 
      label: t('sidebar.sales'), 
      icon: <LayoutList className="h-5 w-5 mr-3" /> 
    },
    { 
      path: '/products', 
      label: t('sidebar.products'), 
      icon: <PackageOpen className="h-5 w-5 mr-3" /> 
    },
    { 
      path: '/categories', 
      label: t('sidebar.categories'), 
      icon: <FolderOpen className="h-5 w-5 mr-3" /> 
    }
  ] : [];

  // Admin only items
  const adminItems = [
    { 
      path: '/users', 
      label: t('sidebar.users'), 
      icon: <Users className="h-5 w-5 mr-3" /> 
    }
  ];

  return (
    <aside className={cn(
      "flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out",
      className
    )}>
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
        <Logo />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        {[...navItems, ...regularItems].map((item) => (
          <Link 
            key={item.path}
            href={item.path}
            onClick={handleNavClick}
          >
            <a className={cn(
              "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors",
              location === item.path 
                ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400" 
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            )}>
              {item.icon}
              {item.label}
            </a>
          </Link>
        ))}

        {/* Admin Section */}
        {user?.role === 'admin' && (
          <div className="pt-4 mt-4 space-y-1 border-t border-gray-200 dark:border-gray-700">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {t('sidebar.admin')}
            </p>

            {adminItems.map((item) => (
              <Link 
                key={item.path}
                href={item.path}
                onClick={handleNavClick}
              >
                <a className={cn(
                  "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors",
                  location === item.path 
                    ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400" 
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                )}>
                  {item.icon}
                  {item.label}
                </a>
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* User Profile */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        {user ? (
          <>
            <div className="flex items-center">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/avatar.png" alt={user.name} />
                <AvatarFallback>{getAvatarInitial(user.name)}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user.role === 'admin' ? t('roles.admin') : t('roles.user')}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t('auth.signOut')}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="ml-3 space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="mt-3">
              <Skeleton className="h-9 w-full" />
            </div>
          </>
        )}
      </div>
    </aside>
  );
}