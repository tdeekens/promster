import http from 'http';
import {
  getSummary,
  getContentType,
  isRunningInKubernetes,
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

const createServer = (
  options: Partial<TServerOptions>
): Promise<http.Server> => {
  const defaultedOptions = {
    ...defaultOptions,
    ...options,
  };

  return new Promise((resolve, reject) => {
    const skipServerStart =
      defaultedOptions.detectKubernetes === true &&
      isRunningInKubernetes() === false;

    const port = skipServerStart ? undefined : defaultedOptions.port;

    const server = http.createServer((_req, res) => {
      res.writeHead(200, 'OK', { 'content-type': getContentType() });
      res.end(getSummary());
    });

    server.listen(port, defaultedOptions.hostname, () => {
      server.on('error', reject);

      resolve(server);
    });
  });
};

export { createServer as default };
