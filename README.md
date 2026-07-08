# VaultFlow

VaultFlow is a secure secrets management application for creating, storing, monitoring, querying, revealing, and revoking sensitive values such as API keys, database passwords, access tokens, and application credentials.

## Features

- User registration and JWT-based authentication
- Owner-specific secret isolation
- Encrypted secret-value storage
- Split-key verification using server half and client half
- Secure secret reveal flow
- Automatic secret expiry
- Secret revocation
- Audit logging
- Dashboard statistics, filters, and search
- AI natural-language queries
- AI activity summaries
- Markdown report generation

## Tech Stack

### Backend

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic
- JWT Authentication
- PostgreSQL encryption functions

### Frontend

- React
- Vite
- React Router
- CSS
- Fetch API

## Architecture

```text
React Frontend
      |
      | HTTP + JWT
      v
FastAPI Backend
      |
      +----------------------+
      |                      |
      v                      v
Authentication         AI Services
      |                      |
      v                      v
Secret Services       Query / Summary
      |
      v
SQLAlchemy ORM
      |
      v
PostgreSQL
```

## Database Model

VaultFlow uses three main entities:

### Owner

Represents a registered VaultFlow user.

One owner can have many secrets.

### Secret

Represents a protected secret record.

Important fields include:

- id
- name
- owner_id
- encrypted_value
- server_half
- key_hash
- status
- created_at
- expires_at
- last_accessed_at

### Audit Log

Records important secret lifecycle actions such as:

- created
- verified
- revealed
- reveal_failed
- revoked
- expired

## Secret Creation Flow

```text
User enters secret value
        |
        v
Backend generates random full key
        |
        v
Full key is split into two halves
        |
        +--> Server Half -> encrypted and stored
        |
        +--> Client Half -> returned to user
        |
        v
Secret value is encrypted and stored
```

The user must keep the client half securely.

## Secret Reveal Flow

```text
User selects active secret
        |
        v
User provides client half
        |
        v
Backend verifies ownership
        |
        v
Backend checks secret status
        |
        v
Server half is decrypted
        |
        v
Server half + client half are verified
        |
        v
Secret value is decrypted
        |
        v
Actual secret value is returned
```

Expired and revoked secrets cannot be revealed.

## Secret Lifecycle

```text
ACTIVE
  |
  +------ expiry time reached ------> EXPIRED
  |
  +------ user revokes -------------> REVOKED
```

A background decay worker periodically checks for overdue active secrets and marks them as expired.

## AI Query System

VaultFlow supports natural-language questions such as:

```text
Show me all active secrets

How many revoked secrets do I have?

Show all expired secrets

Show secrets expiring within 7 days

List all my secrets
```

The AI converts the question into structured intent.

Example:

```json
{
  "action": "list_secrets",
  "status_filter": "active",
  "expiring_within_days": null
}
```

The backend uses the intent to query only the authenticated owner's secrets.

## AI Activity Summary

Users can generate activity summaries for:

- Last 1 day
- Last 7 days
- Last 15 days
- Last 30 days

The Reports page also supports AI queries and Markdown report generation.

## Main API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/owners/` | Register owner |
| POST | `/auth/login` | Login and receive JWT |
| POST | `/secrets/` | Create secret |
| GET | `/secrets/mine` | List owner's secrets |
| POST | `/secrets/verify` | Verify secret key |
| POST | `/secrets/reveal` | Reveal secret value |
| POST | `/secrets/revoke` | Revoke secret |
| POST | `/secrets/query` | Run AI natural-language query |
| GET | `/secrets/summary` | Generate activity summary |

## Project Structure

```text
vaultflow/
├── alembic/
├── app/
│   ├── core/
│   ├── models/
│   ├── routers/
│   ├── schemas/
│   ├── services/
│   └── main.py
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── alembic.ini
├── requirements.txt
└── README.md
```

## Run the Backend

```bash
cd vaultflow

source venv/bin/activate

alembic upgrade head

uvicorn app.main:app --reload
```

## Run the Frontend

Open another terminal:

```bash
cd vaultflow/frontend

npm install

npm run dev
```

## Testing Flow

1. Register a user.
2. Log in.
3. Create a secret.
4. Save the generated client half.
5. Confirm the secret appears on the dashboard.
6. Test reveal with an incorrect client half.
7. Reveal using the correct client half.
8. Test dashboard search and filters.
9. Revoke a secret.
10. Confirm the revoked secret cannot be revealed.
11. Test AI queries.
12. Generate an activity summary.
13. Test automatic expiry.

## Security Notes

VaultFlow is an educational and portfolio project. A production-grade secrets manager would additionally require:

- Secure environment-based JWT configuration
- Strict production CORS rules
- HTTPS
- Rate limiting
- Secret rotation
- Managed KMS or HSM integration
- Secure recovery policies
- Automated security testing
- Deployment hardening and monitoring

## Future Improvements

- Secret versioning
- Automatic secret rotation
- Role-based access control
- Fine-grained permissions
- Expiry notifications
- Usage analytics
- Cloud KMS integration
- Docker deployment
- Automated backend and frontend tests

## Summary

```text
Authenticate
    ↓
Create Secret
    ↓
Encrypt and Store
    ↓
Monitor Status
    ↓
Query with AI
    ↓
Verify Client Half
    ↓
Reveal When Authorized
    ↓
Revoke or Expire
    ↓
Record Audit Events
```

VaultFlow demonstrates secure secret lifecycle management, owner isolation, encrypted storage, audit logging, and AI-assisted secret management.
