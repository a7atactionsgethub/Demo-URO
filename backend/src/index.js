require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { init } = require("./db/database");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/readings", require("./routes/readings"));
app.use("/api/patients", require("./routes/patients"));
app.use("/api/alerts", require("./routes/alerts"));
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3001;

init().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});
