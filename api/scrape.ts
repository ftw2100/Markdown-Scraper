import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
      const errorMessage =
        data.errors?.[0]?.message ||
        data.error ||
        (response.status === 401
          ? "Authentication error: Invalid API Token or missing permissions"
          : "Failed to scrape URL");
      return res.status(response.status).json({ error: errorMessage, details: data });
    }

    return res.json(data);
  } catch (error) {
    console.error("Scraping error:", error);
    return res.status(500).json({ error: "Internal server error during scraping" });
  }
}
