import { services } from "@/lib/content";

const prices = services.map((s) => s.price);
const low = Math.min(...prices);
const high = Math.max(...prices);
const fmt = (n: number) => `₱${n.toLocaleString("en-PH")}`;

const facts = [
  { label: "On the list", value: `${services.length} prices`, x: -170, y: -110 },
  { label: "Starting at", value: fmt(low), x: 150, y: -90 },
  { label: "Up to", value: fmt(high), x: -180, y: 120 },
  { label: "Pay by", value: "GCash or bank", x: 150, y: 140 },
];

// A vanity mirror drawn as a dial: its bulbs light one after another as the page scrolls.
export default function Overture() {
  return (
    <section className="overture" aria-labelledby="overture-title">
      <div className="stage">
        <div className="mirror" data-ring aria-hidden="true">
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.3">
            <circle cx="50" cy="50" r="48" strokeDasharray="1 3" opacity="0.4" />
            <circle cx="50" cy="50" r="40" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="33" strokeDasharray="4 2" />
            <circle cx="50" cy="50" r="22" strokeWidth="0.2" opacity="0.5" />
            {Array.from({ length: 24 }, (_, i) => {
              const a = (i / 24) * Math.PI * 2;
              return <circle className="bulb" key={i} cx={50 + Math.sin(a) * 44} cy={50 - Math.cos(a) * 44} r="1.6" fill="currentColor" stroke="none" />;
            })}
            <path d="M50 15 L50 50 L82 50" strokeWidth="1" stroke="var(--accent)" />
            <circle cx="50" cy="50" r="2.4" fill="var(--ink)" stroke="none" />
            <g className="orbit a">
              <circle cx="30" cy="30" r="10" strokeDasharray="1 1" opacity="0.5" />
            </g>
            <g className="orbit b">
              <circle cx="72" cy="66" r="14" strokeDasharray="2 2" opacity="0.5" />
              <circle cx="72" cy="66" r="3" strokeWidth="0.5" />
            </g>
          </svg>
        </div>

        <ul className="facts">
          {facts.map((f) => (
            <li key={f.label} data-fact style={{ ["--fx" as string]: `${f.x}px`, ["--fy" as string]: `${f.y}px` }}>
              <span className="tick" aria-hidden="true" />
              <p className="label">{f.label}</p>
              <p className="v">{f.value}</p>
            </li>
          ))}
        </ul>

        <div className="copy">
          <h2 id="overture-title" data-line1>
            {services.length} prices, <em>all listed.</em>
          </h2>
          <p className="label" data-line2>
            Every price on the page
          </p>
        </div>
      </div>
    </section>
  );
}
