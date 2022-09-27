import express from 'express';
import crypto from 'crypto';
import { appConfig } from './config';
import { handler } from './lambda';

const app = express();

app.get('/', (req, res) => {
  console.log(req.method, res.status);

  handler(
    {
      userName: `to-be-deleted-${crypto.randomUUID()}`,
      request: { userAttributes: { email: 'felix@citodata.com', given_name: 'Foo' } },
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
