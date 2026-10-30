import Image from "next/image";
import { categories } from "@/lib/content";

export default function Categories() {
  return (
    <section className="cats" aria-label="What we do">
      {categories.map((c, i) => (
        <article className={i % 2 ? "cat flip" : "cat"} key={c.id}>
          <div className="pic" data-panel>
            <Image src={c.photo.src} width={c.photo.w} height={c.photo.h} alt={c.photo.alt} sizes="(max-width: 900px) 100vw, 60vw" />
          </div>
          <div className="txt">
            <p className="label" data-reveal>
              {c.tag}
            </p>
            <h2 data-reveal>{c.title}</h2>
            <p className="line" data-reveal>
              {c.line}
            </p>
            <a className="btn-wipe" href={c.href} data-reveal>
              <span>{c.cta}</span>
            </a>
          </div>
        </article>
      ))}
    </section>
  );
}
