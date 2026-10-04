import React, { createContext, useCallback, useContext, useState } from "react";
import { flushSync } from "react-dom";
import { prefersReducedMotion } from "./scroll";

const STORAGE_KEY = "theme";
const THEME_COLORS = { dark: "#0d0c0b", light: "#f4efe6" };

// public/index.html sets data-theme before first paint; read it back so React agrees.
const initialTheme = () => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme]);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* storage unavailable — theme still applies for this visit */
  }
};

const ThemeContext = createContext({ theme: "dark", toggleTheme: () => {} });

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(initialTheme);

  // `origin` is the click point the new theme grows out from.
  const toggleTheme = useCallback(
    (origin) => {
      const next = theme === "dark" ? "light" : "dark";
      const swap = () => {
        applyTheme(next);
        flushSync(() => setTheme(next));
      };

      if (!document.startViewTransition || prefersReducedMotion()) {
        swap();
        return;
      }

      const x = origin?.x ?? window.innerWidth - 40;
      const y = origin?.y ?? 40;
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      const transition = document.startViewTransition(swap);
      transition.ready.then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 750, easing: "cubic-bezier(0.16, 1, 0.3, 1)", pseudoElement: "::view-transition-new(root)" }
        );
      });
    },
    [theme]
  );

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
