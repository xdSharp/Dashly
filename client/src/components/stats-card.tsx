import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { ArrowDown, ArrowUp } from "lucide-react";

const iconVariants = cva(
  "flex-shrink-0 rounded-md p-3",
  {
    variants: {
      variant: {
        blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
        green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
        purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
        amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
        red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
      }
    },
    defaultVariants: {
      variant: "blue"
    }
  }
);

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isUpward: boolean;
  };
  variant?: "blue" | "green" | "purple" | "amber" | "red";
  valuePrefix?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  trend,
  variant = "blue",
  valuePrefix,
  className
}: StatsCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="p-5">
        <div className="flex items-center">
          <div className={iconVariants({ variant })}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              {title}
            </p>
            <div className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                {valuePrefix && <span>{valuePrefix}</span>}
                {value}
              </div>
              
              {trend && (
                <div 
                  className={cn(
                    "ml-2 flex items-baseline text-sm font-semibold",
                    trend.isUpward ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  )}
                >
                  {trend.isUpward ? (
                    <ArrowUp className="h-4 w-4 self-center" />
                  ) : (
                    <ArrowDown className="h-4 w-4 self-center" />
                  )}
                  <span className="sr-only">
                    {trend.isUpward ? "Increased by" : "Decreased by"}
                  </span>
                  {trend.value}%
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
