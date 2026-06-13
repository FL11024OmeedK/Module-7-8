import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import useCookiePkg from "react-use-cookie";
const useCookie = useCookiePkg.default ?? useCookiePkg;

export default function useTokenValidation() {
  const navigate = useNavigate();
  const [sessionToken] = useCookie("session_token", "");
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function validate() {
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
