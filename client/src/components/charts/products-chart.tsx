import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { useQuery } from "@tanstack/react-query";
import { Cell, Treemap, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/hooks/use-locale";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis } from "recharts";
import { useBusiness } from "@/hooks/use-business";
import { apiRequest } from "@/lib/queryClient";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface ProductsChartProps {
  data?: any[];
  isLoading?: boolean;
  userId?: number;
  businessId?: number;
}

export function ProductsChart({ data, isLoading }: ProductsChartProps) {
  const { t } = useLocale();
  
  // Process data for chart
  const products = [...new Set(data.map(sale => sale.product?.name || 'Unknown'))];
  const salesByProduct = products.map(product => {
    return data
      .filter(sale => (sale.product?.name || 'Unknown') === product)
      .reduce((sum, sale) => sum + sale.amount, 0);
  });

  const chartData = {
    labels: products,
    datasets: [
      {
        data: salesByProduct,
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: t("charts.products.title"),
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <Pie data={chartData} options={options} />
    </div>
  );
}

export function ProductsChartRecharts() {
  const { t } = useLocale();

  const { data: salesData = [] } = useQuery({
    queryKey: ["/api/sales"],
  });

  // Process sales data by product
  const productData = salesData.reduce((acc: any, sale: any) => {
    const product = sale.product?.name || t("common.unknown");
    const value = sale.price * sale.quantity;
    acc[product] = (acc[product] || 0) + value;
    return acc;
  }, {});

  const chartData = [{
    name: "Products",
    children: Object.entries(productData).map(([name, value]) => ({
      name,
      size: value
    }))
  }];

  const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("charts.products.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <Treemap
            data={chartData}
            dataKey="size"
            nameKey="name"
            aspectRatio={4 / 3}
          >
            <RechartsTooltip />
            {chartData[0]?.children?.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Treemap>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ProductsChartDashboard({ 
  data: propData, 
  isLoading: propIsLoading,
  userId,
  businessId
}: ProductsChartProps) {
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
      
      console.log("ProductsChart: Запрос данных для графика с параметрами:", { 
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
          console.log("ProductsChart: Получены данные:", result);
          return result;
        }
        return response;
      } catch (error) {
        console.error("ProductsChart: Ошибка при получении данных:", error);
        throw error;
      }
    },
    enabled: !propData,
    refetchOnWindowFocus: true,
    retry: 3
  });

  // Prepare top products data
  const topProductsData = useMemo(() => {
    // Если данные переданы как пропсы, используем их
    if (propData && propData.length > 0) {
      return propData;
    }
    
    // Иначе используем данные из запроса
    if (!dashboardData?.topProducts) return [];
    
    console.log("Products chart data:", dashboardData.topProducts);
    
    return dashboardData.topProducts
      .filter((item: any) => item.productName) // Фильтруем только товары с именами
      .map((item: any) => ({
        name: item.productName || 'Unknown',
        revenue: parseFloat(item.totalRevenue || 0),
        quantity: item.totalSold || 0
      }))
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [propData, dashboardData?.topProducts]);

  // Определяем состояние загрузки
  const isLoading = propIsLoading || (isDashboardLoading && !propData);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Если данных нет, показываем пустой график
  if (!topProductsData || topProductsData.length === 0) {
    // Создаём пустые данные для товаров
    const emptyData = [
      { name: t('common.product1'), revenue: 0, quantity: 0 },
      { name: t('common.product2'), revenue: 0, quantity: 0 },
      { name: t('common.product3'), revenue: 0, quantity: 0 },
      { name: t('common.product4'), revenue: 0, quantity: 0 },
      { name: t('common.product5'), revenue: 0, quantity: 0 }
    ];
    
    return (
      <div className="flex flex-col items-center justify-center">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={emptyData}>
            <XAxis 
              dataKey="name" 
              tick={{ fill: 'var(--foreground)' }}
              stroke="var(--chart-axis)"
            />
            <YAxis 
              tick={{ fill: 'var(--foreground)' }}
              stroke="var(--chart-axis)"
            />
            <RechartsTooltip 
              contentStyle={{ 
                backgroundColor: 'var(--tooltip-bg)',
                border: '1px solid var(--tooltip-border)',
                color: 'var(--tooltip-color)',
                boxShadow: 'var(--tooltip-shadow)',
                fontWeight: 500
              }}
              formatter={(value, name) => [
                name === 'revenue' 
                  ? new Intl.NumberFormat(locale, { style: 'currency', currency: 'RUB' }).format(Number(value))
                  : `${value} ${t('common.itemCount', { count: value })}`,
                name === 'revenue' ? t('stats.revenue') : t('stats.sales')
              ]}
              labelStyle={{ color: 'var(--tooltip-color)', fontWeight: 600, marginBottom: '4px' }}
              itemStyle={{ color: 'var(--tooltip-color)' }}
              wrapperStyle={{ outline: 'none' }}
            />
            <Bar dataKey="revenue" fill="var(--primary)" name={t('stats.revenue')} />
            <Bar dataKey="quantity" fill="var(--secondary)" name={t('stats.sales')} />
          </BarChart>
        </ResponsiveContainer>
        <div className="text-center text-sm text-gray-500 mt-2">
          {t("charts.noData")}
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={topProductsData}>
        <XAxis 
          dataKey="name" 
          tick={{ fill: 'var(--foreground)' }}
          stroke="var(--chart-axis)"
        />
        <YAxis 
          tick={{ fill: 'var(--foreground)' }}
          stroke="var(--chart-axis)"
        />
        <RechartsTooltip 
          contentStyle={{ 
            backgroundColor: 'var(--tooltip-bg)',
            border: '1px solid var(--tooltip-border)',
            color: 'var(--tooltip-color)',
            boxShadow: 'var(--tooltip-shadow)',
            fontWeight: 500
          }}
          formatter={(value, name) => [
            name === 'revenue' 
              ? new Intl.NumberFormat(locale, { style: 'currency', currency: 'RUB' }).format(Number(value))
              : `${value} ${t('common.itemCount', { count: value })}`,
            name === 'revenue' ? t('stats.revenue') : t('stats.sales')
          ]}
          labelStyle={{ color: 'var(--tooltip-color)', fontWeight: 600, marginBottom: '4px' }}
          itemStyle={{ color: 'var(--tooltip-color)' }}
          wrapperStyle={{ outline: 'none' }}
        />
        <Bar dataKey="revenue" fill="var(--primary)" name={t('stats.revenue')} />
        <Bar dataKey="quantity" fill="var(--secondary)" name={t('stats.sales')} />
      </BarChart>
    </ResponsiveContainer>
  );
}