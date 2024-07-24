import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import db from '../../../server/db'; // Используем ваше подключение к базе данных
import bcrypt from 'bcrypt';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'jsmith' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const connection = await db;
        const [rows] = await connection.query('SELECT * FROM users WHERE username = ?', [credentials.username]);

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
    strategy: 'jwt',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  secret: process.env.SECRET,
});
