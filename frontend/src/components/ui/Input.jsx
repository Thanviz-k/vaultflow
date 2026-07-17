function Input({
  label,
  error,
  className = "",
  ...props
}) {
  return (
    <div className={`input-group ${className}`}>

      {label && (
        <label>{label}</label>
      )}

      <input
        {...props}
      />

      {error && (
        <small className="input-error">
          {error}
        </small>
      )}

    </div>
  );
}

export default Input;