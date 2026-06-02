# 🤖 AI_FEATURE_CRUD-Read

---

## Feature Identity

- **Feature Name:** CRUD Read — Agent Table
- **Related Area:** Fullstack (Frontend display + Backend data)

---

## Feature Goal

Display all agents stored in MongoDB in a table on the home page. The table must show the correct agent columns: Full Name, Region, Rating, Fee, Sales, and Action. This replaces the tutorial's generic Name, Position, Level columns.

---

## Feature Scope

### In Scope (Included)

- Update table headers to: Full Name, Region, Rating, Fee, Sales, Action
- Update each table row to display the correct agent fields
- Full Name is displayed as `first_name + " " + last_name` — concatenated on the frontend
- Edit and Delete buttons remain in the Action column
- Data is fetched from `GET /record` which returns all agents from MongoDB

### Out of Scope (Excluded)

- Delete button functionality (covered in CRUD Delete feature)
- Edit form field updates (covered in CRUD Update feature)
- Sorting or filtering
- Pagination
- Any backend changes — the `GET /record` endpoint is already complete

---

## Sub-Requirements (Feature Breakdown)

- Table Header — replace Name, Position, Level, Action with Full Name, Region, Rating, Fee, Sales, Action
- Table Row — update each data cell to display the correct field from the agent document
- Full Name — concatenate `first_name` and `last_name` with a space between them
- Action Column — keep the Edit link and Delete button exactly as they are

---

## User Flow / Logic (High Level)

1. User navigates to `/` (home page)
2. `RecordList` component mounts and `useEffect` fires
3. A `GET` request is sent to `http://localhost:5050/record/`
4. The backend queries MongoDB `agents.agents` and returns an array of agent documents
5. React stores the agents in state and re-renders the table
6. Each agent appears as one row with all 6 columns populated
7. If no agents exist, the table body is empty

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend

- `client/src/components/RecordList.jsx` — the only file that changes

### Backend / API

- `GET /record` — returns all agents from the `agents` collection (already implemented, no changes needed)

---

## Data Used or Modified

Each table row maps to one agent document from MongoDB:

| Column | Source field | Notes |
|--------|-------------|-------|
| Full Name | `first_name` + `" "` + `last_name` | Joined on the frontend |
| Region | `record.region` | String: North, East, South, West |
| Rating | `record.rating` | Integer 0–100 |
| Fee | `record.fee` | Dollar amount (Number) |
| Sales | `record.sales` | Integer, defaults to 0 |
| Action | — | Edit link + Delete button |

---

## Tech Constraints (Feature-Level)

- Use `fetch()` only — no Axios
- Do not rename the file `RecordList.jsx`
- The `key` prop on each row must use `record._id`
- Do not change the fetch URL or delete/edit logic
- Rename the internal sub-component from `Record` to `AgentRow` to avoid confusion with the `Record.jsx` form component

---

## Acceptance Criteria

- [ ] Table has exactly 6 columns: Full Name, Region, Rating, Fee, Sales, Action
- [ ] Full Name column shows `first_name` and `last_name` joined with a space
- [ ] Region, Rating, Fee, and Sales columns show correct data from MongoDB
- [ ] Action column still contains the Edit link and Delete button
- [ ] Table is populated by fetching from `GET /record`
- [ ] No tutorial columns (Name, Position, Level) appear anywhere in the table
- [ ] Adding an agent via Postman causes it to appear in the table on refresh

---

## Notes for the AI

- The internal `Record` sub-component at the top of `RecordList.jsx` renders a single table row — rename it to `AgentRow` to avoid confusion with the separate `Record.jsx` form component
- The variable names `records`, `setRecords`, `recordList`, `deleteRecord` can stay as-is
- Do not refactor anything outside of the table headers and row data cells
- Keep changes minimal — only what is needed to show the correct columns
