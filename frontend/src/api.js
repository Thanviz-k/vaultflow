const BASE_URL = "http://127.0.0.1:8000";

async function parseResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Something went wrong"
    );
  }

  return data;
}

// REGISTER

export async function createOwner(
  name,
  email,
  password,
  useCustomPassphrase,
  customPassphrase,
) {
  const response = await fetch(
    `${BASE_URL}/owners/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        use_custom_passphrase:
          useCustomPassphrase,
        custom_passphrase:
          customPassphrase,
      }),
    }
  );

  return parseResponse(response);
}

// LOGIN

export async function loginOwner(email, password) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  return parseResponse(response);
}

// CREATE SECRET

export async function createSecret(
  name,
  value,
  clientHalf,
  expiresInDays,
  token
) {
  console.log("Token:", token);
  const response = await fetch(`${BASE_URL}/secrets/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name,
      value,
      client_half: clientHalf,
      expires_in_days: expiresInDays,
    }),
  });

  return parseResponse(response);
}

// MY SECRETS

export async function getMySecrets(token) {
  const response = await fetch(`${BASE_URL}/secrets/mine`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(response);
}
export async function updateSecret(
  secretId,
  name,
  value,
  expiresInDays,
  token
) {
  const response = await fetch(`${BASE_URL}/secrets/${secretId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name,
      value,
      expires_in_days: expiresInDays,
    }),
  });

  return parseResponse(response);
}


// REVOKE SECRET
// Your current backend revoke route is not protected yet.
// We will secure ownership checking in the next backend step.

export async function revokeSecret(secretId, token) {
  const response = await fetch(`${BASE_URL}/secrets/revoke`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      secret_id: secretId,
    }),
  });

  return parseResponse(response);
}

// NATURAL LANGUAGE QUERY

export async function querySecrets(question, token) {
  const response = await fetch(`${BASE_URL}/secrets/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      question,
    }),
  });

  return parseResponse(response);
}

// AI ACTIVITY SUMMARY

export async function getSummary(days = 7, token) {
  const response = await fetch(`${BASE_URL}/secrets/summary?days=${days}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(response);
}

// REVEAL SECRET

export async function revealSecret(secretId, clientHalf, token) {
  const response = await fetch(`${BASE_URL}/secrets/reveal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      secret_id: secretId,
      client_half: clientHalf,
    }),
  });

  return parseResponse(response);
}
// DASHBOARD STATS

export async function getDashboardStats(token) {

  const secrets =
    await getMySecrets(token);

  const now = new Date();

  let active = 0;
  let expiring = 0;

  secrets.forEach((secret) => {

    if (!secret.expires_at) {
      active++;
      return;
    }

    const expiry =
      new Date(secret.expires_at);

    const diffDays =
      (expiry - now) /
      (1000 * 60 * 60 * 24);

    if (diffDays > 0)
      active++;

    if (diffDays > 0 &&
        diffDays <= 7)
      expiring++;

  });

  return {

    total: secrets.length,

    active,

    expiring,

  };

}