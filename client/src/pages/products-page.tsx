import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { useLocale } from "@/hooks/use-locale.tsx";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useBusiness } from "@/hooks/use-business";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash, 
  Search,
  Loader2
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Form schema for product
const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
});

export default function ProductsPage() {
  const { t } = useLocale();
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentBusiness } = useBusiness();
  
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any | null>(null);
  
  // Setup form
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      description: "",
      price: 0,
    },
  });
  
  // Fetch data
  const { data: productsData = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/products", currentBusiness?.id],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/products", undefined, {
        businessId: currentBusiness?.id
      });
      if (response instanceof Response) {
        return response.json();
      }
      return response;
    },
    enabled: !!currentBusiness
  });
  
  const { data: categoriesData = [], isLoading: isLoadingCategories } = useQuery({
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
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: !!currentBusiness
  });
  
  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      try {
        console.log("Creating product with data:", data);
        const userResponse = await apiRequest("GET", "/api/user");
        const userData = userResponse instanceof Response ? await userResponse.json() : userResponse;
        
        const productData = {
          ...data,
          userId: userData.id,
          price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
          description: data.description || ""
        };
        
        console.log("Final product data:", productData);
        const response = await apiRequest("POST", "/api/products", productData);
        
        if (response instanceof Response) {
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to create product");
          }
          const result = await response.json();
          console.log("Created product:", result);
          return result;
        }
        return response;
      } catch (error: any) {
        console.error("Error in product creation:", error);
        throw new Error(error.message || "Failed to create product");
      }
    },
    onSuccess: (data) => {
      console.log("Product created successfully:", data);
      toast({
        title: t("products.createSuccess"),
        description: t("products.createSuccessDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.refetchQueries({ queryKey: ["/api/products"] });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      console.error("Error creating product:", error);
      toast({
        title: t("products.createError"),
        description: error.message || t("products.createError"),
        variant: "destructive",
      });
    },
  });
  
  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest("PUT", `/api/products/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: t("products.updateSuccess"),
        description: t("products.updateSuccessDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setDialogOpen(false);
      setIsEditing(false);
      setCurrentProduct(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: t("products.updateError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      toast({
        title: t("products.deleteSuccess"),
        description: t("products.deleteSuccessDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setDeleteDialogOpen(false);
      setCurrentProduct(null);
    },
    onError: (error) => {
      toast({
        title: t("products.deleteError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (values: z.infer<typeof productSchema>) => {
    const data = {
      name: values.name,
      categoryId: parseInt(values.categoryId),
      description: values.description,
      price: values.price,
      businessId: currentBusiness?.id,
    };
    
    console.log("Form values:", values);
    console.log("Submitting data:", data);
    
    if (isEditing && currentProduct) {
      updateProductMutation.mutate({ id: currentProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };
  
  // Handle edit
  const handleEdit = (product: any) => {
    setCurrentProduct(product);
    setIsEditing(true);
    
    // Set form values
    form.setValue("name", product.name);
    form.setValue("categoryId", product.categoryId.toString());
    
    setDialogOpen(true);
  };
  
  // Handle delete
  const handleDelete = (product: any) => {
    setCurrentProduct(product);
    setDeleteDialogOpen(true);
  };
  
  // Handle dialog close
  const handleDialogClose = () => {
    setDialogOpen(false);
    setIsEditing(false);
    setCurrentProduct(null);
    form.reset();
  };

  // Handle dialog open
  const handleDialogOpen = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    setDialogOpen(true);
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (currentProduct) {
      deleteProductMutation.mutate(currentProduct.id);
    }
  };
  
  // Filter products by search term
  const filteredProducts = productsData.filter((product: any) => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Loading state
  const isLoading = isLoadingProducts || isLoadingCategories;
  
  return (
    <Layout title={t("pages.products")}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("products.title")}</h1>
        <Button onClick={handleDialogOpen}>
          <Plus className="mr-2 h-4 w-4" />
          {t("products.addNew")}
        </Button>
      </div>
      
      {/* Search */}
      <div className="flex mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder={t("products.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {/* Products Table */}
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("products.name")}</TableHead>
                <TableHead>{t("products.category")}</TableHead>
                <TableHead>{t("products.price")}</TableHead>
                <TableHead className="max-w-[300px]">{t("products.description")}</TableHead>
                <TableHead className="w-24 text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product: any) => {
                  const category = categoriesData.find((c: any) => c.id === product.categoryId);
                  const canModify = user?.role === "admin" || product.userId === user?.id;
                  
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{category?.name || "—"}</TableCell>
                      <TableCell>
                        {product.price ? `${product.price.toLocaleString()} ₽` : "—"}
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <div className="truncate">
                          {product.description || "—"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-white/10"
                            >
                              <span className="sr-only">{t("common.openMenu")}</span>
                              <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-white" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuLabel className="text-gray-700 dark:text-gray-200">{t("common.actions")}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleEdit(product)}
                              disabled={!canModify}
                              className="cursor-pointer text-gray-600 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              {t("common.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(product)}
                              className="cursor-pointer text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              disabled={!canModify}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              {t("common.delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    {searchTerm
                      ? t("products.noSearchResults")
                      : t("products.noProducts")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Create/Edit Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? t("products.editTitle") : t("products.createTitle")}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? t("products.editDesc") : t("products.createDesc")}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              {/* Name */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  {t("products.name")}*
                </Label>
                <div className="col-span-3">
                  <Input
                    id="name"
                    placeholder={t("products.name")}
                    {...form.register("name")}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Description */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  {t("products.description")}
                </Label>
                <div className="col-span-3">
                  <Input
                    id="description"
                    placeholder={t("products.description")}
                    {...form.register("description")}
                  />
                </div>
              </div>

              {/* Price */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  {t("products.price")}
                </Label>
                <div className="col-span-3">
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    {...form.register("price", { 
                      setValueAs: (value) => value === "" ? 0 : parseFloat(value),
                      valueAsNumber: true 
                    })}
                  />
                </div>
              </div>
              
              {/* Category */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="categoryId" className="text-right">
                  {t("products.category")}*
                </Label>
                <div className="col-span-3">
                  <Select
                    value={form.watch("categoryId")}
                    onValueChange={(value) => form.setValue("categoryId", value)}
                  >
                    <SelectTrigger id="categoryId">
                      <SelectValue placeholder={t("products.selectCategory")} />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingCategories ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : categoriesData.length > 0 ? (
                        categoriesData.map((category: any) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-gray-500 text-center">
                          {t("categories.noCategories")}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.categoryId && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.categoryId.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleDialogClose}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={createProductMutation.isPending || updateProductMutation.isPending}
              >
                {(createProductMutation.isPending || updateProductMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? t("common.save") : t("common.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("products.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("products.deleteConfirmDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-gray-700 dark:text-gray-200">
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600 dark:text-white"
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
