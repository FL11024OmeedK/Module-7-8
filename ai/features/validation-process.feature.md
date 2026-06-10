# 🤖 AI_FEATURE_Validation-Process

---

## Feature Identity

- **Feature Name:** Validation Process
- **Related Area:** Fullstack (Backend — `GET /validate_token` endpoint; Frontend — `useTokenValidation` hook, login redirect)

---

## Feature Goal

Ensure every page navigation checks whether a valid session exists in MongoDB. If the session token is missing or invalid, the user is redirected to `/login`. If a valid session exists and the user is already on the login page, redirect them to the home page so they are never asked to log in twice.

---

## Feature Scope

### In Scope (Included)

- `GET /validate_token?token=` — receives token as query param, checks MongoDB, returns correct format
- `useTokenValidation` hook — reads `session_token` cookie, calls `GET /validate_token`, redirects to `/login` if invalid or missing
- Redirect to `/login` if: no token found in cookie, token not in MongoDB, session expired (TTL deleted it)
- Redirect to `/` if: user visits `/login` with a valid existing session token
- All protected pages (`HomePage`, `AgentList`, `AgentForm`) call `useTokenValidation`

### Out of Scope (Excluded)

- Creating or deleting sessions (Feature 4 — Session)
- Displaying the user's name in the navbar (Feature 6 — Header Bar)
- Transaction page validation (Feature 7 — Transactions)
- JWT or any auth other than UUID cookie sessions

---

## Sub-Requirements (Feature Breakdown)

- **Validation logic in MongoDB** — `GET /validate_token` looks up the token in the `sessions` collection; a token is valid only if the document exists (TTL handles expiry automatically)
- **Correct query parameter** — endpoint reads `req.query.token`, not `req.params` or `req.body`
- **Correct return format** — endpoint returns `{ status: "ok", data: { valid: boolean, user: { first_name, last_name, id } }, message: null }`
- **Redirect if no token** — `useTokenValidation` redirects to `/login` if cookie is empty or missing
- **Redirect if invalid token** — `useTokenValidation` redirects to `/login` if `GET /validate_token` returns `valid: false`
- **Redirect if valid + on login page** — `Login.jsx` checks the cookie on mount; if a valid session exists, redirects to `/`

---

## User Flow / Logic (High Level)

### Protected page (HomePage, AgentList, AgentForm)

1. Component mounts → `useTokenValidation` runs
2. Reads `session_token` cookie
3. If no cookie → redirect to `/login`
4. If cookie exists → `GET /validate_token?token=<value>`
5. If `valid: false` → redirect to `/login`
6. If `valid: true` → stay on page, return user object to component

### Login page

1. User visits `/login`
2. `Login.jsx` reads `session_token` cookie on mount
3. If cookie exists → `GET /validate_token?token=<value>`
4. If `valid: true` → redirect to `/` (no need to log in again)
5. If `valid: false` or no cookie → show the login form normally

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend

- `client/src/hooks/useTokenValidation.js` — already created in Feature 4; verify redirect logic is complete
- `client/src/components/Login.jsx` — add token check on mount; redirect to `/` if already valid

### Backend / API

- `server/routes/session.js` — `GET /validate_token` already created in Feature 4; verify parameter handling and response format match spec exactly

#### Exact response shape

```
GET /validate_token?token=<uuid>
→ { status: "ok", data: { valid: boolean, user: { first_name, last_name, id } }, message: null }
```

---

## Data Used or Modified

- `sessions` collection (read only) — looks up `session_token` field; no writes in this feature
- `session_token` cookie (read only) — read by `useTokenValidation` and `Login.jsx`

---

## Tech Constraints (Feature-Level)

- Token must be passed as a query parameter (`?token=`) — not in headers or body
- `useTokenValidation` must use `useEffect` + `useNavigate` for redirect — no direct `window.location`
- `Login.jsx` token check must also use `useEffect` so it runs after render
- Do not remove or bypass the existing JWT middleware on `/agents` — that is separate from session validation

---

## Acceptance Criteria

- [ ] `GET /validate_token?token=<valid>` returns `{ status: "ok", data: { valid: true, user: {...} }, message: null }`
- [ ] `GET /validate_token?token=<invalid>` returns `{ status: "ok", data: { valid: false, user: null }, message: null }`
- [ ] `GET /validate_token` with no token param returns `{ status: "ok", data: { valid: false, user: null }, message: null }`
- [ ] Visiting `/` without a session cookie redirects to `/login`
- [ ] Visiting `/agents` without a session cookie redirects to `/login`
- [ ] Visiting `/login` with a valid session cookie redirects to `/`
- [ ] Visiting `/login` with an invalid or missing cookie shows the login form normally
- [ ] No console errors related to validation on any page

---

## Notes for the AI

- `useTokenValidation` was built in Feature 4. Review it for completeness — confirm it handles the missing-cookie case, the invalid-token case, and returns the user object on success.
- The login page redirect is new in this feature. Add a `useEffect` in `Login.jsx` that reads the cookie and calls `GET /validate_token`; if valid, call `navigate("/")`.
- The `GET /validate_token` route is currently mounted at both `/session` and `/validate_token` in `server.js`. Verify the `/validate_token` mount handles the GET correctly.
- Do not add toast notifications for validation failures — silent redirect to login is the correct UX here.
