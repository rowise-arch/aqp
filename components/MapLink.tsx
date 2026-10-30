"use client";

import { useEffect, useRef } from "react";
import { studio } from "@/lib/content";

// One link for every phone: Apple devices open Apple Maps, everything else opens Google Maps
// (which hands over to the Google Maps app on Android). Until the page loads it is the Google link.
export default function MapLink({ children }: { children: React.ReactNode }) {
  const q = encodeURIComponent(`${studio.address}, Romblon, Philippines`);
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const apple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent) || navigator.platform === "MacIntel";
    if (apple && ref.current) ref.current.href = `https://maps.apple.com/?q=${q}`;
  }, [q]);

  return (
    <a ref={ref} className="maplink" href={`https://www.google.com/maps/search/?api=1&query=${q}`} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}
