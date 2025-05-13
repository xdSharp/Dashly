-- Создание таблицы бизнесов
CREATE TABLE IF NOT EXISTS businesses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(100),
    website VARCHAR(200),
    logo VARCHAR(255),
    industry VARCHAR(100),
    founded_year INTEGER,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_default BOOLEAN DEFAULT TRUE,
    CONSTRAINT uk_user_business_name UNIQUE (user_id, name)
);

-- Добавление столбца business_id к существующим таблицам
ALTER TABLE categories ADD COLUMN IF NOT EXISTS business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE;

-- Создание индексов для повышения производительности запросов
CREATE INDEX IF NOT EXISTS idx_business_user_id ON businesses (user_id);
CREATE INDEX IF NOT EXISTS idx_categories_business_id ON categories (business_id);
CREATE INDEX IF NOT EXISTS idx_products_business_id ON products (business_id);
CREATE INDEX IF NOT EXISTS idx_sales_business_id ON sales (business_id);
CREATE INDEX IF NOT EXISTS idx_customers_business_id ON customers (business_id);
CREATE INDEX IF NOT EXISTS idx_feedback_business_id ON feedback (business_id);
CREATE INDEX IF NOT EXISTS idx_notifications_business_id ON notifications (business_id);

-- Создание автоматического бизнеса по умолчанию для существующих пользователей
-- Этот триггер будет создавать бизнес по умолчанию при создании нового пользователя
CREATE OR REPLACE FUNCTION create_default_business()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO businesses (name, description, user_id, is_default)
    VALUES (NEW.name || '''s Business', 'Default business', NEW.id, TRUE);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER user_insert_trigger
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_default_business();

-- Создание бизнесов по умолчанию для существующих пользователей
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id, name FROM users WHERE id NOT IN (SELECT DISTINCT user_id FROM businesses) LOOP
        INSERT INTO businesses (name, description, user_id, is_default)
        VALUES (user_record.name || '''s Business', 'Default business', user_record.id, TRUE);
    END LOOP;
END;
$$ LANGUAGE plpgsql; 