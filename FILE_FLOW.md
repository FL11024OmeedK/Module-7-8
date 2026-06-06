# File Flow Diagram

A complete trace of every file, every data transfer, and every interaction between
the frontend (React), the backend (Express), and the database (MongoDB Atlas).
Written for someone learning how these three layers talk to each other.

Throughout this flow, think of each file as a person inside one organization working
toward the same goal: keep agent and user data moving cleanly from the browser, through
the server, into MongoDB Atlas, and back again. index.html opens the office door,
main.jsx assigns the routes, App.jsx hosts the main workspace, Navbar.jsx guides people
between rooms, AgentList.jsx and AgentForm.jsx handle the agent desk, Login.jsx and
Unauthorized.jsx handle access, server.js runs reception, agents.js and users.js manage
department requests, connection.js keeps the database line open, the schema files review
paperwork before it is filed, config.env guards secrets, and seed.js stocks the initial
records.

---

## How the three layers relate

The frontend is the React application running in the browser. It is what the user
sees and clicks. It cannot talk to MongoDB directly — it can only send HTTP requests
to the backend. The backend is the Express server running in Node.js. It listens for
HTTP requests from the frontend, performs logic, and talks to the database on behalf
of the frontend. The database is MongoDB Atlas, a cloud-hosted database. It stores
the agent and user documents permanently. Only the backend talks to it directly.

Every time the user does something meaningful — loading the page, clicking a button,
submitting a form — data crosses at least one of these boundaries. This document
traces every one of those crossings.

---

## Section 0: Architecture at a Glance

A high-level map of every layer, every port, every file, and every pattern in the project
before diving into the per-file details. Read this section first to orient yourself.

### Three-Layer Architecture

The entire application is divided into exactly three layers. Each layer has one job and
communicates with only the layer directly adjacent to it. The frontend never touches the
database directly, and the database never pushes data to the frontend directly.

In organizational terms, the frontend files are the public-facing team, the backend files
are operations, and MongoDB Atlas is the records department. Each file speaks to its
approved neighbor only, so the organization stays orderly: customer-facing staff do not
walk into the records room, and the records room does not call customers directly.

```
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND  (Browser)                    │
│   React  ·  Vite  ·  React Router  ·  Tailwind CSS     │
│   Runs at: http://localhost:5173                        │
│   Files: index.html, main.jsx, App.jsx, Navbar.jsx,    │
│           AgentList.jsx, AgentForm.jsx, Login.jsx,      │
│           Unauthorized.jsx, vite.config.js              │
└───────────────────┬─────────────────────────────────────┘
                    │  HTTP only (fetch API)
                    │  The browser can ONLY talk to the backend
                    │  via HTTP requests. It NEVER opens a
                    │  database connection directly.
                    ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND  (Node.js / Express)               │
│   Express  ·  cors  ·  MongoDB Node.js driver          │
│   Runs at: http://localhost:5050                        │
│   Files: server.js, agents.js, users.js,               │
│           connection.js, agent.schema.js,               │
│           user.schema.js, seed.js, config.env           │
└───────────────────┬─────────────────────────────────────┘
                    │  MongoDB driver (TCP connection)
                    │  The backend can ONLY talk to the database
                    │  via the official MongoDB Node.js driver.
                    │  The frontend NEVER has this connection.
                    ▼
┌─────────────────────────────────────────────────────────┐
│              DATABASE  (MongoDB Atlas)                  │
│   Cloud-hosted  ·  BSON documents  ·  accessed via     │
│   process.env.ATLAS_URI (the connection string)         │
│   agents database  →  agents collection                 │
│   users database   →  users collection                  │
└─────────────────────────────────────────────────────────┘
```

The rule is absolute: the frontend can ONLY talk to the backend via HTTP. The backend
can ONLY talk to the database via the MongoDB driver. The frontend NEVER talks to the
database directly. This separation is what makes the backend necessary — it acts as a
controlled gateway between the browser and the data.

### Port Diagram

Two different servers are running simultaneously during development. Each listens on its
own port number. A port is like a numbered "door" on a computer — many servers can run
on the same machine as long as each uses a different door.

```
Browser (port 5173)          Express server (port 5050)       MongoDB Atlas (cloud)
served by Vite dev server    started by node server.js        accessed via ATLAS_URI
        │                              │                               │
        │  HTTP fetch()                │  MongoDB driver (TCP)        │
        │  e.g. GET /agents            │  e.g. find({}).toArray()     │
        │  POST /agents                │  insertOne(doc)               │
        │  PATCH /agents/:id           │  updateOne(query, {$set})     │
        │  DELETE /agents/:id          │  deleteOne({_id})             │
        │  POST /users/login           │  findOne({email})             │
        └─────────────────────────────►│◄──────────────────────────────┘
```

Why two different ports? Because the frontend (Vite) and the backend (Express) are two
completely separate programs. Vite's only job is to serve the React source files to the
browser during development. Express's only job is to handle API requests and talk to
the database. They run side by side on different ports.

Why is CORS needed? The browser enforces the Same-Origin Policy — a security rule that
says a webpage can only send requests to the same origin (same protocol + domain + port)
that served it. The React app is served from port 5173 but its fetch() calls target
port 5050. These are different origins, so the browser would normally block the
responses. The cors() middleware on the Express server adds the
`Access-Control-Allow-Origin: *` header to every response, which explicitly tells the
browser: "it is safe to accept this response even though it came from a different port."
Without cors(), every fetch() in AgentList.jsx and AgentForm.jsx would silently fail
in the browser, even though the server itself processed the request correctly.

### All Files Organized by Layer

**Frontend (client/ folder)**

| File | Role |
|---|---|
| index.html | The one HTML file the browser ever receives. Provides `<div id="root">` and loads main.jsx. Acts like the front door that lets the React team into the building. |
| main.jsx | JavaScript entry point. Defines all client-side routes and mounts React into #root. Acts like the scheduler assigning each URL to the right coworker. |
| App.jsx | Layout shell. Renders Navbar + `<Outlet />` for the /, /create, /edit/:id routes. Acts like the shared office floor where main pages work. |
| Navbar.jsx | Persistent nav bar. Logo link, Create Agent link, Logout button. Acts like the office directory guiding users to the right desk. |
| AgentList.jsx | Main dashboard at /. Fetches and displays all agents. Delete and Edit buttons. Acts like the agent records clerk at the front desk. |
| AgentForm.jsx | Create/edit form at /create and /edit/:id. POST on create, PATCH on edit. Acts like the intake specialist who prepares create and edit paperwork. |
| Login.jsx | Auth entry point at /login. Sends credentials to /users/login. Acts like the security desk asking users for credentials. |
| Unauthorized.jsx | Static guard page at /unauthorized. Rendered on 401 from users.js. Acts like the access-denied notice that sends users back to security. |
| vite.config.js | Tells Vite how to compile JSX and which plugins to use. Acts like the build coordinator preparing everyone else's work for the browser. |
| package.json (client) | Lists React dependencies; defines "dev": "vite" script. Acts like the frontend team's staffing and startup checklist. |

**Backend (server/ folder)**

| File | Role |
|---|---|
| server.js | Composition root. Creates Express app, registers middleware, mounts routers, starts server. Acts like reception, greeting every request and sending it to the right department. |
| agents.js | Route handler for GET/POST/PATCH/DELETE /agents. Calls agentsDb and agent.schema.js. Acts like the agent operations manager handling all agent requests. |
| users.js | Route handler for POST /users/login. Signs and returns a JWT on success. Calls usersDb from connection.js. Acts like the authentication officer checking login claims and issuing access badges. |
| auth.js | JWT verification middleware. Sits between server.js and agents.js. Reads the Authorization header, verifies the token using JWT_SECRET, and either calls next() or returns 401. Acts like the security checkpoint every /agents request must pass before reaching agents.js. |
| connection.js | Opens the MongoDB Atlas connection. Exports agentsDb and usersDb. Acts like the database liaison keeping the records department reachable. |
| agent.schema.js | Pure functions createAgent() and updateAgent(). Shapes and type-casts write payloads. Acts like quality control for agent paperwork. |
| user.schema.js | Pure function createUser(). Currently unused by any route — placeholder for registration. Acts like a drafted HR form waiting for a registration process. |
| seed.js | Standalone script. Directly inserts 16 agents into Atlas. Bypasses Express entirely. Acts like the onboarding coordinator who preloads the first agent roster. |
| config.env | Secret environment variables. Holds ATLAS_URI and PORT. Never committed to git. Acts like the locked cabinet for credentials and port settings. |
| package.json (server) | Lists Express/MongoDB dependencies. Sets "type":"module" for ES module syntax. Acts like the backend team's staffing and syntax policy sheet. |

**Database (MongoDB Atlas)**

| Database | Collection | Populated By | Used By |
|---|---|---|---|
| agents | agents | seed.js (initial), agents.js POST / (live) | agents.js (all five routes) |
| users | users | manually in Atlas UI | users.js POST /login |

### Middleware Chain

Every single HTTP request that arrives at port 5050 passes through the following chain
before any route handler runs. The chain is fixed — you cannot skip a step.

```
Incoming HTTP request
        │
        ▼
   cors()  ────────────────────  Adds Access-Control-Allow-Origin: * to the response.
        │                        Tells the browser it is safe to accept this response
        │                        even though the frontend is on a different port.
        │                        Runs on EVERY request, including OPTIONS preflight requests.
        ▼
   express.json()  ─────────────  Reads the raw request body string (e.g., '{"email":"x"}')
        │                        and parses it into req.body (a JavaScript object).
        │                        Only does meaningful work for POST and PATCH requests that
        │                        include Content-Type: application/json. For GET and DELETE
        │                        requests (which have no body), req.body remains undefined
        │                        but no error is thrown.
        ▼
   Route match
        ├── /users  ──────────►  users.js runs directly. No auth required — this is the
        │                        endpoint that ISSUES tokens. Requiring a token to get a
        │                        token would make login impossible.
        │
        └── /agents ──────────►  requireAuth (auth.js) runs FIRST as a second argument
                │                to app.use("/agents", requireAuth, agents). auth.js reads
                │                the Authorization header, verifies the JWT using JWT_SECRET,
                │                and either calls next() to continue or returns 401 immediately.
                ▼
           agents.js runs. By this point CORS headers are set, req.body is parsed,
           and the JWT has been verified. req.user contains the decoded token payload
           { id, email } attached by auth.js. The handler performs its database
           operation and sends the response.
```

The order of `app.use()` calls in server.js is what determines this order. If cors() and
express.json() were moved below the route mounts, they would not execute before the route
handlers. Order matters. requireAuth sits between the global middleware and agents.js
specifically — it does not run for /users routes.

### async/await Pattern

Every route handler in agents.js and users.js is an `async` function. This is how modern
JavaScript handles operations that take time — like querying a remote database — without
freezing the entire server while it waits.

**Why async/await is needed:** JavaScript is single-threaded. If a database call took
500ms and we wrote it synchronously, the entire server would be frozen for those 500ms
— unable to handle any other request. Instead, `await` says: "start this database call,
release the thread so other code can run, and resume this function when the result arrives."

**The pattern used in every route handler:**

```javascript
router.get("/", async (req, res) => {
  try {
    const results = await agentsDb.collection("agents").find({}).toArray();
    res.send(results);
  } catch (err) {
    res.status(500).send("Error fetching agents");
  }
});
```

- `async` declares that this function contains asynchronous operations.
- `await` pauses execution at the database call until MongoDB Atlas responds. Without it,
  the code would continue before the data arrived and `results` would be undefined.
- `try/catch` wraps the entire body. If the `await` throws — because Atlas is unreachable,
  the ObjectId string is malformed, or the network timed out — JavaScript jumps to the
  `catch` block, which calls `res.status(500).send("Error message")`.
- HTTP 500 means "Internal Server Error" — something went wrong on the server side.
  The frontend fetch calls receive this 500 response but currently only log it to
  `console.error`. The user sees no error message in the UI. This is a known UX gap.

---

## 1. Client Startup

How the React application gets from source files to a running page in the browser.

