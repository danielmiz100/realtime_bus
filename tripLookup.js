import fs from "fs";
import path from "path";

const GTFS_PATH = "./gtfs";

// --- CSV parser (clean) ---
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

// --- Build lookup ---
let tripMap = new Map();

export function loadTripMap() {
  const tripsRaw = fs.readFileSync(path.join(GTFS_PATH, "trips.txt"), "utf8");
  const routesRaw = fs.readFileSync(path.join(GTFS_PATH, "routes.txt"), "utf8");

  const trips = parseCSV(tripsRaw);
  const routes = parseCSV(routesRaw);

  // build route lookup first
  const routeMap = new Map();
  routes.forEach(r => {
    routeMap.set(r.route_id, r);
  });

  // build trip lookup
  trips.forEach(t => {
    const route = routeMap.get(t.route_id);
    if (!route) return;

    tripMap.set(t.trip_id, {
      route: route.route_short_name,
      destination: t.trip_headsign
    });
  });

  console.log("? Trip map loaded:", tripMap.size);
}

export function getTripInfo(tripId) {
  return tripMap.get(tripId) || null;
}