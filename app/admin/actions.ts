"use server";

import { updateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { services as defaultServices, groups } from "@/lib/content";
import { adminEmails, authConfigured, createSession, endSession, requireAdmin } from "@/lib/auth";
import { getAuthClient, getDb } from "@/lib/db";
import { customerStatus, sendEmail } from "@/lib/email";
import { defaultHours, isValidDate, type Day, type Hours } from "@/lib/schedule";

type Result = { error?: string; ok?: string };

const text = (f: FormData, k: string, max = 400) => String(f.get(k) ?? "").trim().slice(0, max);
const db = () => {
  const d = getDb();
  if (!d) throw new Error("Supabase is not configured");
  return d;
};

/* ───────── Sign in and out ───────── */

const attempts = new Map<string, number[]>();

export async function signIn(_prev: Result, form: FormData): Promise<Result> {
  if (!authConfigured()) return { error: "Admin sign-in is not set up yet. See the setup steps below." };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  if (recent.length >= 8) return { error: "Too many attempts. Please wait ten minutes." };
  recent.push(now);
  attempts.set(ip, recent);

  const email = text(form, "email", 120).toLowerCase();
  const password = String(form.get("password") ?? "");
  const generic = { error: "That email or password is not right." };
  if (!email || !password || !adminEmails().includes(email)) return generic;

  const auth = getAuthClient();
  if (!auth) return { error: "Admin sign-in is not set up yet." };
  const { data, error } = await auth.auth.signInWithPassword({ email, password });
  if (error || !data.user) return generic;

  await createSession(email);
  redirect("/admin");
}

export async function signOut() {
  await endSession();
  redirect("/admin/login");
}

/* ───────── Bookings ───────── */

export async function setBookingStatus(form: FormData) {
  await requireAdmin();
  const id = text(form, "id", 60);
  const status = text(form, "status", 20);
  if (!["pending", "confirmed", "done", "cancelled"].includes(status)) return;
  const { data, error } = await db().from("bookings").update({ status }).eq("id", id).select().single();
  if (error || !data) return;
  // tell the customer when the studio confirms or cancels, if they left an email
  if (data.email && (status === "confirmed" || status === "cancelled")) {
    await sendEmail(data.email, status === "confirmed" ? "Your booking is confirmed" : "Your booking was cancelled", customerStatus(data, status));
  }
  redirect(`/admin?view=${text(form, "view", 12) || "upcoming"}`);
}

/* ───────── Opening hours ───────── */

export async function saveHours(_prev: Result, form: FormData): Promise<Result> {
  await requireAdmin();
  const current = await db().from("settings").select("value").eq("key", "hours").maybeSingle();
  const closed = (current.data?.value?.closed ?? []) as Hours["closed"];

  const week: Day[] = [];
  for (let i = 0; i < 7; i++) {
    const from = text(form, `from${i}`, 5);
    const to = text(form, `to${i}`, 5);
    const open = form.get(`open${i}`) === "on";
    if (!/^\d{2}:\d{2}$/.test(from) || !/^\d{2}:\d{2}$/.test(to)) return { error: "Enter every time as hours and minutes." };
    if (open && from >= to) return { error: "A day must close after it opens." };
    week.push({ open, from, to });
  }
  const slotMinutes = Number(text(form, "slotMinutes", 4));
  const capacity = Number(text(form, "capacity", 3));
  const maxDaysAhead = Number(text(form, "maxDaysAhead", 3));
  if (![30, 45, 60, 90, 120].includes(slotMinutes)) return { error: "Choose a slot length from the list." };
  if (!(capacity >= 1 && capacity <= 20)) return { error: "Places per slot must be between 1 and 20." };
  if (!(maxDaysAhead >= 1 && maxDaysAhead <= 60)) return { error: "Days ahead must be between 1 and 60." };

  const { error } = await db().from("settings").upsert({ key: "hours", value: { week, slotMinutes, capacity, maxDaysAhead, closed } });
  if (error) return { error: "Could not save. Please try again." };
  updateTag("site");
  return { ok: "Hours saved. The booking calendar uses them straight away." };
}

export async function addClosedDate(_prev: Result, form: FormData): Promise<Result> {
  await requireAdmin();
  const date = text(form, "date", 10);
  const note = text(form, "note", 60);
  if (!isValidDate(date)) return { error: "Pick a date." };
  const current = await db().from("settings").select("value").eq("key", "hours").maybeSingle();
  const value = current.data?.value ?? defaultHours;
  const closed = [...(value.closed ?? []).filter((c: { date: string }) => c.date !== date), { date, note }].sort((a, b) => a.date.localeCompare(b.date));
  const { error } = await db().from("settings").upsert({ key: "hours", value: { ...value, closed } });
  if (error) return { error: "Could not save. Please try again." };
  updateTag("site");
  return { ok: "Closed day added." };
}

export async function removeClosedDate(form: FormData) {
  await requireAdmin();
  const date = text(form, "date", 10);
  const current = await db().from("settings").select("value").eq("key", "hours").maybeSingle();
  const value = current.data?.value;
  if (!value) return;
  await db()
    .from("settings")
    .upsert({ key: "hours", value: { ...value, closed: (value.closed ?? []).filter((c: { date: string }) => c.date !== date) } });
  updateTag("site");
  redirect("/admin/hours");
}

/* ───────── Services and prices ───────── */

function readService(form: FormData) {
  const grp = text(form, "grp", 40);
  const name = text(form, "name", 80);
  const price = Math.round(Number(text(form, "price", 8)));
  if (!(groups as string[]).includes(grp)) return { error: "Choose a group." } as const;
  if (name.length < 2) return { error: "Enter a service name." } as const;
  if (!Number.isFinite(price) || price < 0 || price > 1_000_000) return { error: "Enter the price as a number." } as const;
  return {
    row: { grp, name, variant: text(form, "variant", 60) || null, price, sort: Math.round(Number(text(form, "sort", 6))) || 0, active: form.get("active") === "on" },
  } as const;
}

export async function saveService(_prev: Result, form: FormData): Promise<Result> {
  await requireAdmin();
  const id = text(form, "id", 30);
  const r = readService(form);
  if ("error" in r) return { error: r.error };
  const { error } = await db().from("services").update(r.row).eq("id", id);
  if (error) return { error: "Could not save." };
  updateTag("site");
  return { ok: "Saved" };
}

export async function addService(_prev: Result, form: FormData): Promise<Result> {
  await requireAdmin();
  const r = readService(form);
  if ("error" in r) return { error: r.error };
  const id = `x${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
  const { error } = await db().from("services").insert({ id, ...r.row, active: true });
  if (error) return { error: "Could not add it." };
  updateTag("site");
  return { ok: "Added" };
}

export async function deleteService(form: FormData) {
  await requireAdmin();
  await db().from("services").delete().eq("id", text(form, "id", 30));
  updateTag("site");
  redirect("/admin/services");
}

/**
 * Copies the studio's price list from the code into the database so it can be edited.
 * It only adds items that are missing, so it never overwrites prices already edited here.
 */
export async function importDefaultMenu() {
  await requireAdmin();
  const rows = defaultServices.map((s, i) => ({ id: s.id, grp: s.group, name: s.name, variant: s.variant ?? null, price: s.price, sort: i, active: true }));
  await db().from("services").upsert(rows, { onConflict: "id", ignoreDuplicates: true });
  updateTag("site");
  redirect("/admin/services");
}

/* ───────── Questions, policy, reviews, alerts ───────── */

/** "Question line, then the answer lines", blocks separated by a blank line. */
function blocks(raw: string, max: number) {
  return raw
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .slice(0, max)
    .map((b) => {
      const [first, ...rest] = b.split("\n");
      return { first: first.trim().slice(0, 160), rest: rest.join(" ").trim().slice(0, 800) };
    })
    .filter((b) => b.first && b.rest);
}

export async function saveContent(_prev: Result, form: FormData): Promise<Result> {
  await requireAdmin();
  const email = text(form, "notify", 120);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "That alert email address does not look right." };

  const faq = blocks(String(form.get("faq") ?? ""), 20).map((b) => ({ q: b.first, a: b.rest }));
  const reviews = blocks(String(form.get("reviews") ?? ""), 12).map((b) => ({ name: b.first, text: b.rest }));
  const policy = { deposit: text(form, "deposit", 400), cancellation: text(form, "cancellation", 400) };

  const { error } = await db()
    .from("settings")
    .upsert([
      { key: "faq", value: faq },
      { key: "reviews", value: reviews },
      { key: "policy", value: policy },
      { key: "notify", value: { email } },
    ]);
  if (error) return { error: "Could not save. Please try again." };
  updateTag("site");
  return { ok: "Saved. The site shows the changes straight away." };
}
