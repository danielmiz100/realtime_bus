import express from "express";
import { loadTripMap, getTripInfo } from "./tripLookup.js";
import { getRealtimeFeed } from "./gtfsRealtime.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ ADD THIS BLOCK (CORS)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

loadTripMap();

app.get("/stop/:stopId", async (req, res) => {
  const stopId = req.params.stopId;

  try {
    const entities = await getRealtimeFeed();

    const buses = [];

    for (const entity of entities) {
      if (!entity.tripUpdate) continue;

      const tripId = entity.tripUpdate.trip.tripId;
      const tripInfo = getTripInfo(tripId);

      if (!tripInfo) continue;

      for (const update of entity.tripUpdate.stopTimeUpdate || []) {
        if (update.stopId !== stopId) continue;

        const arrivalTime = update.arrival?.time?.toNumber?.() || null;
        if (!arrivalTime) continue;

        const now = Date.now() / 1000;
        const minutesAway = Math.round((arrivalTime - now) / 60);

        if (minutesAway < 0) continue;

        buses.push({
          route: tripInfo.route,
          destination: tripInfo.destination,
          arrival_unix: arrivalTime,
          arrival_time: new Date(arrivalTime * 1000).toLocaleTimeString(),
          minutes_away: minutesAway
        });
      }
    }

    buses.sort((a, b) => a.arrival_unix - b.arrival_unix);

    res.json({
      last_updated: new Date().toLocaleTimeString(),
      count: buses.length,
      buses
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});