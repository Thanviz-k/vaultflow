function Alert({

  type = "info",

  children,

}) {

  return (

    <div
      className={`alert alert-${type}`}
    >

      <span>

        {

          type === "success"

            ? "✅"

            : type === "error"

            ? "❌"

            : type === "warning"

            ? "⚠️"

            : "ℹ️"

        }

      </span>

      <span>

        {children}

      </span>

    </div>

  );

}

export default Alert;