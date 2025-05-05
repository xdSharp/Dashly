// User types
export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface InsertUser {
  username: string;
  password: string;
  email: string;
  name: string;
  role?: string;
}

// Product types
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  userId: number;
  createdAt: string;
}

export interface InsertProduct {
  name: string;
  description: string;
  price: number;
  categoryId: number;
  userId: number;
}

// Category types
export interface Category {
  id: number;
  name: string;
  userId: number;
  createdAt: string;
}

export interface InsertCategory {
  name: string;
  userId: number;
}

// Sale types
export interface Sale {
  id: number;
  productId: number;
  price: number;
  quantity: number;
  amount: number;
  employee: string;
  date: string;
  userId: number;
  createdAt: string;
  product?: Product;
  category?: Category;
}

export interface InsertSale {
  productId: number;
  price: number;
  quantity: number;
  amount: number;
  employee: string;
  date: string;
  userId: number;
} 