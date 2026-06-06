# Login & Logout Flow

A complete trace of every file, every data transfer, and every interaction involved
in the login and logout features of the RE Admin application.
Written for someone learning how these three layers talk to each other.

Throughout this flow, think of each file as a person inside one organization working
toward the same goal: verify the visitor's identity, issue an access badge, and
revoke it cleanly on exit. Login.jsx is the security desk collecting credentials,
users.js is the badge checker verifying them against the records, connection.js
carries the lookup to MongoDB Atlas, config.env holds the signing secret, auth.js
is the checkpoint every protected request passes through after login, Navbar.jsx
holds the logout button that destroys the badge, and Unauthorized.jsx is the
polite turn-back desk when credentials are rejected.

---

## How the three layers relate in this feature

Login and logout touch all three layers in sequence. The frontend collects credentials
and stores the token. The backend verifies credentials, signs the token, and guards
every protected route behind it. The database stores the user documents that the
backend checks against.

The frontend never reads the database directly. The token is created on the backend
and stored in the browser. Every subsequent request to a protected route carries
that token — the backend verifies it without touching the database again.

---

## Section 0: Architecture at a Glance

### Files Involved in Login and Logout

**Frontend (client/ folder)**

| File | Role in this feature |
|---|---|
| main.jsx | Defines the route table. Maps /login to Login.jsx and /unauthorized to Unauthorized.jsx as standalone routes (no App wrapper, no Navbar). Maps / to App.jsx which wraps AgentList.jsx — the destination after a successful login. |
| Login.jsx | The login form. Collects email and password, sends them to users.js, stores the returned JWT in localStorage on success, and navigates the user to / or /unauthorized based on the response. |
| Unauthorized.jsx | Static rejection page. Rendered when Login.jsx receives a 401. Contains a single link back to Login.jsx. Makes no server calls. |
| Navbar.jsx | Rendered by App.jsx on every protected page. Contains the logout button, which calls localStorage.removeItem("token") and navigate("/login"). |
| App.jsx | Layout shell for /. Renders Navbar.jsx permanently at the top and AgentList.jsx in the Outlet below. Reached after a successful login via navigate("/"). |

**Backend (server/ folder)**

| File | Role in this feature |
|---|---|
| server.js | Composition root. Registers cors(), express.json(), and requireAuth from auth.js. Mounts users.js at /users (public — no auth required). Mounts agents.js at /agents behind requireAuth. Every request enters here first. |
| users.js | The only backend file Login.jsx talks to. Receives credentials, queries usersDb from connection.js, and on success calls jwt.sign() to create a token and returns it as { token: "eyJ..." }. |
| auth.js | JWT verification middleware inserted between server.js and agents.js. Reads the Authorization header, calls jwt.verify() using JWT_SECRET from config.env, and either calls next() or returns 401. Never runs for /users routes. |
| connection.js | Holds the persistent MongoDB Atlas connection. Exports usersDb, which users.js uses to look up the user document by email. |
| config.env | Holds JWT_SECRET — the signing secret used by users.js to sign tokens and by auth.js to verify them. Both files read it from process.env at runtime. |

**Database (MongoDB Atlas)**

| Database | Collection | Used By | Purpose |
|---|---|---|---|
| users | users | users.js POST /login | Stores user documents with email and password fields. users.js calls findOne({ email }) against this collection to look up the visitor. |

### How Login.jsx loads vs how AgentList.jsx loads

Login.jsx and AgentList.jsx are loaded through different paths in main.jsx.

Login.jsx is a top-level route with no parent:
```
{ path: "/login", element: <Login /> }
```
React Router matches /login and injects Login.jsx directly into #root. App.jsx is
never involved. No Navbar, no Outlet, no shared layout. Login.jsx lands directly
in #root — the browser's injection point for React.

AgentList.jsx is a child route nested inside App.jsx:
```
{ path: "/", element: <App />, children: [{ index: true, element: <AgentList /> }] }
```
React Router matches /, renders App.jsx into #root, then renders AgentList.jsx into
the <Outlet /> inside App.jsx. Two components load, not one. AgentList.jsx lands in
<Outlet />, which is inside App.jsx, which is inside #root.

The relationship: #root and <Outlet /> solve the same problem at different levels —
both are named slots where something gets injected. #root is the browser's injection
point for React. <Outlet /> is React Router's injection point for the current page.

### Port Diagram

```
Browser (port 5173)          Express server (port 5050)       MongoDB Atlas (cloud)
served by Vite dev server    started by npm run dev           accessed via ATLAS_URI
        │                              │                               │
        │  POST /users/login           │  findOne({ email })          │
        │  { email, password }         │  returns user doc or null    │
        │                              │                               │
        │  ◄── 200 { token }           │  jwt.sign() → token          │
        │  ◄── 401 Unauthorized        │                               │
        │                              │                               │
        │  GET/POST/PATCH/DELETE       │  jwt.verify(token,           │
        │  Authorization: Bearer token │  JWT_SECRET) in auth.js      │
        └──────────────────────────────►│◄──────────────────────────────┘
```

### Middleware Chain for This Feature

Every HTTP request that arrives at port 5050 passes through this chain. The order is
fixed by the order of app.use() calls in server.js.

