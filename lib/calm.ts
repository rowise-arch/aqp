/** The visitor's own "calm motion" choice, kept in this browser. The system's reduced-motion flag is not used on its own,
 * because many Windows PCs report it without the visitor having asked for it. */
export const CALM_KEY = "aqp-calm";
export const isCalm = () => {
  try {
    return localStorage.getItem(CALM_KEY) === "1";
  } catch {
    return false;
  }
};
