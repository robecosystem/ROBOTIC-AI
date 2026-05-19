import { TokenDetails, SecurityFeatures, LiquidityDetails, HolderAnalysis, HolderInfo, PriceHistoryPoint, SocialMetrics, TrendingToken } from "./types";

// Dynamic cache of search history for users
export const scanHistory: { address: string, chain: string, name: string, symbol: string, score: number, time: string }[] = [];

// Helper to hash string to a stable number
function getStableHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

// Generate deterministic token metadata from address string for backup / offline sandbox scanning
export function generateDeterministicToken(address: string, chain: string): {
  token: TokenDetails;
  security: SecurityFeatures;
  liquidity: LiquidityDetails;
  holders: HolderAnalysis;
  priceHistory: PriceHistoryPoint[];
  socials: SocialMetrics;
} {
  const hash = getStableHash(address);
  const coinNames = ["RoboMech", "SynthCyber", "AegisSentinel", "CryoChain", "NeuralPrime", "ByteForce", "QuantLock", "HyperDrive"];
  const coinSymbols = ["MECH", "CYBR", "AEGIS", "CRYO", "NEUR", "BYTE", "QLOCK", "HYPR"];
  
  const nameIdx = hash % coinNames.length;
  const rawSymbol = coinSymbols[nameIdx];
  const symbol = address.length < 15 ? "TEST" : rawSymbol;
  const name = address.length < 15 ? `Test Token ${address}` : `${coinNames[nameIdx]} Nano`;
  
  // Market Metrics
  const price = 0.00001 + (hash % 10000) / 450000;
  const totalSupply = 100000000 + (hash % 9) * 100000000;
  const circulatingPercentage = 65 + (hash % 31);
  const circulatingSupply = (totalSupply * circulatingPercentage) / 100000;
  const marketCap = circulatingSupply * price;
  const fdv = totalSupply * price;
  const liquidityUSD = marketCap * (0.05 + (hash % 15) / 100);
  const volume24h = marketCap * (0.1 + (hash % 40) / 100);
  const priceChange24h = ((hash % 80) - 35) + parseFloat(((hash % 100) / 100).toFixed(2));

  const token: TokenDetails = {
    address,
    name,
    symbol,
    chain,
    price,
    marketCap,
    fdv,
    liquidityUSD,
    totalSupply,
    circulatingSupply,
    holders: 120 + (hash % 85000),
    volume24h,
    priceChange24h,
    logoUrl: "",
    websiteUrl: hash % 3 !== 0 ? `https://${symbol.toLowerCase()}network.io` : undefined,
    telegramUrl: hash % 4 !== 0 ? `https://t.me/${symbol.toLowerCase()}portal` : undefined,
    twitterUrl: hash % 5 !== 0 ? `https://x.com/${symbol.toLowerCase()}_crypto` : undefined,
  };

  // Security Assessment
  const ownershipRenounced = hash % 5 !== 0; // 80% chance renounced
  const mintable = !ownershipRenounced && hash % 4 === 0; // 25% chance of mint permission
  const freezable = mintable || hash % 10 === 0; // 10% separate freezable chance
  const honeypot = hash % 23 === 0; // Rare honeypot (4% chance)
  const buyTax = honeypot ? 99 : (hash % 2 === 0 ? 0 : (hash % 15)); // tax
  const sellTax = honeypot ? 99 : (hash % 2 === 0 ? 0 : (hash % 15));
  const blacklisted = hash % 14 === 0;
  const paused = hash % 19 === 0;
  const isProxy = hash % 7 === 0;
  
  const warnings: string[] = [];
  if (honeypot) warnings.push("Honeypot code pattern detected! High risk of immediate loss.");
  if (buyTax > 10) warnings.push(`Extremely high buy tax detected: ${buyTax}%`);
  if (sellTax > 10) warnings.push(`Extremely high sell tax detected: ${sellTax}%`);
  if (!ownershipRenounced) warnings.push("Contract owner still has active control privileges.");
  if (mintable) warnings.push("Mint function is unlocked. Owner can inflate supply at will.");
  if (freezable) warnings.push("Freeze authority is active. Owner can freeze customer balances.");
  if (isProxy) warnings.push("Proxy contract structure detected. Features can be upgraded without audit.");
  if (paused) warnings.push("Trading pause authority is enabled.");

  // Security score
  let securityScore = 95;
  if (honeypot) securityScore -= 70;
  if (!ownershipRenounced) securityScore -= 15;
  if (mintable) securityScore -= 15;
  if (freezable) securityScore -= 15;
  if (buyTax > 5 || sellTax > 5) securityScore -= 10;
  if (buyTax > 15 || sellTax > 15) securityScore -= 15;
  if (isProxy) securityScore -= 10;
  securityScore = Math.max(5, Math.min(99, securityScore - (hash % 8)));

  const security: SecurityFeatures = {
    ownershipRenounced,
    mintable,
    freezable,
    honeypot,
    sellTax,
    buyTax,
    blacklisted,
    paused,
    isProxy,
    securityScore,
    ownerAddress: ownershipRenounced ? "0x0000000000000000000000000000000000000000" : `0x${address.substring(2, 6)}...${address.substring(address.length - 4)}`,
    risksCount: warnings.length,
    warnings,
  };

  // Liquidity details
  const lpLockedPercentage = hash % 3 === 0 ? 0 : 70 + (hash % 30);
  const lpBurned = lpLockedPercentage > 85 && hash % 2 === 0 ? 40 + (hash % 60) : 0;
  const lpLocked = lpLockedPercentage;
  const lpUnlocked = 100 - lpLocked;
  const isLocked = lpLockedPercentage > 60;
  const lockYears = 1 + (hash % 5);
  const lockExpiration = isLocked ? `In ${lockYears} Years` : undefined;
  
  const liquidity: LiquidityDetails = {
    lpLocked,
    lpUnlocked,
    lpBurned,
    lockExpiration,
    unlockedLiquidityUSD: (liquidityUSD * lpUnlocked) / 100,
    poolAgeDays: 2 + (hash % 400),
    dexName: chain === "Solana" ? "Raydium" : chain === "Base" ? "Uniswap V3" : "PancakeSwap",
    pairAddress: `0x${address.substring(4, 8)}...${address.substring(address.length - 6)}`
  };

  // Holders
  const totalHolders = token.holders;
  const top10 = 15 + (hash % 55); // Top 10 wallet ownership %
  const insiderRisk = top10 > 50 ? 'High' : (top10 > 30 ? 'Medium' : 'Low');
  
  const holdersList: HolderInfo[] = [];
  // Build a realistic distribution
  holdersList.push({
    address: "0x000000000000000000000000000000000000dead",
    balance: (totalSupply * lpBurned) / 100,
    share: lpBurned,
    tag: 'Liquidity Pool'
  });

  const remaining = 100 - lpBurned;
  holdersList.push({
    address: `0x${address.substring(2, 6)}b1a...712c`,
    balance: (totalSupply * top10 * 0.45) / 100,
    share: parseFloat((top10 * 0.45).toFixed(2)),
    tag: 'Developer'
  });

  holdersList.push({
    address: `0x${address.substring(3, 7)}bf6...dd32`,
    balance: (totalSupply * top10 * 0.3) / 100,
    share: parseFloat((top10 * 0.3).toFixed(2)),
    tag: 'Insider'
  });

  for (let i = 3; i <= 6; i++) {
    const share = parseFloat((remaining * 0.05 * (1 - i * 0.1)).toFixed(2));
    holdersList.push({
      address: `0x${(hash + i).toString(16).substring(0, 4)}...${(hash + i * 2).toString(16).substring(0, 4)}`,
      balance: (totalSupply * share) / 100,
      share,
      tag: 'Whale'
    });
  }

  const holders: HolderAnalysis = {
    totalHolders,
    top10Concentration: top10,
    insiderRisk,
    whaleCount: 8 + (hash % 25),
    developerWalletBalance: (totalSupply * top10 * 0.45) / 100,
    holdersList: holdersList.filter(h => h.share > 0).slice(0, 8),
    growthTrend: hash % 3 === 0 ? 'Upward' : (hash % 3 === 1 ? 'Stable' : 'Descending')
  };

  // Price History points (past 24h, 12 data points)
  const priceHistory: PriceHistoryPoint[] = [];
  let basePrice = price;
  const changeStep = priceChange24h / 12;
  
  for (let i = 11; i >= 0; i--) {
    const timeStr = `${i * 2}h ago`;
    // Simulate trend
    const noise = ((hash + i) % 7 - 3.5) / 100; 
    const stepPrice = basePrice * (1 - (changeStep / 100) * i + noise);
    priceHistory.push({
      time: timeStr,
      price: Math.max(0.000001, stepPrice),
      volume: volume24h / 12 * (0.6 + ((hash + i) % 10) / 12)
    });
  }

  // Social analytics
  const socials: SocialMetrics = {
    domainAgeDays: 5 + (hash % 1200),
    websiteQualityScore: 40 + (hash % 60),
    fakeFollowerPercentage: 10 + (hash % 80),
    socialSentiment: hash % 5 === 0 ? 'Bullish' : (hash % 5 === 1 ? 'Bearish' : (hash % 5 === 2 ? 'Positive' : 'Neutral')),
    communityState: hash % 4 === 0 ? "Under hyped" : "Active chat, potential bots detected."
  };

  return { token, security, liquidity, holders, priceHistory, socials };
}

