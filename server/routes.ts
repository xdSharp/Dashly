import { Express } from "express";
import { createServer, Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { processCSVData, parseCSV } from "./csv-processor";
import { generatePDF } from "./pdf-generator";
import { insertProductSchema, insertCategorySchema, insertSaleSchema, csvRowSchema, insertCustomerSchema } from "@shared/schema";
import { ZodError } from "zod";
import * as z from "zod";
import os from "os";
import { formatDistanceToNow } from "date-fns";
import bcrypt from "bcrypt";
import { and, eq, or, ilike, desc, sql } from "drizzle-orm";
import { ru } from "date-fns/locale";
import { hashPassword, verifyPassword } from "./password-utils";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  const httpServer = createServer(app);

  // API routes below (all routes are prefixed with /api)
  
  // Product routes
  app.get("/api/products", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : undefined;
      const products = await storage.getAllProducts(userId, businessId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/products", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      // Если не указан businessId, используем дефолтный бизнес
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

  app.put("/api/products/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Get the product to check ownership
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check if user has permission to update this product
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

  app.delete("/api/products/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Get the product to check ownership
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check if user has permission to delete this product
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

  // Category routes
  app.get("/api/categories", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : undefined;
      const categories = await storage.getAllCategories(userId, businessId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      // Если не указан businessId, используем дефолтный бизнес
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

  app.put("/api/categories/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Get the category to check ownership
      const category = await storage.getCategory(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      // Check if user has permission to update this category
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

  app.delete("/api/categories/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Get the category to check ownership
      const category = await storage.getCategory(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      // Check if user has permission to delete this category
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

  // Sales routes
  app.get("/api/sales", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : undefined;
      const sales = await storage.getAllSales(userId, businessId);
      
      // Enrich sales data with product and category names
      const enrichedSales = await Promise.all(sales.map(async (sale) => {
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

  app.post("/api/sales", isAuthenticated, async (req, res) => {
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
        quantity: quantity,
        price: product.price.toString(),
        totalAmount: total.toString(),
        userId: userId,
        businessId: businessId,
        employee: req.body.employee || "",
        saleDate: req.body.saleDate ? new Date(req.body.saleDate) : new Date(),
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

  app.put("/api/sales/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Get the sale to check ownership
      const sale = await storage.getSale(id);
      if (!sale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      
      // Check if user has permission to update this sale
      if (sale.userId !== userId && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to update this sale" });
      }
      
      // Проверяем существование продукта
      const product = await storage.getProduct(req.body.productId);
      if (!product) {
        return res.status(400).json({ message: "Product not found" });
      }

      const quantity = parseInt(req.body.quantity);
      const total = product.price * quantity;

      // Подготовка данных для обновления
      const updateData = {
        productId: req.body.productId,
        quantity: quantity,
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

  app.delete("/api/sales/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      
      console.log(`Routes: Deleting sale with id ${id} for user ${userId}`);
      
      // Get the sale to check ownership
      const sale = await storage.getSale(id);
      if (!sale) {
        console.log(`Routes: Sale with id ${id} not found`);
        return res.status(404).json({ message: "Sale not found" });
      }
      
      // Check if user has permission to delete this sale
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

  // CSV Upload route
  app.post("/api/upload-csv", isAuthenticated, async (req, res) => {
    try {
      if (!req.body.data) {
        return res.status(400).json({ message: "No CSV data provided" });
      }
      
      const userId = req.user.id;
      
      // Parse CSV data
      const csvData = parseCSV(req.body.data);
      
      // Process and insert the data
      const result = await processCSVData(csvData, userId);
      
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to process CSV" });
    }
  });

  // PDF Export route
  app.post("/api/export-pdf", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const { title, filters, charts } = req.body;
      
      // Set response headers for PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="sales-report-${Date.now()}.pdf"`);
      
      // Generate PDF directly to response stream
      await generatePDF({ 
        title: title || "Sales Report", 
        userId, 
        filters,
        charts
      }, res);
      
    } catch (error: any) {
      // If headers were not sent yet, send error response
      if (!res.headersSent) {
        res.status(500).json({ message: error.message || "Failed to generate PDF" });
      } else {
        // Otherwise, end the response
        res.end();
      }
    }
  });
  
  // Report generation route
  app.post("/api/reports/generate", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const { dateRange, sections } = req.body;
      
      // Collect report data based on selected sections
      const reportData: any = {};
      const businessId = req.body.businessId;
      
      // Get sales data if needed
      if (sections.sales) {
        const query: any = { userId };
        if (businessId) query.businessId = businessId;
        
        // Apply date range filter if provided
        if (dateRange.from) {
          query.fromDate = new Date(dateRange.from);
        }
        if (dateRange.to) {
          query.toDate = new Date(dateRange.to);
        }
        
        reportData.sales = await storage.getSalesWithFilter(userId, query);
      }
      
      // Get products data if needed
      if (sections.products) {
        reportData.products = await storage.getProductsWithSalesData(userId, businessId);
      }
      
      // Get categories data if needed
      if (sections.categories) {
        reportData.categories = await storage.getCategorySales(userId, businessId);
      }
      
      // Get revenue data if needed
      if (sections.revenue) {
        reportData.revenue = await storage.getMonthlySales(userId, new Date().getFullYear(), businessId);
      }
      
      // Get user info
      const user = await storage.getUser(userId);
      
      // Generate PDF
      const pdfBuffer = await generatePDF(reportData, dateRange, user);
      
      // Set response headers for PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="report-${Date.now()}.pdf"`);
      
      // Send the PDF
      res.send(pdfBuffer);
      
    } catch (error: any) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: error.message || "Failed to generate report" });
    }
  });
  
  // Notifications routes
app.get("/api/notifications", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await storage.getUserNotifications(userId);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

app.post("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
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

// Create notifications on important events
app.post("/api/products", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const productData = insertProductSchema.parse({ ...req.body, userId });
    const product = await storage.createProduct(productData);
    
    // Notify admins about new product
    const admins = await storage.getUsersByRole('admin');
    for (const admin of admins) {
      await storage.createNotification({
        userId: admin.id,
        message: `New product "${product.name}" added by ${req.user.name}`,
        type: 'info',
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

// Admin users management routes
  app.get("/api/admin/users", isAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const users = await storage.getAllUsers();
      const safeUsers = users.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  app.put("/api/admin/users/:id", isAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const id = parseInt(req.params.id);
      console.log(`Обновление пользователя ${id}, данные:`, req.body);
      
      if (id === req.user.id && req.body.role && req.body.role !== req.user.role) {
        return res.status(400).json({ message: "Cannot change your own role" });
      }

      // Обработка нового пароля
      const userData = { ...req.body };
      
      // Если в запросе есть новый пароль, хешируем его
      if (userData.password) {
        console.log(`Хеширование пароля для пользователя ${id}`);
        // Используем выделенную функцию для хеширования
        userData.password = await hashPassword(userData.password);
        console.log(`Пароль успешно хеширован:`, userData.password.substring(0, 20) + '...');
      }
      
      console.log("Отправляем данные для обновления:", { ...userData, password: userData.password ? "[HIDDEN]" : undefined });
      const updatedUser = await storage.updateUser(id, userData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      console.log(`Пользователь ${id} успешно обновлен`);
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error(`Ошибка при обновлении пользователя:`, error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  app.delete("/api/admin/users/:id", isAuthenticated, async (req, res) => {
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

  // Эндпоинт для изменения только роли пользователя
  app.put("/api/admin/users/:id/role", isAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const id = parseInt(req.params.id);
      console.log(`Изменение роли пользователя ${id}, данные:`, req.body);
      
      if (id === req.user.id) {
        return res.status(400).json({ message: "Cannot change your own role" });
      }
      
      const { role, password } = req.body;
      if (!role) {
        return res.status(400).json({ message: "Role is required" });
      }
      
      // Если также передан пароль, хешируем его
      let updatedData: any = { role };
      if (password) {
        console.log(`Хеширование пароля для пользователя ${id} при изменении роли`);
        updatedData.password = await hashPassword(password);
        console.log(`Пароль успешно хеширован:`, updatedData.password.substring(0, 20) + '...');
      }
      
      const updatedUser = await storage.updateUser(id, updatedData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password: _password, ...userWithoutPassword } = updatedUser;
      console.log(`Роль пользователя ${id} успешно обновлена`);
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error(`Ошибка при обновлении роли пользователя:`, error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Customer routes
  app.get("/api/customers", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : undefined;
      const customers = await storage.getAllCustomers(userId, businessId);
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post("/api/customers", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      // Если не указан businessId, используем дефолтный бизнес
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

  app.put("/api/customers/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Get the customer to check ownership
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      // Check if user has permission to update this customer
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

  app.delete("/api/customers/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Get the customer to check ownership
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      // Check if user has permission to delete this customer
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

  // API эндпоинты для аналитики

  // Получение сводки по продажам
  app.get("/api/analytics/sales-summary", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : undefined;
      const summary = await storage.getSalesSummary(userId, businessId);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales summary" });
    }
  });

  // Получение топ продуктов
  app.get("/api/analytics/top-products", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const topProducts = await storage.getTopProducts(userId, limit, businessId);
      res.json(topProducts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top products" });
    }
  });

  // Получение продаж по месяцам
  app.get("/api/analytics/monthly-sales", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : undefined;
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
      const monthlySales = await storage.getMonthlySales(userId, year, businessId);
      res.json(monthlySales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch monthly sales" });
    }
  });

  // Business routes
  app.get("/api/businesses", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const businesses = await storage.getAllBusinesses(userId);
      res.json(businesses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch businesses" });
    }
  });

  app.get("/api/businesses/:id", isAuthenticated, async (req, res) => {
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

  app.get("/api/businesses/default", isAuthenticated, async (req, res) => {
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

  app.post("/api/businesses", isAuthenticated, async (req, res) => {
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

  app.put("/api/businesses/:id", isAuthenticated, async (req, res) => {
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

  app.delete("/api/businesses/:id", isAuthenticated, async (req, res) => {
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

  // Dashboard routes
  app.get("/api/dashboard/summary", isAuthenticated, async (req, res) => {
    try {
      // Проверяем, должны ли мы использовать указанный userId (только для админов)
      let userId = req.user.id;
      const requestedUserId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      // Если запрошен конкретный userId и текущий пользователь - админ
      if (requestedUserId && req.user.role === "admin") {
        console.log(`Admin requesting dashboard data for user ${requestedUserId}`);
        userId = requestedUserId;
      }
      
      const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : undefined;
      
      console.log(`Fetching dashboard data for user ${userId}, business ${businessId || 'all'}`);
      
      const salesSummary = await storage.getSalesSummary(userId, businessId);
      const topProducts = await storage.getTopProducts(userId, 5, businessId);
      const monthlySales = await storage.getMonthlySales(userId, new Date().getFullYear(), businessId);
      const categorySales = await storage.getCategorySales(userId, businessId);
      
      // Добавляем новые данные по статистике продуктов
      const productsStats = await storage.getProductsStats(userId, businessId);
      
      console.log(`Dashboard data: ${monthlySales.length} monthly records, ${topProducts.length} top products, ${categorySales.length} categories, ${productsStats.length} product categories`);
      
      // Более подробное логирование для отладки
      console.log("Raw monthly sales data:", JSON.stringify(monthlySales));
      
      // Проверяем и форматируем данные для месячных продаж
      const formattedMonthlySales = monthlySales.map(item => {
        // Убедимся, что все поля имеют правильный формат
        const formattedItem = {
          ...item,
          month: typeof item.month === 'string' ? parseInt(item.month) : item.month,
          totalSales: typeof item.totalSales === 'string' ? parseInt(item.totalSales) : item.totalSales || 0,
          revenue: typeof item.revenue === 'string' ? item.revenue : String(item.revenue || 0)
        };
        
        console.log(`Month ${formattedItem.month}: revenue=${formattedItem.revenue}, sales=${formattedItem.totalSales}`);
        return formattedItem;
      });
      
      // Проверяем, есть ли реальные ненулевые данные
      const hasData = formattedMonthlySales.some(item => 
        parseFloat(item.revenue) > 0 || item.totalSales > 0
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

  // Добавим отдельный маршрут для получения только статистики товаров
  app.get("/api/dashboard/products-stats", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : undefined;
      
      console.log(`Fetching products stats for user ${userId}, business ${businessId || 'all'}`);
      const productsStats = await storage.getProductsStats(userId, businessId);
      
      res.json(productsStats);
    } catch (error) {
      console.error("Error fetching products stats:", error);
      res.status(500).json({ message: "Failed to fetch products stats" });
    }
  });

  // Admin API routes
  app.get("/api/admin/system-status", isAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      // Получаем данные о системе
      const cpus = os.cpus();
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const uptime = os.uptime();

      // Рассчитываем загрузку CPU
      const cpuUsage = cpus.reduce((acc, cpu) => {
        const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
        const idle = cpu.times.idle;
        return acc + ((total - idle) / total) * 100;
      }, 0) / cpus.length;

      // Рассчитываем использование памяти
      const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100;

      // Получаем использование диска (заглушка)
      const diskUsage = 65.5;

      // Вычисляем количество дней работы системы
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

  app.get("/api/admin/user-activity", isAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      // Получаем данные за последние 7 дней
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      // Получаем активность пользователей за каждый день (имитация данных)
      const activityData = last7Days.map((dateStr) => {
        return {
          date: dateStr,
          activeUsers: Math.floor(Math.random() * 10) // Случайное число активных пользователей для демонстрации
        };
      });

      res.json(activityData);
    } catch (error) {
      console.error("Error fetching user activity:", error);
      res.status(500).json({ message: "Failed to fetch user activity" });
    }
  });

  app.get("/api/admin/user-sales", isAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      // Получаем статистику продаж по пользователям (имитация данных)
      const userSales = [
        { userId: 1, userName: "Администратор", totalSales: 125, totalRevenue: 78500 },
        { userId: 2, userName: "Менеджер", totalSales: 89, totalRevenue: 52300 },
        { userId: 3, userName: "Продавец", totalSales: 67, totalRevenue: 41200 },
        { userId: 4, userName: "Стажер", totalSales: 34, totalRevenue: 18700 },
        { userId: 5, userName: "Консультант", totalSales: 56, totalRevenue: 31500 }
      ];

      res.json(userSales);
    } catch (error) {
      console.error("Error fetching user sales:", error);
      res.status(500).json({ message: "Failed to fetch user sales" });
    }
  });

  return httpServer;
}
