// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiError, jsonResponse, mockFetch } from "@/features/auth/test/utils";
import { getLegalDocument, listLegalDocuments, sanitizeLegalHtml } from "./legal";

const notFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  notFound: () => notFound(),
}));
const connection = vi.fn(async () => {});
vi.mock("next/server", () => ({ connection: () => connection() }));

describe("legal documents", () => {
  beforeEach(() => vi.stubEnv("HOFFMAN_API_URL", "http://laravel.test"));
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("читает список из `data` без токена", async () => {
    const fetchMock = mockFetch(jsonResponse(200, { data: [{ slug: "privacy", title: "Политика", updated_at: "2026-01-01" }] }));
    expect(await listLegalDocuments()).toEqual([{ slug: "privacy", title: "Политика", updated_at: "2026-01-01" }]);
    expect(fetchMock.mock.calls[0][0]).toBe("http://laravel.test/api/v1/legal-documents");
    expect(fetchMock.mock.calls[0][1]?.headers).not.toHaveProperty("Authorization");
  });

  it("рендерится на запрос, а не при сборке: connection() до обращения к backend", async () => {
    connection.mockClear();
    const fetchMock = mockFetch(jsonResponse(200, { data: [] }));
    await listLegalDocuments();
    expect(connection).toHaveBeenCalledOnce();
    expect(connection.mock.invocationCallOrder[0]).toBeLessThan(fetchMock.mock.invocationCallOrder[0]);
  });

  it("неизвестный slug — notFound()", async () => {
    mockFetch(apiError(404, "NOT_FOUND"));
    await expect(getLegalDocument("offer")).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("очищает HTML документа", async () => {
    mockFetch(jsonResponse(200, { data: { title: "Условия", body: '<p onclick="x()">Текст<script>alert(1)</script></p>' } }));
    expect(await getLegalDocument("terms")).toEqual({ title: "Условия", body: "<p>Текст</p>" });
  });

  it("оставляет форматирование и безопасные ссылки", () => {
    expect(sanitizeLegalHtml('<h2>Раздел</h2><ul><li><strong>a</strong></li></ul><a href="https://x.ru">x</a>')).toBe(
      '<h2>Раздел</h2><ul><li><strong>a</strong></li></ul><a href="https://x.ru" rel="noopener noreferrer">x</a>',
    );
    expect(sanitizeLegalHtml('<a href="javascript:alert(1)">x</a><img src=x onerror=alert(1)><style>p{}</style>')).toBe("<a rel=\"noopener noreferrer\">x</a>");
  });
});