```
Incoming HTTP request (from Login.jsx or AgentList.jsx)
        │
        ▼
   cors()  ────────────────────  Adds Access-Control-Allow-Origin: * to every response.
        │                        Required because Login.jsx at port 5173 is calling the
        │                        Express server at port 5050. Without this header, the
        │                        browser would block the response (Same-Origin Policy).
        ▼
   express.json()  ─────────────  Parses the raw JSON body string into req.body.
        │                        For POST /users/login, this converts the string
        │                        '{"email":"x","password":"y"}' into the JavaScript
        │                        object { email: "x", password: "y" } so users.js
        │                        can read req.body.email and req.body.password.
        ▼
   Route match
        ├── /users  ──────────►  users.js runs directly. No requireAuth here.
        │                        The login endpoint MUST be public — you cannot
        │                        require a token to obtain a token.
        │
        └── /agents ──────────►  requireAuth (auth.js) runs FIRST, inserted as a
                │                second argument: app.use("/agents", requireAuth, agents).
                │                auth.js reads the Authorization header, calls
                │                jwt.verify() using JWT_SECRET from config.env, and
                │                either calls next() to continue to agents.js, or
                │                returns 401 immediately. agents.js never runs if
                │                the token is missing, malformed, or expired.
                ▼
           agents.js runs with req.user = { id, email, iat, exp } attached by auth.js.
```

### JWT Token Lifecycle

```
1. users.js calls jwt.sign()      →  token created, signed with JWT_SECRET
                                       payload: { id, email }
                                       expiry: 24h
                                       format: header.payload.signature (base64)

2. Login.jsx receives { token }   →  localStorage.setItem("token", token)
                                       stored in browser's persistent key-value store
                                       survives page refreshes

3. AgentList/AgentForm fetch      →  Authorization: Bearer <localStorage.getItem("token")>
                                       header attached to every /agents request

4. auth.js calls jwt.verify()     →  signature recomputed using JWT_SECRET
                                       if payload was tampered → signatures don't match → 401
                                       if token older than 24h → exp check fails → 401
                                       if valid → next() → agents.js runs

5. Navbar.jsx logout()            →  localStorage.removeItem("token")
                                       token gone from browser
                                       future fetches send Authorization: Bearer null
                                       auth.js returns 401
                                       navigate("/login") → user sees Login.jsx
```

---

## Section 1: Client Startup (Login-relevant files only)

How the login-related React components get from source files to a running page.

