// Alert thresholds — easy to extend per-patient later
const THRESHOLDS = {
  ph: { min: 4.5, max: 8.0 },
  glucose: { max: 0.8 },           // mmol/L
  protein_creatinine: { max: 30 }, // mg/g
  nitrites: { value: 1 },          // 1 = positive (bad)
};

function checkAlerts(reading) {
  const reasons = [];

  if (reading.ph !== null && reading.ph !== undefined) {
    if (reading.ph < THRESHOLDS.ph.min)
      reasons.push(`pH too low (${reading.ph} < ${THRESHOLDS.ph.min})`);
    if (reading.ph > THRESHOLDS.ph.max)
      reasons.push(`pH too high (${reading.ph} > ${THRESHOLDS.ph.max})`);
  }

  if (reading.glucose !== null && reading.glucose !== undefined) {
    if (reading.glucose > THRESHOLDS.glucose.max)
      reasons.push(`Glucose elevated (${reading.glucose} > ${THRESHOLDS.glucose.max} mmol/L)`);
  }

  if (reading.protein_creatinine !== null && reading.protein_creatinine !== undefined) {
    if (reading.protein_creatinine > THRESHOLDS.protein_creatinine.max)
      reasons.push(`Protein/Creatinine elevated (${reading.protein_creatinine} > ${THRESHOLDS.protein_creatinine.max} mg/g)`);
  }

  if (reading.nitrites === 1 || reading.nitrites === true) {
    reasons.push("Nitrites positive — possible bacterial infection");
  }

  return {
    alert_triggered: reasons.length > 0 ? 1 : 0,
    alert_reasons: reasons.join("; "),
  };
}

module.exports = { checkAlerts, THRESHOLDS };
