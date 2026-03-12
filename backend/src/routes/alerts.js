const express = require("express");
const router = express.Router();
const db = require("../db/database");

// GET /api/alerts — all triggered alerts
router.get("/", (req, res) => {
  const { limit = 50 } = req.query;
  const alerts = db.prepare(`
    SELECT r.*, p.name as patient_name
    FROM readings r
    JOIN patients p ON r.patient_id = p.id
    WHERE r.alert_triggered = 1
    ORDER BY r.timestamp DESC
    LIMIT ?
  `).all(Number(limit));
  res.json(alerts);
});

// GET /api/alerts/count — unread alert count for badge
router.get("/count", (req, res) => {
  const result = db.prepare(
    "SELECT COUNT(*) as count FROM readings WHERE alert_triggered = 1"
  ).get();
  res.json(result);
});

module.exports = router;
