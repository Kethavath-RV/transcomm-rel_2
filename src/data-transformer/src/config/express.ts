import routes from '../routes';
import express, { RequestHandler } from 'express';
import { validateEnvironmentVariables } from './env.validation';

const app = express();
app.disable('x-powered-by');

app.use(express.json() as RequestHandler);
app.use('/', routes);

validateEnvironmentVariables(process.env);

export default app;
