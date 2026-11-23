"use client";
import "./sidebar.css";
import "./assignment.css";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
type Employee = { id: string; name: string; department: string | null; office_location: string | null };
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
  company: string | null;
  device_name: string | null;
  specifications: string | null;
  operating_system: string | null;
  installed_software: string | null;
  network_group: string | null;
  storage_type: string | null;
  previous_user: string | null;
  assigned_employee_id: string | null;
  assignment_kind: string;
  consultant_name: string | null;
  consultant_company: string | null;
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
type SoftwareLicense = {
  id: string;
  company: string;
  product_name: string;
  vendor: string | null;
  license_type: string;
  total_seats: number;
  assigned_seats: number;
  renewal_date: string | null;
  annual_cost: number | null;
  notes: string | null;
};
type SoftwareAssignment = { id: string; software_license_id: string; employee_id: string; assigned_at: string; notes: string | null };
type ServerDetail = {
  asset_id: string;
  hostname: string | null;
  ip_address: string | null;
  operating_system: string | null;
  server_role: string | null;
  environment: string | null;
  rack_location: string | null;
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
  company: "SPB",
  device_name: "",
  specifications: "",
  operating_system: "",
  installed_software: "",
  network_group: "",
  storage_type: "",
  previous_user: "",
  assigned_user: "",
  assignment_kind: "internal",
  consultant_name: "",
  consultant_company: "",
  status: "available",
  notes: "",
};
const emptySoftware = { company: "SPB", product_name: "", vendor: "", license_type: "subscription", total_seats: "1", assigned_seats: "0", renewal_date: "", annual_cost: "", notes: "" };
const emptyServerInfo = { hostname: "", ip_address: "", operating_system: "", server_role: "", environment: "production", rack_location: "" };
export default function Home() {
  const db = useMemo(() => createClient(), []);
  const [assets, setAssets] = useState<Asset[]>([]),
    [people, setPeople] = useState<Employee[]>([]),
    [logs, setLogs] = useState<Log[]>([]),
    [software, setSoftware] = useState<SoftwareLicense[]>([]),
    [softwareAssignments, setSoftwareAssignments] = useState<SoftwareAssignment[]>([]),
    [serverDetails, setServerDetails] = useState<ServerDetail[]>([]),
    [busy, setBusy] = useState(true),
    [notice, setNotice] = useState(""),
    [q, setQ] = useState(""),
    [status, setStatus] = useState("all"),
    [type, setType] = useState("all"),
    [assetScope, setAssetScope] = useState<"spb" | "consultant" | "disposed">("spb"),
    [location, setLocation] = useState("all"),
    [year, setYear] = useState("all"),
    [view, setView] = useState("dashboard"),
    [accessView, setAccessView] = useState<"admin" | "user">("admin"),
    [previewEmployeeId, setPreviewEmployeeId] = useState(""),
    [hardwareOpen, setHardwareOpen] = useState(false),
    [spbOpen, setSpbOpen] = useState(false),
    [consultantOpen, setConsultantOpen] = useState(false),
    [laptopAssignmentsOpen, setLaptopAssignmentsOpen] = useState(false),
    [desktopAssignmentsOpen, setDesktopAssignmentsOpen] = useState(false),
    [pageSize, setPageSize] = useState(5),
    [assetPage, setAssetPage] = useState(1),
    [attentionPage, setAttentionPage] = useState(1),
    [attentionTab, setAttentionTab] = useState("all"),
    [employeePage, setEmployeePage] = useState(1),
    [consultantPage, setConsultantPage] = useState(1),
    [logPage, setLogPage] = useState(1),
    [softwarePage, setSoftwarePage] = useState(1),
    [serverPage, setServerPage] = useState(1),
    [softwareQuery, setSoftwareQuery] = useState(""),
    [softwareCompany, setSoftwareCompany] = useState("all"),
    [employeeQuery, setEmployeeQuery] = useState(""),
    [employeeDetail, setEmployeeDetail] = useState<Employee | null>(null),
    [employeeForm, setEmployeeForm] = useState({ name: "", department: "", office_location: "" }),
    [softwareEdit, setSoftwareEdit] = useState<SoftwareLicense | null | undefined>(undefined),
    [softwareForm, setSoftwareForm] = useState(emptySoftware),
    [softwareAssignmentLicense, setSoftwareAssignmentLicense] = useState<SoftwareLicense | null>(null),
    [softwareAssignmentPage, setSoftwareAssignmentPage] = useState(1),
    [serverInfoAsset, setServerInfoAsset] = useState<Asset | null>(null),
    [serverForm, setServerForm] = useState(emptyServerInfo),
    [edit, setEdit] = useState<Asset | null | undefined>(undefined),
    [detail, setDetail] = useState<Asset | null>(null),
    [f, setF] = useState(empty);
  async function load() {
    setBusy(true);
    const [a, p, l, s, sd, sa] = await Promise.all([
      db
        .from("assets")
        .select("*, employees(id,name,department)")
        .order("created_at", { ascending: false }),
      db.from("employees").select("id,name,department,office_location").order("name"),
      db
        .from("maintenance_logs")
        .select("*")
        .order("logged_date", { ascending: false }),
      db.from("software_licenses").select("*").order("product_name"),
      db.from("server_details").select("*"),
      db.from("software_license_assignments").select("*"),
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
      setSoftware(s.error ? [] : s.data as SoftwareLicense[]);
      setServerDetails(sd.error ? [] : sd.data as ServerDetail[]);
      setSoftwareAssignments(sa.error ? [] : sa.data as SoftwareAssignment[]);
      if (s.error) setNotice("Software Licences is still being set up. Hardware assets remain available.");
    }
    setBusy(false);
  }
  useEffect(() => {
    load();
  }, []);
  const expired = (a: Asset) =>
    !!a.warranty_expiry &&
    new Date(a.warranty_expiry + "T00:00:00") < new Date();
  const laptopDueForReplacement = (a: Asset) => {
    if (a.asset_type !== "Laptop" || !a.purchase_date) return false;
    const replacementDate = new Date();
    replacementDate.setFullYear(replacementDate.getFullYear() - 4);
    return new Date(a.purchase_date + "T00:00:00") <= replacementDate;
  };
  const activeAssets = assets.filter((a) => a.status !== "disposed");
  const assignedAssets = activeAssets.filter((a) => a.status === "assigned");
  const availableAssets = activeAssets.filter((a) => a.status === "available");
  const repairAssets = activeAssets.filter((a) => a.status === "under_repair");
  const spbAssets = assets.filter((a) => a.assignment_kind !== "consultant");
  const consultantAssetsForDashboard = assets.filter((a) => a.assignment_kind === "consultant");
  const ownershipStatus = (group: Asset[]) => [
    ["Active", group.filter((a) => a.status !== "disposed").length],
    ["Assigned", group.filter((a) => a.status === "assigned").length],
    ["Available", group.filter((a) => a.status === "available").length],
    ["Under repair", group.filter((a) => a.status === "under_repair").length],
    ["Disposed", group.filter((a) => a.status === "disposed").length],
  ];
  const list = assets.filter(
    (a) =>
      (status === "all" || a.status === status) &&
      (assetScope === "disposed" || (a.status !== "disposed" && (assetScope === "consultant" ? a.assignment_kind === "consultant" : a.assignment_kind !== "consultant"))) &&
      (type === "all" || (type === "mobile" ? ["Tablet", "Phone"].includes(a.asset_type) : a.asset_type === type)) &&
      (location === "all" || a.location === location) &&
      (year === "all" || a.purchase_date?.slice(0, 4) === year) &&
      [
        a.asset_tag,
        a.brand_model,
        a.device_name,
        a.serial_number,
        a.location,
        a.employees?.name,
        a.consultant_name,
        a.consultant_company,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q.toLowerCase()),
  ).sort((a, b) => (b.purchase_date || "").localeCompare(a.purchase_date || ""));
  const purchaseYears = [...new Set(assets.map((a) => a.purchase_date?.slice(0, 4)).filter(Boolean))].sort().reverse();
  const attention = assets.filter(
    (a) =>
      a.status !== "disposed" &&
      (a.status === "under_repair" ||
      a.condition === "poor" ||
      a.condition === "defective" ||
      expired(a) ||
      laptopDueForReplacement(a)),
  );
  const attentionReason = (a: Asset) =>
    a.status === "under_repair" ? "Under repair" :
    a.condition === "poor" || a.condition === "defective" ? `Condition: ${a.condition}` :
    expired(a) ? "Warranty expired" :
    "Laptop over 4 years — replacement review";
  const attentionTabs = [
    ["all", "All", attention],
    ["replacement", "Replacement due", attention.filter(laptopDueForReplacement)],
    ["warranty", "Warranty expired", attention.filter(expired)],
    ["repair", "Under repair", attention.filter((a) => a.status === "under_repair")],
    ["condition", "Poor condition", attention.filter((a) => a.condition === "poor" || a.condition === "defective")],
  ] as const;
  const selectedAttention = attentionTabs.find(([key]) => key === attentionTab)?.[2] || attention;
  const attentionPages = Math.max(1, Math.ceil(selectedAttention.length / 10));
  const attentionItems = selectedAttention.slice((attentionPage - 1) * 10, attentionPage * 10);
  const employeeList = people.filter((p) =>
    [p.name, p.department, p.office_location].filter(Boolean).join(" ").toLowerCase().includes(employeeQuery.toLowerCase()),
  );
  const consultantAssets = assets.filter((a) => a.assignment_kind === "consultant" && a.consultant_name);
  const softwareList = software.filter((s) => (softwareCompany === "all" || s.company === softwareCompany) && [s.company, s.product_name, s.vendor, s.license_type].filter(Boolean).join(" ").toLowerCase().includes(softwareQuery.toLowerCase()));
  const assignmentsFor = (licenseId: string) => softwareAssignments.filter((assignment) => assignment.software_license_id === licenseId);
  const pageItems = <T,>(items: T[], page: number) =>
    items.slice((page - 1) * pageSize, page * pageSize);
  function changePageSize(size: number) {
    setPageSize(size);
    setAssetPage(1);
    setEmployeePage(1);
    setLogPage(1);
    setSoftwarePage(1);
    setServerPage(1);
  }
  function openEmployee(p: Employee) {
    setEmployeeDetail(p);
    setEmployeeForm({ name: p.name, department: p.department || "", office_location: p.office_location || "" });
  }
  async function saveEmployee(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeDetail || !employeeForm.name.trim()) return;
    const r = await db.from("employees").update({ name: employeeForm.name.trim(), department: employeeForm.department || null, office_location: employeeForm.office_location || null }).eq("id", employeeDetail.id);
    if (r.error) return setNotice(r.error.message);
    setEmployeeDetail(null);
    setNotice("Employee details saved.");
    load();
  }
  function newSoftware() { setSoftwareEdit(null); setSoftwareForm(emptySoftware); setNotice(""); }
  function editSoftware(s: SoftwareLicense) {
    setSoftwareEdit(s);
    setSoftwareForm({ company: s.company || "SPB", product_name: s.product_name, vendor: s.vendor || "", license_type: s.license_type, total_seats: String(s.total_seats), assigned_seats: String(s.assigned_seats), renewal_date: s.renewal_date || "", annual_cost: s.annual_cost == null ? "" : String(s.annual_cost), notes: s.notes || "" });
  }
  async function saveSoftware(e: React.FormEvent) {
    e.preventDefault();
    const total = Number(softwareForm.total_seats);
    const assigned = Number(softwareForm.assigned_seats);
    if (!softwareForm.company.trim() || !softwareForm.product_name.trim()) return setNotice("Company and software product name are required.");
    if (!Number.isInteger(total) || !Number.isInteger(assigned) || total < 0 || assigned < 0 || assigned > total) return setNotice("Assigned seats must be a whole number and cannot exceed total seats.");
    const data = { company: softwareForm.company.trim(), product_name: softwareForm.product_name.trim(), vendor: softwareForm.vendor || null, license_type: softwareForm.license_type, total_seats: total, assigned_seats: assigned, renewal_date: softwareForm.renewal_date || null, annual_cost: softwareForm.annual_cost ? Number(softwareForm.annual_cost) : null, notes: softwareForm.notes || null };
    const r = softwareEdit ? await db.from("software_licenses").update(data).eq("id", softwareEdit.id) : await db.from("software_licenses").insert(data);
    if (r.error) return setNotice(r.error.message);
    setSoftwareEdit(undefined); setNotice("Software licence saved."); load();
  }
  async function deleteSoftware(s: SoftwareLicense) {
    if (!confirm(`Delete ${s.product_name}?`)) return;
    const r = await db.from("software_licenses").delete().eq("id", s.id);
    if (r.error) return setNotice(r.error.message);
    setSoftwareEdit(undefined); setNotice("Software licence deleted."); load();
  }
  async function assignSoftware(license: SoftwareLicense, employeeId: string) {
    if (!employeeId) return;
    if (assignmentsFor(license.id).some((assignment) => assignment.employee_id === employeeId)) return setNotice("This licence is already assigned to that employee.");
    if (assignmentsFor(license.id).length >= license.total_seats) return setNotice("No licence seats are available for this software.");
    const r = await db.from("software_license_assignments").insert({ software_license_id: license.id, employee_id: employeeId });
    if (r.error) return setNotice(r.error.message);
    setNotice("Software licence assigned.");
    load();
  }
  async function removeSoftwareAssignment(id: string) {
    const r = await db.from("software_license_assignments").delete().eq("id", id);
    if (r.error) return setNotice(r.error.message);
    setNotice("Software licence assignment removed.");
    load();
  }
  function newAsset(assetType = "Laptop") {
    setEdit(null);
    setF({ ...empty, asset_type: assetType });
    setNotice("");
  }
  function openServerInfo(a: Asset) {
    const current = serverDetails.find((x) => x.asset_id === a.id);
    setServerInfoAsset(a);
    setServerForm(current ? {
      hostname: current.hostname || "", ip_address: current.ip_address || "", operating_system: current.operating_system || "", server_role: current.server_role || "", environment: current.environment || "production", rack_location: current.rack_location || "",
    } : emptyServerInfo);
  }
  async function saveServerInfo(e: React.FormEvent) {
    e.preventDefault();
    if (!serverInfoAsset) return;
    const data = {
      asset_id: serverInfoAsset.id,
      hostname: serverForm.hostname || null,
      ip_address: serverForm.ip_address || null,
      operating_system: serverForm.operating_system || null,
      server_role: serverForm.server_role || null,
      environment: serverForm.environment || null,
      rack_location: serverForm.rack_location || null,
    };
    const r = await db.from("server_details").upsert(data, { onConflict: "asset_id" });
    if (r.error) return setNotice(r.error.message);
    setServerInfoAsset(null);
    setNotice("Server information saved.");
    load();
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
      company: a.company || "",
      device_name: a.device_name || "",
      specifications: a.specifications || "",
      operating_system: a.operating_system || "",
      installed_software: a.installed_software || "",
      network_group: a.network_group || "",
      storage_type: a.storage_type || "",
      previous_user: a.previous_user || "",
      assigned_user: a.employees?.name || "",
      assignment_kind: a.assignment_kind || "internal",
      consultant_name: a.consultant_name || "",
      consultant_company: a.consultant_company || "",
      status: a.status,
      notes: a.notes || "",
    });
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!f.asset_tag || !f.brand_model)
      return setNotice("Asset tag and brand/model are required.");
    let assignedEmployeeId: string | null = null;
    const assignedName = f.assignment_kind === "internal" ? f.assigned_user.trim() : "";
    if (assignedName) {
      const existing = people.find((p) => p.name.trim().toLowerCase() === assignedName.toLowerCase());
      if (existing) assignedEmployeeId = existing.id;
      else {
        const created = await db.from("employees").insert({ name: assignedName }).select("id").single();
        if (created.error) return setNotice(created.error.message);
        assignedEmployeeId = created.data.id;
      }
    }
    if (f.assignment_kind === "internal" && f.status === "assigned" && !assignedEmployeeId)
      return setNotice("Choose or enter an assigned user before setting the asset to Assigned.");
    // Keep the recorded user even for disposed assets. The asset status is
    // separate from its ownership history, while an available asset with a
    // named user naturally becomes assigned.
    const assetStatus = assignedEmployeeId && f.status === "available" ? "assigned" : f.status;
    const data = {
      ...f,
      assigned_user: undefined,
      serial_number: f.serial_number || null,
      purchase_date: f.purchase_date || null,
      warranty_expiry: f.warranty_expiry || null,
      location: f.location || null,
      company: f.company || null,
      device_name: f.device_name || null,
      specifications: f.specifications || null,
      operating_system: f.operating_system || null,
      installed_software: f.installed_software || null,
      network_group: f.network_group || null,
      storage_type: f.storage_type || null,
      previous_user: f.previous_user || null,
      assignment_kind: f.assignment_kind,
      consultant_name: f.assignment_kind === "consultant" ? f.consultant_name || null : null,
      consultant_company: f.assignment_kind === "consultant" ? f.consultant_company || null : null,
      assigned_employee_id: assignedEmployeeId,
      status: assetStatus,
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
  if (accessView === "user") {
    const previewEmployee = people.find((person) => person.id === previewEmployeeId);
    const myAssets = assets.filter((asset) => asset.assigned_employee_id === previewEmployeeId);
    const mySoftware = softwareAssignments.filter((assignment) => assignment.employee_id === previewEmployeeId).map((assignment) => ({ assignment, license: software.find((license) => license.id === assignment.software_license_id) })).filter((item) => item.license);
    return <main className="user-portal"><header><div><em>SPB IT ASSET MANAGEMENT · USER VIEW</em><h1>My IT assets</h1><p>Read-only view of the hardware and software assigned to you.</p></div><button className="plain" onClick={() => setAccessView("admin")}>Return to Admin</button></header><section className="user-profile-picker"><label>Viewing as employee<select value={previewEmployeeId} onChange={(e) => setPreviewEmployeeId(e.target.value)}><option value="">Select employee…</option>{people.map((person) => <option key={person.id} value={person.id}>{person.name}{person.department ? ` — ${person.department}` : ""}</option>)}</select></label></section>{previewEmployee ? <><div className="user-welcome"><b>{previewEmployee.name}</b><span>{previewEmployee.department || "Department not set"} · {previewEmployee.office_location || "Office location not set"}</span></div><div className="user-grid"><section className="panel"><div className="title"><div><h2>My hardware</h2><p>{myAssets.length} item(s) assigned to you.</p></div></div><div className="user-resource-list">{myAssets.map((asset) => <div key={asset.id}><span><b>{asset.asset_tag}</b><small>{asset.brand_model} · {asset.asset_type}</small></span><span><Tag v={asset.status} /></span></div>)}{!myAssets.length && <p className="state">No hardware assigned.</p>}</div></section><section className="panel"><div className="title"><div><h2>My software licences</h2><p>{mySoftware.length} licence(s) assigned to you.</p></div></div><div className="user-resource-list">{mySoftware.map(({ assignment, license }) => <div key={assignment.id}><span><b>{license!.product_name}</b><small>{license!.company || "SPB"} · {license!.license_type}</small></span><small>Assigned {new Date(assignment.assigned_at).toLocaleDateString()}</small></div>)}{!mySoftware.length && <p className="state">No software licences assigned.</p>}</div></section></div></> : <p className="state">Select an employee to preview the user view.</p>}</main>;
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
          ].map(([item, icon, label]) => <button key={item} className={view === item ? "on" : ""} onClick={() => setView(item)}><i>{icon}</i>{label}</button>)}
          <button className={view === "assets" || view === "servers" ? "on" : ""} onClick={() => setHardwareOpen(!hardwareOpen)}><i>▣</i>Hardware Assets <b className="nav-caret">{hardwareOpen ? "−" : "+"}</b></button>
          {hardwareOpen && <div className="hardware-subnav">
            {([['spb','SPB',[['Laptop','Laptop'],['Desktop Computer','Desktop'],['Monitor','Monitor'],['Server','Server'],['Printer','Printer'],['mobile','Tablet / Phone']]],['consultant','Consultant',[['Laptop','Laptop'],['Desktop Computer','Desktop'],['Monitor','Monitor'],['Printer','Printer']]]] as const).map(([scope, label, types]) => <div className="hardware-group" key={scope}>
              <button className="hardware-group-title" onClick={() => scope === "spb" ? setSpbOpen(!spbOpen) : setConsultantOpen(!consultantOpen)}><span>{label}</span><b className="asset-count">{assets.filter(a => a.status !== "disposed" && (scope === "consultant" ? a.assignment_kind === "consultant" : a.assignment_kind !== "consultant")).length}</b><b className="nav-caret">{(scope === "spb" ? spbOpen : consultantOpen) ? "−" : "+"}</b></button>
              {(scope === "spb" ? spbOpen : consultantOpen) && <>{types.map(([assetType, typeLabel]) => <div key={assetType}>
                {scope === "spb" && (assetType === "Laptop" || assetType === "Desktop Computer") ? <button className="folder-toggle" aria-expanded={assetType === "Laptop" ? laptopAssignmentsOpen : desktopAssignmentsOpen} onClick={() => assetType === "Laptop" ? setLaptopAssignmentsOpen(!laptopAssignmentsOpen) : setDesktopAssignmentsOpen(!desktopAssignmentsOpen)}><i>·</i>{typeLabel}<b className="asset-count">{assets.filter(a => a.status !== "disposed" && a.assignment_kind !== "consultant" && a.asset_type === assetType).length}</b><b className="nav-caret">{(assetType === "Laptop" ? laptopAssignmentsOpen : desktopAssignmentsOpen) ? "−" : "+"}</b></button> : <button className={view === "assets" && assetScope === scope && type === assetType && status === "all" ? "selected" : ""} onClick={() => { setView("assets"); setAssetScope(scope); setType(assetType); setStatus("all"); setAssetPage(1); }}><i>·</i>{typeLabel}<b className="asset-count">{assets.filter(a => a.status !== "disposed" && (scope === "consultant" ? a.assignment_kind === "consultant" : a.assignment_kind !== "consultant") && (assetType === "mobile" ? ["Tablet", "Phone"].includes(a.asset_type) : a.asset_type === assetType)).length}</b></button>}
                {scope === "spb" && (assetType === "Laptop" || assetType === "Desktop Computer") && (assetType === "Laptop" ? laptopAssignmentsOpen : desktopAssignmentsOpen) && <div className="assignment-subnav">
                  <button className={view === "assets" && assetScope === "spb" && type === assetType && status === "assigned" ? "selected" : ""} onClick={() => { setView("assets"); setAssetScope("spb"); setType(assetType); setStatus("assigned"); setAssetPage(1); }}><i>·</i>Assigned<b className="asset-count">{assets.filter(a => a.status === "assigned" && a.assignment_kind !== "consultant" && a.asset_type === assetType).length}</b></button>
                  <button className={view === "assets" && assetScope === "spb" && type === assetType && status === "available" ? "selected" : ""} onClick={() => { setView("assets"); setAssetScope("spb"); setType(assetType); setStatus("available"); setAssetPage(1); }}><i>·</i>Available / Unassigned<b className="asset-count">{assets.filter(a => a.status === "available" && a.assignment_kind !== "consultant" && a.asset_type === assetType).length}</b></button>
                  <button className={view === "assets" && assetScope === "spb" && type === assetType && status === "not_applicable" ? "selected" : ""} onClick={() => { setView("assets"); setAssetScope("spb"); setType(assetType); setStatus("not_applicable"); setAssetPage(1); }}><i>·</i>N/A<b className="asset-count">{assets.filter(a => a.status === "not_applicable" && a.assignment_kind !== "consultant" && a.asset_type === assetType).length}</b></button>
                </div>}
              </div>)}
              {scope === "spb" && <button className={view === "assets" && assetScope === "disposed" ? "selected" : ""} onClick={() => { setView("assets"); setAssetScope("disposed"); setType("all"); setStatus("disposed"); setAssetPage(1); }}><i>·</i>Disposed<b className="asset-count">{assets.filter(a => a.status === "disposed").length}</b></button>}
              </>}
            </div>)}
          </div>}
          {[
            ["software", "◈", "Software Licences"],
            ["employees", "♙", "Employees"],
            ["consultants", "♧", "Consultants"],
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
        <button className="user-preview-launch plain" onClick={() => { setPreviewEmployeeId(people[0]?.id || ""); setAccessView("user"); }}>View as user</button>
        <header>
          <div><em>SPB IT OPERATIONS · {view.toUpperCase()}</em><h1>{view === "assets" ? "Hardware assets" : view === "servers" ? "Server register" : view === "software" ? "Software licences" : view === "dashboard" ? "Dashboard overview" : view === "employees" ? "Employees" : "Maintenance logs"}</h1><p>{view === "assets" ? "Register and manage laptops, computers, devices and peripherals." : view === "servers" ? "Keep each server's hardware record and technical information together." : view === "software" ? "Track subscriptions, licence seats, costs and renewal dates." : view === "employees" ? "Review people and their currently assigned assets." : view === "dashboard" ? "A live view of SPB IT infrastructure and its follow-ups." : "Asset repairs and service history."}</p></div>
          {view === "assets" && <button onClick={() => newAsset()}>+ Register hardware</button>}
          {view === "servers" && <button onClick={() => newAsset("Server")}>+ Register server</button>}
          {view === "software" && <button onClick={newSoftware}>+ Add software licence</button>}
        </header>
        {notice && view !== "dashboard" && (
          <div className="notice">
            {notice}
            <span onClick={() => setNotice("")}>×</span>
          </div>
        )}
        {view === "dashboard" && <div className="ownership-stats">
          {[["SPB assets", spbAssets], ["Consultant assets", consultantAssetsForDashboard]].map(([label, group]) => <div className="ownership-card" key={label as string}><h2>{label as string}</h2><div>{ownershipStatus(group as Asset[]).map(([statusLabel, total]) => <span key={statusLabel as string}>{statusLabel as string}<b>{total as number}</b></span>)}</div></div>)}
        </div>}
        {view === "assets" && <div className="panel">
          <div className="title">
            <div>
              <h2>Hardware asset register</h2>
              <p>Laptops, computers, devices and peripherals saved to the live register.</p>
            </div>
            <button className="plain" onClick={load}>
              Refresh
            </button>
          </div>
          <div className="filters">
            <input
              placeholder="Search tag, serial, model, location or employee"
              value={q}
              onChange={(e) => { setQ(e.target.value); setAssetPage(1); }}
            />
            <select value={status} onChange={(e) => { setStatus(e.target.value); setAssetPage(1); }}>
              <option value="all">All statuses</option>
              <option value="available">Available</option>
              <option value="assigned">Assigned</option>
              <option value="under_repair">Under repair</option>
              <option value="disposed">Disposed</option>
              <option value="not_applicable">N/A</option>
            </select>
            <select value={type} onChange={(e) => { setType(e.target.value); setAssetPage(1); }}>
              <option value="all">All types</option>
              {[...new Set(assets.map((a) => a.asset_type))].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <select
              value={location}
              onChange={(e) => { setLocation(e.target.value); setAssetPage(1); }}
            >
              <option value="all">All locations</option>
              {[...new Set(assets.map((a) => a.location).filter(Boolean))].map(
                (x) => (
                  <option key={x}>{x}</option>
                ),
              )}
            </select>
            <select value={year} onChange={(e) => { setYear(e.target.value); setAssetPage(1); }}>
              <option value="all">All years</option>
              {purchaseYears.map((x) => <option key={x}>{x}</option>)}
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
                {pageItems(list, assetPage).map((a) => (
                  <tr key={a.id}>
                    <td>
                      <a onClick={() => setDetail(a)}>
                        <b>{a.asset_tag}</b>
                        <small>PC name: {a.device_name || "Not set"}</small>
                        <small>SN: {a.serial_number || "Not set"}</small>
                      </a>
                      {expired(a) && <mark>Warranty expired</mark>}
                    </td>
                    <td>
                      {a.assignment_kind === "consultant" && a.consultant_name ? (
                        <>
                          <b>{a.consultant_name}</b>
                          <small>{a.consultant_company || "Consultant"}</small>
                        </>
                      ) : a.employees ? (
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
          {!busy && list.length > 0 && <Pager total={list.length} page={assetPage} setPage={setAssetPage} pageSize={pageSize} setPageSize={changePageSize} />}
        </div>}
        {view === "servers" && <div className="panel"><div className="title"><div><h2>Server register</h2><p>Hostname, IP, operating system, role, environment and rack location.</p></div><button className="plain" onClick={load}>Refresh</button></div>{busy ? <p className="state">Loading servers…</p> : assets.filter((a) => a.asset_type === "Server").length ? <><table><thead><tr><th>Server</th><th>Hostname / IP address</th><th>System / role</th><th>Environment</th><th>Rack / location</th><th /></tr></thead><tbody>{pageItems(assets.filter((a) => a.asset_type === "Server"), serverPage).map((a) => { const info = serverDetails.find((x) => x.asset_id === a.id); return <tr key={a.id}><td><b>{a.asset_tag}</b><small>{a.brand_model} · {a.serial_number || "No serial"}</small></td><td><b>{info?.hostname || "Not set"}</b><small>{info?.ip_address || "IP not set"}</small></td><td><b>{info?.operating_system || "Not set"}</b><small>{info?.server_role || "Role not set"}</small></td><td>{info?.environment || "Not set"}</td><td><b>{info?.rack_location || "Not set"}</b><small>{a.location || "Asset location not set"}</small></td><td><button className="plain" onClick={() => openServerInfo(a)}>Server info</button></td></tr>; })}</tbody></table><Pager total={assets.filter((a) => a.asset_type === "Server").length} page={serverPage} setPage={setServerPage} pageSize={pageSize} setPageSize={changePageSize} /></> : <p className="state">No server assets yet. Register a server here, or edit an existing hardware asset and set its type to Server.</p>}</div>}
        {view === "dashboard" && <div className="cols">
          <div className="panel employee-preview">
            <div className="title">
              <div>
                <h2>Needs attention</h2>
                <p>Repair, condition, warranty and replacement follow-up.</p>
              </div>
            </div>
            <div className="attention-tabs">{attentionTabs.map(([key, label, items]) => <button key={key} className={attentionTab === key ? "on" : ""} onClick={() => { setAttentionTab(key); setAttentionPage(1); }}>{label}<b>{items.length}</b></button>)}</div>
            {selectedAttention.length ? (
              <>{attentionItems.map((a) => (
                <a className="row" key={a.id} onClick={() => setDetail(a)}>
                  <i />{" "}
                  <span>
                    <b>
                      {a.asset_tag} · {a.brand_model}
                    </b>
                    <small>{attentionReason(a)}</small>
                  </span>
                </a>
              ))}{selectedAttention.length > 10 && <div className="pager"><small>Showing {(attentionPage - 1) * 10 + 1}–{Math.min(attentionPage * 10, selectedAttention.length)} of {selectedAttention.length}</small><div><button className="plain" disabled={attentionPage === 1} onClick={() => setAttentionPage(attentionPage - 1)}>Previous</button><span>{attentionPage} / {attentionPages}</span><button className="plain" disabled={attentionPage === attentionPages} onClick={() => setAttentionPage(attentionPage + 1)}>Next</button></div></div>}</>
            ) : (
              <p className="state">No assets in this attention category.</p>
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
              <strong>{activeAssets.length ? Math.round((assignedAssets.length / activeAssets.length) * 100) : 0}%</strong>
              <span>of active assets are assigned</span>
              <div><b style={{width: `${activeAssets.length ? (assignedAssets.length / activeAssets.length) * 100 : 0}%`}} /></div>
              <small>{availableAssets.length} available · {repairAssets.length} under repair</small>
            </div>
            <div className="dashboard-breakdown">
              <h3>Hardware by type</h3>
              {[["Laptop", "Laptop"], ["Desktop Computer", "Desktop"], ["Monitor", "Monitor"], ["Server", "Server"], ["Printer", "Printer"], ["Phone", "Tablet / Phone"]].map(([assetType, label]) => <div key={assetType}><span>{label}</span><b>{activeAssets.filter(a => assetType === "Phone" ? ["Phone", "Tablet"].includes(a.asset_type) : a.asset_type === assetType).length}</b></div>)}
            </div>
          </div>
        </div>}
        {view === "employees" && <div className="panel employee-directory"><div className="title"><div><h2>Employee directory</h2><p>Search employee information and assigned assets.</p></div></div><div className="filters"><input placeholder="Search name, department or office location" value={employeeQuery} onChange={(e) => { setEmployeeQuery(e.target.value); setEmployeePage(1); }} /></div>{employeeList.length ? <table><thead><tr><th>Name</th><th>Department</th><th>Office location</th><th>Assigned assets</th><th /></tr></thead><tbody>{pageItems(employeeList, employeePage).map((p) => { const assigned = assets.filter(a => a.assigned_employee_id === p.id); return <tr key={p.id}><td><b>{p.name}</b></td><td>{p.department || "—"}</td><td>{p.office_location || "Not set"}</td><td>{assigned.length}</td><td><button className="plain" onClick={() => openEmployee(p)}>View details</button></td></tr>; })}</tbody></table> : <p className="state">No employees match your search.</p>}{employeeList.length > 0 && <Pager total={employeeList.length} page={employeePage} setPage={setEmployeePage} pageSize={pageSize} setPageSize={changePageSize} />}</div>}
        {view === "consultants" && <div className="panel"><div className="title"><div><h2>Consultant assignments</h2><p>External people and companies holding SPB assets.</p></div></div>{consultantAssets.length ? <table><thead><tr><th>Consultant</th><th>Company</th><th>Asset</th><th>Location</th><th /></tr></thead><tbody>{pageItems(consultantAssets, consultantPage).map((a) => <tr key={a.id}><td><b>{a.consultant_name}</b></td><td>{a.consultant_company || "Not set"}</td><td><b>{a.asset_tag}</b><small>{a.brand_model}</small></td><td>{a.location || "—"}</td><td><button className="plain" onClick={() => setDetail(a)}>View asset</button></td></tr>)}</tbody></table> : <p className="state">No consultant assets yet.</p>}{consultantAssets.length > 0 && <Pager total={consultantAssets.length} page={consultantPage} setPage={setConsultantPage} pageSize={pageSize} setPageSize={changePageSize} />}</div>}
        {view === "software" && <div className="panel software-register"><div className="title"><div><h2>Software licence register</h2><p>Keep each company’s licences, seats, costs and renewal dates together.</p></div><button className="plain" onClick={load}>Refresh</button></div><div className="filters"><input placeholder="Search company, product, vendor or licence type" value={softwareQuery} onChange={(e) => { setSoftwareQuery(e.target.value); setSoftwarePage(1); }} /><select value={softwareCompany} onChange={(e) => { setSoftwareCompany(e.target.value); setSoftwarePage(1); }}><option value="all">All companies</option>{[...new Set(software.map(s => s.company).filter(Boolean))].sort().map(company => <option key={company}>{company}</option>)}</select></div>{softwareList.length ? <table><thead><tr><th>Company</th><th>Software</th><th>Licence type</th><th>Seats</th><th>Assigned staff</th><th>Renewal</th><th>Annual cost</th><th /></tr></thead><tbody>{pageItems(softwareList, softwarePage).map((s) => { const assignedPeople = assignmentsFor(s.id); return <tr key={s.id}><td><b>{s.company || "SPB"}</b></td><td><b>{s.product_name}</b><small>{s.vendor || "Vendor not set"}</small></td><td><Tag v={s.license_type} /></td><td><b>{s.assigned_seats} / {s.total_seats}</b><small>{s.total_seats - s.assigned_seats} available</small></td><td><b>{assignedPeople.length} named</b><small>{assignedPeople.length ? assignedPeople.map((a) => people.find((p) => p.id === a.employee_id)?.name).filter(Boolean).join(", ") : "No staff assigned"}</small></td><td>{s.renewal_date || "Not set"}</td><td>{s.annual_cost == null ? "—" : `RM ${s.annual_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</td><td><button className="plain" onClick={() => { setSoftwareAssignmentPage(1); setSoftwareAssignmentLicense(s); }}>Manage users</button><button className="plain" onClick={() => editSoftware(s)}>Edit</button></td></tr>; })}</tbody></table> : <p className="state">No software licences match your search.</p>}{softwareList.length > 0 && <Pager total={softwareList.length} page={softwarePage} setPage={setSoftwarePage} pageSize={pageSize} setPageSize={changePageSize} />}</div>}
        {view === "maintenance" && <div className="panel maintenance-list"><div className="title"><div><h2>Service history</h2><p>Repairs and maintenance entries across all assets.</p></div></div>{logs.length ? pageItems(logs, logPage).map((l) => { const asset = assets.find(a => a.id === l.asset_id); return <div className="log" key={l.id}><Tag v={l.log_type}/><span><b>{asset?.asset_tag || "Asset removed"}</b>{l.description}</span><small>{l.logged_date}</small></div>}) : <p className="state">No maintenance history yet.</p>}{logs.length > 0 && <Pager total={logs.length} page={logPage} setPage={setLogPage} pageSize={pageSize} setPageSize={changePageSize} />}</div>}
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
                      "Desktop Computer",
                      "Server",
                      "Monitor",
                      "Phone",
                      "Tablet",
                      "Printer",
                      "Network Equipment",
                      "Accessory",
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
                    {["good", "fair", "poor", "defective", "N/A"].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>
                <Input
                  l="Location"
                  v={f.location}
                  set={(v) => setF({ ...f, location: v })}
                />
                <label>
                  Assignment type
                  <select value={f.assignment_kind} onChange={(e) => setF({ ...f, assignment_kind: e.target.value })}><option value="internal">Internal staff</option><option value="consultant">Consultant / external</option></select>
                </label>
                {f.assignment_kind === "internal" ? <label>
                  Assigned user
                  <input list="employee-names" value={f.assigned_user} onChange={(e) => setF({ ...f, assigned_user: e.target.value })} placeholder="Search or type a new name" />
                  <datalist id="employee-names">{people.map((p) => <option key={p.id} value={p.name}>{p.department || "Employee"}</option>)}</datalist>
                  <small>New names are added to Employees when you save.</small>
                </label> : <Input l="Consultant name" v={f.consultant_name} set={(v) => setF({ ...f, consultant_name: v })} />}
                {f.assignment_kind === "consultant" && <Input l="Consultant company" v={f.consultant_company} set={(v) => setF({ ...f, consultant_company: v })} />}
                <label>
                  Status
                  <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
                    <option value="available">Available</option>
                    <option value="assigned">Assigned</option>
                    <option value="under_repair">Under repair</option>
                    <option value="disposed">Disposed</option>
                    <option value="not_applicable">N/A</option>
                  </select>
                </label>
                <label className="wide">
                  Remarks / notes
                  <textarea
                    value={f.notes}
                    onChange={(e) => setF({ ...f, notes: e.target.value })}
                  />
                </label>
              </div>
              <h3>Device details</h3>
              <div className="form">
                <Input l="Company" v={f.company} set={(v) => setF({ ...f, company: v })} />
                <Input l="PC / device name" v={f.device_name} set={(v) => setF({ ...f, device_name: v })} />
                <Input l="Operating system" v={f.operating_system} set={(v) => setF({ ...f, operating_system: v })} />
                <Input l="Storage type" v={f.storage_type} set={(v) => setF({ ...f, storage_type: v })} />
                <Input l="Domain / workgroup" v={f.network_group} set={(v) => setF({ ...f, network_group: v })} />
                <Input l="Previous user" v={f.previous_user} set={(v) => setF({ ...f, previous_user: v })} />
                <label className="wide">Specifications<textarea value={f.specifications} onChange={(e) => setF({ ...f, specifications: e.target.value })} placeholder="CPU, RAM, storage, graphics…" /></label>
                <label className="wide">Software loaded<textarea value={f.installed_software} onChange={(e) => setF({ ...f, installed_software: e.target.value })} placeholder="Microsoft 365, Adobe, and other installed software…" /></label>
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
                  <em className="detail-tag">{detail.asset_tag}</em>
                  <h2>{detail.brand_model}</h2>
                  <p>
                    {detail.asset_type} · {detail.serial_number || "No serial"}
                  </p>
                </div>
                <div className="detail-header-actions">
                  {(detail.employees?.name || detail.consultant_name) && <span className="detail-assignee"><small>{detail.assignment_kind === "consultant" ? detail.consultant_company || "Consultant" : "Assigned to"}</small><b>{detail.assignment_kind === "consultant" ? detail.consultant_name : detail.employees?.name}</b></span>}
                  <button className="x" onClick={() => setDetail(null)}>
                    ×
                  </button>
                </div>
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
              <h3>Remarks / notes</h3>
              <div className="remarks-detail">{detail.notes || "No remarks recorded for this asset."}</div>
              <h3>Device details</h3>
              <div className="facts">
                <div>Company<b>{detail.company || "—"}</b></div>
                <div>PC / device name<b>{detail.device_name || "—"}</b></div>
                <div>Operating system<b>{detail.operating_system || "—"}</b></div>
                <div>Storage type<b>{detail.storage_type || "—"}</b></div>
                <div>Domain / workgroup<b>{detail.network_group || "—"}</b></div>
                <div>Previous user<b>{detail.previous_user || "—"}</b></div>
                <div>Specifications<b>{detail.specifications || "—"}</b></div>
                <div>Software loaded<b>{detail.installed_software || "—"}</b></div>
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
        {softwareEdit !== undefined && <div className="modal"><form onSubmit={saveSoftware}><div className="title"><div><em>SOFTWARE LICENCE</em><h2>{softwareEdit ? "Edit software licence" : "Add software licence"}</h2></div><button className="x" type="button" onClick={() => setSoftwareEdit(undefined)}>×</button></div><div className="form"><label>Company / licence owner *<input list="software-companies" value={softwareForm.company} onChange={(e) => setSoftwareForm({ ...softwareForm, company: e.target.value })} /><datalist id="software-companies">{["SPB", "CCY", "ORI", "KAYIN", ...software.map(s => s.company).filter(Boolean)].filter((value, index, values) => values.indexOf(value) === index).map(company => <option key={company} value={company} />)}</datalist></label><Input l="Product name *" v={softwareForm.product_name} set={(v) => setSoftwareForm({ ...softwareForm, product_name: v })} /><Input l="Vendor" v={softwareForm.vendor} set={(v) => setSoftwareForm({ ...softwareForm, vendor: v })} /><label>Licence type<select value={softwareForm.license_type} onChange={(e) => setSoftwareForm({ ...softwareForm, license_type: e.target.value })}><option value="subscription">Subscription</option><option value="perpetual">Perpetual</option><option value="trial">Trial</option></select></label><Input l="Total seats" v={softwareForm.total_seats} set={(v) => setSoftwareForm({ ...softwareForm, total_seats: v })} /><Input l="Assigned seats" v={softwareForm.assigned_seats} set={(v) => setSoftwareForm({ ...softwareForm, assigned_seats: v })} /><label>Renewal date<input type="date" value={softwareForm.renewal_date} onChange={(e) => setSoftwareForm({ ...softwareForm, renewal_date: e.target.value })} /></label><Input l="Annual cost (RM)" v={softwareForm.annual_cost} set={(v) => setSoftwareForm({ ...softwareForm, annual_cost: v })} /><label className="wide">Notes<textarea value={softwareForm.notes} onChange={(e) => setSoftwareForm({ ...softwareForm, notes: e.target.value })} /></label></div><div className="actions">{softwareEdit && <button className="delete" type="button" onClick={() => deleteSoftware(softwareEdit)}>Delete licence</button>}<button className="plain" type="button" onClick={() => setSoftwareEdit(undefined)}>Cancel</button><button>Save licence</button></div></form></div>}
        {serverInfoAsset && <div className="modal"><form onSubmit={saveServerInfo}><div className="title"><div><em>SERVER INFORMATION</em><h2>{serverInfoAsset.asset_tag}</h2><p>{serverInfoAsset.brand_model}</p></div><button className="x" type="button" onClick={() => setServerInfoAsset(null)}>×</button></div><div className="form"><Input l="Hostname" v={serverForm.hostname} set={(v) => setServerForm({ ...serverForm, hostname: v })} /><Input l="IP address" v={serverForm.ip_address} set={(v) => setServerForm({ ...serverForm, ip_address: v })} /><Input l="Operating system" v={serverForm.operating_system} set={(v) => setServerForm({ ...serverForm, operating_system: v })} /><Input l="Server role" v={serverForm.server_role} set={(v) => setServerForm({ ...serverForm, server_role: v })} /><label>Environment<select value={serverForm.environment} onChange={(e) => setServerForm({ ...serverForm, environment: e.target.value })}><option value="production">Production</option><option value="uat">UAT</option><option value="development">Development</option><option value="disaster recovery">Disaster recovery</option></select></label><Input l="Rack / server location" v={serverForm.rack_location} set={(v) => setServerForm({ ...serverForm, rack_location: v })} /></div><div className="actions"><button className="plain" type="button" onClick={() => setServerInfoAsset(null)}>Cancel</button><button>Save server info</button></div></form></div>}
        {employeeDetail && <div className="modal"><form onSubmit={saveEmployee} className="employee-detail-form"><div className="title employee-detail-title"><div><em>EMPLOYEE DETAILS</em><h2>{employeeDetail.name}</h2><p>Profile, assigned hardware and software access.</p></div><button className="x" type="button" onClick={() => setEmployeeDetail(null)}>×</button></div><section className="employee-section"><h3>Profile</h3><div className="form"><Input l="Name *" v={employeeForm.name} set={(v) => setEmployeeForm({ ...employeeForm, name: v })} /><Input l="Department" v={employeeForm.department} set={(v) => setEmployeeForm({ ...employeeForm, department: v })} /><Input l="Office location" v={employeeForm.office_location} set={(v) => setEmployeeForm({ ...employeeForm, office_location: v })} /></div></section><section className="employee-section"><h3>Assigned hardware</h3><div className="employee-resource-list">{assets.filter(a => a.assigned_employee_id === employeeDetail.id).map(a => <div key={a.id}><span><b>{a.asset_tag}</b><small>{a.brand_model} · {a.status.replace("_", " ")}</small></span><button type="button" className="plain" onClick={() => { setEmployeeDetail(null); setDetail(a); }}>View</button></div>)}{!assets.some(a => a.assigned_employee_id === employeeDetail.id) && <small>No hardware currently assigned.</small>}</div></section><section className="employee-section"><div className="employee-section-heading"><h3>Software licences</h3><label>Add software licence<select defaultValue="" onChange={(e) => { const license = software.find((s) => s.id === e.target.value); if (license) assignSoftware(license, employeeDetail.id); e.currentTarget.value = ""; }}><option value="" disabled>Select software…</option>{software.filter((s) => !softwareAssignments.some((assignment) => assignment.employee_id === employeeDetail.id && assignment.software_license_id === s.id)).map((s) => <option key={s.id} value={s.id}>{s.company || "SPB"} · {s.product_name}</option>)}</select></label></div><div className="employee-resource-list">{softwareAssignments.filter((assignment) => assignment.employee_id === employeeDetail.id).map((assignment) => { const license = software.find((s) => s.id === assignment.software_license_id); return <div key={assignment.id}><span><b>{license?.product_name || "Software licence"}</b><small>{license?.company || "SPB"} · {license?.license_type || ""} · Assigned {new Date(assignment.assigned_at).toLocaleDateString()}</small></span><button className="plain" type="button" onClick={() => removeSoftwareAssignment(assignment.id)}>Remove</button></div>; })}{!softwareAssignments.some((assignment) => assignment.employee_id === employeeDetail.id) && <small>No software licences assigned.</small>}</div></section><div className="actions"><button className="plain" type="button" onClick={() => setEmployeeDetail(null)}>Cancel</button><button>Save details</button></div></form></div>}
        {softwareAssignmentLicense && <div className="modal"><div className="detail">{(() => { const allAssignments = assignmentsFor(softwareAssignmentLicense.id).sort((a, b) => (people.find((person) => person.id === a.employee_id)?.name || "").localeCompare(people.find((person) => person.id === b.employee_id)?.name || "")); const pages = Math.max(1, Math.ceil(allAssignments.length / 5)); const shownAssignments = allAssignments.slice((softwareAssignmentPage - 1) * 5, softwareAssignmentPage * 5); return <><div className="title"><div><em>SOFTWARE ASSIGNMENTS</em><h2>{softwareAssignmentLicense.product_name}</h2><p>{softwareAssignmentLicense.company || "SPB"} · {allAssignments.length} named user(s) of {softwareAssignmentLicense.total_seats} seats</p></div><button className="x" onClick={() => setSoftwareAssignmentLicense(null)}>×</button></div><label>Assign to employee<select defaultValue="" onChange={(e) => { assignSoftware(softwareAssignmentLicense, e.target.value); e.currentTarget.value = ""; }}><option value="" disabled>Select employee…</option>{people.filter((person) => !allAssignments.some((assignment) => assignment.employee_id === person.id)).map((person) => <option key={person.id} value={person.id}>{person.name}{person.department ? ` — ${person.department}` : ""}</option>)}</select></label><h3>Assigned users</h3><div className="software-assignment-list">{shownAssignments.map((assignment) => <div key={assignment.id}><span><b>{people.find((person) => person.id === assignment.employee_id)?.name || "Employee removed"}</b><small>Assigned {new Date(assignment.assigned_at).toLocaleDateString()}</small></span><button className="plain" onClick={() => removeSoftwareAssignment(assignment.id)}>Remove</button></div>)}{!allAssignments.length && <small>No staff assigned to this licence yet.</small>}</div>{allAssignments.length > 5 && <div className="pager"><small>Showing {(softwareAssignmentPage - 1) * 5 + 1}–{Math.min(softwareAssignmentPage * 5, allAssignments.length)} of {allAssignments.length}</small><div><button className="plain" disabled={softwareAssignmentPage === 1} onClick={() => setSoftwareAssignmentPage(softwareAssignmentPage - 1)}>Previous</button><span>{softwareAssignmentPage} / {pages}</span><button className="plain" disabled={softwareAssignmentPage === pages} onClick={() => setSoftwareAssignmentPage(softwareAssignmentPage + 1)}>Next</button></div></div>}<div className="actions"><button className="plain" onClick={() => setSoftwareAssignmentLicense(null)}>Close</button></div></>; })()}</div></div>}
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
function Pager(p: { total: number; page: number; setPage: (page: number) => void; pageSize: number; setPageSize: (size: number) => void }) {
  const pages = Math.max(1, Math.ceil(p.total / p.pageSize));
  const start = (p.page - 1) * p.pageSize + 1;
  const end = Math.min(p.page * p.pageSize, p.total);
  return <div className="pager"><small>Showing {start}–{end} of {p.total}</small><label>Show <select value={p.pageSize} onChange={(e) => { p.setPageSize(Number(e.target.value)); p.setPage(1); }}><option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={30}>30</option><option value={50}>50</option></select></label><div><button className="plain" disabled={p.page === 1} onClick={() => p.setPage(p.page - 1)}>Previous</button><span>{p.page} / {pages}</span><button className="plain" disabled={p.page === pages} onClick={() => p.setPage(p.page + 1)}>Next</button></div></div>;
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
