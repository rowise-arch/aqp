// The studio's own monogram: the client's logo, upscaled and keyed to a transparent background
// (public/logo.png, 1024px wide). Replace the file with a vector master when the studio has one.
type Props = {
  className?: string;
  title?: string;
};

export default function Logo({ className, title = "AQP Beauty Studio" }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src="/logo.png"
      width={1024}
      height={1149}
      alt={title}
      draggable={false}
    />
  );
}
