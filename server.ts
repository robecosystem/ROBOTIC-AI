import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { detectAddressChain } from "./server/addressDetector";
import { fetchTokenAnalysis, getTrendingTokens, scanHistory } from "./server/tokenService";
import { generateAIScores } from "./server/aiScoringService";
import { cacheService } from "./server/cacheService";
import { getAudits, saveAudit, findAuditById, findAuditByAddress } from "./server/auditDatabase";
import { getPayments, savePayment, PaymentRecord } from "./server/paymentDatabase";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser limit configuration
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Audit Database Integrations
  app.get("/api/audits", (req, res) => {
    try {
      const audits = getAudits();
      res.json(audits);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to read database logs", details: err?.message });
    }
  });

  app.get("/api/audits/:id", (req, res) => {
    try {
      const { id } = req.params;
      const result = findAuditById(id) || findAuditByAddress(id);
      if (!result) {
        return res.status(404).json({ error: `Verification certificate not found for matching parameter: ${id}` });
      }
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to query certificates", details: err?.message });
    }
  });

  app.post("/api/audits", (req, res) => {
    try {
      const record = req.body;
      if (!record || !record.id || !record.contractAddress) {
        return res.status(400).json({ error: "Invalid audit payload." });
      }
      const success = saveAudit(record);
      if (!success) {
        return res.status(500).json({ error: "Failure storing verification certificate on disk storage." });
      }
      res.json({ success: true, record });
    } catch (err: any) {
      res.status(500).json({ error: "Storage node error.", details: err?.message });
    }
  });

  // $ROB Security Payments database routes
  app.get("/api/payments", (req, res) => {
    try {
      const payments = getPayments();
      res.json(payments);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to read payments registry", details: err?.message });
    }
  });

  app.post("/api/payments", (req, res) => {
    try {
      const payment: PaymentRecord = req.body;
      if (!payment || !payment.signature || !payment.walletAddress) {
        return res.status(400).json({ error: "Invalid payment payload. Signature and Wallet Address required." });
      }
      const success = savePayment(payment);
      if (!success) {
        return res.status(500).json({ error: "Failed to log transaction audit." });
      }
      res.json({ success: true, payment });
    } catch (err: any) {
      res.status(500).json({ error: "Payment storage node fault.", details: err?.message });
    }
  });

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

  // 2b. Gemini intelligent advisor chat route
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { message, history, scannedResult } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Query message parameter is required." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      let responseText = "";

      if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
        try {
          const ai = new GoogleGenAI({
            apiKey: apiKey,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              }
            }
          });

          // Inject professional, cybernetic security context based on real scanned token features
          let contextInstruction = `You are a professional blockchain security auditor and risk analyst on the ROBOTIC Platform. Your personality is hyper-intelligent, precise, professional, and technical.
          
          Your mission is to evaluate smart contract characteristics, bytecode anomalies, and developer capabilities. Formulate highly technical yet straightforward explanations that focus on risk patterns, buy/sell transaction taxes, honeypot traps, and supply/ownership administrators.`;

          if (scannedResult) {
            const sym = scannedResult.token?.symbol || "selected token";
            const score = scannedResult.security?.securityScore || scannedResult.ai?.securityScore || 0;
            const rating = scannedResult.ai?.rating || "Moderate Risk";
            const buyTax = scannedResult.security?.buyTax ?? 0;
            const sellTax = scannedResult.security?.sellTax ?? 0;
            const renounced = scannedResult.security?.ownershipRenounced ? "RENOUNCED / LOCKED" : "ACTIVE / OWNED BY ADMIN";
            const mintable = scannedResult.security?.mintable ? "YES (Inflation accessible)" : "NO (Capped supply)";
            const honeypot = scannedResult.security?.honeypot ? "CRITICAL THREAT / CANNOT SELL" : "CLEAN / NO TRAPS DETECTED";
            const pauseNode = scannedResult.security?.paused ? "YES (Transfer can be paused)" : "NO (Non-pausable)";
            const flagsList = Array.isArray(scannedResult.ai?.redFlags) ? scannedResult.ai.redFlags.join(", ") : "None";
            const strengthsList = Array.isArray(scannedResult.ai?.keyStrengths) ? scannedResult.ai.keyStrengths.join(", ") : "None";
            const recommendation = scannedResult.ai?.recommendation || "Maintain Standard Speculative Precaution.";

            contextInstruction += `\n\nCURB ANALYSIS CONTEXT FOR THIS TOKEN:
            - Token Name & Symbol: ${scannedResult.token?.name || 'Unknown'} (${sym})
            - Registry Deployment Network: ${scannedResult.chain || 'Solana'}
            - Safety Indicator Score: ${score} / 100 Safety Score.
            - Evaluation Class: ${rating}.
            - LP Locking Level: ${scannedResult.liquidity?.lpLocked ?? 0}% locked LP.
            - Owner modifiers: ${renounced}.
            - Bytecode inflation: Is mintable? ${mintable}.
            - Buy Fee Tax Slip: ${buyTax}% | Sell Fee Tax Slip: ${sellTax}%.
            - Transfer Pausing nodes: Is pausable? ${pauseNode}.
            - Dynamic Honeypot: ${honeypot}.
            - Detected Red Flag Vulnerabilities: ${flagsList}.
            - Primary Strengths Verified: ${strengthsList}.
            - Core Advisor Recommendation: ${recommendation}`;
          }

          contextInstruction += `\n\nINSTRUCTIONS FOR DIALOGUE:
          1. Answer the user's message concisely with high-density security feedback.
          2. Explicitly explain what the audited characteristics (like ownership privileges, mint rules, honeypots, or tax levels) signify for their safety.
          3. Keep your response centered, professional, the text formatted cleanly in markdown, and within 120-150 words. Do not praise the system or use generic marketing copy.`;

          const contents: any[] = [];
          if (history && Array.isArray(history)) {
            // Keep maximum last 6 dialogue segments to save context/tokens
            const recentHistory = history.slice(-6);
            recentHistory.forEach(h => {
              contents.push({
                role: h.sender === 'user' ? 'user' : 'model',
                parts: [{ text: h.text }]
              });
            });
          }
          contents.push({
            role: 'user',
            parts: [{ text: message }]
          });

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: contents,
            config: {
              systemInstruction: contextInstruction,
              temperature: 0.7,
            }
          });

          responseText = response.text ? response.text.trim() : "";
        } catch (innerErr: any) {
          console.warn("AI Generation failure. Reverting to automated heuristic processor:", innerErr?.message || innerErr);
        }
      }

      // If Gemini API is unconfigured or failed, process with high-fidelity custom Heuristics matching the user's intent.
      if (!responseText) {
        const query = message.toLowerCase();
        if (scannedResult) {
          const sym = scannedResult.token?.symbol || "token";
          const score = scannedResult.security?.securityScore || scannedResult.ai?.securityScore || 0;
          const rating = scannedResult.ai?.rating || "Moderate Risk";
          
          if (query.includes("safe") || query.includes("honey") || query.includes("rating") || query.includes("legit") || query.includes("audit")) {
            responseText = `According to the ROBOTIC scanner, **${symbolSafe(scannedResult.token)}** has a safety rating of **${rating}** with our comprehensive security score of **${score} / 100**. ${scannedResult.security?.honeypot ? "⚠️ **CRITICAL ALERT**: This token was scanned as a **Honeypot**, meaning selling is restricted by compile codes." : "No honeypot or trap compilation anomalies were detected during Bytecode evaluation."}`;
          } else if (query.includes("strength") || query.includes("good") || query.includes("key") || query.includes("feature")) {
            const strengths = Array.isArray(scannedResult.ai?.keyStrengths) && scannedResult.ai.keyStrengths.length > 0
              ? scannedResult.ai.keyStrengths.map((s: string) => `✓ **${s}**`).join("\n")
              : "✓ Under-centralized distribution with robust initial liquidity backing.";
            responseText = `Here are the top **Key Strengths** isolated for the audited ${sym} contract:\n\n${strengths}`;
          } else if (query.includes("flag") || query.includes("risk") || query.includes("danger") || query.includes("vulnerability") || query.includes("weak")) {
            const flags = Array.isArray(scannedResult.ai?.redFlags) && scannedResult.ai.redFlags.length > 0
              ? scannedResult.ai.redFlags.map((f: string) => `❌ **${f}**`).join("\n")
              : "No high-severity code vulnerabilities detected. Contract follows best practices.";
            responseText = `Here are the detected **Red Flags/Vulnerabilities** for ${sym}:\n\n${flags}`;
          } else if (query.includes("own") || query.includes("admin") || query.includes("renounce")) {
            responseText = scannedResult.security?.ownershipRenounced
              ? `Contract ownership for **${sym}** is **RENOUNCED**. This guarantees that no administrative address can lock trading, block wallets, or adjust buy/sell slippage fees.`
              : `⚠️ **Active Admin Controls**: Contract ownership is not renounced. The current administrator can execute high-risk operations, pause token trading, or elevate sell taxes (${scannedResult.security?.sellTax ?? 0}% currently).`;
          } else if (query.includes("mint") || query.includes("inflation") || query.includes("supply")) {
            responseText = scannedResult.security?.mintable
              ? `⚠️ **Supply Inflation Gate**: The minting privileges remain active in the compile bytecode of ${sym}. The developer holds the ability to mint additional tokens at will, potentially crashing market liquidity.`
              : `Supply for ${sym} is strictly fixed and capped. The bytecode does not include active minting methods, preventing supply inflation.`;
          } else if (query.includes("tax") || query.includes("fee") || query.includes("slip")) {
            responseText = `Current transaction tax indices for **${sym}** are: **${scannedResult.security?.buyTax ?? 0}% Buy Tax** and **${scannedResult.security?.sellTax ?? 0}% Sell Tax**. Taxes above 10% are considered high-risk, as developers can capture significant user assets during swaps.`;
          } else {
            responseText = `For ${sym}, the decentralized diagnostic registers compiled an evaluation rating of **${rating}** (${score} score). Principal parameters:\n- Renounced Ownership: ${scannedResult.security?.ownershipRenounced ? "Yes" : "No"}\n- Mintable privileges: ${scannedResult.security?.mintable ? "Yes" : "No"}\n- Locked Initial LP: ${scannedResult.liquidity?.lpLocked ?? 0}%\n- Taxes Buy/Sell: ${scannedResult.security?.buyTax ?? 0}% / ${scannedResult.security?.sellTax ?? 0}%.`;
          }
        } else {
          // General advice on contract indicators
          if (query.includes("safe") || query.includes("honey") || query.includes("rug")) {
            responseText = "When determining safety, prioritize reviewing **LP Lock Percentage** (aim for >90% locked), **Ownership Status** (renounced is optimal), and **Transaction Taxes** (fees below 10%). Standard honeypots manifest as sell taxes set to 100%.";
          } else if (query.includes("own") || query.includes("renounce")) {
            responseText = "Renouncing contract ownership permanently removes developer backdoors. Without a renounced contract, creators may freeze transfers, block individual wallets, or withdraw LP balances.";
          } else if (query.includes("mint")) {
            responseText = "A mint function lets the manager generate infinite supply, diluting existing holders instantly. Ensure the contract is not mintable or has supply locks.";
          } else {
            responseText = "Systems Dashboard Chat operational. Scan or search for a specific token contract on our main portal to fetch real-time safety metrics, key strengths, and specific security evaluations of that coin.";
          }
        }
      }

      res.json({ text: responseText });
    } catch (err: any) {
      console.error("Gemini Advisor Router fault:", err);
      res.status(500).json({ error: "Intelligent helper route error.", details: err?.message });
    }
  });

  // Helper helper to format names safely
  function symbolSafe(tokenObj: any) {
    if (!tokenObj) return "Token";
    return `${tokenObj.name || 'Token'} (${tokenObj.symbol || 'N/A'})`;
  }

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
