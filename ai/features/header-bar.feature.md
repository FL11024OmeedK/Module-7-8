# 🤖 AI_FEATURE_Header-Bar

---

## Feature Identity

- **Feature Name:** Header Bar Updates
- **Related Area:** Frontend (Navbar.jsx, AgentList.jsx)

---

## Feature Goal

Refine the navigation bar to match the client's requests: move "Create Agent" out of the navbar and into the Agent Management page, and display the logged-in user's first name in the navbar so they always know who is signed in.

---

## Feature Scope

### In Scope (Included)

- Remove the "Create Agent" `<NavLink>` from `Navbar.jsx`
- Add a "Create Agent" button to `AgentList.jsx` that navigates to `/create`
- Display the logged-in user's `first_name` in `Navbar.jsx`
- `Navbar.jsx` reads the user from `useTokenValidation` to get `first_name`
- Update the logout function to delete the `session_token` cookie instead of clearing `localStorage`

### Out of Scope (Excluded)

- Changing the logo or logout button placement
- Displaying `last_name` (only `first_name` is required)
- Any backend changes
- Transaction page (Feature 7)

---

## Sub-Requirements (Feature Breakdown)

- **Create Agent moved** — "Create Agent" link removed from `Navbar.jsx`; a "Create Agent" button added to `AgentList.jsx` above the agent table
- **Username displayed** — logged-in user's `first_name` shown in the navbar (e.g. "Hello, John" or just "John")
- **User sourced from session** — `Navbar.jsx` calls `useTokenValidation()` to get the user object; reads `user.first_name`
- **Logout clears cookie** — `logout()` in `Navbar.jsx` deletes the `session_token` cookie via `react-use-cookie` instead of `localStorage.removeItem("token")`

---

## User Flow / Logic (High Level)

1. User logs in → lands on home dashboard
2. Navbar shows the Rocket Elevators logo, the user's first name, and a Logout button
3. User navigates to `/agents` → sees the agent table with a "Create Agent" button above it
4. User clicks "Create Agent" → navigates to `/create`
5. User clicks Logout → cookie is deleted → redirected to `/login`

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend

- `client/src/components/Navbar.jsx` — remove Create Agent link; add first name display; fix logout to delete cookie
- `client/src/components/AgentList.jsx` — add "Create Agent" button above the agent table

### Backend / API

- None — this feature is frontend-only

---

## Data Used or Modified

- `user.first_name` — read from the object returned by `useTokenValidation()`
- `session_token` cookie — deleted on logout via `react-use-cookie`

---

## Tech Constraints (Feature-Level)

- Use `useTokenValidation()` in `Navbar.jsx` to get the user — do not make a separate fetch call
- Use `react-use-cookie` to delete the cookie on logout — not `document.cookie` or `localStorage`
- Use `useNavigate` for the logout redirect — no `window.location`
- "Create Agent" button in `AgentList.jsx` must use `<Link>` or `useNavigate` to `/create` — consistent with existing nav patterns

---

## Acceptance Criteria

- [ ] "Create Agent" link is gone from the navbar
- [ ] "Create Agent" button appears on the `/agents` page above the agent table
- [ ] Clicking "Create Agent" on the agents page navigates to `/create`
- [ ] The logged-in user's first name is visible in the navbar on all main app pages
- [ ] Clicking Logout deletes the `session_token` cookie and redirects to `/login`
- [ ] After logout, navigating to `/` redirects back to `/login` (cookie is gone)
- [ ] No console errors on any page

---

## Notes for the AI

- `useTokenValidation()` already returns the user object (`{ first_name, last_name, id }`). Call it at the top of `Navbar` and read `user?.first_name` — use optional chaining since the user may be `null` during the initial async check.
- The `logout` function currently calls `localStorage.removeItem("token")`. Replace it with the `deleteCookie` function from `useCookie("session_token")`. After deleting, call `navigate("/login")`.
- This is the rework point flagged in Features 4 and 5 — `localStorage` is finally removed from the logout path here.
- `AgentList.jsx` already has `useTokenValidation()` wired in. The "Create Agent" button is a simple `<Link to="/create">` styled to match the existing Edit button.
