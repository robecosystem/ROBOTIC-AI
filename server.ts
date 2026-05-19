import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { detectAddressChain } from "./server/addressDetector";
import { fetchTokenAnalysis, getTrendingTokens, scanHistory } from "./server/tokenService";
import { generateAIScores } from "./server/aiScoringService";
import { cacheService } from "./server/cacheService";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser limit configuration
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Helper function to return unified analysis
  const getFullAnalysis = async (address: string, requestedChain?: string) => {
    const trimmedAddr = address.trim();
    const detection = detectAddressChain(trimmedAddr);
    
    // Choose chain: either requested, detected, or default
    const finalChain = requestedChain || (detection.valid ? detection.chain : "Solana");
    
    const cacheKey = `${trimmedAddr}:${finalChain}`.toLowerCase();
    const cached = cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Step 1: Fetch details from live API with heuristic backups
    const dataObj = await fetchTokenAnalysis(trimmedAddr, finalChain);

    // Step 2: Query Gemini AI for score & advisors
    const aiScores = await generateAIScores(
      dataObj.token,
      dataObj.security,
      dataObj.liquidity,
      dataObj.holders,
      dataObj.socials
    );

    const fullResult = {
      address: trimmedAddr,
      chain: finalChain,
      detectedAt: new Date().toISOString(),
      token: dataObj.token,
      security: {
        ...dataObj.security,
        securityScore: aiScores.securityScore
      },
      liquidity: dataObj.liquidity,
      holders: dataObj.holders,
      priceHistory: dataObj.priceHistory,
      socials: dataObj.socials,
      ai: aiScores
    };

    // Cache the result
    cacheService.set(cacheKey, fullResult);

    // Save scan to global history (deduplicated)
    const existingIndex = scanHistory.findIndex(s => s.address.toLowerCase() === trimmedAddr.toLowerCase());
    if (existingIndex !== -1) {
      scanHistory.splice(existingIndex, 1);
    }
    scanHistory.unshift({
      address: trimmedAddr,
      chain: finalChain,
      name: dataObj.token.name,
      symbol: dataObj.token.symbol,
      score: aiScores.securityScore,
      time: new Date().toISOString()
    });
    
    // Cap scan history length
    if (scanHistory.length > 50) {
      scanHistory.pop();
    }

    return fullResult;
  };

  // 1. Trending token details
  app.get("/api/trending", (req, res) => {
    try {
      const tokens = getTrendingTokens();
      res.json(tokens);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to get trending list", details: err?.message });
    }
  });

  // 2. Scan History list
  app.get("/api/history", (req, res) => {
    res.json(scanHistory.slice(0, 15));
  });

  // 3. Main analysis endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      const { address, chain } = req.body;
      if (!address) {
        return res.status(400).json({ error: "Contract address is highly required." });
      }

      const result = await getFullAnalysis(address, chain);
      res.json(result);
    } catch (err: any) {
      console.error("Analyzer fault:", err);
      res.status(500).json({ error: "Analysis processor fault", details: err?.message });
    }
  });

  // 4. Token overview specific endpoint
  app.get("/api/token/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const chain = req.query.chain as string;
      const result = await getFullAnalysis(address, chain);
      res.json(result.token);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch token telemetry", details: err?.message });
    }
  });

  // 5. Security audit specific endpoint
  app.get("/api/security/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const chain = req.query.chain as string;
      const result = await getFullAnalysis(address, chain);
      res.json({ security: result.security, aiScore: result.ai });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to run safety analysis", details: err?.message });
    }
  });

  // 6. Liquidity specific endpoint
  app.get("/api/liquidity/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const chain = req.query.chain as string;
      const result = await getFullAnalysis(address, chain);
      res.json(result.liquidity);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to run liquidity calculation", details: err?.message });
    }
  });

  // 7. Holders concentration specific endpoint
  app.get("/api/holders/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const chain = req.query.chain as string;
      const result = await getFullAnalysis(address, chain);
      res.json(result.holders);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to compile holder layout", details: err?.message });
    }
  });

  // 8. Social activity specific endpoint
  app.get("/api/social/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const chain = req.query.chain as string;
      const result = await getFullAnalysis(address, chain);
      res.json(result.socials);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch social evaluation", details: err?.message });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting full-stack dev server with dynamic Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Production state: serving compiled static web files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ROBOTIC intelligence engine operational on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical server bootstrap error:", err);
  process.exit(1);
});
