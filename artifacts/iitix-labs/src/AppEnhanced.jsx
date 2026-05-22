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

const store = {
  get: (k, def) => { try { const v = localStorage.getItem("iitix_" + k); return v ? JSON.parse(v) : def; } catch { return def; } },
  set: (k, v) => { try { localStorage.setItem("iitix_" + k, JSON.stringify(v)); } catch {} },
};

const POMODORO_PRESETS = {
  "Deep Work": { work: 50, rest: 10, color: C.cyan },
  "Revision Sprint": { work: 30, rest: 5, color: C.success },
  "DPP Assault": { work: 90, rest: 15, color: C.warning },
  "Recovery Cycle": { work: 25, rest: 5, color: C.accentAlt },
};

const s = {
  app: () => ({ minHeight: "100vh", background: C.navy, color: C.white, fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", display: "flex", flexDirection: "row" }),
  sidebar: () => ({ width: 220, minWidth: 220, minHeight: "100vh", background: C.navyMid, display: "flex", flexDirection: "column", borderRight: `1px solid ${C.glassBorder}`, flexShrink: 0 }),
  backdrop: () => ({ display: "none" }),
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "auto" },
  topbar: { height: "auto", background: C.navyMid, borderBottom: `1px solid ${C.glassBorder}`, display: "flex", alignItems: "center", padding: "clamp(12px, 3vw, 28px)", gap: 16, flexShrink: 0, position: "relative", zIndex: 50 },
  content: { flex: 1, padding: "clamp(16px, 4vw, 28px)", overflowY: "auto" },
  card: { background: C.glass, border: `1px solid ${C.glassBorder}`, borderRadius: 12, padding: "clamp(16px, 3vw, 20px)", transition: "all 0.2s ease" },
  label: { fontSize: "clamp(10px, 1.5vw, 11px)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: C.gray300 },
  h1: { fontSize: "clamp(18px, 4vw, 22px)", fontWeight: 300, letterSpacing: "-0.01em", color: C.white, margin: 0 },
  h2: { fontSize: "clamp(14px, 2.5vw, 16px)", fontWeight: 500, color: C.white, margin: 0 },
  h3: { fontSize: "clamp(12px, 2vw, 13px)", fontWeight: 600, color: C.gray300, margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" },
  muted: { fontSize: "clamp(12px, 1.8vw, 13px)", color: C.gray300 },
  input: { width: "100%", background: "rgba(255,255,255,0.06)", border: `1px solid ${C.glassBorder}`, borderRadius: 8, padding: "clamp(8px, 2vw, 10px) clamp(10px, 2.5vw, 14px)", color: C.white, fontSize: "clamp(13px, 2vw, 14px)", outline: "none", boxSizing: "border-box", transition: "border 0.2s" },
  btn: { background: C.cyan, color: C.navy, border: "none", borderRadius: 8, padding: "clamp(8px, 2vw, 10px) clamp(16px, 3vw, 20px)", fontWeight: 600, fontSize: "clamp(13px, 2vw, 14px)", cursor: "pointer", letterSpacing: "0.02em", transition: "all 0.2s" },
  btnOutline: { background: "transparent", color: C.cyan, border: `1px solid ${C.cyan}`, borderRadius: 8, padding: "clamp(8px, 2vw, 10px) clamp(16px, 3vw, 20px)", fontWeight: 600, fontSize: "clamp(13px, 2vw, 14px)", cursor: "pointer", transition: "all 0.2s" },
  btnGhost: { background: "transparent", color: C.gray300, border: `1px solid ${C.glassBorder}`, borderRadius: 8, padding: "clamp(8px, 1.5vw, 8px) clamp(12px, 2.5vw, 16px)", fontSize: "clamp(12px, 1.8vw, 13px)", cursor: "pointer", transition: "all 0.2s" },
  badge: (color = C.cyan) => ({ display: "inline-block", padding: "clamp(2px, 0.5vw, 2px) clamp(8px, 1.5vw, 10px)", borderRadius: 20, fontSize: "clamp(10px, 1.5vw, 11px)", fontWeight: 600, background: `${color}22`, color: color, border: `1px solid ${color}44`, letterSpacing: "0.04em" }),
  tag: (color = C.cyan) => ({ display: "inline-block", padding: "clamp(2px, 0.5vw, 3px) clamp(8px, 1.5vw, 10px)", borderRadius: 6, fontSize: "clamp(11px, 1.5vw, 12px)", background: `${color}18`, color: color, border: `1px solid ${color}30` }),
};

// ─── AUTH & LANDING ──────────────────────────────────────────────────────────
function LandingPage({ onLogin, onSignup }) {
  const [t, setT] = useState(0);
  useEffect(() => { const id = setInterval(() => setT(p => p + 1), 80); return () => clearInterval(id); }, []);
  const particles = useRef(Array.from({ length: 18 }, () => ({
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
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "clamp(16px, 3vw, 20px) clamp(20px, 5vw, 48px)", position: "relative", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${C.cyan}, ${C.accentAlt})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: C.navy }}>IX</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: "0.12em", color: C.white }}>IITIX LABS</div>
            <div style={{ fontSize: 9, letterSpacing: "0.18em", color: C.gray300, textTransform: "uppercase" }}>Operational Intelligence</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{ background: "transparent", color: C.white, border: `1px solid ${C.glassBorder}`, borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer" }} onClick={onLogin}>Sign In</button>
          <button style={{ background: C.cyan, color: C.navy, border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer" }} onClick={onSignup}>Create Account</button>
        </div>
      </nav>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "clamp(40px, 8vw, 60px) clamp(16px, 4vw, 24px)", position: "relative", zIndex: 10 }}>
        <div style={{ display: "inline-block", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${C.cyan}22`, color: C.cyan, border: `1px solid ${C.cyan}44`, letterSpacing: "0.04em", marginBottom: 24 }}>PREPARATION COMMAND CENTER v2.5</div>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 60px)", fontWeight: 200, letterSpacing: "-0.03em", color: C.white, lineHeight: 1.1, margin: "0 0 16px", maxWidth: 720 }}>
          Operational Intelligence<br />
          <span style={{ fontWeight: 600, color: C.cyan }}>for Serious Aspirants</span>
        </h1>
        <p style={{ fontSize: "clamp(14px, 2vw, 16px)", color: C.gray300, maxWidth: 540, lineHeight: 1.7, margin: "0 0 44px" }}>
          A disciplined command center for JEE and NEET preparation. Track focus systems, manage assessments, analyze performance with enterprise-grade intelligence.
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <button style={{ background: C.cyan, color: C.navy, border: "none", borderRadius: 8, padding: "14px 36px", fontWeight: 600, fontSize: 15, cursor: "pointer" }} onClick={onSignup}>Begin Setup</button>
          <button style={{ background: "transparent", color: C.cyan, border: `1px solid ${C.cyan}`, borderRadius: 8, padding: "14px 36px", fontWeight: 600, fontSize: 15, cursor: "pointer" }} onClick={onLogin}>Access Dashboard</button>
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

function AuthCard({ title, subtitle, children }) {
  return (
    <div style={{ minHeight: "100vh", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif", padding: "clamp(16px, 4vw, 40px)" }}>
      <div style={{ width: "clamp(280px, 90%, 400px)", background: C.navyMid, border: `1px solid ${C.glassBorder}`, borderRadius: 16, padding: "clamp(24px, 5vw, 40px)" }}>
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
      <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: C.gray300, display: "block", marginBottom: 6 }}>{label}</label>
      <input style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: `1px solid ${C.glassBorder}`, borderRadius: 8, padding: "10px 14px", color: C.white, fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border 0.2s" }} {...props} />
    </div>
  );
}

function LoginPage({ onLogin, onSignup, onBack }) {
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
      <button style={{ background: C.cyan, color: C.navy, border: "none", borderRadius: 8, padding: 12, fontWeight: 600, fontSize: 14, cursor: "pointer", width: "100%", marginBottom: 16 }} onClick={handle}>Sign In</button>
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
      <button style={{ background: C.cyan, color: C.navy, border: "none", borderRadius: 8, padding: 12, fontWeight: 600, fontSize: 14, cursor: "pointer", width: "100%", marginBottom: 16 }} onClick={handle}>Create Account</button>
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
    else { store.set("profile_" + user.id, { ...nd, userId: user.id, completedAt: Date.now() }); onComplete(nd); }
  };
  const cur = steps[step];
  const progress = (step / steps.length) * 100;
  return (
    <div style={{ minHeight: "100vh", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif", padding: "clamp(16px, 4vw, 40px)" }}>
      <div style={{ width: "clamp(280px, 90%, 520px)", background: C.navyMid, border: `1px solid ${C.glassBorder}`, borderRadius: 16, padding: "clamp(24px, 5vw, 40px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: C.gray300 }}>Setup — Step {step + 1} of {steps.length}</span>
          <span style={{ fontSize: 12, color: C.gray300 }}>{Math.round(progress)}%</span>
        </div>
        <div style={{ height: 3, background: C.glass, borderRadius: 2, marginBottom: 36 }}>
          <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${C.cyan}, ${C.accentAlt})`, borderRadius: 2, transition: "width 0.3s" }} />
        </div>
        <div style={{ display: "inline-block", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${C.cyan}22`, color: C.cyan, border: `1px solid ${C.cyan}44`, letterSpacing: "0.04em", marginBottom: 16 }}>{cur.label}</div>
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
        {step > 0 && <button onClick={() => setStep(step - 1)} style={{ background: "transparent", border: `1px solid ${C.glassBorder}`, borderRadius: 8, padding: "8px 16px", color: C.gray300, fontSize: 13, cursor: "pointer", marginTop: 24 }}>← Back</button>}
      </div>
    </div>
  );
}

// ─── TIMER STATE MANAGEMENT (ROOT LEVEL) ──────────────────────────────────
function useTimerController() {
  const [pomodoroState, setPomodoroState] = useState({
    mode: "Deep Work",
    phase: "work",
    isRunning: false,
    startTimestamp: null,
    totalDuration: 50 * 60,
    sessionStartTime: null,
  });

  const [stopwatchState, setStopwatchState] = useState({
    isRunning: false,
    startTimestamp: null,
    elapsedMillis: 0,
    sessionLabel: "Physics",
    sessions: store.get("sessions", []),
  });

  const pomodoroInterval = useRef(null);
  const stopwatchInterval = useRef(null);

  // Restore timers from localStorage on mount
  useEffect(() => {
    const saved = store.get("timerState", null);
    if (saved && saved.pomodoroState) {
      const pom = saved.pomodoroState;
      if (pom.isRunning && pom.startTimestamp) {
        const elapsed = Date.now() - pom.startTimestamp;
        const remaining = Math.max(0, pom.totalDuration - Math.floor(elapsed / 1000));
        setPomodoroState(p => ({ ...p, ...pom, totalDuration: pom.totalDuration, isRunning: true, startTimestamp: pom.startTimestamp }));
      } else {
        setPomodoroState(p => ({ ...p, ...pom, isRunning: false }));
      }
    }

    const savedStop = store.get("stopwatchState", null);
    if (savedStop) {
      if (savedStop.isRunning && savedStop.startTimestamp) {
        const elapsed = Date.now() - savedStop.startTimestamp;
        setStopwatchState(s => ({ ...s, ...savedStop, elapsedMillis: savedStop.elapsedMillis + elapsed, isRunning: true, startTimestamp: savedStop.startTimestamp }));
      } else {
        setStopwatchState(s => ({ ...s, ...savedStop, isRunning: false }));
      }
    }
  }, []);

  // Persist timer state
  useEffect(() => {
    store.set("timerState", { pomodoroState });
  }, [pomodoroState]);

  useEffect(() => {
    store.set("stopwatchState", stopwatchState);
  }, [stopwatchState]);

  // Pomodoro timer loop - ROOT LEVEL
  useEffect(() => {
    if (!pomodoroState.isRunning) return;

    if (pomodoroInterval.current) clearInterval(pomodoroInterval.current);

    pomodoroInterval.current = setInterval(() => {
      setPomodoroState(state => {
        const elapsed = Date.now() - state.startTimestamp;
        const remaining = Math.max(0, state.totalDuration - Math.floor(elapsed / 1000));

        if (remaining === 0) {
          const newPhase = state.phase === "work" ? "rest" : "work";
          const cfg = POMODORO_PRESETS[state.mode];
          const newDuration = newPhase === "work" ? cfg.work * 60 : cfg.rest * 60;
          return {
            ...state,
            phase: newPhase,
            isRunning: false,
            startTimestamp: null,
            totalDuration: newDuration,
          };
        }
        return { ...state, _tick: Date.now() };
      });
    }, 1000);

    return () => clearInterval(pomodoroInterval.current);
  }, [pomodoroState.isRunning, pomodoroState.startTimestamp]);

  // Stopwatch timer loop - ROOT LEVEL
  useEffect(() => {
    if (!stopwatchState.isRunning) return;

    if (stopwatchInterval.current) clearInterval(stopwatchInterval.current);

    stopwatchInterval.current = setInterval(() => {
      setStopwatchState(state => {
        const elapsed = Date.now() - state.startTimestamp;
        return { ...state, elapsedMillis: state.elapsedMillis + elapsed, startTimestamp: Date.now() };
      });
    }, 100);

    return () => clearInterval(stopwatchInterval.current);
  }, [stopwatchState.isRunning]);

  return {
    pomodoroState,
    setPomodoroState,
    stopwatchState,
    setStopwatchState,
  };
}

// ─── POMODORO TIMER UI ──────────────────────────────────────────────────────
function PomodoroTimer({ pomodoroState, setPomodoroState }) {
  const handleModeChange = (newMode) => {
    const cfg = POMODORO_PRESETS[newMode];
    setPomodoroState({
      mode: newMode,
      phase: "work",
      isRunning: false,
      startTimestamp: null,
      totalDuration: cfg.work * 60,
      sessionStartTime: null,
    });
  };

  const handleStart = () => {
    if (!pomodoroState.isRunning) {
      setPomodoroState(s => ({ ...s, isRunning: true, startTimestamp: Date.now() }));
    } else {
      setPomodoroState(s => ({ ...s, isRunning: false, startTimestamp: null }));
    }
  };

  const handleReset = () => {
    const cfg = POMODORO_PRESETS[pomodoroState.mode];
    setPomodoroState({
      mode: pomodoroState.mode,
      phase: "work",
      isRunning: false,
      startTimestamp: null,
      totalDuration: cfg.work * 60,
      sessionStartTime: null,
    });
  };

  const elapsed = pomodoroState.isRunning && pomodoroState.startTimestamp ? Math.floor((Date.now() - pomodoroState.startTimestamp) / 1000) : 0;
  const remaining = Math.max(0, pomodoroState.totalDuration - elapsed);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = ((pomodoroState.totalDuration - remaining) / pomodoroState.totalDuration) * 100;
  const preset = POMODORO_PRESETS[pomodoroState.mode];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "clamp(16px, 3vw, 24px)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "clamp(10px, 2vw, 12px)" }}>
        {Object.entries(POMODORO_PRESETS).map(([name, cfg]) => (
          <button key={name} onClick={() => handleModeChange(name)} style={{
            ...s.btnGhost, textAlign: "left", padding: "clamp(12px, 2.5vw, 16px)", borderColor: pomodoroState.mode === name ? cfg.color : C.glassBorder,
            background: pomodoroState.mode === name ? `${cfg.color}12` : "transparent", color: pomodoroState.mode === name ? cfg.color : C.gray300,
          }}>
            <div style={{ fontSize: "clamp(12px, 1.8vw, 13px)", fontWeight: 600, marginBottom: 4 }}>{name}</div>
            <div style={{ fontSize: "clamp(10px, 1.5vw, 11px)", color: C.gray500 }}>{cfg.work}/{cfg.rest} min</div>
          </button>
        ))}
      </div>

      <div style={{ ...s.card, background: `linear-gradient(135deg, rgba(0,180,216,0.08), rgba(13,31,60,0.5))`, border: `1px solid ${preset.color}40`, textAlign: "center", padding: "clamp(32px, 6vw, 40px)" }}>
        <div style={{ ...s.label, marginBottom: "clamp(8px, 2vw, 12px)", color: preset.color }}>{pomodoroState.phase === "work" ? "FOCUS TIME" : "REST TIME"}</div>
        <div style={{ fontSize: "clamp(40px, 10vw, 56px)", fontWeight: 200, color: preset.color, letterSpacing: "-0.02em", marginBottom: "clamp(12px, 2.5vw, 12px)", fontVariantNumeric: "tabular-nums" }}>
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </div>
        <div style={{ height: 3, background: C.glass, borderRadius: 2, marginBottom: "clamp(16px, 3vw, 20px)", overflow: "hidden" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: preset.color, transition: "width 0.1s linear" }} />
        </div>
        <div style={{ display: "flex", gap: "clamp(8px, 2vw, 12px)", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={handleStart} style={{ ...s.btn, background: preset.color, padding: "clamp(8px, 2vw, 10px) clamp(20px, 4vw, 28px)" }}>
            {pomodoroState.isRunning ? "Pause" : "Start"}
          </button>
          <button onClick={handleReset} style={{ ...s.btnOutline, borderColor: preset.color, color: preset.color }}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── STOPWATCH UI ──────────────────────────────────────────────────────────
function Stopwatch({ stopwatchState, setStopwatchState }) {
  const handleStart = () => {
    if (!stopwatchState.isRunning) {
      setStopwatchState(s => ({ ...s, isRunning: true, startTimestamp: Date.now() }));
    } else {
      setStopwatchState(s => ({ ...s, isRunning: false, startTimestamp: null }));
    }
  };

  const handleReset = () => {
    setStopwatchState(s => ({ ...s, elapsedMillis: 0, isRunning: false, startTimestamp: null }));
  };

  const saveSession = () => {
    const newSession = { label: stopwatchState.sessionLabel, duration: stopwatchState.elapsedMillis, timestamp: Date.now() };
    const updated = [...stopwatchState.sessions, newSession];
    setStopwatchState(s => ({ ...s, sessions: updated }));
    store.set("sessions", updated);
    setStopwatchState(s => ({ ...s, elapsedMillis: 0 }));
  };

  const elapsed = stopwatchState.isRunning && stopwatchState.startTimestamp ? stopwatchState.elapsedMillis + (Date.now() - stopwatchState.startTimestamp) : stopwatchState.elapsedMillis;
  const hours = Math.floor(elapsed / 3600000);
  const mins = Math.floor((elapsed % 3600000) / 60000);
  const secs = Math.floor((elapsed % 60000) / 1000);
  const ms = Math.floor((elapsed % 1000) / 100);

  const labels = ["Physics", "Chemistry", "Mathematics", "Revision", "Mock Test"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "clamp(16px, 3vw, 24px)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", gap: "clamp(8px, 1.5vw, 12px)" }}>
        {labels.map(l => (
          <button key={l} onClick={() => setStopwatchState(s => ({ ...s, sessionLabel: l }))} style={{
            ...s.btnGhost, padding: "clamp(10px, 2vw, 12px)", borderColor: stopwatchState.sessionLabel === l ? C.cyan : C.glassBorder,
            background: stopwatchState.sessionLabel === l ? `${C.cyan}12` : "transparent", color: stopwatchState.sessionLabel === l ? C.cyan : C.gray300, fontSize: "clamp(11px, 1.8vw, 12px)",
          }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ ...s.card, background: "linear-gradient(135deg, rgba(10,22,40,0.8), rgba(13,31,60,0.6))", border: `1px solid ${C.cyan}30`, textAlign: "center", padding: "clamp(32px, 6vw, 48px)", boxShadow: "inset 0 2px 8px rgba(0,0,0,0.5)" }}>
        <div style={{ fontSize: "clamp(10px, 1.5vw, 11px)", color: C.gray500, marginBottom: "clamp(12px, 2.5vw, 16px)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Session Time</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 0, fontVariantNumeric: "tabular-nums", fontFamily: "'Courier New', monospace", flexWrap: "wrap" }}>
          {hours > 0 && <div style={{ fontSize: "clamp(36px, 8vw, 48px)", fontWeight: 300, color: C.cyan, letterSpacing: "0.05em" }}>{String(hours).padStart(2, "0")}</div>}
          {hours > 0 && <div style={{ fontSize: "clamp(36px, 8vw, 48px)", fontWeight: 300, color: C.gray500, margin: "0 2px" }}>:</div>}
          <div style={{ fontSize: "clamp(36px, 8vw, 48px)", fontWeight: 300, color: C.cyan, letterSpacing: "0.05em" }}>{String(mins).padStart(2, "0")}</div>
          <div style={{ fontSize: "clamp(36px, 8vw, 48px)", fontWeight: 300, color: C.gray500, margin: "0 2px" }}>:</div>
          <div style={{ fontSize: "clamp(36px, 8vw, 48px)", fontWeight: 300, color: C.cyan, letterSpacing: "0.05em" }}>{String(secs).padStart(2, "0")}</div>
          <div style={{ fontSize: "clamp(24px, 5vw, 32px)", fontWeight: 300, color: C.gray500, margin: "0 2px", alignSelf: "flex-end", marginBottom: "clamp(4px, 1vw, 8px)" }}>.{ms}</div>
        </div>
        <div style={{ marginTop: "clamp(20px, 4vw, 28px)", display: "flex", gap: "clamp(8px, 2vw, 12px)", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={handleStart} style={{ ...s.btn, background: C.cyan, padding: "clamp(8px, 2vw, 10px) clamp(20px, 4vw, 28px)" }}>
            {stopwatchState.isRunning ? "Pause" : "Start"}
          </button>
          <button onClick={handleReset} style={{ ...s.btnOutline, borderColor: C.cyan, color: C.cyan }}>
            Reset
          </button>
          {elapsed > 0 && (
            <button onClick={saveSession} style={{ ...s.btn, background: C.success, padding: "clamp(8px, 2vw, 10px) clamp(16px, 3vw, 28px)" }}>
              Save
            </button>
          )}
        </div>
      </div>

      {stopwatchState.sessions.length > 0 && (
        <div style={s.card}>
          <div style={{ ...s.h3, marginBottom: "clamp(12px, 2vw, 16px)" }}>Session Log</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(6px, 1.5vw, 8px)" }}>
            {stopwatchState.sessions.slice(-5).reverse().map((session, i) => {
              const h = Math.floor(session.duration / 3600000);
              const m = Math.floor((session.duration % 3600000) / 60000);
              return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "clamp(6px, 1.5vw, 8px) 0", borderBottom: `1px solid ${C.glassBorder}`, fontSize: "clamp(12px, 1.8vw, 13px)" }}>
                  <span style={{ ...s.tag(C.cyan), fontSize: "clamp(10px, 1.5vw, 11px)" }}>{session.label}</span>
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
function FocusSystemsPage({ pomodoroState, setPomodoroState, stopwatchState, setStopwatchState, timerActive }) {
  const [activeTab, setActiveTab] = useState("pomodoro");
  return (
    <div>
      <div style={{ display: "flex", gap: "clamp(8px, 2vw, 12px)", marginBottom: "clamp(20px, 3vw, 28px)", borderBottom: `1px solid ${C.glassBorder}`, paddingBottom: "clamp(8px, 1.5vw, 12px)", flexWrap: "wrap", alignItems: "center" }}>
        {["pomodoro", "stopwatch"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: "clamp(6px, 1.5vw, 8px) clamp(12px, 2.5vw, 16px)", borderRadius: 6, border: "none", cursor: "pointer", fontSize: "clamp(13px, 1.8vw, 14px)", fontWeight: 500,
            background: activeTab === tab ? `${C.cyan}20` : "transparent", color: activeTab === tab ? C.cyan : C.gray300,
            borderBottom: activeTab === tab ? `2px solid ${C.cyan}` : "none", transition: "all 0.2s",
          }}>
            {tab === "pomodoro" ? "Pomodoro" : "Stopwatch"}
          </button>
        ))}
        {timerActive && <div style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: C.cyan, marginLeft: "auto", animation: "pulse 1s infinite", marginRight: 8 }} />}
      </div>
      {activeTab === "pomodoro" && <PomodoroTimer pomodoroState={pomodoroState} setPomodoroState={setPomodoroState} />}
      {activeTab === "stopwatch" && <Stopwatch stopwatchState={stopwatchState} setStopwatchState={setStopwatchState} />}
    </div>
  );
}

// ─── ATTENDANCE MODULE ──────────────────────────────────────────────────────
function AttendanceModule() {
  const today = new Date().toISOString().split("T")[0];
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendance, setAttendance] = useState(store.get("attendanceRecords", {}));

  const markAttendance = () => {
    if (attendance[today]) return; // Already marked
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

    let status = "green";
    if (hour >= 7 && (hour === 7 && minute <= 30 || hour === 8)) status = "yellow";
    else if (hour >= 9 || (hour === 8 && minute > 30)) status = "red";

    const record = { status, timestamp: now.getTime(), time: timeStr };
    const updated = { ...attendance, [today]: record };
    setAttendance(updated);
    store.set("attendanceRecords", updated);
  };

  const statusColor = (status) => {
    if (status === "green") return C.success;
    if (status === "yellow") return C.warning;
    return C.danger;
  };

  const statusLabel = (status) => {
    if (status === "green") return "On Time";
    if (status === "yellow") return "Late";
    return "Very Late";
  };

  // Calculate stats
  const monthStr = currentMonth.toISOString().split("T")[0].slice(0, 7);
  const monthRecords = Object.entries(attendance).filter(([date]) => date.startsWith(monthStr));
  const stats = {
    green: monthRecords.filter(([, r]) => r.status === "green").length,
    yellow: monthRecords.filter(([, r]) => r.status === "yellow").length,
    red: monthRecords.filter(([, r]) => r.status === "red").length,
  };

  // Calculate streak
  let streak = 0;
  const sortedDates = Object.keys(attendance).sort().reverse();
  const todayRec = attendance[today];
  if (todayRec) {
    streak = 1;
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const curr = new Date(sortedDates[i]);
      const next = new Date(sortedDates[i + 1]);
      const dayDiff = Math.floor((curr - next) / (1000 * 60 * 60 * 24));
      if (dayDiff === 1) streak++;
      else break;
    }
  }

  // Calendar grid
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const firstDay = monthStart.getDay();
  const daysInMonth = monthEnd.getDate();
  const calendarDays = [];

  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  return (
    <div>
      <div style={{ marginBottom: "clamp(20px, 3vw, 28px)" }}>
        <h1 style={{ ...s.h1, marginBottom: 4 }}>Attendance</h1>
        <p style={{ ...s.muted }}>Track your daily presence</p>
      </div>

      {/* Mark Attendance Button or Status */}
      {!attendance[today] ? (
        <button onClick={markAttendance} style={{ ...s.btn, marginBottom: "clamp(20px, 3vw, 28px)" }}>
          Mark Attendance for Today
        </button>
      ) : (
        <div style={{ ...s.card, marginBottom: "clamp(20px, 3vw, 28px)", background: `${statusColor(attendance[today].status)}18`, border: `1px solid ${statusColor(attendance[today].status)}40` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ ...s.label, marginBottom: 8, color: statusColor(attendance[today].status) }}>Today's Status</div>
              <div style={{ fontSize: "clamp(16px, 2.5vw, 18px)", fontWeight: 500, color: C.white }}>
                {statusLabel(attendance[today].status)} at {attendance[today].time}
              </div>
            </div>
            <div style={{ ...s.badge(statusColor(attendance[today].status)) }}>{statusLabel(attendance[today].status)}</div>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "clamp(12px, 2vw, 16px)", marginBottom: "clamp(20px, 3vw, 28px)" }}>
        <div style={{ ...s.card, borderTop: `2px solid ${C.success}` }}>
          <div style={{ ...s.label, marginBottom: 8 }}>On Time</div>
          <div style={{ fontSize: "clamp(24px, 4vw, 28px)", fontWeight: 200, color: C.success }}>{stats.green}</div>
        </div>
        <div style={{ ...s.card, borderTop: `2px solid ${C.warning}` }}>
          <div style={{ ...s.label, marginBottom: 8 }}>Late</div>
          <div style={{ fontSize: "clamp(24px, 4vw, 28px)", fontWeight: 200, color: C.warning }}>{stats.yellow}</div>
        </div>
        <div style={{ ...s.card, borderTop: `2px solid ${C.danger}` }}>
          <div style={{ ...s.label, marginBottom: 8 }}>Very Late</div>
          <div style={{ fontSize: "clamp(24px, 4vw, 28px)", fontWeight: 200, color: C.danger }}>{stats.red}</div>
        </div>
        <div style={{ ...s.card, borderTop: `2px solid ${C.cyan}` }}>
          <div style={{ ...s.label, marginBottom: 8 }}>Streak</div>
          <div style={{ fontSize: "clamp(24px, 4vw, 28px)", fontWeight: 200, color: C.cyan }}>{streak}</div>
        </div>
      </div>

      {/* Calendar */}
      <div style={s.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "clamp(16px, 2vw, 20px)" }}>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} style={{ ...s.btnGhost, padding: "6px 12px", fontSize: "clamp(12px, 1.8vw, 13px)" }}>← Prev</button>
          <div style={{ ...s.h2, fontSize: "clamp(14px, 2.2vw, 16px)" }}>
            {currentMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </div>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} style={{ ...s.btnGhost, padding: "6px 12px", fontSize: "clamp(12px, 1.8vw, 13px)" }}>Next →</button>
        </div>

        {/* Weekday headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "clamp(4px, 1vw, 8px)", marginBottom: "clamp(12px, 2vw, 16px)" }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} style={{ textAlign: "center", fontSize: "clamp(11px, 1.5vw, 12px)", fontWeight: 600, color: C.gray300, letterSpacing: "0.04em" }}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "clamp(4px, 1vw, 8px)" }}>
          {calendarDays.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} style={{ aspectRatio: "1", background: "transparent" }} />;
            const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const rec = attendance[dateStr];
            const isToday = dateStr === today;
            const bgColor = rec ? statusColor(rec.status) : "transparent";
            const bgOpacity = rec ? "22" : "10";
            return (
              <div
                key={day}
                style={{
                  aspectRatio: "1",
                  background: `${bgColor}${bgOpacity}`,
                  border: `1px solid ${isToday ? C.cyan : rec ? `${bgColor}40` : C.glassBorder}`,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "clamp(12px, 1.8vw, 13px)",
                  fontWeight: rec ? 600 : 400,
                  color: rec ? bgColor : C.gray300,
                }}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── SIDEBAR ────────────────────────────────────────────────────────────────
function Sidebar({ active, onNav, user, sidebarOpen, setSidebarOpen, timerActive }) {
  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: "⬡" },
    { id: "focus", label: "Focus Systems", icon: "◉" },
    { id: "attendance", label: "Attendance", icon: "✓" },
    { id: "operations", label: "Operations", icon: "◈" },
    { id: "analytics", label: "Analytics", icon: "▣" },
    { id: "assessments", label: "Assessments", icon: "⬜" },
    { id: "reports", label: "Reports", icon: "▤" },
    { id: "profile", label: "Profile", icon: "◯" },
  ];

  const handleNav = (id) => {
    onNav(id);
    setSidebarOpen(false);
  };

  return (
    <>
      <div style={{ ...s.backdrop(sidebarOpen), onClick: () => setSidebarOpen(false) }} />
      <div style={{ ...s.sidebar(sidebarOpen) }}>
        <div style={{ padding: "clamp(12px, 2.5vw, 16px)", borderBottom: `1px solid ${C.glassBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 6, background: `linear-gradient(135deg, ${C.cyan}, ${C.accentAlt})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: C.navy }}>IX</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", color: C.white }}>IITIX LABS</div>
              <div style={{ fontSize: 9, color: C.gray300, letterSpacing: "0.1em" }}>COMMAND</div>
            </div>
          </div>
        </div>

        <div style={{ padding: "clamp(8px, 1.5vw, 8px)", flex: 1, overflowY: "auto" }}>
          {NAV.map(n => {
            const isActive = active === n.id;
            const showDot = n.id === "focus" && timerActive;
            return (
              <button key={n.id} onClick={() => handleNav(n.id)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: "clamp(8px, 1.5vw, 10px)", padding: "clamp(8px, 1.5vw, 9px) clamp(10px, 2vw, 12px)", borderRadius: 8, border: "none", cursor: "pointer",
                background: isActive ? `${C.cyan}14` : "transparent", color: isActive ? C.cyan : C.gray300,
                fontSize: "clamp(12px, 1.8vw, 13px)", textAlign: "left", marginBottom: 2, borderLeft: isActive ? `2px solid ${C.cyan}` : "2px solid transparent",
                transition: "all 0.15s", position: "relative",
              }}>
                <span style={{ fontSize: "clamp(14px, 2vw, 16px)", flexShrink: 0 }}>{n.icon}</span>
                <span>{n.label}</span>
                {showDot && <div style={{ position: "absolute", right: 12, width: 6, height: 6, borderRadius: "50%", background: C.cyan, animation: "pulse 1.5s infinite" }} />}
              </button>
            );
          })}
        </div>

        <div style={{ padding: "clamp(12px, 2vw, 12px)", borderTop: `1px solid ${C.glassBorder}`, fontSize: "clamp(10px, 1.5vw, 11px)" }}>
          <div style={{ color: C.gray500, marginBottom: 4, letterSpacing: "0.06em" }}>OPERATOR</div>
          {user && (
            <>
              <div style={{ fontSize: "clamp(12px, 1.8vw, 13px)", color: C.white, fontWeight: 500, marginBottom: 2 }}>{user.name}</div>
              <div style={{ fontSize: "clamp(10px, 1.5vw, 11px)", color: C.cyan, letterSpacing: "0.04em", marginBottom: 6 }}>{user.id}</div>
            </>
          )}
          <div style={{ fontSize: "clamp(9px, 1.3vw, 10px)", color: C.gray500, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.glassBorder}` }}>Engineered by<br />Debaprasad Datta</div>
        </div>
      </div>
    </>
  );
}

// ─── TOPBAR ────────────────────────────────────────────────────────────────
function TopBar({ page, user, onLogout, sidebarOpen, setSidebarOpen }) {
  const labels = { dashboard: "Command Dashboard", focus: "Focus Systems", attendance: "Attendance", operations: "Operations", analytics: "Analytics", assessments: "Assessments", reports: "Reports", profile: "Profile" };
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "clamp(12px, 2vw, 16px)", width: "100%" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "clamp(14px, 2.5vw, 15px)", fontWeight: 500, color: C.white, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{labels[page] || page}</div>
        <div style={{ fontSize: "clamp(10px, 1.5vw, 11px)", color: C.gray300, letterSpacing: "0.04em" }}>Operational Intelligence</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "clamp(8px, 2vw, 12px)", flexShrink: 0 }}>
        <div style={{ fontSize: "clamp(10px, 1.5vw, 12px)", color: C.gray300 }}>
          {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
        </div>
        <button onClick={onLogout} style={{ ...s.btnGhost, padding: "clamp(6px, 1.5vw, 6px) clamp(10px, 2vw, 12px)", fontSize: "clamp(11px, 1.8vw, 12px)" }}>Sign out</button>
      </div>
    </div>
  );
}

// ─── DASHBOARD PAGE ────────────────────────────────────────────────────────
function DashboardPage({ user, profile }) {
  const uid = user?.id || "guest";
  const tasks = store.get("tasks_" + uid, []);
  const tests = store.get("tests_" + uid, []);
  const sessions = store.get("sessions", []);

  const completedTasks = tasks.filter(t => t.status === "done").length;
  const examYear = parseInt(profile?.year || "2027");
  const daysLeft = Math.max(0, Math.ceil((new Date(examYear, 3, 20) - new Date()) / 86400000));
  const pendingTests = tests.filter(t => !t.result).length;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  });
  const last7Focus = last7Days.map(date => {
    const daySessions = sessions.filter(s => new Date(s.timestamp).toISOString().split("T")[0] === date);
    return Math.round(daySessions.reduce((a, s) => a + s.duration, 0) / 60000);
  });
  const avgFocus = last7Focus.some(v => v > 0) ? Math.round(last7Focus.reduce((a, v) => a + v, 0) / 7) : 0;

  const focusTrend = last7Days.slice().reverse().map(date => {
    const daySessions = sessions.filter(s => new Date(s.timestamp).toISOString().split("T")[0] === date);
    const d = new Date(date);
    return { day: d.toLocaleDateString("en", { weekday: "short" }), minutes: Math.round(daySessions.reduce((a, s) => a + s.duration, 0) / 60000) };
  });

  const profileData = profile || {};

  return (
    <div>
      <div style={{ marginBottom: "clamp(20px, 3vw, 28px)" }}>
        <h1 style={{ ...s.h1, marginBottom: 4 }}>Command Dashboard</h1>
        <p style={{ ...s.muted }}>Your operational command center</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "clamp(10px, 2vw, 16px)", marginBottom: "clamp(20px, 3vw, 28px)" }}>
        <div style={{ ...s.card, borderTop: `2px solid ${C.cyan}` }}>
          <div style={{ ...s.label, marginBottom: 8 }}>Mission Countdown</div>
          <div style={{ fontSize: "clamp(24px, 4vw, 30px)", fontWeight: 200, color: C.cyan }}>{daysLeft}</div>
          <div style={{ ...s.muted, fontSize: 11, marginTop: 4 }}>days to exam</div>
        </div>
        <div style={{ ...s.card, borderTop: `2px solid ${C.success}` }}>
          <div style={{ ...s.label, marginBottom: 8 }}>Tasks Complete</div>
          <div style={{ fontSize: "clamp(24px, 4vw, 30px)", fontWeight: 200, color: C.success }}>{completedTasks}/{tasks.length}</div>
          <div style={{ ...s.muted, fontSize: 11, marginTop: 4 }}>done / total</div>
        </div>
        <div style={{ ...s.card, borderTop: `2px solid ${C.warning}` }}>
          <div style={{ ...s.label, marginBottom: 8 }}>Upcoming Tests</div>
          <div style={{ fontSize: "clamp(24px, 4vw, 30px)", fontWeight: 200, color: C.warning }}>{pendingTests}</div>
          <div style={{ ...s.muted, fontSize: 11, marginTop: 4 }}>pending</div>
        </div>
        <div style={{ ...s.card, borderTop: `2px solid ${C.accentAlt}` }}>
          <div style={{ ...s.label, marginBottom: 8 }}>Avg Focus</div>
          <div style={{ fontSize: "clamp(24px, 4vw, 30px)", fontWeight: 200, color: C.accentAlt }}>{avgFocus}</div>
          <div style={{ ...s.muted, fontSize: 11, marginTop: 4 }}>min/day (7-day avg)</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "clamp(16px, 2.5vw, 20px)" }}>
        <div style={s.card}>
          <div style={{ ...s.h3, marginBottom: 16 }}>Focus Trend — Last 7 Days</div>
          {focusTrend.every(d => d.minutes === 0) ? (
            <div style={{ color: C.gray300, fontSize: 13, textAlign: "center", padding: "24px 0" }}>No focus sessions yet — use the stopwatch to log study time</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={focusTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.glassBorder} />
                <XAxis dataKey="day" tick={{ fill: C.gray300, fontSize: 11 }} />
                <YAxis tick={{ fill: C.gray300, fontSize: 11 }} />
                <Tooltip contentStyle={{ background: C.navyMid, border: `1px solid ${C.glassBorder}`, borderRadius: 8 }} labelStyle={{ color: C.white }} itemStyle={{ color: C.cyan }} formatter={v => [v + " min", "Focus"]} />
                <Line type="monotone" dataKey="minutes" stroke={C.cyan} strokeWidth={2} dot={{ fill: C.cyan, r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={s.card}>
          <div style={{ ...s.h3, marginBottom: 16 }}>Profile Summary</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { label: "Target Exam", value: profileData.exam || "—" },
              { label: "Exam Year", value: profileData.year || "—" },
              { label: "Mode", value: profileData.mode || "—" },
              { label: "Target Rank", value: profileData.targetRank || "—" },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${C.glassBorder}` }}>
                <span style={{ ...s.label }}>{label}</span>
                <span style={{ fontSize: 14, color: C.white, fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── OPERATIONS PAGE ─────────────────────────────────────────────────────────
function OperationsPage({ user }) {
  const SUBJECTS = ["Physics", "Chemistry", "Mathematics", "Biology", "English", "Other"];
  const PRIORITIES = ["High", "Medium", "Low"];
  const uid = user?.id || "guest";

  const [tasks, setTasks] = useState(() => store.get("tasks_" + uid, []));
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", subject: "Physics", deadline: "", priority: "Medium" });

  const saveTasks = updated => { setTasks(updated); store.set("tasks_" + uid, updated); };

  const addTask = () => {
    if (!form.title.trim()) return;
    const newTask = { id: Date.now(), title: form.title, subject: form.subject, deadline: form.deadline, priority: form.priority, status: "pending", createdAt: Date.now() };
    saveTasks([...tasks, newTask]);
    setForm({ title: "", subject: "Physics", deadline: "", priority: "Medium" });
    setShowForm(false);
  };

  const toggleTask = id => saveTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === "done" ? "pending" : "done" } : t));
  const deleteTask = id => saveTasks(tasks.filter(t => t.id !== id));

  const filtered = tasks.filter(t => filter === "all" ? true : filter === "done" ? t.status === "done" : t.status !== "done");
  const priorityColor = p => p === "High" ? C.danger : p === "Medium" ? C.warning : C.success;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "clamp(20px, 3vw, 28px)", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ ...s.h1, marginBottom: 4 }}>Operations</h1>
          <p style={{ ...s.muted }}>Manage your study tasks</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ ...s.btn }}>+ Add Task</button>
      </div>

      {showForm && (
        <div style={{ ...s.card, marginBottom: "clamp(20px, 3vw, 28px)", border: `1px solid ${C.cyan}40` }}>
          <div style={{ ...s.h3, marginBottom: 16 }}>New Task</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ ...s.label, marginBottom: 6 }}>Title</div>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Task title..." style={{ ...s.input }} onKeyDown={e => e.key === "Enter" && addTask()} />
            </div>
            <div>
              <div style={{ ...s.label, marginBottom: 6 }}>Subject</div>
              <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} style={{ ...s.input }}>
                {SUBJECTS.map(sub => <option key={sub} value={sub}>{sub}</option>)}
              </select>
            </div>
            <div>
              <div style={{ ...s.label, marginBottom: 6 }}>Priority</div>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} style={{ ...s.input }}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <div style={{ ...s.label, marginBottom: 6 }}>Deadline</div>
              <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} style={{ ...s.input }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={addTask} style={{ ...s.btn }}>Add Task</button>
            <button onClick={() => setShowForm(false)} style={{ ...s.btnGhost }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: "clamp(16px, 2.5vw, 20px)", flexWrap: "wrap" }}>
        {[["all", tasks.length], ["pending", tasks.filter(t => t.status !== "done").length], ["done", tasks.filter(t => t.status === "done").length]].map(([f, count]) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            ...s.btnGhost, borderColor: filter === f ? C.cyan : C.glassBorder,
            color: filter === f ? C.cyan : C.gray300, background: filter === f ? `${C.cyan}12` : "transparent",
            padding: "6px 16px", fontSize: 12, textTransform: "capitalize",
          }}>{f} ({count})</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ ...s.card, textAlign: "center", padding: 40, color: C.gray300 }}>
          {tasks.length === 0 ? 'No tasks yet — click "+ Add Task" to get started' : "No tasks in this filter"}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(t => (
            <div key={t.id} style={{ ...s.card, display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", opacity: t.status === "done" ? 0.65 : 1 }}>
              <input type="checkbox" checked={t.status === "done"} onChange={() => toggleTask(t.id)} style={{ width: 16, height: 16, accentColor: C.cyan, flexShrink: 0, cursor: "pointer" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, color: C.white, fontWeight: 500, textDecoration: t.status === "done" ? "line-through" : "none", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ ...s.tag(C.cyan), fontSize: 11 }}>{t.subject}</span>
                  {t.deadline && <span style={{ fontSize: 11, color: C.gray300 }}>📅 {t.deadline}</span>}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: priorityColor(t.priority), title: t.priority + " Priority" }} />
                <button onClick={() => deleteTask(t.id)} style={{ background: "transparent", border: "none", color: C.danger, cursor: "pointer", fontSize: 14, padding: "4px 8px", borderRadius: 4 }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ANALYTICS PAGE ──────────────────────────────────────────────────────────
function AnalyticsPage({ user }) {
  const uid = user?.id || "guest";
  const tasks = store.get("tasks_" + uid, []);
  const sessions = store.get("sessions", []);
  const tests = store.get("tests_" + uid, []);

  const subjectData = ["Physics", "Chemistry", "Mathematics", "Biology", "English", "Other"].map(sub => ({
    subject: sub.slice(0, 4),
    tasks: tasks.filter(t => t.subject === sub).length,
    done: tasks.filter(t => t.subject === sub && t.status === "done").length,
  })).filter(d => d.tasks > 0);

  const focusTrendData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    const dateStr = d.toISOString().split("T")[0];
    const daySessions = sessions.filter(s => new Date(s.timestamp).toISOString().split("T")[0] === dateStr);
    return { day: d.toLocaleDateString("en", { weekday: "short" }), minutes: Math.round(daySessions.reduce((a, s) => a + s.duration, 0) / 60000) };
  });

  const testData = tests.slice(-10).map(t => ({ name: (t.title || "Test").slice(0, 8), score: t.score || 0, topper: t.topper || 0 }));

  return (
    <div>
      <div style={{ marginBottom: "clamp(20px, 3vw, 28px)" }}>
        <h1 style={{ ...s.h1, marginBottom: 4 }}>Analytics</h1>
        <p style={{ ...s.muted }}>Your performance insights</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "clamp(16px, 2.5vw, 20px)" }}>
        <div style={s.card}>
          <div style={{ ...s.h3, marginBottom: 16 }}>Subject Coverage</div>
          {subjectData.length === 0 ? (
            <div style={{ color: C.gray300, fontSize: 13, textAlign: "center", padding: 24 }}>No data yet — add tasks in Operations</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.glassBorder} />
                <XAxis dataKey="subject" tick={{ fill: C.gray300, fontSize: 11 }} />
                <YAxis tick={{ fill: C.gray300, fontSize: 11 }} />
                <Tooltip contentStyle={{ background: C.navyMid, border: `1px solid ${C.glassBorder}`, borderRadius: 8 }} labelStyle={{ color: C.white }} />
                <Bar dataKey="tasks" fill={`${C.cyan}99`} radius={[4, 4, 0, 0]} name="Total" />
                <Bar dataKey="done" fill={C.success} radius={[4, 4, 0, 0]} name="Done" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={s.card}>
          <div style={{ ...s.h3, marginBottom: 16 }}>Focus Trend — 14 Days</div>
          {focusTrendData.every(d => d.minutes === 0) ? (
            <div style={{ color: C.gray300, fontSize: 13, textAlign: "center", padding: 24 }}>No data yet — use the stopwatch to log sessions</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={focusTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.glassBorder} />
                <XAxis dataKey="day" tick={{ fill: C.gray300, fontSize: 11 }} />
                <YAxis tick={{ fill: C.gray300, fontSize: 11 }} />
                <Tooltip contentStyle={{ background: C.navyMid, border: `1px solid ${C.glassBorder}`, borderRadius: 8 }} labelStyle={{ color: C.white }} formatter={v => [v + " min", "Focus"]} />
                <Line type="monotone" dataKey="minutes" stroke={C.cyan} strokeWidth={2} dot={{ fill: C.cyan, r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ ...s.card, gridColumn: "1 / -1" }}>
          <div style={{ ...s.h3, marginBottom: 16 }}>Test Scores vs Topper</div>
          {testData.length === 0 ? (
            <div style={{ color: C.gray300, fontSize: 13, textAlign: "center", padding: 24 }}>No data yet — log test results in Assessments</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={testData}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.glassBorder} />
                <XAxis dataKey="name" tick={{ fill: C.gray300, fontSize: 11 }} />
                <YAxis tick={{ fill: C.gray300, fontSize: 11 }} />
                <Tooltip contentStyle={{ background: C.navyMid, border: `1px solid ${C.glassBorder}`, borderRadius: 8 }} labelStyle={{ color: C.white }} />
                <Area type="monotone" dataKey="topper" stroke={C.warning} fill={`${C.warning}20`} strokeWidth={2} name="Topper" />
                <Area type="monotone" dataKey="score" stroke={C.cyan} fill={`${C.cyan}20`} strokeWidth={2} name="Your Score" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ASSESSMENTS PAGE ────────────────────────────────────────────────────────
function AssessmentsPage({ user }) {
  const uid = user?.id || "guest";
  const [tests, setTests] = useState(() => store.get("tests_" + uid, []));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", score: "", topper: "", total: "100" });

  const saveTests = updated => { setTests(updated); store.set("tests_" + uid, updated); };
  const addTest = () => {
    if (!form.title.trim()) return;
    saveTests([...tests, { id: Date.now(), title: form.title, date: form.date, score: Number(form.score), topper: Number(form.topper), total: Number(form.total), result: !!form.score }]);
    setForm({ title: "", date: "", score: "", topper: "", total: "100" });
    setShowForm(false);
  };
  const deleteTest = id => saveTests(tests.filter(t => t.id !== id));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "clamp(20px, 3vw, 28px)", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ ...s.h1, marginBottom: 4 }}>Assessments</h1>
          <p style={{ ...s.muted }}>Track your test scores</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ ...s.btn }}>+ Log Test</button>
      </div>

      {showForm && (
        <div style={{ ...s.card, marginBottom: 20, border: `1px solid ${C.cyan}40` }}>
          <div style={{ ...s.h3, marginBottom: 16 }}>New Test Result</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ ...s.label, marginBottom: 6 }}>Test Name</div>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. JEE Mock #3" style={{ ...s.input }} />
            </div>
            <div>
              <div style={{ ...s.label, marginBottom: 6 }}>Date</div>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ ...s.input }} />
            </div>
            <div>
              <div style={{ ...s.label, marginBottom: 6 }}>Total Marks</div>
              <input type="number" value={form.total} onChange={e => setForm(f => ({ ...f, total: e.target.value }))} style={{ ...s.input }} />
            </div>
            <div>
              <div style={{ ...s.label, marginBottom: 6 }}>Your Score</div>
              <input type="number" value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))} style={{ ...s.input }} />
            </div>
            <div>
              <div style={{ ...s.label, marginBottom: 6 }}>Topper Score</div>
              <input type="number" value={form.topper} onChange={e => setForm(f => ({ ...f, topper: e.target.value }))} style={{ ...s.input }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={addTest} style={{ ...s.btn }}>Log Test</button>
            <button onClick={() => setShowForm(false)} style={{ ...s.btnGhost }}>Cancel</button>
          </div>
        </div>
      )}

      {tests.length === 0 ? (
        <div style={{ ...s.card, textAlign: "center", padding: 40, color: C.gray300 }}>No test results yet — log your first test above</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tests.slice().reverse().map(t => {
            const pct = t.total ? Math.round((t.score / t.total) * 100) : 0;
            const color = pct >= 70 ? C.success : pct >= 50 ? C.warning : C.danger;
            return (
              <div key={t.id} style={{ ...s.card, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: C.white, fontWeight: 500, marginBottom: 4 }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: C.gray300 }}>{t.date}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 200, color }}>{t.score}/{t.total}</div>
                  <div style={{ ...s.label, color }}>{pct}%</div>
                </div>
                {t.topper > 0 && (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 13, color: C.warning }}>{t.topper}</div>
                    <div style={{ ...s.label }}>Topper</div>
                  </div>
                )}
                <button onClick={() => deleteTest(t.id)} style={{ background: "transparent", border: "none", color: C.danger, cursor: "pointer", fontSize: 14, padding: "4px 8px" }}>✕</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── REPORTS PAGE ─────────────────────────────────────────────────────────────
function ReportsPage({ user }) {
  const uid = user?.id || "guest";
  const tasks = store.get("tasks_" + uid, []);
  const sessions = store.get("sessions", []);
  const tests = store.get("tests_" + uid, []);

  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const daySessions = sessions.filter(s => new Date(s.timestamp).toISOString().split("T")[0] === dateStr);
    return { day: d.toLocaleDateString("en", { weekday: "short" }), focus: Math.round(daySessions.reduce((a, s) => a + s.duration, 0) / 60000) };
  });

  const totalFocusMinutes = Math.round(sessions.reduce((a, s) => a + s.duration, 0) / 60000);
  const avgScore = tests.length ? Math.round(tests.reduce((a, t) => a + (t.total ? (t.score / t.total) * 100 : 0), 0) / tests.length) : null;

  return (
    <div>
      <div style={{ marginBottom: "clamp(20px, 3vw, 28px)" }}>
        <h1 style={{ ...s.h1, marginBottom: 4 }}>Reports</h1>
        <p style={{ ...s.muted }}>Weekly performance summary</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
        <div style={{ ...s.card, borderTop: `2px solid ${C.cyan}` }}>
          <div style={{ ...s.label, marginBottom: 8 }}>Total Focus</div>
          <div style={{ fontSize: 22, fontWeight: 200, color: C.cyan }}>{Math.floor(totalFocusMinutes / 60)}h {totalFocusMinutes % 60}m</div>
        </div>
        <div style={{ ...s.card, borderTop: `2px solid ${C.success}` }}>
          <div style={{ ...s.label, marginBottom: 8 }}>Tasks Done</div>
          <div style={{ fontSize: 22, fontWeight: 200, color: C.success }}>{tasks.filter(t => t.status === "done").length}/{tasks.length}</div>
        </div>
        <div style={{ ...s.card, borderTop: `2px solid ${C.warning}` }}>
          <div style={{ ...s.label, marginBottom: 8 }}>Avg Score</div>
          <div style={{ fontSize: 22, fontWeight: 200, color: C.warning }}>{avgScore !== null ? avgScore + "%" : "—"}</div>
        </div>
        <div style={{ ...s.card, borderTop: `2px solid ${C.accentAlt}` }}>
          <div style={{ ...s.label, marginBottom: 8 }}>Tests Logged</div>
          <div style={{ fontSize: 22, fontWeight: 200, color: C.accentAlt }}>{tests.length}</div>
        </div>
      </div>

      <div style={s.card}>
        <div style={{ ...s.h3, marginBottom: 16 }}>Focus This Week</div>
        {weekData.every(d => d.focus === 0) ? (
          <div style={{ color: C.gray300, fontSize: 13, textAlign: "center", padding: 24 }}>No focus sessions logged this week</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.glassBorder} />
              <XAxis dataKey="day" tick={{ fill: C.gray300, fontSize: 11 }} />
              <YAxis tick={{ fill: C.gray300, fontSize: 11 }} />
              <Tooltip contentStyle={{ background: C.navyMid, border: `1px solid ${C.glassBorder}`, borderRadius: 8 }} labelStyle={{ color: C.white }} formatter={v => [v + " min", "Focus"]} />
              <Bar dataKey="focus" fill={C.cyan} opacity={0.8} radius={[4, 4, 0, 0]} name="Focus (min)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
function ProfilePage({ user, onLogout }) {
  const profile = store.get("profile_" + user?.id, {});
  return (
    <div>
      <div style={{ marginBottom: "clamp(20px, 3vw, 28px)" }}>
        <h1 style={{ ...s.h1, marginBottom: 4 }}>Profile</h1>
        <p style={{ ...s.muted }}>Your operator profile</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 20 }}>
        <div style={s.card}>
          <div style={{ ...s.h3, marginBottom: 16 }}>Identity</div>
          {[["Name", user?.name], ["ID", user?.id], ["Email", user?.email]].map(([label, value]) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <div style={{ ...s.label, marginBottom: 4 }}>{label}</div>
              <div style={{ color: label === "ID" ? C.cyan : C.white, fontSize: label === "ID" ? 13 : 15 }}>{value || "—"}</div>
            </div>
          ))}
        </div>
        <div style={s.card}>
          <div style={{ ...s.h3, marginBottom: 16 }}>Exam Profile</div>
          {[["Target Exam", profile?.exam], ["Exam Year", profile?.year], ["Mode", profile?.mode], ["Target Rank", profile?.targetRank]].map(([label, value]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.glassBorder}` }}>
              <span style={{ ...s.label }}>{label}</span>
              <span style={{ fontSize: 14, color: label === "Target Rank" ? C.cyan : C.white, fontWeight: 500 }}>{value || "—"}</span>
            </div>
          ))}
        </div>
      </div>
      <button onClick={onLogout} style={{ ...s.btnOutline }}>Sign Out</button>
    </div>
  );
}

