"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  function toggleTheme() {
    const html = document.documentElement;

    const nextDark = !html.classList.contains("dark");

    html.classList.toggle("dark", nextDark);

    localStorage.setItem(
      "theme",
      nextDark ? "dark" : "light"
    );

    setIsDark(nextDark);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Açık temaya geç" : "Koyu temaya geç"}
      title={isDark ? "Açık tema" : "Koyu tema"}
      className="flex h-10 w-10 items-center justify-center rounded-lg border transition-opacity hover:opacity-70"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--surface)",
        color: "var(--text)",
      }}
    >
      {isDark ? "☀" : "☾"}
    </button>
  );
}