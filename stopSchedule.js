import fs from "fs";
import path from "path";

const GTFS_PATH = "./gtfs";

let stopMap = new Map();

// parse CSV
function parseCSV(data) {
  const lines = data.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = line.split(",");
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = values[i]?.trim();
    });
    return obj;
  });
}

// convert HH:MM:SS ? seconds
function timeToSeconds(t) {
  const [h, m, s] = t.split(":").map(Number);
  return h * 3600 + m * 60 + s;
}

export function loadStopSchedule() {
  const raw = fs.readFileSync(path.join(GTFS_PATH, "stop_times.txt"), "utf8");
  const rows = parseCSV(raw);

  rows.forEach(r => {
    if (!stopMap.has(r.stop_id)) {
      stopMap.set(r.stop_id, []);
    }

    stopMap.get(r.stop_id).push({
      trip_id: r.trip_id,
      arrival: r.arrival_time
    });
  });

  console.log("? Stop schedule loaded:", stopMap.size);
}

export function getNextScheduled(stopId) {
  const list = stopMap.get(stopId);
  if (!list) return null;

  const now = new Date();
  const nowSec =
    now.getHours() * 3600 +
    now.getMinutes() * 60 +
    now.getSeconds();

  // find next today
  let next = list
    .map(s => ({ ...s, sec: timeToSeconds(s.arrival) }))
    .filter(s => s.sec > nowSec)
    .sort((a, b) => a.sec - b.sec)[0];

  // if none today ? take earliest (tomorrow)
  if (!next) {
    next = list
      .map(s => ({ ...s, sec: timeToSeconds(s.arrival) }))
      .sort((a, b) => a.sec - b.sec)[0];
  }

  return next;
}