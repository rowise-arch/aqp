"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

// A small gold badge carrying the monogram trails the pointer. Over a link it swells; over the
// things that do something it becomes a pill that names the action (Book, Call, Map, Select).
// The system cursor stays; this only adds to it. Mouse and trackpad only.
function labelFor(el: Element): string {
  if (el.matches('a[href="#book"]')) return "Book";
  if (el.matches('a[href^="tel:"]')) return "Call";
  if (el.matches(".maplink")) return "Map";
  if (el.matches("button[aria-pressed]")) return "Select";
  if (el.matches("[data-cursor]")) return (el as HTMLElement).dataset.cursor ?? "";
  return "";
}

export default function Cursor() {
  const badge = useRef<HTMLDivElement>(null);
  const mark = useRef<HTMLImageElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 768px)");
    const b = badge.current;
    const m = mark.current;
    const l = label.current;
    if (!fine.matches || !b || !m || !l) return;

    gsap.set(b, { xPercent: -50, yPercent: -50, x: -100, y: -100 });
    const bx = gsap.quickTo(b, "x", { duration: 0.55, ease: "power3" });
    const by = gsap.quickTo(b, "y", { duration: 0.55, ease: "power3" });

    let shown = false;
    const move = (e: MouseEvent) => {
      if (!shown) {
        shown = true;
        gsap.set(b, { x: e.clientX, y: e.clientY });
        gsap.to(b, { opacity: 1, duration: 0.4 });
      }
      bx(e.clientX);
      by(e.clientY);
    };

    let state = "";
    const apply = (next: string, text: string) => {
      if (next === state) return;
      state = next;
      const ease = "power3.out";
      if (text) {
        l.textContent = text;
        const w = Math.max(76, l.offsetWidth + 40);
        gsap.to(b, { width: w, height: 44, backgroundColor: "rgba(198, 167, 94, 1)", borderColor: "rgba(198, 167, 94, 1)", duration: 0.4, ease });
        gsap.to(m, { opacity: 0, scale: 0.6, duration: 0.2 });
        gsap.to(l, { opacity: 1, duration: 0.3, delay: 0.1 });
      } else {
        const big = next === "swell";
        gsap.to(b, {
          width: big ? 60 : 30,
          height: big ? 60 : 30,
          backgroundColor: big ? "rgba(198, 167, 94, 0.14)" : "rgba(14, 14, 14, 0.55)",
          borderColor: "rgba(198, 167, 94, 0.8)",
          duration: 0.4,
          ease,
        });
        gsap.to(m, { opacity: 1, scale: 1, duration: 0.3, delay: 0.1 });
        gsap.to(l, { opacity: 0, duration: 0.15 });
      }
    };

    const over = (e: MouseEvent) => {
      const t = (e.target as Element | null)?.closest("a, button, [role='button'], summary, label, input, select, textarea, [data-cursor]");
      if (!t) return apply("idle", "");
      const text = labelFor(t);
      apply(text ? `label:${text}` : "swell", text);
    };

    const leave = () => gsap.to(b, { opacity: 0, duration: 0.3 }).then(() => (shown = false));

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      document.documentElement.removeEventListener("mouseleave", leave);
      gsap.killTweensOf([b, m, l]);
    };
  }, []);

  return (
    <div ref={badge} className="cursor-badge" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={mark} className="cursor-mark" src="/logo.png" alt="" width={1024} height={1149} draggable={false} />
      <span ref={label} className="cursor-label" />
    </div>
  );
}
