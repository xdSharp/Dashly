import { pgTable, text, serial, integer, numeric, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export { pgTable, integer, text };

// Users table with roles
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"), // "admin" or "user"
  createdAt: timestamp("created_at").defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  categoryId: integer("category_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  userId: integer("user_id").notNull(), // Owner of the product data
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  userId: integer("user_id").notNull(), // Owner of the category data
});

// Sales table
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  price: numeric("price").notNull(),
  quantity: integer("quantity").notNull(), 
  amount: numeric("amount").notNull(),
  date: timestamp("date").notNull(),
  employee: text("employee"),
  userId: integer("user_id").notNull(), // Owner of the sales data
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas for input validation

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  role: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  categoryId: true,
  userId: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  userId: true,
});

export const insertSaleSchema = createInsertSchema(sales).pick({
  productId: true,
  price: true, 
  quantity: true,
  amount: true,
  date: true,
  employee: true,
  userId: true,
});

// CSV upload schema
export const csvRowSchema = z.object({
  product_name: z.string(),
  category_name: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  amount: z.number().positive(),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  employee: z.string().optional(),
});

export const csvUploadSchema = z.array(csvRowSchema);

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;

export type CSVRow = z.infer<typeof csvRowSchema>;
export type CSVData = z.infer<typeof csvUploadSchema>;

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginData = z.infer<typeof loginSchema>;
