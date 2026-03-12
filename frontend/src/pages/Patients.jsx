import { useEffect, useState } from "react";
import { getPatients, createPatient, deletePatient } from "../services/api";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ name: "", age: "", device_id: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => getPatients().then(p => { setPatients(p); setLoading(false); });
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.name || !form.device_id) return setError("Name and Device ID are required");
    try {
      await createPatient(form);
      setForm({ name: "", age: "", device_id: "" });
      setError("");
      load();
    } catch (e) {
      setError(e.response?.data?.error || "Failed to add patient");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this patient?")) return;
    await deletePatient(id);
    load();
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold text-text">Patients</h2>

      {/* Add patient form */}
      <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Add Patient</h3>
        <div className="grid grid-cols-3 gap-3">
          <input
            className="bg-bg border border-border rounded-lg px-3 py-2 text-text text-sm"
            placeholder="Patient name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="bg-bg border border-border rounded-lg px-3 py-2 text-text text-sm"
            placeholder="Age"
            type="number"
            value={form.age}
            onChange={e => setForm({ ...form, age: e.target.value })}
          />
          <input
            className="bg-bg border border-border rounded-lg px-3 py-2 text-text text-sm"
            placeholder="Device ID (e.g. DEVICE-002)"
            value={form.device_id}
            onChange={e => setForm({ ...form, device_id: e.target.value })}
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          onClick={handleAdd}
          className="bg-primary hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Add Patient
        </button>
      </div>

      {/* Patient list */}
      {loading ? <p className="text-muted">Loading...</p> : (
        <div className="space-y-3">
          {patients.map(p => (
            <div key={p.id} className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-text">{p.name}</p>
                <p className="text-muted text-xs">Age: {p.age ?? "—"} · Device: {p.device_id}</p>
                <p className="text-muted text-xs">Added: {new Date(p.created_at).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => handleDelete(p.id)}
                className="text-muted hover:text-red-400 text-sm transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
