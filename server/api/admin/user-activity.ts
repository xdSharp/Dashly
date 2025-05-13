import { db } from '@/db';
import { users, sessions } from '@/db/schema';
import { eq, and, gte } from 'drizzle-orm';
import { getDateDaysAgo } from '@/utils/date';

export async function GET(req: Request) {
  try {
    // Получаем данные за последние 7 дней
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    // Получаем активность пользователей за каждый день
    const activityData = await Promise.all(
      last7Days.map(async (dateStr) => {
        const startDate = new Date(dateStr);
        const endDate = new Date(dateStr);
        endDate.setDate(endDate.getDate() + 1);

        const activeSessions = await db
          .select({ userId: sessions.userId })
          .from(sessions)
          .where(
            and(
              gte(sessions.lastActivity, startDate),
              eq(sessions.active, true)
            )
          );

        return {
          date: dateStr,
          activeUsers: new Set(activeSessions.map(session => session.userId)).size
        };
      })
    );

    return new Response(JSON.stringify(activityData), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch user activity' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 