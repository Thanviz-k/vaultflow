export function calculateStrength(text = "") {

  let score = 0;

  const checks = {

    length:
      text.length >= 12,

    upper:
      /[A-Z]/.test(text),

    lower:
      /[a-z]/.test(text),

    number:
      /\d/.test(text),

    special:
      /[^A-Za-z0-9]/.test(text),

  };

  Object.values(checks).forEach((ok) => {

    if (ok) score++;

  });

  return {

    score,

    checks,

  };

}