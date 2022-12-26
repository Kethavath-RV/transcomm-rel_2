import express from 'express';
import messages from './message.route';

const router = express.Router();

router.use('/', messages);

export default router;
