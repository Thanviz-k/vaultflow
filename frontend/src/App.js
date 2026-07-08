const BASE_URL = "http://127.0.0.1:8000";

export async function createSecret(name, ownerId, expiresInDays) {
  const response = await fetch(`${BASE_URL}/secrets/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      owner_id: ownerId,
      expires_in_days: expiresInDays,
    }),
  });
  return response.json();
}

export async function listSecrets(question) {
  const response = await fetch(`${BASE_URL}/secrets/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  return response.json();
}

export async function getSummary(days = 7) {
  const response = await fetch(`${BASE_URL}/secrets/summary?days=${days}`);
  return response.json();
}

export async function revokeSecret(secretId) {
  const response = await fetch(`${BASE_URL}/secrets/revoke`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret_id: secretId }),
  });
  return response.json();
}