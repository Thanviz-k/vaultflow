import { calculateStrength } from "../../utils/passwordStrength";

function PasswordChecklist({ value = "" }) {

  const { checks } =
    calculateStrength(value);

  const rules = [

    {
      ok: checks.length,
      text: "Minimum 12 characters",
    },

    {
      ok: checks.upper,
      text: "One uppercase letter",
    },

    {
      ok: checks.lower,
      text: "One lowercase letter",
    },

    {
      ok: checks.number,
      text: "One number",
    },

    {
      ok: checks.special,
      text: "One special character",
    },

  ];

  return (

    <div className="password-checklist">

      {

        rules.map((rule) => (

          <div
            key={rule.text}
            className="check-item"
          >

            <span>

              {

                rule.ok

                  ? "✅"

                  : "⬜"

              }

            </span>

            <span>

              {rule.text}

            </span>

          </div>

        ))

      }

    </div>

  );

}

export default PasswordChecklist;