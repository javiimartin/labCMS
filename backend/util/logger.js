const fs = require('fs');
const path = require('path');
const fluent = require('fluent-logger');

// Configuración de Fluentd
const fluentSender = fluent.createFluentSender('backend.logs', {
  host: process.env.FLUENTD_HOST || 'logs',
  port: process.env.FLUENTD_PORT || 24224,
  timeout: 3.0,
});

// Función para escribir logs en un archivo local
const logFilePath = path.join(__dirname, '..', 'logs', 'application.log');
const writeToFile = (message) => {
  const logMessage = `${new Date().toISOString()} ${message}\n`;
  fs.appendFileSync(logFilePath, logMessage, 'utf8');
};

// Función para registrar logs
const logger = {
  log: (level, message) => {
    const logMessage = `[${level.toUpperCase()}]: ${message}`;
    
    // Mostrar en consola
    console.log(logMessage);

    // Guardar en archivo
    writeToFile(logMessage);

    // Enviar a Fluentd si está habilitado
    if (process.env.NODE_ENV !== 'production') {
      fluentSender.emit('log', { level, message });
    }
  },
  info: (message) => logger.log('info', message),
  warn: (message) => logger.log('warn', message),
  error: (message) => logger.log('error', message),
};

// Manejo de errores de Fluentd
fluentSender.on('error', (err) => {
  console.error('Error al conectar con Fluentd:', err);
  writeToFile(`[ERROR] Fluentd connection failed: ${err.message}`);
});

module.exports = logger;
