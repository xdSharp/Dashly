import { users, products, categories, sales, pgTable, integer, text } from "@shared/schema";
import type { User, InsertUser, Product, InsertProduct, Category, InsertCategory, Sale, InsertSale } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// In-memory storage with all required methods for CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getProductByName(name: string, userId: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  getAllProducts(userId: number): Promise<Product[]>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Category operations
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryByName(name: string, userId: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  getAllCategories(userId: number): Promise<Category[]>;
  updateCategory(id: number, category: Partial<Category>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Sale operations
  getSale(id: number): Promise<Sale | undefined>;
  createSale(sale: InsertSale): Promise<Sale>;
  getAllSales(userId: number): Promise<Sale[]>;
  updateSale(id: number, sale: Partial<Sale>): Promise<Sale | undefined>;
  deleteSale(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private categories: Map<number, Category>;
  private sales: Map<number, Sale>;
  sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private productIdCounter: number;
  private categoryIdCounter: number;
  private saleIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.categories = new Map();
    this.sales = new Map();
    
    this.userIdCounter = 1;
    this.productIdCounter = 1;
    this.categoryIdCounter = 1;
    this.saleIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Create admin user
    this.createUser({
      username: "admin",
      password: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u", // "admin123"
      email: "admin@example.com",
      name: "Admin User",
      role: "admin"
    });
    
    // Create regular user
    this.createUser({
      username: "user",
      password: "$2b$10$NlZqGdyrZP7vZDbGcU2VMeEW5KwnB/s.UxYSOUJ9zPVh0K49e8p8m", // "user123"
      email: "user@example.com",
      name: "Regular User",
      role: "user"
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    console.log("Storage: createUser - входные данные:", user);
    
    const newUser: User = { 
      ...user, 
      id,
      createdAt: new Date()
    };
    console.log("Storage: createUser - созданный пользователь:", { 
      id: newUser.id, 
      username: newUser.username, 
      role: newUser.role,
      name: newUser.name,
      email: newUser.email
    });
    
    this.users.set(id, newUser);
    return newUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }
  
  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProductByName(name: string, userId: number): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      (product) => product.name === name && product.userId === userId
    );
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const newProduct: Product = {
      ...product,
      id,
      createdAt: new Date()
    };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  async getAllProducts(userId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.userId === userId
    );
  }
  
  async updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined> {
    const product = await this.getProduct(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }
  
  // Category operations
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async getCategoryByName(name: string, userId: number): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.name === name && category.userId === userId
    );
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const newCategory: Category = {
      ...category,
      id,
      createdAt: new Date()
    };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  async getAllCategories(userId: number): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(
      category => category.userId === userId
    );
  }
  
  async updateCategory(id: number, categoryData: Partial<Category>): Promise<Category | undefined> {
    const category = await this.getCategory(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...categoryData };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }
  
  // Sale operations
  async getSale(id: number): Promise<Sale | undefined> {
    return this.sales.get(id);
  }
  
  async createSale(sale: InsertSale): Promise<Sale> {
    const id = this.saleIdCounter++;
    const newSale: Sale = {
      ...sale,
      id,
      createdAt: new Date()
    };
    this.sales.set(id, newSale);
    return newSale;
  }
  
  async getAllSales(userId: number): Promise<Sale[]> {
    return Array.from(this.sales.values()).filter(
      sale => sale.userId === userId
    );
  }
  
  async updateSale(id: number, saleData: Partial<Sale>): Promise<Sale | undefined> {
    const sale = await this.getSale(id);
    if (!sale) return undefined;
    
    const updatedSale = { ...sale, ...saleData };
    this.sales.set(id, updatedSale);
    return updatedSale;
  }
  
  async deleteSale(id: number): Promise<boolean> {
    return this.sales.delete(id);
  }
}

// Export a singleton instance of MemStorage
export const storage = new MemStorage();
// Add after other imports
type Notification = {
  id: number;
  userId: number;
  message: string;
  type: 'info' | 'warning' | 'success';
  read: boolean;
  createdAt: Date;
};

// Add after other tables
const notifications = pgTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  message: text('message').notNull(),
  type: text('type', { enum: ['info', 'warning', 'success'] }).notNull(),
  read: integer('read', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().$default(() => new Date().toISOString()),
});

// Add these methods
export async function createNotification(data: Omit<Notification, 'id' | 'createdAt'>) {
  return db.insert(notifications).values(data).returning().get();
}

export async function getUserNotifications(userId: number) {
  return db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .all();
}

export async function markNotificationAsRead(id: number, userId: number) {
  return db.update(notifications)
    .set({ read: true })
    .where(and(
      eq(notifications.id, id),
      eq(notifications.userId, userId)
    ))
    .returning()
    .get();
}
