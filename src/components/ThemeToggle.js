import React from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "../lib/theme";

// Sun/moon swap: the outgoing icon spins away while the incoming one rotates in.
const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        toggleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light theme" : "Dark theme"}
      className={`group relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-cream/15 bg-ink-800/60 text-cream backdrop-blur-xl transition-colors duration-300 hover:border-ember hover:text-ember ${className}`}
    >
      <FiSun
        className={`absolute text-lg transition-all duration-500 ease-expo ${
          isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"
        }`}
      />
      <FiMoon
        className={`absolute text-lg transition-all duration-500 ease-expo ${
          isDark ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
      />
    </button>
  );
};

export default ThemeToggle;
