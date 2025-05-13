import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { Layout } from "@/components/layout";
import { useLocale } from "@/hooks/use-locale.tsx";
import { useAuth } from "@/hooks/use-auth";
import { useBusiness } from "@/hooks/use-business";
import { StatsCard } from "@/components/stats-card";
import { SalesTable } from "@/components/sales-table";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { CategoryChart } from "@/components/charts/category-chart";
import { ProductsChartDashboard } from "@/components/charts/products-chart";
import { ProductsStatsChart } from "@/components/charts/products-stats-chart";
import { calculateStats, formatCurrency } from "@/lib/utils";
import {
  BarChart3,
  DollarSign,
  ShoppingCart,
  BarChart,
  FileDown,
  Users,
  UserCog,
  Package,
  FolderOpen,
  ShieldAlert,
  AlertTriangle,
  Building2
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { UserStats } from "@/components/user-stats";
import { UserActivityChart } from "@/components/charts/user-activity-chart";
import { UserSalesChart } from "@/components/charts/user-sales-chart";

export default function DashboardPage() {
  const { t, locale } = useLocale();
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentBusiness } = useBusiness();

  // Filters state
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [employee, setEmployee] = useState<string | undefined>();

  // Fetch dashboard data with business filter
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ["/api/dashboard/summary", currentBusiness?.id],
    queryFn: async () => {
      // Add businessId to query params if available, otherwise load data for all businesses
      const params = currentBusiness?.id 
        ? `?businessId=${currentBusiness.id}` 
        : ''; // Пустая строка означает, что загрузим данные для всех бизнесов
      
      console.log("Dashboard: Запрос на получение данных дашборда с параметрами:", params);
      const response = await apiRequest("GET", `/api/dashboard/summary${params}`);
      if (response instanceof Response) {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        console.log("Dashboard: Получены данные дашборда:", result);
        
        // Проверяем наличие данных
        if (!result.monthlySales || !Array.isArray(result.monthlySales) || result.monthlySales.length === 0) {
          console.warn("Dashboard: monthlySales отсутствует или пустой массив");
        } else {
          console.log("Dashboard: monthlySales содержит", result.monthlySales.length, "записей");
        }
        
        return result;
      }
      return response;
    },
    enabled: !!user,
    staleTime: 300000, // Кэширование на 5 минут
    refetchOnWindowFocus: false,
    retry: 3 // Повторные попытки при ошибке
  });

  // Fetch sales with business filter
  const { data: sales = [], isLoading: isSalesLoading } = useQuery({
    queryKey: ["/api/sales", currentBusiness?.id],
    queryFn: async () => {
      // Add businessId to query params if available
      const params = currentBusiness?.id 
        ? `?businessId=${currentBusiness.id}` 
        : '';
      const response = await apiRequest("GET", `/api/sales${params}`);
      if (response instanceof Response) {
        const salesData = await response.json();
        console.log("Sales loaded:", salesData.length, "items");
        return salesData;
      }
      return response;
    },
    enabled: !!user,
  });

  // Fetch categories
  const { data: categoriesData = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Fetch products
  const { data: productsData = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/products", currentBusiness?.id],
    queryFn: async () => {
      // Add businessId to query params if available
      const params = currentBusiness?.id 
        ? `?businessId=${currentBusiness.id}` 
        : '';
      console.log("Fetching products with params:", params);
      const response = await apiRequest("GET", `/api/products${params}`);
      if (response instanceof Response) {
        const result = await response.json();
        console.log("Products loaded:", result.length, "items");
        return result;
      }
      return response;
    },
    enabled: !!user,
    staleTime: 60000, // 1 минута
    refetchOnWindowFocus: false // Отключаем перезапрос при фокусе окна
  });

  // Fetch admin data
  const { data: usersData = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      console.log("Fetching users data");
      try {
        const response = await apiRequest("GET", "/api/admin/users");
        if (response instanceof Response) {
          const result = await response.json();
          console.log("Users loaded:", result.length, "пользователей");
          return result;
        }
        return response;
      } catch (error) {
        console.error("Error fetching users:", error);
        return [];
      }
    },
    enabled: user?.role === "admin",
    refetchOnWindowFocus: false,
    retry: 2
  });

  // Fetch system status
  const { data: systemStatus, isLoading: isLoadingStatus } = useQuery({
    queryKey: ["/api/admin/system-status"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/system-status");
      if (response instanceof Response) {
        const result = await response.json();
        return result;
      }
      return response;
    },
    enabled: user?.role === "admin",
    staleTime: 60000, // 1 минута
    refetchInterval: 60000, // Обновляем каждую минуту
    refetchOnWindowFocus: true
  });

  // Filter sales data based on selected filters
  const filteredSales = useMemo(() => {
    return sales.filter((sale: any) => {
      let match = true;

      // Filter by date range
      if (dateRange?.from) {
        const saleDate = new Date(sale.date);
        match = match && saleDate >= dateRange.from;

        if (dateRange.to) {
          match = match && saleDate <= dateRange.to;
        }
      }

      // Filter by category
      if (categoryId) {
        match = match && sale.product?.categoryId === categoryId;
      }

      // Filter by employee
      if (employee) {
        match = match && sale.employee === employee;
      }

      return match;
    });
  }, [sales, dateRange, categoryId, employee]);

  // Calculate statistics
  const stats = useMemo(() => {
    return calculateStats(filteredSales);
  }, [filteredSales]);

  // Calculate admin stats
  const adminStats = useMemo(() => {
    if (user?.role !== "admin") return null;

    console.log("UsersData для расчета adminStats:", usersData);
    
    const usersArray = usersData as any[] || [];
    const totalUsers = usersArray.length;
    
    // Вместо проверки lastLogin, которое может отсутствовать, считаем всех пользователей активными
    // В реальном приложении здесь бы была проверка последней активности
    const activeUsers = totalUsers;
    
    const regularUsers = usersArray.filter((u) => u.role === "user").length;
    const adminUsers = usersArray.filter((u) => u.role === "admin").length;

    console.log(`Статистика пользователей: общее=${totalUsers}, активные=${activeUsers}, обычные=${regularUsers}, админы=${adminUsers}`);

    return {
      totalUsers,
      activeUsers,
      regularUsers,
      adminUsers
    };
  }, [usersData, user]);

  // Подготовка данных для графиков
  // Производительность товаров
  const productPerformanceData = useMemo(() => {
    const productSales: Record<string, number> = {};
    
    sales.forEach((sale: any) => {
      const productName = sale.product?.name || 'Unknown';
      productSales[productName] = (productSales[productName] || 0) + sale.quantity;
    });
    
    return Object.entries(productSales)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [sales]);

  // Продажи по дням
  const dailySalesData = useMemo(() => {
    const dailySales: Record<string, number> = {};
    
    // Создаем массив последних 7 дней
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });
    
    // Инициализируем все дни нулевыми значениями
    last7Days.forEach(dateStr => {
      dailySales[dateStr] = 0;
    });
    
    // Добавляем продажи
    sales.forEach((sale: any) => {
      try {
        const saleDate = sale.date ? new Date(sale.date) : new Date();
        // Проверяем, что дата валидная
        if (isNaN(saleDate.getTime())) {
          console.warn('Invalid date for sale:', sale);
          return; // Пропускаем невалидную дату
        }
        const dateStr = saleDate.toISOString().split('T')[0];
        if (last7Days.includes(dateStr)) {
          dailySales[dateStr] = (dailySales[dateStr] || 0) + (sale.price * sale.quantity);
        }
      } catch (error) {
        console.error('Error processing sale date:', error, sale);
      }
    });
    
    // Преобразуем в формат для графика
    return Object.entries(dailySales).map(([date, value]) => ({
      date: new Date(date).toLocaleDateString(locale, { weekday: 'short' }),
      value
    }));
  }, [sales, locale]);

  // Prepare chart data
  const monthlyRevenueData = useMemo(() => {
    if (!dashboardData?.monthlySales) {
      console.log("Dashboard: Нет данных dashboardData?.monthlySales", dashboardData);
      return [];
    }
    console.log("Dashboard: Получены dashboardData.monthlySales:", JSON.stringify(dashboardData.monthlySales, null, 2));
    
    // Используем явный массив месяцев вместо попытки получить его через t
    const months = [
      t('date.monthsLong.0'), t('date.monthsLong.1'), t('date.monthsLong.2'), 
      t('date.monthsLong.3'), t('date.monthsLong.4'), t('date.monthsLong.5'), 
      t('date.monthsLong.6'), t('date.monthsLong.7'), t('date.monthsLong.8'), 
      t('date.monthsLong.9'), t('date.monthsLong.10'), t('date.monthsLong.11')
    ];

    // Проверяем, есть ли реальные ненулевые данные
    const hasRealData = dashboardData.monthlySales.some((item: any) => {
      const revenue = typeof item.revenue === 'string' ? parseFloat(item.revenue) : item.revenue;
      return revenue > 0;
    });
    
    if (!hasRealData) {
      console.log("Dashboard: Предупреждение - все данные о доходах нулевые");
    }
    
    const mappedData = dashboardData.monthlySales.map((item: any) => {
      // Преобразуем строковое значение revenue в число
      const revenue = typeof item.revenue === 'string' ? parseFloat(item.revenue) : item.revenue;
      const totalSales = typeof item.totalSales === 'string' ? parseInt(item.totalSales) : item.totalSales;
      
      console.log(`Dashboard: Месяц ${item.month} (${months[item.month - 1]}), доход: ${revenue}, продажи: ${totalSales}`);
      
      return {
        month: months[item.month - 1], 
        revenue: revenue || 0,
        sales: totalSales || 0
      };
    });
    console.log("Dashboard: Сформированы monthlyRevenueData для графика:", JSON.stringify(mappedData, null, 2));
    return mappedData;
  }, [dashboardData?.monthlySales, t]);

  // Get top products data
  const topProductsData = useMemo(() => {
    if (!dashboardData?.topProducts) {
      console.log("Нет данных о топовых продуктах:", dashboardData);
      return [];
    }
    
    console.log("Top products data (debug):", dashboardData.topProducts);
    
    return dashboardData.topProducts.map((item: any) => {
      console.log(`Обработка продукта ${item.productName}:`, item);
      return {
        name: item.productName || 'Unknown',
        value: parseFloat(item.totalRevenue || 0),
        quantity: item.totalSold
      };
    })
    .sort((a: {value: number}, b: {value: number}) => b.value - a.value)
    .slice(0, 5);
  }, [dashboardData?.topProducts]);

  // Category data
  const categoryData = useMemo(() => {
    if (!dashboardData?.categorySales) {
      console.log("Нет данных о продажах по категориям:", dashboardData);
      return [];
    }
    
    console.log("Category sales data (debug):", dashboardData.categorySales);
    
    return dashboardData.categorySales.map((item: any) => {
      console.log(`Обработка категории ${item.categoryName}:`, item);
      return {
        name: item.categoryName || t('common.uncategorized'),
        value: parseFloat(item.totalRevenue || 0)
      };
    });
  }, [dashboardData?.categorySales, t]);

  // Цвета для графиков
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Extract unique employees for filter
  const employees = useMemo(() => {
    const uniqueEmployees = new Set<string>();
    sales.forEach((sale: any) => {
      if (sale.employee) {
        uniqueEmployees.add(sale.employee);
      }
    });
    return Array.from(uniqueEmployees);
  }, [sales]);

  // Export PDF mutation
  const exportMutation = useMutation({
    mutationFn: async () => {
      // Prepare chart data for the server
      const revenueChartData = {
        labels: Array.from({ length: 12 }, (_, i) => {
          return new Date(new Date().getFullYear(), i, 1).toLocaleString('default', { month: 'short' });
        }),
        datasets: [{
          label: t("charts.revenue.title"),
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] // Will be filled by server
        }]
      };

      // Prepare filters for server
      const filterData = {
        startDate: dateRange?.from,
        endDate: dateRange?.to,
        categoryId,
        employee
      };

      // Get PDF as blob
      const response = await apiRequest("POST", "/api/export-pdf", {
        title: t("reports.title"),
        filters: filterData,
        charts: {
          revenue: revenueChartData,
          // Other charts data will be generated server-side
        }
      });

      // Create blob from response
      if (response instanceof Response) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // Create download link and trigger download
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `sales-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        return url;
      }
      
      throw new Error('Invalid response from server');
    },
    onSuccess: () => {
      toast({
        title: t("reports.exportSuccess"),
        description: t("reports.exportSuccessDesc"),
      });
    },
    onError: (error) => {
      toast({
        title: t("reports.exportError"),
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle export
  const handleExport = () => {
    exportMutation.mutate();
  };

  // Loading state
  const isLoading = isSalesLoading || isLoadingCategories || isLoadingProducts || isLoadingUsers || isLoadingStatus;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t("common.loading")}
            </h3>
          </div>
        </div>
      </Layout>
    );
  }

  // Show admin dashboard
  if (user?.role === "admin") {
    return (
      <Layout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">
              {t("dashboard.adminDashboard")}
            </h2>
        </div>

          {/* User Statistics */}
          {adminStats && (
            <UserStats data={adminStats} />
          )}

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
            {/* User Activity Chart */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>{t("charts.userActivity.title")}</CardTitle>
                <CardDescription>{t("charts.userActivity.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <UserActivityChart />
              </CardContent>
            </Card>

            {/* User Sales Chart */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>{t("charts.userSales.title")}</CardTitle>
                <CardDescription>{t("charts.userSales.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <UserSalesChart />
              </CardContent>
            </Card>
        </div>

        {/* System Status */}
          {systemStatus && (
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.systemStatus")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {t("system.cpuUsage")}
                    </p>
                    <p className="text-2xl font-bold">
                      {systemStatus.cpuUsage}%
                    </p>
                </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {t("system.memoryUsage")}
                    </p>
                    <p className="text-2xl font-bold">
                      {systemStatus.memoryUsage}%
                    </p>
              </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {t("system.diskUsage")}
                    </p>
                    <p className="text-2xl font-bold">
                      {systemStatus.diskUsage}%
                    </p>
                </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {t("system.uptime")}
                    </p>
                    <p className="text-2xl font-bold">
                      {systemStatus.uptime} {t("system.days")}
                    </p>
              </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </Layout>
    );
  }

  // Show regular user dashboard
  return (
    <Layout title={t("pages.dashboard")}>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
            <h1 className="text-3xl font-bold">{t("dashboard.overview")}</h1>
            <p className="text-muted-foreground mt-1">
              {currentBusiness
                ? t("dashboard.welcomeBusiness", { name: currentBusiness.name })
                : t("dashboard.welcome")}
            </p>
              </div>
            </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <StatsCard
            title={t("stats.revenue")}
            value={formatCurrency(stats.revenue || 0)}
            icon={<DollarSign className="h-6 w-6" />}
            variant="blue"
            percentChange={stats.revenueChange}
          />
          <StatsCard
            title={t("stats.sales")}
            value={stats.totalSales || 0}
            icon={<ShoppingCart className="h-6 w-6" />}
            variant="green"
            percentChange={stats.salesChange}
          />
          <StatsCard
            title={t("stats.avgOrderValue")}
            value={formatCurrency(stats.avgOrderValue || 0)}
            icon={<BarChart3 className="h-6 w-6" />}
            variant="purple"
            percentChange={stats.avgOrderChange}
          />
          <StatsCard
            title={t("stats.products")}
            value={stats.totalProducts || 0}
            icon={<Package className="h-6 w-6" />}
            variant="amber"
            percentChange={stats.productsChange}
          />
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <Card className="col-span-full lg:col-span-2">
            <CardHeader>
              <CardTitle>{t("charts.productStats.title")}</CardTitle>
              <CardDescription>{t("charts.productStats.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductsStatsChart 
                data={undefined} 
                isLoading={isDashboardLoading}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t("charts.category.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryChart 
                data={categoryData} 
                isLoading={isSalesLoading}
              />
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>{t("charts.products.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductsChartDashboard 
                data={topProductsData} 
                isLoading={isDashboardLoading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Recent Sales Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.recentSales")}</CardTitle>
          </CardHeader>
          <CardContent>
            {sales.length > 0 ? (
              <SalesTable 
                sales={sales.slice(0, 5).map((sale: any) => {
                  // Если у продажи нет свойства product, но есть productId и доступны продукты
                  if (!sale.product && sale.productId && productsData.length > 0) {
                    // Найдем продукт по ID
                    const product = productsData.find((p: any) => p.id === sale.productId);
                    if (product) {
                      return { ...sale, product };
                    }
                  }
                  return sale;
                })} 
                products={productsData as any}
                isLoading={isSalesLoading || isLoadingProducts} 
                showPagination={false}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                {isSalesLoading ? t("common.dataLoading") : t("sales.noSales")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}