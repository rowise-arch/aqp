# AQP Beauty Studio: demo site

Next.js 16 · Tailwind 4 · GSAP + ScrollTrigger · Lenis · Framer Motion

    npm install
    npm run dev          # http://localhost:3000
    npm run build && npm start

Content (copy, prices, team, photo list): `lib/content.ts`
Photos: `public/photos/` (Pexels placeholders, see ../assets/photo-manifest.md)
Logo: `public/logo.png` (enhanced from the client's original)

Before launch: replace placeholder photos, team and bios; connect the booking form
(`components/Booking.tsx`, `submit`) to the studio's inbox or scheduler; confirm opening hours.

## Bookings and admin

Online booking, email alerts and the studio admin (`/admin`) need a free Supabase project and optional Resend account. See [ADMIN-SETUP.md](./ADMIN-SETUP.md). Without them the site runs in demo mode.
