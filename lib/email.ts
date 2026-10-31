import { label12 } from "@/lib/schedule";

// Email through Resend's HTTP API (no package needed). Without RESEND_API_KEY nothing is sent and the
// booking is still saved, so a missing email setup never loses a booking.
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const emailConfigured = () => Boolean(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, lines: string[]) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) return false;
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a">${lines.map((l) => `<p style="margin:0 0 10px">${esc(l)}</p>`).join("")}</div>`;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "AQP Beauty Studio <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
      }),
    });
    if (!r.ok) console.error("email failed", r.status, await r.text());
    return r.ok;
  } catch (e) {
    console.error("email failed", e);
    return false;
  }
}

export type BookingForEmail = {
  name: string;
  phone: string;
  email?: string | null;
  date: string;
  time: string;
  service_names: string[];
  total: number;
  note?: string | null;
  home_service?: boolean;
};

const when = (b: BookingForEmail) => {
  const [y, m, d] = b.date.split("-").map(Number);
  const day = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-PH", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
  return `${day}, ${label12(b.time)}`;
};
const peso = (n: number) => `₱${n.toLocaleString("en-PH")}`;

export const studioNotice = (b: BookingForEmail) => [
  `New booking request from ${b.name}`,
  `When: ${when(b)}`,
  `Services: ${b.service_names.join(", ")} (${peso(b.total)})`,
  `Phone: ${b.phone}${b.email ? ` | Email: ${b.email}` : ""}`,
  ...(b.home_service ? ["Home service requested."] : []),
  ...(b.note ? [`Note: ${b.note}`] : []),
  "Open the admin page to confirm or change it.",
];

export const customerReceipt = (b: BookingForEmail) => [
  `Hi ${b.name.split(" ")[0]}, we received your request.`,
  `${when(b)}: ${b.service_names.join(", ")} (${peso(b.total)})`,
  "This is not confirmed yet. We will message you to confirm, or to suggest another time.",
];

export const customerStatus = (b: BookingForEmail, status: "confirmed" | "cancelled") =>
  status === "confirmed"
    ? [`Hi ${b.name.split(" ")[0]}, your booking is confirmed.`, `${when(b)}: ${b.service_names.join(", ")} (${peso(b.total)})`, "See you at the studio."]
    : [`Hi ${b.name.split(" ")[0]}, we had to cancel your booking for ${when(b)}.`, "Please message us to find another time."];