```
package.json  [Package Manifest]
    │  Role:      package.json is a configuration file that npm (Node Package Manager)
    │             reads before anything else runs. It tells npm two things: which
    │             external code libraries (called dependencies) to download and install,
    │             and which terminal commands (called scripts) the developer can run.
    │             Without this file, npm would not know what to install or how to start
    │             the project.
    │             In the frontend organization, package.json is the staffing manager:
    │             it names which outside helpers are hired and which startup commands
    │             the team knows how to run.
    │  In:        The developer types "npm run dev" in the terminal inside the client/
    │             folder. npm reads package.json to find out what "dev" means.
    │  Out:       npm finds the entry "dev": "vite" in the scripts section and invokes
    │             the vite program. Vite immediately reads vite.config.js to learn how
    │             it should compile and serve the project files.
    │  Declares:  The scripts section defines "dev": "vite" (starts the development
    │             server) and "build": "vite build" (creates a production bundle).
    │             The dependencies section lists react and react-dom — the two libraries
    │             that make React work at runtime in the browser.
    │             The devDependencies section lists vite (the build tool), @vitejs/plugin-react
    │             (teaches Vite how to compile JSX), react-router-dom (client-side routing),
    │             tailwindcss (utility CSS classes), babel-plugin-react-compiler (optimizes
    │             React re-renders automatically), and eslint (catches code errors).
    │  npm run dev
    ▼
vite.config.js  [Build Config] ──────────── loads React plugin + Babel/React Compiler
    │  Role:      vite.config.js is the configuration file that Vite reads to understand
    │             how to compile and serve the project. Without it, Vite would not know
    │             that .jsx files need to be transformed — JSX is not valid JavaScript
    │             on its own, so Vite must convert it before the browser can run it.
    │             This file is read once at startup and affects every file Vite processes.
    │             As a teammate, vite.config.js is the build coordinator who teaches Vite
    │             how to prepare every coworker's JSX before the browser sees it.
    │  In:        Vite reads this file automatically the moment it is invoked by npm.
    │             It reads the plugins array and applies each plugin to its processing
    │             pipeline.
    │  Out:       A development server starts on http://localhost:5173. Vite now knows
    │             how to handle .jsx files (convert JSX syntax to plain JavaScript),
    │             how to apply the React Compiler optimization (automatically memoize
    │             components to reduce unnecessary re-renders), and how to serve the
    │             project to a browser. index.html can now be served, and main.jsx
    │             and all component files will be compiled on demand.
    │  Imports:   defineConfig is imported from 'vite' — it provides type safety and
    │             autocompletion for the config object. react and reactCompilerPreset
    │             are imported from '@vitejs/plugin-react' — react registers the JSX
    │             transform and reactCompilerPreset enables the React Compiler optimization.
    │             babel is imported from '@rolldown/plugin-babel' — it runs the React
    │             Compiler preset through the Babel transformation pipeline.
    │  Exports:   The default export is the result of calling defineConfig({...}), which
    │             is a plain configuration object consumed by Vite at startup. Without
    │             this export, Vite would use its default settings and would not know
    │             how to compile the .jsx files that main.jsx, App.jsx, and every
    │             component file in the project depend on.
    │  starts dev server
    ▼
index.html  [Entry Point] ───────────────── the ONE html file the browser ever receives
    │  Role:      index.html is the single HTML document that the Vite dev server ever
    │             sends to the browser. This is what makes the application a Single Page
    │             Application (SPA) — the browser only ever downloads one HTML file,
    │             no matter how many "pages" the user navigates to. Everything else
    │             (routing, component swapping) happens in JavaScript after this file loads.
    │             Its two responsibilities are to provide the <div id="root"> element
    │             that React will attach itself to, and to tell the browser which
    │             JavaScript file to load as the entry point.
    │             In the organization metaphor, index.html is the front-door host: it
    │             gives React an empty lobby (#root) and calls main.jsx to staff it.
    │  In:        The browser sends an HTTP GET request to http://localhost:5173/ after
    │             the Vite dev server started by vite.config.js begins listening on that
    │             port. An HTTP GET request is simply a message saying "please send me
    │             whatever lives at this address."
    │  Out:       The Vite dev server responds with the HTML document. The browser parses
    │             it top to bottom. When it reaches the <div id="root"></div>, it creates
    │             an empty container in the page — this is the slot React will fill.
    │             When it reaches <script type="module" src="/src/main.jsx">, it sends a
    │             second request to Vite asking for main.jsx, which Vite compiles on
    │             the fly and sends back as compiled JavaScript. The browser then executes
    │             main.jsx, which is when React starts running.
    │  References: /src/main.jsx is referenced via the <script type="module"> tag — this
    │             is the only thing connecting index.html to the JavaScript world. Vite
    │             intercepts the request for main.jsx and compiles it before serving it.
    │             /favicon.png is referenced via a <link> tag in the <head> and displayed
    │             as the browser tab icon.
    │  <script type="module" src="/src/main.jsx">
    ▼
main.jsx  [Entry Point] ─────────────────── defines all routes, mounts React into #root
    │  Role:      main.jsx is the true JavaScript entry point of the application.
    │             Two critical things happen here: first, it defines the complete
    │             client-side route tree — the mapping of URL paths to React components.
    │             Second, it calls ReactDOM.createRoot().render() to mount the entire
    │             React application into the <div id="root"> that index.html provided.
    │             Once this file executes, React is alive in the browser and in control
    │             of everything inside #root.
    │             main.jsx acts like the routing director, assigning each URL path to the
    │             coworker responsible for that part of the user's visit.
    │  In:        main.jsx receives document.getElementById("root") as its DOM mount
    │             target — this is the <div id="root"> element that index.html created.
    │             It also imports all five route components (App, AgentList, AgentForm,
    │             Login, Unauthorized) from their respective files, pulling their
    │             component definitions into memory so the router can use them.
    │  Out:       After execution, a RouterProvider is active and listening for URL
    │             changes in the browser. React's virtual DOM is mounted inside the
    │             index.html #root div. Each URL path is now mapped to its component:
    │             / renders AgentList inside App, /create and /edit/:id render AgentForm
    │             inside App, /login renders Login standalone, and /unauthorized renders
    │             Unauthorized standalone. The browser URL bar now controls which
    │             component React renders, without any new HTML file ever being requested.
    │  Imports:   React is imported from 'react' — required to use JSX syntax.
    │             ReactDOM is imported from 'react-dom/client' — provides the createRoot()
    │             method that attaches React to the real browser DOM.
    │             createBrowserRouter and RouterProvider are imported from 'react-router-dom'
    │             — createBrowserRouter builds the route configuration object, and
    │             RouterProvider wraps the app so every component can access routing.
    │             App is imported from App.jsx, which exports it as the persistent layout
    │             shell that wraps the /, /create, and /edit/:id routes.
    │             AgentList is imported from AgentList.jsx, which exports it as the
    │             component that renders the dashboard at /.
    │             AgentForm is imported from AgentForm.jsx, which exports it as the
    │             component that handles both creating agents at /create and editing
    │             them at /edit/:id.
    │             Login is imported from Login.jsx, which exports it as the standalone
    │             authentication page at /login.
    │             Unauthorized is imported from Unauthorized.jsx, which exports it as
    │             the standalone access-denied page at /unauthorized.
    │             index.css is imported to apply global Tailwind CSS base styles to
    │             the entire page.
    │  Exports:   main.jsx exports nothing. It is an entry point that only executes.
    │             All five imported components flow outward from their own files into
    │             the router defined here — main.jsx is the hub that assembles them.
    │  Functions: createBrowserRouter([...]) takes the route configuration array and
    │             produces a router object. Each entry in the array maps a URL path
    │             string to a React component. The children array inside the "/" entry
    │             tells React Router that AgentList and AgentForm should render inside
    │             App's <Outlet /> slot.
    │             ReactDOM.createRoot(document.getElementById("root")).render(...)
    │             finds the <div id="root"> in index.html's DOM, tells React to own
    │             that element, and renders the RouterProvider (which wraps the entire
    │             app) into it. This is the moment React takes control of the page.
    │
    ├──► App.jsx  [Layout Shell] ─────────── Navbar + <Outlet />
    │        Role:      App.jsx is the persistent layout wrapper for the three main
    │                   pages of the application. main.jsx assigns it as the parent
    │                   component for the /, /create, and /edit/:id routes. This means
    │                   that when the user is on any of those three paths, App.jsx is
    │                   always rendered. It holds the Navbar at the top, and below
    │                   the Navbar it renders whichever child page matches the current URL.
    │                   Login.jsx and Unauthorized.jsx are NOT children of App.jsx —
    │                   they are defined at the top level in main.jsx so they appear
    │                   without a Navbar.
    │                   App.jsx is the office floor manager: it keeps Navbar.jsx present
    │                   and gives AgentList.jsx or AgentForm.jsx the active workspace.
    │        In:        App.jsx is given the current child route by React Router's Outlet
    │                   mechanism. React Router looks at the URL, finds the matching
    │                   child in main.jsx's children array, and injects that component
    │                   into App.jsx's <Outlet /> tag. App.jsx does not need to know
    │                   which child is active — it just provides the slot.
    │        Out:       App.jsx renders two things: first, <Navbar />, the component
    │                   imported from Navbar.jsx, which appears at the top of the page
    │                   on every App-layout route. Second, <Outlet />, the slot from
    │                   react-router-dom that React Router fills with AgentList.jsx at /,
    │                   or AgentForm.jsx at /create or /edit/:id.
    │        Imports:   useState is imported from 'react' (available but currently unused
    │                   in the component body). Outlet is imported from 'react-router-dom'
    │                   — this is what creates the slot where child routes render. Navbar
    │                   is imported from Navbar.jsx, which exports it as its default export.
    │                   App.jsx is the only file in the entire project that imports Navbar.jsx.
    │        Exports:   The default export App is imported by main.jsx and used as the
    │                   element property for the "/" route, making it the layout parent
    │                   for AgentList.jsx, AgentForm.jsx, and any future main pages.
    │        Functions: The App() component function renders a wrapper div, inside which
    │                   it places <Navbar /> (the component from Navbar.jsx) and then
    │                   <Outlet /> (the slot from react-router-dom). When the URL is /,
    │                   React Router fills the Outlet with AgentList.jsx. When the URL
    │                   is /create or /edit/:id, it fills the Outlet with AgentForm.jsx.
    │        │
    │        ├──► Navbar.jsx  [UI Sub-Component]
    │        │        Role:      Navbar.jsx renders the persistent navigation bar that
    │        │                   appears at the top of every page that uses the App.jsx
    │        │                   layout. It gives the user three ways to navigate:
    │        │                   back to the agent list, to the create form, and to
    │        │                   the logout / login page. Because it lives inside App.jsx,
    │        │                   it is never shown on Login.jsx or Unauthorized.jsx —
    │        │                   those routes are outside App.jsx in main.jsx's route tree.
    │        │                   Navbar.jsx works like the wayfinding desk, sending users
    │        │                   to the agent list, the create form, or the login page.
    │        │        In:        Navbar.jsx receives no props from App.jsx and fetches no
    │        │                   data. It is entirely self-contained. It reads its own
    │        │                   navigation capability from React Router's useNavigate hook.
    │        │        Out:       Navbar.jsx renders three interactive elements.
    │        │                   A NavLink with to="/" renders as an anchor tag that, when
    │        │                   clicked, tells React Router to navigate to / — which causes
    │        │                   App.jsx's Outlet to render AgentList.jsx without a page
    │        │                   reload. A NavLink with to="/create" navigates to /create —
    │        │                   which causes App.jsx's Outlet to render AgentForm.jsx in
    │        │                   create mode. A Logout button calls logout() on click,
    │        │                   which calls navigate("/login") — React Router renders
    │        │                   Login.jsx as a standalone page, replacing the entire view.
    │        │        Imports:   NavLink and useNavigate are both imported from 'react-router-dom'.
    │        │                   NavLink is like a regular HTML anchor tag but it integrates
    │        │                   with React Router so clicking it changes the URL without
    │        │                   causing a browser reload. useNavigate returns the navigate()
    │        │                   function, which Navbar.jsx uses programmatically inside
    │        │                   the logout() function to redirect to /login.
    │        │        Exports:   The default export Navbar is imported exclusively by App.jsx.
    │        │                   No other file in the project imports Navbar.jsx. App.jsx
    │        │                   renders it at the top of every page in the App layout.
    │        │        Functions: logout() is a function defined inside Navbar.jsx that first
    │        │                   calls localStorage.removeItem("token") to destroy the JWT
    │        │                   that Login.jsx stored after a successful login, then calls
    │        │                   navigate("/login"). Removing the token is critical — without
    │        │                   it, AgentList.jsx and AgentForm.jsx would still find a token
    │        │                   in localStorage and attach it to future requests. Once removed,
    │        │                   any fetch to /agents would send Authorization: Bearer null,
    │        │                   which auth.js would reject with 401. React Router then renders
    │        │                   Login.jsx — the component that main.jsx has routed at /login.
    │        │                   No server request is made during logout. The JWT on the server
    │        │                   side is not invalidated — JWTs are stateless. Destroying the
    │        │                   token on the client side is the only logout mechanism here.
    │        │
    │        ├──► AgentList.jsx  [Page / View] ── renders at  /
    │        │        Role:      AgentList.jsx is the main dashboard of the application.
    │        │                   It is the first page the user sees after logging in and
    │        │                   the page they return to after every action. It is
    │        │                   imported by main.jsx and assigned as the index child of
    │        │                   App.jsx, meaning it renders inside App.jsx's Outlet at /.
    │        │                   It is responsible for three things: loading all agents from
    │        │                   the backend when the page first appears, displaying them in
    │        │                   a table, and providing buttons to navigate to the edit form
    │        │                   or to delete an agent.
    │        │                   AgentList.jsx is the records clerk of the frontend team:
    │        │                   it asks agents.js for the current roster, displays it,
    │        │                   and sends delete or edit handoffs to the right coworker.
    │        │
    │        │        FRONTEND → BACKEND interaction (on mount):
    │        │        When AgentList.jsx mounts in the browser, the useEffect hook fires
    │        │        and calls getAgents(). getAgents() uses the browser's built-in fetch()
    │        │        API to send an HTTP GET request to http://localhost:5050/agents/.
    │        │        An HTTP GET request carries no body — it is simply a request for
    │        │        data at that URL. The request travels over the local network from
    │        │        the browser (port 5173) to the Express server (port 5050).
    │        │        server.js receives it, recognizes the /agents prefix, and forwards
    │        │        it to agents.js. agents.js's GET / handler queries MongoDB Atlas
    │        │        via agentsDb from connection.js. Atlas returns an array of agent
    │        │        documents. agents.js sends that array back as a JSON HTTP response
    │        │        with status 200. The fetch() call in getAgents() receives the
    │        │        response, calls .json() to parse it, and passes the resulting
    │        │        JavaScript array to setAgents(agents), updating React state and
    │        │        triggering a re-render that populates the table.
    │        │
    │        │        In:        On mount, AgentList.jsx sends GET /agents to the backend.
    │        │                   The backend (agents.js via server.js) queries MongoDB Atlas
    │        │                   and returns an array of agent documents. Each document has
    │        │                   the shape: { _id, first_name, last_name, email, region,
    │        │                   rating, fee, sales }. This array is stored in agents[].
    │        │        Out:       AgentList.jsx renders one AgentRow component per entry in
    │        │                   agents[]. Each row displays the agent's name, region,
    │        │                   rating, fee, and sales. Each row also has an Edit button
    │        │                   (a Link to "/edit/:id" using the agent's _id) and a Delete
    │        │                   button (calls deleteAgent with the agent's _id).
    │        │
    │        │        FRONTEND → BACKEND interaction (on delete):
    │        │        When the user clicks a Delete button, deleteAgent(id) is called with
    │        │        the agent's _id string. deleteAgent() sends an HTTP DELETE request
    │        │        to http://localhost:5050/agents/:id (where :id is the actual _id
    │        │        string). An HTTP DELETE request says "remove the resource at this URL."
    │        │        It carries no body — the _id is encoded in the URL itself.
    │        │        server.js forwards it to agents.js. agents.js's DELETE /:id handler
    │        │        wraps the string id in ObjectId() to convert it to MongoDB's required
    │        │        format, then calls agentsDb.collection("agents").deleteOne({ _id: ObjectId(id) })
    │        │        via agentsDb from connection.js. Atlas deletes the document and returns
    │        │        a result object like { acknowledged: true, deletedCount: 1 }. agents.js
    │        │        sends that back with status 200. deleteAgent() in AgentList.jsx receives
    │        │        the response and immediately filters the deleted agent out of the local
    │        │        agents[] state array, causing the row to disappear from the table
    │        │        without needing a full page reload.
    │        │
    │        │        Imports:   useEffect is imported from 'react' — it runs getAgents()
    │        │                   automatically after the component renders for the first time,
    │        │                   which is how the agent list gets populated on page load.
    │        │                   useState is imported from 'react' — it holds the agents[]
    │        │                   array in component memory and triggers re-renders when updated.
    │        │                   Link is imported from 'react-router-dom' — used to render the
    │        │                   Edit button as a client-side navigation link to /edit/:id,
    │        │                   so clicking Edit changes the URL and renders AgentForm.jsx
    │        │                   in edit mode without a page reload.
    │        │        Exports:   The default export AgentList is imported by main.jsx and
    │        │                   routed as the index child of App.jsx at the path /.
    │        │        Defines:   AgentRow is a local component defined inside AgentList.jsx.
    │        │                   It renders a single agent as a <tr> table row. It receives
    │        │                   the agent object (with all fields from the database document)
    │        │                   and the deleteAgent callback function as props. AgentRow is
    │        │                   not exported — it is used only inside AgentList.jsx.
    │        │        Functions: getAgents() fires via useEffect on mount.
    │        │                   It sends fetch GET /agents to the backend at localhost:5050,
    │        │                   which server.js routes to agents.js GET /.
    │        │                   agents.js queries MongoDB Atlas using agentsDb from
    │        │                   connection.js and returns all agent documents as a JSON array.
    │        │                   getAgents() parses the response and calls setAgents(agents),
    │        │                   which stores the array in state and re-renders the table.
    │        │                   deleteAgent(id) fires when a Delete button is clicked.
    │        │                   It sends fetch DELETE /agents/:id to the backend, which
    │        │                   server.js routes to agents.js DELETE /:id. agents.js removes
    │        │                   the document from MongoDB Atlas via agentsDb from connection.js.
    │        │                   After the response, deleteAgent() filters the agent out of
    │        │                   the local agents[] state so the row disappears instantly.
    │        │                   agentList() maps over the agents[] array and returns one
    │        │                   <AgentRow /> component per agent, which the table renders.
    │        │        State:     agents[] is an array of agent objects fetched from MongoDB
    │        │                   Atlas via the backend. It starts as an empty array [],
    │        │                   is populated by the getAgents() response, and is updated
    │        │                   optimistically by deleteAgent() after a successful deletion.
    │        │
    │        │        useEffect dependency array [agents.length]:
    │        │        The second argument to useEffect is [agents.length]. This is the
    │        │        dependency array. It tells React when to re-run the effect. Normally
    │        │        [] (empty array) means "run once on mount." Using [agents.length]
    │        │        means "re-run whenever the length of agents[] changes." The consequence:
    │        │        after deleteAgent() filters an agent out of state (reducing length from
    │        │        16 to 15), the length change triggers useEffect to fire again, calling
    │        │        getAgents() to re-fetch the full list from agents.js and re-sync with
    │        │        the database. This ensures the table reflects the true database state
    │        │        after a deletion.
    │        │
    │        │        .filter() in deleteAgent:
    │        │        agents.filter((el) => el._id !== id) creates a new array containing
    │        │        every agent whose _id does NOT match the deleted id. It does NOT modify
    │        │        the original array — it returns a new one. setAgents(updatedAgents)
    │        │        replaces the state with this new array, causing React to re-render
    │        │        without the deleted row. This is called an "optimistic update" — the
    │        │        UI updates immediately without waiting for a second GET request.
    │        │
    │        │        .map() in agentList():
    │        │        agents.map((agent) => <AgentRow ... />) iterates over every agent in
    │        │        agents[] and returns an array of AgentRow JSX elements. React renders
    │        │        this array as the table body. Each AgentRow receives the agent object
    │        │        as a prop (so it can display the fields) and the deleteAgent callback
    │        │        as a prop (so the Delete button can call it).
    │        │
    │        │        _id as string in the URL:
    │        │        When agents.js returns agent documents from Atlas, MongoDB's ObjectId
    │        │        type is automatically serialized to a plain string by JSON.stringify
    │        │        (e.g., "64a1f2e3b4c5d6e7f8a9b0c1"). AgentList.jsx stores this string
    │        │        in agents[] state. The Edit Link uses this string directly:
    │        │        to={`/edit/${props.agent._id}`}. React Router puts the string in the
    │        │        URL. AgentForm.jsx reads it back as a plain string via useParams().
    │        │        agents.js receives it as a plain string in req.params.id and calls
    │        │        new ObjectId(req.params.id) to convert it back to BSON ObjectId for
    │        │        the MongoDB query. The cycle is: ObjectId in Atlas → string in JSON
    │        │        → string in URL → string in req.params.id → ObjectId for Atlas query.
    │        │
    │        └──► AgentForm.jsx  [Page / View] ── renders at  /create  and  /edit/:id
    │                 Role:      AgentForm.jsx is a single component that handles two
    │                            different workflows depending on the URL. At /create it
    │                            is a blank form for adding a new agent. At /edit/:id it
    │                            is a pre-filled form for editing an existing agent.
    │                            It determines which mode it is in by checking whether
    │                            the :id URL parameter exists. If :id is present, it
    │                            is in edit mode. If :id is absent, it is in create mode.
    │                            It is imported by main.jsx and rendered inside App.jsx's
    │                            Outlet. It is reached via the Navbar.jsx "Create Agent"
    │                            link (which navigates to /create) or an AgentList.jsx
    │                            Edit link (which navigates to /edit/:id).
    │                            AgentForm.jsx is the intake specialist: it gathers agent
    │                            details, decides whether the paperwork is new or revised,
    │                            and sends the packet to agents.js for processing.
    │
    │                 FRONTEND → BACKEND interaction (on load in edit mode):
    │                 When AgentForm.jsx mounts at /edit/:id, useEffect fires and calls
    │                 fetchData(). fetchData() reads params.id from the URL using useParams()
    │                 and sends an HTTP GET request to http://localhost:5050/agents/:id.
    │                 This is a request for a single specific agent by its database ID.
    │                 server.js routes this to agents.js GET /:id. agents.js converts the
    │                 string id to a MongoDB ObjectId, calls agentsDb.collection("agents")
    │                 .findOne({ _id: ObjectId(id) }) via agentsDb from connection.js, and
    │                 Atlas returns the matching agent document. agents.js sends it back as
    │                 JSON with status 200. fetchData() receives the document and calls
    │                 setForm(agent), which pre-fills every input field with the agent's
    │                 current values. It also sets isNew to false, which tells onSubmit()
    │                 to use PATCH instead of POST when the form is submitted.
    │
    │                 FRONTEND → BACKEND interaction (on submit):
    │                 When the user submits the form, onSubmit(e) fires. e.preventDefault()
    │                 stops the browser from reloading the page (default form behavior).
    │                 The form data is assembled from the form{} state object.
    │
    │                 In create mode (isNew = true): onSubmit() sends an HTTP POST request
    │                 to http://localhost:5050/agents. A POST request says "create a new
    │                 resource." The request body contains the form fields as JSON:
    │                 { first_name, last_name, email, region, rating, fee }. The
    │                 Content-Type: application/json header tells the server to parse the
    │                 body as JSON. server.js's express.json() middleware parses the body
    │                 into req.body before it reaches agents.js. agents.js passes req.body
    │                 through createAgent() from agent.schema.js (which adds sales: 0 and
    │                 casts types), then calls agentsDb.insertOne(newAgent) via agentsDb
    │                 from connection.js. Atlas creates the document and returns
    │                 { acknowledged: true, insertedId: ObjectId("...") }. agents.js sends
    │                 that back with status 201. onSubmit() then calls navigate("/"),
    │                 which renders AgentList.jsx — where the new agent will now appear.
    │
    │                 In edit mode (isNew = false): onSubmit() sends an HTTP PATCH request
    │                 to http://localhost:5050/agents/:id. A PATCH request says "partially
    │                 update the resource at this URL." The body contains the same form
    │                 fields as JSON. server.js parses the body, agents.js passes it through
    │                 updateAgent() from agent.schema.js (which shapes the fields but
    │                 deliberately excludes sales so it cannot be overwritten), wraps it in
    │                 { $set: updatedFields }, and calls agentsDb.updateOne(query, { $set })
    │                 via agentsDb from connection.js. Atlas updates the document and returns
    │                 { acknowledged: true, matchedCount: 1, modifiedCount: 1 }. agents.js
    │                 sends that back with status 200. onSubmit() calls navigate("/"),
    │                 which renders AgentList.jsx — where the updated agent will appear.
    │
    │                 In:        URL param :id from useParams() — if present, AgentForm is
    │                            in edit mode and sends GET /agents/:id to agents.js to
    │                            pre-fill the form. If absent, the form starts blank in
    │                            create mode. On submit, the form{} state object is sent as
    │                            a JSON body to either agents.js POST / or agents.js PATCH /:id.
    │                 Out:       On create: POST /agents to agents.js with { first_name,
    │                            last_name, email, region, rating, fee } as the JSON body.
    │                            agents.js creates the document in Atlas via connection.js
    │                            and responds with 201. On edit: PATCH /agents/:id to
    │                            agents.js with the same fields. agents.js updates the
    │                            document in Atlas via connection.js and responds with 200.
    │                            Both paths end with navigate("/") to AgentList.jsx.
    │                 Imports:   useState is imported from 'react' to manage the form{}
    │                            state object and the isNew flag. useEffect is imported
    │                            from 'react' to trigger fetchData() automatically when
    │                            the component mounts or when params.id changes. useParams
    │                            is imported from 'react-router-dom' to read the :id value
    │                            from the URL, which was placed there by AgentList.jsx's
    │                            Edit Link to="/edit/:id". useNavigate is imported from
    │                            'react-router-dom' to call navigate("/") after submit,
    │                            which sends the user back to AgentList.jsx.
    │                 Exports:   The default export AgentForm is imported by main.jsx and
    │                            routed at /create (linked from Navbar.jsx's "Create Agent"
    │                            NavLink) and at /edit/:id (linked from AgentList.jsx's
    │                            Edit Link that includes the agent's _id in the URL).
    │                 Functions: fetchData() reads params.id from the URL. If an id is found,
    │                            it sends fetch GET /agents/:id to agents.js GET /:id,
    │                            receives the agent document, calls setForm(agent) to
    │                            pre-fill the inputs, and sets isNew to false. If no id
    │                            is found, it returns early and the form stays blank.
    │                            updateForm(value) takes a partial object (e.g., { first_name:
    │                            "John" }) and merges it into the existing form{} state using
    │                            the spread operator, so only the changed field is updated.
    │                            onSubmit(e) stops the default form-submit page reload, reads
    │                            the form{} state, and sends either POST /agents (create) or
    │                            PATCH /agents/:id (edit) to agents.js based on the isNew flag.
    │                            After the request completes, navigate("/") renders AgentList.jsx.
    │                 State:     form{} holds six controlled input fields: first_name, last_name,
    │                            email, region, rating, and fee. Each input's value is bound to
    │                            its corresponding field in form{}, and onChange calls updateForm()
    │                            to keep state and input in sync. In edit mode, fetchData()
    │                            pre-fills these fields with the agent's current database values.
    │                            isNew is a boolean that starts as true (create mode). fetchData()
    │                            sets it to false when an agent is loaded for editing. It tells
    │                            onSubmit() whether to use POST (create) or PATCH (edit).
    │
    │                 finally block in onSubmit():
    │                 The form reset (setForm({...})) and navigate("/") are inside a finally
    │                 block, not inside the try block. finally runs regardless of whether try
    │                 succeeded or whether catch caught an error. This means: if agents.js
    │                 returns an error response (e.g., 500), the catch block logs the error
    │                 to console, but then finally STILL runs — the form clears and the user
    │                 is still redirected to AgentList.jsx. The user sees no error message.
    │                 This is a UX gap: a failed create or edit silently redirects as if it
    │                 succeeded.
    │
    │                 Radio buttons for region:
    │                 The region field uses <input type="radio"> instead of <input type="text">
    │                 like the other fields. The four options (North, South, East, West) are
    │                 rendered using .map() over a hardcoded array ["North","South","East","West"].
    │                 Each radio button has checked={form.region === r} and
    │                 onChange={(e) => updateForm({ region: e.target.value })}. This constrains
    │                 the region to exactly four valid values — the user cannot type an arbitrary
    │                 string.
    │
    ├──► Login.jsx  [Page / View] ─────────── renders at  /login        (no Navbar)
    │        Role:      Login.jsx is the authentication entry point. It is a standalone
    │                   page — it is defined outside App.jsx in main.jsx's route tree,
    │                   so it has no Navbar. The user reaches it when the app first loads
    │                   at /login, when they click Logout in Navbar.jsx (which calls
    │                   navigate("/login")), or when Unauthorized.jsx's "Back to Login"
    │                   link is clicked. Its sole job is to collect credentials, send them
    │                   to the backend, and route the user based on the result.
    │                   Login.jsx is the security receptionist: it collects credentials
    │                   and asks users.js whether the visitor should enter the main office.
    │
    │        FRONTEND → BACKEND interaction (on submit):
    │        When the user submits the login form, onSubmit(e) fires. e.preventDefault()
    │        stops the browser reload. onSubmit() sends an HTTP POST request to
    │        http://localhost:5050/users/login with the body { email, password } encoded
    │        as JSON and the Content-Type: application/json header set. The POST body
    │        travels over the network from the browser to the Express server. server.js
    │        receives it, parses the JSON body into req.body using express.json() middleware,
    │        recognizes the /users prefix, and forwards the request to users.js POST /login.
    │        users.js queries MongoDB Atlas using usersDb from connection.js to look up the
    │        user document by email. Atlas returns either a matching document or null.
    │        users.js checks the password field and returns either 200 or 401 to the browser.
    │        Login.jsx receives the response status and navigates accordingly.
    │
    │        In:        The user types an email and password into the controlled form fields.
    │                   The email and password are stored in the form{ email, password } state
    │                   object as the user types. On form submit, onSubmit() sends these two
    │                   values as a JSON body to users.js POST /login at localhost:5050.
    │                   The exact request looks like: POST http://localhost:5050/users/login
    │                   with headers { Content-Type: application/json } and body { "email":
    │                   "user@example.com", "password": "secret" }.
    │        Out:       If users.js returns HTTP 200 { token: "eyJ..." }, Login.jsx calls
    │                   response.json() to extract the token, then calls
    │                   localStorage.setItem("token", token) to persist the JWT in the
    │                   browser's key-value storage across page refreshes. localStorage
    │                   is a browser-native store that survives navigation and refresh —
    │                   the token stays there until explicitly removed by logout() in
    │                   Navbar.jsx. After storing the token, Login.jsx calls navigate("/"),
    │                   which renders AgentList.jsx inside the App.jsx layout. AgentList.jsx
    │                   immediately reads the token back from localStorage via
    │                   localStorage.getItem("token") and attaches it to the GET /agents
    │                   fetch as Authorization: Bearer <token>. If users.js returns
    │                   HTTP 401 Unauthorized, Login.jsx calls navigate("/unauthorized"),
    │                   which renders Unauthorized.jsx as a standalone page. No token
    │                   is stored on failure.
    │        Imports:   useState is imported from 'react' to manage the form{ email, password }
    │                   state object that tracks the two input fields as the user types.
    │                   useNavigate is imported from 'react-router-dom' to redirect to
    │                   AgentList.jsx on success or Unauthorized.jsx on failure after
    │                   the users.js response arrives.
    │        Exports:   The default export Login is imported by main.jsx and routed at /login.
    │                   Login.jsx is also the navigation destination of Navbar.jsx's logout()
    │                   function and of Unauthorized.jsx's "Back to Login" Link.
    │        Functions: updateForm(value) merges a partial field update into the form state
    │                   object. It uses the same spread-and-merge pattern as AgentForm.jsx —
    │                   only the field that changed is updated in state.
    │                   onSubmit(e) calls e.preventDefault(), then sends a POST request to
    │                   users.js POST /login with the form credentials as the JSON body.
    │                   If response.ok is true (status 200), it calls response.json() to
    │                   parse the { token } body, then localStorage.setItem("token", token)
    │                   to store the JWT, then navigate("/") to render AgentList.jsx.
    │                   If response.ok is false (status 401), it calls
    │                   navigate("/unauthorized") to render Unauthorized.jsx.
    │        State:     form{ email, password } holds the two controlled input fields. Each
    │                   input's value attribute is bound to its field in form{}, and onChange
    │                   calls updateForm() to keep the displayed text and the state in sync.
    │                   This is the data that gets sent to users.js when the form is submitted.
    │                   The token returned by users.js is NOT stored in React state — it goes
    │                   directly into localStorage, where AgentList.jsx, AgentForm.jsx, and
    │                   any future protected component can read it independently.
    │
    └──► Unauthorized.jsx  [Page / View] ──── renders at  /unauthorized (no Navbar)
             Role:      Unauthorized.jsx is a static guard page. It renders when Login.jsx's
                        onSubmit() receives a 401 response from users.js and calls
                        navigate("/unauthorized"). It is defined outside App.jsx in main.jsx
                        so it has no Navbar. It is purely informational — it tells the user
                        their credentials were not recognized and gives them a way back to
                        Login.jsx. No data is fetched and no server calls are made.
                        Unauthorized.jsx is the polite turn-back desk: it does not make
                        decisions itself, but it reports users.js's rejection and points
                        the user back to Login.jsx.
             In:        Unauthorized.jsx receives no props and performs no data fetching.
                        It is rendered purely as a consequence of Login.jsx calling
                        navigate("/unauthorized") after users.js returns a 401 response.
                        At the moment it renders, the user has just been rejected by the
                        backend authentication check in users.js.
             Out:       It renders a static "Access Denied" heading, an explanatory message
                        telling the user their credentials were not recognized, and a Link
                        component pointing to "/login". Clicking that Link renders Login.jsx
                        again, allowing the user to try different credentials. No HTTP
                        request is made when navigating to or from Unauthorized.jsx.
             Imports:   Link is imported from 'react-router-dom'. The Link to="/login"
                        renders as an anchor tag that, when clicked, tells React Router
                        to navigate to /login and render Login.jsx — completing the cycle
                        back to the start of the authentication flow.
             Exports:   The default export Unauthorized is imported by main.jsx and routed
                        at /unauthorized. It is reached only via Login.jsx's navigate call
                        on authentication failure, and it links back only to Login.jsx.
             Functions: Unauthorized.jsx defines no functions of its own. The only
                        interactivity in the entire component is the Link back to Login.jsx.
```

