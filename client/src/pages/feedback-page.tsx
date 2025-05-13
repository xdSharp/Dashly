import { useState } from "react";
import { Layout } from "@/components/layout";
import { useLocale } from "@/hooks/use-locale.tsx";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Star, Trash2, Loader2, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Feedback = {
  id: number;
  productId: number;
  userId: number;
  customerId: number;
  rating: number;
  comment: string;
  createdAt: string;
  product?: {
    name: string;
  };
  customer?: {
    name: string;
    email: string;
  };
};

type Product = {
  id: number;
  name: string;
};

type Customer = {
  id: number;
  name: string;
  email?: string;
};

export default function FeedbackPage() {
  const { t, locale } = useLocale();
  const { toast } = useToast();
  const [feedbackToDelete, setFeedbackToDelete] = useState<Feedback | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newFeedback, setNewFeedback] = useState<{
    productId: number | null;
    customerId: number | null;
    rating: number;
    comment: string;
  }>({
    productId: null,
    customerId: null,
    rating: 5,
    comment: "",
  });

  // Загрузка отзывов
  const { data: feedbacks = [], isLoading } = useQuery<Feedback[]>({
    queryKey: ['/api/feedback'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/feedback');
      return await response.json();
    },
  });

  // Загрузка товаров для выбора
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/products');
      return await response.json();
    },
  });

  // Загрузка клиентов для выбора
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/customers');
      return await response.json();
    },
  });

  // Мутация для удаления отзыва
  const deleteFeedbackMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/feedback/${id}`);
      return response;
    },
    onSuccess: () => {
      toast({
        title: t('feedback.deleteSuccess'),
        description: t('feedback.deleteSuccessDesc'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/feedback'] });
      setFeedbackToDelete(null);
    },
    onError: (error) => {
      toast({
        title: t('feedback.deleteError'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Мутация для создания отзыва
  const createFeedbackMutation = useMutation({
    mutationFn: async (data: typeof newFeedback) => {
      const response = await apiRequest('POST', '/api/feedback', data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: t('feedback.createSuccess'),
        description: t('feedback.createSuccessDesc'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/feedback'] });
      setIsCreateDialogOpen(false);
      setNewFeedback({
        productId: null,
        customerId: null,
        rating: 5,
        comment: "",
      });
    },
    onError: (error) => {
      toast({
        title: t('feedback.createError'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (feedback: Feedback) => {
    setFeedbackToDelete(feedback);
  };

  const confirmDelete = () => {
    if (feedbackToDelete) {
      deleteFeedbackMutation.mutate(feedbackToDelete.id);
    }
  };

  const handleCreateFeedback = () => {
    if (!newFeedback.productId || !newFeedback.customerId) {
      toast({
        title: t('feedback.createError'),
        description: t('feedback.formIncomplete'),
        variant: "destructive",
      });
      return;
    }
    
    createFeedbackMutation.mutate(newFeedback);
  };

  // Рендер звездного рейтинга
  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-300 dark:text-gray-600'
          }`}
        />
      ));
  };

  // Интерактивный рейтинг для формы
  const RatingInput = ({ value, onChange }: { value: number; onChange: (rating: number) => void }) => {
  return (
      <div className="flex">
        {Array(5).fill(0).map((_, i) => (
          <Star
            key={i}
            className={`h-6 w-6 cursor-pointer ${i < value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            onClick={() => onChange(i + 1)}
          />
        ))}
      </div>
    );
  };

  return (
    <Layout title={t('pages.feedback')}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('feedback.title')}</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('feedback.addNew')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t('feedback.createTitle')}</DialogTitle>
              <DialogDescription>{t('feedback.createDesc')}</DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="product">{t('feedback.product')}</Label>
                <Select 
                  onValueChange={(value) => setNewFeedback(prev => ({ ...prev, productId: Number(value) }))}
                >
                  <SelectTrigger id="product">
                    <SelectValue placeholder={locale === 'en' ? "Select product" : "Выберите товар"} />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
      </div>

              <div className="grid gap-2">
                <Label htmlFor="customer">{t('feedback.customer')}</Label>
                <Select 
                  onValueChange={(value) => setNewFeedback(prev => ({ ...prev, customerId: Number(value) }))}
                >
                  <SelectTrigger id="customer">
                    <SelectValue placeholder={locale === 'en' ? "Select customer" : "Выберите клиента"} />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="rating">{t('feedback.rating')}</Label>
                <RatingInput 
                  value={newFeedback.rating} 
                  onChange={(rating) => setNewFeedback(prev => ({ ...prev, rating }))} 
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="comment">{t('feedback.comment')}</Label>
                <Textarea 
                  id="comment" 
                  value={newFeedback.comment}
                  onChange={(e) => setNewFeedback(prev => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleCreateFeedback}
                disabled={createFeedbackMutation.isPending}
              >
                {createFeedbackMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t('common.create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
            </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('feedback.noFeedback')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {t('feedback.noFeedbackDesc')}
          </p>
                      </div>
      ) : (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-transparent">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800/30">
                <TableHead>{t('feedback.product')}</TableHead>
                <TableHead>{t('feedback.customer')}</TableHead>
                <TableHead>{t('feedback.rating')}</TableHead>
                <TableHead className="w-1/3">{t('feedback.comment')}</TableHead>
                <TableHead>{t('feedback.date')}</TableHead>
                <TableHead className="w-16 text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedbacks.map((feedback) => (
                <TableRow key={feedback.id}>
                  <TableCell className="font-medium">
                    {feedback.product?.name || t('feedback.unknownProduct')}
                  </TableCell>
                  <TableCell>
                    {feedback.customer?.name || t('feedback.unknownCustomer')}
                    {feedback.customer?.email && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {feedback.customer.email}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex">
                      {renderStars(feedback.rating)}
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                        {feedback.rating}/5
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="line-clamp-2 text-sm">{feedback.comment}</p>
                  </TableCell>
                  <TableCell>
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(feedback)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
                ))}
            </TableBody>
          </Table>
              </div>
      )}

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={!!feedbackToDelete} onOpenChange={(open) => !open && setFeedbackToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('feedback.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('feedback.deleteDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              {deleteFeedbackMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
