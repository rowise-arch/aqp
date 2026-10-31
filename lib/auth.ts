import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Admin sign-in: Supabase checks the email and password, then we set our own signed, httpOnly cookie.
// Only the emails listed in ADMIN_EMAILS may sign in, so a stray Supabase account cannot get in.
const COOKIE = "aqp_admin";
const DAYS = 7;

const secret = () => process.env.SESSION_SECRET ?? "";
const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

export const adminEmails = () =>
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

export const authConfigured = () => Boolean(secret().length >= 16 && adminEmails().length && process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);

export async function createSession(email: string) {
  const payload = Buffer.from(JSON.stringify({ e: email.toLowerCase(), x: Date.now() + DAYS * 864e5 })).toString("base64url");
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DAYS * 86400,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

/** The signed-in admin's email, or null. Safe to call anywhere on the server. */
export async function getAdmin(): Promise<string | null> {
  if (!authConfigured()) return null;
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig) return null;
  const good = Buffer.from(sign(payload));
  const given = Buffer.from(sig);
  if (good.length !== given.length || !timingSafeEqual(good, given)) return null;
  try {
    const { e, x } = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof e !== "string" || typeof x !== "number" || x < Date.now()) return null;
    return adminEmails().includes(e) ? e : null;
  } catch {
    return null;
  }
}

/** Use at the top of every admin page and every admin server action. */
export async function requireAdmin(): Promise<string> {
  const email = await getAdmin();
  if (!email) redirect("/admin/login");
  return email;
}
