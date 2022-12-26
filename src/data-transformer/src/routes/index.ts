import express from 'express';
import messages from './message.route';

const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const swaggerJsonDocument = require('./swagger.json');

router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerJsonDocument));
router.use('/', messages);

export default router;
