import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { prisma } from '../../lib/prisma';
import { lucia } from '../../lib/auth';
import { Argon2id } from 'oslo/password';
import { z } from 'zod'; // We'll use Zod for input validation

// Define the expected shape of the login request body
const LoginBodySchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Define the type based on the Zod schema
type LoginBody = z.infer<typeof LoginBodySchema>;

const authRoutes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  const argon2id = new Argon2id();

  /**
   * POST /auth/login - Authenticate user and create session
   */
  fastify.post<{ Body: LoginBody }>('/login', async (request, reply) => {
    try {
      // 1. Validate request body
      const validation = LoginBodySchema.safeParse(request.body);
      if (!validation.success) {
        return reply.status(400).send({ error: 'Invalid input', details: validation.error.flatten() });
      }
      const { username, password } = validation.data;

      // 2. Find the key associated with the username
      const key = await prisma.key.findUnique({
        where: { id: `username:${username}` },
        include: { user: true }, // Include the user data
      });

      if (!key || !key.hashedPassword || !key.user) {
        return reply.status(400).send({ error: 'Incorrect username or password' });
      }

      // 3. Verify the password
      const passwordValid = await argon2id.verify(key.hashedPassword, password);
      if (!passwordValid) {
        return reply.status(400).send({ error: 'Incorrect username or password' });
      }

      // 4. Create a session for the user
      const session = await lucia.createSession(key.userId, {}); // Pass user ID and empty session attributes

      // 5. Create the session cookie
      const sessionCookie = lucia.createSessionCookie(session.id);

      // 6. Set the cookie in the response header
      reply.setCookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

      // 7. Return success (optionally include user info, but not sensitive data like password)
      return reply.status(200).send({
        message: 'Login successful',
        user: { id: key.user.id, username: key.user.username },
      });

    } catch (error) {
      console.error('Login error:', error);
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * (Optional) POST /auth/logout - Invalidate session
   */
  // We can add this later if needed
};

export default authRoutes;