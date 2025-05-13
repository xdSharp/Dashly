import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/hooks/use-locale";
import { useBusiness } from "@/hooks/use-business";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface CategoryChartProps {
  data?: any[];
  isLoading?: boolean;
  userId?: number;
  businessId?: number;
}

export function CategoryChart({ 
  data: propData, 
  isLoading: propIsLoading,
  userId,
  businessId
}: CategoryChartProps) {
  const { t, locale } = useLocale();
  const { currentBusiness } = useBusiness();

  // Используем явно переданный businessId или текущий бизнес
  const effectiveBusinessId = businessId !== undefined 
    ? businessId 
    : currentBusiness?.id;

  // Fetch dashboard data with business filter if data is not provided as props
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ["/api/dashboard/summary", effectiveBusinessId, userId],
    queryFn: async () => {
      // Удаляем тестовый ID пользователя
      // const testUserId = 7; // Закомментировано, используем реального пользователя
      let params = '';
      
      // Добавляем businessId, если он указан
      if (effectiveBusinessId !== undefined) {
        params += `${params ? '&' : '?'}businessId=${effectiveBusinessId}`;
      }
      
      // Добавляем userId, если он указан
      if (userId !== undefined) {
        params += `${params ? '&' : '?'}userId=${userId}`;
      }
      
      console.log("CategoryChart: Запрос данных для графика с параметрами:", { 
        userId, 
        businessId: effectiveBusinessId, 
        url: `/api/dashboard/summary${params}` 
      });
      
      try {
        const response = await apiRequest("GET", `/api/dashboard/summary${params}`);
        if (response instanceof Response) {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const result = await response.json();
          console.log("CategoryChart: Получены данные:", result);
          return result;
        }
        return response;
      } catch (error) {
        console.error("CategoryChart: Ошибка при получении данных:", error);
        throw error;
      }
    },
    enabled: !propData,
    refetchOnWindowFocus: true,
    retry: 3
  });

  // Define colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  // Prepare category data
  const categoryData = useMemo(() => {
    // Если данные переданы как пропсы, используем их
    if (propData && propData.length > 0) {
      return propData;
    }
    
    // Иначе используем данные из запроса
    if (!dashboardData?.categorySales) return [];
    
    console.log("Category chart data:", dashboardData.categorySales);
    
    return dashboardData.categorySales
      .filter((item: any) => item.totalRevenue && parseFloat(item.totalRevenue) > 0)
      .map((item: any) => ({
        name: item.categoryName || t('common.uncategorized'),
        value: parseFloat(item.totalRevenue || 0)
      }))
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 5);
  }, [propData, dashboardData?.categorySales, t]);

  // Определяем состояние загрузки
  const isLoading = propIsLoading || (isDashboardLoading && !propData);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if we have actual data
  const hasData = categoryData.length > 0 && categoryData.some(item => item.value > 0);

  // Custom render for the pie chart label
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="var(--chart-text)"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (!categoryData || categoryData.length === 0) {
    const emptyData = [{ name: t('common.uncategorized'), value: 0 }];
    
    return (
      <div className="h-[300px] flex flex-col items-center justify-center">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={emptyData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              <Cell fill="var(--muted)" />
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--tooltip-bg)',
                border: '1px solid var(--tooltip-border)',
                color: 'var(--tooltip-color)',
                boxShadow: 'var(--tooltip-shadow)',
                fontWeight: 500
              }}
              labelStyle={{ color: 'var(--tooltip-color)', fontWeight: 600 }}
              itemStyle={{ color: 'var(--tooltip-color)' }}
              wrapperStyle={{ outline: 'none' }}
              formatter={(value) => [`0 ${t('common.itemCount', { count: 0 })}`, '']}
            />
            <Legend formatter={(value) => <span style={{ color: 'var(--chart-text)' }}>{value}</span>} />
          </PieChart>
        </ResponsiveContainer>
        <div className="text-center text-sm text-gray-500 mt-2">
          {t("charts.noData")}
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={categoryData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {categoryData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'var(--tooltip-bg)',
            border: '1px solid var(--tooltip-border)',
            color: 'var(--tooltip-color)',
            boxShadow: 'var(--tooltip-shadow)',
            fontWeight: 500
          }}
          labelStyle={{ color: 'var(--tooltip-color)', fontWeight: 600 }}
          itemStyle={{ color: 'var(--tooltip-color)' }}
          wrapperStyle={{ outline: 'none' }}
          formatter={(value) => [new Intl.NumberFormat(locale, { style: 'currency', currency: 'RUB' }).format(value), '']}
        />
        <Legend formatter={(value) => <span style={{ color: 'var(--chart-text)' }}>{value}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
}