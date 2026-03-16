export default function TypingIndicator({ accentColor = "#C9A84C" }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "16px" }}>
      <div style={{
        width: "28px", height: "28px", borderRadius: "50%",
        background: accentColor,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#0A0A0A", fontWeight: 700, fontSize: "10px", flexShrink: 0,
        fontFamily: "Playfair Display, serif",
      }}>
        1F
      </div>
      <div style={{
        background: "#1A1A1A", border: "1px solid #2A2A2A",
        borderRadius: "0 14px 14px 14px",
        padding: "12px 16px",
        display: "flex", alignItems: "center", gap: "5px",
      }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{
            width: "7px", height: "7px", borderRadius: "50%",
            background: accentColor,
            display: "inline-block",
            animation: `typingDot 1.4s infinite ${i * 0.2}s`,
          }}/>
        ))}
      </div>
      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}