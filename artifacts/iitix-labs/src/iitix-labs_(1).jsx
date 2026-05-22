import { useState, useEffect, useRef } from "react";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const C = {
  navy: "#0a1628",
  navyMid: "#0d1f3c",
  navyLight: "#132447",
  cyan: "#00b4d8",
  cyanSoft: "#90e0ef",
  cyanGlow: "rgba(0,180,216,0.12)",
  white: "#f8fafc",
  gray50: "#f1f5f9",
  gray100: "#e2e8f0",
  gray300: "#94a3b8",
  gray500: "#64748b",
  gray700: "#334155",
  accent: "#38bdf8",
  accentAlt: "#0ea5e9",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  glass: "rgba(255,255,255,0.04)",
  glassBorder: "rgba(255,255,255,0.08)",
};

const s = {
  app: { minHeight: "100vh", background: C.navy, color: C.white, fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", display: "flex" },
  sidebar: { width: 220, minHeight: "100vh", background: C.navyMid, borderRight: `1px solid ${C.glassBorder}`, display: "flex", flexDirection: "column", flexShrink: 0 },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "auto" },
  topbar: { height: 56, background: C.navyMid, borderBottom: `1px solid ${C.glassBorder}`, display: "flex", alignItems: "center", padding: "0 28px", gap: 16, flexShrink: 0 },
  content: { flex: 1, padding: 28, overflowY: "auto" },
  card: { background: C.glass, border: `1px solid ${C.glassBorder}`, borderRadius: 12, padding: 20, transition: "all 0.2s ease", cursor: "default" },
  cardElevated: { background: "rgba(255,255,255,0.06)", border: `1px solid ${C.glassBorder}`, borderRadius: 12, padding: 20 },
  label: { fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: C.gray300 },
  h1: { fontSize: 22, fontWeight: 300, letterSpacing: "-0.01em", color: C.white, margin: 0 },
  h2: { fontSize: 16, fontWeight: 500, color: C.white, margin: 0 },
  h3: { fontSize: 13, fontWeight: 600, color: C.gray300, margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" },
  muted: { fontSize: 13, color: C.gray300 },
  input: { width: "100%", background: "rgba(255,255,255,0.06)", border: `1px solid ${C.glassBorder}`, borderRadius: 8, padding: "10px 14px", color: C.white, fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border 0.2s" },
  btn: { background: C.cyan, color: C.navy, border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer", letterSpacing: "0.02em", transition: "all 0.2s" },
  btnOutline: { background: "transparent", color: C.cyan, border: `1px solid ${C.cyan}`, borderRadius: 8, padding: "10px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "all 0.2s" },
  btnGhost: { background: "transparent", color: C.gray300, border: `1px solid ${C.glassBorder}`, borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", transition: "all 0.2s" },
  badge: (color = C.cyan) => ({ display: "inline-block", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${color}22`, color: color, border: `1px solid ${color}44`, letterSpacing: "0.04em" }),
  tag: (color = C.cyan) => ({ display: "inline-block", padding: "3px 10px", borderRadius: 6, fontSize: 12, background: `${color}18`, color: color, border: `1px solid ${color}30` }),
};

const store = {
  get: (k, def) => { try { const v = localStorage.getItem("iitix_" + k); return v ? JSON.parse(v) : def; } catch { return def; } },
  set: (k, v) => { try { localStorage.setItem("iitix_" + k, JSON.stringify(v)); } catch {} },
};

// ─── POMODORO TIMER ──────────────────────────────────────────────────────────
const POMODORO_PRESETS = {
  "Deep Work": { work: 50, rest: 10, color: C.cyan },
  "Revision Sprint": { work: 30, rest: 5, color: C.success },
  "DPP Assault": { work: 90, rest: 15, color: C.warning },
  "Recovery Cycle": { work: 25, rest: 5, color: C.accentAlt },
};

function PomodoroTimer() {
  const [mode, setMode] = useState("Deep Work");
  const [phase, setPhase] = useState("work");
  const [totalSeconds, setTotalSeconds] = useState(POMODORO_PRESETS[mode].work * 60);
  const [remaining, setRemaining] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          setPhase(phase === "work" ? "rest" : "work");
          const nextDuration = phase === "work" ? POMODORO_PRESETS[mode].rest : POMODORO_PRESETS[mode].work;
          setTotalSeconds(nextDuration * 60);
          return nextDuration * 60;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isRunning, phase, mode]);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setPhase("work");
    setIsRunning(false);
    setTotalSeconds(POMODORO_PRESETS[newMode].work * 60);
    setRemaining(POMODORO_PRESETS[newMode].work * 60);
  };

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = ((totalSeconds - remaining) / totalSeconds) * 100;
  const preset = POMODORO_PRESETS[mode];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, "@media (max-width: 768px)": { gridTemplateColumns: "1fr" } }}>
        {Object.entries(POMODORO_PRESETS).map(([name, cfg]) => (
          <button key={name} onClick={() => handleModeChange(name)} style={{
            ...s.btnGhost, textAlign: "left", padding: 16, borderColor: mode === name ? cfg.color : C.glassBorder,
            background: mode === name ? `${cfg.color}12` : "transparent", color: mode === name ? cfg.color : C.gray300,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{name}</div>
            <div style={{ fontSize: 11, color: C.gray500 }}>{cfg.work}/{cfg.rest} min</div>
          </button>
        ))}
      </div>

      <div style={{ ...s.card, background: `linear-gradient(135deg, rgba(0,180,216,0.08), rgba(13,31,60,0.5))`, border: `1px solid ${preset.color}40`, textAlign: "center", padding: 40 }}>
        <div style={{ ...s.label, marginBottom: 12, color: preset.color }}>{phase === "work" ? "FOCUS TIME" : "REST TIME"}</div>
        <div style={{ fontSize: 56, fontWeight: 200, color: preset.color, letterSpacing: "-0.02em", marginBottom: 12, fontVariantNumeric: "tabular-nums" }}>
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </div>
        <div style={{ height: 3, background: C.glass, borderRadius: 2, marginBottom: 20, overflow: "hidden" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: preset.color, transition: "width 0.1s linear" }} />
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={() => setIsRunning(!isRunning)} style={{ ...s.btn, background: preset.color, padding: "10px 28px" }}>
            {isRunning ? "Pause" : "Start"}
          </button>
          <button onClick={() => { setIsRunning(false); setPhase("work"); setTotalSeconds(POMODORO_PRESETS[mode].work * 60); setRemaining(POMODORO_PRESETS[mode].work * 60); }} style={{ ...s.btnOutline, borderColor: preset.color, color: preset.color }}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── STOPWATCH / SESSION TIMER ───────────────────────────────────────────────
function Stopwatch() {
  const [totalMillis, setTotalMillis] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionLabel, setSessionLabel] = useState("Physics");
  const [sessions, setSessions] = useState(store.get("sessions", []));
  const intervalRef = useRef(null);
  const labels = ["Physics", "Chemistry", "Mathematics", "Revision", "Mock Test"];

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => setTotalMillis(t => t + 100), 100);
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const hours = Math.floor(totalMillis / 3600000);
  const mins = Math.floor((totalMillis % 3600000) / 60000);
  const secs = Math.floor((totalMillis % 60000) / 1000);
  const ms = Math.floor((totalMillis % 1000) / 100);

  const saveSession = () => {
    const newSession = { label: sessionLabel, duration: totalMillis, timestamp: Date.now() };
    setSessions([...sessions, newSession]);
    store.set("sessions", [...sessions, newSession]);
    setTotalMillis(0);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 12 }}>
        {labels.map(l => (
          <button key={l} onClick={() => setSessionLabel(l)} style={{
            ...s.btnGhost, padding: 12, borderColor: sessionLabel === l ? C.cyan : C.glassBorder,
            background: sessionLabel === l ? `${C.cyan}12` : "transparent", color: sessionLabel === l ? C.cyan : C.gray300,
          }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ ...s.card, background: "linear-gradient(135deg, rgba(10,22,40,0.8), rgba(13,31,60,0.6))", border: `1px solid ${C.cyan}30`, textAlign: "center", padding: 48, boxShadow: "inset 0 2px 8px rgba(0,0,0,0.5)" }}>
        <div style={{ fontSize: 11, color: C.gray500, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.1em" }}>Session Time</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 0, fontVariantNumeric: "tabular-nums", fontFamily: "'Courier New', monospace" }}>
          {hours > 0 && <div style={{ fontSize: 48, fontWeight: 300, color: C.cyan, letterSpacing: "0.05em" }}>{String(hours).padStart(2, "0")}</div>}
          {hours > 0 && <div style={{ fontSize: 48, fontWeight: 300, color: C.gray500, margin: "0 4px" }}>:</div>}
          <div style={{ fontSize: 48, fontWeight: 300, color: C.cyan, letterSpacing: "0.05em" }}>{String(mins).padStart(2, "0")}</div>
          <div style={{ fontSize: 48, fontWeight: 300, color: C.gray500, margin: "0 4px" }}>:</div>
          <div style={{ fontSize: 48, fontWeight: 300, color: C.cyan, letterSpacing: "0.05em" }}>{String(secs).padStart(2, "0")}</div>
          <div style={{ fontSize: 32, fontWeight: 300, color: C.gray500, margin: "0 4px", alignSelf: "flex-end", marginBottom: 8 }}>.{ms}</div>
        </div>
        <div style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={() => setIsRunning(!isRunning)} style={{ ...s.btn, background: C.cyan, padding: "10px 28px" }}>
            {isRunning ? "Pause" : "Start"}
          </button>
          <button onClick={() => setTotalMillis(0)} style={{ ...s.btnOutline, borderColor: C.cyan, color: C.cyan }}>
            Reset
          </button>
          {totalMillis > 0 && (
            <button onClick={saveSession} style={{ ...s.btn, background: C.success, padding: "10px 28px" }}>
              Save Session
            </button>
          )}
        </div>
      </div>

      {sessions.length > 0 && (
        <div style={s.card}>
          <div style={{ ...s.h3, marginBottom: 16 }}>Session Log</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sessions.slice(-5).reverse().map((session, i) => {
              const h = Math.floor(session.duration / 3600000);
              const m = Math.floor((session.duration % 3600000) / 60000);
              return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.glassBorder}`, fontSize: 13 }}>
                  <span style={{ ...s.tag(C.cyan), fontSize: 11 }}>{session.label}</span>
                  <span style={{ color: C.white }}>{h > 0 ? h + "h " : ""}{m}m</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── FOCUS SYSTEMS PAGE ──────────────────────────────────────────────────────
function FocusSystemsPage() {
  const [activeTab, setActiveTab] = useState("pomodoro");
  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 28, borderBottom: `1px solid ${C.glassBorder}`, paddingBottom: 12 }}>
        {["pomodoro", "stopwatch"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: "8px 16px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500,
            background: activeTab === tab ? `${C.cyan}20` : "transparent", color: activeTab === tab ? C.cyan : C.gray300,
            borderBottom: activeTab === tab ? `2px solid ${C.cyan}` : "none", transition: "all 0.2s",
          }}>
            {tab === "pomodoro" ? "Pomodoro Timer" : "Stopwatch"}
          </button>
        ))}
      </div>
      {activeTab === "pomodoro" && <PomodoroTimer />}
      {activeTab === "stopwatch" && <Stopwatch />}
    </div>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
function LandingPage({ onLogin, onSignup }) {
  const [t, setT] = useState(0);
  useEffect(() => { const id = setInterval(() => setT(p => p + 1), 80); return () => clearInterval(id); }, []);
  const particles = useRef(Array.from({ length: 18 }, (_, i) => ({
    x: Math.random() * 100, y: Math.random() * 100, r: 1 + Math.random() * 2,
    dx: (Math.random() - 0.5) * 0.015, dy: (Math.random() - 0.5) * 0.015,
  }))).current;
  particles.forEach(p => { p.x = (p.x + p.dx + 100) % 100; p.y = (p.y + p.dy + 100) % 100; });

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${C.navy} 0%, #060e1f 100%)`, display: "flex", flexDirection: "column", fontFamily: "'Segoe UI', system-ui, sans-serif", overflow: "hidden", position: "relative" }}>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06 }} preserveAspectRatio="xMidYMid slice">
        <defs><pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M 48 0 L 0 0 0 48" fill="none" stroke={C.cyan} strokeWidth="0.5" /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        {particles.map((p, i) => <circle key={i} cx={`${p.x}%`} cy={`${p.y}%`} r={p.r} fill={C.cyan} opacity={0.18} />)}
      </svg>
      <div style={{ position: "absolute", top: "20%", left: "15%", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, rgba(0,180,216,0.07) 0%, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "15%", right: "10%", width: 320, height: 320, borderRadius: "50%", background: `radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)`, pointerEvents: "none" }} />

      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 48px", position: "relative", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${C.cyan}, ${C.accentAlt})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: C.navy }}>IX</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: "0.12em", color: C.white }}>IITIX LABS</div>
            <div style={{ fontSize: 9, letterSpacing: "0.18em", color: C.gray300, textTransform: "uppercase" }}>Operational Intelligence</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{ ...s.btnGhost, color: C.white }} onClick={onLogin}>Sign In</button>
          <button style={{ ...s.btn }} onClick={onSignup}>Create Account</button>
        </div>
      </nav>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "60px 24px", position: "relative", zIndex: 10 }}>
        <div style={{ ...s.badge(), marginBottom: 24, fontSize: 11, letterSpacing: "0.12em" }}>PREPARATION COMMAND CENTER v2.5</div>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 200, letterSpacing: "-0.03em", color: C.white, lineHeight: 1.1, margin: "0 0 16px", maxWidth: 720 }}>
          Operational Intelligence<br />
          <span style={{ fontWeight: 600, color: C.cyan }}>for Serious Aspirants</span>
        </h1>
        <p style={{ fontSize: 16, color: C.gray300, maxWidth: 540, lineHeight: 1.7, margin: "0 0 44px" }}>
          A disciplined command center for JEE and NEET preparation. Track focus systems, manage assessments, analyze performance with enterprise-grade intelligence.
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <button style={{ ...s.btn, padding: "14px 36px", fontSize: 15 }} onClick={onSignup}>Begin Setup</button>
          <button style={{ ...s.btnOutline, padding: "14px 36px", fontSize: 15 }} onClick={onLogin}>Access Dashboard</button>
        </div>

        <div style={{ display: "flex", gap: 48, marginTop: 72, flexWrap: "wrap", justifyContent: "center" }}>
          {[["Focus Timers", "4"], ["Analytics", "8+"], ["Study Plans", "Unlimited"]].map(([label, val]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 200, color: C.cyan, letterSpacing: "-0.02em" }}>{val}</div>
              <div style={{ fontSize: 12, color: C.gray300, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── AUTH & ONBOARDING (unchanged structure, improved styling) ───────────────
function AuthCard({ title, subtitle, children }) {
  return (
    <div style={{ minHeight: "100vh", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ width: 400, background: C.navyMid, border: `1px solid ${C.glassBorder}`, borderRadius: 16, padding: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={{ width: 32, height: 32, borderRadius: 6, background: `linear-gradient(135deg, ${C.cyan}, ${C.accentAlt})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: C.navy }}>IX</div>
          <span style={{ fontWeight: 700, letterSpacing: "0.1em", color: C.white, fontSize: 14 }}>IITIX LABS</span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 300, color: C.white, marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 13, color: C.gray300, marginBottom: 28 }}>{subtitle}</div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, ...props }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ ...s.label, display: "block", marginBottom: 6 }}>{label}</label>
      <input style={s.input} {...props} />
    </div>
  );
}

function LoginPage({ onLogin, onSignup, onForgot, onBack }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const handle = () => {
    const users = store.get("users", []);
    const u = users.find(u => u.email === email && u.password === pass);
    if (u) { store.set("currentUser", u.id); onLogin(u); }
    else setErr("Invalid credentials.");
  };

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to your workspace">
      <FormField label="Email" type="email" placeholder="name@domain.com" value={email} onChange={e => setEmail(e.target.value)} />
      <FormField label="Password" type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} />
      {err && <div style={{ color: C.danger, fontSize: 13, marginBottom: 12 }}>{err}</div>}
      <button style={{ ...s.btn, width: "100%", padding: 12, marginBottom: 16 }} onClick={handle}>Sign In</button>
      <div style={{ textAlign: "center", fontSize: 13, color: C.gray300 }}>
        <span style={{ cursor: "pointer", color: C.cyan }} onClick={onSignup}>Create account</span> · <span style={{ cursor: "pointer" }} onClick={onBack}>← Home</span>
      </div>
    </AuthCard>
  );
}

function SignupPage({ onSignup, onLogin, onBack }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [err, setErr] = useState("");
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handle = () => {
    if (!form.name || !form.email || !form.password) { setErr("All fields required."); return; }
    if (form.password !== form.confirm) { setErr("Passwords don't match."); return; }
    const users = store.get("users", []);
    if (users.find(u => u.email === form.email)) { setErr("Account exists."); return; }
    const id = "OPS-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const user = { id, name: form.name, email: form.email, password: form.password, createdAt: Date.now() };
    store.set("users", [...users, user]);
    store.set("currentUser", id);
    onSignup(user);
  };

  return (
    <AuthCard title="Create account" subtitle="Begin preparation">
      <FormField label="Full Name" placeholder="Your Name" value={form.name} onChange={f("name")} />
      <FormField label="Email" type="email" placeholder="name@domain.com" value={form.email} onChange={f("email")} />
      <FormField label="Password" type="password" placeholder="Min. 8 chars" value={form.password} onChange={f("password")} />
      <FormField label="Confirm" type="password" placeholder="Re-enter" value={form.confirm} onChange={f("confirm")} />
      {err && <div style={{ color: C.danger, fontSize: 13, marginBottom: 12 }}>{err}</div>}
      <button style={{ ...s.btn, width: "100%", padding: 12, marginBottom: 16 }} onClick={handle}>Create Account</button>
      <div style={{ textAlign: "center", fontSize: 13, color: C.gray300 }}>
        <span style={{ cursor: "pointer", color: C.cyan }} onClick={onLogin}>Sign in</span> · <span style={{ cursor: "pointer" }} onClick={onBack}>← Home</span>
      </div>
    </AuthCard>
  );
}

function Onboarding({ user, onComplete }) {
  const steps = [
    { key: "exam", label: "Target Exam", question: "Which exam are you targeting?", options: ["JEE Main + Advanced", "NEET UG", "JEE Main Only"] },
    { key: "year", label: "Target Year", question: "What is your target year?", options: ["2025", "2026", "2027", "2028"] },
    { key: "coaching", label: "Coaching Mode", question: "Your coaching setup?", options: ["Full-time Institute", "Online Only", "Self-Study", "Hybrid"] },
    { key: "weakSubject", label: "Focus Area", question: "Which subject needs most focus?", options: ["Physics", "Chemistry", "Mathematics", "Biology"] },
    { key: "dailyHours", label: "Daily Capacity", question: "Study hours per day?", options: ["4-6 hours", "6-8 hours", "8-10 hours", "10+ hours"] },
    { key: "targetRank", label: "Target Rank", question: "What's your target rank?", options: ["Top 100", "Top 500", "Top 1000", "Top 5000"] },
  ];

  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  const select = val => {
    const nd = { ...data, [steps[step].key]: val };
    setData(nd);
    if (step < steps.length - 1) setStep(step + 1);
    else {
      store.set("profile_" + user.id, { ...nd, userId: user.id, completedAt: Date.now() });
      onComplete(nd);
    }
  };

  const cur = steps[step];
  const progress = (step / steps.length) * 100;
  return (
    <div style={{ minHeight: "100vh", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ width: 520, background: C.navyMid, border: `1px solid ${C.glassBorder}`, borderRadius: 16, padding: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ ...s.label }}>Setup — Step {step + 1} of {steps.length}</span>
          <span style={{ fontSize: 12, color: C.gray300 }}>{Math.round(progress)}%</span>
        </div>
        <div style={{ height: 3, background: C.glass, borderRadius: 2, marginBottom: 36 }}>
          <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${C.cyan}, ${C.accentAlt})`, borderRadius: 2, transition: "width 0.3s" }} />
        </div>
        <div style={{ ...s.badge(C.cyan), marginBottom: 16 }}>{cur.label}</div>
        <div style={{ fontSize: 20, fontWeight: 300, color: C.white, marginBottom: 28 }}>{cur.question}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {cur.options.map(opt => (
            <button key={opt} onClick={() => select(opt)} style={{
              background: data[cur.key] === opt ? `${C.cyan}18` : C.glass, border: `1px solid ${data[cur.key] === opt ? C.cyan : C.glassBorder}`,
              borderRadius: 10, padding: "14px 18px", color: C.white, fontSize: 14, cursor: "pointer", textAlign: "left", transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <span style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${data[cur.key] === opt ? C.cyan : C.gray500}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {data[cur.key] === opt && <span style={{ width: 10, height: 10, borderRadius: "50%", background: C.cyan }} />}
              </span>
              {opt}
            </button>
          ))}
        </div>
        {step > 0 && <button onClick={() => setStep(step - 1)} style={{ ...s.btnGhost, marginTop: 24, fontSize: 13 }}>← Back</button>}
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "⬡" },
  { id: "focus", label: "Focus Systems", icon: "◉" },
  { id: "operations", label: "Operations", icon: "◈" },
  { id: "analytics", label: "Analytics", icon: "▣" },
  { id: "assessments", label: "Assessments", icon: "⬜" },
  { id: "reports", label: "Reports", icon: "▤" },
  { id: "profile", label: "Profile", icon: "◯" },
];

function Sidebar({ active, onNav, user, profile }) {
  return (
    <div style={s.sidebar}>
      <div style={{ padding: "20px 16px 16px", borderBottom: `1px solid ${C.glassBorder}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 6, background: `linear-gradient(135deg, ${C.cyan}, ${C.accentAlt})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: C.navy }}>IX</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", color: C.white }}>IITIX LABS</div>
            <div style={{ fontSize: 9, color: C.gray300, letterSpacing: "0.1em" }}>COMMAND CENTER</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "8px 8px", flex: 1 }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => onNav(n.id)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer",
            background: active === n.id ? `${C.cyan}14` : "transparent", color: active === n.id ? C.cyan : C.gray300,
            fontSize: 13, textAlign: "left", marginBottom: 2, borderLeft: active === n.id ? `2px solid ${C.cyan}` : "2px solid transparent",
            transition: "all 0.15s",
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </div>

      <div style={{ padding: 12, borderTop: `1px solid ${C.glassBorder}`, fontSize: 11 }}>
        <div style={{ color: C.gray500, marginBottom: 4, letterSpacing: "0.06em" }}>OPERATOR</div>
        <div style={{ fontSize: 13, color: C.white, fontWeight: 500, marginBottom: 2 }}>{user?.name}</div>
        <div style={{ fontSize: 11, color: C.cyan, letterSpacing: "0.04em", marginBottom: 6 }}>{user?.id}</div>
        {profile?.exam && <div style={{ ...s.badge(C.cyan), fontSize: 10 }}>{profile.exam}</div>}
        <div style={{ fontSize: 10, color: C.gray500, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.glassBorder}` }}>Engineered by Debaprasad Datta</div>
      </div>
    </div>
  );
}

function TopBar({ page, user, onLogout }) {
  const labels = { dashboard: "Command Dashboard", focus: "Focus Systems", operations: "Operations Center", analytics: "Analytical Core", assessments: "Assessment System", reports: "Strategic Reports", profile: "Operator Profile" };
  return (
    <div style={s.topbar}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: C.white }}>{labels[page] || page}</div>
        <div style={{ fontSize: 11, color: C.gray300, letterSpacing: "0.04em" }}>IITIX LABS · Operational Intelligence</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ fontSize: 12, color: C.gray300 }}>{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</div>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${C.cyan}22`, border: `1px solid ${C.cyan}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: C.cyan, fontWeight: 600 }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <button onClick={onLogout} style={{ ...s.btnGhost, padding: "6px 12px", fontSize: 12 }}>Sign out</button>
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, color = C.cyan, icon }) {
  return (
    <div style={{ ...s.card, borderTop: `2px solid ${color}`, transition: "all 0.2s" }}>
      <div style={{ ...s.label, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 200, color, letterSpacing: "-0.02em", marginBottom: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.gray300 }}>{sub}</div>}
    </div>
  );
}

function SectionHeader({ title, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
      <h2 style={{ ...s.h2 }}>{title}</h2>
      {action}
    </div>
  );
}

// ─── DASHBOARD PAGE ──────────────────────────────────────────────────────────
function DashboardPage({ user, profile, userId }) {
  const tasks = store.get("tasks_" + userId, []);
  const tests = store.get("tests_" + userId, []);
  const perf = store.get("perf_" + userId, []);

  const completedTasks = tasks.filter(t => t.status === "done").length;
  const totalTasks = tasks.length;
  const upcomingTests = tests.filter(t => !t.result).length;

  const today = new Date();
  const examYear = parseInt(profile?.year || "2027");
  const daysLeft = Math.max(0, Math.ceil((new Date(examYear, 3, 20) - today) / 86400000));

  const avgSleep = perf.length ? (perf.reduce((a, b) => a + (b.sleep || 0), 0) / perf.length).toFixed(1) : "—";
  const avgFocus = perf.length ? Math.round(perf.reduce((a, b) => a + (b.focus || 0), 0) / perf.length) : "—";

  const chartData = perf.slice(-7).map(d => ({ date: d.date?.slice(5), focus: d.focus || 0, sleep: d.sleep || 0 }));

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ ...s.h1, marginBottom: 4 }}>Good {["morning","morning","afternoon","evening"][Math.floor(new Date().getHours() / 6)]}, {user.name.split(" ")[0]}</h1>
        <p style={{ ...s.muted }}>Your operational dashboard — {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 28 }}>
        <KpiCard label="Mission Countdown" value={daysLeft} sub={`Days to exam`} color={C.cyan} />
        <KpiCard label="Tasks Complete" value={totalTasks ? `${completedTasks}/${totalTasks}` : "—"} sub="Operations" color={C.success} />
        <KpiCard label="Upcoming Tests" value={upcomingTests || "—"} sub="Assessments" color={C.warning} />
        <KpiCard label="Avg Focus" value={avgFocus !== "—" ? avgFocus + "%" : "—"} sub="Quality" color={C.accentAlt} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
        <div style={s.card}>
          <div style={{ ...s.h3, marginBottom: 16 }}>Focus Trend</div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: C.gray300 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: C.navyMid, border: `1px solid ${C.glassBorder}`, borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="focus" stroke={C.cyan} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: C.gray500, fontSize: 13 }}>
              No data yet
            </div>
          )}
        </div>

        <div style={s.card}>
          <div style={{ ...s.h3, marginBottom: 16 }}>Profile Summary</div>
          {profile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[["Exam", profile.exam], ["Year", profile.year], ["Mode", profile.coaching]].map(([k, v]) => v && (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.glassBorder}`, paddingBottom: 8 }}>
                  <span style={{ fontSize: 12, color: C.gray300 }}>{k}</span>
                  <span style={{ fontSize: 13, color: C.white, fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: C.gray500, fontSize: 13 }}>Complete onboarding</div>
          )}
        </div>
      </div>

      {tasks.length > 0 && (
        <div style={s.card}>
          <div style={{ ...s.h3, marginBottom: 16 }}>Recent Tasks</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tasks.slice(-4).reverse().map(t => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid ${C.glassBorder}` }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.status === "done" ? C.success : t.status === "in-progress" ? C.warning : C.gray500, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, color: C.white }}>{t.title}</span>
                <span style={{ fontSize: 11, color: C.gray500 }}>{t.deadline}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── OPERATIONS & ASSESSMENTS (simplified) ──────────────────────────────────
function OperationsPage({ userId }) {
  const [tasks, setTasks] = useState(store.get("tasks_" + userId, []));
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", subject: "Physics", deadline: "", priority: "Medium", status: "pending" });

  const save = ts => { store.set("tasks_" + userId, ts); setTasks(ts); };
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const addTask = () => { if (!form.title) return; save([...tasks, { ...form, id: Date.now(), createdAt: new Date().toISOString().slice(0, 10) }]); setForm({ title: "", subject: "Physics", deadline: "", priority: "Medium", status: "pending" }); setModal(false); };
  const updateStatus = (id, status) => save(tasks.map(t => t.id === id ? { ...t, status } : t));
  const deleteTask = id => save(tasks.filter(t => t.id !== id));

  const statColors = { pending: C.gray300, "in-progress": C.warning, done: C.success };

  return (
    <div>
      <SectionHeader title="Operations Center" action={<button style={s.btn} onClick={() => setModal(true)}>+ New Task</button>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[["Total", tasks.length, C.cyan], ["Pending", tasks.filter(t => t.status === "pending").length, C.gray300], ["In Progress", tasks.filter(t => t.status === "in-progress").length, C.warning], ["Done", tasks.filter(t => t.status === "done").length, C.success]].map(([l, v, c]) => (
          <div key={l} style={{ ...s.card, borderTop: `2px solid ${c}` }}>
            <div style={{ ...s.label, marginBottom: 4 }}>{l}</div>
            <div style={{ fontSize: 24, fontWeight: 200, color: c }}>{v}</div>
          </div>
        ))}
      </div>
      {tasks.length === 0 ? (
        <div style={{ ...s.card, textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>◈</div>
          <div style={{ fontSize: 15, color: C.gray300 }}>No tasks created</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tasks.map(t => (
            <div key={t.id} style={{ ...s.card, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 4, height: 40, borderRadius: 2, background: statColors[t.status], flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: t.status === "done" ? C.gray500 : C.white, textDecoration: t.status === "done" ? "line-through" : "none", marginBottom: 4 }}>{t.title}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ ...s.tag(C.cyan), fontSize: 11 }}>{t.subject}</span>
                  {t.deadline && <span style={{ fontSize: 11, color: C.gray500 }}>Due: {t.deadline}</span>}
                </div>
              </div>
              <select value={t.status} onChange={e => updateStatus(t.id, e.target.value)} style={{ ...s.input, width: 130, padding: "6px 10px", fontSize: 12 }}>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <button onClick={() => deleteTask(t.id)} style={{ ...s.btnGhost, padding: "6px 12px", fontSize: 12, color: C.danger }}>✕</button>
            </div>
          ))}
        </div>
      )}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ width: 440, background: C.navyMid, border: `1px solid ${C.glassBorder}`, borderRadius: 16, padding: 32 }}>
            <div style={{ ...s.h2, marginBottom: 24 }}>Create Task</div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ ...s.label, display: "block", marginBottom: 6 }}>Title</label>
              <input style={s.input} placeholder="Task name" value={form.title} onChange={f("title")} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
              <div>
                <label style={{ ...s.label, display: "block", marginBottom: 6 }}>Subject</label>
                <select style={s.input} value={form.subject} onChange={f("subject")}>
                  <option>Physics</option><option>Chemistry</option><option>Mathematics</option><option>Biology</option>
                </select>
              </div>
              <div>
                <label style={{ ...s.label, display: "block", marginBottom: 6 }}>Deadline</label>
                <input type="date" style={s.input} value={form.deadline} onChange={f("deadline")} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button style={{ ...s.btn, flex: 1 }} onClick={addTask}>Add</button>
              <button style={{ ...s.btnGhost, flex: 1 }} onClick={() => setModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AssessmentsPage({ userId }) {
  const [tests, setTests] = useState(store.get("tests_" + userId, []));
  const [modal, setModal] = useState(false);
  const [resultModal, setResultModal] = useState(null);
  const [form, setForm] = useState({ name: "", syllabus: "", date: "", targetMarks: "" });
  const [result, setResult] = useState({ obtained: "", topper: "", rank: "", total: "" });

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const r = k => e => setResult(p => ({ ...p, [k]: e.target.value }));
  const save = ts => { store.set("tests_" + userId, ts); setTests(ts); };
  const addTest = () => { if (!form.name) return; save([...tests, { ...form, id: Date.now(), createdAt: Date.now() }]); setForm({ name: "", syllabus: "", date: "", targetMarks: "" }); setModal(false); };
  const submitResult = () => { save(tests.map(t => t.id === resultModal.id ? { ...t, result: { ...result, submittedAt: Date.now() } } : t)); setResultModal(null); setResult({ obtained: "", topper: "", rank: "", total: "" }); };

  const today = new Date().toISOString().slice(0, 10);
  return (
    <div>
      <SectionHeader title="Assessments" action={<button style={s.btn} onClick={() => setModal(true)}>+ Schedule Test</button>} />
      {tests.length === 0 ? (
        <div style={{ ...s.card, textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>⬜</div>
          <div style={{ fontSize: 15, color: C.gray300 }}>No tests scheduled</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {tests.map(t => {
            const isPast = t.date <= today;
            const hasResult = !!t.result;
            return (
              <div key={t.id} style={{ ...s.card, borderTop: `2px solid ${hasResult ? C.success : isPast ? C.danger : C.cyan}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ ...s.badge(hasResult ? C.success : isPast ? C.danger : C.cyan) }}>{hasResult ? "Done" : isPast ? "Pending" : "Scheduled"}</span>
                  <span style={{ fontSize: 12, color: C.gray300 }}>{t.date}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 500, color: C.white, marginBottom: 6 }}>{t.name}</div>
                {hasResult && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.glassBorder}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div><div style={{ fontSize: 11, color: C.gray500 }}>Obtained</div><div style={{ fontSize: 18, fontWeight: 300, color: C.success }}>{t.result.obtained}</div></div>
                    <div><div style={{ fontSize: 11, color: C.gray500 }}>Rank</div><div style={{ fontSize: 18, fontWeight: 300, color: C.white }}>{t.result.rank}</div></div>
                  </div>
                )}
                {isPast && !hasResult && <button style={{ ...s.btn, width: "100%", marginTop: 12, padding: "8px 0", fontSize: 13 }} onClick={() => setResultModal(t)}>Enter Result</button>}
              </div>
            );
          })}
        </div>
      )}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ width: 420, background: C.navyMid, border: `1px solid ${C.glassBorder}`, borderRadius: 16, padding: 32 }}>
            <div style={{ ...s.h2, marginBottom: 24 }}>Schedule Test</div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ ...s.label, display: "block", marginBottom: 6 }}>Test Name</label>
              <input style={s.input} placeholder="Full Syllabus Mock" value={form.name} onChange={f("name")} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
              <div>
                <label style={{ ...s.label, display: "block", marginBottom: 6 }}>Date</label>
                <input type="date" style={s.input} value={form.date} onChange={f("date")} />
              </div>
              <div>
                <label style={{ ...s.label, display: "block", marginBottom: 6 }}>Total Marks</label>
                <input type="number" style={s.input} placeholder="300" value={form.targetMarks} onChange={f("targetMarks")} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button style={{ ...s.btn, flex: 1 }} onClick={addTest}>Schedule</button>
              <button style={{ ...s.btnGhost, flex: 1 }} onClick={() => setModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {resultModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ width: 400, background: C.navyMid, border: `1px solid ${C.glassBorder}`, borderRadius: 16, padding: 32 }}>
            <div style={{ ...s.h2, marginBottom: 8 }}>Submit Result</div>
            <div style={{ fontSize: 13, color: C.gray300, marginBottom: 24 }}>{resultModal.name}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
              {[["Marks Obtained", "obtained"], ["Your Rank", "rank"]].map(([lbl, key]) => (
                <div key={key}>
                  <label style={{ ...s.label, display: "block", marginBottom: 6 }}>{lbl}</label>
                  <input type="number" style={s.input} value={result[key]} onChange={r(key)} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button style={{ ...s.btn, flex: 1 }} onClick={submitResult}>Submit</button>
              <button style={{ ...s.btnGhost, flex: 1 }} onClick={() => setResultModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AnalyticsPage({ userId }) {
  const tasks = store.get("tasks_" + userId, []);
  const tests = store.get("tests_" + userId, []);
  const subjectDist = ["Physics", "Chemistry", "Mathematics", "Biology"].map(s => ({ subject: s, count: tasks.filter(t => t.subject === s).length })).filter(s => s.count > 0);

  return (
    <div>
      <SectionHeader title="Analytics" />
      {tasks.length === 0 && tests.length === 0 ? (
        <div style={{ ...s.card, textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>▣</div>
          <div style={{ fontSize: 15, color: C.gray300 }}>No data to analyze</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {subjectDist.length > 0 && (
            <div style={s.card}>
              <div style={{ ...s.h3, marginBottom: 20 }}>Subject Coverage</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={subjectDist}>
                  <XAxis dataKey="subject" tick={{ fontSize: 12, fill: C.gray300 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: C.gray500 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: C.navyMid, border: `1px solid ${C.glassBorder}`, borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill={C.cyan} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReportsPage() {
  return (
    <div>
      <SectionHeader title="Strategic Reports" />
      <div style={{ ...s.card, textAlign: "center", padding: 60 }}>
        <div style={{ fontSize: 15, color: C.gray300 }}>Reports will appear as you build operational data.</div>
      </div>
    </div>
  );
}

function ProfilePage({ user, profile, userId, onLogout }) {
  return (
    <div>
      <SectionHeader title="Operator Profile" />
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ ...s.card, textAlign: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: `${C.cyan}22`, border: `2px solid ${C.cyan}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: C.cyan, fontWeight: 300, margin: "0 auto 16px" }}>
              {user.name[0]?.toUpperCase()}
            </div>
            <div style={{ fontSize: 16, fontWeight: 500, color: C.white, marginBottom: 4 }}>{user.name}</div>
            <div style={{ fontSize: 12, color: C.gray300, marginBottom: 8 }}>{user.email}</div>
            <button style={{ ...s.btnGhost, width: "100%", marginTop: 8, color: C.danger, borderColor: `${C.danger}44` }} onClick={onLogout}>Sign Out</button>
          </div>
        </div>
        <div style={s.card}>
          <div style={{ ...s.h3, marginBottom: 20 }}>Preparation Profile</div>
          {profile ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {[["Exam", profile.exam], ["Year", profile.year], ["Coaching", profile.coaching], ["Focus", profile.weakSubject], ["Hours", profile.dailyHours], ["Target", profile.targetRank]].map(([k, v]) => (
                <div key={k} style={{ paddingBottom: 8, borderBottom: `1px solid ${C.glassBorder}` }}>
                  <div style={{ fontSize: 11, color: C.gray500, marginBottom: 6, textTransform: "uppercase" }}>{k}</div>
                  <div style={{ fontSize: 14, color: C.white, fontWeight: 500 }}>{v || "—"}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: C.gray500 }}>Complete onboarding.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [page, setPage] = useState("dashboard");

  useEffect(() => {
    const uid = store.get("currentUser", null);
    if (uid) {
      const users = store.get("users", []);
      const u = users.find(u => u.id === uid);
      if (u) {
        const p = store.get("profile_" + uid, null);
        setUser(u);
        setProfile(p);
        setScreen(p ? "app" : "onboard");
      }
    }
  }, []);

  const handleLogin = u => {
    const p = store.get("profile_" + u.id, null);
    setUser(u);
    setProfile(p);
    setScreen(p ? "app" : "onboard");
  };

  const handleLogout = () => {
    store.set("currentUser", null);
    setUser(null);
    setProfile(null);
    setScreen("landing");
  };

  if (screen === "landing") return <LandingPage onLogin={() => setScreen("login")} onSignup={() => setScreen("signup")} />;
  if (screen === "login") return <LoginPage onLogin={handleLogin} onSignup={() => setScreen("signup")} onForgot={() => {}} onBack={() => setScreen("landing")} />;
  if (screen === "signup") return <SignupPage onSignup={u => { setUser(u); setScreen("onboard"); }} onLogin={() => setScreen("login")} onBack={() => setScreen("landing")} />;
  if (screen === "onboard") return <Onboarding user={user} onComplete={p => { setProfile(p); setScreen("app"); }} />;

  const pageProps = { user, profile, userId: user?.id };

  return (
    <div style={s.app}>
      <Sidebar active={page} onNav={setPage} user={user} profile={profile} />
      <div style={s.main}>
        <TopBar page={page} user={user} onLogout={handleLogout} />
        <div style={s.content}>
          {page === "dashboard" && <DashboardPage {...pageProps} />}
          {page === "focus" && <FocusSystemsPage />}
          {page === "operations" && <OperationsPage {...pageProps} />}
          {page === "analytics" && <AnalyticsPage {...pageProps} />}
          {page === "assessments" && <AssessmentsPage {...pageProps} />}
          {page === "reports" && <ReportsPage />}
          {page === "profile" && <ProfilePage {...pageProps} onLogout={handleLogout} />}
        </div>
      </div>
    </div>
  );
}
