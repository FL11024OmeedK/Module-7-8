# Module 8 – Full Stack Development 3 (MERN Extended)

## 🎯 Purpose

Three challenging concepts applied in this project. Each concept is listed once even if used in multiple places.

---

## ✏️ Concept - 01

**🔤 Name:** UUID Cookie Sessions Replacing JWT localStorage

**🎯 Purpose:**
In Module 7, authentication worked like this: the user logged in, the server signed a JWT and returned it, and the frontend stored it in `localStorage`. Every subsequent request to `/agents` sent that JWT in the `Authorization` header, and the server's `requireAuth` middleware verified it.

Module 8 replaced this with a cookie-based session system. When a user logs in, the server now does two things: it returns the JWT (still used for the `/agents` route), and separately generates a UUID v4 token via `POST /session/:user_id`. That UUID is stored in MongoDB under the `sessions` collection with a `createdAt` timestamp, and sent to the browser as a cookie named `session_token`. On every page load, the frontend calls `GET /validate_token?token=<uuid>` — if MongoDB finds the session, the user is valid; if not, they are redirected to `/login`. MongoDB handles expiry automatically via a TTL index: `createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 })` silently deletes any session document older than 24 hours with no application code required.

The reason cookies are better than `localStorage` for session tokens is security: cookies can be scoped to a domain and are not accessible via JavaScript if marked `HttpOnly`, whereas `localStorage` is fully readable by any script on the page, making it vulnerable to XSS attacks. For this project `HttpOnly` was not set (it would break `react-use-cookie`), but the architectural shift toward cookies is the important pattern.

**❓ Why it was challenging:**
Several things went wrong before this worked. First, `uuid` was installed in `client/package.json` but not in `server/package.json` — the server crashed on startup with a module not found error because the UUID generation happens server-side. Second, `react-use-cookie` is a CommonJS-only package. Vite wraps CJS modules in an ESM shim and places the default export at `.default`, so `import useCookie from "react-use-cookie"` produces an object, not a function. Calling it as `useCookie("session_token", "")` threw "useCookie is not a function" in the browser. The fix was: `import useCookiePkg from "react-use-cookie"; const useCookie = useCookiePkg.default ?? useCookiePkg;` — the `??` operator unwraps the shim if present, otherwise falls back to the package directly. This pattern had to be applied in every file that uses the hook.

**📍 Where (file & line):**
- `server/routes/session.js` — lines 17–40 (UUID generation and MongoDB insert), lines 45–75 (token validation)
- `server/server.js` — lines 27–30 (TTL index creation on startup)
- `client/src/components/Login.jsx` — lines 8–9 (CJS/ESM interop pattern), lines 54–65 (session creation after login)
- `client/src/hooks/useTokenValidation.js` — lines 8–9 (same interop pattern), lines 16–42 (validation on every page)

---

## ✏️ Concept - 02

**🔤 Name:** Custom React Hook — `useTokenValidation`

**🎯 Purpose:**
A custom hook is a regular JavaScript function whose name starts with `use` and that calls one or more of React's built-in hooks internally. By extracting that logic into its own file, any component can get the same behavior with a single line instead of copy-pasting the same `useEffect`, `useState`, and `useNavigate` calls everywhere.

`useTokenValidation` encapsulates the full session check: it reads the `session_token` cookie, calls `GET /validate_token` on mount, redirects to `/login` if the token is missing or invalid, and returns the `user` object if the session is valid. Every protected page — `AgentList`, `AgentForm`, `Navbar`, `Transactions` — calls it at the top. The Navbar uses the returned `user` to display the logged-in user's first name. The other components call it without capturing the return value, purely for the redirect side effect.

**❓ Why it was challenging:**
The rules of hooks are strict: they can only be called at the top level of a React function (never inside a condition or loop), and only inside React components or other custom hooks. This means `useTokenValidation` must be called unconditionally at the top of every component that uses it — you cannot wrap it in an `if` to skip the check. Understanding *why* React enforces this (hooks depend on call order being stable across renders) took time to internalize.

The async pattern inside `useEffect` was also non-obvious. `useEffect` itself cannot be `async` — React ignores the returned Promise and it can cause memory leaks. Instead, an inner `async function validate()` is defined and then immediately called inside the effect. This is the standard pattern for async work inside `useEffect` and it appears in several places in the codebase.

Finally, the dependency array `[sessionToken, navigate]` required careful thought. Including `sessionToken` means the validation re-runs if the cookie changes (e.g. after logout). Including `navigate` satisfies the exhaustive-deps lint rule. Omitting either would cause either a stale closure or a lint warning.

**📍 Where (file & line):**
- `client/src/hooks/useTokenValidation.js` — full file (lines 1–45)
- `client/src/components/AgentList.jsx` — line 52 (called for redirect only)
- `client/src/components/AgentForm.jsx` — called at top (redirect only)
- `client/src/components/Navbar.jsx` — line 17 (return value used for `user.first_name`)
- `client/src/components/Transactions.jsx` — called at top (redirect only)

---

## ✏️ Concept - 03

**🔤 Name:** React Context API — Global Alert State Without Prop Drilling

**🎯 Purpose:**
The Context API is React's built-in solution for sharing state across components that are not directly connected in the component tree. Without it, the only way to pass data from a parent to a deeply nested child is "prop drilling" — threading the same prop through every intermediate component even if those components don't use it themselves.

In this project, any component on any page can trigger a toast notification (green for success, red for error). Without Context, the toast state (`show`, `message`, `variant`) would have to live in `App.jsx` and be passed as props down through every layout component to every component that needs it — `AgentList`, `AgentForm`, `Transactions`, and `Login` all trigger toasts but are at different levels of the tree.

`AlertContext.jsx` solves this with three exports: `AlertContext` (the context object itself), `AlertProvider` (a component that owns the state and wraps the app in `main.jsx`), and `useAlert` (a convenience hook that calls `useContext(AlertContext)` so any component can access `showAlert` with a single import). When `showAlert("Agent deleted.", "success")` is called from inside `AgentList`, it updates state inside `AlertProvider`, which triggers a re-render of `AlertToast` — even though `AlertToast` and `AgentList` have no parent-child relationship.

**❓ Why it was challenging:**
The mental model for Context is different from props. With props, data flows downward explicitly — you can trace it by reading the JSX. With Context, a component "reaches up" past its parents to grab shared state directly. This implicit connection is powerful but harder to debug, because there is no visible data flow in the component tree.

The Provider placement in `main.jsx` also matters: `AlertProvider` must wrap the `RouterProvider` so that every route — including the standalone `Login` page — can access the context. Placing it inside `App.jsx` instead would have excluded `Login` since it is not a child of `App`. Understanding that context availability is determined by where the Provider sits in the React tree, not by file location, was the key insight.

**📍 Where (file & line):**
- `client/src/context/AlertContext.jsx` — full file (lines 1–30): context creation, Provider, and `useAlert` hook
- `client/src/main.jsx` — line 55 (`AlertProvider` wrapping `RouterProvider`)
- `client/src/components/AlertToast.jsx` — full file (consumes `useAlert` to render the toast)
- `client/src/components/AgentList.jsx` — line 51 (`useAlert` call), line 82 and 85 (`showAlert` calls)
- `client/src/components/Transactions.jsx` — `useAlert` call and `showAlert` on success/error
