# Task-01: Secure User Authentication System

A production-ready, full-stack Secure User Authentication System built with Node.js, Express, SQLite (`node:sqlite`), bcrypt password hashing, JSON Web Token (JWT) session management, Role-Based Access Control (RBAC), and an interactive web frontend.

---

## 🚀 Key Features

1. **User Registration**:
   - Secure sign up with username, email, password, and role selection (`user` or `admin`).
   - Server-side input validation and duplicate prevention.

2. **Secure Login & Password Hashing**:
   - Passwords hashed using `bcryptjs` with salt round factor 10. Raw passwords are never stored.
   - Authentication via email/username and password.

3. **Session Management via JWT**:
   - Signed JSON Web Tokens with 2-hour expiration issued upon successful login/registration.
   - Session persistence in client storage with clear token decoding.

4. **Role-Based Access Control (RBAC)**:
   - `USER` role: Access to public endpoints and protected user dashboard (`/api/user/dashboard`).
   - `ADMIN` role: Privileged access to user administration panel (`/api/admin/users`) and user deletion capabilities (`DELETE /api/admin/users/:id`).

5. **Single Page Application UI**:
   - Responsive modern UI featuring tab navigation (Register, Login, User Dashboard, Admin Portal).
   - Quick demo preset buttons for standard user and administrator testing.

6. **Automated Unit & Integration Tests**:
   - Automated test suite built with Node's native test runner (`node:test`).

---

## 🛠️ Project Structure

```
task_1/
├── server.js                  # Express application server entry point
├── package.json               # Dependencies and test scripts
├── config/
│   └── database.js            # SQLite database initialization via node:sqlite
├── controllers/
│   └── authController.js      # Register, Login, Dashboard, & Admin handlers
├── middleware/
│   └── authMiddleware.js      # JWT verification & RBAC authorization middleware
├── routes/
│   ├── authRoutes.js          # Public routes (/register, /login)
│   └── protectedRoutes.js     # Protected user & admin routes
├── public/                    # Frontend SPA Application
│   ├── index.html             # HTML layout & tab structure
│   ├── style.css              # Custom dark-mode UI stylesheet
│   └── app.js                 # Client-side API interactions & state manager
├── tests/
│   └── auth.test.js           # Automated integration test suite
└── README.md                  # Project documentation
```

---

## 📦 Getting Started

### Prerequisites
- **Node.js**: v22.5.0 or later (Node v24 recommended)
- **npm**: v10 or later

### Installation & Running

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the authentication server:
   ```bash
   npm start
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 🧪 Running Automated Tests

Run the integration test suite:

```bash
npm test
```

---

## 📡 API Endpoint Reference

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Server health status check |
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT token |
| `GET` | `/api/user/profile` | Protected (`User` / `Admin`) | Retrieve current user profile |
| `GET` | `/api/user/dashboard` | Protected (`User` / `Admin`) | Fetch protected user dashboard metrics |
| `GET` | `/api/admin/users` | RBAC (`Admin` Only) | List all registered users |
| `DELETE` | `/api/admin/users/:id` | RBAC (`Admin` Only) | Delete user account by ID |
