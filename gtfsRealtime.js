import GtfsRealtimeBindings from "gtfs-realtime-bindings";

const URL = "https://gtfsapi.translink.ca/v3/gtfsrealtime?apikey=h2kQJcW1liXq6pSOQpLn";

let cache = null;
let lastFetch = 0;

// ? 60 second cache
const CACHE_DURATION = 60000;

export async function getRealtimeFeed() {
  const now = Date.now();

  // return cached data if still fresh
  if (cache && now - lastFetch < CACHE_DURATION) {
    return cache;
  }

  const res = await fetch(URL);
  const buffer = await res.arrayBuffer();

  const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
    new Uint8Array(buffer)
  );

  cache = feed.entity;
  lastFetch = now;

  console.log("?? Fetched new GTFS data at", new Date().toLocaleTimeString());

  return cache;
}