```
main.jsx  [Entry Point / Route Table]
    │  Role:      main.jsx is the routing coordinator for the entire frontend. For the
    │             login and logout feature specifically, main.jsx does two things: it
    │             maps /login to Login.jsx and /unauthorized to Unauthorized.jsx as
    │             top-level standalone routes (no App.jsx wrapper, no Navbar), and it
    │             maps / to App.jsx wrapping AgentList.jsx — the destination navigate("/")
    │             sends the user to after a successful login. main.jsx does not execute
    │             any login logic itself — it only assigns which component renders at
    │             which URL and assembles the React app into #root.
    │  In:        document.getElementById("root") — the empty <div id="root"> that
    │             index.html created. ReactDOM.createRoot().render() mounts the entire
    │             app here. React Router reads the current URL to decide which component
    │             to render first.
    │  Out:       A RouterProvider is active. The browser URL controls what renders.
    │             /login → Login.jsx injected directly into #root (no App wrapper).
    │             /unauthorized → Unauthorized.jsx injected directly into #root.
    │             / → App.jsx into #root, AgentList.jsx into App.jsx's <Outlet />.
    │  Route definitions relevant to this feature:
    │             { path: "/login",        element: <Login /> }
    │             { path: "/unauthorized", element: <Unauthorized /> }
    │             { path: "/",             element: <App />,
    │               children: [{ index: true, element: <AgentList /> }] }
    │  Imports:   Login from Login.jsx, Unauthorized from Unauthorized.jsx, App from
    │             App.jsx — all imported here and assigned to their paths. main.jsx is
    │             the only file that connects these components to URL paths.
    │
    ├──► Login.jsx  [Page / View] ──── renders at  /login  (no Navbar, no App wrapper)
    │        Role:      Login.jsx is the authentication entry point and a standalone
    │                   page. It is defined outside App.jsx in main.jsx's route tree,
    │                   so it renders directly into #root with no Navbar and no Outlet.
    │                   The user reaches Login.jsx when the app first loads at /login,
    │                   when they click Logout in Navbar.jsx (which calls navigate("/login")
    │                   after removing the token), or when Unauthorized.jsx's "Back to
    │                   Login" link is clicked. Its sole job is to collect credentials,
    │                   send them to users.js on the backend, store the returned JWT in
    │                   localStorage on success, and route the user based on the result.
    │                   Login.jsx is the security receptionist: it gathers the visitor's
    │                   claim and asks users.js whether entry should be granted.
    │
    │        FRONTEND → BACKEND interaction (on submit):
    │        When the user clicks Login, onSubmit(e) fires. e.preventDefault() stops
    │        the browser from reloading the page — the default behavior of an HTML form
    │        submit. onSubmit() calls fetch() with method: "POST", headers: { "Content-Type":
    │        "application/json" }, and body: JSON.stringify(form). This sends an HTTP POST
    │        request to http://localhost:5050/users/login. Content-Type: application/json
    │        tells server.js's express.json() middleware that the body is JSON so it can
    │        parse it into req.body before the request reaches users.js. The body,
    │        once serialized, looks like: { "email": "user@rocket.elv", "password": "secret" }.
    │        This data travels over the local network from the browser (port 5173) to the
    │        Express server (port 5050). The request never touches MongoDB — that is
    │        users.js's job once the request arrives.
    │
    │        BACKEND → FRONTEND response handling:
    │        The await fetch() in Login.jsx resolves when users.js sends its response.
    │        Login.jsx checks response.ok — true for any 2xx status, false for 4xx/5xx.
    │        If response.ok is true (200): Login.jsx calls response.json() to parse the
    │        body, destructures { token }, and calls localStorage.setItem("token", token).
    │        localStorage is a browser-native key-value store that persists across page
    │        refreshes and navigations — the token stays there until explicitly removed
    │        by logout() in Navbar.jsx. Login.jsx then calls navigate("/"), which tells
    │        React Router to change the URL to / and render App.jsx + AgentList.jsx.
    │        AgentList.jsx immediately reads the token back from localStorage and attaches
    │        it to its first GET /agents fetch. If response.ok is false (401): no token
    │        is stored. Login.jsx calls navigate("/unauthorized"), which renders
    │        Unauthorized.jsx as a standalone page.
    │
    │        In:        The user types an email and password into controlled form inputs.
    │                   Each keystroke calls updateForm(), which merges the new character
    │                   into form{ email, password } state using the spread operator —
    │                   only the changed field updates, the other is preserved. On submit,
    │                   onSubmit() sends form{ email, password } as a JSON body to
    │                   users.js POST /login at http://localhost:5050/users/login.
    │                   The exact request: POST http://localhost:5050/users/login
    │                   headers: { "Content-Type": "application/json" }
    │                   body: { "email": "user@rocket.elv", "password": "secret" }
    │        Out:       On 200: response.json() → { token } → localStorage.setItem("token")
    │                   → navigate("/") → App.jsx + AgentList.jsx render. The token is now
    │                   in localStorage and will be read by AgentList.jsx, AgentForm.jsx,
    │                   and any future protected component via localStorage.getItem("token").
    │                   On 401: navigate("/unauthorized") → Unauthorized.jsx renders.
    │                   No token stored. Nothing written to localStorage.
    │        Imports:   useState from 'react' — manages form{ email, password } state.
    │                   useNavigate from 'react-router-dom' — provides navigate() to
    │                   redirect after the users.js response arrives. navigate("/") sends
    │                   the user to AgentList.jsx on success. navigate("/unauthorized")
    │                   sends the user to Unauthorized.jsx on failure.
    │        Exports:   Default export Login. Imported exclusively by main.jsx, which
    │                   routes it at /login. Also the navigation destination of
    │                   Navbar.jsx's logout() and Unauthorized.jsx's "Back to Login" Link.
    │        Functions: updateForm(value) takes a partial object (e.g., { email: "x" })
    │                   and merges it into form{} using setForm((prev) => ({ ...prev, ...value })).
    │                   This is the controlled input pattern — every keystroke updates state,
    │                   and the input's value is always bound to the state, keeping them in sync.
    │                   onSubmit(e) calls e.preventDefault(), then fetch() POST to users.js.
    │                   On 200: response.json() → localStorage.setItem("token") → navigate("/").
    │                   On 401: navigate("/unauthorized").
    │        State:     form{ email, password } holds the two controlled input fields.
    │                   Each input's value is bound to its corresponding field in form{}.
    │                   onChange calls updateForm() to keep the displayed text and state in sync.
    │                   The token returned by users.js is NOT stored in React state —
    │                   it goes directly into localStorage, making it available to
    │                   AgentList.jsx and AgentForm.jsx without prop drilling or context.
    │
    ├──► Unauthorized.jsx  [Page / View] ── renders at  /unauthorized  (no Navbar)
    │        Role:      Unauthorized.jsx is a static guard page. It renders when Login.jsx's
    │                   onSubmit() receives a 401 response from users.js and calls
    │                   navigate("/unauthorized"). It is defined outside App.jsx in main.jsx
    │                   so it has no Navbar. It is purely informational — it tells the user
    │                   their credentials were not recognized and gives them a way back to
    │                   Login.jsx. No data is fetched, no server calls are made, and nothing
    │                   is written to localStorage. Unauthorized.jsx is the polite turn-back
    │                   desk: it reports users.js's rejection and points the user back to
    │                   Login.jsx.
    │        In:        Receives no props. Performs no data fetching. Rendered purely as
    │                   a consequence of Login.jsx calling navigate("/unauthorized") after
    │                   users.js returns a 401 response. At the moment it renders, the user
    │                   has just been rejected by the credential check in users.js, and
    │                   no token exists in localStorage.
    │        Out:       Renders a static "Access Denied" heading, an explanatory message,
    │                   and a Link to="/login". Clicking that Link renders Login.jsx again,
    │                   allowing the user to try different credentials. No HTTP request
    │                   is made when navigating to or from Unauthorized.jsx.
    │        Imports:   Link from 'react-router-dom'. The Link to="/login" renders as an
    │                   anchor tag that tells React Router to navigate to /login and render
    │                   Login.jsx — completing the cycle back to the start of the auth flow.
    │        Exports:   Default export Unauthorized. Imported by main.jsx, routed at
    │                   /unauthorized. Reached only via Login.jsx's navigate call on
    │                   authentication failure, and it links back only to Login.jsx.
    │        Functions: Unauthorized.jsx defines no functions. The only interactivity is
    │                   the Link back to Login.jsx.
    │
    └──► App.jsx + Navbar.jsx  [Layout Shell + Logout]
             Role:      App.jsx is the persistent layout wrapper for all protected pages.
                        It is rendered at / after a successful login. It renders Navbar.jsx
                        at the top and AgentList.jsx (or AgentForm.jsx) in the Outlet below.
                        Navbar.jsx is the file that holds the logout button — it is rendered
                        by App.jsx on every protected page. Login.jsx and Unauthorized.jsx
                        are NOT children of App.jsx, so Navbar.jsx never appears on those
                        pages.
             Navbar.jsx logout():
             The logout button in Navbar.jsx calls logout() on click:
             ```js
             function logout() {
               localStorage.removeItem("token");
               navigate("/login");
             }
             ```
             localStorage.removeItem("token") destroys the JWT from the browser's
             key-value store. This is the only logout mechanism — JWTs are stateless,
             meaning the server cannot invalidate a token once issued. Destroying the
             token client-side is what makes the logout effective: without the token
             in localStorage, AgentList.jsx and AgentForm.jsx would send
             Authorization: Bearer null on their next fetch, which auth.js on the
             server would reject with 401. navigate("/login") then tells React Router
             to render Login.jsx. No server request is made during logout.
             Imports:   NavLink and useNavigate from 'react-router-dom'. useNavigate
                        provides the navigate() function used in logout() to redirect
                        to /login after removing the token.
             Exports:   Default export Navbar. Imported exclusively by App.jsx. No
                        other file in the project imports Navbar.jsx.
```

