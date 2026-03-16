import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";
import TypingIndicator from "../components/TypingIndicator";
import { callOpenAI, parseAIResponse } from "../utils/geminiService";
import mockData from "../data/mockData.json";

const SERVICE_META = {
  investment: { label: "Investment Advisor", color: "#2E9E5B", accent: "#2E9E5B", bg: "#0A1F12" },
  banking:    { label: "Banking Advisor", color: "#C9A84C", accent: "#C9A84C", bg: "#1A1400" },
  insurance:  { label: "Insurance Advisor", color: "#E8843A", accent: "#E8843A", bg: "#1F0E00" },
  tax:        { label: "Tax Planning Advisor", color: "#4A90D9", accent: "#4A90D9", bg: "#071524" },
  realestate: { label: "Real Estate Advisor", color: "#8B5E3C", accent: "#8B5E3C", bg: "#150C05" },
  retirement: { label: "Retirement Advisor", color: "#B59AE8", accent: "#B59AE8", bg: "#100A1F" },
};

const WELCOME_MESSAGES = {
  investment: `Good day! I'm your Investment Advisor at 1 Finance. How can I assist you today?`,
  banking:    `Good day! I'm your Banking Advisor at 1 Finance. How can I assist you today?`,
  insurance:  `Good day! I'm your Insurance Advisor at 1 Finance. How can I assist you today?`,
  tax:        `Good day! I'm your Tax Planning Advisor at 1 Finance. How can I assist you today?`,
  realestate: `Good day! I'm your Real Estate Advisor at 1 Finance. How can I assist you today?`,
  retirement: `Good day! I'm your Retirement Advisor at 1 Finance. How can I assist you today?`,
};

function loadHistory() {
  try { return JSON.parse(localStorage.getItem("1f_chat_history") || "[]"); }
  catch { return []; }
}

function saveHistory(history) {
  try { localStorage.setItem("1f_chat_history", JSON.stringify(history.slice(0, 50))); }
  catch (e) { console.warn("Could not save chat history:", e); }
}

export default function ChatPage() {
  const { service } = useParams();
  const navigate    = useNavigate();
  const meta        = SERVICE_META[service] || SERVICE_META.investment;

  const [messages,      setMessages]      = useState([]);
  const [isTyping,      setIsTyping]      = useState(false);
  const [chatHistory,   setChatHistory]   = useState(loadHistory);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [error,         setError]         = useState(null);
  const bottomRef = useRef(null);

  const suggestions = mockData.suggested_questions?.[service] || [];

  useEffect(() => { startNewChat(); }, [service]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  function startNewChat() {
    setCurrentChatId(null);
    setError(null);
    setMessages([{ role: "assistant", content: WELCOME_MESSAGES[service] || `Good day! I'm your ${meta.label} at 1 Finance.\n\nHow can I assist you today?` }]);
  }

  const persistChat = useCallback((msgs, chatId) => {
    if (msgs.length < 2) return chatId;
    const firstUser = msgs.find((m) => m.role === "user");
    const title = firstUser ? firstUser.content.slice(0, 45) + (firstUser.content.length > 45 ? "…" : "") : "New conversation";
    const id    = chatId || `chat_${service}_${Date.now()}`;
    const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const chat  = { id, service, title, date: today, messages: msgs };
    setChatHistory((prev) => {
      const updated = [chat, ...prev.filter((c) => c.id !== id)];
      saveHistory(updated);
      return updated;
    });
    return id;
  }, [service]);

  const handleSend = async (text) => {
    setError(null);
    const userMsg     = { role: "user", content: text };
    const updatedMsgs = [...messages, userMsg];
    setMessages(updatedMsgs);
    setIsTyping(true);
    try {
      let rawResponse = await callOpenAI(text, messages, service);
      if (!rawResponse || typeof rawResponse !== "string") {
        console.warn("callOpenAI returned invalid response; using fallback text.", rawResponse);
        rawResponse = "Sorry, I couldn’t reach Gemini. Here’s a short advisory from the built-in fallback mode. Please retry or set a valid Gemini key.";
      }
      const { cleanText, chartData, csvData } = parseAIResponse(rawResponse);
      const botMsg    = { role: "assistant", content: cleanText, chartData: chartData || null, csvData: csvData || null, service };
      const finalMsgs = [...updatedMsgs, botMsg];
      setMessages(finalMsgs);
      const id = persistChat(finalMsgs, currentChatId);
      if (!currentChatId) setCurrentChatId(id);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [...prev, { role: "error", content: `Failed to get response: ${err?.message || "unknown error"}. Please check your VITE_GEMINI_API_KEY in the .env file or use mock fallback.` }]);
      setError(err?.message || "unknown error");
    } finally {
      setIsTyping(false);
    }
  };

  const handleSelectChat = (id) => {
    const chat = chatHistory.find((c) => c.id === id);
    if (chat) { setCurrentChatId(id); setMessages(chat.messages); setError(null); }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0A0A0A", overflow: "hidden" }}>

      <Sidebar
        service={service}
        chatHistory={chatHistory}
        onSelectChat={handleSelectChat}
        onNewChat={startNewChat}
        currentChatId={currentChatId}
        accentColor={meta.accent}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Header */}
        <div style={{
          borderBottom: `1px solid #1E1E1E`,
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#0F0F0F",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div>
              <h2 style={{ color: "#FFFFFF", fontWeight: 600, fontSize: "14px", margin: 0 }}>
                {messages.find((m) => m.role === "user")?.content?.slice(0, 60) || "New Conversation"}
              </h2>
              <p style={{ color: meta.accent, fontSize: "12px", margin: 0, opacity: 0.8 }}>
                {meta.label} · Gemini 1.5 Flash
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {messages.map((msg, i) => (
            <ChatMessage key={i} msg={msg} accentColor={meta.accent} />
          ))}
          {isTyping && <TypingIndicator accentColor={meta.accent} />}
          <div ref={bottomRef} />
        </div>

        <ChatInput
          onSend={handleSend}
          disabled={isTyping}
          suggestions={suggestions}
          accentColor={meta.accent}
        />
      </div>
    </div>
  );
}