import Button from "./Button";

function ConfirmDialog({

  title,

  message,

  onConfirm,

  onCancel,

}) {

  return (

    <div className="modal-overlay">

      <div className="modal">

        <h2>{title}</h2>

        <p>{message}</p>

        <div className="confirm-actions">

          <Button
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>

          <Button
            onClick={onConfirm}
          >
            Confirm
          </Button>

        </div>

      </div>

    </div>

  );

}

export default ConfirmDialog;