---

## Section 2: Server Startup (Login-relevant files only)

How the backend files involved in login are wired together at startup.

```
config.env  [Environment Config]
    │  Role:      config.env holds two secrets critical to the login and auth features:
    │             ATLAS_URI — the MongoDB Atlas connection string that connection.js uses
    │             to open the database connection and reach the users collection — and
    │             JWT_SECRET — the private signing key that users.js uses to sign tokens
    │             and that auth.js uses to verify them. Both values live here so they
    │             never appear in source code and are never committed to git. config.env
    │             is the locked credentials cabinet: without ATLAS_URI, users.js cannot
    │             reach the users collection; without JWT_SECRET, users.js cannot sign
    │             tokens and auth.js cannot verify them.
    │  In:        The --env-file=config.env flag on the node command (npm run dev) tells
    │             Node.js to read this file before executing any application code. Every
    │             KEY=VALUE pair is added to process.env, a built-in Node.js object
    │             readable by any server file.
    │  Out:       process.env.ATLAS_URI — read by connection.js to open the Atlas connection.
    │             process.env.PORT — read by server.js to choose its listening port.
    │             process.env.JWT_SECRET — read by users.js inside jwt.sign() and by
    │             auth.js inside jwt.verify(). Both files read the same value from
    │             process.env at runtime — this shared secret is what links the two:
    │             a token signed by users.js with JWT_SECRET can only be verified by
    │             auth.js if auth.js uses the exact same JWT_SECRET.
    │  Contains:  ATLAS_URI, PORT, JWT_SECRET.
    │
    ▼
server.js  [Entry Point / Composition Root]
    │  Role:      server.js is the switchboard operator for the entire backend. It is
    │             the file that wires users.js, auth.js, and agents.js together. For
    │             the login and logout feature specifically, server.js does three things:
    │             it registers cors() and express.json() as global middleware (required
    │             for Login.jsx's cross-origin POST request to be processed), it mounts
    │             users.js at /users WITHOUT requireAuth (login must be public), and it
    │             mounts agents.js at /agents WITH requireAuth from auth.js (all agent
    │             routes are protected after login). server.js itself contains no login
    │             logic — it is purely wiring.
    │  In:        process.env.PORT from config.env for the listening port.
    │             Imports the router from users.js, the router from agents.js, and the
    │             requireAuth function from auth.js. Importing these modules executes
    │             their top-level code — which means connection.js's client.connect()
    │             runs at this point, opening the Atlas connection before any request arrives.
    │  Out:       An HTTP server listening on port 5050. Every incoming request passes
    │             through cors() and express.json() first, then is routed to users.js
    │             (for /users) or through auth.js then agents.js (for /agents).
    │  The three app.use() calls relevant to this feature:
    │             app.use(cors())            — every response gets CORS headers.
    │             app.use(express.json())    — every POST/PATCH body is parsed into req.body.
    │             app.use("/agents", requireAuth, agents) — auth.js guards agents.js.
    │             app.use("/users",  users)  — users.js is public, no requireAuth.
    │
    ├──► auth.js  [Middleware] ──────────── guards all  /agents  routes
    │        Role:      auth.js is the security checkpoint inserted between server.js
    │                   and agents.js. It is registered as a second argument in server.js's
    │                   app.use("/agents", requireAuth, agents) call, which means every
    │                   request to any /agents route — GET, POST, PATCH, DELETE — passes
    │                   through auth.js before agents.js ever runs. If auth.js rejects
    │                   the request, agents.js is never called. auth.js never runs for
    │                   /users routes — those are mounted separately without requireAuth,
    │                   because the login endpoint must remain publicly reachable.
    │                   auth.js is the checkpoint between server.js and agents.js: no
    │                   request enters agents.js without first presenting a valid badge.
    │        In:        Every request to /agents arrives here after cors() and express.json()
    │                   have already run. auth.js reads req.headers.authorization. The
    │                   header must be present and start with "Bearer " — the standard
    │                   format: Authorization: Bearer eyJ... The token string is extracted
    │                   by splitting on the space: authHeader.split(" ")[1].
    │        Out:       auth.js calls jwt.verify(token, process.env.JWT_SECRET).
    │                   jwt.verify() does two things simultaneously:
    │                   1. Recomputes the cryptographic signature using JWT_SECRET and
    │                      checks it matches the signature on the incoming token. If
    │                      anyone tampered with the payload (e.g., changed the user id),
    │                      the signatures will not match and verify() throws.
    │                   2. Checks the exp claim in the payload. If the token was issued
    │                      more than 24 hours ago (the expiresIn set by users.js when
    │                      it called jwt.sign()), verify() throws automatically.
    │                   If both checks pass: auth.js attaches the decoded payload to
    │                   req.user = { id, email, iat, exp } and calls next(), passing
    │                   control to agents.js.
    │                   If the header is missing or does not start with "Bearer ":
    │                   res.status(401).json({ error: "No token provided" }) — returned
    │                   immediately, agents.js never runs.
    │                   If the token is invalid, expired, or tampered with:
    │                   res.status(401).json({ error: "Invalid or expired token" }) —
    │                   returned immediately, agents.js never runs.
    │        Imports:   jwt from 'jsonwebtoken' — provides jwt.verify().
    │                   process.env.JWT_SECRET from config.env — the same secret that
    │                   users.js used in jwt.sign(). Both files must use the same value
    │                   or every verification will fail.
    │        Exports:   requireAuth as a named export. server.js imports it and inserts
    │                   it as the second argument in app.use("/agents", requireAuth, agents).
    │                   No other file imports auth.js.
    │        Functions: requireAuth(req, res, next) — reads req.headers.authorization,
    │                   extracts the token, calls jwt.verify(), attaches the decoded payload
    │                   to req.user, and calls next(). Or short-circuits with 401 if
    │                   anything fails. next() is the Express convention for "I am done,
    │                   pass this request to the next handler" — in this case, agents.js.
    │
    └──► users.js  [Route Handler] ───────── handles  POST  /users/login
             Role:      users.js is the only server-side file that Login.jsx communicates
                        with. It receives credentials from Login.jsx, queries the users
                        database via usersDb from connection.js, validates the email and
                        password, and on success calls jwt.sign() to create a signed token
                        and returns it as { token: "eyJ..." }. users.js is the badge
                        issuer: Login.jsx brings the visitor's claim, connection.js carries
                        the lookup to Atlas, and users.js either rejects the claim with
                        401 or stamps and returns the access badge.
             In:        A POST /login request arrives forwarded from server.js. req.body
                        contains { email: string, password: string } — the values the user
                        typed into Login.jsx's form, parsed from JSON by server.js's
                        express.json() middleware before reaching this handler.
                        Exact body shape: { "email": "user@rocket.elv", "password": "secret" }.
             Out:       users.js calls usersDb.collection("users").findOne({ email })
                        on the usersDb reference imported from connection.js. This sends
                        a query to MongoDB Atlas's users database.
                        Check 1: if Atlas returns null → no user with that email exists →
                        users.js sends HTTP 401 "Unauthorized: email not found" → Login.jsx
                        calls navigate("/unauthorized") → Unauthorized.jsx renders.
                        Check 2: if Atlas returns a document but user.password !== req.body.password
                        → users.js sends HTTP 401 "Unauthorized: incorrect password" →
                        Login.jsx calls navigate("/unauthorized") → Unauthorized.jsx renders.
                        ⚠ Passwords are stored and compared as plaintext — no hashing.
                        This is a security vulnerability that would need to be addressed
                        before production use.
                        Check 3: both checks pass → users.js calls:
                        jwt.sign(
                          { id: user._id, email: user.email },
                          process.env.JWT_SECRET,
                          { expiresIn: "24h" }
                        )
                        jwt.sign() creates a base64-encoded string in three parts:
                        header.payload.signature. The header declares the algorithm.
                        The payload contains { id, email, iat (issued-at), exp (expiry) }.
                        The signature is a cryptographic hash of the header + payload
                        using JWT_SECRET. Any tampering with the payload after signing
                        will invalidate the signature — auth.js will detect this when
                        it calls jwt.verify() on the next request.
                        users.js sends HTTP 200 { token: "eyJ..." } back to Login.jsx.
                        Login.jsx stores the token in localStorage and navigates to /.
             Imports:   express from 'express' — creates the router instance.
                        jwt from 'jsonwebtoken' — provides jwt.sign() to create the token.
                        usersDb from connection.js — the live MongoDB "users" database
                        reference. connection.js also exports agentsDb, but users.js
                        never imports or uses it — the login flow only touches the
                        users database.
             Exports:   Default export is the Express router. server.js imports it as
                        "users" and mounts it via app.use("/users", users). No requireAuth
                        is inserted — the login endpoint is public by design.
             Routes:    POST /users/login ← called by Login.jsx's onSubmit() via
                        fetch POST /users/login. Queries usersDb from connection.js,
                        validates credentials, calls jwt.sign(), returns { token } on
                        200 or an error string on 401.
             │
             ├──► user.schema.js  [Schema Factory] ── createUser()  (orphaned — not used)
             │        Role:      user.schema.js defines what a user document should look like
             │                   in MongoDB. However, it is currently an orphaned file — it is
             │                   not imported by users.js or any other active route. User documents
             │                   are created manually inside MongoDB Atlas rather than through an
             │                   API endpoint. user.schema.js would be used if a POST /users/register
             │                   endpoint were ever added to users.js. It is a drafted HR intake
             │                   form waiting for a registration desk that has not been built.
             │        Functions: createUser({ first_name, last_name, email, password }) would
             │                   return { first_name, last_name, email, password } — no hashing.
             │        Exports:   createUser is exported as a named export but is not currently
             │                   imported by users.js or any other file.
             │
             └──► connection.js  [Database Connection] ── usersDb
                      Role:      connection.js holds the single persistent TCP connection
                                 to MongoDB Atlas for the entire server. For the login
                                 feature, users.js imports usersDb from connection.js
                                 and calls usersDb.collection("users").findOne({ email })
                                 to look up the visitor. connection.js does not participate
                                 in JWT creation or verification — it only carries the
                                 credential lookup. The token itself is created entirely
                                 in-memory by users.js using jwt.sign() and JWT_SECRET
                                 from config.env, with no database involvement.
                                 connection.js is the database liaison: users.js asks it
                                 to carry one question to Atlas — "does this email exist?"
                                 — and Atlas returns the answer.
                      In:        users.js calls usersDb.collection("users").findOne({ email:
                                 req.body.email }). The filter { email: req.body.email }
                                 tells Atlas: find one document where email equals this value.
                      Out:       Atlas searches the "users" collection and returns either a
                                 full user document or null. Document shape (defined by
                                 user.schema.js, created manually in Atlas):
                                 { _id: ObjectId, first_name, last_name, email, password }
                                 The password is stored as plaintext. This result travels
                                 back through connection.js to users.js, which runs the
                                 two credential checks before deciding whether to call jwt.sign().
                      Exports:   agentsDb and usersDb as named exports. Only usersDb is
                                 used in the login flow. agentsDb is used by agents.js
                                 for all agent CRUD operations after login succeeds.
```

