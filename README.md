# SkillBridge LMS

A role-based Learning Management System with Internship Recommendations built with React, Node.js, MongoDB, Stripe, and PDFKit.

---

## Project Structure

```
skillbridge/
├── client/          # React + Vite + Tailwind frontend
└── server/          # Node.js + Express + MongoDB backend
```

---

## Quick Start

### Prerequisites
- Node.js v18+
- npm v9+
- A MongoDB Atlas account (free tier works)
- A Stripe account (free, test mode)

---

## Step 1 — Set Up the Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/skillbridge
JWT_SECRET=any_long_random_string_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
```

### MongoDB Atlas Setup
1. Go to https://cloud.mongodb.com → create a free cluster
2. Click **Connect** → **Drivers** → copy the connection string
3. Replace `<password>` with your DB user password
4. Paste into `MONGO_URI`

### Stripe Setup
1. Go to https://dashboard.stripe.com → Developers → API Keys
2. Copy the **Secret key** (starts with `sk_test_`)
3. Paste into `STRIPE_SECRET_KEY`

### Run the backend
```bash
npm run dev
# Server starts on http://localhost:5000
```

---

## Step 2 — Set Up the Frontend

```bash
cd client
npm install
cp .env.example .env
```

Edit `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
```

### Run the frontend
```bash
npm run dev
# App starts on http://localhost:5173
```

---

## Step 3 — Create Your First Admin Account

1. Register a new account at http://localhost:5173/register
2. Open your MongoDB Atlas cluster → Browse Collections → `users`
3. Find your user document and change `"role": "learner"` to `"role": "admin"`
4. Log out and log back in

---

## Step 4 — Test Stripe Payments

Use these test card numbers at the Stripe checkout:

| Card | Number |
|------|--------|
| ✅ Success | 4242 4242 4242 4242 |
| ❌ Decline | 4000 0000 0000 0002 |
| 🔐 3D Secure | 4000 0025 0000 3155 |

- Use any future expiry date (e.g. 12/34)
- Use any 3-digit CVC (e.g. 123)
- Use any 5-digit ZIP (e.g. 12345)

---

## User Roles & Demo Flow

### Learner
1. Register with role = Learner
2. Browse and enroll in courses
3. Watch lessons, track progress
4. Take quizzes
5. Download PDF certificates on completion
6. View matched internship recommendations

### Tutor
1. Register with role = Tutor
2. Admin must approve your account
3. Create courses with lessons and quizzes
4. Courses go live after admin approval

### Admin
1. Update role to `admin` in MongoDB (see Step 3)
2. Approve tutor accounts
3. Approve/publish courses
4. Create internship listings
5. View platform stats

---

## API Overview

| Endpoint | Description |
|----------|-------------|
| POST /api/auth/register | Register user |
| POST /api/auth/login | Login |
| GET /api/courses | Browse courses |
| POST /api/courses | Create course (tutor) |
| POST /api/enroll | Enroll in course |
| GET /api/enrollments/:userId | Get user enrollments |
| PUT /api/enrollments/:id/progress | Update lesson progress |
| GET /api/lessons/:courseId | Get course lessons |
| POST /api/lessons | Add lesson (tutor) |
| GET /api/quizzes/:courseId | Get quiz |
| POST /api/certificates/generate | Generate PDF cert |
| GET /api/internships | List internships |
| GET /api/admin/stats | Platform stats (admin) |
| PUT /api/admin/approve-tutor/:id | Approve tutor (admin) |
| PUT /api/admin/approve-course/:id | Approve course (admin) |
| POST /api/payments/create-session | Stripe checkout |
| POST /api/payments/verify | Verify payment |

---

## Deployment

### Frontend → Vercel
```bash
cd client
npm run build
# Deploy /dist folder to Vercel
# Set VITE_API_URL to your Render backend URL
```

### Backend → Render
1. Push to GitHub
2. New Web Service on Render → connect repo
3. Build command: `cd server && npm install`
4. Start command: `node server.js`
5. Add all environment variables from `.env`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Routing | React Router v6 |
| HTTP | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT (jsonwebtoken, bcryptjs) |
| Payments | Stripe (test mode) |
| PDF Certs | PDFKit |
| Deployment | Vercel (frontend), Render (backend) |
