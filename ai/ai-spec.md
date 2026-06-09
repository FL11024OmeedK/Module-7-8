# AI_SPEC — RE Admin (Module 8)

> **Read this file first** before implementing any feature, or asking AI to generate any code.
> This is the **project-wide master specification**. It owns the global rules; each feature
> has its own spec file in [`./features/`](./features/) that owns per-feature behavior.
> Always read **this file + the relevant feature file** before starting a feature.
>
> Module 8 is built **on top of** the existing Module 7 MERN app (same repository). It adds
> React-Bootstrap UI, UUID cookie sessions (JWT retired), and a Transactions feature.

---

## 1. Project Identity

- **Project Name:** RE Admin
- **Short Description:** A React MERN single-page admin app for Rocket Elevators employees to manage **agents** (full CRUD) and record **transactions**, protected by a server-side **session** system validated against MongoDB.
- **Project Type:** MERN Full-Stack SPA (MongoDB, Express, React, Node.js). Internal admin panel. No public-facing pages.
- **Client:** Rocket Elevators
- **Developer Role:** Junior Developer at Genesis Solutions
- **Module 8 Theme:** RE Admin → React-Bootstrap edition (sessions, notifications, modals, transactions).

---

## 2. Goal and Scope

### Goal
Extend the internal back-office tool with a card-based home page, global toast notifications, confirmation modals, a cookie-based session/validation system that replaces JWT, and a transactions page — all using React-Bootstrap components, without removing the existing Tailwind/Vite setup.

### In Scope (Module 8 — build now)
The seven Module 8 features, each with its own spec file:

1. **Home Page** — card-grid landing page after login.
2. **Notifications** — global success/error toasts on every action.
3. **Modals** — reusable confirmation modal before creative/destructive actions.
4. **Session Process** — create a UUID session on login, store the token in a cookie, save the session in MongoDB with a 24h TTL.
5. **Validation Process** — validate the session token on every navigation; redirect based on validity.
6. **Header Bar** — React-Bootstrap navbar; move "Create Agent" into the Agents page; show the logged-in user's name.
7. **Transaction Process** — list the last 10 transactions and submit new ones.

### Carried Over From Module 7 (already built — keep working)
Login/logout, agent CRUD (create/read/update/delete), agent + user schemas, Rocket Elevators branding. These remain in the app and must keep working; M8 wires notifications/modals into them. Their original specs stay in [`./features/`](./features/).

### Out of Scope (do NOT build)
- JWT for session auth — **retired this module** (remove `jsonwebtoken`, `Bearer` headers, `localStorage` token).
- Mongoose (use the raw MongoDB Node.js driver).
- TypeScript (JSX only).
- User registration / user-management UI.
- New auth providers, OAuth, password hashing.
- Removing or replacing Tailwind (React-Bootstrap is **additive**).
- Any extra feature not listed in this spec or a feature spec.
- Report page / `GET /report-data` — **Extra Mile only**, attempt only after all main features are complete.

---

## 3. Architectural Decisions (locked in)

1. **Auth = UUID cookie sessions; JWT retired.**
   - `POST /users/login` validates credentials and returns the user (id + name). It no longer mints a token.
   - The client then calls `POST /session/:user_id`, which generates a `uuidv4()` token, stores a session in the `sessions` collection, and returns the token.
   - The token is stored in a **client-side cookie** via `react-use-cookie`.
   - Protected API routes and every page navigation validate the token against the `sessions` collection.
