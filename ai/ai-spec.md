# AI_SPEC — RE Admin (Modules 7–8)

> This document is the **master specification** for RE Admin.
> It must be read **first** before implementing any feature or asking AI to generate any code.
> Each feature has its own spec file inside `./ai/features/`. This file owns the project-wide rules; the feature files own per-feature behavior.

> **Module 8 (FSO-1608) is additive.** Everything below from Module 7 still applies. Module 8
> *adds* seven features (dashboard home, toast notifications, confirmation modals, cookie-based
> sessions, token validation, header-bar updates, transactions) and *modifies* only the auth
> approach (JWT → UUID cookie sessions). Module 8 additions are marked **“M8”** throughout.
> No new repository — built on the existing Module 7 codebase.

---

## Project Identity

- **Project Name:** RE Admin
- **Short Description:** A React-based MERN single-page application that allows Rocket Elevators employees to manage agents through full CRUD operations, protected by a login/logout system validated against MongoDB.
- **Project Type:** MERN Full-Stack SPA (MongoDB, Express, React, Node.js). Internal admin panel. No public-facing pages.
- **Client:** Rocket Elevators
- **Developer Role:** Junior Developer at Genesis Solutions

---

## Goal and Scope

### Goal

Build an internal back-office administration tool for Rocket Elevators employees to view, create, edit, and delete agents. Access must be restricted to registered users via a login page that validates credentials against MongoDB.

The project is built by adapting the official MongoDB MERN Stack Tutorial template — not by cloning a repository.

### In Scope (Build Now)

- Login page with credential validation against MongoDB
- Logout button in the navigation bar
- Agent table (home page): Full Name, Region, Rating, Fee, Sales, Action columns
- Create agent form (POST to MongoDB)
- Edit agent form pre-populated with existing data (PATCH to MongoDB)
- Delete agent with immediate table refresh (DELETE from MongoDB)
- Unauthorized/error page when login fails
- Rocket Elevators branding: logo, favicon, page title
- Agent schema in MongoDB
- User schema in MongoDB (users created manually — no user CRUD endpoints)
- Login API endpoint
- All agent CRUD API endpoints

**M8 — In Scope (added):** the seven Module 8 features (each with its own feature spec):
1. **Home Page (Card Grid)** — dashboard landing page with React Bootstrap cards for each admin section.
2. **Toast Notifications** — global alert system (`AlertContext` + React Bootstrap `<Toast>`) for all user actions.
3. **Confirmation Modals** — reusable `<ConfirmationModal>` before create, update, delete, and transaction submission.
4. **Session Token (Cookie-Based)** — replace `localStorage` with cookie sessions via `react-use-cookie`, UUID tokens, MongoDB TTL (24h).
5. **Token Validation** — `useTokenValidation` hook that runs on every page navigation and redirects unauthenticated users to login.
6. **Header Bar Updates** — move "Create Agent" into the Agent Management component; show the logged-in user's full name in the navbar.
7. **Transaction Feature** — a Transaction page with a table of the last 10 transactions and a form to submit new ones.

### Out of Scope (Do NOT Build)

- User registration or user management UI
- Password hashing or JWT authentication (unless implementing the Extra Mile)
- Public-facing website (unless implementing the Static Website Extra Mile)
- TypeScript (JSX only)
- Any CSS framework other than Tailwind CSS
- Any database other than MongoDB Atlas
- Any backend framework other than Express

**M8 — Out of Scope (added):** JWT for session tokens (use UUID), `localStorage` for the token (use cookies), Mongoose, and the report page / `GET /report-data` unless doing the Extra Mile.

---

## Users and Use Cases

- **Rocket Elevators Employee (authenticated):** Can log in, view all agents, create a new agent, edit an existing agent, delete an agent, and log out.
- **Unauthenticated visitor:** Lands on the login page. If credentials fail, they are redirected to the unauthorized page.

**M8 (added):** the authenticated employee also lands on a **dashboard home page**, records and views **transactions**, sees their **first_name** in the navbar, and stays logged in for **24 hours** via a cookie session (no re-login each visit). Any page visited without a valid session token redirects to login.

---

## Feature Index

Each feature has its own specification file. Always read both this file and the relevant feature file before implementing.

- [`./features/schemas.feature.md`](./features/schemas.feature.md) — Agent and User MongoDB schemas
- [`./features/company-info.feature.md`](./features/company-info.feature.md) — Branding: logo, favicon, page title, logo navigation
- [`./features/crud-read.feature.md`](./features/crud-read.feature.md) — Home page agent table
- [`./features/crud-delete.feature.md`](./features/crud-delete.feature.md) — Delete agent from table
- [`./features/crud-create.feature.md`](./features/crud-create.feature.md) — Create new agent form
- [`./features/crud-update.feature.md`](./features/crud-update.feature.md) — Edit existing agent form
- [`./features/login-logout.feature.md`](./features/login-logout.feature.md) — Login page, logout button, unauthorized page

