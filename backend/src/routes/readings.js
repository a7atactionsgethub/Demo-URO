const express = require("express");
const router = express.Router();
const db = require("../db/database");
const { checkAlerts } = require("../services/alertEngine");

// POST /api/readings – add a new reading (from IoT device)
router.post("/", (req, res) => {
  const {
    device_id,
    hydration_level,
    sugar_level,
    uti_indicator,
    kidney_stone_indicator,
    alcohol_presence
  } = req.body;
  if (!device_id) return res.status(400).json({ error: "device_id is required" });

  // Find the user (patient) with this device_id (role = 'user')
  const user = db.get("SELECT * FROM users WHERE device_id = ? AND role = 'user'", [device_id]);
  if (!user) return res.status(404).json({ error: "Device not registered to any patient" });

  const { alert_triggered, alert_reasons } = checkAlerts({
    hydration_level,
    sugar_level,
    uti_indicator,
    kidney_stone_indicator,
    alcohol_presence
  });

  const result = db.run(
    `INSERT INTO readings
      (user_id, device_id, hydration_level, sugar_level,
       uti_indicator, kidney_stone_indicator, alcohol_presence,
       alert_triggered, alert_reasons)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user.id,
      device_id,
      hydration_level,
      sugar_level,
      uti_indicator ? 1 : 0,
      kidney_stone_indicator ? 1 : 0,
      alcohol_presence ? 1 : 0,
      alert_triggered,
      alert_reasons
    ]
  );

  res.json({
    id: result.lastInsertRowid,
    alert_triggered,
    alert_reasons
  });
});

// GET /api/readings – get readings, optionally filtered by user_id
router.get("/", (req, res) => {
  const { user_id, limit = 50 } = req.query;
  // For non‑admin, always filter by their own user_id
  const targetUserId = req.user.role !== "admin" ? req.user.id : user_id;

  let query = `
    SELECT r.*, u.name as patient_name
    FROM readings r
    JOIN users u ON r.user_id = u.id
  `;
  const params = [];
  if (targetUserId) {
    query += " WHERE r.user_id = ?";
    params.push(Number(targetUserId));
  }
  query += " ORDER BY r.timestamp DESC LIMIT ?";
  params.push(Number(limit));

  res.json(db.all(query, params));
});

// GET /api/readings/latest – get the most recent reading for each user (or a single user)
router.get("/latest", (req, res) => {
  const { user_id } = req.query;
  // For non‑admin, only their own latest reading
  const targetUserId = req.user.role !== "admin" ? req.user.id : user_id;

  let query = `
    SELECT r.*, u.name as patient_name
    FROM readings r
    JOIN users u ON r.user_id = u.id
    WHERE r.id IN (
      SELECT MAX(id) FROM readings
      ${targetUserId ? "WHERE user_id = ?" : "GROUP BY user_id"}
    )
  `;
  const params = [];
  if (targetUserId) {
    query += " AND r.user_id = ?";
    params.push(Number(targetUserId));
  }
  query += " ORDER BY r.timestamp DESC";

  const readings = db.all(query, params);
  res.json(readings);
});

// GET /api/readings/marker/:marker – get historical data for a specific marker
router.get("/marker/:marker", (req, res) => {
  const { marker } = req.params;
  const { user_id, limit = 30 } = req.query;
  const targetUserId = req.user.role !== "admin" ? req.user.id : user_id;

  const allowed = [
    "hydration_level",
    "sugar_level",
    "uti_indicator",
    "kidney_stone_indicator",
    "alcohol_presence"
  ];
  if (!allowed.includes(marker)) {
    return res.status(400).json({ error: "Invalid marker" });
  }

  let query = `
    SELECT r.id, r.${marker} as value, r.timestamp,
           r.alert_triggered, r.alert_reasons,
           u.name as patient_name
    FROM readings r
    JOIN users u ON r.user_id = u.id
  `;
  const params = [];
  if (targetUserId) {
    query += " WHERE r.user_id = ?";
    params.push(Number(targetUserId));
  }
  query += " ORDER BY r.timestamp DESC LIMIT ?";
  params.push(Number(limit));

  res.json(db.all(query, params));
});

module.exports = router;