-- Скрипт для добавления тестовых данных продаж, чтобы заполнить графики

-- Функция для генерации случайной продажи
CREATE OR REPLACE FUNCTION generate_random_sale(user_id INT, business_id INT, sale_date TIMESTAMP)
RETURNS VOID AS $$
DECLARE
    random_product_id INT;
    random_price DECIMAL;
    random_quantity INT;
    total_amount DECIMAL;
    payment_methods TEXT[] := ARRAY['card', 'cash', 'transfer'];
    random_payment_method TEXT;
    employees TEXT[] := ARRAY['Менеджер Алексей', 'Менеджер Татьяна', 'Менеджер Ольга', 'Менеджер Иван', 'Менеджер Мария'];
    random_employee TEXT;
    customers TEXT[] := ARRAY['Иван Петров', 'Анна Сидорова', 'Сергей Иванов', 'Дмитрий Смирнов', 'Елена Козлова', 'Ольга Васильева', 'Андрей Кузнецов', 'Мария Попова'];
    random_customer TEXT;
BEGIN
    -- Получаем случайный ID продукта
    SELECT id, price INTO random_product_id, random_price
    FROM products
    WHERE user_id = $1 AND business_id = $2
    ORDER BY RANDOM()
    LIMIT 1;
    
    -- Если продукты не найдены, выходим
    IF random_product_id IS NULL THEN
        RETURN;
    END IF;
    
    -- Генерируем случайное количество от 1 до 5
    random_quantity := floor(random() * 5) + 1;
    total_amount := random_price * random_quantity;
    
    -- Выбираем случайный метод оплаты
    random_payment_method := payment_methods[floor(random() * array_length(payment_methods, 1)) + 1];
    
    -- Выбираем случайного сотрудника
    random_employee := employees[floor(random() * array_length(employees, 1)) + 1];
    
    -- Выбираем случайного клиента
    random_customer := customers[floor(random() * array_length(customers, 1)) + 1];
    
    -- Вставляем продажу
    INSERT INTO sales (
        product_id, user_id, business_id, quantity, price, total_amount, 
        customer_name, sale_date, payment_method, employee
    )
    VALUES (
        random_product_id, $1, $2, random_quantity, random_price, total_amount, 
        random_customer, $3, random_payment_method, random_employee
    );
END;
$$ LANGUAGE plpgsql;

-- Генерируем продажи за последние 12 месяцев
DO $$
DECLARE
    current_date TIMESTAMP := NOW();
    date_to_insert TIMESTAMP;
    user_id INT := 7; -- Замените на нужный ID пользователя
    business_id INT := 5; -- Замените на нужный ID бизнеса
    sales_per_month INT;
    current_month INT;
BEGIN
    -- Для каждого месяца в текущем году
    FOR month_offset IN 0..11 LOOP
        current_month := date_part('month', current_date - (month_offset * INTERVAL '1 month'));
        
        -- Различное количество продаж для разных месяцев для визуального разнообразия
        CASE current_month
            WHEN 1 THEN sales_per_month := 20; -- Январь
            WHEN 2 THEN sales_per_month := 25; -- Февраль
            WHEN 3 THEN sales_per_month := 30; -- Март
            WHEN 4 THEN sales_per_month := 35; -- Апрель
            WHEN 5 THEN sales_per_month := 45; -- Май
            WHEN 6 THEN sales_per_month := 40; -- Июнь
            WHEN 7 THEN sales_per_month := 35; -- Июль
            WHEN 8 THEN sales_per_month := 30; -- Август
            WHEN 9 THEN sales_per_month := 50; -- Сентябрь
            WHEN 10 THEN sales_per_month := 55; -- Октябрь
            WHEN 11 THEN sales_per_month := 65; -- Ноябрь
            WHEN 12 THEN sales_per_month := 80; -- Декабрь
            ELSE sales_per_month := 30;
        END CASE;
        
        -- Генерируем продажи для текущего месяца
        FOR i IN 1..sales_per_month LOOP
            -- Генерируем случайную дату в текущем месяце
            date_to_insert := date_trunc('month', current_date - (month_offset * INTERVAL '1 month')) + 
                             (random() * (date_part('days', date_trunc('month', current_date - (month_offset * INTERVAL '1 month')) + 
                                                 INTERVAL '1 month - 1 day'))::integer) * INTERVAL '1 day' +
                             (random() * INTERVAL '23 hours') +
                             (random() * INTERVAL '59 minutes') +
                             (random() * INTERVAL '59 seconds');
            
            -- Создаем случайную продажу для этой даты
            PERFORM generate_random_sale(user_id, business_id, date_to_insert);
        END LOOP;
    END LOOP;
END
$$;

-- Показываем результаты добавления
SELECT 
    EXTRACT(MONTH FROM sale_date) AS month,
    COUNT(*) AS total_sales,
    SUM(total_amount) AS total_revenue
FROM sales
WHERE user_id = 7 AND business_id = 5
GROUP BY EXTRACT(MONTH FROM sale_date)
ORDER BY month;

-- Очистка
DROP FUNCTION IF EXISTS generate_random_sale; 