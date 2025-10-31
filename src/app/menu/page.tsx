import Link from "next/link";
import prisma from "@/lib/prisma";
import ProductCard from "./ProductCard"; // 1. Імпортуємо нашу нову картку

async function getProducts() {
  const products = await prisma.product.findMany();
  return products;
}

// MenuPage залишається Серверним Компонентом!
export default async function MenuPage() {
  const products = await getProducts();

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Наше Меню</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 2. Тепер ми рендеримо ProductCard замість div */}
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="text-center mt-12">
        <Link
          href="/order"
          className="bg-green-600 text-white px-8 py-3 rounded-lg text-xl font-semibold hover:bg-green-700 transition-colors"
        >
          Перейти до Замовлення
        </Link>
      </div>
    </main>
  );
}
