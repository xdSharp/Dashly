import { QueryClient } from "@tanstack/react-query";
import { getApiUrl } from "../config";

// Базовый URL API
export const API_BASE_URL = getApiUrl();

// Создаем экземпляр QueryClient
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 минут
    },
  },
});

// Функция для создания запросов к API с правильной обработкой ошибок
export async function apiRequest(
  method: string,
  endpoint: string,
  data?: any,
  queryParams?: Record<string, any>,
  options?: { responseType?: 'json' | 'blob' | 'text', headers?: Record<string, string> }
) {
  try {
    // Используем базовый URL без дублирования /api в пути
    let url = endpoint.startsWith('/api') 
      ? `${API_BASE_URL.replace(/\/api$/, '')}${endpoint}`
      : `${API_BASE_URL}${endpoint}`;
      
    // Добавляем query параметры, если они есть
    if (queryParams && Object.keys(queryParams).length > 0) {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      url = `${url}${url.includes('?') ? '&' : '?'}${params.toString()}`;
    }
      
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    };

    const requestOptions: RequestInit = {
      method,
      headers,
      credentials: 'include', // Включаем куки для авторизации
    };

    // Добавляем тело запроса для не-GET запросов
    if (method !== 'GET' && data) {
      requestOptions.body = JSON.stringify(data);
    }

    const response = await fetch(url, requestOptions);

    // Проверяем статус ответа
    if (!response.ok) {
      let errorMsg = `API ошибка: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorMsg;
      } catch {
        // Если ответ не содержит валидный JSON, используем стандартное сообщение
      }
      
      // Особая обработка ошибок авторизации
      if (response.status === 401) {
        // Если это ошибка аутентификации, и это не запрос на проверку пользователя,
        // то обновляем состояние пользователя
        if (endpoint !== '/api/user') {
          queryClient.setQueryData(["/api/user"], null);
        }
      }
      
      throw new Error(errorMsg);
    }

    // Возвращаем ответ в зависимости от запрошенного типа
    if (options?.responseType === 'blob') {
      return await response.blob();
    } else if (options?.responseType === 'text') {
      return await response.text();
    }
    
    // По умолчанию возвращаем JSON
    return response;
  } catch (error) {
    // Пробрасываем ошибку дальше для обработки в компоненте
    throw error;
  }
}

// Функция-помощник для создания функции запроса для React Query
export function getQueryFn<T = any>(
  method: string = 'GET', 
  data?: any,
  queryParams?: Record<string, any>,
  options?: { responseType?: 'json' | 'blob' | 'text', headers?: Record<string, string> }
) {
  return async ({ queryKey }: { queryKey: string[] }): Promise<T> => {
    const endpoint = queryKey[0];
    const response = await apiRequest(method, endpoint, data, queryParams, options);
    if (response instanceof Response) {
      return await response.json();
    }
    return response as T;
  };
}
