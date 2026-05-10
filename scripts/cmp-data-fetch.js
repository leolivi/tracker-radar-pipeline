import { DataCollector } from "./DataCollector.js";

const SOURCE = "consent-o-matic/Rules.json";

// --- CMP Data FROM CONSENT-O-MATIC --- //
// CMP selectors from Consent-O-Matic
export async function buildCMPHeuristics() {
  const collector = new DataCollector(SOURCE);
  const rules = collector.data;

  const cmps = Object.fromEntries(Object.keys(rules).map((name) => [name, true]));
  const selectors = Object.fromEntries(
    Object.values(rules)
      .flatMap((config) => config.detectors ?? [])
      .flatMap((detector) => ["presentMatcher", "showingMatcher"].map((key) => detector[key]?.target?.selector))
      .filter(Boolean)
      .map((selector) => [selector, true])
  );

  // save to output file
  collector.writeDist("cmp-selectors.json", { cmps, selectors });
}
