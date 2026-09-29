// Мини-заглушка hoffman-backend для e2e: BFF-прокси Next.js ходит в Laravel с
// сервера, поэтому page.route() такие запросы не перехватывает. Реализует только
// эндпоинты /api/v1/auth/*, нужные happy path, с тем же форматом ответов.
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

const PORT = Number(process.env.MOCK_BACKEND_PORT ?? 4010);

export const SEEDED_USER = { name: "Demo", email: "demo@hoffman.test", password: "Secret123!" };

const users = new Map([[SEEDED_USER.email, { id: 1, ...SEEDED_USER }]]);
const tokens = new Map();

function send(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(body === undefined ? "" : JSON.stringify(body));
}

function error(res, status, code, fields = {}) {
  send(res, status, { error: { code, message: code, fields } });
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, created_at: "2026-01-01T00:00:00Z" };
}

function issueToken(user) {
  const token = `${user.id}|${randomUUID()}`;
  tokens.set(token, user.email);
  return token;
}

async function readBody(req) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

createServer(async (req, res) => {
  const bearer = req.headers.authorization?.replace(/^Bearer /, "");
  const body = req.method === "POST" ? await readBody(req) : {};

  switch (`${req.method} ${req.url}`) {
    case "POST /api/v1/auth/register": {
      if (users.has(body.email)) {
        return error(res, 422, "EMAIL_TAKEN", { email: ["The email has already been taken."] });
      }
      const user = { id: users.size + 1, name: body.name, email: body.email, password: body.password };
      users.set(user.email, user);
      return send(res, 201, { user: publicUser(user), token: issueToken(user) });
    }
    case "POST /api/v1/auth/login": {
      const user = users.get(body.email);
      if (!user || user.password !== body.password) return error(res, 401, "INVALID_CREDENTIALS");
      return send(res, 200, { user: publicUser(user), token: issueToken(user) });
    }
    case "GET /api/v1/auth/me": {
      const email = tokens.get(bearer);
      if (!email) return error(res, 401, "UNAUTHENTICATED");
      return send(res, 200, { user: publicUser(users.get(email)) });
    }
    case "POST /api/v1/auth/logout":
      tokens.delete(bearer);
      return send(res, 204);
    case "GET /up":
      return send(res, 200, { status: "ok" });
    default:
      return error(res, 404, "NOT_FOUND");
  }
}).listen(PORT, "127.0.0.1");
