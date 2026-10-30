"use client";

import { useEffect, useRef, useState } from "react";

// The studio reel: a muted, silent loop that plays only while it is on screen.
// It autoplays even when the system asks for reduced motion (it is a quiet loop, and the visitor
// can stop it with the pause button); the page's scroll animations still honour that setting.
export default function Reel() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const wanted = useRef(true); // false once the visitor has paused it themselves

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && wanted.current) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(v);

    const on = () => setPlaying(true);
    const off = () => setPlaying(false);
    v.addEventListener("play", on);
    v.addEventListener("pause", off);
    return () => {
      io.disconnect();
      v.removeEventListener("play", on);
      v.removeEventListener("pause", off);
    };
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      wanted.current = true;
      v.play().catch(() => {});
    } else {
      wanted.current = false;
      v.pause();
    }
  };

  return (
    <section className="reel" aria-labelledby="reel-title">
      <p className="label" data-reveal>
        Behind the mirror
      </p>
      <h2 id="reel-title" data-reveal>
        The studio, <em>in motion</em>
      </h2>
      <figure data-reveal>
        <video
          ref={ref}
          src="/video/aqp-reel.mp4"
          poster="/video/aqp-reel-poster.jpg"
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="A looping reel of hair colour, nails, lashes and event makeup at AQP Beauty Studio"
        />
        <button type="button" className="reel-toggle small" onClick={toggle} aria-pressed={!playing}>
          {playing ? "Pause video" : "Play video"}
        </button>
      </figure>
    </section>
  );
}
