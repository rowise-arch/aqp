"use client";

import { AnimatePresence, animate, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { peso, studio, type Service } from "@/lib/content";
import { addDays, closedReason, label12, manilaNow, type Hours } from "@/lib/schedule";

const TABS: { label: string; match: (s: Service) => boolean }[] = [
  { label: "Cuts and styling", match: (s) => s.group === "Hair" && /haircut|shampoo|ironing|curling/i.test(s.name) },
  { label: "Colour", match: (s) => s.group === "Hair" && /colour|bleach|highlights|balayage/i.test(s.name) },
  { label: "Hair treatments", match: (s) => s.group === "Hair" && !/haircut|shampoo|ironing|curling|colour|bleach|highlights|balayage/i.test(s.name) },
  { label: "Nails", match: (s) => s.group === "Nails" },
  { label: "Brows, lashes and waxing", match: (s) => s.group === "Brows, lashes & waxing" },
];

const STEPS = ["Services", "Date and time", "Your details"] as const;

const subscribeNever = () => () => {};
const todayKey = () => manilaNow().date;

function nextDays(today: string, hours: Hours) {
  const out: { iso: string; dn: string; d: number; m: string; reason: string | null }[] = [];
  const now = manilaNow();
  for (let i = 1; i <= hours.maxDaysAhead; i++) {
    const iso = addDays(today, i);
    const d = new Date(`${iso}T00:00:00Z`);
    out.push({
      iso,
      dn: d.toLocaleDateString("en-PH", { weekday: "short", timeZone: "UTC" }),
      d: d.getUTCDate(),
      m: d.toLocaleDateString("en-PH", { month: "short", timeZone: "UTC" }),
      reason: closedReason(iso, hours, now),
    });
  }
  return out;
}

type Slot = { time: string; left: number };
type Avail = { date: string; times: Slot[]; reason: string | null; error?: boolean };
type Sent = { demo: boolean; emailed: boolean } | null;

const validPhone = (v: string) => /^[\d\s+()-]+$/.test(v.trim()) && v.replace(/\D/g, "").length >= 7 && v.replace(/\D/g, "").length <= 15;
const validEmail = (v: string) => !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

function Total({ value }: { value: number }) {
  const ref = useRef<HTMLElement>(null);
  const prev = useRef(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      el.textContent = peso(value);
      prev.current = value;
      return;
    }
    const c = animate(prev.current, value, {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        el.textContent = peso(Math.round(v));
      },
    });
    prev.current = value;
    return () => c.stop();
  }, [value, reduce]);
  return <strong ref={ref}>{peso(0)}</strong>;
}

