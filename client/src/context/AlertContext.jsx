import { createContext, useContext, useState } from "react";

// AlertContext is the shared "container" — any component can read from it.
export const AlertContext = createContext();

// AlertProvider wraps the app and owns the toast state.
// Any component inside it can call showAlert(message, variant) to trigger a toast.
export function AlertProvider({ children }) {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success");

  function showAlert(message, variant) {
    setMessage(message);
    setVariant(variant);
    setShow(true);
  }

  return (
    <AlertContext.Provider value={{ show, setShow, message, variant, showAlert }}>
      {children}
    </AlertContext.Provider>
  );
}

// useAlert is a convenience hook so components don't have to import both
// useContext and AlertContext — they just call useAlert().
export function useAlert() {
  return useContext(AlertContext);
}
