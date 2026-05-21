import React, { useState, useEffect } from "react";
import { 
  Wallet, 
  CheckCircle2, 
  ChevronDown, 
  Lock, 
  Sparkles, 
  RefreshCw, 
  AlertCircle, 
  Coins,
  ArrowRight,
  UserCheck,
  Clipboard,
  ExternalLink,
  ShieldAlert,
  Loader2
} from "lucide-react";
import { 
  connectSolanaWallet, 
  authenticateSolanaOwner, 
  sendMainnetSOLPayment, 
  getSolanaConnection 
} from "../lib/solanaWallet";
import { PublicKey } from "@solana/web3.js";

interface SolanaWalletConnectorProps {
  isDark: boolean;
  triggerToast: (msg: string) => void;
  onPaymentSuccess?: (signature: string, amount: number) => void;
  requiredFee?: number; // Fee in ROB representation
  localStorageSigKey?: string;
  actionLabel?: string;
}

export default function SolanaWalletConnector({
  isDark,
  triggerToast,
  onPaymentSuccess,
  requiredFee = 1500,
  localStorageSigKey = "rob_last_payment_signature",
  actionLabel = "audit"
}: SolanaWalletConnectorProps) {
  const [walletAddress, setWalletAddress] = useState<string | null>(() => {
    return localStorage.getItem("rob_wallet_address");
  });
  const [walletProvider, setWalletProvider] = useState<string | null>(() => {
    return localStorage.getItem("rob_wallet_provider");
  });
  const [isVerified, setIsVerified] = useState<boolean>(() => {
    return localStorage.getItem("rob_wallet_verified") === "true";
  });
  const [solBalance, setSolBalance] = useState<number>(() => {
    return parseFloat(localStorage.getItem("rob_wallet_sol_balance") || "0");
  });

  const [showDropdown, setShowDropdown] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSignature, setPaymentSignature] = useState<string | null>(() => {
    return localStorage.getItem(localStorageSigKey);
  });

  const providers = [
    { name: "Phantom", icon: "👻", color: "from-purple-600 to-indigo-600", desc: "Phantom Browser Extension" },
    { name: "Solflare", icon: "☀️", color: "from-orange-500 to-red-500", desc: "Solflare Web3 Adapter" },
    { name: "Backpack", icon: "🎒", color: "from-red-600 to-pink-600", desc: "Backpack Framework Wallet" },
    { name: "Glow", icon: "🌟", color: "from-green-500 to-emerald-600", desc: "Glow Authenticated Node" },
    { name: "Trust Wallet", icon: "🛡️", color: "from-blue-600 to-cyan-600", desc: "Trust Multi-Chain Adapter" }
  ];

  // Destination wallet address for mainnet payments (System Vault)
  const vaultAddress = "RobE8as9e4B8vYFp1D76gXEPmF7aN8g1tWKy9nLbyWf3";

  // Translate ROB fees to real, safe, and easily testable mainnet native SOL amounts
  // 500 ROB -> 0.001 SOL (~$0.15), 1500 ROB -> 0.002 SOL (~$0.30)
  const getSolFeeAmount = (robAmount: number) => {
    if (robAmount <= 500) return 0.001;
    return 0.002;
  };

  const solFeeAmount = getSolFeeAmount(requiredFee);

  // Monitor storage alterations
  useEffect(() => {
    const handleStorageChange = () => {
      const addr = localStorage.getItem("rob_wallet_address");
      const prov = localStorage.getItem("rob_wallet_provider");
      const ver = localStorage.getItem("rob_wallet_verified") === "true";
      const bal = parseFloat(localStorage.getItem("rob_wallet_sol_balance") || "0");
      const sig = localStorage.getItem(localStorageSigKey);

      if (addr !== walletAddress) setWalletAddress(addr);
      if (prov !== walletProvider) setWalletProvider(prov);
      if (ver !== isVerified) setIsVerified(ver);
      if (bal !== solBalance) setSolBalance(bal);
      if (sig !== paymentSignature) setPaymentSignature(sig);
    };

    const interval = setInterval(handleStorageChange, 1000);
    return () => clearInterval(interval);
  }, [walletAddress, walletProvider, isVerified, solBalance, paymentSignature, localStorageSigKey]);

  // Fetch real-time mainnet SOL balance
  const refreshOnChainBalance = async (addr: string) => {
    try {
      const conn = getSolanaConnection();
      const balanceLamports = await conn.getBalance(new PublicKey(addr));
      const bal = balanceLamports / 1e9;
      setSolBalance(bal);
      localStorage.setItem("rob_wallet_sol_balance", bal.toString());
      return bal;
    } catch (e) {
      console.warn("Could not retrieve real wallet balance from Mainnet RPC", e);
      return 0;
    }
  };

  const handleConnect = async (provName: string) => {
    setIsConnecting(true);
    setShowDropdown(false);

    try {
      // Connects to injected real wallet object
      const connectionData = await connectSolanaWallet(provName);
      
      localStorage.setItem("rob_wallet_address", connectionData.address);
      localStorage.setItem("rob_wallet_provider", provName);
      localStorage.setItem("rob_wallet_sol_balance", connectionData.solBalance.toString());
      localStorage.setItem("rob_wallet_verified", "false"); // Needs signature challenge validation

      setWalletAddress(connectionData.address);
      setWalletProvider(provName);
      setSolBalance(connectionData.solBalance);
      setIsVerified(false);

      triggerToast(`🔗 Linked via ${provName}! Confirm ownership next.`);
    } catch (err: any) {
      triggerToast(`❌ Configuration Missing: ${err.message || err}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAuthenticate = async () => {
    if (!walletAddress || !walletProvider) return;
    setIsAuthenticating(true);

    try {
      triggerToast(`🔐 Authorizing wallet ownership of ${walletAddress}...`);
      const authSignature = await authenticateSolanaOwner(walletProvider, walletAddress);
      
      localStorage.setItem("rob_wallet_verified", "true");
      setIsVerified(true);
      triggerToast("🎉 System verified! Dynamic cryptographic ownership authenticated on Mainnet.");
    } catch (err: any) {
      triggerToast(`❌ Verification Denied: ${err.message || err}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem("rob_wallet_address");
    localStorage.removeItem("rob_wallet_provider");
    localStorage.removeItem("rob_wallet_verified");
    localStorage.removeItem("rob_wallet_sol_balance");
    localStorage.removeItem(localStorageSigKey);

    setWalletAddress(null);
    setWalletProvider(null);
    setIsVerified(false);
    setSolBalance(0);
    setPaymentSignature(null);

    triggerToast("🔌 Wallet decoupled and mainnet credentials wiped.");
  };

  const handleCopyAddress = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    triggerToast("📋 Copied full public key to clipboard.");
  };

  const handleInitiatePayment = async () => {
    if (!walletAddress || !walletProvider) {
      triggerToast("⚠️ Authentication Required: Please link a Solana wallet first.");
      return;
    }

    if (!isVerified) {
      triggerToast("🔐 Ownership Gated: You must complete the identity signing step first.");
      return;
    }

    if (solBalance < solFeeAmount) {
      triggerToast(`❌ Insufficient Funds: Your mainnet balance is ${solBalance.toFixed(4)} SOL (Required: ${solFeeAmount} SOL).`);
      return;
    }

    setIsPaying(true);
    triggerToast(`🚀 Broadcasting live Mainnet ledger transfer to ${vaultAddress}...`);

    try {
      const signature = await sendMainnetSOLPayment(
        walletProvider,
        walletAddress,
        vaultAddress,
        solFeeAmount
      );

      localStorage.setItem(localStorageSigKey, signature);
      setPaymentSignature(signature);

      // Instantly refresh balance to reflect network state
      await refreshOnChainBalance(walletAddress);

      triggerToast(`🎉 Payment Confirmed! Transaction fully registered. Hash saved.`);

      if (onPaymentSuccess) {
         onPaymentSuccess(signature, requiredFee);
      }
    } catch (err: any) {
      triggerToast(`❌ Transaction Aborted: ${err.message || err}`);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 ${
      isDark 
        ? "bg-gradient-to-b from-[#0a0a14] to-[#04040a] border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.4)]" 
        : "bg-white border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
    }`} id="mainnet-wallet-connector">
      {/* Connector Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4 font-mono">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
            SOLANA MAINNET GATEWAY
          </span>
        </div>
        {walletAddress && (
          <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            <span>LIVE (MAINNET)</span>
          </span>
        )}
      </div>

      {!walletAddress ? (
        <div className="space-y-4 font-sans">
          <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex gap-2 text-slate-300 text-xs">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-400 uppercase tracking-wide text-[10px] font-mono">Production Network Locked</p>
              <p className="text-[11px] leading-relaxed mt-1">
                You are connecting to <strong>Solana MAINNET-BETA</strong>. All subsequent operations (validations, staking, audits, ads) compile real cryptographic signatures.
              </p>
            </div>
          </div>

          <div className="relative font-mono">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              disabled={isConnecting}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-black font-extrabold uppercase text-[10px] tracking-widest rounded-xl transition duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>IDENTIFYING EXTENSIONS...</span>
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 text-black" />
                  <span>Connect Mainnet Wallet</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-black transition-transform duration-300 ${showDropdown ? "rotate-180" : ""}`} />
                </>
              )}
            </button>

            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#08080f] border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl animate-fadeIn text-[11px]">
                <div className="p-2 text-[9px] text-slate-500 uppercase tracking-wider border-b border-white/5 bg-black/40 font-bold">
                  Identify Solana Adapter:
                </div>
                <div className="divide-y divide-white/5">
                  {providers.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => handleConnect(p.name)}
                      className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-white/5 transition duration-150 cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{p.icon}</span>
                        <div>
                          <div className="font-bold text-slate-200">{p.name}</div>
                          <div className="text-[9px] text-slate-500 font-sans">{p.desc}</div>
                        </div>
                      </div>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded bg-gradient-to-r ${p.color} text-white font-extrabold`}>
                        MAINNET
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4 font-sans text-xs">
          {/* Active Connection state card */}
          <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-xl space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] text-cyan-400 block uppercase tracking-wider font-bold mb-0.5">
                  Active Wallet
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-base">
                    {providers.find(p => p.name.toLowerCase() === walletProvider?.toLowerCase())?.icon || "🔌"}
                  </span>
                  <span className="text-xs font-black text-white uppercase">
                    {walletProvider}
                  </span>
                </div>
              </div>

              <button
                onClick={handleDisconnect}
                className="text-[9px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider border border-red-500/15 hover:border-red-500/35 bg-red-500/5 px-2.5 py-1 rounded-lg transition duration-200 cursor-pointer"
              >
                Disconnect
              </button>
            </div>

            <div className="border-t border-white/5 pt-2">
              <span className="text-[9px] text-slate-500 block uppercase tracking-wider font-bold mb-0.5">
                On-Chain Native Balance
              </span>
              <div className="flex items-center justify-between">
                <span className="text-white text-sm font-black flex items-center gap-1">
                  <span>🔋 {solBalance.toFixed(5)}</span> 
                  <span className="text-cyan-400 text-[10px]">SOL</span>
                </span>
                <button
                  onClick={() => refreshOnChainBalance(walletAddress)}
                  className="p-1 rounded hover:bg-white/5 text-slate-400 hover:text-white transition cursor-pointer"
                  title="Force status refresh"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="border-t border-white/5 pt-2">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                  Solana Address hash
                </span>
                <button
                  onClick={handleCopyAddress}
                  className="text-cyan-400 hover:text-cyan-300 p-1 flex items-center gap-1 text-[9px] font-sans"
                  title="Copy details"
                >
                  <Clipboard className="w-3 h-3" /> Copy
                </button>
              </div>
              <code className="text-[10px] break-all select-all font-semibold text-slate-350 bg-black/30 p-1.5 rounded block">
                {walletAddress}
              </code>
            </div>

            {/* Micro authentication gate */}
            <div className="border-t border-white/5 pt-2">
              {isVerified ? (
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-[10px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>🔐 Cryptographic Ownership Verified</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="text-[9px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>Identity Verification Required</span>
                  </div>
                  <button
                    onClick={handleAuthenticate}
                    disabled={isAuthenticating}
                    className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-450 hover:to-orange-450 text-black uppercase text-[9px] tracking-wider rounded-lg font-black transition flex items-center justify-center gap-1"
                  >
                    {isAuthenticating ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin text-black" />
                        <span>AWAITING SIGNATURE...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-black" />
                        <span>Sign Cryptographic Challenge</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Payment execution center */}
          {!paymentSignature ? (
            <div className="pt-2 font-mono">
              <button
                onClick={handleInitiatePayment}
                disabled={isPaying || !isVerified}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_4px_15px_rgba(147,51,234,0.3)]"
              >
                {isPaying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>AWAITING BLOCK CONFIRMATION...</span>
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4 text-white" />
                    <span>Broadcast Real SOL Fee Payment ({solFeeAmount.toFixed(3)} SOL)</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </>
                )}
              </button>
              <span className="block text-center text-[9px] text-slate-500 mt-1.5 uppercase">
                {!isVerified ? "🔒 Complete identity signing above first" : `Transfer of real SOL on-chain to verify this ${actionLabel}`}
              </span>
            </div>
          ) : (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-start gap-2.5 text-emerald-400 font-mono text-[10px] leading-relaxed">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
              <div className="flex-1 overflow-hidden">
                <strong>ON-CHAIN PAYMENT CLEARANCE SECURED:</strong> Block hash signature successfully validated.
                <div className="mt-1 bg-black/40 p-1.5 rounded text-[8.5px] text-slate-400 flex items-center justify-between gap-1">
                  <span className="truncate select-all select-text pr-2">Sig: {paymentSignature}</span>
                  <a
                    href={`https://explorer.solana.com/tx/${paymentSignature}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline shrink-0 flex items-center gap-0.5"
                  >
                    <span>View</span> <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
