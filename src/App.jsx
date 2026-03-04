import { useState, useEffect, useRef } from "react";

// ── constants ──────────────────────────────────────────────────────────────
const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
  { text: "It's not about having time. It's about making time.", author: "Unknown" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Either you run the day or the day runs you.", author: "Jim Rohn" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
];

const INIT_ACCOUNTS = [
  { id: 1, name: "Train Technologies", revenue: 1500000, current: 200000, lastContact: "2026-03-01", nextAction: "Follow up on Q2 proposal", status: "green", notes: "Primary account — annual goal $1.5M" },
  { id: 2, name: "NPT", revenue: null, current: 0, lastContact: "2026-02-20", nextAction: "Schedule quarterly review", status: "yellow", notes: "" },
  { id: 3, name: "Springs Window Fashions", revenue: null, current: 0, lastContact: "2026-02-15", nextAction: "Send product overview deck", status: "yellow", notes: "" },
  { id: 4, name: "EPRI", revenue: null, current: 0, lastContact: "2026-02-10", nextAction: "Re-engage — no contact in 3 weeks", status: "red", notes: "" },
  { id: 5, name: "Sharebite", revenue: null, current: 0, lastContact: "2026-02-25", nextAction: "Intro call follow-up", status: "green", notes: "Actively pursuing" },
];

const INIT_TASKS = [
  { id: 1, text: "Complete email to Jake", due: "2026-03-03", notes: "", done: false, priority: 2 },
  { id: 2, text: "Review Q3 proposal from Sarah", due: "2026-03-04", notes: "Check budget section carefully", done: false, priority: 1 },
  { id: 3, text: "Submit expense report", due: "2026-03-03", notes: "", done: false, priority: 2 },
  { id: 4, text: "Follow up with Sharebite", due: "2026-03-05", notes: "", done: false, priority: 1 },
];

const INIT_CONTACTS = [
  { id: 1, name: "Sarah Mitchell", company: "Train Technologies", lastContact: "2026-02-20", notes: "Working on Q3 proposal. Very detail-oriented.", tags: ["Client"] },
  { id: 2, name: "David Park", company: "NPT", lastContact: "2026-02-15", notes: "Met at conference. Wants to explore partnership.", tags: ["Prospect"] },
  { id: 3, name: "Karen Lee", company: "Internal", lastContact: "2026-02-25", notes: "My manager. Weekly 1:1s on Fridays.", tags: ["Internal"] },
];

const MOCK_EMAILS = [
  { id: 1, from: "Sarah Mitchell", subject: "Q3 Proposal — needs your sign-off", urgency: "high" },
  { id: 2, from: "David Park", subject: "Lunch next week?", urgency: "low" },
  { id: 3, from: "Finance Team", subject: "Invoice overdue — action required", urgency: "high" },
];

const TABS = ["Dashboard", "Accounts", "Tasks", "Relationships", "Emails"];
const TAG_COLORS = { Client: "#6C63FF", Prospect: "#00C9A7", Internal: "#FF6B6B", Partner: "#FFB347", Other: "#888" };
const STATUS_MAP = { green: { color: "#00C9A7", label: "On Track" }, yellow: { color: "#FFB347", label: "Needs Attention" }, red: { color: "#FF6B6B", label: "At Risk" } };

// ── tiny components ────────────────────────────────────────────────────────
function PriorityBadge({ p }) {
  const map = { 1: ["#FF6B6B", "High"], 2: ["#FFB347", "Medium"], 3: ["#00C9A7", "Low"] };
  const [color, label] = map[p] || ["#888", "—"];
  return <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 4, fontSize: 11, padding: "2px 7px", fontWeight: 600 }}>{label}</span>;
}

