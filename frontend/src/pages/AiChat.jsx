import { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

/* Render markdown-like text with code blocks */
function MessageContent({ text }) {
  if (!text) return null;

  // Split on ```lang\n...\n``` blocks
  const parts = [];
  const codeRegex = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: "code", lang: match[1] || "text", content: match[2].trim() });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.slice(lastIndex) });
  }

  return (
    <div>
      {parts.map((p, i) =>
        p.type === "code"
          ? <CodeBlock key={i} lang={p.lang} code={p.content} />
          : <PlainText key={i} text={p.content} />
      )}
    </div>
  );
}

function PlainText({ text }) {
  // Convert **bold** and split on newlines
  const lines = text.split("\n");
  return (
    <div>
      {lines.map((line, i) => {
        const bold = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        return (
          <p key={i} style={{ margin: line.trim() ? "4px 0" : "6px 0" }}
            dangerouslySetInnerHTML={{ __html: bold }} />
        );
      })}
    </div>
  );
}

function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <pre style={{ position: "relative", background: "#1e1b4b", color: "#e2e8f0", borderRadius: 10, padding: "14px 16px", overflowX: "auto", fontSize: 13, lineHeight: 1.55, margin: "10px 0" }}>
      {lang && (
        <span style={{ position: "absolute", top: 8, left: 12, fontSize: 10, fontWeight: 700, color: "#a29bfe", textTransform: "uppercase", letterSpacing: 1 }}>{lang}</span>
      )}
      <button
        onClick={copy}
        style={{ position: "absolute", top: 8, right: 8, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", color: "#e2e8f0", borderRadius: 6, padding: "3px 9px", fontSize: 11, cursor: "pointer" }}
      >
        {copied ? "✓ Copied" : "Copy"}
      </button>
      <code style={{ fontFamily: "'Fira Code','Courier New',monospace", paddingTop: lang ? 20 : 0, display: "block" }}>{code}</code>
    </pre>
  );
}

const SUGGESTIONS = [
  "Explain how Spring Boot security works",
  "Write a REST API endpoint in Java",
  "Debug this React useState issue",
  "How does SQL JOIN work? Give examples",
  "Write a Python function to read CSV files",
  "What is the difference between useEffect and useMemo?",
];

export default function AiChat() {
  const [messages, setMessages] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("aiChatHistory") || "[]");
    } catch { return []; }
  });
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    sessionStorage.setItem("aiChatHistory", JSON.stringify(messages));
  }, [messages]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    setError("");

    const userMsg = { role: "user", text: msg, id: Date.now() };
    const updatedMsgs = [...messages, userMsg];
    setMessages(updatedMsgs);
    setLoading(true);

    // Build history for backend (exclude current message and previous error turns)
    const history = messages
      .filter(m => !m.text.startsWith("❌") && !m.text.startsWith("⚠️"))
      .map(m => ({ role: m.role, text: m.text }));

    try {
      const res = await api.post("/ai/chat", { message: msg, history });
      const reply = res.data?.reply || "No response received.";
      setMessages(prev => [...prev, { role: "model", text: reply, id: Date.now() + 1 }]);
    } catch (err) {
      const errMsg = err.response?.data?.error
        || err.response?.data?.message
        || "Failed to reach AI service. Check backend logs.";
      setError(errMsg);
      setMessages(prev => [...prev, { role: "model", text: `❌ ${errMsg}`, id: Date.now() + 1 }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clearHistory = () => {
    setMessages([]); sessionStorage.removeItem("aiChatHistory");
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content" style={{ display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <div className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--grad-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤖</div>
            <div>
              <h1 className="topbar-title" style={{ fontSize: 17 }}>AI Project Assistant</h1>
              <p style={{ fontSize: 12, color: "var(--clr-text-faint)" }}>Java · React · Spring Boot · SQL · Python</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ fontSize: 12, color: loading ? "var(--clr-success)" : "var(--clr-text-faint)", background: "var(--clr-bg)", padding: "4px 10px", borderRadius: 99, border: "1px solid var(--clr-border)" }}>
              {loading ? "● Thinking…" : "● Ready"}
            </span>
            {messages.length > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={clearHistory}>Clear Chat</button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages" style={{ flex: 1 }}>
          {messages.length === 0 && !loading && (
            <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center", paddingTop: 30 }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🤖</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>AI Project Assistant</h2>
              <p style={{ fontSize: 14, color: "var(--clr-text-muted)", marginBottom: 28 }}>
                Ask me anything about Java, Spring Boot, React, SQL, or Python. I can generate code, debug issues, and explain concepts.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    style={{
                      background: "var(--clr-surface)", border: "1px solid var(--clr-border)",
                      borderRadius: "12px", padding: "10px 14px",
                      textAlign: "left", fontSize: 13, color: "var(--clr-text-muted)",
                      cursor: "pointer", transition: "all .15s",
                    }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = "var(--clr-primary)"; e.currentTarget.style.color = "var(--clr-primary)"; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = "var(--clr-border)"; e.currentTarget.style.color = "var(--clr-text-muted)"; }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              {msg.role === "model" && (
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--clr-primary-lt)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, marginRight: 8, marginTop: 2 }}>🤖</div>
              )}
              <div className={`chat-bubble ${msg.role}`} style={{ maxWidth: "78%" }}>
                <MessageContent text={msg.text} />
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--clr-primary-lt)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div>
              <div className="chat-bubble model" style={{ padding: "12px 16px" }}>
                <div className="chat-dots">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="chat-input-bar">
          <textarea
            ref={textareaRef}
            placeholder="Ask about Java, React, Spring Boot, SQL, Python… (Shift+Enter for new line)"
            value={input}
            onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px"; }}
            onKeyDown={handleKey}
            rows={1}
            disabled={loading}
          />
          <button
            className="btn btn-primary"
            style={{ alignSelf: "flex-end", minWidth: 80 }}
            onClick={() => send()}
            disabled={loading || !input.trim()}
          >
            {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : "Send ↑"}
          </button>
        </div>
      </div>
    </div>
  );
}
