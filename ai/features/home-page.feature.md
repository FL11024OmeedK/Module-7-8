# 🤖 AI_FEATURE_Home-Page

---

## Feature Identity

- **Feature Name:** Home Page
- **Related Area:** Frontend (Fullstack — routes updated)

---

## Feature Goal

Replace the current default route (`/`) — which renders the agent table directly — with a dashboard landing page that displays a grid of Bootstrap cards. Each card navigates to a section of the app. This becomes the first screen the user sees after login.

---

## Feature Scope

### In Scope (Included)

- New `HomePage` React component rendered at the `/` route
- Agent Management card — navigates to `/agents`
- Transaction card — navigates to `/transactions`
- Bootstrap card grid layout using React-Bootstrap (`Card`, `Row`, `Col`, `Container`)
- Move the agent list to a new `/agents` route
- Update React Router configuration in `main.jsx` to reflect the new routes

### Out of Scope (Excluded)

- Toast notifications (Feature 2 — Notifications)
- Confirmation modals (Feature 3 — Modals)
- Session/cookie logic (Feature 4 — Session)
- Token validation on navigation (Feature 5 — Validation)
- Header bar changes beyond what's needed to support the new routes (Feature 6 — Header Bar)
- Transactions page content (Feature 7 — Transactions)
- Authentication changes
- Any backend changes

---

## Sub-Requirements (Feature Breakdown)

- **Home Page Created** — A new `HomePage` component is created and set as the default view (`/`) after login
- **Card Grid Layout** — The home page displays a grid of cards using React-Bootstrap layout components
- **Agent Management Card** — A card labeled "Agent Management" navigates the user to the agent table page (`/agents`)
- **Transaction Card** — A card labeled "Transactions" navigates the user to the transactions page (`/transactions`)
- **Agent list re-routed** — `AgentList` moves from `/` to `/agents`; existing links and navbar references updated accordingly

---

## User Flow / Logic (High Level)

1. User logs in successfully
2. App redirects to `/` (home page)
3. User sees a grid of cards on the dashboard
4. User clicks the "Agent Management" card → navigates to `/agents` (agent table)
5. User clicks the "Transactions" card → navigates to `/transactions` (transactions page — stub for now)

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend

- `client/src/components/HomePage.jsx` — new component (card grid)
- `client/src/main.jsx` — updated routes: `/` → `HomePage`, `/agents` → `AgentList`, `/transactions` → stub (placeholder for Feature 7)
- `client/src/App.jsx` — verify `Outlet` still works with new child routes; no logic changes expected

### Backend / API

- None — this feature is frontend-only

---

## Data Used or Modified

- None — this feature does not read from or write to the database

---

## Tech Constraints (Feature-Level)

- Use React-Bootstrap `Card`, `Row`, `Col`, `Container` components — no plain HTML cards
- Use `useNavigate` (React Router) or `<Link>` for card navigation — no `window.location`
- Do not add Tailwind classes to the new component; use Bootstrap utility classes only
- Do not add session or auth logic to this component (handled in Feature 5)
- The `/transactions` route can render a placeholder `<div>` or stub component for now

---

## Acceptance Criteria

- [ ] Navigating to `/` after login shows the dashboard card grid (not the agent table)
- [ ] "Agent Management" card navigates to `/agents` and the agent table loads correctly
- [ ] "Transactions" card navigates to `/transactions` without a crash (stub is acceptable)
- [ ] Cards are rendered using React-Bootstrap components
- [ ] All existing routes (`/login`, `/unauthorized`, `/create`, `/edit/:id`) still work
- [ ] No console errors on page load

---

## Notes for the AI

- The `AgentList` route is moving from `/` to `/agents`. Update both `main.jsx` (the route definition) and any hardcoded links (e.g., the navbar "Home" link) that point to `/`.
- The `/transactions` route does not need a real component yet — a simple `<div>Transactions coming soon</div>` is enough to satisfy routing without breaking the app.
- Keep the `HomePage` component simple: a `Container` with a `Row` of `Col`-wrapped `Card` components. No state, no effects, no fetching.
- Do not touch auth or session logic — that is Feature 4.