---

## Section 3: Login Flow (frontend → backend → database → back)

A complete step-by-step trace of what happens from the moment the user types their
credentials to the moment they see the agent dashboard.

```
Login.jsx  [Page / View]
    │  Role:      Login.jsx initiates the entire authentication sequence. It owns the
    │             form, the state, the fetch call, the token storage, and the navigation
    │             decision. Every other file in this flow is a downstream consequence of
    │             Login.jsx calling onSubmit(). Login.jsx is the security desk: it collects
    │             the claim and passes it to the backend organization for verification.
    │  In:        The user types into two controlled inputs. Each keystroke fires updateForm():
    │             updateForm({ email: e.target.value }) or updateForm({ password: e.target.value })
    │             updateForm() uses the spread-and-merge pattern:
    │             setForm((prev) => ({ ...prev, ...value }))
    │             This updates only the changed field, leaving the other untouched. The
    │             input's value prop is always bound to its form{} field — the input and
    │             the state are always identical. This is called a controlled input.
    │  Out:       The user clicks Login. onSubmit(e) fires:
    │             e.preventDefault()  — stops browser from reloading the page.
    │             fetch("http://localhost:5050/users/login", {
    │               method: "POST",
    │               headers: { "Content-Type": "application/json" },
    │               body: JSON.stringify(form)
    │             })
    │             JSON.stringify(form) converts { email: "x", password: "y" } to
    │             '{"email":"x","password":"y"}'. Content-Type: application/json tells
    │             server.js's express.json() what format the body is in. This is the
    │             first moment any data leaves the browser.
    │  fetch("http://localhost:5050/users/login", { method: "POST", body: { email, password } })
    ▼
server.js  [Middleware Chain]
    │  Role:      server.js is the first backend file to touch the request. It does not
    │             contain any login logic — it only runs the middleware and routes the
    │             request to users.js. For this specific request (/users/login), the
    │             middleware chain is: cors() → express.json() → users.js. requireAuth
    │             from auth.js does NOT run here — /users is mounted without it.
    │  In:        The raw HTTP POST request from Login.jsx arrives at port 5050.
    │  Out:       cors() adds Access-Control-Allow-Origin: * to the response headers,
    │             allowing the browser to accept the response from a different port.
    │             express.json() reads the raw body string and parses it into req.body:
    │             req.body = { email: "user@rocket.elv", password: "secret" }
    │             Without express.json(), req.body would be undefined and users.js could
    │             not read the credentials. The /users prefix matches, so the request is
    │             forwarded to users.js. requireAuth does NOT run — login is public.
    │  cors() → express.json() → users.js (no requireAuth)
    ▼
users.js  [Route Handler]  POST /users/login
    │  Role:      users.js receives the parsed credentials from server.js and runs the
    │             three-step validation sequence. It is the badge issuer: it checks the
    │             claim, looks up the record, and either rejects or signs a token.
    │  In:        req.body = { email: "user@rocket.elv", password: "secret" }
    │             Both values were typed by the user in Login.jsx and parsed by express.json().
    │  Out:       users.js calls usersDb.collection("users").findOne({ email }) on the
    │             usersDb reference imported from connection.js. This sends a query to
    │             MongoDB Atlas. users.js awaits the result before continuing.
    │  usersDb.collection("users").findOne({ email: req.body.email })
    ▼
connection.js  [Database Connection]  (usersDb)
    │  Role:      connection.js carries the findOne query over the persistent TCP connection
    │             to MongoDB Atlas. It does not interpret the result — it simply executes
    │             the operation and returns what Atlas sends back to users.js.
    │  In:        users.js calls findOne({ email }) on the usersDb reference that
    │             connection.js exported. The filter { email: req.body.email } tells Atlas:
    │             find one document in the "users" collection where email equals this value.
    │  Out:       Atlas searches the "users" collection and returns either a full user
    │             document ({ _id, first_name, last_name, email, password }) or null.
    │             This result travels back to users.js.
    │  findOne({ email }) → Atlas → user document or null
    ▼
MongoDB Atlas  (users database, users collection)
    │  Atlas executes the findOne({ email }) query. If a document with that email
    │  exists, Atlas returns the full document including the plaintext password field.
    │  If no document matches, Atlas returns null. This result travels back through
    │  connection.js to users.js.
    │  returns user document or null
    ▼
users.js  →  credential checks  →  jwt.sign()  →  response
    │  Role:      users.js evaluates the Atlas result and runs the two checks. On failure
    │             it short-circuits with 401. On success it calls jwt.sign() and returns
    │             the token. users.js is the only file that creates tokens.
    │  Check 1 — email:
    │             if (!user) return res.status(401).send("Unauthorized: email not found")
    │             → Login.jsx receives 401 → response.ok is false → navigate("/unauthorized")
    │             → Unauthorized.jsx renders.
    │  Check 2 — password:
    │             if (user.password !== password) return res.status(401).send("Unauthorized: incorrect password")
    │             → Login.jsx receives 401 → response.ok is false → navigate("/unauthorized")
    │             → Unauthorized.jsx renders.
    │             ⚠ Plaintext comparison — no hashing. Security vulnerability.
    │  Check 3 — both valid:
    │             const token = jwt.sign(
    │               { id: user._id, email: user.email },
    │               process.env.JWT_SECRET,
    │               { expiresIn: "24h" }
    │             )
    │             jwt.sign() creates a three-part base64 string: header.payload.signature.
    │             The payload embeds { id, email } so auth.js can attach them to req.user
    │             without another database lookup. The signature is a cryptographic hash
    │             of the header + payload using JWT_SECRET from config.env. Any post-issuance
    │             tampering with the payload invalidates the signature — auth.js catches this.
    │             res.status(200).json({ token })
    │             The token string travels back through server.js over HTTP to Login.jsx.
    │  on 401: Login.jsx → navigate("/unauthorized")
    └  on 200: { token: "eyJ..." } → Login.jsx
    ▼
Login.jsx  [Page / View]  — response received
    │  Role:      Login.jsx receives the HTTP response from users.js and makes the final
    │             routing decision. It is also responsible for storing the token.
    │  In:        The HTTP response from users.js. response.ok is true for 200, false for 401.
    │  On 200 — success path:
    │             const { token } = await response.json()
    │             localStorage.setItem("token", token)
    │             navigate("/")
    │             localStorage is the browser's persistent key-value store. The token
    │             survives page refreshes. Any component can read it at any time via
    │             localStorage.getItem("token"). It stays there until Navbar.jsx's
    │             logout() calls localStorage.removeItem("token").
    │             navigate("/") tells React Router to change the URL to / and render
    │             App.jsx + AgentList.jsx without a page reload.
    │  On 401 — failure path:
    │             navigate("/unauthorized")
    │             No token stored. Unauthorized.jsx renders.
    │  navigate("/") → App.jsx + AgentList.jsx render
    ▼
AgentList.jsx  [Page / View]  — first protected fetch
    │  Role:      AgentList.jsx is the first component to use the token after login.
    │             Its useEffect fires immediately after it mounts, calling getAgents().
    │             getAgents() reads the token from localStorage and attaches it as
    │             the Authorization header — the first real proof that the token works.
    │  In:        localStorage.getItem("token") — the JWT stored by Login.jsx moments ago.
    │  Out:       fetch("http://localhost:5050/agents/", {
    │               headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    │             })
    │             This request hits server.js → requireAuth (auth.js) → agents.js.
    │             auth.js verifies the token using JWT_SECRET. If valid, agents.js
    │             queries MongoDB Atlas and returns the agent array. The user sees the
    │             populated dashboard. The login sequence is complete.
    │  fetch GET /agents with Authorization: Bearer <token> → auth.js → agents.js → Atlas
    ▼
auth.js  [Middleware]  — token verified
    │  Role:      auth.js intercepts the first /agents request after login and verifies
    │             the token that users.js signed. This is the moment the token is first
    │             tested in practice. auth.js uses the same JWT_SECRET from config.env
    │             that users.js used — if they match and the token is not expired, the
    │             request continues to agents.js.
    │  In:        req.headers.authorization = "Bearer eyJ..."
    │             auth.js extracts the token: authHeader.split(" ")[1]
    │  Out:       jwt.verify(token, process.env.JWT_SECRET)
    │             Checks signature integrity (tamper detection) and expiry (24h window).
    │             On success: req.user = { id, email, iat, exp } → next() → agents.js runs.
    │             On failure: res.status(401).json({ error: "Invalid or expired token" })
    │             agents.js never runs. AgentList.jsx receives 401 and logs the error.
    ▼
agents.js  →  MongoDB Atlas  →  agent array  →  AgentList.jsx renders table
```

