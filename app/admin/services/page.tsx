import { groups } from "@/lib/content";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { addService, deleteService, importDefaultMenu, saveService } from "../actions";
import { ActionForm } from "../forms";

type Row = { id: string; grp: string; name: string; variant: string | null; price: number; sort: number; active: boolean };

function Fields({ row }: { row?: Row }) {
  return (
    <>
      <label>
        Group
        <select name="grp" defaultValue={row?.grp ?? groups[0]}>
          {groups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </label>
      <label>
        Service
        <input type="text" name="name" defaultValue={row?.name} maxLength={80} required />
      </label>
      <label>
        Variant (optional)
        <input type="text" name="variant" defaultValue={row?.variant ?? ""} maxLength={60} placeholder="Women, long" />
      </label>
      <label>
        Price (₱)
        <input type="number" name="price" min={0} step={1} defaultValue={row?.price} required />
      </label>
      <label>
        Order
        <input type="number" name="sort" defaultValue={row?.sort ?? 999} />
      </label>
    </>
  );
}

export default async function ServicesPage() {
  await requireAdmin();
  const db = getDb();
  let rows: Row[] = [];
  if (db) {
    const { data } = await db.from("services").select("id, grp, name, variant, price, sort, active").order("sort").order("id");
    rows = (data ?? []) as Row[];
  }

  return (
    <>
      <h1>Services and prices</h1>
      <p className="a-muted">Changes show on the price list, the booking form and the section totals straight away. Untick “Shown” to hide a service without deleting it.</p>

      {db && groups.some((g) => !rows.some((r) => r.grp === g)) ? (
        <form action={importDefaultMenu} className="a-card">
          <p>
            {rows.length === 0
              ? "The price list is not in the database yet. Copy the studio's price list in, then edit it here."
              : "Part of the price list is missing from the database, so the website is only showing what is here. Add the missing items back."}
          </p>
          <button className="a-btn" type="submit">
            {rows.length === 0 ? "Import the current price list" : "Add the missing price-list items"}
          </button>
        </form>
      ) : null}

      <h2>Add a service</h2>
      <ActionForm action={addService} submit="Add service" className="a-card a-row">
        <Fields />
      </ActionForm>

      {groups.map((g) => {
        const list = rows.filter((r) => r.grp === g);
        if (list.length === 0) return null;
        return (
          <section key={g}>
            <h2>{g}</h2>
            <ul className="svc">
              {list.map((r) => (
                <li key={r.id}>
                  <ActionForm action={saveService} submit="Save" className="a-row compact">
                    <input type="hidden" name="id" value={r.id} />
                    <Fields row={r} />
                    <label className="check">
                      <input type="checkbox" name="active" defaultChecked={r.active} />
                      Shown
                    </label>
                  </ActionForm>
                  <form action={deleteService}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="a-link" type="submit">
                      Delete
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}
