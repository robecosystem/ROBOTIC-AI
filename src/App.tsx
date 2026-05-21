/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Search, 
  Clipboard, 
  AlertTriangle, 
  RotateCcw, 
  TrendingUp, 
  History, 
  Cpu, 
  ShieldAlert, 
  ExternalLink,
  ChevronRight, 
  Download, 
  Share2, 
  Zap, 
  ArrowLeft,
  X,
  Compass,
  LineChart,
  Users,
  RefreshCw,
  FileText,
  Megaphone,
  Coins,
  Lock,
  Activity,
  Play,
  Pause,
  Sun,
  Moon,
  ShieldCheck,
  ChevronDown
} from "lucide-react";

import RoboBackground from "./components/RoboBackground";
import TokenOverviewCard from "./components/TokenOverviewCard";
import SecurityConsole from "./components/SecurityConsole";
import LiquidityGauge from "./components/LiquidityGauge";
import HolderList from "./components/HolderList";
import PriceChart from "./components/PriceChart";
import AiRiskPanel from "./components/AiRiskPanel";
import { FullAnalysisResponse, TrendingToken, ScanHistoryItem, AdCampaign } from "./types";
import { clientSideAnalyze, getClientTrending } from "./lib/clientScanner";
import AdPortal from "./components/AdPortal";
import SystemsDashboard from "./components/SystemsDashboard";
import ContractAuditPortal from "./components/ContractAuditPortal";
import AirdropPortal from "./components/AirdropPortal";

