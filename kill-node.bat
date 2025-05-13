@echo off
echo Завершение всех процессов Node.js...
taskkill /F /IM node.exe /T
taskkill /F /IM nodemon.exe /T

echo Завершение процессов, использующих порт 5005...
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :5005') DO (
    echo Найден процесс с PID: %%P на порту 5005, попытка завершения...
    taskkill /F /PID %%P
)

echo Все процессы Node.js и процессы на порту 5005 были завершены.
echo.
echo Если после запуска этого скрипта порт все еще занят, перезагрузите компьютер.
pause 