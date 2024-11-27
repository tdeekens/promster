import { createMiddleware, signalIsUp } from '@promster/express';
import { createServer as createPrometheusMetricsServer } from '@promster/server';
import express from 'express';

async function launchServer() {
  const app = express();

  app.use(createMiddleware());

  await createPrometheusMetricsServer({
    port: 8080,
    detectKubernetes: false,
  });

  app.get('/', (_req, res) => {
    res.send('I am the server!');
  });

  const port = 80;
  app.listen(port, () => {
    console.log(`Express app listening at http://localhost:${port}`);

    signalIsUp();
  });

  console.log('Prometheus metrics available on http://localhost:8080');
}

launchServer().catch(console.log);
