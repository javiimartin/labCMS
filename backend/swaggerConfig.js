const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Labs CMS',
      version: '1.0.0',
      description: 'Proyecto sobre desarrollo de sistema de gestión de contenido de laboratorios.',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Servidor local',
      },
    ],
  },
  apis: ['./routes/*.js'], // Incluye los archivos de rutas para la documentación
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

module.exports = swaggerDocs;
