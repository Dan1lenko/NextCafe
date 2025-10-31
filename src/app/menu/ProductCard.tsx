"use client";

import { Product } from "@prisma/client";
import { useCart } from "@/context/CartContext"; // Наш хук кошика

// Цей компонент приймає один товар як prop
export default function ProductCard({ product }: { product: Product }) {
  // Отримуємо функцію addToCart з нашого контексту
  const { addToCart } = useCart();

  return (
    <div className="border border-gray-700 rounded-lg p-6 shadow-lg bg-gray-800 text-white flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-semibold mb-2">{product.name}</h2>
        <p className="text-gray-400 mb-4">{product.description}</p>
        <p className="text-3xl font-bold text-blue-400 mb-4">
          {product.price} грн
        </p>
      </div>
      <button
        onClick={() => addToCart(product)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        Додати в кошик
      </button>
    </div>
  );
}
