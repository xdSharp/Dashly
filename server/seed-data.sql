-- Скрипт для добавления тестовых данных для пользователя с ID 7 и бизнеса с ID 5

-- Добавление категорий
INSERT INTO categories (name, description, color, icon, user_id, business_id, created_at)
VALUES 
  ('Электроника', 'Электронные устройства и аксессуары', '#4f86d6', 'smartphone', 7, 5, NOW()),
  ('Бытовая техника', 'Техника для дома и кухни', '#63b963', 'home', 7, 5, NOW()),
  ('Компьютеры', 'Компьютеры, ноутбуки и аксессуары', '#d6614f', 'laptop', 7, 5, NOW()),
  ('Аудиотехника', 'Наушники, колонки, усилители', '#9b4fd6', 'headphones', 7, 5, NOW()),
  ('Смартфоны', 'Телефоны и аксессуары', '#d64f9b', 'phone', 7, 5, NOW());

-- Получение ID добавленных категорий для использования при добавлении продуктов
DO $$
DECLARE
    electronics_id INT;
    appliances_id INT;
    computers_id INT;
    audio_id INT;
    smartphones_id INT;
BEGIN
    SELECT id INTO electronics_id FROM categories WHERE name = 'Электроника' AND user_id = 7 AND business_id = 5 LIMIT 1;
    SELECT id INTO appliances_id FROM categories WHERE name = 'Бытовая техника' AND user_id = 7 AND business_id = 5 LIMIT 1;
    SELECT id INTO computers_id FROM categories WHERE name = 'Компьютеры' AND user_id = 7 AND business_id = 5 LIMIT 1;
    SELECT id INTO audio_id FROM categories WHERE name = 'Аудиотехника' AND user_id = 7 AND business_id = 5 LIMIT 1;
    SELECT id INTO smartphones_id FROM categories WHERE name = 'Смартфоны' AND user_id = 7 AND business_id = 5 LIMIT 1;

    -- Добавление продуктов в категорию Электроника
    INSERT INTO products (name, description, price, sku, image_url, stock, category_id, user_id, business_id, created_at)
    VALUES 
      ('Телевизор Samsung 55"', 'Умный телевизор с 4K разрешением', 45999.00, 'TV-SAM-55', 'https://example.com/tv-samsung.jpg', 10, electronics_id, 7, 5, NOW()),
      ('Планшет Apple iPad', 'Планшет с экраном 10.2 дюйма', 29990.00, 'TAB-APP-01', 'https://example.com/ipad.jpg', 15, electronics_id, 7, 5, NOW()),
      ('Электронная книга Kindle', 'Электронная книга с подсветкой', 8990.00, 'BOOK-KIN-01', 'https://example.com/kindle.jpg', 20, electronics_id, 7, 5, NOW());

    -- Добавление продуктов в категорию Бытовая техника
    INSERT INTO products (name, description, price, sku, image_url, stock, category_id, user_id, business_id, created_at)
    VALUES 
      ('Холодильник LG', 'Двухкамерный холодильник с системой No Frost', 52999.00, 'FRIDGE-LG-01', 'https://example.com/fridge-lg.jpg', 5, appliances_id, 7, 5, NOW()),
      ('Микроволновая печь Samsung', 'Микроволновая печь с грилем', 7990.00, 'MICRO-SAM-01', 'https://example.com/microwave.jpg', 12, appliances_id, 7, 5, NOW()),
      ('Пылесос Dyson', 'Беспроводной пылесос с циклонной технологией', 29990.00, 'VAC-DYS-01', 'https://example.com/dyson.jpg', 8, appliances_id, 7, 5, NOW()),
      ('Кофемашина DeLonghi', 'Автоматическая кофемашина', 35990.00, 'COFFEE-DEL-01', 'https://example.com/coffee.jpg', 6, appliances_id, 7, 5, NOW());

    -- Добавление продуктов в категорию Компьютеры
    INSERT INTO products (name, description, price, sku, image_url, stock, category_id, user_id, business_id, created_at)
    VALUES 
      ('Ноутбук Lenovo ThinkPad', 'Бизнес-ноутбук 15.6"', 89990.00, 'LAP-LEN-01', 'https://example.com/thinkpad.jpg', 7, computers_id, 7, 5, NOW()),
      ('Игровой ПК ASUS ROG', 'Мощный игровой компьютер', 129990.00, 'PC-ASUS-01', 'https://example.com/asus-pc.jpg', 3, computers_id, 7, 5, NOW()),
      ('Монитор Dell 27"', 'Монитор с IPS матрицей и разрешением 4K', 25990.00, 'MON-DELL-01', 'https://example.com/dell-monitor.jpg', 10, computers_id, 7, 5, NOW()),
      ('Клавиатура Logitech', 'Механическая клавиатура с подсветкой', 5990.00, 'KEY-LOG-01', 'https://example.com/logitech-kb.jpg', 15, computers_id, 7, 5, NOW());

    -- Добавление продуктов в категорию Аудиотехника
    INSERT INTO products (name, description, price, sku, image_url, stock, category_id, user_id, business_id, created_at)
    VALUES 
      ('Наушники Sony WH-1000XM4', 'Беспроводные наушники с шумоподавлением', 25990.00, 'HEAD-SON-01', 'https://example.com/sony-headphones.jpg', 10, audio_id, 7, 5, NOW()),
      ('Bluetooth колонка JBL', 'Портативная водонепроницаемая колонка', 5990.00, 'SPEAK-JBL-01', 'https://example.com/jbl-speaker.jpg', 12, audio_id, 7, 5, NOW()),
      ('Усилитель Denon', 'Домашний аудио усилитель', 39990.00, 'AMP-DEN-01', 'https://example.com/denon-amp.jpg', 4, audio_id, 7, 5, NOW());

    -- Добавление продуктов в категорию Смартфоны
    INSERT INTO products (name, description, price, sku, image_url, stock, category_id, user_id, business_id, created_at)
    VALUES 
      ('iPhone 13', 'Смартфон с дисплеем 6.1"', 79990.00, 'PHONE-APP-01', 'https://example.com/iphone13.jpg', 15, smartphones_id, 7, 5, NOW()),
      ('Samsung Galaxy S21', 'Флагманский смартфон с камерой 108 МП', 69990.00, 'PHONE-SAM-01', 'https://example.com/galaxy-s21.jpg', 10, smartphones_id, 7, 5, NOW()),
      ('Xiaomi Mi 11', 'Смартфон с процессором Snapdragon 888', 49990.00, 'PHONE-XIA-01', 'https://example.com/mi11.jpg', 12, smartphones_id, 7, 5, NOW()),
      ('Google Pixel 6', 'Смартфон с лучшей мобильной камерой', 59990.00, 'PHONE-GOO-01', 'https://example.com/pixel6.jpg', 8, smartphones_id, 7, 5, NOW());

