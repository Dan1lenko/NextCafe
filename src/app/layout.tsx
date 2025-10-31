import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "./SessionProviderWrapper";
import { CartProvider } from "@/context/CartContext";
// 1. Імпортуємо наш новий Navbar
import Navbar from "@/components/Navbar"; // Переконайся, що шлях правильний

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "NextCafe", // 2. Оновимо заголовок сайту
  description: "Веб-додаток кафе, створений на Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      {/* 3. Зробимо фон всього сайту темним */}
      <body className={`${inter.className} bg-gray-900`}>
        <SessionProviderWrapper>
          <CartProvider>
            {/* 4. Додаємо Navbar ТУТ, над {children} */}
            <Navbar />

            {/* {children} - це буде наша поточна сторінка (Головна, Меню і т.д.) */}
            {children}
          </CartProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
