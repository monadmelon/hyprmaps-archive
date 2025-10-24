import { join } from 'node:path'
import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload'
import { FastifyPluginAsync, FastifyServerOptions } from 'fastify'
import fastifyCors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie'; // <-- 1. Import cookie plugin

export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {

}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
}

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
  // Place here your custom code!

  // Register the CORS plugin
  await fastify.register(fastifyCors, {
    origin: 'http://localhost:5173', // <-- Tell it to trust your frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true // <-- Allow cookies to be sent
  });

  // 2. Register Cookie Parser
  await fastify.register(fastifyCookie);

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  // eslint-disable-next-line no-void
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  // eslint-disable-next-line no-void
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts
  })
}

export default app
export { app, options }