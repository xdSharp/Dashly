-- Удаляем старое ограничение уникальности
ALTER TABLE categories DROP CONSTRAINT IF EXISTS uk_user_category_name;

-- Добавляем новое ограничение, учитывающее businessId
ALTER TABLE categories ADD CONSTRAINT uk_user_business_category_name UNIQUE (user_id, business_id, name);

-- Добавляем комментарий к таблице
COMMENT ON CONSTRAINT uk_user_business_category_name ON categories IS 'Обеспечивает уникальность имени категории в рамках одного бизнеса'; 