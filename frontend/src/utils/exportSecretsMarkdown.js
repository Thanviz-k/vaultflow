export function exportSecretsAsMarkdown(secrets) {
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

  const content = `# VaultFlow Secrets Report

Generated: ${now}
Total secrets: ${secrets.length}

| Name | Status | Created | Expires |
|------|--------|---------|---------|
${rows || "| — | — | — | — |"}

> Values are never included in this export. To view a value, reveal it
> individually from the dashboard.
`;

  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `vaultflow-secrets-${Date.now()}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}
