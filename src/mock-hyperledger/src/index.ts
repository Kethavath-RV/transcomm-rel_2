import { generateNewJwt, getJwt } from './accessToken/access';
import app from './config/app';

const cron = require('node-cron');

const port = process.env.SERVER_PORT || 4050;

app.listen(port, async () => {
  console.log(`MockHyperLedger app listening at http://localhost:${port}`);
});

cron.schedule('*/15 * * * *', function () {
  console.log('changing JWT - this happens every 15 minute');
  generateNewJwt();
  console.log(`new jwt ${getJwt()}`);
});
