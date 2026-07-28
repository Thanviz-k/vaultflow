import { useState, useRef, useEffect } from "react";
import { Bot, Send } from "lucide-react";

import AppLayout from "../layouts/AppLayout";
import { querySecrets } from "../api";

const WELCOME = {
  role: "bot",
  text: "👋 Hi! I'm your VaultFlow AI Assistant. Ask me anything about your secrets.",
};

function AIAssistantPage({ token, onLogout }) {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleAsk() {
    const question = input.trim();
    if (!question || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setLoading(true);

    try {
      const data = await querySecrets(question, token);

      const answer =
        typeof data === "string"
          ? data
          : data.answer || data.message || JSON.stringify(data);

      setMessages((prev) => [...prev, { role: "bot", text: answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: `⚠️ ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  }

  return (
    <AppLayout title="AI Assistant" onLogout={onLogout}>
      <div className="ai-page">
        <div className="ai-chat-card">
          <div className="ai-chat-header">
            <div className="ai-avatar">
              <Bot size={30} />
            </div>
            <div>
              <div className="ai-title">AI Assistant</div>
              <div className="ai-subtitle">
                Ask questions about your Vault secrets using natural language.
              </div>
            </div>
          </div>

          <div className="ai-messages">
            {messages.map((m, i) => (
              <div key={i} className={`ai-message ${m.role}`}>
                {m.text}
              </div>
            ))}

            {loading && (
              <div className="ai-message bot">Thinking...</div>
            )}

            <div ref={scrollRef} />
          </div>

          <div className="ai-input">
            <input
              type="text"
              placeholder="Example: Which secrets expire this week?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />

            <button
              className="btn ai-btn"
              onClick={handleAsk}
              disabled={loading || !input.trim()}
            >
              <Send size={18} />
              Ask AI
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default AIAssistantPage;
