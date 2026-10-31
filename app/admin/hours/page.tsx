import { requireAdmin } from "@/lib/auth";
import { WEEKDAYS } from "@/lib/schedule";
import { loadSiteData } from "@/lib/site-data";
import { addClosedDate, removeClosedDate, saveHours } from "../actions";
import { ActionForm } from "../forms";

const ORDER = [1, 2, 3, 4, 5, 6, 0];

export default async function HoursPage() {
  await requireAdmin();
  const { hours, live } = await loadSiteData();

  return (
    <>
      <h1>Opening hours</h1>
      <p className="a-muted">
        The booking calendar only offers the days and times set here.
        {!live ? " These are sample hours until you save your own." : ""}
      </p>

      <ActionForm action={saveHours} submit="Save hours" className="a-card">
        <table className="hrs">
          <thead>
            <tr>
              <th>Day</th>
              <th>Open</th>
              <th>From</th>
              <th>Until</th>
            </tr>
          </thead>
          <tbody>
            {ORDER.map((i) => (
              <tr key={i}>
                <th scope="row">{WEEKDAYS[i]}</th>
                <td>
                  <input type="checkbox" name={`open${i}`} defaultChecked={hours.week[i].open} aria-label={`${WEEKDAYS[i]} open`} />
                </td>
                <td>
                  <input type="time" name={`from${i}`} defaultValue={hours.week[i].from} required aria-label={`${WEEKDAYS[i]} opens`} />
                </td>
                <td>
                  <input type="time" name={`to${i}`} defaultValue={hours.week[i].to} required aria-label={`${WEEKDAYS[i]} closes`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="a-row">
          <label>
            Appointment length
            <select name="slotMinutes" defaultValue={String(hours.slotMinutes)}>
              {[30, 45, 60, 90, 120].map((m) => (
                <option key={m} value={m}>
                  {m} minutes
                </option>
              ))}
            </select>
          </label>
          <label>
            Places per time slot
            <input type="number" name="capacity" min={1} max={20} defaultValue={hours.capacity} required />
          </label>
          <label>
            Days ahead people can book
            <input type="number" name="maxDaysAhead" min={1} max={60} defaultValue={hours.maxDaysAhead} required />
          </label>
        </div>
        <p className="a-muted">Places per time slot is how many customers you can serve at once (chairs or stylists on shift).</p>
      </ActionForm>

      <h2>Closed days</h2>
      <p className="a-muted">Holidays, trainings, days off. Online booking is blocked on these dates.</p>
      <ActionForm action={addClosedDate} submit="Add closed day" className="a-card a-row">
        <label>
          Date
          <input type="date" name="date" required />
        </label>
        <label>
          Reason (optional)
          <input type="text" name="note" maxLength={60} placeholder="Holiday" />
        </label>
      </ActionForm>
      {hours.closed.length > 0 ? (
        <ul className="a-list">
          {hours.closed.map((c) => (
            <li key={c.date}>
              <span>
                {new Date(`${c.date}T00:00:00Z`).toLocaleDateString("en-PH", { weekday: "short", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}
                {c.note ? `, ${c.note}` : ""}
              </span>
              <form action={removeClosedDate}>
                <input type="hidden" name="date" value={c.date} />
                <button className="a-link" type="submit">
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
