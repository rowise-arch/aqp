"use client";

import { useEffect, useState } from "react";
import { CALM_KEY, isCalm } from "@/lib/calm";

// A visible switch for visitors who prefer less movement. It reloads the page so every effect starts in the right mode.
export default function CalmToggle() {
  const [calm, setCalm] = useState(false);
  useEffect(() => setCalm(isCalm()), []);
  return (
    <button
      type="button"
      className="calm-toggle small"
      aria-pressed={calm}
      onClick={() => {
        try {
          localStorage.setItem(CALM_KEY, calm ? "0" : "1");
        } catch {}
        window.location.reload();
      }}
    >
      Calm motion: {calm ? "on" : "off"}
    </button>
  );
}
