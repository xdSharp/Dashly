import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/hooks/use-locale";

export function RevenueChart() {
  const { t } = useLocale();

  const { data: salesData = [] } = useQuery({
    queryKey: ["/api/sales"],
  });

  // Process sales data for chart
  const monthlyRevenue = salesData.reduce((acc: any[], sale: any) => {
    const date = new Date(sale.date);
    const month = date.getMonth();
    acc[month] = (acc[month] || 0) + (sale.price * sale.quantity);
    return acc;
  }, Array(12).fill(0));

  const chartData = monthlyRevenue.map((revenue, idx) => ({
    month: new Date(0, idx).toLocaleString('default', { month: 'short' }),
    revenue
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("charts.revenue.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#0091ff" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}