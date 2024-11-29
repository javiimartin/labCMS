const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;
require('winston-daily-rotate-file');

// Formato de los logs
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

// Configurar transporte de archivos diarios
const dailyRotateFileTransport = new transports.DailyRotateFile({
  filename: 'logs/%DATE%-application.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d', // Retener logs de los últimos 14 días
});

// Crear el logger
const logger = createLogger({
  level: 'info', // Nivel mínimo de logs (info, warn, error)
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new transports.Console({ format: combine(colorize(), logFormat) }), // Logs en consola
    dailyRotateFileTransport, // Logs en archivo
  ],
});

// Exportar el logger
module.exports = logger;
