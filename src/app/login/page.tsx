import { Suspense } from "react";
import LoginClientPage from "./loginClientPage"; // 1. Імпортуємо наш старий компонент

// Це тепер головний компонент сторінки. Він (за замовчуванням) є Серверним.
export default function LoginPage() {
  return (
    // 2. Обгортаємо наш клієнтський компонент у Suspense
    <Suspense fallback={<div>Завантаження...</div>}>
      <LoginClientPage />
    </Suspense>
  );
}
