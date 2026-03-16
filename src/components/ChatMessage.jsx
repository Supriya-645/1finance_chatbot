import ChartRenderer from "./ChartRenderer";
import { exportToCSV } from "../utils/exportCSV";

function renderText(text, accentColor = "#C9A84C") {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={j} style={{ color: "#CCCCCC", fontWeight: 600 }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part.split(/(`[^`]+`)/g).map((p, k) => {
        if (p.startsWith("`") && p.endsWith("`")) {
          return (
            <code key={k} style={{
              background: "#2A2A2A", color: accentColor,
              padding: "1px 5px", borderRadius: "4px",
              fontSize: "12px", fontFamily: "JetBrains Mono, monospace",
            }}>
              {p.slice(1, -1)}
            </code>
          );
        }
        return p;
      });
    });

    if (line.startsWith("• ") || line.startsWith("- ")) {
      const cleanLine = line.startsWith("• ") ? line.slice(2) : line.slice(2);
      const cleanParts = cleanLine.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={j} style={{ color: "#CCCCCC", fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      return (
        <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "3px" }}>
          <span style={{ color: accentColor, marginTop: "1px", flexShrink: 0 }}>•</span>
          <span>{cleanParts}</span>
        </div>
      );
    }
    if (!line.trim()) return <div key={i} style={{ height: "8px" }} />;
    return <div key={i} style={{ marginBottom: "2px" }}>{parts}</div>;
  });
}

export default function ChatMessage({ msg, accentColor = "#C9A84C" }) {
  const isUser = msg.role === "user";

  if (isUser) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <div style={{
          background: `${accentColor}15`,
          border: `1px solid ${accentColor}44`,
          color: "#CCCCCC",
          borderRadius: "14px 14px 0 14px",
          padding: "10px 14px",
          maxWidth: "75%",
          fontSize: "14px",
          lineHeight: "1.6",
          display: "inline-block",
          width: "auto",
        }}>
          {msg.content}
        </div>
      </div>
    );
  }

  if (msg.role === "error") {
    return (
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "16px" }}>
        <div style={{
          width: "28px", height: "28px", borderRadius: "50%",
          background: "#E24B4A",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 700, fontSize: "10px", flexShrink: 0,
        }}>!</div>
        <div style={{
          background: "#1A0808", border: "1px solid #3D1515",
          borderRadius: "0 14px 14px 14px",
          padding: "12px 16px", color: "#F87171", fontSize: "13px",
          maxWidth: "80%",
        }}>
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "16px" }}>
      {/* Bot avatar */}
      <div style={{
        width: "28px", height: "28px", borderRadius: "50%",
        background: accentColor,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#0A0A0A", fontWeight: 700, fontSize: "10px", flexShrink: 0,
        fontFamily: "Playfair Display, serif",
      }}>
        1F
      </div>

      <div style={{maxWidth: "85%" }}>
        {/* Text bubble */}
        <div style={{
          background: "#1A1A1A",
          border: `1px solid ${accentColor}22`,
          borderRadius: "0 14px 14px 14px",
          padding: "12px 16px",
          fontSize: "14px", lineHeight: "1.65", color: "#CCCCCC",
          display: "inline-block",
          width: "auto",
        }}>
          {renderText(msg.content, accentColor)}
        </div>

        {/* Chart */}
        {msg.chartData && <ChartRenderer chartData={msg.chartData} accentColor={accentColor} />}

        {/* CSV download */}
        {msg.csvData && Array.isArray(msg.csvData) && msg.csvData.length > 0 && (
          <button
            onClick={() => exportToCSV(msg.csvData, `1finance_${msg.service || "data"}_${Date.now()}.csv`)}
            style={{
              marginTop: "8px", display: "flex", alignItems: "center", gap: "7px",
              padding: "7px 14px", background: "transparent",
              border: `1px solid ${accentColor}44`,
              borderRadius: "8px", color: accentColor,
              fontSize: "12px", cursor: "pointer", transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `${accentColor}15`; e.currentTarget.style.borderColor = accentColor; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = `${accentColor}44`; }}
          >
            ⬇ Download CSV ({msg.csvData.length} rows)
          </button>
        )}

        {/* Timestamp */}
        <p style={{ fontSize: "10px", color: "#333", marginTop: "5px", paddingLeft: "2px" }}>
          {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}