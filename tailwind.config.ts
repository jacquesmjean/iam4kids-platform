import type { Config } from "tailwindcss";

// I AM 4 Kids brand tokens. Colour lives here, never hard-coded in components.
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#16304F", deep: "#0E2036" },
        gold: { DEFAULT: "#E8A825", deep: "#C7891A", soft: "#FBEFD3" },
        sky:  { DEFAULT: "#2F80C9", soft: "#E8F1FA", deep: "#1D5A8E" },
      },
      fontFamily: { serif: ["Georgia", "ui-serif", "serif"] },
    },
  },
  plugins: [],
} satisfies Config;
