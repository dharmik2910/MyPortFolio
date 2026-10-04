// Theme colors are CSS variables (RGB channels, see index.css) so the light/dark
// toggle can swap them while opacity modifiers like `bg-cream/10` keep working.
const themed = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "dark-orange": "#FF5823",
        cornsilk: "#fff8dc",
        darkblue: "#080831",
        whitesmoke: "#f5f5f5",
        // "ink" = page surfaces, "cream" = text/foreground. They swap in light mode.
        ink: {
          DEFAULT: themed("ink"),
          900: themed("ink"),
          800: themed("ink-800"),
          700: themed("ink-700"),
          600: themed("ink-600"),
        },
        cream: {
          DEFAULT: themed("cream"),
          dim: themed("cream-dim"),
          mute: themed("cream-mute"),
        },
        ok: themed("ok"),
        ember: {
          DEFAULT: "#FF5823",
          soft: "#ff8a5b",
          glow: "#ffb38a",
        },
      },
      fontFamily: {
        display: ['"Syne"', "system-ui", "sans-serif"],
        sans: ['"Manrope"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      transitionTimingFunction: {
        expo: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
