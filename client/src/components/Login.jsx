// Login.jsx
// This is the login page for RE Admin.
// It renders a standalone form — it does NOT use the App layout (no Navbar).
// It collects email and password, sends them to the backend for validation,
// and navigates the user based on whether the login succeeds or fails.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCookiePkg from "react-use-cookie";
const useCookie = useCookiePkg.default ?? useCookiePkg;
import AlertToast from "./AlertToast";
import { useAlert } from "../context/AlertContext";

export default function Login() {
  // Form state holds the two fields the user types into.
  const [form, setForm] = useState({ email: "", password: "" });

  // useNavigate lets us programmatically redirect the user after login.
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  // useCookie returns [value, setValue, deleteValue] for the named cookie.
  const [sessionToken, setSessionToken] = useCookie("session_token", "");

  // If the user already has a valid session, skip the login page and go straight home.
  useEffect(() => {
    if (!sessionToken) return;
    fetch(`http://localhost:5050/validate_token?token=${sessionToken}`)
      .then((res) => res.json())
      .then(({ data }) => { if (data.valid) navigate("/"); })
      .catch(() => {});
  }, [sessionToken, navigate]);

  // updateForm merges a partial update into the form state.
  // Same pattern used in AgentForm.jsx — keeps all fields in one state object.
  function updateForm(value) {
    return setForm((prev) => ({ ...prev, ...value }));
  }

  // onSubmit fires when the user clicks the Login button.
  // It sends the credentials to the backend and navigates based on the response.
  async function onSubmit(e) {
    e.preventDefault(); // Prevents the browser from reloading the page on submit.

    const response = await fetch("http://localhost:5050/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (response.ok) {
      const { token, user } = await response.json();
      // Persist JWT so /agents (M7 JWT-protected route) stays authorized after login.
      localStorage.setItem("token", token);

      // Create a session in MongoDB and get back a UUID token.
      const sessionRes = await fetch(`http://localhost:5050/session/${user._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name: user.first_name, last_name: user.last_name }),
      });
      const sessionData = await sessionRes.json();

      // Store the UUID token in a cookie — expires with the browser session by default.
      // MongoDB TTL enforces the 24h server-side expiry.
      setSessionToken(sessionData.data.token);
      navigate("/");
    } else {
      showAlert("Invalid email or password.", "danger");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <AlertToast />
      <div className="w-full max-w-md border rounded-lg p-8">

        {/* Rocket Elevators logo at the top of the login box */}
        <div className="flex justify-center mb-6">
          <img src="/rocketLogo.png" alt="Rocket Elevators logo" className="h-12" />
        </div>

        <h2 className="text-xl font-semibold text-slate-900 mb-6 text-center">
          Sign in to RE Admin
        </h2>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">

          {/* Email field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-slate-900">
              Email
            </label>
            <div className="mt-2">
              <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-slate-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                <input
                  type="text"
                  id="email"
                  name="email"
                  className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={(e) => updateForm({ email: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Password field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-slate-900">
              Password
            </label>
            <div className="mt-2">
              <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-slate-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => updateForm({ password: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Submit button */}
          <input
            type="submit"
            value="Login"
            className="inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 hover:text-accent-foreground h-9 rounded-md px-3 cursor-pointer mt-2"
          />
        </form>
      </div>
    </div>
  );
}
