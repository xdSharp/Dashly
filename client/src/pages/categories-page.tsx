import { useState } from "react";
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
});

export default function CategoriesPage() {
  const { t } = useLocale();
  const { toast } = useToast();
  const { user } = useAuth();
  
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
    },
  });
  
  // Fetch categories
  const { data: categoriesData = [], isLoading } = useQuery({
    queryKey: ["/api/categories"],
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  
  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      const user = await apiRequest("GET", "/api/user");
      return apiRequest("POST", "/api/categories", {
        ...data,
        userId: user.id
      });
    },
    onSuccess: () => {
      toast({
        title: t("categories.createSuccess"),
        description: t("categories.createSuccessDesc"),
      });
      // Force query invalidation and refetch
      queryClient.invalidateQueries({ queryKey: ["/api/categories"], exact: true });
      queryClient.refetchQueries({ queryKey: ["/api/categories"], exact: true });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: t("categories.createError"),
        description: error.message,
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
      createCategoryMutation.mutate(values);
    }
  };
  
  // Handle edit
  const handleEdit = (category: any) => {
    setCurrentCategory(category);
    setIsEditing(true);
    form.setValue("name", category.name);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("categories.title")}</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("categories.addNew")}
        </Button>
      </div>
      
      {/* Search */}
      <div className="flex mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
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
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("categories.name")}</TableHead>
                <TableHead className="w-24">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category: any) => {
                  // Check if user is admin or owner
                  const canModify = user?.role === "admin" || category.userId === user?.id;
                  
                  return (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
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
                              onClick={() => handleEdit(category)}
                              disabled={!canModify}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              {t("common.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(category)}
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
                  <TableCell colSpan={2} className="h-24 text-center">
                    {searchTerm
                      ? t("categories.noSearchResults")
                      : t("categories.noCategories")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Create/Edit Category Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? t("categories.editTitle") : t("categories.createTitle")}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? t("categories.editDesc") : t("categories.createDesc")}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  {t("categories.name")}*
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
                disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
              >
                {(createCategoryMutation.isPending || updateCategoryMutation.isPending) && (
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
            <AlertDialogTitle>{t("categories.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("categories.deleteConfirmDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={deleteCategoryMutation.isPending}
            >
              {deleteCategoryMutation.isPending && (
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
