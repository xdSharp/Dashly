@echo off
echo Updating Dashly database schema...

REM Остановим контейнер перед обновлением
docker-compose down

REM Запустим контейнер
docker-compose up -d

echo Waiting for database to be ready...
timeout /t 5 /nobreak

REM Применим миграции схемы
docker exec -i dashly-postgres psql -U dashly -d dashly_db < server/migrations/003_update_sales_table.sql

echo Schema update completed!
echo Creating default businesses for existing users...

REM Выполняем SQL скрипт для создания бизнесов по умолчанию для существующих пользователей
docker exec -i dashly-postgres psql -U dashly -d dashly_db -c "DO $$ DECLARE user_record RECORD; BEGIN FOR user_record IN SELECT id, name FROM users WHERE id NOT IN (SELECT DISTINCT user_id FROM businesses) LOOP INSERT INTO businesses (name, description, user_id, is_default) VALUES (user_record.name || '''s Business', 'Default business', user_record.id, TRUE); END LOOP; END; $$ LANGUAGE plpgsql;"

echo Update completed successfully!
echo You can now start the application.

pause 