---

## 2. Server Startup

How the Express backend goes from source files to a running server ready to accept
HTTP requests from the React frontend.

```
package.json  [Package Manifest]
    │  Role:      package.json serves as the manifest for the server application,
    │             separate from the client's package.json. It declares the Node.js
    │             packages the server needs and sets a critical configuration flag
    │             that all server files depend on.
    │             For the backend organization, package.json is the hiring plan and
    │             rulebook: it brings in Express, MongoDB, and cors, then tells Node
    │             that everyone speaks ES module syntax.
    │  In:        The developer runs a node command in the terminal inside the server/
    │             folder. npm reads this file to resolve dependencies.
    │  Out:       Node.js starts, dependencies are available, and server.js is executed
    │             as the entry point.
    │  Declares:  "type": "module" enables ES module import/export syntax throughout
    │             the entire server. Without this, the import and export keywords used
    │             in server.js, agents.js, users.js, connection.js, and both schema
    │             files would cause syntax errors — Node would expect require() instead.
    │             The dependencies section lists express (the web framework), mongodb
    │             (the official MongoDB driver), and cors (cross-origin request handling).
    │  node --env-file=config.env server.js
    ▼
config.env  [Environment Config] ────────── supplies ATLAS_URI to process.env
    │  Role:      config.env is a plain text file that holds secret configuration values
    │             that should never be committed to git. The most important value is
    │             ATLAS_URI — the full connection string to the MongoDB Atlas cluster,
    │             which contains the username, password, and cluster address. Putting
    │             it here instead of in source code means it stays off GitHub. It is
    │             the single source of the database secret for the entire server.
    │             config.env is the locked credentials cabinet for the backend team:
    │             server.js, connection.js, and seed.js only get the keys they need
    │             when Node loads this file into process.env.
    │  In:        The --env-file=config.env flag on the node command tells Node.js to
    │             read this file before executing any application code. Node parses
    │             each KEY=VALUE line and adds the values to process.env — a built-in
    │             Node.js object that any file can read.
    │  Out:       ATLAS_URI is now in process.env.ATLAS_URI, where connection.js will
    │             read it to open the MongoDB Atlas connection. PORT is now in
    │             process.env.PORT, where server.js will read it to choose which port
    │             to listen on. seed.js also reads process.env.ATLAS_URI independently
    │             when it is run manually — it does not go through connection.js.
    │  Contains:  ATLAS_URI holds the full MongoDB Atlas connection string, which
    │             includes the database username, password, and cluster hostname.
    │             PORT is optional — server.js falls back to 5050 if it is not set.
    │  Read by:   server.js reads process.env.PORT to determine its listening port.
    │             connection.js reads process.env.ATLAS_URI to connect to Atlas.
    │             seed.js reads process.env.ATLAS_URI for its own direct connection.
    │
    ▼
server.js  [Entry Point] ────────────────── registers middleware (cors, json), mounts routes
    │  Role:      server.js is the composition root of the Express application. It is
    │             the file that creates the Express app instance and wires everything
    │             else together. It imports the two route modules (agents.js and users.js),
    │             registers middleware that processes every incoming request before it
    │             reaches a route, mounts each router at its URL prefix, and starts the
    │             HTTP server. It is the first and last place a request touches before
    │             being handled by a route.
    │             server.js is reception and dispatch for the backend office: every
    │             request checks in here, receives middleware processing, and is then
    │             sent to agents.js or users.js.
    │  In:        server.js reads process.env.PORT from config.env for the port number.
    │             It imports the default export (the Express router) from agents.js, which
    │             itself imports agentsDb from connection.js and createAgent/updateAgent
    │             from agent.schema.js. It imports the default export from users.js,
    │             which itself imports usersDb from connection.js. Importing these modules
    │             executes their top-level code — which means connection.js's client.connect()
    │             runs at this point, opening the Atlas connection.
    │  Out:       An HTTP server begins listening on PORT (5050 by default). Every request
    │             that arrives at localhost:5050 will pass through the cors and json
    │             middleware first, then be delegated to agents.js if the URL starts with
    │             /agents, or to users.js if the URL starts with /users.
    │  Imports:   express is imported from 'express' — it provides the app instance and
    │             the middleware functions. cors is imported from 'cors' — it adds the
    │             Access-Control-Allow-Origin response header to every request, which is
    │             required because the React frontend at localhost:5173 and this server
    │             at localhost:5050 are on different ports, and browsers block cross-port
    │             requests by default (this is called the Same-Origin Policy).
    │             agents is imported from agents.js, which exports its Express router
    │             object. Importing it causes agents.js's top-level code to run, which
    │             causes connection.js to be imported and client.connect() to be called.
    │             users is imported from users.js, which exports its Express router object.
    │             requireAuth is imported as a named export from auth.js — it is the
    │             middleware function that verifies the JWT on every /agents request.
    │  Exports:   server.js exports nothing. It is an entry point that only executes.
    │  Functions: app.use(cors()) wraps every response with cross-origin headers, allowing
    │             the React app at localhost:5173 to receive responses from this server at
    │             localhost:5050 without being blocked by the browser's security policy.
    │             app.use(express.json()) reads the raw request body of every incoming
    │             POST and PATCH request and parses it from a JSON string into a JavaScript
    │             object, making it available as req.body in agents.js and users.js.
    │             Without this middleware, req.body would be undefined and the route
    │             handlers could not read the data sent by the frontend.
    │             app.use("/agents", requireAuth, agents) tells Express that any request
    │             whose URL starts with /agents must first pass through requireAuth from
    │             auth.js. requireAuth verifies the JWT and either calls next() to continue
    │             to agents.js, or returns 401 immediately. agents.js never runs if the
    │             token is missing or invalid. This is the line that makes all five agent
    │             CRUD endpoints protected.
    │             app.use("/users", users) tells Express that any request whose URL starts
    │             with /users should be handled by the router exported by users.js. No
    │             requireAuth here — the login endpoint must be publicly reachable.
    │             app.listen(PORT) starts the HTTP server and begins accepting connections.
    │
    │             Middleware execution order:
    │             Every single HTTP request that arrives at port 5050 passes through the
    │             middleware stack in order before reaching a route handler. The order is
    │             fixed by the order of app.use() calls in server.js:
    │             1. cors() runs FIRST on every request. It adds the
    │                Access-Control-Allow-Origin: * header to the response, which tells the
    │                browser it is permitted to receive this response even though the server
    │                is on a different port than the page. Without this, the browser would
    │                silently block every response from the server.
    │             2. express.json() runs SECOND on every request. It reads the raw request
    │                body (a string like '{"email":"x","password":"y"}') and parses it into
    │                a JavaScript object ({ email: "x", password: "y" }), storing the result
    │                in req.body. Without this middleware, req.body would be undefined and
    │                agents.js and users.js could not read the data the frontend sent. This
    │                only does something useful for requests with a body (POST, PATCH) and
    │                with the Content-Type: application/json header set.
    │             3. The matched route handler (agents.js or users.js) runs LAST. By the
    │                time it runs, the response already has CORS headers and req.body is
    │                already parsed.
    │
    ├──► auth.js  [Middleware] ──────────── guards all  /agents  routes
    │        Role:      auth.js is a middleware function that sits between server.js and
    │                   agents.js. It is registered as a second argument in server.js's
    │                   app.use("/agents", requireAuth, agents) call, which means every
    │                   single request to any /agents route — GET, POST, PATCH, DELETE —
    │                   passes through auth.js before agents.js ever runs. If auth.js
    │                   rejects the request, agents.js is never called. auth.js never
    │                   runs for /users routes — those are mounted separately without
    │                   requireAuth, because login must remain publicly reachable.
    │                   auth.js is the security checkpoint between server.js reception
    │                   and the agents.js department: no request enters agents.js without
    │                   first presenting a valid badge to auth.js.
    │        In:        Every request to /agents arrives here from server.js after cors()
    │                   and express.json() have already run. auth.js reads
    │                   req.headers.authorization to find the JWT. The header must be
    │                   present and must start with "Bearer " — this is the standard format:
    │                   Authorization: Bearer eyJ... The token string is extracted by
    │                   splitting on the space: authHeader.split(" ")[1].
    │        Out:       auth.js calls jwt.verify(token, process.env.JWT_SECRET) from the
    │                   jsonwebtoken library. jwt.verify() recomputes the token's signature
    │                   using JWT_SECRET from config.env and checks it matches. It also
    │                   checks the exp claim — if the token was issued more than 24 hours
    │                   ago (the expiresIn set by users.js), verify() throws automatically.
    │                   If verification succeeds, auth.js attaches the decoded payload to
    │                   req.user = { id, email, iat, exp } and calls next(), which passes
    │                   control to agents.js. If the header is missing, malformed, or the
    │                   token is invalid or expired, auth.js calls
    │                   res.status(401).json({ error: "No token provided" }) or
    │                   res.status(401).json({ error: "Invalid or expired token" }) and
    │                   returns immediately — agents.js never runs.
    │        Imports:   jwt is imported from 'jsonwebtoken' — it provides jwt.verify(),
    │                   which checks the token's cryptographic signature and expiry.
    │                   process.env.JWT_SECRET is read from config.env at runtime — this
    │                   is the same secret that users.js used with jwt.sign() to create
    │                   the token. Both files must use the same secret or verification fails.
    │        Exports:   requireAuth is exported as a named export. server.js imports it
    │                   and inserts it between the "/agents" path and the agents router
    │                   in the app.use() call. No other file imports auth.js.
    │        Functions: requireAuth(req, res, next) is the single exported function.
    │                   It reads req.headers.authorization, extracts the token, calls
    │                   jwt.verify(), attaches the decoded payload to req.user, and calls
    │                   next() — or short-circuits with 401 if anything fails. next() is
    │                   the Express convention for saying "I am done, pass this request
    │                   to the next handler in the chain" — in this case, agents.js.
    │
    ├──► agents.js  [Route Handler] ──────── handles  GET/POST/PATCH/DELETE  /agents
    │        Role:      agents.js defines the Express router for all agent-related HTTP
    │                   operations. It is the server-side counterpart to the fetch() calls
    │                   made by AgentList.jsx and AgentForm.jsx. It receives HTTP requests
    │                   from server.js, decides which MongoDB operation to perform, calls
    │                   agent.schema.js to shape any write data, uses agentsDb from
    │                   connection.js to execute the database operation, and sends the
    │                   result back as an HTTP response. It currently contains both the
    │                   routing layer (which HTTP path and method to match) and the
    │                   business logic layer (what to do when matched), because no
    │                   separate controller layer exists.
    │                   agents.js is the agent operations manager: AgentList.jsx and
    │                   AgentForm.jsx bring it requests, agent.schema.js checks the
    │                   write paperwork, connection.js opens the records line, and
    │                   agents.js sends the official response back.
    │
    │        BACKEND → DATABASE interaction (on each request):
    │        For every request that arrives, agents.js determines the operation:
    │        GET / — calls agentsDb.collection("agents").find({}).toArray(). The empty
    │        filter {} means "match all documents." Atlas returns an array of all agent
    │        documents. agents.js sends that array as JSON with status 200 back to
    │        AgentList.jsx's getAgents() fetch call.
    │        GET /:id — wraps req.params.id in ObjectId() and calls findOne({ _id: ObjectId(id) }).
    │        ObjectId conversion is required because MongoDB stores _id as a BSON ObjectId type,
    │        not a plain string. Atlas returns the matching document or null. agents.js sends
    │        the document with status 200 (or 404 if null) back to AgentForm.jsx's fetchData().
    │        POST / — calls createAgent(req.body) from agent.schema.js to shape the document,
    │        then calls agentsDb.collection("agents").insertOne(newAgent). Atlas creates the
    │        document, assigns it a unique _id, and returns { acknowledged: true, insertedId }.
    │        agents.js sends that result with status 201 back to AgentForm.jsx's onSubmit().
    │        PATCH /:id — calls updateAgent(req.body) from agent.schema.js to shape the update
    │        (excluding sales), wraps it in { $set: updates }, and calls updateOne(query, $set).
    │        The $set operator tells MongoDB to update only the specified fields and leave the
    │        rest unchanged. Atlas returns { acknowledged: true, matchedCount: 1, modifiedCount: 1 }.
    │        agents.js sends that result with status 200 back to AgentForm.jsx's onSubmit().
    │        DELETE /:id — wraps req.params.id in ObjectId() and calls deleteOne({ _id: ObjectId(id) }).
    │        Atlas removes the document and returns { acknowledged: true, deletedCount: 1 }.
    │        agents.js sends that result with status 200 back to AgentList.jsx's deleteAgent().
    │
    │        In:        Requests arrive forwarded from server.js. req.params.id is the
    │                   agent's MongoDB _id string extracted from the URL by Express for
    │                   the /:id routes. req.body is the parsed JSON object from the
    │                   request body, available because server.js applied express.json()
    │                   middleware before the request reached this router. For POST and PATCH
    │                   routes, req.body contains: { first_name, last_name, email, region,
    │                   rating, fee } — exactly the fields from AgentForm.jsx's form{} state.
    │        Out:       All responses travel back through server.js to the originating
    │                   frontend fetch() call. GET / returns an array of agent objects,
    │                   each with shape { _id, first_name, last_name, email, region, rating,
    │                   fee, sales }. GET /:id returns a single agent object or 404.
    │                   POST / returns { acknowledged, insertedId } with status 201.
    │                   PATCH /:id returns { acknowledged, matchedCount, modifiedCount } with 200.
    │                   DELETE /:id returns { acknowledged, deletedCount } with status 200.
    │        Imports:   express is imported from 'express' to create the router instance.
    │                   agentsDb is imported as a named export from connection.js — it is
    │                   the live MongoDB "agents" database reference that all route handlers
    │                   use to perform collection operations. connection.js also exports
    │                   usersDb, but agents.js never uses it. ObjectId is imported from
    │                   'mongodb' — without it, passing a plain string as an _id filter
    │                   would fail because MongoDB stores _ids as BSON ObjectId objects,
    │                   not strings, so the types would not match. createAgent and updateAgent
    │                   are imported as named exports from agent.schema.js — createAgent is
    │                   called in the POST / handler and updateAgent in the PATCH /:id handler,
    │                   both before any database write.
    │        Exports:   The default export is the Express router object. server.js imports
    │                   it as the variable "agents" and mounts it via app.use("/agents", agents),
    │                   meaning every request to /agents/* is delegated here.
    │        Routes:    GET    /agents       ← called by AgentList.jsx getAgents() on mount.
    │                                          Returns all agent documents from Atlas as JSON array.
    │                   GET    /agents/:id   ← called by AgentForm.jsx fetchData() in edit mode.
    │                                          Returns one agent document from Atlas by _id.
    │                   POST   /agents       ← called by AgentForm.jsx onSubmit() when isNew=true.
    │                                          Body from req.body flows through createAgent() from
    │                                          agent.schema.js, then insertOne() via agentsDb.
    │                   PATCH  /agents/:id   ← called by AgentForm.jsx onSubmit() when isNew=false.
    │                                          Body from req.body flows through updateAgent() from
    │                                          agent.schema.js, then updateOne($set) via agentsDb.
    │                   DELETE /agents/:id   ← called by AgentList.jsx deleteAgent() on click.
    │                                          Removes the agent document from Atlas by _id via agentsDb.
    │
    │        async/await and try/catch pattern:
    │        Every route handler in agents.js follows the same pattern:
    │        router.get("/", async (req, res) => { try { ... await ... res.send() }
    │        catch (err) { res.status(500).send("Error message") } }).
    │        async declares that the function contains asynchronous operations. await pauses
    │        execution at the database call until MongoDB Atlas responds — without it, the
    │        code would continue before the data arrived. The entire body is wrapped in
    │        try/catch: if any await call throws (e.g., Atlas is unreachable, the ObjectId
    │        string is malformed, the network times out), JavaScript jumps to the catch block,
    │        which calls res.status(500).send("Error message"). HTTP 500 means "Internal
    │        Server Error" — something went wrong on the server side. The frontend fetch
    │        calls receive this 500 response but currently only log it to console.error —
    │        the user sees no error message in the UI.
    │
    │        .toArray() on find():
    │        agentsDb.collection("agents").find({}) does not immediately return an array.
    │        It returns a MongoDB Cursor — a pointer to the results that can be iterated
    │        lazily (useful for huge datasets). .toArray() tells the driver to collect all
    │        results into a JavaScript array in memory. For this project's size (16 agents),
    │        this is fine. The await before the whole call pauses until the cursor is fully
    │        resolved into an array.
    │
    │        $set in updateOne:
    │        The PATCH route wraps the shaped document from updateAgent() in { $set: updates }.
    │        $set is a MongoDB update operator. It tells MongoDB: "update ONLY the fields
    │        listed here, leave all other fields unchanged." Without $set, passing a plain
    │        object to updateOne() would REPLACE the entire document, deleting any fields
    │        not included in the update — including sales. Using $set: updateAgent(req.body)
    │        (which excludes sales) means only the fields the user edited are changed, and
    │        sales is preserved untouched.
    │        │
    │        └──► agent.schema.js  [Schema Factory] ── createAgent() / updateAgent()
    │                 Role:      agent.schema.js is the single source of truth for what an
    │                            agent document must look like before it is written to MongoDB.
    │                            It acts as a validation and transformation layer between
    │                            the raw HTTP request body and the database. Without it,
    │                            agents.js would insert whatever the frontend sent directly —
    │                            which could include wrong types (e.g., rating as a string
    │                            instead of a number) or extra fields. It is a lightweight
    │                            alternative to a full ODM (Object Document Mapper) like
    │                            Mongoose, which would enforce schemas at the framework level.
    │                            agent.schema.js is quality control for agent paperwork:
    │                            it does not talk to the customer or the records room,
    │                            but it makes sure agents.js files clean, typed documents.
    │                 In:        agents.js passes the raw req.body object — which came from
    │                            AgentForm.jsx's form{} state via a POST or PATCH request —
    │                            into either createAgent() or updateAgent() before writing to
    │                            the database. The input shape is: { first_name: string,
    │                            last_name: string, email: string, region: string, rating:
    │                            string, fee: string }. Note that rating and fee arrive as
    │                            strings because HTML form inputs always produce strings, even
    │                            for number inputs. The schema functions correct this.
    │                 Out:       createAgent() returns a new object back to agents.js POST /,
    │                            which immediately passes it to agentsDb.collection("agents")
    │                            .insertOne(). The returned object has the shape: { first_name:
    │                            string, last_name: string, email: string, region: string,
    │                            rating: Number (converted from string), fee: Number (converted
    │                            from string), sales: 0 (hardcoded — new agents always start
    │                            with zero sales) }. updateAgent() returns a nearly identical
    │                            object back to agents.js PATCH /:id, which wraps it in
    │                            { $set: updates } and passes it to agentsDb.updateOne(). The
    │                            only difference is that sales is deliberately absent from the
    │                            returned object — this protects the sales field from being
    │                            overwritten through the edit form.
    │                 Imports:   agent.schema.js imports nothing at all. It has zero dependencies
    │                            on any other file in the project. It is a pure functions file —
    │                            it takes an input and returns an output with no side effects.
    │                 Exports:   createAgent is exported as a named export. It is imported by
    │                            agents.js and called inside the POST / route handler before
    │                            every collection.insertOne() call. updateAgent is exported as a
    │                            named export. It is imported by agents.js and called inside the
    │                            PATCH /:id route handler before every collection.updateOne() call.
    │                 Functions: createAgent({ first_name, last_name, email, region, rating, fee })
    │                            destructures the six expected fields from the input object,
    │                            discarding any unexpected fields the frontend might have sent.
    │                            It returns { first_name, last_name, email, region,
    │                            rating: Number(rating), fee: Number(fee), sales: 0 }.
    │                            The Number() conversion ensures that even if AgentForm.jsx
    │                            sends "95" as a string, the database stores 95 as a number.
    │                            The sales: 0 ensures every new agent starts with no sales.
    │                            updateAgent({ first_name, last_name, email, region, rating, fee })
    │                            returns the same shape but without sales. This means that even
    │                            if someone sends a sales field in a PATCH request body, it is
    │                            silently dropped here before reaching the database — sales can
    │                            only be set at creation time through createAgent().
    │
    └──► users.js  [Route Handler] ───────── handles  POST  /users/login
             Role:      users.js defines the Express router for user authentication. It is
                        the only server-side file that Login.jsx communicates with, and the
                        only route that touches the users database. It receives credentials
                        from Login.jsx, verifies them against the users collection in Atlas,
                        and tells the frontend whether the login succeeded or failed.
                        users.js is the authentication officer: Login.jsx brings the
                        credentials, connection.js provides access to the user records,
                        and users.js returns either approval or rejection.
             In:        A POST /login request arrives forwarded from server.js. req.body
                        contains { email: string, password: string } — the values the user
                        typed into Login.jsx's form, parsed from JSON by server.js's
                        express.json() middleware before reaching this handler. The exact
                        body shape is: { "email": "user@rocket.elv", "password": "secret" }.
             Out:       users.js uses usersDb from connection.js to call findOne({ email })
                        on the users collection in Atlas. If Atlas returns null (no user with
                        that email), users.js sends HTTP 401 "Unauthorized: email not found"
                        back to Login.jsx. If Atlas returns a user document but the password
                        field does not match req.body.password, users.js sends HTTP 401
                        "Unauthorized: incorrect password." If both checks pass, users.js
                        calls jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET,
                        { expiresIn: "24h" }) from the jsonwebtoken library. jwt.sign() creates
                        a base64-encoded string in three parts — header.payload.signature —
                        where the signature is a cryptographic hash of the payload using
                        JWT_SECRET. This means any tampering with the payload would invalidate
                        the signature. users.js sends HTTP 200 { token: "eyJ..." } back to
                        Login.jsx. Login.jsx stores that token in localStorage. Every subsequent
                        /agents request attaches it as Authorization: Bearer <token>, which
                        auth.js verifies using the same JWT_SECRET before agents.js runs.
             Imports:   express is imported from 'express' to create the router instance.
                        jwt is imported from 'jsonwebtoken' — it provides jwt.sign(), which
                        creates the signed token on successful login.
                        usersDb is imported as a named export from connection.js — it holds
                        the live MongoDB "users" database reference. connection.js also exports
                        agentsDb, but users.js never imports or uses it.
             Exports:   The default export is the Express router object. server.js imports it
                        as the variable "users" and mounts it via app.use("/users", users),
                        meaning every request to /users/* is delegated here.
             Routes:    POST /users/login ← called by Login.jsx's onSubmit() via fetch POST
                        /users/login. It uses usersDb from connection.js to call findOne({
                        email }) against the "users" collection in Atlas. It compares the
                        password field on the returned document against req.body.password.
                        It returns 200 or 401 to Login.jsx's fetch() response handler.
             │
             └──► user.schema.js  [Schema Factory] ─── createUser()
                      Role:      user.schema.js defines what a user document should look
                                 like in MongoDB. However, it is currently an orphaned file —
                                 it is not imported by users.js or any other active route.
                                 User documents are created manually inside MongoDB Atlas
                                 rather than through an API endpoint. user.schema.js exists
                                 to document the intended shape and would be used if a
                                 POST /users/register endpoint were ever added to users.js.
                                 user.schema.js is a drafted HR intake form waiting for
                                 a future registration desk to start using it.
                      In:        createUser() would receive { first_name, last_name, email,
                                 password } if any route called it. Currently no route does.
                      Out:       createUser() would return a shaped { first_name, last_name,
                                 email, password } document. That document would then be
                                 passed to usersDb.insertOne() in a hypothetical registration
                                 endpoint in users.js.
                      Imports:   user.schema.js imports nothing. It has zero dependencies
                                 on any other file in the project.
                      Exports:   createUser is exported as a named export, but it is not
                                 currently imported by users.js or any other file. It is an
                                 available but unused export — a placeholder for a feature
                                 that has not been built yet.
                      Functions: createUser({ first_name, last_name, email, password })
                                 destructures the four expected fields and returns them as
                                 a clean document object: { first_name, last_name, email,
                                 password }. Note that like the login route, there is no
                                 password hashing here — storing plaintext passwords is a
                                 security vulnerability that would need to be addressed
                                 before this could be used in production.

    server.js also imports:
    └──► connection.js  [Database Connection] ── connects to MongoDB Atlas, exports agentsDb + usersDb
             Role:      connection.js is the database layer of the server. It is the only
                        file that communicates directly with MongoDB Atlas. It opens a single
                        persistent connection to Atlas when the server starts and keeps it
                        open for the entire lifetime of the server process. agents.js and
                        users.js import their respective database references from this file
                        and use them for every query — they never open their own connections.
                        This "single shared connection" pattern is intentional: opening a new
                        database connection on every request would be slow and wasteful.
                        connection.js is the records liaison: agents.js and users.js do
                        not each build their own bridge to Atlas; they call this one
                        coworker who keeps the shared database connection open.
             In:        connection.js reads process.env.ATLAS_URI, which was injected by
                        the --env-file=config.env flag when Node started. The ATLAS_URI is
                        the full MongoDB Atlas connection string containing the username,
                        password, cluster hostname, and options for the connection.
             Out:       It exports two named references: agentsDb, which points to the
                        MongoDB "agents" database and is imported by agents.js for all
                        agent collection operations; and usersDb, which points to the
                        MongoDB "users" database and is imported by users.js for the
                        login lookup. These are two separate databases in Atlas, not two
                        collections within the same database.
             Imports:   MongoClient is imported from 'mongodb' — it is the official MongoDB
                        Node.js driver client class that handles the actual TCP connection
                        to Atlas. ServerApiVersion is imported to pin the server API version,
                        which ensures stable, predictable behavior regardless of Atlas upgrades.
             Exports:   agentsDb is exported as a named export. It is imported by agents.js,
                        which calls agentsDb.collection("agents") and then performs find,
                        findOne, insertOne, updateOne, or deleteOne on that collection.
                        usersDb is exported as a named export. It is imported by users.js,
                        which calls usersDb.collection("users").findOne({ email }) inside
                        the POST /login route handler.
             Functions: client.connect() is called as top-level await when the module is
                        first imported. This means the Atlas connection opens the instant
                        server.js imports connection.js — before any HTTP requests arrive.
                        If the connection fails, an error is logged and the server cannot
                        serve data. client.db("agents") returns a reference to the "agents"
                        database in Atlas, which is then exported as agentsDb to agents.js.
                        client.db("users") returns a reference to the "users" database in
                        Atlas, which is then exported as usersDb to users.js.
```

