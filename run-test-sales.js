// Скрипт для запуска SQL-файла с тестовыми продажами
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Получаем параметры подключения к БД из переменных окружения
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/dashly';

// Создаем пул соединений к БД
const pool = new Pool({
  connectionString,
});

// Получаем текущую директорию для ES модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function executeSQLFile(filePath) {
  try {
    console.log(`Выполнение SQL-файла: ${filePath}`);
    
    // Читаем содержимое файла
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Выполняем SQL-запросы
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log('SQL-скрипт успешно выполнен!');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Ошибка при выполнении SQL-скрипта:', err);
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Ошибка:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Путь к SQL-файлу с тестовыми продажами
const sqlFilePath = path.join(__dirname, 'server', 'seed-test-sales.sql');

// Выполняем SQL-скрипт
executeSQLFile(sqlFilePath).then(() => {
  console.log('Готово!');
}).catch(err => {
  console.error('Ошибка при выполнении скрипта:', err);
}); 