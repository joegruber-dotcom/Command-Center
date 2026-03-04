import { useState, useEffect } from "react";

const today = new Date();
const dateStr = today.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

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
const dailyQuote = QUOTES[today.getDate() % QUOTES.length];

const MOCK_EMAILS = [
  { id: 1, from: "Sarah Mitchell", subject: "Q3 Proposal — needs your sign-off", urgency: "high" },
  { id: 2, from: "David Park", subject: "Lunch next week?", urgency: "low" },
  { id: 3, from: "Finance Team", subject: "Invoice overdue — action required", urgency: "high" },
];

const INIT_TASKS = [
  { id: 1, text: "Review Q3 proposal from Sarah", due: "2026-02-27", notes: "Check budget section carefully", done: false, priority: 1 },
  { id: 2, text: "Follow up with David Park re: lunch", due: "2026-03-01", notes: "", done: false, priority: 3 },
  { id: 3, text: "Submit expense report", due: "2026-02-28", notes: "Finance flagged overdue invoice", done: false, priority: 2 },
  { id: 4, text: "Prep slides for strategy meeting", due: "2026-02-27", notes: "", done: false, priority: 1 },
];

const INIT_CONTACTS = [
  { id: 1, name: "Sarah Mitchell", company: "Acme Corp", lastContact: "2026-02-20", notes: "Working on Q3 proposal together. Very detail-oriented.", tags: ["Client"] },
  { id: 2, name: "David Park", company: "Horizon Media", lastContact: "2026-02-15", notes: "Met at conference. Wants to explore partnership.", tags: ["Prospect"] },
  { id: 3, name: "Karen Lee", company: "Internal", lastContact: "2026-02-25", notes: "My manager. Weekly 1:1s on Fridays.", tags: ["Internal"] },
];

const TABS = ["Dashboard", "Tasks", "Relationships", "Emails"];
const TAG_COLORS = { Client: "#6C63FF", Prospect: "#00C9A7", Internal: "#FF6B6B", Partner: "#FFB347", Other: "#888" };
const GOAL = 1500000;

function PriorityBadge({ p }) {
  const map = { 1: ["#FF6B6B", "High"], 2: ["#FFB347", "Medium"], 3: ["#00C9A7", "Low"] };
  const [color, label] = map[p] || ["#888", "—"];
  return <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 4, fontSize: 11, padding: "2px 7px", fontWeight: 600 }}>{label}</span>;
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#1e2130", border: "1px solid #2e3350", borderRadius: 12, padding: 28, width: 460, maxWidth: "95vw" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#e8eaf6" }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", fontSize: 20, cursor: "pointer" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <div style={{ fontSize: 12, color: "#aaa", marginBottom: 5 }}>{label}</div>}
      <input {...props} style={{ width: "100%", background: "#151825", border: "1px solid #2e3350", borderRadius: 7, padding: "9px 12px", color: "#e8eaf6", fontSize: 14, boxSizing: "border-box", ...props.style }} />
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <div style={{ fontSize: 12, color: "#aaa", marginBottom: 5 }}>{label}</div>}
      <textarea {...props} style={{ width: "100%", background: "#151825", border: "1px solid #2e3350", borderRadius: 7, padding: "9px 12px", color: "#e8eaf6", fontSize: 14, resize: "vertical", boxSizing: "border-box", ...props.style }} />
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", style = {} }) {
  const base = { borderRadius: 7, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", transition: "opacity .15s" };
  const variants = {
    primary: { background: "#6C63FF", color: "#fff" },
    ghost: { background: "transparent", color: "#aaa", border: "1px solid #2e3350" },
    danger: { background: "#FF6B6B22", color: "#FF6B6B", border: "1px solid #FF6B6B44" },
  };
  return <button onClick={onClick} style={{ ...base, ...variants[variant], ...style }}>{children}</button>;
}