> Note: there is no dedicated Controller layer. Route handlers are doing double duty —
> they define the HTTP interface AND contain the business logic. A scaled app would
> split these into thin `routes/` (maps verbs to functions) and `controllers/` (logic lives here).

---

## 3. API Call Flow (frontend → backend → database → back)

A step-by-step trace of what happens when the agent dashboard loads, including
every boundary crossing between the frontend, the backend, and the database.

```
AgentList.jsx / AgentForm.jsx  [Page / View]
    │  Role:      These two React components are the only frontend files that send
    │             HTTP requests to the /agents resource on the backend. Together they
    │             cover all five agent operations. The user never directly touches the
    │             backend or the database — every interaction goes through these
    │             components via the fetch() API.
    │             In the organization, AgentList.jsx and AgentForm.jsx are the two
    │             public-facing agent desk coworkers. AgentList.jsx asks for rosters
    │             and removals; AgentForm.jsx submits new or revised agent paperwork.
    │  In:        Each operation is triggered by a user action or a lifecycle event.
    │             getAgents() in AgentList.jsx fires automatically via useEffect when
    │             the component first mounts in the browser — meaning the moment the
    │             user lands on the / route. deleteAgent(id) fires when the user clicks
    │             a Delete button in a table row. fetchData() in AgentForm.jsx fires via
    │             useEffect when the component mounts at /edit/:id and a URL parameter
    │             is present. onSubmit() fires when the user submits the AgentForm.
    │  Out:       Each function constructs a fetch() request. fetch() is a browser
    │             built-in that sends an HTTP request to the given URL and returns a
    │             Promise that resolves to the server's response. The target URL is
    │             http://localhost:5050/agents/... — this reaches the Express server
    │             started by server.js. server.js sees the /agents prefix and delegates
    │             the request to agents.js via app.use("/agents", agents).
    │  Functions: getAgents() sends: GET http://localhost:5050/agents/
    │               with headers { Authorization: Bearer <token from localStorage> }.
    │             deleteAgent(id) sends: DELETE http://localhost:5050/agents/:id
    │               with headers { Authorization: Bearer <token from localStorage> }.
    │             fetchData() sends: GET http://localhost:5050/agents/:id
    │               with headers { Authorization: Bearer <token from localStorage> }.
    │             onSubmit() [isNew=true] sends: POST http://localhost:5050/agents
    │               with headers { Content-Type: application/json,
    │                              Authorization: Bearer <token from localStorage> }
    │               and body { first_name, last_name, email, region, rating, fee }.
    │             onSubmit() [isNew=false] sends: PATCH http://localhost:5050/agents/:id
    │               with headers { Content-Type: application/json,
    │                              Authorization: Bearer <token from localStorage> }
    │               and body { first_name, last_name, email, region, rating, fee }.
    │             Every /agents fetch reads the token via localStorage.getItem("token")
    │             at the moment the request is made. auth.js on the server verifies the
    │             token before agents.js handles any of these requests.
    │  fetch("http://localhost:5050/agents/...")
    ▼
agents.js  [Route Handler]
    │  Role:      agents.js is the first server-side code to run after server.js
    │             delegates the request. It reads the HTTP method and URL parameters
    │             to decide which database operation to perform. For read operations
    │             (GET), it goes straight to agentsDb from connection.js. For write
    │             operations (POST, PATCH), it first calls agent.schema.js to shape
    │             the incoming data, then calls agentsDb from connection.js.
    │             agents.js is the internal agent department receiving those requests
    │             from the frontend desk and deciding which records action is needed.
    │  In:        The request arrives from server.js, which has already run it through
    │             the cors and express.json() middleware. req.method tells agents.js
    │             which HTTP method was used (GET, POST, PATCH, DELETE). req.params.id
    │             is the :id segment of the URL, extracted by Express — this is the
    │             MongoDB _id of the target agent. req.body is the parsed JSON object
    │             from the request body — available for POST and PATCH only.
    │  Out:       For POST and PATCH requests, agents.js passes req.body to createAgent()
    │             or updateAgent() from agent.schema.js. The shaped document returned
    │             by those functions is then passed to agentsDb from connection.js for
    │             the actual database write. For all requests, the MongoDB result is
    │             sent back to the frontend as an HTTP response.
    │  Imports used: agentsDb from connection.js provides the database reference.
    │             createAgent and updateAgent from agent.schema.js shape write payloads.
    │             ObjectId from 'mongodb' converts the string :id from req.params.id
    │             into MongoDB's BSON ObjectId type, which is required for _id queries.
    │  calls createAgent() or updateAgent() if writing
    ▼
agent.schema.js  [Schema Factory]
    │  Role:      agent.schema.js acts as a firewall between the raw HTTP request body
    │             and the database. It ensures that no matter what the frontend sends,
    │             the document that reaches MongoDB is correctly typed and correctly shaped.
    │             As quality control, agent.schema.js reviews the paperwork from agents.js
    │             before the database liaison is allowed to file it.
    │  In:        agents.js passes req.body directly into createAgent() on POST routes, or
    │             into updateAgent() on PATCH routes. req.body at this point looks like:
    │             { first_name: "John", last_name: "Smith", email: "j@rocket.elv",
    │             region: "North", rating: "92", fee: "9000" } — note that rating and
    │             fee are strings because HTML form inputs always produce strings.
    │  Out:       createAgent() returns a clean document to agents.js POST /, which passes
    │             it to agentsDb.insertOne(): { first_name: "John", last_name: "Smith",
    │             email: "j@rocket.elv", region: "North", rating: 92, fee: 9000, sales: 0 }.
    │             rating and fee are now JavaScript numbers (converted by Number()), and
    │             sales: 0 has been added automatically. updateAgent() returns the same
    │             shape to agents.js PATCH /:id, which wraps it in { $set: ... } for
    │             updateOne() — except sales is absent from the returned object,
    │             protecting it from being overwritten.
    │  Functions: createAgent() is called by agents.js POST /. It returns the shaped doc.
    │             updateAgent() is called by agents.js PATCH /:id. It returns the same
    │             shape without sales, protecting that field from edit-form overwrites.
    │  returns a clean, consistently shaped document
    ▼
connection.js  [Database Connection]  (agentsDb)
    │  Role:      connection.js is where the data physically crosses from the Node.js
    │             server process into the MongoDB Atlas cloud database. The agentsDb
    │             reference exported from this file is what agents.js uses to call
    │             collection methods. Under the hood, agentsDb.collection("agents")
    │             accesses the "agents" collection within the "agents" database in Atlas,
    │             and the method called on it (find, insertOne, etc.) is sent over a
    │             persistent TCP connection to the Atlas cluster.
    │             connection.js is the courier line to the records department, carrying
    │             agents.js's approved requests into Atlas and bringing the results back.
    │  In:        agents.js calls a collection method on agentsDb. The specific call
    │             depends on the route: find({}) for GET /, findOne({ _id: ObjectId(id) })
    │             for GET /:id, insertOne(doc) for POST /, updateOne(query, { $set: doc })
    │             for PATCH /:id, or deleteOne({ _id: ObjectId(id) }) for DELETE /:id.
    │             For POST and PATCH, the doc passed here was shaped by agent.schema.js.
    │  Out:       Atlas executes the query and returns a result to connection.js, which
    │             passes it back to agents.js. find({}).toArray() returns an array of all
    │             agent documents. findOne() returns one document or null. insertOne()
    │             returns { acknowledged: true, insertedId: ObjectId("...") }. updateOne()
    │             returns { acknowledged: true, matchedCount: 1, modifiedCount: 1 }.
    │             deleteOne() returns { acknowledged: true, deletedCount: 1 }.
    │  Export used: agentsDb (the named export from connection.js) is the object agents.js
    │             calls collection("agents") on. agentsDb points to the "agents" database
    │             in Atlas. usersDb from connection.js is not used in this flow at all.
    │  collection.find() / insertOne() / updateOne() / deleteOne()
    ▼
MongoDB Atlas
    │  MongoDB Atlas is the cloud-hosted database. It stores all agent documents in
    │  the "agents" collection inside the "agents" database. Each document is a BSON
    │  object (Binary JSON — MongoDB's internal format) with this shape:
    │  {
    │    _id: ObjectId("64a1f..."),   ← auto-generated unique identifier by MongoDB
    │    first_name: "Orlando",
    │    last_name: "Perez",
    │    email: "perez@rocket.elv",
    │    region: "North",
    │    rating: 95,                  ← stored as a number (enforced by agent.schema.js)
    │    fee: 10000,                  ← stored as a number (enforced by agent.schema.js)
    │    sales: 0                     ← only set by createAgent() / seed.js, never by updateAgent()
    │  }
    │  returns result or document(s)
    ▼
agents.js  →  res.status(200).send(result)
    │  Role:      agents.js receives the result from agentsDb (connection.js) and
    │             converts it into an HTTP response that travels back across the network
    │             to the browser. res.status() sets the HTTP status code — 200 means
    │             success, 201 means "created", 404 means "not found", 500 means
    │             "server error." res.send() serializes the result (usually a JavaScript
    │             object or array) to a JSON string and writes it into the response body.
    │             Once connection.js returns from the records department, agents.js acts
    │             as the issuing officer, stamping the response with the right status
    │             code and sending it back through server.js to the frontend coworker.
    │  In:        The MongoDB result returned by agentsDb from connection.js — either an
    │             array of agent documents, a single agent document, or an operation result
    │             object depending on which route handler is responding.
    │  Out:       An HTTP response with a status code and a JSON body. This response
    │             travels back through Express, through server.js, over the network, and
    │             arrives at the fetch() call inside AgentList.jsx's getAgents() or
    │             deleteAgent(), or inside AgentForm.jsx's fetchData() or onSubmit().
    ▼
AgentList.jsx / AgentForm.jsx  [Page / View]
    │  Role:      The frontend component that initiated the request receives the response
    │             from agents.js and updates the application state to reflect the change.
    │  In:        The HTTP response from agents.js. The component calls response.json()
    │             to parse the JSON response body back into a JavaScript object or array.
    │  Out:       In AgentList.jsx after getAgents(): setAgents(agents) stores the array
    │             of agent documents in the agents[] state variable. React sees the state
    │             change and re-renders the component, replacing the empty table with
    │             populated rows — one AgentRow per document in the array.
    │             In AgentList.jsx after deleteAgent(): the deleted agent is filtered out
    │             of the local agents[] state array with agents.filter(el => el._id !== id).
    │             React re-renders and the deleted row disappears from the table instantly.
    │             In AgentForm.jsx after fetchData(): setForm(agent) pre-fills every input
    │             field with the agent's current database values.
    │             In AgentForm.jsx after onSubmit(): the form is reset to empty and
    │             navigate("/") sends the user back to AgentList.jsx, where the new or
    │             updated agent will now appear in the table.
    │  State:     AgentList.jsx: agents[] is updated by setAgents() with fresh data from
    │             the agents.js GET / response. AgentForm.jsx: form{} is pre-filled by
    │             setForm() with the agents.js GET /:id response in edit mode, then reset
    │             to empty fields after a successful submit.
    │  setAgents(data)  or  navigate("/")
    ▼
React re-renders the UI
```

