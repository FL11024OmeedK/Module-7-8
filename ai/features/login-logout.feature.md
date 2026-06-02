# 🤖 AI_FEATURE_Login-Logout

---

## Feature Identity

- **Feature Name:** Login / Logout
- **Related Area:** Fullstack (Frontend pages + Backend endpoint + Navbar)

---

## Feature Goal

Restrict access to RE Admin to Rocket Elevators staff only. Users must log in with their email and password before seeing the agent list. A successful login navigates to the home page. A failed login navigates to an unauthorized page. A logout button in the Navbar returns the user to the login page.

---

## Feature Scope

### In Scope (Included)

- Login page at `/login` with email and password fields
- `POST /users/login` backend endpoint that validates credentials against MongoDB
- Successful login → navigate to `/` (agent list)
- Failed login (wrong email or wrong password) → navigate to `/unauthorized`
- Unauthorized page at `/unauthorized` with a message and a link back to `/login`
- Logout button in the Navbar that navigates to `/login`
- `/login` added as a route in `main.jsx`
- `/unauthorized` added as a route in `main.jsx`

### Out of Scope (Excluded)

- JWT tokens or session management — no persistent auth state
- Password hashing — plain text comparison only
- Protected routes (route guards) — this is listed as a bonus in the business document
- User registration or signup page
- "Remember me" functionality

---

## Sub-Requirements (Feature Breakdown)

- Login Page — new component `Login.jsx` with email input, password input, and submit button
- Login Endpoint — new route file `server/routes/users.js` with `POST /users/login`
- Login Validation — backend looks up the user by email in `usersDb.collection("users")`, then compares the password; returns 200 on success, 401 on failure
- Success Navigation — frontend receives 200 and navigates to `/`
- Failure Navigation — frontend receives 401 and navigates to `/unauthorized`
- Unauthorized Page — new component `Unauthorized.jsx` with an error message and a "Back to Login" link
- Logout Button — added to `Navbar.jsx`; clicking it navigates to `/login`
- Route Registration — `server.js` registers the users route at `/users`; `main.jsx` adds `/login` and `/unauthorized` routes

---

## User Flow / Logic (High Level)

**Login:**
1. User opens the app and navigates to `/login`
2. User enters email and password and clicks Login
3. Frontend sends `POST http://localhost:5050/users/login` with `{ email, password }`
4. Backend queries `usersDb.collection("users")` for a document matching the email
5. If no user found → returns 401 → frontend navigates to `/unauthorized`
6. If user found but password does not match → returns 401 → frontend navigates to `/unauthorized`
7. If credentials match → returns 200 → frontend navigates to `/`

**Logout:**
1. User clicks the Logout button in the Navbar
2. Frontend navigates to `/login`

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend

- `client/src/components/Login.jsx` — new file; login form with email + password
- `client/src/components/Unauthorized.jsx` — new file; error page with link back to login
- `client/src/components/Navbar.jsx` — add Logout button that navigates to `/login`
- `client/src/main.jsx` — add `/login` and `/unauthorized` routes

### Backend / API

- `POST /users/login` — receives `{ email, password }` in request body, queries the `users` database, returns 200 on success or 401 on failure

---

## Data Used or Modified

Request body sent to `POST /users/login`:

| Field | Type | Notes |
|-------|------|-------|
| `email` | String | Used to look up the user document |
| `password` | String | Compared against the stored password |

No data is created or modified — this is a read-only validation.

User document queried from `usersDb.collection("users")`:

| Field | Used for |
|-------|---------|
| `email` | Finding the document |
| `password` | Comparing against submitted password |

---

## Tech Constraints (Feature-Level)

- Use `fetch()` only — no Axios
- Use `useNavigate()` from React Router to redirect after login/logout — do not use `window.location`
- The login endpoint must be at `POST /users/login` — registered in `server.js` as `app.use("/users", users)`
- Password comparison is plain string equality — no bcrypt or hashing
- Do not add route guards or protected routes — that is a bonus requirement
- The new routes file must use ES Module syntax (`import`/`export default`)
- `usersDb` from `connection.js` must be used — do not create a new MongoDB connection

---

## Acceptance Criteria

- [ ] `/login` route exists and renders a login form
- [ ] Login form has an email field and a password field
- [ ] Submitting correct credentials navigates to `/` (agent list)
- [ ] Submitting an unrecognized email navigates to `/unauthorized`
- [ ] Submitting a wrong password navigates to `/unauthorized`
- [ ] `/unauthorized` route exists and renders an error message
- [ ] `/unauthorized` page has a link back to `/login`
- [ ] Navbar has a Logout button that navigates to `/login`
- [ ] `POST /users/login` returns 200 on valid credentials
- [ ] `POST /users/login` returns 401 on invalid credentials

---

## Notes for the AI

- `Login.jsx` does not use the `App` layout (no Navbar) — it is a standalone route with no parent layout
- `Unauthorized.jsx` also does not use the `App` layout — standalone route
- Only the routes under `/`, `/create`, and `/edit/:id` use `App` as the layout parent
- The Logout button in `Navbar.jsx` uses `useNavigate()` — import it from `react-router-dom`
- Do not store any login state in React (no `useState` for isLoggedIn) — that is the bonus route guard work
