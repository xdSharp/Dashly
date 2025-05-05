import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { processCSVData, parseCSV } from "./csv-processor";
import { generatePDF } from "./pdf-generator";
import { insertProductSchema, insertCategorySchema, insertSaleSchema, csvRowSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  const httpServer = createServer(app);

  // API routes below (all routes are prefixed with /api)
  
  // Product routes
  app.get("/api/products", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const products = await storage.getAllProducts(userId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/products", isAuthenticated, async (req, res) => {
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
      const categories = await storage.getAllCategories(userId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", isAuthenticated, async (req, res) => {
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
      const sales = await storage.getAllSales(userId);
      
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
      
      const updatedSale = await storage.updateSale(id, req.body);
      if (!updatedSale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      
      res.json(updatedSale);
    } catch (error) {
      res.status(500).json({ message: "Failed to update sale" });
    }
  });

  app.delete("/api/sales/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Get the sale to check ownership
      const sale = await storage.getSale(id);
      if (!sale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      
      // Check if user has permission to delete this sale
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
      // Only admins can access this route (enforced by middleware)
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const users = await storage.getAllUsers();
      
      // Remove passwords before sending
      const safeUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  app.put("/api/admin/users/:id", isAuthenticated, async (req, res) => {
    try {
      // Only admins can access this route (enforced by middleware)
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const id = parseInt(req.params.id);
      
      // Don't allow changing own role (to prevent removal of admin rights)
      if (id === req.user.id && req.body.role && req.body.role !== req.user.role) {
        return res.status(400).json({ message: "Cannot change your own role" });
      }
      
      const updatedUser = await storage.updateUser(id, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password before sending
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  app.delete("/api/admin/users/:id", isAuthenticated, async (req, res) => {
    try {
      // Only admins can access this route (enforced by middleware)
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const id = parseInt(req.params.id);
      
      // Don't allow deleting self
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
