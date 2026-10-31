import { getDb } from "@/lib/db";
import { customerReceipt, sendEmail, studioNotice } from "@/lib/email";
import { slotsFor } from "@/lib/schedule";
import { loadSiteData } from "@/lib/site-data";

// First line of defence, per visitor. Serverless instances do not share memory, so this only slows a casual flood;
// the limits that always hold (per phone number, site-wide, capacity) read the saved bookings further down.
const hits = new Map<string, number[]>();
const limited = (ip: string) => {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
};

const bad = (error: string, status = 400) => Response.json({ ok: false, error }, { status });
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) return bad("Too many requests. Please wait a minute and try again.", 429);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return bad("Invalid request.");
  }

  // a hidden field real visitors never fill in; bots do
  if (clean(body.website, 100)) return Response.json({ ok: true });

  const name = clean(body.name, 80);
  const phone = clean(body.phone, 30);
  const email = clean(body.email, 120);
  const note = clean(body.note, 600);
  const date = clean(body.date, 10);
  const time = clean(body.time, 5);
  const home = body.home === true;
  const ids = Array.isArray(body.serviceIds) ? body.serviceIds.filter((x): x is string => typeof x === "string").slice(0, 30) : [];

  if (name.length < 2) return bad("Please enter your name.");
  const digits = phone.replace(/\D/g, "");
  if (!/^[\d\s+()-]+$/.test(phone) || digits.length < 7 || digits.length > 15) return bad("Please enter a valid mobile number.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad("That email address does not look right.");
  if (ids.length === 0) return bad("Choose at least one service.");

  const site = await loadSiteData();
  const chosen = site.services.filter((s) => ids.includes(s.id));
  if (chosen.length !== new Set(ids).size) return bad("One of the services is no longer available. Please choose again.");
  if (!slotsFor(date, site.hours).includes(time)) return bad("That day or time is not available. Please pick another.");

  const total = chosen.reduce((a, s) => a + s.price, 0);
  const service_names = chosen.map((s) => (s.variant ? `${s.name} (${s.variant.toLowerCase()})` : s.name));

  const db = getDb();
  if (!db) return Response.json({ ok: true, demo: true });

  // Limits that hold across all server instances, because they read the saved bookings.
  const since = new Date(Date.now() - 24 * 3600_000).toISOString();
  const { data: recent, error: recentError } = await db
    .from("bookings")
    .select("phone, date, time, created_at")
    .gte("created_at", since)
    .neq("status", "cancelled")
    .limit(500);
  if (recentError) return bad("Something went wrong on our side. Please call us.", 500);
  const key = (v: string) => v.replace(/\D/g, "").slice(-9);
  const mine = (recent ?? []).filter((r) => key(r.phone) === key(phone));
  if (mine.some((r) => r.date === date && r.time === time)) return bad("We already have a request from this number for that time. We will message you to confirm.", 409);
  if (mine.length >= 3) return bad("There are already a few requests from this number today. Please call us to add more.", 429);
  const lastHour = Date.now() - 3600_000;
  if ((recent ?? []).filter((r) => new Date(r.created_at).getTime() > lastHour).length >= 30) {
    return bad("Online booking is very busy right now. Please call us to book.", 429);
  }

  const { count, error: countError } = await db
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("date", date)
    .eq("time", time)
    .neq("status", "cancelled");
  if (countError) return bad("Something went wrong on our side. Please call us.", 500);
  if ((count ?? 0) >= site.hours.capacity) return bad("Sorry, that time was just taken. Please pick another.", 409);

  const row = { name, phone, email: email || null, note: note || null, home_service: home, service_ids: chosen.map((s) => s.id), service_names, total, date, time };
  const { data: saved, error } = await db.from("bookings").insert(row).select("id").single();
  if (error || !saved) {
    console.error("booking insert failed", error);
    return bad("Something went wrong on our side. Please call us.", 500);
  }

  // Two people can pass the check above at the same moment. Count again now that this one is saved;
  // if the time is over capacity, the later request gives its place up.
  const { data: same } = await db
    .from("bookings")
    .select("id, created_at")
    .eq("date", date)
    .eq("time", time)
    .neq("status", "cancelled")
    .order("created_at")
    .order("id");
  if (same && same.length > site.hours.capacity && !same.slice(0, site.hours.capacity).some((r) => r.id === saved.id)) {
    await db.from("bookings").delete().eq("id", saved.id);
    return bad("Sorry, that time was just taken. Please pick another.", 409);
  }

  // The booking is saved; a failed email must never turn that into an error for the visitor.
  const sent = await Promise.allSettled([
    site.notifyEmail ? sendEmail(site.notifyEmail, `New booking: ${name}`, studioNotice(row)) : false,
    email ? sendEmail(email, "We received your booking request", customerReceipt(row)) : false,
  ]);
  const emailed = sent[1].status === "fulfilled" && sent[1].value === true;
  return Response.json({ ok: true, emailed });
}
