import type { Config } from "tailwindcss";

// Монохромная бренд-палитра: чёрный/белый и оттенки серого.
// Единая с мобильным приложением (см. документ-план, раздел 11.2).
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#0a0a0a",
          white: "#ffffff",
          50: "#f7f7f7",
          100: "#ececec",
          200: "#dcdcdc",
          300: "#bdbdbd",
          400: "#989898",
          500: "#7c7c7c",
          600: "#656565",
          700: "#525252",
          800: "#333333",
          900: "#1f1f1f",
          950: "#0a0a0a",
        },
      },
      fontFamily: {
        sans: ["var(--font-golos)", "system-ui", "sans-serif"],
      },
    },
  },
};

export default config;
