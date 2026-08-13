import { useMutation } from "convex/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Loader2, Mail, MapPin, Phone, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSiteLang } from "@/lib/i18n";
import { getOrCreateVisitorId, monogram } from "@/lib/site";
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
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotion = useReducedMotion();
  // Anti-spam: honeypot field — bots fill it, humans never see it. If it is
  // filled the backend silently drops the message.
  const [honeypot, setHoneypot] = useState("");

  // Clear the "sent" state timer if the component unmounts.
  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status !== "idle") return;
    setStatus("sending");
    try {
      await addMessage({
        ...form,
        honeypot,
        visitorId: getOrCreateVisitorId(),
      });
      setForm({ name: "", email: "", subject: "", message: "" });
      setHoneypot("");
      setStatus("sent");
      // Confirmation appears inside the button, then reverts to the idle label.
      resetTimer.current = setTimeout(() => setStatus("idle"), 2500);
    } catch (error) {
      console.error(error);
      setStatus("idle");
      toast.error(
        error instanceof Error && error.message.startsWith("Trop de messages")
          ? error.message
          : t("contact.error"),
      );
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
              {/* Anti-spam honeypot — visually hidden, ignored by humans. */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="contact-website">Site web</label>
                <input
                  id="contact-website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>
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
                    maxLength={100}
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
                    maxLength={200}
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
                  maxLength={200}
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
                  maxLength={5000}
                  required
                  className="bg-background"
                />
              </div>
              <Button
                type="submit"
                disabled={status === "sending"}
                className="mt-6 w-full min-w-[200px] rounded-full sm:w-auto"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {status === "sending" ? (
                    <motion.span
                      key="sending"
                      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="inline-flex items-center gap-2"
                    >
                      <Loader2 className="size-4 animate-spin" />
                      {t("contact.sending")}
                    </motion.span>
                  ) : status === "sent" ? (
                    <motion.span
                      key="sent"
                      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="inline-flex items-center gap-2"
                    >
                      <Check className="size-4" />
                      {t("contact.sent")}
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="inline-flex items-center gap-2"
                    >
                      <Send className="size-4" />
                      {t("contact.send")}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </form>
          </Reveal>
        </div>
      </div>
    </Container>
  );
}
