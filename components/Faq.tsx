import type { Faq as FaqItem } from "@/lib/site-data";

export default function Faq({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="faq" id="faq" aria-labelledby="faq-title">
      <p className="label" data-reveal>
        Questions
      </p>
      <h2 id="faq-title" data-reveal>
        Before you <em>book</em>
      </h2>
      <div className="qs">
        {items.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
