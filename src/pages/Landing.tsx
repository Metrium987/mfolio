import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo } from "react";
import { Link } from "react-router";
import { api } from "@/convex/_generated/api";
import { About } from "@/components/site/About";
import { Blog } from "@/components/site/Blog";
import { SiteFooter, SiteHeader } from "@/components/site/Chrome";
import { Contact } from "@/components/site/Contact";
import { Hero } from "@/components/site/Hero";
import { Portfolio } from "@/components/site/Portfolio";
import { Resume } from "@/components/site/Resume";
import { Services } from "@/components/site/Services";
import { Skills } from "@/components/site/Skills";
import { useSiteLang } from "@/lib/i18n";
import {
  APP_NAME,
  applyFavicon,
  applyThemeColor,
  detectBrowser,
  detectPlatform,
} from "@/lib/site";

let seedRequested = false;
let gaInjected = false;

function setMeta(attr: "name" | "property", key: string, content: string) {
  if (!content) return;
  let tag = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

/**
 * Injects a raw HTML/script block (Ezfolio custom scripts). Scripts are
 * recreated explicitly because innerHTML does not execute them.
 */
function injectBlock(html: string, parent: HTMLElement) {
  if (!html.trim()) return;
  const container = document.createElement("div");
  container.dataset.mfolioScript = "true";
  container.innerHTML = html;
  container.querySelectorAll("script").forEach((script) => {
    const fresh = document.createElement("script");
    if (script.src) {
      fresh.src = script.src;
    } else {
      fresh.textContent = script.textContent ?? "";
    }
    script.replaceWith(fresh);
  });
  parent.appendChild(container);
}

function MaintenanceScreen() {
  const { t } = useSiteLang();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-5 text-center">
      <p className="kicker mb-6">{APP_NAME}</p>
      <h1 className="font-display text-4xl font-light tracking-tight text-foreground sm:text-5xl">
        {t("maintenance.title")}
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
        {t("maintenance.body")}
      </p>
      <Link
        to="/dashboard"
        className="mt-8 inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-medium text-foreground transition-colors hover:border-foreground"
      >
        {t("maintenance.owner")}
      </Link>
    </main>
  );
}

export default function Landing() {
  const { t, pick } = useSiteLang();
  const data = useQuery(api.site.getSiteData);
  const ensureSeed = useMutation(api.seed.ensureSeed);
  const trackVisit = useMutation(api.siteMutations.trackVisit);

  useEffect(() => {
    if (!seedRequested) {
      seedRequested = true;
      void ensureSeed();
    }
  }, [ensureSeed]);

  // Theme color + favicon
  useEffect(() => {
    applyThemeColor(data?.settings?.themeColor);
  }, [data?.settings?.themeColor]);

  useEffect(() => {
    applyFavicon(data?.site?.faviconUrl);
  }, [data?.site?.faviconUrl]);

  // SEO meta tags (English mirrors when the EN language is active)
  useEffect(() => {
    const settings = data?.settings;
    const site = data?.site;
    if (!settings) return;
    const metaTitle = pick(settings.metaTitle, settings.en?.metaTitle);
    const metaDescription = pick(
      settings.metaDescription,
      settings.en?.metaDescription,
    );
    const title = metaTitle || site?.siteName || APP_NAME;
    document.title = title;
    setMeta("name", "description", metaDescription);
    setMeta("name", "author", settings.metaAuthor);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", metaDescription);
    setMeta("property", "og:image", settings.metaImage);
  }, [data?.settings, data?.site, pick]);

  // Google Analytics
  useEffect(() => {
    const gaId = data?.settings?.googleAnalyticsId;
    if (!gaId || gaInjected) return;
    gaInjected = true;
    injectBlock(
      `<script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');</script>`,
      document.head,
    );
  }, [data?.settings?.googleAnalyticsId]);

  // Custom header/footer scripts (Ezfolio Config)
  useEffect(() => {
    const settings = data?.settings;
    if (!settings) return;
    document
      .querySelectorAll("[data-mfolio-script]")
      .forEach((node) => node.remove());
    injectBlock(settings.scriptHeader, document.head);
    injectBlock(settings.scriptFooter, document.body);
    return () => {
      document
        .querySelectorAll("[data-mfolio-script]")
        .forEach((node) => node.remove());
    };
  }, [data?.settings?.scriptHeader, data?.settings?.scriptFooter]);

  // Visitor tracking (Ezfolio)
  useEffect(() => {
    const track = async () => {
      try {
        const storageKey = "mfolio_visitor";
        const existing = localStorage.getItem(storageKey);
        const trackingId =
          existing ??
          `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        if (!existing) localStorage.setItem(storageKey, trackingId);
        await trackVisit({
          trackingId,
          isNew: !existing,
          browser: detectBrowser(),
          platform: detectPlatform(),
        });
      } catch (error) {
        console.warn("Visitor tracking failed:", error);
      }
    };
    void track();
  }, [trackVisit]);

  const nav = useMemo(() => {
    if (!data) return [];
    const settings = data.settings;
    const links: { label: string; id: string }[] = [];
    if (settings?.visibilityAbout) links.push({ label: t("nav.about"), id: "about" });
    if (settings?.visibilitySkill) links.push({ label: t("nav.skills"), id: "skills" });
    if (settings?.visibilityService) links.push({ label: t("nav.services"), id: "services" });
    if (settings?.visibilityExperience || settings?.visibilityEducation)
      links.push({ label: t("nav.resume"), id: "resume" });
    if (settings?.visibilityProject) links.push({ label: t("nav.portfolio"), id: "portfolio" });
    if (settings?.visibilityBlog) links.push({ label: t("nav.blog"), id: "blog" });
    if (settings?.visibilityContact) links.push({ label: t("nav.contact"), id: "contact" });
    return links;
  }, [data, t]);

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="font-display text-lg tracking-tight">{t("loading")}</p>
          <div className="mx-auto mt-4 h-px w-24 animate-pulse bg-border" />
        </div>
      </main>
    );
  }

  if (data.settings?.maintenanceMode) {
    return <MaintenanceScreen />;
  }

  const siteName = data.site?.siteName ?? "Portfolio";
  const settings = data.settings;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader
        siteName={siteName}
        links={nav}
        logoUrl={data.site?.logoUrl}
      />
      {settings?.visibilityAbout && data.about && (
        <Hero
          about={data.about}
          siteName={siteName}
          visibilityCv={settings.visibilityCv}
        />
      )}
      {settings?.visibilityAbout && data.about && (
        <About about={data.about} visibilityCv={settings.visibilityCv} />
      )}
      {settings?.visibilitySkill && data.skills && (
        <Skills
          skills={data.skills}
          showProficiency={settings.visibilitySkillProficiency}
        />
      )}
      {settings?.visibilityService && data.services && (
        <Services services={data.services} />
      )}
      {(settings?.visibilityExperience || settings?.visibilityEducation) &&
        data.resume && <Resume resume={data.resume} />}
      {settings?.visibilityProject && data.portfolio && (
        <Portfolio portfolio={data.portfolio} />
      )}
      {settings?.visibilityBlog && data.blog && <Blog blog={data.blog} />}
      {settings?.visibilityContact && data.about && <Contact about={data.about} />}
      {settings?.visibilityFooter && (
        <SiteFooter site={data.site} socials={data.about?.socials} />
      )}
    </main>
  );
}
