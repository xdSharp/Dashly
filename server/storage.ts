import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, and, desc, sql, gte, lte, like } from 'drizzle-orm';
import postgres from 'postgres';
import MemoryStore from 'memorystore';
import session from 'express-session';
import * as schema from '@shared/schema';

// Настройки подключения к PostgreSQL
const connectionString = process.env.DATABASE_URL || 
  `postgres://${process.env.DB_USER || 'dashly'}:${process.env.DB_PASSWORD || 'dashlypass'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'dashly_db'}`;

// Подключение к базе данных
const client = postgres(connectionString);
const db = drizzle(client, { schema });

// Создаем хранилище сессий в памяти
const MemorySessionStore = MemoryStore(session);
const sessionStore = new MemorySessionStore({
  checkPeriod: 86400000 // 24 часа
});

// Класс для работы с хранилищем данных
class Storage {
  // Хранилище сессий
  sessionStore: InstanceType<typeof MemorySessionStore>;
  
  constructor() {
    this.sessionStore = sessionStore;
  }

  // Methods for users
  async getUser(id: number) {
    const users = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return users[0] || null;
  }

  async getUserByUsername(username: string) {
    const users = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return users[0] || null;
  }

  async createUser(userData: schema.InsertUser) {
    console.log("Storage: createUser - входные данные:", userData);
    const newUsers = await db.insert(schema.users).values(userData).returning();
    const user = newUsers[0];
    console.log("Storage: createUser - созданный пользователь:", { 
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      email: user.email
    });
    return user;
  }

  async updateUser(id: number, userData: Partial<schema.InsertUser>) {
    const updatedUsers = await db.update(schema.users)
      .set(userData)
      .where(eq(schema.users.id, id))
      .returning();
    return updatedUsers[0] || null;
  }

  async getAllUsers() {
    return await db.select().from(schema.users);
  }

  // Метод для получения пользователей определенной роли
  async getUsersByRole(role: string) {
    return await db.select()
      .from(schema.users)
      .where(eq(schema.users.role, role));
  }

  // Метод для обновления роли пользователя (для админа)
  async updateUserRole(id: number, role: string) {
    const updatedUsers = await db.update(schema.users)
      .set({ role })
      .where(eq(schema.users.id, id))
      .returning();
    return updatedUsers[0] || null;
  }

  // Methods for businesses
  async getAllBusinesses(userId: number) {
    return await db.select()
      .from(schema.businesses)
      .where(eq(schema.businesses.userId, userId))
      .orderBy(schema.businesses.name);
  }

  async getBusiness(id: number) {
    const businesses = await db.select()
      .from(schema.businesses)
      .where(eq(schema.businesses.id, id));
    return businesses[0] || null;
  }

  async getDefaultBusiness(userId: number) {
    const businesses = await db.select()
      .from(schema.businesses)
      .where(and(
        eq(schema.businesses.userId, userId),
        eq(schema.businesses.isDefault, true)
      ));
    return businesses[0] || null;
  }

  async createBusiness(businessData: schema.InsertBusiness) {
    // Если создается новый бизнес с isDefault = true, сбросим статус у других
    if (businessData.isDefault === true) {
      await db.update(schema.businesses)
        .set({ isDefault: false })
        .where(eq(schema.businesses.userId, businessData.userId));
    }
    
    const newBusinesses = await db.insert(schema.businesses)
      .values(businessData)
      .returning();
    return newBusinesses[0];
  }

  async updateBusiness(id: number, businessData: Partial<schema.InsertBusiness>) {
    // Если обновляется статус бизнеса на isDefault = true, сбросим статус у других
    if (businessData.isDefault === true) {
      const business = await this.getBusiness(id);
      if (business) {
        await db.update(schema.businesses)
          .set({ isDefault: false })
          .where(and(
            eq(schema.businesses.userId, business.userId),
            sql`id != ${id}`
          ));
      }
    }
    
    const updatedBusinesses = await db.update(schema.businesses)
      .set(businessData)
      .where(eq(schema.businesses.id, id))
      .returning();
    return updatedBusinesses[0] || null;
  }

