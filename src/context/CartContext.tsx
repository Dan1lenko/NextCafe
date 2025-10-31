"use client";

import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { Product } from "@prisma/client";

export type CartItem = Product & {
  quantity: number;
};

interface ICartContext {
  items: CartItem[];
  addToCart: (product: Product) => void;
  decreaseQuantity: (productId: string) => void; // <-- 1. ДОДАНО НОВУ ФУНКЦІЮ
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<ICartContext | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Ця функція вже працює і як "додати", і як "збільшити кількість"
  const addToCart = (product: Product) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  // 2. РЕАЛІЗАЦІЯ НОВОЇ ФУНКЦІЇ "ЗМЕНШИТИ КІЛЬКІСТЬ"
  const decreaseQuantity = (productId: string) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === productId);

      // Якщо товару немає, нічого не робимо
      if (!existingItem) {
        return prevItems;
      }

      // Якщо кількість товару 1, то ми видаляємо його з масиву
      if (existingItem.quantity === 1) {
        return prevItems.filter((item) => item.id !== productId);
      }

      // В іншому випадку, просто зменшуємо quantity на 1
      return prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = useMemo(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        decreaseQuantity, // <-- 3. ДОДАЄМО У VALUE
        clearCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart має використовуватись всередині CartProvider");
  }
  return context;
};
