import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { useLocale } from "@/hooks/use-locale";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  variant?: 'blue' | 'green' | 'purple' | 'amber' | 'red';
  percentChange?: number;
  className?: string;
  subtitle?: string;
}

// Модернизированная карточка статистики под новый дизайн с нейронным фоном
export function StatsCard({ 
  title, 
  value, 
  icon, 
  variant = 'blue', 
  percentChange, 
  className,
  subtitle 
}: StatsCardProps) {
  const { theme } = useTheme();
  const { t } = useLocale();
  const isDarkMode = theme === 'dark';

  // Обработка значения, чтобы заменить NaN и undefined на 0
  const displayValue = (val: string | number) => {
    if (typeof val === 'number' && (isNaN(val) || !isFinite(val))) {
      return '0';
    }
    return val?.toString() || '0';
  };

  // Цвета для различных вариантов
  const variantStyles = {
    blue: {
      bgGradient: isDarkMode 
        ? 'from-blue-500/20 to-blue-600/5' 
        : 'from-blue-100 to-blue-50',
      iconBg: isDarkMode 
        ? 'bg-blue-500/30' 
        : 'bg-blue-200',
      iconColor: isDarkMode 
        ? 'text-blue-300' 
        : 'text-blue-600',
      valueColor: isDarkMode 
        ? 'text-blue-200' 
        : 'text-blue-700',
      titleColor: isDarkMode 
        ? 'text-white/70' 
        : 'text-blue-700',
      subtitleColor: isDarkMode 
        ? 'text-white/60' 
        : 'text-blue-600/80',
      border: isDarkMode 
        ? 'border-white/10' 
        : 'border-blue-200'
    },
    green: {
      bgGradient: isDarkMode 
        ? 'from-green-500/20 to-green-600/5' 
        : 'from-green-100 to-green-50',
      iconBg: isDarkMode 
        ? 'bg-green-500/30' 
        : 'bg-green-200',
      iconColor: isDarkMode 
        ? 'text-green-300' 
        : 'text-green-600',
      valueColor: isDarkMode 
        ? 'text-green-200' 
        : 'text-green-700',
      titleColor: isDarkMode 
        ? 'text-white/70' 
        : 'text-green-700',
      subtitleColor: isDarkMode 
        ? 'text-white/60' 
        : 'text-green-600/80',
      border: isDarkMode 
        ? 'border-white/10' 
        : 'border-green-200'
    },
    purple: {
      bgGradient: isDarkMode 
        ? 'from-purple-500/20 to-purple-600/5' 
        : 'from-purple-100 to-purple-50',
      iconBg: isDarkMode 
        ? 'bg-purple-500/30' 
        : 'bg-purple-200',
      iconColor: isDarkMode 
        ? 'text-purple-300' 
        : 'text-purple-600',
      valueColor: isDarkMode 
        ? 'text-purple-200' 
        : 'text-purple-700',
      titleColor: isDarkMode 
        ? 'text-white/70' 
        : 'text-purple-700',
      subtitleColor: isDarkMode 
        ? 'text-white/60' 
        : 'text-purple-600/80',
      border: isDarkMode 
        ? 'border-white/10' 
        : 'border-purple-200'
    },
    amber: {
      bgGradient: isDarkMode 
        ? 'from-amber-500/20 to-amber-600/5' 
        : 'from-amber-100 to-amber-50',
      iconBg: isDarkMode 
        ? 'bg-amber-500/30' 
        : 'bg-amber-200',
      iconColor: isDarkMode 
        ? 'text-amber-300' 
        : 'text-amber-600',
      valueColor: isDarkMode 
        ? 'text-amber-200' 
        : 'text-amber-700',
      titleColor: isDarkMode 
        ? 'text-white/70' 
        : 'text-amber-700',
      subtitleColor: isDarkMode 
        ? 'text-white/60' 
        : 'text-amber-600/80',
      border: isDarkMode 
        ? 'border-white/10' 
        : 'border-amber-200'
    },
    red: {
      bgGradient: isDarkMode 
        ? 'from-red-500/20 to-red-600/5' 
        : 'from-red-100 to-red-50',
      iconBg: isDarkMode 
        ? 'bg-red-500/30' 
        : 'bg-red-200',
      iconColor: isDarkMode 
        ? 'text-red-300' 
        : 'text-red-600',
      valueColor: isDarkMode 
        ? 'text-red-200' 
        : 'text-red-700',
      titleColor: isDarkMode 
        ? 'text-white/70' 
        : 'text-red-700',
      subtitleColor: isDarkMode 
        ? 'text-white/60' 
        : 'text-red-600/80',
      border: isDarkMode 
        ? 'border-white/10' 
        : 'border-red-200'
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={cn(
      "rounded-2xl backdrop-blur-sm bg-gradient-to-br border p-6 shadow-sm",
      styles.bgGradient,
      styles.border,
      className
    )}>
      <div className="flex items-center justify-between">
        <h3 className={cn("text-sm font-medium", styles.titleColor)}>{title}</h3>
        {icon && (
          <div className={cn("p-2 rounded-full", styles.iconBg)}>
            <div className={styles.iconColor}>{icon}</div>
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <p className={cn("text-3xl font-bold", styles.valueColor)}>
          {displayValue(value)}
        </p>
        {subtitle && (
          <p className={cn("mt-1 text-sm", styles.subtitleColor)}>{subtitle}</p>
        )}
      </div>
      
      {percentChange !== undefined && (
        <div className="mt-2 flex items-center">
          <span className={cn(
            "text-xs font-medium",
            percentChange >= 0 
              ? (isDarkMode ? "text-green-300" : "text-green-600") 
              : (isDarkMode ? "text-red-300" : "text-red-600")
          )}>
            {percentChange >= 0 ? "+" : ""}{percentChange}%
          </span>
          <span className={cn("ml-2 text-xs", isDarkMode ? "text-white/60" : "text-gray-500")}>
            {t("stats.vsLastPeriod")}
          </span>
        </div>
      )}
    </div>
  );
}