  async deleteBusiness(id: number) {
    // Проверяем, является ли бизнес дефолтным
    const business = await this.getBusiness(id);
    if (business && business.isDefault) {
      // Не разрешаем удаление единственного дефолтного бизнеса
      const businessCount = await db.select({ count: sql<number>`count(*)` })
        .from(schema.businesses)
        .where(eq(schema.businesses.userId, business.userId));
      
      if (businessCount[0].count === 1) {
        return false; // Не удаляем единственный бизнес пользователя
      }
      
      // Установим другой бизнес как дефолтный
      const otherBusiness = await db.select()
        .from(schema.businesses)
        .where(and(
          eq(schema.businesses.userId, business.userId),
          sql`id != ${id}`
        ))
        .limit(1);
      
      if (otherBusiness.length > 0) {
        await this.updateBusiness(otherBusiness[0].id, { isDefault: true });
      }
    }
    
    await db.delete(schema.businesses)
      .where(eq(schema.businesses.id, id));
    return true;
  }

  // Methods for categories
  async getAllCategories(userId: number, businessId?: number) {
    let query = db.select()
      .from(schema.categories)
      .where(eq(schema.categories.userId, userId))
      .orderBy(schema.categories.name);
    
    if (businessId) {
      query = db.select()
        .from(schema.categories)
        .where(and(
          eq(schema.categories.userId, userId),
          eq(schema.categories.businessId, businessId)
        ))
        .orderBy(schema.categories.name);
    }
    
    return await query;
  }

  async getCategory(id: number) {
    const categories = await db.select()
      .from(schema.categories)
      .where(eq(schema.categories.id, id));
    return categories[0] || null;
  }

  async createCategory(categoryData: schema.InsertCategory) {
    const newCategories = await db.insert(schema.categories)
      .values(categoryData)
      .returning();
    return newCategories[0];
  }

  async updateCategory(id: number, categoryData: Partial<schema.InsertCategory>) {
    const updatedCategories = await db.update(schema.categories)
      .set(categoryData)
      .where(eq(schema.categories.id, id))
      .returning();
    return updatedCategories[0] || null;
  }

  async deleteCategory(id: number) {
    await db.delete(schema.categories)
      .where(eq(schema.categories.id, id));
    return true;
  }

  // Methods for products
  async getAllProducts(userId: number, businessId?: number) {
    let query = db.select()
      .from(schema.products)
      .where(eq(schema.products.userId, userId))
      .orderBy(desc(schema.products.createdAt));
    
    if (businessId) {
      query = db.select()
        .from(schema.products)
        .where(and(
          eq(schema.products.userId, userId),
          eq(schema.products.businessId, businessId)
        ))
        .orderBy(desc(schema.products.createdAt));
    }
    
    return await query;
  }

  async getProduct(id: number) {
    const products = await db.select()
      .from(schema.products)
      .where(eq(schema.products.id, id));
    return products[0] || null;
  }

  async createProduct(productData: schema.InsertProduct) {
    const newProducts = await db.insert(schema.products)
      .values(productData)
      .returning();
    return newProducts[0];
  }

  async updateProduct(id: number, productData: Partial<schema.InsertProduct>) {
    const updatedProducts = await db.update(schema.products)
      .set(productData)
      .where(eq(schema.products.id, id))
      .returning();
    return updatedProducts[0] || null;
  }

  async deleteProduct(id: number) {
    await db.delete(schema.products)
      .where(eq(schema.products.id, id));
    return true;
  }

  // Methods for sales
  async getAllSales(userId: number, businessId?: number) {
    let query = db.select()
      .from(schema.sales)
      .where(eq(schema.sales.userId, userId))
      .orderBy(desc(schema.sales.saleDate));
    
    if (businessId) {
      query = db.select()
        .from(schema.sales)
        .where(and(
          eq(schema.sales.userId, userId),
          eq(schema.sales.businessId, businessId)
        ))
        .orderBy(desc(schema.sales.saleDate));
    }
    
    return await query;
  }

  async getSale(id: number) {
    const sales = await db.select()
      .from(schema.sales)
      .where(eq(schema.sales.id, id));
    return sales[0] || null;
  }

  async createSale(saleData: schema.InsertSale) {
    console.log("Storage: Creating sale with data:", saleData);
    try {
      const newSales = await db.insert(schema.sales)
        .values(saleData)
        .returning();
      console.log("Storage: Sale created successfully:", newSales[0]);
      return newSales[0];
    } catch (error) {
      console.error("Storage: Error creating sale:", error);
      throw error;
    }
  }

  async updateSale(id: number, saleData: Partial<schema.InsertSale>) {
    const updatedSales = await db.update(schema.sales)
      .set(saleData)
      .where(eq(schema.sales.id, id))
      .returning();
    return updatedSales[0] || null;
  }

