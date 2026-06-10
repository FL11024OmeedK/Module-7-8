// useTokenValidation.js
// Custom hook that checks the session_token cookie on every page mount.
// If the token is missing or invalid, the user is redirected to /login.
// If valid, returns the user object { first_name, last_name, id } for use in the UI.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useCookie from "react-use-cookie";

export default function useTokenValidation() {
  const navigate = useNavigate();
  const [sessionToken] = useCookie("session_token", "");
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function validate() {
      // No cookie at all — send to login immediately.
      if (!sessionToken) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5050/validate_token?token=${sessionToken}`
        );
        const { data } = await response.json();

        if (!data.valid) {
          navigate("/login");
        } else {
          // Store the user info so the calling component can use it (e.g. show first_name).
          setUser(data.user);
        }
      } catch {
        navigate("/login");
      }
    }

    validate();
  }, [sessionToken, navigate]);

  return user;
}
