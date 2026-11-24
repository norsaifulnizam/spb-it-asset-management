import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return { error: "Not signed in." };
  const admin = createAdminClient();
  const { data: auth, error: authError } = await admin.auth.getUser(token);
  if (authError || !auth.user) return { error: "Not signed in." };
  const { data: caller } = await admin.from("asset_app_users").select("role,is_active").eq("id", auth.user.id).single();
  if (!caller?.is_active || caller.role !== "admin") return { error: "Only IT Admin can manage user accounts." };
  return { admin, callerId: auth.user.id };
}

export async function GET(request: NextRequest) {
  const access = await requireAdmin(request);
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: 403 });
  const [{ data: profiles, error }, { data: authUsers }] = await Promise.all([
    access.admin.from("asset_app_users").select("id,employee_id,role,is_active,employees(name)").order("created_at"),
    access.admin.auth.admin.listUsers({ perPage: 100 }),
  ]);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const emails = new Map((authUsers?.users || []).map((user) => [user.id, user.email || ""]));
  return NextResponse.json({ users: (profiles || []).map((profile: any) => ({ ...profile, email: emails.get(profile.id) || "" })) });
}

export async function POST(request: NextRequest) {
  try {
    const access = await requireAdmin(request);
    if ("error" in access) return NextResponse.json({ error: access.error }, { status: 403 });
    const admin = access.admin;

    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const employeeId = body.employeeId ? String(body.employeeId) : null;
    const role = body.role === "admin" ? "admin" : "user";
    if (!email || password.length < 8) return NextResponse.json({ error: "Enter a valid email and a password of at least 8 characters." }, { status: 400 });
    const { data: created, error: createError } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (createError || !created.user) return NextResponse.json({ error: createError?.message || "Could not create the user." }, { status: 400 });
    const { error: profileError } = await admin.from("asset_app_users").upsert({ id: created.user.id, employee_id: employeeId, role, is_active: true });
    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not create the user. Please contact IT Support." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const access = await requireAdmin(request);
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: 403 });
  const body = await request.json();
  const id = String(body.id || "");
  const role = body.role === "admin" ? "admin" : "user";
  if (!id) return NextResponse.json({ error: "User is required." }, { status: 400 });
  if (id === access.callerId && role !== "admin") return NextResponse.json({ error: "You cannot remove your own Admin role." }, { status: 400 });
  const { error } = await access.admin.from("asset_app_users").update({ role }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
