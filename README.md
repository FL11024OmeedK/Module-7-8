# RE Admin — Rocket Elevators Internal Admin Panel

An internal back-office web application built for Rocket Elevators staff. It provides a secure interface for managing agents and transactions — including creating, viewing, editing, and deleting agent records, logging transactions, and controlling access via a session-based login system.

---

## Table of Contents

- [Description](#description)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation / Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Author](#author)

---

## Description

RE Admin is a full-stack MERN (MongoDB, Express, React, Node.js) single-page application. It was built across two modules:

- **Module 7** established the foundation: a JWT-authenticated agent management system with full CRUD (Create, Read, Update, Delete) operations backed by MongoDB Atlas.
- **Module 8** extended the application additively: a dashboard home page, global toast notifications, confirmation modals, UUID cookie-based session management, token validation on every route, a redesigned navigation bar, and a transactions page.

The app is intended for internal use only — staff must log in with their registered email and password before accessing any part of the interface. Sessions are stored in MongoDB with a 24-hour automatic expiry.

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend | React | 19.x | UI components and state management |
| Frontend Routing | React Router DOM | 7.x | Client-side navigation between pages |
| Frontend UI | React Bootstrap + Bootstrap | 5.x | Modal, Toast, Card, layout components |
| Frontend Styling | Tailwind CSS | 3.x | Utility-class styling throughout the app |
| Build Tool | Vite | 6.x | Frontend dev server and production build |
| Cookie Management | react-use-cookie | — | Read/write/delete browser cookies for session tokens |
| Backend | Express | 5.x | REST API server |
| Runtime | Node.js | 18+ | JavaScript runtime for the backend |
| Database | MongoDB Atlas | — | Cloud-hosted NoSQL database |
| Database Driver | MongoDB Node.js Driver | 7.x | Connects Express to MongoDB Atlas |
| Auth (M7) | JSON Web Tokens (JWT) | — | Protects the `/agents` API routes |
| Auth (M8) | UUID sessions | — | Cookie-based sessions stored in MongoDB |
| Package Manager | npm | — | Dependency management for both client and server |

---

## Project Structure

```
Module7&8/
├── server/                            ← Express backend (Node.js)
│   ├── server.js                      ← Entry point — registers middleware, routes, and TTL index
│   ├── config.env                     ← Environment variables (not committed to Git)
│   ├── seed.js                        ← Optional script to seed the database with sample agents
│   ├── db/
│   │   ├── connection.js              ← MongoDB Atlas connection; exports agentsDb, usersDb, sessionsDb, transactionsDb
│   │   └── schemas/
│   │       ├── agent.schema.js        ← Agent document shape; createAgent() and updateAgent() factory functions
│   │       └── user.schema.js         ← User document shape
│   ├── middleware/
│   │   └── auth.js                    ← requireAuth middleware — validates JWT on protected routes
│   └── routes/
│       ├── agents.js                  ← Agent CRUD: GET, POST, PATCH, DELETE /agents (JWT-protected)
│       ├── users.js                   ← Login: POST /users/login
│       ├── session.js                 ← Sessions: POST /session/:user_id, GET /validate_token
│       └── transactions.js            ← Transactions: GET /transaction-data, POST /transaction
│
├── client/                            ← React frontend (Vite)
│   ├── index.html                     ← Single HTML file — React app mounts at #root
│   ├── public/
│   │   └── rocketLogo.png             ← Rocket Elevators logo
│   ├── tailwind.config.js             ← Tailwind CSS configuration
│   ├── postcss.config.js              ← PostCSS pipeline (required by Tailwind)
│   ├── vite.config.js                 ← Vite build configuration
│   └── src/
│       ├── main.jsx                   ← React Router setup; all routes defined here; AlertProvider wraps the app
│       ├── App.jsx                    ← Shared layout — renders Navbar + Outlet for all main pages
│       ├── index.css                  ← Tailwind CSS base imports
│       ├── context/
│       │   └── AlertContext.jsx       ← Global alert state; AlertProvider and useAlert hook
│       ├── hooks/
│       │   └── useTokenValidation.js  ← Custom hook — validates session cookie on every page load; redirects to /login if invalid
│       └── components/
│           ├── Navbar.jsx             ← Top navigation bar; shows logged-in user's name and Logout button
│           ├── Login.jsx              ← Standalone login page; handles credential check + session creation
│           ├── Unauthorized.jsx       ← Shown on access denied (standalone, no Navbar)
│           ├── HomePage.jsx           ← Dashboard with React Bootstrap Cards linking to Agents and Transactions
│           ├── AgentList.jsx          ← Agent table with Create, Edit, and Delete actions
│           ├── AgentForm.jsx          ← Shared Create / Edit agent form with confirmation modal
│           ├── Transactions.jsx       ← Transaction table (last 10) and new transaction form
│           ├── ConfirmationModal.jsx  ← Reusable React Bootstrap Modal for confirming destructive actions
│           └── AlertToast.jsx         ← Reusable React Bootstrap Toast for success/error notifications
│
├── ai/                                ← AI-native specification documents
│   ├── ai-spec.md                     ← Global project specification (M7 + M8)
│   └── features/                      ← One spec file per feature (14 total across M7 and M8)
│
├── PostmanCollection.json             ← Postman collection covering all API endpoints with pre-filled variables and test assertions
├── README.md                          ← This file
├── CODEBASE.md                        ← Learning reference for the codebase
├── Research.md                        ← Research notes on React and MERN concepts
├── CONCEPTS 7.md                      ← Three challenging concepts from Module 7
├── CONCEPTS 8.md                      ← Three challenging concepts from Module 8
└── FILE_FLOW.md                       ← Visual walkthrough of how a request flows through the app
```

---

## Installation / Setup

### Prerequisites

Make sure the following are installed before starting:

- [Node.js](https://nodejs.org/) v18 or higher — verify with `node -v`
- [npm](https://www.npmjs.com/) — verify with `npm -v`
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account with a free cluster created
- [Git](https://git-scm.com/) — verify with `git --version`

---

### 1. Clone the repository

```bash
git clone https://github.com/FL11024OmeedK/Module-7-8.git
cd Module-7-8
```

---

### 2. Install backend dependencies

```bash
cd server
npm install
```

---

### 3. Configure environment variables

Create a `config.env` file inside the `server/` folder:

```bash
touch server/config.env
```

Add the following content (replace placeholder values with your own):

```env
ATLAS_URI=your_mongodb_atlas_connection_string
PORT=5050
JWT_SECRET=your-long-random-secret-key
```

See the [Environment Variables](#environment-variables) section for full details on each variable.

---

### 4. Install frontend dependencies

```bash
cd ../client
npm install
```

---

### 5. Set up MongoDB Atlas collections

The app uses four MongoDB databases. You do not need to create them manually — MongoDB creates them automatically on first write. However, you must manually insert at least one user document so you can log in.

In MongoDB Atlas, go to **Browse Collections** and insert a document into `users` database → `users` collection:

```json
{
  "first_name": "Your First Name",
  "last_name": "Your Last Name",
  "email": "your@email.com",
  "password": "yourpassword"
}
```

> **Note:** Passwords are stored in plain text in this project — this is intentional for a bootcamp learning context and is not suitable for production.

The remaining collections (`agents`, `sessions`, `transactions`) are created automatically when the app first writes to them.

---

### 6. Start the backend

From the `server/` directory:

```bash
npm run dev
```

Expected output:

```
Pinged your deployment. You successfully connected to MongoDB!
Server listening on port 5050
```

---

### 7. Start the frontend

From the `client/` directory in a **separate terminal**:

```bash
npm run dev
```

Expected output:

```
VITE ready in Xms
➜  Local:   http://localhost:5173/
```

---

### 8. Open the app

Navigate to [http://localhost:5173/login](http://localhost:5173/login) and sign in with the credentials you inserted in Step 5.

---

### Testing the API (optional)

Import `PostmanCollection.json` into Postman via **File → Import**. Run **POST /users/login — Success** first — it automatically captures the JWT token and user ID for all subsequent requests. No manual variable editing required.

---

## Environment Variables

All environment variables live in `server/config.env`. This file is excluded from Git via `.gitignore` — never commit it or share it publicly.

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `ATLAS_URI` | Yes | MongoDB Atlas connection string. Found in Atlas under **Connect → Drivers**. | `mongodb+srv://user:pass@cluster.mongodb.net/?appName=AppName` |
| `PORT` | Yes | Port the Express server listens on. The frontend is hardcoded to call `localhost:5050`. | `5050` |
| `JWT_SECRET` | Yes | Secret key used to sign and verify JWT tokens for the `/agents` routes. Use a long, random string. Anyone who knows this value can forge valid tokens. | `rocket-elevators-super-secret-key` |

---

## API Documentation

**Base URL:** `http://localhost:5050`

All request and response bodies use JSON. Include `Content-Type: application/json` on all POST and PATCH requests.

---

### Authentication

#### `POST /users/login`

Validates staff credentials. On success, returns a signed JWT (valid 24 hours) and the user's profile. Store the JWT and send it as `Authorization: Bearer <token>` on all `/agents` requests.

**Request body:**
```json
{
  "email": "your@email.com",
  "password": "yourpassword"
}
```

**Responses:**

| Status | Body |
|--------|------|
| `200` | `{ "token": "<jwt>", "user": { "_id": "...", "first_name": "...", "last_name": "..." } }` |
| `401` | `"Unauthorized: email not found"` |
| `401` | `"Unauthorized: incorrect password"` |
| `500` | `"Error during login"` |

---

### Sessions

Sessions are UUID tokens stored in MongoDB with a 24-hour TTL. The frontend creates a session immediately after a successful login and stores the token in a browser cookie (`session_token`). Every protected page calls `GET /validate_token` on load to confirm the session is still valid.

#### `POST /session/:user_id`

Creates a new session for the given user. Called automatically by the frontend after login — you do not need to call this manually during normal use.

**URL parameter:** `:user_id` — the MongoDB `_id` of the logged-in user.

**Request body:**
```json
{
  "first_name": "Omeed",
  "last_name": "Kashef"
}
```

**Responses:**

| Status | Body |
|--------|------|
| `201` | `{ "status": "ok", "data": { "token": "<uuid>" }, "message": "session saved successfully" }` |
| `500` | `{ "status": "error", "data": null, "message": "<error>" }` |

---

#### `GET /validate_token?token=<uuid>`

Checks whether a session token is still valid. MongoDB's TTL index automatically removes expired sessions — if a token is not found, it has expired.

**Query parameter:** `token` — the UUID session token from the cookie.

**Responses:**

| Status | Body |
|--------|------|
| `200` (valid) | `{ "status": "ok", "data": { "valid": true, "user": { "first_name": "...", "last_name": "...", "id": "..." } }, "message": null }` |
| `200` (invalid/missing) | `{ "status": "ok", "data": { "valid": false, "user": null }, "message": null }` |
| `500` | `{ "status": "error", "data": null, "message": "<error>" }` |

---

### Agents

All `/agents` endpoints require `Authorization: Bearer <token>` in the request header. Get a token from `POST /users/login`. Requests without a valid token receive `401 Invalid or expired token`.

#### `GET /agents`

Returns all agents in the database.

**Response `200`:**
```json
[
  {
    "_id": "6a204e6191af1c18ae2521d1",
    "first_name": "Brutus",
    "last_name": "Konway",
    "email": "brutus@rocketelev.com",
    "region": "East",
    "rating": 5,
    "fee": 3000,
    "sales": 0
  }
]
```

---

#### `GET /agents/:id`

Returns a single agent by MongoDB `_id`.

| Status | Body |
|--------|------|
| `200` | Agent document |
| `401` | `{ "error": "Invalid or expired token" }` |
| `404` | `"Agent not found"` |
| `500` | `"Error retrieving agent"` |

---

#### `POST /agents`

Creates a new agent. `sales` is automatically set to `0` by the server — do not include it in the request body.

**Request body:**
```json
{
  "first_name": "Orlando",
  "last_name": "Perez",
  "email": "perez@rocket.elv",
  "region": "North",
  "rating": 95,
  "fee": 10000
}
```

| Status | Body |
|--------|------|
| `201` | MongoDB insert result `{ "insertedId": "..." }` |
| `401` | `{ "error": "Invalid or expired token" }` |
| `500` | `"Error adding agent"` |

---

#### `PATCH /agents/:id`

Updates an existing agent by `_id`. The `sales` field cannot be updated through this endpoint.

**Request body:** Same fields as POST (all fields required).

| Status | Body |
|--------|------|
| `200` | MongoDB update result `{ "modifiedCount": 1 }` |
| `401` | `{ "error": "Invalid or expired token" }` |
| `500` | `"Error updating agent"` |

---

#### `DELETE /agents/:id`

Permanently deletes an agent by `_id`. This action is irreversible.

| Status | Body |
|--------|------|
| `200` | MongoDB delete result `{ "deletedCount": 1 }` |
| `401` | `{ "error": "Invalid or expired token" }` |
| `500` | `"Error deleting agent"` |

---

### Transactions

Transaction endpoints do not require JWT authentication — session validation is handled client-side via the cookie.

#### `GET /transaction-data`

Returns the last 10 transactions sorted by date, most recent first.

**Response `200`:**
```json
{
  "status": "ok",
  "data": [
    {
      "_id": "...",
      "date": "2026-06-10T14:30:00.000Z",
      "amount": 1500,
      "agent_id": "6a204e6191af1c18ae2521d1"
    }
  ],
  "message": null
}
```

---

#### `POST /transaction`

Saves a new transaction. `date` is set automatically by the server to the current timestamp — do not include it in the request body.

**Request body:**
```json
{
  "amount": 1500,
  "agent_id": "6a204e6191af1c18ae2521d1"
}
```

| Status | Body |
|--------|------|
| `201` | `{ "status": "ok", "data": { "_id": "...", "date": "...", "amount": 1500, "agent_id": "..." }, "message": "transaction saved successfully" }` |
| `400` | `{ "status": "error", "data": null, "message": "Amount must be a positive number" }` |
| `500` | `{ "status": "error", "data": null, "message": "<error>" }` |

---

## Author

**Omeed Kashef**
- GitHub: [FL11024OmeedK](https://github.com/FL11024OmeedK)
- LinkedIn: [linkedin.com/in/omeedkashef](https://www.linkedin.com/in/omeedkashef/)
- Email: omeedkashef@gmail.com
