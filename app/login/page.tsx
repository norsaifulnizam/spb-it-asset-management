"use client";

import { FormEvent, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import "./login.css";

export default function LoginPage() {
  const db = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  async function resetPassword() {
    if (!email.trim()) return setMessage("Enter your email address first, then select Reset password.");
    const { error } = await db.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/login`,
    });
    setMessage(error ? error.message : "Password reset link sent. Please check your email.");
  }

  return <main className="login-page"><section className="login-card"><div className="login-brand"><strong>SPB</strong><span>IT Asset<br />Management</span></div><p className="eyebrow">SECURE STAFF ACCESS</p><h1>Sign in to your IT assets</h1><p className="login-copy">Use the email address and password created by IT.</p><form onSubmit={signIn}><label>Email address<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label><label>Password<input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /></label>{message && <p className="login-message">{message}</p>}<button disabled={saving}>{saving ? "Signing in…" : "Sign in"}</button></form><button className="reset-button" type="button" onClick={resetPassword}>Reset password</button><small>Your access is managed by SPB IT.</small></section></main>;
}
