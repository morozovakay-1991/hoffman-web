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
        {children}
      </body>
    </html>
  );
}