  async deleteSale(id: number) {
    try {
      console.log(`Storage: Deleting sale with id: ${id}`);
      
      // Проверяем существование продажи
      const sale = await this.getSale(id);
      if (!sale) {
        console.log(`Storage: Sale with id ${id} not found`);
        return false;
      }
      
      await db.delete(schema.sales)
        .where(eq(schema.sales.id, id));
      
      console.log(`Storage: Sale with id ${id} deleted successfully`);
      return true;
    } catch (error) {
      console.error(`Storage: Error deleting sale with id ${id}:`, error);
      throw error;
    }
  }

  // Methods for customers
  async getAllCustomers(userId: number, businessId?: number) {
    let query = db.select()
      .from(schema.customers)
      .where(eq(schema.customers.userId, userId))
      .orderBy(schema.customers.name);
    
    if (businessId) {
      query = db.select()
        .from(schema.customers)
        .where(and(
          eq(schema.customers.userId, userId),
          eq(schema.customers.businessId, businessId)
        ))
        .orderBy(schema.customers.name);
    }
    
    return await query;
  }

  async getCustomer(id: number) {
    const customers = await db.select()
      .from(schema.customers)
      .where(eq(schema.customers.id, id));
    return customers[0] || null;
  }

  async createCustomer(customerData: schema.InsertCustomer) {
    const newCustomers = await db.insert(schema.customers)
      .values(customerData)
      .returning();
    return newCustomers[0];
  }

  async updateCustomer(id: number, customerData: Partial<schema.InsertCustomer>) {
    const updatedCustomers = await db.update(schema.customers)
      .set(customerData)
      .where(eq(schema.customers.id, id))
      .returning();
    return updatedCustomers[0] || null;
  }

  async deleteCustomer(id: number) {
    await db.delete(schema.customers)
      .where(eq(schema.customers.id, id));
    return true;
  }
  
  // Метод для удаления пользователя (для админа)
  async deleteUser(id: number) {
    await db.delete(schema.users)
      .where(eq(schema.users.id, id));
    return true;
  }
  
  // Methods for feedback
  async getAllFeedback(userId: number) {
    return await db.select()
      .from(schema.feedback)
      .where(eq(schema.feedback.userId, userId))
      .orderBy(desc(schema.feedback.createdAt));
  }
  
  async createFeedback(feedbackData: schema.InsertFeedback) {
    const newFeedback = await db.insert(schema.feedback)
      .values(feedbackData)
      .returning();
    return newFeedback[0];
  }
  
  async deleteFeedback(id: number) {
    await db.delete(schema.feedback)
      .where(eq(schema.feedback.id, id));
    return true;
  }

  // Методы для работы с уведомлениями
  async getUserNotifications(userId: number) {
    return await db.select()
      .from(schema.notifications)
      .where(eq(schema.notifications.userId, userId))
      .orderBy(desc(schema.notifications.createdAt));
  }
  
  async createNotification(notificationData: schema.InsertNotification) {
    const newNotifications = await db.insert(schema.notifications)
      .values(notificationData)
      .returning();
    return newNotifications[0];
  }
  
  async markNotificationAsRead(id: number, userId: number) {
    const updatedNotifications = await db.update(schema.notifications)
      .set({ read: true })
      .where(
        and(
          eq(schema.notifications.id, id),
          eq(schema.notifications.userId, userId)
        )
      )
      .returning();
    return updatedNotifications[0] || null;
  }

  // Methods for analytics
  async getSalesSummary(userId: number, businessId?: number) {
    let query = db.select({
      totalSales: sql<number>`count(*)`,
      revenue: sql<string>`sum(${schema.sales.totalAmount})`,
      averageOrder: sql<string>`avg(${schema.sales.totalAmount})`,
      totalQuantity: sql<number>`sum(${schema.sales.quantity})`
    })
    .from(schema.sales)
    .where(eq(schema.sales.userId, userId));
    
    if (businessId) {
      query = db.select({
        totalSales: sql<number>`count(*)`,
        revenue: sql<string>`sum(${schema.sales.totalAmount})`,
        averageOrder: sql<string>`avg(${schema.sales.totalAmount})`,
        totalQuantity: sql<number>`sum(${schema.sales.quantity})`
      })
      .from(schema.sales)
      .where(and(
        eq(schema.sales.userId, userId),
        eq(schema.sales.businessId, businessId)
      ));
    }
    
    const result = await query;
    return result[0];
  }
  
