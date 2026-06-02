# Module 7 – Full Stack Development 2 (MERN)

## 🎯 Purpose

Three challenging concepts applied in this project. Each concept is listed once even if used in multiple places.

---

## ✏️ Concept - 01

**🔤 Name:** Keeping Frontend and Backend in Sync (MERN Stack)

**🎯 Purpose:**
In a MERN app the frontend and backend are completely separate programs. When the data model changes — for example, switching from `name`, `position`, `level` (tutorial defaults) to `first_name`, `last_name`, `email`, `region`, `rating`, `fee` (agent fields) — the change must be applied in multiple places across both sides of the stack, or the app silently breaks.

**❓ Why it was challenging:**
When I updated the backend schema to use agent fields, the frontend form and table still referenced the old field names. The POST request was sending `name` and `position` but the backend was expecting `first_name` and `last_name`, so MongoDB was storing `null` values. There was no error thrown — it just silently inserted wrong data. It required me to trace the full data flow from the form input through the fetch request through the backend schema and into MongoDB to find every place the field names needed to change.

**📍 Where (file & line):**
- `server/db/schemas/agent.schema.js` — lines 4–14 (field definitions in `createAgent`)
- `client/src/components/Record.jsx` — lines 5–12 (form state field names)
- `client/src/components/RecordList.jsx` — lines 7–20 (`AgentRow` data cells)

---

## ✏️ Concept - 02

**🔤 Name:** `useEffect` and the Dependency Array

**🎯 Purpose:**
`useEffect` is a React hook that runs code as a side effect — meaning something that happens outside of rendering, like fetching data from an API. In `RecordList.jsx`, it is used to fetch all agents from the backend when the component loads. The dependency array controls *when* the effect re-runs: an empty array `[]` means run once on mount, a value in the array means re-run every time that value changes, and no array at all means re-run after every single render.

**❓ Why it was challenging:**
The concept of a "side effect" is new in React — in previous modules, data fetching was just a function call. Understanding why React separates rendering from side effects takes time. The dependency array is the trickiest part: choosing the wrong values causes either an infinite loop (the effect runs, updates state, triggers a re-render, which triggers the effect again) or stale data (the effect never re-runs when it should). In `RecordList.jsx`, `[records.length]` was used as the dependency so the table re-fetches when an agent is added or deleted. Getting that dependency array right required understanding the relationship between state changes and the render cycle.

**📍 Where (file & line):**
- `client/src/components/RecordList.jsx` — lines 42–62 (`useEffect` with `[records.length]` dependency)

---

## ✏️ Concept - 03

**🔤 Name:** Dual-Purpose Component with `isNew` Flag (`Record.jsx`)

**🎯 Purpose:**
`Record.jsx` handles both creating a new agent and editing an existing one — in a single component. It determines which mode it is in by checking whether a URL parameter (`:id`) exists. If no `id` is in the URL (`/create`), the component is in create mode and sends a `POST` request. If an `id` is present (`/edit/:id`), it fetches the existing agent's data, pre-populates the form, and sends a `PATCH` request on submit. The `isNew` flag tracks which mode is active.

**❓ Why it was challenging:**
Four hooks work together in this one component — `useState`, `useEffect`, `useParams`, and `useNavigate` — and they each play a different role. `useParams` reads the URL to get the agent's ID. `useEffect` fires when the component mounts, checks if the ID exists, and fetches the agent data if it does. `useState` holds both the form data and the `isNew` flag. `useNavigate` redirects after submit. Understanding the sequence — mount, then effect, then conditional fetch, then form population — and why `isNew` needs to be set before the fetch resolves was the challenging part. It also required that the form state field names exactly matched the field names returned by MongoDB, otherwise pre-population silently fails.

**📍 Where (file & line):**
- `client/src/components/Record.jsx` — lines 5–12 (form state initialization)
- `client/src/components/Record.jsx` — lines 13–40 (`isNew` flag + `useEffect` for pre-population)
- `client/src/components/Record.jsx` — lines 47–81 (`onSubmit` with POST vs PATCH branching)
- `client/src/main.jsx` — lines 35–37 (`/create` and `/edit/:id` routes sharing the same component)
