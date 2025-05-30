import { useState } from "react";
import { Layout } from "@/components/layout";
import { useLocale } from "@/hooks/use-locale.tsx";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  DialogTitle,
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
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash, 
  UserCog,
  ShieldAlert,
  Loader2 
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Form schema for user edit
const userEditSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  role: z.string().min(1, "Role is required"),
  password: z.string().optional(),
});

export default function UsersPage() {
  const { t } = useLocale();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  
  // Setup form
  const form = useForm<z.infer<typeof userEditSchema>>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
    },
  });
  
  // Fetch users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/users");
      return await response.json();
    },
    enabled: !!user && user.role === "admin",
  });
  
  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      console.log("Мутация обновления пользователя, id:", id);
      console.log("Данные для обновления:", data);
      
      // Всегда используем основной эндпоинт обновления, если есть пароль или другие поля
      // Специальный эндпоинт для роли используем только если меняется только роль
      if (currentUser && currentUser.role !== data.role && 
          Object.keys(data).length === 1 && data.role) {
        // Если меняется только роль, используем специальный эндпоинт
        console.log("Используем специальный эндпоинт для изменения роли");
        const response = await apiRequest("PUT", `/api/admin/users/${id}/role`, { role: data.role });
        return await response.json();
      } else {
        // Иначе обновляем все данные вместе (включая пароль и роль)
        console.log("Используем основной эндпоинт для обновления всех данных");
        const response = await apiRequest("PUT", `/api/admin/users/${id}`, data);
        return await response.json();
      }
    },
    onSuccess: () => {
      toast({
        title: t("users.updateSuccess"),
        description: t("users.updateSuccessDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setDialogOpen(false);
      setCurrentUser(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: t("users.updateError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/users/${id}`);
      return response;
    },
    onSuccess: () => {
      toast({
        title: t("users.deleteSuccess"),
        description: t("users.deleteSuccessDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setDeleteDialogOpen(false);
      setCurrentUser(null);
    },
    onError: (error) => {
      toast({
        title: t("users.deleteError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle edit user
  const handleEdit = (user: any) => {
    setCurrentUser(user);
    
    form.setValue("name", user.name);
    form.setValue("email", user.email);
    form.setValue("role", user.role);
    
    setDialogOpen(true);
  };
  
  // Handle delete user
  const handleDelete = (user: any) => {
    setCurrentUser(user);
    setDeleteDialogOpen(true);
  };
  
  // Handle form submission
  const onSubmit = (values: z.infer<typeof userEditSchema>) => {
    if (currentUser) {
      const dataToSend = { ...values };
      
      // Если пароль пустой, удаляем его из данных
      if (!dataToSend.password || dataToSend.password.trim() === '') {
        delete dataToSend.password;
        console.log("Пароль пустой, удаляем поле");
      } else {
        // Показываем уведомление об изменении пароля
        console.log("Отправляем новый пароль для пользователя:", currentUser.id);
        toast({
          title: t("users.passwordChangeTitle"),
          description: t("users.passwordChangeDesc"),
        });
      }
      
      console.log("Данные для отправки:", dataToSend);
      updateUserMutation.mutate({ 
        id: currentUser.id, 
        data: dataToSend 
      });
    }
  };
  
  // Filter users by search term
  const filteredUsers = users.filter((user: any) => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // If the current user is not an admin, redirect or show error
  if (user?.role !== "admin") {
    return (
      <Layout title={t("pages.users")}>
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center">
            <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              {t("users.notAuthorized")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t("users.adminRequired")}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={t("pages.users")}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t("users.title")}</h1>
        <UserCog className="h-8 w-8 text-gray-500 dark:text-gray-400" />
      </div>
      
      {/* Search */}
      <div className="flex mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder={t("users.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent"
          />
        </div>
      </div>
      
      {/* Users Table */}
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800/30">
                <TableHead>{t("users.name")}</TableHead>
                <TableHead>{t("users.username")}</TableHead>
                <TableHead>{t("users.email")}</TableHead>
                <TableHead>{t("users.role")}</TableHead>
                <TableHead className="w-24">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((userData: any) => {
                  // Check if this is the current user (self)
                  const isSelf = userData.id === user?.id;
                  
                  return (
                    <TableRow key={userData.id} className={isSelf ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}>
                      <TableCell className="font-medium">{userData.name}</TableCell>
                      <TableCell>{userData.username}</TableCell>
                      <TableCell>{userData.email}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          userData.role === "admin" 
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" 
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}>
                          {userData.role === "admin" ? t("roles.admin") : t("roles.user")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                              <span className="sr-only">{t("common.openMenu")}</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <DropdownMenuLabel className="text-gray-700 dark:text-gray-300">{t("common.actions")}</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                            <DropdownMenuItem
                              onClick={() => handleEdit(userData)}
                              className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              {t("common.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(userData)}
                              className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10"
                              disabled={isSelf} // Disable delete for current user
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
                  <TableCell colSpan={5} className="h-24 text-center text-gray-500 dark:text-gray-400">
                    {searchTerm
                      ? t("users.noSearchResults")
                      : t("users.noUsers")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Edit User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        if (!open) {
          // При закрытии диалога сбрасываем форму и текущего пользователя
          setCurrentUser(null);
          form.reset();
        }
        setDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("users.editTitle")}</DialogTitle>
            <DialogDescription>{t("users.editDesc")}</DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              {/* Name */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  {t("users.name")}
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
              
              {/* Email */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  {t("users.email")}
                </Label>
                <div className="col-span-3">
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Password (optional) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  {t("users.newPassword")}
                </Label>
                <div className="col-span-3">
                  <Input
                    id="password"
                    type="password"
                    placeholder={t("users.noPasswordChange")}
                    {...form.register("password")}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("users.passwordChangeDesc")}
                  </p>
                </div>
              </div>
              
              {/* Role */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  {t("users.role")}
                </Label>
                <div className="col-span-3">
                  <Select
                    value={form.watch("role")}
                    onValueChange={(value) => form.setValue("role", value)}
                    disabled={currentUser?.id === user?.id} // Prevent changing own role
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder={t("users.selectRole")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">{t("roles.user")}</SelectItem>
                      <SelectItem value="admin">{t("roles.admin")}</SelectItem>
                    </SelectContent>
                  </Select>
                  {currentUser?.id === user?.id && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("users.cannotChangeOwnRole")}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("users.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("users.deleteConfirmDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => currentUser && deleteUserMutation.mutate(currentUser.id)}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending && (
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
