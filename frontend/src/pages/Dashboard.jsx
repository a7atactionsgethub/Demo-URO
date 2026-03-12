import { useEffect, useState } from "react";
import { getLatestReadings, getAlertCount } from "../services/api";

const MARKER_RANGES = {
  ph: { min: 4.5, max: 8.0, unit: "" },
  glucose: { min: 0, max: 0.8, unit: "mmol/L" },
  protein_creatinine: { min: 0, max: 30, unit: "mg/g" },
};

function StatusBadge({ alert }) {
  return alert ? (
    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
      ⚠ Alert
    </span>
  ) : (
    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
      ✓ Normal
    </span>
  );
}

function MarkerCard({ label, value, unit, min, max }) {
  const isOff = value !== null && value !== undefined && (value < min || value > max);
  return (
    <div className={`rounded-lg p-3 border ${isOff ? "border-red-500/40 bg-red-500/5" : "border-border bg-surface"}`}>
      <p className="text-muted text-xs mb-1">{label}</p>
      <p className={`text-xl font-bold ${isOff ? "text-red-400" : "text-text"}`}>
        {value !== null && value !== undefined ? `${value} ${unit}` : "—"}
      </p>
      <p className="text-muted text-xs">Normal: {min}–{max} {unit}</p>
    </div>
  );
}

export default function Dashboard() {
  const [readings, setReadings] = useState([]);
  const [alertCount, setAlertCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [r, a] = await Promise.all([getLatestReadings(), getAlertCount()]);
      setReadings(r);
      setAlertCount(a.count);
      setLoading(false);
    }
    load();
    const interval = setInterval(load, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-muted p-8">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-muted text-sm">Total Patients</p>
          <p className="text-3xl font-bold text-primary">{readings.length}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-muted text-sm">Active Alerts</p>
          <p className="text-3xl font-bold text-danger">{alertCount}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-muted text-sm">Normal Readings</p>
          <p className="text-3xl font-bold text-success">
            {readings.filter(r => !r.alert_triggered).length}
          </p>
        </div>
      </div>

      {/* Patient cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-text">Latest Readings</h2>
        {readings.length === 0 && (
          <p className="text-muted">No readings yet. Waiting for IoT device data...</p>
        )}
        {readings.map(r => (
          <div key={r.id} className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-text">{r.patient_name}</h3>
                <p className="text-muted text-xs">{r.device_id} · {new Date(r.timestamp).toLocaleString()}</p>
              </div>
              <StatusBadge alert={r.alert_triggered} />
            </div>
            <div className="grid grid-cols-4 gap-3">
              <MarkerCard label="pH" value={r.ph} unit="" min={4.5} max={8.0} />
              <MarkerCard label="Glucose" value={r.glucose} unit="mmol/L" min={0} max={0.8} />
              <MarkerCard label="Protein/Creatinine" value={r.protein_creatinine} unit="mg/g" min={0} max={30} />
              <div className={`rounded-lg p-3 border ${r.nitrites ? "border-red-500/40 bg-red-500/5" : "border-border bg-surface"}`}>
                <p className="text-muted text-xs mb-1">Nitrites</p>
                <p className={`text-xl font-bold ${r.nitrites ? "text-red-400" : "text-green-400"}`}>
                  {r.nitrites ? "Positive" : "Negative"}
                </p>
              </div>
            </div>
            {r.alert_triggered && r.alert_reasons && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">⚠ {r.alert_reasons}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
