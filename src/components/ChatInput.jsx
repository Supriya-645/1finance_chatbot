import { useState, useRef, useEffect } from "react";

export default function ChatInput({ onSend, disabled, suggestions = [], accentColor = "#C9A84C" }) {
  const [value,           setValue]           = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [focused,         setFocused]         = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [value]);

  const handleSend = () => {
      const trimmed = value.trim();
      if (!trimmed || disabled) return;
      setValue("");
      onSend(trimmed);
    };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const hasText   = value.trim().length > 0;
  const btnBg     = hasText && !disabled ? accentColor  : "transparent";
  const btnBorder = accentColor;
  const btnColor  = hasText && !disabled ? "#0A0A0A"    : accentColor;

  return (
    <div style={{ borderTop: `1px solid ${accentColor}22`, background: "#0F0F0F", padding: "12px 16px 16px" }}>

      {/* Suggestion chips */}
      {suggestions.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
          {suggestions.slice(0, 3).map((q, i) => (
            <button
              key={i}
              onClick={() => { onSend(q); }}
              disabled={disabled}
              style={{
                background: "transparent", border: `1px solid ${accentColor}44`,
                borderRadius: "20px", padding: "5px 12px",
                color: "#999", fontSize: "12px", cursor: "pointer",
                transition: "all 0.15s ease", maxWidth: "260px",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                fontFamily: "DM Sans, sans-serif",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.color = accentColor; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${accentColor}44`; e.currentTarget.style.color = "#999"; }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <div style={{
        display: "flex", gap: "10px", alignItems: "flex-end",
        background: "#141414",
        border: `1px solid ${focused ? accentColor : accentColor + "33"}`,
        borderRadius: "14px", padding: "10px 10px 10px 14px",
        transition: "border-color 0.2s",
      }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Ask about client data, portfolios, returns..."
          disabled={disabled}
          rows={1}
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            color: "#CCCCCC", fontSize: "14px", resize: "none", lineHeight: "1.5",
            fontFamily: "DM Sans, system-ui, sans-serif",
            minHeight: "24px", maxHeight: "120px", overflowY: "auto",
          }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={disabled}
          title="Send message"
          style={{
            width: "38px", height: "38px", borderRadius: "10px", flexShrink: 0,
            background: btnBg,
            border: `1.5px solid ${btnBorder}`,
            cursor: hasText && !disabled ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s ease",
            color: btnColor,
          }}
          onMouseEnter={(e) => { if (hasText && !disabled) { e.currentTarget.style.opacity = "0.85"; } }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          {disabled ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke={accentColor} strokeWidth="2.5" strokeDasharray="40" strokeDashoffset="10" opacity="0.4"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
              </path>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          )}
        </button>
      </div>

      <p style={{ color: "#999", fontSize: "11px", textAlign: "center", marginTop: "7px" }}>
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}