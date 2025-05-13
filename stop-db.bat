@echo off
chcp 1251 > nul
echo Остановка контейнера PostgreSQL...

docker stop dashly-postgres

if %errorlevel% neq 0 (
    echo [ОШИБКА] Не удалось остановить контейнер PostgreSQL.
    pause
    exit /b 1
)

echo.
echo База данных PostgreSQL остановлена.
echo.
pause 