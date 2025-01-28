const swaggerJsdoc = require('swagger-jsdoc');

const ENVIRONMENT = process.env.NODE_ENV || 'development';

const serverUrls = ENVIRONMENT === 'production'
  ? [{ url: 'https://attendance-records-551620082303.europe-southwest1.run.app/api', description: 'Cloud Run Server' }]
  : [{ url: 'http://localhost:5000/api', description: 'Local Server' }];

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
    servers: serverUrls,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'], // Incluye los archivos de rutas para la documentación
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

module.exports = swaggerDocs;
