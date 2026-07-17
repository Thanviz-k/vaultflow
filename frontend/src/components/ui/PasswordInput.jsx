import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function PasswordInput({
  label,
  error,
  className = "",
  ...props
}) {

  const [show, setShow] = useState(false);

  return (

    <div className={`input-group ${className}`}>

      {label && (
        <label>{label}</label>
      )}

      <div className="password-wrapper">

        <input
          {...props}
          type={show ? "text" : "password"}
        />

        <button
          type="button"
          className="password-toggle"
          onClick={() => setShow(!show)}
        >

          {show ? (
            <EyeOff size={20} />
          ) : (
            <Eye size={20} />
          )}

        </button>

      </div>

      {error && (
        <small className="input-error">
          {error}
        </small>
      )}

    </div>

  );

}

export default PasswordInput;