export default function Booking({ services, hours }: { services: Service[]; hours: Hours }) {
  const [step, setStep] = useState(0);
  const [tab, setTab] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [day, setDay] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [home, setHome] = useState(false);
  const [note, setNote] = useState("");
  const [trap, setTrap] = useState("");
  const [touched, setTouched] = useState({ name: false, phone: false, email: false });
  const [avail, setAvail] = useState<Avail | null>(null);
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState("");
  const [sent, setSent] = useState<Sent>(null);

  // empty on the server (the date is a visitor-time fact), the real list once on the client
  const today = useSyncExternalStore(subscribeNever, todayKey, () => "");
  const days = useMemo(() => (today ? nextDays(today, hours) : []), [today, hours]);
  const chosen = services.filter((s) => picked.includes(s.id));
  const total = chosen.reduce((a, s) => a + s.price, 0);
  const dayLabel = days.find((d) => d.iso === day);

  const slots = avail?.date === day ? avail : null;
  const loadingTimes = Boolean(day) && !slots;
  const nameOk = name.trim().length >= 2;
  const phoneOk = validPhone(phone);
  const emailOk = validEmail(email);
  const canNext = [chosen.length > 0, Boolean(day && time), nameOk && phoneOk && emailOk][step];

  // which times a day offers and how many places are left, read fresh each time a day is picked
  useEffect(() => {
    if (!day) return;
    const ctl = new AbortController();
    fetch(`/api/availability?date=${day}`, { signal: ctl.signal })
      .then((r) => r.json())
      .then((j) => setAvail({ date: day, times: j.times ?? [], reason: j.reason ?? null, error: Boolean(j.error) }))
      .catch((e) => {
        if (e.name !== "AbortError") setAvail({ date: day, times: [], reason: null, error: true });
      });
    return () => ctl.abort();
  }, [day]);

  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, phone: true, email: true });
    if (!canNext || sending) return;
    setSending(true);
    setFailure("");
    try {
      const r = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceIds: picked, date: day, time, name, phone, email, note, home, website: trap }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) {
        setFailure(j.error || "We could not send your request. Please try again or call us.");
        if (r.status === 409) {
          setTime("");
          setAvail(null);
          setStep(1);
        }
      } else {
        setSent({ demo: Boolean(j.demo), emailed: Boolean(j.emailed) });
      }
    } catch {
      setFailure("We could not reach the studio. Check your connection and try again, or call us.");
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setSent(null);
    setStep(0);
    setPicked([]);
    setDay("");
    setTime("");
    setNote("");
    setAvail(null);
    setFailure("");
    setTouched({ name: false, phone: false, email: false });
  };

  return (
    <section className="book" id="book" aria-labelledby="book-title">
      <div className="bh">
        <p className="label" data-reveal>
          Online booking
        </p>
        <h2 id="book-title" data-reveal>
          Book your <em>visit</em>
        </h2>
      </div>

      <div className="flow">
        {sent ? (
          <div className="sent" role="status">
            <h3>{sent.demo ? "Demo request received" : `Request received, ${name.trim().split(" ")[0]}.`}</h3>
            <p>
              {sent.demo
                ? "This is a demo, so nothing was sent to the studio."
                : `We have your request for ${dayLabel ? `${dayLabel.dn} ${dayLabel.d} ${dayLabel.m}` : "your day"} at ${label12(time)}. It is not confirmed until we message ${phone.trim()}.`}
              {home && !sent.demo ? " We have noted that you would like a home service." : ""}
            </p>
            {sent.emailed ? <p className="muted">A copy is on its way to {email.trim()}.</p> : null}
            <p className="muted">Payment is by {studio.payments}.</p>
            <button className="btn" type="button" onClick={reset} style={{ justifySelf: "start" }}>
              Book another visit
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <div className="steps" role="group" aria-label="Booking steps">
              {STEPS.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  aria-current={step === i ? "step" : undefined}
                  disabled={i > step && !([chosen.length > 0, Boolean(day && time)][i - 1])}
                  onClick={() => setStep(i)}
                >
                  {s}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {step === 0 && (
                  <>
                    <div className="tabs" role="group" aria-label="Service groups">
                      {TABS.map((t, i) => (
                        <button key={t.label} type="button" aria-pressed={tab === i} onClick={() => setTab(i)}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                    <ul className="pick">
                      {services
                        .filter(TABS[tab].match)
                        .map((s) => (
                          <li key={s.id}>
                            <button type="button" aria-pressed={picked.includes(s.id)} onClick={() => toggle(s.id)}>
                              <span className="tick" aria-hidden="true" />
                              <span>
                                {s.name}
                                {s.variant ? <span className="v">, {s.variant.toLowerCase()}</span> : null}
                              </span>
                              <span className="pr">{peso(s.price)}</span>
                            </button>
                          </li>
                        ))}
                    </ul>
                  </>
                )}

                {step === 1 && (
                  <>
                    <div className="days" role="group" aria-label="Choose a day">
                      {days.map((d) => (
                        <button
                          key={d.iso}
                          type="button"
                          aria-pressed={day === d.iso}
                          disabled={Boolean(d.reason)}
                          title={d.reason ?? undefined}
                          onClick={() => {
                            setDay(d.iso);
                            setTime("");
                          }}
                        >
                          <span className="dn">{d.dn}</span>
                          {d.d} {d.m}
                          {d.reason ? <span className="why">Closed</span> : null}
                        </button>
                      ))}
                    </div>
                    {!day ? (
                      <p className="small muted">Pick a day to see the times we have.</p>
                    ) : loadingTimes ? (
                      <p className="small muted" role="status">Checking times…</p>
                    ) : slots?.error ? (
                      <p className="field-error" role="alert">We could not load the times. Please pick the day again, or call us.</p>
                    ) : slots && slots.times.length === 0 ? (
                      <p className="small muted">No times that day. Please pick another.</p>
                    ) : (
                      <div className="times" role="group" aria-label="Choose a time">
                        {slots?.times.map((t) => (
                          <button key={t.time} type="button" aria-pressed={time === t.time} disabled={t.left === 0} onClick={() => setTime(t.time)}>
                            {label12(t.time)}
                            {t.left === 0 ? <span className="why">Full</span> : null}
                          </button>
                        ))}
                      </div>
                    )}
                    <p className="small muted" style={{ marginTop: 16 }}>
                      Later slots suit after-office appointments. The studio confirms every request by message.
                    </p>
                  </>
                )}

                {step === 2 && (
                  <div className="fields">
                    <label>
                      Your name
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                        autoComplete="name"
                        aria-invalid={touched.name && !nameOk}
                        aria-describedby={touched.name && !nameOk ? "err-name" : undefined}
                        required
                      />
                      {touched.name && !nameOk ? <span className="field-error" id="err-name">Please enter your name.</span> : null}
                    </label>
                    <label>
                      Mobile number
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                        autoComplete="tel"
                        inputMode="tel"
                        aria-invalid={touched.phone && !phoneOk}
                        aria-describedby={touched.phone && !phoneOk ? "err-phone" : undefined}
                        required
                      />
                      {touched.phone && !phoneOk ? <span className="field-error" id="err-phone">Use digits only, for example 0918 625 3234.</span> : null}
                    </label>
                    <label>
                      Email, optional (we will send you a copy)
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                        autoComplete="email"
                        aria-invalid={touched.email && !emailOk}
                        aria-describedby={touched.email && !emailOk ? "err-email" : undefined}
                      />
                      {touched.email && !emailOk ? <span className="field-error" id="err-email">That email address does not look right.</span> : null}
                    </label>
                    <label className="hp" aria-hidden="true">
                      Website
                      <input type="text" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
                    </label>
                    <label className="check">
                      <input type="checkbox" checked={home} onChange={(e) => setHome(e.target.checked)} />
                      Come to me (home service)
                    </label>
                    <label>
                      Anything we should know, such as the event or the look you want
                      <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
                    </label>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="nav-row">
              {!canNext && (
                <p className="small muted" id="why-disabled" style={{ width: "100%", margin: 0 }}>
                  {["Choose at least one service to continue.", "Pick a day and a time to continue.", "Add your name and a valid mobile number to send the request."][step]}
                </p>
              )}
              {step > 0 && (
                <button type="button" className="link" style={{ background: "none", border: 0, color: "inherit", font: "inherit", cursor: "pointer" }} onClick={() => setStep(step - 1)}>
                  Back
                </button>
              )}
              {failure ? (
                <p className="field-error" role="alert" style={{ width: "100%", margin: 0 }}>
                  {failure}
                </p>
              ) : null}
              {step < 2 ? (
                <button type="button" className="btn" disabled={!canNext} onClick={() => setStep(step + 1)}>
                  Continue
                </button>
              ) : (
                <button type="submit" className="btn" disabled={!canNext || sending}>
                  {sending ? "Sending…" : "Request this booking"}
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      <aside className="summary" aria-label="Your visit" aria-live="polite">
        <h3>Your visit</h3>
        {chosen.length === 0 ? (
          <p className="muted">Pick at least one service to see your total.</p>
        ) : (
          <ul>
            {chosen.map((s) => (
              <li key={s.id}>
                <span>
                  {s.name}
                  {s.variant ? `, ${s.variant.toLowerCase()}` : ""}
                </span>
                <span>{peso(s.price)}</span>
              </li>
            ))}
          </ul>
        )}
        {day && time ? (
          <p>
            {dayLabel?.dn} {dayLabel?.d} {dayLabel?.m}, {label12(time)}
          </p>
        ) : null}
        <p className="total">
          <span>Total</span>
          <Total value={total} />
        </p>
      </aside>

      <p className="alt small">
        Prefer to talk? Call{" "}
        {studio.phones.map((p, i) => (
          <span key={p.href}>
            {i ? " or " : ""}
            <a className="link" href={p.href}>
              {p.label}
            </a>
          </span>
        ))}
        , or message us on{" "}
        <a className="link" href={studio.facebook} target="_blank" rel="noreferrer">
          Facebook
        </a>
        .
      </p>
    </section>
  );
}
