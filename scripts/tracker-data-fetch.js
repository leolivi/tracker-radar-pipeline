import { DataCollector } from "./DataCollector.js";

const SOURCE = "tracker-radar/domains";

const ADDITIONAL_PARAMS = ["twclid", "ttclid", "li_fat_id"];

/* 
TRACKERS, FINGERPRINT DOMAINS AND TRACKING PARAMS FROM DUCK DUCK GO 
*/

export async function buildTrackerHeuristics() {
  const collector = new DataCollector();

// --- TRACKERS FROM DUCK DUCK GO --- //
  // go through all JSON files in the DOMAINS_DIR
  const allFiles = DataCollector.getAllJsonFiles(SOURCE);

  // map through files and extract relevant data
  const trackers = allFiles
    .map((file) => {
      const data = new DataCollector(file).data;
      if (!data.categories?.length) return null;
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
  const toEntry = (t) => [t.domain, { o: t.owner, c: t.categories, p: t.prevalence, f: t.fingerprinting }];
  const coreMap = Object.fromEntries(top.map(toEntry));
  const extendedMap = Object.fromEntries(extended.map(toEntry));

  // save to output file
  collector.writeDist("tracker-core.json", { trackers: coreMap });
  collector.writeDist("tracker-extended.json", { trackers: extendedMap });

// --- FINGERPRINT DOMAINS FROM DUCK DUCK GO --- //
  // fingerprinting domains >= 2 (medium/high)
  const fingerprintMap = Object.fromEntries(
    trackers.filter((t) => t.fingerprinting >= 2).map((t) => [t.domain, true])
  );

  // save to output file
  collector.writeDist("fingerprint-domains.json", { domains: fingerprintMap });
  
// --- TRACKING PARAMS FROM DUCK DUCK GO --- //
  const trackingParamsRaw = new DataCollector("tracker-radar/build-data/generated/tracking_parameters.json").data;
  
  const paramsMap = Object.fromEntries(
    [...Object.keys(trackingParamsRaw.params), ...ADDITIONAL_PARAMS].map((key) => [key, true])
  );

  // save to output file
  collector.writeDist("tracking-params.json", { params: paramsMap });
}