**M8 feature specs (added):**
- [`./features/home-page.feature.md`](./features/home-page.feature.md) — dashboard card grid
- [`./features/notifications.feature.md`](./features/notifications.feature.md) — global toast notifications
- [`./features/modals.feature.md`](./features/modals.feature.md) — confirmation modal
- [`./features/session-process.feature.md`](./features/session-process.feature.md) — cookie UUID sessions + TTL
- [`./features/validation-process.feature.md`](./features/validation-process.feature.md) — token validation + redirects
- [`./features/header-bar.feature.md`](./features/header-bar.feature.md) — navbar updates
- [`./features/transaction-process.feature.md`](./features/transaction-process.feature.md) — transactions list + form

---

## Pages / Screens / Routes

### Frontend Routes (React Router)

| Route | Component | Description |
|-------|-----------|-------------|
| `/login` | `Login` | Login form — entry point for all users |
| `/` | `App > AgentList` (M7) → `App > Home` (M8) | M7: agent table. **M8: dashboard card grid** (default after login) |
| `/agents` | `App > AgentList` | **M8:** agent table (moved off `/`); holds the "Create Agent" button |
| `/transactions` | `App > Transactions` | **M8:** last 10 transactions + submit form |
| `/create` | `App > AgentForm` | Form to create a new agent |
| `/edit/:id` | `App > AgentForm` | Pre-populated form to edit an existing agent |
| `/unauthorized` | `Unauthorized` | Error page shown when login credentials are invalid |

### Backend API Endpoints (Express)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/agents` | Return all agents |
| `GET` | `/agents/:id` | Return a single agent by ID |
| `POST` | `/agents` | Create a new agent |
| `PATCH` | `/agents/:id` | Update an existing agent |
| `DELETE` | `/agents/:id` | Delete an agent |
| `POST` | `/users/login` | Validate user credentials against MongoDB |
| `POST` | `/session/:user_id` | **M8:** create a session, return the UUID token |
| `GET` | `/validate_token?token=` | **M8:** validate a session token |
| `GET` | `/transaction-data` | **M8:** return only the last 10 transactions |
| `POST` | `/transaction` | **M8:** create a transaction `{ amount, agent_id }` (positive amounts only) |
| `GET` | `/report-data` | **M8 (Extra Mile):** chart data |

**M8 — exact response formats** (from the docebo assignment):
- `POST /session/:user_id` → `{ status: "ok", data: { token: "xxx-ee-dd-fff" }, message: "session saved successfully" }`
- `GET /validate_token?token=` → `{ status: "ok", data: { valid: boolean, user: { first_name, last_name, id } }, message: null }`

---

## Data and Models

### Agent Collection (`agents`)

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Auto-generated by MongoDB |
| `first_name` | String | Required |
| `last_name` | String | Required |
| `email` | String | Required |
| `region` | String | North, East, South, or West |
| `rating` | Number | 0–100 |
| `fee` | Number | Agent fee in dollars |
| `sales` | Number | Number of sales, default 0 |

### User Collection (`users`)

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Auto-generated by MongoDB |
| `first_name` | String | Required |
| `last_name` | String | Required |
| `email` | String | Required, used for login |
| `password` | String | Required, plain text (no hashing unless Extra Mile) |

> Users are created manually in MongoDB Atlas. There is no user registration UI or endpoint.

### Session Collection (`sessions`) — M8

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Auto-generated |
| `session_token` | String | UUID, unique |
| `User` | Object | `{ first_name, last_name, id }` — enough for `validate_token` to return |
| `createdAt` | Date | TTL index expires the doc after 24 hours (`expireAfterSeconds: 86400`) |

### Transaction Collection (`transactions`) — M8

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Auto-generated |
| `date` | Date | Set at insert time |
| `amount` | Number | **Positive only** |
| `agent_id` | String | References an agent; full name is joined on the frontend |

---

## Tech Stack and Tools

### Frontend
- React 19 (JSX only — no TypeScript)
- React Router v7 (client-side routing)
- Tailwind CSS v3 (utility-first styling)
- Vite (build tool and dev server)
- **M8:** React Bootstrap + Bootstrap 5 (new UI surfaces), `react-use-cookie` (session cookie), `uuid` (session tokens)

### Backend
- Node.js
- Express 5

### Database
- MongoDB Atlas (cloud-hosted)
- MongoDB Node.js Driver (no Mongoose)

