import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";

import { useAuth } from "@/hooks/use-auth";
import { APP_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Loader2, Mail } from "lucide-react";
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
  // Public setting: the owner can disable the email-code login (OTP) so the
  // app works on any platform even when the built-in email relay is not
  // available. When off, only the password login is shown.
  const siteData = useQuery(api.site.getSiteData);
  const otpEnabled = siteData?.settings?.emailOtpEnabled !== false;
  // Demo mode (Paramètres → Intégrations): the owner chose to share a try-me
  // account, so the generic credentials are displayed on the login page.
  const demoMode = siteData?.settings?.demoMode === true;
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const [mode, setMode] = useState<"password" | "otp">("password");
  // When OTP is disabled, the email-code login is hidden entirely — only the
  // password login remains.
  const effectiveMode = otpEnabled ? mode : "password";
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
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

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Impossible d'envoyer le code de vérification. Réessayez.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      navigate(redirect);
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("Le code de vérification saisi est incorrect.");
      setIsLoading(false);
      setOtp("");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Always-visible way back to the public site, whatever the step */}
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
          {step === "signIn" ? (
            <>
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
                  {effectiveMode === "password"
                    ? "Connectez-vous avec votre email et votre mot de passe."
                    : "Entrez votre adresse email pour recevoir un code de connexion."}
                </CardDescription>

                {otpEnabled && (
                  <div className="mt-5 grid grid-cols-2 gap-1 rounded-full border border-border bg-muted p-1">
                    {(
                      [
                        { id: "password", label: "Mot de passe" },
                        { id: "otp", label: "Code par email" },
                      ] as const
                    ).map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setMode(option.id);
                          setError(null);
                        }}
                        aria-pressed={effectiveMode === option.id}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
                          effectiveMode === option.id
                            ? "bg-foreground text-background"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}

                {demoMode && effectiveMode === "password" && (
                  <div className="mt-5 rounded-md border border-dashed border-border bg-background px-4 py-3 text-left">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      Compte de démonstration
                    </p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-foreground">
                      Email :{" "}
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[12px]">
                        admin@admin.com
                      </code>
                      <br />
                      Mot de passe :{" "}
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[12px]">
                        admin123
                      </code>
                    </p>
                  </div>
                )}
              </CardHeader>

              {effectiveMode === "password" ? (
                <form onSubmit={handlePasswordSubmit}>
                  <CardContent>
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
                        <Label
                          htmlFor="login-password"
                          className="text-[13px]"
                        >
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
                      {error && (
                        <p className="text-sm text-red-500">{error}</p>
                      )}
                      <Button
                        type="submit"
                        className="w-full rounded-full"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : null}
                        Se connecter
                      </Button>
                    </div>
                  </CardContent>
                </form>
              ) : (
                <form onSubmit={handleEmailSubmit}>
                  <CardContent>
                    <div className="relative flex items-center gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          name="email"
                          placeholder="vous@exemple.fr"
                          type="email"
                          className="bg-background pl-9"
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        variant="outline"
                        size="icon"
                        disabled={isLoading}
                        title="Envoyer le code"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {error && (
                      <p className="mt-2 text-sm text-red-500">{error}</p>
                    )}
                  </CardContent>
                </form>
              )}
            </>
          ) : (
            <>
              <CardHeader className="mt-4 text-center">
                <CardTitle className="text-xl font-medium tracking-tight">
                  Vérifiez votre email
                </CardTitle>
                <CardDescription>
                  Un code à 6 chiffres a été envoyé à {step.email}.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleOtpSubmit}>
                <CardContent className="pb-4">
                  <input type="hidden" name="email" value={step.email} />
                  <input type="hidden" name="code" value={otp} />

                  <div className="flex justify-center">
                    <InputOTP
                      value={otp}
                      onChange={setOtp}
                      maxLength={6}
                      disabled={isLoading}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                          const form = (e.target as HTMLElement).closest("form");
                          if (form) {
                            form.requestSubmit();
                          }
                        }
                      }}
                    >
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, index) => (
                          <InputOTPSlot key={index} index={index} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  {error && (
                    <p className="mt-2 text-center text-sm text-red-500">
                      {error}
                    </p>
                  )}
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    Vous n'avez rien reçu ?{" "}
                    <Button
                      variant="link"
                      className="h-auto p-0"
                      onClick={() => setStep("signIn")}
                    >
                      Renvoyer le code
                    </Button>
                  </p>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  <Button
                    type="submit"
                    className="w-full rounded-full"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Vérification…
                      </>
                    ) : (
                      <>
                        Vérifier et continuer
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep("signIn")}
                    disabled={isLoading}
                    className="w-full"
                  >
                    Utiliser une autre adresse
                  </Button>
                </CardFooter>
              </form>
            </>
          )}

          <div className="rounded-b-lg border-t border-border bg-muted px-6 py-4 text-center text-xs text-muted-foreground">
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
