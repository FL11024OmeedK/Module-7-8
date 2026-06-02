# 🤖 AI_FEATURE_CRUD-Create

---

## Feature Identity

- **Feature Name:** CRUD Create — Add New Agent
- **Related Area:** Fullstack (Frontend form + Backend endpoint)

---

## Feature Goal

Allow a user to create a new agent by filling out a form and submitting it. The form data is sent to the backend, stored in MongoDB, and the user is redirected back to the agent list where the new agent appears.

---

## Feature Scope

### In Scope (Included)

- Update the Create form in `Record.jsx` to collect agent fields: first name, last name, email, region, rating, fee
- On submit, send a `POST` request to `POST /record` with the form data as JSON
- After successful submission, redirect the user to the home page `/`
- The form is accessible via the "Create Agent" button in the Navbar at `/create`

### Out of Scope (Excluded)

- Form validation (required field checks, email format, number ranges)
- Edit functionality — that is handled in CRUD Update
- Any backend changes — `POST /record` is already implemented
- Styling beyond keeping the existing Tailwind structure

---

## Sub-Requirements (Feature Breakdown)

- First Name field — text input bound to `form.first_name`
- Last Name field — text input bound to `form.last_name`
- Email field — text input bound to `form.email`
- Region field — text input bound to `form.region`
- Rating field — number input bound to `form.rating`
- Fee field — number input bound to `form.fee`
- Form state — `useState` initializes all 6 fields to empty strings
- Submit handler — sends `POST` to `http://localhost:5050/record` with JSON body, then navigates to `/`
- Remove tutorial fields — delete the Name input, Position input, and Intern/Junior/Senior radio buttons entirely

---

## User Flow / Logic (High Level)

1. User clicks "Create Agent" in the Navbar
2. The form at `/create` renders with 6 empty input fields
3. User fills in: first name, last name, email, region, rating, fee
4. User clicks "Save Agent Record"
5. The frontend sends `POST http://localhost:5050/record` with the form data as JSON
6. The backend calls `createAgent(req.body)`, inserts the new document into MongoDB, returns 201
7. The frontend clears the form and navigates to `/`
8. The new agent appears in the agent table on the home page

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend

- `client/src/components/Record.jsx` — the only file that changes

### Backend / API

- `POST /record` — receives the agent fields in `req.body`, calls `createAgent()`, inserts into `agentsDb.collection("agents")`, returns 201 (already implemented, no changes needed)

---

## Data Used or Modified

Form fields sent in the POST request body:

| Field | Input type | Notes |
|-------|-----------|-------|
| `first_name` | text | Agent first name |
| `last_name` | text | Agent last name |
| `email` | text | Agent email address |
| `region` | text | North, East, South, or West |
| `rating` | number | Integer 0–100 |
| `fee` | number | Dollar amount |

`sales` is not on the form — `createAgent()` on the backend always sets it to `0`.

---

## Tech Constraints (Feature-Level)

- Use `fetch()` only — no Axios
- Form state must use `useState` with a single object holding all 6 fields
- Use `updateForm()` pattern to merge partial updates into state — do not create separate state variables per field
- The POST body must be sent as JSON with `Content-Type: application/json` header
- After submit, clear the form and call `navigate("/")`
- Do not rename the file `Record.jsx`
- Do not change the `isNew` / `useParams` logic — it is needed for CRUD Update

---

## Acceptance Criteria

- [ ] Form has 6 input fields: First Name, Last Name, Email, Region, Rating, Fee
- [ ] No tutorial fields remain (Name, Position, Intern/Junior/Senior radio buttons are removed)
- [ ] Submitting the form sends a POST request to `http://localhost:5050/record`
- [ ] The new agent appears in MongoDB Atlas after submission
- [ ] After submission the user is redirected to the home page
- [ ] The new agent appears in the agent table on the home page

---

## Notes for the AI

- `Record.jsx` handles both Create and Edit in the same component — `isNew` determines which mode is active. Do not break this logic.
- The `updateForm()` function merges partial updates into state using the spread operator — keep this pattern, it works for both Create and Edit
- Replace the Position text input and the Intern/Junior/Senior radio button fieldset entirely — they map to the old tutorial schema
- Rating and Fee should use `type="number"` inputs so the browser enforces numeric entry
