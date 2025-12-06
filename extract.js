import fs from "fs";
import path from "path";

const DOMAINS_DIR = "tracker-radar/domains";
const OUT_JSON = "dist/tracker.json";

function getAllJsonFiles(dir) {
  const files = [];

  function walk(currentPath) {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (item.endsWith(".json")) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

function extractData() {
  const trackers = [];
  // go through all JSON files in the DOMAINS_DIR
  const allFiles = getAllJsonFiles(DOMAINS_DIR);

  console.log(`Found ${allFiles.length} JSON files`);

  for (const filePath of allFiles) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

      // skip if no categories
      if (!data.categories || data.categories.length === 0) {
        continue;
      }

      trackers.push({
        domain: data.domain,
        owner: data.owner?.name || null,
        categories: data.categories,
        prevalence: data.prevalence || 0,
        fingerprinting: data.fingerprinting || 0,
        sites: data.sites || 0,
      });
    } catch (err) {
      console.error(`Error parsing ${filePath}:`, err.message);
    }
  }

  // sort descending
  trackers.sort((a, b) => b.prevalence - a.prevalence);

  // JSON output
  const output = {
    version: new Date().toISOString().split("T")[0],
    trackers: trackers,
    totalCount: trackers.length,
  };

  if (!fs.existsSync("./dist")) {
    fs.mkdirSync("./dist");
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify(output, null, 2));
  console.log(`Exported ${trackers.length} trackers with categories`);
}

extractData();
