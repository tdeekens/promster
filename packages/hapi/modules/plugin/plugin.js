const pkg = require('../package.json');
const { Prometheus, observe } = require('@promster/metrics');

const createPlugin = options => {
  const plugin = {
    register(server, options, next) {
      server.ext('onRequest', (request, reply) => {
        request.promster = { start: process.hrtime() };
        return reply.continue();
      });

      server.on('response', req => {
        metrics.observe(req.promking.start, {
          labels: {
            route: req.route.path.replace(/\?/g, ''),
            code: req.response ? req.response.statusCode : 0,
            method: req.method.toLowerCase(),
          },
        });
      });

      server.decorate('server', 'Prometheus', Prometheus);

      return next();
    },
  };

  return plugin;
};

plugin.register.attributes = {
  name: pkg.name,
  version: pkg.version,
};

exports.default = createPlugin;
