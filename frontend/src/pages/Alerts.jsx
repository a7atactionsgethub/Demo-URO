import { useEffect, useState } from "react";
import { getAlerts } from "../services/api";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAlerts({ limit: 100 }).then(data => {
      setAlerts(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-muted p-8">Loading...</div>;

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold text-text">Alert History</h2>
      {alerts.length === 0 && (
        <p className="text-muted">No alerts triggered yet. All readings are normal.</p>
      )}
      <div className="space-y-3">
        {alerts.map(a => (
          <div key={a.id} className="bg-surface border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-text">{a.patient_name}</span>
              <span className="text-muted text-xs">{new Date(a.timestamp).toLocaleString()}</span>
            </div>
            <p className="text-red-400 text-sm">⚠ {a.alert_reasons}</p>
            <div className="mt-2 grid grid-cols-4 gap-2 text-xs text-muted">
              <span>pH: {a.ph ?? "—"}</span>
              <span>Glucose: {a.glucose ?? "—"}</span>
              <span>P/C: {a.protein_creatinine ?? "—"}</span>
              <span>Nitrites: {a.nitrites ? "Positive" : "Negative"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
