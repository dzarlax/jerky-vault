import NextAuth, { Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import db from '../../../server/db';
import bcrypt from 'bcrypt';
import { RowDataPacket } from 'mysql2';

interface Credentials {
  username: string;
  password: string;
}

interface CustomUser {
  id: string;
  name?: string;
  email?: string;
}

interface CustomSession extends Session {
  user: CustomUser;
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'jsmith' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: Credentials | undefined) {
        if (!credentials) {
          return null;
        }

        const connection = await db;
        const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM users WHERE username = ?', [credentials.username]);

        if (rows.length === 0) {
          return null;
        }

        const user = rows[0];
        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (isValid) {
          return { id: user.id, name: user.username, email: user.email } as CustomUser;
        } else {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt' as const,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  callbacks: {
    async session({ session, token }) {
      if (token.id) {
        session.user = { ...session.user, id: token.id, email: token.email } as CustomUser;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
  },
  secret: process.env.SECRET,
};

export default NextAuth(authOptions);
