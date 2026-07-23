import { useState } from "react";
import {Eye,Pencil,Ban,Trash2,KeyRound,Shield,Database,Globe,Lock,} from "lucide-react";

import {revokeSecret,deleteSecret,} from "../../api";
import VaultKeyModal from "../dashboard/VaultKeyModal";
import RevealSecretModal from "./RevealSecretModal";
import EditSecretModal from "./EditSecretModal";
import ConfirmDialog from "../ui/ConfirmDialog";
import toast from "react-hot-toast";
import { formatDate } from "../../utils/formatDate";

function SecretCard({
  secret,
  token,
  onRefresh,
}) {
  const [showReveal, setShowReveal] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showVaultKey, setShowVaultKey] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [showDeleteVaultKey, setShowDeleteVaultKey] = useState(false);

  async function handleRevoke(vaultKey) {
  try {
    await revokeSecret(
      secret.id,
      vaultKey,
      token
    );

    setShowVaultKey(false);
    setShowConfirm(false);

    onRefresh();

  } catch (err) {
    toast.error(err.message);
  }
}

async function handleDelete(vaultKey) {
    try {
        await deleteSecret(
            secret.id,
            vaultKey,
            token,
        );

        setShowDeleteVaultKey(false);
        setShowDeleteConfirm(false);

        onRefresh();

    } catch (err) {
        toast.error(err.message);
    }
}
function getSecretIcon(type = "") {
  switch (type.toLowerCase()) {
    case "password":
      return <KeyRound size={24} />;

    case "api":
    case "api key":
      return <Shield size={24} />;

    case "database":
      return <Database size={24} />;

    case "website":
      return <Globe size={24} />;

    default:
      return <Lock size={24} />;
  }
}

return (
  <>
    <div className="secret-card">

      <div className="secret-card-top">

        <div className="secret-identity">

          <div className="secret-icon">
            <Lock size={24} />
            </div>

          <div>
            <span className="secret-label">
              SECRET
            </span>

            <h3>{secret.name}</h3>
          </div>

        </div>

        <div
          className={`secret-status status-${secret.status?.toLowerCase()}`}
        >
          <span className="status-dot"></span>
          {secret.status}
        </div>

      </div>

      <div className="secret-divider"></div>

      <div className="secret-metadata">

        <div>
          <span>EXPIRES</span>
          <strong>{formatDate(secret.expires_at)}</strong>
        </div>

        <div>
          <span>CREATED</span>
          <strong>
            {secret.created_at
              ? formatDate(secret.created_at)
              : "Unknown"}
          </strong>
        </div>

      </div>

      <div className="secret-actions">

        {/* Reveal */}

        <button
          className="action-btn reveal-btn"
          disabled={secret.status?.toLowerCase() === "revoked"}
          onClick={() => {

            if (secret.status?.toLowerCase() === "revoked") {
              toast.error(
                "This secret has been revoked."
              );
              return;
            }

            setShowReveal(true);

          }}
        >
          <Eye size={18} />
          Reveal
        </button>

        {/* Edit */}

        <button
          className="action-btn edit-btn"
          disabled={secret.status?.toLowerCase() === "revoked"}
          onClick={() => {

            if (secret.status?.toLowerCase() === "revoked") {
              toast.error(
                "Revoked secrets cannot be edited."
              );
              return;
            }

            setShowEdit(true);

          }}
        >
          <Pencil size={18} />
          Edit
        </button>

        {/* Revoke */}

        <button
          className="action-btn revoke-btn"
          disabled={secret.status?.toLowerCase() === "revoked"}
          onClick={() => {

            if (secret.status?.toLowerCase() === "revoked") {
              toast.error("Already revoked.");
              return;
            }

            setShowConfirm(true);

          }}
        >
          <Ban size={18} />
          Revoke
        </button>

        {/* Delete */}

        <button
          className="action-btn delete-btn"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 size={18} />
          Delete
        </button>

      </div>

    </div>

    {showReveal && (
      <RevealSecretModal
        token={token}
        secret={secret}
        onClose={() => setShowReveal(false)}
      />
    )}

    {showEdit && (
      <EditSecretModal
        secret={secret}
        token={token}
        onClose={() => setShowEdit(false)}
        onSuccess={() => {
          setShowEdit(false);
          onRefresh();
        }}
      />
    )}

    {showConfirm && (
      <ConfirmDialog
        title="Revoke Secret"
        message="Are you sure you want to revoke this secret?"
        onConfirm={() => {
          setShowConfirm(false);
          setShowVaultKey(true);
        }}
        onCancel={() => setShowConfirm(false)}
      />
    )}

    {showDeleteVaultKey && (
      <VaultKeyModal
        title="Delete Secret"
        onSubmit={handleDelete}
        onCancel={() => setShowDeleteVaultKey(false)}
      />
    )}

    {showVaultKey && (
      <VaultKeyModal
        title="Verify Vault Key"
        onSubmit={handleRevoke}
        onCancel={() => setShowVaultKey(false)}
      />
    )}

    {showDeleteConfirm && (
      <ConfirmDialog
        title="Delete Secret"
        message="This action is permanent. Continue?"
        onConfirm={() => {
          setShowDeleteConfirm(false);
          setShowDeleteVaultKey(true);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    )}
  </>
);
}

export default SecretCard;