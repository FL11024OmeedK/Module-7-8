// Navbar.jsx
// The top navigation bar shown on all main app pages (agent list, create, edit).
// It is NOT shown on the Login or Unauthorized pages — those are standalone routes.
// Contains: the Rocket Elevators logo (links to home), Create Agent button, and Logout button.

import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  // useNavigate allows the Logout button to redirect programmatically.
  const navigate = useNavigate();

  // logout clears the JWT from localStorage and returns the user to the login page.
  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div>
      <nav className="flex justify-between items-center mb-6">

        {/* Logo — clicking it navigates back to the home page (agent list) */}
        <NavLink to="/">
          <img alt="Rocket Elevators logo" className="h-10 inline" src="/rocketLogo.png" />
        </NavLink>

        <div className="flex gap-2">
          {/* Create Agent — navigates to the create form */}
          <NavLink
            className="inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 h-9 rounded-md px-3"
            to="/create"
          >
            Create Agent
          </NavLink>

          {/* Logout — returns the user to the login page */}
          <button
            onClick={logout}
            className="inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 h-9 rounded-md px-3"
          >
            Logout
          </button>
        </div>

      </nav>
    </div>
  );
}