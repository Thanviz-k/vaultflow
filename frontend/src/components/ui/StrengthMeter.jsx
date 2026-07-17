import ProgressBar from "./ProgressBar";
import { calculateStrength } from "../../utils/passwordStrength";

function StrengthMeter({

  value = "",

}) {

  const { score } =
    calculateStrength(value);

  let label = "😟 Weak";

  let color = "#EF4444";

  let percent = 20;

  if (score >= 3) {

    label = "🙂 Medium";

    color = "#F59E0B";

    percent = 60;

  }

  if (score === 5) {

    label = "😎 Strong";

    color = "#22C55E";

    percent = 100;

  }

  return (

    <div className="strength-meter">

      <div className="strength-header">

        <span>

          Strength

        </span>

        <strong
          style={{
            color,
          }}
        >

          {label}

        </strong>

      </div>

      <ProgressBar

        percent={percent}

        color={color}

      />

    </div>

  );

}

export default StrengthMeter;