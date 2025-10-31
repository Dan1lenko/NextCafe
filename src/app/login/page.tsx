"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Ми будемо мати два "режими" для цієї сторінки
type Mode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");

  // Стани для полів форми
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Стани для помилок та повідомлень
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --- ОБРОБНИК ДЛЯ ВХОДУ (у тебе він вже є) ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Скидаємо помилку

    const result = await signIn("credentials", {
      redirect: false, // Ми керуємо перенаправленням самі
      email,
      password,
    });

    if (result?.ok) {
      // Успішний вхід!
      // NextAuth автоматично перенаправить на callbackUrl (/order)
      // Але ми можемо зробити це і примусово:
      router.push("/order");
    } else {
      setError("Невірний email або пароль");
    }
  };

  // --- НОВИЙ ОБРОБНИК ДЛЯ РЕЄСТРАЦІЇ ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      // Робимо запит до нашого API /api/register
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
        // Скидаємо поля і переключаємо на логін
        setName("");
        setEmail("");
        setPassword("");
        setMode("login");
      } else {
        // Показуємо помилку з сервера
        setError(data.error || "Щось пішло не так");
      }
    } catch (err) {
      setError("Помилка підключення до сервера");
    }
  };

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
              // Перемикаємо режим і скидаємо помилки/поля
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
