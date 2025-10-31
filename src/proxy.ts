import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Лог для перевірки, що файл все ще завантажується
console.log("✅ [Proxy/Auth] Файл 'proxy.ts' з NextAuth завантажено!");

export default withAuth(
  // Ця функція виконується, ТІЛЬКИ ЯКЩО `authorized` повернуло `true`
  function middleware(req) {
    console.log(
      "✅ [Proxy/Auth] Користувач авторизований. Запит на:",
      req.nextUrl.pathname
    );
    return NextResponse.next();
  },
  {
    callbacks: {
      // Ця функція викликається ЗАВЖДИ для маршрутів у `matcher`
      authorized: ({ token, req }) => {
        console.log("---------------------------------");
        console.log(
          "🚩 [Proxy/Auth] Перевірка 'authorized' для:",
          req.nextUrl.pathname
        );
        console.log(
          "   Токен (сесія):",
          token ? "Є токен" : "null (немає токену)"
        );

        // Повертаємо `true` якщо токен є, і `false` - якщо немає
        return !!token;
      },
    },
    pages: {
      // Сторінка, куди перенаправляти, якщо `authorized` поверне `false`
      signIn: "/login",
    },
  }
);

// Конфігурація залишається
export const config = {
  matcher: ["/order", "/profile"],
};
