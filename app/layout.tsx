import type { Metadata } from "next";
import { Golos_Text } from "next/font/google";
import "./globals.css";

const golosText = Golos_Text({
  variable: "--font-golos",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Hoffman",
  description: "Hoffman — тарифы, вход и личный кабинет",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${golosText.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {/* Пропуск шапки с клавиатуры: виден только в фокусе. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-[3px] focus:bg-white focus:px-4 focus:py-3 focus:text-[0.875rem] focus:text-hoffman-black"
        >
          Перейти к содержимому
        </a>
        {children}
      </body>
    </html>
  );
}
