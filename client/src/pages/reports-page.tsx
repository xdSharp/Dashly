
import { useState } from "react";
import { Layout } from "@/components/layout";
import { useLocale } from "@/hooks/use-locale";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileText, Download, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function ReportsPage() {
  const { t } = useLocale();
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<any>({ from: null, to: null });
  const [sections, setSections] = useState({
    sales: true,
    products: true,
    categories: true,
    revenue: true
  });

  const generateReportMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/reports/generate", data, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${new Date().toISOString()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  });

  const handleGenerateReport = () => {
    generateReportMutation.mutate({
      dateRange,
      sections
    });
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Отчеты</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Создавайте и экспортируйте отчеты по продажам и аналитике
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Настройки отчета
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label>Период</Label>
                <DateRangePicker 
                  value={dateRange}
                  onChange={setDateRange}
                />
              </div>

              <div className="space-y-4">
                <Label>Разделы отчета</Label>
                <div className="grid gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sales"
                      checked={sections.sales}
                      onCheckedChange={(checked) => 
                        setSections(prev => ({ ...prev, sales: !!checked }))}
                    />
                    <Label htmlFor="sales">Продажи</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="products"
                      checked={sections.products}
                      onCheckedChange={(checked) => 
                        setSections(prev => ({ ...prev, products: !!checked }))}
                    />
                    <Label htmlFor="products">Товары</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="categories"
                      checked={sections.categories}
                      onCheckedChange={(checked) => 
                        setSections(prev => ({ ...prev, categories: !!checked }))}
                    />
                    <Label htmlFor="categories">Категории</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="revenue"
                      checked={sections.revenue}
                      onCheckedChange={(checked) => 
                        setSections(prev => ({ ...prev, revenue: !!checked }))}
                    />
                    <Label htmlFor="revenue">Выручка</Label>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleGenerateReport}
                disabled={generateReportMutation.isPending}
                className="w-full"
              >
                {generateReportMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Генерация...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Скачать отчет
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