function Btn({ children, onClick, variant = "primary", style = {} }) {
  const base = { borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", transition: "all .15s" };
  const variants = {
    primary: { background: "linear-gradient(135deg,#6C63FF,#8B5CF6)", color: "#fff", boxShadow: "0 2px 8px #6C63FF44" },
    ghost: { background: "transparent", color: "#aaa", border: "1px solid #2e3350" },
    danger: { background: "#FF6B6B22", color: "#FF6B6B", border: "1px solid #FF6B6B44" },
    success: { background: "#00C9A722", color: "#00C9A7", border: "1px solid #00C9A744" },
  };
  return <button onClick={onClick} style={{ ...base, ...variants[variant], ...style }}>{children}</button>;
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000c", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#1a1d2e", border: "1px solid #2e3350", borderRadius: 16, padding: 28, width: 480, maxWidth: "95vw", boxShadow: "0 20px 60px #0008" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#e8eaf6" }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", fontSize: 22, cursor: "pointer" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <div style={{ fontSize: 12, color: "#888", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>}
      {children}
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <Field label={label}>
      <input {...props} style={{ width: "100%", background: "#0e1018", border: "1px solid #2e3350", borderRadius: 8, padding: "9px 12px", color: "#e8eaf6", fontSize: 14, boxSizing: "border-box", ...props.style }} />
    </Field>
  );
}

function Textarea({ label, ...props }) {
  return (
    <Field label={label}>
      <textarea {...props} style={{ width: "100%", background: "#0e1018", border: "1px solid #2e3350", borderRadius: 8, padding: "9px 12px", color: "#e8eaf6", fontSize: 14, resize: "vertical", boxSizing: "border-box", ...props.style }} />
    </Field>
  );
}

function Select({ label, children, ...props }) {
  return (
    <Field label={label}>
      <select {...props} style={{ width: "100%", background: "#0e1018", border: "1px solid #2e3350", borderRadius: 8, padding: "9px 12px", color: "#e8eaf6", fontSize: 14 }}>{children}</select>
    </Field>
  );
}

// ── voice command ──────────────────────────────────────────────────────────
function VoiceButton({ onCommand }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recRef = useRef(null);

  function toggle() {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice input is not supported in this browser. Please use Chrome.");
      return;
    }
    if (listening) { recRef.current?.stop(); setListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onstart = () => setListening(true);
    rec.onresult = e => {
      const t = Array.from(e.results).map(r => r[0].transcript).join("");
      setTranscript(t);
      if (e.results[e.results.length - 1].isFinal) { onCommand(t); setTranscript(""); }
    };
    rec.onend = () => setListening(false);
    rec.start();
    recRef.current = rec;
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button onClick={toggle} style={{
        width: 44, height: 44, borderRadius: "50%", border: "none", cursor: "pointer",
        background: listening ? "linear-gradient(135deg,#FF6B6B,#ff4444)" : "linear-gradient(135deg,#6C63FF,#8B5CF6)",
        boxShadow: listening ? "0 0 20px #FF6B6B88" : "0 0 20px #6C63FF88",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
        animation: listening ? "pulse 1s infinite" : "none",
        transition: "all .2s"
      }}>
        {listening ? "🔴" : "🎙️"}
      </button>
      {transcript && <span style={{ fontSize: 12, color: "#aaa", fontStyle: "italic" }}>"{transcript}"</span>}
      {listening && <span style={{ fontSize: 12, color: "#FF6B6B", fontWeight: 600 }}>Listening...</span>}
      <style>{`@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }`}</style>
    </div>
  );
}

// ── live clock ─────────────────────────────────────────────────────────────
function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const date = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" });
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return { greeting, date, time };
}

