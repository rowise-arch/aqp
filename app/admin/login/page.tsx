import { redirect } from "next/navigation";
import { authConfigured, getAdmin } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  const ready = authConfigured();
  return (
    <div className="login">
      <h1>Studio admin</h1>
      {ready ? (
        <LoginForm />
      ) : (
        <div className="setup">
          <p>The admin is not set up yet. Add these settings to the site&apos;s environment (Vercel: Project, Settings, Environment Variables), then redeploy:</p>
          <ul>
            <li><code>SUPABASE_URL</code>, <code>SUPABASE_ANON_KEY</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> from the Supabase project (Project Settings, API)</li>
            <li><code>ADMIN_EMAILS</code>: the email addresses allowed to sign in, separated by commas</li>
            <li><code>SESSION_SECRET</code>: a long random phrase (at least 16 characters)</li>
          </ul>
          <p>Then create each admin&apos;s user in Supabase (Authentication, Users, Add user) with the same email and a password.</p>
        </div>
      )}
    </div>
  );
}
