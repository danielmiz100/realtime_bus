import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// -----------------------------
// ROUTES
// -----------------------------

// Health check
app.get("/", (req, res) => {
  res.send("Bus API running");
});

// Test route
app.get("/test", (req, res) => {
  res.json({ status: "ok", time: new Date() });
});

// Bus lookup using TransLink API
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

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({
        error: "TransLink API error",
        details: text,
      });
    }

    const data = await response.json();

    res.json(data);
  } catch (err) {
    console.error("API fetch error:", err);
    res.status(500).json({ error: "Failed to fetch bus data" });
  }
});

// -----------------------------
// START SERVER
// -----------------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});