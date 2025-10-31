import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Шлях до твоїх authOptions
import prisma from "@/lib/prisma";

// Тип для даних, які ми очікуємо отримати з клієнта
type CartItem = {
  id: string; // ID товару (Product)
  quantity: number;
};

// --- Наш головний POST-обробник ---
export async function POST(request: Request) {
  console.log("POST /api/orders: Отримано запит на створення замовлення...");

  // 1. --- БЕЗПЕКА: Перевірка сесії ---
  // Отримуємо сесію користувача на СЕРВЕРІ
  const session = await getServerSession(authOptions);

  // Якщо сесії немає, або в ній немає email - відмовляємо
  if (!session?.user?.email) {
    console.warn("POST /api/orders: Спроба доступу без авторизації.");
    return NextResponse.json(
      { error: "Неавторизований доступ" },
      { status: 401 }
    );
  }

  try {
    // 2. --- ОТРИМАННЯ ДАНИХ: Користувач та Кошик ---

    // Знаходимо ID нашого користувача в базі за його email із сесії
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.error(
        `POST /api/orders: Користувача з email ${session.user.email} не знайдено в базі.`
      );
      return NextResponse.json(
        { error: "Користувача не знайдено" },
        { status: 404 }
      );
    }

    // Отримуємо масив товарів (кошик) з тіла запиту
    const { items }: { items: CartItem[] } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Кошик не може бути порожнім" },
        { status: 400 }
      );
    }

    // 3. --- БЕЗПЕКА: Перевірка цін на сервері ---
    // Ніколи не довіряй ціні, що прийшла з клієнта!
    // Ми самі завантажимо з бази ціни на товари, які замовив юзер.

    const productIds = items.map((item) => item.id);
    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    // Створюємо "карту" цін для швидкого доступу: { 'productId': 100.00 }
    const priceMap = new Map(dbProducts.map((p) => [p.id, p.price]));

    let totalPrice = 0;
    const orderItemsData = []; // Масив для наших OrderItem

    // 4. --- ПІДГОТОВКА ДАНИХ ДЛЯ БАЗИ ---
    for (const item of items) {
      const price = priceMap.get(item.id);

      // Якщо товару немає в базі або ціна не знайдена - помилка
      if (price === undefined) {
        throw new Error(
          `Товар з ID ${item.id} не знайдено або у нього немає ціни.`
        );
      }

      totalPrice += price * item.quantity; // Рахуємо загальну суму

      // Готуємо дані для моделі OrderItem
      orderItemsData.push({
        productId: item.id,
        quantity: item.quantity,
        price: price, // Беремо ціну з БАЗИ, а не з клієнта
      });
    }

    // 5. --- ЗАПИС В БАЗУ: Транзакція ---
    // Ми створюємо "Замовлення" (Order) і "Позиції Замовлення" (OrderItem)
    // ОДНИМ ЗАПИТОМ (це називається "транзакція" або "вкладений запис")
    // Якщо щось піде не так, нічого не буде створено.

    console.log("POST /api/orders: Створення замовлення в базі...");

    const createdOrder = await prisma.order.create({
      data: {
        userId: user.id, // Хто замовив
        totalPrice: totalPrice, // Яка загальна сума
        status: "PENDING", // Початковий статус

        // Вкладений запис: створюємо всі OrderItem
        // і автоматично прив'язуємо їх до цього Order
        items: {
          create: orderItemsData,
        },
      },
      // Включаємо створені позиції у відповідь
      include: {
        items: true,
      },
    });

    console.log(
      `POST /api/orders: Успішно створено замовлення ${createdOrder.id}`
    );

    // 6. --- УСПІШНА ВІДПОВІДЬ ---
    return NextResponse.json(createdOrder, { status: 201 }); // 201 = "Created"
  } catch (error) {
    console.error("POST /api/orders: Не вдалося створити замовлення:", error);
    return NextResponse.json(
      { error: "Внутрішня помилка сервера" },
      { status: 500 }
    );
  }
}
