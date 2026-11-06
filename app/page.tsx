"use client";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
type Employee = { id: string; name: string; department: string | null };
type Asset = {
  id: string;
  asset_tag: string;
  asset_type: string;
  brand_model: string;
  serial_number: string | null;
  purchase_date: string | null;
  warranty_expiry: string | null;
  condition: string;
  location: string | null;
  assigned_employee_id: string | null;
  status: string;
  notes: string | null;
  employees: Employee | null;
};
type Log = {
  id: string;
  asset_id: string;
  log_type: string;
  description: string | null;
  logged_date: string;
};
const empty = {
  asset_tag: "",
  asset_type: "Laptop",
  brand_model: "",
  serial_number: "",
  purchase_date: "",
  warranty_expiry: "",
  condition: "good",
  location: "",
  notes: "",
};
export default function Home() {
  const db = useMemo(() => createClient(), []);
  const [assets, setAssets] = useState<Asset[]>([]),
    [people, setPeople] = useState<Employee[]>([]),
    [logs, setLogs] = useState<Log[]>([]),
    [busy, setBusy] = useState(true),
    [notice, setNotice] = useState(""),
    [q, setQ] = useState(""),
    [status, setStatus] = useState("all"),
    [type, setType] = useState("all"),
    [location, setLocation] = useState("all"),
    [view, setView] = useState("dashboard"),
    [edit, setEdit] = useState<Asset | null | undefined>(undefined),
    [detail, setDetail] = useState<Asset | null>(null),
    [f, setF] = useState(empty);
  async function load() {
    setBusy(true);
    const [a, p, l] = await Promise.all([
      db
        .from("assets")
        .select("*, employees(id,name,department)")
        .order("created_at", { ascending: false }),
      db.from("employees").select("id,name,department").order("name"),
      db
        .from("maintenance_logs")
        .select("*")
        .order("logged_date", { ascending: false }),
    ]);
    if (a.error || p.error || l.error)
      setNotice(
        a.error?.message ||
          p.error?.message ||
          l.error?.message ||
          "Database error",
      );
    else {
      setAssets(a.data as Asset[]);
      setPeople(p.data as Employee[]);
      setLogs(l.data as Log[]);
    }
    setBusy(false);
  }
  useEffect(() => {
    load();
  }, []);
  const expired = (a: Asset) =>
    !!a.warranty_expiry &&
    new Date(a.warranty_expiry + "T00:00:00") < new Date();
  const list = assets.filter(
    (a) =>
      (status === "all" || a.status === status) &&
      (type === "all" || a.asset_type === type) &&
      (location === "all" || a.location === location) &&
      [
        a.asset_tag,
        a.brand_model,
        a.serial_number,
        a.location,
        a.employees?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  const attention = assets.filter(
    (a) =>
      a.status === "under_repair" ||
      a.condition === "poor" ||
      a.condition === "defective" ||
      expired(a),
  );
  function newAsset() {
    setEdit(null);
    setF(empty);
    setNotice("");
  }
  function editing(a: Asset) {
    setEdit(a);
    setDetail(null);
    setF({
      asset_tag: a.asset_tag,
      asset_type: a.asset_type,
      brand_model: a.brand_model,
      serial_number: a.serial_number || "",
      purchase_date: a.purchase_date || "",
      warranty_expiry: a.warranty_expiry || "",
      condition: a.condition,
      location: a.location || "",
      notes: a.notes || "",
    });
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!f.asset_tag || !f.brand_model)
      return setNotice("Asset tag and brand/model are required.");
    const data = {
      ...f,
      serial_number: f.serial_number || null,
      purchase_date: f.purchase_date || null,
      warranty_expiry: f.warranty_expiry || null,
      location: f.location || null,
      notes: f.notes || null,
    };
    const r = edit
      ? await db.from("assets").update(data).eq("id", edit.id)
      : await db.from("assets").insert(data);
    if (r.error) return setNotice(r.error.message);
    setEdit(undefined);
    setNotice("Asset saved.");
    load();
  }
  async function assign(a: Asset, id: string) {
    if (!id) return;
    const r = await db
      .from("assets")
      .update({ assigned_employee_id: id, status: "assigned" })
      .eq("id", a.id);
    if (r.error) setNotice(r.error.message);
    else {
      setDetail(null);
      setNotice("Asset assigned.");
      load();
    }
  }
  async function change(a: Asset, next: "available" | "under_repair") {
    const r = await db
      .from("assets")
      .update(
        next === "available"
          ? { status: "available", assigned_employee_id: null }
          : { status: "under_repair" },
      )
      .eq("id", a.id);
    if (r.error) return setNotice(r.error.message);
    if (next === "under_repair") {
      const description =
        window.prompt("Repair note:", "Sent for repair") || "Sent for repair";
      await db
        .from("maintenance_logs")
        .insert({ asset_id: a.id, log_type: "repair", description });
    }
    setDetail(null);
    setNotice(
      next === "available"
        ? "Returned and available."
        : "Sent for repair; history logged.",
    );
    load();
  }
  async function del(a: Asset) {
    if (!confirm(`Delete ${a.asset_tag}?`)) return;
    const r = await db.from("assets").delete().eq("id", a.id);
    if (r.error) setNotice(r.error.message);
    else {
      setDetail(null);
      setNotice("Asset deleted.");
      load();
    }
  }
  return (
    <main className="app">
      <aside>
        <b>
          <i>⌘</i>AssetFlow
        </b>
        <nav>
          {[
            ["dashboard", "▦", "Dashboard"],
            ["assets", "▣", "Assets"],
            ["employees", "♙", "Employees"],
            ["maintenance", "⚒", "Maintenance"],
          ].map(([item, icon, label]) => <button key={item} className={view === item ? "on" : ""} onClick={() => setView(item)}><i>{icon}</i>{label}</button>)}
        </nav>
        <small>
          SELANGOR PROPERTIES
          <br />
          IT OPERATIONS
        </small>
      </aside>
      <section>
        <header>
          <div><em>SPB IT OPERATIONS · {view.toUpperCase()}</em><h1>{view === "assets" ? "Asset register" : view === "dashboard" ? "Dashboard overview" : view === "employees" ? "Employees" : "Maintenance logs"}</h1><p>{view === "assets" ? "Search, register and manage every IT asset." : view === "employees" ? "Review people and their currently assigned assets." : view === "dashboard" ? "A live view of SPB IT infrastructure and its follow-ups." : "Asset repairs and service history."}</p></div>
          {view === "assets" && <button onClick={newAsset}>+ Register asset</button>}
        </header>
        {notice && (
          <div className="notice">
            {notice}
            <span onClick={() => setNotice("")}>×</span>
          </div>
        )}
        {view === "dashboard" && <><div className="stats">
          <Card t="Total assets" n={assets.length} icon="▣" />
          <Card
            t="Assigned"
            n={assets.filter((x) => x.status === "assigned").length} icon="♙"
          />
          <Card
            t="Available"
            n={assets.filter((x) => x.status === "available").length} icon="✓"
          />
          <Card
            t="Under repair"
            n={assets.filter((x) => x.status === "under_repair").length} icon="⚒"
          />
          <Card t="Warranty expired" n={assets.filter(expired).length} icon="!" />
        </div></>}
        {view === "assets" && <div className="panel">
          <div className="title">
            <div>
              <h2>Asset register</h2>
              <p>Changes are saved to the live register.</p>
            </div>
            <button className="plain" onClick={load}>
              Refresh
            </button>
          </div>
          <div className="filters">
            <input
              placeholder="Search tag, serial, model, location or employee"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="available">Available</option>
              <option value="assigned">Assigned</option>
              <option value="under_repair">Under repair</option>
            </select>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="all">All types</option>
              {[...new Set(assets.map((a) => a.asset_type))].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="all">All locations</option>
              {[...new Set(assets.map((a) => a.location).filter(Boolean))].map(
                (x) => (
                  <option key={x}>{x}</option>
                ),
              )}
            </select>
          </div>
          {busy ? (
            <p className="state">Loading assets…</p>
          ) : list.length === 0 ? (
            <p className="state">No assets found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Assigned to</th>
                  <th>Location</th>
                  <th>Condition</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {list.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <a onClick={() => setDetail(a)}>
                        <b>{a.asset_tag}</b>
                        <small>
                          {a.brand_model} · {a.serial_number || "No serial"}
                        </small>
                      </a>
                      {expired(a) && <mark>Warranty expired</mark>}
                    </td>
                    <td>
                      {a.employees ? (
                        <>
                          <b>{a.employees.name}</b>
                          <small>{a.employees.department}</small>
                        </>
                      ) : (
                        <small>Unassigned</small>
                      )}
                    </td>
                    <td>{a.location || "—"}</td>
                    <td>
                      <Tag v={a.condition} />
                    </td>
                    <td>
                      <Tag v={a.status} />
                    </td>
                    <td>
                      <button className="plain" onClick={() => editing(a)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>}
        {view === "dashboard" && <div className="cols">
          <div className="panel employee-preview">
            <div className="title">
              <div>
                <h2>Needs attention</h2>
                <p>Repair, condition and warranty follow-up.</p>
              </div>
            </div>
            {attention.length ? (
              attention.map((a) => (
                <a className="row" key={a.id} onClick={() => setDetail(a)}>
                  <i />{" "}
                  <span>
                    <b>
                      {a.asset_tag} · {a.brand_model}
                    </b>
                    <small>
                      {a.status === "under_repair"
                        ? "Under repair"
                        : expired(a)
                          ? "Warranty expired"
                          : `Condition: ${a.condition}`}
                    </small>
                  </span>
                </a>
              ))
            ) : (
              <p className="state">Everything looks good.</p>
            )}
          </div>
          <div className="panel dashboard-summary">
            <div className="title">
              <div>
                <h2>Asset status</h2>
                <p>Current distribution across the register.</p>
              </div>
            </div>
            <div className="status-summary">
              <strong>{assets.length ? Math.round((assets.filter(x => x.status === "assigned").length / assets.length) * 100) : 0}%</strong>
              <span>of registered assets are assigned</span>
              <div><b style={{width: `${assets.length ? (assets.filter(x => x.status === "assigned").length / assets.length) * 100 : 0}%`}} /></div>
              <small>{assets.filter(x => x.status === "available").length} available · {assets.filter(x => x.status === "under_repair").length} under repair</small>
            </div>
          </div>
        </div>}
        {view === "employees" && <div className="panel employee-directory">{people.filter(p => assets.some(a => a.assigned_employee_id === p.id)).map((p) => { const assigned = assets.filter(a => a.assigned_employee_id === p.id); return <div className="row" key={p.id}><i>{p.name.split(" ").map(x => x[0]).join("").slice(0,3)}</i><span><b>{p.name}</b><small>{p.department || "No department"} · {assigned.length} assigned asset{assigned.length === 1 ? "" : "s"}</small><small className="assigned-list">{assigned.map(a => a.asset_tag).join(", ")}</small></span></div>})}</div>}
        {view === "maintenance" && <div className="panel maintenance-list">{logs.map((l) => { const asset = assets.find(a => a.id === l.asset_id); return <div className="log" key={l.id}><Tag v={l.log_type}/><span><b>{asset?.asset_tag || "Asset removed"}</b>{l.description}</span><small>{l.logged_date}</small></div>})}</div>}
        {edit !== undefined && (
          <div className="modal">
            <form onSubmit={save}>
              <div className="title">
                <h2>{edit ? "Edit asset" : "Register asset"}</h2>
                <button
                  className="x"
                  type="button"
                  onClick={() => setEdit(undefined)}
                >
                  ×
                </button>
              </div>
              <div className="form">
                <Input
                  l="Asset tag *"
                  v={f.asset_tag}
                  set={(v) => setF({ ...f, asset_tag: v })}
                />
                <label>
                  Type *
                  <select
                    value={f.asset_type}
                    onChange={(e) => setF({ ...f, asset_type: e.target.value })}
                  >
                    {[
                      "Laptop",
                      "Monitor",
                      "Phone",
                      "Accessory",
                      "Software",
                    ].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>
                <Input
                  l="Brand / model *"
                  v={f.brand_model}
                  set={(v) => setF({ ...f, brand_model: v })}
                />
                <Input
                  l="Serial number"
                  v={f.serial_number}
                  set={(v) => setF({ ...f, serial_number: v })}
                />
                <label>
                  Purchase date
                  <input
                    type="date"
                    value={f.purchase_date}
                    onChange={(e) =>
                      setF({ ...f, purchase_date: e.target.value })
                    }
                  />
                </label>
                <label>
                  Warranty expiry
                  <input
                    type="date"
                    value={f.warranty_expiry}
                    onChange={(e) =>
                      setF({ ...f, warranty_expiry: e.target.value })
                    }
                  />
                </label>
                <label>
                  Condition
                  <select
                    value={f.condition}
                    onChange={(e) => setF({ ...f, condition: e.target.value })}
                  >
                    {["good", "fair", "poor", "defective"].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>
                <Input
                  l="Location"
                  v={f.location}
                  set={(v) => setF({ ...f, location: v })}
                />
                <label className="wide">
                  Notes
                  <textarea
                    value={f.notes}
                    onChange={(e) => setF({ ...f, notes: e.target.value })}
                  />
                </label>
              </div>
              <div className="actions">
                <button
                  className="plain"
                  type="button"
                  onClick={() => setEdit(undefined)}
                >
                  Cancel
                </button>
                <button>Save asset</button>
              </div>
            </form>
          </div>
        )}
        {detail && (
          <div className="modal">
            <div className="detail">
              <div className="title">
                <div>
                  <em>{detail.asset_tag}</em>
                  <h2>{detail.brand_model}</h2>
                  <p>
                    {detail.asset_type} · {detail.serial_number || "No serial"}
                  </p>
                </div>
                <button className="x" onClick={() => setDetail(null)}>
                  ×
                </button>
              </div>
              <div className="facts">
                <div>
                  Status
                  <Tag v={detail.status} />
                </div>
                <div>
                  Location<b>{detail.location || "—"}</b>
                </div>
                <div>
                  Condition
                  <Tag v={detail.condition} />
                </div>
              </div>
              <h3>Workflow</h3>
              {detail.status === "available" && (
                <label>
                  Assign to employee
                  <select
                    defaultValue=""
                    onChange={(e) => assign(detail, e.target.value)}
                  >
                    <option value="" disabled>
                      Select employee…
                    </option>
                    {people.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.department}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {detail.status === "assigned" && (
                <>
                  <p>
                    Assigned to <b>{detail.employees?.name}</b>
                  </p>
                  <button
                    className="warn"
                    onClick={() => change(detail, "under_repair")}
                  >
                    Send for repair
                  </button>
                  <button
                    className="plain"
                    onClick={() => change(detail, "available")}
                  >
                    Mark available / returned
                  </button>
                </>
              )}
              {detail.status === "under_repair" && (
                <button onClick={() => change(detail, "available")}>
                  Mark available / returned
                </button>
              )}
              <h3>Maintenance history</h3>
              {logs
                .filter((x) => x.asset_id === detail.id)
                .map((x) => (
                  <div className="log" key={x.id}>
                    <Tag v={x.log_type} />
                    <span>{x.description}</span>
                    <small>{x.logged_date}</small>
                  </div>
                ))}
              {!logs.some((x) => x.asset_id === detail.id) && (
                <small>No maintenance history yet.</small>
              )}
              <div className="actions">
                <button className="plain" onClick={() => editing(detail)}>
                  Edit asset
                </button>
                <button className="delete" onClick={() => del(detail)}>
                  Delete asset
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
function Card(p: { t: string; n: number; icon: string }) {
  return (
    <div className="card">
      <i>{p.icon}</i><small>{p.t}</small>
      <b>{p.n}</b>
    </div>
  );
}
function Tag(p: { v: string }) {
  return (
    <span className={`tag ${p.v.replace("_", "-")}`}>
      {p.v.replace("_", " ")}
    </span>
  );
}
function Input(p: { l: string; v: string; set: (x: string) => void }) {
  return (
    <label>
      {p.l}
      <input value={p.v} onChange={(e) => p.set(e.target.value)} />
    </label>
  );
}
