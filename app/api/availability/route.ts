import { getDb } from "@/lib/db";
import { closedReason, slotsFor } from "@/lib/schedule";
import { loadSiteData } from "@/lib/site-data";

// Which start times a day offers and how many places are left in each. Always read fresh.
export async function GET(request: Request) {
  const date = new URL(request.url).searchParams.get("date") ?? "";
  const { hours } = await loadSiteData();

  const reason = closedReason(date, hours);
  if (reason) return Response.json({ date, reason, times: [] });

  const slots = slotsFor(date, hours);
  const taken = new Map<string, number>();
  const db = getDb();
  if (db) {
    const { data, error } = await db.from("bookings").select("time").eq("date", date).neq("status", "cancelled");
    if (error) return Response.json({ error: "Could not check availability" }, { status: 500 });
    for (const r of data) taken.set(r.time, (taken.get(r.time) ?? 0) + 1);
  }
  return Response.json({
    date,
    reason: null,
    times: slots.map((time) => ({ time, left: Math.max(0, hours.capacity - (taken.get(time) ?? 0)) })),
  });
}
