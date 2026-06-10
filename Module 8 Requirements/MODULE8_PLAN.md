# Module 8 (FSO-1608) — 3-Day Plan to 100%

> RE Admin → React-Bootstrap edition. Built **on top of** the existing Module 7 MERN app
> (Express 5 + native MongoDB driver + React 19 + Vite + react-router-dom 7).
> Goal: every graded line item satisfied **and** real understanding of each concept.
>
> This file is a working checklist — delete it before the final `dev → main` merge if you
> don't want it in the graded repo (it is not a required deliverable).

> **Repository & branching:** You can keep using the same repository and start your Module 8
> work on a new branch, for example: `mod8/features/feature-name`. Once the feature is
> completed, merge it into the `dev` branch and eventually into `main`.
>
> Because we're **reusing the Module 7 repo**, the grading sheet's *"GitHub Repository Setup —
> create a new private repository"* requirement is **N/A** (that row has been removed from our
> copy of the sheet). The "add all coaches as collaborators" half still applies, but it's
> already satisfied — the coaches are collaborators from Module 7. Verify they still have access.

> **How I'm working this module (learning-first):** one feature at a time, in **FSD grading-sheet
> order** — Home Page → Notifications → Modals → Session → Validation → Header Bar → Transactions.
> Each feature is a ticket: re-read its grading rows → write its `ai/features/<name>.feature.md`
> spec → build → read every line + test → PR into `dev`. The goal is to **learn each feature on
> its own, not to build it perfectly the first time** — **rework is expected** and is part of the
> learning. I'll **flag each rework point as we hit it** rather than pre-solving it. (The detailed
> per-feature sections further down were written in a different order; we follow the order above
> and update each section as we build it.) Setup + global `ai-spec.md` are already done, on
> `mod8/features/react-bootstrap-setup` and `mod8/features/ai-specs`.

---

## 0. Ground rules I'm carrying over from your Module 7 feedback

These are the things that cost points last time. Each is a hard rule for this module.

| M7 mistake | M8 rule |
|---|---|
| `feature/crud-create` merged **directly into main**, bypassing dev (FSO-1607) | **Never** commit/merge to `main` except the final `dev → main`. Every feature: `mod8/features/* → dev`. |
| AI-spec missing **Coding Standards** + **Definition of Done** (flagged in 4 modules) | `ai/ai-spec.md` MUST contain both, as their own labelled sections. |
| Feature-spec **filenames didn't match** the required names (FSO-1604/1605) | Use the **exact** filenames from the grading sheet (listed in Day 1). |
| Spec ↔ README ↔ code **endpoint/env contradictions** (FSO-1603/1605/1607) | One source of truth. Endpoint paths, env var names, ports identical everywhere. |
| Video **didn't demonstrate the AI spec docs / schemas** → "No" verdict (FSO-1607) | Demo walks each spec file + each new collection explicitly, requirement-by-requirement. |
| Validation/error gaps: 500 instead of 400/404, no field checks (FSO-1605, 84%) | New endpoints return proper status codes + the **exact response shapes** the sheet prints. |
| Postman missing an implemented endpoint (FSO-1605) | Postman covers **every** endpoint, all params pre-filled, runs with zero edits. |
| README env example didn't match env table (JWT_SECRET) (FSO-1607) | `.env`/`config.env` example in README == the variables table, exactly. |

**Soft-skills (graded, can fail the module):** post **2 progress updates** to your coach this week, book **1 project review before Friday**, reply within 24h. Put reminders in now.

---

## Architectural decisions (read once, lock in)

1. **Auth = UUID cookie sessions, JWT retired.**
   - Login validates credentials (`POST /users/login`), then `POST /session/:user_id` creates a session and returns a UUID token.
   - Token is stored in a **cookie** via `react-use-cookie` (client-side; no cross-origin `Set-Cookie` headaches).
   - Protected routes + every page navigation validate the token against the **`sessions` collection** in Mongo.
   - Remove `jsonwebtoken`, `localStorage.getItem("token")`, and the `Bearer` header logic. (Keeps spec ↔ code honest.)
