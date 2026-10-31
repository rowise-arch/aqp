import { studio } from "@/lib/content";
import CalmToggle from "./CalmToggle";
import MapLink from "./MapLink";

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="close">
        <p className="label">Ready when you are</p>
        <h2>
          Your chair is <em>waiting</em>
        </h2>
        <a className="btn" href="#book">
          Book a visit
        </a>
      </div>

      <div className="cols">
        <div>
          <p className="mark">AQP Beauty Studio</p>
          <p className="small muted">Hair, nails, lashes and bridal makeup in Odiongan.</p>
        </div>
        <nav aria-label="Footer">
          <p className="label">Explore</p>
          <ul>
            <li><a href="#services">Services</a></li>
            <li><a href="#work">Recent work</a></li>
            <li><a href="#team">Team</a></li>
            <li><a href="#book">Book online</a></li>
          </ul>
        </nav>
        <address>
          <p className="label">Visit and call</p>
          <p>
            <MapLink>{studio.address}</MapLink>
          </p>
          <p>
            <MapLink>Get directions</MapLink>
          </p>
          <p>
            {studio.phones.map((p, i) => (
              <span key={p.href}>
                {i ? " / " : ""}
                <a href={p.href}>{p.label}</a>
              </span>
            ))}
          </p>
          <p>
            <a href={studio.facebook} target="_blank" rel="noreferrer">
              Facebook
            </a>
          </p>
        </address>
        <div>
          <p className="label">Payment</p>
          <p>{studio.payments}</p>
          <p className="muted">{studio.notes[0]}</p>
        </div>
      </div>

      <p className="legal small muted">
        © AQP Beauty Studio. Demo: photographs from Pexels, team and bios are samples.
      </p>
      <CalmToggle />
    </footer>
  );
}
