// SECURITY: This endpoint handles authentication. In production, implement rate limiting, account lockout, and monitor for brute force attacks.
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import type { NextAuthOptions } from 'next-auth';

const prisma = new PrismaClient();

// In-memory rate limiter (per IP, 10 requests per 10 minutes)
const rateLimitMap = new Map<string, { count: number; last: number }>();
const WINDOW = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 10;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        // In-memory rate limiting
        /* const ip = req?.headers?.get("x-forwarded-for") || "unknown";
        const now = Date.now();
        const entry = rateLimitMap.get(ip) || { count: 0, last: now };
        if (now - entry.last > WINDOW) {
          entry.count = 0;
          entry.last = now;
        }
        entry.count += 1;
        rateLimitMap.set(ip, entry);
        if (entry.count > MAX_REQUESTS) {
          return null;
        } */
        // SECURITY: Passwords are hashed and compared securely.
        if (!credentials?.username || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });
        if (!user) return null;
        if (user.isLocked) {
          await prisma.auditLog.create({
            data: {
              userId: user.id,
              action: 'Login Attempt (Locked)',
              details: 'Account is locked due to too many failed login attempts',
            },
          });
          return null;
        }
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          await prisma.user.update({
            where: { username: credentials.username },
            data: { failedLoginAttempts: { increment: 1 } }
          });
          await prisma.auditLog.create({
            data: {
              userId: user.id,
              action: 'Login Failed',
              details: 'Invalid password',
            },
          });
          // Lock account after 5 failed attempts
          if (user.failedLoginAttempts + 1 >= 5) {
            await prisma.user.update({
              where: { username: credentials.username },
              data: { isLocked: true }
            });
            await prisma.auditLog.create({
              data: {
                userId: user.id,
                action: 'Account Locked',
                details: 'Account locked after too many failed login attempts',
              },
            });
          }
          return null;
        }
        // On successful login, reset failed attempts
        await prisma.user.update({
          where: { username: credentials.username },
          data: { failedLoginAttempts: 0 }
        });
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'Login Success',
            details: 'User logged in successfully',
          },
        });
        return user;
      },
    }),
  ],
  session: {
    strategy: 'jwt', // SECURITY: Consider using database sessions for critical apps.
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.username = (user as any).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role as string;
        (session.user as any).username = token.username as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 