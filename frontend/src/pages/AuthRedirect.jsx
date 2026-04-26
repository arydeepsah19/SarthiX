import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

export default function AuthRedirect() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      navigate("/login");
      return;
    }
    // Just push to /dashboard — AuthGate handles role logic
    navigate("/dashboard", { replace: true });
  }, [isLoaded, isSignedIn, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060b14",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Orbitron', sans-serif",
        color: "#f97316",
        fontSize: 12,
        letterSpacing: "0.2em",
      }}
    >
      AUTHENTICATING...
    </div>
  );
}