---

## Section 4: Logout Flow

A complete trace of what happens when the user clicks Logout.

```
Navbar.jsx  [UI Sub-Component]
    │  Role:      Navbar.jsx holds the only logout mechanism in the entire application.
    │             It is rendered by App.jsx on every protected page (/, /create, /edit/:id).
    │             When the user clicks Logout, Navbar.jsx destroys the token and navigates
    │             to Login.jsx. No server request is made. The backend is not notified.
    │             JWTs are stateless — the server cannot invalidate an issued token.
    │             Destroying the token client-side is the logout mechanism.
    │  In:        The user clicks the Logout button. The button's onClick calls logout().
    │  Out:       logout() executes two lines:
    │             localStorage.removeItem("token")
    │             navigate("/login")
    │             localStorage.removeItem("token") removes the "token" key from the
    │             browser's key-value store entirely. After this call,
    │             localStorage.getItem("token") returns null. Any fetch that reads
    │             the token afterward sends Authorization: Bearer null —
    │             which auth.js rejects with 401 "No token provided".
    │             navigate("/login") tells React Router to render Login.jsx.
    │             App.jsx and Navbar.jsx unmount. Login.jsx renders directly into #root.
    │  Imports:   useNavigate from 'react-router-dom' provides the navigate() function.
    │  Functions: logout() — removes token from localStorage, navigates to /login.
    │             This function is the complete logout implementation. There is no
    │             server-side session to invalidate, no cookie to clear, no API call
    │             to make. The entire logout is two lines of client-side code.
    │  localStorage.removeItem("token") → navigate("/login")
    ▼
Login.jsx  [Page / View]  — re-renders fresh
    │  Role:      Login.jsx renders again as a clean slate. The token is gone from
    │             localStorage. The form state is initialized to { email: "", password: "" }.
    │             The user sees the empty login form.
    │  State:     form{ email: "", password: "" } — initialized fresh by useState.
    │             No token exists in localStorage. No trace of the previous session remains
    │             in the browser (in this implementation — HttpOnly cookies would be safer).
    │  If user tries to navigate to / manually:
    │             AgentList.jsx would mount and call getAgents(). getAgents() would read
    │             localStorage.getItem("token") — which returns null. The fetch would send
    │             Authorization: Bearer null. auth.js would return 401 "No token provided".
    │             AgentList.jsx logs the error but shows an empty table — there is no
    │             automatic redirect to /login on 401. This is a known UX gap: a logged-out
    │             user who manually navigates to / sees an empty table rather than being
    │             redirected to the login page.
```

