// main.jsx
// The entry point of the React app.
// Sets up all routes using React Router and mounts the app into the DOM.
//
// Route structure:
//   /login          → Login page (standalone, no Navbar)
//   /unauthorized   → Unauthorized page (standalone, no Navbar)
//   /               → App layout (Navbar + dashboard home page)   [M8]
//   /agents         → App layout (Navbar + agent table)           [M8]
//   /transactions   → App layout (Navbar + transactions page)     [M8]
//   /create         → App layout (Navbar + create form)
//   /edit/:id       → App layout (Navbar + edit form)

import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import App from "./App";
import AgentForm from "./components/AgentForm";
import AgentList from "./components/AgentList";
import HomePage from "./components/HomePage";
import Login from "./components/Login";
import Unauthorized from "./components/Unauthorized";

// Bootstrap CSS — imported once here, before index.css so Tailwind/custom styles can override it.
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

const router = createBrowserRouter([
  // Standalone pages — no App layout, no Navbar.
  { path: "/login", element: <Login /> },
  { path: "/unauthorized", element: <Unauthorized /> },

  // Main app pages — all share the App layout (Navbar + Outlet).
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "agents", element: <AgentList /> },
      { path: "transactions", element: <div className="mt-4"><h2>Transactions</h2><p>Coming in Feature 7.</p></div> },
      { path: "create", element: <AgentForm /> },
      { path: "edit/:id", element: <AgentForm /> },
    ],
  },
]);

// Finds the <div id="root"></div> from index.html and tells React to control it.
ReactDOM.createRoot(document.getElementById("root")).render(
  // StrictMode helps catch React problems during development.
  <React.StrictMode>
    {/* RouterProvider renders the correct page based on the current URL. */}
    <RouterProvider router={router} />
  </React.StrictMode>
);
