const express = require("express");
const router = express.Router();
const db = require("../db/database");
const { checkAlerts } = require("../services/alertEngine");

// POST /api/readings — IoT device pushes data here
router.post("/", (req, res) => {
  const { device_id, ph, glucose, protein_creatinine, nitrites } = req.body;

  if (!device_id) return res.status(400).json({ error: "device_id is required" });

  const patient = db.prepare("SELECT * FROM patients WHERE device_id = ?").get(device_id);
  if (!patient) return res.status(404).json({ error: "Device not registered to any patient" });

  const { alert_triggered, alert_reasons } = checkAlerts({ ph, glucose, protein_creatinine, nitrites });

  const result = db.prepare(`
    INSERT INTO readings (patient_id, device_id, ph, glucose, protein_creatinine, nitrites, alert_triggered, alert_reasons)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(patient.id, device_id, ph, glucose, protein_creatinine, nitrites ? 1 : 0, alert_triggered, alert_reasons);

  res.json({ id: result.lastInsertRowid, alert_triggered, alert_reasons });
});

// GET /api/readings — all readings (optional ?patient_id=)
router.get("/", (req, res) => {
  const { patient_id, limit = 50 } = req.query;
  let query = `SELECT r.*, p.name as patient_name FROM readings r JOIN patients p ON r.patient_id = p.id`;
  const params = [];

  if (patient_id) {
    query += " WHERE r.patient_id = ?";
    params.push(patient_id);
  }

  query += " ORDER BY r.timestamp DESC LIMIT ?";
  params.push(Number(limit));

  const readings = db.prepare(query).all(...params);
  res.json(readings);
});

// GET /api/readings/latest — latest reading per patient
router.get("/latest", (req, res) => {
  const readings = db.prepare(`
    SELECT r.*, p.name as patient_name
    FROM readings r
    JOIN patients p ON r.patient_id = p.id
    WHERE r.id IN (
      SELECT MAX(id) FROM readings GROUP BY patient_id
    )
    ORDER BY r.timestamp DESC
  `).all();
  res.json(readings);
});

module.exports = router;
