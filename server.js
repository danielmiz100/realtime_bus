import express from "express";
import fetch from "node-fetch";
import https from "https";

const app = express();
const PORT = process.env.PORT || 3000;

// Force IPv4 (fixes ENOTFOUND issues on some hosts)
const agent = new https.Agent({
  family: 4,
});

// -----------------------------
// ROUTES
// -----------------------------

app.get("/", (req, res) => {
  res.send("Bus API running");
});

app.get("/test", (req, res) => {
  res.json({ status: "ok", time: new Date() });
});

app.get("/env", (req, res) => {
  res.json({
    TRANSLINK_API_KEY: process.env.TRANSLINK_API_KEY ? "SET" : "NOT SET",
  });
});

app.get("/api/bus", async (req, res) => {
  const stopId = req.query.stop;

  if (!stopId) {
    return res.status(400).json({ error: "Missing stop parameter" });
  }

  try {
    const apiKey = process.env.TRANSLINK_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Missing TRANSLINK_API_KEY",
      });
    }

    const url = `https://api.translink.ca/rttiapi/v1/stops/${stopId}/estimates?apikey=${apiKey}&count=3&timeframe=60`;

    console.log("Fetching:", url);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      agent, // 👈 important fix
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("TransLink API ERROR RESPONSE:", text);

      return res.status(500).json({
        error: "TransLink API error",
        details: text,
      });
    }

    const data = await response.json();

    console.log("API SUCCESS");

    res.json(data);
  } catch (err) {
    console.error("API fetch error FULL:", err);

    res.status(500).json({
      error: "Failed to fetch bus data",
      details: err.message,
    });
  }
});

// -----------------------------
// START SERVER
// -----------------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});