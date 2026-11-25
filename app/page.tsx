"use client";
import "./sidebar.css";
import "./assignment.css";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { exportCsv } from "@/lib/export-csv";
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
  disposal_category: string | null;
  disposal_recipient: string | null;
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
  disposal_category: "",
  disposal_recipient: "",
  status: "available",
  notes: "",
};
const emptySoftware = { company: "SPB", product_name: "", vendor: "", license_type: "subscription", total_seats: "1", assigned_seats: "0", renewal_date: "", annual_cost: "", notes: "" };
const emptyServerInfo = { hostname: "", ip_address: "", operating_system: "", server_role: "", environment: "production", rack_location: "" };
const disposalOptions = [
  ["former_staff", "Former staff"],
  ["mss", "MSS"],
  ["current_staff", "Current staff"],
  ["sold", "Sold"],
  ["recycled_destroyed", "Recycled / destroyed"],
  ["other", "Other"],
] as const;
const disposalLabel = (value: string | null) => disposalOptions.find(([key]) => key === value)?.[1] || "Not recorded";
export default function Home() {
  const db = useMemo(() => createClient(), []);
  const [assets, setAssets] = useState<Asset[]>([]),
    [profile, setProfile] = useState<{ role: "admin" | "user"; employee_id: string | null } | null>(null),
    [account, setAccount] = useState({ name: "", email: "" }),
    [profileReady, setProfileReady] = useState(false),
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
    [disposalCategory, setDisposalCategory] = useState("all"),
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
    [disposedOpen, setDisposedOpen] = useState(false),
    [pageSize, setPageSize] = useState(5),
    [assetPage, setAssetPage] = useState(1),
    [spbAttentionPage, setSpbAttentionPage] = useState(1),
    [consultantAttentionPage, setConsultantAttentionPage] = useState(1),
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
    [consultantDetail, setConsultantDetail] = useState<{ name: string; company: string } | null>(null),
    [softwareEdit, setSoftwareEdit] = useState<SoftwareLicense | null | undefined>(undefined),
    [softwareForm, setSoftwareForm] = useState(emptySoftware),
    [softwareAssignmentLicense, setSoftwareAssignmentLicense] = useState<SoftwareLicense | null>(null),
    [accountEmail, setAccountEmail] = useState(""),
    [accountPassword, setAccountPassword] = useState(""),
    [accountPasswordConfirm, setAccountPasswordConfirm] = useState(""),
    [showAccountPassword, setShowAccountPassword] = useState(false),
    [accountEmployeeId, setAccountEmployeeId] = useState(""),
    [accountRole, setAccountRole] = useState<"admin" | "user">("user"),
    [accounts, setAccounts] = useState<{ id: string; email: string; role: "admin" | "user"; is_active: boolean; employees: { name: string } | null }[]>([]),
    [softwareAssignmentPage, setSoftwareAssignmentPage] = useState(1),
    [serverInfoAsset, setServerInfoAsset] = useState<Asset | null>(null),
    [serverForm, setServerForm] = useState(emptyServerInfo),
    [edit, setEdit] = useState<Asset | null | undefined>(undefined),
    [detail, setDetail] = useState<Asset | null>(null),
    [f, setF] = useState(empty);
  async function load() {
    setBusy(true);
    const canManage = profile?.role === "admin";
    const [a, p, l, s, sd, sa, linkedSoftware] = await Promise.all([
      db
        .from("assets")
        .select("*, employees(id,name,department)")
        .order("created_at", { ascending: false }),
      db.from("employees").select("id,name,department,office_location").order("name"),
      canManage ? db
        .from("maintenance_logs")
        .select("*")
        .order("logged_date", { ascending: false }) : Promise.resolve({ data: [], error: null }),
      canManage ? db.from("software_licenses").select("*").order("product_name") : Promise.resolve({ data: [], error: null }),
      canManage ? db.from("server_details").select("*") : Promise.resolve({ data: [], error: null }),
      canManage ? db.from("software_license_assignments").select("*") : Promise.resolve({ data: [], error: null }),
      canManage ? Promise.resolve({ data: [], error: null }) : db.rpc("get_viewer_employee_software"),
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
      const linked = linkedSoftware.data as { assignment_id: string; employee_id: string; software_license_id: string; assigned_at: string; product_name: string; company: string | null; license_type: string }[] | null;
      setSoftware(canManage ? (s.error ? [] : s.data as SoftwareLicense[]) : [...new Map((linked || []).map((item) => [item.software_license_id, { id: item.software_license_id, product_name: item.product_name, company: item.company || "SPB", license_type: item.license_type, vendor: null, total_seats: 0, assigned_seats: 0, renewal_date: null, annual_cost: null, notes: null }])).values()]);
      setServerDetails(sd.error ? [] : sd.data as ServerDetail[]);
      setSoftwareAssignments(canManage ? (sa.error ? [] : sa.data as SoftwareAssignment[]) : (linked || []).map((item) => ({ id: item.assignment_id, employee_id: item.employee_id, software_license_id: item.software_license_id, assigned_at: item.assigned_at, notes: null })));
      if (s.error) setNotice("Software Licences is still being set up. Hardware assets remain available.");
    }
    setBusy(false);
  }
  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await db.auth.getUser();
      if (!user) { window.location.assign("/login"); return; }
      setAccount({ name: String(user.user_metadata?.full_name || user.email?.split("@")[0] || "Admin"), email: user.email || "" });
      const { data, error } = await db.from("asset_app_users").select("role,employee_id").eq("id", user.id).single();
      if (error || !data) { setNotice("Your account has not been configured yet. Please contact SPB IT."); setProfile({ role: "user", employee_id: null }); }
      else setProfile(data as { role: "admin" | "user"; employee_id: string | null });
      setProfileReady(true);
    }
    loadProfile();
  }, [db]);
  useEffect(() => { if (profile) load(); }, [profile]);
  useEffect(() => { if (view === "users" && profile?.role === "admin") loadAccounts(); }, [view, profile]);
  const validAccountPassword = (password: string) => password.length >= 8 && password.length <= 12 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
  async function createStaffAccount(e: FormEvent) {
    e.preventDefault();
    if (accountPassword !== accountPasswordConfirm) return setNotice("The passwords do not match.");
    if (!validAccountPassword(accountPassword)) return setNotice("Use 8 to 12 characters, including an uppercase letter, lowercase letter and number.");
    const { data } = await db.auth.getSession();
    const response = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token || ""}` }, body: JSON.stringify({ email: accountEmail, password: accountPassword, employeeId: accountEmployeeId || null, role: accountRole }) });
    const result = await response.json();
    if (!response.ok) return setNotice(result.error || "Could not create the user account.");
    setAccountEmail(""); setAccountPassword(""); setAccountPasswordConfirm(""); setAccountEmployeeId(""); setAccountRole("user"); setNotice("User account created. They can now sign in with their email and password."); loadAccounts();
  }
  async function loadAccounts() {
    const { data } = await db.auth.getSession();
    const response = await fetch("/api/admin/users", { headers: { Authorization: `Bearer ${data.session?.access_token || ""}` } });
    const result = await response.json();
    if (response.ok) setAccounts(result.users || []); else setNotice(result.error || "Could not load user accounts.");
  }
  async function changeAccountRole(id: string, role: "admin" | "user") {
    const { data } = await db.auth.getSession();
    const response = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token || ""}` }, body: JSON.stringify({ id, role }) });
    const result = await response.json();
    if (!response.ok) return setNotice(result.error || "Could not update role.");
    setNotice("User role updated."); loadAccounts();
  }
  async function accountAction(id: string, action: "access" | "password", value?: boolean) {
    const password = action === "password" ? window.prompt("Enter a new temporary password (minimum 8 characters):") : undefined;
    if (action === "password" && !password) return;
    const { data } = await db.auth.getSession();
    const response = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token || ""}` }, body: JSON.stringify({ id, action, isActive: value, password }) });
    const result = await response.json();
    if (!response.ok) return setNotice(result.error || "Could not update the user.");
    setNotice(action === "password" ? "Password updated." : value ? "User access restored." : "User access removed."); loadAccounts();
  }
  const expired = (a: Asset) =>
    !!a.warranty_expiry &&
    new Date(a.warranty_expiry + "T00:00:00") < new Date();
  const laptopDueForReplacement = (a: Asset) => {
    if (a.asset_type !== "Laptop" || !a.purchase_date) return false;
    const replacementDate = new Date();
    replacementDate.setFullYear(replacementDate.getFullYear() - 4);
    return new Date(a.purchase_date + "T00:00:00") <= replacementDate;
  };
  const replacementStatus = (a: Asset) => {
    if (!a.purchase_date) return { label: "Not scheduled", detail: "Add a purchase date to calculate the 4-year replacement review.", due: false };
    const replacementDate = new Date(a.purchase_date + "T00:00:00");
    replacementDate.setFullYear(replacementDate.getFullYear() + 4);
    const due = replacementDate <= new Date();
    return {
      label: due ? "Replacement review due" : "Replacement review planned",
      detail: `Due ${replacementDate.toLocaleDateString("en-GB")}`,
      due,
    };
  };
  // The dashboard focuses on day-to-day end-user equipment.
  // Other hardware remains available in the Hardware Assets register.
  const dashboardDevices = assets.filter((a) => ["Laptop", "Desktop Computer", "Printer"].includes(a.asset_type));
  const spbAssets = dashboardDevices.filter((a) => a.assignment_kind !== "consultant");
  const consultantAssetsForDashboard = dashboardDevices.filter((a) => a.assignment_kind === "consultant");
  const ownershipStatus = (group: Asset[]) => [
    ["Active", group.filter((a) => a.status !== "disposed")],
    ["Assigned", group.filter((a) => a.status === "assigned")],
    ["Available", group.filter((a) => a.status === "available")],
    ["Under repair", group.filter((a) => a.status === "under_repair")],
    ["Disposed", group.filter((a) => a.status === "disposed")],
  ].map(([label, matching]) => ({
    label: label as string,
    laptops: (matching as Asset[]).filter((a) => a.asset_type === "Laptop").length,
    desktops: (matching as Asset[]).filter((a) => a.asset_type === "Desktop Computer").length,
    printers: (matching as Asset[]).filter((a) => a.asset_type === "Printer").length,
  }));
  const list = assets.filter(
    (a) =>
      (status === "all" || a.status === status) &&
      (assetScope !== "disposed" || disposalCategory === "all" || a.disposal_category === disposalCategory) &&
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
  const attentionGroups = [
    { key: "spb", label: "SPB", items: selectedAttention.filter((a) => a.assignment_kind !== "consultant"), page: spbAttentionPage, setPage: setSpbAttentionPage },
    { key: "consultant", label: "Consultants", items: selectedAttention.filter((a) => a.assignment_kind === "consultant"), page: consultantAttentionPage, setPage: setConsultantAttentionPage },
  ];
  const employeeList = people.filter((p) =>
    [p.name, p.department, p.office_location].filter(Boolean).join(" ").toLowerCase().includes(employeeQuery.toLowerCase()),
  );
  const consultantAssets = assets.filter((a) => a.assignment_kind === "consultant" && a.consultant_name);
  const consultantGroups = Array.from(consultantAssets.reduce((groups, asset) => {
    const name = asset.consultant_name || "Unnamed consultant";
    const company = asset.consultant_company || "";
    const key = `${name}\u0000${company}`;
    const group = groups.get(key) || { name, company, assets: [] as Asset[] };
    group.assets.push(asset);
    groups.set(key, group);
    return groups;
  }, new Map<string, { name: string; company: string; assets: Asset[] }>()).values()).sort((a, b) => a.name.localeCompare(b.name));
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
  const assignedName = (asset: Asset) => asset.assignment_kind === "consultant" ? asset.consultant_name || "Unassigned" : asset.employees?.name || "Unassigned";
  const exportAssets = () => exportCsv(`hardware-assets-${assetScope}-${type === "all" ? "all" : type.toLowerCase().replaceAll(" ", "-")}`, ["Asset tag", "Type", "Company", "Brand / model", "PC / device name", "Serial number", "Assigned to", "Assignment type", "Consultant company", "Location", "Purchase date", "Warranty expiry", "Condition", "Status", "Disposal category", "Disposed to / recipient", "Previous user", "Remarks / notes"], list.map((asset) => [asset.asset_tag, asset.asset_type, asset.company, asset.brand_model, asset.device_name, asset.serial_number, assignedName(asset), asset.assignment_kind === "consultant" ? "Consultant / external" : "SPB staff", asset.consultant_company, asset.location, asset.purchase_date, asset.warranty_expiry, asset.condition, asset.status.replaceAll("_", " "), disposalLabel(asset.disposal_category), asset.disposal_recipient, asset.previous_user, asset.notes]));
  const exportEmployees = () => exportCsv("employee-directory", ["Name", "Department", "Office location", "Assigned assets"], employeeList.map((person) => [person.name, person.department, person.office_location, assets.filter((asset) => asset.assigned_employee_id === person.id).length]));
  const exportConsultants = () => exportCsv("consultant-assignments", ["Consultant", "Consultant company", "Asset tag", "Type", "Brand / model", "Serial number", "Location", "Status"], consultantAssets.map((asset) => [asset.consultant_name, asset.consultant_company, asset.asset_tag, asset.asset_type, asset.brand_model, asset.serial_number, asset.location, asset.status.replaceAll("_", " ")]));
  const exportSoftware = () => exportCsv("software-licences", ["Company", "Software", "Vendor", "Licence type", "Total seats", "Assigned seats", "Available seats", "Named users", "Renewal date", "Annual cost (RM)", "Notes"], softwareList.map((licence) => { const named = assignmentsFor(licence.id).map((assignment) => people.find((person) => person.id === assignment.employee_id)?.name).filter(Boolean).join("; "); return [licence.company, licence.product_name, licence.vendor, licence.license_type, licence.total_seats, licence.assigned_seats, licence.total_seats - licence.assigned_seats, named, licence.renewal_date, licence.annual_cost, licence.notes]; }));
  const exportMaintenance = () => exportCsv("maintenance-history", ["Asset tag", "Brand / model", "Log type", "Description", "Logged date"], logs.map((log) => { const asset = assets.find((item) => item.id === log.asset_id); return [asset?.asset_tag || "Asset removed", asset?.brand_model || "", log.log_type, log.description, log.logged_date]; }));
  const exportServers = () => exportCsv("server-register", ["Asset tag", "Brand / model", "Serial number", "Hostname", "IP address", "Operating system", "Server role", "Environment", "Rack location", "Asset location", "Status"], assets.filter((asset) => asset.asset_type === "Server").map((asset) => { const info = serverDetails.find((item) => item.asset_id === asset.id); return [asset.asset_tag, asset.brand_model, asset.serial_number, info?.hostname, info?.ip_address, info?.operating_system, info?.server_role, info?.environment, info?.rack_location, asset.location, asset.status.replaceAll("_", " ")]; }));
  const exportAttention = () => exportCsv(`needs-attention-${attentionTab}`, ["Asset tag", "Brand / model", "Reason", "Assigned to", "Company", "Location", "Status", "Purchase date", "Warranty expiry"], selectedAttention.map((asset) => [asset.asset_tag, asset.brand_model, attentionReason(asset), assignedName(asset), asset.company, asset.location, asset.status.replaceAll("_", " "), asset.purchase_date, asset.warranty_expiry]));
  function openEmployee(p: Employee) {
    setEmployeeDetail(p);
    setEmployeeForm({ name: p.name, department: p.department || "", office_location: p.office_location || "" });
  }
  async function saveEmployee(e: React.FormEvent) {
    e.preventDefault();
    if (viewer || !employeeDetail || !employeeForm.name.trim()) return;
    const r = await db.from("employees").update({ name: employeeForm.name.trim(), department: employeeForm.department || null, office_location: employeeForm.office_location || null }).eq("id", employeeDetail.id);
    if (r.error) return setNotice(r.error.message);
    setEmployeeDetail(null);
    setNotice("Employee details saved.");
    load();
  }
  async function deleteEmployee() {
    if (viewer || !employeeDetail) return;
    const hardwareCount = assets.filter((asset) => asset.assigned_employee_id === employeeDetail.id).length;
    const softwareCount = softwareAssignments.filter((assignment) => assignment.employee_id === employeeDetail.id).length;
    if (hardwareCount || softwareCount) {
      return setNotice(`Cannot remove ${employeeDetail.name}: unassign or transfer ${hardwareCount} hardware item(s) and ${softwareCount} software licence(s) first.`);
    }
    if (!window.confirm(`Remove ${employeeDetail.name} from the employee directory? This cannot be undone.`)) return;
    const r = await db.from("employees").delete().eq("id", employeeDetail.id);
    if (r.error) return setNotice(r.error.message);
    setEmployeeDetail(null);
    setNotice("Employee removed from the directory.");
    load();
  }
  function openConsultant(consultant: { name: string; company: string }) {
    setConsultantDetail(consultant);
  }
  async function endConsultantAssignment() {
    if (viewer || !consultantDetail) return;
    const linkedAssets = consultantAssets.filter((asset) => asset.consultant_name === consultantDetail.name && (asset.consultant_company || "") === consultantDetail.company);
    if (!linkedAssets.length) return setNotice("No linked assets were found for this consultant.");
    if (!window.confirm(`End the assignment for ${consultantDetail.name}? ${linkedAssets.length} asset(s) will be returned to Available / Unassigned. The hardware records will be kept.`)) return;
    const r = await db.from("assets").update({ assignment_kind: "internal", consultant_name: null, consultant_company: null, assigned_employee_id: null, status: "available" }).in("id", linkedAssets.map((asset) => asset.id));
    if (r.error) return setNotice(r.error.message);
    setConsultantDetail(null);
    setNotice(`${linkedAssets.length} asset(s) returned to Available / Unassigned.`);
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
      disposal_category: a.disposal_category || "",
      disposal_recipient: a.disposal_recipient || "",
      status: a.status,
      notes: a.notes || "",
    });
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!f.asset_tag || !f.brand_model)
      return setNotice("Asset tag and brand/model are required.");
    let assignedEmployeeId: string | null = null;
    const isDisposed = f.status === "disposed";
    const assignedName = !isDisposed && f.assignment_kind === "internal" ? f.assigned_user.trim() : "";
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
      disposal_category: isDisposed ? f.disposal_category || null : null,
      disposal_recipient: isDisposed ? f.disposal_recipient.trim() || null : null,
      assigned_employee_id: isDisposed ? null : assignedEmployeeId,
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
  if (!profileReady) return <main className="user-portal"><p className="state">Checking your access…</p></main>;
  async function signOut() { await db.auth.signOut(); window.location.assign("/login"); }
  const isAdmin = profile?.role === "admin";
  const viewer = !isAdmin || accessView === "user";
  return (
    <><div className="account-bar"><div><b>•&nbsp; Hi {account.name}</b><small>{account.email}</small></div><div>{isAdmin ? <><button className={accessView === "user" ? "account-active" : ""} onClick={() => setAccessView("user")}>User view</button><button className={accessView === "admin" ? "account-active" : ""} onClick={() => setAccessView("admin")}>Admin console</button></> : <button className="account-active">User view</button>}<button onClick={signOut}>Sign out</button></div></div><main className={`app${viewer ? " viewer-console" : ""}`}>
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
              {scope === "spb" && <><button className="folder-toggle" aria-expanded={disposedOpen} onClick={() => setDisposedOpen(!disposedOpen)}><i>·</i>Disposed<b className="asset-count">{assets.filter(a => a.status === "disposed").length}</b><b className="nav-caret">{disposedOpen ? "−" : "+"}</b></button>{disposedOpen && <div className="assignment-subnav">{disposalOptions.map(([category, label]) => <button key={category} className={view === "assets" && assetScope === "disposed" && disposalCategory === category ? "selected" : ""} onClick={() => { setView("assets"); setAssetScope("disposed"); setType("all"); setStatus("disposed"); setDisposalCategory(category); setAssetPage(1); }}><i>·</i>{label}<b className="asset-count">{assets.filter(a => a.status === "disposed" && a.disposal_category === category).length}</b></button>)}</div>}</>}
              </>}
            </div>)}
          </div>}
          {([
            ["software", "◈", "Software Licences"],
            ["employees", "♙", "Employees"],
            ["consultants", "♧", "Consultants"],
            ["maintenance", "⚒", "Maintenance"],
            ["users", "♙", "User accounts"],
          ] as string[][]).filter(([item]) => !viewer || !["software", "maintenance", "users"].includes(item)).map(([item, icon, label]) => <button key={item} className={view === item ? "on" : ""} onClick={() => setView(item)}><i>{icon}</i>{label}</button>)}
        </nav>
      </aside>
      <section>
        <header>
          <div><em className={view === "dashboard" ? "dashboard-eyebrow" : undefined}>{view === "dashboard" ? "SPB IT ASSET MANAGEMENT · DASHBOARD" : viewer ? "SPB IT ASSET MANAGEMENT · AVAILABILITY" : `SPB IT OPERATIONS · ${view.toUpperCase()}`}</em><h1>{view === "assets" ? "Hardware assets" : view === "servers" ? "Server register" : view === "software" ? "Software licences" : view === "dashboard" ? "IT Asset Overview" : view === "employees" ? "Employees" : view === "users" ? "User accounts" : "Maintenance logs"}</h1><p>{view === "assets" ? "Register and manage laptops, computers, devices and peripherals." : view === "servers" ? "Keep each server's hardware record and technical information together." : view === "software" ? "Track subscriptions, licence seats, costs and renewal dates." : view === "employees" ? "Review people and their currently assigned assets." : view === "users" ? "Create sign-in access and link staff to their employee record." : view === "dashboard" ? "A summary of SPB and consultant laptops and desktops by current status." : "Asset repairs and service history."}</p></div>
          {!viewer && (view === "assets" || view === "dashboard") && <button onClick={() => newAsset()}>+ Register hardware</button>}
          {!viewer && view === "servers" && <button onClick={() => newAsset("Server")}>+ Register server</button>}
          {!viewer && view === "software" && <button onClick={newSoftware}>+ Add software licence</button>}
        </header>
        {notice && view !== "dashboard" && (
          <div className="notice">
            {notice}
            <span onClick={() => setNotice("")}>×</span>
          </div>
        )}
        {view === "dashboard" && <div className="ownership-stats">
          {[["SPB", spbAssets], ["Consultants", consultantAssetsForDashboard]].map(([label, group]) => <div className="ownership-card" key={label as string}><h2>{label as string}</h2><div>{ownershipStatus(group as Asset[]).map((item) => <span key={item.label}><strong>{item.label}</strong><small>Laptop <b>{item.laptops}</b></small><small>Desktop <b>{item.desktops}</b></small><small>Printer <b>{item.printers}</b></small></span>)}</div></div>)}
        </div>}
        {view === "users" && <div className="panel user-management"><div className="user-management-heading"><div><em>USER MANAGEMENT</em><h2>Registered users</h2><p>Create staff accounts, manage roles, reset passwords and remove access when needed.</p></div><div><span className="active-user-count">{accounts.filter((account) => account.is_active).length}<small>active</small></span><button className="plain" onClick={loadAccounts}>Refresh</button></div></div><form className="create-user-card" onSubmit={createStaffAccount}><em>NEW STAFF ACCOUNT</em><h3>Create staff account</h3><p>The user can sign in immediately. No confirmation email is sent.</p><div className="form"><label>Employee record<select value={accountEmployeeId} onChange={(e) => setAccountEmployeeId(e.target.value)}><option value="">Link later / no employee record</option>{people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select></label><label>Role<select value={accountRole} onChange={(e) => setAccountRole(e.target.value as "admin" | "user")}><option value="user">User — view only</option><option value="admin">Admin — full management</option></select></label><label className="wide">Office email<input required type="email" placeholder="name@company.com" value={accountEmail} onChange={(e) => setAccountEmail(e.target.value)} /></label><label>Temporary password<span className="account-password"><input required minLength={8} maxLength={12} type={showAccountPassword ? "text" : "password"} value={accountPassword} onChange={(e) => setAccountPassword(e.target.value)} /><button type="button" className="plain" onClick={() => setShowAccountPassword(!showAccountPassword)}>{showAccountPassword ? "Hide" : "Show"}</button></span></label><label>Confirm password<span className="account-password"><input required minLength={8} maxLength={12} type={showAccountPassword ? "text" : "password"} value={accountPasswordConfirm} onChange={(e) => setAccountPasswordConfirm(e.target.value)} /><button type="button" className="plain" onClick={() => setShowAccountPassword(!showAccountPassword)}>{showAccountPassword ? "Hide" : "Show"}</button></span></label></div><ul className="password-rules"><li>8 to 12 characters</li><li>One uppercase letter</li><li>One lowercase letter</li><li>One number</li></ul><div className="form-actions"><button type="submit">Create account</button><button className="plain" type="button" onClick={() => { setAccountEmail(""); setAccountPassword(""); setAccountPasswordConfirm(""); setAccountEmployeeId(""); setAccountRole("user"); }}>Cancel</button></div></form><div className="registered-user-list"><h3>Registered users</h3><p>Manage access, passwords and administrator roles.</p>{accounts.length ? <table><thead><tr><th>User</th><th>Office email</th><th>Role</th><th>Access</th></tr></thead><tbody>{accounts.map((account) => <tr key={account.id}><td><b>{account.employees?.name || "Not linked"}</b></td><td>{account.email}</td><td><select defaultValue={account.role} onChange={(e) => changeAccountRole(account.id, e.target.value as "admin" | "user")}><option value="user">User</option><option value="admin">Admin</option></select></td><td><button className="plain" onClick={() => accountAction(account.id, "password")}>Set new password</button><button className="plain" onClick={() => accountAction(account.id, "access", !account.is_active)}>{account.is_active ? "Remove access" : "Restore access"}</button></td></tr>)}</tbody></table> : <p className="state">Select Refresh to load user accounts.</p>}</div></div>}
        {view === "assets" && <div className="panel">
          <div className="title">
            <div>
              <h2>Hardware asset register</h2>
              <p>Laptops, computers, devices and peripherals saved to the live register.</p>
            </div>
            {!viewer && <div className="title-actions"><button className="plain" onClick={exportAssets}>Export Excel</button><button className="plain" onClick={load}>Refresh</button></div>}
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
                      {a.status === "disposed" && a.disposal_recipient ? (
                        <>
                          <b>{a.disposal_recipient}</b>
                          <small>{disposalLabel(a.disposal_category)}</small>
                        </>
                      ) : a.assignment_kind === "consultant" && a.consultant_name ? (
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
        {view === "servers" && <div className="panel"><div className="title"><div><h2>Server register</h2><p>Hostname, IP, operating system, role, environment and rack location.</p></div>{!viewer && <div className="title-actions"><button className="plain" onClick={exportServers}>Export Excel</button><button className="plain" onClick={load}>Refresh</button></div>}</div>{busy ? <p className="state">Loading servers…</p> : assets.filter((a) => a.asset_type === "Server").length ? <><table><thead><tr><th>Server</th><th>Hostname / IP address</th><th>System / role</th><th>Environment</th><th>Rack / location</th><th /></tr></thead><tbody>{pageItems(assets.filter((a) => a.asset_type === "Server"), serverPage).map((a) => { const info = serverDetails.find((x) => x.asset_id === a.id); return <tr key={a.id}><td><b>{a.asset_tag}</b><small>{a.brand_model} · {a.serial_number || "No serial"}</small></td><td><b>{info?.hostname || "Not set"}</b><small>{info?.ip_address || "IP not set"}</small></td><td><b>{info?.operating_system || "Not set"}</b><small>{info?.server_role || "Role not set"}</small></td><td>{info?.environment || "Not set"}</td><td><b>{info?.rack_location || "Not set"}</b><small>{a.location || "Asset location not set"}</small></td><td><button className="plain" onClick={() => openServerInfo(a)}>Server info</button></td></tr>; })}</tbody></table><Pager total={assets.filter((a) => a.asset_type === "Server").length} page={serverPage} setPage={setServerPage} pageSize={pageSize} setPageSize={changePageSize} /></> : <p className="state">No server assets yet. Register a server here, or edit an existing hardware asset and set its type to Server.</p>}</div>}
        {view === "dashboard" && <div className="panel employee-preview attention-full">
            <div className="title">
              <div>
                <h2>Needs attention</h2>
                <p>Repair, condition, warranty and replacement follow-up.</p>
              </div>
              {!viewer && <button className="plain" onClick={exportAttention}>Export Excel</button>}
            </div>
            <div className="attention-tabs">{attentionTabs.map(([key, label, items]) => <button key={key} className={attentionTab === key ? "on" : ""} onClick={() => { setAttentionTab(key); setSpbAttentionPage(1); setConsultantAttentionPage(1); }}>{label}<b>{items.length}</b></button>)}</div>
            <div className="attention-groups">{attentionGroups.map((group) => {
              const pages = Math.max(1, Math.ceil(group.items.length / 5));
              const items = group.items.slice((group.page - 1) * 5, group.page * 5);
              return <section className="attention-group" key={group.key}><header><h3>{group.label}</h3><small>{group.items.length} follow-up{group.items.length === 1 ? "" : "s"}</small></header>{items.length ? <><div>{items.map((a) => <a className="row" key={a.id} onClick={() => setDetail(a)}><i /><span><b>{a.asset_tag} · {a.brand_model}</b><small>{attentionReason(a)}</small></span><span className="attention-assignee"><small>{a.assignment_kind === "consultant" ? "Consultant" : "Assigned to"}</small><b>{a.assignment_kind === "consultant" ? a.consultant_name || "Unassigned" : a.employees?.name || "Unassigned"}</b></span></a>)}</div>{group.items.length > 5 && <div className="pager"><small>Showing {(group.page - 1) * 5 + 1}–{Math.min(group.page * 5, group.items.length)} of {group.items.length}</small><div><button className="plain" disabled={group.page === 1} onClick={() => group.setPage(group.page - 1)}>Previous</button><span>{group.page} / {pages}</span><button className="plain" disabled={group.page === pages} onClick={() => group.setPage(group.page + 1)}>Next</button></div></div>}</> : <p className="state">No {group.label.toLowerCase()} assets in this attention category.</p>}</section>;
            })}</div>
          </div>}
        {view === "employees" && <div className="panel employee-directory"><div className="title"><div><h2>Employee directory</h2><p>Search employee information and assigned assets. Select a name to view linked hardware.</p></div>{!viewer && <button className="plain" onClick={exportEmployees}>Export Excel</button>}</div><div className="filters"><input placeholder="Search name, department or office location" value={employeeQuery} onChange={(e) => { setEmployeeQuery(e.target.value); setEmployeePage(1); }} /></div>{employeeList.length ? <table><thead><tr><th>Name</th><th>Department</th><th>Office location</th><th>Assigned assets</th></tr></thead><tbody>{pageItems(employeeList, employeePage).map((p) => { const assigned = assets.filter(a => a.assigned_employee_id === p.id); return <tr key={p.id}><td><button type="button" className="employee-view-link" onClick={() => openEmployee(p)}>{p.name}</button></td><td>{p.department || "—"}</td><td>{p.office_location || "Not set"}</td><td>{assigned.length}</td></tr>; })}</tbody></table> : <p className="state">No employees match your search.</p>}{employeeList.length > 0 && <Pager total={employeeList.length} page={employeePage} setPage={setEmployeePage} pageSize={pageSize} setPageSize={changePageSize} />}</div>}
        {view === "consultants" && <div className="panel"><div className="title"><div><h2>Consultant assignments</h2><p>External people and companies holding SPB assets. Select a consultant to review linked hardware.</p></div>{!viewer && <button className="plain" onClick={exportConsultants}>Export Excel</button>}</div>{consultantGroups.length ? <table><thead><tr><th>Consultant</th><th>Company</th><th>Assigned assets</th><th>Location</th></tr></thead><tbody>{pageItems(consultantGroups, consultantPage).map((consultant) => <tr key={`${consultant.name}-${consultant.company}`}><td><button type="button" className="consultant-view-link" onClick={() => openConsultant(consultant)}>{consultant.name}</button></td><td>{consultant.company || "Not set"}</td><td>{consultant.assets.length}</td><td>{[...new Set(consultant.assets.map((asset) => asset.location).filter(Boolean))].join(", ") || "—"}</td></tr>)}</tbody></table> : <p className="state">No consultant assets yet.</p>}{consultantGroups.length > 0 && <Pager total={consultantGroups.length} page={consultantPage} setPage={setConsultantPage} pageSize={pageSize} setPageSize={changePageSize} />}</div>}
        {view === "software" && <div className="panel software-register"><div className="title"><div><h2>Software licence register</h2><p>Keep each company’s licences, seats, costs and renewal dates together.</p></div>{!viewer && <div className="title-actions"><button className="plain" onClick={exportSoftware}>Export Excel</button><button className="plain" onClick={load}>Refresh</button></div>}</div><div className="filters"><input placeholder="Search company, product, vendor or licence type" value={softwareQuery} onChange={(e) => { setSoftwareQuery(e.target.value); setSoftwarePage(1); }} /><select value={softwareCompany} onChange={(e) => { setSoftwareCompany(e.target.value); setSoftwarePage(1); }}><option value="all">All companies</option>{[...new Set(software.map(s => s.company).filter(Boolean))].sort().map(company => <option key={company}>{company}</option>)}</select></div>{softwareList.length ? <table><thead><tr><th>Company</th><th>Software</th><th>Licence type</th><th>Seats</th><th>Assigned staff</th><th>Renewal</th><th>Annual cost</th><th /></tr></thead><tbody>{pageItems(softwareList, softwarePage).map((s) => { const assignedPeople = assignmentsFor(s.id); return <tr key={s.id}><td><b>{s.company || "SPB"}</b></td><td><b>{s.product_name}</b><small>{s.vendor || "Vendor not set"}</small></td><td><Tag v={s.license_type} /></td><td><b>{s.assigned_seats} / {s.total_seats}</b><small>{s.total_seats - s.assigned_seats} available</small></td><td><b>{assignedPeople.length} named</b><small>{assignedPeople.length ? assignedPeople.map((a) => people.find((p) => p.id === a.employee_id)?.name).filter(Boolean).join(", ") : "No staff assigned"}</small></td><td>{s.renewal_date || "Not set"}</td><td>{s.annual_cost == null ? "—" : `RM ${s.annual_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</td><td><button className="plain" onClick={() => { setSoftwareAssignmentPage(1); setSoftwareAssignmentLicense(s); }}>Manage users</button><button className="plain" onClick={() => editSoftware(s)}>Edit</button></td></tr>; })}</tbody></table> : <p className="state">No software licences match your search.</p>}{softwareList.length > 0 && <Pager total={softwareList.length} page={softwarePage} setPage={setSoftwarePage} pageSize={pageSize} setPageSize={changePageSize} />}</div>}
        {view === "maintenance" && <div className="panel maintenance-list"><div className="title"><div><h2>Service history</h2><p>Repairs and maintenance entries across all assets.</p></div>{!viewer && <button className="plain" onClick={exportMaintenance}>Export Excel</button>}</div>{logs.length ? pageItems(logs, logPage).map((l) => { const asset = assets.find(a => a.id === l.asset_id); return <div className="log" key={l.id}><Tag v={l.log_type}/><span><b>{asset?.asset_tag || "Asset removed"}</b>{l.description}</span><small>{l.logged_date}</small></div>}) : <p className="state">No maintenance history yet.</p>}{logs.length > 0 && <Pager total={logs.length} page={logPage} setPage={setLogPage} pageSize={pageSize} setPageSize={changePageSize} />}</div>}
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
                {f.status !== "disposed" && <label>
                  Assignment type
                  <select value={f.assignment_kind} onChange={(e) => setF({ ...f, assignment_kind: e.target.value })}><option value="internal">Internal staff</option><option value="consultant">Consultant / external</option></select>
                </label>}
                {f.status !== "disposed" && (f.assignment_kind === "internal" ? <label>
                  Assigned user
                  <input list="employee-names" value={f.assigned_user} onChange={(e) => setF({ ...f, assigned_user: e.target.value })} placeholder="Search or type a new name" />
                  <datalist id="employee-names">{people.map((p) => <option key={p.id} value={p.name}>{p.department || "Employee"}</option>)}</datalist>
                  <small>New names are added to Employees when you save.</small>
                </label> : <Input l="Consultant name" v={f.consultant_name} set={(v) => setF({ ...f, consultant_name: v })} />)}
                {f.status !== "disposed" && f.assignment_kind === "consultant" && <Input l="Consultant company" v={f.consultant_company} set={(v) => setF({ ...f, consultant_company: v })} />}
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
                {f.status === "disposed" && <><label>
                  Disposal category
                  <select value={f.disposal_category} onChange={(e) => setF({ ...f, disposal_category: e.target.value })}><option value="">Select category…</option>{disposalOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                </label><Input l="Disposed to / recipient" v={f.disposal_recipient} set={(v) => setF({ ...f, disposal_recipient: v })} /></>}
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
              <div className="facts asset-summary-facts">
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
                {(() => { const replacement = replacementStatus(detail); return <div className={replacement.due ? "replacement-due" : "replacement-planned"}>Replacement<b>{replacement.label}</b><small>{replacement.detail}</small></div>; })()}
              </div>
              <h3>Remarks / notes</h3>
              <div className="remarks-detail">{detail.notes || "No remarks recorded for this asset."}</div>
              {detail.status === "disposed" && <><h3>Disposal details</h3><div className="facts"><div>Category<b>{disposalLabel(detail.disposal_category)}</b></div><div>Disposed to / recipient<b>{detail.disposal_recipient || "Not recorded"}</b></div></div></>}
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
              {!viewer && <><h3>Workflow</h3>
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
              )}</>}
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
              {!viewer && <div className="actions">
                <button className="plain" onClick={() => editing(detail)}>
                  Edit asset
                </button>
                <button className="delete" onClick={() => del(detail)}>
                  Delete asset
                </button>
              </div>}
            </div>
          </div>
        )}
        {softwareEdit !== undefined && <div className="modal"><form onSubmit={saveSoftware}><div className="title"><div><em>SOFTWARE LICENCE</em><h2>{softwareEdit ? "Edit software licence" : "Add software licence"}</h2></div><button className="x" type="button" onClick={() => setSoftwareEdit(undefined)}>×</button></div><div className="form"><label>Company / licence owner *<input list="software-companies" value={softwareForm.company} onChange={(e) => setSoftwareForm({ ...softwareForm, company: e.target.value })} /><datalist id="software-companies">{["SPB", "CCY", "ORI", "KAYIN", ...software.map(s => s.company).filter(Boolean)].filter((value, index, values) => values.indexOf(value) === index).map(company => <option key={company} value={company} />)}</datalist></label><Input l="Product name *" v={softwareForm.product_name} set={(v) => setSoftwareForm({ ...softwareForm, product_name: v })} /><Input l="Vendor" v={softwareForm.vendor} set={(v) => setSoftwareForm({ ...softwareForm, vendor: v })} /><label>Licence type<select value={softwareForm.license_type} onChange={(e) => setSoftwareForm({ ...softwareForm, license_type: e.target.value })}><option value="subscription">Subscription</option><option value="perpetual">Perpetual</option><option value="trial">Trial</option></select></label><Input l="Total seats" v={softwareForm.total_seats} set={(v) => setSoftwareForm({ ...softwareForm, total_seats: v })} /><Input l="Assigned seats" v={softwareForm.assigned_seats} set={(v) => setSoftwareForm({ ...softwareForm, assigned_seats: v })} /><label>Renewal date<input type="date" value={softwareForm.renewal_date} onChange={(e) => setSoftwareForm({ ...softwareForm, renewal_date: e.target.value })} /></label><Input l="Annual cost (RM)" v={softwareForm.annual_cost} set={(v) => setSoftwareForm({ ...softwareForm, annual_cost: v })} /><label className="wide">Notes<textarea value={softwareForm.notes} onChange={(e) => setSoftwareForm({ ...softwareForm, notes: e.target.value })} /></label></div><div className="actions">{softwareEdit && <button className="delete" type="button" onClick={() => deleteSoftware(softwareEdit)}>Delete licence</button>}<button className="plain" type="button" onClick={() => setSoftwareEdit(undefined)}>Cancel</button><button>Save licence</button></div></form></div>}
        {serverInfoAsset && <div className="modal"><form onSubmit={saveServerInfo}><div className="title"><div><em>SERVER INFORMATION</em><h2>{serverInfoAsset.asset_tag}</h2><p>{serverInfoAsset.brand_model}</p></div><button className="x" type="button" onClick={() => setServerInfoAsset(null)}>×</button></div><div className="form"><Input l="Hostname" v={serverForm.hostname} set={(v) => setServerForm({ ...serverForm, hostname: v })} /><Input l="IP address" v={serverForm.ip_address} set={(v) => setServerForm({ ...serverForm, ip_address: v })} /><Input l="Operating system" v={serverForm.operating_system} set={(v) => setServerForm({ ...serverForm, operating_system: v })} /><Input l="Server role" v={serverForm.server_role} set={(v) => setServerForm({ ...serverForm, server_role: v })} /><label>Environment<select value={serverForm.environment} onChange={(e) => setServerForm({ ...serverForm, environment: e.target.value })}><option value="production">Production</option><option value="uat">UAT</option><option value="development">Development</option><option value="disaster recovery">Disaster recovery</option></select></label><Input l="Rack / server location" v={serverForm.rack_location} set={(v) => setServerForm({ ...serverForm, rack_location: v })} /></div><div className="actions"><button className="plain" type="button" onClick={() => setServerInfoAsset(null)}>Cancel</button><button>Save server info</button></div></form></div>}
        {employeeDetail && <div className="modal"><form onSubmit={saveEmployee} className="employee-detail-form"><div className="title employee-detail-title"><div><em>EMPLOYEE DETAILS</em><h2>{employeeDetail.name}</h2><p>Profile, assigned hardware and software access.</p></div><button className="x" type="button" onClick={() => setEmployeeDetail(null)}>×</button></div><section className="employee-section"><h3>Profile</h3><div className="form"><Input l="Name *" v={employeeForm.name} set={(v) => setEmployeeForm({ ...employeeForm, name: v })} /><Input l="Department" v={employeeForm.department} set={(v) => setEmployeeForm({ ...employeeForm, department: v })} /><Input l="Office location" v={employeeForm.office_location} set={(v) => setEmployeeForm({ ...employeeForm, office_location: v })} /></div></section><section className="employee-section"><h3>Assigned hardware</h3><div className="employee-resource-list">{assets.filter(a => a.assigned_employee_id === employeeDetail.id).map(a => <div key={a.id}><span><b>{a.asset_tag}</b><small>{a.brand_model} · {a.status.replace("_", " ")}</small></span><button type="button" className="plain" onClick={() => { setEmployeeDetail(null); setDetail(a); }}>View</button></div>)}{!assets.some(a => a.assigned_employee_id === employeeDetail.id) && <small>No hardware currently assigned.</small>}</div></section><section className="employee-section"><div className="employee-section-heading"><h3>Software licences</h3><label>Add software licence<select defaultValue="" onChange={(e) => { const license = software.find((s) => s.id === e.target.value); if (license) assignSoftware(license, employeeDetail.id); e.currentTarget.value = ""; }}><option value="" disabled>Select software…</option>{software.filter((s) => !softwareAssignments.some((assignment) => assignment.employee_id === employeeDetail.id && assignment.software_license_id === s.id)).map((s) => <option key={s.id} value={s.id}>{s.company || "SPB"} · {s.product_name}</option>)}</select></label></div><div className="employee-resource-list">{softwareAssignments.filter((assignment) => assignment.employee_id === employeeDetail.id).map((assignment) => { const license = software.find((s) => s.id === assignment.software_license_id); return <div key={assignment.id}><span><b>{license?.product_name || "Software licence"}</b><small>{license?.company || "SPB"} · {license?.license_type || ""} · Assigned {new Date(assignment.assigned_at).toLocaleDateString()}</small></span><button className="plain" type="button" onClick={() => removeSoftwareAssignment(assignment.id)}>Remove</button></div>; })}{!softwareAssignments.some((assignment) => assignment.employee_id === employeeDetail.id) && <small>No software licences assigned.</small>}</div></section><div className="actions">{!viewer && <button className="delete" type="button" onClick={deleteEmployee}>Remove employee</button>}<button className="plain" type="button" onClick={() => setEmployeeDetail(null)}>Cancel</button>{!viewer && <button>Save details</button>}</div></form></div>}
        {consultantDetail && <div className="modal"><div className="detail employee-detail-form"><div className="title employee-detail-title"><div><em>CONSULTANT DETAILS</em><h2>{consultantDetail.name}</h2><p>{consultantDetail.company || "Company not set"} · Linked hardware</p></div><button className="x" type="button" onClick={() => setConsultantDetail(null)}>×</button></div><section className="employee-section"><h3>Assigned hardware</h3><div className="employee-resource-list">{consultantAssets.filter((asset) => asset.consultant_name === consultantDetail.name && (asset.consultant_company || "") === consultantDetail.company).map((asset) => <div key={asset.id}><span><b>{asset.asset_tag}</b><small>{asset.brand_model} · {asset.status.replace("_", " ")}</small></span><button type="button" className="plain" onClick={() => { setConsultantDetail(null); setDetail(asset); }}>View</button></div>)}</div></section><div className="actions">{!viewer && <button className="delete" type="button" onClick={endConsultantAssignment}>End consultant assignment</button>}<button className="plain" type="button" onClick={() => setConsultantDetail(null)}>Close</button></div></div></div>}
        {softwareAssignmentLicense && <div className="modal"><div className="detail">{(() => { const allAssignments = assignmentsFor(softwareAssignmentLicense.id).sort((a, b) => (people.find((person) => person.id === a.employee_id)?.name || "").localeCompare(people.find((person) => person.id === b.employee_id)?.name || "")); const pages = Math.max(1, Math.ceil(allAssignments.length / 5)); const shownAssignments = allAssignments.slice((softwareAssignmentPage - 1) * 5, softwareAssignmentPage * 5); return <><div className="title"><div><em>SOFTWARE ASSIGNMENTS</em><h2>{softwareAssignmentLicense.product_name}</h2><p>{softwareAssignmentLicense.company || "SPB"} · {allAssignments.length} named user(s) of {softwareAssignmentLicense.total_seats} seats</p></div><button className="x" onClick={() => setSoftwareAssignmentLicense(null)}>×</button></div><label>Assign to employee<select defaultValue="" onChange={(e) => { assignSoftware(softwareAssignmentLicense, e.target.value); e.currentTarget.value = ""; }}><option value="" disabled>Select employee…</option>{people.filter((person) => !allAssignments.some((assignment) => assignment.employee_id === person.id)).map((person) => <option key={person.id} value={person.id}>{person.name}{person.department ? ` — ${person.department}` : ""}</option>)}</select></label><h3>Assigned users</h3><div className="software-assignment-list">{shownAssignments.map((assignment) => <div key={assignment.id}><span><b>{people.find((person) => person.id === assignment.employee_id)?.name || "Employee removed"}</b><small>Assigned {new Date(assignment.assigned_at).toLocaleDateString()}</small></span><button className="plain" onClick={() => removeSoftwareAssignment(assignment.id)}>Remove</button></div>)}{!allAssignments.length && <small>No staff assigned to this licence yet.</small>}</div>{allAssignments.length > 5 && <div className="pager"><small>Showing {(softwareAssignmentPage - 1) * 5 + 1}–{Math.min(softwareAssignmentPage * 5, allAssignments.length)} of {allAssignments.length}</small><div><button className="plain" disabled={softwareAssignmentPage === 1} onClick={() => setSoftwareAssignmentPage(softwareAssignmentPage - 1)}>Previous</button><span>{softwareAssignmentPage} / {pages}</span><button className="plain" disabled={softwareAssignmentPage === pages} onClick={() => setSoftwareAssignmentPage(softwareAssignmentPage + 1)}>Next</button></div></div>}<div className="actions"><button className="plain" onClick={() => setSoftwareAssignmentLicense(null)}>Close</button></div></>; })()}</div></div>}
        <footer className="app-footer"><small>© 2026 Selangor Properties Sdn. Bhd. · Developed by IT Department</small></footer>
      </section>
    </main></>
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
