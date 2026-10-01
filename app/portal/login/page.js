"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import "../portal.css";

export default function PortalLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("");

    try {
      const supabase = getSupabase();
      const result =
        mode === "login"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });

      if (result.error) {
        setMsg(result.error.message);
        return;
      }

      if (mode === "signup" && !result.data.session) {
        setMsg("Account created. Check your email to confirm it, then sign in.");
        return;
      }

      router.push("/portal");
    } catch (error) {
      setMsg(error?.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function toggleMode() {
    setMode((current) => (current === "login" ? "signup" : "login"));
    setMsg("");
  }

  return (
    <main className="portalLogin">
      <div className="portalLoginArt">
        <Link href="/" className="portalBrand">
          TALENT<span>QUEST</span>
        </Link>

        <div>
          <span>YOUR JOURNEY</span>
          <h1>
            More than
            <br />
            a contestant.
            <br />
            <em>Build your moment.</em>
          </h1>
          <p>
            Track your application, follow competition rounds, monitor verified
            votes and manage the profile your supporters see.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="portalLoginCard">
        <span>CONTESTANT ACCESS</span>
        <h2>{mode === "login" ? "Welcome back." : "Create your account."}</h2>
        <p>
          {mode === "login"
            ? "Sign in to your private TalentQuest dashboard."
            : "Use the same email address you used for your TalentQuest application."}
        </p>

        <label>
          Email address
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label>
          Password
          <input
            required
            minLength={6}
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {msg && <div className="portalMessage">{msg}</div>}

        <button type="submit" disabled={busy}>
          {busy
            ? "Please wait…"
            : mode === "login"
              ? "Enter my dashboard →"
              : "Create contestant account →"}
        </button>

        <small>
          {mode === "login" ? "New here?" : "Already registered?"}{" "}
          <button type="button" className="portalModeSwitch" onClick={toggleMode}>
            {mode === "login" ? "Create account" : "Sign in"}
          </button>
        </small>
      </form>
    </main>
  );
}
