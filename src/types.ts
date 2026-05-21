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

export interface AdCampaign {
  id: string;
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  tagline: string;
  bannerUrl?: string;
  chain: string;
  budgetRob: number;
  durationDays: number;
  approved: boolean;
  createdAt: string;
}

export interface LockedLiquidityToken {
  address: string;
  name: string;
  symbol: string;
  chain: string;
  lockPlatform: string;
  lockedAmountUSD: number;
  lockedPercentage: number;
  burnPercentage: number;
  contractCreator: string;
  lockDurationMonths: number;
  lockTimestamp: string;
  unlockTimeReadable: string;
  liquidityPoolOnDex: string;
}

export interface AirdropParticipant {
  walletAddress: string;
  completedTasks: string[];
  completedPercentage: number;
  eligible: boolean;
  claimed: boolean;
  claimTxSignature?: string;
  joinedAt: string;
}

export interface AirdropCampaign {
  id: string;
  projectName: string;
  tokenName: string;
  tokenSymbol: string;
  tokenContractAddress: string;
  totalAirdropSupply: number;
  winnersCount: number;
  rewardPerUser: number;
  startDate: string;
  endDate: string;
  websiteLink: string;
  twitterLink: string;
  telegramLink: string;
  discordLink: string;
  description: string;
  bannerUrl: string;
  logoUrl: string;
  requiredTasks: string[];
  customTasks: string[];
  active: boolean;
  creatorAddress: string;
  paymentSignature: string;
  createdAt: string;
  participants: AirdropParticipant[];
}

export interface AirdropPayment {
  signature: string;
  amount: number;
  feeType: string;
  walletAddress: string;
  timestamp: string;
}