function RevenueGoal() {
  const [current, setCurrent] = useState(() => {
    const saved = localStorage.getItem("revenue-current");
    return saved ? Number(saved) : 200000;
  });
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(String(current));
  const card = { background: "#1e2130", border: "1px solid #2e3350", borderRadius: 12, padding: 20 };

  function saveCurrent(val) {
    setCurrent(val);
    localStorage.setItem("revenue-current", String(val));
  }

  const pct = Math.min(Math.round((current / GOAL) * 100), 100);
  const remaining = GOAL - current;
  const monthsLeft = Math.max(12 - today.getMonth(), 1);
  const neededPerMonth = Math.round(remaining / monthsLeft);

  return (
    <div style={{ ...card, marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 16 }}>💰</span>
        <span style={{ fontWeight: 700, fontSize: 15 }}>Revenue Goal — Train Technologies</span>
        <span style={{ marginLeft: "auto", fontSize: 13, color: "#00C9A7", fontWeight: 700 }}>2026 Annual Goal</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {editing ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 22, color: "#00C9A7", fontWeight: 700 }}>$</span>
              <input autoFocus value={inputVal}
                onChange={e => setInputVal(e.target.value.replace(/[^0-9]/g, ""))}
                onKeyDown={e => { if (e.key === "Enter") { saveCurrent(Number(inputVal)); setEditing(false); } if (e.key === "Escape") setEditing(false); }}
                style={{ fontSize: 26, fontWeight: 800, background: "#151825", border: "1px solid #6C63FF", borderRadius: 7, color: "#00C9A7", padding: "4px 10px", width: 160 }} />
              <Btn onClick={() => { saveCurrent(Number(inputVal)); setEditing(false); }}>Save</Btn>
              <Btn onClick={() => setEditing(false)} variant="ghost">Cancel</Btn>
            </div>
          ) : (
            <>
              <span style={{ fontSize: 28, fontWeight: 800, color: "#00C9A7" }}>${current.toLocaleString()}</span>
              <span style={{ fontSize: 14, color: "#666" }}>of ${GOAL.toLocaleString()} goal</span>
              <Btn onClick={() => { setInputVal(String(current)); setEditing(true); }} variant="ghost" style={{ fontSize: 11, padding: "3px 10px" }}>✏️ Edit</Btn>
            </>
          )}
        </div>
        <span style={{ fontSize: 22, fontWeight: 800, color: pct >= 100 ? "#00C9A7" : "#e8eaf6" }}>{pct}%</span>
      </div>
      <div style={{ background: "#151825", borderRadius: 99, height: 12, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #6C63FF, #00C9A7)", borderRadius: 99, transition: "width .5s ease" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {[
          { label: "Remaining", value: remaining > 0 ? `$${remaining.toLocaleString()}` : "$0", color: "#FF6B6B" },
          { label: "Months Left", value: monthsLeft, color: "#e8eaf6" },
          { label: "Needed / Month", value: remaining > 0 ? `$${neededPerMonth.toLocaleString()}` : "Goal met! 🎉", color: "#FFB347" },
        ].map(s => (
          <div key={s.label} style={{ background: "#151825", borderRadius: 8, padding: "10px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#666", marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function useGoogleCalendar(accessToken) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);
    fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${start.toISOString()}&timeMax=${end.toISOString()}&singleEvents=true&orderBy=startTime`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(r => r.json())
      .then(data => {
        const mapped = (data.items || [])
          .filter(e => e.start?.dateTime)
          .map((e, i) => ({
            id: e.id,
            time: new Date(e.start.dateTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
            title: e.summary || "(No title)",
            duration: `${Math.round((new Date(e.end.dateTime) - new Date(e.start.dateTime)) / 60000)} min`,
            color: ["#6C63FF", "#00C9A7", "#FF6B6B", "#FFB347"][i % 4],
            location: e.location || null,
            startTs: new Date(e.start.dateTime).getTime(),
            endTs: new Date(e.end.dateTime).getTime(),
          }));
        setEvents(mapped);
      })
      .catch(() => setError("Could not load calendar"))
      .finally(() => setLoading(false));
  }, [accessToken]);

  return { events, loading, error };
}

function useGoogleAuth() {
  const [token, setToken] = useState(() => sessionStorage.getItem("gtoken") || null);

  function signIn() {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirect = window.location.origin;
    const scope = encodeURIComponent("https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/gmail.readonly");
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirect}&response_type=token&scope=${scope}`;
  }

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("access_token")) {
      const params = new URLSearchParams(hash.replace("#", "?"));
      const t = params.get("access_token");
      if (t) { setToken(t); sessionStorage.setItem("gtoken", t); window.location.hash = ""; }
    }
  }, []);

  function signOut() { setToken(null); sessionStorage.removeItem("gtoken"); }

  return { token, signIn, signOut };
}

