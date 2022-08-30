import express from 'express';
import { appConfig } from './config';
import { handler } from './lambda';

const app = express();

app.get('/', (req, res) => {
  console.log(req.method, res.status);

  handler(
    {
      request: { userAttributes: { email: 'foo@bar.com', firstName: 'Foo' } },
    },
    undefined,
    () => {}
  );
});

app.listen(appConfig.express.port, () => {
  console.log(
    `App running under pid ${process.pid} and listening on port: ${appConfig.express.port} in ${appConfig.express.mode} mode`
  );
});

console.log('for local development');
