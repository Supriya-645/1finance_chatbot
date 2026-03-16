import { useNavigate } from "react-router-dom";

const SERVICE_ICONS = {
  investment: "📈",
  banking:    "🏦",
  insurance:  "🛡️",
  tax:        "📋",
  realestate: "🏠",
  retirement: "🌅",
};

const SERVICE_LABELS = {
  investment: "Investment",
  banking:    "Banking",
  insurance:  "Insurance",
  tax:        "Tax Planning",
  realestate: "Real Estate",
  retirement: "Retirement",
};

const SERVICE_COLORS = {
  investment: "#2E9E5B",
  banking:    "#C9A84C",
  insurance:  "#E8843A",
  tax:        "#4A90D9",
  realestate: "#8B5E3C",
  retirement: "#B59AE8",
};

export default function Sidebar({ service, chatHistory, onSelectChat, onNewChat, currentChatId, accentColor }) {
  const navigate     = useNavigate();
  const serviceChats = chatHistory.filter((c) => c.service === service);
  const color        = accentColor || SERVICE_COLORS[service] || "#C9A84C";

  return (
    <aside style={{
      width: "240px", minWidth: "240px",
      background: "#0F0F0F",
      borderRight: `1px solid ${color}22`,
      display: "flex", flexDirection: "column",
      height: "100%", overflow: "hidden",
    }}>

      {/* Header */}
      <div style={{ padding: "16px", borderBottom: `1px solid ${color}22` }}>
        <button
          onClick={() => navigate("/services")}
          style={{ display: "flex", alignItems: "center", gap: "6px", color: "#666", fontSize: "14px", background: "none", border: "none", cursor: "pointer", padding: "4px 0", marginBottom: "12px", transition: "color 0.2s", fontFamily: "DM Sans, sans-serif" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = color)}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
        >
          ← All Services
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div>
            <p style={{ color: color, fontWeight: 600, fontSize: "14px", margin: 0 }}>
              {SERVICE_LABELS[service] || service}
            </p>
            <p style={{ color: "#555", fontSize: "12px", margin: 0 }}>Advisory Chatbot</p>
          </div>
        </div>
      </div>

      {/* New chat button */}
      <div style={{ padding: "12px" }}>
        <button
          onClick={onNewChat}
          style={{
            width: "100%", background: color, color: "#0A0A0A",
            border: "none", borderRadius: "10px", padding: "9px 12px",
            fontSize: "13px", fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            transition: "opacity 0.2s", fontFamily: "DM Sans, sans-serif",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          + New Chat
        </button>
      </div>

      {/* Chat history label */}
      <div style={{ padding: "8px 16px 4px" }}>
        <p style={{ color: "#888", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
          Chat History
        </p>
      </div>

      {/* Chat list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px 12px" }}>
        {serviceChats.length === 0 ? (
          <div style={{ padding: "24px 12px", textAlign: "center" }}>
            <p style={{ color: "#444", fontSize: "13px", lineHeight: 1.5, margin: 0 }}>
              No previous chats.<br />Start a new conversation above.
            </p>
          </div>
        ) : (
          serviceChats.map((chat) => {
            const isActive = chat.id === currentChatId;
            return (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                style={{
                  width: "100%", textAlign: "left", padding: "9px 11px",
                  borderRadius: "9px", marginBottom: "2px",
                  border: isActive ? `1px solid ${color}44` : "1px solid transparent",
                  background: isActive ? `${color}15` : "transparent",
                  cursor: "pointer", transition: "all 0.15s ease",
                  fontFamily: "DM Sans, sans-serif",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#1A1A1A"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <p style={{
                  color: isActive ? color : "#FFFFFF",
                  fontSize: "13px", fontWeight: isActive ? 600 : 400,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  margin: "0 0 2px 0",
                }}>
                  {chat.title}
                </p>
                <p style={{ color: "#999", fontSize: "11px", margin: 0 }}>{chat.date}</p>
              </button>
            );
          })
        )}
      </div>

      {/* Bottom user info */}
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${color}22`, display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{
          width: "28px", height: "28px", borderRadius: "50%",
          background: `${color}20`, border: `1px solid ${color}44`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: color, fontSize: "12px", fontWeight: 600, flexShrink: 0,
        }}>
          {(sessionStorage.getItem("1f_email") || "U").charAt(0).toUpperCase()}
        </div>
        <p style={{ color: "#CCCCCC", fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>
          {sessionStorage.getItem("1f_email") || ""}
        </p>
      </div>
    </aside>
  );
}