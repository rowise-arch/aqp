"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

// A gold ring that trails the pointer and swells over links and buttons, with a small dot that
// follows exactly. The system cursor stays; this only adds to it. Mouse and trackpad only.
export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 768px)");
    if (!fine.matches || !ring.current || !dot.current) return;
    const r = ring.current;
    const d = dot.current;

    gsap.set([r, d], { xPercent: -50, yPercent: -50, x: -100, y: -100 });
    const rx = gsap.quickTo(r, "x", { duration: 0.6, ease: "power3" });
    const ry = gsap.quickTo(r, "y", { duration: 0.6, ease: "power3" });
    const dx = gsap.quickTo(d, "x", { duration: 0.05, ease: "none" });
    const dy = gsap.quickTo(d, "y", { duration: 0.05, ease: "none" });

    let shown = false;
    const move = (e: MouseEvent) => {
      if (!shown) {
        shown = true;
        gsap.set([r, d], { x: e.clientX, y: e.clientY });
        gsap.to([r, d], { opacity: 1, duration: 0.4 });
      }
      rx(e.clientX);
      ry(e.clientY);
      dx(e.clientX);
      dy(e.clientY);
    };

    let over = false;
    const hover = (e: MouseEvent) => {
      const on = !!(e.target as HTMLElement | null)?.closest("a, button, [role='button'], summary, label, input, select, textarea");
      if (on === over) return;
      over = on;
      gsap.to(r, {
        width: on ? 80 : 20,
        height: on ? 80 : 20,
        backgroundColor: on ? "rgba(198, 167, 94, 0.15)" : "rgba(198, 167, 94, 0.4)",
        borderWidth: on ? 1 : 0,
        duration: 0.35,
        ease: "power3.out",
      });
      gsap.to(d, { scale: on ? 0.5 : 1, duration: 0.3 });
    };

    const leave = () => gsap.to([r, d], { opacity: 0, duration: 0.3 }).then(() => (shown = false));

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", hover);
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", hover);
      document.documentElement.removeEventListener("mouseleave", leave);
      gsap.killTweensOf([r, d]);
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden="true" />
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
