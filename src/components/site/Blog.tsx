import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import type { Doc } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSiteLang } from "@/lib/i18n";
import { Container, Reveal, SectionHeading } from "./Section";

export function Blog({
  blog,
  layout = "cards",
}: {
  blog: Doc<"blog">;
  layout?: "list" | "cards";
}) {
  const { t, pick } = useSiteLang();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const openPost = openIndex !== null ? blog.posts[openIndex] : null;
  const openPostEn = openIndex !== null ? blog.en?.posts?.[openIndex] : null;

  return (
    <Container id="blog" className="py-24 md:py-32">
      <div className="border-t border-border/70 pt-16 md:pt-20">
        <SectionHeading
          kicker={t("blog.kicker")}
          title={pick(blog.title, blog.en?.title)}
          description={pick(blog.description, blog.en?.description)}
        />
        {blog.posts.length > 0 ? (
          layout === "cards" ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {blog.posts.map((post, index) => (
                <Reveal key={post.title} delay={Math.min(index * 0.06, 0.3)}>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(index)}
                    className="group block w-full text-left"
                  >
                    <article className="border border-border bg-card p-2 transition-colors duration-300 hover:border-foreground/40">
                      {post.imageUrl && (
                        <div className="overflow-hidden">
                          <img
                            src={post.imageUrl}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="aspect-[16/10] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                          />
                        </div>
                      )}
                      <div className="px-2 pb-2 pt-5">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          {post.date}
                        </p>
                        <h3 className="mt-2 font-display text-xl font-medium leading-snug tracking-tight text-foreground group-hover:underline group-hover:decoration-(--studio-accent) group-hover:underline-offset-4">
                          {pick(post.title, blog.en?.posts?.[index]?.title)}
                        </h3>
                        {post.excerpt && (
                          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                            {pick(post.excerpt, blog.en?.posts?.[index]?.excerpt)}
                          </p>
                        )}
                        <span className="mt-4 inline-block text-sm font-medium text-(--studio-accent)">
                          {t("blog.readMore")}
                        </span>
                      </div>
                    </article>
                  </button>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="border-t border-border">
              {blog.posts.map((post, index) => (
                <Reveal key={post.title} delay={Math.min(index * 0.05, 0.25)}>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(index)}
                    className="group block w-full text-left"
                  >
                    <article className="flex flex-col gap-2 border-b border-border py-8 transition-colors duration-300 hover:bg-card/40 md:py-9">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {post.date}
                      </p>
                      <h3 className="font-display text-2xl font-light tracking-tight text-foreground transition-colors group-hover:text-(--studio-accent)">
                        {pick(post.title, blog.en?.posts?.[index]?.title)}
                      </h3>
                      {post.excerpt && (
                        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                          {pick(post.excerpt, blog.en?.posts?.[index]?.excerpt)}
                        </p>
                      )}
                      <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-(--studio-accent)">
                        {t("blog.readMore")}
                        <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </article>
                  </button>
                </Reveal>
              ))}
            </div>
          )
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("blog.noPosts")}
          </p>
        )}
      </div>

      <Dialog
        open={openPost !== null}
        onOpenChange={(open) => !open && setOpenIndex(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto border-border sm:max-w-2xl">
          {openPost && (
            <>
              {openPost.imageUrl && (
                <img
                  src={openPost.imageUrl}
                  alt=""
                  className="aspect-[16/9] w-full rounded-sm object-cover"
                />
              )}
              <DialogHeader>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {openPost.date}
                </p>
                <DialogTitle className="font-display text-2xl font-light tracking-tight">
                  {pick(openPost.title, openPostEn?.title)}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-[15px] leading-relaxed text-muted-foreground">
                {pick(openPost.content, openPostEn?.content)
                  .split(/\n{2,}/)
                  .map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}
