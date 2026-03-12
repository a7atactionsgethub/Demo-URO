const express = require("express");
const router = express.Router();
const db = require("../db/database");

router.get("/", (req, res) => {
  res.json(db.all("SELECT * FROM patients ORDER BY created_at DESC"));
});

router.get("/:id", (req, res) => {
  const patient = db.get("SELECT * FROM patients WHERE id = ?", [req.params.id]);
  if (!patient) return res.status(404).json({ error: "Patient not found" });
  res.json(patient);
});

router.post("/", (req, res) => {
  const { name, age, device_id } = req.body;
  if (!name || !device_id) return res.status(400).json({ error: "name and device_id are required" });
  try {
    const result = db.run("INSERT INTO patients (name, age, device_id) VALUES (?, ?, ?)", [name, age, device_id]);
    res.json({ id: result.lastInsertRowid, name, age, device_id });
  } catch (e) {
    res.status(400).json({ error: "Device ID already exists" });
  }
});

router.delete("/:id", (req, res) => {
  db.run("DELETE FROM patients WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
