import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { useLocale } from "@/hooks/use-locale.tsx";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useBusiness } from "@/hooks/use-business";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Sale, Product, Category } from "@/shared/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SalesTable } from "@/components/sales-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";

// Form schema for sale
const saleSchema = z.object({
  productId: z.string().min(1, "Требуется выбрать продукт"),
  quantity: z.string().min(1, "Требуется указать количество"),
  price: z.string().optional(),
  totalAmount: z.string().optional(),
  employee: z.string().optional(),
  customerName: z.string().optional(),
  customerEmail: z.string().optional().refine(
    (email) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 
    { message: "Некорректный формат электронной почты" }
  ),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
  saleDate: z.string().optional().default(() => new Date().toISOString().split('T')[0])
});

export default function SalesPage() {
  const { t } = useLocale();
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentBusiness } = useBusiness();

  // State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSale, setCurrentSale] = useState<Sale | null>(null);
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);

  // Setup form
  const form = useForm<z.infer<typeof saleSchema>>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      productId: "",
      quantity: "",
      employee: "",
      customerName: "",
      customerEmail: "",
      paymentMethod: "",
      notes: "",
      saleDate: new Date().toISOString().split('T')[0],
    },
  });

  // Fetch data
  const { data: salesData = [], isLoading: isLoadingSales } = useQuery<Sale[]>({
    queryKey: ["/api/sales", currentBusiness?.id],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/sales", undefined, {
          businessId: currentBusiness?.id
        });
        if (response instanceof Response) {
          const data = await response.json();
          return data || [];
        }
        return response || [];
      } catch (error) {
        console.error("Error fetching sales:", error);
        return [];
      }
    },
    enabled: !!currentBusiness,
    staleTime: 30000,
    retry: 3
  });

  const { data: categoriesData = [], isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories", currentBusiness?.id],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/categories", undefined, {
        businessId: currentBusiness?.id
      });
      if (response instanceof Response) {
        return response.json();
      }
      return response;
    },
    enabled: !!currentBusiness
  });

  const { data: productsData = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products", currentBusiness?.id],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/products", undefined, {
          businessId: currentBusiness?.id
        });
        
        if (response instanceof Response) {
          const data = await response.json();
          return Array.isArray(data) ? data : [];
        }
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error("Error fetching products:", error);
        return [];
      }
    },
    enabled: !!currentBusiness,
    staleTime: 30000,
    retry: 3
  });

  // Эффект для отслеживания загрузки продуктов
  useEffect(() => {
    console.log('Products data changed:', {
      isLoading: isLoadingProducts,
      productsCount: productsData?.length || 0,
      hasProducts: !!productsData && productsData.length > 0
    });
  }, [productsData, isLoadingProducts]);

  // Проверяем состояние загрузки
  const isLoading = isLoadingSales || isLoadingProducts;

  // Если продукты не загружены, но загрузка завершена, делаем повторный запрос
  useEffect(() => {
    if (!isLoadingProducts && (!productsData || productsData.length === 0)) {
      console.log('No products loaded, triggering refetch...');
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    }
  }, [isLoadingProducts, productsData, queryClient]);

  // Create sale mutation
  const createSaleMutation = useMutation({
    mutationFn: async (data: any) => {
      const userResponse = await apiRequest("GET", "/api/user");
      const userData = await (userResponse as Response).json();

      return apiRequest("POST", "/api/sales", {
        ...data,
        userId: userData.id,
        businessId: currentBusiness?.id
      });
    },
    onSuccess: () => {
      toast({
        title: t("sales.createSuccess"),
        description: t("sales.createSuccessDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: t("sales.createError"),
        description: error.response?.data?.message || error.message || t("common.error"),
        variant: "destructive",
      });
    },
  });

  // Update sale mutation
  const updateSaleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      // Находим продукт в локальном кэше, если API не работает
      const selectedProduct = productsData.find(p => p.id === data.productId);
      
      if (!selectedProduct) {
        throw new Error(t("sales.productNotFound"));
      }

      return apiRequest("PUT", `/api/sales/${id}`, {
        ...data,
        price: selectedProduct.price,
        totalAmount: (selectedProduct.price * data.quantity).toString()
      });
    },
    onSuccess: () => {
      toast({
        title: t("sales.updateSuccess"),
        description: t("sales.updateSuccessDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      setDialogOpen(false);
      setIsEditing(false);
      setCurrentSale(null);
      form.reset();
    },
    onError: (error: any) => {
      console.error("Sale update error:", error);
      toast({
        title: t("sales.updateError"),
        description: error.response?.data?.message || error.message || t("common.error"),
        variant: "destructive",
      });
    },
  });

  // Delete sale mutation
  const deleteSaleMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/sales/${id}`);
    },
    onSuccess: () => {
      toast({
        title: t("sales.deleteSuccess"),
        description: t("sales.deleteSuccessDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      setDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: t("sales.deleteError"),
        description: error.response?.data?.message || error.message || t("common.error"),
        variant: "destructive",
      });
    },
  });

  // Handle edit
  const handleEdit = (sale: Sale) => {
    setCurrentSale(sale);
    setIsEditing(true);

    // Set form values
    form.setValue("productId", sale.productId.toString());
    form.setValue("quantity", sale.quantity.toString());
    form.setValue("employee", sale.employee || "");
    form.setValue("saleDate", sale.saleDate ? new Date(sale.saleDate).toISOString().split('T')[0] : "");
    form.setValue("customerName", sale.customerName || "");
    form.setValue("customerEmail", sale.customerEmail || "");
    form.setValue("paymentMethod", sale.paymentMethod || "");
    form.setValue("notes", sale.notes || "");

    setDialogOpen(true);
  };

  // Handle form submission
  const onSubmit = (values: z.infer<typeof saleSchema>) => {
    const selectedProduct = productsData.find(p => p.id === parseInt(values.productId));
    
    if (!selectedProduct) {
      toast({
        title: t("sales.productNotFound"),
        variant: "destructive"
      });
      return;
    }

    const data = {
      productId: parseInt(values.productId),
      quantity: parseInt(values.quantity),
      price: selectedProduct.price,
      totalAmount: (selectedProduct.price * parseInt(values.quantity)).toString(),
      employee: values.employee || "",
      saleDate: values.saleDate ? new Date(values.saleDate) : new Date(),
      customerName: values.customerName || "",
      customerEmail: values.customerEmail || "",
      paymentMethod: values.paymentMethod || "",
      notes: values.notes || ""
    };

    if (isEditing && currentSale) {
      // Если редактируем существующую продажу
      updateSaleMutation.mutate({ 
        id: currentSale.id, 
        data 
      });
    } else {
      // Если создаем новую продажу
      createSaleMutation.mutate(data);
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setDialogOpen(false);
    setIsEditing(false);
    setCurrentSale(null);
    form.reset();
  };

  // Update price and total amount when product or quantity changes
  useEffect(() => {
    const selectedProduct = productsData?.find(p => p.id === parseInt(form.watch("productId") || "0"));
    const quantity = parseInt(form.watch("quantity") || "0");
    
    if (selectedProduct && !isNaN(quantity)) {
      const price = selectedProduct.price;
      const total = price * quantity;
      
      form.setValue("price", formatCurrency(price));
      form.setValue("totalAmount", formatCurrency(total));
    }
  }, [form.watch("productId"), form.watch("quantity"), productsData]);

  // Helper function to get product name by id
  const getProductName = (productId: number) => {
    const product = productsData.find(p => p.id === productId);
    return product ? product.name : "Unknown";
  };

  // Обработчик удаления продажи
  const handleDeleteSale = () => {
    if (saleToDelete) {
      deleteSaleMutation.mutate(saleToDelete.id);
      setSaleToDelete(null);
    }
  };

  // Обработчик открытия диалога подтверждения удаления
  const handleOpenDeleteDialog = (sale: Sale) => {
    setSaleToDelete(sale);
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("sales.title")}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {currentBusiness
                ? t("sales.subtitle", { name: currentBusiness.name })
                : t("sales.subtitleDefault")}
            </p>
          </div>
          <Button 
            onClick={() => setDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/20 transition-all duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("sales.addNew")}
          </Button>
        </div>

        <Card className="border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              {t("sales.list")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <SalesTable 
              sales={salesData} 
              products={productsData}
              onEdit={handleEdit}
              onDelete={handleOpenDeleteDialog}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {/* Add/Edit Sale Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? t("sales.editTitle") : t("sales.createTitle")}
              </DialogTitle>
              <DialogDescription>
                {isEditing ? t("sales.editDesc") : t("sales.createDesc")}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("sales.product")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("sales.selectProduct")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {productsData?.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name} - {formatCurrency(product.price)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("sales.quantity")}</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("sales.price")}</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} disabled />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("sales.total")}</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} disabled />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("sales.employee")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="saleDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("sales.date")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          placeholder={t("sales.selectDate")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("sales.customerName")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("sales.customerEmail")}</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("sales.paymentMethod")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("sales.selectPaymentMethod")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash">{t("sales.paymentMethodCash")}</SelectItem>
                          <SelectItem value="card">{t("sales.paymentMethodCard")}</SelectItem>
                          <SelectItem value="transfer">{t("sales.paymentMethodTransfer")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("sales.notes")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={createSaleMutation.isPending || updateSaleMutation.isPending}>
                  {isEditing 
                    ? (updateSaleMutation.isPending 
                      ? t("common.loading") 
                      : t("common.edit")) 
                    : (createSaleMutation.isPending 
                      ? t("common.loading") 
                      : t("sales.addNew"))
                  }
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Диалог подтверждения удаления */}
        <AlertDialog 
          open={!!saleToDelete} 
          onOpenChange={() => setSaleToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("sales.deleteConfirmTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("sales.deleteConfirmDesc")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteSale}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {t("common.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}