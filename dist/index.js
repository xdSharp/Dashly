// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"),
  // "admin" or "user"
  createdAt: timestamp("created_at").defaultNow()
});
var products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  categoryId: integer("category_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  userId: integer("user_id").notNull()
  // Owner of the product data
});
var categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  userId: integer("user_id").notNull()
  // Owner of the category data
});
var sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  price: numeric("price").notNull(),
  quantity: integer("quantity").notNull(),
  amount: numeric("amount").notNull(),
  date: timestamp("date").notNull(),
  employee: text("employee"),
  userId: integer("user_id").notNull(),
  // Owner of the sales data
  createdAt: timestamp("created_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  role: true
});
var insertProductSchema = createInsertSchema(products).pick({
  name: true,
  categoryId: true,
  userId: true
});
var insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  userId: true
});
var insertSaleSchema = createInsertSchema(sales).pick({
  productId: true,
  price: true,
  quantity: true,
  amount: true,
  date: true,
  employee: true,
  userId: true
});
var csvRowSchema = z.object({
  product_name: z.string(),
  category_name: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  amount: z.number().positive(),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format"
  }),
  employee: z.string().optional()
});
var csvUploadSchema = z.array(csvRowSchema);
var loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

// server/storage.ts
import session from "express-session";
import createMemoryStore from "memorystore";
var MemoryStore = createMemoryStore(session);
var MemStorage = class {
  users;
  products;
  categories;
  sales;
  sessionStore;
  userIdCounter;
  productIdCounter;
  categoryIdCounter;
  saleIdCounter;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.products = /* @__PURE__ */ new Map();
    this.categories = /* @__PURE__ */ new Map();
    this.sales = /* @__PURE__ */ new Map();
    this.userIdCounter = 1;
    this.productIdCounter = 1;
    this.categoryIdCounter = 1;
    this.saleIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 864e5
      // prune expired entries every 24h
    });
    this.createUser({
      username: "admin",
      password: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
      // "admin123"
      email: "admin@example.com",
      name: "Admin User",
      role: "admin"
    });
    this.createUser({
      username: "user",
      password: "$2b$10$NlZqGdyrZP7vZDbGcU2VMeEW5KwnB/s.UxYSOUJ9zPVh0K49e8p8m",
      // "user123"
      email: "user@example.com",
      name: "Regular User",
      role: "user"
    });
  }
  // User operations
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(user) {
    const id = this.userIdCounter++;
    console.log("Storage: createUser - \u0432\u0445\u043E\u0434\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435:", user);
    const newUser = {
      ...user,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    console.log("Storage: createUser - \u0441\u043E\u0437\u0434\u0430\u043D\u043D\u044B\u0439 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C:", {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
      name: newUser.name,
      email: newUser.email
    });
    this.users.set(id, newUser);
    return newUser;
  }
  async getAllUsers() {
    return Array.from(this.users.values());
  }
  async updateUser(id, userData) {
    const user = await this.getUser(id);
    if (!user) return void 0;
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  async deleteUser(id) {
    return this.users.delete(id);
  }
  // Product operations
  async getProduct(id) {
    return this.products.get(id);
  }
  async getProductByName(name, userId) {
    return Array.from(this.products.values()).find(
      (product) => product.name === name && product.userId === userId
    );
  }
  async createProduct(product) {
    const id = this.productIdCounter++;
    const newProduct = {
      ...product,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.products.set(id, newProduct);
    return newProduct;
  }
  async getAllProducts(userId) {
    return Array.from(this.products.values()).filter(
      (product) => product.userId === userId
    );
  }
  async updateProduct(id, productData) {
    const product = await this.getProduct(id);
    if (!product) return void 0;
    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  async deleteProduct(id) {
    return this.products.delete(id);
  }
  // Category operations
  async getCategory(id) {
    return this.categories.get(id);
  }
  async getCategoryByName(name, userId) {
    return Array.from(this.categories.values()).find(
      (category) => category.name === name && category.userId === userId
    );
  }
  async createCategory(category) {
    const id = this.categoryIdCounter++;
    const newCategory = {
      ...category,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  async getAllCategories(userId) {
    return Array.from(this.categories.values()).filter(
      (category) => category.userId === userId
    );
  }
  async updateCategory(id, categoryData) {
    const category = await this.getCategory(id);
    if (!category) return void 0;
    const updatedCategory = { ...category, ...categoryData };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }
  async deleteCategory(id) {
    return this.categories.delete(id);
  }
  // Sale operations
  async getSale(id) {
    return this.sales.get(id);
  }
  async createSale(sale) {
    const id = this.saleIdCounter++;
    const newSale = {
      ...sale,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.sales.set(id, newSale);
    return newSale;
  }
  async getAllSales(userId) {
    return Array.from(this.sales.values()).filter(
      (sale) => sale.userId === userId
    );
  }
  async updateSale(id, saleData) {
    const sale = await this.getSale(id);
    if (!sale) return void 0;
    const updatedSale = { ...sale, ...saleData };
    this.sales.set(id, updatedSale);
    return updatedSale;
  }
  async deleteSale(id) {
    return this.sales.delete(id);
  }
};
var storage = new MemStorage();
var notifications = pgTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  message: text("message").notNull(),
  type: text("type", { enum: ["info", "warning", "success"] }).notNull(),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().$default(() => (/* @__PURE__ */ new Date()).toISOString())
});

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
      secure: false,
      // Отключаем для разработки
      maxAge: 24 * 60 * 60 * 1e3,
      // 24 hours
      httpOnly: true,
      sameSite: "lax"
    }
  };
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
  let category = await storage.getCategoryByName(row.category_name, userId);
  if (!category) {
    category = await storage.createCategory({
      name: row.category_name,
      userId
    });
  }
  let product = await storage.getProductByName(row.product_name, userId);
  if (!product) {
    product = await storage.createProduct({
      name: row.product_name,
      categoryId: category.id,
      userId
    });
  }
  const parsedDate = new Date(row.date);
  const sale = await storage.createSale({
    productId: product.id,
    price: row.price,
    quantity: row.quantity,
    amount: row.amount,
    date: parsedDate,
    employee: row.employee || "",
    userId
  });
  return { category, product, sale };
}
function parseCSV(csvContent) {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("CSV must contain a header row and at least one data row");
  }
  const headerRow = lines[0].split(",");
  const requiredColumns = ["product_name", "category_name", "price", "quantity", "amount", "date"];
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
      if (["price", "quantity", "amount"].includes(key)) {
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
async function generatePDF(options, outputStream) {
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(outputStream);
  try {
    await generateReportContent(doc, options);
    doc.end();
  } catch (error) {
    doc.end();
    throw error;
  }
}
async function generateReportContent(doc, options) {
  const { title, userId, filters } = options;
  const user = await storage.getUser(userId);
  if (!user) {
    throw new Error("User not found");
  }
  const allSales = await storage.getAllSales(userId);
  const filteredSales = allSales.filter((sale) => {
    let match = true;
    if (filters.startDate) {
      match = match && sale.date >= filters.startDate;
    }
    if (filters.endDate) {
      match = match && sale.date <= filters.endDate;
    }
    if (filters.employee) {
      match = match && sale.employee === filters.employee;
    }
    return match;
  });
  addHeader(doc, title);
  addMetadata(doc, user, filters);
  addSummaryStatistics(doc, filteredSales);
  if (options.charts.revenue) {
    addChartSection(doc, "Revenue Over Time", options.charts.revenue);
  }
  if (options.charts.categories) {
    addChartSection(doc, "Sales by Category", options.charts.categories);
  }
  if (options.charts.products) {
    addChartSection(doc, "Top Products", options.charts.products);
  }
  await addSalesTable(doc, filteredSales);
}
function addHeader(doc, title) {
  doc.fontSize(10).text("SalesVue", { align: "left" });
  doc.moveDown(1);
  doc.fontSize(18).font("Helvetica-Bold").text(title, { align: "center" });
  doc.moveDown(1);
}
function addMetadata(doc, user, filters) {
  doc.fontSize(10).font("Helvetica");
  doc.text(`Generated by: ${user.name}`, { continued: true }).text(`Date: ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`, { align: "right" });
  doc.moveDown(0.5);
  doc.text("Filters applied:", { underline: true });
  doc.moveDown(0.5);
  doc.text(`Date range: ${filters.startDate && filters.endDate ? `${filters.startDate.toLocaleDateString()} to ${filters.endDate.toLocaleDateString()}` : "All time"}`);
  if (filters.employee) {
    doc.text(`Employee: ${filters.employee}`);
  }
  doc.moveDown(1);
  doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
  doc.moveDown(1);
}
function addSummaryStatistics(doc, sales3) {
  doc.fontSize(14).font("Helvetica-Bold").text("Summary", { underline: true });
  doc.moveDown(0.5).fontSize(10).font("Helvetica");
  const totalSales = sales3.length;
  const totalRevenue = sales3.reduce((sum, sale) => sum + Number(sale.amount), 0);
  const totalQuantity = sales3.reduce((sum, sale) => sum + sale.quantity, 0);
  const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
  doc.text(`Total Sales: ${totalSales}`, { width: 200, continued: true }).text(`Total Revenue: $${totalRevenue.toFixed(2)}`, { align: "right" });
  doc.moveDown(0.5);
  doc.text(`Total Items Sold: ${totalQuantity}`, { width: 200, continued: true }).text(`Average Order Value: $${averageOrderValue.toFixed(2)}`, { align: "right" });
  doc.moveDown(1);
  doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
  doc.moveDown(1);
}
function addChartSection(doc, title, chartData) {
  doc.fontSize(14).font("Helvetica-Bold").text(title, { underline: true });
  doc.moveDown(0.5).fontSize(10).font("Helvetica");
  doc.text("Chart data representation:");
  doc.moveDown(0.5);
  chartData.labels.forEach((label, i) => {
    const dataValue = chartData.datasets[0].data[i] || 0;
    doc.text(`${label}: ${dataValue}`);
  });
  doc.moveDown(1);
}
async function addSalesTable(doc, sales3) {
  doc.fontSize(14).font("Helvetica-Bold").text("Sales Data", { underline: true });
  doc.moveDown(0.5);
  const tableTop = doc.y;
  const tableColumnWidth = (doc.page.width - 100) / 6;
  doc.fontSize(10).font("Helvetica-Bold");
  doc.text("Product", 50, tableTop, { width: tableColumnWidth, align: "left" });
  doc.text("Category", 50 + tableColumnWidth, tableTop, { width: tableColumnWidth, align: "left" });
  doc.text("Price", 50 + tableColumnWidth * 2, tableTop, { width: tableColumnWidth, align: "right" });
  doc.text("Quantity", 50 + tableColumnWidth * 3, tableTop, { width: tableColumnWidth, align: "right" });
  doc.text("Amount", 50 + tableColumnWidth * 4, tableTop, { width: tableColumnWidth, align: "right" });
  doc.text("Date", 50 + tableColumnWidth * 5, tableTop, { width: tableColumnWidth, align: "left" });
  doc.moveTo(50, tableTop + 15).lineTo(doc.page.width - 50, tableTop + 15).stroke();
  doc.fontSize(10).font("Helvetica");
  let rowTop = tableTop + 25;
  const products3 = /* @__PURE__ */ new Map();
  const categories3 = /* @__PURE__ */ new Map();
  for (const sale of sales3) {
    if (!products3.has(sale.productId)) {
      const product2 = await storage.getProduct(sale.productId);
      products3.set(sale.productId, product2);
    }
    const product = products3.get(sale.productId);
    if (!product) continue;
    if (!categories3.has(product.categoryId)) {
      const category2 = await storage.getCategory(product.categoryId);
      categories3.set(product.categoryId, category2);
    }
    const category = categories3.get(product.categoryId);
    if (!category) continue;
    if (rowTop > doc.page.height - 70) {
      doc.addPage();
      rowTop = 50;
      doc.fontSize(10).font("Helvetica-Bold");
      doc.text("Product", 50, rowTop, { width: tableColumnWidth, align: "left" });
      doc.text("Category", 50 + tableColumnWidth, rowTop, { width: tableColumnWidth, align: "left" });
      doc.text("Price", 50 + tableColumnWidth * 2, rowTop, { width: tableColumnWidth, align: "right" });
      doc.text("Quantity", 50 + tableColumnWidth * 3, rowTop, { width: tableColumnWidth, align: "right" });
      doc.text("Amount", 50 + tableColumnWidth * 4, rowTop, { width: tableColumnWidth, align: "right" });
      doc.text("Date", 50 + tableColumnWidth * 5, rowTop, { width: tableColumnWidth, align: "left" });
      doc.moveTo(50, rowTop + 15).lineTo(doc.page.width - 50, rowTop + 15).stroke();
      rowTop += 25;
      doc.fontSize(10).font("Helvetica");
    }
    const formattedDate = sale.date.toLocaleDateString();
    doc.text(product.name, 50, rowTop, { width: tableColumnWidth, align: "left" });
    doc.text(category.name, 50 + tableColumnWidth, rowTop, { width: tableColumnWidth, align: "left" });
    doc.text(`$${Number(sale.price).toFixed(2)}`, 50 + tableColumnWidth * 2, rowTop, { width: tableColumnWidth, align: "right" });
    doc.text(sale.quantity.toString(), 50 + tableColumnWidth * 3, rowTop, { width: tableColumnWidth, align: "right" });
    doc.text(`$${Number(sale.amount).toFixed(2)}`, 50 + tableColumnWidth * 4, rowTop, { width: tableColumnWidth, align: "right" });
    doc.text(formattedDate, 50 + tableColumnWidth * 5, rowTop, { width: tableColumnWidth, align: "left" });
    rowTop += 20;
  }
  doc.moveTo(50, rowTop).lineTo(doc.page.width - 50, rowTop).stroke();
}

// server/routes.ts
import { ZodError } from "zod";
async function registerRoutes(app2) {
  setupAuth(app2);
  const httpServer = createServer(app2);
  app2.get("/api/products", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const products3 = await storage.getAllProducts(userId);
      res.json(products3);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  app2.post("/api/products", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const productData = insertProductSchema.parse({ ...req.body, userId });
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
      const categories3 = await storage.getAllCategories(userId);
      res.json(categories3);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  app2.post("/api/categories", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const categoryData = insertCategorySchema.parse({ ...req.body, userId });
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
      const sales3 = await storage.getAllSales(userId);
      const enrichedSales = await Promise.all(sales3.map(async (sale) => {
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
      const saleData = insertSaleSchema.parse({ ...req.body, userId });
      const sale = await storage.createSale(saleData);
      res.status(201).json(sale);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create sale" });
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
      const updatedSale = await storage.updateSale(id, req.body);
      if (!updatedSale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.json(updatedSale);
    } catch (error) {
      res.status(500).json({ message: "Failed to update sale" });
    }
  });
  app2.delete("/api/sales/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      const sale = await storage.getSale(id);
      if (!sale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      if (sale.userId !== userId && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to delete this sale" });
      }
      const success = await storage.deleteSale(id);
      if (!success) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.status(204).send();
    } catch (error) {
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
        return res.status(403).json({ message: "Not authorized" });
      }
      const users3 = await storage.getAllUsers();
      const safeUsers = users3.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
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
      const updatedUser = await storage.updateUser(id, req.body);
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
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
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
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
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
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
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
  const distPath = path2.resolve(import.meta.dirname, "..", "dist", "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
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
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5005;
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
