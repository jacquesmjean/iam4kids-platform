import type { Config } from "tailwindcss";

// I AM 4 Kids brand tokens, carried over from the public site design.
// The staff console uses its own hex values, so these names are free for the site.
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#3895cc", deep: "#277db0", glow: "#5fb4e4", ice: "#e8f2fd" },
        gold: { DEFAULT: "#f0b429", deep: "#c99117", soft: "#ffd97a" },
        ink: { DEFAULT: "#0a1628", soft: "rgba(18,35,59,.5)" },
        techfides: "#0ea5a6",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        serif: ["Georgia", "ui-serif", "serif"],
      },
      keyframes: {
        fadeUp: { "0%": { opacity: "0", transform: "translateY(28px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        float: { "0%,to": { transform: "translateY(0)" }, "50%": { transform: "translateY(-18px)" } },
        pulseSoft: { "0%,to": { opacity: ".55" }, "50%": { opacity: "1" } },
        twinkle: { "0%,to": { opacity: ".25", transform: "scale(.85)" }, "50%": { opacity: "1", transform: "scale(1.1)" } },
      },
      animation: {
        "fade-up": "fadeUp .8s cubic-bezier(.22,1,.36,1) both",
        float: "float 7s ease-in-out infinite",
        "float-slow": "float 11s ease-in-out infinite",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        twinkle: "twinkle 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
