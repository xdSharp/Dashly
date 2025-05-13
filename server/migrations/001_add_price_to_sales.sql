-- Add price column to sales table
ALTER TABLE sales ADD COLUMN IF NOT EXISTS price DECIMAL(12,2) NOT NULL DEFAULT 0;

-- Update existing records to set price from products table
UPDATE sales s 
SET price = p.price 
FROM products p 
WHERE s.product_id = p.id; 