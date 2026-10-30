import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main"
      style={{ minHeight: "100svh", display: "grid", placeContent: "center", gap: 24, padding: "var(--m)" }}
    >
      <h1 style={{ fontSize: "var(--step-display, 3rem)", lineHeight: 1 }}>That page isn’t here.</h1>
      <p>The studio is, though.</p>
      <Link className="btn" href="/">
        Back to AQP Beauty Studio
      </Link>
    </main>
  );
}
