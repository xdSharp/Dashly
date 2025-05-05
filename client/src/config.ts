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
  allowRoleSelection: true,
  
  /**
   * Роль по умолчанию при регистрации (если выбор роли отключен)
   * "user" или "admin"
   */
  defaultRole: "admin",
};

export default {
  registrationSettings,
}; 