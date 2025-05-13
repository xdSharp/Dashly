import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavigationItemProps {
  href: string;
  icon?: LucideIcon;
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  badge?: number;
}

export function NavigationItem({
  href,
  icon: Icon,
  active,
  children,
  onClick,
  badge,
}: NavigationItemProps) {
  return (
    <Link href={href}>
      <div
        className={cn(
          "group flex items-center rounded-md px-3 py-2 text-sm font-medium",
          "hover:bg-accent hover:text-accent-foreground",
          "transition-colors duration-200",
          active
            ? "bg-accent text-accent-foreground dark:bg-blue-950/50 dark:text-blue-100"
            : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
        )}
        onClick={onClick}
      >
        {Icon && (
          <span className="relative">
            <Icon className="mr-2 h-4 w-4 shrink-0 text-gray-600 dark:text-gray-400" />
            {badge !== undefined && badge > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white animate-pulse">
                {badge > 9 ? '9+' : badge}
              </span>
            )}
          </span>
        )}
        <span>{children}</span>
      </div>
    </Link>
  );
} 