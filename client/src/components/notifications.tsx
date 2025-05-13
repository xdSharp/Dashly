import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocale } from "@/hooks/use-locale";

type Notification = {
  id: number;
  message: string;
  type: 'info' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  userId: number;
};

export function Notifications() {
  const { t } = useLocale();
  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState(0);

  const { data: notifications = [], isLoading, error } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/notifications');
      return await response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const markAsRead = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('POST', `/api/notifications/${id}/read`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  useEffect(() => {
    if (Array.isArray(notifications)) {
      setUnreadCount(notifications.filter(n => !n.read).length);
    }
  }, [notifications]);

  const getNotificationTypeStyle = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-l-4 border-orange-500 pl-3';
      case 'error':
        return 'border-l-4 border-red-500 pl-3';
      default:
        return 'border-l-4 border-blue-500 pl-3';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-gray-700 dark:text-blue-200 hover:bg-gray-100 dark:hover:bg-gray-700/30">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-white dark:bg-gray-800/90 border-gray-200 dark:border-gray-700">
        <DropdownMenuLabel className="text-gray-800 dark:text-white">{t('notifications.title')}</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
        {isLoading ? (
          <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
            {t('notifications.loading')}
          </div>
        ) : error ? (
          <div className="p-4 text-center text-sm text-red-500">
            {t('notifications.error')}
          </div>
        ) : !notifications?.length ? (
          <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
            {t('notifications.empty')}
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 ${getNotificationTypeStyle(notification.type)}`}
              onClick={() => !notification.read && markAsRead.mutate(notification.id)}
            >
              <div className="w-full">
                <p className={`text-sm ${notification.read ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-white font-medium'}`}>
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
