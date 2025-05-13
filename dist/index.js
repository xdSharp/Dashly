var __defProp = Object.defineProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, and, desc, sql, gte, lte, like } from "drizzle-orm";
import postgres from "postgres";
import MemoryStore from "memorystore";
import session from "express-session";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  businesses: () => businesses,
  categories: () => categories,
  csvRowSchema: () => csvRowSchema,
  csvUploadSchema: () => csvUploadSchema,
  customers: () => customers,
  feedback: () => feedback,
  insertBusinessSchema: () => insertBusinessSchema,
  insertCategorySchema: () => insertCategorySchema,
  insertCustomerSchema: () => insertCustomerSchema,
  insertFeedbackSchema: () => insertFeedbackSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertProductSchema: () => insertProductSchema,
  insertSaleSchema: () => insertSaleSchema,
  insertUserSchema: () => insertUserSchema,
  integer: () => integer,
  loginSchema: () => loginSchema,
  notifications: () => notifications,
  pgTable: () => pgTable,
  products: () => products,
  sales: () => sales,
  sessions: () => sessions,
  text: () => text,
  users: () => users
});
import { pgTable, text, serial, integer, timestamp, varchar, jsonb, index, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("user"),
  // "admin" или "user"
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});
var businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 100 }),
  website: varchar("website", { length: 200 }),
  logo: varchar("logo", { length: 255 }),
  industry: varchar("industry", { length: 100 }),
  foundedYear: integer("founded_year"),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  isDefault: boolean("is_default").default(true)
});
var categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 20 }).default("#4f86d6"),
  icon: varchar("icon", { length: 50 }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  businessId: integer("business_id").references(() => businesses.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});
var products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  sku: varchar("sku", { length: 50 }),
  imageUrl: varchar("image_url", { length: 255 }),
  stock: integer("stock").default(0),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  businessId: integer("business_id").references(() => businesses.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});
var sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  businessId: integer("business_id").references(() => businesses.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  customerName: varchar("customer_name", { length: 100 }),
  customerEmail: varchar("customer_email", { length: 100 }),
  saleDate: timestamp("sale_date", { withTimezone: true }).defaultNow(),
  status: varchar("status", { length: 20 }).default("completed"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  notes: text("notes"),
  employee: varchar("employee", { length: 100 })
});
var customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  businessId: integer("business_id").references(() => businesses.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  totalPurchases: integer("total_purchases").default(0),
  totalSpent: decimal("total_spent", { precision: 12, scale: 2 }).default("0")
});
var feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  businessId: integer("business_id").references(() => businesses.id, { onDelete: "cascade" }),
  customerId: integer("customer_id").references(() => customers.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});
var notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  businessId: integer("business_id").references(() => businesses.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  // 'info', 'warning', 'error'
  read: boolean("read").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});
var sessions = pgTable("session", {
  sid: varchar("sid").notNull().primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire", { precision: 6, mode: "date" }).notNull()
}, (table) => {
  return {
    expireIdx: index("IDX_session_expire").on(table.expire)
  };
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  role: true
});
var insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
  createdAt: true
});
var insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true
});
var insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true
});
var insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  saleDate: true
}).extend({
  productId: z.number(),
  quantity: z.number(),
  price: z.string(),
  totalAmount: z.string(),
  employee: z.string().optional(),
  businessId: z.number().optional(),
  userId: z.number()
});
var insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  totalPurchases: true,
  totalSpent: true
});
var insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true
});
var insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true
});
var csvRowSchema = z.object({
  product_name: z.string(),
  category_name: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  total_amount: z.number().positive(),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format"
  }),
  employee: z.string().optional(),
  customer_name: z.string().optional(),
  customer_email: z.string().email().optional(),
  payment_method: z.string().optional(),
  status: z.string().optional()
});
var csvUploadSchema = z.array(csvRowSchema);
var loginSchema = z.object({
  username: z.string().min(1, "\u0418\u043C\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E"),
  password: z.string().min(1, "\u041F\u0430\u0440\u043E\u043B\u044C \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u0435\u043D")
});