### Tools / Libraries
- `cors` — allows the React app (port 5173) to talk to the Express server (port 5050)
- `dotenv` / `--env-file` — loads environment variables from `config.env`
- Postman — API testing, exported as `PostmanCollection.json`
- **M8 constraints (from the business document):** React Bootstrap required; cookies via `react-use-cookie` (not `localStorage`); UUID tokens (not JWT); 24h TTL on the Session collection; toasts auto-hide after 5 seconds; transaction amounts positive only; AI specs (global + one per feature) written before coding.

### NOT Allowed
- TypeScript
- Mongoose (use the raw MongoDB Node.js driver)
- Axios (use the native `fetch()` API)
- Sass / Less / styled-components
- Any CSS framework other than Tailwind CSS v3
- Class-based React components
- **M8:** JWT for session tokens (use UUID instead); `localStorage` for the auth token (use cookies instead)

---

## Coding Standards and Conventions

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| JS variables and functions | camelCase | `deleteAgent`, `agentList` |
| React components | PascalCase | `AgentList`, `Navbar` |
| JSX component files | PascalCase + `.jsx` | `AgentList.jsx` |
| Non-component JS files | camelCase + `.js` | `connection.js`, `agents.js` |
| CSS classes (Tailwind) | kebab-case (Tailwind standard) | `bg-slate-100`, `text-sm` |
| MongoDB collections | camelCase plural | `agents`, `users` |
| Environment variables | UPPER_SNAKE_CASE | `ATLAS_URI`, `PORT` |

### Module System
- Use **ES Modules** exclusively: `import` / `export`
- Never use `require()` or `module.exports`
- Both `server/` and `client/` use `"type": "module"` in their `package.json`

### Code Style
- All async functions must use `async/await` with `try/catch`
- No `console.log()` left in production code
- No inline styles — use Tailwind classes only
- Do not spread `req.body` directly into database operations — destructure explicitly
- Every route handler must return a response in all code paths
- **M8:** session/validation/report endpoints return the standard shape `{ status, data, message }` with proper status codes (200/201/400/401/404 — never 500 for a validation problem)

### API Base URLs
- Backend API base: `http://localhost:5050`
- Frontend dev server: `http://localhost:5173`
- All `fetch()` calls in React must use the full base URL: `http://localhost:5050/agents` or `http://localhost:5050/users/login`

### Git Commit Conventions
| Prefix | When to use |
|--------|-------------|
| `feat:` | New feature added |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `refactor:` | Code change that doesn't fix a bug or add a feature |
| `chore:` | Build process, config, or tooling changes |

