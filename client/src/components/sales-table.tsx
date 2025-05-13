import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/hooks/use-locale";
import { formatCurrency } from "@/lib/utils";
import { FileEdit, Trash2 } from "lucide-react";
import { Sale, Product } from "@/shared/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useBusiness } from "@/hooks/use-business";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface SalesTableProps {
  sales: Sale[];
  products?: Product[];
  onEdit?: (sale: Sale) => void;
  onDelete?: (sale: Sale) => void;
  isLoading?: boolean;
  showPagination?: boolean;
}

export function SalesTable({ 
  sales, 
  products = [], 
  onEdit,
  onDelete,
  isLoading = false,
  showPagination = true 
}: SalesTableProps) {
  const { t, locale } = useLocale();
  const { currentBusiness } = useBusiness();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");

  const ITEMS_PER_PAGE = 10;

  // Фильтрация продаж
  const filteredSales = useMemo(() => {
    if (!filter.trim()) return sales;
    
    const lowerFilter = filter.toLowerCase();
    return sales.filter((sale) => {
      const productName = getProductName(sale.productId).toLowerCase();
      const customerName = (sale.customerName || "").toLowerCase();
      const employee = (sale.employee || "").toLowerCase();
      
      return productName.includes(lowerFilter) || 
             customerName.includes(lowerFilter) || 
             employee.includes(lowerFilter);
    });
  }, [sales, filter]);

  // Пагинация
  const paginatedSales = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredSales.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSales, page]);

  // Функция для получения названия продукта по id
  const getProductName = (productId: number) => {
    if (!products || products.length === 0) {
      return t("common.unknown");
    }

    try {
      // Преобразуем productId в число для корректного сравнения
      const numericProductId = typeof productId === 'string' ? parseInt(productId) : productId;
      
      const product = products.find(p => p.id === numericProductId);
      if (!product) {
        console.warn(`Product ${numericProductId} not found in products list of ${products.length} products`);
        return t("common.unknown");
      }
      
      return product.name || t("common.unknown");
    } catch (error) {
      console.error("Error getting product name:", error);
      return t("common.unknown");
    }
  };

  // Мутация для создания тестовой продажи
  const createTestSaleMutation = useMutation({
    mutationFn: async () => {
      // Создаем список месяцев для тестовых продаж
      const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      const currentYear = new Date().getFullYear();
      
      // Получаем данные о пользователе и продуктах
      const userResponse = await apiRequest("GET", "/api/user");
      const userData = await (userResponse as Response).json();
      
      const productsResponse = await apiRequest("GET", "/api/products", undefined, {
        businessId: currentBusiness?.id
      });
      const products = await (productsResponse as Response).json();
      
      if (!products || products.length === 0) {
        throw new Error("No products available");
      }
      
      // Создаем продажи для каждого месяца
      const creationPromises = months.map(async (month) => {
        // Выбираем случайный продукт
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        
        // Генерируем случайное количество от 1 до 10
        const quantity = Math.floor(Math.random() * 10) + 1;
        
        // Создаем дату в указанном месяце
        const date = new Date(currentYear, month - 1, Math.floor(Math.random() * 28) + 1);
        
        // Создаем продажу
        return apiRequest("POST", "/api/sales", {
          productId: randomProduct.id,
          quantity: quantity,
          price: randomProduct.price,
          totalAmount: (randomProduct.price * quantity).toString(),
          saleDate: date.toISOString(),
          customerName: "Тестовый клиент",
          customerEmail: "test@example.com",
          paymentMethod: "card",
          businessId: currentBusiness?.id,
          userId: userData.id
        });
      });
      
      return Promise.all(creationPromises);
    },
    onSuccess: () => {
      toast({
        title: "Тестовые продажи созданы",
        description: "Данные для графиков успешно добавлены"
      });
      
      // Обновляем данные в кэше
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
    },
    onError: (error: any) => {
      console.error("Error creating test sales:", error);
      toast({
        title: "Ошибка создания тестовых продаж",
        description: error.message || "Не удалось создать тестовые продажи",
        variant: "destructive"
      });
    }
  });
  
  // Добавляем кнопку для создания тестовых продаж
  const handleCreateTestSales = () => {
    createTestSaleMutation.mutate();
  };

  // ВАЖНО: Хуки React (например, useEffect) должны вызываться до любых условных return!
  // Это правило React Hooks - все хуки должны вызываться на верхнем уровне компонента,
  // в одинаковом порядке при каждом рендере. Перемещаем useEffect сюда, чтобы избежать ошибки
  // "Rendered more hooks than during the previous render".
  useEffect(() => {
    if (products && products.length > 0) {
      console.log('Products available in SalesTable:', products.length);
      console.log('Product IDs:', products.map(p => p.id));
      // Показать первые несколько продаж с их productId
      if (sales && sales.length > 0) {
        console.log('First 3 sales with productId:', sales.slice(0, 3).map(s => ({
          id: s.id,
          productId: s.productId,
          productFound: products.some(p => p.id === s.productId)
        })));
      }
    } else {
      console.log('No products available in SalesTable');
    }
  }, [products, sales]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Проверяем отсутствие продуктов при наличии продаж
  if (products.length === 0 && sales.length > 0) {
    console.log("No products available, but have sales:", sales.length);
    return (
      <div className="text-center py-8 text-gray-500">
        {t("common.dataLoading")}
      </div>
    );
  }

  if (!sales || sales.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t("sales.noSales")}
      </div>
    );
  }

  return (
    <div>
      {showPagination && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <Input
              placeholder={t("sales.searchPlaceholder")}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-[250px]"
            />
            {!isLoading && (
              <Button 
                variant="outline" 
                onClick={handleCreateTestSales}
                disabled={createTestSaleMutation.isPending}
              >
                {createTestSaleMutation.isPending ? t("common.loading") : t("sales.createTestSales")}
              </Button>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {t("common.totalItems", { count: filteredSales.length })}
          </div>
        </div>
      )}
      
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200 dark:border-gray-800">
            <TableHead className="text-gray-700 dark:text-gray-300">{t("sales.date")}</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300">{t("sales.product")}</TableHead>
            <TableHead className="text-right text-gray-700 dark:text-gray-300">{t("sales.quantity")}</TableHead>
            <TableHead className="text-right text-gray-700 dark:text-gray-300">{t("sales.price")}</TableHead>
            <TableHead className="text-right text-gray-700 dark:text-gray-300">{t("sales.total")}</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300">{t("sales.employee")}</TableHead>
            {(onEdit || onDelete) && <TableHead className="text-right text-gray-700 dark:text-gray-300">{t("common.actions")}</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </TableCell>
            </TableRow>
          ) : paginatedSales.length > 0 ? (
            paginatedSales.map((sale) => (
              <TableRow 
                key={sale.id} 
                className="border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <TableCell className="text-gray-900 dark:text-gray-100">
                  {sale.saleDate ? (() => {
                    try {
                      const date = new Date(sale.saleDate);
                      // Проверяем, что дата валидна
                      return isNaN(date.getTime()) 
                        ? t('common.invalidDate') 
                        : date.toLocaleDateString(locale, { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          });
                    } catch (error) {
                      console.error('Date parsing error:', error);
                      return t('common.invalidDate');
                    }
                  })() : t('common.noDate')}</TableCell>
                <TableCell className="text-gray-900 dark:text-gray-100">
                  {sale.product?.name || getProductName(sale.productId)}
                </TableCell>
                <TableCell className="text-right text-gray-900 dark:text-gray-100">{sale.quantity}</TableCell>
                <TableCell className="text-right text-gray-900 dark:text-gray-100">{formatCurrency(sale.price)}</TableCell>
                <TableCell className="text-right text-gray-900 dark:text-gray-100">{formatCurrency(sale.price * sale.quantity)}</TableCell>
                <TableCell className="text-gray-900 dark:text-gray-100">{sale.employee || "-"}</TableCell>
                {(onEdit || onDelete) && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {onEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(sale)}
                          className="h-8 px-2 group hover:bg-blue-50 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
                        >
                          <FileEdit className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 mr-1" />
                          <span className="text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 text-sm font-medium">
                            {t("common.edit")}
                          </span>
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(sale)}
                          className="h-8 px-2 group hover:bg-red-50 dark:hover:bg-red-900/30 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 mr-1" />
                          <span className="text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 text-sm font-medium">
                            {t("common.delete")}
                          </span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                {t("common.noDataFound")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {showPagination && filteredSales.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-center space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page => Math.max(1, page - 1))}
            disabled={page === 1}
          >
            {t("common.previous")}
          </Button>
          <div className="text-sm">
            {page} / {Math.ceil(filteredSales.length / ITEMS_PER_PAGE)}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page => Math.min(Math.ceil(filteredSales.length / ITEMS_PER_PAGE), page + 1))}
            disabled={page === Math.ceil(filteredSales.length / ITEMS_PER_PAGE)}
          >
            {t("common.next")}
          </Button>
        </div>
      )}
    </div>
  );
}