---

## Section 5: Reference Tables

### 5a. Login/Logout Route Table

| URL Path | Component | Layout | Reached From |
|---|---|---|---|
| /login | Login.jsx | standalone (no Navbar) | App initial load, Navbar logout(), Unauthorized "Back to Login" Link |
| /unauthorized | Unauthorized.jsx | standalone (no Navbar) | Login.jsx navigate("/unauthorized") on 401 |
| / | App.jsx + AgentList.jsx | App.jsx (has Navbar) | Login.jsx navigate("/") on 200 |

### 5b. API Endpoint Table (login only)

| Method | Path | Called By | Request Body | Response Body | Status Codes |
|---|---|---|---|---|---|
| POST | /users/login | Login.jsx onSubmit() | { email, password } | { token: "eyJ..." } on 200, plain error string on 401 | 200, 401, 500 |

### 5c. Navigation Map

| Current Page | User Action | Destination | Mechanism |
|---|---|---|---|
| /login | Submit valid credentials | / (AgentList) | Login.jsx navigate("/") after localStorage.setItem("token") |
| /login | Submit invalid email | /unauthorized | Login.jsx navigate("/unauthorized") on 401 |
| /login | Submit wrong password | /unauthorized | Login.jsx navigate("/unauthorized") on 401 |
| /unauthorized | "Back to Login" click | /login | Unauthorized.jsx Link to="/login" |
| / (any protected page) | Logout button click | /login | Navbar.jsx logout() → localStorage.removeItem("token") → navigate("/login") |

