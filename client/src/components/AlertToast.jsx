import { Toast, ToastContainer } from "react-bootstrap";
import { useAlert } from "../context/AlertContext";

export default function AlertToast() {
  const { show, setShow, message, variant } = useAlert();

  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
      <Toast
        show={show}
        onClose={() => setShow(false)}
        delay={5000}
        autohide
        bg={variant}
      >
        <Toast.Header>
          <strong className="me-auto">
            {variant === "success" ? "Success" : "Error"}
          </strong>
        </Toast.Header>
        <Toast.Body className="text-white">{message}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
}
