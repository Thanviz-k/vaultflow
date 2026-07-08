import { useState } from "react";


const PROMPTS = [
  "Show me all active secrets",
  "List my revoked secrets",
  "Show all expired secrets",
  "How many active secrets do I have?",
  "How many revoked secrets do I have?",
  "How many secrets do I have?",
  "Show secrets expiring within 7 days",
  "Show secrets expiring within 30 days",
  "List all my secrets",
];


function AIQueryBox({
  onSubmit,
  loading = false,
}) {
  const [question, setQuestion] = useState("");
  const [showPrompts, setShowPrompts] =
    useState(false);


  const matchingPrompt = PROMPTS.find(
    (prompt) =>
      question.length > 0 &&
      prompt
        .toLowerCase()
        .startsWith(question.toLowerCase()) &&
      prompt.toLowerCase() !==
        question.toLowerCase()
  );


  function handleKeyDown(e) {
    if (e.key === "Tab" && matchingPrompt) {
      e.preventDefault();

      setQuestion(matchingPrompt);
    }

    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();

      handleSubmit();
    }
  }


  async function handleSubmit() {
    if (!question.trim() || loading) {
      return;
    }

    await onSubmit(question);

    setShowPrompts(false);
  }


  function choosePrompt(prompt) {
    setQuestion(prompt);
    setShowPrompts(false);
  }


  return (
    <section className="ai-console">

      <div className="console-header">

        <div>
          <span className="console-label">
            AI QUERY TERMINAL
          </span>

          <h2>Ask the Vault</h2>

          <p>
            Query your secured vault using
            natural language.
          </p>
        </div>


        <div className="ai-status">
          <span className="status-light" />

          AI ONLINE
        </div>

      </div>


      <div className="query-terminal">

        <div className="terminal-prefix">
          &gt;
        </div>


        <div className="query-input-area">

          <textarea
            value={question}
            onChange={(e) =>
              setQuestion(e.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Ask about your vault..."
            rows="3"
          />


          {matchingPrompt && (
            <div className="tab-suggestion">

              <span>
                {matchingPrompt}
              </span>

              <kbd>TAB</kbd>

            </div>
          )}

        </div>

      </div>


      <div className="query-controls">

        <div className="prompt-menu-wrapper">

          <button
            type="button"
            className="prompt-toggle"
            onClick={() =>
              setShowPrompts(
                !showPrompts
              )
            }
          >
            Suggested Queries

            <span
              className={
                showPrompts
                  ? "arrow open"
                  : "arrow"
              }
            >
              ›
            </span>
          </button>


          {showPrompts && (
            <div className="prompt-dropdown">

              {PROMPTS.map(
                (prompt, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() =>
                      choosePrompt(prompt)
                    }
                  >
                    <span>
                      {String(index + 1)
                        .padStart(2, "0")}
                    </span>

                    {prompt}
                  </button>
                )
              )}

            </div>
          )}

        </div>


        <button
          type="button"
          className="run-query-button"
          onClick={handleSubmit}
          disabled={
            loading ||
            !question.trim()
          }
        >
          {loading
            ? "ANALYZING..."
            : "RUN QUERY →"}
        </button>

      </div>


      <div className="quick-commands">

        <span>QUICK COMMANDS</span>


        <button
          type="button"
          onClick={() =>
            choosePrompt(
              "Show me all active secrets"
            )
          }
        >
          Active Secrets
        </button>


        <button
          type="button"
          onClick={() =>
            choosePrompt(
              "Show secrets expiring within 7 days"
            )
          }
        >
          Expiring Soon
        </button>


        <button
          type="button"
          onClick={() =>
            choosePrompt(
              "How many secrets do I have?"
            )
          }
        >
          Total Count
        </button>

      </div>

    </section>
  );
}


export default AIQueryBox;