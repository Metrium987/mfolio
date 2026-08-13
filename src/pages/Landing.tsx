import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo } from "react";
import { Link } from "react-router";
import { api } from "@/convex/_generated/api";
import { Blog } from "@/components/site/Blog";
import { SiteFooter, SiteHeader } from "@/components/site/Chrome";
import { Contact } from "@/components/site/Contact";
import { Hero } from "@/components/site/Hero";
import { Interests } from "@/components/site/Interests";
import { Languages } from "@/components/site/Languages";
import { Portfolio } from "@/components/site/Portfolio";
import { Resume } from "@/components/site/Resume";
import { Services } from "@/components/site/Services";
import { Skills } from "@/components/site/Skills";
import { useSiteLang, type UIStringKey } from "@/lib/i18n";
import {
  DEFAULT_SECTION_ORDER,
  SECTION_IDS,
  type SectionId,
} from "@/lib/sections";
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

  // Structured data (Schema.org Person) so search engines understand who
  // the site belongs to — a standard expectation for professional portfolios.
  useEffect(() => {
    const about = data?.about;
    if (!about) return;
    const schema = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: about.name,
      email: about.email || undefined,
      telephone: about.phone || undefined,
      address: about.address
        ? { "@type": "PostalAddress", addressLocality: about.address }
        : undefined,
      image: about.avatar || undefined,
      url: window.location.origin,
      sameAs: about.socials.map((social) => social.link).filter(Boolean),
    };
    let tag = document.getElementById(
      "mfolio-ld-person",
    ) as HTMLScriptElement | null;
    if (!tag) {
      tag = document.createElement("script");
      tag.id = "mfolio-ld-person";
      tag.type = "application/ld+json";
      document.head.appendChild(tag);
    }
    tag.textContent = JSON.stringify(schema);
  }, [data?.about]);

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

  // Section visibility per id — the nav and the page both follow the same
  // rules so an order change in Config is reflected everywhere at once.
  const sectionVisible = (id: SectionId): boolean => {
    const settings = data?.settings;
    if (!settings) return false;
    switch (id) {
      case "resume":
        return settings.visibilityExperience || settings.visibilityEducation;
      case "skills":
        return settings.visibilitySkill;
      case "languages":
        return settings.visibilityLanguages;
      case "interests":
        return settings.visibilityInterests;
      case "services":
        return settings.visibilityService;
      case "portfolio":
        return settings.visibilityProject;
      case "blog":
        return settings.visibilityBlog;
      case "contact":
        return settings.visibilityContact;
    }
  };

  const NAV_KEYS: Record<SectionId, UIStringKey> = {
    resume: "nav.resume",
    skills: "nav.skills",
    languages: "nav.languages",
    interests: "nav.interests",
    services: "nav.services",
    portfolio: "nav.portfolio",
    blog: "nav.blog",
    contact: "nav.contact",
  };

  const nav = useMemo(() => {
    if (!data) return [];
    const order = data.settings?.sectionOrder?.length
      ? data.settings.sectionOrder
      : DEFAULT_SECTION_ORDER;
    return order
      .map((id) => id as SectionId)
      .filter((id) => SECTION_IDS.includes(id))
      .filter((id) => sectionVisible(id))
      .map((id) => ({ label: t(NAV_KEYS[id]), id }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // The hero is the masthead (French CV "en-tête") — it IS the "À propos"
  // section of the page and is always first, so it is not part of the
  // orderable list. The remaining sections render in the order configured in
  // Config → "Ordre d'affichage des sections" (French CV standard:
  // Parcours → Compétences → Langues → Centres d'intérêt → Services →
  // Projets → Journal → Contact) or any custom arrangement. Stale ids (e.g.
  // "about" from an older save) are filtered out defensively.
  const order = (
    (settings?.sectionOrder?.length
      ? settings.sectionOrder
      : DEFAULT_SECTION_ORDER) as SectionId[]
  ).filter((id) => SECTION_IDS.includes(id));

  const renderSection = (id: SectionId) => {
    switch (id) {
      case "resume":
        return (settings?.visibilityExperience ||
          settings?.visibilityEducation) &&
          data.resume ? (
          <Resume resume={data.resume} />
        ) : null;
      case "skills":
        return settings?.visibilitySkill && data.skills ? (
          <Skills
            skills={data.skills}
            showProficiency={settings.visibilitySkillProficiency}
          />
        ) : null;
      case "languages":
        return settings?.visibilityLanguages && data.languages ? (
          <Languages languages={data.languages} />
        ) : null;
      case "interests":
        return settings?.visibilityInterests && data.interests ? (
          <Interests
            interests={data.interests}
            layout={settings.interestsLayout ?? "cards"}
          />
        ) : null;
      case "services":
        return settings?.visibilityService && data.services ? (
          <Services
            services={data.services}
            layout={settings.servicesLayout ?? "cards"}
          />
        ) : null;
      case "portfolio":
        return settings?.visibilityProject && data.portfolio ? (
          <Portfolio portfolio={data.portfolio} />
        ) : null;
      case "blog":
        return settings?.visibilityBlog && data.blog ? (
          <Blog blog={data.blog} />
        ) : null;
      case "contact":
        return settings?.visibilityContact && data.about ? (
          <Contact about={data.about} />
        ) : null;
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader
        siteName={siteName}
        links={nav}
        logoUrl={data.site?.logoUrl}
        email={data.about?.email}
      />
      {settings?.visibilityAbout && data.about && (
        <Hero
          about={data.about}
          siteName={siteName}
          visibilityCv={settings.visibilityCv}
        />
      )}
      {order.map((id) => (
        <div key={id}>{renderSection(id)}</div>
      ))}
      {settings?.visibilityFooter && (
        <SiteFooter site={data.site} socials={data.about?.socials} />
      )}
    </main>
  );
}