// ── main app ───────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("Dashboard");
  const [tasks, setTasks] = useState(() => { try { return JSON.parse(localStorage.getItem("tasks")) || INIT_TASKS; } catch { return INIT_TASKS; } });
  const [contacts, setContacts] = useState(() => { try { return JSON.parse(localStorage.getItem("contacts")) || INIT_CONTACTS; } catch { return INIT_CONTACTS; } });
  const [accounts, setAccounts] = useState(() => { try { return JSON.parse(localStorage.getItem("accounts")) || INIT_ACCOUNTS; } catch { return INIT_ACCOUNTS; } });
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [editContact, setEditContact] = useState(null);
  const [editAccount, setEditAccount] = useState(null);
  const [taskForm, setTaskForm] = useState({ text: "", due: "", notes: "", priority: 2 });
  const [contactForm, setContactForm] = useState({ name: "", company: "", lastContact: "", notes: "", tags: "" });
  const [accountForm, setAccountForm] = useState({ name: "", revenue: "", current: "", lastContact: "", nextAction: "", status: "green", notes: "" });
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [showArchive, setShowArchive] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState("");
  const [revenueEdit, setRevenueEdit] = useState(false);
  const [revenueInput, setRevenueInput] = useState("200000");

  const { greeting, date, time } = LiveClock();
  const today = new Date();
  const dailyQuote = QUOTES[today.getDate() % QUOTES.length];
  const trainAcct = accounts.find(a => a.name === "Train Technologies");

  useEffect(() => { localStorage.setItem("tasks", JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem("contacts", JSON.stringify(contacts)); }, [contacts]);
  useEffect(() => { localStorage.setItem("accounts", JSON.stringify(accounts)); }, [accounts]);

  const activeTasks = tasks.filter(t => !t.done).sort((a, b) => a.priority - b.priority);
  const doneTasks = tasks.filter(t => t.done);

  // ── voice command parser ───────────────────────────────────────────────
  function handleVoiceCommand(text) {
    const lower = text.toLowerCase();
    let feedback = "";

    if (lower.includes("add task") || lower.includes("new task") || lower.includes("add a task")) {
      const priority = lower.includes("high") ? 1 : lower.includes("low") ? 3 : 2;
      const cleaned = text
        .replace(/add (a )?task/i, "")
        .replace(/high|medium|low/i, "")
        .replace(/priority/i, "")
        .trim();
      const newTask = { id: Date.now(), text: cleaned, due: "", notes: "", done: false, priority };
      setTasks(ts => [...ts, newTask]);
      feedback = `✅ Task added: "${cleaned}"`;
    } else if (lower.includes("update revenue") || lower.includes("revenue is") || lower.includes("revenue update")) {
      const match = text.match(/[\d,]+/);
      if (match) {
        const val = parseInt(match[0].replace(/,/g, ""));
        setAccounts(as => as.map(a => a.name === "Train Technologies" ? { ...a, current: val } : a));
        feedback = `💰 Revenue updated to $${val.toLocaleString()}`;
      }
    } else if (lower.includes("add contact") || lower.includes("new contact")) {
      const cleaned = text.replace(/add (a )?contact/i, "").replace(/new contact/i, "").trim();
      const newContact = { id: Date.now(), name: cleaned, company: "", lastContact: today.toISOString().split("T")[0], notes: "", tags: [] };
      setContacts(cs => [...cs, newContact]);
      feedback = `🤝 Contact added: "${cleaned}"`;
    } else if (lower.includes("switch to") || lower.includes("go to") || lower.includes("open")) {
      const tabMatch = TABS.find(t => lower.includes(t.toLowerCase()));
      if (tabMatch) { setTab(tabMatch); feedback = `📂 Switched to ${tabMatch}`; }
    } else {
      feedback = `🤔 I heard: "${text}" — try saying "Add task [name]", "Update revenue to [amount]", or "Go to [tab name]"`;
    }

    setVoiceFeedback(feedback);
    setTimeout(() => setVoiceFeedback(""), 4000);
  }

  // ── task helpers ───────────────────────────────────────────────────────
  function openNewTask() { setTaskForm({ text: "", due: "", notes: "", priority: 2 }); setEditTask(null); setShowTaskModal(true); }
  function openEditTask(t) { setTaskForm({ text: t.text, due: t.due, notes: t.notes, priority: t.priority }); setEditTask(t); setShowTaskModal(true); }
  function saveTask() {
    if (!taskForm.text.trim()) return;
    if (editTask) setTasks(ts => ts.map(t => t.id === editTask.id ? { ...t, ...taskForm } : t));
    else setTasks(ts => [...ts, { id: Date.now(), ...taskForm, done: false }]);
    setShowTaskModal(false);
  }
  function toggleTask(id) { setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t)); }
  function deleteTask(id) { setTasks(ts => ts.filter(t => t.id !== id)); }

  // ── contact helpers ────────────────────────────────────────────────────
  function openNewContact() { setContactForm({ name: "", company: "", lastContact: "", notes: "", tags: "" }); setEditContact(null); setShowContactModal(true); }
  function openEditContact(c) { setContactForm({ name: c.name, company: c.company, lastContact: c.lastContact, notes: c.notes, tags: c.tags.join(", ") }); setEditContact(c); setShowContactModal(true); }
  function saveContact() {
    if (!contactForm.name.trim()) return;
    const tags = contactForm.tags.split(",").map(t => t.trim()).filter(Boolean);
    if (editContact) setContacts(cs => cs.map(c => c.id === editContact.id ? { ...c, ...contactForm, tags } : c));
    else setContacts(cs => [...cs, { id: Date.now(), ...contactForm, tags }]);
    setShowContactModal(false);
  }
  function deleteContact(id) { setContacts(cs => cs.filter(c => c.id !== id)); }

  // ── account helpers ────────────────────────────────────────────────────
  function openEditAccount(a) {
    setAccountForm({ name: a.name, revenue: a.revenue || "", current: a.current || 0, lastContact: a.lastContact, nextAction: a.nextAction, status: a.status, notes: a.notes });
    setEditAccount(a); setShowAccountModal(true);
  }
  function saveAccount() {
    setAccounts(as => as.map(a => a.id === editAccount.id ? { ...a, ...accountForm, revenue: accountForm.revenue ? Number(accountForm.revenue) : null, current: Number(accountForm.current) } : a));
    setShowAccountModal(false);
  }

  function runAI() {
    const sorted = [...activeTasks].sort((a, b) => { const dA = new Date(a.due), dB = new Date(b.due); return dA - dB || a.priority - b.priority; });
    setAiSuggestion(sorted.map((t, i) => `${i + 1}. ${t.text} — Due ${t.due || "no date"} · ${["", "High", "Medium", "Low"][t.priority]} priority`).join("\n"));
  }

  const card = { background: "#1a1d2e", border: "1px solid #252840", borderRadius: 14, padding: 20 };
  const glowCard = { ...card, boxShadow: "0 4px 24px #6C63FF18" };

  // top 3 focus items
  const focusItems = [...activeTasks].sort((a, b) => a.priority - b.priority).slice(0, 3);
  const atRiskAccounts = accounts.filter(a => a.status === "red");

  return (
    <div style={{ minHeight: "100vh", background: "#0e1018", color: "#e8eaf6", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(90deg,#13162a,#1a1d2e)", borderBottom: "1px solid #252840", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(10px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#6C63FF,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚡</div>
          <span style={{ fontWeight: 800, fontSize: 17, background: "linear-gradient(90deg,#e8eaf6,#a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Command Center</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? "#6C63FF22" : "transparent", color: tab === t ? "#a5b4fc" : "#666", border: tab === t ? "1px solid #6C63FF44" : "1px solid transparent", borderRadius: 8, padding: "6px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .15s" }}>{t}</button>
          ))}
        </div>
        <div style={{ fontSize: 13, color: "#666", fontVariantNumeric: "tabular-nums" }}>{time}</div>
      </div>

      <div style={{ padding: "28px 32px", maxWidth: 1140, margin: "0 auto" }}>

        {/* DASHBOARD */}
        {tab === "Dashboard" && (
          <div>
            {/* Greeting */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h2 style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 800, background: "linear-gradient(90deg,#e8eaf6,#a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{greeting}, Joe 👋</h2>
                  <div style={{ fontSize: 14, color: "#666" }}>{date}</div>
                </div>
                <VoiceButton onCommand={handleVoiceCommand} />
              </div>
              {voiceFeedback && (
                <div style={{ marginTop: 12, background: "#6C63FF18", border: "1px solid #6C63FF44", borderRadius: 10, padding: "10px 16px", fontSize: 14, color: "#a5b4fc" }}>{voiceFeedback}</div>
              )}
              <div style={{ background: "linear-gradient(135deg,#6C63FF11,#8B5CF611)", border: "1px solid #6C63FF33", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 12, marginTop: 14 }}>
                <span style={{ fontSize: 18 }}>💡</span>
                <div>
                  <div style={{ fontSize: 14, color: "#c7d2fe", fontStyle: "italic", lineHeight: 1.6 }}>"{dailyQuote.text}"</div>
                  <div style={{ fontSize: 12, color: "#6C63FF", marginTop: 4, fontWeight: 600 }}>— {dailyQuote.author}</div>
                </div>
              </div>
            </div>

            {/* Revenue Goal */}
            {trainAcct && (() => {
              const pct = Math.min(Math.round((trainAcct.current / trainAcct.revenue) * 100), 100);
              const remaining = trainAcct.revenue - trainAcct.current;
              const monthsLeft = Math.max(12 - new Date().getMonth(), 1);
              const perMonth = Math.round(remaining / monthsLeft);
              return (
                <div style={{ ...glowCard, marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <span>💰</span>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>Revenue Goal — Train Technologies</span>
                    <span style={{ marginLeft: "auto", fontSize: 12, color: "#00C9A7", fontWeight: 700 }}>2026 Annual Goal</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {revenueEdit ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 20, color: "#00C9A7", fontWeight: 700 }}>$</span>
                          <input autoFocus value={revenueInput} onChange={e => setRevenueInput(e.target.value.replace(/\D/g, ""))}
                            onKeyDown={e => { if (e.key === "Enter") { setAccounts(as => as.map(a => a.name === "Train Technologies" ? { ...a, current: Number(revenueInput) } : a)); setRevenueEdit(false); } if (e.key === "Escape") setRevenueEdit(false); }}
                            style={{ fontSize: 24, fontWeight: 800, background: "#0e1018", border: "1px solid #6C63FF", borderRadius: 8, color: "#00C9A7", padding: "4px 10px", width: 150 }} />
                          <Btn onClick={() => { setAccounts(as => as.map(a => a.name === "Train Technologies" ? { ...a, current: Number(revenueInput) } : a)); setRevenueEdit(false); }}>Save</Btn>
                          <Btn onClick={() => setRevenueEdit(false)} variant="ghost">Cancel</Btn>
                        </div>
                      ) : (
                        <>
                          <span style={{ fontSize: 28, fontWeight: 800, color: "#00C9A7" }}>${trainAcct.current.toLocaleString()}</span>
                          <span style={{ fontSize: 14, color: "#555" }}>of ${trainAcct.revenue.toLocaleString()}</span>
                          <Btn onClick={() => { setRevenueInput(String(trainAcct.current)); setRevenueEdit(true); }} variant="ghost" style={{ fontSize: 11, padding: "3px 10px" }}>✏️ Edit</Btn>
                        </>
                      )}
                    </div>
                    <span style={{ fontSize: 22, fontWeight: 800, color: pct >= 100 ? "#00C9A7" : "#e8eaf6" }}>{pct}%</span>
                  </div>
                  <div style={{ background: "#0e1018", borderRadius: 99, height: 10, overflow: "hidden", marginBottom: 16 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#6C63FF,#00C9A7)", borderRadius: 99, transition: "width .6s ease" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    {[{ label: "Remaining", value: `$${remaining.toLocaleString()}`, color: "#FF6B6B" }, { label: "Months Left", value: monthsLeft, color: "#e8eaf6" }, { label: "Needed / Month", value: remaining > 0 ? `$${perMonth.toLocaleString()}` : "Goal met! 🎉", color: "#FFB347" }].map(s => (
                      <div key={s.label} style={{ background: "#0e1018", borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                        <div style={{ fontSize: 17, fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: 11, color: "#555", marginTop: 3 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Daily Focus */}
            <div style={{ ...glowCard, marginBottom: 24, borderColor: "#FFB34744" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span>🎯</span>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Today's Focus</span>
                {atRiskAccounts.length > 0 && <span style={{ marginLeft: "auto", background: "#FF6B6B22", color: "#FF6B6B", border: "1px solid #FF6B6B44", borderRadius: 6, fontSize: 11, padding: "2px 8px", fontWeight: 600 }}>⚠️ {atRiskAccounts.length} account{atRiskAccounts.length > 1 ? "s" : ""} at risk</span>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#666", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Top Tasks</div>
                  {focusItems.map((t, i) => (
                    <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: "#6C63FF", fontWeight: 700, minWidth: 16 }}>{i + 1}.</span>
                      <span style={{ fontSize: 13, flex: 1 }}>{t.text}</span>
                      <PriorityBadge p={t.priority} />
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#666", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Accounts Needing Action</div>
                  {accounts.filter(a => a.status !== "green").map(a => (
                    <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_MAP[a.status].color, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{a.name}</div>
                        <div style={{ fontSize: 11, color: "#666" }}>{a.nextAction}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4 grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Calendar */}
              <div style={card}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span>📅</span><span style={{ fontWeight: 700, fontSize: 15 }}>Today's Schedule</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "#666", background: "#252840", padding: "2px 8px", borderRadius: 4 }}>Mock Data</span>
                </div>
                {[{ time: "9:00 AM", title: "Travis and Joe", dur: "30 min", color: "#6C63FF" }, { time: "11:00 AM", title: "Data Collab @ The Cabin", dur: "30 min", color: "#00C9A7" }, { time: "12:00 PM", title: "Claude Training", dur: "1 hr", color: "#6C63FF" }, { time: "3:00 PM", title: "Make Monday Joe Happy!", dur: "30 min", color: "#FFB347" }].map((e, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, background: "#0e1018", borderRadius: 8, padding: "10px 14px", borderLeft: `3px solid ${e.color}`, marginBottom: 8 }}>
                    <div style={{ minWidth: 68, fontSize: 12, color: "#666" }}>{e.time}</div>
                    <div><div style={{ fontSize: 13, fontWeight: 600 }}>{e.title}</div><div style={{ fontSize: 11, color: "#555" }}>{e.dur}</div></div>
                  </div>
                ))}
              </div>

              {/* Tasks */}
              <div style={card}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span>✅</span><span style={{ fontWeight: 700, fontSize: 15 }}>Priority Tasks</span>
                  <Btn onClick={() => setTab("Tasks")} variant="ghost" style={{ marginLeft: "auto", fontSize: 11, padding: "3px 10px" }}>View All</Btn>
                </div>
                {activeTasks.slice(0, 4).map(t => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "#0e1018", borderRadius: 8, padding: "10px 14px", marginBottom: 8 }}>
                    <input type="checkbox" onChange={() => toggleTask(t.id)} style={{ accentColor: "#6C63FF", width: 15, height: 15 }} />
                    <div style={{ flex: 1, fontSize: 13 }}>{t.text}</div>
                    <PriorityBadge p={t.priority} />
                  </div>
                ))}
              </div>

              {/* Emails */}
              <div style={card}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span>📧</span><span style={{ fontWeight: 700, fontSize: 15 }}>Urgent Emails</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "#666", background: "#252840", padding: "2px 8px", borderRadius: 4 }}>Mock Data</span>
                </div>
                {MOCK_EMAILS.map(e => (
                  <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "#0e1018", borderRadius: 8, padding: "10px 14px", marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{e.subject}</div>
                      <div style={{ fontSize: 11, color: "#555" }}>From: {e.from}</div>
                    </div>
                    {e.urgency === "high" && <span style={{ background: "#FF6B6B22", color: "#FF6B6B", border: "1px solid #FF6B6B44", borderRadius: 4, fontSize: 11, padding: "2px 7px", fontWeight: 600 }}>Urgent</span>}
                  </div>
                ))}
              </div>

              {/* Contacts */}
              <div style={card}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span>🤝</span><span style={{ fontWeight: 700, fontSize: 15 }}>Recent Relationships</span>
                  <Btn onClick={() => setTab("Relationships")} variant="ghost" style={{ marginLeft: "auto", fontSize: 11, padding: "3px 10px" }}>View All</Btn>
                </div>
                {contacts.slice(0, 3).map(c => (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "#0e1018", borderRadius: 8, padding: "10px 14px", marginBottom: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#6C63FF,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: 13 }}>{c.name[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: "#555" }}>{c.company}</div>
                    </div>
                    {c.tags.map(tag => <span key={tag} style={{ background: (TAG_COLORS[tag] || "#888") + "22", color: TAG_COLORS[tag] || "#888", borderRadius: 4, fontSize: 11, padding: "2px 7px" }}>{tag}</span>)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ACCOUNTS */}
        {tab === "Accounts" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 24, gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Accounts</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {accounts.map(a => {
                const s = STATUS_MAP[a.status];
                const pct = a.revenue && a.current ? Math.min(Math.round((a.current / a.revenue) * 100), 100) : null;
                return (
                  <div key={a.id} style={{ ...card, borderLeft: `4px solid ${s.color}` }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <span style={{ fontWeight: 800, fontSize: 16 }}>{a.name}</span>
                          <span style={{ background: s.color + "22", color: s.color, border: `1px solid ${s.color}44`, borderRadius: 6, fontSize: 11, padding: "2px 8px", fontWeight: 600 }}>{s.label}</span>
                        </div>
                        <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>Last contact: {a.lastContact}</div>
                        <div style={{ fontSize: 13, color: "#a5b4fc", marginBottom: a.notes ? 8 : 0 }}>→ {a.nextAction}</div>
                        {a.notes && <div style={{ fontSize: 12, color: "#666", background: "#0e1018", borderRadius: 8, padding: "6px 10px" }}>📝 {a.notes}</div>}
                        {pct !== null && (
                          <div style={{ marginTop: 12 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666", marginBottom: 4 }}>
                              <span>${a.current.toLocaleString()} of ${a.revenue.toLocaleString()}</span>
                              <span style={{ color: "#00C9A7", fontWeight: 700 }}>{pct}%</span>
                            </div>
                            <div style={{ background: "#0e1018", borderRadius: 99, height: 6, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#6C63FF,#00C9A7)", borderRadius: 99 }} />
                            </div>
                          </div>
                        )}
                      </div>
                      <Btn onClick={() => openEditAccount(a)} variant="ghost" style={{ fontSize: 12, padding: "4px 12px" }}>Edit</Btn>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TASKS */}
        {tab === "Tasks" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 20, gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Tasks</h2>
              <Btn onClick={runAI}>✨ AI Prioritize</Btn>
              <Btn onClick={openNewTask} variant="ghost">+ Add Task</Btn>
              <Btn onClick={() => setShowArchive(s => !s)} variant="ghost" style={{ marginLeft: "auto" }}>{showArchive ? "Hide" : "Show"} Completed ({doneTasks.length})</Btn>
            </div>
            {aiSuggestion && (
              <div style={{ ...card, marginBottom: 20, borderColor: "#6C63FF44", background: "#6C63FF0a" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontWeight: 700, color: "#a5b4fc" }}>✨ AI Suggested Priority Order</span>
                  <button onClick={() => setAiSuggestion(null)} style={{ background: "none", border: "none", color: "#888", cursor: "pointer" }}>×</button>
                </div>
                <pre style={{ margin: 0, fontSize: 13, color: "#ccc", whiteSpace: "pre-wrap", lineHeight: 1.8 }}>{aiSuggestion}</pre>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {activeTasks.map(t => (
                <div key={t.id} style={{ ...card, display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 18px" }}>
                  <input type="checkbox" onChange={() => toggleTask(t.id)} style={{ accentColor: "#6C63FF", width: 16, height: 16, marginTop: 3 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 3 }}>{t.text}</div>
                    {t.notes && <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>📝 {t.notes}</div>}
                    {t.due && <div style={{ fontSize: 12, color: "#888" }}>📅 Due: {t.due}</div>}
                  </div>
                  <PriorityBadge p={t.priority} />
                  <Btn onClick={() => openEditTask(t)} variant="ghost" style={{ fontSize: 12, padding: "4px 10px" }}>Edit</Btn>
                  <Btn onClick={() => deleteTask(t.id)} variant="danger" style={{ fontSize: 12, padding: "4px 10px" }}>Delete</Btn>
                </div>
              ))}
            </div>
            {showArchive && doneTasks.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 12, color: "#555", marginBottom: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Completed</div>
                {doneTasks.map(t => (
                  <div key={t.id} style={{ ...card, display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", opacity: 0.5, marginBottom: 8 }}>
                    <input type="checkbox" checked onChange={() => toggleTask(t.id)} style={{ accentColor: "#6C63FF", width: 16, height: 16 }} />
                    <div style={{ flex: 1, textDecoration: "line-through", fontSize: 14 }}>{t.text}</div>
                    <Btn onClick={() => deleteTask(t.id)} variant="danger" style={{ fontSize: 12, padding: "4px 10px" }}>Delete</Btn>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RELATIONSHIPS */}
        {tab === "Relationships" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 20, gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Relationships</h2>
              <Btn onClick={openNewContact} variant="ghost">+ Add Contact</Btn>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {contacts.map(c => (
                <div key={c.id} style={{ ...card, display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#6C63FF,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: 18, flexShrink: 0 }}>{c.name[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 16 }}>{c.name}</span>
                      {c.tags.map(tag => <span key={tag} style={{ background: (TAG_COLORS[tag] || "#888") + "22", color: TAG_COLORS[tag] || "#888", borderRadius: 4, fontSize: 11, padding: "2px 7px" }}>{tag}</span>)}
                    </div>
                    <div style={{ fontSize: 13, color: "#666", marginBottom: 6 }}>{c.company} · Last contact: {c.lastContact}</div>
                    {c.notes && <div style={{ fontSize: 13, color: "#aaa", background: "#0e1018", borderRadius: 8, padding: "8px 12px" }}>📝 {c.notes}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn onClick={() => openEditContact(c)} variant="ghost" style={{ fontSize: 12, padding: "4px 10px" }}>Edit</Btn>
                    <Btn onClick={() => deleteContact(c.id)} variant="danger" style={{ fontSize: 12, padding: "4px 10px" }}>Delete</Btn>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EMAILS */}
        {tab === "Emails" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 20, gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Emails</h2>
              <span style={{ fontSize: 13, color: "#666", background: "#252840", padding: "3px 10px", borderRadius: 6 }}>Mock Data — Gmail integration coming soon</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {MOCK_EMAILS.map(e => (
                <div key={e.id} style={{ ...card, display: "flex", alignItems: "center", gap: 14, borderLeft: `3px solid ${e.urgency === "high" ? "#FF6B6B" : "#252840"}` }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#252840", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#aaa", flexShrink: 0 }}>{e.from[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{e.subject}</div>
                    <div style={{ fontSize: 12, color: "#555" }}>From: {e.from}</div>
                  </div>
                  {e.urgency === "high" && <span style={{ background: "#FF6B6B22", color: "#FF6B6B", border: "1px solid #FF6B6B44", borderRadius: 4, fontSize: 12, padding: "3px 10px", fontWeight: 600 }}>Urgent</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <Modal title={editTask ? "Edit Task" : "New Task"} onClose={() => setShowTaskModal(false)}>
          <Input label="Task" placeholder="What needs to be done?" value={taskForm.text} onChange={e => setTaskForm(f => ({ ...f, text: e.target.value }))} />
          <Input label="Due Date" type="date" value={taskForm.due} onChange={e => setTaskForm(f => ({ ...f, due: e.target.value }))} />
          <Select label="Priority" value={taskForm.priority} onChange={e => setTaskForm(f => ({ ...f, priority: Number(e.target.value) }))}>
            <option value={1}>High</option><option value={2}>Medium</option><option value={3}>Low</option>
          </Select>
          <Textarea label="Notes" placeholder="Any additional context..." value={taskForm.notes} onChange={e => setTaskForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn onClick={() => setShowTaskModal(false)} variant="ghost">Cancel</Btn>
            <Btn onClick={saveTask}>Save Task</Btn>
          </div>
        </Modal>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <Modal title={editContact ? "Edit Contact" : "New Contact"} onClose={() => setShowContactModal(false)}>
          <Input label="Name" placeholder="Full name" value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Company" placeholder="Where do they work?" value={contactForm.company} onChange={e => setContactForm(f => ({ ...f, company: e.target.value }))} />
          <Input label="Last Contact Date" type="date" value={contactForm.lastContact} onChange={e => setContactForm(f => ({ ...f, lastContact: e.target.value }))} />
          <Input label="Tags (comma separated)" placeholder="e.g. Client, Prospect" value={contactForm.tags} onChange={e => setContactForm(f => ({ ...f, tags: e.target.value }))} />
          <Textarea label="Notes" placeholder="Relationship notes..." value={contactForm.notes} onChange={e => setContactForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn onClick={() => setShowContactModal(false)} variant="ghost">Cancel</Btn>
            <Btn onClick={saveContact}>Save Contact</Btn>
          </div>
        </Modal>
      )}

      {/* Account Modal */}
      {showAccountModal && (
        <Modal title="Edit Account" onClose={() => setShowAccountModal(false)}>
          <Input label="Account Name" value={accountForm.name} onChange={e => setAccountForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Last Contact Date" type="date" value={accountForm.lastContact} onChange={e => setAccountForm(f => ({ ...f, lastContact: e.target.value }))} />
          <Input label="Next Action" placeholder="What needs to happen next?" value={accountForm.nextAction} onChange={e => setAccountForm(f => ({ ...f, nextAction: e.target.value }))} />
          <Select label="Status" value={accountForm.status} onChange={e => setAccountForm(f => ({ ...f, status: e.target.value }))}>
            <option value="green">On Track</option><option value="yellow">Needs Attention</option><option value="red">At Risk</option>
          </Select>
          <Textarea label="Notes" value={accountForm.notes} onChange={e => setAccountForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn onClick={() => setShowAccountModal(false)} variant="ghost">Cancel</Btn>
            <Btn onClick={saveAccount}>Save Account</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
