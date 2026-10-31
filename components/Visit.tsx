import { studio } from "@/lib/content";
import { hoursRows, type Hours } from "@/lib/schedule";
import type { Review } from "@/lib/site-data";
import LazyMap from "./LazyMap";
import MapLink from "./MapLink";
import SampleNote from "./SampleNote";

type Props = {
  hours: Hours;
  policy: { deposit: string; cancellation: string };
  reviews: Review[];
  sample: { hours: boolean; policy: boolean };
};

// Where we are, when we are open, and the two things people ask before booking: deposit and cancelling.
export default function Visit({ hours, policy, reviews, sample }: Props) {
  const q = encodeURIComponent(`${studio.address}, Romblon, Philippines`);
  const rows = hoursRows(hours);
  const closedDates = hours.closed.filter((c) => c.date >= new Date().toISOString().slice(0, 10)).slice(0, 4);

  return (
    <section className="visit" id="visit" aria-labelledby="visit-title">
      <p className="label" data-reveal>
        Find us
      </p>
      <h2 id="visit-title" data-reveal>
        Visit the <em>studio</em>
      </h2>

      <div className="visit-grid">
        <div className="info">
          <h3>Opening hours</h3>
          <dl className="hours">
            {rows.map((r) => (
              <div key={r.day} className={r.open ? "" : "off"}>
                <dt>{r.day}</dt>
                <dd>{r.text}</dd>
              </div>
            ))}
          </dl>
          {sample.hours ? <SampleNote>Sample hours, to be confirmed. Please call before you come.</SampleNote> : null}
          {closedDates.length > 0 ? (
            <p className="small muted">
              Closed on {closedDates.map((c) => new Date(`${c.date}T00:00:00Z`).toLocaleDateString("en-PH", { day: "numeric", month: "short", timeZone: "UTC" }) + (c.note ? ` (${c.note})` : "")).join(", ")}.
            </p>
          ) : null}
          <p className="small muted">Home service and after-office appointments are available when booked ahead.</p>

          <h3>Address</h3>
          <p>
            <MapLink>{studio.address}</MapLink>
          </p>

          <h3>Good to know</h3>
          <p>{policy.deposit}</p>
          <p>{policy.cancellation}</p>
          {sample.policy ? <SampleNote>Sample wording, to be confirmed by the studio.</SampleNote> : null}
        </div>

        <div className="map">
          <LazyMap query={q} />
        </div>
      </div>

      {reviews.length > 0 ? (
        <ul className="reviews" aria-label="What guests say">
          {reviews.map((r) => (
            <li key={r.name + r.text.slice(0, 12)}>
              <blockquote>{r.text}</blockquote>
              <p className="label">{r.name}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
