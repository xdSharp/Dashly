@echo off
chcp 1251 > nul
echo ======================================================
echo Настройка и запуск PostgreSQL для проекта Dashly
echo ======================================================
echo.

REM Проверяем установлен ли Docker
docker --version > nul 2>&1
if %errorlevel% neq 0 (
    echo [ОШИБКА] Docker не установлен. Пожалуйста, установите Docker перед запуском скрипта.
    echo Скачать Docker можно по адресу: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo [1/4] Проверка существующих контейнеров...
docker ps -a | findstr "dashly-postgres" > nul
if %errorlevel% equ 0 (
    echo [ИНФОРМАЦИЯ] Контейнер dashly-postgres уже существует. Останавливаем и удаляем...
    docker stop dashly-postgres > nul 2>&1
    docker rm dashly-postgres > nul 2>&1
)

echo [2/4] Создание томов для хранения данных...
docker volume create dashly_postgres_data > nul 2>&1

echo [3/4] Запуск контейнера PostgreSQL...
docker run -d ^
    --name dashly-postgres ^
    -e POSTGRES_USER=dashly ^
    -e POSTGRES_PASSWORD=dashlypass ^
    -e POSTGRES_DB=dashly_db ^
    -p 5432:5432 ^
    -v dashly_postgres_data:/var/lib/postgresql/data ^
    -v %cd%\init-scripts:/docker-entrypoint-initdb.d ^
    --health-cmd="pg_isready -U dashly -d dashly_db" ^
    --health-interval=10s ^
    --health-timeout=5s ^
    --health-retries=5 ^
    --restart=always ^
    postgres:15

if %errorlevel% neq 0 (
    echo [ОШИБКА] Не удалось запустить контейнер PostgreSQL.
    pause
    exit /b 1
)

echo [4/4] Ожидание запуска PostgreSQL...
timeout /t 5 /nobreak > nul

echo.
echo ======================================================
echo База данных PostgreSQL успешно запущена!
echo ======================================================
echo.
echo Данные для подключения:
echo Host: localhost
echo Port: 5432
echo Username: dashly
echo Password: dashlypass
echo Database: dashly_db
echo.
echo Для остановки базы данных используйте команду:
echo docker stop dashly-postgres
echo.
echo Для повторного запуска используйте команду:
echo docker start dashly-postgres
echo.
pause 