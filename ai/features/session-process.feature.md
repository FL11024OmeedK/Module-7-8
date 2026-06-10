# 🤖 AI_FEATURE_Session-Process

---

## Feature Identity

- **Feature Name:** Session Process
- **Related Area:** Fullstack (Backend — new endpoints + MongoDB collection; Frontend — cookie storage, token check on navigation)

---

## Feature Goal

Replace the current JWT-based login (stored in localStorage) with a UUID cookie-based session system. After login, a UUID token is generated, saved to a MongoDB `sessions` collection with a 24-hour TTL, and stored in the browser as a cookie. Every page navigation checks for a valid session token — if none exists or the session is invalid, the user is redirected to login.

---

## Feature Scope

### In Scope (Included)

- New `sessions` MongoDB collection: `{ session_token, User, createdAt }`
- MongoDB TTL index on `createdAt` — expires documents after 86400 seconds (24 hours)
- `POST /session/:user_id` — generates UUID token, saves session, returns token
- `GET /validate_token?token=` — validates token against MongoDB, returns user info
- Update `Login.jsx` — call `POST /session/:user_id` on success, store token in cookie, remove `localStorage.setItem("token")`
- Token check on every page navigation — redirect to `/login` if no valid session found
- Cookie name: `session_token`

### Out of Scope (Excluded)

- Displaying the logged-in user's first name in the navbar (Feature 6 — Header Bar)
- Transaction endpoints (Feature 7)
- Removing JWT middleware from `/agents` route — left in place until auth strategy is fully replaced

---

## Sub-Requirements (Feature Breakdown)

- **Sessions collection created** — MongoDB collection `sessions` with fields `session_token` (String), `User` (ObjectId ref to users), `createdAt` (Date, default: now)
- **TTL index created** — `createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 })` on server startup
- **POST /session/:user_id** — generates UUID v4 token, saves session to MongoDB, returns exact response format
- **GET /validate_token** — reads `token` query param, checks MongoDB, returns validity + user info in exact response format
- **Session saved on login** — `Login.jsx` calls `POST /session/:user_id` after successful login, stores returned token in a cookie via `react-use-cookie`
- **Token stored in cookie** — cookie named `session_token` set via `useCookie` hook from `react-use-cookie`
- **Token check on navigation** — every protected page checks for a valid `session_token` cookie; invalid or missing token redirects to `/login`

---

## User Flow / Logic (High Level)

1. User submits login form
2. Backend validates credentials → returns user object (existing M7 flow)
3. Frontend calls `POST /session/:user_id` with the user's id
4. Backend generates UUID, saves session to MongoDB, returns the token
5. Frontend stores token in cookie (`session_token`) via `react-use-cookie`
6. User is navigated to `/` (home dashboard)
7. On every subsequent page load, the app reads `session_token` cookie and calls `GET /validate_token`
8. If valid → user stays on page
9. If invalid or missing → redirect to `/login`
10. After 24h, MongoDB TTL deletes the session document → token becomes invalid on next check

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend

- `client/src/components/Login.jsx` — call session POST after login success; store cookie; remove localStorage
- `client/src/hooks/useTokenValidation.js` — new custom hook that reads cookie and calls `GET /validate_token`; redirects to `/login` if invalid
- All protected pages/components — call `useTokenValidation` on mount

### Backend / API

- `server/routes/session.js` — new route file
- `server/server.js` — register session route (`app.use("/session", session)`)

#### Exact response shapes (from docebo)

```
POST /session/:user_id
→ { status: "ok", data: { token: "xxx-ee-dd-fff" }, message: "session saved successfully" }

GET /validate_token?token=<uuid>
→ { status: "ok", data: { valid: boolean, user: { first_name, last_name, id } }, message: null }
```

---

## Data Used or Modified

### `sessions` collection

| Field | Type | Notes |
|-------|------|-------|
| `session_token` | String | UUID v4 generated at login |
| `User` | Object | `{ first_name, last_name, id }` — embedded at session creation time |
| `createdAt` | Date | Default: `new Date()` — TTL index targets this field |

TTL index: `{ createdAt: 1 }`, `expireAfterSeconds: 86400`

---

## Tech Constraints (Feature-Level)

- Use `uuid` package (`import { v4 as uuidv4 } from 'uuid'`) for token generation — not JWT, not Math.random
- Use `react-use-cookie` (`useCookie` hook) in `Login.jsx` for cookie storage — not `document.cookie`, not localStorage
- Cookie name must be `session_token`
- TTL index must be created at server startup, not manually in MongoDB
- Session route must be unprotected (no JWT middleware) — it is called during login before a session exists
- `useTokenValidation` hook must use `useEffect` + `useNavigate` to redirect — no prop drilling

---

## Acceptance Criteria

- [ ] Logging in creates a session document in the `sessions` MongoDB collection
- [ ] Each session has a unique UUID token
- [ ] `POST /session/:user_id` returns the exact response shape from docebo
- [ ] `GET /validate_token?token=` returns the exact response shape from docebo
- [ ] A cookie named `session_token` is set in the browser after login
- [ ] `localStorage.setItem("token")` is removed from the login flow
- [ ] MongoDB TTL index exists on `sessions.createdAt` with `expireAfterSeconds: 86400`
- [ ] Navigating to a protected page without a valid cookie redirects to `/login`
- [ ] Server starts without errors

---

## Notes for the AI

- The `useCookie` hook from `react-use-cookie` returns `[cookieValue, setCookie, deleteCookie]`. Call `setCookie(token)` after the session POST succeeds.
- The session POST needs the user's `id` from the login response — check the existing login endpoint to confirm the field name before writing the frontend call.
- `GET /validate_token` reads `user` directly from the stored session document — no populate needed since `User` is embedded as `{ first_name, last_name, id }` at creation time.
- `useTokenValidation` should call `GET /validate_token` with the cookie value inside a `useEffect`. If the response returns `valid: false` or the cookie is missing, call `navigate("/login")`.
- **Rework flag:** `AgentList.jsx` and `AgentForm.jsx` still send `localStorage.getItem("token")` as a JWT auth header. Once session-based auth replaces JWT entirely, those headers will need updating. Flag it when encountered but do not refactor out of scope.
