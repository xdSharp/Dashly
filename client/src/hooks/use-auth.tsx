import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, InsertUser, LoginData } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, InsertUser>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Fetch current user
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/user");
        return await response.json();
      } catch (error) {
        // Если пользователь не авторизован, возвращаем null вместо ошибки
        if (error instanceof Error && error.message.includes("401")) {
          return null;
        }
        throw error;
      }
    },
    staleTime: 0, // Всегда получать свежие данные
    refetchOnWindowFocus: true, // Обновлять при фокусе окна
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const response = await apiRequest("POST", "/api/login", credentials);
      return await response.json();
    },
    onSuccess: (user: User) => {
      console.log("Login successful, user data:", user);
      queryClient.setQueryData(["/api/user"], user);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Вход выполнен",
        description: `Добро пожаловать, ${user.name}!`,
        variant: "default",
      });
      
      // Сохраняем данные пользователя в локальном хранилище как запасной вариант
      localStorage.setItem("userAuth", JSON.stringify({
        isLoggedIn: true,
        user: user
      }));
      
      // Редирект в зависимости от роли пользователя
      setTimeout(() => {
        // Если пользователь - администратор, перенаправляем на страницу пользователей (админ-панель)
        // В противном случае - на обычную панель мониторинга
        const redirectPath = user.role === "admin" ? "/users" : "/dashboard";
        window.location.href = redirectPath;
      }, 500);
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка входа",
        description: error.message || "Неверное имя пользователя или пароль",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const response = await apiRequest("POST", "/api/register", userData);
      return await response.json();
    },
    onSuccess: (user: User) => {
      console.log("Registration successful, user data:", user);
      queryClient.setQueryData(["/api/user"], user);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Сохраняем данные пользователя в локальном хранилище как запасной вариант
      localStorage.setItem("userAuth", JSON.stringify({
        isLoggedIn: true,
        user: user
      }));
      
      toast({
        title: "Регистрация успешна",
        description: `Добро пожаловать, ${user.name}!`,
        variant: "default",
      });
      
      // При регистрации всегда перенаправляем в панель мониторинга пользователя,
      // т.к. регистрация с ролью "admin" запрещена
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка регистрации",
        description: error.message || "Не удалось создать аккаунт",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
      // Очищаем локальное хранилище при выходе
      localStorage.removeItem("userAuth");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Выход выполнен",
        description: "Вы успешно вышли из системы",
        variant: "default",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка при выходе",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