2. **React-Bootstrap is additive, not a rewrite.** Keep Vite + Tailwind. Use React-Bootstrap components for the new surfaces (Home cards, Navbar, Toasts, Modals, Transaction table/form). Bootstrap CSS is imported once in `client/src/main.jsx`.
3. **New MongoDB collections** follow the existing per-resource database pattern (`client.db("agents")`, `client.db("users")`): add `sessionsDb = client.db("sessions")` and `transactionsDb = client.db("transactions")` exports in `connection.js`. Collections: `sessions` and `transactions`.
4. **TTL on sessions:** create the index once at startup — `sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 })` (24h auto-expiry).
5. **Agent full name on the transaction table = join on the frontend.** The transactions table maps `agent_id → "first_name last_name"` from the agents already fetched for the dropdown. No `$lookup`.
6. **Token transport:** because the cookie is client-side, protected requests send the token in a way the middleware reads (query param or header), and `GET /validate_token` receives it as `?token=`. Be consistent everywhere.

---

## 4. Tech Stack & Constraints

### Frontend
- React 19 (JSX only — no TypeScript)
- React Router v7 (`react-router-dom`)
- **React-Bootstrap 2 + Bootstrap 5** (new UI surfaces)
- **`react-use-cookie`** (session token cookie)
- **`uuid`** (token generation, if generated client-side; tokens are generated server-side with `uuid` as well)
- Tailwind CSS v3 (existing styling — kept)
- Vite (build tool / dev server)

### Backend
- Node.js + Express 5
- MongoDB Atlas + MongoDB Node.js Driver (no Mongoose)
- `uuid` for session tokens
- `cors`, `--env-file` for env loading

### NOT Allowed
- `jsonwebtoken` / JWT for sessions (removed this module)
- `localStorage` for the auth token (use the cookie)
- Mongoose, TypeScript, Axios (use native `fetch()`)
- Class-based React components
- Any database other than MongoDB Atlas, any backend framework other than Express

---

## 5. Coding Standards & Conventions

### Naming
| Type | Convention | Example |
|------|------------|---------|
| JS variables / functions | camelCase | `showAlert`, `validateToken` |
| React components | PascalCase | `Home`, `ConfirmationModal` |
| Component files | PascalCase + `.jsx` | `Transactions.jsx` |
| Hooks | camelCase `use*` + `.js` | `useTokenValidation.js` |
| Non-component JS files | camelCase + `.js` | `connection.js`, `sessions.js` |
| MongoDB collections | camelCase plural | `agents`, `sessions`, `transactions` |
| Environment variables | UPPER_SNAKE_CASE | `ATLAS_URI`, `PORT` |
| Git branches | `mod8/features/<feature-name>` | `mod8/features/transaction-process` |

### Module system
- **ES Modules only** (`import` / `export`). Never `require()` / `module.exports`. Both `server/` and `client/` use `"type": "module"`.

### Code style
- All async work uses `async/await` with `try/catch`.
- No `console.log()` left in committed code. No secrets committed.
- Destructure `req.body` explicitly — never spread it into DB operations.
- Every route handler returns a response in **all** code paths, with the **correct status code** (200/201 success, 400 bad input, 401 unauthorized, 404 not found — never a 500 for a validation problem).
- New UI uses React-Bootstrap components; no inline styles.

### Standard API response shape (sessions / validation / report)
```json
{ "status": "ok", "data": { /* ... */ }, "message": "..." | null }
```
These exact shapes are graded — see §8.

### Git commit prefixes
`feat:` · `fix:` · `docs:` · `refactor:` · `chore:`

### Branching
- `mod8/features/*` → `dev` → `main`. One branch per feature.
- **No direct commits to `main`.** Final step only: merge `dev` → `main`. Only `main` is graded.

---

## 6. Repository Structure

