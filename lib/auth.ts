import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const homeowner = await prisma.homeowner.findUnique({
          where: { email: credentials.email },
        });
        if (!homeowner || !homeowner.passwordHash) return null;

        const valid = await bcrypt.compare(
          credentials.password,
          homeowner.passwordHash,
        );
        if (!valid) return null;

        return {
          id: homeowner.id,
          email: homeowner.email,
          name: homeowner.fullName,
          unit: homeowner.unit,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // @ts-expect-error -- unit is our own addition to the default shape
        token.unit = user.unit;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).unit = token.unit;
      }
      return session;
    },
  },
};
