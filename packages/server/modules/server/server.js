const http = require('http');
const { getSummary } = require('@promster/metrics');

const createServer = (options = { port: 7788, hostname: '0.0.0.0' }) => {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      res.writeHead(200, 'OK', { 'content-type': 'text/plain' });
      res.end(getSummary());
    });

    server.listen(options.port, options.host, () => resolve(server));
  });
};

exports.default = createServer;