---

## 4. Login Flow

A step-by-step trace of what happens when a user submits their credentials,
including every data transfer between the frontend, the backend, and the database.

```
Login.jsx  [Page / View]
    │  Role:      Login.jsx is the entry point of every session. It collects the user's
    │             credentials from a controlled form, sends them as a JSON POST request
    │             to users.js on the backend, and then routes the user based on whether
    │             the backend confirms the credentials or rejects them.
    │             Login.jsx is the front security desk: it gathers the visitor's claim
    │             and asks users.js to verify it against the organization's records.
    │  In:        The user types an email address and password into the two form inputs.
    │             Each keystroke calls updateForm(), which updates the form{ email, password }
    │             state object. When the user clicks "Login", the browser fires the form's
    │             submit event, which triggers onSubmit().
    │  Out:       onSubmit() calls e.preventDefault() to stop the browser from reloading
    │             the page (which is what a regular HTML form submit does). It then calls
    │             fetch() with method: "POST", headers: { "Content-Type": "application/json" },
    │             and body: JSON.stringify(form). This sends an HTTP POST request to
    │             http://localhost:5050/users/login. The Content-Type header tells the
    │             Express server that the body is JSON so express.json() can parse it.
    │             The body, once serialized, looks like: { "email": "user@rocket.elv",
    │             "password": "secret" }. This data travels over the local network from
    │             the browser at port 5173 to the Express server at port 5050.
    │  Functions: updateForm(value) merges a partial field update into form state.
    │             onSubmit(e) sends POST /users/login with credentials, then navigates
    │             to AgentList.jsx on 200 or Unauthorized.jsx on 401.
    │  Imports used: useState manages form{ email, password } state. useNavigate provides
    │             navigate() to redirect after the users.js response arrives.
    │  fetch("http://localhost:5050/users/login", { method: "POST", body: { email, password } })
    ▼
users.js  [Route Handler]  (POST /users/login)
    │  Role:      users.js is the only server-side file that Login.jsx talks to. It
    │             receives the credentials, queries the users database to verify them,
    │             and tells the frontend whether to proceed or turn back.
    │             users.js is the badge checker behind the front desk, using connection.js
    │             to look up the user record before approving or denying access.
    │  In:        The POST /login request arrives at server.js from Login.jsx. server.js
    │             runs it through express.json() middleware — which reads the raw request
    │             body string and parses it into a JavaScript object — and then delegates
    │             it to users.js. By the time it reaches users.js, req.body is:
    │             { email: "user@rocket.elv", password: "secret" }. req.body.email and
    │             req.body.password are the two values the user typed in Login.jsx.
    │  Out:       users.js calls usersDb.collection("users").findOne({ email: req.body.email })
    │             on the usersDb reference imported from connection.js. This sends a query
    │             to MongoDB Atlas to find a user document with a matching email field.
    │             ⚠ After receiving the result from Atlas, users.js compares req.body.password
    │             directly against the user.password field in the database document. This
    │             comparison uses === on plaintext strings — passwords are stored and
    │             compared without any hashing. This is a security vulnerability.
    │  Imports used: usersDb is the named export from connection.js pointing to the MongoDB
    │             "users" database. connection.js also exports agentsDb, but users.js
    │             never uses it — the login flow only touches the users database.
    │  usersDb.collection("users").findOne({ email })
    ▼
connection.js  [Database Connection]  (usersDb)
    │  Role:      connection.js executes the MongoDB lookup on behalf of users.js. It
    │             holds the persistent TCP connection to Atlas that was opened when
    │             server.js first imported connection.js at startup. users.js calls a
    │             method on the usersDb reference that connection.js exported, which
    │             sends the query over that persistent connection to Atlas.
    │             Here, connection.js switches to the users records line, carrying
    │             users.js's lookup to Atlas and returning the matching document or null.
    │  In:        users.js calls usersDb.collection("users").findOne({ email: req.body.email }).
    │             The filter { email: req.body.email } tells Atlas: "find one document in
    │             the 'users' collection where the email field equals this value." This
    │             is a simple equality lookup — the first matching document is returned.
    │  Out:       Atlas searches the "users" collection and returns either a full user
    │             document or null. A user document has the shape defined by user.schema.js:
    │             { _id: ObjectId("..."), first_name: string, last_name: string,
    │             email: string, password: string }. The password is stored as plaintext.
    │             This result travels back to users.js, which then checks the password.
    │  Export used: usersDb (the named export from connection.js) is the database reference
    │             users.js calls collection("users") on. agentsDb from connection.js is
    │             not involved in the login flow at any point.
    │
    ▼
MongoDB Atlas  (users database)
    │  Atlas executes the findOne({ email }) query against the "users" collection in
    │  the "users" database. If a document with that email exists, it returns the
    │  full document including the plaintext password field. If no document matches,
    │  it returns null. This result travels back to connection.js, then to users.js.
    │  returns user document or null
    ▼
users.js  →  200 "Login successful"  or  401 "Unauthorized"
    │  Role:      users.js evaluates the document returned by Atlas (via connection.js)
    │             and decides what HTTP status code to send back to Login.jsx.
    │  In:        The user document or null returned by Atlas through connection.js's
    │             usersDb reference. users.js uses this to run two checks.
    │  Out:       Check 1: if the returned value is null, no user with that email exists.
    │             users.js sends HTTP 401 with the body "Unauthorized: email not found".
    │             Login.jsx's fetch() receives this response, sees response.ok is false
    │             (because 401 is not a success code), and calls navigate("/unauthorized"),
    │             which renders Unauthorized.jsx.
    │             Check 2: if the document exists but user.password !== req.body.password,
    │             users.js sends HTTP 401 with "Unauthorized: incorrect password". Login.jsx
    │             again navigates to Unauthorized.jsx.
    │             Check 3: if both the email and password match, users.js calls
    │             jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET,
    │             { expiresIn: "24h" }) from the jsonwebtoken library. This creates a
    │             cryptographically signed token. The payload embeds the user's id and
    │             email. The signature is computed from the payload + JWT_SECRET — if
    │             anyone tampers with the payload, the signature check in auth.js will
    │             fail. users.js sends HTTP 200 with body { token: "eyJ..." }. Login.jsx's
    │             fetch() sees response.ok is true, extracts the token via response.json(),
    │             stores it with localStorage.setItem("token", token), and calls navigate("/"),
    │             which renders AgentList.jsx inside the App.jsx layout. AgentList.jsx then
    │             immediately reads the token from localStorage and attaches it to its
    │             first GET /agents fetch as Authorization: Bearer <token>.
    ▼
Login.jsx  [Page / View]
    │  Role:      Login.jsx receives the HTTP response from users.js and makes the final
    │             routing decision that determines what the user sees next.
    │  In:        The HTTP response from users.js POST /login. The response has a status
    │             code (200 or 401) and a body (success message or error string).
    │             Login.jsx checks response.ok — this is true for any 2xx status code
    │             and false for 4xx or 5xx codes.
    │  Out:       If response.ok is true (users.js returned 200): Login.jsx calls
    │             response.json() to parse the body, extracts the token string, and calls
    │             localStorage.setItem("token", token). The token is now stored in the
    │             browser's persistent key-value store — it will survive page refreshes
    │             and be readable by AgentList.jsx and AgentForm.jsx on every future
    │             /agents fetch via localStorage.getItem("token"). Login.jsx then calls
    │             navigate("/"). React Router renders AgentList.jsx inside App.jsx.
    │             AgentList.jsx mounts, its useEffect fires immediately, and getAgents()
    │             sends GET /agents with Authorization: Bearer <token> — the token that
    │             was just stored. auth.js on the server verifies it, and agents.js
    │             returns the agent data. The user sees the populated dashboard.
    │             If response.ok is false (users.js returned 401): no token is stored.
    │             navigate("/unauthorized") is called. React Router renders Unauthorized.jsx.
    │  Functions: useNavigate's navigate("/") sends the user to AgentList.jsx on success.
    │             navigate("/unauthorized") sends the user to Unauthorized.jsx on failure.
    │  on 200: localStorage.setItem("token") → navigate("/")
    └  on 401: navigate("/unauthorized")
```

