# 🤖 AI_FEATURE_Notifications

---

## Feature Identity

- **Feature Name:** Notifications
- **Related Area:** Fullstack (Frontend — global context + UI; touches all existing action components)

---

## Feature Goal

Give users clear visual feedback for every action they take. Right now the app fails silently — if a login fails or a delete succeeds, nothing tells the user. This feature adds a global toast notification system (green for success, red for error) that auto-hides after 5 seconds and appears on every user-initiated action across the entire app.

---

## Feature Scope

### In Scope (Included)

- `AlertContext` — a React Context that holds the current alert state and exposes a function to trigger a toast from anywhere in the app
- `AlertProvider` — wraps the app in `main.jsx` so every component can access the context
- `AlertToast` — a React-Bootstrap `<Toast>` component that reads from `AlertContext` and renders the notification
- Toast on login: success (login worked) and error (wrong credentials or server error)
- Toast on create agent: success and error
- Toast on update agent: success and error
- Toast on delete agent: success and error
- Toast on submit transaction: success and error (wired up when Feature 7 is implemented)
- Toasts auto-hide after 5 seconds
- Green background for success, red background for error

### Out of Scope (Excluded)

- Confirmation modals before actions (Feature 3 — Modals)
- Any session or cookie logic (Feature 4 — Session)
- Transaction page UI (Feature 7 — Transactions) — the toast trigger point for transactions will be added in Feature 7; only the context infrastructure is built here
- Multiple simultaneous toasts (one at a time is sufficient)
- Persistent notifications (toasts do not survive a page refresh)

---

## Sub-Requirements (Feature Breakdown)

- **AlertContext created** — a context with `{ message, variant, showAlert }` where `showAlert(message, variant)` triggers a toast
- **AlertProvider wraps the app** — added in `main.jsx` around `<RouterProvider>` so all routes can access it
- **AlertToast component** — reads from `AlertContext`, renders a React-Bootstrap `<Toast>` with the correct variant color, auto-hides after 5 seconds
- **AlertToast rendered once** — placed inside `App.jsx` so it appears on every main app page without duplicating it in each component
- **Login toasts** — `Login.jsx` calls `showAlert` on success and on error
- **Create agent toasts** — `AgentForm.jsx` calls `showAlert` on successful POST and on caught error
- **Update agent toasts** — `AgentForm.jsx` calls `showAlert` on successful PATCH and on caught error
- **Delete agent toasts** — `AgentList.jsx` calls `showAlert` on successful DELETE and on caught error

---

## User Flow / Logic (High Level)

1. User performs an action (login, create, update, delete)
2. The component calls `showAlert("message text", "success")` or `showAlert("message text", "danger")`
3. `AlertContext` updates its state — `message` and `variant` are set, `show` is set to `true`
4. `AlertToast` reads the updated context and renders the Bootstrap `<Toast>` with the correct color
5. After 5 seconds the toast auto-hides (`autohide` and `delay={5000}` props on `<Toast>`)
6. User can also manually dismiss it by clicking the close button

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend

- `client/src/context/AlertContext.jsx` — new file; creates and exports the context and provider
- `client/src/components/AlertToast.jsx` — new file; the visible toast UI component
- `client/src/main.jsx` — wrap `<RouterProvider>` with `<AlertProvider>`
- `client/src/App.jsx` — render `<AlertToast />` once inside the layout
- `client/src/components/Login.jsx` — add `showAlert` calls after fetch response
- `client/src/components/AgentForm.jsx` — add `showAlert` calls after POST/PATCH and in catch block
- `client/src/components/AgentList.jsx` — add `showAlert` calls after DELETE and on error

### Backend / API

- None — this feature is frontend-only

---

## Data Used or Modified

- None — alert state lives in React context memory only; nothing is persisted

---

## Tech Constraints (Feature-Level)

- Use React Context API (`createContext`, `useContext`) — no third-party state library
- Use React-Bootstrap `<Toast>`, `<Toast.Header>`, `<Toast.Body>` — no custom CSS toast
- `variant` values must be Bootstrap color variants: `"success"` (green) and `"danger"` (red)
- Toasts must auto-hide after exactly 5 seconds (`delay={5000}` + `autohide` on `<Toast>`)
- `AlertContext` must be accessible from any component via `useContext(AlertContext)` — no prop drilling
- Do not refactor existing fetch logic in `Login.jsx`, `AgentForm.jsx`, or `AgentList.jsx` beyond adding the `showAlert` calls

---

## Acceptance Criteria

- [ ] Successful login shows a green toast
- [ ] Failed login shows a red toast
- [ ] Creating an agent successfully shows a green toast
- [ ] Failed agent creation shows a red toast
- [ ] Updating an agent successfully shows a green toast
- [ ] Failed agent update shows a red toast
- [ ] Deleting an agent successfully shows a green toast
- [ ] Failed agent deletion shows a red toast
- [ ] Every toast auto-hides after 5 seconds
- [ ] Toast can be manually dismissed
- [ ] No console errors related to context or toast rendering

---

## Notes for the AI

- `AlertContext` should export both the context object (`AlertContext`) and the provider (`AlertProvider`). Components import `AlertContext` and call `useContext(AlertContext)` to get `showAlert`.
- The `show` state inside `AlertContext` must reset to `false` when the toast closes — pass `onClose={() => setShow(false)}` to `<Toast>`.
- Place `<AlertToast />` inside `App.jsx` (not `main.jsx`) so it only renders within the main layout, not on the standalone `/login` or `/unauthorized` pages. Login toasts are a known edge case — `Login.jsx` is a standalone route outside `App`, so it will need its own `<AlertToast />` rendered locally, or the `AlertProvider` must wrap the entire router (which it does per the spec).
- Keep `showAlert` signature simple: `showAlert(message, variant)` — two arguments, nothing else.
- Do not add toasts to the transaction submit yet — that hook will be added in Feature 7 when the transaction form exists.
