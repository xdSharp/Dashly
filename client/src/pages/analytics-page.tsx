import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  Package,
  Loader2,
  BarChart2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

// Тип данных для сводки продаж
interface SalesSummary {
  total_sales: number;
  total_revenue: string | number;
  average_sale: string | number;
  products_sold: number;
}

// Тип данных для топ продуктов
interface TopProduct {
  id: number;
  name: string;
  total_sold: number;
  total_revenue: string | number;
}

// Тип данных для ежемесячных продаж
interface MonthlySale {
  month: number;
  revenue: string | number;
}

// Названия месяцев
const monthNames = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

// Цвета для графиков
const COLORS = ["#4f86d6", "#48bb78", "#ed8936", "#f56565", "#9f7aea", "#667eea"];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [activeYear, setActiveYear] = useState(new Date().getFullYear());

  // Запрос для получения сводки продаж
  const { data: salesSummary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["/api/analytics/sales-summary"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/analytics/sales-summary");
      return res.json() as Promise<SalesSummary>;
    },
    enabled: !!user,
  });

  // Запрос для получения топ продуктов
  const { data: topProducts, isLoading: isLoadingTopProducts } = useQuery({
    queryKey: ["/api/analytics/top-products"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/analytics/top-products?limit=6");
      return res.json() as Promise<TopProduct[]>;
    },
    enabled: !!user,
  });

  // Запрос для получения ежемесячных продаж
  const { data: monthlySales, isLoading: isLoadingMonthlySales } = useQuery({
    queryKey: ["/api/analytics/monthly-sales", activeYear],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/analytics/monthly-sales?year=${activeYear}`
      );
      const data = (await res.json()) as MonthlySale[];
      
      // Преобразуем данные для отображения на графике
      return data.map((item) => ({
        ...item,
        month: monthNames[item.month - 1],
        revenue: Number(item.revenue),
      }));
    },
    enabled: !!user,
  });

  const isLoading = isLoadingSummary || isLoadingTopProducts || isLoadingMonthlySales;

  if (isLoading) {
    return (
      <Layout title="Аналитика">
        <div className="flex justify-center items-center min-h-[500px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Аналитика">
      <div className="space-y-6">
        {/* Карточки с обзором */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Всего продаж</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {salesSummary?.total_sales || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Общее количество проданных товаров
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Выручка</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Number(salesSummary?.total_revenue || 0).toLocaleString()} ₽
              </div>
              <p className="text-xs text-muted-foreground">
                Общая сумма всех продаж
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Средний чек</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Number(salesSummary?.average_sale || 0).toLocaleString()} ₽
              </div>
              <p className="text-xs text-muted-foreground">
                Средняя сумма продажи
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Видов товаров</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {salesSummary?.products_sold || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Количество проданных видов товаров
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Графики */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {/* Топ продуктов */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Топ продаваемых товаров</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              {topProducts && topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topProducts}
                      dataKey="total_sold"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#4f86d6"
                      label={({
                        cx,
                        cy,
                        midAngle,
                        innerRadius,
                        outerRadius,
                        percent,
                        name,
                      }) => {
                        const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
                        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                        return (
                          <text
                            x={x}
                            y={y}
                            fill="#888"
                            textAnchor={x > cx ? "start" : "end"}
                            dominantBaseline="central"
                            fontSize={12}
                          >
                            {`${name.slice(0, 15)}${name.length > 15 ? "..." : ""} (${(
                              percent * 100
                            ).toFixed(0)}%)`}
                          </text>
                        );
                      }}
                    >
                      {topProducts.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${value} шт.`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <BarChart2 className="h-12 w-12 text-muted-foreground opacity-50 mb-2" />
                  <p className="text-muted-foreground">Нет данных о продажах</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Продажи по месяцам */}
          <Card className="col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Продажи по месяцам</CardTitle>
                <Tabs
                  value={activeYear.toString()}
                  onValueChange={(value) => setActiveYear(Number(value))}
                >
                  <TabsList>
                    <TabsTrigger value={(activeYear - 1).toString()}>
                      {activeYear - 1}
                    </TabsTrigger>
                    <TabsTrigger value={activeYear.toString()}>
                      {activeYear}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="h-[300px]">
              {monthlySales && monthlySales.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => 
                        value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value
                      }
                    />
                    <Tooltip 
                      formatter={(value: number) => [
                        `${value.toLocaleString()} ₽`, 
                        "Продажи"
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Продажи"
                      stroke="#4f86d6"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <BarChart2 className="h-12 w-12 text-muted-foreground opacity-50 mb-2" />
                  <p className="text-muted-foreground">Нет данных за выбранный год</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
} 