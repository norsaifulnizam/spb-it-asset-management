"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Employee = { id: string; name: string; department: string | null; office_location: string | null };
type Asset = { id: string; asset_tag: string; asset_type: string; brand_model: string; serial_number: string | null; status: string; location: string | null };
type Licence = { id: string; product_name: string; company: string; license_type: string };

export default function StaffPortal({ employeeId }: { employeeId: string | null }) {
  const db = useMemo(() => createClient(), []);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [licences, setLicences] = useState<Licence[]>([]);
  const [message, setMessage] = useState("Loading your IT records…");

  useEffect(() => {
    if (!employeeId) { setMessage("Your account is not linked to an employee record yet. Please contact SPB IT."); return; }
    async function load() {
      const [person, hardware, assignments] = await Promise.all([
        db.from("employees").select("id,name,department,office_location").eq("id", employeeId).single(),
        db.from("assets").select("id,asset_tag,asset_type,brand_model,serial_number,status,location").order("asset_tag"),
        db.from("software_license_assignments").select("software_license_id"),
      ]);
      if (person.error || hardware.error || assignments.error) { setMessage("We could not load your IT records. Please contact SPB IT."); return; }
      setEmployee(person.data);
      setAssets(hardware.data || []);
      const ids = (assignments.data || []).map((item) => item.software_license_id);
      if (ids.length) {
        const { data } = await db.from("software_licenses").select("id,product_name,company,license_type").in("id", ids).order("product_name");
        setLicences(data || []);
      }
      setMessage("");
    }
    load();
  }, [db, employeeId]);

  async function signOut() { await db.auth.signOut(); window.location.assign("/login"); }
  return <main className="user-portal"><header><div><em>SPB IT ASSET MANAGEMENT · MY PORTAL</em><h1>My IT assets</h1><p>View-only access to the hardware and software assigned to you.</p></div><button className="plain" onClick={signOut}>Sign out</button></header>{message ? <p className="state">{message}</p> : <><div className="user-welcome"><b>{employee?.name}</b><span>{employee?.department || "Department not set"} · {employee?.office_location || "Office location not set"}</span></div><div className="user-grid"><section className="panel"><div className="title"><div><h2>My hardware</h2><p>{assets.length} item(s) assigned to you.</p></div></div><div className="user-resource-list">{assets.map((asset) => <div key={asset.id}><span><b>{asset.asset_tag}</b><small>{asset.brand_model} · {asset.asset_type}{asset.serial_number ? ` · SN: ${asset.serial_number}` : ""}</small></span><small>{asset.status.replaceAll("_", " ")}</small></div>)}{!assets.length && <p className="state">No hardware assigned.</p>}</div></section><section className="panel"><div className="title"><div><h2>My software licences</h2><p>{licences.length} licence(s) assigned to you.</p></div></div><div className="user-resource-list">{licences.map((licence) => <div key={licence.id}><span><b>{licence.product_name}</b><small>{licence.company || "SPB"} · {licence.license_type}</small></span></div>)}{!licences.length && <p className="state">No software licences assigned.</p>}</div></section></div></>}</main>;
}
