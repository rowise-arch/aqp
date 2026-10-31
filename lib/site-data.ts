import { cacheLife, cacheTag } from "next/cache";
import { services as defaultServices, type Group, type Service } from "@/lib/content";
import { getDb } from "@/lib/db";
import { defaultHours, type Hours } from "@/lib/schedule";

export type Faq = { q: string; a: string };
export type Review = { name: string; text: string };

export type SiteData = {
  services: Service[];
  hours: Hours;
  policy: { deposit: string; cancellation: string };
  faq: Faq[];
  reviews: Review[];
  notifyEmail: string;
  /** False when Supabase is not set up: the site shows sample data and bookings are not stored. */
  live: boolean;
  /** True while that part still shows the built-in sample wording because the studio has not saved its own. */
  sample: { hours: boolean; policy: boolean; faq: boolean };
};

// SAMPLE wording for the studio to confirm or change in the admin.
export const defaultPolicy = {
  deposit: "A small GCash deposit may be asked to hold bridal and event bookings. Regular visits need no deposit.",
  cancellation: "Please tell us at least a day ahead if you need to move or cancel, so we can offer the time to someone else.",
};

export const defaultFaq: Faq[] = [
  {
    q: "Do I need an appointment?",
    a: "Please book ahead. Online booking is open any time, and we confirm every request by message.",
  },
  {
    q: "Do you come to my home?",
    a: "Yes. Tick “Come to me” when you book and tell us the address in the note. Home service is by appointment only.",
  },
  {
    q: "Can I book after office hours?",
    a: "Yes. After-office appointments are available when booked ahead. Pick a late time, or call us to arrange one.",
  },
  {
    q: "How do I pay?",
    a: "By GCash or bank transfer. We send the details when we confirm your booking.",
  },
  {
    q: "How far ahead should I book for a wedding or event?",
    a: "As early as you can. Bridal and event hair and makeup are quoted for each booking, so send the date and the look you want.",
  },
];

const KEYS = ["hours", "policy", "faq", "reviews", "notify"] as const;

/** Reads everything the public site needs. Not cached: the admin and the booking API call this directly. */
export async function loadSiteData(): Promise<SiteData> {
  const base: SiteData = {
    services: defaultServices,
    hours: defaultHours,
    policy: defaultPolicy,
    faq: defaultFaq,
    reviews: [],
    notifyEmail: process.env.NOTIFY_EMAIL ?? "",
    live: false,
    sample: { hours: true, policy: true, faq: true },
  };
  const db = getDb();
  if (!db) return base;

  try {
    const [svc, set] = await Promise.all([
      db.from("services").select("id, grp, name, variant, price, active").order("sort").order("id"),
      db.from("settings").select("key, value").in("key", [...KEYS]),
    ]);
    if (svc.error) throw svc.error;
    if (set.error) throw set.error;

    const out: SiteData = { ...base, live: true, sample: { ...base.sample } };
    if (svc.data.length > 0) {
      out.services = svc.data
        .filter((r) => r.active)
        .map((r) => ({ id: r.id, group: r.grp as Group, name: r.name, variant: r.variant ?? undefined, price: r.price }));
    }
    for (const row of set.data) {
      if (row.key === "hours") {
        out.hours = { ...defaultHours, ...row.value };
        out.sample.hours = false;
      }
      if (row.key === "policy") {
        out.policy = { ...defaultPolicy, ...row.value };
        out.sample.policy = false;
      }
      if (row.key === "faq") {
        out.faq = row.value;
        out.sample.faq = false;
      }
      if (row.key === "reviews") out.reviews = row.value;
      if (row.key === "notify" && row.value?.email) out.notifyEmail = row.value.email;
    }
    return out;
  } catch (e) {
    console.error("site data: falling back to defaults", e);
    return base;
  }
}

/**
 * The public page's copy of the data. Saving in the admin expires the "site" tag at once. Edits made straight
 * in the database (SQL editor, table editor) have no way to tell the site, so the copy also refreshes every 5 minutes.
 */
export async function getSiteData(): Promise<SiteData> {
  "use cache";
  cacheTag("site");
  cacheLife({ stale: 300, revalidate: 300, expire: 3600 });
  return loadSiteData();
}
