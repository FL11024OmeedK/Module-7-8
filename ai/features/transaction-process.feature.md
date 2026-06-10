# 🤖 AI_FEATURE_Transaction-Process

---

## Feature Identity

- **Feature Name:** Transaction Process
- **Related Area:** Fullstack (Backend — two new endpoints + MongoDB collection; Frontend — Transactions page with table and form)

---

## Feature Goal

Add a Transaction page where users can view the last 10 transactions and submit new ones. Each transaction records a date, an amount, and the agent it belongs to. The list is sorted most-recent-first. The form validates that amounts are positive and lets users pick an agent from a dropdown showing their ID and full name.

---

## Feature Scope

### In Scope (Included)

- `transactions` MongoDB collection: `{ date, amount, agent_id }`
- `GET /transaction-data` — returns the last 10 transactions sorted by most recent first
- `POST /transaction` — accepts `{ amount, agent_id }` in the body, saves to MongoDB
- `Transactions.jsx` component — renders the table and the form
- Transaction table columns: date, amount, agent full name
- Agent full name in the table is resolved by joining the agent's `first_name` + `last_name` from the `agents` collection
- Agent dropdown in the form — lists all agents as `"[ID] First Last"` options
- Amount input — positive numbers only (`min="0.01"`, `step="any"`, `type="number"`)
- Confirmation modal before submitting a transaction (wired in here using existing `ConfirmationModal`)
- Toast on successful submit (green) and on error (red)
- Replace the `/transactions` stub route in `main.jsx` with the real `Transactions` component
- `useTokenValidation` called in `Transactions.jsx`

### Out of Scope (Excluded)

- Editing or deleting transactions
- Pagination beyond the last 10
- Agent CRUD (separate feature)
- Any changes to the session or auth system

---

## Sub-Requirements (Feature Breakdown)

- **transactions collection** — documents follow `{ date: Date, amount: Number, agent_id: String }`
- **GET /transaction-data** — queries `transactions` collection, sorts by `date` descending, limits to 10, returns array
- **POST /transaction** — receives `{ amount, agent_id }`, validates amount is positive, inserts `{ date: new Date(), amount, agent_id }`, returns created document
- **Transactions.jsx created** — fetches transaction list on mount, renders table + form
- **Table** — columns: Date, Amount, Agent Full Name; sorted newest first; agent full name resolved from agents collection on the frontend via a separate `GET /agents` fetch or passed alongside transaction data
- **Form** — amount field (`type="number"`, `min="0.01"`), agent dropdown (all agents, shown as `"[_id] first_name last_name"`), submit button
- **Confirmation modal** — `ConfirmationModal` shown before `POST /transaction` fires
- **Toasts** — success toast on `201`, error toast on failure
- **Route wired** — `Transactions` replaces the stub in `main.jsx`

---

## User Flow / Logic (High Level)

1. User navigates to `/transactions` from the home dashboard card
2. `useTokenValidation` runs — redirects to `/login` if no valid session
3. Page loads — `GET /transaction-data` fetches the last 10 transactions
4. Table renders with date, amount, and agent full name columns
5. User fills in the form: selects an agent from the dropdown, enters a positive amount
6. User clicks Submit → confirmation modal appears
7. User clicks Confirm → `POST /transaction` fires with `{ amount, agent_id }`
8. On success → green toast, transaction list refreshes
9. On error → red toast, form stays open

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend

- `client/src/components/Transactions.jsx` — new component (table + form)
- `client/src/main.jsx` — replace stub with `<Transactions />`

### Backend / API

- `server/routes/transactions.js` — new route file
- `server/server.js` — register transactions route
- `server/db/connection.js` — add `transactionsDb` export

#### Endpoints

```
GET /transaction-data
→ array of last 10 transactions, sorted by date descending
  [{ _id, date, amount, agent_id }, ...]

POST /transaction
← body: { amount: Number, agent_id: String }
→ 201 { status: "ok", data: <created doc>, message: "transaction saved successfully" }
→ 400 { status: "error", data: null, message: "Amount must be a positive number" }
```

---

## Data Used or Modified

### `transactions` collection

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Auto-generated |
| `date` | Date | Set to `new Date()` at insert time |
| `amount` | Number | Positive numbers only |
| `agent_id` | String | The `_id` of the agent as a string |

---

## Tech Constraints (Feature-Level)

- Amount validation must happen on **both** frontend (`min="0.01"` on the input) and backend (`if (amount <= 0)` check)
- Use the raw MongoDB Node.js driver — no Mongoose
- `transactionsDb` added to `connection.js` alongside `agentsDb`, `usersDb`, `sessionsDb`
- Agent full name in the table: fetch all agents via `GET /agents` on mount alongside `GET /transaction-data`, then match `agent_id` to resolve the name on the frontend
- Use `ConfirmationModal` and `useAlert` already in the codebase — do not create new modal or toast components
- `useTokenValidation` must be called in `Transactions.jsx`

---

## Acceptance Criteria

- [ ] `GET /transaction-data` returns the last 10 transactions sorted newest-first
- [ ] `POST /transaction` saves `{ date, amount, agent_id }` to MongoDB and returns the correct format
- [ ] `POST /transaction` with `amount <= 0` returns a 400 error
- [ ] Transaction table displays date, amount, and agent full name columns
- [ ] Transactions are sorted most-recent-first in the table
- [ ] Agent dropdown lists all agents as `"[ID] First Last"`
- [ ] Amount input only accepts positive numbers
- [ ] Submitting a transaction shows a confirmation modal first
- [ ] Successful submission shows a green toast and refreshes the list
- [ ] Failed submission shows a red toast
- [ ] Navigating to `/transactions` without a valid session redirects to `/login`
- [ ] No console errors on the transactions page

---

## Notes for the AI

- The agent dropdown should show each agent as `${agent._id} ${agent.first_name} ${agent.last_name}` in the `<option>` label, and submit `agent._id` as the `agent_id` value.
- For the table, fetch agents separately with `GET /agents` and build a lookup map `{ [_id]: "First Last" }` to resolve names without a backend join.
- The `date` field should be formatted for readability in the table — `new Date(t.date).toLocaleDateString()` is sufficient.
- The confirmation modal pattern is identical to `AgentForm`: `onSubmit` opens the modal, `handleConfirm` fires the fetch.
- **Rework flag:** `GET /agents` still requires the JWT `Authorization` header (`Bearer ${localStorage.getItem("token")}`). The JWT auth on `/agents` has not been replaced yet. Use `localStorage.getItem("token")` for the agents fetch in `Transactions.jsx` for now — this is known leftover M7 auth that was out of scope for all M8 features.
