import { useState } from "react";
import { Link } from "react-router-dom";

import AIQueryBox from "../components/AIQueryBox";
import MarkdownResult from "../components/MarkdownResult";

import {
  getSummary,
  querySecrets,
} from "../api";


function ReportsPage({ token }) {
  const [days, setDays] = useState("7");

  const [summary, setSummary] = useState("");

  const [queryResult, setQueryResult] =
    useState("");

  const [error, setError] = useState("");

  const [summaryLoading, setSummaryLoading] =
    useState(false);

  const [queryLoading, setQueryLoading] =
    useState(false);


  async function handleSummary() {
    setError("");
    setSummaryLoading(true);

    try {
      const data = await getSummary(
        Number(days),
        token
      );

      console.log(
        "SUMMARY RESPONSE:",
        data
      );

      const markdown = `# VaultFlow Activity Summary

## Period

Last ${days} days

## Summary

${data.summary ?? "No summary was returned."}
`;

      setSummary(markdown);

    } catch (error) {
      setError(error.message);

    } finally {
      setSummaryLoading(false);
    }
  }


  async function handleQuery(question) {
    setError("");
    setQueryLoading(true);

    try {
      const data = await querySecrets(
        question,
        token
      );

      const markdown = `# VaultFlow Query Report

## Question

${question}

## Detected Intent

\`\`\`json
${JSON.stringify(
  data.intent,
  null,
  2
)}
\`\`\`

## Result

\`\`\`json
${JSON.stringify(
  data.result,
  null,
  2
)}
\`\`\`
`;

      setQueryResult(markdown);

    } catch (error) {
      setError(error.message);

    } finally {
      setQueryLoading(false);
    }
  }


  return (
<AppLayout
    title="Reports"
    onLogout={onLogout}
>


      <header className="reports-header">

        <div>
          <span className="reports-label">
            VAULT INTELLIGENCE
          </span>

          <h1>Security Reports</h1>

          <p>
            Analyze activity and query your
            secured vault.
          </p>
        </div>


        <div className="reports-header-actions">

          <div className="system-secure">
            <span className="secure-light" />
            SYSTEM SECURE
          </div>

          <Link
            to="/dashboard"
            className="dashboard-link"
          >
            ← Dashboard
          </Link>

        </div>

      </header>


      {error && (
        <div className="reports-error">
          {error}
        </div>
      )}


      <section className="summary-panel">

        <div className="panel-heading">

          <div>
            <span className="panel-number">
              01
            </span>

            <h2>Activity Intelligence</h2>

            <p>
              Generate an AI summary of recent
              activity inside your vault.
            </p>
          </div>

        </div>


        <div className="summary-controls">

          <div className="period-control">

            <label>
              ANALYSIS PERIOD
            </label>

            <select
              value={days}
              onChange={(e) =>
                setDays(e.target.value)
              }
            >
              <option value="1">
                Last 1 Day
              </option>

              <option value="7">
                Last 7 Days
              </option>

              <option value="15">
                Last 15 Days
              </option>

              <option value="30">
                Last 30 Days
              </option>
            </select>

          </div>


          <button
            type="button"
            className="generate-button"
            onClick={handleSummary}
            disabled={summaryLoading}
          >
            {summaryLoading
              ? "ANALYZING..."
              : "GENERATE REPORT →"}
          </button>

        </div>


        {summary && (
          <div className="report-output">

            <div className="output-header">
              <span>ACTIVITY REPORT</span>

              <span className="classified-label">
                INTERNAL
              </span>
            </div>

            <MarkdownResult
              content={summary}
              filename="vaultflow-summary.md"
            />

          </div>
        )}

      </section>


      <section className="query-section">

        <div className="section-marker">
          02 / AI QUERY SYSTEM
        </div>


        <AIQueryBox
          onSubmit={handleQuery}
          loading={queryLoading}
        />


        {queryResult && (
          <div className="report-output query-output">

            <div className="output-header">
              <span>QUERY RESULT</span>

              <span className="classified-label">
                OWNER ACCESS
              </span>
            </div>


            <MarkdownResult
              content={queryResult}
              filename="vaultflow-query-report.md"
            />

          </div>
        )}

      </section>

   </AppLayout>

  );
}


export default ReportsPage;