// ─── DAILY INITIALIZATION ─────────────────────────────────────────────────────
function DailyInitialization({ user, onComplete }) {
  const goals = [
    { key: "intention", label: "Today's Intention", question: "What is your primary goal today?", options: ["Complete DPP sheets", "Revise weak topics", "Mock test practice", "Concept building"] },
    { key: "focusSubject", label: "Focus Subject", question: "Which subject gets priority today?", options: ["Physics", "Chemistry", "Mathematics", "Biology"] },
    { key: "energyLevel", label: "Energy Level", question: "How is your energy level today?", options: ["Peak — ready to grind", "Good — focused mode", "Moderate — steady pace", "Low — light revision"] },
  ];

  const [step, setStep] = useState(0);
  const [data, setData] = useState({});

  const select = val => {
    const nd = { ...data, [goals[step].key]: val };
    setData(nd);
    if (step < goals.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(nd);
    }
  };

  const cur = goals[step];
  const progress = (step / goals.length) * 100;

  return (
    <div style={{ minHeight: "100vh", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif", padding: "clamp(16px, 4vw, 40px)" }}>
      <div style={{ width: "clamp(280px, 90%, 520px)", background: C.navyMid, border: `1px solid ${C.glassBorder}`, borderRadius: 16, padding: "clamp(24px, 5vw, 40px)" }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: C.gray300 }}>Daily Setup — Step {step + 1} of {goals.length}</span>
        </div>
        <div style={{ height: 3, background: C.glass, borderRadius: 2, marginBottom: 32 }}>
          <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${C.cyan}, ${C.accentAlt})`, borderRadius: 2, transition: "width 0.3s" }} />
        </div>
        {user && <div style={{ fontSize: 13, color: C.gray300, marginBottom: 16 }}>Good morning, {user.name || "Aspirant"} 👋</div>}
        <div style={{ fontSize: "clamp(16px, 3vw, 20px)", fontWeight: 300, color: C.white, marginBottom: 24 }}>{cur.question}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {cur.options.map(opt => (
            <button key={opt} onClick={() => select(opt)} style={{
              background: data[cur.key] === opt ? `${C.cyan}18` : C.glass,
              border: `1px solid ${data[cur.key] === opt ? C.cyan : C.glassBorder}`,
              borderRadius: 10, padding: "14px 18px", color: C.white, fontSize: 14,
              cursor: "pointer", textAlign: "left", transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <span style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${data[cur.key] === opt ? C.cyan : C.gray500}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {data[cur.key] === opt && <span style={{ width: 9, height: 9, borderRadius: "50%", background: C.cyan }} />}
              </span>
              {opt}
            </button>
          ))}
        </div>
        {step > 0 && <button onClick={() => setStep(step - 1)} style={{ marginTop: 20, background: "transparent", border: `1px solid ${C.glassBorder}`, borderRadius: 8, padding: "8px 16px", color: C.gray300, fontSize: 13, cursor: "pointer" }}>← Back</button>}
      </div>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────
export default function AppEnhanced() {
  const [screen, setScreen] = useState("landing");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { pomodoroState, setPomodoroState, stopwatchState, setStopwatchState } = useTimerController();
  const timerActive = pomodoroState.isRunning || stopwatchState.isRunning;

  useEffect(() => {
    const uid = store.get("currentUser", null);
    if (uid) {
      const users = store.get("users", []);
      const u = users.find(u => u.id === uid);
      if (u) {
        const p = store.get("profile_" + uid, null);
        setUser(u);
        setProfile(p);
        store.set("currentUser_obj", u);
        if (!p) { setScreen("onboard"); return; }
        const today = new Date().toISOString().split("T")[0];
        const todayInit = store.get("init_date", null);
        setScreen(todayInit === today ? "app" : "daily-init");
      } else {
        setScreen("landing");
      }
    }
  }, []);

  const handleLogin = u => {
    const p = store.get("profile_" + u.id, null);
    setUser(u); setProfile(p);
    if (!p) { setScreen("onboard"); return; }
    const today = new Date().toISOString().split("T")[0];
    const todayInit = store.get("init_date", null);
    setScreen(todayInit === today ? "app" : "daily-init");
  };

  const handleDailyInit = () => {
    const today = new Date().toISOString().split("T")[0];
    store.set("init_date", today);
    setScreen("app");
  };

  const handleLogout = () => {
    store.set("currentUser", null);
    store.set("currentUser_obj", null);
    setUser(null);
    setProfile(null);
    setScreen("landing");
  };

  if (screen === "landing") return <LandingPage onLogin={() => setScreen("login")} onSignup={() => setScreen("signup")} />;
  if (screen === "login") return <LoginPage onLogin={handleLogin} onSignup={() => setScreen("signup")} onBack={() => setScreen("landing")} />;
  if (screen === "signup") return <SignupPage onSignup={u => { setUser(u); setScreen("onboard"); }} onLogin={() => setScreen("login")} onBack={() => setScreen("landing")} />;
  if (screen === "onboard") return <Onboarding user={user} onComplete={p => { setProfile(p); setScreen("daily-init"); }} />;
  if (screen === "daily-init") return <DailyInitialization user={user} onComplete={handleDailyInit} />;

  return (
    <div style={{ minHeight: "100vh", background: C.navy, color: C.white, fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", display: "flex", flexDirection: "row" }}>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
      <Sidebar active={page} onNav={setPage} user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} timerActive={timerActive} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
        <div style={s.topbar}>
          <TopBar page={page} user={user} onLogout={handleLogout} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>
        <div style={s.content}>
          {page === "dashboard" && <DashboardPage user={user} profile={profile} />}
          {page === "focus" && <FocusSystemsPage pomodoroState={pomodoroState} setPomodoroState={setPomodoroState} stopwatchState={stopwatchState} setStopwatchState={setStopwatchState} timerActive={timerActive} />}
          {page === "attendance" && <AttendanceModule />}
          {page === "operations" && <OperationsPage user={user} />}
          {page === "analytics" && <AnalyticsPage user={user} />}
          {page === "assessments" && <AssessmentsPage user={user} />}
          {page === "reports" && <ReportsPage user={user} />}
          {page === "profile" && <ProfilePage user={user} onLogout={handleLogout} />}
        </div>
      </div>
    </div>
  );
}
