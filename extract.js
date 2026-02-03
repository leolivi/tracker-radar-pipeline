import fs from "fs";
import path from "path";

// define paths
const SOURCE = "tracker-radar/domains";

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

  // split to improve performance
  const top = trackers.slice(0, 2000);
  const extended = trackers.slice(2000);

  // export as an object
  const coreMap = {};
  top.forEach(t => {
    coreMap[t.domain] = {
      o: t.owner,
      c: t.categories,
      p: t.prevalence,
      f: t.fingerprinting
    };
  });
  const extendedMap = {};
  extended.forEach(t => {
    extendedMap[t.domain] = {
      o: t.owner,
      c: t.categories,
      p: t.prevalence,
      f: t.fingerprinting
    };
  });

  // ensure dist directory exists
  if (!fs.existsSync("dist")) fs.mkdirSync("dist");

  // save to output file
  fs.writeFileSync("dist/tracker-core.json", JSON.stringify({
    version: new Date().toISOString().split("T")[0],
    totalCount: top.length,
    trackers: coreMap
  }));
  
  fs.writeFileSync("dist/tracker-extended.json", JSON.stringify({
    version: new Date().toISOString().split("T")[0],
    totalCount: extended.length,
    trackers: extendedMap
  }));
  
  console.log(`Core: ${top.length}, Extended: ${extended.length}`);
}

extract();