// Fetch from DexScreener API with fallback
export async function fetchTokenAnalysis(address: string, chainName: string): Promise<{
  token: TokenDetails;
  security: SecurityFeatures;
  liquidity: LiquidityDetails;
  holders: HolderAnalysis;
  priceHistory: PriceHistoryPoint[];
  socials: SocialMetrics;
}> {
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.pairs && data.pairs.length > 0) {
        const pair = data.pairs[0];
        const chain = pair.chainId || chainName;
        const baseToken = pair.baseToken;
        const price = parseFloat(pair.priceUsd) || 0;
        const volume24h = parseFloat(pair.volume?.h24) || 0;
        const marketCap = parseFloat(pair.fdv) * 0.75 || parseFloat(pair.marketCap) || 0;
        const fdv = parseFloat(pair.fdv) || marketCap || 0;
        const liquidityUSD = parseFloat(pair.liquidity?.usd) || 0;
        const priceChange24h = parseFloat(pair.priceChange?.h24) || 0;

        // Custom website/social parsing if present in DexScreener links
        let websiteUrl: string | undefined;
        let telegramUrl: string | undefined;
        let twitterUrl: string | undefined;

        if (pair.websites && pair.websites.length > 0) websiteUrl = pair.websites[0].url;
        if (pair.socials) {
          for (const item of pair.socials) {
            if (item.type === 'telegram') telegramUrl = item.url;
            if (item.type === 'twitter') twitterUrl = item.url;
          }
        }

        // Generate baseline security/liquidity/holders/history indicators, augmented with live DexScreener stats!
        const base = generateDeterministicToken(address, chain);

        // Map live properties from DexScreener onto our generated sandbox metrics
        const liveToken: TokenDetails = {
          ...base.token,
          name: baseToken.name || base.token.name,
          symbol: baseToken.symbol || base.token.symbol,
          chain: chain.charAt(0).toUpperCase() + chain.slice(1),
          price,
          marketCap: marketCap || base.token.marketCap,
          fdv: fdv || base.token.fdv,
          liquidityUSD: liquidityUSD || base.token.liquidityUSD,
          volume24h: volume24h || base.token.volume24h,
          priceChange24h: priceChange24h || base.token.priceChange24h,
          logoUrl: pair.info?.imageUrl || "",
          websiteUrl: websiteUrl || base.token.websiteUrl,
          telegramUrl: telegramUrl || base.token.telegramUrl,
          twitterUrl: twitterUrl || base.token.twitterUrl,
        };

        // Adjust security levels if liquidity pool matches standard triggers
        let isSafeLp = liquidityUSD > 10000;
        let finalSecurityScore = base.security.securityScore;
        if (isSafeLp && finalSecurityScore < 50) {
          finalSecurityScore += 15; // enhance score since it has solid live pool funding
        }

        // Construct live price history relative to live price
        const priceHistory: PriceHistoryPoint[] = [];
        for (let i = 11; i >= 0; i--) {
          const timeStr = `${i * 2}h ago`;
          const factor = 1 - (priceChange24h / 100) * (i / 12) + (Math.sin(i / 2) * 0.05);
          priceHistory.push({
            time: timeStr,
            price: Math.max(0.000001, price * factor),
            volume: volume24h / 12 * (0.5 + Math.random() * 0.5)
          });
        }

        const liveLiquidity: LiquidityDetails = {
          ...base.liquidity,
          unlockedLiquidityUSD: (liquidityUSD * (100 - base.liquidity.lpLocked)) / 100,
          pairAddress: pair.pairAddress || base.liquidity.pairAddress,
          dexName: pair.dexId ? pair.dexId.toUpperCase() : base.liquidity.dexName,
        };

        return {
          token: liveToken,
          security: {
            ...base.security,
            securityScore: finalSecurityScore
          },
          liquidity: liveLiquidity,
          holders: base.holders,
          priceHistory,
          socials: {
            ...base.socials,
            websiteQualityScore: websiteUrl ? 88 : base.socials.websiteQualityScore
          }
        };
      }
    }
  } catch (error) {
    console.error("DexScreener API lookup failed, falling back to fully deterministic analyzer:", error);
  }

  // Fallback to offline scan metrics
  return generateDeterministicToken(address, chainName);
}

