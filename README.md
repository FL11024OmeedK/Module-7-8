# RE Admin — Rocket Elevators Agent Management

A React-based MERN single-page application that allows Rocket Elevators staff to manage their agent workforce through full CRUD operations, protected by a credential-based login system.

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

RE Admin is an internal back-office administration tool built for Rocket Elevators employees. It provides a secure, interactive interface for viewing, creating, editing, and deleting agents stored in MongoDB Atlas.

The application is built on the MERN stack (MongoDB, Express, React, Node.js) and was scaffolded from the official MongoDB MERN Stack Tutorial, then adapted and extended to meet Rocket Elevators business requirements. Access is restricted to registered staff — users must log in with their email and password before reaching the agent management interface.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 19.x |
| Frontend Routing | React Router DOM | 7.x |
| Frontend Styling | Tailwind CSS | 3.x |
| Build Tool | Vite | 8.x |
| Backend | Node.js + Express | 5.x |
| Database | MongoDB Atlas | — |
| Database Driver | MongoDB Node.js Driver | 7.x |
| Package Manager | npm | — |

---

## Project Structure

```
Module7/
├── server/                          ← Express backend (Node.js)
│   ├── server.js                    ← Entry point — registers middleware and routes
│   ├── config.env                   ← Environment variables (not committed to Git)
│   ├── db/
│   │   ├── connection.js            ← MongoDB Atlas connection; exports agentsDb and usersDb
│   │   └── schemas/
│   │       ├── agent.schema.js      ← Agent document shape + createAgent / updateAgent factory functions
│   │       └── user.schema.js       ← User document shape + createUser factory function
│   └── routes/
│       ├── agents.js                ← Agent CRUD endpoints (GET, POST, PATCH, DELETE /agents)
│       │                               Note: this file acts as a "fat router" — it combines routing
│       │                               logic (router.get, router.post, etc.) and controller logic
│       │                               (the async handler callbacks) in one file. In larger projects
│       │                               these are split into separate routes/ and controllers/ folders,
│       │                               but the combined pattern is appropriate at this scale.
│       └── users.js                 ← Login endpoint (POST /users/login); also a fat router
│
├── client/                          ← React frontend (Vite)
│   ├── index.html                   ← Single HTML file — app mounts at #root
│   ├── public/
│   │   ├── rocketLogo.png           ← Rocket Elevators logo used in Navbar and Login page
│   │   └── favicon.png              ← Rocket Elevators browser tab icon
│   ├── tailwind.config.js           ← Tailwind CSS configuration
│   ├── postcss.config.js            ← PostCSS pipeline (required by Tailwind)
│   ├── vite.config.js               ← Vite build configuration
│   └── src/
│       ├── main.jsx                 ← Router setup and app entry point
│       ├── App.jsx                  ← Shared layout — renders Navbar + Outlet
│       ├── index.css                ← Tailwind CSS base imports
│       └── components/
│           ├── Navbar.jsx           ← Top navigation bar with logo, Create Agent, and Logout
│           ├── Login.jsx            ← Login page (standalone, no Navbar)
│           ├── Unauthorized.jsx     ← Error page shown on failed login (standalone, no Navbar)
│           ├── AgentList.jsx        ← Home page — agent table with Edit and Delete actions
│           └── AgentForm.jsx       ← Create and Edit form (shared component)
│
├── ai/                              ← AI-native specification documents
│   ├── ai-spec.md                   ← Global project specification
│   └── features/                   ← One spec file per feature
│
├── LeetCode-Challenges/             ← LeetCode solution screenshots
├── PostmanCollection.json           ← Postman collection covering all endpoints
├── README.md                        ← This file
├── CONCEPTS.md                      ← 3 challenging concepts used in this project
├── Research.md                      ← React and MERN stack research
└── CODEBASE.md                      ← Learning reference for junior developers
```

---

## Installation / Setup

### Prerequisites

