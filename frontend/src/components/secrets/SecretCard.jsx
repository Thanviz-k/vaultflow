import { useState } from "react";
import { Eye, Pencil, Ban } from "lucide-react";

import { revokeSecret } from "../../api";

import RevealSecretModal from "./RevealSecretModal";
import SecretForm from "../SecretForm";
import ConfirmDialog from "../ui/ConfirmDialog";

function SecretCard({

  secret,

  token,

  refresh,

}) {

  const [showReveal, setShowReveal] = useState(false);

  const [showEdit, setShowEdit] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

  async function handleRevoke() {

    try {

      await revokeSecret(
        secret.id,
        token
      );

      setShowConfirm(false);

      refresh();

    } catch (err) {

      alert(err.message);

    }

  }

  return (

    <>

      <div className="secret-card">

        <div className="secret-header">

          <div>

            <h3>

              {secret.name}

            </h3>

            <p>

              Expires: {secret.expires_at}

            </p>

          </div>

          <span
            className={`status-badge ${secret.status?.toLowerCase()}`}
          >

            {secret.status}

          </span>

        </div>

        <div className="secret-actions">

          <button
            onClick={() => setShowReveal(true)}
          >

            <Eye size={18} />

            Reveal

          </button>

          <button
            onClick={() => setShowEdit(true)}
          >

            <Pencil size={18} />

            Edit

          </button>

          <button
            onClick={() => setShowConfirm(true)}
          >

            <Ban size={18} />

            Revoke

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

        <SecretForm
          token={token}
          secret={secret}
          onSuccess={() => {

            setShowEdit(false);

            refresh();

          }}
          onCancel={() => setShowEdit(false)}
        />

      )}

      {showConfirm && (

        <ConfirmDialog
          title="Revoke Secret"
          message="Are you sure you want to revoke this secret?"
          onConfirm={handleRevoke}
          onCancel={() => setShowConfirm(false)}
        />

      )}

    </>

  );

}

export default SecretCard;