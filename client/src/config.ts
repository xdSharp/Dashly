/**
 * Конфигурационный файл приложения
 */

/** 
 * Настройки регистрации пользователей
 */
export const registrationSettings = {
  /**
   * Разрешить выбор роли при регистрации
   * - true: пользователь может выбрать между Admin и User
   * - false: пользователи всегда регистрируются с ролью User
   */
  allowRoleSelection: false,
  
  /**
   * Роль по умолчанию при регистрации (если выбор роли отключен)
   * "user" или "admin"
   */
  defaultRole: "user",
};

// Настройка API URL - в dev режиме используем другой порт для API сервера
export const API_URL = import.meta.env.DEV ? 'http://localhost:5005/api' : '/api';

// Функция для получения API URL
export const getApiUrl = () => API_URL;

export default {
  registrationSettings,
}; 