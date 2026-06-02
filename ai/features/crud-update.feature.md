# 🤖 AI_FEATURE_CRUD-Update

---

## Feature Identity

- **Feature Name:** CRUD Update — Edit Existing Agent
- **Related Area:** Fullstack (Frontend form + Backend endpoint)

---

## Feature Goal

Allow a user to edit an existing agent's information. When the Edit button is clicked from the agent table, the form opens pre-populated with the agent's current data. The user can modify the fields and submit to save the changes to MongoDB.

---

## Feature Scope

### In Scope (Included)

- Edit button in the Action column navigates to `/edit/:id`
- The form at `/edit/:id` fetches the existing agent and pre-populates all fields
- On submit, a `PATCH` request is sent to `PATCH /record/:id` with the updated data
- After successful submission, the user is redirected back to the home page
- The updated agent appears in the table with the new values

### Out of Scope (Excluded)

- Creating new agents — handled in CRUD Create
- Updating the `sales` field — `updateAgent()` on the backend excludes it intentionally
- Form validation (required fields, format checks)
- Any new backend routes — `PATCH /record/:id` is already implemented

---

## Sub-Requirements (Feature Breakdown)

- Edit Button Navigation — the Edit link in `AgentRow` navigates to `/edit/:id` with the agent's MongoDB `_id` in the URL
- Data Pre-population — when the form mounts with an `id` param, it fetches the agent from `GET /record/:id` and loads the data into the form fields
- isNew Flag — `isNew` is set to `false` when editing, which causes `onSubmit` to send a PATCH instead of a POST
- Submit Handler — sends `PATCH http://localhost:5050/record/:id` with the updated form data as JSON
- Redirect — after submit, clears the form and navigates to `/`

---

## User Flow / Logic (High Level)

1. User clicks the Edit button on an agent row in the table
2. The browser navigates to `/edit/:id` where `:id` is the agent's MongoDB `_id`
3. `Record.jsx` mounts — `useEffect` detects the `id` param, sets `isNew` to `false`
4. A `GET` request fetches the agent data from `http://localhost:5050/record/:id`
5. The form fields are pre-populated with the agent's current values
6. User edits one or more fields and clicks "Save Agent Record"
7. The frontend sends `PATCH http://localhost:5050/record/:id` with the updated data
8. The backend calls `updateAgent(req.body)`, updates the document in MongoDB, returns 200
9. The frontend clears the form and navigates to `/`
10. The table shows the agent with the updated values

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend

- `client/src/components/Record.jsx` — handles both Create and Edit; no structural changes needed
- `client/src/components/RecordList.jsx` — Edit link already points to `/edit/${record._id}`

### Backend / API

- `GET /record/:id` — fetches a single agent to pre-populate the form (already implemented)
- `PATCH /record/:id` — updates the agent document in MongoDB using `updateAgent()` (already implemented)

---

## Data Used or Modified

Form fields sent in the PATCH request body:

| Field | Notes |
|-------|-------|
| `first_name` | Updated value |
| `last_name` | Updated value |
| `email` | Updated value |
| `region` | Updated value |
| `rating` | Updated value |
| `fee` | Updated value |

`sales` is excluded — `updateAgent()` on the backend does not include it, so it cannot be accidentally overwritten.

---

## Tech Constraints (Feature-Level)

- Use `fetch()` only — no Axios
- The PATCH body must be sent as JSON with `Content-Type: application/json` header
- `isNew` must be `false` when editing — this is set automatically when `params.id` exists
- Do not rename or split `Record.jsx` — Create and Edit intentionally share this component
- The `key` prop used for routing must remain `record._id`

---

## Acceptance Criteria

- [ ] Clicking Edit on an agent row navigates to `/edit/:id`
- [ ] The form opens pre-populated with the agent's current first name, last name, email, region, rating, and fee
- [ ] Changing a field and submitting updates the agent in MongoDB
- [ ] After submission the user is redirected to the home page
- [ ] The agent table reflects the updated values
- [ ] `PATCH /record/:id` returns a 200 response with `modifiedCount: 1`

---

## Notes for the AI

- Both the frontend logic and the backend route are already implemented — verify they work correctly with the new agent fields rather than rewriting
- The `useEffect` in `Record.jsx` already handles pre-population: it checks for `params.id`, fetches the agent, and calls `setForm(record)` — this will populate the new fields automatically as long as the field names in state match the field names returned by MongoDB
- The form state keys (`first_name`, `last_name`, etc.) must exactly match the field names stored in MongoDB — they already do after the CRUD Create update
