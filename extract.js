import fs from "fs";
import path from "path";

// DuckDuckGo source folder
const SRC = "tracker-radar/entities";

// Output files in extension
const OUT_DOMAINS = "dist/TRACKING_DOMAINS.ts";
const OUT_PARAMS = "dist/TRACKING_PARAMS.ts";

// Mapping DuckDuckGo -> TODO: SHOULD BE expanded later
const CATEGORY_MAP = {
  Advertising: "TrackerType.AD",
  Analytics: "TrackerType.ANALYTICS",
  Social: "TrackerType.SOCIAL",
  "Tracker Pixel": "TrackerType.PIXEL",
  Unknown: "TrackerType.UNKNOWN",
};

function extractDomains() {
  const output = [];

  const files = fs.readdirSync(SRC);
  for (const file of files) {
    if (!file.endsWith(".json")) continue;

    const json = JSON.parse(fs.readFileSync(path.join(SRC, file), "utf8"));

    const domain = json.domain;
    const cat = json.categories?.[0];

    if (!domain || !cat) continue;
    if (!CATEGORY_MAP[cat]) continue;

    output.push({ domain, type: CATEGORY_MAP[cat] });
  }

  output.sort((a, b) => a.domain.localeCompare(b.domain));

  // Generate TS file
  const ts = `import { TrackerType } from "../types/enum";

export const TRACKING_DOMAINS = [
${output.map((e) => `  { domain: "${e.domain}", type: ${e.type} },`).join("\n")}
];
`;

  fs.writeFileSync(OUT_DOMAINS, ts);
  console.log("Exported", output.length, "domains");
}

function extractParams() {
  // Minimal curated params -> TODO: SOULD BE expanded later
  const params = ["utm_", "fbclid", "gclid", "mc_eid", "pk_campaign", "ref"];

  const ts = `export const TRACKING_PARAMS = [
${params.map((p) => `  "${p}",`).join("\n")}
];
`;
  fs.writeFileSync(OUT_PARAMS, ts);
}

extractDomains();
extractParams();
