import { useAuthStore } from "../store/auth-store";


export function useAuth() {
  const session = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => !s.isInitialized);
  const setSession = useAuthStore((s) => s.setUser);

  return { session, isAuthenticated, isLoading, setSession };
}