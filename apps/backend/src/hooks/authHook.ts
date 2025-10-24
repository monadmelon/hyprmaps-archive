import { FastifyRequest, FastifyReply } from 'fastify';
import { lucia } from '../lib/auth';

// ... (declare module 'fastify' remains the same) ...
declare module 'fastify' {
  interface FastifyRequest {
    user?: import('lucia').User | null;
    session?: import('lucia').Session | null;
  }
}


export const authHook = async (request: FastifyRequest, reply: FastifyReply) => {
  console.log('--- Auth Hook Running ---'); // <-- ADDED LOG

  const sessionId = request.cookies[lucia.sessionCookieName];
  console.log('Session ID from cookie:', sessionId); // <-- ADDED LOG

  if (!sessionId) {
    console.log('No session ID found, sending 401.'); // <-- ADDED LOG
    request.user = null;
    request.session = null;
    // It's crucial to return here to stop execution
    return reply.status(401).send({ error: 'Unauthorized: No session cookie found.' });
  }

  // ... rest of the validation logic ...
  const { session, user } = await lucia.validateSession(sessionId);

  if (session && session.fresh) {
    console.log('Session is fresh, renewing cookie.'); // <-- ADDED LOG
    const sessionCookie = lucia.createSessionCookie(session.id);
    reply.setCookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  }
  if (!session) {
    console.log('Session invalid, clearing cookie and sending 401.'); // <-- ADDED LOG
    const sessionCookie = lucia.createBlankSessionCookie();
    reply.setCookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    request.user = null;
    request.session = null;
    // Crucial to return here
    return reply.status(401).send({ error: 'Unauthorized: Invalid session.' });
  }

  console.log('Session valid, attaching user.'); // <-- ADDED LOG
  request.user = user;
  request.session = session;

  // No explicit return needed here, the hook finishes, and Fastify continues
};