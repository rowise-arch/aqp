import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { label12, manilaNow } from "@/lib/schedule";
import { setBookingStatus } from "./actions";

type Search = Promise<{ view?: string }>;

type Booking = {
  id: string;
  status: "pending" | "confirmed" | "done" | "cancelled";
  name: string;
  phone: string;
  email: string | null;
  note: string | null;
  home_service: boolean;
  service_names: string[];
  total: number;
  date: string;
  time: string;
};

const VIEWS = [
  { id: "upcoming", label: "Upcoming" },
  { id: "pending", label: "Needs an answer" },
  { id: "past", label: "Past and cancelled" },
];

const fmtDate = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-PH", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const peso = (n: number) => `₱${n.toLocaleString("en-PH")}`;

export default async function Bookings({ searchParams }: { searchParams: Search }) {
  await requireAdmin();
  const { view: wanted } = await searchParams;
  const view = VIEWS.find((v) => v.id === wanted)?.id ?? "upcoming";
  const db = getDb();
  const today = manilaNow().date;

  let rows: Booking[] = [];
  if (db) {
    let q = db.from("bookings").select("*");
    if (view === "upcoming") q = q.gte("date", today).in("status", ["pending", "confirmed"]).order("date").order("time");
    else if (view === "pending") q = q.eq("status", "pending").order("date").order("time");
    else q = q.or(`date.lt.${today},status.in.(done,cancelled)`).order("date", { ascending: false }).order("time", { ascending: false }).limit(100);
    const { data } = await q;
    rows = (data ?? []) as Booking[];
  }

  return (
    <>
      <h1>Bookings</h1>
      <div className="a-tabs">
        {VIEWS.map((v) => (
          <Link key={v.id} href={`/admin?view=${v.id}`} aria-current={view === v.id ? "page" : undefined}>
            {v.label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="a-muted">{db ? "Nothing here." : "Connect Supabase to receive bookings."}</p>
      ) : (
        <ul className="bk">
          {rows.map((b) => (
            <li key={b.id} className={`st-${b.status}`}>
              <div className="when">
                <strong>{fmtDate(b.date)}</strong>
                <span>{label12(b.time)}</span>
                <em className="badge">{b.status === "pending" ? "needs an answer" : b.status}</em>
              </div>
              <div className="who">
                <strong>{b.name}</strong>
                <a href={`tel:${b.phone.replace(/[^\d+]/g, "")}`}>{b.phone}</a>
                {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : null}
                {b.home_service ? <span className="badge">home service</span> : null}
              </div>
              <div className="what">
                <p>{b.service_names.join(", ")}</p>
                <p className="total">{peso(b.total)}</p>
                {b.note ? <p className="note">“{b.note}”</p> : null}
              </div>
              <form action={setBookingStatus} className="acts">
                <input type="hidden" name="id" value={b.id} />
                <input type="hidden" name="view" value={view} />
                {b.status === "pending" ? (
                  <button className="a-btn" name="status" value="confirmed">
                    Confirm
                  </button>
                ) : null}
                {b.status === "confirmed" ? (
                  <button className="a-btn" name="status" value="done">
                    Mark done
                  </button>
                ) : null}
                {b.status === "pending" || b.status === "confirmed" ? (
                  <button className="a-btn ghost" name="status" value="cancelled">
                    Cancel
                  </button>
                ) : null}
                {b.status === "cancelled" || b.status === "done" ? (
                  <button className="a-btn ghost" name="status" value="pending">
                    Reopen
                  </button>
                ) : null}
              </form>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
