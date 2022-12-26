import app from './config/express';
import { start } from './config/kafka';
const port = process.env.PORT || 5050;

app.listen(port, async () => {
  console.log(`MockBless app listening at http://localhost:${port}`);
  await start();
});
