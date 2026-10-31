import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getAdmin } from "@/lib/auth";
import { dbConfigured } from "@/lib/db";
import { signOut } from "./actions";
import "./admin.css";

export const metadata: Metadata = {
  title: "Studio admin",
  robots: { index: false, follow: false },
};

async function Shell({ children }: { children: React.ReactNode }) {
  const email = await getAdmin();
  if (!email) return <div className="admin">{children}</div>;
  return (
    <div className="admin">
      <header className="a-head">
        <strong>AQP admin</strong>
        <nav aria-label="Admin">
          <Link href="/admin">Bookings</Link>
          <Link href="/admin/hours">Hours</Link>
          <Link href="/admin/services">Services</Link>
          <Link href="/admin/content">Content</Link>
          <Link href="/" target="_blank">View site</Link>
        </nav>
        <form action={signOut}>
          <span className="who">{email}</span>
          <button className="a-link" type="submit">Sign out</button>
        </form>
      </header>
      {!dbConfigured() ? <p className="a-error">Supabase is not connected, so nothing here can be saved.</p> : null}
      {children}
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="admin"><p>Loading…</p></div>}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
