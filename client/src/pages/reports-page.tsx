import { useState } from "react";
import { Layout } from "@/components/layout";
import { useLocale } from "@/hooks/use-locale";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileText, Download, Loader2, FileCheck } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useBusiness } from "@/hooks/use-business";

export default function ReportsPage() {
  const { t } = useLocale();
  const { user } = useAuth();
  const { toast } = useToast();
  const { currentBusiness } = useBusiness();
  const [sections, setSections] = useState({
    sales: true,
    products: true,
    categories: true,
    revenue: true
  });
  const [lastDownloadedReport, setLastDownloadedReport] = useState<string | null>(null);

  const generateReportMutation = useMutation({
    mutationFn: async (data: any) => {
      // Добавляем businessId если он есть
      const reportData = {
        ...data,
        businessId: currentBusiness?.id
      };
      
      console.log("Sending report request with data:", reportData);
      
      // Создаем запрос на генерацию отчета
      const response = await apiRequest("POST", "/api/reports/generate", reportData, {
        responseType: 'blob'
      });
      
      // Проверяем успешность запроса
      if (!(response instanceof Response) || !response.ok) {
        if (response instanceof Response) {
          // Если это ответ с ошибкой, пытаемся извлечь сообщение
          try {
            const errorText = await response.text();
            let errorMessage = t('reports.failedToGenerate');
            try {
              const errorJson = JSON.parse(errorText);
              errorMessage = errorJson.message || errorMessage;
            } catch {
              errorMessage = errorText || errorMessage;
            }
            throw new Error(errorMessage);
          } catch (e) {
            throw new Error(t('reports.failedToGenerate'));
          }
        }
        throw new Error(t('reports.failedToGenerate'));
      }
      
      // Получаем бинарные данные PDF
      const blob = await response.blob();
      
      // Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(blob);
      const filename = `report-${new Date().toISOString().slice(0, 10)}.pdf`;
      
      // Создаем элемент для скачивания и кликаем по нему
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Удаляем элемент и освобождаем URL
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      return filename;
    },
    onSuccess: (filename) => {
      toast({
        title: t('reports.successTitle'),
        description: t('reports.successDesc', { filename }),
        variant: "default",
      });
      setLastDownloadedReport(filename);
    },
    onError: (error: Error) => {
      toast({
        title: t('reports.generationError'),
        description: error.message || t('reports.failedToGenerate'),
        variant: "destructive",
      });
    }
  });

  const handleGenerateReport = () => {
    generateReportMutation.mutate({
      dateRange: { from: null, to: null },
      sections
    });
  };

  return (
    <Layout title={t('pages.reports')}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">{t('reports.pageTitle')}</h1>
        <p className="text-gray-500 dark:text-gray-400">
          {t('reports.pageDescription')}
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
              <FileText className="h-5 w-5" />
              {t('reports.settings')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-gray-700 dark:text-gray-300">{t('reports.sections')}</Label>
                <div className="grid gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sales"
                      checked={sections.sales}
                      onCheckedChange={(checked) => 
                        setSections(prev => ({ ...prev, sales: !!checked }))}
                    />
                    <Label htmlFor="sales" className="text-gray-700 dark:text-gray-300">{t('reports.sales')}</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="products"
                      checked={sections.products}
                      onCheckedChange={(checked) => 
                        setSections(prev => ({ ...prev, products: !!checked }))}
                    />
                    <Label htmlFor="products" className="text-gray-700 dark:text-gray-300">{t('reports.products')}</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="categories"
                      checked={sections.categories}
                      onCheckedChange={(checked) => 
                        setSections(prev => ({ ...prev, categories: !!checked }))}
                    />
                    <Label htmlFor="categories" className="text-gray-700 dark:text-gray-300">{t('reports.categories')}</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="revenue"
                      checked={sections.revenue}
                      onCheckedChange={(checked) => 
                        setSections(prev => ({ ...prev, revenue: !!checked }))}
                    />
                    <Label htmlFor="revenue" className="text-gray-700 dark:text-gray-300">{t('reports.revenue')}</Label>
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
                    {t('reports.generating')}
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    {t('reports.download')}
                  </>
                )}
              </Button>
              
              {lastDownloadedReport && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md flex items-center text-green-700 dark:text-green-400">
                  <FileCheck className="h-5 w-5 mr-2" />
                  <span className="text-sm">{t('reports.lastDownloaded')} {lastDownloadedReport}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
