// components/ChatWidget.jsx
// Floating AI chat widget — visible to all logged-in users on every page.
// Sits inside MainLayout so it appears across /planner, /weekly,
// /consultants, /profile, /consultant-dashboard, /dba-dashboard.
//
// API: POST /api/chat
// Body: { message: string, history: GeminiHistory[] }
// Response: { reply: string }

import React, { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../api/apiClient";

// ── Icons ──────────────────────────────────────────────────────────────
const ChatIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const VitaLogo = () => (
  <svg width="18" height="18" viewBox="0 0 30 30" fill="none">
    <circle cx="15" cy="15" r="15" fill="rgba(59,130,246,0.25)"/>
    <path d="M15 6v18M9 10l6 3 6-3" stroke="#93C5FD" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ── Message bubble ─────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 10,
    }}>
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "var(--accent)", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700, flexShrink: 0, marginRight: 8, marginTop: 2,
        }}>
          AI
        </div>
      )}
      <div style={{
        maxWidth: "78%",
        padding: "10px 14px",
        borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        background: isUser ? "var(--accent)" : "var(--bg-subtle)",
        color: isUser ? "#fff" : "var(--text-primary)",
        fontSize: 13,
        lineHeight: 1.55,
        border: isUser ? "none" : "1px solid var(--border-subtle)",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}>
        {msg.text}
      </div>
    </div>
  );
}

// ── Typing indicator ───────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>AI</div>
      <div style={{ display: "flex", gap: 4, padding: "10px 14px", background: "var(--bg-subtle)", borderRadius: "16px 16px 16px 4px", border: "1px solid var(--border-subtle)" }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "var(--text-muted)",
            animation: "vitaBounce 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ── Main widget ────────────────────────────────────────────────────────
export default function ChatWidget() {
  const [open,    setOpen]    = useState(false);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);

  // Display messages: { role: "user"|"ai", text: string }
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi! I'm VITA-FLOW's AI assistant 👋\nAsk me anything about fitness, your diet plan, workouts, or nutrition.",
    },
  ]);

  // Gemini conversation history — sent with every request for multi-turn context
  // Format: [{ role: "user"|"model", parts: [{ text: string }] }]
  const [history, setHistory] = useState([]);

  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");

    // Add user message to display
    setMessages(prev => [...prev, { role: "user", text }]);
    setLoading(true);

    try {
      const res = await sendChatMessage({ message: text, history });
      const reply = res.data.reply;

      // Add AI reply to display
      setMessages(prev => [...prev, { role: "ai", text: reply }]);

      // Update Gemini history for multi-turn context
      setHistory(prev => [
        ...prev,
        { role: "user",  parts: [{ text }] },
        { role: "model", parts: [{ text: reply }] },
      ]);
    } catch (err) {
      const errMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Something went wrong. Please try again.";
      setMessages(prev => [...prev, { role: "ai", text: `⚠️ ${errMsg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Bounce animation for typing dots */}
      <style>{`
        @keyframes vitaBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>

      {/* ── Floating button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Chat with AI"
        style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 900,
          width: 52, height: 52, borderRadius: "50%",
          background: "var(--accent)", color: "#fff",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(59,130,246,0.45)",
          transition: "transform 200ms, box-shadow 200ms",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(59,130,246,0.55)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(59,130,246,0.45)"; }}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>

      {/* ── Chat panel ── */}
      {open && (
        <div style={{
          position: "fixed", bottom: 92, right: 28, zIndex: 900,
          width: 360, height: 520,
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          animation: "fadeInUp 180ms ease",
        }}>

          {/* Header */}
          <div style={{
            padding: "14px 18px",
            background: "var(--accent)",
            display: "flex", alignItems: "center", gap: 10,
            flexShrink: 0,
          }}>
            <VitaLogo />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>VITA-FLOW AI</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>Fitness & Nutrition Assistant</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.8)", display: "flex" }}
            >
              <CloseIcon />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: "auto",
            padding: "16px 14px",
            display: "flex", flexDirection: "column",
          }}>
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: "12px 14px",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex", gap: 8, alignItems: "flex-end",
            flexShrink: 0,
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about your plan, workouts, nutrition…"
              rows={1}
              style={{
                flex: 1, resize: "none", maxHeight: 80,
                padding: "9px 12px",
                borderRadius: 12,
                border: "1.5px solid var(--border-default)",
                background: "var(--bg-input)",
                color: "var(--text-primary)",
                fontSize: 13, fontFamily: "var(--font-body)",
                outline: "none",
                transition: "border-color 200ms",
                lineHeight: 1.4,
                overflowY: "auto",
              }}
              onFocus={e => e.target.style.borderColor = "var(--accent)"}
              onBlur={e => e.target.style.borderColor = "var(--border-default)"}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              style={{
                width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                background: (!input.trim() || loading) ? "var(--bg-subtle)" : "var(--accent)",
                color: (!input.trim() || loading) ? "var(--text-muted)" : "#fff",
                border: "none", cursor: (!input.trim() || loading) ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 150ms",
              }}
            >
              <SendIcon />
            </button>
          </div>

        </div>
      )}
    </>
  );
}
