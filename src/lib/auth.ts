import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || "dev-only-insecure-secret-change-me"
);

export type SessionPayload = {
  sub: string; // user id
  email: string;
  role: "owner" | "staff" | "client";
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

const ADMIN_COOKIE = "admin_session";
const CLIENT_COOKIE = "client_session";
const CSRF_COOKIE = "csrf_token";

export async function setAuthCookie(kind: "admin" | "client", token: string) {
  const store = await cookies();
  store.set(kind === "admin" ? ADMIN_COOKIE : CLIENT_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthCookie(kind: "admin" | "client") {
  const store = await cookies();
  store.delete(kind === "admin" ? ADMIN_COOKIE : CLIENT_COOKIE);
}

// Server-side check used by every admin page/API route. Never trust a UI
// flag - this reads and verifies the signed cookie on every request.
export async function requireAdminSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  const session = await verifySession(token);
  if (!session || (session.role !== "owner" && session.role !== "staff")) return null;
  return session;
}

export async function requireClientSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(CLIENT_COOKIE)?.value;
  if (!token) return null;
  const session = await verifySession(token);
  if (!session || session.role !== "client") return null;
  return session;
}

// --- CSRF (double-submit cookie pattern) ---
export async function issueCsrfToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const store = await cookies();
  store.set(CSRF_COOKIE, token, {
    httpOnly: false, // must be readable by client JS to echo back in header
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });
  return token;
}

export async function verifyCsrf(req: Request): Promise<boolean> {
  const store = await cookies();
  const cookieToken = store.get(CSRF_COOKIE)?.value;
  const headerToken = req.headers.get("x-csrf-token");
  return Boolean(cookieToken && headerToken && cookieToken === headerToken);
}
