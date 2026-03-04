import { useState } from "react";
export default function App() {
  const [count, setCount] = useState(0);
  return (
    <div style={{ background: "#151825", minHeight: "100vh", color: "#e8eaf6", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <h1>⚡ Command Center</h1>
        <p>Deployment successful!</p>
        <button onClick={() => setCount(c => c + 1)} style={{ padding: "10px 20px", background: "#6C63FF", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 16 }}>
          Clicked {count} times
        </button>
      </div>
    </div>
  );
}
