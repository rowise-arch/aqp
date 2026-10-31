import Image from "next/image";

export default function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="dial" aria-hidden="true">
        <Image className="mark" src="/brand/aqp-monogram.jpg" alt="" width={1600} height={1600} loading="eager" fetchPriority="high" sizes="(max-width: 900px) 150vw, 1280px" />
      </div>

      <div className="hero-body">
        <div className="eyebrow">
          <span className="rule" />
          <p className="label">Hair · Nails · Lashes · Bridal</p>
        </div>
        <h1 id="hero-title">
          <span className="mask">
            <span className="ln">AQP Beauty</span>
          </span>
          <span className="mask">
            <span className="ln">
              <em>Studio</em>
            </span>
          </span>
        </h1>
        <p className="what">
          Hair colour, nails, lashes and bridal makeup in Odiongan. See every price, then book online.
        </p>
        <div className="cta">
          <a className="btn" href="#book">
            Book a visit
          </a>
          <a className="textlink" href="#services">
            See prices
          </a>
        </div>
      </div>

      <a className="scroll" href="#work" aria-label="Scroll to recent work" data-hero>
        <span>Scroll</span>
      </a>
    </section>
  );
}
