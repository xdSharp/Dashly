-- Добавление тестовых пользователей
-- Пароль для обоих пользователей: password123 (предварительно хешированный bcrypt)
INSERT INTO users (username, password, email, name, role)
VALUES 
    ('admin', '$2b$10$NlZqGdyrZP7vZDbGcU2VMeEW5KwnB/s.UxYSOUJ9zPVh0K49e8p8m', 'admin@example.com', 'Admin User', 'admin'),
    ('user', '$2b$10$NlZqGdyrZP7vZDbGcU2VMeEW5KwnB/s.UxYSOUJ9zPVh0K49e8p8m', 'user@example.com', 'Regular User', 'user');

-- Добавление категорий для admin пользователя
INSERT INTO categories (name, description, color, icon, user_id)
VALUES 
    ('Электроника', 'Электронные устройства и гаджеты', '#4f86d6', 'cpu', 1),
    ('Одежда', 'Модная одежда и аксессуары', '#f56565', 'shirt', 1),
    ('Книги', 'Печатные и электронные книги', '#48bb78', 'book', 1),
    ('Мебель', 'Предметы интерьера и мебель', '#ed8936', 'sofa', 1);

-- Добавление категорий для user пользователя
INSERT INTO categories (name, description, color, icon, user_id)
VALUES 
    ('Спорт', 'Спортивное оборудование и одежда', '#4299e1', 'activity', 2),
    ('Игрушки', 'Игрушки для детей разного возраста', '#f6ad55', 'gamepad', 2);

-- Добавление продуктов для admin пользователя
INSERT INTO products (name, description, price, sku, stock, category_id, user_id)
VALUES 
    ('Смартфон X11', 'Мощный смартфон с отличной камерой', 39999.99, 'SP-001', 25, 1, 1),
    ('Планшет Pro', 'Профессиональный планшет для работы', 45999.99, 'TB-001', 15, 1, 1),
    ('Ноутбук Slim', 'Легкий и производительный ноутбук', 89999.99, 'LT-001', 10, 1, 1),
    ('Джинсы Modern', 'Модные джинсы из прочного материала', 4999.99, 'JN-001', 50, 2, 1),
    ('Куртка Зимняя', 'Теплая куртка для холодного времени года', 12999.99, 'JK-001', 30, 2, 1),
    ('Программирование на Python', 'Учебник по языку программирования Python', 1299.99, 'BK-001', 100, 3, 1),
    ('Дизайн интерфейсов', 'Книга о UI/UX дизайне', 1599.99, 'BK-002', 45, 3, 1),
    ('Диван Комфорт', 'Удобный диван для гостиной', 34999.99, 'SF-001', 5, 4, 1),
    ('Стол Рабочий', 'Эргономичный стол для работы', 12999.99, 'TB-002', 15, 4, 1);

-- Добавление продуктов для user пользователя
INSERT INTO products (name, description, price, sku, stock, category_id, user_id)
VALUES 
    ('Беговая дорожка', 'Электрическая беговая дорожка с функцией наклона', 56999.99, 'SP-001', 8, 5, 2),
    ('Гантели 10 кг', 'Набор гантелей для фитнеса', 4999.99, 'SP-002', 20, 5, 2),
    ('Конструктор', 'Развивающий конструктор для детей от 6 лет', 2999.99, 'TY-001', 30, 6, 2),
    ('Интерактивная игрушка', 'Говорящая игрушка с обучающими функциями', 3999.99, 'TY-002', 25, 6, 2);

-- Добавление клиентов для admin пользователя
INSERT INTO customers (name, email, phone, address, user_id)
VALUES 
    ('Александр Иванов', 'ivanov@example.com', '+7 (900) 123-45-67', 'г. Москва, ул. Ленина, 1, кв. 10', 1),
    ('Елена Петрова', 'petrova@example.com', '+7 (900) 987-65-43', 'г. Санкт-Петербург, пр. Невский, 20, кв. 5', 1),
    ('Максим Сидоров', 'sidorov@example.com', '+7 (900) 555-44-33', 'г. Казань, ул. Баумана, 15, кв. 7', 1);

