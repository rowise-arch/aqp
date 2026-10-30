import Image from "next/image";
import { services } from "@/lib/content";

const prices = services.map((s) => s.price);
const low = Math.min(...prices);
const high = Math.max(...prices);
const fmt = (n: number) => `₱${n.toLocaleString("en-PH")}`;

const facts = [
  { label: "On the list", value: `${services.length} prices`, side: "l", y: -90 },
  { label: "Starting at", value: fmt(low), side: "r", y: -90 },
  { label: "Up to", value: fmt(high), side: "l", y: 100 },
  { label: "Pay by", value: "GCash or bank", side: "r", y: 100 },
];

// The monogram turns, grows and fades as the page scrolls, with the price facts arriving around it.
export default function Overture() {
  return (
    <section className="overture" aria-labelledby="overture-title">
      <div className="stage">
        <div className="mirror" data-ring aria-hidden="true">
          <Image className="mark" src="/brand/aqp-monogram.jpg" alt="" width={1600} height={1600} sizes="(max-width: 700px) 78vw, 520px" />
        </div>

        <ul className="facts">
          {facts.map((f) => (
            <li key={f.label} data-fact data-side={f.side} style={{ ["--fy" as string]: `${f.y}px` }}>
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