  async getTopProducts(userId: number, limit = 5, businessId?: number) {
    let query = db.select({
      productId: schema.sales.productId,
      productName: schema.products.name,
      totalSold: sql<number>`sum(${schema.sales.quantity})`,
      totalRevenue: sql<string>`sum(${schema.sales.totalAmount})`,
    })
    .from(schema.sales)
    .leftJoin(schema.products, eq(schema.sales.productId, schema.products.id))
    .where(eq(schema.sales.userId, userId))
    .groupBy(schema.sales.productId, schema.products.name)
    .orderBy(desc(sql`sum(${schema.sales.totalAmount})`))
    .limit(limit);
    
    if (businessId) {
      query = db.select({
        productId: schema.sales.productId,
        productName: schema.products.name,
        totalSold: sql<number>`sum(${schema.sales.quantity})`,
        totalRevenue: sql<string>`sum(${schema.sales.totalAmount})`,
      })
      .from(schema.sales)
      .leftJoin(schema.products, eq(schema.sales.productId, schema.products.id))
      .where(and(
        eq(schema.sales.userId, userId),
        eq(schema.sales.businessId, businessId)
      ))
      .groupBy(schema.sales.productId, schema.products.name)
      .orderBy(desc(sql`sum(${schema.sales.totalAmount})`))
      .limit(limit);
    }
    
    const result = await query;
    
    // Преобразуем результаты, чтобы заменить NULL значения
    return result.map(item => ({
      ...item,
      productName: item.productName || 'Неизвестный товар'
    }));
  }
  
