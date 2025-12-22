# tracker-radar-pipeline

Pipeline to extract DuckDuckGo Tracker Radar data and convert it into a structured JSON file for further use.

## Description

This repository automates the extraction of tracker data from the [DuckDuckGo Tracker Radar](https://github.com/duckduckgo/tracker-radar) and converts it into a single, organized JSON file. The pipeline runs as a weekly cron job and automatically syncs the updated data to the [detecta extension](https://github.com/leolivi/detecta) repository.

## Features

- Reads all JSON files from the `tracker-radar/domains` directory.
- Extracts relevant fields: domain, owner, categories, prevalence, and fingerprinting.
- Sorts and compiles the data into a structured JSON output (`dist/tracker.json`).
- Runs automatically on a weekly schedule.

## Usage

To run the pipeline locally:

```zsh
npm run extract
```

After execution, the extracted data will be available in `dist/tracker.json`.

## Project Structure

```
tracker-radar-pipeline/
├── extract.js # Main extraction script
├── .github/
│ └── workflows/
│ └── update-tracker-radar.yml # GitHub Actions workflow
```

## Automated Workflow

The pipeline runs automatically every Monday at 9 AM UTC:

1. Clones the latest DuckDuckGo Tracker Radar data.
2. Runs `extract.js` to generate `dist/tracker.json`.
3. Copies the updated file to the [detecta extension](https://github.com/leolivi/detecta).
4. Commits and pushes changes if data has been updated.

**Manual trigger:** Available via GitHub Actions workflow dispatch.

## Dependencies

- Node.js (>= v14)
- Access to the DuckDuckGo Tracker Radar repository

## Installation

1. Clone this repository.
2. Install dependencies (if any):

```zsh
npm install
```

3. Run the extraction script:

```zsh
npm run extract
```

## License

MIT License. The source data comes from the DuckDuckGo Tracker Radar and is publicly available.

---

This pipeline is designed for easy integration into other projects and provides a regularly updated dataset of web trackers.
