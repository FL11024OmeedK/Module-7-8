# 🤖 AI_FEATURE_Modals

---

## Feature Identity

- **Feature Name:** Confirmation Modals
- **Related Area:** Frontend (touches all action components)

---

## Feature Goal

Prevent accidental destructive actions by requiring explicit user confirmation before any create, update, delete, or transaction submission completes. A single reusable `ConfirmationModal` component is used everywhere — the user sees "Are you sure you want to continue?" with a Confirm and a Back button before the action executes.

---

## Feature Scope

### In Scope (Included)

- Reusable `ConfirmationModal` component using React-Bootstrap `<Modal>`
- Modal appears before: create agent, edit/update agent, delete agent
- Modal appears before: submit transaction (hook-up point added in Feature 7)
- Confirm button proceeds with the action; Back/Cancel button aborts it
- Modal displays a simple message: "Are you sure you want to continue?"

### Out of Scope (Excluded)

- Toast notifications — already implemented in Feature 2; do not re-implement
- Session or cookie logic (Feature 4)
- Token validation (Feature 5)
- Transaction form UI (Feature 7) — modal will be wired to transactions in Feature 7
- Custom modal styles beyond React-Bootstrap defaults
- Multiple modal variants (one design used everywhere)

---

## Sub-Requirements (Feature Breakdown)

- **ConfirmationModal component created** — accepts `show`, `onConfirm`, `onCancel`, and `message` props; renders a React-Bootstrap `<Modal>` with Confirm and Back buttons
- **Delete agent gated** — clicking Delete in `AgentList` opens the modal; the actual delete fetch only fires if the user clicks Confirm
- **Create agent gated** — submitting the create form opens the modal; the actual POST only fires if the user clicks Confirm
- **Update agent gated** — submitting the edit form opens the modal; the actual PATCH only fires if the user clicks Confirm

---

## User Flow / Logic (High Level)

1. User clicks a destructive or significant action button (Delete, Save Agent)
2. The action is intercepted — the fetch does NOT fire yet
3. `ConfirmationModal` opens with "Are you sure you want to continue?"
4. **If user clicks Confirm** → the original action executes (fetch fires), modal closes
5. **If user clicks Back** → nothing happens, modal closes, user stays on the page

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend

- `client/src/components/ConfirmationModal.jsx` — new reusable modal component
- `client/src/components/AgentList.jsx` — intercept delete click to show modal first
- `client/src/components/AgentForm.jsx` — intercept form submit to show modal first

### Backend / API

- None — this feature is frontend-only; no API changes

---

## Data Used or Modified

- None — modal is a UI gate only; the underlying data operations are unchanged

---

## Tech Constraints (Feature-Level)

- Use React-Bootstrap `<Modal>`, `<Modal.Header>`, `<Modal.Body>`, `<Modal.Footer>`, `<Button>` — no custom HTML modal
- `ConfirmationModal` must be controlled via props (`show`, `onConfirm`, `onCancel`) — no internal state for open/close
- The parent component (AgentList, AgentForm) owns the `show` state and the pending action
- Do not move fetch logic out of the existing components — add the modal as a gate in front of existing code
- Do not remove or replace toast notifications added in Feature 2

---

## Acceptance Criteria

- [ ] Clicking Delete on any agent opens the confirmation modal
- [ ] Clicking Confirm in the modal deletes the agent and shows a success toast
- [ ] Clicking Back in the modal cancels the delete — agent is not removed
- [ ] Submitting the create agent form opens the confirmation modal
- [ ] Confirming creates the agent; cancelling does not
- [ ] Submitting the edit agent form opens the confirmation modal
- [ ] Confirming updates the agent; cancelling does not
- [ ] `ConfirmationModal` is a single reusable component used in all three places
- [ ] No console errors related to modal rendering

---

## Notes for the AI

- The pattern in each parent component is always the same: (1) store a `showModal` boolean in state, (2) on button/submit click set `showModal = true` instead of executing the action, (3) pass an `onConfirm` callback that executes the actual fetch, (4) pass an `onCancel` callback that just sets `showModal = false`.
- For `AgentForm`, the form's `onSubmit` currently fires the fetch directly. Intercept it: capture the form submit event, show the modal, and only call the fetch inside `onConfirm`. The `finally` block (reset form + navigate) should stay inside `onConfirm`, not `onSubmit`.
- For delete in `AgentList`, the delete button currently calls `deleteAgent(id)` directly via `props.deleteAgent`. Change it to open the modal and store the pending `id`, then call `deleteAgent` only from `onConfirm`.
- Keep `ConfirmationModal` purely presentational — no fetch logic, no context reads. It only receives props and renders.
- Transaction modal wiring will be added in Feature 7 when the transaction form is built.
