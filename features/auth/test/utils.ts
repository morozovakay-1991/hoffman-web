import { vi } from "vitest";

export function jsonResponse(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

export function apiError(status: number, code: string, fields: Record<string, string[]> = {}, headers?: Record<string, string>) {
  return jsonResponse(status, { error: { code, message: code, fields } }, headers);
}

/** Подменяет global fetch: ответы выдаются по очереди, вызовы доступны через `.mock.calls`. */
export function mockFetch(...responses: (Response | Error)[]) {
  const fn = vi.fn<typeof fetch>(async () => {
    const next = responses.shift();
    if (!next) throw new Error("Unexpected fetch call");
    if (next instanceof Error) throw next;
    return next;
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

export function requestBody(fetchMock: ReturnType<typeof mockFetch>, call = 0): unknown {
  return JSON.parse(fetchMock.mock.calls[call][1]?.body as string);
}
