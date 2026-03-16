import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const SERVICES = [
  {
    id: "investment",
    icon: "📈",
    title: "Investment",
    subtitle: "Portfolio Advisory",
    desc: "Mutual funds, SIP planning, equity & debt allocation, returns analysis",
    tags: ["Mutual Funds", "SIP", "Equity"],
    highlight: false,
  },
  {
    id: "banking",
    icon: "🏦",
    title: "Banking",
    subtitle: "Financial Products",
    desc: "Savings accounts, FDs, recurring deposits, loans, interest rate comparison",
    tags: ["FD", "Loans", "Savings"],
    highlight: false,
  },
  {
    id: "insurance",
    icon: "🛡️",
    title: "Insurance",
    subtitle: "Risk Coverage",
    desc: "Term life, health insurance, ULIP, critical illness planning",
    tags: ["Term Life", "Health", "ULIP"],
    highlight: false,
  },
  {
    id: "tax",
    icon: "📊",
    title: "Tax Planning",
    subtitle: "Compliance & Savings",
    desc: "ITR filing, ELSS, Section 80C deductions, capital gains tax optimization",
    tags: ["ITR", "80C", "ELSS"],
    highlight: false,
  },
  {
    id: "realestate",
    icon: "🏠",
    title: "Real Estate",
    subtitle: "Property Advisory",
    desc: "Property investment, REITs, home loan advisory, EMI & rental yield",
    tags: ["REITs", "Home Loan", "EMI"],
    highlight: false,
  },
  {
    id: "retirement",
    icon: "📋",
    title: "Retirement",
    subtitle: "Long-term Planning",
    desc: "NPS, PPF, pension plans, corpus calculation, SWP planning",
    tags: ["NPS", "PPF", "Pension"],
    highlight: false,
  },
];

const SERVICE_COLORS = {
  investment: "#2E9E5B",
  banking: "#C9A84C",
  insurance: "#E8843A",
  tax: "#4A90D9",
  realestate: "#8B5E3C",
  retirement: "#B59AE8",
};

const SERVICE_LABELS = {
  investment: "Investment",
  banking: "Banking",
  insurance: "Insurance",
  tax: "Tax Planning",
  realestate: "Real Estate",
  retirement: "Retirement",
};

function loadChats() {
  try {
    const history = JSON.parse(localStorage.getItem("1f_chat_history") || "[]");
    return history;
  } catch {
    return [];
  }
}