export default function App() {
  const [tab, setTab] = useState("Dashboard");
  const [tasks, setTasks] = useState(() => { try { return JSON.parse(localStorage.getItem("tasks")) || INIT_TASKS; } catch { return INIT_TASKS; } });
  const [contacts, setContacts] = useState(() => { try { return JSON.parse(localStorage.getItem("contacts")) || INIT_CONTACTS; } catch { return INIT_CONTACTS; } });
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [editContact, setEditContact] = useState(null);
  const [taskForm, setTaskForm] = useState({ text: "", due: "", notes: "", priority: 2 });
  const [contactForm, setContactForm] = useState({ name: "", company: "", lastContact: "", notes: "", tags: "" });
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [showArchive, setShowArchive] = useState(false);

  const { token, signIn, signOut } = useGoogleAuth();
  const { events: calEvents, loading: calLoading } = useGoogleCalendar(token);

  useEffect(() => { localStorage.setItem("tasks", JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem("contacts", JSON.stringify(contacts)); }, [contacts]);

  const activeTasks = tasks.filter(t => !t.done).sort((a, b) => a.priority - b.priority);
  const doneTasks = tasks.filter(t => t.done);
  const now = Date.now();

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

  function runAI() {
    const sorted = [...activeTasks].sort((a, b) => {
      const dA = new Date(a.due), dB = new Date(b.due);
      if (dA - dB !== 0) return dA - dB;
      return a.priority - b.priority;
    });
    setAiSuggestion(sorted.map((t, i) => `${i + 1}. ${t.text} — Due ${t.due || "no date"} · ${["", "High", "Medium", "Low"][t.priority]} priority`).join("\n"));
  }

  const card = { background: "#1e2130", border: "1px solid #2e3350", borderRadius: 12, padding: 20 };

  return (
    <div style={{ minHeight: "100vh", background: "#151825", color: "#e8eaf6", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#1a1d2e", borderBottom: "1px solid #2e3350", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>⚡</span>
          <span style={{ fontWeight: 700, fontSize: 17 }}>Command Center</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? "#6C63FF22" : "transparent", color: tab === t ? "#6C63FF" : "#888", border: tab === t ? "1px solid #6C63FF44" : "1px solid transparent", borderRadius: 7, padding: "6px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{t}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 13, color: "#666" }}>{dateStr}</div>
          {token
            ? <Btn onClick={signOut} variant="ghost" style={{ fontSize: 12, padding: "4px 12px" }}>Sign Out</Btn>
            : <Btn onClick={signIn} style={{ fontSize: 12, padding: "4px 12px" }}>🔗 Connect Google</Btn>}
        </div>
      </div>

      <div style={{ padding: "28px 32px", maxWidth: 1100, margin: "0 auto" }}>

        {/* DASHBOARD */}
        {tab === "Dashboard" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 700 }}>Good morning 👋</h2>
              <div style={{ background: "#6C63FF11", border: "1px solid #6C63FF33", borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span style={{ fontSize: 20, lineHeight: 1 }}>💡</span>
                <div>
                  <div style={{ fontSize: 15, color: "#d0ceff", fontStyle: "italic", lineHeight: 1.5 }}>"{dailyQuote.text}"</div>
                  <div style={{ fontSize: 12, color: "#6C63FF", marginTop: 5, fontWeight: 600 }}>— {dailyQuote.author}</div>
                </div>
              </div>
            </div>

            <RevenueGoal />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Calendar */}
              <div style={card}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <span>📅</span>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>Today's Schedule</span>
                  {token
                    ? <span style={{ marginLeft: "auto", fontSize: 11, color: "#00C9A7", background: "#00C9A722", border: "1px solid #00C9A744", padding: "2px 8px", borderRadius: 4 }}>● Live</span>
                    : <span style={{ marginLeft: "auto", fontSize: 11, color: "#666", background: "#2e3350", padding: "2px 8px", borderRadius: 4 }}>Connect Google ↑</span>}
                </div>
                {calLoading && <div style={{ color: "#666", fontSize: 13 }}>Loading your calendar...</div>}
                {!token && <div style={{ color: "#666", fontSize: 13, textAlign: "center", padding: 20 }}>Click "Connect Google" above to see your live calendar events.</div>}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 320, overflowY: "auto" }}>
                  {calEvents.map(e => {
                    const isNow = now >= e.startTs && now < e.endTs;
                    const isPast = now > e.endTs;
                    return (
                      <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 12, background: isNow ? "#6C63FF18" : "#151825", borderRadius: 8, padding: "10px 14px", borderLeft: `3px solid ${isNow ? "#6C63FF" : e.color}`, opacity: isPast ? 0.45 : 1 }}>
                        <div style={{ minWidth: 70, fontSize: 12, color: isNow ? "#6C63FF" : "#aaa", fontWeight: isNow ? 700 : 400 }}>{e.time}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{e.title}</div>
                          <div style={{ fontSize: 11, color: "#666" }}>{e.duration}{e.location ? ` · ${e.location}` : ""}</div>
                        </div>
                        {isNow && <span style={{ fontSize: 10, color: "#6C63FF", fontWeight: 700, background: "#6C63FF22", padding: "2px 6px", borderRadius: 4 }}>NOW</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tasks */}
              <div style={card}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <span>✅</span>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>Priority Tasks</span>
                  <Btn onClick={() => setTab("Tasks")} variant="ghost" style={{ marginLeft: "auto", fontSize: 11, padding: "3px 10px" }}>View All</Btn>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {activeTasks.slice(0, 4).map(t => (
                    <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "#151825", borderRadius: 8, padding: "10px 14px" }}>
                      <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} style={{ accentColor: "#6C63FF", width: 15, height: 15 }} />
                      <div style={{ flex: 1, fontSize: 14 }}>{t.text}</div>
                      <PriorityBadge p={t.priority} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Emails */}
              <div style={card}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <span>📧</span>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>Urgent Emails</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "#666", background: "#2e3350", padding: "2px 8px", borderRadius: 4 }}>Mock Data</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {MOCK_EMAILS.map(e => (
                    <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "#151825", borderRadius: 8, padding: "10px 14px" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{e.subject}</div>
                        <div style={{ fontSize: 11, color: "#666" }}>From: {e.from}</div>
                      </div>
                      {e.urgency === "high" && <span style={{ background: "#FF6B6B22", color: "#FF6B6B", border: "1px solid #FF6B6B44", borderRadius: 4, fontSize: 11, padding: "2px 7px", fontWeight: 600 }}>Urgent</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contacts */}
              <div style={card}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <span>🤝</span>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>Recent Relationships</span>
                  <Btn onClick={() => setTab("Relationships")} variant="ghost" style={{ marginLeft: "auto", fontSize: 11, padding: "3px 10px" }}>View All</Btn>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {contacts.slice(0, 3).map(c => (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "#151825", borderRadius: 8, padding: "10px 14px" }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#6C63FF33", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#6C63FF", fontSize: 14 }}>{c.name[0]}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: "#666" }}>{c.company} · Last contact {c.lastContact}</div>
                      </div>
                      {c.tags.map(tag => <span key={tag} style={{ background: (TAG_COLORS[tag] || "#888") + "22", color: TAG_COLORS[tag] || "#888", border: `1px solid ${(TAG_COLORS[tag] || "#888")}44`, borderRadius: 4, fontSize: 11, padding: "2px 7px" }}>{tag}</span>)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TASKS */}
        {tab === "Tasks" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 20, gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Tasks</h2>
              <Btn onClick={runAI}>✨ AI Prioritize</Btn>
              <Btn onClick={openNewTask} variant="ghost">+ Add Task</Btn>
              <Btn onClick={() => setShowArchive(s => !s)} variant="ghost" style={{ marginLeft: "auto" }}>{showArchive ? "Hide" : "Show"} Completed ({doneTasks.length})</Btn>
            </div>
            {aiSuggestion && (
              <div style={{ ...card, marginBottom: 20, borderColor: "#6C63FF44", background: "#6C63FF11" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontWeight: 700, color: "#6C63FF" }}>✨ AI Suggested Priority Order</span>
                  <button onClick={() => setAiSuggestion(null)} style={{ background: "none", border: "none", color: "#888", cursor: "pointer" }}>×</button>
                </div>
                <pre style={{ margin: 0, fontSize: 13, color: "#ccc", whiteSpace: "pre-wrap", lineHeight: 1.8 }}>{aiSuggestion}</pre>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {activeTasks.map(t => (
                <div key={t.id} style={{ ...card, display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 18px" }}>
                  <input type="checkbox" checked={false} onChange={() => toggleTask(t.id)} style={{ accentColor: "#6C63FF", width: 16, height: 16, marginTop: 3 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 3 }}>{t.text}</div>
                    {t.notes && <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>📝 {t.notes}</div>}
                    {t.due && <div style={{ fontSize: 12, color: "#aaa" }}>📅 Due: {t.due}</div>}
                  </div>
                  <PriorityBadge p={t.priority} />
                  <Btn onClick={() => openEditTask(t)} variant="ghost" style={{ fontSize: 12, padding: "4px 10px" }}>Edit</Btn>
                  <Btn onClick={() => deleteTask(t.id)} variant="danger" style={{ fontSize: 12, padding: "4px 10px" }}>Delete</Btn>
                </div>
              ))}
            </div>
            {showArchive && doneTasks.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 13, color: "#666", marginBottom: 10, fontWeight: 600 }}>COMPLETED</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {doneTasks.map(t => (
                    <div key={t.id} style={{ ...card, display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", opacity: 0.5 }}>
                      <input type="checkbox" checked={true} onChange={() => toggleTask(t.id)} style={{ accentColor: "#6C63FF", width: 16, height: 16 }} />
                      <div style={{ flex: 1, textDecoration: "line-through", fontSize: 14 }}>{t.text}</div>
                      <Btn onClick={() => deleteTask(t.id)} variant="danger" style={{ fontSize: 12, padding: "4px 10px" }}>Delete</Btn>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* RELATIONSHIPS */}
        {tab === "Relationships" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 20, gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Relationships</h2>
              <Btn onClick={openNewContact} variant="ghost">+ Add Contact</Btn>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {contacts.map(c => (
                <div key={c.id} style={{ ...card, display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#6C63FF33", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#6C63FF", fontSize: 18, flexShrink: 0 }}>{c.name[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 16 }}>{c.name}</span>
                      {c.tags.map(tag => <span key={tag} style={{ background: (TAG_COLORS[tag] || "#888") + "22", color: TAG_COLORS[tag] || "#888", border: `1px solid ${(TAG_COLORS[tag] || "#888")}44`, borderRadius: 4, fontSize: 11, padding: "2px 7px" }}>{tag}</span>)}
                    </div>
                    <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>{c.company} · Last contact: {c.lastContact}</div>
                    {c.notes && <div style={{ fontSize: 13, color: "#aaa", background: "#151825", borderRadius: 7, padding: "8px 12px" }}>📝 {c.notes}</div>}
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
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Emails</h2>
              <span style={{ fontSize: 13, color: "#666", background: "#2e3350", padding: "3px 10px", borderRadius: 6 }}>Mock Data — Gmail integration coming soon</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {MOCK_EMAILS.map(e => (
                <div key={e.id} style={{ ...card, display: "flex", alignItems: "center", gap: 14, borderLeft: `3px solid ${e.urgency === "high" ? "#FF6B6B" : "#2e3350"}` }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#2e3350", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#aaa", flexShrink: 0 }}>{e.from[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{e.subject}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>From: {e.from}</div>
                  </div>
                  {e.urgency === "high" && <span style={{ background: "#FF6B6B22", color: "#FF6B6B", border: "1px solid #FF6B6B44", borderRadius: 4, fontSize: 12, padding: "3px 10px", fontWeight: 600 }}>Urgent</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showTaskModal && (
        <Modal title={editTask ? "Edit Task" : "New Task"} onClose={() => setShowTaskModal(false)}>
          <Input label="Task" placeholder="What needs to be done?" value={taskForm.text} onChange={e => setTaskForm(f => ({ ...f, text: e.target.value }))} />
          <Input label="Due Date" type="date" value={taskForm.due} onChange={e => setTaskForm(f => ({ ...f, due: e.target.value }))} />
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "#aaa", marginBottom: 5 }}>Priority</div>
            <select value={taskForm.priority} onChange={e => setTaskForm(f => ({ ...f, priority: Number(e.target.value) }))} style={{ width: "100%", background: "#151825", border: "1px solid #2e3350", borderRadius: 7, padding: "9px 12px", color: "#e8eaf6", fontSize: 14 }}>
              <option value={1}>High</option>
              <option value={2}>Medium</option>
              <option value={3}>Low</option>
            </select>
          </div>
          <Textarea label="Notes" placeholder="Any additional context..." value={taskForm.notes} onChange={e => setTaskForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn onClick={() => setShowTaskModal(false)} variant="ghost">Cancel</Btn>
            <Btn onClick={saveTask}>Save Task</Btn>
          </div>
        </Modal>
      )}

      {showContactModal && (
        <Modal title={editContact ? "Edit Contact" : "New Contact"} onClose={() => setShowContactModal(false)}>
          <Input label="Name" placeholder="Full name" value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Company / Organization" placeholder="Where do they work?" value={contactForm.company} onChange={e => setContactForm(f => ({ ...f, company: e.target.value }))} />
          <Input label="Last Contact Date" type="date" value={contactForm.lastContact} onChange={e => setContactForm(f => ({ ...f, lastContact: e.target.value }))} />
          <Input label="Tags (comma separated)" placeholder="e.g. Client, Prospect, Partner" value={contactForm.tags} onChange={e => setContactForm(f => ({ ...f, tags: e.target.value }))} />
          <Textarea label="Notes" placeholder="Relationship context, conversation notes..." value={contactForm.notes} onChange={e => setContactForm(f => ({ ...f, notes: e.target.value }))} rows={4} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn onClick={() => setShowContactModal(false)} variant="ghost">Cancel</Btn>
            <Btn onClick={saveContact}>Save Contact</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