END $$;

-- Добавим тестовые продажи для проверки удаления
DO $$
DECLARE
    product_id INT;
    total_amount DECIMAL;
BEGIN
    -- Выберем несколько продуктов для создания продаж
    SELECT id INTO product_id FROM products WHERE name = 'iPhone 13' AND user_id = 7 AND business_id = 5 LIMIT 1;
    
    -- Создание тестовой продажи #1
    SELECT price * 2 INTO total_amount FROM products WHERE id = product_id;
    INSERT INTO sales (product_id, user_id, business_id, quantity, price, total_amount, customer_name, customer_email, sale_date, payment_method, employee)
    VALUES (product_id, 7, 5, 2, (SELECT price FROM products WHERE id = product_id), total_amount, 'Иван Петров', 'ivan@example.com', NOW() - INTERVAL '2 days', 'card', 'Менеджер Алексей');
    
    -- Создание тестовой продажи #2
    SELECT id INTO product_id FROM products WHERE name = 'Ноутбук Lenovo ThinkPad' AND user_id = 7 AND business_id = 5 LIMIT 1;
    SELECT price * 1 INTO total_amount FROM products WHERE id = product_id;
    INSERT INTO sales (product_id, user_id, business_id, quantity, price, total_amount, customer_name, customer_email, sale_date, payment_method, employee)
    VALUES (product_id, 7, 5, 1, (SELECT price FROM products WHERE id = product_id), total_amount, 'Анна Сидорова', 'anna@example.com', NOW() - INTERVAL '1 day', 'cash', 'Менеджер Татьяна');
    
    -- Создание тестовой продажи #3
    SELECT id INTO product_id FROM products WHERE name = 'Телевизор Samsung 55"' AND user_id = 7 AND business_id = 5 LIMIT 1;
    SELECT price * 1 INTO total_amount FROM products WHERE id = product_id;
    INSERT INTO sales (product_id, user_id, business_id, quantity, price, total_amount, customer_name, sale_date, payment_method, employee)
    VALUES (product_id, 7, 5, 1, (SELECT price FROM products WHERE id = product_id), total_amount, 'Сергей Иванов', NOW(), 'transfer', 'Менеджер Ольга');
    
    -- Создание тестовой продажи #4
    SELECT id INTO product_id FROM products WHERE name = 'Наушники Sony WH-1000XM4' AND user_id = 7 AND business_id = 5 LIMIT 1;
    SELECT price * 3 INTO total_amount FROM products WHERE id = product_id;
    INSERT INTO sales (product_id, user_id, business_id, quantity, price, total_amount, customer_name, customer_email, sale_date, payment_method, notes)
    VALUES (product_id, 7, 5, 3, (SELECT price FROM products WHERE id = product_id), total_amount, 'Дмитрий Смирнов', 'dmitry@example.com', NOW() - INTERVAL '3 days', 'card', 'Корпоративный заказ');
    
    -- Создание тестовой продажи #5
    SELECT id INTO product_id FROM products WHERE name = 'Микроволновая печь Samsung' AND user_id = 7 AND business_id = 5 LIMIT 1;
    SELECT price * 2 INTO total_amount FROM products WHERE id = product_id;
    INSERT INTO sales (product_id, user_id, business_id, quantity, price, total_amount, customer_name, sale_date, payment_method)
    VALUES (product_id, 7, 5, 2, (SELECT price FROM products WHERE id = product_id), total_amount, 'Елена Козлова', NOW() - INTERVAL '5 days', 'cash');
END $$; 