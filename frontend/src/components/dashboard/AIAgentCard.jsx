import { Bot, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function AIAgentCard() {
  const navigate = useNavigate();

  return (
    <div
      className="ai-agent-card"
      onClick={() => navigate("/ai")}
    >
      <div className="ai-agent-left">
        <Bot size={26} />
        <div>
          <h3>AI Agent</h3>
          <p>Analyze your vault, generate passwords and get security insights.</p>
        </div>
      </div>

      <ArrowRight size={24} />
    </div>
  );
}

export default AIAgentCard;