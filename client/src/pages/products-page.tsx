import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { useLocale } from "@/hooks/use-locale.tsx";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
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
});

export default function ProductsPage() {
  const { t } = useLocale();
  const { toast } = useToast();
  const { user } = useAuth();
  
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
    },
  });
  
  // Fetch data
  const { data: productsData = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/products"],
  });
  
  const { data: categoriesData = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["/api/categories"],
  });
  
  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/products", {
        ...data,
        userId: (await apiRequest("GET", "/api/user")).id,
        categoryId: parseInt(data.categoryId)
      });
    },
    onSuccess: () => {
      toast({
        title: t("products.createSuccess"),
        description: t("products.createSuccessDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.refetchQueries({ queryKey: ["/api/products"] });
      queryClient.refetchQueries({ queryKey: ["/api/categories"] });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: t("products.createError"),
        description: error.message,
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
    };
    
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
        <Button onClick={() => setDialogOpen(true)}>
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
                <TableHead className="w-24">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product: any) => {
                  // Find category name
                  const category = categoriesData.find((c: any) => c.id === product.categoryId);
                  // Check if user is admin or owner
                  const canModify = user?.role === "admin" || product.userId === user?.id;
                  
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{category?.name || "—"}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">{t("common.openMenu")}</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleEdit(product)}
                              disabled={!canModify}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              {t("common.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(product)}
                              className="text-red-600 dark:text-red-400"
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
                  <TableCell colSpan={3} className="h-24 text-center">
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
                    {...form.register("name")}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
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
                      {categoriesData.map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
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
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
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