// server/storage.ts
var connectionString = process.env.DATABASE_URL || `postgres://${process.env.DB_USER || "dashly"}:${process.env.DB_PASSWORD || "dashlypass"}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "5432"}/${process.env.DB_NAME || "dashly_db"}`;
var client = postgres(connectionString);
var db = drizzle(client, { schema: schema_exports });
var MemorySessionStore = MemoryStore(session);
var sessionStore = new MemorySessionStore({
  checkPeriod: 864e5
  // 24 часа
});
var Storage = class {
  // Хранилище сессий
  sessionStore;
  constructor() {
    this.sessionStore = sessionStore;
  }
  // Methods for users
  async getUser(id) {
    const users2 = await db.select().from(users).where(eq(users.id, id));
    return users2[0] || null;
  }
  async getUserByUsername(username) {
    const users2 = await db.select().from(users).where(eq(users.username, username));
    return users2[0] || null;
  }
  async createUser(userData) {
    console.log("Storage: createUser - \u0432\u0445\u043E\u0434\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435:", userData);
    const newUsers = await db.insert(users).values(userData).returning();
    const user = newUsers[0];
    console.log("Storage: createUser - \u0441\u043E\u0437\u0434\u0430\u043D\u043D\u044B\u0439 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C:", {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      email: user.email
    });
    return user;
  }
  async updateUser(id, userData) {
    const updatedUsers = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return updatedUsers[0] || null;
  }
  async getAllUsers() {
    return await db.select().from(users);
  }
  // Метод для получения пользователей определенной роли
  async getUsersByRole(role) {
    return await db.select().from(users).where(eq(users.role, role));
  }
  // Метод для обновления роли пользователя (для админа)
  async updateUserRole(id, role) {
    const updatedUsers = await db.update(users).set({ role }).where(eq(users.id, id)).returning();
    return updatedUsers[0] || null;
  }
  // Methods for businesses
  async getAllBusinesses(userId) {
    return await db.select().from(businesses).where(eq(businesses.userId, userId)).orderBy(businesses.name);
  }
  async getBusiness(id) {
    const businesses2 = await db.select().from(businesses).where(eq(businesses.id, id));
    return businesses2[0] || null;
  }
  async getDefaultBusiness(userId) {
    const businesses2 = await db.select().from(businesses).where(and(
      eq(businesses.userId, userId),
      eq(businesses.isDefault, true)
    ));
    return businesses2[0] || null;
  }
  async createBusiness(businessData) {
    if (businessData.isDefault === true) {
      await db.update(businesses).set({ isDefault: false }).where(eq(businesses.userId, businessData.userId));
    }
    const newBusinesses = await db.insert(businesses).values(businessData).returning();
    return newBusinesses[0];
  }
  async updateBusiness(id, businessData) {
    if (businessData.isDefault === true) {
      const business = await this.getBusiness(id);
      if (business) {
        await db.update(businesses).set({ isDefault: false }).where(and(
          eq(businesses.userId, business.userId),
          sql`id != ${id}`
        ));
      }
    }
    const updatedBusinesses = await db.update(businesses).set(businessData).where(eq(businesses.id, id)).returning();
    return updatedBusinesses[0] || null;
  }
  async deleteBusiness(id) {
    const business = await this.getBusiness(id);
    if (business && business.isDefault) {
      const businessCount = await db.select({ count: sql`count(*)` }).from(businesses).where(eq(businesses.userId, business.userId));
      if (businessCount[0].count === 1) {
        return false;
      }
      const otherBusiness = await db.select().from(businesses).where(and(
        eq(businesses.userId, business.userId),
        sql`id != ${id}`
      )).limit(1);
      if (otherBusiness.length > 0) {
        await this.updateBusiness(otherBusiness[0].id, { isDefault: true });
      }
    }
    await db.delete(businesses).where(eq(businesses.id, id));
    return true;
  }
  // Methods for categories
  async getAllCategories(userId, businessId) {
    let query = db.select().from(categories).where(eq(categories.userId, userId)).orderBy(categories.name);
    if (businessId) {
      query = db.select().from(categories).where(and(
        eq(categories.userId, userId),
        eq(categories.businessId, businessId)
      )).orderBy(categories.name);
    }
    return await query;
  }
  async getCategory(id) {
    const categories2 = await db.select().from(categories).where(eq(categories.id, id));
    return categories2[0] || null;
  }
  async createCategory(categoryData) {
    const newCategories = await db.insert(categories).values(categoryData).returning();
    return newCategories[0];
  }
  async updateCategory(id, categoryData) {
    const updatedCategories = await db.update(categories).set(categoryData).where(eq(categories.id, id)).returning();
    return updatedCategories[0] || null;
  }
  async deleteCategory(id) {
    await db.delete(categories).where(eq(categories.id, id));
    return true;
  }
  // Methods for products
  async getAllProducts(userId, businessId) {
    let query = db.select().from(products).where(eq(products.userId, userId)).orderBy(desc(products.createdAt));
    if (businessId) {
      query = db.select().from(products).where(and(
        eq(products.userId, userId),
        eq(products.businessId, businessId)
      )).orderBy(desc(products.createdAt));
    }
    return await query;
  }
  async getProduct(id) {
    const products2 = await db.select().from(products).where(eq(products.id, id));
    return products2[0] || null;
  }
  async createProduct(productData) {
    const newProducts = await db.insert(products).values(productData).returning();
    return newProducts[0];
  }
  async updateProduct(id, productData) {
    const updatedProducts = await db.update(products).set(productData).where(eq(products.id, id)).returning();
    return updatedProducts[0] || null;
  }
  async deleteProduct(id) {
    await db.delete(products).where(eq(products.id, id));
    return true;
  }
  // Methods for sales
  async getAllSales(userId, businessId) {
    let query = db.select().from(sales).where(eq(sales.userId, userId)).orderBy(desc(sales.saleDate));
    if (businessId) {
      query = db.select().from(sales).where(and(
        eq(sales.userId, userId),
        eq(sales.businessId, businessId)
      )).orderBy(desc(sales.saleDate));
    }
    return await query;
  }
  async getSale(id) {
    const sales2 = await db.select().from(sales).where(eq(sales.id, id));
    return sales2[0] || null;
  }
  async createSale(saleData) {
    console.log("Storage: Creating sale with data:", saleData);
    try {
      const newSales = await db.insert(sales).values(saleData).returning();
      console.log("Storage: Sale created successfully:", newSales[0]);
      return newSales[0];
    } catch (error) {
      console.error("Storage: Error creating sale:", error);
      throw error;
    }
  }
  async updateSale(id, saleData) {
    const updatedSales = await db.update(sales).set(saleData).where(eq(sales.id, id)).returning();
    return updatedSales[0] || null;
  }
  async deleteSale(id) {
    try {
      console.log(`Storage: Deleting sale with id: ${id}`);
      const sale = await this.getSale(id);
      if (!sale) {
        console.log(`Storage: Sale with id ${id} not found`);
        return false;
      }
      await db.delete(sales).where(eq(sales.id, id));
      console.log(`Storage: Sale with id ${id} deleted successfully`);
      return true;
    } catch (error) {
      console.error(`Storage: Error deleting sale with id ${id}:`, error);
      throw error;
    }
  }
  // Methods for customers
  async getAllCustomers(userId, businessId) {
    let query = db.select().from(customers).where(eq(customers.userId, userId)).orderBy(customers.name);
    if (businessId) {
      query = db.select().from(customers).where(and(
        eq(customers.userId, userId),
        eq(customers.businessId, businessId)
      )).orderBy(customers.name);
    }
    return await query;
  }
  async getCustomer(id) {
    const customers2 = await db.select().from(customers).where(eq(customers.id, id));
    return customers2[0] || null;
  }
  async createCustomer(customerData) {
    const newCustomers = await db.insert(customers).values(customerData).returning();
    return newCustomers[0];
  }
  async updateCustomer(id, customerData) {
    const updatedCustomers = await db.update(customers).set(customerData).where(eq(customers.id, id)).returning();
    return updatedCustomers[0] || null;
  }
  async deleteCustomer(id) {
    await db.delete(customers).where(eq(customers.id, id));
    return true;
  }
  // Метод для удаления пользователя (для админа)
  async deleteUser(id) {
    await db.delete(users).where(eq(users.id, id));
    return true;
  }
  // Methods for feedback
  async getAllFeedback(userId) {
    return await db.select().from(feedback).where(eq(feedback.userId, userId)).orderBy(desc(feedback.createdAt));
  }
  async createFeedback(feedbackData) {
    const newFeedback = await db.insert(feedback).values(feedbackData).returning();
    return newFeedback[0];
  }
  async deleteFeedback(id) {
    await db.delete(feedback).where(eq(feedback.id, id));
    return true;
  }
  // Методы для работы с уведомлениями
  async getUserNotifications(userId) {
    return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }
  async createNotification(notificationData) {
    const newNotifications = await db.insert(notifications).values(notificationData).returning();
    return newNotifications[0];
  }
  async markNotificationAsRead(id, userId) {
    const updatedNotifications = await db.update(notifications).set({ read: true }).where(
      and(
        eq(notifications.id, id),
        eq(notifications.userId, userId)
      )
    ).returning();
    return updatedNotifications[0] || null;
  }
  // Methods for analytics
  async getSalesSummary(userId, businessId) {
    let query = db.select({
      totalSales: sql`count(*)`,
      revenue: sql`sum(${sales.totalAmount})`,
      averageOrder: sql`avg(${sales.totalAmount})`,
      totalQuantity: sql`sum(${sales.quantity})`
    }).from(sales).where(eq(sales.userId, userId));
    if (businessId) {
      query = db.select({
        totalSales: sql`count(*)`,
        revenue: sql`sum(${sales.totalAmount})`,
        averageOrder: sql`avg(${sales.totalAmount})`,
        totalQuantity: sql`sum(${sales.quantity})`
      }).from(sales).where(and(
        eq(sales.userId, userId),
        eq(sales.businessId, businessId)
      ));
    }
    const result = await query;
    return result[0];
  }
  async getTopProducts(userId, limit = 5, businessId) {
    let query = db.select({
      productId: sales.productId,
      productName: products.name,
      totalSold: sql`sum(${sales.quantity})`,
      totalRevenue: sql`sum(${sales.totalAmount})`
    }).from(sales).leftJoin(products, eq(sales.productId, products.id)).where(eq(sales.userId, userId)).groupBy(sales.productId, products.name).orderBy(desc(sql`sum(${sales.totalAmount})`)).limit(limit);
    if (businessId) {
      query = db.select({
        productId: sales.productId,
        productName: products.name,
        totalSold: sql`sum(${sales.quantity})`,
        totalRevenue: sql`sum(${sales.totalAmount})`
      }).from(sales).leftJoin(products, eq(sales.productId, products.id)).where(and(
        eq(sales.userId, userId),
        eq(sales.businessId, businessId)
      )).groupBy(sales.productId, products.name).orderBy(desc(sql`sum(${sales.totalAmount})`)).limit(limit);
    }
    const result = await query;
    return result.map((item) => ({
      ...item,
      productName: item.productName || "\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0439 \u0442\u043E\u0432\u0430\u0440"
    }));
  }
  async getMonthlySales(userId, year = (/* @__PURE__ */ new Date()).getFullYear(), businessId) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);
    const startDateString = startDate.toISOString();
    const endDateString = endDate.toISOString();
    console.log(`Getting monthly sales for user ${userId}, year ${year}, businessId ${businessId || "all"}`);
    console.log(`Date range: ${startDateString} - ${endDateString}`);
    let query;
    if (businessId) {
      console.log(`Executing query with specific businessId: ${businessId}`);
      query = db.select({
        month: sql`EXTRACT(MONTH FROM ${sales.saleDate})`,
        totalSales: sql`count(*)`,
        revenue: sql`sum(${sales.totalAmount})`
      }).from(sales).where(and(
        eq(sales.userId, userId),
        eq(sales.businessId, businessId),
        sql`${sales.saleDate} BETWEEN ${startDateString} AND ${endDateString}`
      )).groupBy(sql`EXTRACT(MONTH FROM ${sales.saleDate})`).orderBy(sql`EXTRACT(MONTH FROM ${sales.saleDate})`);
    } else {
      console.log(`Executing query for all businesses of user: ${userId}`);
      query = db.select({
        month: sql`EXTRACT(MONTH FROM ${sales.saleDate})`,
        totalSales: sql`count(*)`,
        revenue: sql`sum(${sales.totalAmount})`
      }).from(sales).where(and(
        eq(sales.userId, userId),
        sql`${sales.saleDate} BETWEEN ${startDateString} AND ${endDateString}`
      )).groupBy(sql`EXTRACT(MONTH FROM ${sales.saleDate})`).orderBy(sql`EXTRACT(MONTH FROM ${sales.saleDate})`);
    }
    const result = await query;
    console.log(`Raw monthly sales data (${result.length} records):`, JSON.stringify(result));
    if (result.length === 0) {
      console.log("No monthly sales data found, creating empty dataset");
      return Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        totalSales: 0,
        revenue: "0"
      }));
    }
    const filledMonths = Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1;
      const existingMonth = result.find((m) => m.month === monthNum);
      if (existingMonth) {
        const revenue = existingMonth.revenue !== null && existingMonth.revenue !== void 0 ? existingMonth.revenue : "0";
        console.log(`Month ${monthNum}: Found data - revenue=${revenue}, sales=${existingMonth.totalSales}`);
        return {
          ...existingMonth,
          revenue
        };
      }
      console.log(`Month ${monthNum}: No data - setting default values`);
      return {
        month: monthNum,
        totalSales: 0,
        revenue: "0"
      };
    });
    const hasNonZeroValues = filledMonths.some(
      (m) => parseFloat(m.revenue) > 0 || m.totalSales > 0
    );
    console.log(`Monthly sales data ready, has non-zero values: ${hasNonZeroValues}`);
    return filledMonths;
  }
  async getCategorySales(userId, businessId) {
    let query = db.select({
      categoryId: products.categoryId,
      categoryName: categories.name,
      totalSold: sql`sum(${sales.quantity})`,
      totalRevenue: sql`sum(${sales.totalAmount})`
    }).from(sales).leftJoin(products, eq(sales.productId, products.id)).leftJoin(categories, eq(products.categoryId, categories.id)).where(eq(sales.userId, userId)).groupBy(products.categoryId, categories.name).orderBy(desc(sql`sum(${sales.totalAmount})`));
    if (businessId) {
      query = db.select({
        categoryId: products.categoryId,
        categoryName: categories.name,
        totalSold: sql`sum(${sales.quantity})`,
        totalRevenue: sql`sum(${sales.totalAmount})`
      }).from(sales).leftJoin(products, eq(sales.productId, products.id)).leftJoin(categories, eq(products.categoryId, categories.id)).where(and(
        eq(sales.userId, userId),
        eq(sales.businessId, businessId)
      )).groupBy(products.categoryId, categories.name).orderBy(desc(sql`sum(${sales.totalAmount})`));
    }
    const result = await query;
    return result.map((item) => ({
      ...item,
      categoryName: item.categoryName || "\u0411\u0435\u0437 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438"
    }));
  }
  // Получение продаж с применением фильтров
  async getSalesWithFilter(userId, filters = {}) {
    console.log(`Getting filtered sales for user ${userId}, filters:`, filters);
    let queryBuilder = db.select({
      id: sales.id,
      productId: sales.productId,
      price: sales.price,
      quantity: sales.quantity,
      totalAmount: sales.totalAmount,
      customerName: sales.customerName,
      customerEmail: sales.customerEmail,
      saleDate: sales.saleDate,
      status: sales.status,
      paymentMethod: sales.paymentMethod,
      employee: sales.employee,
      // Получаем данные о продукте и категории
      productName: products.name,
      categoryName: categories.name
    }).from(sales).leftJoin(products, eq(sales.productId, products.id)).leftJoin(categories, eq(products.categoryId, categories.id)).where(eq(sales.userId, userId)).orderBy(desc(sales.saleDate));
    const conditions = [eq(sales.userId, userId)];
    if (filters.businessId) {
      conditions.push(eq(sales.businessId, filters.businessId));
    }
    if (filters.fromDate) {
      conditions.push(gte(sales.saleDate, filters.fromDate.toISOString()));
    }
    if (filters.toDate) {
      const endDate = new Date(filters.toDate);
      endDate.setHours(23, 59, 59, 999);
      conditions.push(lte(sales.saleDate, endDate.toISOString()));
    }
    if (filters.productId) {
      conditions.push(eq(sales.productId, filters.productId));
    }
    if (filters.customerName) {
      conditions.push(like(sales.customerName, `%${filters.customerName}%`));
    }
    if (filters.employee) {
      conditions.push(like(sales.employee, `%${filters.employee}%`));
    }
    if (filters.status) {
      conditions.push(eq(sales.status, filters.status));
    }
    queryBuilder = queryBuilder.where(and(...conditions));
    const sales2 = await queryBuilder;
    console.log(`Found ${sales2.length} sales matching the filters`);
    return sales2;
  }
  // Получение товаров с данными о продажах
  async getProductsWithSalesData(userId, businessId) {
    console.log(`Getting products with sales data for user ${userId}, businessId ${businessId || "all"}`);
    let query = db.select({
      id: products.id,
      name: products.name,
      price: products.price,
      categoryId: products.categoryId,
      categoryName: categories.name,
      totalSold: sql`COALESCE(sum(${sales.quantity}), 0)`,
      totalRevenue: sql`COALESCE(sum(${sales.totalAmount}), '0')`,
      avgPrice: sql`COALESCE(avg(${sales.price}), '0')`
    }).from(products).leftJoin(categories, eq(products.categoryId, categories.id)).leftJoin(sales, eq(products.id, sales.productId)).where(eq(products.userId, userId)).groupBy(
      products.id,
      products.name,
      products.price,
      products.categoryId,
      categories.name
    ).orderBy(desc(sql`COALESCE(sum(${sales.quantity}), 0)`));
    if (businessId) {
      query = db.select({
        id: products.id,
        name: products.name,
        price: products.price,
        categoryId: products.categoryId,
        categoryName: categories.name,
        totalSold: sql`COALESCE(sum(${sales.quantity}), 0)`,
        totalRevenue: sql`COALESCE(sum(${sales.totalAmount}), '0')`,
        avgPrice: sql`COALESCE(avg(${sales.price}), '0')`
      }).from(products).leftJoin(categories, eq(products.categoryId, categories.id)).leftJoin(sales, and(
        eq(products.id, sales.productId),
        eq(sales.businessId, businessId)
      )).where(and(
        eq(products.userId, userId),
        eq(products.businessId, businessId)
      )).groupBy(
        products.id,
        products.name,
        products.price,
        products.categoryId,
        categories.name
      ).orderBy(desc(sql`COALESCE(sum(${sales.quantity}), 0)`));
    }
    const result = await query;
    console.log(`Found ${result.length} products with sales data`);
    return result.map((item) => ({
      ...item,
      categoryName: item.categoryName || "\u0411\u0435\u0437 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438"
    }));
  }
  async getProductsStats(userId, businessId) {
    console.log(`Getting product stats for user ${userId}, businessId ${businessId || "all"}`);
    let query = db.select({
      categoryId: products.categoryId,
      categoryName: categories.name,
      totalProducts: sql`count(${products.id})`,
      avgPrice: sql`avg(${products.price})`
    }).from(products).leftJoin(categories, eq(products.categoryId, categories.id)).where(eq(products.userId, userId)).groupBy(products.categoryId, categories.name).orderBy(desc(sql`count(${products.id})`));
    if (businessId) {
      query = db.select({
        categoryId: products.categoryId,
        categoryName: categories.name,
        totalProducts: sql`count(${products.id})`,
        avgPrice: sql`avg(${products.price})`
      }).from(products).leftJoin(categories, eq(products.categoryId, categories.id)).where(and(
        eq(products.userId, userId),
        eq(products.businessId, businessId)
      )).groupBy(products.categoryId, categories.name).orderBy(desc(sql`count(${products.id})`));
    }
    const result = await query;
    console.log(`Product stats data: ${result.length} categories`);
    const formattedResult = result.map((item) => ({
      ...item,
      categoryName: item.categoryName || "\u0411\u0435\u0437 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438",
      avgPrice: item.avgPrice || "0"
    }));
    if (formattedResult.length === 0) {
      return [{
        categoryId: null,
        categoryName: "\u041D\u0435\u0442 \u0442\u043E\u0432\u0430\u0440\u043E\u0432",
        totalProducts: 0,
        avgPrice: "0"
      }];
    }
    return formattedResult;
  }
};
var storage = new Storage();

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import bcrypt from "bcrypt";
import { z as z2 } from "zod";
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}
async function validatePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "sales-dashboard-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      // true в production, false в dev
      maxAge: 24 * 60 * 60 * 1e3,
      // 24 hours
      httpOnly: true,
      sameSite: "lax"
      // 'lax' для лучшей совместимости с браузерами
    }
  };
  if (process.env.NODE_ENV !== "production") {
    if (sessionSettings.cookie) {
      sessionSettings.cookie.domain = "localhost";
    }
  }
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }
        const isValid = await validatePassword(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const validatedUser = insertUserSchema.parse(req.body);
      console.log("\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F - \u0432\u0445\u043E\u0434\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435:", req.body);
      console.log("\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F - \u0432\u0430\u043B\u0438\u0434\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435:", validatedUser);
      const existingUser = await storage.getUserByUsername(validatedUser.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const hashedPassword = await hashPassword(validatedUser.password);
      const role = "user";
      console.log("\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F - \u043F\u0440\u0438\u043D\u0443\u0434\u0438\u0442\u0435\u043B\u044C\u043D\u043E \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u043D\u0430\u044F \u0440\u043E\u043B\u044C:", role);
      const user = await storage.createUser({
        ...validatedUser,
        password: hashedPassword,
        role
      });
      console.log("\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F - \u0441\u043E\u0437\u0434\u0430\u043D\u043D\u044B\u0439 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C:", {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email
      });
      const { password, ...userWithoutPassword } = user;
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });
  app2.post("/api/login", (req, res, next) => {
    try {
      loginSchema.parse(req.body);
      passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ message: info.message || "Authentication failed" });
        req.login(user, (loginErr) => {
          if (loginErr) return next(loginErr);
          const { password, ...userWithoutPassword } = user;
          return res.status(200).json(userWithoutPassword);
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
  app2.use("/api/admin/*", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    next();
  });
}
var isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
};

