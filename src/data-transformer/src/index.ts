import app from './config/express';
const port = process.env.SERVER_PORT || 7000;

app.listen(port, async () => {
  console.log(`Transformer app listening at http://localhost:${port}`);
});

process.on('uncaughtException', function (err) {
  console.log(err);
});
