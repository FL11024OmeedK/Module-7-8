# 🤖 AI_FEATURE_CRUD-Delete

---

## Feature Identity

- **Feature Name:** CRUD Delete — Remove Agent
- **Related Area:** Fullstack (Frontend button + Backend endpoint)

---

## Feature Goal

Allow a user to delete an agent from the table. When the Delete button is clicked, the agent is permanently removed from MongoDB and the table refreshes immediately to reflect the change — no page reload required.

---

## Feature Scope

### In Scope (Included)

- Delete button in the Action column of the agent table triggers deletion
- A `DELETE` request is sent to the backend with the agent's `_id`
- The backend removes the agent document from MongoDB
- The table updates immediately after deletion without a full page reload

### Out of Scope (Excluded)

- Confirmation dialog before deleting (no "Are you sure?" prompt required)
- Soft delete (marking as inactive) — this is a hard delete
- Any changes to the Create or Edit form
- Any new backend routes — `DELETE /agents/:id` is already implemented

---

## Sub-Requirements (Feature Breakdown)

- Delete Button — the Delete button in `AgentRow` calls `deleteAgent` with the agent's `_id`
- Frontend Delete Function — `deleteAgent(id)` sends `DELETE http://localhost:5050/agents/:id` and removes the agent from local state
- Backend Delete Route — `DELETE /agents/:id` finds the agent by ObjectId and calls `deleteOne()` on the `agents` collection
- Table Refresh — after deletion, the agent disappears from the table immediately without a page reload

---

## User Flow / Logic (High Level)

1. User sees the agent table on the home page
2. User clicks the Delete button on a specific agent row
3. The frontend sends `DELETE http://localhost:5050/agents/:id` to the backend
4. The backend deletes the matching document from MongoDB
5. The frontend filters the deleted agent out of local state
6. React re-renders the table — the deleted agent is gone immediately

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend

- `client/src/components/AgentList.jsx` — `deleteAgent()` function and Delete button in `AgentRow`

### Backend / API

- `DELETE /agents/:id` — receives the agent `_id` as a URL parameter, deletes the matching document from `agentsDb.collection("agents")`, returns 200 with the deletion result

---

## Data Used or Modified

- Agent `_id` (ObjectId) — passed as a URL parameter to identify which document to delete
- The full agent document is permanently removed from the `agents` collection in MongoDB

---

## Tech Constraints (Feature-Level)

- Use `fetch()` only — no Axios
- The delete must use the HTTP `DELETE` method — not POST or GET
- After deletion, filter the agent from React state using `.filter()` — do not re-fetch the entire list
- The backend must convert `req.params.id` to `ObjectId` before querying — plain string IDs do not match MongoDB's `_id` field

---

## Acceptance Criteria

- [ ] Clicking Delete on an agent row removes that agent from the table immediately
- [ ] The deleted agent no longer appears in MongoDB Atlas
- [ ] No page reload is required — the table updates in place
- [ ] All other agents remain in the table after one is deleted
- [ ] `DELETE /agents/:id` returns a 200 response with `deletedCount: 1`

---

## Notes for the AI

- Both the frontend delete function and the backend route are already implemented — verify they work correctly rather than rewriting them
- The frontend uses `.filter()` to update local state after deletion rather than re-fetching from the API — this is intentional for performance
- Do not add a confirmation dialog — the grading sheet does not require one
