
import { useState } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useLocale } from "@/hooks/use-locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MessageSquare, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function FeedbackPage() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState("");
  const [category, setCategory] = useState("");

  const submitFeedbackMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/feedback", data);
    },
    onSuccess: () => {
      setFeedback("");
      setCategory("");
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
    }
  });

  const { data: feedbackHistory = [] } = useQuery({
    queryKey: ["/api/feedback"],
    enabled: user?.role === "admin"
  });

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Обратная связь</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Поделитесь своими идеями и предложениями
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Отправить отзыв
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Категория</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bug">Ошибка</SelectItem>
                    <SelectItem value="feature">Предложение</SelectItem>
                    <SelectItem value="improvement">Улучшение</SelectItem>
                    <SelectItem value="other">Другое</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Сообщение</Label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Опишите вашу идею или проблему..."
                  rows={5}
                />
              </div>

              <Button
                onClick={() => submitFeedbackMutation.mutate({ category, message: feedback })}
                disabled={!category || !feedback || submitFeedbackMutation.isPending}
                className="w-full"
              >
                {submitFeedbackMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  "Отправить отзыв"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {user?.role === "admin" && feedbackHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>История отзывов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedbackHistory.map((item: any) => (
                  <div key={item.id} className="border-b pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-medium">{item.user.name}</span>
                        <span className="text-sm text-gray-500 ml-2">{new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                      <span className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{item.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