2. **React-Bootstrap is additive, not a rewrite.** Keep Vite/Tailwind running; introduce `react-bootstrap` + `bootstrap` CSS and use its components for the **new** surfaces (Home cards, Toasts, Modals, Transaction table/form, Navbar). You only need to *actively use* RB components — you don't have to rip out Tailwind.
3. **New Mongo collections:** `sessions` (TTL 24h) and `transactions`. Decide DB now: simplest is a single `re_admin` db, but to match the existing split you can add `sessionsDb` and `transactionsDb` exports in `connection.js`. **Pick one and use it everywhere.**
4. **Agent full name on the transaction table** = join on the **frontend** (you already fetch agents for the dropdown) by mapping `agent_id → first_name last_name`. No `$lookup` needed.
5. **Token transport:** since the cookie is client-side, send the token as a **query param / header your middleware reads** on protected calls, and as `?token=` on `GET /validate_token`. Be consistent.

---

# DAY 1 — Understand, specify, scaffold the UI shell

> Theme: do the AI-native workflow *properly* (read → question → spec → then code).
> By end of day: all 7 feature specs written, React-Bootstrap installed, Home page + Navbar +
> Toast + Modal **shells** rendering. No backend session/transaction logic yet.

### 1.1 Read & confirm understanding (30–45 min) — *do not skip*
- [ ] Re-read all three Module 8 PDFs + the grading sheet + `Using Spec Docs.txt`.
- [ ] Skim every file in `server/` and `client/src/` again (you know it, but confirm the auth flow you're about to change).
- [ ] Write down any ambiguity to ask your coach (e.g., "is JWT removal acceptable?"). This *is* the AI-native first step the course grades you on.

### 1.2 Branch hygiene + dependencies
- [ ] `git checkout dev && git pull`
- [ ] Install client deps (run in `client/`):
  - `npm install react-bootstrap bootstrap react-use-cookie uuid`
- [ ] (Optional) `recharts` later for the extra-mile report. Don't install yet.
- [ ] Import Bootstrap CSS once in `client/src/main.jsx`: `import "bootstrap/dist/css/bootstrap.min.css";`
- [ ] Commit dep changes on a setup branch: `mod8/features/react-bootstrap-setup` → PR into `dev`.
  - **Why a branch:** the sheet grades "React Bootstrap Installed" and the branch model. This makes both visible in history.

### 1.3 Write the Global AI Spec — `ai/ai-spec.md`
You already have a strong M7 `ai/ai-spec.md`. **Update it for M8**, ensuring it contains, as labelled sections:
- [ ] Project identity + scope (**in scope**: the 7 features; **out of scope**: Mongoose, JWT-for-sessions, new auth providers, etc.)
- [ ] Architecture / repo structure (annotated tree incl. the *new* files you'll add)
- [ ] Allowed tech & constraints (React-Bootstrap, react-use-cookie, uuid, Mongo TTL, toasts 5s, positive amounts, **ES Modules** — keep this consistent, it bit a peer)
- [ ] **Coding standards / conventions** (naming: camelCase JS, kebab-case files, component PascalCase; response shape; commit prefixes) ← *the section you keep losing points for*
- [ ] **Global Definition of Done + cross-feature rules** (every action toasts; every destructive/creative action confirms via modal; every page validates token; no `console.log`; no secrets) ← *also frequently missing*
- [ ] Line at top: "Read this before implementing any feature."

### 1.4 Write the 7 Feature Specs — **exact filenames**
Each spec needs all five parts: **goal+scope · requirements/user-flow · interfaces (pages/components/endpoints) · data+validations+behavior · acceptance criteria**. Write them *before* coding each feature.

- [ ] `ai/features/home-page.feature.md`
- [ ] `ai/features/notifications.feature.md`
- [ ] `ai/features/modals.feature.md`
- [ ] `ai/features/session-process.feature.md`
- [ ] `ai/features/validation-process.feature.md`
- [ ] `ai/features/header-bar.feature.md`
- [ ] `ai/features/transaction-process.feature.md`

> Tip: put the **exact response shapes** from the grading sheet into the session/validation/transaction specs verbatim, so your code and Postman can be checked against them. Commit specs on `mod8/features/ai-specs` → `dev` (or include each spec in its feature branch — either is fine, just consistent).

### 1.5 Feature — Home Page (Card Grid)  → branch `mod8/features/home-page`
Satisfies: *Home Page – Create / Agent Management Card / Transaction Card.*
- [ ] Create `client/src/components/Home.jsx` using RB `Container`, `Row`, `Col`, `Card`, `Button`.
- [ ] Two cards: **Agent Management** (`navigate("/agents")`) and **Transactions** (`navigate("/transactions")`).
- [ ] Rework routes in `main.jsx`:
  - `/` (index) → `Home` (the post-login landing page)
  - `/agents` → `AgentList`
  - `/transactions` → `Transactions` (built Day 2)
  - keep `/create`, `/edit/:id`
- [ ] Verify: after login you land on Home; each card navigates correctly.

### 1.6 Feature — Header Bar refinements  → branch `mod8/features/header-bar`
Satisfies: *Create Agent button moved out of navbar; username in navbar.*
- [ ] Convert `Navbar.jsx` to RB `Navbar`/`Nav`/`Container`.
- [ ] **Remove** the "Create Agent" link from the navbar.
- [ ] Add "Create Agent" `Button`/`Link` **inside the Agent Management page** (`AgentList`).
- [ ] Show logged-in user's **first_name** in the navbar (placeholder for now; wired to `validate_token` user object on Day 2).
- [ ] Keep Logout (will clear the cookie + ideally delete the session on Day 2).

### 1.7 Feature — Notifications shell (AlertContext + Toasts)  → branch `mod8/features/notifications`
Satisfies the *Notifications* group (wired into actions Day 2).
- [ ] Create `client/src/context/AlertContext.jsx`: a context + provider exposing `showAlert(message, variant)` and holding a list/one toast.
- [ ] Render RB `ToastContainer` + `Toast` (`bg="success"` green / `bg="danger"` red), **`autohide` + `delay={5000}`**.
- [ ] Wrap the router/app in `AlertProvider` (in `main.jsx`).
- [ ] Verify with a temporary test button that fires a green and a red toast that auto-dismiss after 5s.

### 1.8 Feature — Modals shell (reusable ConfirmationModal)  → branch `mod8/features/modals`
Satisfies the *Modals* group (wired into actions Day 2).
- [ ] Create `client/src/components/ConfirmationModal.jsx` using RB `Modal`: props `show`, `onConfirm`, `onCancel`, `message`, body "Are you sure you want to continue?", buttons **Confirm / Back**.
- [ ] Verify it opens/closes from a temporary trigger.

**End-of-Day-1 commit + PR each feature branch into `dev`. Push. Post progress update #1 to coach.**

---

# DAY 2 — Sessions, Validation, Transactions, and wiring it all together

> Theme: the real logic. By end of day every required endpoint exists, sessions/cookies work,
> token validation gates navigation, transactions work, and **every action shows a toast after a
> confirmation modal**.

### 2.1 Backend — Session collection + TTL + endpoints  → branch `mod8/features/session-process`
Satisfies: *Session – Saved on Login / Token Generated / TTL 24h / Endpoint Response Format / Token in Cookie / Token Check on Navigation* (backend half).
- [ ] Add `sessions` collection export in `server/db/connection.js` (e.g. `sessionsDb`).
- [ ] Create the **TTL index** once at startup: `createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 })`.
- [ ] Create `server/db/schemas/session.schema.js` factory: `{ session_token, user, createdAt }` (user = `{ id, first_name, last_name }` or just id — store enough for validate_token to return `{first_name,last_name,id}`).
- [ ] Create `server/routes/sessions.js`:
  - `POST /session/:user_id` → generate `uuidv4()`, insert session, respond **exactly**:
    `{ status: "ok", data: { token: "<uuid>" }, message: "session saved successfully" }`
  - `GET /validate_token?token=...` → look up session; respond **exactly**:
    `{ status: "ok", data: { valid: <bool>, user: { first_name, last_name, id } }, message: null }`
    (when invalid: `valid:false`, `user:null`).
- [ ] Register in `server.js`: `app.use("/session", sessions)` and the validate route.
- [ ] **Retire JWT:** replace `requireAuth` (Bearer/JWT) with a `requireSession` middleware that reads the token (query/header) and checks the `sessions` collection. Protect `/agents` and `/transactions` with it. Remove `jsonwebtoken` from `users.js` / `package.json`.
- [ ] `POST /users/login` now: validate creds → return user id/first_name (login no longer mints the token; the client calls `POST /session/:user_id`). Keep the response shape simple and documented.
- [ ] Test all three in Postman before touching the client.

### 2.2 Frontend — cookies + validation hook  → same `mod8/features/session-process` (or `mod8/features/validation-process`)
Satisfies: *Validation – Logic / params / return format / redirect-if-invalid / redirect-if-valid*, and *Session – cookie + navigation*.
- [ ] In `Login.jsx`: on success → `POST /session/:user_id` → `useCookie('token')` `setToken(data.token)` → `navigate("/")`. Add **success/error toasts**.
- [ ] Remove every `localStorage.getItem("token")` / `setItem` across `Login`, `Navbar`, `AgentList`, `AgentForm`; read the cookie instead.
- [ ] Create `client/src/hooks/useTokenValidation.js`: reads cookie token → `GET /validate_token?token=` → if `!valid` `navigate("/login")`; expose the returned `user` so the navbar can show `first_name`.
- [ ] Call the hook in the `App` layout (runs on every page under the layout). Login/Unauthorized stay outside it.
- [ ] Logout: clear cookie (and optionally `DELETE` the session) → `/login`.
- [ ] Verify: deleting the cookie or tampering the token bounces you to `/login`; valid token shows the dashboard and your first name.

### 2.3 Backend — Transactions  → branch `mod8/features/transaction-process`
Satisfies: *Transactions – GET /transaction-data / POST /transaction / object structure / params.*
- [ ] Add `transactions` collection export in `connection.js`.
- [ ] `server/db/schemas/transaction.schema.js` factory: `{ date: new Date(), amount: Number, agent_id }`.
- [ ] `server/routes/transactions.js`:
  - `GET /transaction-data` → last 10, **sorted most-recent first** (`.sort({ date: -1 }).limit(10)`).
  - `POST /transaction` → body `{ amount, agent_id }`; **validate amount is a positive number** (return 400 otherwise); insert; respond success.
- [ ] Register with `requireSession` protection.
- [ ] Postman-test both.

### 2.4 Frontend — Transaction page  → same transaction branch
Satisfies: *Transaction – List Displayed / Table Columns / Sorted / Amount positive only / Agent dropdown.*
- [ ] Create `client/src/components/Transactions.jsx`:
  - RB `Table`: columns **date · amount · agent full name** (map `agent_id` → name from the agents fetch).
  - RB `Form`: number input (`min` / validation, **positive only**), agent `Form.Select` dropdown showing **"id — Full Name"**, submit button.
  - On submit → **ConfirmationModal** → `POST /transaction` → refetch list → **toast**.
- [ ] Verify last-10 + most-recent-first ordering after several inserts.

### 2.5 Wire Modals + Toasts into ALL actions (cross-cutting)
Satisfies the full *Notifications* and *Modals* requirement groups.
- [ ] **Create Agent**: confirm modal → POST → success/error toast.
- [ ] **Update Agent**: confirm modal → PATCH → success/error toast.
- [ ] **Delete Agent**: confirm modal → DELETE → success/error toast.
- [ ] **Submit Transaction**: confirm modal → POST → success/error toast.
- [ ] **Login**: success toast on login, error toast on bad credentials (replace the `/unauthorized` redirect-only flow, or keep it *and* toast).
- [ ] Quick matrix test: 5 actions × (success + error) = 10 toasts; 4 actions × confirm modal.

**End-of-Day-2: PR each feature branch → `dev`. Push. Smoke-test the whole app end-to-end. Post progress update #2; confirm your project-review slot before Friday.**

---

# DAY 3 — Extra mile, docs, deliverables, videos, ship

> Theme: turn "working" into "100% + polished + demonstrable."

### 3.1 (Optional but high-value) Extra Mile — Report page  → branch `mod8/features/extra-miles`
> Only after **all** main features are done (the sheet only counts extra miles if mains are complete).
Satisfies: *Report Page & Visualizations / GET /report-data.*
- [ ] `npm install recharts` (client).
- [ ] Backend `GET /report-data` → **exact shape**:
  `{ status: "ok", data: { agent_bar_data: [...], transaction_line_data: [...] }, message: null }`
  - `agent_bar_data`: total transactions (or summed amount) **per agent** (aggregate over `transactions`).
  - `transaction_line_data`: **daily totals for the past 14 days**.
- [ ] `Report.jsx`: bar chart (per agent) + line chart (14-day) using recharts; add a Home card or nav link to it.
- [ ] PR → `dev`.

### 3.2 Deliverable — README.md (hit every sub-point)
Rebuild/extend the README so a stranger can clone & run. Required sections + the M7 lessons:
- [ ] **Project Title + Description**
- [ ] **Tech Stack** (add React-Bootstrap, react-use-cookie, uuid, recharts; include versions)
- [ ] **Project Structure** (annotated tree — include the **new** files; keep it accurate)
- [ ] **Installation / Setup** — numbered, copy-pasteable: prerequisites (Node version, Mongo Atlas), `git clone`, `cd client && npm i`, `cd server && npm i`, env setup, `node --env-file=config.env seed.js`, run both dev servers. Mention the TTL index is created on server start.
- [ ] **Environment Variables** — the `config.env` example **must match** the variable table exactly (`ATLAS_URI`, `PORT`; note JWT_SECRET removed if you retire JWT — don't leave a stale var).
- [ ] **API Documentation** — every endpoint: method, path, params/body, **success AND error** response examples, status codes. Include `/session`, `/validate_token`, `/transaction-data`, `/transaction`, (`/report-data`), plus existing agents/login.
- [ ] **Author**
- [ ] Final consistency pass: endpoint paths/env names/port identical in README ↔ specs ↔ code.

### 3.3 Deliverable — Postman collection
- [ ] Add requests for **all** new endpoints (login, session, validate_token, agents CRUD, transaction-data, transaction, report-data).
- [ ] Pre-fill all params/bodies; use a collection variable for `{{token}}` (set it from a login/session call) so it runs top-to-bottom with **zero edits**.
- [ ] Export as `PostmanCollection.json` to repo **root** (overwrite the M7 one).

### 3.4 Deliverable — CONCEPTS.md + concept video
- [ ] Pick **3 genuinely challenging M8 concepts**, e.g.:
  1. **React Context for global state** (AlertContext driving toasts) — why prop-drilling fails here.
  2. **Cookie-based UUID sessions + MongoDB TTL** — stateless JWT vs server-side session lookup; how TTL auto-expires.
  3. **A custom hook gating navigation** (`useTokenValidation`) — effect timing, redirect logic.
- [ ] For each: name · purpose in project · why challenging · **usage location (file + line)**.
- [ ] Record 5–10 min explaining them in your own words (M7 note: be concise, precise terms, explain *why* not *what*). Upload **unlisted** to YouTube.

### 3.5 Deliverable — LeetCode (JS this time, not SQL)
Solve, screenshot to `./LeetCode-Challenges/<challenge-name>.png`:
- [ ] Function Composition — https://leetcode.com/problems/function-composition/
- [ ] Memoize — https://leetcode.com/problems/memoize/
- [ ] Debounce — https://leetcode.com/problems/debounce/
- [ ] Allow One Function Call — https://leetcode.com/problems/allow-one-function-call/
- [ ] Climbing Stairs — https://leetcode.com/problems/climbing-stairs/
- [ ] Record 5–10 min explaining the **reasoning** (Memoize/Debounce tie directly to your CONCEPTS picks — reuse that understanding). Upload unlisted.

### 3.6 Deliverable — Technical Demo & Code Overview video
> This is where M7 lost a "Yes" — make it **requirement-by-requirement** and **show the spec docs + collections**.
- [ ] Part 1 (UI + Postman + MongoDB): demo each of the 7 features; show the `sessions` doc with TTL, the `transactions` docs, Postman hitting `/session` and `/validate_token` and seeing the exact response shapes.
- [ ] Part 2 (code): project structure, then walk **each `ai/features/*.feature.md`** and the matching code (AlertContext, ConfirmationModal, session route, useTokenValidation, transactions).
- [ ] Name each grading requirement out loud as you show it. Upload unlisted.

### 3.7 Ship it — branching finale (get this exactly right)
- [ ] Confirm **all** `mod8/features/*` branches are merged into `dev`.
- [ ] `git checkout main && git merge dev` (the **only** thing that touches main). Push.
- [ ] Verify `main` builds/runs and reflects the final state. **Only `main` is graded.**
- [ ] (Optional) delete `MODULE8_PLAN.md` before this merge if you don't want it in the graded repo.

### 3.8 Deliverable — submission-summary (NOT committed to GitHub)
- [ ] Create `submission-summary.md` **outside** the repo (or gitignored): Student name, Module name, repo link, all video links (direct, not channel — M7 note), any credentials (.env values, login).
- [ ] Submit through the platform before **Friday 11:59 PM**.

---

## Master requirement → where it's done (quick audit before submitting)

- Project setup: repo/collaborators ✔, branch model (Day 1 branches + Day 3 finale), React-Bootstrap (1.2/1.5–1.8), Postman (3.3), README (3.2), submission summary (3.8)
- AI specs: global (1.3), 7 feature specs (1.4)
- Home page: 1.5 · Notifications: 1.7 + 2.5 · Modals: 1.8 + 2.5 · Session: 2.1–2.2 · Validation: 2.1–2.2 · Header bar: 1.6 + 2.2 · Transactions: 2.3–2.4
- Technical interview: CONCEPTS (3.4), LeetCode (3.5), demo video (3.6)
- Deadline: Friday (3.8) · Extra mile: report (3.1) · Soft skills: updates Day 1 & 2, review before Friday

## Verification checklist (run before recording the demo)
- [ ] Fresh browser (cleared cookies) → forced to `/login`.
- [ ] Login → toast + lands on Home → first_name in navbar.
- [ ] Both Home cards navigate correctly.
- [ ] Create Agent button is on the Agents page, not the navbar.
- [ ] Create/Update/Delete agent + Submit transaction each: modal → action → toast (success and error paths).
- [ ] Transaction table: ≤10 rows, newest first, shows date/amount/full name; amount rejects 0/negative.
- [ ] `sessions` collection has TTL index (`db.sessions.getIndexes()` shows `expireAfterSeconds: 86400`).
- [ ] `/session` and `/validate_token` return the **exact** documented JSON.
- [ ] No `localStorage` token anywhere; no leftover `jsonwebtoken` import.
- [ ] Postman runs end-to-end with no manual edits.
- [ ] `main` == final state; nothing committed to main except the dev merge.
