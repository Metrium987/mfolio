import { motion } from "framer-motion";
import { Link } from "react-router";
import { APP_NAME } from "@/lib/site";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-screen flex-col bg-background"
    >
      <div className="flex flex-1 flex-col items-center justify-center px-5">
        <div className="text-center">
          <p className="kicker mb-6">{APP_NAME}</p>
          <h1 className="font-display text-7xl font-light tracking-tight text-foreground">
            404
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Cette page n'existe pas ou a été déplacée.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Retour au portfolio
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-medium text-foreground transition-colors hover:border-foreground"
            >
              Tableau de bord
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
