/** The visitor's "calm motion" choice. An explicit choice made with the on-page switch (kept in this browser) always wins;
 * with no choice yet, the system's reduced-motion setting decides. */
export const CALM_KEY = "aqp-calm";
export const isCalm = () => {
  try {
    const saved = localStorage.getItem(CALM_KEY);
    if (saved === "1") return true;
    if (saved === "0") return false;
  } catch {
    // storage blocked: fall through to the system setting
  }
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};