```
Module7&8/
├── server/                              ← Express backend
│   ├── server.js                        ← registers routes + requireSession middleware
│   ├── config.env                       ← env vars (NOT committed)
│   ├── seed.js                          ← seeds agents/users
│   ├── db/
│   │   ├── connection.js                ← Mongo connection; exports agentsDb, usersDb,
│   │   │                                   sessionsDb (NEW), transactionsDb (NEW)
│   │   └── schemas/
│   │       ├── agent.schema.js
│   │       ├── user.schema.js
│   │       ├── session.schema.js        ← NEW { session_token, user, createdAt }
│   │       └── transaction.schema.js    ← NEW { date, amount, agent_id }
│   ├── middleware/
│   │   └── auth.js                      ← requireSession (replaces JWT requireAuth)
│   └── routes/
│       ├── agents.js                    ← agent CRUD (/agents)
│       ├── users.js                     ← POST /users/login (no JWT)
│       ├── sessions.js                  ← NEW POST /session/:user_id, GET /validate_token
│       └── transactions.js              ← NEW GET /transaction-data, POST /transaction
│
├── client/                              ← React frontend
│   └── src/
│       ├── main.jsx                     ← Router + AlertProvider + Bootstrap CSS import
│       ├── App.jsx                      ← Layout: Navbar + Outlet + useTokenValidation
│       ├── index.css
│       ├── context/
│       │   └── AlertContext.jsx         ← NEW global toast provider (showAlert)
│       ├── hooks/
│       │   └── useTokenValidation.js    ← NEW validates token, gates navigation
│       └── components/
│           ├── Navbar.jsx               ← RB Navbar; username shown; no Create Agent link
│           ├── Home.jsx                 ← NEW card-grid landing page
│           ├── AgentList.jsx            ← agent table + Create Agent button
│           ├── AgentForm.jsx            ← create + edit agent (shared)
│           ├── Transactions.jsx         ← NEW transaction table + form
│           ├── ConfirmationModal.jsx    ← NEW reusable confirm modal
│           ├── Login.jsx                ← validates creds, creates session, sets cookie
│           └── Unauthorized.jsx
│
├── ai/
│   ├── ai-spec.md                       ← This file
│   └── features/                        ← M7 + M8 feature specs
├── PostmanCollection.json
├── README.md
├── CONCEPTS.md
└── LeetCode-Challenges/
```

> Files marked **NEW** are created during Module 8.

---

## 7. Feature Index

Always read this file **and** the relevant feature file before implementing.

### Module 8 features
- [`./features/home-page.feature.md`](./features/home-page.feature.md) — card-grid home page
- [`./features/notifications.feature.md`](./features/notifications.feature.md) — global success/error toasts
- [`./features/modals.feature.md`](./features/modals.feature.md) — reusable confirmation modal
- [`./features/session-process.feature.md`](./features/session-process.feature.md) — UUID sessions, cookie, TTL
- [`./features/validation-process.feature.md`](./features/validation-process.feature.md) — token validation + redirects
- [`./features/header-bar.feature.md`](./features/header-bar.feature.md) — navbar refinements
- [`./features/transaction-process.feature.md`](./features/transaction-process.feature.md) — transactions list + form

### Module 7 features (carried over)
- [`./features/schemas.feature.md`](./features/schemas.feature.md) · [`company-info`](./features/company-info.feature.md) · [`crud-read`](./features/crud-read.feature.md) · [`crud-create`](./features/crud-create.feature.md) · [`crud-update`](./features/crud-update.feature.md) · [`crud-delete`](./features/crud-delete.feature.md) · [`login-logout`](./features/login-logout.feature.md)

---

## 8. Pages, Routes & API Endpoints

### Frontend routes (React Router)
| Route | Component | Description |
|-------|-----------|-------------|
| `/login` | `Login` | Login form — entry point; standalone (no Navbar) |
| `/unauthorized` | `Unauthorized` | Shown on failed login |
| `/` (index) | `App > Home` | **Default view after login** — card grid |
| `/agents` | `App > AgentList` | Agent table + Create Agent button |
| `/transactions` | `App > Transactions` | Transaction table + form |
| `/create` | `App > AgentForm` | Create agent |
| `/edit/:id` | `App > AgentForm` | Edit agent |

All routes under `App` validate the session token on navigation.

