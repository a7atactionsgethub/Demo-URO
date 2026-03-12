# UroSense — IoT Urine Monitor Dashboard

A desktop dashboard for monitoring urine analysis readings from IoT devices, with real-time alerts.

## Quick Start

### 1. Backend
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:3001
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## Simulating IoT Data (for testing)

Send a POST request to the backend to simulate a device reading:

```bash
curl -X POST http://localhost:3001/api/readings \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "DEVICE-001",
    "ph": 7.2,
    "glucose": 0.5,
    "protein_creatinine": 20,
    "nitrites": 0
  }'
```

**To trigger an alert**, try:
```bash
curl -X POST http://localhost:3001/api/readings \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "DEVICE-001",
    "ph": 9.5,
    "glucose": 2.1,
    "protein_creatinine": 50,
    "nitrites": 1
  }'
```

---

## Alert Thresholds

| Marker             | Normal Range     |
|--------------------|-----------------|
| pH                 | 4.5 – 8.0       |
| Glucose            | 0 – 0.8 mmol/L  |
| Protein/Creatinine | < 30 mg/g       |
| Nitrites           | Negative        |

---

## Project Structure

```
urine-iot-dashboard/
├── backend/
│   └── src/
│       ├── db/database.js       # SQLite setup
│       ├── routes/              # API routes
│       ├── services/alertEngine.js  # Alert logic
│       ├── middleware/auth.js   # Auth stub (ready for roles)
│       └── index.js
├── frontend/
│   └── src/
│       ├── pages/               # Dashboard, Alerts, History, Patients
│       ├── services/api.js      # Centralised API calls
│       └── App.jsx
└── README.md
```

---

## Adding Role-Based Auth Later

1. Uncomment the JWT logic in `backend/src/middleware/auth.js`
2. Add a login route
3. The `users` table already has a `role` column ready to go
