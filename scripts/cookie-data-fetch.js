import { DataCollector } from "./DataCollector.js";

const SOURCE = "open-cookie-database/open-cookie-database.json";

// names that belong in SESSION even when the DB category is Functional
const SESSION_LIKE = ["session", "sess", "sid", "csrf", "xsrf", "token", "auth", "jsession", "phpsess", "vwo"];

// --- Cookies Data FROM Open Cookie Database --- //
export async function buildCookieHeuristics() {
  const collector = new DataCollector(SOURCE);
  const db = collector.data;

  const { analytics, advertising, necessary, session } = Object.values(db)
    .flat()
    .reduce((maps, entry) => {
      const name = entry.cookie?.trim();
      if (!name) return maps;
      switch (entry.category) {
        case "Analytics": maps.analytics[name] = true; break;
        case "Marketing": maps.advertising[name] = true; break;
        case "Security": maps.session[name] = true; break;
        case "Functional": {
          const lower = name.toLowerCase();
          (SESSION_LIKE.some((p) => lower.includes(p)) ? maps.session : maps.necessary)[name] = true;
          break;
        }
      }
      return maps;
    }, { analytics: {}, advertising: {}, necessary: {}, session: {} });

  // save to output file
  collector.writeDist("cookie-heuristics.json", { analytics, advertising, necessary, session });
}
