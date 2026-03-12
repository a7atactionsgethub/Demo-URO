const express = require("express");
const router = express.Router();
const db = require("../db/database");

// GET /api/patients
router.get("/", (req, res) => {
  const patients = db.prepare("SELECT * FROM patients ORDER BY created_at DESC").all();
  res.json(patients);
});

// GET /api/patients/:id
router.get("/:id", (req, res) => {
  const patient = db.prepare("SELECT * FROM patients WHERE id = ?").get(req.params.id);
  if (!patient) return res.status(404).json({ error: "Patient not found" });
  res.json(patient);
});

// POST /api/patients
router.post("/", (req, res) => {
  const { name, age, device_id } = req.body;
  if (!name || !device_id) return res.status(400).json({ error: "name and device_id are required" });

  const result = db.prepare(
    "INSERT INTO patients (name, age, device_id) VALUES (?, ?, ?)"
  ).run(name, age, device_id);

  res.json({ id: result.lastInsertRowid, name, age, device_id });
});

// DELETE /api/patients/:id
router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM patients WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