// server/csv-processor.ts
async function processCSVData(data, userId) {
  try {
    const results = {
      totalRows: data.length,
      processed: 0,
      errors: [],
      products: 0,
      categories: 0,
      sales: 0
    };
    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i];
        await processRow(row, userId);
        results.processed++;
      } catch (error) {
        results.errors.push({
          row: i + 1,
          error: error.message || "Unknown error"
        });
      }
    }
    return results;
  } catch (error) {
    throw new Error(`Failed to process CSV data: ${error.message}`);
  }
}
async function processRow(row, userId) {
  const defaultBusiness = await storage.getDefaultBusiness(userId);
  const businessId = defaultBusiness?.id || null;
  let category = await storage.getCategoryByName(row.category_name, userId);
  if (!category) {
    category = await storage.createCategory({
      name: row.category_name,
      userId,
      businessId
    });
  }
  let product = await storage.getProductByName(row.product_name, userId);
  if (!product) {
    product = await storage.createProduct({
      name: row.product_name,
      categoryId: category.id,
      price: row.price.toString(),
      description: "",
      userId,
      businessId
    });
  }
  const parsedDate = new Date(row.date);
  const sale = await storage.createSale({
    productId: product.id,
    price: row.price.toString(),
    quantity: row.quantity,
    totalAmount: row.total_amount.toString(),
    saleDate: parsedDate,
    employee: row.employee || "",
    customerName: row.customer_name || "",
    customerEmail: row.customer_email || "",
    paymentMethod: row.payment_method || "",
    status: row.status || "completed",
    userId,
    businessId
  });
  return { category, product, sale };
}
function parseCSV(csvContent) {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("CSV must contain a header row and at least one data row");
  }
  const headerRow = lines[0].split(",");
  const requiredColumns = ["product_name", "category_name", "price", "quantity", "total_amount", "date"];
  for (const column of requiredColumns) {
    if (!headerRow.includes(column)) {
      throw new Error(`Missing required column: ${column}`);
    }
  }
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    if (values.length !== headerRow.length) {
      throw new Error(`Line ${i + 1} has ${values.length} values but expected ${headerRow.length}`);
    }
    const rowData = {};
    for (let j = 0; j < headerRow.length; j++) {
      const key = headerRow[j].trim();
      let value = values[j].trim();
      if (["price", "quantity", "total_amount"].includes(key)) {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          throw new Error(`Invalid number for ${key} in line ${i + 1}: ${value}`);
        }
        rowData[key] = numValue;
      } else {
        rowData[key] = value;
      }
    }
    data.push(rowData);
  }
  return data;
}
function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && (i === 0 || line[i - 1] !== "\\")) {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result.map((field) => {
    if (field.startsWith('"') && field.endsWith('"')) {
      return field.slice(1, -1);
    }
    return field;
  });
}

