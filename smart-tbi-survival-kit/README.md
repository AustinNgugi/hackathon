# ⚡ Smart TBI Survival Kit

**Early Detection. Guided Care. Faster Saves Lives.**

A full-stack hackathon MVP for real-time traumatic brain injury (TBI) monitoring with live emergency alerts, LED status indicators, GPS tracking, and a preparation checklist system for medical teams.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js, MongoDB, Mongoose, JWT, Socket.io |
| Frontend | React 18, Vite, TailwindCSS, React Router v6, Axios, Chart.js, Socket.io-client |

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally on port `27017`

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

Server starts at **http://localhost:5000**  
Database auto-seeds on first run with demo accounts.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App opens at **http://localhost:5173**

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Doctor | doctor@test.com | 123456 |
| Patient | patient@test.com | 123456 |

---

## Features

### Patient Portal (`/patient/dashboard`)
- Real-time vitals display (Heart Rate, Oxygen, Pressure, Movement)
- LED Status: **SEAML** (green) / **CAUTION** (yellow) / **DANGER** (red, pulsing)
- Vitals history line chart (Chart.js)
- GPS location map (OpenStreetMap)
- **Sensor Simulator** — manually send sensor readings to test the system
- **Symptom Logger** — select from a predefined list with LED preview
- **Emergency SOS button** — captures GPS, creates CRITICAL alert, notifies doctors
- Vitals history table with filter by LED status

### Doctor Portal (`/doctor/dashboard`)
- Live alert feed sorted: CRITICAL → URGENT → ROUTINE
- Audible beep on new CRITICAL alerts (Web Audio API)
- Expandable alert cards with preparation checklist
- Real-time patient vitals grid
- OpenStreetMap embedded location view per alert
- One-click Acknowledge / Resolve buttons
- Per-patient detail view with full vitals history

### Real-Time (Socket.io Events)
| Event | Description |
|-------|-------------|
| `sensor:update` | New vitals reading — updates all connected dashboards |
| `new:alert` | New emergency or auto-triggered alert |
| `alert:update` | Doctor changed alert status/checklist |

---

## LED Status Logic

| Status | Condition |
|--------|-----------|
| 🟢 SEAML | Oxygen > 95% AND Heart Rate 60–100 BPM |
| 🟡 CAUTION | Oxygen 90–95% OR HR 100–120 OR headache/dizziness |
| 🔴 DANGER | Oxygen < 90% OR confusion / unconscious / abnormal movement |

---

## Project Structure

```
smart-tbi-survival-kit/
├── backend/
│   ├── src/
│   │   ├── models/       User, SensorData, Alert
│   │   ├── routes/       auth, patient, doctor, sensor
│   │   ├── middleware/   JWT auth + role guards
│   │   ├── seed.js       Auto-seeds demo data on first run
│   │   └── index.js      Express + Socket.io server
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/   Lightfall, CardNav, LEDStatus, VitalsChart, Sidebar
    │   ├── context/      AuthContext (JWT + axios)
    │   ├── pages/
    │   │   ├── patient/  Dashboard, Simulator, Symptoms, Emergency, History, Profile
    │   │   └── doctor/   Dashboard, PatientDetail, PatientHistory
    │   └── socket.js     Singleton Socket.io client
    └── vite.config.js    Proxies /api → backend:5000
```

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally (`mongod`)

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

Server starts at **http://localhost:5000**
MongoDB auto-seeds test accounts on first run.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App opens at **http://localhost:5173**

---

## Demo Accounts

| Role    | Email               | Password |
|---------|---------------------|----------|
| Patient | patient@test.com    | 123456   |
| Doctor  | doctor@test.com     | 123456   |

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Backend   | Node.js, Express, MongoDB, Mongoose     |
| Auth      | JWT, bcryptjs                           |
| Realtime  | Socket.io                               |
| Frontend  | React 18, Vite, React Router v6         |
| Styling   | TailwindCSS (custom TBI theme)          |
| Charts    | Chart.js + react-chartjs-2              |
| Maps      | OpenStreetMap (iframe embed)            |

---

## Features

- **Animated Landing Page** — Lightfall canvas particle animation
- **Role-based Auth** — Patient and Doctor portals with JWT
- **LED Status System** — SEAML (green) / CAUTION (yellow) / DANGER (red, pulsing)
- **Sensor Simulator** — Send fake device readings and watch dashboard update live
- **SOS Emergency Button** — Captures GPS, creates CRITICAL alert, notifies doctors
- **Doctor Dashboard** — Sorted alerts, inline checklists, patient vitals, location map
- **Real-time Socket.io** — Dashboards update without page refresh
- **Preparation Checklists** — Context-aware per alert severity
- **Vitals History** — Table + Chart view for both patient and doctor

---

## Project Structure

```
smart-tbi-survival-kit/
├── backend/
│   ├── src/
│   │   ├── models/        User, SensorData, Alert
│   │   ├── routes/        auth, patient, doctor, sensor
│   │   ├── middleware/    JWT auth, role guards
│   │   ├── index.js       Express + Socket.io server
│   │   └── seed.js        Test data seeder
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    Lightfall, CardNav, LEDStatus, VitalsChart, Sidebar
│   │   ├── context/       AuthContext (JWT + axios)
│   │   ├── pages/
│   │   │   ├── patient/   Dashboard, Symptoms, Emergency, History, Profile, Simulator
│   │   │   └── doctor/    Dashboard, PatientDetail, PatientHistory
│   │   ├── socket.js      Socket.io singleton
│   │   └── App.jsx        Routes + role-based protection
│   └── package.json
└── README.md
```

---

## LED Status Logic

| Status  | Condition                                                   |
|---------|-------------------------------------------------------------|
| SEAML   | O2 > 95% AND Heart Rate 60–100 BPM, no symptoms            |
| CAUTION | O2 90–95% OR HR 100–120 OR headache/dizziness/nausea       |
| DANGER  | O2 < 90% OR confusion/abnormal movement/unconscious        |

## Alert Severity & Checklists

| Severity | Trigger   | Checklist                                                  |
|----------|-----------|------------------------------------------------------------|
| ROUTINE  | SEAML     | Prepare examination room                                   |
| URGENT   | CAUTION   | Oxygen support, Trauma bed                                 |
| CRITICAL | DANGER    | CT scanner, Neurosurgeon, IV fluids, Emergency meds, Trauma team |
