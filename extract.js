import fs from "fs";
import path from "path";

// define paths
const SOURCE = "tracker-radar/domains";
const OUTPUT = "dist/tracker.json";

// collect all json files in the directory
function getAllJsonFiles(dir) {
  let files = [];

  // creates path for each item and checks if directory or file
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
function extract() {
  // go through all JSON files in the DOMAINS_DIR
  const allFiles = getAllJsonFiles(SOURCE);

  // map through files and extract relevant data
  const trackers = allFiles
    .map((file) => {
      const data = JSON.parse(fs.readFileSync(file, "utf8"));
      // skip if no categories
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

  // export as an object
  const trackersMap = {};
  trackers.forEach(t => {
    trackersMap[t.domain] = {
      o: t.owner,
      c: t.categories,
      p: t.prevalence,
      f: t.fingerprinting
    };
  });

  const output = {
    version: new Date().toISOString().split("T")[0],
    totalCount: trackers.length,
    trackers: trackersMap
  };

  // ensure dist directory exists
  if (!fs.existsSync("dist")) fs.mkdirSync("dist");

  // save to output file
  fs.writeFileSync(OUTPUT, JSON.stringify(output));
  console.log(`Exported ${Object.keys(trackersMap).length} trackers`);
}

extract();
