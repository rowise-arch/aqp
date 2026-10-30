"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { strip } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

// On a wide screen the section pins and the cards travel sideways as you scroll (it follows your own scrolling,
// so it stays on even when the system asks for reduced motion).
// Otherwise it is a plain row: swipe, drag with a mouse, or use the arrows.
export default function Looks() {
  const section = useRef<HTMLElement>(null);
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = ref.current;
    const sec = section.current;
    if (!el || !sec) return;

    let down = false;
    let startX = 0;
    let startL = 0;
    const pd = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      down = true;
      startX = e.clientX;
      startL = el.scrollLeft;
    };
    const pm = (e: PointerEvent) => {
      if (!down) return;
      if (Math.abs(e.clientX - startX) > 4) el.classList.add("dragging");
      el.scrollLeft = startL - (e.clientX - startX);
    };
    const pu = () => {
      down = false;
      el.classList.remove("dragging");
    };
    el.addEventListener("pointerdown", pd);
    window.addEventListener("pointermove", pm);
    window.addEventListener("pointerup", pu);

    const mm = gsap.matchMedia();
    mm.add("(min-width: 901px)", () => {
      sec.classList.add("pinmode");
      const far = () => Math.max(0, el.scrollWidth - window.innerWidth);
      gsap.to(el, {
        x: () => -far(),
        ease: "none",
        scrollTrigger: {
          trigger: sec,
          start: "top top",
          end: () => `+=${far()}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          refreshPriority: 1,
        },
      });
      return () => sec.classList.remove("pinmode");
    });

    return () => {
      mm.revert();
      el.removeEventListener("pointerdown", pd);
      window.removeEventListener("pointermove", pm);
      window.removeEventListener("pointerup", pu);
    };
  }, []);

  const by = (dir: number) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector("li");
    el.scrollBy({ left: dir * ((card?.clientWidth ?? 320) + 24), behavior: "smooth" });
  };

  return (
    <section className="looks" id="work" aria-labelledby="looks-title" ref={section}>
      <div className="head">
        <div>
          <p className="label" data-reveal>
            From the chair
          </p>
          <h2 id="looks-title" data-reveal>
            Recent <em>looks</em>
          </h2>
        </div>
        <div className="arrows" data-reveal>
          <button type="button" onClick={() => by(-1)} aria-label="Previous looks">
            ←
          </button>
          <button type="button" onClick={() => by(1)} aria-label="Next looks">
            →
          </button>
        </div>
      </div>

      <ul className="row" ref={ref} tabIndex={0} aria-label="Photographs, scroll sideways">
        {strip.map(({ photo, title, tag }, i) => (
          <li key={title}>
            <Image
              src={photo.src}
              width={photo.w}
              height={photo.h}
              alt={photo.alt}
              sizes="(max-width: 900px) 72vw, 26vw"
              priority={i < 3}
              draggable={false}
            />
            <div className="cap">
              <p className="label">{tag}</p>
              <p className="t">{title}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
