import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;

// Получение текущей директории в ES модуле
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Настройки подключения к PostgreSQL
const connectionConfig = {
  user: process.env.DB_USER || 'dashly',
  password: process.env.DB_PASSWORD || 'dashlypass',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'dashly_db'
};

async function seedData() {
  const client = new Client(connectionConfig);
  try {
    console.log('Connecting to database...');
    await client.connect();
    
    // Чтение SQL-скрипта
    const sqlPath = path.join(__dirname, 'server', 'seed-data.sql');
    const seedSQL = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing seed script...');
    await client.query(seedSQL);
    
    console.log('✅ Data seeding completed successfully!');
    console.log('Added:');
    console.log('- 5 categories');
    console.log('- 17 products');
    console.log('- 5 sales');
    console.log('For user ID: 7, business ID: 5');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await client.end();
  }
}

// Запуск функции заполнения данными
seedData(); 