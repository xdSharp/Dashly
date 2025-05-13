import { getApiUrl } from '../main';

/**
 * Базовая функция для выполнения API-запросов
 */
export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const apiUrl = getApiUrl();
  const url = `${apiUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };
  
  const response = await fetch(url, { ...defaultOptions, ...options });
  
  // Проверка на ошибки HTTP
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || `API error: ${response.status}`);
    throw Object.assign(error, { status: response.status, data: errorData });
  }
  
  // Для ответов без содержимого
  if (response.status === 204) {
    return {} as T;
  }
  
  return response.json();
}

/**
 * GET запрос
 */
export function get<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  return fetchApi<T>(endpoint, { ...options, method: 'GET' });
}

/**
 * POST запрос
 */
export function post<T = any>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
  return fetchApi<T>(endpoint, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT запрос
 */
export function put<T = any>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
  return fetchApi<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE запрос
 */
export function del<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  return fetchApi<T>(endpoint, { ...options, method: 'DELETE' });
} 