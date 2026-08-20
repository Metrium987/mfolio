import { useAction, useMutation, useQuery } from "convex/react";
import {
  Briefcase,
  ExternalLink,
  FolderOpen,
  GraduationCap,
  Home,
  Inbox,
  Info,
  Languages,
  Layers,
  LogOut,
  Newspaper,
  Palette,
  Plug,
  Settings,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "@/convex/_generated/api";
import {
  AboutEditor,
  AppearanceEditor,
  ConfigEditor,
  IntegrationsEditor,
  SecurityEditor,
  SiteEditor,
} from "@/components/admin/editors-basic";
import {
  BlogEditor,
  InterestsEditor,
  LanguagesEditor,
  MessagesView,
  PortfolioEditor,
  ResumeEditor,
  ServicesEditor,
  SkillsEditor,
  VisitorsView,
} from "@/components/admin/editors-lists";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import {
  APP_NAME,
  applyFavicon,
  applyThemeColor,
  applyThemePreset,
  monogram,
} from "@/lib/site";
import { cn } from "@/lib/utils";
import { SetupWizard } from "@/components/admin/SetupWizard";
import { HelpTour } from "@/components/admin/HelpTour";

type NavItem = {
  id: string;
  label: string;
  icon: typeof Home;
  group?: string;
};

const NAV: NavItem[] = [
  { id: "overview", label: "Vue d'ensemble", icon: Home },
  { id: "config", label: "Config", icon: SlidersHorizontal, group: "Portfolio" },
  { id: "about", label: "À propos", icon: Info, group: "Portfolio" },
  { id: "skills", label: "Compétences", icon: TrendingUp, group: "Portfolio" },
  { id: "languages", label: "Langues", icon: Languages, group: "Portfolio" },
  { id: "interests", label: "Centres d'intérêt", icon: Sparkles, group: "Portfolio" },
  { id: "services", label: "Services", icon: Layers, group: "Portfolio" },
  { id: "resume", label: "Parcours", icon: Briefcase, group: "Portfolio" },
  { id: "portfolio", label: "Projets", icon: FolderOpen, group: "Portfolio" },
  { id: "blog", label: "Journal", icon: Newspaper, group: "Portfolio" },
  { id: "visitors", label: "Visiteurs", icon: Users },
  { id: "messages", label: "Messages", icon: Inbox },
  { id: "site", label: "Paramètres", icon: Settings },
  { id: "integrations", label: "Intégrations", icon: Plug },
  { id: "appearance", label: "Apparence", icon: Palette },
  { id: "security", label: "Sécurité du compte", icon: ShieldCheck },
];

const GROUPS = Array.from(new Set(NAV.map((item) => item.group).filter(Boolean))) as string[];

function NavButton({
  item,
  active,
  badge,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  badge?: number;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-[13px] font-medium transition-colors",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="flex-1">{item.label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className={cn(
            "flex size-5 items-center justify-center rounded-full text-[11px] font-semibold",
            active ? "bg-background text-foreground" : "bg-(--studio-accent) text-white",
          )}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Home;
  label: string;
  value: number | undefined;
}) {
  return (
    <div className="flex items-center gap-4 border border-border bg-card p-4">
      <div className="flex size-10 shrink-0 items-center justify-center border border-border text-(--studio-accent)">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="font-display text-2xl font-light tracking-tight text-foreground">
          {value ?? "—"}
        </p>
        <p className="truncate text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function Overview() {
  const stats = useQuery(api.site.getStats);

  const trendMax = Math.max(1, ...(stats?.visitors.trend.map((t) => t.count) ?? [1]));

  const deviceTotal =
    (stats?.visitors.devices.mobile ?? 0) +
    (stats?.visitors.devices.desktop ?? 0) +
    (stats?.visitors.devices.other ?? 0);
  const deviceRows = [
    { key: "mobile" as const, label: "Mobile" },
    { key: "desktop" as const, label: "Ordinateur" },
    { key: "other" as const, label: "Autre" },
  ].map((row) => {
    const count = stats?.visitors.devices[row.key] ?? 0;
    return {
      ...row,
      count,
      pct: deviceTotal > 0 ? Math.round((count / deviceTotal) * 100) : 0,
    };
  });
  const browserTotal =
    stats?.visitors.browsers.reduce((sum, browser) => sum + browser.count, 0) ?? 0;
  const hourMax = Math.max(1, ...(stats?.visitors.hours ?? []));
  const hasHours = stats ? stats.visitors.hours.some((count) => count > 0) : false;
  const peakHour = stats
    ? stats.visitors.hours.indexOf(Math.max(...stats.visitors.hours))
    : -1;
  const returnTotal =
    (stats?.visitors.returning.new ?? 0) + (stats?.visitors.returning.returning ?? 0);
  const returnNewPct =
    returnTotal > 0
      ? Math.round(((stats?.visitors.returning.new ?? 0) / returnTotal) * 100)
      : 0;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Vue d'ensemble
        </p>
        <h1 className="mt-1 font-display text-2xl font-light tracking-tight text-foreground">
          Tableau de bord
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vos contenus et l'activité de votre portfolio en un coup d'œil.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={TrendingUp} label="Compétences" value={stats?.content.skills} />
        <StatCard icon={GraduationCap} label="Formations" value={stats?.content.educations} />
        <StatCard icon={Briefcase} label="Expériences" value={stats?.content.experiences} />
        <StatCard icon={FolderOpen} label="Projets" value={stats?.content.projects} />
        <StatCard icon={Wrench} label="Services" value={stats?.content.services} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="border border-border bg-card p-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Visiteurs
          </p>
          <div className="mt-4 grid grid-cols-4 gap-2 text-center">
            {[
              { label: "Total", value: stats?.visitors.total },
              { label: "Ce mois", value: stats?.visitors.thisMonth },
              { label: "Cette semaine", value: stats?.visitors.thisWeek },
              { label: "Aujourd'hui", value: stats?.visitors.today },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-xl font-light tracking-tight">
                  {stat.value ?? "—"}
                </p>
                <p className="text-[11px] text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
          {stats && (
            <div className="mt-4 grid grid-cols-4 gap-2 border-t border-border/60 pt-3 text-center">
              {[
                { label: "Uniques · mois", value: stats.visitors.unique.thisMonth },
                { label: "Uniques · sem.", value: stats.visitors.unique.thisWeek },
                { label: "Uniques · jour", value: stats.visitors.unique.today },
                { label: "Uniques · total", value: stats.visitors.unique.total },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-xl font-light tracking-tight">
                    {stat.value ?? "—"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
          {stats && (
            <div className="mt-5">
              <p className="mb-2 text-xs text-muted-foreground">
                Tendance — 7 derniers jours
              </p>
              <div className="flex h-20 items-end gap-1.5">
                {stats.visitors.trend.map((day) => (
                  <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full bg-(--studio-accent)/70"
                      style={{
                        height: `${Math.max(4, Math.round((day.count / trendMax) * 64))}px`,
                      }}
                      title={`${day.date} : ${day.count}`}
                    />
                    <span className="text-[9px] text-muted-foreground">{day.date.slice(5)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border border-border bg-card p-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Messages
          </p>
          <div className="mt-4 grid grid-cols-4 gap-2 text-center">
            {[
              { label: "Total", value: stats?.messages.total },
              { label: "Ce mois", value: stats?.messages.thisMonth },
              { label: "Cette semaine", value: stats?.messages.thisWeek },
              { label: "Aujourd'hui", value: stats?.messages.today },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-xl font-light tracking-tight">
                  {stat.value ?? "—"}
                </p>
                <p className="text-[11px] text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
          {stats && (
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/60 pt-3 text-center">
              <div>
                <p className="font-display text-xl font-light tracking-tight">
                  {stats.conversion.messages}
                </p>
                <p className="text-[11px] text-muted-foreground">Demandes</p>
              </div>
              <div>
                <p className="font-display text-xl font-light tracking-tight">
                  {stats.conversion.visitors}
                </p>
                <p className="text-[11px] text-muted-foreground">Visiteurs uniques</p>
              </div>
              <div>
                <p className="font-display text-xl font-light tracking-tight">
                  {stats.conversion.rate} %
                </p>
                <p className="text-[11px] text-muted-foreground">Taux de contact</p>
              </div>
            </div>
          )}
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Les demandes arrivent ici depuis le formulaire de contact. Pensez à les marquer
            comme traitées dans la boîte de réception.
          </p>
        </div>
      </div>

      {stats && (
        <div className="space-y-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Audience
            </p>
            <h2 className="mt-1 font-display text-xl font-light tracking-tight text-foreground">
              Activité du portfolio
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              90 derniers jours — Google Analytics conserve l'historique complet en parallèle.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="border border-border bg-card p-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Appareils
              </p>
              {deviceTotal === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">Pas encore de données.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {deviceRows.map((row) => (
                    <div key={row.label}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="font-medium text-foreground">
                          {row.count} · {row.pct} %
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full bg-muted/60">
                        <div
                          className="h-full bg-(--studio-accent)"
                          style={{ width: `${row.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border border-border bg-card p-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Navigateurs
              </p>
              {browserTotal === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">Pas encore de données.</p>
              ) : (
                <>
                  <div className="mt-4 space-y-2">
                    {stats.visitors.browsers.map((browser) => (
                      <div
                        key={browser.key}
                        className="flex items-center justify-between gap-3 text-xs"
                      >
                        <span className="truncate text-muted-foreground">{browser.key}</span>
                        <span className="font-medium text-foreground">{browser.count}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
                    {browserTotal} visites analysées
                  </p>
                </>
              )}
            </div>

            <div className="border border-border bg-card p-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Nouveaux vs retours
              </p>
              {returnTotal === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">Pas encore de données.</p>
              ) : (
                <>
                  <div className="mt-4 flex h-2 w-full overflow-hidden bg-muted/60">
                    <div
                      className="bg-(--studio-accent)"
                      style={{ width: `${returnNewPct}%` }}
                    />
                    <div
                      className="bg-muted-foreground/40"
                      style={{ width: `${100 - returnNewPct}%` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Nouveaux · {stats.visitors.returning.new} ({returnNewPct} %)
                    </span>
                    <span className="text-muted-foreground">
                      Retours · {stats.visitors.returning.returning} ({100 - returnNewPct} %)
                    </span>
                  </div>
                  <p className="mt-3 border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
                    Sur les visites de ce mois.
                  </p>
                </>
              )}
            </div>

            <div className="border border-border bg-card p-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Heures de pointe
              </p>
              {!hasHours ? (
                <p className="mt-4 text-sm text-muted-foreground">Pas encore de données.</p>
              ) : (
                <>
                  <div className="mt-4 flex h-20 items-end gap-[3px]">
                    {stats.visitors.hours.map((count, hour) => (
                      <div
                        key={hour}
                        className="flex-1 bg-(--studio-accent)/70"
                        style={{
                          height: `${Math.max(3, Math.round((count / hourMax) * 72))}px`,
                        }}
                        title={`${hour} h : ${count}`}
                      />
                    ))}
                  </div>
                  <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                    <span>0 h</span>
                    <span>6 h</span>
                    <span>12 h</span>
                    <span>18 h</span>
                    <span>23 h</span>
                  </div>
                  <p className="mt-2 border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
                    Pic d'activité à {peakHour} h — fuseau UTC.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const data = useQuery(api.site.getSiteData);
  const messageCountQuery = useQuery(api.site.getMessagesCount);
  const visitors = useQuery(api.site.getVisitors);
  const integrations = useQuery(api.site.getIntegrations);
  const ensureSeed = useMutation(api.seed.ensureSeed);
  const translateAllContent = useAction(api.translate.translateAllContent);
  const [active, setActive] = useState<string>("overview");
  const [autoTranslateRan, setAutoTranslateRan] = useState(false);
  const [dismissCredentialsBanner, setDismissCredentialsBanner] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    void ensureSeed();
  }, [ensureSeed]);

  // Once: if a DeepL key is set but the content has no English mirrors yet
  // (e.g. the key was entered before auto-translation existed), generate the
  // translations automatically so the site's EN switcher works immediately.
  useEffect(() => {
    if (autoTranslateRan || !data || !integrations) return;
    if (!integrations.deeplKeySet) return;
    const contentSections = [
      data.site,
      data.settings,
      data.about,
      data.skills,
      data.services,
      data.resume,
      data.portfolio,
      data.blog,
      data.languages,
      data.interests,
    ];
    const fullyTranslated = contentSections.every((section) => section && section.en);
    if (fullyTranslated) return;
    // Intentional one-time guard: mark the auto-translate as started so the
    // effect never re-runs on every data update.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAutoTranslateRan(true);
    const run = async () => {
      try {
        const results = await translateAllContent();
        const ok = Object.values(results).filter((r) => r === "ok").length;
        const failed = Object.values(results).filter((r) => r === "failed").length;
        if (failed > 0) {
          toast.error(
            `${ok} section(s) traduite(s), ${failed} en échec — vérifiez votre clé DeepL dans le menu Intégrations.`,
          );
        } else {
          toast.success(
            "Contenu traduit en anglais automatiquement — le site est maintenant bilingue.",
          );
        }
      } catch (error) {
        console.error(error);
        toast.error(
          "La traduction automatique a échoué. Vérifiez votre clé DeepL dans le menu Intégrations.",
        );
      }
    };
    void run();
  }, [data, integrations, autoTranslateRan, translateAllContent]);

  useEffect(() => {
    applyThemePreset(data?.settings?.themePreset);
    applyThemeColor(data?.settings?.themeColor);
  }, [data?.settings?.themePreset, data?.settings?.themeColor]);

  useEffect(() => {
    applyFavicon(data?.site?.faviconUrl);
  }, [data?.site?.faviconUrl]);

  // Auto-show the setup wizard on first login (wizardCompleted absent/false)
  useEffect(() => {
    if (data && data.settings && data.settings.wizardCompleted !== true) {
      setShowWizard(true);
    }
  }, [data]);



  const handleSignOut = async () => {
    // Sign out first, then leave with a real page load: any SPA navigation
    // can lose the race against RequireAuth's /auth redirect when the session
    // clears, leaving the user stuck on the login page. A full load of "/"
    // is deterministic — the public site renders with no auth checks.
    await signOut();
    window.location.assign("/");
  };

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="font-display text-lg tracking-tight">Chargement…</p>
          <div className="mx-auto mt-4 h-px w-24 animate-pulse bg-border" />
        </div>
      </main>
    );
  }

  const siteName = data.site?.siteName ?? "Portfolio";
  const messageCount = messageCountQuery ?? 0;
  const activeLabel = NAV.find((item) => item.id === active)?.label ?? "";
  const activeItem = NAV.find((item) => item.id === active);

  const renderContent = () => {
    switch (active) {
      case "overview":
        return <Overview />;
      case "config":
        return <ConfigEditor settings={data.settings} />;
      case "about":
        return <AboutEditor about={data.about} />;
      case "skills":
        return <SkillsEditor skills={data.skills} />;
      case "languages":
        return <LanguagesEditor languages={data.languages} />;
      case "interests":
        return <InterestsEditor interests={data.interests} />;
      case "services":
        return <ServicesEditor services={data.services} />;
      case "resume":
        return <ResumeEditor resume={data.resume} />;
      case "portfolio":
        return <PortfolioEditor portfolio={data.portfolio} />;
      case "blog":
        return <BlogEditor blog={data.blog} />;
      case "visitors":
        return <VisitorsView visitors={visitors} />;
      case "messages":
        return <MessagesView />;
      case "site":
        return <SiteEditor site={data.site} settings={data.settings} />;
      case "integrations":
        return <IntegrationsEditor settings={data.settings} />;
      case "appearance":
        return <AppearanceEditor settings={data.settings} />;
      case "security":
        return <SecurityEditor settings={data.settings} />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="min-h-screen bg-background lg:flex">
      {/* Keyboard / screen-reader skip link — first focusable element. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:border focus:border-border focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground"
      >
        Aller au contenu
      </a>
      {/* Sidebar — desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
        <div className="border-b border-border px-5 py-6">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.2em] text-(--studio-accent)">
              {APP_NAME} · Tableau de bord
            </p>
            <div className="relative">
              <HelpTour activeSection={active} onNavigate={setActive} />
            </div>
          </div>
          <div className="mt-1 flex items-center gap-2.5">
            {data.site?.logoUrl ? (
              <img
                src={data.site.logoUrl}
                alt=""
                className="max-h-8 w-auto max-w-36 object-contain"
              />
            ) : (
              <p className="truncate font-display text-xl font-medium tracking-tight text-foreground">
                {siteName}
              </p>
            )}
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV.filter((item) => !item.group).map((item) => (
            <NavButton
              key={item.id}
              item={item}
              active={active === item.id}
              badge={item.id === "messages" ? messageCount : undefined}
              onClick={() => setActive(item.id)}
            />
          ))}
          {GROUPS.map((group) => (
            <div key={group} className="pt-4">
              <p className="px-3 pb-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {group}
              </p>
              <div className="space-y-1">
                {NAV.filter((item) => item.group === group).map((item) => (
                  <NavButton
                    key={item.id}
                    item={item}
                    active={active === item.id}
                    onClick={() => setActive(item.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-border px-4 py-4">
          <Link
            to="/"
            className="mb-3 flex items-center gap-2 px-3 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ExternalLink className="size-4" />
            Voir le site
          </Link>
          <div className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-[11px] font-semibold">
              {monogram(user?.name ?? user?.email ?? "A")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-foreground">
                {user?.name ?? "Propriétaire"}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {user?.email ?? "compte unique"}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              title="Se déconnecter"
              onClick={handleSignOut}
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md lg:hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-3">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.2em] text-(--studio-accent)">
                {APP_NAME} · Tableau de bord
              </p>
              {data.site?.logoUrl ? (
                <img
                  src={data.site.logoUrl}
                  alt=""
                  className="max-h-7 w-auto max-w-32 object-contain"
                />
              ) : (
                <p className="truncate font-display text-base font-medium tracking-tight">
                  {siteName}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <div className="relative">
                <HelpTour activeSection={active} onNavigate={setActive} />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                title="Voir le site"
                asChild
              >
                <Link to="/">
                  <ExternalLink className="size-4" />
                </Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                title="Se déconnecter"
                onClick={handleSignOut}
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto px-3 pb-3">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(item.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  active === item.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-muted-foreground",
                )}
              >
                <item.icon className="size-3.5" />
                {item.label}
                {item.id === "messages" && messageCount > 0 && (
                  <span className="flex size-4 items-center justify-center rounded-full bg-(--studio-accent) text-[10px] font-semibold text-white">
                    {messageCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-4xl px-5 py-8 outline-none sm:px-8 lg:py-10"
        >
          {user && user.credentialsChanged !== true && !dismissCredentialsBanner && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-border bg-card px-4 py-3">
              <div className="flex items-center gap-3">
                <ShieldAlert className="size-4 shrink-0 text-(--studio-accent)" />
                <p className="text-[13px] text-muted-foreground">
                  Vous utilisez encore les identifiants par défaut (
                  <span className="font-medium text-foreground">admin@admin.com</span>
                  ), connus publiquement. Changez-les dès maintenant.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setActive("security")}
                  className="rounded-full"
                >
                  Changer maintenant
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  title="Fermer"
                  onClick={() => setDismissCredentialsBanner(true)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          )}
          {activeItem?.group && (
            <p className="mb-4 text-[11px] uppercase tracking-[0.2em] text-muted-foreground lg:hidden">
              {activeItem.group} — {activeLabel}
            </p>
          )}
          {renderContent()}
        </main>
      </div>

      {/* Setup wizard — first-time onboarding overlay */}
      {showWizard && (
        <SetupWizard onComplete={() => setShowWizard(false)} />
      )}
    </div>
  );
}
