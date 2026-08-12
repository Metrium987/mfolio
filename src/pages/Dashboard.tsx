import { useMutation, useQuery } from "convex/react";
import {
  Briefcase,
  ExternalLink,
  FolderOpen,
  Inbox,
  Info,
  Layers,
  LogOut,
  Mail,
  Newspaper,
  Settings,
  TrendingUp,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "@/convex/_generated/api";
import { AboutEditor, ContactEditor, HeroEditor, SettingsEditor } from "@/components/admin/editors-basic";
import {
  BlogEditor,
  MessagesView,
  PortfolioEditor,
  ResumeEditor,
  ServicesEditor,
  SkillsEditor,
} from "@/components/admin/editors-lists";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { applyThemeColor, monogram } from "@/lib/site";
import { cn } from "@/lib/utils";

const NAV = [
  { id: "hero", label: "Accueil", icon: User },
  { id: "about", label: "À propos", icon: Info },
  { id: "skills", label: "Compétences", icon: TrendingUp },
  { id: "services", label: "Services", icon: Layers },
  { id: "resume", label: "Parcours", icon: Briefcase },
  { id: "portfolio", label: "Portfolio", icon: FolderOpen },
  { id: "blog", label: "Journal", icon: Newspaper },
  { id: "contact", label: "Contact", icon: Mail },
  { id: "messages", label: "Messages", icon: Inbox },
  { id: "settings", label: "Paramètres", icon: Settings },
] as const;

type SectionId = (typeof NAV)[number]["id"];

function NavButton({
  item,
  active,
  badge,
  onClick,
}: {
  item: (typeof NAV)[number];
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

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const data = useQuery(api.site.getSiteData);
  const messages = useQuery(api.site.getMessages);
  const ensureSeed = useMutation(api.seed.ensureSeed);
  const [active, setActive] = useState<SectionId>("hero");

  useEffect(() => {
    void ensureSeed();
  }, [ensureSeed]);

  useEffect(() => {
    applyThemeColor(data?.settings?.themeColor);
  }, [data?.settings?.themeColor]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
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

  const siteName = data.settings?.siteName ?? "Portfolio";
  const messageCount = messages?.length ?? 0;
  const activeLabel = NAV.find((item) => item.id === active)?.label ?? "";

  return (
    <div className="min-h-screen bg-background lg:flex">
      {/* Sidebar — desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
        <div className="border-b border-border px-5 py-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Tableau de bord
          </p>
          <p className="mt-1 truncate font-display text-xl font-medium tracking-tight text-foreground">
            {siteName}
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              active={active === item.id}
              badge={item.id === "messages" ? messageCount : undefined}
              onClick={() => setActive(item.id)}
            />
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
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Tableau de bord
              </p>
              <p className="truncate font-display text-base font-medium tracking-tight">
                {siteName}
              </p>
            </div>
            <div className="flex items-center gap-2">
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

        <main className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 lg:py-10">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Édition
              </p>
              <h2 className="font-display text-2xl font-light tracking-tight text-foreground lg:hidden">
                {activeLabel}
              </h2>
            </div>
          </div>

          {active === "hero" && <HeroEditor hero={data.hero} />}
          {active === "about" && <AboutEditor about={data.about} />}
          {active === "skills" && <SkillsEditor skills={data.skills} />}
          {active === "services" && <ServicesEditor services={data.services} />}
          {active === "resume" && <ResumeEditor resume={data.resume} />}
          {active === "portfolio" && <PortfolioEditor portfolio={data.portfolio} />}
          {active === "blog" && <BlogEditor blog={data.blog} />}
          {active === "contact" && <ContactEditor contact={data.contact} />}
          {active === "messages" && <MessagesView messages={messages} />}
          {active === "settings" && <SettingsEditor settings={data.settings} />}
        </main>
      </div>
    </div>
  );
}
