import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { useLocale } from "@/hooks/use-locale";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTheme } from "@/hooks/use-theme";

interface UserSalesChartProps {
  data?: any[];
  isLoading?: boolean;
}

export function UserSalesChart({ data: propData, isLoading: propIsLoading }: UserSalesChartProps) {
  const { t, locale } = useLocale();
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';

  // Fetch user sales data
  const { data: salesData, isLoading: isSalesLoading } = useQuery({
    queryKey: ["/api/admin/user-sales"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/user-sales");
      if (response instanceof Response) {
        const result = await response.json();
        return result;
      }
      return response;
    },
    enabled: !propData,
    staleTime: 300000, // 5 минут кэширования
    refetchOnWindowFocus: false
  });

  // Prepare sales data
  const chartData = useMemo(() => {
    const data = propData || salesData;
    
    if (data && Array.isArray(data) && data.length > 0) {
      console.log("Использую реальные данные о продажах пользователей:", data);
      
      return data
        .map((item: any) => ({
          name: item.userName || t("common.unknownUser"),
          sales: item.totalSales || 0,
          revenue: item.totalRevenue || 0
        }))
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 5); // Топ 5 пользователей
    } else {
      console.log("Использую демо-данные для графика продаж пользователей");
      
      // Демо-данные для графика
      return [
        { name: "Администратор", sales: 125, revenue: 78500 },
        { name: "Менеджер", sales: 89, revenue: 52300 },
        { name: "Продавец", sales: 67, revenue: 41200 },
        { name: "Стажер", sales: 34, revenue: 18700 },
        { name: "Консультант", sales: 56, revenue: 31500 }
      ];
    }
  }, [propData, salesData, t]);

  const isLoading = propIsLoading || isSalesLoading;

  // Определяем максимальные значения для осей
  const maxSales = Math.max(...chartData.map((item) => item.sales));
  const maxRevenue = Math.max(...chartData.map((item) => item.revenue));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        {t("charts.noData")}
      </div>
    );
  }

  // Цвета для графиков в зависимости от темы
  const salesColor = isDarkTheme ? "#3b82f6" : "var(--primary)"; // Синий
  const revenueColor = isDarkTheme ? "#10b981" : "#10b981"; // Зеленый

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 15 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDarkTheme ? "rgba(255,255,255,0.15)" : "var(--chart-axis)"} />
          <XAxis
            dataKey="name"
            tick={{ fill: 'var(--chart-text)', fontSize: 12, fontWeight: isDarkTheme ? 'bold' : 'normal' }}
            stroke="var(--chart-axis)"
            tickMargin={10}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={65}
          />
          <YAxis
            yAxisId="left"
            orientation="left"
            tick={{ fill: 'var(--chart-text)', fontSize: 12, fontWeight: isDarkTheme ? 'bold' : 'normal' }}
            stroke="var(--chart-axis)"
            tickMargin={10}
            label={{ value: t("stats.sales"), angle: -90, position: 'insideLeft', fill: isDarkTheme ? 'rgba(255,255,255,0.8)' : undefined, style: { textShadow: isDarkTheme ? '0 0 5px rgba(0,0,0,0.5)' : 'none' } }}
            domain={[0, Math.ceil(maxSales * 1.2)]}
            allowDecimals={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: 'var(--chart-text)', fontSize: 12, fontWeight: isDarkTheme ? 'bold' : 'normal' }}
            stroke="var(--chart-axis)"
            tickMargin={10}
            label={{ value: t("stats.revenue"), angle: 90, position: 'insideRight', fill: isDarkTheme ? 'rgba(255,255,255,0.8)' : undefined, style: { textShadow: isDarkTheme ? '0 0 5px rgba(0,0,0,0.5)' : 'none' } }}
            domain={[0, Math.ceil(maxRevenue * 1.2)]}
          />
          {/* Горизонтальные линии для лучшей визуализации */}
          {Array.from({ length: 5 }).map((_, index) => (
            <ReferenceLine 
              key={`ref-line-${index}`}
              y={(index + 1) * Math.ceil(maxSales * 1.2) / 5} 
              yAxisId="left"
              stroke={isDarkTheme ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} 
            />
          ))}
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg)',
              border: '1px solid var(--tooltip-border)',
              color: 'var(--tooltip-color)',
              boxShadow: 'var(--tooltip-shadow)',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '13px',
              fontWeight: 500
            }}
            labelStyle={{ color: 'var(--tooltip-color)', fontWeight: 600, marginBottom: '6px' }}
            formatter={(value, name) => {
              if (name === "revenue") {
                return [new Intl.NumberFormat(locale, { style: 'currency', currency: 'RUB' }).format(value), t("stats.revenue")];
              }
              return [`${value} ${t("charts.userSales.sales")}`, t("stats.sales")];
            }}
            animationDuration={200}
            cursor={{ fill: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => {
              const style = { 
                color: 'var(--chart-text)', 
                fontWeight: isDarkTheme ? 'bold' : 'normal',
                textShadow: isDarkTheme ? '0 0 5px rgba(0,0,0,0.3)' : 'none'
              };
              
              if (value === "revenue") return <span style={style}>{t("stats.revenue")}</span>;
              if (value === "sales") return <span style={style}>{t("stats.sales")}</span>;
              return <span style={style}>{value}</span>;
            }}
          />
          <Bar
            yAxisId="left"
            dataKey="sales"
            fill={salesColor}
            name="sales"
            radius={[4, 4, 0, 0]}
            stroke={isDarkTheme ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.1)"}
            strokeWidth={1}
          />
          <Bar
            yAxisId="right"
            dataKey="revenue"
            fill={revenueColor}
            name="revenue"
            radius={[4, 4, 0, 0]}
            stroke={isDarkTheme ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.1)"}
            strokeWidth={1}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 