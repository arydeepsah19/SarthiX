import { useAuth, useUser } from "@clerk/clerk-react";
import { useRoleCheck } from "./useRoleCheck";
import { useUserSync } from "./useUserSync";
import DriverApp from "../modules/driver/DriverApp";
import ShipperApp from "../modules/shipper/CompanyApp";
import RoleSelect from "../components/RoleSelect";

function AuthGate() {
  const { isLoaded } = useUser();
  const { getToken } = useAuth();
  const { syncUser, isSyncing } = useUserSync();
  const { role, loading, setRole } = useRoleCheck();
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleRoleSelect = async (selectedRole) => {
    await syncUser();

    const token = await getToken();
    const response = await fetch(`${apiUrl}/api/users/set-role`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role: selectedRole }),
    });

    if (!response.ok) {
      throw new Error(`Role update failed with status ${response.status}`);
    }

    const data = await response.json();
    setRole(data.role ?? selectedRole);
  };

  if (!isLoaded || loading || isSyncing) {
    return (
      <div style={{ color: "#f97316", textAlign: "center" }}>
        Loading dashboard...
      </div>
    );
  }

  if (!role) {
    return <RoleSelect onSelect={handleRoleSelect} />;
  }

  if (role === "driver") {
    return <DriverApp />;
  }

  if (role === "company") {
    return <ShipperApp />;
  }

  return null;
}

export default AuthGate;
