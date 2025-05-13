/**
 * Этот скрипт проверяет пароли пользователей и перешифровывает незашифрованные пароли
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';
import { eq } from "drizzle-orm";
import { hashPassword } from "./password-utils";

// Настройки подключения к PostgreSQL
const connectionString = process.env.DATABASE_URL || 
  `postgres://${process.env.DB_USER || 'dashly'}:${process.env.DB_PASSWORD || 'dashlypass'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'dashly_db'}`;

// Подключение к базе данных
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function fixPasswords() {
  console.log("Начинаем проверку паролей...");
  
  // Получаем всех пользователей из базы данных
  const allUsers = await db.select().from(schema.users);
  console.log(`Найдено ${allUsers.length} пользователей`);
  
  let fixed = 0;

  // Проходим по каждому пользователю и проверяем, зашифрован ли его пароль
  for (const user of allUsers) {
    const password = user.password;
    
    // Проверяем, является ли пароль хешем bcrypt (начинается с $2b$)
    if (!password.startsWith('$2b$')) {
      console.log(`Незашифрованный пароль обнаружен для пользователя ${user.username} (ID: ${user.id})`);
      
      try {
        // Шифруем пароль
        const hashedPassword = await hashPassword(password);
        
        // Обновляем пароль в базе данных
        await db.update(schema.users)
          .set({
            password: hashedPassword
          })
          .where(eq(schema.users.id, user.id));
        
        console.log(`Пароль для ${user.username} успешно зашифрован: ${hashedPassword.substring(0, 20)}...`);
        fixed++;
      } catch (error) {
        console.error(`Ошибка при шифровании пароля для ${user.username}:`, error);
      }
    }
  }
  
  console.log(`\nПроверка завершена. Исправлено паролей: ${fixed} из ${allUsers.length}`);
  process.exit(0);
}

fixPasswords().catch(console.error); 