import fs from "fs";
import path from "path";

const ENTITIES_DIR = "tracker-radar/entities";
const DOMAINS_DIR = "tracker-radar/domains";
const OUT_JSON = "dist/tracker.json";

function extractData() {
  const trackers = [];

  // Domains durchgehen
  const domainFiles = fs.readdirSync(DOMAINS_DIR);

  for (const file of domainFiles) {
    if (!file.endsWith(".json")) continue;

    const filePath = path.join(DOMAINS_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    trackers.push({
      domain: data.domain,
      owner: data.owner?.name || null,
      categories: data.categories || [],
      prevalence: data.prevalence?.total || 0,
      fingerprinting: data.fingerprinting || 0,
    });
  }

  // Nach Domain sortieren
  trackers.sort((a, b) => a.domain.localeCompare(b.domain));

  // JSON ausgeben
  const output = {
    version: new Date().toISOString().split("T")[0],
    trackers: trackers,
    totalCount: trackers.length,
  };

  if (!fs.existsSync("./dist")) {
    fs.mkdirSync("./dist");
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify(output, null, 2));
  console.log(`Exported ${trackers.length} trackers`);
}

extractData();
