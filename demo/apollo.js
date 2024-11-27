const { ApolloServer, gql } = require('apollo-server');
const {
  createPlugin: createPromsterMetricsPlugin,
  signalIsUp,
} = require('@promster/apollo');
const {
  createServer: createPrometheusMetricsServer,
} = require('@promster/server');

const typeDefs = gql`
  type Book {
    title: String
    author: String
  }

  type Query {
    books: [Book]
  }
`;

const books = [
  {
    title: 'The Awakening',
    author: 'Kate Chopin',
  },
  {
    title: 'City of Glass',
    author: 'Paul Auster',
  },
];

const resolvers = {
  Query: {
    books: () => books,
  },
};

async function launchServer() {
  await createPrometheusMetricsServer({
    port: 8080,
    detectKubernetes: false,
  });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [createPromsterMetricsPlugin()],
  });

  await server.listen().then(({ url }) => {
    console.log(`🚀  Apollo Server ready at ${url}`);

    console.log('Prometheus metrics available on http://localhost:8080');

    signalIsUp();
  });
}

launchServer().catch(console.log);
