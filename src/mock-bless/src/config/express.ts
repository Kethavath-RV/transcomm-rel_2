import express from 'express';
import routes from '../routes';
import { validateEnvironmentVariables } from './env.validation';
const multer = require('multer');

const app = express();
const upload = multer();
app.disable('x-powered-by');

app.use(express.urlencoded({ extended: true }));
app.use(upload.none());
app.use('/', routes);

validateEnvironmentVariables(process.env);

export default app;