---

## 5. Seed Script (one-time / manual)

How the initial agent data gets into MongoDB Atlas before the app is first used.
This flow bypasses the Express server entirely — it connects directly to Atlas.

```
config.env  [Environment Config]  (ATLAS_URI)
    │  Role:      config.env plays the same role here as it does for connection.js —
    │             it provides the Atlas connection string without exposing it in source
    │             code. The critical difference in this flow is that seed.js reads
    │             ATLAS_URI directly from process.env and opens its own MongoClient,
    │             bypassing connection.js entirely. This is correct behavior: seed.js
    │             is a standalone script that runs independently of the Express server,
    │             so it cannot and should not share connection.js's module-level client.
    │             In this manual flow, config.env hands seed.js a temporary key to the
    │             records department so the initial roster can be loaded without asking
    │             server.js or connection.js to participate.
    │  In:        The developer runs node --env-file=config.env seed.js manually in
    │             the terminal from inside the server/ folder. The --env-file flag causes
    │             Node to read config.env and inject all KEY=VALUE pairs into process.env
    │             before seed.js begins executing.
    │  Out:       ATLAS_URI is now available in process.env.ATLAS_URI, where seed.js
    │             reads it on the very next line to create its MongoClient instance.
    │             seed.js does not go through connection.js. It creates its own
    │             independent connection to the same Atlas cluster.
    │
    ▼
seed.js  [Seed Script]
    │  Role:      seed.js populates the "agents" collection in Atlas with an initial set
    │             of 16 real estate agents spread across four regions. It is designed to
    │             be run once before the app is first used, but it is safe to run multiple
    │             times because it checks whether each agent already exists before inserting.
    │             Running it twice will not create duplicates — this property is called
    │             idempotency. It connects to Atlas entirely independently of the Express
    │             server and does not import any route files, connection.js, or schemas.
    │             It is a self-contained utility script.
    │             seed.js is the onboarding coordinator for the organization: before
    │             normal office traffic begins, it makes sure Atlas already has the
    │             starter agent roster AgentList.jsx will later request.
    │
    │        SEED SCRIPT → DATABASE interaction:
    │        seed.js creates a new MongoClient using process.env.ATLAS_URI from config.env
    │        and calls client.connect() to open a direct TCP connection to Atlas. This
    │        connection is completely separate from the one connection.js manages for the
    │        running server. Once connected, seed.js accesses the "agents" collection in
    │        the "agents" database. It loops over the AGENTS array, and for each agent it
    │        calls collection.findOne({ email: agent.email }) to check whether a document
    │        with that email already exists. If Atlas returns null, the agent is new and
    │        seed.js calls collection.insertOne({ ...agent, sales: 0 }) to create the
    │        document. The { ...agent, sales: 0 } spread adds every field from the AGENTS
    │        array entry and then appends sales: 0 — exactly matching the shape that
    │        createAgent() from agent.schema.js would produce on a live POST /agents request.
    │        If Atlas returns an existing document, seed.js skips the insert and logs
    │        "Skipped". After the loop, client.close() runs in the finally block to release
    │        the Atlas connection whether or not any errors occurred.
    │
    │  In:        seed.js reads process.env.ATLAS_URI directly from config.env to open
    │             its own MongoClient connection. It also uses a hardcoded AGENTS constant
    │             — an array of 16 objects, each with the fields first_name, last_name,
    │             email, region, rating, and fee. These exact fields are what AgentForm.jsx
    │             collects and what agent.schema.js expects.
    │  Out:       Each agent that does not yet have a matching email in Atlas is inserted
    │             as a new document with sales: 0 appended, matching the document shape
    │             produced by createAgent() in agent.schema.js. After seeding, when
    │             AgentList.jsx mounts and calls getAgents(), agents.js will query Atlas
    │             and return all 16 of these documents, populating the dashboard table.
    │             The console logs "Inserted: [name]" for each new agent and "Skipped
    │             (already exists): [email]" for any that were already present, followed
    │             by a summary: "Done — X inserted, Y skipped."
    │  Imports:   MongoClient and ServerApiVersion are imported from 'mongodb'. seed.js
    │             does not import connection.js because connection.js is designed to be
    │             a long-lived module tied to the Express server's lifecycle. seed.js
    │             is a short-lived script that connects, does its work, and disconnects —
    │             opening and closing its own client is the correct pattern here.
    │  Exports:   seed.js exports nothing. It is a terminal script, not a reusable module.
    │             No other file in the project imports it.
    │  Functions: client.connect() opens a direct Atlas connection using process.env.ATLAS_URI
    │             from config.env. This is independent from connection.js's client.
    │             collection.findOne({ email: agent.email }) queries Atlas to check if a
    │             document with that email already exists. It uses the same email field
    │             that agent.schema.js enforces on every agent document written via the API.
    │             collection.insertOne({ ...agent, sales: 0 }) creates the agent document
    │             in Atlas, spreading all fields from the AGENTS array entry and appending
    │             sales: 0. This produces the exact same document shape that createAgent()
    │             from agent.schema.js generates for a live POST /agents API request.
    │             client.close() in the finally block ensures the Atlas connection is always
    │             released — even if an error occurs during the loop — preventing connection leaks.
    │  connects directly to MongoDB Atlas (bypasses Express entirely)
    │  checks each agent by email before inserting
    └──► MongoDB Atlas  (agents database, agents collection)
```

