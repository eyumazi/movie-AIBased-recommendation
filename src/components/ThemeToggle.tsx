"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as "light" | "dark") || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // For smooth transitions
  useEffect(() => {
    document.documentElement.style.transition =
      "background-color 0.4s, color 0.4s";
    return () => {
      document.documentElement.style.transition = "";
    };
  }, []);

  return (
    <button
      aria-label="Toggle theme"
      className="rounded-full p-2 border border-border bg-background shadow hover:bg-accent transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      style={{ lineHeight: 0 }}
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-blue-600" />
      )}
    </button>
  );
}
