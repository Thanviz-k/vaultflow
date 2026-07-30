const BASE_URL = "http://127.0.0.1:8000";

async function parseResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : typeof data.error === "string"
        ? data.error
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
  mode,
) {
  const response = await fetch(
    `${BASE_URL}/owners/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        mode,
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
  vaultKey,
  expiresInDays,
  token
) {
  const response = await fetch(`${BASE_URL}/secrets/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name,
      value,
      vault_key: vaultKey,
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
    vaultKey,
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
            vault_key: vaultKey,
            expires_in_days: expiresInDays,
        }),
    });

    return parseResponse(response);
}


// REVOKE SECRET
// Your current backend revoke route is not protected yet.
// We will secure ownership checking in the next backend step.


export async function revokeSecret(
    secretId,
    vaultKey,
    token,
) {
    const response = await fetch(
        `${BASE_URL}/secrets/revoke`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                secret_id: secretId,
                vault_key: vaultKey,
            }),
        }
    );

    return parseResponse(response);
}
// DELETE SECRET
export async function deleteSecret(
    secretId,
    vaultKey,
    token,
) {
    const response = await fetch(
        `${BASE_URL}/secrets/delete`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                secret_id: secretId,
                vault_key: vaultKey,
            }),
        }
    );

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
export async function revealSecret(secretId, vaultKey, token) {
  const response = await fetch(`${BASE_URL}/secrets/reveal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      secret_id: secretId,
      vault_key: vaultKey,
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
let expired = 0;

secrets.forEach((secret) => {

  // Ignore revoked secrets completely
  if (secret.status?.toLowerCase() !== "active") {
    return;
  }

  if (!secret.expires_at) {
    active++;
    return;
  }

  const expiry = new Date(secret.expires_at);

  const diffDays =
    (expiry - now) /
    (1000 * 60 * 60 * 24);

  if (diffDays > 0) {
    active++;

    if (diffDays <= 7) {
      expiring++;
    }

  } else {
    expired++;
  }

});
  

  

  return {
    total: secrets.length,
    active,
    expired,
    expiring,
    };
}

// INITIALIZE VAULT

export async function initializeVault(mode, vaultKey, token) {
  const res = await fetch(`${BASE_URL}/vault/initialize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      mode,
      vault_key: vaultKey,
    }),
  });

  if (!res.ok) {
    throw await res.json();
  }

  return await res.json();
}

export async function getVaultStatus(token) {
  const response = await fetch(`${BASE_URL}/vault/status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(response);
}

// ROTATE VAULT KEY (change key WITHOUT deleting secrets — re-encrypts them)

export async function rotateVaultKey(currentVaultKey, mode, newVaultKey, token) {
  const response = await fetch(`${BASE_URL}/vault/rotate-key`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      mode,
      current_vault_key: currentVaultKey,
      new_vault_key: newVaultKey,
    }),
  });

  return parseResponse(response);
}

// RESET VAULT (required before setting a new Vault Key — wipes all secrets)

export async function resetVault(vaultKey, token) {
  const response = await fetch(`${BASE_URL}/vault/reset`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      vault_key: vaultKey,
    }),
  });

  return parseResponse(response);
}

// OWNER PROFILE

export async function getMyProfile(token) {
  const response = await fetch(`${BASE_URL}/owners/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(response);
}

// FORCE RESET VAULT (Forgot Vault Key — no key verification, wipes everything)

export async function forceResetVault(token) {
  const response = await fetch(`${BASE_URL}/vault/force-reset`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(response);
}