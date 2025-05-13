import { useState } from "react";
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

// Form schema for category
const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export default function CategoriesPage() {
  const { t } = useLocale();
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentBusiness } = useBusiness();
  
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<any | null>(null);
  
  // Setup form
  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });
  
  // Fetch categories
  const { data: categoriesData = [], isLoading } = useQuery({
    queryKey: ["/api/categories", currentBusiness?.id],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/categories", undefined, { 
        businessId: currentBusiness?.id 
      });
      if (response instanceof Response) {
        const data = await response.json();
        console.log("Полученные категории:", data);
        return data;
      }
      return response;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: !!currentBusiness
  });
  
  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/categories", {
        ...data,
        businessId: currentBusiness?.id
      });
    },
    onSuccess: () => {
      toast({
        title: t("categories.createSuccess"),
        description: t("categories.createSuccessDesc"),
      });
      // Force query invalidation and refetch
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.refetchQueries({ queryKey: ["/api/categories"] });
      queryClient.refetchQueries({ queryKey: ["/api/products"] });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      console.error("Error creating category:", error);
      toast({
        title: t("categories.createError"),
        description: error.message || "Произошла ошибка при создании категории",
        variant: "destructive",
      });
    },
  });
  
  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest("PUT", `/api/categories/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: t("categories.updateSuccess"),
        description: t("categories.updateSuccessDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setDialogOpen(false);
      setIsEditing(false);
      setCurrentCategory(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: t("categories.updateError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      toast({
        title: t("categories.deleteSuccess"),
        description: t("categories.deleteSuccessDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setDeleteDialogOpen(false);
      setCurrentCategory(null);
    },
    onError: (error) => {
      toast({
        title: t("categories.deleteError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (values: z.infer<typeof categorySchema>) => {
    if (isEditing && currentCategory) {
      updateCategoryMutation.mutate({ id: currentCategory.id, data: values });
    } else {
      console.log("Создание категории с данными:", { ...values, businessId: currentBusiness?.id });
      createCategoryMutation.mutate(values);
    }
  };
  
  // Handle edit
  const handleEdit = (category: any) => {
    setCurrentCategory(category);
    setIsEditing(true);
    form.setValue("name", category.name);
    form.setValue("description", category.description || "");
    setDialogOpen(true);
  };
  
  // Handle delete
  const handleDelete = (category: any) => {
    setCurrentCategory(category);
    setDeleteDialogOpen(true);
  };
  
  // Handle dialog close
  const handleDialogClose = () => {
    setDialogOpen(false);
    setIsEditing(false);
    setCurrentCategory(null);
    form.reset();
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (currentCategory) {
      deleteCategoryMutation.mutate(currentCategory.id);
    }
  };
  
  // Filter categories by search term
  const filteredCategories = categoriesData.filter((category: any) => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <Layout title={t("pages.categories")}>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">{t("categories.title")}</h1>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t("categories.addNew")}
          </Button>
        </div>
        
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder={t("categories.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {/* Categories Table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : categoriesData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">{t("categories.noCategories")}</p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("categories.name")}</TableHead>
                  <TableHead>{t("categories.description")}</TableHead>
                  <TableHead className="w-[100px]">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>{category.description || "-"}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800">
                            <span className="sr-only">{t("common.openMenu")}</span>
                            <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuLabel className="text-gray-700 dark:text-gray-300">{t("common.actions")}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleEdit(category)}
                            className="text-gray-700 dark:text-gray-300 focus:text-gray-900 dark:focus:text-white"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            {t("common.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300"
                            onClick={() => {
                              setCurrentCategory(category);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            {t("common.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Create/Edit Category Dialog */}
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? t("categories.editTitle") : t("categories.createTitle")}
              </DialogTitle>
              <DialogDescription>
                {isEditing ? t("categories.editDesc") : t("categories.createDesc")}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("categories.name")}</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t("categories.description")}</Label>
                  <textarea
                    id="description"
                    className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder={t("categories.descriptionPlaceholder")}
                    {...form.register("description")}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setIsEditing(false);
                    setCurrentCategory(null);
                    form.reset();
                  }}
                >
                  {t("common.cancel")}
                </Button>
                <Button type="submit">
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
              <AlertDialogTitle>{t("categories.deleteConfirmTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("categories.deleteConfirmDesc")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={() => currentCategory && deleteCategoryMutation.mutate(currentCategory.id)}
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
