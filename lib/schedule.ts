// Opening hours and slot arithmetic, shared by the booking form (browser) and the booking API (server).
// Dates are plain "YYYY-MM-DD" strings and times are "HH:MM" in 24-hour form, all in Philippine time.

export type Day = { open: boolean; from: string; to: string };

export type Hours = {
  /** Index 0 is Sunday, to match Date.getDay(). */
  week: Day[];
  slotMinutes: number;
  /** How many bookings one time slot can hold (chairs / stylists on shift). */
  capacity: number;
  maxDaysAhead: number;
  closed: { date: string; note?: string }[];
};

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// SAMPLE hours until the studio confirms the real ones in the admin.
export const defaultHours: Hours = {
  week: [
    { open: false, from: "09:00", to: "19:00" },
    { open: true, from: "09:00", to: "19:00" },
    { open: true, from: "09:00", to: "19:00" },
    { open: true, from: "09:00", to: "19:00" },
    { open: true, from: "09:00", to: "19:00" },
    { open: true, from: "09:00", to: "19:00" },
    { open: true, from: "09:00", to: "19:00" },
  ],
  slotMinutes: 60,
  capacity: 2,
  maxDaysAhead: 14,
  closed: [],
};

const TZ = "Asia/Manila";

/** Today's date and the minutes since midnight, in Manila, whatever the visitor's or server's own zone. */
export function manilaNow(now = new Date()) {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const v = (t: string) => p.find((x) => x.type === t)?.value ?? "00";
  return { date: `${v("year")}-${v("month")}-${v("day")}`, minutes: Number(v("hour")) * 60 + Number(v("minute")) };
}

export const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
};

export const fromMinutes = (n: number) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;

/** "13:00" becomes "1:00 PM". */
export function label12(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export function addDays(date: string, n: number) {
  const [y, m, d] = date.split("-").map(Number);
  const x = new Date(Date.UTC(y, m - 1, d + n));
  return x.toISOString().slice(0, 10);
}

export const weekdayOf = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
};

export const isValidDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));

/** Why a day cannot be booked, or null when it can. */
export function closedReason(date: string, hours: Hours, now = manilaNow()): string | null {
  if (!isValidDate(date)) return "Invalid date";
  if (date <= now.date) return date === now.date ? "Same-day bookings: please call" : "Past";
  if (date > addDays(now.date, hours.maxDaysAhead)) return "Too far ahead";
  const special = hours.closed.find((c) => c.date === date);
  if (special) return special.note || "Closed";
  return hours.week[weekdayOf(date)]?.open ? null : "Closed";
}

/** Every start time offered on a day (all of them, whether or not they are already taken). */
export function slotsFor(date: string, hours: Hours, now = manilaNow()): string[] {
  if (closedReason(date, hours, now)) return [];
  const d = hours.week[weekdayOf(date)];
  const out: string[] = [];
  for (let t = toMinutes(d.from); t + hours.slotMinutes <= toMinutes(d.to); t += hours.slotMinutes) out.push(fromMinutes(t));
  return out;
}

/** "Mon to Sat, 9:00 AM to 7:00 PM" style summary rows for the Visit section. */
export function hoursRows(hours: Hours) {
  return [1, 2, 3, 4, 5, 6, 0].map((i) => ({
    day: WEEKDAYS[i],
    text: hours.week[i].open ? `${label12(hours.week[i].from)} to ${label12(hours.week[i].to)}` : "Closed",
    open: hours.week[i].open,
  }));
}
