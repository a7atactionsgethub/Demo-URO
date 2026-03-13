const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../db/database");

const SECRET = process.env.JWT_SECRET || "urosense-secret-key";

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Username and password required" });

  const user = db.get("SELECT * FROM users WHERE username = ?", [username]);
  if (!user) return res.status(401).json({ error: "Invalid username or password" });

  // Direct string comparison (no bcrypt)
  if (password !== user.password) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    SECRET,
    { expiresIn: "12h" }
  );
  res.json({
    token,
    username: user.username,
    role: user.role,
    user_id: user.id
  });
});

// GET /api/auth/users — admin only
router.get("/users", require("../middleware/auth").auth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin only" });

  const users = db.all(`
    SELECT id, username, role, name, age, device_id, created_at
    FROM users
    ORDER BY created_at DESC
  `);
  res.json(users);
});

// POST /api/auth/users — admin only (plain text password)
router.post("/users", require("../middleware/auth").auth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin only" });

  const { username, password, role = "user", name, age, device_id } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Username and password required" });

  const existing = db.get("SELECT id FROM users WHERE username = ?", [username]);
  if (existing) return res.status(400).json({ error: "Username already exists" });

  // Check device_id uniqueness if provided
  if (device_id) {
    const existingDevice = db.get("SELECT id FROM users WHERE device_id = ?", [device_id]);
    if (existingDevice) return res.status(400).json({ error: "Device ID already in use" });
  }

  // Store password as plain text
  const result = db.run(
    `INSERT INTO users (username, password, role, name, age, device_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [username, password, role, name || null, age || null, device_id || null]
  );
  res.json({ id: result.lastInsertRowid, username, role, name, age, device_id });
});

// PUT /api/auth/users/:id — admin only (update user, plain text password)
router.put("/users/:id", require("../middleware/auth").auth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin only" });

  const { id } = req.params;
  const { name, age, device_id, role, password } = req.body;

  const user = db.get("SELECT * FROM users WHERE id = ?", [id]);
  if (!user) return res.status(404).json({ error: "User not found" });

  let updates = [];
  let params = [];

  if (name !== undefined) {
    updates.push("name = ?");
    params.push(name);
  }
  if (age !== undefined) {
    updates.push("age = ?");
    params.push(age ? parseInt(age) : null);
  }
  if (device_id !== undefined) {
    if (device_id) {
      const existing = db.get("SELECT id FROM users WHERE device_id = ? AND id != ?", [device_id, id]);
      if (existing) return res.status(400).json({ error: "Device ID already in use" });
    }
    updates.push("device_id = ?");
    params.push(device_id || null);
  }
  if (role !== undefined && role !== user.role) {
    if (id == req.user.id) return res.status(400).json({ error: "Cannot change your own role" });
    updates.push("role = ?");
    params.push(role);
  }
  if (password) {
    updates.push("password = ?");
    params.push(password); // plain text, no hashing
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  params.push(id);
  const sql = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
  db.run(sql, params);

  res.json({ success: true, id });
});

// DELETE /api/auth/users/:id — admin only
router.delete("/users/:id", require("../middleware/auth").auth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin only" });
  if (req.user.id === Number(req.params.id)) return res.status(400).json({ error: "Cannot delete yourself" });
  db.run("DELETE FROM users WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

module.exports = router;