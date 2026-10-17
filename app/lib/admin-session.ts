import "server-only";
import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "excamp_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET;
}

export function verifyAdminCredentials(username: string, password: string) {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;
  if (!expectedUsername || !expectedHash) return false;

  return safeEqual(username, expectedUsername) && verifyPasswordHash(password, expectedHash);
}

function verifyPasswordHash(password: string, encodedHash: string) {
  const [algorithm, saltText, hashText, ...extra] = encodedHash.split(":");
  if (algorithm !== "scrypt" || !saltText || !hashText || extra.length > 0) return false;
  try {
    const salt = Buffer.from(saltText, "base64url");
    const expected = Buffer.from(hashText, "base64url");
    if (salt.length < 16 || expected.length !== 64) return false;
    const actual = scryptSync(password, salt, expected.length, { N: 16384, r: 8, p: 1 });
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function safeEqual(value: string, expected: string) {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);
  return valueBuffer.length === expectedBuffer.length && timingSafeEqual(valueBuffer, expectedBuffer);
}

export function createAdminToken() {
  const secret = sessionSecret();
  if (!secret) return null;

  const expiresAt = Date.now() + SESSION_DURATION_SECONDS * 1000;
  const payload = Buffer.from(`admin:${expiresAt}`).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return { token: `${payload}.${signature}`, maxAge: SESSION_DURATION_SECONDS };
}

export function hashRateLimitKey(identifier: string) {
  const secret = sessionSecret();
  if (!secret) return null;
  return createHmac("sha256", secret).update(identifier).digest("hex");
}

export function isValidAdminToken(token?: string) {
  const secret = sessionSecret();
  if (!secret || !token) return false;

  const [payload, signature, ...extra] = token.split(".");
  if (!payload || !signature || extra.length > 0) return false;

  const expectedSignature = createHmac("sha256", secret).update(payload).digest();
  let actualSignature: Buffer;
  try {
    actualSignature = Buffer.from(signature, "base64url");
  } catch {
    return false;
  }
  if (actualSignature.length !== expectedSignature.length || !timingSafeEqual(actualSignature, expectedSignature)) {
    return false;
  }

  try {
    const decoded = Buffer.from(payload, "base64url").toString("utf8");
    const [user, expiresAt, ...rest] = decoded.split(":");
    return user === "admin" && rest.length === 0 && Number(expiresAt) > Date.now();
  } catch {
    return false;
  }
}
