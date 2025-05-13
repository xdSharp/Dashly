import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/hooks/use-locale";
import { Users, UserCog, ShieldAlert } from "lucide-react";

interface UserStatsProps {
  data: {
    totalUsers: number;
    activeUsers: number;
    regularUsers: number;
    adminUsers: number;
  };
}

export function UserStats({ data }: UserStatsProps) {
  const { t } = useLocale();

  // Логирование для отладки
  console.log("UserStats получил данные:", data);

  const stats = useMemo(() => [
    {
      title: t("stats.activeUsers"),
      value: data.activeUsers,
      icon: Users,
      description: t("stats.activeUsersDesc"),
      color: "text-green-500",
      bgColor: "bg-green-100 dark:bg-green-900/20"
    },
    {
      title: t("stats.regularUsers"),
      value: data.regularUsers,
      icon: UserCog,
      description: t("stats.regularUsersDesc"),
      color: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/20"
    },
    {
      title: t("stats.adminUsers"),
      value: data.adminUsers,
      icon: ShieldAlert,
      description: t("stats.adminUsersDesc"),
      color: "text-purple-500",
      bgColor: "bg-purple-100 dark:bg-purple-900/20"
    }
  ], [data, t]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="relative overflow-hidden">
            <div className={`absolute inset-0 ${stat.bgColor} opacity-10`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
              <div className={`h-1 w-full mt-4 rounded-full bg-muted overflow-hidden`}>
                <div
                  className={`h-full ${stat.color} bg-current transition-all duration-500`}
                  style={{
                    width: `${(stat.value / data.totalUsers) * 100}%`
                  }}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 