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
  const allCategories = new Set();
  console.log(`Found ${allFiles.length} JSON files`);

  // map through files and extract relevant data
  const trackers = allFiles
    .map((file) => {
      try {
        const data = JSON.parse(fs.readFileSync(file, "utf8"));
        // skip if no categories
        if (!data.categories?.length) return null;

        // collect all categories
        data.categories.forEach((cat) => allCategories.add(cat));

        // extract relevant fields
        return {
          domain: data.domain,
          owner: data.owner?.name || null,
          categories: data.categories,
          prevalence: data.prevalence || 0,
          fingerprinting: data.fingerprinting || 0,
        };
      } catch (e) {
        console.error(`Error parsing ${file}: ${e.message}`);
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.prevalence - a.prevalence);

  const output = {
    version: new Date().toISOString().split("T")[0],
    totalCount: trackers.length,
    trackers,
    availabeCategories: Array.from(allCategories).sort(),
  };

  // ensure dist directory exists
  if (!fs.existsSync("dist")) fs.mkdirSync("dist");

  // save to output file
  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2));
  console.log(`Exported ${trackers.length} trackers`);
}

extract();
