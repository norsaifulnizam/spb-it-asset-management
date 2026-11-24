import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    const admin = createAdminClient();
    const { data: auth, error: authError } = await admin.auth.getUser(token);
    if (authError || !auth.user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    const { data: caller } = await admin.from("asset_app_users").select("role,is_active").eq("id", auth.user.id).single();
    if (!caller?.is_active || caller.role !== "admin") return NextResponse.json({ error: "Only IT Admin can create user accounts." }, { status: 403 });

    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const employeeId = body.employeeId ? String(body.employeeId) : null;
    if (!email || password.length < 8) return NextResponse.json({ error: "Enter a valid email and a password of at least 8 characters." }, { status: 400 });
    const { data: created, error: createError } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (createError || !created.user) return NextResponse.json({ error: createError?.message || "Could not create the user." }, { status: 400 });
    const { error: profileError } = await admin.from("asset_app_users").upsert({ id: created.user.id, employee_id: employeeId, role: "user", is_active: true });
    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not create the user. Please contact IT Support." }, { status: 500 });
  }
}
