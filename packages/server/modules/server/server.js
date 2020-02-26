const http = require('http');
const {
  getSummary,
  getContentType,
  isRunningInKubernetes,
} = require('@promster/metrics');

const createServer = (
  options = { port: 7788, hostname: '0.0.0.0', detectKubernetes: false }
) => {
  return new Promise((resolve, reject) => {
    const skipServerStart =
      options.detectKubernetes === true && isRunningInKubernetes() === false;

    const port = skipServerStart ? undefined : options.port;

    const server = http.createServer((req, res) => {
      res.writeHead(200, 'OK', { 'content-type': getContentType() });
      res.end(getSummary());
    });

    server.listen(port, options.host, error => {
      if (error) reject(error);
      else resolve(server);
    });
  });
};

exports.default = createServer;
