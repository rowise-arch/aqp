import Image from "next/image";
import { team } from "@/lib/content";

export default function Team() {
  return (
    <section className="team" id="team" aria-labelledby="team-title">
      <div className="head">
        <p className="label" data-reveal>
          The people
        </p>
        <h2 id="team-title" data-reveal>
          Meet the <em>team</em>
        </h2>
      </div>
      <ul className="list">
        {team.map((t) => (
          <li key={t.name} data-reveal>
            <Image src={t.photo.src} width={t.photo.w} height={t.photo.h} alt={t.photo.alt} sizes="(max-width: 900px) 72vw, 22vw" />
            <h3>{t.name}</h3>
            <p className="label">
              {t.role}
            </p>
            <p className="bio">
              {t.bio}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
