// Мини-заглушка hoffman-backend для e2e: BFF-прокси Next.js ходит в Laravel с
// сервера, поэтому page.route() такие запросы не перехватывает. Реализует только
// эндпоинты, нужные happy path (/auth/*, /profile/*, /verification/*,
// /legal-documents), с тем же форматом ответов, что ресурсы Laravel.
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

const PORT = Number(process.env.MOCK_BACKEND_PORT ?? 4010);

export const SEEDED_USER = { name: "Demo", email: "demo@hoffman.test", password: "Secret123!" };

let nextId = 1;
/** id → пользователь. */
const users = new Map();
/** token → id пользователя. */
const tokens = new Map();
/** id пользователя → { newEmail, code } — неподтверждённая смена email. */
const emailChanges = new Map();
/** Последний отправленный код по адресу — вместо письма (только для e2e). */
const sentCodes = new Map();

function addUser({ name, email, password }) {
  const user = { id: nextId++, name, email, password, graduate_status: "unverified", deletion: null };
  users.set(user.id, user);
  return user;
}
addUser(SEEDED_USER);

const findByEmail = (email) => [...users.values()].find((user) => user.email === email);

const LEGAL = [
  { slug: "license", title: "Лицензионное соглашение", body: "<p>Текст лицензионного соглашения.</p>" },
  { slug: "privacy", title: "Политика конфиденциальности", body: "<h2>1. Общие положения</h2><p>Текст политики.</p>" },
  { slug: "terms", title: "Условия использования", body: "<p>Текст условий.</p>" },
];

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

function profile(user) {
  return {
    ...publicUser(user),
    timezone: null,
    graduate_status: user.graduate_status,
    email_verified_at: null,
  };
}

function issueToken(user) {
  const token = `${user.id}|${randomUUID()}`;
  tokens.set(token, user.id);
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
  const body = ["POST", "PATCH"].includes(req.method) ? await readBody(req) : {};
  const url = new URL(req.url, "http://localhost");
  const route = `${req.method} ${url.pathname}`;
  const user = users.get(tokens.get(bearer));

  if (url.pathname.startsWith("/api/v1/legal-documents")) {
    const slug = decodeURIComponent(url.pathname.split("/")[4] ?? "");
    if (!slug) return send(res, 200, { data: LEGAL.map(({ slug, title }) => ({ slug, title, updated_at: "2026-01-01" })) });
    const document = LEGAL.find((item) => item.slug === slug);
    return document ? send(res, 200, { data: { title: document.title, body: document.body } }) : error(res, 404, "NOT_FOUND");
  }

  const authed = route.startsWith("GET /api/v1/auth/me") || route.includes("/api/v1/profile") || route.includes("/api/v1/verification") || route === "POST /api/v1/auth/logout";
  if (authed && !user) return error(res, 401, "UNAUTHENTICATED");

  switch (route) {
    case "POST /api/v1/auth/register": {
      if (findByEmail(body.email)) {
        return error(res, 422, "EMAIL_TAKEN", { email: ["The email has already been taken."] });
      }
      const created = addUser(body);
      return send(res, 201, { user: publicUser(created), token: issueToken(created) });
    }
    case "POST /api/v1/auth/login": {
      const found = findByEmail(body.email);
      if (!found || found.password !== body.password) return error(res, 401, "INVALID_CREDENTIALS");
      return send(res, 200, { user: publicUser(found), token: issueToken(found) });
    }
    case "GET /api/v1/auth/me":
      return send(res, 200, { user: publicUser(user) });
    case "POST /api/v1/auth/logout":
      tokens.delete(bearer);
      return send(res, 204);

    case "GET /api/v1/profile":
      return send(res, 200, { profile: profile(user) });
    case "PATCH /api/v1/profile":
      if (typeof body.name === "string") user.name = body.name;
      return send(res, 200, { profile: profile(user) });
    case "PATCH /api/v1/profile/email": {
      const taken = findByEmail(body.new_email);
      if (taken && taken.id !== user.id) return error(res, 422, "EMAIL_TAKEN", { new_email: ["taken"] });
      const code = String(Math.floor(100000 + Math.random() * 900000));
      emailChanges.set(user.id, { newEmail: body.new_email, code });
      sentCodes.set(body.new_email, code);
      return send(res, 200, { message: "A confirmation code has been sent to the new email address." });
    }
    case "POST /api/v1/profile/email/confirm": {
      const change = emailChanges.get(user.id);
      if (!change || change.code !== body.code) return error(res, 422, "INVALID_CODE");
      user.email = change.newEmail;
      emailChanges.delete(user.id);
      return send(res, 200, { profile: profile(user) });
    }
    case "PATCH /api/v1/profile/password":
      if (body.old_password !== user.password) return error(res, 422, "INVALID_OLD_PASSWORD");
      user.password = body.password;
      return send(res, 200, { message: "Your password has been updated." });
    case "POST /api/v1/profile/deletion-request":
      if (user.deletion) return error(res, 422, "DELETION_ALREADY_REQUESTED");
      user.deletion = { status: "pending", reason: body.reason ?? null, scheduled_for: "2026-12-01T00:00:00Z", completed_at: null };
      return send(res, 201, { deletion_request: user.deletion });
    case "DELETE /api/v1/profile":
      // Как ProfileService::deleteNow(): аккаунт удалён, токены отозваны.
      users.delete(user.id);
      for (const [token, id] of tokens) if (id === user.id) tokens.delete(token);
      return send(res, 204);

    case "GET /api/v1/verification/status":
      return send(res, 200, { verification_request: null });

    // Только для e2e: код, который backend отправил бы письмом.
    case "GET /__test/email-code":
      return send(res, 200, { code: sentCodes.get(url.searchParams.get("email")) ?? null });
    case "GET /up":
      return send(res, 200, { status: "ok" });
    default:
      return error(res, 404, "NOT_FOUND");
  }
}).listen(PORT, "127.0.0.1");
