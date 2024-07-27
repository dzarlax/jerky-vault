import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import db from '../../../server/db';
import bcrypt from 'bcrypt';
import { RowDataPacket } from 'mysql2';

// Определяем типы для параметров авторизации
interface Credentials {
  username: string;
  password: string;
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
          return { id: user.id, name: user.username, email: user.email };
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
    strategy: 'jwt' as const, // Явное указание типа
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  callbacks: {
    async session({ session, token }) {
      session.user = { ...session.user, id: token.id, email: token.email };
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.email = (user as any).email;
      }
      return token;
    },
  },
  secret: process.env.SECRET,
};

export default NextAuth(authOptions);
