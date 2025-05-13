import { useMemo, useEffect } from "react";
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useLocale } from "@/hooks/use-locale";
import { useBusiness } from "@/hooks/use-business";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface RevenueChartProps {
  data?: any[];
  isLoading?: boolean;
  userId?: number;
  businessId?: number;
}

export function RevenueChart({ 
  data: propData, 
  isLoading: propIsLoading,
  userId,
  businessId
}: RevenueChartProps) {
  const { t, locale } = useLocale();
  const { currentBusiness } = useBusiness();

  // Используем явно переданный businessId или текущий бизнес
  const effectiveBusinessId = businessId !== undefined 
    ? businessId 
    : currentBusiness?.id;
  
  // Fetch dashboard data with business and user filter if data is not provided as props
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ["/api/dashboard/summary", effectiveBusinessId, userId],
    queryFn: async () => {
      // Удаляем тестовый ID пользователя, чтобы использовать текущего пользователя
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
      
      console.log("RevenueChart: Запрос данных для графика с параметрами:", { 
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
          console.log("RevenueChart: Получены данные:", result);
          
          // Проверяем структуру данных
          if (!result.monthlySales) {
            console.error("RevenueChart: Отсутствуют данные monthlySales в ответе API:", result);
          } else if (!Array.isArray(result.monthlySales)) {
            console.error("RevenueChart: monthlySales не является массивом:", result.monthlySales);
          } else if (result.monthlySales.length === 0) {
            console.warn("RevenueChart: monthlySales - пустой массив");
          } else {
            console.log("RevenueChart: monthlySales содержит данные:", 
              result.monthlySales.length, 
              "элементов. Первый элемент:", 
              result.monthlySales[0]
            );
          }
          
          return result;
        }
        return response;
      } catch (error) {
        console.error("RevenueChart: Ошибка при получении данных:", error);
        throw error;
      }
    },
    enabled: !propData,
    staleTime: 300000, // 5 минут
    // Добавляем дополнительные опции для перезагрузки данных
    refetchOnWindowFocus: true,
    retry: 3 // Повторные попытки при ошибке
  });

  // Логирование для отладки
  useEffect(() => {
    if (propData) {
      console.log("RevenueChart: Данные переданы как пропсы:", propData);
    } else if (dashboardData?.monthlySales) {
      console.log("RevenueChart: Данные из запроса:", dashboardData.monthlySales);
    }
  }, [propData, dashboardData]);

  // Prepare chart data
  const monthlyRevenueData = useMemo(() => {
    // Если данные переданы как пропсы, используем их
    if (propData && propData.length > 0) {
      console.log("RevenueChart: Используем propData:", propData);
      return propData.map(item => ({
        ...item,
        revenue: typeof item.revenue === 'string' ? parseFloat(item.revenue) : item.revenue
      }));
    }
    
    // Иначе используем данные из запроса
    if (!dashboardData?.monthlySales) {
      console.log("RevenueChart: Нет данных monthlySales");
      return [];
    }
    
    console.log("RevenueChart: Обработка данных о продажах по месяцам:", dashboardData.monthlySales);
    console.log("RevenueChart: Тип данных monthlySales:", typeof dashboardData.monthlySales, Array.isArray(dashboardData.monthlySales));
    
    return dashboardData.monthlySales.map((item: any) => {
      // Преобразуем строковые значения в числа
      const revenue = typeof item.revenue === 'string' ? parseFloat(item.revenue) : item.revenue;
      console.log(`RevenueChart: Месяц ${item.month}, доход: ${revenue}, продажи: ${item.totalSales}, тип revenue: ${typeof revenue}`);
      
      return {
        month: t(`date.monthsLong.${item.month - 1}`),
        revenue: revenue || 0,
        sales: item.totalSales || 0
      };
    });
  }, [propData, dashboardData?.monthlySales, t]);

  // Проверяем, есть ли реальные данные для отображения
  const hasData = useMemo(() => {
    if (!monthlyRevenueData || monthlyRevenueData.length === 0) {
      console.log("RevenueChart: monthlyRevenueData пустой или отсутствует", monthlyRevenueData);
      return false;
    }
    
    // Проверяем наличие ненулевых значений
    const nonZeroValues = monthlyRevenueData.some((item: { revenue: number }) => item.revenue > 0);
    console.log("RevenueChart: Есть ли ненулевые значения:", nonZeroValues, monthlyRevenueData);
    return nonZeroValues;
  }, [monthlyRevenueData]);

  // Определяем состояние загрузки
  const isLoading = propIsLoading || (isDashboardLoading && !propData);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Если данных нет или все значения нулевые
  if (!hasData) {
    console.log("RevenueChart: Нет ненулевых данных для отображения графика");
    
    // Если есть данные, но все нулевые - показываем график с нулевыми значениями
    if (monthlyRevenueData && monthlyRevenueData.length > 0) {
      return (
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-axis)" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: 'var(--chart-text)' }}
                stroke="var(--chart-axis)"
              />
              <YAxis 
                tickFormatter={(value) => 
                  value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value
                }
                tick={{ fill: 'var(--chart-text)' }}
                stroke="var(--chart-axis)"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--tooltip-bg)',
                  border: '1px solid var(--tooltip-border)',
                  color: 'var(--tooltip-color)',
                  boxShadow: 'var(--tooltip-shadow)',
                  fontWeight: 500
                }}
                labelStyle={{ color: 'var(--tooltip-color)', fontWeight: 600, marginBottom: '4px' }}
                itemStyle={{ color: 'var(--tooltip-color)' }}
                wrapperStyle={{ outline: 'none' }}
              />
              <Bar dataKey="revenue" fill="var(--primary)" />
            </BarChart>
          </ResponsiveContainer>
          <div className="text-center text-sm text-gray-500 mt-2">
            {t("charts.noData")}
          </div>
        </div>
      );
    }
    
    // Создаём пустые данные для 12 месяцев
    const emptyData = Array.from({ length: 12 }, (_, i) => ({
      month: t(`date.monthsShort.${i}`),
      revenue: 0,
      sales: 0
    }));
    
    console.log("RevenueChart: Генерируем пустые данные для графика");
    
    return (
      <div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={emptyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-axis)" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: 'var(--chart-text)' }}
              stroke="var(--chart-axis)"
            />
            <YAxis 
              tick={{ fill: 'var(--chart-text)' }}
              stroke="var(--chart-axis)"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--tooltip-bg)',
                border: '1px solid var(--tooltip-border)',
                color: 'var(--tooltip-color)',
                boxShadow: 'var(--tooltip-shadow)',
                fontWeight: 500
              }}
              labelStyle={{ color: 'var(--tooltip-color)', fontWeight: 600, marginBottom: '4px' }}
              itemStyle={{ color: 'var(--tooltip-color)' }}
              wrapperStyle={{ outline: 'none' }}
            />
            <Bar dataKey="revenue" fill="var(--primary)" />
          </BarChart>
        </ResponsiveContainer>
        <div className="text-center text-sm text-gray-500 mt-2">
          {t("charts.noData")}
        </div>
      </div>
    );
  }

  console.log("RevenueChart: Данные для графика готовы:", monthlyRevenueData);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={monthlyRevenueData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-axis)" />
        <XAxis 
          dataKey="month" 
          tick={{ fill: 'var(--chart-text)' }}
          stroke="var(--chart-axis)"
        />
        <YAxis 
          tickFormatter={(value) => 
            value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value
          }
          tick={{ fill: 'var(--chart-text)' }}
          stroke="var(--chart-axis)"
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'var(--tooltip-bg)',
            border: '1px solid var(--tooltip-border)',
            color: 'var(--tooltip-color)',
            boxShadow: 'var(--tooltip-shadow)',
            fontWeight: 500
          }}
          labelStyle={{ color: 'var(--tooltip-color)', fontWeight: 600, marginBottom: '4px' }}
          itemStyle={{ color: 'var(--tooltip-color)' }}
          wrapperStyle={{ outline: 'none' }}
          formatter={(value) => [
            new Intl.NumberFormat(locale, { 
              style: 'currency', 
              currency: 'RUB' 
            }).format(Number(value)), 
            'Доход'
          ]}
        />
        <Bar dataKey="revenue" fill="var(--primary)" />
      </BarChart>
    </ResponsiveContainer>
  );
}