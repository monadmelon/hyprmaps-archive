import { Lucia } from 'lucia'
import { PrismaAdapter } from '@lucia-auth/adapter-prisma'
import { prisma as prismaClient } from './prisma' // Matches your import

// This interface MUST match the extra fields in your `User` model
interface DatabaseUserAttributes {
  username: string
}

// 1. Create the adapter instance using your prismaClient
const adapter = new PrismaAdapter(prismaClient.session, prismaClient.user)

// 2. Create the lucia instance
export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      // set to `true` when using HTTPS
      secure: process.env.NODE_ENV === 'production',
    },
  },

  // 3. Define what attributes to attach to the user object
  getUserAttributes: (attributes: DatabaseUserAttributes) => {
    return {
      username: attributes.username,
    }
  },
})

// 4. IMPORTANT: Define types for Lucia
declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia
    DatabaseUserAttributes: DatabaseUserAttributes
    DatabaseSessionAttributes: {} // No extra session data
  }
  interface UserAttributes {
    username: string
  }
}