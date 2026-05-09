import fs from "fs";
import path from "path";

// define paths
const SOURCE = "tracker-radar/domains";
const CMP_RULES_URL =
  "https://raw.githubusercontent.com/cavi-au/Consent-O-Matic/master/Rules.json";

// collect all json files in the directory
function getAllJsonFiles(dir) {
  let files = [];

  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stats = fs.statSync(full);

    if (stats.isDirectory()) {
      files = files.concat(getAllJsonFiles(full));
    } else if (item.endsWith(".json")) {
      files.push(full);
    }
  }

  return files;
}

// list to hold extracted trackers
async function extract() {
  // go through all JSON files in the DOMAINS_DIR
  const allFiles = getAllJsonFiles(SOURCE);

  // --- TRACKERS FROM DUCK DUCK GO --- //
  // map through files and extract relevant data
  const trackers = allFiles
    .map((file) => {
      const data = JSON.parse(fs.readFileSync(file, "utf8"));
      if (!data.categories?.length) return null;
      // extract relevant fields
      return {
        domain: data.domain,
        owner: data.owner?.name || null,
        categories: data.categories,
        prevalence: data.prevalence || 0,
        fingerprinting: data.fingerprinting || 0,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.prevalence - a.prevalence);

  // split to improve performance
  const top = trackers.slice(0, 2000);
  const extended = trackers.slice(2000);

  // export as an object
  const coreMap = {};
  top.forEach((t) => {
    coreMap[t.domain] = { o: t.owner, c: t.categories, p: t.prevalence, f: t.fingerprinting };
  });
  const extendedMap = {};
  extended.forEach((t) => {
    extendedMap[t.domain] = { o: t.owner, c: t.categories, p: t.prevalence, f: t.fingerprinting };
  });

  // ensure dist directory exists
  if (!fs.existsSync("dist")) fs.mkdirSync("dist");

  // save to output file
  fs.writeFileSync("dist/tracker-core.json", JSON.stringify({
    version: new Date().toISOString().split("T")[0],
    totalCount: top.length,
    trackers: coreMap,
  }));

  fs.writeFileSync("dist/tracker-extended.json", JSON.stringify({
    version: new Date().toISOString().split("T")[0],
    totalCount: extended.length,
    trackers: extendedMap,
  }));

  // --- FINGERPRINT DOMAINS FROM DUCK DUCK GO --- //
  // fingerprinting domains: f >= 2 (medium/high), sorted for stable git diffs       
  const fingerprintDomains = trackers
    .filter((t) => t.fingerprinting >= 2)
    .map((t) => t.domain)
    .sort();

  fs.writeFileSync("dist/fingerprint-domains.json", JSON.stringify({
    _meta: {
      source: "DuckDuckGo Tracker Radar",
      source_url: "https://github.com/duckduckgo/tracker-radar",
      field: "fingerprinting: 0=none 1=low 2=medium 3=high",
      min_score_included: 2,
      generated_at: new Date().toISOString(),
      total_domains: fingerprintDomains.length,
    },
    domains: fingerprintDomains,
  }));

  // --- CMP Data FROM CONSENT-O-MATIC --- //
  // CMP selectors from Consent-O-Matic
  const response = await fetch(CMP_RULES_URL);
  const rules = await response.json();

  const seen = new Set();
  const selectors = [];

  for (const config of Object.values(rules)) {
    for (const detector of config.detectors ?? []) {
      for (const key of ["presentMatcher", "showingMatcher"]) {
        const selector = detector[key]?.target?.selector;
        if (selector && !seen.has(selector)) {
          seen.add(selector);
          selectors.push(selector);
        }
      }
    }
  }

  const cmpNames = Object.keys(rules);

  fs.writeFileSync("dist/cmp-selectors.json", JSON.stringify({
    _meta: {
      source: "Consent-O-Matic",
      source_url: "https://github.com/cavi-au/Consent-O-Matic",
      generated_at: new Date().toISOString(),
      cmp_count: cmpNames.length,
      selector_count: selectors.length,
    },
    cmps: cmpNames,
    selectors,
  }));

  console.log(
    `Core: ${top.length}, Extended: ${extended.length}, Fingerprint: ${fingerprintDomains.length}, CMP selectors: ${selectors.length} from ${cmpNames.length} CMPs`
  );
}

extract();
