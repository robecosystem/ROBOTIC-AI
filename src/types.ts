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
  lpLocked: number;
  lpUnlocked: number;
  lpBurned: number;
  lockExpiration?: string;
  unlockedLiquidityUSD: number;
  poolAgeDays: number;
  dexName: string;
  pairAddress: string;
}

export interface HolderInfo {
  address: string;
  balance: number;
  share: number;
  tag: string;
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
  securityScore: number;
  rugProbability: number;
  scamProbability: number;
  trustScore: number;
  momentumScore: number;
  rating: 'Very Safe' | 'Safe' | 'Moderate Risk' | 'High Risk' | 'Dangerous';
  recommendation: string;
  keyStrengths: string[];
  redFlags: string[];
  suggestedAction: string;
  buyOpportunityScore: number;
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

export interface ScanHistoryItem {
  address: string;
  chain: string;
  name: string;
  symbol: string;
  score: number;
  time: string;
}
