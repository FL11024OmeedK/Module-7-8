// Unauthorized.jsx
// This page is shown when a login attempt fails —
// either the email was not found or the password was incorrect.
// It is a standalone page with no Navbar (does not use the App layout).

import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md border rounded-lg p-8 text-center">

        {/* Rocket Elevators logo */}
        <div className="flex justify-center mb-6">
          <img src="/rocketLogo.png" alt="Rocket Elevators logo" className="h-12" />
        </div>

        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          Access Denied
        </h2>

        <p className="text-sm text-slate-600 mb-6">
          Your credentials were not recognized. Please check your email and password and try again.
        </p>

        {/* Link back to the login page */}
        <Link
          to="/login"
          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-slate-100 h-9 rounded-md px-3"
        >
          Back to Login
        </Link>

      </div>
    </div>
  );
}
