export interface AddressDetectionResult {
  valid: boolean;
  chain: string;
  chainGroup: 'SOLANA' | 'EVM' | 'TRON' | 'UNKNOWN';
  suggestedChains: string[];
}

export function detectAddressChain(address: string): AddressDetectionResult {
  const trimmed = address.trim();
  
  if (!trimmed) {
    return { valid: false, chain: "Unknown", chainGroup: "UNKNOWN", suggestedChains: [] };
  }

  // Solana base58 pattern
  const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  if (solanaRegex.test(trimmed)) {
    return {
      valid: true,
      chain: "Solana",
      chainGroup: "SOLANA",
      suggestedChains: ["Solana"]
    };
  }

  // Tron base58 pattern (Starts with 'T', 34 characters)
  const tronRegex = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;
  if (tronRegex.test(trimmed)) {
    return {
      valid: true,
      chain: "Tron",
      chainGroup: "TRON",
      suggestedChains: ["Tron"]
    };
  }

  // EVM address pattern (starts with 0x, 40 hex char + 0x = 42 char total)
  const evmRegex = /^0x[a-fA-F0-9]{40}$/;
  if (evmRegex.test(trimmed)) {
    // It's a valid EVM address. EVM address shape works across multiple chains.
    return {
      valid: true,
      chain: "Ethereum", // Default to Ethereum
      chainGroup: "EVM",
      suggestedChains: ["Ethereum", "BNB Smart Chain", "Base", "Arbitrum", "Polygon", "Avalanche"]
    };
  }

  // Handle generic 42 char hex formatting (missing 0x)
  if (/^[a-fA-F0-9]{40}$/.test(trimmed)) {
    return {
      valid: true,
      chain: "Ethereum",
      chainGroup: "EVM",
      suggestedChains: ["Ethereum", "BNB Smart Chain", "Base", "Arbitrum", "Polygon", "Avalanche"]
    };
  }

  return {
    valid: false,
    chain: "Unknown",
    chainGroup: "UNKNOWN",
    suggestedChains: []
  };
}
