import * as http from 'http';
import {
  getSummary,
  getContentType,
  skipMetricsInEnvironment,
} from '@promster/metrics';

type TServerOptions = {
  port: number;
  hostname: string;
  detectKubernetes: boolean;
};

const defaultOptions: TServerOptions = {
  port: 7788,
  hostname: '0.0.0.0',
  detectKubernetes: false,
};

const createServer = async (
  options: Partial<TServerOptions>
): Promise<http.Server> => {
  const defaultedOptions = {
    ...defaultOptions,
    ...options,
  };

  return new Promise((resolve, reject) => {
    const skipServerStart = skipMetricsInEnvironment(defaultedOptions);

    const port = skipServerStart ? undefined : defaultedOptions.port;

    const server = http.createServer(async (_req, res) => {
      res.writeHead(200, 'OK', { 'content-type': getContentType() });
      res.end(await getSummary());
    });

    server.listen(port, defaultedOptions.hostname, () => {
      server.on('error', reject);

      resolve(server);
    });
  });
};

export { createServer as default };
