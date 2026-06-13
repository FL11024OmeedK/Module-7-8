// Navbar.jsx
// The top navigation bar shown on all main app pages.
// It is NOT shown on the Login or Unauthorized pages — those are standalone routes.
// Contains: the Rocket Elevators logo (links to home), logged-in user's first name, and Logout button.
// M8: Create Agent moved to the AgentList component. Logout now deletes the session cookie.

import { NavLink, useNavigate } from "react-router-dom";
import useCookiePkg from "react-use-cookie";
const useCookie = useCookiePkg.default ?? useCookiePkg;
import useTokenValidation from "../hooks/useTokenValidation";

export default function Navbar() {
  const navigate = useNavigate();
  const [, , deleteSessionToken] = useCookie("session_token", "");

  // useTokenValidation checks the session on every render and returns the logged-in user.
  const user = useTokenValidation();

  // logout deletes the session cookie and returns the user to the login page.
  function logout() {
    deleteSessionToken();
    navigate("/login");
  }

  return (
    <div>
      <nav className="flex justify-between items-center mb-6">

        {/* Logo — clicking it navigates back to the home dashboard */}
        <NavLink to="/">
          <img alt="Rocket Elevators logo" className="h-10 inline" src="/rocketLogo.png" />
        </NavLink>

        <div className="flex items-center gap-4">
          {/* Display the logged-in user's first name */}
          {user?.first_name && (
            <span className="text-sm text-slate-600">Hello, {user.first_name}</span>
          )}

          {/* Logout — deletes the session cookie and returns to login */}
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
