const express = require("express");
const router = express.Router();
const db = require("../db/database");

router.get("/", (req, res) => {
  const { limit = 50 } = req.query;
  res.json(db.all(`
    SELECT r.*, p.name as patient_name
    FROM readings r JOIN patients p ON r.patient_id = p.id
    WHERE r.alert_triggered = 1
    ORDER BY r.timestamp DESC LIMIT ?
  `, [Number(limit)]));
});

router.get("/count", (req, res) => {
  res.json(db.get("SELECT COUNT(*) as count FROM readings WHERE alert_triggered = 1"));
});

module.exports = router;
