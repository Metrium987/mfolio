import { useMutation } from "convex/react";
import { Loader2, Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSiteLang } from "@/lib/i18n";
import { monogram } from "@/lib/site";
import { Container, Reveal, SectionHeading } from "./Section";

export function Contact({ about }: { about: Doc<"about"> }) {
  const addMessage = useMutation(api.siteMutations.addMessage);
  const { t } = useSiteLang();
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true);
    try {
      await addMessage(form);
      setForm({ name: "", email: "", subject: "", message: "" });
      toast.success(t("contact.success"));
    } catch (error) {
      console.error(error);
      toast.error(t("contact.error"));
    } finally {
      setSending(false);
    }
  };

  const infoRows = [
    {
      icon: Mail,
      label: t("contact.email"),
      value: about.email,
      href: about.email ? `mailto:${about.email}` : undefined,
    },
    {
      icon: Phone,
      label: t("contact.phone"),
      value: about.phone,
      href: about.phone ? `tel:${about.phone}` : undefined,
    },
    { icon: MapPin, label: t("contact.location"), value: about.address },
  ].filter((row) => row.value);

  return (
    <Container id="contact" className="py-24 md:py-32">
      <div className="border-t border-border/70 pt-16 md:pt-20">
        <SectionHeading
          kicker={t("nav.contact")}
          title={t("nav.contact")}
          description={t("contact.description")}
        />
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal>
            <ul className="space-y-8">
              {infoRows.map((row) => (
                <li key={row.label} className="flex items-start gap-5">
                  <div className="flex size-11 shrink-0 items-center justify-center border border-border text-(--studio-accent)">
                    <row.icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {row.label}
                    </p>
                    {row.href ? (
                      <a
                        href={row.href}
                        className="mt-1 inline-block text-[15px] font-medium text-foreground transition-colors hover:text-(--studio-accent)"
                      >
                        {row.value}
                      </a>
                    ) : (
                      <p className="mt-1 text-[15px] font-medium text-foreground">
                        {row.value}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {about.socials.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-3">
                {about.socials.map((social) => (
                  <a
                    key={social.title}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={social.title}
                    className="flex size-11 items-center justify-center rounded-full border border-border text-xs font-semibold tracking-wide text-muted-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
                  >
                    {monogram(social.title)}
                  </a>
                ))}
              </div>
            )}
          </Reveal>

          <Reveal delay={0.1}>
            <form
              onSubmit={handleSubmit}
              className="border border-border bg-card p-6 sm:p-8"
            >
              <p className="kicker mb-6">{t("contact.writeMe")}</p>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact-name" className="text-sm">
                    {t("contact.name")}
                  </Label>
                  <Input
                    id="contact-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={t("contact.namePlaceholder")}
                    required
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email" className="text-sm">
                    {t("contact.email")}
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder={t("contact.emailPlaceholder")}
                    required
                    className="bg-background"
                  />
                </div>
              </div>
              <div className="mt-5 space-y-2">
                <Label htmlFor="contact-subject" className="text-sm">
                  {t("contact.subject")}
                </Label>
                <Input
                  id="contact-subject"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder={t("contact.subjectPlaceholder")}
                  className="bg-background"
                />
              </div>
              <div className="mt-5 space-y-2">
                <Label htmlFor="contact-message" className="text-sm">
                  {t("contact.message")}
                </Label>
                <Textarea
                  id="contact-message"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder={t("contact.messagePlaceholder")}
                  rows={6}
                  required
                  className="bg-background"
                />
              </div>
              <Button
                type="submit"
                disabled={sending}
                className="mt-6 w-full rounded-full sm:w-auto"
              >
                {sending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                {t("contact.send")}
              </Button>
            </form>
          </Reveal>
        </div>
      </div>
    </Container>
  );
}
