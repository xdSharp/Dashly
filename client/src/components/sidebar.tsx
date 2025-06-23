import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BusinessSwitcher } from "@/components/business/business-switcher";
import { useAuth } from "@/hooks/use-auth";
import { useLocale } from "@/hooks/use-locale";
import { 
  LayoutDashboard, 
  Building2, 
  LayoutList, 
  PackageOpen, 
  FolderOpen, 
  FileText, 
  Upload,
  Users,
  LucideIcon
} from "lucide-react";
import { Link } from "wouter";

interface NavItem {
  icon: LucideIcon;
  href: string;
  label: string;
}

interface SidebarProps {
  className?: string;
  isMobile?: boolean;
  onClose?: () => void;
}

function NavigationItem({ 
  href, 
  icon: Icon, 
  children, 
  active, 
  onClick 
}: { 
  href: string; 
  icon: LucideIcon; 
  children: React.ReactNode; 
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link 
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
        "text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
        "hover:bg-gray-200/80 dark:hover:bg-gray-800/80",
        active && "bg-gray-200/90 text-gray-900 font-medium dark:bg-gray-800 dark:text-gray-50"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </Link>
  );
}

export function Sidebar({ className, isMobile = false, onClose }: SidebarProps) {
  const { user } = useAuth();
  const { t } = useLocale();
  const currentPath = window.location.pathname;

  // Проверяем, является ли пользователь администратором
  const isAdmin = user?.role === 'admin';

  // Определяем навигационные элементы для обычных пользователей
  const userItems: NavItem[] = [
    {
      icon: LayoutDashboard,
      href: '/dashboard',
      label: t('navbar.dashboard'),
    },
    {
      icon: Building2,
      href: '/business',
      label: t('navbar.business'),
    },
    {
      icon: LayoutList,
      href: '/sales',
      label: t('navbar.sales'),
    },
    {
      icon: PackageOpen,
      href: '/products',
      label: t('navbar.products'),
    },
    {
      icon: FolderOpen,
      href: '/categories',
      label: t('navbar.categories'),
    },
    {
      icon: FileText,
      href: '/reports',
      label: t('navbar.reports'),
    },
    {
      icon: Upload,
      href: '/upload',
      label: t('navbar.import'),
    },
  ];

  // Определяем навигационные элементы для администратора
  const adminItems: NavItem[] = [
    {
      icon: LayoutDashboard,
      href: '/dashboard',
      label: t('navbar.dashboard'),
    },
    {
      icon: Users,
      href: '/users',
      label: t('navbar.users'),
    },
  ];

  // Выбираем нужный набор элементов в зависимости от роли
  const navigationItems = isAdmin ? adminItems : userItems;

  return (
    <aside className={cn(
      "flex flex-col h-full",
      "backdrop-blur-lg bg-white/90 dark:bg-gray-800/90",
      "border-r border-gray-200 dark:border-white/10",
      "transition-all duration-300 ease-in-out",
      className
    )}>
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-white/10">
        <Logo />
      </div>

      {/* Business Switcher - показываем только для не-админов */}
      {user && !isAdmin && (
        <div className="px-4 py-2 border-b border-gray-200 dark:border-white/10">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-300">
              {t('current_business')}
            </p>
            <BusinessSwitcher />
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <ScrollArea className="h-[calc(100vh-10rem)]">
        <div className="px-6 py-2">
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
            {t('navbar.navigation')}
          </h2>
          <nav className="flex flex-col space-y-1">
            {navigationItems.map((item) => (
              <NavigationItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                active={currentPath === item.href}
                onClick={() => {
                  if (isMobile && onClose) {
                    onClose();
                  }
                }}
              >
                {item.label}
              </NavigationItem>
            ))}
          </nav>
        </div>
      </ScrollArea>
    </aside>
  );
}