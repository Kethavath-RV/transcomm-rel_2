import express from 'express';
import routes from '../routes/router';

const app = express();
app.disable('x-powered-by');

app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use('/', routes);

export default app;
