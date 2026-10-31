"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Logo from "./Logo";

gsap.registerPlugin(ScrollTrigger);

// Preloader, smooth scroll, section entrances and the category-panel drift.
// Content is visible in the markup; everything here only adds motion on top.
export default function Effects() {
  useEffect(() => {
    const pre = document.querySelector<HTMLElement>(".preloader");
    const seen = sessionStorage.getItem("aqp-seen") === "1";
    let lenis: Lenis | null = null;
    let tick: ((t: number) => void) | null = null;
    let ro: ResizeObserver | null = null;
    let io: IntersectionObserver | null = null;

    const ctx = gsap.context(() => {
      /* ───── Hero entrance, run once the preloader is done ───── */
      const heroIn = () => {
        const E = "expo.out";
        gsap.from(".bar", { opacity: 0, y: -16, duration: 0.9, ease: "power3.out" });
        gsap.from(".hero .eyebrow", { opacity: 0, y: -20, duration: 1, ease: E });
        gsap.from(".hero .ln", { yPercent: 110, duration: 1.2, ease: E, stagger: 0.2, delay: 0.2 });
        gsap.from(".hero .what", { opacity: 0, y: 20, duration: 1.2, ease: E, delay: 0.8 });
        gsap.from(".hero .cta", { opacity: 0, y: 20, duration: 1.2, ease: E, delay: 1 });
        gsap.from("[data-hero]", { opacity: 0, duration: 1.2, delay: 1.6 });

        // the monogram settles in: it eases from slightly larger and turned, then breathes
        gsap.from(".dial .mark", { opacity: 0, scale: 1.12, rotation: -8, duration: 3, ease: E });
        gsap.fromTo(
          ".dial .mark",
          { filter: "brightness(1)" },
          { filter: "brightness(1.25)", duration: 3, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 3 },
        );
      };

      if (pre) {
        if (seen) {
          pre.remove();
          heroIn();
        } else {
          const mark = pre.querySelector("img");
          const tl = gsap.timeline({
            onComplete: () => {
              pre.remove();
              sessionStorage.setItem("aqp-seen", "1");
            },
          });
          // the monogram is revealed bottom to top, then the screen lifts away
          tl.fromTo(mark, { clipPath: "inset(100% 0 0 0)", scale: 0.94 }, { clipPath: "inset(0% 0 0 0)", scale: 1, duration: 0.4, ease: "power3.out" })
            .to(pre, { yPercent: -100, duration: 0.4, ease: "power4.inOut" }, "+=0.02")
            .add(heroIn, "-=0.35");
        }
      }

      // All motion runs whatever the system setting says: many Windows PCs report reduced motion by
      // default, and this demo is meant to be seen with its animation.
      document.documentElement.classList.add("motion");

      /* ───── Smooth scroll ───── */
      {
        lenis = new Lenis({
          duration: 1.6,
          wheelMultiplier: 1,
          touchMultiplier: 2,
          respectReducedMotion: false,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          anchors: { offset: -76 },
        });
        lenis.on("scroll", ScrollTrigger.update);
        tick = (t: number) => lenis?.raf(t * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
      }

      /* ───── Lazy images change the page height; re-measure so no reveal waits at the wrong place ───── */
      let refreshTimer = 0;
      ro = new ResizeObserver(() => {
        window.clearTimeout(refreshTimer);
        refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
      });
      ro.observe(document.body);

      /* ───── Entrances: heading, text, picture, staggered ───── */
      // Nothing is hidden up front: each element is on the page from the start and only fades in
      // as it enters the screen. IntersectionObserver fires however the visitor got there (a reload
      // mid-page, an anchor jump, the End key), so no reveal is ever missed or left hidden.
      const targets = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      io = new IntersectionObserver(
        (entries) => {
          const shown = entries.filter((e) => e.isIntersecting).map((e) => e.target);
          shown.forEach((el, i) => {
            io?.unobserve(el);
            gsap.fromTo(el, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: "expo.out", delay: i * 0.12, overwrite: true });
          });
        },
        { rootMargin: "0px" },
      );
      targets.forEach((el) => io?.observe(el));

      /* ───── Category panels grow and brighten as they arrive ───── */
      gsap.utils.toArray<HTMLElement>(".cat").forEach((cat) => {
        gsap.fromTo(
          cat,
          { scale: 0.95, opacity: 0.3 },
          { scale: 1, opacity: 1, ease: "none", scrollTrigger: { trigger: cat, start: "top bottom", end: "center center", scrub: true } },
        );
      });

      /* ───── The monogram: pinned; scale, turn and fade follow the scroll, facts arrive around it ───── */
      const ov = document.querySelector<HTMLElement>(".overture");
      if (ov) {
        const ring = ov.querySelector("[data-ring]");
        const l1 = ov.querySelector("[data-line1]");
        const l2 = ov.querySelector("[data-line2]");
        const facts = ov.querySelectorAll("[data-fact]");
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: ov, start: "top bottom", end: "bottom top", scrub: true },
        });
        tl.fromTo(ring, { scale: 0.7 }, { scale: 1, duration: 0.4 }, 0)
          .to(ring, { scale: 1.3, duration: 0.4 }, 0.6)
          .fromTo(ring, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0)
          .to(ring, { opacity: 0, duration: 0.2 }, 0.8)
          .fromTo(ring, { rotation: -30 }, { rotation: 30, duration: 1 }, 0)
          .fromTo(facts, { opacity: 0, x: (i: number) => (i % 2 ? 20 : -20) }, { opacity: 1, x: 0, duration: 0.1, stagger: 0.05 }, 0.3)
          .to(facts, { opacity: 0, duration: 0.15 }, 0.8)
          .fromTo(l1, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.1 }, 0.4)
          .to(l1, { opacity: 0, y: -20, duration: 0.1 }, 0.5)
          .fromTo(l2, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.05 }, 0.45)
          .to(l2, { opacity: 0, y: -20, duration: 0.05 }, 0.5);
      }

      /* ───── Category panels: the picture drifts slowly inside its frame ───── */
      gsap.utils.toArray<HTMLElement>("[data-panel]").forEach((panel) => {
        const img = panel.querySelector("img");
        if (!img) return;
        gsap.fromTo(
          img,
          { yPercent: -5 },
          {
            yPercent: 5,
            ease: "none",
            scrollTrigger: { trigger: panel, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
    });

    return () => {
      ctx.revert();
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      document.documentElement.classList.remove("motion");
      ro?.disconnect();
      io?.disconnect();
    };
  }, []);

  return (
    <div className="preloader" aria-hidden="true">
      <Logo title="" sizes="170px" />
    </div>
  );
}
