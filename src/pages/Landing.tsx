import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo } from "react";
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
import { applyThemeColor } from "@/lib/site";

let seedRequested = false;

export default function Landing() {
  const data = useQuery(api.site.getSiteData);
  const ensureSeed = useMutation(api.seed.ensureSeed);

  useEffect(() => {
    if (!seedRequested) {
      seedRequested = true;
      void ensureSeed();
    }
  }, [ensureSeed]);

  useEffect(() => {
    applyThemeColor(data?.settings?.themeColor);
  }, [data?.settings?.themeColor]);

  const nav = useMemo(() => {
    if (!data) return [];
    const links: { label: string; id: string }[] = [];
    if (data.about?.visibility) links.push({ label: "À propos", id: "about" });
    if (data.skills?.visibility) links.push({ label: "Compétences", id: "skills" });
    if (data.services?.visibility) links.push({ label: "Services", id: "services" });
    if (data.resume?.visibility) links.push({ label: "Parcours", id: "resume" });
    if (data.portfolio?.visibility) links.push({ label: "Portfolio", id: "portfolio" });
    if (data.blog?.visibility) links.push({ label: "Journal", id: "blog" });
    if (data.contact?.visibility) links.push({ label: "Contact", id: "contact" });
    return links;
  }, [data]);

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

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader
        siteName={data.settings?.siteName ?? "Portfolio"}
        links={nav}
      />
      {data.hero?.visibility && data.hero && (
        <Hero hero={data.hero} siteName={data.settings?.siteName ?? ""} />
      )}
      {data.about?.visibility && data.about && <About about={data.about} />}
      {data.skills?.visibility && data.skills && <Skills skills={data.skills} />}
      {data.services?.visibility && data.services && (
        <Services services={data.services} />
      )}
      {data.resume?.visibility && data.resume && <Resume resume={data.resume} />}
      {data.portfolio?.visibility && data.portfolio && (
        <Portfolio portfolio={data.portfolio} />
      )}
      {data.blog?.visibility && data.blog && <Blog blog={data.blog} />}
      {data.contact?.visibility && data.contact && (
        <Contact contact={data.contact} />
      )}
      <SiteFooter
        siteName={data.settings?.siteName ?? "Portfolio"}
        tagline={data.settings?.tagline}
        footerText={data.settings?.footerText}
        socials={data.contact?.socials}
      />
    </main>
  );
}