### Backend API endpoints (Express)
| Method | Endpoint | Body / Params | Description |
|--------|----------|---------------|-------------|
| `POST` | `/users/login` | `{ email, password }` | Validate credentials; return user (no token) |
| `POST` | `/session/:user_id` | — | Create session, return UUID token |
| `GET` | `/validate_token` | `?token=` | Validate token against `sessions` |
| `GET` | `/agents` | — | All agents *(protected)* |
| `GET` | `/agents/:id` | — | One agent *(protected)* |
| `POST` | `/agents` | agent fields | Create agent *(protected)* |
| `PATCH` | `/agents/:id` | agent fields | Update agent *(protected)* |
| `DELETE` | `/agents/:id` | — | Delete agent *(protected)* |
| `GET` | `/transaction-data` | — | Last 10 transactions, newest first *(protected)* |
| `POST` | `/transaction` | `{ amount, agent_id }` | Create transaction; amount must be positive *(protected)* |
| `GET` | `/report-data` | — | *(Extra Mile)* chart data |

### Exact response shapes (graded — match verbatim)
**`POST /session/:user_id`**
```json
{ "status": "ok", "data": { "token": "<uuid>" }, "message": "session saved successfully" }
```
**`GET /validate_token?token=...`** — valid:
```json
{ "status": "ok", "data": { "valid": true, "user": { "first_name": "...", "last_name": "...", "id": "..." } }, "message": null }
```
invalid: `"valid": false`, `"user": null`.

**`GET /transaction-data`** → array of the last 10 transaction objects, sorted most-recent-first.

**`GET /report-data`** *(Extra Mile)*
```json
{ "status": "ok", "data": { "agent_bar_data": [], "transaction_line_data": [] }, "message": null }
```

---

## 9. Data & Models

### `agents` collection (existing)
`_id` · `first_name` · `last_name` · `email` · `region` (North/East/South/West) · `rating` (0–100) · `fee` (Number) · `sales` (Number, default 0)

### `users` collection (existing)
`_id` · `first_name` · `last_name` · `email` (login) · `password` (plain text — no hashing). Users are created manually; no registration UI.

### `sessions` collection (NEW)
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Auto |
| `session_token` | String | `uuidv4()`, unique |
| `user` | Object | `{ id, first_name, last_name }` — enough for `validate_token` to return the user |
| `createdAt` | Date | `new Date()`; TTL index expires the doc after 86400s (24h) |

### `transactions` collection (NEW)
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Auto |
| `date` | Date | `new Date()` at insert time |
| `amount` | Number | **Positive only** (reject 0 / negative with 400) |
| `agent_id` | String | References an agent's id; full name is joined on the frontend |

---

## 10. Cross-Feature Rules (apply to every feature)

1. **Notifications:** every user action shows a **success toast** on success and an **error toast** on failure — Login, Create Agent, Update Agent, Delete Agent, Submit Transaction. Use React-Bootstrap `Toast` (`bg="success"` green / `bg="danger"` red), `autohide`, `delay={5000}`. Toasts are driven by a global `AlertContext` (no prop-drilling).
2. **Modals:** every **creative/destructive** action shows a **confirmation modal first** — Create Agent, Update Agent, Delete Agent, Submit Transaction. One reusable `ConfirmationModal` (body "Are you sure you want to continue?", buttons **Confirm / Back**).
3. **Token validation on navigation:** every page under the `App` layout validates the cookie token via `GET /validate_token`. Invalid/missing → redirect to `/login`; valid → render and expose the user (navbar shows `first_name`). `Login` / `Unauthorized` stay outside the guarded layout.
4. **Response shapes:** session/validation/report endpoints return the **exact** JSON in §8.
5. **Consistency:** endpoint paths, env var names, and ports are identical across this spec, the feature specs, the README, the code, and Postman.
6. **No** `console.log`, **no** committed secrets, **ES Modules** only, proper HTTP status codes everywhere.

---

## 11. How to Run

```bash
# Terminal 1 — backend
cd server
npm run dev            # nodemon --env-file=config.env server.js   (port 5050)

# Terminal 2 — frontend
cd client
npm run dev            # Vite dev server                            (port 5173)
```
- Frontend: http://localhost:5173 · Backend API: http://localhost:5050
- The `sessions` TTL index is created on server start.