  async getMonthlySales(userId: number, year = new Date().getFullYear(), businessId?: number) {
    const startDate = new Date(year, 0, 1); // January 1st of the given year
    const endDate = new Date(year, 11, 31, 23, 59, 59); // December 31st of the given year
    
    const startDateString = startDate.toISOString();
    const endDateString = endDate.toISOString();
    
    console.log(`Getting monthly sales for user ${userId}, year ${year}, businessId ${businessId || 'all'}`);
    console.log(`Date range: ${startDateString} - ${endDateString}`);

    let query;
    
    if (businessId) {
      // Запрос с фильтрацией по конкретному бизнесу
      console.log(`Executing query with specific businessId: ${businessId}`);
      query = db.select({
        month: sql<number>`EXTRACT(MONTH FROM ${schema.sales.saleDate})`,
        totalSales: sql<number>`count(*)`,
        revenue: sql<string>`sum(${schema.sales.totalAmount})`,
      })
      .from(schema.sales)
      .where(and(
        eq(schema.sales.userId, userId),
        eq(schema.sales.businessId, businessId),
        sql`${schema.sales.saleDate} BETWEEN ${startDateString} AND ${endDateString}`
      ))
      .groupBy(sql`EXTRACT(MONTH FROM ${schema.sales.saleDate})`)
      .orderBy(sql`EXTRACT(MONTH FROM ${schema.sales.saleDate})`);
    } else {
      // Запрос по всем бизнесам пользователя
      console.log(`Executing query for all businesses of user: ${userId}`);
      query = db.select({
        month: sql<number>`EXTRACT(MONTH FROM ${schema.sales.saleDate})`,
        totalSales: sql<number>`count(*)`,
        revenue: sql<string>`sum(${schema.sales.totalAmount})`,
      })
      .from(schema.sales)
      .where(and(
        eq(schema.sales.userId, userId),
        sql`${schema.sales.saleDate} BETWEEN ${startDateString} AND ${endDateString}`
      ))
      .groupBy(sql`EXTRACT(MONTH FROM ${schema.sales.saleDate})`)
      .orderBy(sql`EXTRACT(MONTH FROM ${schema.sales.saleDate})`);
    }
    
    const result = await query;
    console.log(`Raw monthly sales data (${result.length} records):`, JSON.stringify(result));
    
    // Если нет данных, создаем пустые записи для всех месяцев
    if (result.length === 0) {
      console.log("No monthly sales data found, creating empty dataset");
      return Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        totalSales: 0,
        revenue: "0"
      }));
    }
    
    // Заполняем пропущенные месяцы нулевыми значениями
    const filledMonths = Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1;
      const existingMonth = result.find(m => m.month === monthNum);
      
      if (existingMonth) {
        // Проверяем, что revenue существует и имеет валидное числовое значение
        const revenue = existingMonth.revenue !== null && existingMonth.revenue !== undefined ? 
          existingMonth.revenue : "0";
        
        console.log(`Month ${monthNum}: Found data - revenue=${revenue}, sales=${existingMonth.totalSales}`);
        
        return {
          ...existingMonth,
          revenue: revenue
        };
      }
      
      console.log(`Month ${monthNum}: No data - setting default values`);
      return {
        month: monthNum,
        totalSales: 0,
        revenue: "0"
      };
    });
    
    // Проверяем наличие ненулевых значений
    const hasNonZeroValues = filledMonths.some(m => 
      parseFloat(m.revenue) > 0 || m.totalSales > 0
    );
    
    console.log(`Monthly sales data ready, has non-zero values: ${hasNonZeroValues}`);
    return filledMonths;
  }

  async getCategorySales(userId: number, businessId?: number) {
    let query = db.select({
      categoryId: schema.products.categoryId,
      categoryName: schema.categories.name,
      totalSold: sql<number>`sum(${schema.sales.quantity})`,
      totalRevenue: sql<string>`sum(${schema.sales.totalAmount})`,
    })
    .from(schema.sales)
    .leftJoin(schema.products, eq(schema.sales.productId, schema.products.id))
    .leftJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
    .where(eq(schema.sales.userId, userId))
    .groupBy(schema.products.categoryId, schema.categories.name)
    .orderBy(desc(sql`sum(${schema.sales.totalAmount})`));
    
    if (businessId) {
      query = db.select({
        categoryId: schema.products.categoryId,
        categoryName: schema.categories.name,
        totalSold: sql<number>`sum(${schema.sales.quantity})`,
        totalRevenue: sql<string>`sum(${schema.sales.totalAmount})`,
      })
      .from(schema.sales)
      .leftJoin(schema.products, eq(schema.sales.productId, schema.products.id))
      .leftJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
      .where(and(
        eq(schema.sales.userId, userId),
        eq(schema.sales.businessId, businessId)
      ))
      .groupBy(schema.products.categoryId, schema.categories.name)
      .orderBy(desc(sql`sum(${schema.sales.totalAmount})`));
    }
    
    const result = await query;
    
    // Преобразуем результаты, чтобы заменить NULL значения на "Без категории"
    return result.map(item => ({
      ...item,
      categoryName: item.categoryName || 'Без категории'
    }));
  }

  // Получение продаж с применением фильтров
  async getSalesWithFilter(userId: number, filters: any = {}) {
    console.log(`Getting filtered sales for user ${userId}, filters:`, filters);
    
    // Начинаем строить базовый запрос
    let queryBuilder = db.select({
      id: schema.sales.id,
      productId: schema.sales.productId,
      price: schema.sales.price,
      quantity: schema.sales.quantity,
      totalAmount: schema.sales.totalAmount,
      customerName: schema.sales.customerName,
      customerEmail: schema.sales.customerEmail,
      saleDate: schema.sales.saleDate,
      status: schema.sales.status,
      paymentMethod: schema.sales.paymentMethod,
      employee: schema.sales.employee,
      // Получаем данные о продукте и категории
      productName: schema.products.name,
      categoryName: schema.categories.name,
    })
    .from(schema.sales)
    .leftJoin(schema.products, eq(schema.sales.productId, schema.products.id))
    .leftJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
    .where(eq(schema.sales.userId, userId))
    .orderBy(desc(schema.sales.saleDate));
    
    // Список условий для WHERE
    const conditions = [eq(schema.sales.userId, userId)];

    // Применяем фильтры
    if (filters.businessId) {
      conditions.push(eq(schema.sales.businessId, filters.businessId));
    }
    
    if (filters.fromDate) {
      conditions.push(gte(schema.sales.saleDate, filters.fromDate.toISOString()));
    }
    
    if (filters.toDate) {
      // Устанавливаем время до конца дня
      const endDate = new Date(filters.toDate);
      endDate.setHours(23, 59, 59, 999);
      conditions.push(lte(schema.sales.saleDate, endDate.toISOString()));
    }
    
    if (filters.productId) {
      conditions.push(eq(schema.sales.productId, filters.productId));
    }
    
    if (filters.customerName) {
      conditions.push(like(schema.sales.customerName, `%${filters.customerName}%`));
    }
    
    if (filters.employee) {
      conditions.push(like(schema.sales.employee, `%${filters.employee}%`));
    }
    
    if (filters.status) {
      conditions.push(eq(schema.sales.status, filters.status));
    }

    // Применяем все условия
    queryBuilder = queryBuilder.where(and(...conditions));
    
    const sales = await queryBuilder;
    
    console.log(`Found ${sales.length} sales matching the filters`);
    return sales;
  }
  
  // Получение товаров с данными о продажах
  async getProductsWithSalesData(userId: number, businessId?: number) {
    console.log(`Getting products with sales data for user ${userId}, businessId ${businessId || 'all'}`);
    
    // Запрос для получения информации о продуктах с суммарными данными продаж
    let query = db.select({
      id: schema.products.id,
      name: schema.products.name,
      price: schema.products.price,
      categoryId: schema.products.categoryId,
      categoryName: schema.categories.name,
      totalSold: sql<number>`COALESCE(sum(${schema.sales.quantity}), 0)`,
      totalRevenue: sql<string>`COALESCE(sum(${schema.sales.totalAmount}), '0')`,
      avgPrice: sql<string>`COALESCE(avg(${schema.sales.price}), '0')`,
    })
    .from(schema.products)
    .leftJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
    .leftJoin(schema.sales, eq(schema.products.id, schema.sales.productId))
    .where(eq(schema.products.userId, userId))
    .groupBy(
      schema.products.id,
      schema.products.name,
      schema.products.price,
      schema.products.categoryId,
      schema.categories.name
    )
    .orderBy(desc(sql`COALESCE(sum(${schema.sales.quantity}), 0)`));
    
    if (businessId) {
      query = db.select({
        id: schema.products.id,
        name: schema.products.name,
        price: schema.products.price,
        categoryId: schema.products.categoryId,
        categoryName: schema.categories.name,
        totalSold: sql<number>`COALESCE(sum(${schema.sales.quantity}), 0)`,
        totalRevenue: sql<string>`COALESCE(sum(${schema.sales.totalAmount}), '0')`,
        avgPrice: sql<string>`COALESCE(avg(${schema.sales.price}), '0')`,
      })
      .from(schema.products)
      .leftJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
      .leftJoin(schema.sales, and(
        eq(schema.products.id, schema.sales.productId),
        eq(schema.sales.businessId, businessId)
      ))
      .where(and(
        eq(schema.products.userId, userId),
        eq(schema.products.businessId, businessId)
      ))
      .groupBy(
        schema.products.id,
        schema.products.name,
        schema.products.price,
        schema.products.categoryId,
        schema.categories.name
      )
      .orderBy(desc(sql`COALESCE(sum(${schema.sales.quantity}), 0)`));
    }
    
    const result = await query;
    
    console.log(`Found ${result.length} products with sales data`);
    return result.map(item => ({
      ...item,
      categoryName: item.categoryName || 'Без категории'
    }));
  }

  async getProductsStats(userId: number, businessId?: number) {
    console.log(`Getting product stats for user ${userId}, businessId ${businessId || 'all'}`);
    
    let query = db.select({
      categoryId: schema.products.categoryId,
      categoryName: schema.categories.name,
      totalProducts: sql<number>`count(${schema.products.id})`,
      avgPrice: sql<string>`avg(${schema.products.price})`,
    })
    .from(schema.products)
    .leftJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
    .where(eq(schema.products.userId, userId))
    .groupBy(schema.products.categoryId, schema.categories.name)
    .orderBy(desc(sql`count(${schema.products.id})`));
    
    if (businessId) {
      query = db.select({
        categoryId: schema.products.categoryId,
        categoryName: schema.categories.name,
        totalProducts: sql<number>`count(${schema.products.id})`,
        avgPrice: sql<string>`avg(${schema.products.price})`,
      })
      .from(schema.products)
      .leftJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
      .where(and(
        eq(schema.products.userId, userId),
        eq(schema.products.businessId, businessId)
      ))
      .groupBy(schema.products.categoryId, schema.categories.name)
      .orderBy(desc(sql`count(${schema.products.id})`));
    }
    
    const result = await query;
    console.log(`Product stats data: ${result.length} categories`);
    
    // Преобразуем результаты, чтобы заменить NULL значения на "Без категории"
    const formattedResult = result.map(item => ({
      ...item,
      categoryName: item.categoryName || 'Без категории',
      avgPrice: item.avgPrice || '0'
    }));
    
    // Если результатов нет, возвращаем одну запись "Нет товаров"
    if (formattedResult.length === 0) {
      return [{
        categoryId: null,
        categoryName: 'Нет товаров',
        totalProducts: 0,
        avgPrice: '0'
      }];
    }
    
    return formattedResult;
  }
}

export const storage = new Storage();
