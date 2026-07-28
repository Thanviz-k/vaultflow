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

  <div className="secret-left">

    <div className="secret-icon">
      {getSecretIcon(secret.type)}
    </div>

    <div className="secret-info">

      <h3 className="secret-title">
        {secret.name}
      </h3>

      <span className="secret-type">
        {secret.type || "Secret"}
      </span>

    </div>

  </div>

  <div className="secret-center">

    <div
      className={`secret-status status-${secret.status?.toLowerCase()}`}
    >
      <span className="status-dot"></span>
      {secret.status}
    </div>

    <div className="secret-meta">

      <div className="secret-date">
        <small>Expires</small>
        <strong>{formatDate(secret.expires_at)}</strong>
      </div>

      <div className="secret-date">
        <small>Created</small>
        <strong>
          {secret.created_at
            ? formatDate(secret.created_at)
            : "Unknown"}
        </strong>
      </div>

    </div>

  </div>

  <div className="secret-actions">

    <button
      title="Reveal Secret"
      className="action-btn reveal-btn"
      disabled={secret.status?.toLowerCase() === "revoked"}
      onClick={() => {

        if (secret.status?.toLowerCase() === "revoked") {
          toast.error("This secret has been revoked.");
          return;
        }

        setShowReveal(true);

      }}
    >
      <Eye size={18} />
    </button>

    <button
      title="Edit Secret"
      className="action-btn edit-btn"
      disabled={secret.status?.toLowerCase() === "revoked"}
      onClick={() => {

        if (secret.status?.toLowerCase() === "revoked") {
          toast.error("Revoked secrets cannot be edited.");
          return;
        }

        setShowEdit(true);

      }}
    >
      <Pencil size={18} />
    </button>

    <button
      title="Revoke Secret"
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
    </button>

    <button
      title="Delete Secret"
      className="action-btn delete-btn"
      onClick={() => setShowDeleteConfirm(true)}
    >
      <Trash2 size={18} />
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