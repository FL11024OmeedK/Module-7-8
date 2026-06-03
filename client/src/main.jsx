// main.jsx
// The entry point of the React app.
// Sets up all routes using React Router and mounts the app into the DOM.
//
// Route structure:
//   /login          → Login page (standalone, no Navbar)
//   /unauthorized   → Unauthorized page (standalone, no Navbar)
//   /               → App layout (Navbar + agent list)
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
import Login from "./components/Login";
import Unauthorized from "./components/Unauthorized";
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
      { index: true, element: <AgentList /> },
      { path: "create", element: <AgentForm /> },
      { path: "edit/:id", element: <AgentForm /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);