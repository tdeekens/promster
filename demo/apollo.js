import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import {
  createPlugin as createPromsterMetricsPlugin,
  signalIsUp,
} from '@promster/apollo';
import { createServer as createPrometheusMetricsServer } from '@promster/server';
import gql from 'graphql-tag';

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

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  console.log(`🚀  Apollo Server ready at ${url}`);
  console.log('Prometheus metrics available on http://localhost:8080');

  signalIsUp();
}

launchServer().catch(console.log);