---

## Section 6: Reference Tables

Quick-lookup tables for every route, endpoint, state variable, status code, and
MongoDB operation in the project. Use these when you need to answer "where does X come
from?" or "what does Y return?" without re-reading the full flow sections.

### 6a. Client-Side Route Table

| URL Path | Component Rendered | Layout | Reached From |
|---|---|---|---|
| / | AgentList.jsx | App.jsx (has Navbar) | Login 200 response, AgentForm submit, Navbar logo |
| /create | AgentForm.jsx (create mode) | App.jsx (has Navbar) | Navbar "Create Agent" NavLink |
| /edit/:id | AgentForm.jsx (edit mode) | App.jsx (has Navbar) | AgentList Edit Link with agent's _id |
| /login | Login.jsx | standalone (no Navbar) | App initial load, Navbar logout(), Unauthorized "Back to Login" |
| /unauthorized | Unauthorized.jsx | standalone (no Navbar) | Login.jsx navigate("/unauthorized") on 401 |

### 6b. API Endpoint Table

| Method | Path | Called By | Request Body | Response Body | Status Codes |
|---|---|---|---|---|---|
| GET | /agents | AgentList getAgents() | none | array of agent objects: [{_id,first_name,last_name,email,region,rating,fee,sales}] | 200, 500 |
| GET | /agents/:id | AgentForm fetchData() | none | single agent object | 200, 404, 500 |
| POST | /agents | AgentForm onSubmit (isNew=true) | {first_name,last_name,email,region,rating,fee} | {acknowledged:true, insertedId:ObjectId} | 201, 500 |
| PATCH | /agents/:id | AgentForm onSubmit (isNew=false) | {first_name,last_name,email,region,rating,fee} | {acknowledged:true,matchedCount:1,modifiedCount:1} | 200, 500 |
| DELETE | /agents/:id | AgentList deleteAgent() | none | {acknowledged:true,deletedCount:1} | 200, 500 |
| POST | /users/login | Login onSubmit() | {email,password} | {token:"eyJ..."} on success, plain error string on failure | 200, 401, 500 |

### 6c. Navigation Map

| Current Page | User Action | Destination | Mechanism |
|---|---|---|---|
| Login | Submit valid credentials | AgentList (/) | navigate("/") in onSubmit after 200 |
| Login | Submit invalid credentials | Unauthorized | navigate("/unauthorized") in onSubmit after 401 |
| Unauthorized | "Back to Login" click | Login | Link to="/login" |
| AgentList (/) | Logout button | Login | Navbar logout() → navigate("/login") |
| AgentList (/) | Logo click | AgentList (/) | Navbar NavLink to="/" |
| AgentList (/) | "Create Agent" click | AgentForm (create) | Navbar NavLink to="/create" |
| AgentList (/) | Edit button on a row | AgentForm (edit) | Link to={`/edit/${agent._id}`} |
| AgentForm (create) | Submit form | AgentList (/) | navigate("/") in finally block |
| AgentForm (edit) | Submit form | AgentList (/) | navigate("/") in finally block |

