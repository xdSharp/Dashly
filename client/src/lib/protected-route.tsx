import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { I18nProvider } from "../lib/i18n";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  path: string;
  adminOnly?: boolean; // Новый параметр для страниц, доступных только администраторам
}

export function ProtectedRoute({ component: Component, adminOnly = false, ...rest }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [hasLocalAuth, setHasLocalAuth] = useState(false);
  const [localUser, setLocalUser] = useState<any>(null);

  // Проверка локального хранилища при загрузке
  useEffect(() => {
    try {
      const localAuth = localStorage.getItem("userAuth");
      if (localAuth) {
        const parsed = JSON.parse(localAuth);
        if (parsed.isLoggedIn && parsed.user) {
          setHasLocalAuth(true);
          setLocalUser(parsed.user);
        }
      }
    } catch (error) {
      console.error("Ошибка при проверке локальной аутентификации:", error);
    }
  }, []);

  // Если загрузка еще идет, показываем индикатор загрузки
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="rounded-md bg-blue-500/10 p-8 text-blue-500 dark:text-blue-400 text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" />
          <p className="font-medium">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Проверяем, авторизован ли пользователь
  const currentUser = user || localUser;
  const isAuthenticated = !!currentUser;

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  // Если страница только для админов и текущий пользователь не админ, перенаправляем на дашборд
  if (adminOnly && currentUser.role !== "admin") {
    return <Redirect to="/dashboard" />;
  }

  // Если все проверки пройдены, отображаем компонент
  // Оборачиваем в I18nProvider для убедительности что контекст доступен
  return <Component {...rest} />;
}
