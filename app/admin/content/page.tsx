import { requireAdmin } from "@/lib/auth";
import { loadSiteData } from "@/lib/site-data";
import { saveContent } from "../actions";
import { ActionForm } from "../forms";

export default async function ContentPage() {
  await requireAdmin();
  const site = await loadSiteData();
  const faq = site.faq.map((f) => `${f.q}\n${f.a}`).join("\n\n");
  const reviews = site.reviews.map((r) => `${r.name}\n${r.text}`).join("\n\n");

  return (
    <>
      <h1>Site content</h1>
      <p className="a-muted">What visitors read in the Visit and Questions sections. Changes appear on the site straight away.</p>

      <ActionForm action={saveContent} submit="Save content" className="a-card a-stack">
        <label>
          Email for new-booking alerts
          <input type="email" name="notify" defaultValue={site.notifyEmail} placeholder="studio@example.com" />
        </label>
        <label>
          Deposit note
          <textarea name="deposit" rows={2} maxLength={400} defaultValue={site.policy.deposit} />
        </label>
        <label>
          Cancellation note
          <textarea name="cancellation" rows={2} maxLength={400} defaultValue={site.policy.cancellation} />
        </label>
        <label>
          Questions and answers
          <textarea name="faq" rows={14} defaultValue={faq} />
          <span className="a-muted">One block per question: the question on the first line, the answer on the next lines. Leave a blank line between questions.</span>
        </label>
        <label>
          Guest reviews (only add real ones)
          <textarea name="reviews" rows={8} defaultValue={reviews} />
          <span className="a-muted">One block per review: the guest&apos;s name on the first line, what they said on the next. Leave empty to show no reviews section.</span>
        </label>
      </ActionForm>
    </>
  );
}
