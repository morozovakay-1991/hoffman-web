import type { Config } from "tailwindcss";

// Монохромная бренд-палитра: чёрный/белый и оттенки серого.
// Единая с мобильным приложением (см. документ-план, раздел 11.2).
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Токены из Figma (файл Mobile-app-UI, раздел Colors; те же, что
        // hoffman-mobile/docs/mockups/design-tokens.json).
        hoffman: {
          black: "#000000",
          "soft-black": "rgba(0, 0, 0, 0.7)",
          grey: "rgba(0, 0, 0, 0.2)",
          "blue-tint": "#ABC5DD",
          "light-blue": "#E3F0F9",
          cherry: "#921D19",
          fire: "#FF363A",
          dark: "#221D17",
        },
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
      // Эффекты лендинга (Figma 1313:2343): тени макетов iPhone цвета blue-tint
      // и «стеклянные» карточки блока «Как устроен доступ».
      dropShadow: {
        phone: [
          "0 408.1px 57.2px rgba(171, 197, 221, 0)",
          "0 260.7px 52.25px rgba(171, 197, 221, 0.01)",
          "0 146.3px 44px rgba(171, 197, 221, 0.05)",
          "0 64.9px 32.45px rgba(171, 197, 221, 0.09)",
          "0 16.5px 18.15px rgba(171, 197, 221, 0.1)",
        ],
        "phone-wide": [
          "0 1843.6px 137.5px rgba(171, 197, 221, 0)",
          "0 1180.3px 137.5px rgba(171, 197, 221, 0.01)",
          "0 663.3px 137.5px rgba(171, 197, 221, 0.05)",
          "0 294.8px 137.5px rgba(171, 197, 221, 0.09)",
          "0 73.7px 80.85px rgba(171, 197, 221, 0.1)",
        ],
      },
      backgroundImage: {
        glass:
          "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.1) 51.443%, rgba(255, 255, 255, 0.2) 100%), linear-gradient(90deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.2) 100%)",
      },
    },
  },
};

export default config;
