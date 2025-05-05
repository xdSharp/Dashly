import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { useLocale } from "@/hooks/use-locale.tsx";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import { Plus, Loader2 } from "lucide-react";
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

// Form schema for sale
const saleSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  price: z.string().min(1, "Price is required"),
  quantity: z.string().min(1, "Quantity is required"),
  amount: z.string().min(1, "Amount is required"),
  employee: z.string().optional(),
  date: z.string().min(1, "Date is required"),
});

export default function SalesPage() {
  const { t } = useLocale();
  const { toast } = useToast();

  // State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSale, setCurrentSale] = useState<Sale | null>(null);

  // Setup form
  const form = useForm<z.infer<typeof saleSchema>>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      productId: "",
      price: "",
      quantity: "",
      amount: "",
      employee: "",
      date: new Date().toISOString().split("T")[0],
    },
  });

  // Fetch data
  const { data: salesData = [], isLoading: isLoadingSales } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  const { data: categoriesData = [], isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: productsData = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Create sale mutation
  const createSaleMutation = useMutation({
    mutationFn: async (data: any) => {
      // Получаем пользователя отдельно
      const userResponse = await apiRequest("GET", "/api/user");
      const userData = await userResponse.json();

      return apiRequest("POST", "/api/sales", {
        ...data,
        userId: userData.id
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
    onError: (error) => {
      toast({
        title: t("sales.createError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update sale mutation
  const updateSaleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest("PUT", `/api/sales/${id}`, data);
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
    onError: (error) => {
      toast({
        title: t("sales.updateError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: z.infer<typeof saleSchema>) => {
    const data = {
      productId: parseInt(values.productId),
      price: parseFloat(values.price),
      quantity: parseInt(values.quantity),
      amount: parseFloat(values.amount),
      employee: values.employee || "",
      date: new Date(values.date).toISOString(),
    };

    if (isEditing && currentSale) {
      updateSaleMutation.mutate({ id: currentSale.id, data });
    } else {
      createSaleMutation.mutate(data);
    }
  };

  // Handle edit
  const handleEdit = (sale: Sale) => {
    setCurrentSale(sale);
    setIsEditing(true);

    // Set form values
    form.setValue("productId", sale.productId.toString());
    form.setValue("price", sale.price.toString());
    form.setValue("quantity", sale.quantity.toString());
    form.setValue("amount", sale.amount.toString());
    form.setValue("employee", sale.employee || "");
    form.setValue("date", new Date(sale.date).toISOString().split("T")[0]);

    setDialogOpen(true);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setDialogOpen(false);
    setIsEditing(false);
    setCurrentSale(null);
    form.reset();
  };

  // Update amount when price or quantity changes
  useEffect(() => {
    const price = parseFloat(form.watch("price") || "0");
    const quantity = parseInt(form.watch("quantity") || "0");

    if (!isNaN(price) && !isNaN(quantity)) {
      form.setValue("amount", (price * quantity).toString());
    }
  }, [form.watch("price"), form.watch("quantity")]);

  // Loading state
  const isLoading = isLoadingSales || isLoadingCategories || isLoadingProducts;

  // Helper function to get product name by id
  const getProductName = (productId: number) => {
    const product = productsData.find(p => p.id === productId);
    return product ? product.name : "Unknown";
  };

  return (
    <Layout title={t("pages.sales")}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("sales.title")}</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("sales.addNew")}
        </Button>
      </div>

      {/* Sales Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : salesData.length === 0 ? (
        <div className="text-center py-10 border rounded-md">
          <p className="text-lg text-muted-foreground">{t("sales.noResults")}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setDialogOpen(true)}
          >
            {t("sales.addNew")}
          </Button>
        </div>
      ) : (
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("sales.date")}</TableHead>
                <TableHead>{t("sales.product")}</TableHead>
                <TableHead className="text-right">{t("sales.quantity")}</TableHead>
                <TableHead className="text-right">{t("sales.price")}</TableHead>
                <TableHead className="text-right">{t("sales.total")}</TableHead>
                <TableHead>{t("sales.employee")}</TableHead>
                <TableHead className="text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesData.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                  <TableCell>{getProductName(sale.productId)}</TableCell>
                  <TableCell className="text-right">{sale.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(sale.price)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(sale.price * sale.quantity)}</TableCell>
                  <TableCell>{sale.employee || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(sale)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

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

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="productId">{t("products.name")}</Label>
                <Select
                  onValueChange={(value) => {
                    form.setValue("productId", value);
                    const product = productsData.find((p) => p.id === parseInt(value));
                    if (product) {
                      form.setValue("price", product.price.toString());
                    }
                  }}
                  defaultValue={form.getValues("productId")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("sales.selectProduct")} />
                  </SelectTrigger>
                  <SelectContent>
                    {productsData.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.productId && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.productId.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="price">{t("sales.price")}</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...form.register("price")}
                />
                {form.formState.errors.price && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.price.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="quantity">{t("sales.quantity")}</Label>
                <Input
                  id="quantity"
                  type="number"
                  {...form.register("quantity")}
                />
                {form.formState.errors.quantity && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.quantity.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="amount">{t("sales.amount")}</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  readOnly
                  {...form.register("amount")}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="employee">{t("sales.employee")}</Label>
                <Input
                  id="employee"
                  {...form.register("employee")}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="date">{t("sales.date")}</Label>
                <Input
                  id="date"
                  type="date"
                  {...form.register("date")}
                />
                {form.formState.errors.date && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.date.message}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={handleDialogClose}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={createSaleMutation.isPending || updateSaleMutation.isPending}>
                {(createSaleMutation.isPending || updateSaleMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? t("common.save") : t("sales.addNew")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}