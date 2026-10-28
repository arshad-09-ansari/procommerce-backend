import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ProCommerce Backend API - 52 APIs',
      version: '1.0.0',
      description: 'Mega Project: MongoDB + Razorpay + RabbitMQ + Socket.io + Docker + CI/CD | 5 Years Exp Level',
      contact: { name: 'Arshad Ansarii', url: 'https://github.com' }
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Local Server' },
      { url: 'http://localhost:5000/api/v1', description: 'API v1' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/routes/*.js', './src/models/*.js', './src/server.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export const swaggerDocs = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'ProCommerce API Docs',
  }));
  app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));
  console.log('📚 Swagger Docs available at http://localhost:5000/api-docs');
};

export default swaggerSpec;