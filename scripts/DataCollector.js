import fs from "fs";
import path from "path";

export class DataCollector {
    constructor(sourcePath) {
        this.data = sourcePath ? JSON.parse(fs.readFileSync(sourcePath, "utf-8")) : null;
    }

    writeDist(filename, maps) {
        for (const [key, value] of Object.entries(maps)) {
            if (Array.isArray(value) || value instanceof Set) {
                throw new TypeError(`${key} must be a plain object`)
            }
        }

        const totalCount = Object.values(maps).reduce((sum, obj) => sum + Object.keys(obj).length, 0)

        // ensure dist directory exists
        if(!fs.existsSync('dist')) fs.mkdirSync('dist');

        // save to output file
        fs.writeFileSync(`dist/${filename}`, JSON.stringify({
            version: new Date().toISOString().split("T")[0],
            totalCount,
            ...maps,
        }));
    }

    // collect all json files in the directory
    static getAllJsonFiles(dir) {
      let files = [];

      for (const item of fs.readdirSync(dir)) {
        const full = path.join(dir, item);
        const stats = fs.statSync(full);

        if (stats.isDirectory()) {
          files = files.concat(DataCollector.getAllJsonFiles(full));
        } else if (item.endsWith(".json")) {
          files.push(full);
        }
      }

      return files;
    }
}