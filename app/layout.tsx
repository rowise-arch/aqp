import type { Metadata, Viewport } from "next";
import { studio } from "@/lib/content";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const display = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "AQP Beauty Studio | Hair, nails and makeup in Odiongan",
  description:
    "Hair colour, balayage, nails, lashes and bridal makeup in Odiongan. See the full price list and book online.",
  openGraph: {
    title: "AQP Beauty Studio | Odiongan",
    description: "Hair, nails, lashes and bridal makeup. Full price list and online booking.",
    type: "website",
    locale: "en_PH",
    siteName: "AQP Beauty Studio",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#0e0e0e" };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BeautySalon",
  name: studio.name,
  telephone: "+639186253234",
  paymentAccepted: studio.payments,
  sameAs: [studio.facebook],
  address: {
    "@type": "PostalAddress",
    streetAddress: "Maulion Bldg., ML Quezon Street, Tabing-Dagat",
    addressLocality: "Odiongan",
    addressCountry: "PH",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <noscript>
          <style>{`.preloader{display:none!important}`}</style>
        </noscript>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <a className="skip" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
