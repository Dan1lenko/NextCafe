import Link from "next/link";

// Головна сторінка - це Серверний Компонент
export default function HomePage() {
  return (
    // min-h-[80vh] - трюк, щоб відцентрувати контент по вертикалі
    <main className="container mx-auto p-8 text-white text-center flex flex-col items-center justify-center min-h-[80vh]">
      {/*  */}

      <h1 className="text-5xl font-extrabold mb-6">
        Вітаємо у Кафе "NextCafe"
      </h1>
      <p className="text-xl text-gray-300 mb-10 max-w-2xl">
        Найкраща кава, свіжа випічка та затишна атмосфера. Все, що потрібно для
        чудового дня, реалізовано на Next.js!
      </p>

      {/* Велика красива кнопка, що веде на меню */}
      <Link
        href="/menu"
        className="bg-blue-600 text-white px-10 py-4 rounded-lg text-2xl font-bold hover:bg-blue-700 transition-transform transform hover:scale-105"
      >
        Переглянути Меню
      </Link>
    </main>
  );
}