export default function ServicesPage() {
  const navigate = useNavigate();
  const [panelOpen,   setPanelOpen]   = useState(false);
  const [recentChats, setRecentChats] = useState([]);
  const [lastChat,    setLastChat]    = useState(null);

  const email       = sessionStorage.getItem("1f_email") || "user@1finance.co.in";
  const displayName = email.split("@")[0].replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem("1f_stay_authed");
    localStorage.removeItem("1f_stay_email");
    navigate("/", { replace: true });
  };

  // ── Load chat history on page load ──────────────────────────
  useEffect(() => {
    const history = loadChats();
    setRecentChats(history.slice(0, 5));
    setLastChat(history.length > 0 ? history[0] : null);
  }, []);

  // ── Refresh chat history when panel opens ────────────────────
  useEffect(() => {
    if (!panelOpen) return;
    const history = loadChats();
    setRecentChats(history.slice(0, 5));
    setLastChat(history.length > 0 ? history[0] : null);
  }, [panelOpen]);

  // ── Live clock ───────────────────────────────────────────────
  useEffect(() => {
    const el = document.getElementById("liveTime");
    const update = () => {
      if (el) el.textContent = new Date().toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      }) + " IST";
    };
    update();
    const t = setInterval(update, 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-surface-900">

      {/* Dark overlay */}
      {panelOpen && (
        <div
          onClick={() => setPanelOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.55)" }}
        />
      )}

      {/* Slide-in history panel */}
      <div style={{
        position: "fixed", top: 0, right: 0,
        width: "340px", height: "100vh",
        background: "#141414",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
        zIndex: 201,
        display: "flex", flexDirection: "column",
        transform: panelOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s ease",
        boxShadow: panelOpen ? "-8px 0 40px rgba(0,0,0,0.6)" : "none",
      }}>

        {/* Panel header */}
        <div style={{ padding: "20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ color: "#FFFFFF", fontWeight: 600, fontSize: "15px", margin: 0 }}>Recent Activity</p>
            <p style={{ color: "#555", fontSize: "11px", margin: "3px 0 0" }}>All services · Last 5 queries</p>
          </div>
          <button
            onClick={() => setPanelOpen(false)}
            style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", color: "#888", width: "30px", height: "30px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#C9A84C"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
          >
            ✕
          </button>
        </div>

        {/* Panel body */}
        <div style={{ padding: "16px", flex: 1, overflowY: "auto" }}>

          <p style={{ color: "#555", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>
            Top 5 Recent Queries
          </p>

          {recentChats.length === 0 ? (
            <div style={{ padding: "32px 0", textAlign: "center" }}>
              <p style={{ color: "#444", fontSize: "13px", margin: 0 }}>No queries yet.</p>
              <p style={{ color: "#333", fontSize: "12px", marginTop: "6px" }}>Start a conversation from any service below.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {recentChats.map((chat) => {
                const color = SERVICE_COLORS[chat.service] || "#C9A84C";
                const label = SERVICE_LABELS[chat.service] || chat.service;
                return (
                  <div
                    key={chat.id}
                    onClick={() => { navigate(`/chat/${chat.service}`); setPanelOpen(false); }}
                    style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.06)", borderLeft: `3px solid ${color}`, borderRadius: "9px", padding: "11px 13px", cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#222"}
                    onMouseLeave={e => e.currentTarget.style.background = "#1A1A1A"}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "10px", color: color, fontWeight: 600, background: `${color}18`, padding: "2px 7px", borderRadius: "4px" }}>{label}</span>
                      <span style={{ fontSize: "10px", color: "#444" }}>{chat.date}</span>
                    </div>
                    <p style={{ color: "#CCCCCC", fontSize: "13px", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {chat.title}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Continue last query */}
          {lastChat && (
            <div style={{ marginTop: "24px" }}>
              <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "16px" }} />
              <p style={{ color: "#555", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>
                Continue Last Query
              </p>
              <div style={{ background: "#1A1A1A", border: `1px solid ${SERVICE_COLORS[lastChat.service] || "#C9A84C"}44`, borderRadius: "12px", padding: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: SERVICE_COLORS[lastChat.service] || "#C9A84C", display: "inline-block" }} />
                  <span style={{ fontSize: "11px", color: SERVICE_COLORS[lastChat.service] || "#C9A84C", fontWeight: 600 }}>
                    {SERVICE_LABELS[lastChat.service] || lastChat.service}
                  </span>
                  <span style={{ fontSize: "10px", color: "#444", marginLeft: "auto" }}>{lastChat.date}</span>
                </div>
                <p style={{ color: "#E8E6DF", fontSize: "13px", fontWeight: 500, margin: "0 0 6px", lineHeight: 1.4 }}>
                  "{lastChat.title}"
                </p>
                <p style={{ color: "#666", fontSize: "12px", margin: "0 0 12px", lineHeight: 1.5 }}>
                  You were exploring {SERVICE_LABELS[lastChat.service] || lastChat.service} related queries. Would you like to continue this conversation?
                </p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => { navigate(`/chat/${lastChat.service}`); setPanelOpen(false); }}
                    style={{ flex: 1, background: SERVICE_COLORS[lastChat.service] || "#C9A84C", color: "#0A0A0A", border: "none", borderRadius: "8px", padding: "8px 0", fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  >
                    Continue →
                  </button>
                  <button
                    onClick={() => setPanelOpen(false)}
                    style={{ background: "transparent", color: "#666", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 14px", fontSize: "12px", cursor: "pointer", transition: "border-color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#888"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top nav */}
      <nav className="border-b border-surface-400 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gold flex items-center justify-center">
              <span className="font-display font-bold text-base text-surface-900">1F</span>
            </div>
            <div>
              <span className="font-display text-lg text-white">1 Finance</span>
              <span className="text-gray-600 text-xs ml-2">Stakeholder Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-surface-500 border border-gold flex items-center justify-center text-xs text-gold font-semibold">
                {displayName.charAt(0)}
              </div>
              <span className="text-gray-400 text-sm">{displayName}</span>
            </div>
            <button onClick={handleLogout} className="btn-ghost rounded-lg px-3 py-1.5 text-xs">
              Sign out
            </button>

            {/* History icon button */}
            <button
              onClick={() => setPanelOpen(true)}
              title="Recent queries"
              className="btn-ghost rounded-lg p-2"
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-12">

        {/* Hero */}
        <div className="mb-12 animate-slide-up">
          <p className="text-gold text-sm uppercase tracking-widest font-medium mb-2">
            Welcome back, {displayName}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl text-white leading-tight mb-3">
            Advisory <span className="text-gold">Services</span>
          </h1>
          <p className="text-gray-500 text-base max-w-lg">
            Select a service module to open the AI-powered chatbot for client data analysis.
          </p>
        </div>

        {/* Market ticker */}
        <div className="bg-surface-700 border border-surface-400 rounded-xl px-5 py-3 mb-10 flex flex-wrap items-center gap-4 sm:gap-8 text-xs">
          <span className="text-gray-600 uppercase tracking-widest font-medium">Live Market</span>
          <span className="text-gray-400">NIFTY 50 <span className="text-green-400 ml-1">▲ 22,847</span></span>
          <span className="text-gray-400">SENSEX <span className="text-green-400 ml-1">▲ 75,321</span></span>
          <span className="text-gray-400">Gold /10g <span className="text-gold ml-1">₹68,450</span></span>
          <span className="text-gray-400">USD/INR <span className="text-gray-300 ml-1">₹83.42</span></span>
          <span style={{ color: "#CCCCCC", marginLeft: "auto" }} id="liveTime"></span>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {SERVICES.map((svc, i) => (
            <button
              key={svc.id}
              onClick={() => navigate(`/chat/${svc.id}`)}
              className={`service-card text-left bg-surface-700 rounded-2xl p-6 border ${
                svc.highlight ? "border-gold" : "border-surface-400"
              }`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {svc.highlight && (
                <div className="inline-flex items-center gap-1 bg-gold bg-opacity-15 border border-gold border-opacity-30 rounded-full px-2 py-0.5 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-slow" />
                  <span className="text-gold text-xs font-medium">Most used</span>
                </div>
              )}

              <div className="text-3xl mb-3">{svc.icon}</div>

              <div className="mb-3">
                <h3 className="text-white font-semibold text-lg">{svc.title}</h3>
                <p className="text-gold text-xs mt-0.5">{svc.subtitle}</p>
              </div>

              <p className="text-gray-400 text-sm leading-relaxed mb-4">{svc.desc}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {svc.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-surface-500 border border-surface-300 rounded-full px-2 py-0.5 text-xs text-gray-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Launch button */}
              <div className="mt-auto pt-2 border-t border-surface-400">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">AI Advisory</span>
                  <span className="text-gold text-xs font-semibold flex items-center gap-1">
                    Launch Chatbot →
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-gray-400 text-xs mt-10">
          Each chatbot is contextually trained on 1 Finance client data · Powered by Google Gemini 1.5 Flash
        </p>
      </main>
    </div>
  );
}