#!/bin/bash

# Скрипт для запуска миграции базы данных

echo "Запуск миграции базы данных..."

# Подключаемся к базе данных и выполняем миграцию
PGPASSWORD=dashlypass psql -U dashly -d dashly_db -h localhost -f server/migrations/004_update_category_constraint.sql

# Проверяем статус выполнения
if [ $? -eq 0 ]; then
  echo "✅ Миграция успешно выполнена"
else
  echo "❌ Ошибка при выполнении миграции"
  exit 1
fi

echo "Перезапуск сервера..."
./restart-server.sh

echo "Готово!" 