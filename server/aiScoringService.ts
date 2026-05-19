import { GoogleGenAI, Type } from "@google/genai";
import { TokenDetails, SecurityFeatures, LiquidityDetails, HolderAnalysis, SocialMetrics, AIScoringDetails } from "./types";

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      console.log("Successfully initialized Gemini API AI Scoring Service connection.");
    } else {
      console.warn("GEMINI_API_KEY is not configured or placeholder detected. Falling back to Robotic Heuristic Rule-Based Scoring.");
    }
  }
  return aiClient;
}

// Highly accurate heuristic fallback generator representing simulated expert security analysis
export function generateHeuristicScores(
  token: TokenDetails,
  security: SecurityFeatures,
  liquidity: LiquidityDetails,
  holders: HolderAnalysis,
  socials: SocialMetrics
): AIScoringDetails {
  let score = security.securityScore;
  
  // Calculate probability scores
  let rugProbability = 100 - score;
  let scamProbability = Math.max(0, 100 - score - 5);
  
  // Custom modifiers
  if (security.honeypot) {
    rugProbability = 99;
    scamProbability = 99;
  }
  
  if (!security.ownershipRenounced) {
    scamProbability += 10;
  }
  if (liquidity.lpLocked < 70) {
    rugProbability += 15;
  }
  if (holders.top10Concentration > 60) {
    scamProbability += 15;
  }

  rugProbability = Math.min(99, Math.max(1, rugProbability));
  scamProbability = Math.min(99, Math.max(1, scamProbability));

  // Rating allocation
  let rating: 'Very Safe' | 'Safe' | 'Moderate Risk' | 'High Risk' | 'Dangerous' = 'Moderate Risk';
  if (score >= 90 && !security.honeypot) rating = 'Very Safe';
  else if (score >= 75 && !security.honeypot) rating = 'Safe';
  else if (score >= 55 && !security.honeypot) rating = 'Moderate Risk';
  else if (score >= 30 && !security.honeypot) rating = 'High Risk';
  else rating = 'Dangerous';

  // Momentum score based on price change and volume
  let momentumScore = 50;
  if (token.priceChange24h > 15) momentumScore += 15;
  if (token.priceChange24h > 100) momentumScore += 25;
  if (token.volume24h > 50000) momentumScore += 10;
  momentumScore = Math.min(98, Math.max(10, momentumScore));

  const trustScore = Math.min(98, Math.max(5, Math.round(score * 0.9 + (100 - scamProbability) * 0.1)));

  // Key Strengths
  const keyStrengths: string[] = [];
  if (security.ownershipRenounced) keyStrengths.push("Contract ownership is fully renounced.");
  if (liquidity.lpLocked >= 90) keyStrengths.push(`Locked Liquidity: Extensive LP protection locks ${liquidity.lpLocked}% of funds.`);
  if (security.buyTax === 0 && security.sellTax === 0) keyStrengths.push("Tax-Free: 0% buy/sell transaction taxes.");
  if (holders.top10Concentration < 40) keyStrengths.push("Organic Distribution: Low wallet supply centralization (top 10 hold < 45%).");
  if (liquidity.poolAgeDays > 60) keyStrengths.push("Pool Longevity: Active pool for over 2 months indicates sustainable operation.");
  if (keyStrengths.length === 0) keyStrengths.push("Token exhibits standard, active trading volume.");

  // Red flags
  const redFlags: string[] = [];
  if (security.honeypot) redFlags.push("CRITICAL: Code signature matches Honeypot attack vectors.");
  if (!security.ownershipRenounced) redFlags.push("Active Ownership: Owner can adjust settings, pause, or blacklist wallets.");
  if (liquidity.lpLocked < 50) redFlags.push(`Vulnerable LP: Unlocked liquidity pool percentage is dangerous (${liquidity.lpLocked}% remaining).`);
  if (security.mintable) redFlags.push("Supply Inflation: Minting privileges are unlocked.");
  if (security.freezable) redFlags.push("Account Freezing: Control panel handles wallet freeze actions.");
  if (security.buyTax > 10 || security.sellTax > 10) redFlags.push(`Exploitative Taxes: Transaction slip fee exceeds safety margins (${Math.max(security.buyTax, security.sellTax)}%).`);
  if (holders.top10Concentration > 60) redFlags.push(`Supply Clutter: Whales control ${holders.top10Concentration}% of token supply.`);

  let recommendation = `This asset displays a safety level of ${rating}.`;
  let suggestedAction = "Conduct extreme caution before investing.";
  let riskReward = "Symmetric";
  let buyOpportunityScore = Math.round(trustScore * 0.8 + (100 - rugProbability) * 0.2);

  if (rating === 'Very Safe') {
    recommendation = "Low security footprint detected. Liquidity is securely pinned and ownership privileges are fully locked.";
    suggestedAction = "Strong candidate for scaling. Scalable buy orders recommended.";
    riskReward = "Extremely Favorable";
    buyOpportunityScore = Math.min(98, buyOpportunityScore + 10);
  } else if (rating === 'Safe') {
    recommendation = "Reliable contract structure. Mild administrative controls remain, but pool metrics hold high safety ratios.";
    suggestedAction = "Suitable for investment. Review social media engagement profiles.";
    riskReward = "Highly Favorable";
  } else if (rating === 'Moderate Risk') {
    recommendation = "Warning: Token exhibits active management nodes (non-renounced or supply capabilities).";
    suggestedAction = "Keep capital allocations restricted to speculative risk quotas.";
    riskReward = "Speculative";
  } else if (rating === 'High Risk') {
    recommendation = "Caution advised: Highly centralized wallet list, bad lock timelines, or questionable code adjustments.";
    suggestedAction = "Strictly avoid unless dealing with short-term arbitrage allocations.";
    riskReward = "Highly Unfavorable";
  } else {
    recommendation = "Extreme Security Event: Honeypot features or critical scam patterns detected.";
    suggestedAction = "Do NOT buy. Immediate security alert. Exit positions immediately.";
    riskReward = "Suicide Trade";
    buyOpportunityScore = 2;
  }

  return {
    securityScore: Math.round(score),
    rugProbability,
    scamProbability,
    trustScore,
    momentumScore,
    rating,
    recommendation,
    keyStrengths,
    redFlags,
    suggestedAction,
    buyOpportunityScore,
    riskReward
  };
}

