const http = require('http');
const { getSummary, getContentType } = require('@promster/metrics');

const createServer = (options = { port: 7788, hostname: '0.0.0.0' }) => {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      res.writeHead(200, 'OK', { 'content-type': getContentType() });
      res.end(getSummary());
    });

    server.listen(options.port, options.host, error => {
      if (error) reject(error);
      else resolve(server);
    });
  });
};

exports.default = createServer;
