import NextAuth, { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
// import GoogleProvider from "next-auth/providers/google"; // Розкоментуй для Google
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  // Використовуємо адаптер Prisma для підключення до нашої бази
  adapter: PrismaAdapter(prisma),

  providers: [
    /*
    // Провайдер Google (потрібно отримати ключі в Google Cloud Console)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    */

    // Провайдер "Credentials" для входу за Email/Паролем
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // Ця функція викликається, коли користувач намагається увійти
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null; // Немає email або пароля
        }

        // 1. Знайти користувача в базі
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          return null; // Користувач не знайдений або зареєстрований через Google
        }

        // 2. Перевірити пароль
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          return null; // Пароль невірний
        }

        // 3. Повернути користувача, NextAuth створить сесію
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],

  // Стратегія сесій: JWT (JSON Web Tokens)
  session: {
    strategy: "jwt",
  },

  // Секретний ключ
  secret: process.env.NEXTAUTH_SECRET,

  // Сторінка для входу (ми її створимо)
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };