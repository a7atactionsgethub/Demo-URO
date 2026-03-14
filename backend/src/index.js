require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { init } = require("./db/database");
const { auth } = require("./middleware/auth");

const app = express();
app.use(cors());
app.use(express.json());

// Public route — no auth needed
app.use("/api/auth", require("./routes/auth"));

// Protected routes — need valid JWT
app.use("/api/readings", auth, require("./routes/readings"));
app.use("/api/patients", auth, require("./routes/patients"));
app.use("/api/alerts", auth, require("./routes/alerts"));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3001;

// Initialize DB on warm start for serverless
let isDbInitialized = false;

// Only start the server if ran directly (like `node src/index.js`)
if (require.main === module) {
  init().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Backend running on http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
}

// For Vercel Serverless
module.exports = async (req, res) => {
  if (!isDbInitialized) {
    try {
      await init();
      isDbInitialized = true;
    } catch (err) {
      console.error("Failed to initialize database in serverless:", err);
      return res.status(500).json({ error: "Database initialization failed" });
    }
  }
  return app(req, res);
};
