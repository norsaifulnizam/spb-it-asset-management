"use client";

import { FormEvent, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import "./login.css";

export default function LoginPage() {
  const db = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const { error } = await db.auth.signInWithPassword({ email: email.trim(), password });
    setSaving(false);
    if (error) return setMessage(error.message);
    window.location.assign("/");
  }

  return <main className="login-page"><section className="login-card"><div className="login-brand"><img src="/spsb-logo.png" alt="SPB" /><h1>IT Asset Management</h1><p>Selangor Properties Sdn. Bhd.</p></div><p className="login-copy">Sign in to view and manage IT assets.</p><form onSubmit={signIn}><label>Username<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="Email address" /></label><label>Password<span className="password-input"><input type={showPassword ? "text" : "password"} required value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /><button type="button" className="show-password" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button></span></label>{message && <p className="login-message">{message}</p>}<button className="sign-in-button" disabled={saving}>{saving ? "Signing in…" : "Sign in"}</button></form><small>© 2026 Selangor Properties Sdn. Bhd. · Developed by IT Department</small></section></main>;
}
