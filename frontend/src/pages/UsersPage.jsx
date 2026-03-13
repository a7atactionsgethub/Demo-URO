import { useState, useEffect } from "react";
import api from "../services/api";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "user",
    name: "",
    age: "",
    device_id: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const load = () => {
    api.get("/auth/users")
      .then(r => setUsers(r.data))
      .catch(err => console.error("Failed to load users", err));
  };
  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setEditingUser(null);
    setForm({ username: "", password: "", role: "user", name: "", age: "", device_id: "" });
    setError("");
    setSuccess("");
    setShowPassword(false);
  };

  const handleAdd = async () => {
    if (!form.username || !form.password) return setError("Username and password required");
    try {
      await api.post("/auth/users", form);
      setSuccess("User created successfully");
      resetForm();
      load();
    } catch (e) {
      setError(e.response?.data?.error || "Failed to create user");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this user?")) return;
    try {
      await api.delete(`/auth/users/${id}`);
      load();
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({
      username: user.username,
      password: "",
      role: user.role,
      name: user.name || "",
      age: user.age || "",
      device_id: user.device_id || ""
    });
    setError("");
    setSuccess("");
    setShowPassword(false);
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    try {
      const payload = {};
      if (form.name !== (editingUser.name || "")) payload.name = form.name;
      if (form.age !== (editingUser.age || "")) payload.age = form.age;
      if (form.device_id !== (editingUser.device_id || "")) payload.device_id = form.device_id;
      if (form.role !== editingUser.role) payload.role = form.role;
      if (form.password.trim() !== "") payload.password = form.password;

      if (Object.keys(payload).length === 0) {
        setError("No changes made");
        return;
      }

      await api.put(`/auth/users/${editingUser.id}`, payload);
      setSuccess("User updated successfully");
      resetForm();
      load();
    } catch (e) {
      console.error("Update error:", e.response?.data || e.message);
      setError(e.response?.data?.error || "Update failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Add / Edit User Card */}
      <div className="medical-card p-5 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <i className="fas fa-user-plus text-blue-600"></i>
          {editingUser ? `Edit User: ${editingUser.username}` : "Add New User"}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
              <i className="fas fa-user text-gray-400 text-xs"></i> Username
            </label>
            <input
              className="input-field"
              placeholder="Username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              disabled={!!editingUser}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
              <i className="fas fa-lock text-gray-400 text-xs"></i>
              {editingUser ? "New Password (optional)" : "Password"}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="input-field pr-10"
                placeholder={editingUser ? "Leave blank to keep" : "Password"}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                <i className={`fas fa-eye${showPassword ? '' : '-slash'}`}></i>
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
              <i className="fas fa-tag text-gray-400 text-xs"></i> Role
            </label>
            <select
              className="input-field"
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
            >
              <option value="user">User (Patient)</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {form.role === "user" && (
            <>
              <div>
                <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <i className="fas fa-id-card text-gray-400 text-xs"></i> Full Name
                </label>
                <input
                  className="input-field"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <i className="fas fa-calendar-alt text-gray-400 text-xs"></i> Age
                </label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="Age"
                  value={form.age}
                  onChange={e => setForm({ ...form, age: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <i className="fas fa-microchip text-gray-400 text-xs"></i> Device ID
                </label>
                <input
                  className="input-field"
                  placeholder="Device ID"
                  value={form.device_id}
                  onChange={e => setForm({ ...form, device_id: e.target.value })}
                />
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded">
            <i className="fas fa-check-circle"></i>
            <span>{success}</span>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          {editingUser ? (
            <>
              <button onClick={handleUpdate} className="btn-primary flex items-center gap-2">
                <i className="fas fa-save"></i> Update User
              </button>
              <button onClick={resetForm} className="btn-outline flex items-center gap-2">
                <i className="fas fa-times"></i> Cancel
              </button>
            </>
          ) : (
            <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
              <i className="fas fa-plus"></i> Add User
            </button>
          )}
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {users.map(u => (
          <div key={u.id} className="medical-card p-4 flex items-center justify-between hover:shadow-md transition">
            <div>
              <p className="font-medium text-gray-800 flex items-center gap-2">
                <i className={`fas ${u.role === 'admin' ? 'fa-crown text-amber-500' : 'fa-user text-blue-500'}`}></i>
                {u.username}
              </p>
              <p className="text-gray-500 text-xs flex items-center gap-1">
                {u.role === "admin" ? (
                  <span className="flex items-center gap-1"><i className="fas fa-shield-alt"></i> Admin</span>
                ) : (
                  <>
                    <span className="flex items-center gap-1"><i className="fas fa-user"></i> Patient</span>
                    {u.name && (
                      <>
                        <span className="mx-1">·</span>
                        <span><i className="fas fa-id-card"></i> {u.name}</span>
                      </>
                    )}
                    {u.age && (
                      <>
                        <span className="mx-1">·</span>
                        <span><i className="fas fa-calendar"></i> {u.age} yrs</span>
                      </>
                    )}
                    {u.device_id && (
                      <>
                        <span className="mx-1">·</span>
                        <span><i className="fas fa-microchip"></i> {u.device_id}</span>
                      </>
                    )}
                  </>
                )}
                <span className="mx-1">·</span>
                <span><i className="far fa-clock"></i> Added {new Date(u.created_at).toLocaleDateString()}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(u)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded border border-blue-200 hover:border-blue-400 transition flex items-center gap-1"
              >
                <i className="fas fa-pen"></i> Edit
              </button>
              <button
                onClick={() => handleDelete(u.id)}
                className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded border border-red-200 hover:border-red-400 transition flex items-center gap-1"
              >
                <i className="fas fa-trash"></i> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}