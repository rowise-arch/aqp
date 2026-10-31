import Image from "next/image";

// The studio's own monogram: the client's logo, keyed to a transparent background (public/logo.png, 480px wide).
// Replace the file with a vector master when the studio has one. next/image serves it as a small WebP.
type Props = {
  className?: string;
  title?: string;
  /** How wide it is drawn, so the browser fetches the right size. */
  sizes?: string;
};

export default function Logo({ className, title = "AQP Beauty Studio", sizes = "48px" }: Props) {
  return <Image className={className} src="/logo.png" width={480} height={539} sizes={sizes} alt={title} draggable={false} loading="eager" />;
}
