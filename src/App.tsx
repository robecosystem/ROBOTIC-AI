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
  RefreshCw
} from "lucide-react";

import RoboBackground from "./components/RoboBackground";
import TokenOverviewCard from "./components/TokenOverviewCard";
import SecurityConsole from "./components/SecurityConsole";
import LiquidityGauge from "./components/LiquidityGauge";
import HolderList from "./components/HolderList";
import PriceChart from "./components/PriceChart";
import AiRiskPanel from "./components/AiRiskPanel";
import { FullAnalysisResponse, TrendingToken, ScanHistoryItem } from "./types";

export default function App() {
  // Input Controllers
  const [address, setAddress] = useState("");
  const [selectedChain, setSelectedChain] = useState("Solana");
  
  // App States
  const [loading, setLoading] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState<string[]>([]);
  const [result, setResult] = useState<FullAnalysisResponse | null>(null);
  const [trendingTokens, setTrendingTokens] = useState<TrendingToken[]>([]);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'AI_AUDIT' | 'SECURITY' | 'LIQUIDITY' | 'HOLDERS' | 'CHARTS'>('OVERVIEW');
  const [showAbout, setShowAbout] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

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
      const trendingRes = await fetch("/api/trending");
      if (trendingRes.ok) {
        const tokens = await trendingRes.ok ? await trendingRes.json() : [];
        setTrendingTokens(tokens);
      }
      
      const historyRes = await fetch("/api/history");
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setScanHistory(historyData);
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
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addrToScan.trim(), chain: chainToScan }),
      });

      if (response.ok) {
        const fullAudit: FullAnalysisResponse = await response.json();
        setResult(fullAudit);
        setActiveTab('OVERVIEW');
        triggerToast("Analysis completed successfully.");
        // Re-fetch Scan Vault history to sync logs
        fetchTrendingAndHistory();
      } else {
        const errorMsg = await response.json();
        triggerToast(errorMsg?.details || "Failed to analyze contract address.");
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
    <div className="relative min-h-screen bg-[#020205] text-slate-300 font-sans selection:bg-cyan-500 selection:text-white">
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
        
        {/* Navigation / Header Brand Bar */}
        <header className="flex items-center justify-between border-b border-white/5 pb-5 mb-8 bg-black/40 backdrop-blur-xl p-4 rounded-xl relative z-10">
          <div className="flex items-center gap-3">
            {/* Visual ROBOTIC logo image */}
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/20 shrink-0">
              <img 
                src="https://raw.githubusercontent.com/robecosystem/robecosystem.github.io/refs/heads/main/ROBOTIC%20logo.jpg" 
                alt="ROBOTIC Logo" 
                className="w-full h-full object-cover animate-pulse"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-widest text-white leading-none">
                ROBOTIC<span className="text-cyan-400 font-normal underline decoration-cyan-400/30">.AI</span>
              </h1>
              <span className="text-[10px] font-mono tracking-wider opacity-60 text-cyan-300">
                AI-POWERED SYSTEM INTEL & RUG DETECTOR
              </span>
            </div>
          </div>
          
          {/* Real-time status and premium connects */}
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]" />
              <span className="text-xs font-mono text-white/70">Nodes Active</span>
            </div>
            <button 
              onClick={() => triggerToast("Terminal connected securely to node grid.")}
              className="px-5 py-1.5 bg-cyan-500 text-black text-xs font-bold rounded-md hover:bg-cyan-400 uppercase tracking-widest transition-colors cursor-pointer"
            >
              Connect Terminal
            </button>
          </div>
        </header>

        {/* Primary Container layout */}
        <main className="flex-1">
          {!result ? (
            /* ================= VIEW 1: LANDING CONSOLE ================= */
            <div className="space-y-12">

              {/* CONTRACT SCAN INPUT BAR */}
              <div className="max-w-3xl border border-white/15 rounded-2xl bg-white/5 backdrop-blur-md p-5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <div className="flex flex-col md:flex-row items-center gap-3.5">
                  
                  {/* Selected Token Chain Toggle Dropdown */}
                  <div className="w-full md:w-56 select-none shrink-0 relative">
                    <label className="text-[10px] font-mono text-cyan-400 block mb-1.5 uppercase font-semibold tracking-wider">Audit blockchain</label>
                    <select 
                      value={selectedChain}
                      onChange={(e) => setSelectedChain(e.target.value)}
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-mono font-bold focus:outline-none focus:border-cyan-500/50 transition cursor-pointer"
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
                    <label className="text-[10px] font-mono text-cyan-400 block mb-1.5 uppercase font-semibold tracking-wider">Contract Address</label>
                    <div className="relative">
                      <input 
                        type="text"
                        placeholder="Paste contract address hash (Solana, EVM, base...)"
                        value={address}
                        onChange={(e) => handleAddressChange(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && performAnalysis(address, selectedChain)}
                        className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl pl-10 pr-24 py-3 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/55 transition"
                      />
                      <Search className="w-4 h-4 text-slate-650 absolute left-3.5 top-3.5" />
                      
                      {/* Paste Assistant button */}
                      <button 
                        onClick={pasteFromClipboard}
                        className="absolute right-3.5 top-2.5 p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-cyan-400 transition"
                        title="Paste from clipboard"
                      >
                        <Clipboard className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Execution button */}
                  <div className="w-full md:w-auto self-end">
                    <button 
                      onClick={() => performAnalysis(address, selectedChain)}
                      disabled={loading}
                      className="w-full md:w-auto px-7 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/55 disabled:cursor-not-allowed text-black font-bold rounded-xl text-xs leading-none uppercase tracking-widest flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-[0_4px_15px_rgba(6,182,212,0.3)] hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing
                        </>
                      ) : (
                        <>
                          <Cpu className="w-4 h-4" /> Analyse
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
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                    <Cpu className="w-3.5 h-3.5" /> Core Gemini-3.5 Enabled
                  </div>
                  
                  <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tighter">
                    Cybernetic <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Rug-Pull Analyzer</span> & Market Intelligence
                  </h2>
                  
                  <p className="text-sm text-slate-400 max-w-lg leading-relaxed font-sans">
                    Instantly scan Solana, Ethereum, Base, and major blockchain contracts. ROBOTIC parses code patterns, scans liquidity safety locks, audits ledger groupings, and scores risks using the AI Risk Engine in under 2 seconds.
                  </p>

                  {/* Operational badgings */}
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {chainsList.map((ch) => (
                      <span 
                        key={ch} 
                        className="text-[10px] font-mono font-bold px-2.5 py-1 bg-slate-900/60 border border-slate-800 rounded-lg text-slate-400"
                      >
                        ● {ch.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* VISUAL ROBOTICS SVG SCREEN CARD */}
                <div className="lg:col-span-5 relative flex justify-center">
                  <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_0_30px_rgba(6,182,212,0.15)] overflow-hidden relative">
                    {/* glowing lights */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />

                    <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="text-[10px] font-mono text-cyan-400 uppercase">SYS_MEMBER_SCAN</span>
                      </div>
                      <span className="text-[10px] font-mono text-purple-400">ONLINE</span>
                    </div>

                    <div className="space-y-3.5 text-center flex flex-col items-center">
                      {/* SVG Mini android tracker */}
                      <svg className="w-24 h-24 text-cyan-400 filter drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="30" y="30" width="40" height="40" rx="4" />
                        <line x1="40" y1="45" x2="45" y2="45" strokeWidth="2" strokeLinecap="round" />
                        <line x1="55" y1="45" x2="60" y2="45" strokeWidth="2" strokeLinecap="round" />
                        <line x1="45" y1="58" x2="55" y2="58" strokeWidth="1.5" />
                        <path d="M 25,50 L 15,40 M 75,50 L 85,40 M 50,30 L 50,15" />
                        <circle cx="50" cy="15" r="3" className="fill-purple-400 stroke-purple-400" />
                        <line x1="10" y1="50" x2="90" y2="50" className="stroke-purple-400 animate-pulse" />
                      </svg>
                      
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white uppercase font-mono">Robotic HUD Terminal</h4>
                        <p className="text-[11px] text-slate-400 max-w-[240px] leading-relaxed mx-auto">
                          Paste any contract hash below. Our node network immediately decrypts its liquidity and freeze signatures.
                        </p>
                      </div>
                    </div>
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
          )}
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
            © {new Date().getFullYear()} ROBOTIC intelligence system. Built exclusively using React 19 + Gemini-3.5 APIs.
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
                className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#06060c] p-6 shadow-[0_0_50px_rgba(6,182,212,0.2)] relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Visual backlighting */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />

                <button 
                  onClick={() => setShowAbout(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition duration-200"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3.5 pb-4 border-b border-white/5 mb-5 relative">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/15 shrink-0 bg-black">
                    <img 
                      src="https://raw.githubusercontent.com/robecosystem/robecosystem.github.io/refs/heads/main/ROBOTIC%20logo.jpg" 
                      alt="ROBOTIC Logo" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white tracking-widest uppercase mb-0.5">
                      ROBOTIC<span className="text-cyan-400">.AI</span>
                    </h3>
                    <span className="text-[10px] font-mono text-cyan-400/80 tracking-wider block font-bold leading-none">
                      INTELLIGENT SCANNERS & RUG DETECTION
                    </span>
                  </div>
                </div>

                <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans relative">
                  <p>
                    <strong>ROBOTIC</strong> is an advanced web-native cybernetic safety layer that conducts instantaneous security audits of decentralized smart contracts. Underpinned by ultra-fast decision-making nodes, ROBOTIC inspects bytecode integrity, owner renouncement triggers, mint status, and liquidity distribution across major blockchains.
                  </p>
                  
                  <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl space-y-2.5 font-mono text-[11px] backdrop-blur-sm">
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

                  <p className="text-[10px] text-slate-500 italic leading-normal">
                    The native utility token <strong>$ROB</strong> enables hyper-threaded verification pipelines, distributes cryptographic computation tokens among edge scanning terminals, and secures consensus scoring mechanics.
                  </p>

                  <div className="flex justify-center pt-2">
                    <a 
                      href="https://raydium.io/swap/?inputMint=sol&outputMint=Fp1D76gXEPmF7aN8g1tWKy9nLbyWf3G8gNwyT1dJ2v"
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 px-5 py-2 w-full justify-center bg-gradient-to-r from-pink-500/15 to-purple-500/15 hover:from-pink-500/25 hover:to-purple-500/25 border border-pink-500/30 hover:border-pink-400 text-pink-300 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer transition-all duration-300 shadow-md text-center"
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
                      <ExternalLink className="w-4 h-4 opacity-75" />
                    </a>
                  </div>

                  <div className="flex items-center justify-center gap-4 pt-4 border-t border-white/5">
                    <a 
                      href="https://github.com/robecosystem?tab=repositories" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-300 shadow-md hover:scale-105 cursor-pointer"
                      title="GitHub Repository"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" stroke="none">
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                      </svg>
                    </a>
                    <a 
                      href="https://t.me/robecosystem" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 text-slate-400 hover:text-cyan-400 flex items-center justify-center transition-all duration-300 shadow-md hover:scale-105 cursor-pointer"
                      title="Telegram Community"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current pl-0.5" stroke="none">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.37-.49 1.03-.75 4.04-1.76 6.74-2.92 8.09-3.48 3.85-1.6 4.64-1.88 5.17-1.89.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.15-.03.22z"/>
                      </svg>
                    </a>
                    <a 
                      href="https://x.com/Robecosystem" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-300 shadow-md hover:scale-105 cursor-pointer"
                      title="X (formerly Twitter)"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" stroke="none">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>
                  </div>
                </div>

                <div className="mt-6 flex justify-end relative">
                  <button 
                    onClick={() => setShowAbout(false)}
                    className="px-5 py-2 bg-white/10 hover:bg-white/15 text-white border border-white/10 hover:border-white/20 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
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
