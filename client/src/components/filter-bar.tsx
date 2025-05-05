import { useState } from "react";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "./date-range-picker";
import { Button } from "@/components/ui/button";
import { Download, FileDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocale } from "@/hooks/use-locale.tsx";
import { Category } from "@/shared/types";

interface FilterBarProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  categoryId?: number;
  onCategoryChange?: (categoryId: number | undefined) => void;
  employeeFilter?: string;
  onEmployeeChange?: (employee: string | undefined) => void;
  categories?: Category[];
  employees?: string[];
  onExport?: () => void;
  isExporting?: boolean;
}

export function FilterBar({
  dateRange,
  onDateRangeChange,
  categoryId,
  onCategoryChange,
  employeeFilter,
  onEmployeeChange,
  categories = [],
  employees = [],
  onExport,
  isExporting
}: FilterBarProps) {
  const { t } = useLocale();

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 sm:mb-0">
          {t("dashboard.overview")}
        </h2>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          {/* Date Range Filter */}
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={onDateRangeChange}
            className="w-full sm:w-auto"
          />
          
          {/* Category Filter - Show only if categories and handler provided */}
          {categories.length > 0 && onCategoryChange && (
            <Select
              value={categoryId?.toString()}
              onValueChange={(value) => 
                onCategoryChange(value ? parseInt(value) : undefined)
              }
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder={t("filters.category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t("filters.allCategories")}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {/* Employee Filter - Show only if employees and handler provided */}
          {employees.length > 0 && onEmployeeChange && (
            <Select
              value={employeeFilter}
              onValueChange={(value) => 
                onEmployeeChange(value === "" ? undefined : value)
              }
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder={t("filters.employee")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t("filters.allEmployees")}</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee} value={employee}>
                    {employee}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {/* Export Button */}
          {onExport && (
            <Button
              className="w-full sm:w-auto"
              onClick={onExport}
              disabled={isExporting}
            >
              <FileDown className="h-5 w-5 mr-1" />
              {t("common.exportReport")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
