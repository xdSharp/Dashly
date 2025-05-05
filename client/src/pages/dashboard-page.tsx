import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { Layout } from "@/components/layout";
import { useLocale } from "@/hooks/use-locale.tsx";
import { useAuth } from "@/hooks/use-auth";
import { StatsCard } from "@/components/stats-card";
import { SalesTable } from "@/components/sales-table";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { CategoryChart } from "@/components/charts/category-chart";
import { ProductsChart } from "@/components/charts/products-chart";
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
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const { t } = useLocale();
  const { toast } = useToast();
  const { user } = useAuth();

  // Filters state
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [employee, setEmployee] = useState<string | undefined>();

  // Fetch sales data
  const { data: salesData = [], isLoading: isLoadingSales } = useQuery({
    queryKey: ["/api/sales"],
  });

  // Fetch categories
  const { data: categoriesData = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Fetch products
  const { data: productsData = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/products"],
  });

  // Fetch admin data
  const { data: usersData = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: user?.role === "admin",
  });

  // Filter sales data based on selected filters
  const filteredSales = useMemo(() => {
    return salesData.filter((sale: any) => {
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
  }, [salesData, dateRange, categoryId, employee]);

  // Calculate statistics
  const stats = useMemo(() => {
    return calculateStats(filteredSales);
  }, [filteredSales]);

  // Calculate admin stats
  const adminStats = useMemo(() => {
    if (user?.role !== "admin") return null;

    const totalUsers = usersData.length;
    const activeUsers = usersData.filter((u: any) => u.lastLogin > Date.now() - 7 * 24 * 60 * 60 * 1000).length;
    const regularUsers = usersData.filter((u: any) => u.role === "user").length;
    const adminUsers = usersData.filter((u: any) => u.role === "admin").length;

    return {
      totalUsers,
      activeUsers,
      regularUsers,
      adminUsers
    };
  }, [usersData, user]);

  // Extract unique employees for filter
  const employees = useMemo(() => {
    const uniqueEmployees = new Set<string>();
    salesData.forEach((sale: any) => {
      if (sale.employee) {
        uniqueEmployees.add(sale.employee);
      }
    });
    return Array.from(uniqueEmployees);
  }, [salesData]);

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
  const isLoading = isLoadingSales || isLoadingCategories || isLoadingProducts || isLoadingUsers;

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
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{t("dashboard.adminTitle")}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t("dashboard.adminDesc")}</p>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title={t("stats.totalUsers")}
            value={adminStats?.totalUsers || 0}
            icon={<Users className="h-6 w-6" />}
            variant="blue"
          />

          <StatsCard
            title={t("stats.activeUsers")}
            value={adminStats?.activeUsers || 0}
            icon={<UserCog className="h-6 w-6" />}
            variant="green"
          />

          <StatsCard
            title={t("stats.regularUsers")}
            value={adminStats?.regularUsers || 0}
            icon={<Users className="h-6 w-6" />}
            variant="purple"
          />

          <StatsCard
            title={t("stats.adminUsers")}
            value={adminStats?.adminUsers || 0}
            icon={<ShieldAlert className="h-6 w-6" />}
            variant="amber"
          />
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">{t("dashboard.systemStatus")}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-blue-500 mr-2" />
                  <span>{t("dashboard.totalProducts")}</span>
                </div>
                <span className="text-gray-500">0</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FolderOpen className="h-5 w-5 text-green-500 mr-2" />
                  <span>{t("dashboard.totalCategories")}</span>
                </div>
                <span className="text-gray-500">0</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ShoppingCart className="h-5 w-5 text-purple-500 mr-2" />
                  <span>{t("dashboard.totalSales")}</span>
                </div>
                <span className="text-gray-500">0</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">{t("dashboard.systemAlerts")}</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium">{t("dashboard.noProductsAlert")}</p>
                  <p className="text-sm text-gray-500">{t("dashboard.noProductsDesc")}</p>
                </div>
              </div>

              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium">{t("dashboard.noSalesAlert")}</p>
                  <p className="text-sm text-gray-500">{t("dashboard.noSalesDesc")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show regular user dashboard
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{t("dashboard.welcomeTitle")}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t("dashboard.welcomeDesc")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">{t("dashboard.getStarted")}</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <Package className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
              <div>
                <p className="font-medium">{t("dashboard.addProducts")}</p>
                <p className="text-sm text-gray-500">{t("dashboard.addProductsDesc")}</p>
              </div>
            </div>

            <div className="flex items-start">
              <FolderOpen className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <div>
                <p className="font-medium">{t("dashboard.createCategories")}</p>
                <p className="text-sm text-gray-500">{t("dashboard.createCategoriesDesc")}</p>
              </div>
            </div>

            <div className="flex items-start">
              <ShoppingCart className="h-5 w-5 text-purple-500 mr-2 mt-0.5" />
              <div>
                <p className="font-medium">{t("dashboard.trackSales")}</p>
                <p className="text-sm text-gray-500">{t("dashboard.trackSalesDesc")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}