import ReactMarkdown from "react-markdown";

import {
  downloadMarkdown,
} from "../utils/downloadMarkdown";


function MarkdownResult({
  content,
  filename = "vaultflow-report.md",
}) {
  if (!content) {
    return null;
  }


  return (
    <div className="markdown-result">
    
      <ReactMarkdown>
        {content}
      </ReactMarkdown>


      <button
        type="button"
        onClick={() =>
          downloadMarkdown(
            content,
            filename
          )
        }
      >
        Download .md
      </button>
    </div>
  );
}


export default MarkdownResult;