### Environment variables (`server/config.env`)
```
ATLAS_URI=<your MongoDB Atlas connection string>
PORT=5050
```
> `JWT_SECRET` is **removed** this module (JWT retired). Do not leave a stale variable.

---

## 12. Global Definition of Done

The module is complete when **all** of the following are true:

**Project setup**
- [ ] Work done on `mod8/features/*` branches → `dev`; final `dev → main` is the only thing touching `main`; only `main` is in final graded state.
- [ ] React-Bootstrap installed and its components actively used.
- [ ] `PostmanCollection.json` (root) covers every endpoint, params pre-filled, runs top-to-bottom with zero edits.
- [ ] `README.md` complete (title, description, tech stack, structure, setup, env vars, API docs, author) and consistent with the code.
- [ ] `submission-summary.md` prepared (NOT committed).

**Specs**
- [ ] This global spec contains: project identity + scope, architecture/repo structure, allowed tech & constraints, coding standards, global Definition of Done + cross-feature rules.
- [ ] All 7 M8 feature specs exist in `./ai/features/` with the exact filenames.

**Home page**
- [ ] Home is the default view after login and shows a grid of cards.
- [ ] Agent Management card navigates to the agent table; Transaction card navigates to the transaction page.

**Notifications** — success + error toasts on Login, Create/Update/Delete Agent, Submit Transaction (5s autohide, green/red).

**Modals** — confirmation modal before Create/Update/Delete Agent and Submit Transaction.

**Session process**
- [ ] On login success a session is created via `POST /session/:user_id` and stored in `sessions` with all required fields.
- [ ] Each session has a unique, valid UUID token.
- [ ] `sessions` has a TTL index (`expireAfterSeconds: 86400`).
- [ ] `POST /session/:user_id` returns the exact response shape.
- [ ] The token is stored in a cookie after creation.
- [ ] Every page checks for a valid `session_token`.

**Validation process**
- [ ] Validation checks MongoDB for the session and token validity.
- [ ] `GET /validate_token` receives the token as a query param and returns the exact response shape.
- [ ] No/invalid token → redirect to login; valid token → redirect to the admin home page.

**Header bar**
- [ ] "Create Agent" moved out of the navbar into the Agent Management page.
- [ ] The logged-in user's name appears in the navbar.

**Transaction process**
- [ ] `GET /transaction-data` returns the last 10 transactions in the correct format, sorted newest-first.
- [ ] `POST /transaction` saves `{ date, amount, agent_id }`; accepts `amount` + `agent_id`; rejects non-positive amounts.
- [ ] Transaction page shows the last 10 in a table with columns **date · amount · agent full name**.
- [ ] Amount input accepts positive numbers only; agent dropdown lists agents by name and ID.

**Technical interview**
- [ ] `CONCEPTS.md` lists 3 challenging M8 concepts (name, purpose, why challenging, file+line).
- [ ] LeetCode screenshots in `./LeetCode-Challenges/`.
- [ ] Concept, problem-solving, and technical-demo videos recorded (unlisted) and linked in the submission summary.

**Cleanup**
- [ ] No `jsonwebtoken` import or `JWT_SECRET` left; no `localStorage` auth token anywhere; no `console.log`.

---

## 13. Rules for the AI

- JSX only; React-Bootstrap for new UI; Tailwind kept for existing UI.
- MongoDB Node.js driver only (no Mongoose); `fetch()` only (no Axios).
- React hooks only (no class components).
- Do **not** add features outside this spec or a feature spec; reuse existing files/components.
- Keep code junior-friendly: clear names, no advanced patterns.
- Server runs on **5050**, client on **5173**.
- Agent fields are `first_name, last_name, email, region, rating, fee, sales`.
- Session/validation/report endpoints must return the **exact** documented JSON.
- Never commit secrets or `config.env`.
