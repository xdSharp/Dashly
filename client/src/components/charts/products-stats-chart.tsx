import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, Legend } from "recharts";
import { useLocale } from "@/hooks/use-locale";
import { useBusiness } from "@/hooks/use-business";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Package } from "lucide-react";

interface ProductsStatsChartProps {
  data?: any[];
  isLoading?: boolean;
  userId?: number;
  businessId?: number;
}

export function ProductsStatsChart({ 
  data: propData, 
  isLoading: propIsLoading,
  userId,
  businessId
}: ProductsStatsChartProps) {
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
      let params = '';
      
      // Добавляем businessId, если он указан
      if (effectiveBusinessId !== undefined) {
        params += `${params ? '&' : '?'}businessId=${effectiveBusinessId}`;
      }
      
      // Добавляем userId, если он указан
      if (userId !== undefined) {
        params += `${params ? '&' : '?'}userId=${userId}`;
      }
      
      console.log("ProductsStatsChart: Запрос данных для графика с параметрами:", { 
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
          console.log("ProductsStatsChart: Получены данные:", result);
          return result;
        }
        return response;
      } catch (error) {
        console.error("ProductsStatsChart: Ошибка при получении данных:", error);
        throw error;
      }
    },
    enabled: !propData,
    refetchOnWindowFocus: true,
    retry: 3
  });

  // Prepare products stats data
  const productsStatsData = useMemo(() => {
    // Если данные переданы как пропсы, используем их
    if (propData && propData.length > 0) {
      return propData;
    }
    
    // Иначе используем данные из запроса
    if (!dashboardData?.productsStats) {
      console.log("ProductsStatsChart: Нет данных productsStats");
      return [];
    }
    
    console.log("ProductsStatsChart: Данные о товарах:", dashboardData.productsStats);
    
    return dashboardData.productsStats.map((item: any) => {
      return {
        name: item.categoryName,
        totalProducts: item.totalProducts || 0,
        avgPrice: typeof item.avgPrice === 'string' ? parseFloat(item.avgPrice) : item.avgPrice || 0
      };
    });
  }, [propData, dashboardData?.productsStats]);

  // Создадим демо-данные, если статистика пустая или отсутствует
  const finalData = useMemo(() => {
    // Если есть реальные данные с ненулевыми значениями, используем их
    if (productsStatsData && productsStatsData.length > 0 && 
        productsStatsData.some((item: {totalProducts: number}) => item.totalProducts > 0)) {
      return productsStatsData;
    }
    
    // Иначе создаем демо-данные
    return [
      { name: 'Бытовая техника', totalProducts: 15, avgPrice: 12000 },
      { name: 'Компьютеры', totalProducts: 10, avgPrice: 45000 },
      { name: 'Смартфоны', totalProducts: 20, avgPrice: 25000 },
      { name: 'Электроника', totalProducts: 12, avgPrice: 8000 },
      { name: 'Аудиотехника', totalProducts: 8, avgPrice: 15000 }
    ];
  }, [productsStatsData]);

  // Проверяем, используются ли демо-данные
  const isUsingDemoData = useMemo(() => {
    return !(productsStatsData && productsStatsData.length > 0 && 
           productsStatsData.some((item: {totalProducts: number}) => item.totalProducts > 0));
  }, [productsStatsData]);

  // Определяем состояние загрузки
  const isLoading = propIsLoading || (isDashboardLoading && !propData);

  // Определяем цвета для графика
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (isLoading || isDashboardLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Используем простой столбчатый график для лучшей совместимости
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full mb-4">
        <h3 className="text-lg font-semibold text-foreground">{t("charts.productsByCategoryTitle")}</h3>
        <p className="text-sm text-muted-foreground">{t("charts.productsByCategorySubtitle")}</p>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={finalData} margin={{ top: 30, right: 30, left: 20, bottom: 5 }} barSize={40}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--accent)" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--foreground)', fontSize: 13 }}
            height={60}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--foreground)', fontSize: 13 }}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            formatter={(value, name, props) => [
              `${value} ${t("charts.productCount")}`,
              props.payload.name
            ]}
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg)',
              border: '1px solid var(--tooltip-border)',
              borderRadius: '6px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}
          />
          <Bar 
            dataKey="totalProducts" 
            name={t("charts.productCount")}
            label={{ 
              position: 'top', 
              fill: 'var(--foreground)', 
              fontSize: 16,
              formatter: (value: number) => `${value}`,
              style: {
                fontWeight: 'bold'
              }
            }}
          >
            {finalData.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Кастомная легенда */}
      <div className="flex flex-wrap justify-center gap-4 mt-3">
        {finalData.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <span 
              style={{ 
                display: 'inline-block', 
                width: '10px', 
                height: '10px',
                backgroundColor: COLORS[index % COLORS.length],
                borderRadius: '2px'
              }} 
            />
            <span className="text-sm text-foreground">{entry.name}</span>
          </div>
        ))}
      </div>
      
      {isUsingDemoData && (
        <div className="text-center text-sm text-gray-500 mt-2">
          <div className="flex items-center justify-center gap-1">
            <Package className="h-4 w-4" />
            <span>{t("charts.demoDataNotice")}</span>
          </div>
          <a href="/products" className="text-blue-500 hover:underline text-xs">
            {t("charts.addRealProducts")}
          </a>
        </div>
      )}
    </div>
  );
} 