"use client";

import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrderPage() {
  const { data: session } = useSession();

  // 1. Отримуємо ВСІ потрібні нам функції з кошика
  const { items, addToCart, decreaseQuantity, clearCart } = useCart();

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPrice = items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  const handleConfirmOrder = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Не вдалося створити замовлення");
      }

      clearCart();
      router.push("/profile");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- СТИЛІ ДЛЯ КНОПОК +/- ---
  const controlButtonClass =
    "bg-gray-700 text-white w-8 h-8 rounded-full font-bold hover:bg-gray-600 transition-colors";

  return (
    <div className="container mx-auto p-8 text-white">
      <h1 className="text-3xl font-bold">Ваше Замовлення</h1>
      <p className="mt-4 text-lg">
        Вітаємо, <b>{session?.user?.name || session?.user?.email}</b>!
      </p>

      {items.length === 0 ? (
        <p className="mt-6 text-gray-400">Ваш кошик порожній.</p>
      ) : (
        <div className="mt-6">
          <ul className="divide-y divide-gray-700">
            {items.map((item) => (
              <li
                key={item.id}
                className="py-4 flex justify-between items-center"
              >
                {/* Назва товару */}
                <div>
                  <h2 className="text-xl font-semibold">{item.name}</h2>
                  <p className="text-gray-400 text-sm">
                    {item.price.toFixed(2)} грн / шт.
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  {/* 2. БЛОК КЕРУВАННЯ КІЛЬКІСТЮ */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => decreaseQuantity(item.id)} // <-- 3. ВИКЛИК ЗМЕНШЕННЯ
                      className={controlButtonClass}
                    >
                      -
                    </button>
                    <span className="text-xl font-semibold w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => addToCart(item)} // <-- 4. ВИКЛИК ЗБІЛЬШЕННЯ
                      className={controlButtonClass}
                    >
                      +
                    </button>
                  </div>

                  {/* Загальна сума за позицію */}
                  <p className="text-lg font-bold w-32 text-right">
                    {(item.price * item.quantity).toFixed(2)} грн
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-gray-700 pt-4 text-right">
            <h3 className="text-2xl font-bold">
              Всього: {totalPrice.toFixed(2)} грн
            </h3>
            <button
              onClick={handleConfirmOrder}
              disabled={isLoading || items.length === 0}
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-500"
            >
              {isLoading ? "Обробка..." : "Підтвердити Замовлення"}
            </button>
            {error && <p className="text-red-400 mt-4 text-right">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
