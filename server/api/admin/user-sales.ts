import { db } from '@/db';
import { users, sales } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    // Получаем статистику продаж по пользователям
    const userSales = await db
      .select({
        userId: users.id,
        userName: users.name,
        totalSales: sql<number>`COUNT(${sales.id})`,
        totalRevenue: sql<number>`SUM(${sales.price} * ${sales.quantity})`
      })
      .from(users)
      .leftJoin(sales, eq(sales.userId, users.id))
      .groupBy(users.id, users.name)
      .orderBy(sql`totalRevenue DESC`);

    return new Response(JSON.stringify(userSales), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching user sales:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch user sales' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 