# SkillBridge LMS — Backend API

Built with Node.js, Express, MongoDB Atlas, Stripe, and PDFKit.

## Folder Structure

```
server/
├── controllers/
│   ├── authController.js       # Register, login, getMe
│   ├── courseController.js     # CRUD for courses
│   ├── enrollmentController.js # Enroll, progress tracking
│   ├── mainController.js       # Lessons, quizzes, certs, internships, admin
│   └── paymentController.js    # Stripe checkout
├── middleware/
│   └── auth.js                 # JWT protect + RBAC authorize
├── models/
│   └── index.js                # All Mongoose models
├── routes/
│   ├── auth.js
│   ├── courses.js
│   ├── enrollments.js
│   ├── lessons.js
│   ├── quizzes.js
│   ├── certificates.js
│   ├── internships.js
│   ├── payments.js
│   └── admin.js
├── utils/
│   └── generateCertificate.js  # PDFKit PDF generator
├── .env.example
├── package.json
└── server.js
```

## Setup

### 1. Install dependencies
```bash
cd server
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` and fill in:
- `MONGO_URI` — your MongoDB Atlas connection string
- `JWT_SECRET` — any long random string
- `STRIPE_SECRET_KEY` — from stripe.com/docs/keys (use sk_test_...)
- `CLIENT_URL` — http://localhost:5173 for local dev

### 3. MongoDB Atlas setup
1. Go to https://cloud.mongodb.com
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string into MONGO_URI
5. Replace `<password>` with your DB user password

### 4. Run the server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs on http://localhost:5000

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | Public | Register user |
| POST | /api/auth/login | Public | Login |
| GET | /api/auth/me | Any | Get current user |
| GET | /api/courses | Public | List approved courses |
| GET | /api/courses/:id | Public | Course details |
| POST | /api/courses | Tutor | Create course |
| PUT | /api/courses/:id | Tutor/Admin | Update course |
| DELETE | /api/courses/:id | Tutor/Admin | Delete course |
| GET | /api/courses/tutor/my | Tutor | My courses |
| POST | /api/enroll | Learner | Enroll in course |
| GET | /api/enrollments/:userId | Auth | Get enrollments |
| PUT | /api/enrollments/:id/progress | Learner | Update progress |
| GET | /api/lessons/:courseId | Auth | Get lessons |
| POST | /api/lessons | Tutor | Add lesson |
| GET | /api/quizzes/:courseId | Auth | Get quiz |
| POST | /api/quizzes | Tutor | Create quiz |
| POST | /api/certificates/generate | Learner | Generate PDF cert |
| GET | /api/certificates/:userId | Auth | Get certificates |
| GET | /api/internships | Public | List internships |
| POST | /api/internships | Admin | Add internship |
| DELETE | /api/internships/:id | Admin | Remove internship |
| GET | /api/admin/stats | Admin | Platform stats |
| GET | /api/admin/users | Admin | All users |
| GET | /api/admin/pending-tutors | Admin | Unapproved tutors |
| GET | /api/admin/pending-courses | Admin | Unapproved courses |
| PUT | /api/admin/approve-tutor/:id | Admin | Approve tutor |
| PUT | /api/admin/approve-course/:id | Admin | Approve course |
| POST | /api/payments/create-session | Learner | Stripe checkout |
| POST | /api/payments/verify | Learner | Verify payment |

## Testing Stripe Payments

Use these test card numbers at checkout:
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- Any future expiry date and any 3-digit CVC

## User Roles

| Role | Capabilities |
|------|-------------|
| learner | Browse, enroll, learn, get certificates |
| tutor | Create courses, add lessons/quizzes (requires admin approval) |
| admin | Approve tutors/courses, manage platform |

To create an admin account, register normally then update the role in MongoDB Atlas directly.