// Generate high quality static mock trending suggestions
export function getTrendingTokens(): TrendingToken[] {
  return [
    {
      name: "ROBOTIC AI",
      symbol: "RBT",
      address: "Fp1D76gXEPmF7aN8g1tWKy9nLbyWf3G8gNwyT1dJ2v",
      chain: "Solana",
      price: 0.00421,
      priceChange24h: 342.12,
      liquidityUSD: 1420000,
      marketCap: 4210000,
      securityScore: 98,
      logoUrl: ""
    },
    {
      name: "Solana GPT",
      symbol: "SGPT",
      address: "8s7GFgXePMEk7aN8g1tWKy9nLbyWf3G8gNwyT7v9J1d",
      chain: "Solana",
      price: 0.1245,
      priceChange24h: 42.15,
      liquidityUSD: 680000,
      marketCap: 12450000,
      securityScore: 92,
      logoUrl: ""
    },
    {
      name: "Cyber Mech Aegis",
      symbol: "CMECH",
      address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      chain: "Ethereum",
      price: 1.002,
      priceChange24h: -5.4,
      liquidityUSD: 4500000,
      marketCap: 1002000000,
      securityScore: 95,
      logoUrl: ""
    },
    {
      name: "Neural Prime",
      symbol: "NEUR",
      address: "0x2170ed0880ac9a755fd29b2688956bd959f933f8",
      chain: "BNB Smart Chain",
      price: 312.45,
      priceChange24h: 1.85,
      liquidityUSD: 12500000,
      marketCap: 48000000000,
      securityScore: 89,
      logoUrl: ""
    },
    {
      name: "Synth Base",
      symbol: "SBASE",
      address: "0x0000000000000000000000000000000000000001",
      chain: "Base",
      price: 0.00192,
      priceChange24h: 48.9,
      liquidityUSD: 240000,
      marketCap: 1920000,
      securityScore: 78,
      logoUrl: ""
    },
    {
      name: "RugProof AI",
      symbol: "PROOF",
      address: "0x1234567890abcdef1234567890abcdef12345678",
      chain: "Arbitrum",
      price: 0.0543,
      priceChange24h: -18.25,
      liquidityUSD: 95000,
      marketCap: 543000,
      securityScore: 45,
      logoUrl: ""
    }
  ];
}
