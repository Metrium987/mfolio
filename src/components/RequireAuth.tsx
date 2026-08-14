import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/auth?returnTo=${encodeURIComponent(returnTo)}`}
        replace
      />
    );
  }

  // Owner-only area: a signed-in non-owner (e.g. an account created through
  // the public email-code flow) must not reach the dashboard. The backend
  // gates every sensitive function on the admin role as well — this is the
  // UI-level mirror so non-owners aren't shown a broken dashboard.
  if (user && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
