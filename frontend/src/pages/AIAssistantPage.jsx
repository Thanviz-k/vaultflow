import { useState, useRef, useEffect } from "react";
import { Bot, Send, FileDown } from "lucide-react";

import AppLayout from "../layouts/AppLayout";
import { querySecrets } from "../api";

const WELCOME = {
  role: "bot",
  text: "👋 Hi! I'm your VaultFlow AI Assistant. Ask me anything about your secrets.",
};

const QUICK_COMMANDS = [
  "Show my active secrets",
  "What's expiring soon?",
  "How many secrets do I have?",
  "Give me a report",
];

function buildReportMarkdown(secrets) {
  const now = new Date().toLocaleString();

  const rows = secrets
    .map((s) => {
      const expires = s.expires_at
        ? new Date(s.expires_at).toLocaleString()
        : "Never";
      const created = s.created_at
        ? new Date(s.created_at).toLocaleString()
        : "Unknown";

      return `| ${s.name} | ${s.status} | ${created} | ${expires} |`;
    })
    .join("\n");

  return `# VaultFlow Secrets Report

Generated: ${now}
Total secrets: ${secrets.length}

| Name | Status | Created | Expires |
|------|--------|---------|---------|
${rows || "| — | — | — | — |"}

> Values are never included in this export. To view a value, reveal it
> individually from the dashboard.
`;
}

function downloadMarkdown(content, filename) {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function AIAssistantPage({ token, onLogout }) {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendQuestion(question) {
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

      const isReport =
        data?.intent?.action === "generate_report" &&
        Array.isArray(data?.result?.secrets) &&
        data.result.secrets.length > 0;

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: answer,
          report: isReport ? data.result.secrets : null,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: `⚠️ ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleAsk() {
    sendQuestion(input.trim());
  }

  function handleQuickCommand(text) {
    sendQuestion(text);
  }

  function handleDownloadReport(secrets) {
    const content = buildReportMarkdown(secrets);
    downloadMarkdown(content, `vaultflow-report-${Date.now()}.md`);
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
                <div>{m.text}</div>

                {m.report && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ marginTop: 14 }}
                    onClick={() => handleDownloadReport(m.report)}
                  >
                    <FileDown size={18} />
                    Download Report (.md)
                  </button>
                )}
              </div>
            ))}

            {loading && <div className="ai-message bot">Thinking...</div>}

            <div ref={scrollRef} />
          </div>

          <div className="ai-quick-commands">
            {QUICK_COMMANDS.map((cmd) => (
              <button
                key={cmd}
                type="button"
                className="quick-command-chip"
                disabled={loading}
                onClick={() => handleQuickCommand(cmd)}
              >
                {cmd}
              </button>
            ))}
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
