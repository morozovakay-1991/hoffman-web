import { defineConfig, devices } from "@playwright/test";

const MOCK_BACKEND_PORT = 4010;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer: [
    {
      // Заглушка hoffman-backend (e2e/mock-backend.mjs) для сценариев авторизации.
      command: "node e2e/mock-backend.mjs",
      url: `http://127.0.0.1:${MOCK_BACKEND_PORT}/up`,
      env: { MOCK_BACKEND_PORT: String(MOCK_BACKEND_PORT) },
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "npm run dev -- --port 3000",
      url: "http://127.0.0.1:3000",
      env: { HOFFMAN_API_URL: `http://127.0.0.1:${MOCK_BACKEND_PORT}` },
      // Уже запущенный локально `next dev` может смотреть в настоящий backend,
      // а не в заглушку — для e2e авторизации его лучше остановить.
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
