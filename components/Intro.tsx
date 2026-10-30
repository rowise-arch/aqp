import { promises } from "@/lib/content";

export default function Intro() {
  return (
    <section className="intro" aria-labelledby="intro-title">
      <p className="label" data-reveal>
        The studio
      </p>
      <h2 id="intro-title" data-reveal>
        Every guest, <em>brightest in the room.</em>
      </h2>
      <p className="lede" data-reveal>
        Colour, cuts, nails, lashes and makeup, finished in front of a mirror with good light.
      </p>
      <ul className="promises">
        {promises.map((x) => (
          <li key={x.title} data-reveal>
            <h3>{x.title}</h3>
            <p>{x.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
