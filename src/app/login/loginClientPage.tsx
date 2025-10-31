"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation"; // 1. Імпортуємо useSearchParams
import { useState } from "react";

type Mode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // 2. Отримуємо доступ до параметрів URL
  const callbackUrl = searchParams.get("callbackUrl"); // 3. Шукаємо наш callbackUrl

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      redirect: false, // Ми все ще керуємо редиректом самі
      email,
      password,
    });

    if (result?.ok) {
      // 4. УСПІХ! Перенаправляємо на callbackUrl (якщо він є)
      //    або на головну сторінку, якщо його немає.
      router.push(callbackUrl || "/"); // <-- ОСЬ ГОЛОВНА ЗМІНА
      router.refresh(); // Оновлюємо кеш, щоб Navbar оновився
    } else {
      setError("Невірний email або пароль");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Користувач успішно створений! Тепер можете увійти.");
        setMode("login");
      } else {
        setError(data.error || "Щось пішло не так");
      }
    } catch (err) {
      setError("Помилка підключення до сервера");
    }
  };

  // ... (вся твоя JSX-розмітка залишається без змін)
  // ... (просто скопіюй весь код, включаючи JSX з твого файлу)

  // --- КОД ДЛЯ ВІДОБРАЖЕННЯ (JSX) ---
  return (
    <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
      <div className="p-6 border border-gray-700 rounded shadow-md bg-gray-800 w-full max-w-sm">
        {/* Форма входу */}
        {mode === "login" && (
          <form onSubmit={handleLogin}>
            <h2 className="text-2xl font-bold mb-4 text-center">Увійти</h2>
            {error && <p className="text-red-400 mb-2">{error}</p>}
            {success && <p className="text-green-400 mb-2">{success}</p>}
            <div className="mb-4">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded bg-gray-700 border-gray-600"
                required
              />
            </div>
            <div className="mb-4">
              <label>Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded bg-gray-700 border-gray-600"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              Увійти
            </button>
          </form>
        )}

        {/* Форма реєстрації */}
        {mode === "register" && (
          <form onSubmit={handleRegister}>
            <h2 className="text-2xl font-bold mb-4 text-center">
              Зареєструватися
            </h2>
            {error && <p className="text-red-400 mb-2">{error}</p>}
            <div className="mb-4">
              <label>Ім'я</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded bg-gray-700 border-gray-600"
                required
              />
            </div>
            <div className="mb-4">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded bg-gray-700 border-gray-600"
                required
              />
            </div>
            <div className="mb-4">
              <label>Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded bg-gray-700 border-gray-600"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
            >
              Створити акаунт
            </button>
          </form>
        )}

        {/* Перемикач */}
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
              setSuccess("");
              setName("");
              setEmail("");
              setPassword("");
            }}
            className="text-blue-400 hover:underline"
          >
            {mode === "login"
              ? "Немає акаунту? Зареєструватися"
              : "Вже є акаунт? Увійти"}
          </button>
        </div>
      </div>
    </div>
  );
}
