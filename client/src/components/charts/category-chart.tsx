import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CategoryChartProps {
  data: any[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  // Process data for chart
  const categories = [...new Set(data.map(sale => sale.category?.name || 'Uncategorized'))];
  const salesByCategory = categories.map(category => {
    return data
      .filter(sale => (sale.category?.name || 'Uncategorized') === category)
      .reduce((sum, sale) => sum + sale.amount, 0);
  });

  const chartData = {
    labels: categories,
    datasets: [
      {
        label: 'Sales by Category',
        data: salesByCategory,
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
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
        text: 'Sales by Category',
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <Bar data={chartData} options={options} />
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/hooks/use-locale";

export function CategoryChartRecharts() { //Added to avoid naming conflict
  const { t } = useLocale();

  const { data: salesData = [] } = useQuery({
    queryKey: ["/api/sales"],
  });

  // Process sales data by category
  const categoryData = salesData.reduce((acc: any, sale: any) => {
    const category = sale.product?.category?.name || t("common.uncategorized");
    const value = sale.price * sale.quantity;
    acc[category] = (acc[category] || 0) + value;
    return acc;
  }, {});

  const chartData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("charts.categories.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}