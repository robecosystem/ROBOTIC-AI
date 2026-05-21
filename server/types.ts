export interface TokenDetails {
  address: string;
  name: string;
  symbol: string;
  chain: string;
  price: number;
  marketCap: number;
  fdv: number;
  liquidityUSD: number;
  totalSupply: number;
  circulatingSupply: number;
  holders: number;
  volume24h: number;
  priceChange24h: number;
  logoUrl?: string;
  websiteUrl?: string;
  telegramUrl?: string;
  twitterUrl?: string;
  createdAt?: string;
}

export interface SecurityFeatures {
  ownershipRenounced: boolean;
  mintable: boolean;
  freezable: boolean;
  honeypot: boolean;
  sellTax: number;
  buyTax: number;
  blacklisted: boolean;
  paused: boolean;
  isProxy: boolean;
  securityScore: number;
  ownerAddress: string;
  risksCount: number;
  warnings: string[];
}

export interface LiquidityDetails {
  lpLocked: number; // percentage
  lpUnlocked: number; // percentage
  lpBurned: number; // percentage
  lockExpiration?: string;
  unlockedLiquidityUSD: number;
  poolAgeDays: number;
  dexName: string;
  pairAddress: string;
}

export interface HolderInfo {
  address: string;
  balance: number;
  share: number; // percentage
  tag: string; // 'Developer', 'Insider', 'Whale', 'Exchange', 'Liquidity Pool'
}

export interface HolderAnalysis {
  totalHolders: number;
  top10Concentration: number;
  insiderRisk: 'Low' | 'Medium' | 'High';
  whaleCount: number;
  developerWalletBalance: number;
  holdersList: HolderInfo[];
  growthTrend: 'Upward' | 'Stable' | 'Descending';
}

export interface PriceHistoryPoint {
  time: string;
  price: number;
  volume: number;
}

export interface SocialMetrics {
  domainAgeDays: number;
  websiteQualityScore: number;
  fakeFollowerPercentage: number;
  socialSentiment: 'Positive' | 'Neutral' | 'Negative' | 'Bullish' | 'Bearish';
  communityState: string;
}

export interface AIScoringDetails {
  securityScore: number; // 0-100
  rugProbability: number; // 0-100
  scamProbability: number; // 0-100
  trustScore: number; // 0-100
  momentumScore: number; // 0-100
  rating: 'Very Safe' | 'Safe' | 'Moderate Risk' | 'High Risk' | 'Dangerous';
  recommendation: string;
  keyStrengths: string[];
  redFlags: string[];
  suggestedAction: string;
  buyOpportunityScore: number; // 0-100
  riskReward: string;
}

export interface FullAnalysisResponse {
  address: string;
  chain: string;
  detectedAt: string;
  token: TokenDetails;
  security: SecurityFeatures;
  liquidity: LiquidityDetails;
  holders: HolderAnalysis;
  priceHistory: PriceHistoryPoint[];
  socials: SocialMetrics;
  ai: AIScoringDetails;
}

export interface TrendingToken {
  name: string;
  symbol: string;
  address: string;
  chain: string;
  price: number;
  priceChange24h: number;
  liquidityUSD: number;
  marketCap: number;
  securityScore: number;
  logoUrl?: string;
}
