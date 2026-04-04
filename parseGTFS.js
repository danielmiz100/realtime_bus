import fs from "fs";
import path from "path";
import csv from "csv-parser";

// Fix __dirname for ES modules
const __dirname = new URL(".", import.meta.url).pathname;

// -----------------------------
// GLOBAL DATA STORE
// -----------------------------
let stops = [];
let stopTimes = [];
let trips = [];
let routes = [];

// -----------------------------
// HELPER: load CSV
// -----------------------------
function loadCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

// -----------------------------
// MAIN PARSER
// -----------------------------
export async function parseGTFS() {
  try {
    console.log("Parsing GTFS files...");

    const basePath = path.join(__dirname, "gtfs");

    // Load all core GTFS files
    stops = await loadCSV(path.join(basePath, "stops.txt"));
    stopTimes = await loadCSV(path.join(basePath, "stop_times.txt"));
    trips = await loadCSV(path.join(basePath, "trips.txt"));
    routes = await loadCSV(path.join(basePath, "routes.txt"));

    console.log(`Loaded ${stops.length} stops`);
    console.log(`Loaded ${stopTimes.length} stop_times`);
    console.log(`Loaded ${trips.length} trips`);
    console.log(`Loaded ${routes.length} routes`);

    console.log("GTFS parsing complete ✅");
  } catch (err) {
    console.error("GTFS parse error:", err);
    throw err;
  }
}

// -----------------------------
// SIMPLE QUERY FUNCTION
// -----------------------------
export function getStopInfo(stopId) {
  const stop = stops.find((s) => s.stop_id === stopId);

  if (!stop) return null;

  // Get stop times for this stop
  const times = stopTimes
    .filter((st) => st.stop_id === stopId)
    .slice(0, 10); // limit for performance

  return {
    stop,
    times,
  };
}