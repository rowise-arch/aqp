"use client";

import { useState } from "react";

// The Google map loads only when asked, so the page makes no third-party requests until the visitor wants the map.
export default function LazyMap({ query }: { query: string }) {
  const [on, setOn] = useState(false);
  if (on) {
    return (
      <iframe
        title="Map showing AQP Beauty Studio in Odiongan"
        src={`https://www.google.com/maps?q=${query}&output=embed`}
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }
  return (
    <button type="button" className="map-load" onClick={() => setOn(true)}>
      <span className="label">Map</span>
      <span>Show the map</span>
      <span className="small muted">Loads Google Maps</span>
    </button>
  );
}
