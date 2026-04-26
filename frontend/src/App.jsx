import { Routes, Route, Navigate } from "react-router-dom";
import {
  useUser,
  AuthenticateWithRedirectCallback,
  UserProfile,
} from "@clerk/clerk-react";
import Home from "./pages/Home";
import LoginPage from "./pages/Login";
import SignUp from "./pages/SignUp";
import AuthGate from "./hooks/AuthGate";
import { useUserSync } from "./hooks/useUserSync";

function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useUser();
  if (!isLoaded) {
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
        LOADING...
      </div>
    );
  }
  if (!isSignedIn) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  useUserSync();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login/*" element={<LoginPage />} />
      <Route path="/signup/*" element={<SignUp />} />
      <Route
        path="/sso-callback"
        element={
          <AuthenticateWithRedirectCallback
            signInForceRedirectUrl="/dashboard"
            signUpForceRedirectUrl="/dashboard"
          />
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AuthGate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/*"
        element={
          <ProtectedRoute>
            <div
              style={{
                minHeight: "100vh",
                background: "#060b14",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "32px 16px",
              }}
            >
              <UserProfile routing="path" path="/profile" />
            </div>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
