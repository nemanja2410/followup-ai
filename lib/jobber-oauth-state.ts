import { createHmac, randomBytes, timingSafeEqual } from "crypto";

export const JOBBER_OAUTH_COOKIE = "jobber_oauth_nonce";

function signingSecret() {
  return process.env.JOBBER_CLIENT_SECRET || "";
}

export function createJobberOAuthState(userId: string) {
  const nonce = randomBytes(16).toString("hex");
  const payload = `${userId}.${nonce}`;
  const signature = createHmac("sha256", signingSecret()).update(payload).digest("hex");
  return { state: `${payload}.${signature}`, nonce };
}

export function jobberOAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 10 * 60,
    path: "/",
  };
}

export function parseJobberOAuthState(
  state: string | null,
  cookieNonce: string | null,
  userId: string
) {
  if (!state || !cookieNonce || !userId) return false;
  const parts = state.split(".");
  if (parts.length !== 3) return false;
  const [stateUserId, nonce, signature] = parts;
  if (stateUserId !== userId || nonce !== cookieNonce) return false;
  const payload = `${stateUserId}.${nonce}`;
  const expected = createHmac("sha256", signingSecret()).update(payload).digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
