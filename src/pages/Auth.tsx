import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAuth } from "@/hooks/use-auth";
import { APP_NAME } from "@/lib/site";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

// Provision the default owner account once per page load.
let adminEnsured = false;

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const ensureAdmin = useAction(api.ensureAdmin.ensureAdmin);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  useEffect(() => {
    if (adminEnsured) return;
    adminEnsured = true;
    void ensureAdmin();
  }, [ensureAdmin]);

  const handlePasswordSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      formData.set("flow", "signIn");
      await signIn("password", formData);
      navigate(redirect);
    } catch (error) {
      console.error("Password sign-in error:", error);
      setError("Email ou mot de passe incorrect.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Always-visible way back to the public site */}
      <div className="flex w-full items-center justify-between px-5 py-5 sm:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Retour au site
        </Link>
        <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {APP_NAME}
        </span>
      </div>

      {/* Auth Content */}
      <div className="flex flex-1 items-center justify-center px-5">
        <Card className="w-full max-w-[420px] border-border pb-0 shadow-[0_1px_0_rgba(0,0,0,0.02),0_24px_48px_-32px_rgba(28,25,21,0.25)]">
          <CardHeader className="text-center">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mx-auto mb-5 mt-2 font-display text-3xl font-medium tracking-tight text-foreground transition-opacity hover:opacity-70"
            >
              {APP_NAME}
            </button>
            <p className="kicker mb-3">Espace propriétaire</p>
            <CardTitle className="text-xl font-medium tracking-tight">
              Connexion
            </CardTitle>
            <CardDescription>
              Connectez-vous avec votre email et votre mot de passe.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handlePasswordSubmit}>
            <div className="px-6 pb-2">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-[13px]">
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="vous@exemple.fr"
                    autoComplete="email"
                    required
                    disabled={isLoading}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="login-password" className="text-[13px]">
                    Mot de passe
                  </Label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    disabled={isLoading}
                    className="bg-background"
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button
                  type="submit"
                  className="w-full rounded-full"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
                  Se connecter
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-4 rounded-b-lg border-t border-border bg-muted px-6 py-4 text-center text-xs text-muted-foreground">
            Accès réservé au propriétaire — vos contenus restent privés.
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
