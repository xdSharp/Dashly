import os from 'os';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export async function GET(req: Request) {
  try {
    // Получаем данные о системе
    const cpus = os.cpus();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const uptime = os.uptime();

    // Рассчитываем загрузку CPU
    const cpuUsage = cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
      const idle = cpu.times.idle;
      return acc + ((total - idle) / total) * 100;
    }, 0) / cpus.length;

    // Рассчитываем использование памяти
    const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100;

    // Получаем использование диска (заглушка, так как нет прямого API)
    const diskUsage = 65.5; // В реальном приложении нужно использовать системные вызовы

    // Вычисляем количество дней работы системы
    const uptimeDays = Math.floor(uptime / (60 * 60 * 24));

    const systemStatus = {
      cpuUsage: Math.round(cpuUsage),
      memoryUsage: Math.round(memoryUsage),
      diskUsage: Math.round(diskUsage),
      uptime: uptimeDays
    };

    return new Response(JSON.stringify(systemStatus), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching system status:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch system status' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 