### Branching
- `feature/*` → `dev` → `main` (M7). **M8:** use `mod8/features/*` → `dev` → `main` (coach's naming).
- No direct commits to `main` or `dev`
- One branch per feature (matches the feature spec file names)

---

## Repository Structure

```
Module7/
├── server/                        ← Express backend
│   ├── server.js                  ← Entry point, registers middleware and routes
│   ├── config.env                 ← Environment variables (not committed)
│   ├── db/
│   │   └── connection.js          ← MongoDB Atlas connection, exports db
│   └── routes/
│       ├── agents.js              ← Agent CRUD endpoints (/agents)
│       └── users.js               ← Login endpoint (/users/login)
│
├── client/                        ← React frontend
│   ├── index.html                 ← Single HTML file, app mounts at #root
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx               ← Router setup, app entry point
│       ├── App.jsx                ← Layout: Navbar + Outlet
│       ├── index.css              ← Tailwind base imports
│       └── components/
│           ├── Navbar.jsx         ← Logo + logout/create nav links
│           ├── AgentList.jsx     ← Agent table (home page)
│           ├── AgentForm.jsx         ← Create + Edit form (shared)
│           ├── Login.jsx          ← Login form
│           └── Unauthorized.jsx   ← Error page for failed login
│
├── ai/
│   ├── ai-spec.md                 ← This file
│   └── features/                  ← One file per feature
│
├── PostmanCollection.json
├── README.md
├── CONCEPTS.md
├── Research.md
├── CODEBASE.md
└── LeetCode-Challenges/
```

**M8 — new files (added):**
- `server/db/schemas/session.schema.js`, `server/db/schemas/transaction.schema.js`
- `server/routes/sessions.js` (`POST /session/:user_id`, `GET /validate_token`), `server/routes/transactions.js` (`GET /transaction-data`, `POST /transaction`)
- `server/middleware/auth.js` → `requireSession` (replaces the JWT `requireAuth`)
- `client/src/context/AlertContext.jsx`, `client/src/hooks/useTokenValidation.js`
- `client/src/components/Home.jsx`, `Transactions.jsx`, `ConfirmationModal.jsx`
- `connection.js` adds `sessionsDb` + `transactionsDb` exports; `main.jsx` adds the Bootstrap CSS import + `AlertProvider`

---

## Rules for the AI

- Use **JSX only** — no TypeScript, no `.ts` files
- Use **Tailwind CSS** for all styling — no custom CSS files for new components
- Use the **MongoDB Node.js driver** — do not introduce Mongoose
- Use **React hooks** (`useState`, `useEffect`, `useParams`, `useNavigate`) — no class components
- Use **`fetch()`** for all HTTP requests — do not introduce Axios
- Do **not** add features not listed in this spec or a feature spec
- Reuse existing files and components when possible
- Keep code **junior-friendly** — clear variable names, no advanced patterns
- All JSX component files must use the **`.jsx` extension**
- Server runs on **port 5050**, client runs on **port 5173**
- Agent fields are: `first_name`, `last_name`, `email`, `region`, `rating`, `fee`, `sales` — not `name`, `position`, `level` (the tutorial defaults)
- The `agents` route and `agents` collection name from the tutorial are kept as-is unless a feature spec says otherwise
- **M8:** use React Bootstrap for new UI (Tailwind stays for existing UI); use **UUID** tokens (not JWT) and **cookies** (not `localStorage`); return the exact documented response shapes for `/session` and `/validate_token`; every action toasts and every create/update/delete/submit confirms via a modal first

---

## How to Run / Test the Project

```bash
# Terminal 1 — Start the backend
cd server
node --env-file=config.env server.js

# Terminal 2 — Start the frontend
cd client
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5050
- Environment variables live in `server/config.env` (never commit this file)
- **M8:** install client deps `npm install react-bootstrap bootstrap react-use-cookie uuid`; the `sessions` TTL index is created on server start

### Environment Variables (`server/config.env`)

```
ATLAS_URI=<your MongoDB Atlas connection string>
PORT=5050
```

---

## Definition of Done

The project is complete when all of the following are true:

- [ ] Login page exists and validates credentials against MongoDB
- [ ] Failed login redirects to the unauthorized page
- [ ] Successful login navigates to the agent list
- [ ] Logout button returns user to the login page
- [ ] Home page displays agent table with columns: Full Name, Region, Rating, Fee, Sales, Action
- [ ] Create agent form saves a new agent to MongoDB and it appears in the table
- [ ] Edit agent form pre-populates with existing data and saves changes to MongoDB
- [ ] Delete removes the agent from MongoDB and the table refreshes immediately
- [ ] Rocket Elevators logo, favicon, and page title are applied
- [ ] Clicking the logo navigates back to the agent list
- [ ] Agent schema exists in MongoDB (`agents` or `agents` collection)
- [ ] User schema exists in MongoDB (`users` collection)
- [ ] All CRUD endpoints work end-to-end (verifiable in Postman)
- [ ] Login endpoint works end-to-end (verifiable in Postman)
- [ ] `PostmanCollection.json` exported and in root directory
- [ ] `README.md` complete with all required sections
- [ ] `CONCEPTS.md` lists 3 challenging concepts with explanations
- [ ] All feature branches merged into `dev`, `dev` merged into `main`
- [ ] Only `main` branch is in final state for grading

### M8 — Cross-Feature Rules & Definition of Done (added)

**Cross-feature rules:**
- Every user action shows a toast — **green success / red error, auto-hide after 5 seconds** (Login, Create/Update/Delete Agent, Submit Transaction).
- Every create/update/delete/transaction-submit is preceded by a **confirmation modal** ("Are you sure you want to continue?" → Confirm / Back).
- Every page checks the cookie `session_token` on navigation; no/invalid token → redirect to `/login`; valid → continue and show the user's `first_name`.

**M8 checklist:**
- [ ] Home is the default view after login and shows a card grid (Agent Management + Transactions cards).
- [ ] Toasts on all 5 actions; confirmation modal on all 4 create/update/delete/submit actions.
- [ ] Login creates a session via `POST /session/:user_id`; token stored in a cookie; `sessions` has a 24h TTL index.
- [ ] `GET /validate_token` validates the token and returns the exact shape; redirects work (invalid → login, valid → home).
- [ ] "Create Agent" lives on the Agents page (not the navbar); navbar shows the user's first name.
- [ ] Transactions: last 10 newest-first; columns date · amount · agent full name; amount positive-only; agent dropdown shows id + full name.
- [ ] `/session`, `/validate_token`, `/transaction-data`, `/transaction` work in Postman.
- [ ] No `jsonwebtoken` / `JWT_SECRET`, no `localStorage` token, no `console.log` left.
