import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.post("/api/scrape", async (req, res) => {
    const { url, accountId, apiToken } = req.body;

    if (!url || !accountId || !apiToken) {
      return res.status(400).json({ error: "Missing required fields: url, accountId, apiToken" });
    }

    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/markdown`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
          },
          body: JSON.stringify({ url }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Cloudflare API Error:", data);
        const errorMessage = data.errors?.[0]?.message 
          || data.error 
          || (response.status === 401 ? "Authentication error: Invalid API Token or missing permissions" : "Failed to scrape URL");
        return res.status(response.status).json({ error: errorMessage, details: data });
      }

      res.json(data);
    } catch (error) {
      console.error("Scraping error:", error);
      res.status(500).json({ error: "Internal server error during scraping" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
