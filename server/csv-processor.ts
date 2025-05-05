import { CSVRow, CSVData, InsertProduct, InsertCategory, InsertSale } from "@shared/schema";
import { storage } from "./storage";

// Process CSV data and insert into database
export async function processCSVData(data: CSVData, userId: number) {
  try {
    const results = {
      totalRows: data.length,
      processed: 0,
      errors: [] as Array<{ row: number; error: string }>,
      products: 0,
      categories: 0,
      sales: 0
    };

    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i];
        await processRow(row, userId);
        results.processed++;
      } catch (error: any) {
        results.errors.push({
          row: i + 1,
          error: error.message || "Unknown error"
        });
      }
    }

    return results;
  } catch (error: any) {
    throw new Error(`Failed to process CSV data: ${error.message}`);
  }
}

async function processRow(row: CSVRow, userId: number) {
  // Find or create category
  let category = await storage.getCategoryByName(row.category_name, userId);
  if (!category) {
    category = await storage.createCategory({
      name: row.category_name,
      userId
    });
  }

  // Find or create product
  let product = await storage.getProductByName(row.product_name, userId);
  if (!product) {
    product = await storage.createProduct({
      name: row.product_name,
      categoryId: category.id,
      userId
    });
  }

  // Create sale
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

// Parse CSV string to structured data
export function parseCSV(csvContent: string): CSVData {
  const lines = csvContent.trim().split('\n');
  
  // Ensure there's at least a header and one data row
  if (lines.length < 2) {
    throw new Error("CSV must contain a header row and at least one data row");
  }

  // Get header row and check for required columns
  const headerRow = lines[0].split(',');
  const requiredColumns = ["product_name", "category_name", "price", "quantity", "amount", "date"];
  
  // Validate headers
  for (const column of requiredColumns) {
    if (!headerRow.includes(column)) {
      throw new Error(`Missing required column: ${column}`);
    }
  }

  // Parse data rows
  const data: CSVData = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    const values = parseCSVLine(line);
    
    if (values.length !== headerRow.length) {
      throw new Error(`Line ${i + 1} has ${values.length} values but expected ${headerRow.length}`);
    }
    
    // Create object from headers and values
    const rowData: any = {};
    for (let j = 0; j < headerRow.length; j++) {
      const key = headerRow[j].trim();
      let value = values[j].trim();
      
      // Convert numeric values
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
    
    data.push(rowData as CSVRow);
  }
  
  return data;
}

// Handle CSV line parsing with quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current);
  
  // Clean up quotes in fields
  return result.map(field => {
    if (field.startsWith('"') && field.endsWith('"')) {
      return field.slice(1, -1);
    }
    return field;
  });
}
