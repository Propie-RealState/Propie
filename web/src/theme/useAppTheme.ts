import { useAuth } from "../context/AuthContext";
import { useRegisterOptional } from "../context/RegisterContext";
import { getAppTheme, isAgentRole, type AppTheme } from "./app-theme";

export function useAppTheme(): AppTheme {
  const { user } = useAuth();
  const register = useRegisterOptional();

  const agent = isAgentRole(user?.role ?? register?.data.role ?? null);

  return getAppTheme(agent);
}

export function useIsAgent(): boolean {
  const { user } = useAuth();
  const register = useRegisterOptional();

  return isAgentRole(user?.role ?? register?.data.role ?? null);
}
