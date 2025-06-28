import {
  createServer as createHttpServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from 'node:http';
import {
  getContentType,
  getSummary,
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
): Promise<Server> => {
  const defaultedOptions = {
    ...defaultOptions,
    ...options,
  };

  const server = createHttpServer(
    async (_req: IncomingMessage, res: ServerResponse) => {
      res.writeHead(200, 'OK', { 'content-type': getContentType() });
      res.end(await getSummary());
    }
  );

  return new Promise((resolve, reject) => {
    const skipServerStart = skipMetricsInEnvironment(defaultedOptions);

    const port = skipServerStart ? undefined : defaultedOptions.port;

    server.listen(port, defaultedOptions.hostname, () => {
      server.on('error', reject);

      resolve(server);
    });
  });
};

export { createServer };
