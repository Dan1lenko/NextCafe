"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useCart } from "@/context/CartContext"; // 1. Імпортуємо наш кошик

export default function Navbar() {
  const { data: session, status } = useSession();
  const { itemCount } = useCart(); // 2. Дістаємо загальну кількість товарів
  const isLoading = status === "loading";

  // 3. Створюємо маленький компонент-значок (badge)
  const CartBadge = () => (
    <span className="relative">
      {/* Це посилання тепер веде на /order, а не /profile, що логічніше */}
      <Link href="/order" className="hover:text-gray-300 text-lg">
        Кошик
      </Link>
      {itemCount > 0 && ( // Показуємо, тільки якщо кошик не порожній
        <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </span>
  );

  return (
    <nav className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold text-blue-400 hover:text-blue-300"
        >
          NextCafe
        </Link>

        <div className="flex items-center space-x-6">
          <Link href="/menu" className="hover:text-gray-300 text-lg">
            Меню
          </Link>

          {isLoading ? (
            <div className="text-gray-400">...</div>
          ) : session ? (
            <>
              {/* 4. Замінюємо "Профіль" на наш новий "Кошик" */}
              <CartBadge />

              <Link href="/profile" className="hover:text-gray-300 text-lg">
                Профіль
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 text-lg font-semibold"
              >
                Вийти
              </button>
            </>
          ) : (
            <>
              {/* 5. Гість також має бачити кошик! */}
              <CartBadge />

              <button
                onClick={() => signIn()}
                className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 text-lg font-semibold"
              >
                Увійти
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