// server/pdf-generator.ts
import PDFDocument from "pdfkit";
import { format } from "date-fns";
import { enUS, ru } from "date-fns/locale";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var ROBOTO_FONT_PATH = path.join(__dirname, "..", "assets", "fonts", "Roboto-Regular.ttf");
function validateFont() {
  if (!fs.existsSync(ROBOTO_FONT_PATH)) {
    throw new Error("\u0428\u0440\u0438\u0444\u0442 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u043D\u0430\u043B\u0438\u0447\u0438\u0435 \u0444\u0430\u0439\u043B\u0430 Roboto-Regular.ttf \u0432 \u0434\u0438\u0440\u0435\u043A\u0442\u043E\u0440\u0438\u0438 assets/fonts");
  }
  return ROBOTO_FONT_PATH;
}
function containsCyrillic(text2) {
  return /[а-яА-ЯёЁ]/.test(text2);
}
async function generatePDF(data, dateRange, user) {
  return new Promise((resolve, reject) => {
    try {
      const fontPath = validateFont();
      const language = containsCyrillic(user.name || "") || data.sales && data.sales.length > 0 && containsCyrillic(data.sales[0].productName || "") ? "ru" : "en";
      const dateLocale = language === "ru" ? ru : enUS;
      const translations = {
        en: {
          salesReport: "Sales Report",
          creationDate: "Creation date",
          user: "User",
          reportPeriod: "Report period",
          from: "from",
          to: "to",
          sales: "SALES",
          no: "No.",
          product: "Product",
          qty: "Qty",
          price: "Price",
          amount: "Amount",
          date: "Date",
          status: "Status",
          totalSalesAmount: "Total sales amount",
          popularProducts: "POPULAR PRODUCTS",
          category: "Category",
          sold: "Sold",
          revenue: "Revenue",
          footer: "* Document automatically generated by Dashly system"
        },
        ru: {
          salesReport: "\u041E\u0442\u0447\u0435\u0442 \u043E \u043F\u0440\u043E\u0434\u0430\u0436\u0430\u0445",
          creationDate: "\u0414\u0430\u0442\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F",
          user: "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C",
          reportPeriod: "\u041F\u0435\u0440\u0438\u043E\u0434 \u043E\u0442\u0447\u0435\u0442\u0430",
          from: "\u0441",
          to: "\u043F\u043E",
          sales: "\u041F\u0420\u041E\u0414\u0410\u0416\u0418",
          no: "\u2116",
          product: "\u0422\u043E\u0432\u0430\u0440",
          qty: "\u041A\u043E\u043B-\u0432\u043E",
          price: "\u0426\u0435\u043D\u0430",
          amount: "\u0421\u0443\u043C\u043C\u0430",
          date: "\u0414\u0430\u0442\u0430",
          status: "\u0421\u0442\u0430\u0442\u0443\u0441",
          totalSalesAmount: "\u041E\u0431\u0449\u0430\u044F \u0441\u0443\u043C\u043C\u0430 \u043F\u0440\u043E\u0434\u0430\u0436",
          popularProducts: "\u041F\u041E\u041F\u0423\u041B\u042F\u0420\u041D\u042B\u0415 \u0422\u041E\u0412\u0410\u0420\u042B",
          category: "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F",
          sold: "\u041F\u0440\u043E\u0434\u0430\u043D\u043E",
          revenue: "\u0412\u044B\u0440\u0443\u0447\u043A\u0430",
          footer: "* \u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442 \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u0441\u0433\u0435\u043D\u0435\u0440\u0438\u0440\u043E\u0432\u0430\u043D \u0441\u0438\u0441\u0442\u0435\u043C\u043E\u0439 Dashly"
        }
      };
      const t = translations[language];
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
        info: {
          Title: language === "ru" ? "\u041E\u0442\u0447\u0435\u0442 \u043E \u043F\u0440\u043E\u0434\u0430\u0436\u0430\u0445 Dashly" : "Dashly Sales Report",
          Author: user.name || "Dashly User",
          Subject: language === "ru" ? "\u041E\u0442\u0447\u0435\u0442 \u043E \u0431\u0438\u0437\u043D\u0435\u0441-\u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438" : "Business Activity Report",
          Keywords: language === "ru" ? "\u043F\u0440\u043E\u0434\u0430\u0436\u0438, \u0442\u043E\u0432\u0430\u0440\u044B, \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438, \u0434\u043E\u0445\u043E\u0434" : "sales, products, categories, revenue",
          CreationDate: /* @__PURE__ */ new Date()
        },
        autoFirstPage: true,
        bufferPages: true
      });
      doc.registerFont("Roboto", fontPath);
      doc.font("Roboto");
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      doc.fontSize(18).text("DASHLY", { align: "center" }).fontSize(14).text(t.salesReport, { align: "center" }).moveDown();
      const now = /* @__PURE__ */ new Date();
      const dateFormat = language === "ru" ? "dd.MM.yyyy" : "MM/dd/yyyy";
      doc.fontSize(10).text(`${t.creationDate}: ${format(now, dateFormat, { locale: dateLocale })}`).text(`${t.user}: ${user.name || "Not specified"}`).moveDown();
      if (dateRange && (dateRange.from || dateRange.to)) {
        let periodText = `${t.reportPeriod}: `;
        if (dateRange.from && dateRange.to) {
          periodText += `${t.from} ${format(new Date(dateRange.from), dateFormat, { locale: dateLocale })} ${t.to} ${format(new Date(dateRange.to), dateFormat, { locale: dateLocale })}`;
        } else if (dateRange.from) {
          periodText += `${t.from} ${format(new Date(dateRange.from), dateFormat, { locale: dateLocale })}`;
        } else if (dateRange.to) {
          periodText += `${t.to} ${format(new Date(dateRange.to), dateFormat, { locale: dateLocale })}`;
        }
        doc.text(periodText).moveDown();
      }
      doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke().moveDown();
      if (data.sales && data.sales.length > 0) {
        let totalAmount = 0;
        doc.fontSize(12).text(t.sales, { underline: true }).moveDown(0.5);
        const tableTop = doc.y;
        const tableLeft = 50;
        const colWidths = {
          no: 30,
          product: 120,
          qty: 40,
          price: 60,
          amount: 70,
          date: 70,
          status: 90
        };
        doc.fontSize(9);
        doc.text(t.no, tableLeft, tableTop);
        doc.text(t.product, tableLeft + colWidths.no, tableTop);
        doc.text(t.qty, tableLeft + colWidths.no + colWidths.product, tableTop);
        doc.text(t.price, tableLeft + colWidths.no + colWidths.product + colWidths.qty, tableTop);
        doc.text(t.amount, tableLeft + colWidths.no + colWidths.product + colWidths.qty + colWidths.price, tableTop);
        doc.text(t.date, tableLeft + colWidths.no + colWidths.product + colWidths.qty + colWidths.price + colWidths.amount, tableTop);
        doc.text(t.status, tableLeft + colWidths.no + colWidths.product + colWidths.qty + colWidths.price + colWidths.amount + colWidths.date, tableTop);
        doc.moveDown();
        const headerLineY = doc.y;
        doc.moveTo(tableLeft, headerLineY).lineTo(tableLeft + colWidths.no + colWidths.product + colWidths.qty + colWidths.price + colWidths.amount + colWidths.date + colWidths.status, headerLineY).stroke();
        doc.moveDown(0.5);
        data.sales.forEach((sale, i) => {
          const rowTop = doc.y;
          const num = (i + 1).toString();
          const productName = sale.productName || t.product;
          const quantity = (sale.quantity || "0").toString();
          const price = sale.price ? `${parseFloat(sale.price).toFixed(2)} \u20BD` : "0.00 \u20BD";
          const amount = sale.totalAmount ? `${parseFloat(sale.totalAmount).toFixed(2)} \u20BD` : "0.00 \u20BD";
          const dateFormat2 = language === "ru" ? "dd.MM.yy" : "MM/dd/yy";
          const date = format(new Date(sale.saleDate || now), dateFormat2, { locale: dateLocale });
          let status = sale.status || "Completed";
          if (language === "ru" && status === "Completed") {
            status = "\u0417\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u043E";
          }
          totalAmount += parseFloat(sale.totalAmount || 0);
          doc.text(num, tableLeft, rowTop);
          doc.text(productName, tableLeft + colWidths.no, rowTop, { width: colWidths.product - 5 });
          doc.text(quantity, tableLeft + colWidths.no + colWidths.product, rowTop);
          doc.text(price, tableLeft + colWidths.no + colWidths.product + colWidths.qty, rowTop);
          doc.text(amount, tableLeft + colWidths.no + colWidths.product + colWidths.qty + colWidths.price, rowTop);
          doc.text(date, tableLeft + colWidths.no + colWidths.product + colWidths.qty + colWidths.price + colWidths.amount, rowTop);
          doc.text(status, tableLeft + colWidths.no + colWidths.product + colWidths.qty + colWidths.price + colWidths.amount + colWidths.date, rowTop);
          const textHeight = Math.max(doc.heightOfString(productName, { width: colWidths.product - 5 }), 12);
          doc.moveDown(textHeight / 12);
        });
        doc.moveDown().text(`${t.totalSalesAmount}: ${totalAmount.toFixed(2)} \u20BD`, { align: "right" }).moveDown();
      }
      if (doc.y > doc.page.height - 200 && data.products && data.products.length > 0) {
        doc.addPage();
      }
      if (data.products && data.products.length > 0) {
        doc.fontSize(12).text(t.popularProducts, { underline: true }).moveDown(0.5);
        const tableTop = doc.y;
        const tableLeft = 50;
        const colWidths = {
          no: 30,
          product: 120,
          category: 120,
          sold: 50,
          revenue: 80
        };
        doc.fontSize(9);
        doc.text(t.no, tableLeft, tableTop);
        doc.text(t.product, tableLeft + colWidths.no, tableTop);
        doc.text(t.category, tableLeft + colWidths.no + colWidths.product, tableTop);
        doc.text(t.sold, tableLeft + colWidths.no + colWidths.product + colWidths.category, tableTop);
        doc.text(t.revenue, tableLeft + colWidths.no + colWidths.product + colWidths.category + colWidths.sold, tableTop);
        doc.moveDown();
        const headerLineY = doc.y;
        doc.moveTo(tableLeft, headerLineY).lineTo(tableLeft + colWidths.no + colWidths.product + colWidths.category + colWidths.sold + colWidths.revenue, headerLineY).stroke();
        doc.moveDown(0.5);
        data.products.forEach((product, i) => {
          const rowTop = doc.y;
          const num = (i + 1).toString();
          const productName = product.name || t.product;
          const category = product.category?.name || (language === "ru" ? "\u0411\u0435\u0437 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438" : "No category");
          const sold = (product.salesCount || "0").toString();
          const revenue = `${product.totalRevenue ? parseFloat(product.totalRevenue).toFixed(2) : "0.00"} \u20BD`;
          doc.text(num, tableLeft, rowTop);
          doc.text(productName, tableLeft + colWidths.no, rowTop, { width: colWidths.product - 5 });
          doc.text(category, tableLeft + colWidths.no + colWidths.product, rowTop, { width: colWidths.category - 5 });
          doc.text(sold, tableLeft + colWidths.no + colWidths.product + colWidths.category, rowTop);
          doc.text(revenue, tableLeft + colWidths.no + colWidths.product + colWidths.category + colWidths.sold, rowTop);
          const textHeight = Math.max(
            doc.heightOfString(productName, { width: colWidths.product - 5 }),
            doc.heightOfString(category, { width: colWidths.category - 5 }),
            12
          );
          doc.moveDown(textHeight / 12);
        });
        doc.moveDown();
      }
      doc.fontSize(9).text(t.footer, 50, doc.page.height - 50, {
        align: "center",
        width: doc.page.width - 100
      });
      doc.end();
    } catch (error) {
      console.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u0438 PDF:", error);
      reject(error);
    }
  });
}

