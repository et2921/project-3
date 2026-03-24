"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const options = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ];

  return (
    <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            theme === opt.value
              ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
