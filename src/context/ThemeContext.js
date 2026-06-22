"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
});

/**
 * Context Provider for handling the dark/light color mode of the application.
 * @param {{ children: React.ReactNode }} props
 * @returns {React.JSX.Element}
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check local storage or fallback to system preference
    const storedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = storedTheme || (systemPrefersDark ? "dark" : "light");

    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  // Prevent flash or hydration issues: during server-render and first client render,
  // we render children normally, but keep state hidden or ready.
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom hook to retrieve current theme status and trigger function.
 * @returns {{ theme: 'light' | 'dark', toggleTheme: () => void, mounted: boolean }}
 */
export function useTheme() {
  return useContext(ThemeContext);
}