Before starting, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher) — verify with `node -v`
- [npm](https://www.npmjs.com/) — verify with `npm -v`
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account with a cluster set up
- [Git](https://git-scm.com/) — verify with `git -v`

---

### 1. Clone the repository

```bash
git clone https://github.com/FL11024OmeedK/Module-7.git
cd Module-7
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
touch config.env
```

Add the following (replace with your actual MongoDB Atlas connection string):

```env
ATLAS_URI=your_mongodb_atlas_connection_string
PORT=5050
```

---

### 4. Install frontend dependencies

```bash
cd ../client
npm install
```

---

### 5. Create a user in MongoDB Atlas

The app requires at least one user document to log in. In MongoDB Atlas Data Explorer, manually insert a document into the `users` database → `users` collection:

```json
{
  "first_name": "Your First Name",
  "last_name": "Your Last Name",
  "email": "your@email.com",
  "password": "yourpassword"
}
```

---

### 6. Start the backend server

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

### 7. Start the frontend development server

From the `client/` directory in a separate terminal:

```bash
npm run dev
```

Expected output:
```
VITE ready in Xms
➜ Local: http://localhost:5173/
```

---

### 8. Open the app

Navigate to [http://localhost:5173/login](http://localhost:5173/login) and log in with the credentials inserted in Step 5.

---

## Environment Variables

All environment variables are stored in `server/config.env`. This file is **not committed to Git** — never share it publicly.

| Variable | Description | Example |
|----------|-------------|---------|
| `ATLAS_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `PORT` | Port the Express server listens on | `5050` |
| `JWT_SECRET` | Secret key used to sign and verify JWT tokens | `some-long-random-string` |

> **Note:** Change `JWT_SECRET` to a long, random string in any real deployment. Anyone who knows this value can forge valid tokens.

---

## API Documentation

**Base URL:** `http://localhost:5050`

All request and response bodies use JSON. Include `Content-Type: application/json` on POST and PATCH requests.

---

### Authentication

#### POST `/users/login`

Validates staff credentials against the `users` MongoDB database. On success, returns a signed JWT valid for 24 hours. Include this token as `Authorization: Bearer <token>` on all subsequent `/agents` requests.

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
| `200` | `{ "token": "<jwt>" }` |
| `401` | `"Unauthorized: email not found"` |
| `401` | `"Unauthorized: incorrect password"` |
| `500` | `"Error during login"` |

---

### Agents

> All `/agents` endpoints require `Authorization: Bearer <token>` in the request header. Get a token first via `POST /users/login`. Requests without a valid token receive `401 No token provided`.

#### GET `/agents`

Returns all agents stored in MongoDB.

**Response `200`:**
```json
[
  {
    "_id": "64abc123...",
    "first_name": "Orlando",
    "last_name": "Perez",
    "email": "perez@rocket.elv",
    "region": "North",
    "rating": 95,
    "fee": 10000,
    "sales": 0
  }
]
```

---

#### GET `/agents/:id`

Returns a single agent by MongoDB `_id`.

| Status | Body |
|--------|------|
| `200` | Agent document |
| `401` | `{ "error": "No token provided" }` |
| `404` | `"Agent not found"` |
| `500` | `"Error retrieving agent"` |

---

#### POST `/agents`

Creates a new agent. `sales` is automatically set to `0` — do not include it in the request.

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
| `201` | MongoDB insert result with `insertedId` |
| `401` | `{ "error": "No token provided" }` |
| `500` | `"Error adding agent"` |

---

#### PATCH `/agents/:id`

Updates an existing agent. `sales` cannot be updated through this endpoint.

**Request body:**
```json
{
  "first_name": "Orlando",
  "last_name": "Perez",
  "email": "perez@rocket.elv",
  "region": "South",
  "rating": 98,
  "fee": 12000
}
```

| Status | Body |
|--------|------|
| `200` | MongoDB update result with `modifiedCount` |
| `401` | `{ "error": "No token provided" }` |
| `500` | `"Error updating agent"` |

---

#### DELETE `/agents/:id`

Permanently deletes an agent by MongoDB `_id`.

| Status | Body |
|--------|------|
| `200` | MongoDB delete result with `deletedCount` |
| `401` | `{ "error": "No token provided" }` |
| `500` | `"Error deleting agent"` |

---

## Author

**Omeed Kashef**
- GitHub: [FL11024OmeedK](https://github.com/FL11024OmeedK)
- LinkedIn: [linkedin.com/in/omeedkashef](https://www.linkedin.com/in/omeedkashef/)
- Email: omeedkashef@gmail.com