-- Добавление клиентов для user пользователя
INSERT INTO customers (name, email, phone, address, user_id)
VALUES 
    ('Анна Смирнова', 'smirnova@example.com', '+7 (900) 111-22-33', 'г. Новосибирск, ул. Проспект, 42, кв. 18', 2),
    ('Дмитрий Козлов', 'kozlov@example.com', '+7 (900) 444-55-66', 'г. Екатеринбург, ул. Мира, 8, кв. 3', 2);

-- Добавление продаж для admin пользователя
INSERT INTO sales (product_id, user_id, quantity, total_amount, customer_name, customer_email, status, payment_method, notes)
VALUES 
    (1, 1, 2, 79999.98, 'Александр Иванов', 'ivanov@example.com', 'completed', 'card', 'Доставка в течение дня'),
    (3, 1, 1, 89999.99, 'Елена Петрова', 'petrova@example.com', 'completed', 'cash', 'Самовывоз из магазина'),
    (5, 1, 1, 12999.99, 'Максим Сидоров', 'sidorov@example.com', 'processing', 'card', 'Доставка курьером');

-- Добавление продаж для user пользователя
INSERT INTO sales (product_id, user_id, quantity, total_amount, customer_name, customer_email, status, payment_method, notes)
VALUES 
    (10, 2, 1, 56999.99, 'Анна Смирнова', 'smirnova@example.com', 'completed', 'card', 'Установка включена'),
    (12, 2, 3, 8999.97, 'Дмитрий Козлов', 'kozlov@example.com', 'completed', 'cash', 'Подарочная упаковка');

-- Добавление отзывов
INSERT INTO feedback (product_id, user_id, customer_id, rating, comment)
VALUES 
    (1, 1, 1, 5, 'Отличный смартфон! Очень доволен покупкой, камера супер.'),
    (3, 1, 2, 4, 'Хороший ноутбук, но немного шумит при нагрузке.'),
    (10, 2, 4, 5, 'Беговая дорожка отличного качества, доставили вовремя.'),
    (12, 2, 5, 4, 'Детям очень понравился конструктор, играют целыми днями.');

-- Добавление уведомлений для администратора
INSERT INTO notifications (user_id, message, type, read, created_at)
VALUES
    (1, 'Добавлен новый товар "Смартфон X11" пользователем Regular User', 'info', false, NOW() - INTERVAL '3 days'),
    (1, 'Обнаружен товар с низким запасом: "Диван Комфорт" (осталось 5)', 'warning', false, NOW() - INTERVAL '2 days'),
    (1, 'Новая регистрация пользователя: user@example.com', 'info', true, NOW() - INTERVAL '5 days'),
    (1, 'Отчет о продажах за прошлый месяц готов к просмотру', 'info', false, NOW() - INTERVAL '1 day');

-- Добавление уведомлений для обычного пользователя
INSERT INTO notifications (user_id, message, type, read, created_at)
VALUES
    (2, 'Ваш товар "Интерактивная игрушка" был приобретен', 'info', true, NOW() - INTERVAL '2 days'),
    (2, 'Администратор изменил ваши права доступа', 'warning', false, NOW() - INTERVAL '1 day');

-- Обновление счетчиков для клиентов
UPDATE customers SET total_purchases = 2, total_spent = 169999.97 WHERE id = 1;
UPDATE customers SET total_purchases = 1, total_spent = 89999.99 WHERE id = 2;
UPDATE customers SET total_purchases = 1, total_spent = 12999.99 WHERE id = 3;
UPDATE customers SET total_purchases = 1, total_spent = 56999.99 WHERE id = 4;
UPDATE customers SET total_purchases = 1, total_spent = 8999.97 WHERE id = 5; 