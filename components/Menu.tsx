import Image from "next/image";
import { groups, peso, photos, services, studio, type Group } from "@/lib/content";

const aside: Record<Group, typeof photos.braid> = {
  Hair: photos.scissors,
  Nails: photos.nailsGold,
  "Brows, lashes & waxing": photos.brow,
};

export default function Menu() {
  return (
    <section className="menu" id="services" aria-labelledby="menu-title">
      <p className="label" data-reveal>
        The price list
      </p>
      <h2 id="menu-title" data-reveal>
        Services <em>and prices</em>
      </h2>

      {groups.map((g) => (
        <div className="group" key={g} id={`services-${g.split(" ")[0].replace(",", "").toLowerCase()}`}>
          <figure>
            <Image src={aside[g].src} width={aside[g].w} height={aside[g].h} alt={aside[g].alt} sizes="(max-width: 900px) 100vw, 30vw" />
          </figure>
          <div className="col">
          <h3>{g}</h3>
          <ul className="rows">
            {services
              .filter((s) => s.group === g)
              .map((s) => (
                <li key={s.id}>
                  <span className="n">{s.name}</span>
                  <span className="v">{s.variant ?? ""}</span>
                  <span className="p">{peso(s.price)}</span>
                </li>
              ))}
          </ul>
          </div>
        </div>
      ))}

      <div className="fine small">
        <p>Bridal and event hair and makeup are quoted for each booking. Tell us the date and the look.</p>
        <p>We accept {studio.payments}.</p>
      </div>
    </section>
  );
}
