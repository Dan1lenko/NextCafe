import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Твій шлях до authOptions
import prisma from "@/lib/prisma"; // Наш Prisma клієнт
import { redirect } from "next/navigation";

/*
 * ❗️ ЦЕ ЗНОВУ СЕРВЕРНИЙ КОМПОНЕНТ!
 * 1. Він може бути `async`
 * 2. Він може безпечно отримувати сесію (`getServerSession`)
 * 3. Він може безпечно говорити з базою (`prisma`)
 */

// Окрема функція для завантаження замовлень користувача
async function getUserOrders(userEmail: string) {
  const orders = await prisma.order.findMany({
    // 1. Знаходимо замовлення, де email користувача
    //    збігається з email з нашої сесії
    where: {
      user: {
        email: userEmail,
      },
    },
    // 2. Включаємо в запит пов'язані дані
    include: {
      items: {
        // Для кожного замовлення - включаємо список позицій (OrderItems)
        include: {
          product: true, // І для кожної позиції - включаємо дані про сам Продукт
        },
      },
    },
    // 3. Сортуємо: новіші замовлення зверху
    orderBy: {
      createdAt: "desc",
    },
  });
  return orders;
}

export default async function ProfilePage() {
  // 1. Отримуємо сесію на сервері
  const session = await getServerSession(authOptions);

  // Наш proxy.ts вже захищає цю сторінку, але про всяк випадок
  // перевіримо сесію ще раз.
  if (!session?.user?.email) {
    redirect("/login");
  }

  // 2. Отримуємо всі замовлення для цього користувача
  const orders = await getUserOrders(session.user.email);

  return (
    <div className="container mx-auto p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">Профіль користувача</h1>
      <p className="text-xl mb-8">
        Вітаємо, <b>{session.user.name || session.user.email}</b>!
      </p>

      <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">
        Історія ваших замовлень
      </h2>

      {/* 3. Перевіряємо, чи є взагалі замовлення */}
      {orders.length === 0 ? (
        <p className="text-gray-400">У вас ще немає замовлень.</p>
      ) : (
        <div className="space-y-6">
          {/* 4. Якщо є - проходимо по кожному замовленню */}
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-blue-400">
                    {/* Показуємо лише перші 8 символів ID */}
                    Замовлення #{order.id.substring(0, 8)}...
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Дата:{" "}
                    {new Date(order.createdAt).toLocaleDateString("uk-UA", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-semibold ${
                      order.status === "PENDING"
                        ? "text-yellow-400" // Жовтий для статусу "В обробці"
                        : "text-green-400"
                    }`}
                  >
                    {order.status === "PENDING" ? "В обробці" : "Виконано"}
                  </p>
                  <p className="text-2xl font-bold">
                    {order.totalPrice.toFixed(2)} грн
                  </p>
                </div>
              </div>

              {/* 5. Тепер проходимо по товарах УСЕРЕДИНІ цього замовлення */}
              <h4 className="text-md font-semibold mb-2 mt-4 text-gray-300">
                Склад замовлення:
              </h4>
              <ul className="divide-y divide-gray-700 border-t border-gray-700">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="py-3 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold">{item.product.name}</p>
                      <p className="text-sm text-gray-400">
                        {item.quantity} шт. x {item.price.toFixed(2)} грн
                      </p>
                    </div>
                    <p className="font-semibold">
                      {(item.quantity * item.price).toFixed(2)} грн
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
