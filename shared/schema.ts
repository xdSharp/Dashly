import { pgTable, text, serial, integer, numeric, timestamp, varchar, jsonb, index, primaryKey, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export { pgTable, integer, text };

// Users table with roles
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("user"), // "admin" или "user"
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Businesses table
export const businesses = pgTable("businesses", {
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
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  isDefault: boolean("is_default").default(true),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 20 }).default('#4f86d6'),
  icon: varchar("icon", { length: 50 }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  businessId: integer("business_id").references(() => businesses.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  sku: varchar("sku", { length: 50 }),
  imageUrl: varchar("image_url", { length: 255 }),
  stock: integer("stock").default(0),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: 'set null' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  businessId: integer("business_id").references(() => businesses.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Sales table
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  businessId: integer("business_id").references(() => businesses.id, { onDelete: 'cascade' }),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  customerName: varchar("customer_name", { length: 100 }),
  customerEmail: varchar("customer_email", { length: 100 }),
  saleDate: timestamp("sale_date", { withTimezone: true }).defaultNow(),
  status: varchar("status", { length: 20 }).default('completed'),
  paymentMethod: varchar("payment_method", { length: 50 }),
  notes: text("notes"),
  employee: varchar("employee", { length: 100 })
});

// Customers table
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  businessId: integer("business_id").references(() => businesses.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  totalPurchases: integer("total_purchases").default(0),
  totalSpent: decimal("total_spent", { precision: 12, scale: 2 }).default('0'),
});

// Feedback table
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id, { onDelete: 'cascade' }),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }),
  businessId: integer("business_id").references(() => businesses.id, { onDelete: 'cascade' }),
  customerId: integer("customer_id").references(() => customers.id, { onDelete: 'cascade' }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  businessId: integer("business_id").references(() => businesses.id, { onDelete: 'cascade' }),
  message: text("message").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'info', 'warning', 'error'
  read: boolean("read").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Sessions table for auth
export const sessions = pgTable("session", {
  sid: varchar("sid").notNull().primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire", { precision: 6, mode: 'date' }).notNull(),
}, (table) => {
  return {
    expireIdx: index("IDX_session_expire").on(table.expire),
  }
});

// Zod schemas for input validation

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  role: true,
});

export const insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertSaleSchema = createInsertSchema(sales).omit({
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

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true, 
  createdAt: true,
  totalPurchases: true,
  totalSpent: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// CSV upload schema
export const csvRowSchema = z.object({
  product_name: z.string(),
  category_name: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  total_amount: z.number().positive(),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  employee: z.string().optional(),
  customer_name: z.string().optional(),
  customer_email: z.string().email().optional(),
  payment_method: z.string().optional(),
  status: z.string().optional(),
});

export const csvUploadSchema = z.array(csvRowSchema);

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Session = typeof sessions.$inferSelect;

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Имя пользователя обязательно"),
  password: z.string().min(1, "Пароль обязателен"),
});

export type LoginData = z.infer<typeof loginSchema>;
