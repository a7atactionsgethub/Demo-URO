import { useEffect, useState } from "react";
import { getReadings, getPatients } from "../services/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function History() {
  const [readings, setReadings] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPatients().then(p => {
      setPatients(p);
      if (p.length > 0) setSelectedPatient(String(p[0].id));
    });
  }, []);

  useEffect(() => {
    if (!selectedPatient) return;
    setLoading(true);
    getReadings({ patient_id: selectedPatient, limit: 30 }).then(data => {
      setReadings(data.reverse()); // oldest first for chart
      setLoading(false);
    });
  }, [selectedPatient]);

  const chartData = readings.map(r => ({
    time: new Date(r.timestamp).toLocaleTimeString(),
    pH: r.ph,
    Glucose: r.glucose,
    "P/C Ratio": r.protein_creatinine,
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text">Reading History</h2>
        <select
          className="bg-surface border border-border rounded-lg px-3 py-2 text-text text-sm"
          value={selectedPatient}
          onChange={e => setSelectedPatient(e.target.value)}
        >
          {patients.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : readings.length === 0 ? (
        <p className="text-muted">No readings found for this patient.</p>
      ) : (
        <div className="bg-surface border border-border rounded-xl p-5">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 11 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }} />
              <Legend />
              <Line type="monotone" dataKey="pH" stroke="#0ea5e9" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="Glucose" stroke="#f59e0b" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="P/C Ratio" stroke="#a855f7" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border">
            <tr className="text-muted text-left">
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">pH</th>
              <th className="px-4 py-3">Glucose</th>
              <th className="px-4 py-3">P/C Ratio</th>
              <th className="px-4 py-3">Nitrites</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {[...readings].reverse().map(r => (
              <tr key={r.id} className="border-b border-border/50 hover:bg-white/5">
                <td className="px-4 py-3 text-muted text-xs">{new Date(r.timestamp).toLocaleString()}</td>
                <td className="px-4 py-3">{r.ph ?? "—"}</td>
                <td className="px-4 py-3">{r.glucose ?? "—"}</td>
                <td className="px-4 py-3">{r.protein_creatinine ?? "—"}</td>
                <td className="px-4 py-3">{r.nitrites ? <span className="text-red-400">Positive</span> : <span className="text-green-400">Negative</span>}</td>
                <td className="px-4 py-3">
                  {r.alert_triggered
                    ? <span className="text-red-400 text-xs">⚠ Alert</span>
                    : <span className="text-green-400 text-xs">✓ Normal</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
