const Database = require("better-sqlite3");
const path = require("path");
require("dotenv").config();

const dbPath = path.resolve(process.env.DB_PATH || "./src/db/iot.db");
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma("journal_mode = WAL");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER,
    device_id TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    device_id TEXT NOT NULL,
    ph REAL,
    glucose REAL,
    protein_creatinine REAL,
    nitrites INTEGER DEFAULT 0,
    alert_triggered INTEGER DEFAULT 0,
    alert_reasons TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'doctor',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed a demo patient if none exist
const count = db.prepare("SELECT COUNT(*) as count FROM patients").get();
if (count.count === 0) {
  db.prepare(
    "INSERT INTO patients (name, age, device_id) VALUES (?, ?, ?)"
  ).run("Demo Patient", 35, "DEVICE-001");
}

console.log("✅ Database initialized");
module.exports = db;
