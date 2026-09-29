import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Разрешает HMR-запросы от dev-сервера, запускаемого Playwright на 127.0.0.1.
  allowedDevOrigins: ["127.0.0.1"],
  // По умолчанию индикатор слева внизу и перекрывает кнопку «Выйти» в сайдбаре кабинета.
  devIndicators: { position: "bottom-right" },
};

export default nextConfig;
