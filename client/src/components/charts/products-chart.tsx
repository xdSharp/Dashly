import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface ProductsChartProps {
  data: any[];
}

export function ProductsChart({ data }: ProductsChartProps) {
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
        text: 'Sales by Product',
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <Pie data={chartData} options={options} />
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Cell, Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/hooks/use-locale";

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
            <Tooltip />
            {chartData[0]?.children?.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Treemap>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}