export async function generateAIScores(
  token: TokenDetails,
  security: SecurityFeatures,
  liquidity: LiquidityDetails,
  holders: HolderAnalysis,
  socials: SocialMetrics
): Promise<AIScoringDetails> {
  const ai = getGeminiClient();
  const heuristics = generateHeuristicScores(token, security, liquidity, holders, socials);
  
  if (!ai) {
    return heuristics;
  }

  try {
    const prompt = `
    Analyze the following cryptocurrency token data for security risks, rug pulling risks, and overall safety and generate a highly polished robotic/professional audit.
    
    TOKEN METADATA:
    Name: ${token.name} (${token.symbol})
    Chain: ${token.chain}
    Price: $${token.price}
    Market Cap: $${token.marketCap}
    Liquidity Pool USD: $${token.liquidityUSD}
    Total Supply: ${token.totalSupply}
    Holders: ${token.holders}
    24h Volume: $${token.volume24h}
    24h Change: ${token.priceChange24h}%
    Website: ${token.websiteUrl || 'None'}
    Telegram: ${token.telegramUrl || 'None'}
    
    SECURITY INDICATORS:
    Is Ownership Renounced: ${security.ownershipRenounced}
    Is Mintable: ${security.mintable}
    Is Freezable: ${security.freezable}
    Is Honeypot: ${security.honeypot}
    Buy Tax: ${security.buyTax}% | Sell Tax: ${security.sellTax}%
    Is Proxy: ${security.isProxy}
    Is Transfer Pausable: ${security.paused}
    Number of warnings from static rules: ${security.risksCount}
    Warnings noted: ${security.warnings.join(', ')}
    
    LIQUIDITY INDICATORS:
    LP tokens locked: ${liquidity.lpLocked}%
    LP tokens burned: ${liquidity.lpBurned}%
    LP Locked timeline: ${liquidity.lockExpiration || 'No lock active'}
    Unlocked liquidity cash value: $${liquidity.unlockedLiquidityUSD}
    Pool age: ${liquidity.poolAgeDays} days
    DEX: ${liquidity.dexName}
    
    HOLDER CONCENTRATION:
    Top 10 concentration: ${holders.top10Concentration}%
    Insider wallet grouping risk: ${holders.insiderRisk}
    Whales: ${holders.whaleCount}
    
    SOCIAL METRICS:
    Website Quality Score (0-100): ${socials.websiteQualityScore}
    Social Sentiment: ${socials.socialSentiment}

    INSTRUCTIONS:
    Evaluate this token rigorously. You must respond with a JSON object that satisfies this schema:
    {
      "securityScore": (integer between 0 and 100),
      "rugProbability": (integer between 0 and 100),
      "scamProbability": (integer between 0 and 100),
      "trustScore": (integer between 0 and 100),
      "momentumScore": (integer between 0 and 100),
      "rating": (strictly "Very Safe" | "Safe" | "Moderate Risk" | "High Risk" | "Dangerous"),
      "recommendation": (A brief human-readable overview explaining the main reason for the rating, max 200 words),
      "keyStrengths": (array of strings, e.g. "Full pool locked till 2028", max 4 items),
      "redFlags": (array of strings, e.g. "Mint functions remain accessible", max 4 items),
      "suggestedAction": (string outlining recommended trading protocol, e.g. "Speculative entry only" or "Complete avoidance"),
      "buyOpportunityScore": (integer between 0 and 100),
      "riskReward": (string rating the safety to payoff ratio, e.g. "Highly Favorable", "Extremely Volatile")
    }

    Keep the rating professional, concise, tech-focused, and highly direct. Avoid promotional generic slop.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["securityScore", "rugProbability", "scamProbability", "trustScore", "momentumScore", "rating", "recommendation", "keyStrengths", "redFlags", "suggestedAction", "buyOpportunityScore", "riskReward"],
          properties: {
            securityScore: { type: Type.INTEGER },
            rugProbability: { type: Type.INTEGER },
            scamProbability: { type: Type.INTEGER },
            trustScore: { type: Type.INTEGER },
            momentumScore: { type: Type.INTEGER },
            rating: { type: Type.STRING, enum: ["Very Safe", "Safe", "Moderate Risk", "High Risk", "Dangerous"] },
            recommendation: { type: Type.STRING },
            keyStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedAction: { type: Type.STRING },
            buyOpportunityScore: { type: Type.INTEGER },
            riskReward: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text ? response.text.trim() : "";
    if (text) {
      const parsed: AIScoringDetails = JSON.parse(text);
      return parsed;
    }
  } catch (error) {
    console.error("Failed to query Gemini API scoring model. Falling back to algorithmic indicators:", error);
  }

  return heuristics;
}
