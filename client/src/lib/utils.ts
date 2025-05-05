import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString();
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

// Group sales by month for chart data
export function groupSalesByMonth(sales: any[]): { labels: string[], data: number[] } {
  const monthlyData: Record<string, number> = {};
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  // Initialize all months with 0
  const currentYear = new Date().getFullYear();
  months.forEach((month, index) => {
    monthlyData[`${currentYear}-${index + 1}`] = 0;
  });
  
  // Sum sales by month
  sales.forEach(sale => {
    const date = new Date(sale.date);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (monthlyData[key] !== undefined) {
      monthlyData[key] += Number(sale.amount);
    }
  });
  
  // Convert to arrays for chart
  const labels = months;
  const data = Object.entries(monthlyData)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([_, value]) => value);
  
  return { labels, data };
}

// Group sales by category for chart data
export function groupSalesByCategory(sales: any[], categories: any[]): { labels: string[], data: number[] } {
  const categoryMap = new Map(categories.map(category => [category.id, category.name]));
  const categorySales: Record<string, number> = {};
  
  // Initialize all categories with 0
  categories.forEach(category => {
    categorySales[category.name] = 0;
  });
  
  // Sum sales by category
  sales.forEach(sale => {
    const categoryName = sale.category?.name || 'Unknown';
    if (categorySales[categoryName] !== undefined) {
      categorySales[categoryName] += Number(sale.amount);
    } else {
      categorySales[categoryName] = Number(sale.amount);
    }
  });
  
  // Sort by sales amount (descending)
  const sortedCategories = Object.entries(categorySales)
    .sort(([, a], [, b]) => b - a);
  
  return {
    labels: sortedCategories.map(([name]) => name),
    data: sortedCategories.map(([, value]) => value)
  };
}

// Group sales by product for chart data
export function groupSalesByProduct(sales: any[], products: any[]): { labels: string[], data: number[] } {
  const productMap = new Map(products.map(product => [product.id, product.name]));
  const productSales: Record<string, number> = {};
  
  // Initialize all products with 0
  products.forEach(product => {
    productSales[product.name] = 0;
  });
  
  // Sum sales by product
  sales.forEach(sale => {
    const productName = sale.product?.name || 'Unknown';
    if (productSales[productName] !== undefined) {
      productSales[productName] += Number(sale.amount);
    } else {
      productSales[productName] = Number(sale.amount);
    }
  });
  
  // Sort by sales amount (descending) and take top N
  const sortedProducts = Object.entries(productSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  
  return {
    labels: sortedProducts.map(([name]) => name),
    data: sortedProducts.map(([, value]) => value)
  };
}

// Calculate statistics for dashboard
export function calculateStats(sales: any[]): { 
  totalSales: number; 
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
} {
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.amount), 0);
  const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
  
  // Assuming 5% conversion rate for demo purposes
  const conversionRate = 28.4; 
  
  return {
    totalSales,
    totalRevenue,
    averageOrderValue,
    conversionRate
  };
}

// Create CSV content from JSON data
export function createCSVContent(data: any[]): string {
  if (!data.length) return '';
  
  // Get headers from first row
  const headers = Object.keys(data[0]);
  
  // Create header row
  const headerRow = headers.join(',');
  
  // Create data rows
  const rows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Handle values that contain commas
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value;
    }).join(',');
  });
  
  // Combine header and data rows
  return [headerRow, ...rows].join('\n');
}

// Parse CSV to JSON
export function parseCSV(csv: string): any[] {
  const lines = csv.split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    if (!line.trim()) return null; // Skip empty lines
    
    const values = line.split(',');
    const row: Record<string, string> = {};
    
    headers.forEach((header, i) => {
      let value = values[i] || '';
      // Remove quotes if present
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      row[header.trim()] = value.trim();
    });
    
    return row;
  }).filter(Boolean);
}

// Delay function for animations
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
