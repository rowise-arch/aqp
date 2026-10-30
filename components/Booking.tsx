"use client";

import { AnimatePresence, animate, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { peso, services, studio, type Service } from "@/lib/content";

const TABS: { label: string; match: (s: Service) => boolean }[] = [
  { label: "Cuts and styling", match: (s) => s.group === "Hair" && /haircut|shampoo|ironing|curling/i.test(s.name) },
  { label: "Colour", match: (s) => s.group === "Hair" && /colour|bleach|highlights|balayage/i.test(s.name) },
  { label: "Hair treatments", match: (s) => s.group === "Hair" && !/haircut|shampoo|ironing|curling|colour|bleach|highlights|balayage/i.test(s.name) },
  { label: "Nails", match: (s) => s.group === "Nails" },
  { label: "Brows, lashes and waxing", match: (s) => s.group === "Brows, lashes & waxing" },
];

const STEPS = ["Services", "Date and time", "Your details"] as const;
const TIMES = ["9:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

const subscribeNever = () => () => {};
const todayKey = () => {
  const n = new Date();
  return `${n.getFullYear()}-${n.getMonth() + 1}-${n.getDate()}`;
};

function nextDays(key: string, count: number) {
  const out: { iso: string; dn: string; d: number; m: string }[] = [];
  const [y, mo, da] = key.split("-").map(Number);
  const now = new Date(y, mo - 1, da);
  for (let i = 1; i <= count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    out.push({
      iso: d.toISOString().slice(0, 10),
      dn: d.toLocaleDateString("en-PH", { weekday: "short" }),
      d: d.getDate(),
      m: d.toLocaleDateString("en-PH", { month: "short" }),
    });
  }
  return out;
}

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

export default function Booking() {
  const [step, setStep] = useState(0);
  const [tab, setTab] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [day, setDay] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [home, setHome] = useState(false);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  // empty on the server (the date is a visitor-time fact), the real list once on the client
  const today = useSyncExternalStore(subscribeNever, todayKey, () => "");
  const days = useMemo(() => (today ? nextDays(today, 14) : []), [today]);
  const chosen = services.filter((s) => picked.includes(s.id));
  const total = chosen.reduce((a, s) => a + s.price, 0);
  const dayLabel = days.find((d) => d.iso === day);

  const canNext = [chosen.length > 0, Boolean(day && time), Boolean(name.trim() && phone.trim().length >= 7)][step];

  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  // Demo only: nothing is sent anywhere yet. Wire this to the studio's inbox or scheduler before launch.
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canNext) return;
    setSent(true);
  };

  const reset = () => {
    setSent(false);
    setStep(0);
    setPicked([]);
    setDay("");
    setTime("");
    setNote("");
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
            <h3>Request received, {name.split(" ")[0]}.</h3>
            <p>
              We will message {phone} to confirm {dayLabel ? `${dayLabel.dn} ${dayLabel.d} ${dayLabel.m}` : "your day"} at {time}.
              {home ? " We have noted that you would like a home service." : ""}
            </p>
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
                        <button key={d.iso} type="button" aria-pressed={day === d.iso} onClick={() => setDay(d.iso)}>
                          <span className="dn">{d.dn}</span>
                          {d.d} {d.m}
                        </button>
                      ))}
                    </div>
                    <div className="times" role="group" aria-label="Choose a time">
                      {TIMES.map((t) => (
                        <button key={t} type="button" aria-pressed={time === t} onClick={() => setTime(t)}>
                          {t}
                        </button>
                      ))}
                    </div>
                    <p className="small muted" style={{ marginTop: 16 }}>
                      Evening slots suit after-office appointments. The studio confirms every request by message.
                    </p>
                  </>
                )}

                {step === 2 && (
                  <div className="fields">
                    <label>
                      Your name
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
                    </label>
                    <label>
                      Mobile number
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" inputMode="tel" required />
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
                  {["Choose at least one service to continue.", "Pick a day and a time to continue.", "Add your name and a mobile number to send the request."][step]}
                </p>
              )}
              {step > 0 && (
                <button type="button" className="link" style={{ background: "none", border: 0, color: "inherit", font: "inherit", cursor: "pointer" }} onClick={() => setStep(step - 1)}>
                  Back
                </button>
              )}
              {step < 2 ? (
                <button type="button" className="btn" disabled={!canNext} onClick={() => setStep(step + 1)}>
                  Continue
                </button>
              ) : (
                <button type="submit" className="btn" disabled={!canNext}>
                  Request this booking
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
            {dayLabel?.dn} {dayLabel?.d} {dayLabel?.m}, {time}
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
