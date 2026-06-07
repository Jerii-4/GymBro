<div align="center">

<img src="frontend/public/assets/logo.png" alt="GymBro Logo" width="80" height="80" style="border-radius: 50%"/>

# GymBro

**Your Personal Fitness Companion**

[GymBro (https://img.shields.io/badge/Live%20App-gym--bro--blue.vercel.app-00f2fe?style=for-the-badge&logo=vercel)](https://gym-bro-blue.vercel.app/)

*Track your workouts, record your stats, and monitor your nutrition in one seamless experience.*

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏋️ **Workout Logger** | Log exercises, sets, reps, weight, and rest times per session |
| 📅 **Attendance Heatmap** | GitHub-style heatmap to visualise your gym consistency |
| 📈 **Gains Tracker** | Track body measurements (weight, biceps, chest, waist, etc.) over time |
| 🥗 **Nutrition Tracker** | Log food entries with macros and calories, set protein/calorie goals |
| 👤 **Profile Panel** | View account info, weight unit preferences, and goal history |
| 🔐 **Auth System** | Secure JWT-based login and registration |
| 🌐 **WebGL Landing Page** | Animated 3D orb powered by OGL on the landing page |
| 📱 **Responsive Design** | Works on desktop and mobile with a custom dropdown tab system |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **TypeScript** — UI framework
- **Vite** — Build tool
- **Zustand** — State management
- **OGL** — WebGL 3D orb animation
- **Vanilla CSS** — Custom dark-mode design system

### Backend
- **Node.js** + **Express** — REST API server
- **TypeScript** — Type-safe backend
- **pg** (node-postgres) — PostgreSQL client
- **bcryptjs** — Password hashing
- **jsonwebtoken** — JWT authentication

### Infrastructure
| Layer | Service |
|---|---|
| Frontend Hosting | [Vercel](https://vercel.com) |
| Backend Hosting | [Render](https://render.com) |
| Database | [Supabase](https://supabase.com) (PostgreSQL) |

---

## 🗄️ Database Schema

```
users
  └── sessions
        └── exercises
              └── exercise_sets
  └── measurements
  └── food_entries
  └── nutrition_goals
  └── nutrition_goals_history
```

All user data is isolated per account with cascading deletes.

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier)

### 1. Clone the repo
```bash
git clone https://github.com/Jerii-4/GymBro.git
cd GymBro
```

### 2. Set up the Backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=3000
JWT_SECRET=your_jwt_secret_here
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

Push the schema to your Supabase database:
```bash
psql "$DATABASE_URL" -f schema.sql
```

Start the backend:
```bash
npm run dev
```

### 3. Set up the Frontend
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Start the frontend:
```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 📁 Project Structure

```
GymBro/
├── frontend/
│   ├── public/assets/          # Images, icons, logo
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── Login.tsx
│   │   │   ├── SessionForm.tsx
│   │   │   ├── SessionHistory.tsx
│   │   │   ├── AttendanceHeatmap.tsx
│   │   │   ├── GainsPanel.tsx
│   │   │   ├── NutritionTracker.tsx
│   │   │   ├── ProfilePanel.tsx
│   │   │   └── Orb.tsx
│   │   ├── hooks/
│   │   │   └── useLocalStore.ts  # Zustand store + API calls
│   │   ├── types.ts
│   │   ├── App.tsx
│   │   └── styles.css
│   ├── vercel.json
│   └── vite.config.ts
│
└── backend/
    ├── routes/
    │   ├── auth.ts
    │   ├── sessions.ts
    │   ├── measurements.ts
    │   └── foods.ts
    ├── db.ts                   # pg Pool connection
    ├── schema.sql              # Full database schema
    ├── index.ts                # Express entry point
    └── Procfile                # Render start command
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and get JWT |
| `GET` | `/api/sessions` | Get all sessions for user |
| `POST` | `/api/sessions` | Create a new workout session |
| `DELETE` | `/api/sessions/:id` | Delete a session |
| `GET` | `/api/measurements` | Get all body measurements |
| `POST` | `/api/measurements` | Add/update a measurement |
| `GET` | `/api/foods` | Get food entries |
| `POST` | `/api/foods` | Add a food entry |
| `DELETE` | `/api/foods/:id` | Delete a food entry |

---

## 🌍 Deployment

| Service | Config File | Notes |
|---|---|---|
| Vercel (frontend) | `frontend/vercel.json` | Set `VITE_API_BASE_URL` env var |
| Render (backend) | `backend/Procfile` | Set `DATABASE_URL` + `JWT_SECRET` env vars |
| Supabase (DB) | `backend/schema.sql` | Use Session mode pooler URL for Render |

---

<div align="center">

Made with 💪 by [Jerii-4](https://github.com/Jerii-4)

</div>