// server/routes.ts
import { ZodError } from "zod";
import os from "os";
async function registerRoutes(app2) {
  setupAuth(app2);
  const httpServer = createServer(app2);
  app2.get("/api/products", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.query.businessId ? parseInt(req.query.businessId) : void 0;
      const products2 = await storage.getAllProducts(userId, businessId);
      res.json(products2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  app2.post("/api/products", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      let businessId = req.body.businessId;
      if (!businessId) {
        const defaultBusiness = await storage.getDefaultBusiness(userId);
        if (defaultBusiness) {
          businessId = defaultBusiness.id;
        }
      }
      const productData = {
        ...req.body,
        userId,
        businessId
      };
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });
  app2.put("/api/products/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (product.userId !== userId && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to update this product" });
      }
      const updatedProduct = await storage.updateProduct(id, req.body);
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product" });
    }
  });
  app2.delete("/api/products/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (product.userId !== userId && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to delete this product" });
      }
      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });
  app2.get("/api/categories", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.query.businessId ? parseInt(req.query.businessId) : void 0;
      const categories2 = await storage.getAllCategories(userId, businessId);
      res.json(categories2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  app2.post("/api/categories", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      let businessId = req.body.businessId;
      if (!businessId) {
        const defaultBusiness = await storage.getDefaultBusiness(userId);
        if (defaultBusiness) {
          businessId = defaultBusiness.id;
        }
      }
      const categoryData = {
        ...req.body,
        userId,
        businessId
      };
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });
  app2.put("/api/categories/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      const category = await storage.getCategory(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      if (category.userId !== userId && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to update this category" });
      }
      const updatedCategory = await storage.updateCategory(id, req.body);
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(updatedCategory);
    } catch (error) {
      res.status(500).json({ message: "Failed to update category" });
    }
  });
  app2.delete("/api/categories/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      const category = await storage.getCategory(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      if (category.userId !== userId && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to delete this category" });
      }
      const success = await storage.deleteCategory(id);
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });
  app2.get("/api/sales", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.query.businessId ? parseInt(req.query.businessId) : void 0;
      const sales2 = await storage.getAllSales(userId, businessId);
      const enrichedSales = await Promise.all(sales2.map(async (sale) => {
        const product = await storage.getProduct(sale.productId);
        let category = null;
        if (product) {
          category = await storage.getCategory(product.categoryId);
        }
        return {
          ...sale,
          product: product || { name: "Unknown Product" },
          category: category || { name: "Unknown Category" }
        };
      }));
      res.json(enrichedSales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });
  app2.post("/api/sales", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      console.log("Creating sale - User ID:", userId);
      console.log("Request body:", req.body);
      let businessId = req.body.businessId || null;
      if (!businessId) {
        console.log("No businessId provided, getting default business");
        const defaultBusiness = await storage.getDefaultBusiness(userId);
        if (defaultBusiness) {
          businessId = defaultBusiness.id;
          console.log("Using default business ID:", businessId);
        }
      }
      const product = await storage.getProduct(parseInt(req.body.productId));
      if (!product) {
        return res.status(400).json({ error: "Product not found" });
      }
      const quantity = parseInt(req.body.quantity);
      const total = product.price * quantity;
      const saleData = {
        productId: parseInt(req.body.productId),
        quantity,
        price: product.price.toString(),
        totalAmount: total.toString(),
        userId,
        businessId,
        employee: req.body.employee || "",
        saleDate: req.body.saleDate ? new Date(req.body.saleDate) : /* @__PURE__ */ new Date(),
        customerName: req.body.customerName || "",
        customerEmail: req.body.customerEmail || "",
        paymentMethod: req.body.paymentMethod || "",
        notes: req.body.notes || ""
      };
      console.log("Creating sale with data:", saleData);
      const result = await storage.createSale(saleData);
      res.json(result);
    } catch (error) {
      console.error("Error creating sale:", error);
      res.status(500).json({ error: "Failed to create sale" });
    }
  });
  app2.put("/api/sales/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      const sale = await storage.getSale(id);
      if (!sale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      if (sale.userId !== userId && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to update this sale" });
      }
      const product = await storage.getProduct(req.body.productId);
      if (!product) {
        return res.status(400).json({ message: "Product not found" });
      }
      const quantity = parseInt(req.body.quantity);
      const total = product.price * quantity;
      const updateData = {
        productId: req.body.productId,
        quantity,
        price: product.price.toString(),
        totalAmount: total.toString(),
        employee: req.body.employee || sale.employee,
        saleDate: req.body.saleDate ? new Date(req.body.saleDate) : sale.saleDate,
        customerName: req.body.customerName || sale.customerName,
        customerEmail: req.body.customerEmail || sale.customerEmail,
        paymentMethod: req.body.paymentMethod || sale.paymentMethod,
        notes: req.body.notes || sale.notes
      };
      const updatedSale = await storage.updateSale(id, updateData);
      if (!updatedSale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.json(updatedSale);
    } catch (error) {
      console.error("Error updating sale:", error);
      res.status(500).json({ message: "Failed to update sale" });
    }
  });
  app2.delete("/api/sales/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      console.log(`Routes: Deleting sale with id ${id} for user ${userId}`);
      const sale = await storage.getSale(id);
      if (!sale) {
        console.log(`Routes: Sale with id ${id} not found`);
        return res.status(404).json({ message: "Sale not found" });
      }
      if (sale.userId !== userId && req.user.role !== "admin") {
        console.log(`Routes: User ${userId} not authorized to delete sale ${id}. Sale belongs to user ${sale.userId}`);
        return res.status(403).json({ message: "Not authorized to delete this sale" });
      }
      try {
        const success = await storage.deleteSale(id);
        if (!success) {
          console.log(`Routes: Failed to delete sale ${id}`);
          return res.status(404).json({ message: "Sale not found" });
        }
        console.log(`Routes: Sale ${id} deleted successfully`);
        res.status(204).send();
      } catch (deleteError) {
        console.error(`Routes: Error in storage.deleteSale:`, deleteError);
        res.status(500).json({ message: "Failed to delete sale" });
      }
    } catch (error) {
      console.error(`Routes: Error in delete sale handler:`, error);
      res.status(500).json({ message: "Failed to delete sale" });
    }
  });
  app2.post("/api/upload-csv", isAuthenticated, async (req, res) => {
    try {
      if (!req.body.data) {
        return res.status(400).json({ message: "No CSV data provided" });
      }
      const userId = req.user.id;
      const csvData = parseCSV(req.body.data);
      const result = await processCSVData(csvData, userId);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message || "Failed to process CSV" });
    }
  });
  app2.post("/api/export-pdf", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const { title, filters, charts } = req.body;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="sales-report-${Date.now()}.pdf"`);
      await generatePDF({
        title: title || "Sales Report",
        userId,
        filters,
        charts
      }, res);
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({ message: error.message || "Failed to generate PDF" });
      } else {
        res.end();
      }
    }
  });
  app2.post("/api/reports/generate", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const { dateRange, sections } = req.body;
      const reportData = {};
      const businessId = req.body.businessId;
      if (sections.sales) {
        const query = { userId };
        if (businessId) query.businessId = businessId;
        if (dateRange.from) {
          query.fromDate = new Date(dateRange.from);
        }
        if (dateRange.to) {
          query.toDate = new Date(dateRange.to);
        }
        reportData.sales = await storage.getSalesWithFilter(userId, query);
      }
      if (sections.products) {
        reportData.products = await storage.getProductsWithSalesData(userId, businessId);
      }
      if (sections.categories) {
        reportData.categories = await storage.getCategorySales(userId, businessId);
      }
      if (sections.revenue) {
        reportData.revenue = await storage.getMonthlySales(userId, (/* @__PURE__ */ new Date()).getFullYear(), businessId);
      }
      const user = await storage.getUser(userId);
      const pdfBuffer = await generatePDF(reportData, dateRange, user);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="report-${Date.now()}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: error.message || "Failed to generate report" });
    }
  });
  app2.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const notifications2 = await storage.getUserNotifications(userId);
      res.json(notifications2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  app2.post("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const notification = await storage.markNotificationAsRead(id, userId);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json(notification);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });
  app2.post("/api/products", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const productData = insertProductSchema.parse({ ...req.body, userId });
      const product = await storage.createProduct(productData);
      const admins = await storage.getUsersByRole("admin");
      for (const admin of admins) {
        await storage.createNotification({
          userId: admin.id,
          message: `New product "${product.name}" added by ${req.user.name}`,
          type: "info",
          read: false
        });
      }
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });
  app2.get("/api/admin/users", isAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const users2 = await storage.getAllUsers();
      const safeUsers = users2.map((user) => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.put("/api/admin/users/:id", isAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
      }
      const id = parseInt(req.params.id);
      if (id === req.user.id && req.body.role && req.body.role !== req.user.role) {
        return res.status(400).json({ message: "Cannot change your own role" });
      }
      const userData = { ...req.body };
      if (userData.password) {
        const bcrypt2 = __require("bcrypt");
        const salt = await bcrypt2.genSalt(10);
        userData.password = await bcrypt2.hash(userData.password, salt);
      }
      const updatedUser = await storage.updateUser(id, userData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  app2.delete("/api/admin/users/:id", isAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
      }
      const id = parseInt(req.params.id);
      if (id === req.user.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  app2.get("/api/customers", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.query.businessId ? parseInt(req.query.businessId) : void 0;
      const customers2 = await storage.getAllCustomers(userId, businessId);
      res.json(customers2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });
  app2.post("/api/customers", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      let businessId = req.body.businessId;
      if (!businessId) {
        const defaultBusiness = await storage.getDefaultBusiness(userId);
        if (defaultBusiness) {
          businessId = defaultBusiness.id;
        }
      }
      const customerData = {
        ...req.body,
        userId,
        businessId
      };
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create customer" });
    }
  });
  app2.put("/api/customers/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      if (customer.userId !== userId && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to update this customer" });
      }
      const updatedCustomer = await storage.updateCustomer(id, req.body);
      if (!updatedCustomer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(updatedCustomer);
    } catch (error) {
      res.status(500).json({ message: "Failed to update customer" });
    }
  });
  app2.delete("/api/customers/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      if (customer.userId !== userId && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to delete this customer" });
      }
      const success = await storage.deleteCustomer(id);
      if (!success) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });
  app2.get("/api/analytics/sales-summary", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.query.businessId ? parseInt(req.query.businessId) : void 0;
      const summary = await storage.getSalesSummary(userId, businessId);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales summary" });
    }
  });
  app2.get("/api/analytics/top-products", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.query.businessId ? parseInt(req.query.businessId) : void 0;
      const limit = req.query.limit ? parseInt(req.query.limit) : 5;
      const topProducts = await storage.getTopProducts(userId, limit, businessId);
      res.json(topProducts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top products" });
    }
  });
  app2.get("/api/analytics/monthly-sales", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.query.businessId ? parseInt(req.query.businessId) : void 0;
      const year = req.query.year ? parseInt(req.query.year) : (/* @__PURE__ */ new Date()).getFullYear();
      const monthlySales = await storage.getMonthlySales(userId, year, businessId);
      res.json(monthlySales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch monthly sales" });
    }
  });
  app2.get("/api/businesses", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const businesses2 = await storage.getAllBusinesses(userId);
      res.json(businesses2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch businesses" });
    }
  });
  app2.get("/api/businesses/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      const business = await storage.getBusiness(id);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      if (business.userId !== userId && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to view this business" });
      }
      res.json(business);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch business" });
    }
  });
  app2.get("/api/businesses/default", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const business = await storage.getDefaultBusiness(userId);
      if (!business) {
        return res.status(404).json({ message: "No default business found" });
      }
      res.json(business);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch default business" });
    }
  });
  app2.post("/api/businesses", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const businessData = { ...req.body, userId };
      const existingBusinesses = await storage.getAllBusinesses(userId);
      if (existingBusinesses.length === 0) {
        businessData.isDefault = true;
      }
      const business = await storage.createBusiness(businessData);
      res.status(201).json(business);
    } catch (error) {
      res.status(500).json({ message: "Failed to create business" });
    }
  });
  app2.put("/api/businesses/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      const business = await storage.getBusiness(id);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      if (business.userId !== userId && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to update this business" });
      }
      const updatedBusiness = await storage.updateBusiness(id, req.body);
      if (!updatedBusiness) {
        return res.status(404).json({ message: "Business not found" });
      }
      res.json(updatedBusiness);
    } catch (error) {
      res.status(500).json({ message: "Failed to update business" });
    }
  });
  app2.delete("/api/businesses/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      const business = await storage.getBusiness(id);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      if (business.userId !== userId && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to delete this business" });
      }
      const success = await storage.deleteBusiness(id);
      if (!success) {
        return res.status(400).json({ message: "Cannot delete default business" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete business" });
    }
  });
  app2.get("/api/dashboard/summary", isAuthenticated, async (req, res) => {
    try {
      let userId = req.user.id;
      const requestedUserId = req.query.userId ? parseInt(req.query.userId) : void 0;
      if (requestedUserId && req.user.role === "admin") {
        console.log(`Admin requesting dashboard data for user ${requestedUserId}`);
        userId = requestedUserId;
      }
      const businessId = req.query.businessId ? parseInt(req.query.businessId) : void 0;
      console.log(`Fetching dashboard data for user ${userId}, business ${businessId || "all"}`);
      const salesSummary = await storage.getSalesSummary(userId, businessId);
      const topProducts = await storage.getTopProducts(userId, 5, businessId);
      const monthlySales = await storage.getMonthlySales(userId, (/* @__PURE__ */ new Date()).getFullYear(), businessId);
      const categorySales = await storage.getCategorySales(userId, businessId);
      const productsStats = await storage.getProductsStats(userId, businessId);
      console.log(`Dashboard data: ${monthlySales.length} monthly records, ${topProducts.length} top products, ${categorySales.length} categories, ${productsStats.length} product categories`);
      console.log("Raw monthly sales data:", JSON.stringify(monthlySales));
      const formattedMonthlySales = monthlySales.map((item) => {
        const formattedItem = {
          ...item,
          month: typeof item.month === "string" ? parseInt(item.month) : item.month,
          totalSales: typeof item.totalSales === "string" ? parseInt(item.totalSales) : item.totalSales || 0,
          revenue: typeof item.revenue === "string" ? item.revenue : String(item.revenue || 0)
        };
        console.log(`Month ${formattedItem.month}: revenue=${formattedItem.revenue}, sales=${formattedItem.totalSales}`);
        return formattedItem;
      });
      const hasData = formattedMonthlySales.some(
        (item) => parseFloat(item.revenue) > 0 || item.totalSales > 0
      );
      console.log(`Dashboard data check: has non-zero data: ${hasData}`);
      res.json({
        salesSummary,
        topProducts,
        monthlySales: formattedMonthlySales,
        categorySales,
        hasData,
        productsStats
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });
  app2.get("/api/dashboard/products-stats", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.query.businessId ? parseInt(req.query.businessId) : void 0;
      console.log(`Fetching products stats for user ${userId}, business ${businessId || "all"}`);
      const productsStats = await storage.getProductsStats(userId, businessId);
      res.json(productsStats);
    } catch (error) {
      console.error("Error fetching products stats:", error);
      res.status(500).json({ message: "Failed to fetch products stats" });
    }
  });
  app2.get("/api/admin/system-status", isAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
      }
      const cpus = os.cpus();
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const uptime = os.uptime();
      const cpuUsage = cpus.reduce((acc, cpu) => {
        const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
        const idle = cpu.times.idle;
        return acc + (total - idle) / total * 100;
      }, 0) / cpus.length;
      const memoryUsage = (totalMemory - freeMemory) / totalMemory * 100;
      const diskUsage = 65.5;
      const uptimeDays = Math.floor(uptime / (60 * 60 * 24));
      const systemStatus = {
        cpuUsage: Math.round(cpuUsage),
        memoryUsage: Math.round(memoryUsage),
        diskUsage: Math.round(diskUsage),
        uptime: uptimeDays
      };
      res.json(systemStatus);
    } catch (error) {
      console.error("Error fetching system status:", error);
      res.status(500).json({ message: "Failed to fetch system status" });
    }
  });
  app2.get("/api/admin/user-activity", isAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
      }
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = /* @__PURE__ */ new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split("T")[0];
      });
      const activityData = last7Days.map((dateStr) => {
        return {
          date: dateStr,
          activeUsers: Math.floor(Math.random() * 10)
          // Случайное число активных пользователей для демонстрации
        };
      });
      res.json(activityData);
    } catch (error) {
      console.error("Error fetching user activity:", error);
      res.status(500).json({ message: "Failed to fetch user activity" });
    }
  });
  app2.get("/api/admin/user-sales", isAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
      }
      const userSales = [
        { userId: 1, userName: "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440", totalSales: 125, totalRevenue: 78500 },
        { userId: 2, userName: "\u041C\u0435\u043D\u0435\u0434\u0436\u0435\u0440", totalSales: 89, totalRevenue: 52300 },
        { userId: 3, userName: "\u041F\u0440\u043E\u0434\u0430\u0432\u0435\u0446", totalSales: 67, totalRevenue: 41200 },
        { userId: 4, userName: "\u0421\u0442\u0430\u0436\u0435\u0440", totalSales: 34, totalRevenue: 18700 },
        { userId: 5, userName: "\u041A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u043D\u0442", totalSales: 56, totalRevenue: 31500 }
      ];
      res.json(userSales);
    } catch (error) {
      console.error("Error fetching user sales:", error);
      res.status(500).json({ message: "Failed to fetch user sales" });
    }
  });
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    port: 3001,
    strictPort: true,
    open: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "..", "dist", "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && origin.match(/^http:\/\/localhost:\d+$/)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
  }
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  app.use("/api/*", (req, res) => {
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
    res.status(404).json({ message: "API endpoint not found" });
  });
  const serveClientApp = process.env.SERVE_CLIENT === "true";
  if (app.get("env") === "development" && serveClientApp) {
    await setupVite(app, server);
  } else if (serveClientApp) {
    serveStatic(app);
  } else {
    app.use("*", (req, res) => {
      res.status(404).json({ message: "Only API endpoints are available on this server" });
    });
  }
  const port = 5005;
  server.listen(port, "0.0.0.0", () => {
    log(`API server running on port ${port}`);
    log(`Mode: ${app.get("env")}, Serving client: ${serveClientApp ? "Yes" : "No"}`);
    log(`CORS enabled for localhost connections on any port`);
  });
})();
