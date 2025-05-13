@echo off
chcp 1251 > nul
echo Запуск контейнера PostgreSQL...

docker start dashly-postgres

if %errorlevel% neq 0 (
    echo [ОШИБКА] Контейнер dashly-postgres не найден или не удалось запустить.
    echo Если контейнер еще не создан, запустите сначала setup-db.bat
    pause
    exit /b 1
)

echo.
echo База данных PostgreSQL запущена!
echo.
echo Данные для подключения:
echo Host: localhost
echo Port: 5432
echo Username: dashly
echo Password: dashlypass
echo Database: dashly_db
echo.
pause 