### 6d. State Variables by Component

| Component | Variable | Type | Initial Value | Updated By | Consumed By |
|---|---|---|---|---|---|
| AgentList | agents[] | array | [] | setAgents() inside getAgents() | agentList() renders rows; deleteAgent() filters it |
| AgentForm | form{} | object | {first_name:"",last_name:"",email:"",region:"",rating:"",fee:""} | setForm() in fetchData() (edit); updateForm() on each keystroke | onSubmit() sends it as request body |
| AgentForm | isNew | boolean | true | setIsNew(false) in fetchData() when :id found | onSubmit() decides POST vs PATCH |
| Login | form{} | object | {email:"",password:""} | updateForm() on each keystroke | onSubmit() sends it as request body |
| localStorage | token | string | not set | localStorage.setItem("token") in Login onSubmit on 200 | localStorage.getItem("token") in AgentList getAgents(), AgentList deleteAgent(), AgentForm fetchData(), AgentForm onSubmit(); localStorage.removeItem("token") in Navbar logout() |

### 6e. HTTP Status Codes Used in This Project

| Code | Meaning | When Used | Sent By | Received By |
|---|---|---|---|---|
| 200 | OK — request succeeded | Successful GET, PATCH, DELETE, successful login | agents.js, users.js | AgentList, AgentForm, Login |
| 201 | Created — resource was created | Successful POST (new agent inserted) | agents.js | AgentForm |
| 401 | Unauthorized — credentials rejected or token missing/invalid | Wrong email or password; missing/expired/tampered JWT | users.js (credential check), auth.js (token check) | Login (credential 401), AgentList/AgentForm (token 401) |
| 404 | Not Found — resource doesn't exist | Agent _id not found in Atlas | agents.js | AgentForm |
| 500 | Internal Server Error | Any unhandled database error (caught by catch block) | agents.js, users.js | AgentList, AgentForm, Login (all log to console only) |

### 6f. MongoDB Operations Used

| Operation | Method Called | When Called | In File | What It Does |
|---|---|---|---|---|
| Read all | find({}).toArray() | GET /agents | agents.js | Returns cursor of all documents; .toArray() collects into array |
| Read one | findOne({_id:ObjectId(id)}) | GET /agents/:id | agents.js | Returns first matching document or null |
| Create | insertOne(doc) | POST /agents | agents.js | Inserts doc, Atlas auto-assigns _id, returns {acknowledged,insertedId} |
| Update fields | updateOne(query,{$set:doc}) | PATCH /agents/:id | agents.js | Updates only listed fields via $set, leaves other fields unchanged |
| Delete | deleteOne({_id:ObjectId(id)}) | DELETE /agents/:id | agents.js | Removes the matching document, returns {acknowledged,deletedCount} |
| Find user | findOne({email}) | POST /users/login | users.js | Returns user document by email or null |

---

## Section 7: Complete Data Lifecycle

The complete journey of a single agent document — from the moment seed.js inserts it
into Atlas, through every operation that reads and modifies it, to the moment it is
deleted. Each step names every file involved and shows the exact data shape at that
point in the journey.

Read this lifecycle as one case file moving through the organization. seed.js opens
the file, MongoDB Atlas stores it, AgentList.jsx requests it for display, AgentForm.jsx
revises it, agent.schema.js reviews the revision, agents.js authorizes each records
operation, connection.js carries the database messages, and server.js keeps every
frontend/backend handoff moving through the correct channel.

### Step 1: seed.js inserts the document

seed.js reads ATLAS_URI from config.env via process.env, opens its own MongoClient
(independent from connection.js), and calls client.connect() to establish a direct TCP
connection to Atlas.

As coworkers, config.env gives seed.js the temporary key, and seed.js walks directly
to Atlas to open the initial case file before the regular Express office starts work.

For each agent in the AGENTS array, seed.js calls:

```javascript
collection.insertOne({ ...agent, sales: 0 })
```

The spread operator copies every field from the AGENTS entry. sales: 0 is appended.
Atlas receives the insert, auto-assigns a unique _id (BSON ObjectId), and stores the
document. The document now exists in Atlas in this shape:

```json
{
  "_id": ObjectId("64a1f2e3b4c5d6e7f8a9b0c1"),
  "first_name": "Orlando",
  "last_name": "Perez",
  "email": "perez@rocket.elv",
  "region": "North",
  "rating": 95,
  "fee": 10000,
  "sales": 0
}
```

Files involved: config.env (provides ATLAS_URI), seed.js (runs the insert), MongoDB Atlas
(stores the document and assigns _id). Note: connection.js is NOT used here — seed.js
has its own MongoClient.

### Step 2: AgentList.jsx mounts — the document appears in the table

When the user navigates to /, React Router renders AgentList.jsx inside App.jsx.
AgentList.jsx's useEffect fires immediately after the first render and calls getAgents().

Now AgentList.jsx takes its place at the front desk. It asks server.js to route a roster
request to agents.js, and agents.js asks connection.js to retrieve the official records
from Atlas.

getAgents() calls:

```javascript
fetch("http://localhost:5050/agents/")
```

The request travels from the browser (port 5173) to server.js (port 5050). server.js
passes it through cors() and express.json() middleware, then delegates to agents.js
GET / handler.

agents.js calls:

```javascript
await agentsDb.collection("agents").find({}).toArray()
```

agentsDb (from connection.js) sends the find query over the persistent TCP connection
to Atlas. Atlas returns an array of all agent documents including the one seeded above.
agents.js calls res.send(results), serializing the array to JSON. The response travels
back to the browser.

getAgents() receives the response, calls response.json(), and calls setAgents(data).
React re-renders AgentList.jsx. agentList() maps over agents[] and returns one AgentRow
per document. The seeded agent now appears as a table row.

Data shape at this point (inside agents[] state in AgentList.jsx):

```json
[
  { "_id": "64a1f2e3b4c5d6e7f8a9b0c1", "first_name": "Orlando", "last_name": "Perez",
    "email": "perez@rocket.elv", "region": "North", "rating": 95, "fee": 10000, "sales": 0 }
]
```

Note: _id is now a plain string — JSON.stringify on the server serialized ObjectId to a
string automatically.

Files involved: AgentList.jsx (sends fetch, calls setAgents), server.js (routes request),
agents.js (GET / handler, calls agentsDb), connection.js (exports agentsDb), MongoDB Atlas
(executes find, returns array).

### Step 3: User clicks Edit — the form is pre-filled

The user clicks the Edit button on Orlando's row. AgentList.jsx rendered that button as:

```jsx
<Link to={`/edit/${props.agent._id}`}>Edit</Link>
```

React Router updates the URL to /edit/64a1f2e3b4c5d6e7f8a9b0c1 (the plain string _id).
App.jsx's Outlet renders AgentForm.jsx. AgentForm.jsx mounts and its useEffect fires,
calling fetchData(). fetchData() reads params.id via useParams() — it gets the string
"64a1f2e3b4c5d6e7f8a9b0c1".

This is the handoff from AgentList.jsx to AgentForm.jsx: the records clerk points the
intake specialist to one exact case file by placing the _id in the URL.

fetchData() calls:

```javascript
fetch(`http://localhost:5050/agents/64a1f2e3b4c5d6e7f8a9b0c1`)
```

server.js routes to agents.js GET /:id. agents.js receives req.params.id as the string
"64a1f2e3b4c5d6e7f8a9b0c1" and converts it:

```javascript
const query = { _id: new ObjectId(req.params.id) }
const agent = await agentsDb.collection("agents").findOne(query)
```

Atlas executes findOne with the BSON ObjectId filter, finds the matching document, and
returns it. agents.js sends the document as JSON with status 200.

fetchData() receives the document, calls setForm(agent) (pre-filling all six inputs)
and setIsNew(false) (switching to edit mode).

Data shape at this point (inside form{} state in AgentForm.jsx):

```json
{
  "first_name": "Orlando",
  "last_name": "Perez",
  "email": "perez@rocket.elv",
  "region": "North",
  "rating": 95,
  "fee": 10000
}
```

Note: sales is not in form{} — AgentForm.jsx never renders a sales input, and
updateAgent() in agent.schema.js deliberately excludes it.

Files involved: AgentList.jsx (Link with _id in URL), React Router (URL change),
AgentForm.jsx (fetchData, setForm, setIsNew), server.js (routes request),
agents.js (GET /:id handler), connection.js (exports agentsDb), MongoDB Atlas
(executes findOne, returns document).

### Step 4: User changes the rating

The user clicks into the "Rating" input and changes the value from 95 to 97. Each
keystroke calls updateForm() in AgentForm.jsx:

```javascript
updateForm({ rating: "97" })
```

updateForm() merges the change into form{} state using the spread operator:

```javascript
setForm((prev) => ({ ...prev, rating: "97" }))
```

form.rating is now the string "97". Note: it is a string, not a number — HTML input
elements always produce strings. This will be corrected by agent.schema.js in the
next step.

At this moment, AgentForm.jsx is still working at its own desk. No backend coworker
has been contacted yet; the draft revision is only local form state.

Files involved: AgentForm.jsx only (no network calls, no server, no database).

### Step 5: User submits — PATCH request updates the document in Atlas

The user clicks "Save" (or whatever the submit button is labeled). AgentForm.jsx's
onSubmit() fires. e.preventDefault() stops the browser from reloading.

Submitting the form moves the draft from AgentForm.jsx to the backend organization:
server.js receives it, agents.js owns the agent request, agent.schema.js checks the
fields, connection.js carries the approved update, and Atlas files the change.

isNew is false (set by fetchData() in Step 3), so onSubmit() sends a PATCH:

```javascript
fetch(`http://localhost:5050/agents/64a1f2e3b4c5d6e7f8a9b0c1`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(form)
})
```

The JSON body sent to the server:

```json
{
  "first_name": "Orlando",
  "last_name": "Perez",
  "email": "perez@rocket.elv",
  "region": "North",
  "rating": "97",
  "fee": "10000"
}
```

server.js receives the request, express.json() parses the body into req.body, and the
request is delegated to agents.js PATCH /:id.

agents.js calls updateAgent(req.body) from agent.schema.js. agent.schema.js:

```javascript
export function updateAgent({ first_name, last_name, email, region, rating, fee }) {
  return { first_name, last_name, email, region, rating: Number(rating), fee: Number(fee) }
}
```

The shaped document returned to agents.js:

```json
{
  "first_name": "Orlando",
  "last_name": "Perez",
  "email": "perez@rocket.elv",
  "region": "North",
  "rating": 97,
  "fee": 10000
}
```

rating is now the number 97 (not the string "97"). sales is absent — it was never in
form{} and updateAgent() does not include it.

agents.js wraps this in $set and calls:

```javascript
await agentsDb.collection("agents").updateOne(
  { _id: new ObjectId(req.params.id) },
  { $set: updates }
)
```

Atlas updates only the fields listed in $set. The sales field in the stored document
remains 0 — it was not in $set, so it is untouched. Atlas returns
{ acknowledged: true, matchedCount: 1, modifiedCount: 1 }.

agents.js sends that result with status 200. onSubmit()'s try block completes. The
finally block runs regardless: setForm({...}) resets the form to empty, and
navigate("/") sends the user back to AgentList.jsx.

Files involved: AgentForm.jsx (onSubmit, finally block), server.js (middleware + routing),
agents.js (PATCH /:id handler), agent.schema.js (updateAgent), connection.js (exports agentsDb),
MongoDB Atlas (executes updateOne with $set, preserves sales).

### Step 6: AgentList.jsx re-mounts with the updated data

navigate("/") causes React Router to render AgentList.jsx again inside App.jsx.
AgentList.jsx mounts fresh — its useEffect fires and calls getAgents() again.

After AgentForm.jsx finishes the paperwork, it sends the user back to AgentList.jsx,
which asks the organization for a fresh roster rather than relying only on memory.

The cycle from Step 2 repeats: fetch GET /agents → server.js → agents.js →
agentsDb.find({}).toArray() → Atlas returns the updated array. Now Orlando's document
has rating: 97 instead of 95.

setAgents(data) updates state with the fresh array. React re-renders the table.
The updated rating appears in Orlando's row.

Files involved: AgentForm.jsx (navigate), React Router (URL change), AgentList.jsx
(useEffect, getAgents, setAgents), server.js, agents.js, connection.js, MongoDB Atlas.

### Step 7: User clicks Delete — the document is removed

The user clicks the Delete button on Orlando's row. AgentList.jsx's deleteAgent()
fires with id = "64a1f2e3b4c5d6e7f8a9b0c1".

For deletion, AgentList.jsx initiates the removal request, agents.js authorizes the
records operation, connection.js carries the delete command, and Atlas permanently
removes the case file.

deleteAgent() calls:

```javascript
fetch(`http://localhost:5050/agents/64a1f2e3b4c5d6e7f8a9b0c1`, { method: "DELETE" })
```

server.js routes to agents.js DELETE /:id. agents.js calls:

```javascript
await agentsDb.collection("agents").deleteOne({ _id: new ObjectId(req.params.id) })
```

Atlas finds the document by ObjectId and removes it. Atlas returns
{ acknowledged: true, deletedCount: 1 }. agents.js sends that with status 200.

deleteAgent() receives the 200 response and immediately performs an optimistic update:

```javascript
const updatedAgents = agents.filter((el) => el._id !== id)
setAgents(updatedAgents)
```

.filter() creates a new array without Orlando's entry. setAgents() replaces agents[]
state with this new array. React re-renders — Orlando's row is gone. agents[] now has
one fewer element, so its length decreases from 16 to 15.

agents.length changed, so useEffect([agents.length]) fires again. getAgents() sends
another GET /agents. Atlas confirms the document is gone — it is not in the returned
array. setAgents() updates state with the confirmed array. The table re-renders once
more with the definitive server-side state, confirming the deletion is permanent.

Files involved: AgentList.jsx (deleteAgent, .filter(), setAgents, useEffect
re-trigger, getAgents), server.js, agents.js (DELETE /:id handler), connection.js
(exports agentsDb), MongoDB Atlas (executes deleteOne, document is permanently removed).

The document's lifecycle is complete: seeded by seed.js, read by AgentList.jsx,
fetched individually by AgentForm.jsx, updated via PATCH through agent.schema.js,
and finally deleted by AgentList.jsx — each step passing through the full
frontend → backend → database stack.

As an organization, the files complete their common goal by never overstepping their
roles: frontend coworkers collect intent, server coworkers validate and route work,
connection.js carries official records traffic, and MongoDB Atlas remains the permanent
source of truth.
