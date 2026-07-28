import { useState } from "react";
import {
  Eye,
  Pencil,
  Ban,
  Trash2,
  KeyRound,
  Shield,
  Database,
  Globe,
  Lock,
} from "lucide-react";

import { revokeSecret, deleteSecret } from "../../api";
import VaultKeyModal from "../dashboard/VaultKeyModal";
import RevealSecretModal from "./RevealSecretModal";
import EditSecretModal from "./EditSecretModal";
import ConfirmDialog from "../ui/ConfirmDialog";
import toast from "react-hot-toast";
import { formatDate } from "../../utils/formatDate";

function SecretCard({ secret, token, onRefresh }) {
  const [showReveal, setShowReveal] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showVaultKey, setShowVaultKey] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteVaultKey, setShowDeleteVaultKey] = useState(false);

  const status = secret.status?.toLowerCase();

  async function handleRevoke(vaultKey) {
    try {
      await revokeSecret(secret.id, vaultKey, token);
      setShowVaultKey(false);
      setShowConfirm(false);
      onRefresh();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDelete(vaultKey) {
    try {
      await deleteSecret(secret.id, vaultKey, token);
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
        return <KeyRound size={26} />;
      case "api":
      case "api key":
        return <Shield size={26} />;
      case "database":
        return <Database size={26} />;
      case "website":
        return <Globe size={26} />;
      default:
        return <Lock size={26} />;
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
            <h3 className="secret-title">{secret.name}</h3>
            <span className="secret-type">{secret.type || "Secret"}</span>
          </div>
        </div>

        <div className="secret-center">
          <div className="secret-meta">
            <div className="secret-date">
              <small>EXPIRES</small>
              <strong>{formatDate(secret.expires_at) || "Never"}</strong>
            </div>

            <div className="secret-date">
              <small>CREATED</small>
              <strong>
                {secret.created_at ? formatDate(secret.created_at) : "Unknown"}
              </strong>
            </div>
          </div>

          <div className={`secret-status status-${status}`}>
            <span className="status-dot"></span>
            {secret.status}
          </div>
        </div>

        <div className="secret-actions">
          <button
            className="action-btn reveal-btn"
            title="Reveal"
            disabled={status === "revoked"}
            onClick={() => {
              if (status === "revoked") {
                toast.error("This secret has been revoked.");
                return;
              }
              setShowReveal(true);
            }}
          >
            <Eye size={18} />
          </button>

          <button
            className="action-btn edit-btn"
            title="Edit"
            disabled={status === "revoked"}
            onClick={() => {
              if (status === "revoked") {
                toast.error("Revoked secrets cannot be edited.");
                return;
              }
              setShowEdit(true);
            }}
          >
            <Pencil size={18} />
          </button>

          <button
            className="action-btn revoke-btn"
            title="Revoke"
            disabled={status === "revoked"}
            onClick={() => {
              if (status === "revoked") {
                toast.error("Already revoked.");
                return;
              }
              setShowConfirm(true);
            }}
          >
            <Ban size={18} />
          </button>

          <button
            className="action-btn delete-btn"
            title="Delete"
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
