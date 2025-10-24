import { FastifyRequest, FastifyReply } from 'fastify';
import { lucia } from '../lib/auth'; // Import your Lucia instance

// Define types for what we'll attach to the request
declare module 'fastify' {
  interface FastifyRequest {
    user?: import('lucia').User | null;
    session?: import('lucia').Session | null;
  }
}

/**
 * Fastify Hook to validate user session.
 * Reads the session cookie, validates it with Lucia,
 * and attaches user/session info to the request object.
 * Sends 401 Unauthorized if the session is invalid.
 */
export const authHook = async (request: FastifyRequest, reply: FastifyReply) => {
  // 1. Get the session ID from the cookie
  const sessionId = request.cookies[lucia.sessionCookieName];
  if (!sessionId) {
    request.user = null;
    request.session = null;
    return reply.status(401).send({ error: 'Unauthorized: No session cookie found.' });
  }

  // 2. Validate the session ID with Lucia
  const { session, user } = await lucia.validateSession(sessionId);

  // 3. Handle session renewal (important!)
  if (session && session.fresh) {
    // Session was refreshed, create a new cookie
    const sessionCookie = lucia.createSessionCookie(session.id);
    reply.setCookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  }
  if (!session) {
    // Session is invalid, clear the cookie
    const sessionCookie = lucia.createBlankSessionCookie();
    reply.setCookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    request.user = null;
    request.session = null;
    return reply.status(401).send({ error: 'Unauthorized: Invalid session.' });
  }

  // 4. Session is valid, attach user and session to the request
  request.user = user;
  request.session = session;

  // Continue processing the request (no 'done()' needed in async hooks)
};