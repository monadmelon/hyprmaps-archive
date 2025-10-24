import Fastify from 'fastify';
import appPlugin, { options as appOptions } from './app'; // Import our app plugin and options

// Instantiate Fastify with the exported options
const server = Fastify(appOptions);

// Register our app plugin
server.register(appPlugin);

// Start the server and listen for connections
const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log(`[Node] Server listening at http://127.0.0.1:3000`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();