### 5d. State and Storage Variables

| Location | Key / Variable | Type | Set By | Read By | Cleared By |
|---|---|---|---|---|---|
| Login.jsx state | form{ email, password } | object | updateForm() on each keystroke | onSubmit() sends as request body | useState reinitializes on every mount |
| localStorage | "token" | string | Login.jsx onSubmit() on 200 response | AgentList.jsx getAgents(), AgentList.jsx deleteAgent(), AgentForm.jsx fetchData(), AgentForm.jsx onSubmit() | Navbar.jsx logout() |
| Express req.user | { id, email, iat, exp } | object | auth.js after jwt.verify() succeeds | Available to agents.js handlers (currently unused in route logic) | Lives only for the duration of the request |

### 5e. HTTP Status Codes in This Feature

| Code | Meaning | Sent By | Condition | Received By | Result |
|---|---|---|---|---|---|
| 200 | OK — login successful | users.js | Email and password both match | Login.jsx | localStorage.setItem("token") → navigate("/") |
| 401 | Unauthorized — bad credentials | users.js | Email not found OR password mismatch | Login.jsx | navigate("/unauthorized") |
| 401 | Unauthorized — bad token | auth.js | No Authorization header, malformed token, invalid signature, or expired token | AgentList.jsx / AgentForm.jsx | fetch error logged to console.error, empty table shown |
| 500 | Internal Server Error | users.js | Unhandled database error in catch block | Login.jsx | response.ok is false → navigate("/unauthorized") |

### 5f. JWT Structure

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9  ← header (base64): algorithm + type
.
eyJpZCI6IjY0YWJjMTIzIiwiZW1haWwiOiJ1c2VyQHJvY2tldC5lbHYiLCJpYXQiOjE2OTk5OTk5OTksImV4cCI6MTcwMDA4NjM5OX0
                                        ← payload (base64): { id, email, iat, exp }
.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
                                        ← signature: HMACSHA256(header + "." + payload, JWT_SECRET)
```

- **header** — declares the signing algorithm (HS256) and token type (JWT)
- **payload** — contains { id: user._id, email: user.email, iat: issued-at timestamp, exp: expiry timestamp }. iat and exp are added automatically by jwt.sign() based on the expiresIn: "24h" option.
- **signature** — computed by users.js using JWT_SECRET. Re-computed by auth.js on every /agents request. If the payload was modified after signing, the signatures will not match and auth.js returns 401.

### 5g. Security Notes

| Issue | Location | Description |
|---|---|---|
| Plaintext passwords | users.js, MongoDB Atlas | Passwords are stored and compared as plain strings. No bcrypt or hashing. Any Atlas data breach exposes all passwords. |
| localStorage token storage | Login.jsx, Navbar.jsx | JWTs in localStorage are accessible to JavaScript, making them vulnerable to XSS attacks. HttpOnly cookies would be safer. |
| No server-side token invalidation | users.js, auth.js | Once issued, a JWT is valid until it expires (24h). Logout only removes the client-side copy — the token itself remains valid on the server for the remainder of its lifetime. |
| No redirect on 401 | AgentList.jsx, AgentForm.jsx | When a fetch returns 401 (expired or missing token), the component logs the error and shows an empty table rather than redirecting to /login. A user with an expired token sees a broken UI rather than a login prompt. |
| Agents routes publicly reachable via direct HTTP | server.js, auth.js | auth.js protects /agents at the Express level, but there is no frontend route guard — navigating directly to / in the browser while logged out shows an empty table rather than redirecting to /login. |
