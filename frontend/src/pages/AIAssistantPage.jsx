import AppLayout from "../layouts/AppLayout";

function AIAssistantPage({ token, onLogout }) {

  return (

    <AppLayout
      title="AI Assistant"
      onLogout={onLogout}
    >

      <div className="ai-container">

  <div className="ai-header">

    <h1>🤖 AI Assistant</h1>

    <p>

      Ask questions about your Vault secrets using natural language.

    </p>

  </div>

  <div className="ai-chat">

    <div className="ai-message ai">

      👋 Hi! I'm your VaultFlow AI Assistant.
      Ask me anything about your secrets.

    </div>

  </div>

  <div className="ai-input-area">

    <textarea

      className="ai-input"

      rows={3}

      placeholder="Example: Which secrets expire this week?"

    />

    <button className="primary-btn">

  🚀 Ask AI

</button>

  </div>

</div>

    </AppLayout>

  );

}

export default AIAssistantPage;