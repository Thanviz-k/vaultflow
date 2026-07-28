function Alert({

  type = "info",

  children,

}) {

  const cssType = type === "error" ? "danger" : type;

  return (

    <div
      className={`alert alert-${cssType}`}
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