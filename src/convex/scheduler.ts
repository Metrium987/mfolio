import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Daily retention sweep: removes visitor rows older than 90 days so the
// visitors table never grows unbounded. Google Analytics remains the
// long-term analytics source of truth; messages are never purged.
crons.interval(
  "Purge visitors older than 90 days",
  { hours: 24 },
  internal.siteMutations.purgeOldVisitors,
);

export default crons;