export default function App() {
  // Input Controllers
  const [address, setAddress] = useState("");
  const [selectedChain, setSelectedChain] = useState("Solana");
  
  // Dark/Light Theme state controller
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem("rob_theme") !== "light";
  });

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    localStorage.setItem("rob_theme", nextTheme ? "dark" : "light");
    triggerToast(nextTheme ? "System nodes loaded in DARK visual theme" : "System nodes loaded in LIGHT visual theme");
  };
  
  // App States
  const [loading, setLoading] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState<string[]>([]);
  const [result, setResult] = useState<FullAnalysisResponse | null>(null);
  const [trendingTokens, setTrendingTokens] = useState<TrendingToken[]>([]);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'AI_AUDIT' | 'SECURITY' | 'LIQUIDITY' | 'HOLDERS' | 'CHARTS'>('OVERVIEW');
  const [showAbout, setShowAbout] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // New Routing State and Ecosystem states
  const [currentPage, setCurrentPage] = useState<'SCANNER' | 'FEATURES' | 'CREATE_AD' | 'AUDIT' | 'TESTNET_AUDIT' | 'MAINNET_AUDIT' | 'CREATE_AIRDROP'>('SCANNER');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [dashboardInitialTab, setDashboardInitialTab] = useState<'DASHBOARD' | 'LAUNCHES' | 'CHAT' | 'WALLETS' | 'SIGNALS' | 'STAKING' | 'EMERGENCY' | 'SCAMS' | 'LEARN' | 'MONITOR' | 'ANTI_FAKE'>('DASHBOARD');
  const [robBalance, setRobBalance] = useState<number>(10000);
  const [hasOnlineAudit, setHasOnlineAudit] = useState<any | null>(null);

  // Check URL query parameters for audits routing on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auditId = params.get("audit") || params.get("auditId");
    if (auditId) {
      setCurrentPage('MAINNET_AUDIT');
      (window as any)._initialShareAuditId = auditId;
    }
  }, []);

  // Fetch verified status from backend DB when result address changes
  useEffect(() => {
    if (result?.address) {
      fetch(`/api/audits/${result.address}`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error("unverified");
        })
        .then(data => {
          setHasOnlineAudit(data);
        })
        .catch(() => {
          setHasOnlineAudit(null);
        });
    } else {
      setHasOnlineAudit(null);
    }
  }, [result]);
  const [activeAds, setActiveAds] = useState<AdCampaign[]>(() => {
    const saved = localStorage.getItem("rob_active_ads");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "default_ad_rob",
        tokenAddress: "Fp1D76gXEPmF7aN8g1tWKy9nLbyWf3G8gNwyT1dJ2v",
        tokenName: "ROBOTIC AI SYSTEM",
        tokenSymbol: "ROB",
        tagline: "The main core neural scan layers auditing smart contracts across multiple blockchains. Buy now!",
        bannerUrl: "https://images.unsplash.com/photo-161805182384-a83a8bd57fbe?q=80&w=640",
        chain: "Solana",
        budgetRob: 1500,
        durationDays: 30,
        approved: true,
        createdAt: new Date().toISOString()
      }
    ];
  });

  // Keep advertisers list updated in local memory
  useEffect(() => {
    localStorage.setItem("rob_active_ads", JSON.stringify(activeAds));
  }, [activeAds]);

  // Interactive Active Sponsor Ad Board states
  const [isAdPlaying, setIsAdPlaying] = useState(true);
  const [adPlayIndex, setAdPlayIndex] = useState(0);

  // Auto-slide carousel play rotation effect
  useEffect(() => {
    if (!isAdPlaying || activeAds.length <= 1) return;
    const interval = setInterval(() => {
      setAdPlayIndex((prev) => (prev + 1) % activeAds.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAdPlaying, activeAds]);

  const chainsList = [
    "Solana",
    "Ethereum",
    "BNB Smart Chain",
    "Base",
    "Arbitrum",
    "Polygon",
    "Avalanche",
    "Tron"
  ];

  // Fetch initial trending data and check local scan logs on mount
  useEffect(() => {
    fetchTrendingAndHistory();
  }, []);

  const fetchTrendingAndHistory = async () => {
    try {
      try {
        const trendingRes = await fetch("/api/trending");
        if (trendingRes.ok) {
          const tokens = await trendingRes.json();
          setTrendingTokens(tokens);
        } else {
          setTrendingTokens(getClientTrending());
        }
      } catch (trendingErr) {
        setTrendingTokens(getClientTrending());
      }
      
      try {
        const historyRes = await fetch("/api/history");
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setScanHistory(historyData);
        } else {
          const localHist = localStorage.getItem("rob_scan_history");
          setScanHistory(localHist ? JSON.parse(localHist) : []);
        }
      } catch (histErr) {
        const localHist = localStorage.getItem("rob_scan_history");
        setScanHistory(localHist ? JSON.parse(localHist) : []);
      }
    } catch (err) {
      console.error("Historical data lookup failure:", err);
    }
  };

  // Show visual toast notification
  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Clipboard paste assistant
  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setAddress(text.trim());
        triggerToast("Address pasted from clipboard.");
      } else {
        triggerToast("Clipboard appears empty.");
      }
    } catch (err) {
      triggerToast("Clipboard permissions currently blocked.");
    }
  };

  // Handle blockchain auto selection based on characters matched
  const handleAddressChange = (val: string) => {
    setAddress(val);
    const trimmed = val.trim();
    if (!trimmed) return;

    // Detect solana
    const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    if (solanaRegex.test(trimmed)) {
      setSelectedChain("Solana");
      return;
    }

    const tronRegex = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;
    if (tronRegex.test(trimmed)) {
      setSelectedChain("Tron");
      return;
    }

    // Detect EVM
    if (trimmed.startsWith("0x") && trimmed.length === 42) {
      // Suggest Base/Ethereum
      if (selectedChain === "Solana" || selectedChain === "Tron") {
        setSelectedChain("Ethereum");
      }
    }
  };

  // Automatic analysis trigger once a valid contract address format is detected
  useEffect(() => {
    const trimmed = address.trim();
    if (!trimmed || loading) return;

    // Avoid duplicate evaluation run if we already show the audit for this address
    if (result && result.address.toLowerCase() === trimmed.toLowerCase()) return;

    // 1. Detect EVM (starts with 0x, length is 42 hex chars)
    if (trimmed.startsWith("0x") && trimmed.length === 42 && /^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      const isCurrentChainEvm = ["Ethereum", "Base", "BSC", "Arbitrum", "Polygon", "Avalanche"].includes(selectedChain);
      const targetChain = isCurrentChainEvm ? selectedChain : "Ethereum";
      setSelectedChain(targetChain);
      performAnalysis(trimmed, targetChain);
      return;
    }

    // 2. Detect Tron (starts with T, length 34 base58 chars)
    if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(trimmed)) {
      setSelectedChain("Tron");
      performAnalysis(trimmed, "Tron");
      return;
    }

    // 3. Detect Solana (length 43-44 base58 chars)
    if (/^[1-9A-HJ-NP-Za-km-z]{43,44}$/.test(trimmed)) {
      setSelectedChain("Solana");
      performAnalysis(trimmed, "Solana");
      return;
    }
  }, [address]);

  // Perform contract check and scanner load simulation
  const performAnalysis = async (addrToScan: string, chainToScan: string) => {
    if (!addrToScan.trim()) {
      triggerToast("Please input a valid contract address first.");
      return;
    }

    setLoading(true);
    setLoadingLogs([]);
    setResult(null);

    // Simulated technical log triggers to give an immersive robotic feel
    const logsSequences = [
      "🤖 INITIALIZING ROBOTIC CRYPTO ENGINE...",
      "🔍 AUTO-RESOLVING CHAIN FORMAT SIGNATURES...",
      `📍 ESTABLISHING HIGH-SPEED CORRELATOR ON: [${chainToScan.toUpperCase()}]`,
      "📜 CRAWLING MULTIPART SMART CONTRACT DEPLOYMENTS...",
      "💧 CALCULATING LIQUIDITY pool locks and burning ratios...",
      "👥 CORRELATING WALLET CONCENTRATIONS and developer nodes...",
      "🧠 EXECUTING ADVANCED AI SECURITY MODEL CRITERIAS...",
      "⚙️ ASSEMBLING AUDIT REPORT LOGS..."
    ];

    // Push logs sequentially
    for (let i = 0; i < logsSequences.length; i++) {
      await new Promise((r) => setTimeout(r, i === 0 ? 100 : 250));
      setLoadingLogs((prev) => [...prev, logsSequences[i]]);
    }

    try {
      let fullAudit: FullAnalysisResponse | null = null;
      let useClientFallback = false;

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: addrToScan.trim(), chain: chainToScan }),
        });

        if (response.ok) {
          fullAudit = await response.json();
        } else {
          useClientFallback = true;
        }
      } catch (err) {
        useClientFallback = true;
      }

      // Dynamic CORS-friendly direct browser lookup and scanning if server is offline
      if (useClientFallback) {
        console.log("Robotic Server is currently offline. Executing core client-side scan modules directly in the browser...");
        fullAudit = await clientSideAnalyze(addrToScan.trim(), chainToScan);
        
        // Save scan history to localStorage so it stays perfectly functional, dynamic, and persistent on Netlify/static hosts
        const localHistRaw = localStorage.getItem("rob_scan_history");
        const scanHistoryList: ScanHistoryItem[] = localHistRaw ? JSON.parse(localHistRaw) : [];
        const existingIdx = scanHistoryList.findIndex(h => h.address.toLowerCase() === addrToScan.trim().toLowerCase());
        if (existingIdx !== -1) {
          scanHistoryList.splice(existingIdx, 1);
        }
        scanHistoryList.unshift({
          address: addrToScan.trim(),
          chain: chainToScan,
          name: fullAudit.token.name,
          symbol: fullAudit.token.symbol,
          score: fullAudit.ai?.securityScore || 85,
          time: new Date().toISOString()
        });
        if (scanHistoryList.length > 50) {
          scanHistoryList.pop();
        }
        localStorage.setItem("rob_scan_history", JSON.stringify(scanHistoryList));
      }

      if (fullAudit) {
        setResult(fullAudit);
        setActiveTab('OVERVIEW');
        triggerToast("Analysis completed successfully " + (useClientFallback ? "(Client Mode)" : ""));
        // Re-fetch history to load state
        fetchTrendingAndHistory();
      } else {
        triggerToast("Failed to analyze contract address.");
      }
    } catch (err: any) {
      triggerToast("Connection error during analysis.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger quick scan from buttons
  const triggerQuickScan = (addr: string, chain: string) => {
    setAddress(addr);
    setSelectedChain(chain);
    performAnalysis(addr, chain);
  };

  // Reset analysis results
  const resetScanner = () => {
    setResult(null);
    setAddress("");
  };

  // PDF report downloader placeholder
  const exportPDFReport = () => {
    if (!result) return;
    const reportData = JSON.stringify(result, null, 2);
    const blob = new Blob([reportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ROBOTIC_AUDIT_${result.token.symbol}_${result.chain}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Audit raw JSON telemetry report exported.");
  };

  // Share audit link
  const shareAudit = () => {
    if (!result) return;
    const shareUrl = `${window.location.origin}/?addr=${result.address}&chain=${result.chain}`;
    navigator.clipboard.writeText(shareUrl);
    triggerToast("Audit URL link copied to clipboard.");
  };

  return (
    <div className={`relative min-h-screen transition-all duration-300 font-sans selection:bg-cyan-500 selection:text-white ${isDark ? "bg-[#020205] text-slate-300 dark-theme" : "bg-slate-50 text-slate-700 light-theme"}`}>
      {/* Visual cyber animation background */}
      <RoboBackground />

      {/* Floating Notification Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg bg-slate-900 border border-cyan-500/45 text-cyan-300 text-xs font-mono shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* App Body Shell */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col justify-between min-h-screen">
        
        {/* Navigation / Header Brand Bar in Modern List Style Layout */}
        <header className="border border-white/10 bg-black/45 backdrop-blur-xl p-4 sm:p-5 rounded-2xl mb-8 relative z-10 font-mono text-xs select-none">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            
            {/* Header Brand Item (Header of the list) */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/25 shrink-0 bg-black">
                <img 
                  src="https://raw.githubusercontent.com/robecosystem/robecosystem.github.io/refs/heads/main/ROBOTIC%20logo.jpg" 
                  alt="ROBOTIC Logo" 
                  className="w-full h-full object-cover animate-pulse"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold tracking-widest text-white leading-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                  ROBOTIC<span className="text-cyan-400 font-normal">.AI</span>
                </h1>
                <span className="text-[9px] sm:text-[10px] tracking-wider opacity-60 text-cyan-300 block mt-1 uppercase">
                  AI-POWERED SYSTEM INTEL & RUG DETECTOR
                </span>
              </div>
            </div>

            {/* Core Services and Links presented as a bulleted horizontal/vertical navigation list */}
            <nav className="w-full lg:w-auto relative">
              <ul className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2.5 sm:gap-4 p-0 m-0 list-none font-mono">
                
                {/* Product Dropdown menu */}
                <li className="relative flex items-center gap-2 select-none group">
                  <span className="text-cyan-400 font-bold font-sans">▪</span>
                  <div className="relative">
                    <button
                      onClick={() => setShowProductDropdown(!showProductDropdown)}
                      className={`text-left font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1 ${
                        ['SCANNER', 'FEATURES', 'CREATE_AD', 'TESTNET_AUDIT', 'MAINNET_AUDIT', 'AUDIT', 'CREATE_AIRDROP'].includes(currentPage)
                          ? 'text-cyan-400 font-black underline decoration-cyan-400/50 underline-offset-4' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                      id="nav-product-button"
                    >
                      <span>Product</span>
                      <ChevronDown className="w-3.5 h-3.5 text-cyan-400 transition-transform duration-300 group-hover:rotate-180" />
                    </button>
                    
                    {/* Floating Dropdown Frame */}
                    {showProductDropdown && (
                      <div 
                        onMouseLeave={() => setShowProductDropdown(false)}
                        className="absolute left-0 mt-2.5 w-52 rounded-xl bg-[#08080f] border border-white/10 p-2.5 space-y-1.5 shadow-2xl z-50 animate-fadeIn font-mono text-xs leading-relaxed"
                      >
                        {/* 1. Scanner */}
                        <button
                          onClick={() => {
                            setCurrentPage('SCANNER');
                            setResult(null);
                            setShowProductDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg transition duration-200 flex items-center justify-between cursor-pointer ${
                            currentPage === 'SCANNER'
                              ? 'bg-cyan-500/10 text-cyan-400 font-bold font-sans'
                              : 'text-slate-400 hover:bg-white/5 hover:text-white font-sans'
                          }`}
                        >
                          <span>Scanner</span>
                          <span className="text-[9px] bg-cyan-400/10 text-cyan-400 px-1.5 py-0.2 rounded font-black font-mono">LIVE</span>
                        </button>

                        {/* 2. Create Ad */}
                        <button
                          onClick={() => {
                            setCurrentPage('CREATE_AD');
                            setShowProductDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg transition duration-200 flex items-center justify-between cursor-pointer ${
                            currentPage === 'CREATE_AD'
                              ? 'bg-pink-500/10 text-pink-400 font-bold font-sans'
                              : 'text-slate-400 hover:bg-white/5 hover:text-white font-sans'
                          }`}
                        >
                          <span>Create Ad</span>
                        </button>

                        {/* 3. Stake */}
                        <button
                          onClick={() => {
                            setCurrentPage('FEATURES');
                            setDashboardInitialTab('STAKING');
                            setShowProductDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg transition duration-200 flex items-center justify-between cursor-pointer ${
                            currentPage === 'FEATURES' && dashboardInitialTab === 'STAKING'
                              ? 'bg-purple-500/10 text-purple-400 font-bold font-sans'
                              : 'text-slate-400 hover:bg-white/5 hover:text-white font-sans'
                          }`}
                        >
                          <span>Stake</span>
                        </button>

                        {/* 3.5. Create Airdrop */}
                        <button
                          onClick={() => {
                            setCurrentPage('CREATE_AIRDROP');
                            setShowProductDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg transition duration-200 flex items-center justify-between cursor-pointer ${
                            currentPage === 'CREATE_AIRDROP'
                              ? 'bg-pink-500/10 text-pink-400 font-bold font-sans'
                              : 'text-slate-400 hover:bg-white/5 hover:text-white font-sans'
                          }`}
                        >
                          <span>Create Airdrop</span>
                          <span className="text-[8px] bg-pink-500/10 text-pink-400 border border-pink-500/30 px-1.5 py-0.2 rounded font-black font-mono">NEW</span>
                        </button>

                        {/* 4. Main Net Audit */}
                        <button
                          onClick={() => {
                            setCurrentPage('MAINNET_AUDIT');
                            setShowProductDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg transition duration-200 flex items-center justify-between cursor-pointer ${
                            currentPage === 'MAINNET_AUDIT'
                              ? 'bg-cyan-500/10 text-cyan-400 font-bold font-sans'
                              : 'text-slate-400 hover:bg-white/5 hover:text-white font-sans'
                          }`}
                        >
                          <span>Main Net Audit</span>
                          <span className="text-[8px] bg-cyan-500 text-black px-1.5 py-0.2 rounded font-black font-mono">SECURE</span>
                        </button>
                      </div>
                    )}
                  </div>
                </li>

                {/* 3. Buy $ROB */}
                <li className="flex items-center gap-2">
                  <span className="text-pink-400 font-bold font-sans">▪</span>
                  <a 
                    href="https://raydium.io/swap/?inputMint=sol&outputMint=Fp1D76gXEPmF7aN8g1tWKy9nLbyWf3G8gNwyT1dJ2v"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-pink-400 hover:text-pink-300 font-extrabold uppercase tracking-wider transition-all duration-300 flex items-center gap-1"
                    id="header-buy-rob-button"
                    title="Buy $ROB on Raydium"
                  >
                    <span>Buy $ROB</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-65" />
                  </a>
                </li>

                {/* 5. Nodes Active Status Indicator */}
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]" />
                  <span className="text-white/80 font-bold uppercase tracking-wider">Nodes Active</span>
                </li>

              </ul>
            </nav>

            {/* Terminal Connection actions & controls */}
            <div className="flex items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0 justify-between sm:justify-end border-t lg:border-t-0 border-white/5 pt-3 lg:pt-0">
              
              {/* Cybernetic Theme Controller Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg border flex items-center justify-center transition-all duration-300 cursor-pointer ${
                  isDark 
                    ? "bg-white/5 border-white/10 hover:border-cyan-400 text-cyan-400 hover:text-cyan-300"
                    : "bg-white border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-600 shadow-sm"
                }`}
                id="theme-mode-toggle"
                aria-label="Toggle visual theme"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>

              {/* 6. Connect Terminal */}
              <button 
                onClick={() => triggerToast("Terminal connected securely to node grid.")}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-450 active:scale-95 text-black font-extrabold rounded-lg uppercase tracking-widest transition-all cursor-pointer shadow-[0_4px_12px_rgba(6,182,212,0.15)] shrink-0"
              >
                Connect Terminal
              </button>
            </div>

          </div>
        </header>



        {/* Primary Container layout */}
        <main className="flex-1">
          {currentPage === 'SCANNER' ? (
            !result ? (
            /* ================= VIEW 1: LANDING CONSOLE ================= */
            <div className="space-y-6 md:space-y-8">

              {/* CONTRACT SCAN INPUT BAR */}
              <div className="max-w-3xl border border-white/15 rounded-xl bg-white/5 backdrop-blur-md p-3.5 shadow-[0_10px_25px_rgba(0,0,0,0.55)]">
                <div className="flex flex-col md:flex-row items-center gap-2.5">
                  
                  {/* Selected Token Chain Toggle Dropdown */}
                  <div className="w-full md:w-48 select-none shrink-0 relative">
                    <label className="text-[9px] font-mono text-cyan-400 block mb-1 uppercase font-semibold tracking-wide">Audit blockchain</label>
                    <select 
                      value={selectedChain}
                      onChange={(e) => setSelectedChain(e.target.value)}
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-cyan-500/50 transition cursor-pointer"
                    >
                      {chainsList.map((chName) => (
                        <option key={chName} value={chName} className="bg-slate-950 text-white font-mono">
                          {chName.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Contract Address query field */}
                  <div className="w-full relative">
                    <label className="text-[9px] font-mono text-cyan-400 block mb-1 uppercase font-semibold tracking-wide">Contract Address</label>
                    <div className="relative">
                      <input 
                        type="text"
                        placeholder="Paste contract address (Solana, EVM, Base...)"
                        value={address}
                        onChange={(e) => handleAddressChange(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && performAnalysis(address, selectedChain)}
                        className="w-full bg-[#0a0a0f] border border-white/15 rounded-lg pl-9 pr-20 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3.5" />
                      
                      {/* Paste Assistant button */}
                      <button 
                        onClick={pasteFromClipboard}
                        className="absolute right-3.5 top-1.5 p-1.5 hover:bg-white/5 rounded-md text-slate-400 hover:text-cyan-400 transition"
                        title="Paste from clipboard"
                      >
                        <Clipboard className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Execution button */}
                  <div className="w-full md:w-auto self-end">
                    <button 
                      onClick={() => performAnalysis(address, selectedChain)}
                      disabled={loading}
                      className="w-full md:w-auto px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/55 disabled:cursor-not-allowed text-black font-extrabold rounded-lg text-xs leading-none uppercase tracking-widest flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer shadow-[0_3px_10px_rgba(6,182,212,0.3)]"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Audit...
                        </>
                      ) : (
                        <>
                          <Cpu className="w-3.5 h-3.5" /> Analyse
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* TERMINAL LOADING LOGS COMPACT BAR (Visible during scanning) */}
              <AnimatePresence>
                {loading && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 rounded-xl border border-cyan-500/20 bg-slate-950/70 backdrop-blur-xl font-mono text-xs text-cyan-300 space-y-2 max-w-3xl">
                      <div className="flex justify-between border-b border-cyan-500/10 pb-2 mb-2">
                        <span className="font-bold flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5 animate-spin" /> EXECUTING REAL-TIME AUDITING NODE
                        </span>
                        <span className="text-cyan-400 animate-pulse">SEARCHING LEDGERS...</span>
                      </div>
                      <div className="space-y-1 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                        {loadingLogs.map((logStr, idx) => (
                          <div key={idx} className="flex gap-2 text-slate-300">
                            <span className="text-cyan-400 font-bold">»</span>
                            <span className="leading-relaxed text-[11px]">{logStr}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* BRAND HERO DECK */}
              <div className="max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-2">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wide">
                    <Cpu className="w-3.5 h-3.5 animate-pulse" /> Core Gemini-3.5 Secure Node
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                    Cybernetic <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Rug-Pull Analyzer</span> & Market Intelligence
                  </h2>
                  
                  <p className="text-xs text-slate-400 max-w-lg leading-relaxed font-sans">
                    Instantly scan Solana, Ethereum, Base, and major blockchain contracts. ROBOTIC parses code patterns, scans liquidity safety locks, audits ledger groupings, and scores risks using the AI Risk Engine in under 2 seconds.
                  </p>

                  {/* Operational badgings */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {chainsList.slice(0, 5).map((ch) => (
                      <span 
                        key={ch} 
                        className="text-[9px] font-mono font-bold px-2 py-0.5 bg-slate-900/60 border border-slate-800 rounded text-slate-400"
                      >
                        ● {ch.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* INTERACTIVE SPONSOR AD CAMPAIGN PLAY PANEL ("ad display play section") */}
                <div className="relative flex justify-center w-full">
                  <div className="w-full max-w-sm rounded-xl border border-pink-500/20 bg-gradient-to-br from-[#0c0510] to-[#040409] backdrop-blur-xl p-4 shadow-[0_4px_25px_rgba(244,63,94,0.15)] relative overflow-hidden">
                    {/* glowing lights */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 blur-[30px] rounded-full pointer-events-none" />

                    <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                        <span className="text-[10px] font-mono font-bold text-pink-400 uppercase tracking-widest">Active Ad Node Board</span>
                      </div>
                      
                      {/* Play/Pause controls */}
                      <button 
                        onClick={() => setIsAdPlaying(!isAdPlaying)}
                        className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white transition flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider"
                        title={isAdPlaying ? "Hold Rotation" : "Auto Play"}
                      >
                        {isAdPlaying ? (
                          <>
                            <span className="w-1 h-1 bg-green-500 rounded-full animate-ping" />
                            <span>Live Play</span>
                          </>
                        ) : (
                          <>
                            <span className="w-1 h-1 bg-amber-500 rounded-full" />
                            <span>Paused</span>
                          </>
                        )}
                      </button>
                    </div>

                    {activeAds && activeAds.length > 0 ? (
                      <div className="space-y-3">
                        <div className="w-full h-20 bg-slate-950 rounded-lg overflow-hidden relative border border-white/5">
                          <img 
                            src={activeAds[adPlayIndex % activeAds.length].bannerUrl || "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=640"} 
                            alt="Dynamic Sponsor Banner" 
                            className="w-full h-full object-cover opacity-60 transition-all duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute top-2 left-2 text-[8px] font-mono uppercase bg-pink-500/35 text-pink-200 border border-pink-500/30 px-1.5 py-0.5 rounded">
                            Bid Spot #{ (adPlayIndex % activeAds.length) + 1 } (of { activeAds.length })
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-cyan-400 font-extrabold text-[13px] font-mono">
                              {activeAds[adPlayIndex % activeAds.length].tokenSymbol}
                              <span className="text-white text-[9px] font-normal font-sans ml-1">({activeAds[adPlayIndex % activeAds.length].tokenName})</span>
                            </span>
                            <span className="text-[9px] font-mono bg-purple-500/10 border border-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded uppercase font-bold">
                              {activeAds[adPlayIndex % activeAds.length].chain}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-snug line-clamp-2 h-8 font-sans">
                            {activeAds[adPlayIndex % activeAds.length].tagline}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-1 mt-1 border-t border-white/5 pt-2 text-[10px] font-mono">
                          <button
                            onClick={() => {
                              setIsAdPlaying(false);
                              setAdPlayIndex((prev) => (prev - 1 + activeAds.length) % activeAds.length);
                            }}
                            className="px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded text-slate-400 hover:text-white transition"
                          >
                            ◀
                          </button>

                          <button
                            onClick={() => {
                              setAddress(activeAds[adPlayIndex % activeAds.length].tokenAddress);
                              setSelectedChain(activeAds[adPlayIndex % activeAds.length].chain);
                              performAnalysis(activeAds[adPlayIndex % activeAds.length].tokenAddress, activeAds[adPlayIndex % activeAds.length].chain);
                            }}
                            className="px-3 py-1 bg-pink-500 hover:bg-pink-400 text-black font-extrabold rounded-md text-[9.5px] uppercase tracking-wider flex items-center gap-1 transition-all"
                          >
                            Inspect ➔
                          </button>

                          <button
                            onClick={() => {
                              setIsAdPlaying(false);
                              setAdPlayIndex((prev) => (prev + 1) % activeAds.length);
                            }}
                            className="px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded text-slate-400 hover:text-white transition"
                          >
                            ▶
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-xs text-slate-500 font-mono">NO ACTIVE DISPLAYS FOUND</p>
                        <button 
                          onClick={() => setCurrentPage('CREATE_AD')}
                          className="mt-2 px-3 py-1 bg-pink-500/15 border border-pink-500/25 text-pink-400 hover:text-white rounded text-[10px] font-bold uppercase transition"
                        >
                          Bid Ad Slot
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ROBOTIC EXTENDED ECOSYSTEM FEATURES HUB */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-pink-400 animate-pulse" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                    Robotic Ecosystem Features Hub
                  </h3>
                </div>

                <div className="max-w-md">
                  {/* Card 1: ad portal */}
                  <div className="bg-gradient-to-br from-white/5 to-slate-950 border border-white/10 rounded-xl p-4 flex flex-col justify-between hover:border-pink-500/20 transition-all duration-300">
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center gap-2">
                        <Megaphone className="w-4 h-4 text-pink-400" />
                        <h4 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">Create Banner Ad</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                        Deploy sponsored token advertisements across cryptographic scanning nodes using $ROB utility tokens.
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentPage('CREATE_AD')}
                      className="w-full py-2 bg-gradient-to-r from-pink-500/10 to-pink-500/5 hover:from-pink-500/20 border border-pink-500/20 text-pink-300 hover:text-white font-mono font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center"
                    >
                      Open Ad Portal ↗
                    </button>
                  </div>
                </div>
              </div>



              {/* SEARCH VAULT / RECENT SEARCH HISTORY LIST */}
              {scanHistory.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                      Scanning Audit Vault History
                    </h3>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden max-w-3xl">
                    <div className="max-h-56 overflow-y-auto pr-1 no-scrollbar text-xs font-mono">
                      {scanHistory.map((sh, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center justify-between p-3.5 border-b border-slate-900 hover:bg-slate-900/10 cursor-pointer text-[11px] transition"
                          onClick={() => triggerQuickScan(sh.address, sh.chain)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-slate-500 text-[9px]">#{idx + 1}</span>
                            <div>
                              <div className="flex items-center gap-1.5 font-sans">
                                <span className="text-white text-xs font-semibold">{sh.name}</span>
                                <span className="text-[10px] text-cyan-400 font-bold">{sh.symbol}</span>
                              </div>
                              <span className="opacity-80 text-slate-500 uppercase font-mono text-[9px]">{sh.chain} : {sh.address}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 font-mono">
                            <div className="text-right hidden sm:block">
                              <span className="text-[10px] text-slate-500 block">TIMESTAMP</span>
                              <span className="text-slate-400">{new Date(sh.time).toLocaleTimeString()}</span>
                            </div>
                            <div className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                              sh.score >= 80 
                                ? 'bg-emerald-500/15 text-emerald-400' 
                                : sh.score >= 50 
                                ? 'bg-yellow-500/15 text-yellow-400' 
                                : 'bg-red-500/15 text-red-400'
                            }`}>
                              {sh.score}/100 SEC
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ================= VIEW 2: ACTIVE SCOPE ANALYSIS MODULE ================= */
            <div className="space-y-6">
              
              {/* Back navigation & Export Buttons panel */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl">
                <div className="flex items-center gap-3.5">
                  <button 
                    onClick={resetScanner}
                    className="p-2 hover:bg-white/10 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                    title="Run another analysis"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-md sm:text-lg font-bold text-white tracking-tight leading-none uppercase">
                        {result.token.name} ({result.token.symbol}) Overview
                      </h2>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-300 font-medium">Scanned and cached at: {new Date(result.detectedAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-auto font-mono text-xs">
                  <button 
                    onClick={shareAudit}
                    className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-250 rounded-xl hover:text-cyan-400 flex items-center gap-1.5 transition cursor-pointer font-bold uppercase text-[10px] tracking-wider"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share Report
                  </button>
                  <button 
                    onClick={exportPDFReport}
                    className="px-3.5 py-2 bg-gradient-to-r from-cyan-500/20 to-cyan-500/10 hover:from-cyan-500/30 text-cyan-300 hover:text-white border border-cyan-500/30 rounded-xl flex items-center gap-1.5 transition cursor-pointer font-bold uppercase text-[10px] tracking-wider"
                  >
                    <Download className="w-3.5 h-3.5" /> Export Report
                  </button>
                  <button 
                    onClick={resetScanner}
                    className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded-xl cursor-pointer"
                    title="Close report"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Online Verified Certificate Alert */}
              {hasOnlineAudit && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-sans animate-fadeIn">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-emerald-500/15 text-emerald-400 rounded-xl border border-emerald-500/20 shrink-0">
                      <ShieldCheck className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">
                        Official ROBOTIC Compliance Audit Detected
                      </h4>
                      <p className="text-xs text-emerald-300 font-mono mt-0.5">
                        Certificate ID: <strong className="font-extrabold">{hasOnlineAudit.id}</strong> | Validated on {hasOnlineAudit.timestamp}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      (window as any)._initialShareAuditId = hasOnlineAudit.id;
                      setCurrentPage('AUDIT');
                    }}
                    className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition duration-200 cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Online Certificate</span>
                  </button>
                </div>
              )}

              {/* TABS SELECTOR PANEL */}
              <div className="flex border-b border-white/5 overflow-x-auto whitespace-nowrap gap-1 md:gap-2 pb-0.5 no-scrollbar">
                {(['OVERVIEW', 'AI_AUDIT', 'SECURITY', 'LIQUIDITY', 'HOLDERS', 'CHARTS'] as const).map((tab) => {
                  const getTabLabel = () => {
                    if (tab === 'OVERVIEW') return { label: 'Token Stats', icon: Cpu };
                    if (tab === 'AI_AUDIT') return { label: 'Gemini AI Advisor', icon: ShieldAlert };
                    if (tab === 'SECURITY') return { label: 'Code Safety Checks', icon: AlertTriangle };
                    if (tab === 'LIQUIDITY') return { label: 'LP & Pools', icon: Compass };
                    if (tab === 'HOLDERS') return { label: 'Holders Ledger', icon: Users };
                    return { label: 'Price Chart v2', icon: LineChart };
                  };

                  const chip = getTabLabel();
                  const Icon = chip.icon;

                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2.5 rounded-t-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 transition border-b-2 cursor-pointer ${
                        activeTab === tab 
                          ? 'border-cyan-400 bg-white/5 text-cyan-400 font-bold' 
                          : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {chip.label}
                    </button>
                  );
                })}
              </div>

              {/* ACTIVE TAB CONTENTS SWITCH DECK */}
              <div className="grid grid-cols-1 gap-6">
                
                {/* 1. OVERVIEW SCREEN TAB */}
                {activeTab === 'OVERVIEW' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    <div className="lg:col-span-5">
                      <TokenOverviewCard token={result.token} />
                    </div>
                    
                    <div className="lg:col-span-7 grid grid-cols-1 gap-6">
                      <div className="border border-white/10 rounded-2xl bg-white/5 p-5 font-mono text-xs text-slate-400 flex flex-col justify-between">
                        <div>
                          <h4 className="text-white font-bold font-sans uppercase text-sm mb-3 tracking-wide">
                            QUICK SECURITY DISCLOSURE
                          </h4>
                          <div className="space-y-4 leading-relaxed font-sans mt-2 text-slate-350">
                            <p>
                              The contract matches a security rating of <strong className="text-cyan-400">{result.ai.rating.toUpperCase()}</strong> with a safety factor of <strong>{result.security.securityScore} points</strong> out of 100.
                            </p>
                            <p>
                              Our dynamic code auditor found <strong className="text-yellow-400">{result.security.risksCount} potential vulnerabilities</strong> or owner administration nodes. Transaction taxes are set at <strong>{result.security.buyTax}% Buy</strong> and <strong>{result.security.sellTax}% Sell</strong>.
                            </p>
                            <p>
                              Liquidity safety pools holding developer tokens display a lock level of <strong>{result.liquidity.lpLocked}% Locked LP</strong>.
                            </p>
                          </div>
                        </div>

                        {/* Direct risk actions */}
                        <div className="mt-5 p-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 flex items-start gap-2 text-cyan-300 font-sans text-xs">
                          <Cpu className="w-4 h-4 mt-0.5 shrink-0 animate-pulse text-cyan-400" />
                          <span>
                            AI Recommendations suggest a <strong>{result.ai.suggestedAction.toUpperCase()}</strong> protocol based on the computed risk/reward profile index.
                          </span>
                        </div>
                      </div>

                      {/* Side preview chart */}
                      <PriceChart 
                        priceHistory={result.priceHistory} 
                        livePrice={result.token.price} 
                        symbol={result.token.symbol} 
                      />
                    </div>
                  </div>
                )}

                {/* 2. AI SCOUT REPORT ADVISOR */}
                {activeTab === 'AI_AUDIT' && (
                  <div className="w-full">
                    <AiRiskPanel ai={result.ai} />
                  </div>
                )}

                {/* 3. CODE EXAMINER / SECURITY LEVEL */}
                {activeTab === 'SECURITY' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    <div className="lg:col-span-6">
                      <SecurityConsole security={result.security} />
                    </div>
                    
                    <div className="lg:col-span-6 border border-white/10 rounded-2xl bg-white/5 p-6 flex flex-col justify-between">
                      <div className="space-y-4">
                        <h4 className="text-md font-bold uppercase text-white font-sans tracking-wide">
                          Smart Contract Safety Matrix
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          Our automated scanner examines the bytecode of compiled smart contracts to find patterns matching known exploit or rug-pull behaviors.
                        </p>

                        <div className="space-y-2.5 pt-2 text-xs font-mono">
                          <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                            <span className="text-slate-400 font-medium">Ownership Privileges</span>
                            <span className="text-white font-bold">{result.security.ownershipRenounced ? "RENOUNCED" : "OWNED VIA PORTAL"}</span>
                          </div>

                          <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                            <span className="text-slate-400 font-medium">Contract Modifiers</span>
                            <span className="text-white font-bold">{result.security.mintable ? "INFLATION OPEN" : "LOCKED TOTAL SUPPLY"}</span>
                          </div>

                          <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                            <span className="text-slate-400 font-medium">Honeypot Trap Signature</span>
                            <span className={`font-bold ${result.security.honeypot ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                              {result.security.honeypot ? "CRITICAL TRAP MATCH" : "SAFE / CAN SELL"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/25 mt-6 text-yellow-500 text-xs font-mono leading-relaxed flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>
                          Warning: Automatic scoring serves as metadata and code pattern calculations. Always perform manual verification before allocating substantial capital targets.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. LIQUIDITY POOL ANALYSIS */}
                {activeTab === 'LIQUIDITY' && (
                  <div className="w-full">
                    <LiquidityGauge liquidity={result.liquidity} />
                  </div>
                )}

                {/* 5. HOLDERS CONCENTRATE */}
                {activeTab === 'HOLDERS' && (
                  <div className="w-full">
                    <HolderList holders={result.holders} />
                  </div>
                )}

                {/* 6. TECHNICAL CHARTS */}
                {activeTab === 'CHARTS' && (
                  <div className="w-full">
                    <PriceChart 
                      priceHistory={result.priceHistory} 
                      livePrice={result.token.price} 
                      symbol={result.token.symbol} 
                    />
                  </div>
                )}
              </div>
            </div>
          ) ) : currentPage === 'FEATURES' ? (
            /* ================= VIEW 3: FEATURES PORTAL CONTROL ================= */
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/5 border border-white/10 p-5 rounded-2xl relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl">
                    <Cpu className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white uppercase tracking-wider">Features Control Dashboard</h2>
                    <p className="text-xs text-slate-400 font-mono">UNLOCK OPERATIONAL DECENTRALIZED UTILITIES POWERED BY USER GRIDS</p>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentPage('CREATE_AD')}
                  className="px-4 py-2.5 bg-pink-500 hover:bg-pink-400 text-black font-extrabold text-[11px] uppercase tracking-wider rounded-lg transition duration-200 cursor-pointer flex items-center gap-1.5 shadow-[0_4px_12px_rgba(244,63,94,0.15)] ml-auto md:ml-0"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Squeeze Ad Campaign (350 $ROB)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Advanced multi-core automated system */}
              <SystemsDashboard
                robBalance={robBalance}
                setRobBalance={setRobBalance}
                triggerToast={triggerToast}
                isDark={isDark}
                scannedResult={result}
                initialTab={dashboardInitialTab}
              />
            </div>
          ) : currentPage === 'CREATE_AD' ? (
            /* ================= VIEW 4: CREATE AD PORTAL ================= */
            <AdPortal
              onBack={() => setCurrentPage('FEATURES')}
              onAddAd={(newAd) => {
                setActiveAds(prev => [...prev, newAd]);
                setRobBalance(b => b - newAd.budgetRob);
              }}
              robBalance={robBalance}
              triggerToast={triggerToast}
            />
          ) : currentPage === 'CREATE_AIRDROP' ? (
            /* ================= VIEW 4.5: CREATE AIRDROP PORTAL ================= */
            <AirdropPortal
              onBack={() => setCurrentPage('FEATURES')}
              robBalance={robBalance}
              setRobBalance={setRobBalance}
              triggerToast={triggerToast}
              isDark={isDark}
            />
          ) : (
            /* ================= VIEW 5: CONTRACT AUDIT PORTAL ================= */
            <ContractAuditPortal
              robBalance={robBalance}
              setRobBalance={setRobBalance}
              triggerToast={triggerToast}
              isDark={isDark}
              auditMode={currentPage === 'TESTNET_AUDIT' ? 'TESTNET' : 'MAINNET'}
            />
          ) }
        </main>

        {/* Footer info panels */}
        <footer className="mt-16 pt-6 border-t border-white/5 text-center text-xs text-slate-500 space-y-4 select-text font-mono">
          <div className="flex justify-center items-center flex-wrap gap-3">
            <button 
              onClick={() => setShowAbout(true)}
              className="px-4 py-1.5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 hover:text-white rounded-full text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all duration-300"
              id="about-button"
            >
              About
            </button>
            <a 
              href="https://raydium.io/swap/?inputMint=sol&outputMint=Fp1D76gXEPmF7aN8g1tWKy9nLbyWf3G8gNwyT1dJ2v"
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-pink-500/10 to-purple-500/10 hover:from-pink-500/25 hover:to-purple-500/25 border border-pink-500/30 hover:border-pink-400 text-pink-400 hover:text-white rounded-full text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all duration-300"
              id="buy-rob-button"
              title="Buy $ROB on Raydium"
            >
              <img 
                src="https://s2.coinmarketcap.com/static/img/coins/64x64/8526.png" 
                alt="Raydium" 
                className="w-4 h-4 rounded-full" 
                referrerPolicy="no-referrer"
              />
              Buy $ROB
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <p>
            © {new Date().getFullYear()} ROBOTIC intelligence system.
          </p>
          <p className="max-w-2xl mx-auto text-[10px] opacity-60 leading-relaxed font-sans">
            Disclaimer: ROBOTIC reports do not constitute financial or asset investment advice. Smart contracts contain high-volatility parameters and hidden risks. Always carry out independent validation protocols.
          </p>
        </footer>

        {/* Cinematic Intelligent Overlay Drawer for ROBOTIC and $ROB specifications */}
        <AnimatePresence>
          {showAbout && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
              onClick={() => setShowAbout(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="w-full max-w-md rounded-2xl border border-white/10 bg-[#06060c] p-4 sm:p-6 shadow-[0_0_50px_rgba(6,182,212,0.2)] relative overflow-y-auto max-h-[90vh] select-none"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Visual backlighting */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />

                <button 
                  onClick={() => setShowAbout(false)}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition duration-200"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <div className="flex items-center gap-3 pb-3 border-b border-white/5 mb-4 relative">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden border border-white/15 shrink-0 bg-black">
                    <img 
                      src="https://raw.githubusercontent.com/robecosystem/robecosystem.github.io/refs/heads/main/ROBOTIC%20logo.jpg" 
                      alt="ROBOTIC Logo" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white tracking-widest uppercase mb-0.5">
                      ROBOTIC<span className="text-cyan-400">.AI</span>
                    </h3>
                    <span className="text-[9px] sm:text-[10px] font-mono text-cyan-400/80 tracking-wider block font-bold leading-none">
                      INTELLIGENT SCANNERS & RUG DETECTION
                    </span>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4 text-[11px] sm:text-xs text-slate-300 leading-relaxed font-sans relative">
                  <p>
                    <strong>ROBOTIC</strong> is an advanced web-native cybernetic safety layer that conducts instantaneous security audits of decentralized smart contracts. Underpinned by ultra-fast decision-making nodes, ROBOTIC inspects bytecode integrity, owner renouncement triggers, mint status, and liquidity distribution across major blockchains.
                  </p>
                  
                  <div className="p-3 sm:p-4 bg-white/[0.03] border border-white/5 rounded-xl space-y-2 font-mono text-[10px] sm:text-[11px] backdrop-blur-sm">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className="text-slate-400">Governance Token</span>
                      <span className="text-cyan-400 font-extrabold text-xs">$ROB</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className="text-slate-400">Network Host</span>
                      <span className="text-white font-bold uppercase">Solana (SOL) Blockchain</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Total Capital Supply</span>
                      <span className="text-emerald-400 font-extrabold text-xs">9,999,998 $ROB</span>
                    </div>
                  </div>

                  <p className="text-[9px] sm:text-[10px] text-slate-500 italic leading-normal">
                    The native utility token <strong>$ROB</strong> enables hyper-threaded verification pipelines, distributes cryptographic computation tokens among edge scanning terminals, and secures consensus scoring mechanics.
                  </p>

                  <div className="space-y-2.5 pt-1.5">
                    <a 
                      href="https://raydium.io/swap/?inputMint=sol&outputMint=Fp1D76gXEPmF7aN8g1tWKy9nLbyWf3G8gNwyT1dJ2v"
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 sm:py-2.5 w-full justify-center bg-gradient-to-r from-pink-500/15 to-purple-500/15 hover:from-pink-500/25 hover:to-purple-500/25 border border-pink-500/30 hover:border-pink-400 text-pink-300 hover:text-white rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider cursor-pointer transition-all duration-300 shadow-md text-center"
                      id="buy-rob-about-button"
                      title="Buy $ROB on Raydium"
                    >
                      <img 
                        src="https://s2.coinmarketcap.com/static/img/coins/64x64/8526.png" 
                        alt="Raydium Code logo" 
                        className="w-4 h-4 rounded-full" 
                        referrerPolicy="no-referrer"
                      />
                      <span>Buy $ROB on Raydium</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-75" />
                    </a>

                    <div className="flex justify-center">
                      <a 
                        href="https://drive.google.com/file/d/182bKLgN9hEHLzdEiCMgUi31dfAnpvLW6/view?usp=drivesdk"
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 text-[9px] sm:text-[10px] text-slate-400 hover:text-white rounded-md font-bold uppercase tracking-wider cursor-pointer transition-all duration-300"
                        id="view-whitepaper-about-button"
                        title="Read $ROB Whitepaper"
                      >
                        <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
                        <span>$ROB Whitepaper</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4 pt-3 border-t border-white/5">
                    <a 
                      href="https://github.com/robecosystem?tab=repositories" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-300 shadow-md hover:scale-105 cursor-pointer"
                      title="GitHub Repository"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-current" stroke="none">
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                      </svg>
                    </a>
                    <a 
                      href="https://t.me/robecosystem" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 text-slate-400 hover:text-cyan-400 flex items-center justify-center transition-all duration-300 shadow-md hover:scale-105 cursor-pointer"
                      title="Telegram Community"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-current pl-0.5" stroke="none">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.37-.49 1.03-.75 4.04-1.76 6.74-2.92 8.09-3.48 3.85-1.6 4.64-1.88 5.17-1.89.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.15-.03.22z"/>
                      </svg>
                    </a>
                    <a 
                      href="https://x.com/Robecosystem" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-300 shadow-md hover:scale-105 cursor-pointer"
                      title="X (formerly Twitter)"
                    >
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" stroke="none">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>
                  </div>
                </div>

                <div className="mt-5 flex justify-end relative">
                  <button 
                    onClick={() => setShowAbout(false)}
                    className="px-4 py-1.5 sm:px-5 sm:py-2 bg-white/10 hover:bg-white/15 text-white border border-white/10 hover:border-white/20 font-bold text-[10px] sm:text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                  >
                    Acknowledge
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
