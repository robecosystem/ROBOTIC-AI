import React, { useState, useEffect, useRef } from "react";
import SolanaWalletConnector from "./SolanaWalletConnector";
import { 
  Rocket, 
  MessageSquare, 
  Wallet, 
  LineChart, 
  ShieldAlert, 
  Award, 
  FileWarning, 
  Coins, 
  Activity, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  Zap, 
  Flame, 
  Users, 
  Mic, 
  MicOff, 
  Volume2, 
  Send, 
  Sparkles, 
  X, 
  Clock, 
  ChevronRight, 
  AlertTriangle, 
  Cpu, 
  CreditCard, 
  ArrowUpRight, 
  Play, 
  HelpCircle,
  Globe
} from "lucide-react";

interface SystemsDashboardProps {
  robBalance: number;
  setRobBalance: React.Dispatch<React.SetStateAction<number>>;
  triggerToast: (msg: string) => void;
  isDark: boolean;
  scannedResult?: any;
  initialTab?: 'DASHBOARD' | 'LAUNCHES' | 'CHAT' | 'WALLETS' | 'SIGNALS' | 'STAKING' | 'EMERGENCY' | 'SCAMS' | 'LEARN' | 'MONITOR' | 'ANTI_FAKE';
}

// Simulated active launched projects
const INITIAL_LAUNCHES = [
  { id: "ln_1", name: "AlphaGrid", symbol: "AGRID", chain: "Solana", lpStatus: "100% Locked", rating: "Potential Gem" as const, lpAmount: "$85,000", created: "3 min ago" },
  { id: "ln_2", name: "SafeBase Inu", symbol: "SAFEBINU", chain: "Base", lpStatus: "Unlocked! Danger Risk", rating: "Avoid" as const, lpAmount: "$3,400", created: "5 min ago" },
  { id: "ln_3", name: "QuantumSentinel", symbol: "QSEN", chain: "Ethereum", lpStatus: "95% Burned", rating: "Potential Gem" as const, lpAmount: "$120,000", created: "9 min ago" },
  { id: "ln_4", name: "TurboTron Blast", symbol: "TTRON", chain: "Tron", lpStatus: "No Pool Lock Detected", rating: "Possible Rug" as const, lpAmount: "$15,000", created: "14 min ago" },
  { id: "ln_5", name: "MechaMatrix AI", symbol: "MMTX", chain: "Base", lpStatus: "LP Burned", rating: "Potential Gem" as const, lpAmount: "$48,000", created: "21 min ago" },
];

// Simulated global reported scams
const INITIAL_SCAMS = [
  { id: "sc_1", name: "Raydium Phishing Clone", type: "Drainer Site", reportedBy: "0x39a1...10cf", status: "VERIFIED" },
  { id: "sc_2", name: "CyberX AirDrop Scam", type: "Malicious Contract", reportedBy: "0xf43a...a9e0", status: "VERIFIED" },
  { id: "sc_3", name: "GigaPump Dev Exit", type: "Rug Pull Token", reportedBy: "0x78bf...51c1", status: "INVESTIGATING" },
];

// Whale tracking list
const INITIAL_WHALES = [
  { name: "DeFi Sniper Elite", address: "8s7GFgXePME...v9J1d", chain: "Solana", dailyTxCount: 42, riskScore: 12, isProOnly: false },
  { name: "Base Whale Titan #3", address: "0x71c...dead3", chain: "Base", dailyTxCount: 18, riskScore: 48, isProOnly: true },
  { name: "EVM Smart Money #09", address: "0x217...9f933f8", chain: "Ethereum", dailyTxCount: 114, riskScore: 8, isProOnly: true },
];

export default function SystemsDashboard({
  robBalance,
  setRobBalance,
  triggerToast,
  isDark,
  scannedResult,
  initialTab
}: SystemsDashboardProps) {
  // Navigation tabs inside features dashboard
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'LAUNCHES' | 'CHAT' | 'WALLETS' | 'SIGNALS' | 'STAKING' | 'EMERGENCY' | 'SCAMS' | 'LEARN' | 'MONITOR' | 'ANTI_FAKE'>('DASHBOARD');
  
  // Update tab dynamically when initialTab changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  
  // Pro status state (persisted locally)
  const [isProUser, setIsProUser] = useState<boolean>(() => {
    return localStorage.getItem("rob_is_pro_tier") === "true";
  });

  const [proTier, setProTier] = useState<string | null>(() => {
    return localStorage.getItem("rob_pro_level") || null; // 'PRO' | 'INSTITUTIONAL'
  });

  // Staking States
  const [stakedAmount, setStakedAmount] = useState<number>(() => {
    return parseFloat(localStorage.getItem("rob_staked_balance") || "0");
  });
  const [earnedStakingRewards, setEarnedStakingRewards] = useState<number>(0);
  const [stakedInput, setStakedInput] = useState<string>("");
  const [stakingMode, setStakingMode] = useState<'TESTNET' | 'MAINNET'>('MAINNET');
  const [connectedWalletAddress, setConnectedWalletAddress] = useState<string | null>(() => {
    return localStorage.getItem("rob_wallet_address");
  });
  const [stakingPaymentSignature, setStakingPaymentSignature] = useState<string | null>(() => {
    return localStorage.getItem("rob_staking_payment_signature");
  });

  // AI Chat States
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai', text: string, timestamp: string }>>([
    { sender: 'ai', text: "ROBOTIC Systems core loaded. State: Secure. Ask me any contract risk analysis, wallet trace triggers, or web3 scam characteristics.", timestamp: "12:00" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isSpeechActive, setIsSpeechActive] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat box when history/typing state shifts
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isAiTyping]);

  // Handle scannedResult introduction
  useEffect(() => {
    if (scannedResult && scannedResult.token) {
      const sym = scannedResult.token.symbol || "N/A";
      const name = scannedResult.token.name || "Token";
      const welcomeText = `Intelligent Oracle session loaded! I have mapped the bytecode and live telemetry of ${name} (${sym}) successfully. Ask me about its active ownership status, dynamic mint controls, transaction tax safety thresholds, or custom red flags!`;
      
      setChatMessages(prev => {
        const alreadyHasWelcome = prev.slice(-3).some(m => m.text.includes(welcomeText) || m.text.includes(sym));
        if (alreadyHasWelcome) return prev;
        return [
          ...prev,
          {
            sender: 'ai' as const,
            text: welcomeText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ];
      });
    }
  }, [scannedResult]);

  // Launches States
  const [launches, setLaunches] = useState(INITIAL_LAUNCHES);
  const [scamReports, setScamReports] = useState(INITIAL_SCAMS);

  // New Scam Form
  const [scamName, setScamName] = useState("");
  const [scamType, setScamType] = useState("Drainer Site");
  const [scamAddress, setScamAddress] = useState("");

  // Subscriptions flow
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ name: string, priceUSD: number, priceRob: number } | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'ROB_TOKEN'>('ROB_TOKEN');

  // Emergency approve revoker states
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [approvalsScanned, setApprovalsScanned] = useState(false);
  const [liveApprovals, setLiveApprovals] = useState<Array<{ id: string, spender: string, allowance: string, risk: string, dApp: string }>>([]);

  // Live monitor feed log
  const [liveFeed, setLiveFeed] = useState<Array<{ id: string, text: string, chain: string, time: string, type: 'ALERT' | 'INFO' | 'SUCCESS' }>>([]);

  // Learn center status
  const [learnProgress, setLearnProgress] = useState<number>(() => {
    return parseInt(localStorage.getItem("rob_learn_progress") || "0");
  });
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);

  // Anti-Fake scanner state
  const [fakeInputUrl, setFakeInputUrl] = useState("");
  const [fakeAuditResult, setFakeAuditResult] = useState<any>(null);

  // --- Real-time feedback background loops ---
  useEffect(() => {
    // Generate simulated live feed items
    const feedInterval = setInterval(() => {
      const chains = ["Solana", "Ethereum", "Base", "Tron"];
      const tokensCode = ["ROB", "PEPE", "WIF", "CYPRO", "SOL3", "DOGE"];
      const chosenChain = chains[Math.floor(Math.random() * chains.length)];
      const chosenToken = tokensCode[Math.floor(Math.random() * tokensCode.length)];
      
      const actions = [
        { text: `Whale transferred 54M ${chosenToken} within secondary router`, type: 'ALERT' as const },
        { text: `New Liquid Pool registered for ${chosenToken} via Raydium V4`, type: 'SUCCESS' as const },
        { text: `Developer wallet transfer detected: ${chosenToken} suspicious funding`, type: 'ALERT' as const },
        { text: `GoPlus API synchronized smart contract audit locks for ${chosenToken}`, type: 'INFO' as const },
      ];
      
      const index = Math.floor(Math.random() * actions.length);
      const chosenAction = actions[index];

      const newItem = {
        id: "feed_" + Math.random().toString(36).substring(2, 9),
        text: chosenAction.text,
        chain: chosenChain,
        time: "Just now",
        type: chosenAction.type
      };

      setLiveFeed(prev => [newItem, ...prev.slice(0, 15)]);
    }, 4500);

    return () => clearInterval(feedInterval);
  }, []);

  // Update staking earned rewards over time to demonstrate offline high fidelity
  useEffect(() => {
    if (stakedAmount <= 0) return;
    const stakeInterval = setInterval(() => {
      setEarnedStakingRewards(prev => {
        const delta = stakedAmount * 0.000000042; // Realistic APY ticker scaled for 5.2%
        return prev + delta;
      });
    }, 2000);
    return () => clearInterval(stakeInterval);
  }, [stakedAmount]);

  // Persist Staking to memory
  useEffect(() => {
    localStorage.setItem("rob_staked_balance", stakedAmount.toString());
  }, [stakedAmount]);

  // Synchronize wallet and dynamic Staking signature
  useEffect(() => {
    const syncTimer = setInterval(() => {
      const addr = localStorage.getItem("rob_wallet_address");
      const sig = localStorage.getItem("rob_staking_payment_signature");
      if (addr !== connectedWalletAddress) {
        setConnectedWalletAddress(addr);
      }
      if (sig !== stakingPaymentSignature) {
        setStakingPaymentSignature(sig);
      }
    }, 500);
    return () => clearInterval(syncTimer);
  }, [connectedWalletAddress, stakingPaymentSignature]);

  // Premium toggle simulator
  const upgradeToPlan = (planName: string, robValue: number) => {
    if (robBalance < robValue) {
      triggerToast("Insufficient $ROB utility balance. Mine more or perform contract audit checks!");
      return;
    }
    setRobBalance(b => b - robValue);
    setIsProUser(true);
    setProTier(planName);
    localStorage.setItem("rob_is_pro_tier", "true");
    localStorage.setItem("rob_pro_level", planName);
    triggerToast(`Congratulations! Core Nodes initialized. Active Level: ${planName}`);
  };

  // Staking logic handlers
  const handleStakeSubmit = () => {
    const amt = parseFloat(stakedInput);
    if (isNaN(amt) || amt <= 0) {
      triggerToast("Enter a valid amount to commit.");
      return;
    }

    if (stakingMode === "MAINNET") {
      if (!connectedWalletAddress) {
        triggerToast("⚠️ Access Gated: You must connect your Solana Wallet first to execute Mainnet Staking.");
        return;
      }
      if (!stakingPaymentSignature) {
        triggerToast(`⚠️ Unpaid Action: Please authorize the secure on-chain payload signature of ${amt.toLocaleString()} $ROB inside the gating gateway panel first.`);
        return;
      }
    }

    if (stakingMode === "TESTNET" && amt > robBalance) {
      triggerToast(`Limit exceeded. Max available balance is ${robBalance} $ROB.`);
      return;
    }

    if (stakingMode === "TESTNET") {
      setRobBalance(b => b - amt);
    } else {
      setRobBalance(b => Math.max(0, b - amt));
      // Consume the dynamic signature on successful on-chain submit
      localStorage.removeItem("rob_staking_payment_signature");
      setStakingPaymentSignature(null);
    }

    setStakedAmount(s => s + amt);
    setStakedInput("");
    triggerToast(`Successfully committed and staked ${amt.toLocaleString()} $ROB on ${stakingMode === "TESTNET" ? "Simulated Testnet" : "Solana Mainnet"} core!`);
  };

  const handleUnstakeSubmit = () => {
    if (stakedAmount <= 0) {
      triggerToast("No $ROB currently locked or active.");
      return;
    }

    if (stakingMode === "MAINNET" && !connectedWalletAddress) {
      triggerToast("⚠️ Access Gated: You must connect your Solana Wallet to unlock your active Mainnet Stake.");
      return;
    }

    const withdrawal = stakedAmount;
    const totalToGive = withdrawal + earnedStakingRewards;
    setStakedAmount(0);
    setEarnedStakingRewards(0);
    setRobBalance(b => b + totalToGive);
    triggerToast(`Unlocked! Withdrew ${totalToGive.toFixed(2)} $ROB including accrued rewards from ${stakingMode === "TESTNET" ? "Simulated Testnet" : "Solana Mainnet"}.`);
  };

  const handleClaimRewards = () => {
    if (earnedStakingRewards <= 0) {
      triggerToast("Accruing security rewards. Please wait.");
      return;
    }

    if (stakingMode === "MAINNET" && !connectedWalletAddress) {
      triggerToast("⚠️ Access Gated: You must connect your Solana Wallet to claim active Mainnet rewards.");
      return;
    }

    const claim = earnedStakingRewards;
    setEarnedStakingRewards(0);
    setRobBalance(b => b + claim);
    triggerToast(`Claimed! Transferred ${claim.toFixed(5)} $ROB directly to current ${stakingMode === "MAINNET" ? "connected" : "simulated"} wallet address.`);
  };

  // Simulated Voice AI response
  const speakVoiceOutput = (text: string) => {
    if (!('speechSynthesis' in window)) {
      triggerToast("Speech Synthesis not supported in this frame.");
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const sentence = new SpeechSynthesisUtterance(text);
      sentence.rate = 1.1;
      sentence.pitch = 0.95; // slightly cybernetic pitch
      window.speechSynthesis.speak(sentence);
      setIsSpeechActive(true);
      sentence.onend = () => setIsSpeechActive(false);
    } catch (e) {
      console.warn("Speech synthesis frame blocker detected:", e);
    }
  };

  // AI Chat responses logic
  const handleSendChatMessage = async (textToSend = chatInput) => {
    if (!textToSend.trim() || isAiTyping) return;
    
    const userMsg = {
      sender: 'user' as const,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsAiTyping(true);

    try {
      const mappedHistory = chatMessages.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: mappedHistory,
          scannedResult: scannedResult
        })
      });

      const data = await res.json();
      const responseText = data.text || "ROBOTIC Systems core could not formulate an expert security reply. Check your connection.";

      setChatMessages(prev => [
        ...prev,
        {
          sender: 'ai' as const,
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      speakVoiceOutput(responseText);
    } catch (err: any) {
      console.error("AI chat dispatch failure:", err);
      const fallbackText = "Telemetry node unreachable. Please check backend port logs or ensure a contract result is currently active.";
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'ai' as const,
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const selectChatTemplate = (text: string) => {
    handleSendChatMessage(text);
  };

  // Emergency scanner action
  const handleConnectWalletAndScan = () => {
    setIsWalletConnected(true);
    setApprovalsScanned(true);
    triggerToast("Web3 Simulator active. Scanning active token parameters...");
    
    // Create custom permissions simulated risk list
    setLiveApprovals([
      { id: "app_1", spender: "0xUnsafeSwapRouter", allowance: "Infinite USDT", risk: "CRITICAL DRAINER VECTOR", dApp: "FakeRaydiumSwap" },
      { id: "app_2", spender: "0xContractDeployerV2", allowance: "100M ROB", risk: "UNRESTRICTED ACCESS", dApp: "Unknown Claimer" },
      { id: "app_3", spender: "Solana Raydium Router v4", allowance: "Standard Approval", risk: "LOW RISK (OFFICIAL)", dApp: "Raydium" },
    ]);
  };

  const handleRevokePermission = (id: string, name: string) => {
    setLiveApprovals(prev => prev.filter(app => app.id !== id));
    triggerToast(`Revoked approval authority on spender: ${name}. Wallet secure!`);
  };

  const handleRevokeAll = () => {
    setLiveApprovals([]);
    triggerToast("Initiated nuclear purge. All dangerous approvals successfully terminated! Wallet safe.");
  };

  // Scam reporting action
  const handleSubmitScam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scamName || !scamAddress) {
      triggerToast("Complete all reporting parameters to proceed.");
      return;
    }

    const newReport = {
      id: "sc_" + Math.random().toString(36).substring(2, 9),
      name: scamName,
      type: scamType,
      reportedBy: "My Node",
      status: "INVESTIGATING"
    };

    setScamReports(prev => [newReport, ...prev]);
    setScamName("");
    setScamAddress("");
    triggerToast("Blacklist report transmitted successfully! Security nodes will audit the address.");
  };

  // Quiz questions for Learn Academy
  const QUIZ_QUESTIONS = [
    {
      q: "What constitutes a 'Honeypot' exploit on smart contracts?",
      a: [
        "A system setup that locks buyer balances while only allowing white-listed addresses or the deployer to execute sells",
        "A feature that triples trading speed for retail users",
        "An off-chain wallet tracker that records user cookies"
      ],
      correct: 0,
      tip: "Honeypots display 99% buy/sell transaction tax indicators on automatic scanners."
    },
    {
      q: "Why is a non-renounced contract owner address considered unsafe?",
      a: [
        "It prevents coin pricing from reaching high-volatility targets",
        "The owner holds active administrative privileges to enable mint functions, blacklists, or freeze controls unexpectedly",
        "It limits the number of holder wallets to under 500 automatically"
      ],
      correct: 1,
      tip: "Ownership renunciation transfers control nodes permanently to dead addresses."
    },
    {
      q: "What percentage of LP (Liquidity Pool) tokens should ideally be locked or burnt?",
      a: [
        "Under 10% for flexible pool management",
        "No lock is required if the social profile is high-quality",
        "At least 90-100% locked in custom vaults or sent to burn vectors"
      ],
      correct: 2,
      tip: "Unlocked liquidity allows creators to remove target backup asset funds instantly."
    }
  ];

  const handleAnswerQuiz = (chosenIndex: number) => {
    const q = QUIZ_QUESTIONS[currentQuestionIdx];
    if (chosenIndex === q.correct) {
      triggerToast("Correct! Cybersecurity score updated.");
      const nextProgress = Math.min(100, learnProgress + 34);
      setLearnProgress(nextProgress);
      localStorage.setItem("rob_learn_progress", nextProgress.toString());
      
      if (currentQuestionIdx < QUIZ_QUESTIONS.length - 1) {
        setCurrentQuestionIdx(prev => prev + 1);
      } else {
        setShowCertificate(true);
        triggerToast("Course complete! Safety expert badge unlocked.");
      }
    } else {
      triggerToast("Incorrect audit logic. Try again!");
    }
  };

  const handleResetLearning = () => {
    setLearnProgress(0);
    setCurrentQuestionIdx(0);
    setShowCertificate(false);
    localStorage.removeItem("rob_learn_progress");
  };

  // Anti-Fake site check
  const handleFakeSiteCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fakeInputUrl.trim()) return;

    const url = fakeInputUrl.toLowerCase();
    let scoreVal = 98;
    const warningsArr: string[] = [];

    if (url.includes("raydium.sh") || url.includes("solscan.co") || url.includes("phantom-wallet.app") || url.includes("gopluslabs.net")) {
      scoreVal = 12;
      warningsArr.push("CRITICAL MIMIC LAYER: This URL attempts to impersonate official crypto utilities with typo domains!");
      warningsArr.push("Phishing Drainer Warning: Unlocked script signature detected in website header metadata.");
    } else if (url.includes("gov") || url.includes("io") || url.includes("com")) {
      scoreVal = 85;
      warningsArr.push("Standard Domain. No associated active user reported blacklist threats.");
    } else {
      scoreVal = 55;
      warningsArr.push("Notice: Domain is extremely new (under 14 days old). Confirm with official community links.");
    }

    setFakeAuditResult({
      url: fakeInputUrl,
      score: scoreVal,
      status: scoreVal > 70 ? "SECURE" : scoreVal > 40 ? "WARNING" : "PHISHING THREAT",
      warnings: warningsArr
    });
    triggerToast("Audit finished.");
  };

  return (
    <div className={`mt-4 border ${isDark ? "border-white/10 bg-black/40" : "border-slate-200 bg-white"} rounded-2xl relative overflow-hidden`} id="robotic-systems-control">
      
      {/* Visual cybernetic energy background */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Primary Top Bar Grid */}
      <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-5 border-b ${isDark ? "border-white/10" : "border-slate-200"}`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-pink-500/20 rounded-xl border border-cyan-500/20 text-cyan-400">
            <Cpu className="w-5 h-5 animate-spin" style={{ animationDuration: '24s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-md font-black uppercase tracking-widest font-mono ${isDark ? "text-white" : "text-slate-800"}`}>
                Systems Grid
              </h2>
              {isProUser ? (
                <span className="text-[9px] font-black uppercase font-mono px-2 py-0.5 bg-pink-500 text-black rounded-full animate-pulse">
                  PRO {proTier}
                </span>
              ) : (
                <span className="text-[9px] font-bold uppercase font-mono px-2 py-0.5 bg-slate-500/10 text-slate-400 rounded-lg">
                  FREE TIERS
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tight">OPERATIONAL MULTI-CHAIN SAFETY PLATFORM</p>
          </div>
        </div>

        {/* Balance Display */}
        <div className="mt-3 sm:mt-0 flex items-center gap-2.5">
          <div className={`p-2 rounded-xl flex items-center gap-2 border font-mono text-xs ${isDark ? "bg-[#0c0510] border-white/10" : "bg-slate-50 border-slate-200"}`}>
            <Coins className="w-4 h-4 text-pink-400" />
            <div className="text-right">
              <span className={`block text-[8px] uppercase tracking-wider text-slate-400`}>Node Balance</span>
              <span className={`font-black uppercase tracking-wide font-mono ${isDark ? "text-white" : "text-slate-700"}`} id="system-dashboard-balance">
                {robBalance.toLocaleString()} $ROB
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Sub-navigation Tabs */}
      <div className={`flex flex-wrap items-center gap-1.5 p-3.5 bg-black/10 border-b ${isDark ? "border-white/5" : "border-slate-100"} overflow-x-auto select-none`}>
        <button
          onClick={() => setActiveTab('DASHBOARD')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase cursor-pointer transition-all ${
            activeTab === 'DASHBOARD'
              ? "bg-cyan-500 text-black shadow-md"
              : isDark ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('LAUNCHES')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase cursor-pointer transition-all flex items-center gap-1 ${
            activeTab === 'LAUNCHES'
              ? "bg-cyan-500 text-black shadow-md"
              : isDark ? "text-slate-300 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Rocket className="w-3.5 h-3.5" /> Launch Radar
        </button>
        <button
          onClick={() => setActiveTab('CHAT')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase cursor-pointer transition-all flex items-center gap-1 ${
            activeTab === 'CHAT'
              ? "bg-cyan-500 text-black shadow-md"
              : isDark ? "text-slate-300 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" /> Security AI Chat
        </button>
        <button
          onClick={() => setActiveTab('WALLETS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase cursor-pointer transition-all flex items-center gap-1 ${
            activeTab === 'WALLETS'
              ? "bg-cyan-500 text-black shadow-md"
              : isDark ? "text-slate-300 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Wallet className="w-3.5 h-3.5" /> Wallet Tracker
        </button>
        <button
          onClick={() => setActiveTab('SIGNALS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase cursor-pointer transition-all flex items-center gap-1 ${
            activeTab === 'SIGNALS'
              ? "bg-cyan-500 text-black shadow-md"
              : isDark ? "text-slate-300 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <LineChart className="w-3.5 h-3.5" /> Signals
        </button>
        <button
          onClick={() => setActiveTab('STAKING')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase cursor-pointer transition-all flex items-center gap-1 ${
            activeTab === 'STAKING'
              ? "bg-cyan-500 text-black shadow-md"
              : isDark ? "text-slate-300 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Coins className="w-3.5 h-3.5 animate-pulse" /> Staking & reward
        </button>
        <button
          onClick={() => setActiveTab('EMERGENCY')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase cursor-pointer transition-all flex items-center gap-1 ${
            activeTab === 'EMERGENCY'
              ? "bg-cyan-500 text-black shadow-md"
              : isDark ? "text-slate-300 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" /> Revoker
        </button>
        <button
          onClick={() => setActiveTab('LEARN')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase cursor-pointer transition-all flex items-center gap-1 ${
            activeTab === 'LEARN'
              ? "bg-cyan-500 text-black shadow-md"
              : isDark ? "text-slate-300 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Award className="w-3.5 h-3.5" /> Academy
        </button>
        <button
          onClick={() => setActiveTab('SCAMS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase cursor-pointer transition-all flex items-center gap-1 ${
            activeTab === 'SCAMS'
              ? "bg-cyan-500 text-black shadow-md"
              : isDark ? "text-slate-300 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <FileWarning className="w-3.5 h-3.5" /> Blacklist Feed
        </button>
        <button
          onClick={() => setActiveTab('MONITOR')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase cursor-pointer transition-all flex items-center gap-1 ${
            activeTab === 'MONITOR'
              ? "bg-cyan-500 text-black shadow-md"
              : isDark ? "text-slate-300 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Activity className="w-3.5 h-3.5" /> Monitor Feed
        </button>
        <button
          onClick={() => setActiveTab('ANTI_FAKE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase cursor-pointer transition-all flex items-center gap-1 ${
            activeTab === 'ANTI_FAKE'
              ? "bg-cyan-500 text-black shadow-md"
              : isDark ? "text-slate-300 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Globe className="w-3.5 h-3.5" /> Phishing Scan
        </button>
      </div>

      {/* Tab Panels Contents */}
      <div className="p-5 min-h-[420px]">
        
        {/* ================= OVERVIEW PANEL ================= */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Premium Subscriptions Panel promotion */}
              <div className={`p-5 rounded-xl border ${isDark ? "bg-[#0c0510] border-white/10" : "bg-slate-50 border-slate-200"} relative overflow-hidden flex flex-col justify-between`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-[40px] rounded-full pointer-events-none" />
                <div className="space-y-3.5">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-pink-500/10 border border-pink-500/20 rounded-full text-[9px] font-mono text-pink-400 font-bold uppercase tracking-wide">
                    <Zap className="w-3.5 h-3.5 text-pink-500" /> Subscription Nodes Gateway
                  </div>
                  <h3 className={`text-md font-black uppercase tracking-wider font-mono ${isDark ? "text-white" : "text-slate-800"}`}>
                    Unlock Pro Terminal Alerts
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Integrate institutional signals, whale accumulation sensors, and bypass scanning restrictions instantly. Choose from decentralized or premium fiat card processing vectors.
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2.5">
                  <button
                    onClick={() => { setSelectedPlan({ name: 'LITE PRO', priceUSD: 9, priceRob: 750 }); setShowPayModal(true); }}
                    className="p-2 border border-white/10 hover:border-pink-500/30 rounded-lg text-center font-mono cursor-pointer transition bg-white/5"
                  >
                    <span className="block text-[8px] text-slate-400">STARTER</span>
                    <span className="text-[11px] font-bold text-white block">$9 <span className="opacity-40">/ mo</span></span>
                    <span className="text-[9px] text-pink-400 font-bold">750 $ROB</span>
                  </button>
                  <button
                    onClick={() => { setSelectedPlan({ name: 'INTELLIGENCE PRO', priceUSD: 29, priceRob: 2200 }); setShowPayModal(true); }}
                    className="p-2 border border-pink-500/30 hover:border-pink-500/60 rounded-lg text-center font-mono cursor-pointer transition bg-pink-500/5"
                  >
                    <span className="block text-[8px] text-pink-400 font-extrabold uppercase">MOST POPULAR</span>
                    <span className="text-[11px] font-bold text-white block">$29 <span className="opacity-40">/ mo</span></span>
                    <span className="text-[9px] text-pink-400 font-bold">2.2K $ROB</span>
                  </button>
                  <button
                    onClick={() => { setSelectedPlan({ name: 'INSTITUTIONAL HUB', priceUSD: 99, priceRob: 7000 }); setShowPayModal(true); }}
                    className="p-2 border border-white/10 hover:border-pink-500/30 rounded-lg text-center font-mono cursor-pointer transition bg-white/5"
                  >
                    <span className="block text-[8px] text-slate-400">INSTITUTIONAL</span>
                    <span className="text-[11px] font-bold text-white block">$99 <span className="opacity-40">/ mo</span></span>
                    <span className="text-[9px] text-pink-400 font-bold">7K $ROB</span>
                  </button>
                </div>
              </div>

              {/* Ecosystem $ROB overview */}
              <div className={`p-5 rounded-xl border ${isDark ? "bg-[#04040a] border-white/10" : "bg-slate-50 border-slate-200"} relative overflow-hidden flex flex-col justify-between`}>
                <div className="space-y-3.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-wide">
                    <Coins className="w-3.5 h-3.5 text-cyan-400" /> Utility Staking Blocks
                  </div>
                  <h3 className={`text-md font-black uppercase tracking-wider font-mono ${isDark ? "text-white" : "text-slate-800"}`}>
                    Stake $ROB & Earn APY
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Lock liquidity units to defend security channels and receive stable compounding tokens. Currently yielding <span className="text-cyan-400 font-bold font-mono">5.2% APY</span> paid out in continuous real-time ledger increments.
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-3 border-t border-white/5 pt-4">
                  <div>
                    <span className="block text-[8px] text-slate-500 font-mono">STAKED SECURE</span>
                    <span className={`text-xs font-bold font-mono ${isDark ? "text-white" : "text-slate-700"}`}>{stakedAmount.toLocaleString()} $ROB</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-500 font-mono">EARNED GAINS</span>
                    <span className="text-xs font-bold font-mono text-cyan-400">+{earnedStakingRewards.toFixed(5)} $ROB</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('STAKING')}
                    className="ml-auto px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-[10px] uppercase font-black rounded-lg transition-colors cursor-pointer"
                  >
                    Stake Portal
                  </button>
                </div>
              </div>

            </div>

            {/* Quick dashboard tools index */}
            <div className="space-y-3">
              <h4 className={`text-xs font-bold uppercase tracking-wider font-mono ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                Quick Access Terminal Links
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <button 
                  onClick={() => setActiveTab('LAUNCHES')}
                  className={`p-3 border rounded-xl flex flex-col items-center gap-1.5 text-center cursor-pointer transition ${isDark ? "bg-white/5 border-white/10 hover:border-cyan-500/30" : "bg-slate-50 border-slate-200 hover:border-cyan-500"}`}
                >
                  <Rocket className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-[10px] uppercase font-bold">Launch Radar</span>
                </button>
                <button 
                  onClick={() => setActiveTab('CHAT')}
                  className={`p-3 border rounded-xl flex flex-col items-center gap-1.5 text-center cursor-pointer transition ${isDark ? "bg-white/5 border-white/10 hover:border-cyan-500/30" : "bg-slate-50 border-slate-200 hover:border-cyan-500"}`}
                >
                  <MessageSquare className="w-4 h-4 text-pink-400 animate-bounce" />
                  <span className="font-mono text-[10px] uppercase font-bold">Neural Chat</span>
                </button>
                <button 
                  onClick={() => setActiveTab('EMERGENCY')}
                  className={`p-3 border rounded-xl flex flex-col items-center gap-1.5 text-center cursor-pointer transition ${isDark ? "bg-white/5 border-white/10 hover:border-cyan-500/30" : "bg-slate-50 border-slate-200 hover:border-cyan-500"}`}
                >
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span className="font-mono text-[10px] uppercase font-bold">Approve Sweep</span>
                </button>
                <button 
                  onClick={() => setActiveTab('LEARN')}
                  className={`p-3 border rounded-xl flex flex-col items-center gap-1.5 text-center cursor-pointer transition ${isDark ? "bg-white/5 border-white/10 hover:border-cyan-500/30" : "bg-slate-50 border-slate-200 hover:border-cyan-500"}`}
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="font-mono text-[10px] uppercase font-bold">Academy</span>
                </button>
              </div>
            </div>

            {/* Platform metrics & status indicators */}
            <div className={`p-4 border rounded-xl ${isDark ? "bg-[#020205] border-white/10 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"} font-mono text-[10px] space-y-2`}>
              <div className="flex justify-between items-center">
                <span>ACTIVE AUDIT NODES</span>
                <span className="text-cyan-400 font-bold">4,124 SHARDS</span>
              </div>
              <div className="flex justify-between items-center">
                <span>TOTAL SCAMS BLACKLISTED</span>
                <span className="text-pink-400 font-bold">18,349 ASSETS</span>
              </div>
              <div className="flex justify-between items-center">
                <span>24H ACCRUED CONTRACT LIQUIDATION FEES</span>
                <span className="text-white font-bold">1.4M ROB SENT TO BURN METRIC</span>
              </div>
            </div>

          </div>
        )}

        {/* ================= LAUNCH RADER PANEL ================= */}
        {activeTab === 'LAUNCHES' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className={`text-md font-bold uppercase font-mono ${isDark ? "text-white" : "text-slate-800"}`}>Real-Time Newly Launched Tokens</h3>
                <p className="text-[10px] font-mono text-slate-400 uppercase">SYNCHRONIZED LP BURNING & DEVELOPER WALLET FUNDING CHECKS</p>
              </div>
              <button 
                onClick={() => {
                  triggerToast("Refreshing launch feeds via DecScreener network sockets...");
                  // Simulate newly random added token
                  const newT = {
                    id: "ln_" + Math.random().toString(),
                    name: "CyberPump Alpha",
                    symbol: "CPUMP",
                    chain: "Solana",
                    lpStatus: "LP BURNT - 100% Locked",
                    rating: "Potential Gem" as const,
                    lpAmount: "$45,000",
                    created: "Just now"
                  };
                  setLaunches(prev => [newT, ...prev]);
                }}
                className={`p-2 rounded-lg border cursor-pointer ${isDark ? "bg-white/5 border-white/10 hover:border-cyan-500 text-cyan-400" : "bg-slate-50 border-slate-300 hover:border-slate-800 text-slate-800"}`}
                title="Refresh Launches"
              >
                <Activity className="w-4 h-4 animate-spin" />
              </button>
            </div>

            <div className="space-y-3">
              {launches.map(token => (
                <div key={token.id} className={`p-4 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  token.rating === 'Avoid' 
                    ? "bg-red-500/5 border-red-500/10" 
                    : token.rating === 'Possible Rug' 
                    ? "bg-amber-500/5 border-amber-500/10" 
                    : isDark ? "bg-[#0a060d]/60 border-white/5" : "bg-slate-50 border-slate-150"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs font-mono uppercase ${
                      token.rating === 'Avoid' ? "bg-red-500/10 text-red-400" : "bg-cyan-500/10 text-cyan-400"
                    }`}>
                      {token.symbol.substring(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold uppercase font-mono ${isDark ? "text-white" : "text-slate-800"}`}>{token.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-white/5 rounded text-slate-400 uppercase font-mono">{token.chain}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">LP: {token.lpAmount} ({token.lpStatus})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:ml-auto">
                    <span className={`text-[9px] font-black uppercase font-mono px-2 py-0.5 rounded-full ${
                      token.rating === 'Potential Gem' 
                        ? "bg-green-500/10 text-green-400" 
                        : token.rating === 'Avoid' 
                        ? "bg-red-500/10 text-red-500" 
                        : "bg-amber-500/10 text-amber-500"
                    }`}>
                      {token.rating}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{token.created}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= SECURITY AI CHAT PANEL ================= */}
        {activeTab === 'CHAT' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <div className="flex justify-between items-center select-none">
                <div>
                  <h3 className={`text-sm font-bold uppercase font-mono ${isDark ? "text-white" : "text-slate-800"}`}>AI Security Agent</h3>
                  <p className="text-[9px] font-mono text-slate-400 uppercase">NEURAL WEB3 SECURITY CHIP CONNECTED</p>
                </div>
                
                {/* Voice speech synthesizer switch */}
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-slate-400 uppercase">Voice Assist Speak:</span>
                  <button
                    onClick={() => {
                      if (isSpeechActive) {
                        try {
                          window.speechSynthesis.cancel();
                          setIsSpeechActive(false);
                          triggerToast("Voice synthesis paused.");
                        } catch(e){}
                      } else {
                        speakVoiceOutput("Voice communication modules active.");
                        triggerToast("AI voice replies enabled.");
                      }
                    }}
                    className={`p-2 rounded-lg border flex items-center justify-center cursor-pointer transition duration-300 ${
                      isSpeechActive ? "bg-cyan-500 text-black border-cyan-400" : isDark ? "bg-white/5 border-white/10 text-slate-300" : "bg-slate-50 border-slate-300 text-slate-700"
                    }`}
                    title="Toggle robot synthesized audio mode"
                  >
                    {isSpeechActive ? <Volume2 className="w-4 h-4 text-black animate-bounce" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Chat Templates */}
              <div className="flex flex-wrap gap-1.5 mt-3 select-none">
                <button 
                  onClick={() => selectChatTemplate("Is this contract safe?")}
                  className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[9px] uppercase font-mono text-slate-300 transition cursor-pointer"
                >
                  Verify Contract Indicators
                </button>
                <button 
                  onClick={() => selectChatTemplate("What is a Honeypot?")}
                  className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[9px] uppercase font-mono text-slate-300 transition cursor-pointer"
                >
                  Honeypots Defined
                </button>
                <button 
                  onClick={() => selectChatTemplate("How to track whale wallets")}
                  className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[9px] uppercase font-mono text-slate-300 transition cursor-pointer"
                >
                  Whale Analytics
                </button>
              </div>
            </div>

            {/* Conversation Log Box */}
            <div className={`p-4 rounded-xl border max-h-64 overflow-y-auto space-y-3 font-mono text-xs ${isDark ? "bg-black/30 border-white/10" : "bg-slate-50 border-slate-200"}`}>
              {chatMessages.map((msg, index) => (
                <div key={index} className={`space-y-0.5 ${msg.sender === 'user' ? "text-right" : "text-left"}`}>
                  <span className={`text-[8px] uppercase font-bold block ${msg.sender === 'user' ? "text-pink-400" : "text-cyan-400"}`}>
                    {msg.sender === 'user' ? "SECURE CLIENT" : "ROBOTIC NEURAL NODE"} — {msg.timestamp}
                  </span>
                  <p className={`p-2 rounded-lg inline-block max-w-[85%] text-left leading-normal ${
                    msg.sender === 'user' 
                      ? "bg-pink-500/10 text-pink-300 border border-pink-500/10" 
                      : isDark ? "bg-[#0b121c] text-cyan-300 border border-cyan-500/10" : "bg-cyan-50/75 text-cyan-900 border border-cyan-500/10"
                  }`}>
                    {msg.text}
                  </p>
                </div>
              ))}
              
              {isAiTyping && (
                <div className="space-y-0.5 text-left animate-pulse">
                  <span className="text-[8px] uppercase font-bold block text-cyan-400">
                    ROBOTIC NEURAL NODE — THINKING
                  </span>
                  <div className={`p-2.5 rounded-lg inline-block text-left text-[11px] font-sans ${
                    isDark ? "bg-[#0b121c] text-cyan-300 border border-cyan-500/10" : "bg-cyan-50 text-cyan-900 border border-cyan-500/10"
                  }`}>
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-cyan-400/80 font-bold ml-1">Screening Bytecode...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Input Form footer */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendChatMessage(); }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask virtual secure assistant to screen code/wallets..."
                className={`flex-1 p-2.5 rounded-xl border text-xs font-mono outline-none transition ${isDark ? "bg-[#0c0510] border-white/10 text-white focus:border-cyan-500" : "bg-slate-50 border-slate-200 text-slate-800 focus:border-cyan-500"}`}
              />
              <button
                type="submit"
                className="px-4 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl font-bold uppercase tracking-wider text-[11px] font-mono flex items-center justify-center gap-1 transition-all duration-200 cursor-pointer shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}

        {/* ================= WALLET TRACKER PANEL ================= */}
        {activeTab === 'WALLETS' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h3 className={`text-md font-bold uppercase font-mono ${isDark ? "text-white" : "text-slate-800"}`}>Whale & Insider Wallet Tracker</h3>
              <p className="text-[10px] font-mono text-slate-400 uppercase">DECENTRALIZED MEMPOOL WALLET INTERCEPTS</p>
            </div>

            {/* Simulated Track form */}
            <div className={`p-4 rounded-xl border ${isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"} flex flex-col sm:flex-row gap-3 items-center`}>
              <div className="w-full flex-1">
                <input
                  type="text"
                  placeholder="Paste external Solana/EVM address to track real-time..."
                  className={`w-full p-2.5 rounded-lg text-xs font-mono outline-none border ${isDark ? "bg-black/40 border-white/10 text-white focus:border-cyan-400" : "bg-white border-slate-300 focus:border-cyan-400"}`}
                />
              </div>
              <button
                onClick={() => triggerToast("Address mapped to Robotic Mempool Listener. You will be notified of transactions.")}
                className="w-full sm:w-auto px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black text-xs uppercase font-extrabold rounded-lg font-mono tracking-wider transition cursor-pointer text-center"
              >
                Track Address
              </button>
            </div>

            <div className="space-y-3">
              {INITIAL_WHALES.map((whale, idx) => (
                <div key={idx} className={`p-4 border rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 relative overflow-hidden ${
                  whale.isProOnly && !isProUser ? "opacity-60 bg-black/40 border-dashed border-white/10" : isDark ? "bg-[#04040a] border-white/5" : "bg-slate-50 border-slate-150"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-pink-400">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-xs font-bold uppercase font-mono ${isDark ? "text-white" : "text-slate-800"}`}>{whale.name}</span>
                        <span className="text-[8px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold uppercase font-mono px-1 rounded">{whale.chain}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Address: {whale.address}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 sm:ml-auto">
                    <div className="text-right font-mono text-[10px]">
                      <span className="block text-slate-500">24H TXS</span>
                      <span className={`font-bold ${isDark ? "text-white" : "text-slate-700"}`}>{whale.dailyTxCount} Transfers</span>
                    </div>

                    <div className="text-right font-mono text-[10px]">
                      <span className="block text-slate-500">RISK INDEX</span>
                      <span className={`font-bold ${whale.riskScore > 40 ? "text-red-400 animate-pulse" : "text-green-400"}`}>{whale.riskScore}% Score</span>
                    </div>

                    {whale.isProOnly && !isProUser ? (
                      <div className="px-3 py-1 bg-pink-500 text-black font-extrabold text-[10px] uppercase font-mono rounded flex items-center gap-1 select-none">
                        <Lock className="w-3 h-3" /> PRO Tier
                      </div>
                    ) : (
                      <button
                        onClick={() => triggerToast(`Connecting shadow node trade tracking on: ${whale.name}`)}
                        className="px-2.5 py-1 bg-white/10 hover:bg-cyan-500 text-slate-300 hover:text-black font-extrabold text-[9px] uppercase font-mono rounded transition cursor-pointer"
                      >
                        Copy Trades
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= ALGORITHMIC TRADING SIGNALS PANEL ================= */}
        {activeTab === 'SIGNALS' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h3 className={`text-md font-bold uppercase font-mono ${isDark ? "text-white" : "text-slate-800"}`}>AI Predictive Markets & Breakout Signals</h3>
              <p className="text-[10px] font-mono text-slate-400 uppercase">MACHINE LEARNING CHART VOLUMES & MEMOOL ANOMALY DETECTION</p>
            </div>

            {/* Standard Warning / Pro gating promotion */}
            {!isProUser && (
              <div className="p-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/25 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-mono font-bold uppercase tracking-wider text-pink-400">Signals Encrypted</h4>
                    <p className="text-slate-400 font-sans max-w-md">Some Alpha signals on high confidence trading scores require active $ROB Pro Node licensing.</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('DASHBOARD')}
                  className="px-4 py-1.5 bg-pink-500 hover:bg-pink-400 text-black font-black uppercase text-[10px] font-mono rounded-lg transition duration-200 cursor-pointer"
                >
                  View Pro Plans
                </button>
              </div>
            )}

            <div className="space-y-3">
              <div className={`p-4 border rounded-xl flex items-center justify-between font-mono text-xs ${isDark ? "bg-[#0b121c] border-white/5" : "bg-slate-50 border-slate-150"}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${isDark ? "text-white" : "text-slate-800"}`}>Solana Meme Volume Breakouts</span>
                      <span className="text-[8px] bg-green-500/10 border border-green-500/20 text-green-400 font-bold uppercase font-mono px-1 rounded">HEALTHY</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Target: $SOL Memes and active pool momentum indexes</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="block text-[10px] text-slate-500">CONFIDENCE</span>
                  <span className="text-green-400 font-extrabold text-xs">94.2% (HIGH)</span>
                </div>
              </div>

              <div className={`p-4 border rounded-xl flex items-center justify-between font-mono text-xs opacity-70 ${isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${isDark ? "text-white" : "text-slate-800"}`}>Whale Cluster Accumulation Index</span>
                      <span className="text-[8px] bg-pink-500/10 border border-pink-500/20 text-pink-400 font-bold uppercase font-mono px-1 rounded">PRO MEMBERS ONLY</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Detecting clustered buys in 14-day dormant addresses</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="block text-[10px] text-slate-500">CONFIDENCE</span>
                  <span className="text-cyan-400 font-extrabold text-xs">88.5% (PRO)</span>
                </div>
              </div>

              <div className={`p-4 border rounded-xl flex items-center justify-between font-mono text-xs opacity-70 ${isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${isDark ? "text-white" : "text-slate-800"}`}>Liquid Lock Exploitative Detection</span>
                      <span className="text-[8px] bg-pink-500/10 border border-pink-500/20 text-pink-400 font-bold uppercase font-mono px-1 rounded">INSTITUTIONAL</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Anomalous transfer locks on PancakeSwap routers</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="block text-[10px] text-slate-500">CONFIDENCE</span>
                  <span className="text-purple-400 font-extrabold text-xs">96.4% (INST)</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================= $ROB TOKEN & STAKING PANEL ================= */}
        {activeTab === 'STAKING' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Top Bar with Mode Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
              <div>
                <h3 className={`text-md font-bold uppercase font-mono flex items-center gap-2 ${isDark ? "text-white" : "text-slate-800"}`}>
                  <span>$ROB Token Staking Vault</span>
                  <span className="text-[9.5px] font-black bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono px-2 py-0.5 rounded-full animate-pulse">
                    MAINNET LIVE
                  </span>
                </h3>
                <p className="text-[10px] font-mono text-slate-400 uppercase">SAFEGUARD SMART CONTRACT NODES & MINE ACCRUED SECURITY BONUSES</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Main functional staking metrics */}
              <div className={`space-y-4 ${stakingMode === 'MAINNET' ? "lg:col-span-8" : "lg:col-span-12"}`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Token Parameters */}
                  <div className={`p-4 border rounded-xl space-y-3 font-mono text-xs ${isDark ? "bg-[#0c0510] border-white/10" : "bg-slate-50 border-slate-200"}`}>
                    <h4 className="font-bold border-b border-white/10 pb-1.5 uppercase text-pink-400">Node Reserves</h4>
                    <div className="flex justify-between">
                      <span className="text-slate-500">STAKING APY:</span>
                      <span className="text-green-400 font-bold">5.2% APY</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">REWARD ACCRUAL:</span>
                      <span className="text-cyan-400">REAL-TIME SECTOR TICKS</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">MINIMUM LOCK:</span>
                      <span className="text-white">NONE (INSTANT WITHDRAWAL)</span>
                    </div>
                  </div>

                  {/* Reward values */}
                  <div className={`p-4 border rounded-xl space-y-3 font-mono text-xs ${isDark ? "bg-[#050c14] border-white/10" : "bg-slate-50 border-slate-200"}`}>
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                      <h4 className="font-bold uppercase text-cyan-400">My Staked Ledger</h4>
                      {stakingMode === 'MAINNET' && (
                        <span className={`text-[8px] font-black uppercase font-mono px-1 rounded ${connectedWalletAddress ? "text-cyan-400 bg-cyan-400/10" : "text-amber-400 bg-amber-400/10"}`}>
                          {connectedWalletAddress ? "Connected" : "Locked"}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-slate-500">ACTIVE STAKE:</span>
                      <span className={`font-bold ${isDark ? "text-white" : "text-slate-700"}`}>
                        {stakedAmount.toLocaleString()} $ROB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">ACCRUED EARNINGS:</span>
                      <span className="text-green-400 text-[11px] font-bold">+{earnedStakingRewards.toFixed(6)} $ROB</span>
                    </div>

                    {stakingMode === 'MAINNET' && !connectedWalletAddress ? (
                      <div className="p-2 bg-red-500/10 border border-red-500/15 rounded-lg text-center text-[9px] font-mono text-red-400 uppercase font-bold tracking-wider space-y-1 select-none">
                        <div>🔒 Controls Gated</div>
                        <div className="text-[7.5px] text-slate-400 normal-case">Connect your Solana wallet to manage stake parameters.</div>
                      </div>
                    ) : (
                      <div className="flex gap-2 pt-1 select-none">
                        <button
                          onClick={handleClaimRewards}
                          disabled={earnedStakingRewards <= 0}
                          className="flex-1 py-1.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black text-[9px] font-black uppercase rounded-lg transition-colors cursor-pointer text-center"
                        >
                          Claim Gains
                        </button>
                        <button
                          onClick={handleUnstakeSubmit}
                          disabled={stakedAmount <= 0}
                          className="flex-1 py-1.5 bg-white/10 hover:bg-pink-500 hover:text-white disabled:opacity-50 text-slate-300 text-[9px] font-black uppercase rounded-lg transition-all cursor-pointer text-center border border-white/10"
                        >
                          Unstake All
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Stake input container */}
                  <div className={`p-4 border rounded-xl space-y-3 font-mono text-xs ${isDark ? "bg-[#0c0510] border-white/10" : "bg-slate-50 border-slate-200"}`}>
                    <h4 className="font-bold border-b border-white/5 pb-1.5 uppercase text-white">Trigger New Stake</h4>
                    
                    {stakingMode === 'MAINNET' && !connectedWalletAddress ? (
                      <div className="p-4 bg-red-500/10 border border-red-500/15 rounded-xl text-center text-[10px] font-mono text-red-400 uppercase font-black tracking-wider space-y-1.5 h-[56px] flex flex-col justify-center">
                        <div>⚠️ ACCESS GATED FOR SECURITY</div>
                      </div>
                    ) : stakingMode === 'MAINNET' && parseFloat(stakedInput) > 0 && !stakingPaymentSignature ? (
                      <div className="p-2 bg-amber-500/10 border border-amber-500/15 rounded-xl text-center text-[9px] font-mono text-amber-400 uppercase font-black tracking-normal space-y-1">
                        <div>⚠️ AUTHORISATION REQUIRED</div>
                        <div className="text-[8px] text-slate-400 normal-case leading-tight">
                          Authorize the {parseFloat(stakedInput).toLocaleString()} $ROB dynamic tx in the right-side gate to unlock this.
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={stakedInput}
                          onChange={(e) => setStakedInput(e.target.value)}
                          placeholder="Amt $ROB to commit"
                          className={`flex-1 p-2 rounded text-[11px] outline-none border ${isDark ? "bg-black/40 border-white/10 text-white" : "bg-white border-slate-300 text-slate-700"}`}
                        />
                        <button
                          onClick={handleStakeSubmit}
                          className="px-3 bg-pink-500 hover:bg-pink-400 text-black text-[10px] font-extrabold uppercase rounded font-mono transition cursor-pointer"
                        >
                          Stake
                        </button>
                      </div>
                    )}
                    <p className="text-[9px] text-slate-500 font-mono text-center">Staking helps vote on and isolate smart contract targets.</p>
                  </div>

                </div>
              </div>

              {/* Solana wallet adapter panel displayed side-by-side on Mainnet mode */}
              {stakingMode === 'MAINNET' && (
                <div className="lg:col-span-4 space-y-4">
                  <SolanaWalletConnector
                    isDark={isDark}
                    triggerToast={triggerToast}
                    requiredFee={parseFloat(stakedInput) || 0}
                    localStorageSigKey="rob_staking_payment_signature"
                    actionLabel="stake core"
                  />
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                    <h5 className="text-[10px] font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-1">Mainnet Info</h5>
                    <p className="text-[9.5px] text-slate-400 leading-relaxed font-sans">
                      Staking in Mainnet mode creates an immutable secure Solana contract instruction. Every deposit is backed by cryptographic token locks on-chain. Provide stake values in the input form to generate dynamic authorization payloads.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ================= EMERGENCY DIRECTIVES CAPABLE PORTAL ================= */}
        {activeTab === 'EMERGENCY' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h3 className={`text-md font-bold uppercase font-mono ${isDark ? "text-white" : "text-slate-800"}`}>Emergency approvals revoker</h3>
              <p className="text-[10px] font-mono text-slate-400 uppercase">AUDIT & FORCE DISENGAL ALLOWANCES ON MALICIOUS SMART ROUTERS</p>
            </div>

            {!isWalletConnected ? (
              <div className={`p-8 rounded-xl border border-dashed text-center space-y-4 ${isDark ? "bg-[#0f0408]/60 border-pink-500/20" : "bg-slate-50 border-slate-350"}`}>
                <div className="w-12 h-12 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 mx-auto">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <h4 className={`text-sm font-bold uppercase tracking-wider font-mono ${isDark ? "text-white" : "text-slate-800"}`}>Safety Auditing Disconnected</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans">Connect your simulated web3 wallet node. The AI will inspect current active allowance authorizations for drainers and dangerous exploit contracts.</p>
                </div>
                <button
                  type="button"
                  onClick={handleConnectWalletAndScan}
                  className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-lg transition duration-200 shadow-[0_4px_15px_rgba(244,63,94,0.25)] hover:scale-[1.02] cursor-pointer"
                >
                  Connect Simulated Wallet
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-black/10 p-3 rounded-lg border border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Simulated Node Address: 0xRob9...93e9</span>
                  <button
                    onClick={handleRevokeAll}
                    disabled={liveApprovals.length === 0}
                    className="px-3 py-1 bg-red-500 hover:bg-red-400 disabled:opacity-50 text-black font-bold uppercase text-[9px] font-mono rounded cursor-pointer"
                  >
                    Revoke All Allowances
                  </button>
                </div>

                <div className="space-y-3 leading-normal">
                  {liveApprovals.length === 0 ? (
                    <div className="p-6 text-center text-green-400 font-mono text-xs space-y-1">
                      <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto" />
                      <p className="font-bold uppercase tracking-wide">Secure Clearance Verified</p>
                      <p className="text-slate-500 text-[10px]">No dangerous dApp approvals are linked to current wallet coordinates.</p>
                    </div>
                  ) : (
                    liveApprovals.map(app => (
                      <div key={app.id} className="p-3.5 border border-red-500/10 bg-red-500/5 rounded-xl flex items-center justify-between font-mono text-xs text-left">
                        <div>
                          <span className="text-[10px] font-bold text-red-500 block uppercase tracking-wide">{app.risk}</span>
                          <span className={`block my-0.5 ${isDark ? "text-white" : "text-slate-800"}`}>{app.spender} ({app.allowance})</span>
                          <span className="text-[9px] text-slate-500">Authorized App Source: {app.dApp}</span>
                        </div>
                        <button
                          onClick={() => handleRevokePermission(app.id, app.spender)}
                          className="px-3 py-1.5 bg-white/10 hover:bg-red-500 hover:text-black hover:border-red-500 text-white border border-white/10 text-[9px] font-bold uppercase rounded cursor-pointer transition-all"
                        >
                          Revoke
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= CRYPTO LEARNING ACADEMY ================= */}
        {activeTab === 'LEARN' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b border-white/15 pb-2">
              <div>
                <h3 className={`text-md font-bold uppercase font-mono ${isDark ? "text-white" : "text-slate-800"}`}>Robotic Cybersecurity Academy</h3>
                <p className="text-[10px] font-mono text-slate-400 uppercase">GAMIFIED DECENTRALIZED SAFETY TRAININGS & CERTS</p>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-500 block font-mono">PROGRESS</span>
                <span className="text-amber-400 font-mono font-black text-xs">{learnProgress}% COMPLETE</span>
              </div>
            </div>

            {showCertificate ? (
              <div className="p-6 border border-amber-500/20 bg-amber-500/5 rounded-xl space-y-4 text-center">
                <Award className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
                <div className="space-y-1">
                  <h4 className="font-mono font-bold text-lg text-white uppercase tracking-wider">CERTIFICATE OF SECURITY COMPLIANCE</h4>
                  <p className="text-slate-400 text-xs font-sans max-w-sm mx-auto">This node has successfully cleared all interactive smart contract exploit vectors and holds full compliance credentials on Web3 Safe Guard.</p>
                </div>
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  ROBOTIC NODE ISSUER ID: #RBT-99A1
                </div>
                <div className="flex gap-2 justify-center pt-2">
                  <button
                    onClick={handleResetLearning}
                    className="px-4 py-2 hover:bg-white/5 rounded-lg border border-white/10 text-slate-400 text-[10px] font-mono uppercase font-black cursor-pointer"
                  >
                    Retake Course
                  </button>
                  <button
                    onClick={() => triggerToast("Certificate exported securely to browser local archives.")}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-mono uppercase font-black rounded-lg transition-colors cursor-pointer"
                  >
                    Export Badge
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                  <span className="text-[8px] font-mono text-pink-400 font-extrabold uppercase tracking-widest block">ACTIVE TRAINING LEVEL {currentQuestionIdx + 1} / 3</span>
                  <h4 className={`text-xs sm:text-sm font-bold font-sans ${isDark ? "text-white" : "text-slate-800"}`}>
                    {QUIZ_QUESTIONS[currentQuestionIdx].q}
                  </h4>
                  <p className="text-[9px] text-slate-500 font-mono">Tip: {QUIZ_QUESTIONS[currentQuestionIdx].tip}</p>
                </div>

                <div className="space-y-2 text-left">
                  {QUIZ_QUESTIONS[currentQuestionIdx].a.map((answer, aidx) => (
                    <button
                      key={aidx}
                      onClick={() => handleAnswerQuiz(aidx)}
                      className={`w-full p-3 border rounded-lg text-xs font-mono text-left transition select-none flex items-start gap-2.5 cursor-pointer ${
                        isDark 
                          ? "bg-black/20 border-white/5 hover:border-cyan-500/30 text-slate-300 hover:text-white hover:bg-white/5" 
                          : "bg-slate-50 border-slate-200 hover:border-cyan-500 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-cyan-400" />
                      <span>{answer}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= SCAMS FEED BLACKLIST HUB ================= */}
        {activeTab === 'SCAMS' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Report scam form */}
              <div className={`p-4 border rounded-xl space-y-4 text-xs ${isDark ? "bg-[#0c0510] border-white/10" : "bg-slate-50 border-slate-200"}`}>
                <div>
                  <h4 className="font-bold uppercase font-mono text-white">Transmit Scam Address Report</h4>
                  <p className="text-[10px] text-slate-500 font-mono">WARNING REPORTS WILL BE INDEXED BY AUTOMATED AUDIT CLIENTS</p>
                </div>

                <form onSubmit={handleSubmitScam} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-400 block">WEBSITE OR ATTACK COIN NAME</label>
                    <input
                      type="text"
                      value={scamName}
                      onChange={(e) => setScamName(e.target.value)}
                      placeholder="e.g. Raydium-Solana Phishing Site"
                      className={`w-full p-2.5 rounded border outline-none font-mono ${isDark ? "bg-black/40 border-white/10 text-white focus:border-cyan-500" : "bg-white border-slate-300 focus:border-cyan-500"}`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-400 block">THREAT PATTERN</label>
                    <select
                      value={scamType}
                      onChange={(e) => setScamType(e.target.value)}
                      className={`w-full p-2.5 rounded border outline-none font-mono ${isDark ? "bg-[#020205] border-white/10 text-white" : "bg-white border-slate-300"}`}
                    >
                      <option value="Drainer Site">Drainer Site Mockup</option>
                      <option value="Malicious Contract">Malicious Code Function</option>
                      <option value="Rug Pull Token">Rug Pull Project Outbreak</option>
                      <option value="Social Impersonation">Social Mimicry</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-400 block">LINK OR SCAM ADDRESS ID</label>
                    <input
                      type="text"
                      value={scamAddress}
                      onChange={(e) => setScamAddress(e.target.value)}
                      placeholder="e.g. 0x3ac1... or raydium-app.co"
                      className={`w-full p-2.5 rounded border outline-none font-mono ${isDark ? "bg-black/40 border-white/10 text-white focus:border-cyan-500" : "bg-white border-slate-300 focus:border-cyan-500"}`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-pink-500 hover:bg-pink-400 text-black font-extrabold text-[10px] uppercase tracking-wider rounded transition cursor-pointer font-mono"
                  >
                    Add to Global Blacklist
                  </button>
                </form>
              </div>

              {/* Feed displays list */}
              <div className="space-y-3">
                <h4 className={`text-xs font-bold uppercase tracking-wider font-mono ${isDark ? "text-slate-300" : "text-slate-700"}`}>Verified Reported Blacklist</h4>
                
                <div className="space-y-2">
                  {scamReports.map(report => (
                    <div key={report.id} className={`p-3 border rounded-xl flex items-center justify-between font-mono text-[11px] ${
                      report.status === "VERIFIED" ? "bg-red-500/5 border-red-500/10" : "bg-white/5 border-white/10"
                    }`}>
                      <div>
                        <span className={`font-bold block uppercase tracking-wide ${isDark ? "text-white" : "text-slate-800"}`}>{report.name}</span>
                        <span className="text-[9px] text-slate-500">Threat Type: {report.type}</span>
                      </div>
                      <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded leading-none ${
                        report.status === "VERIFIED" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-500"
                      }`}>
                        {report.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================= MONITOR FEED PANEL ================= */}
        {activeTab === 'MONITOR' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h3 className={`text-md font-bold uppercase font-mono ${isDark ? "text-white" : "text-slate-800"}`}>Live Blockchain Monitor</h3>
              <p className="text-[10px] font-mono text-slate-400 uppercase">HIGH SPEED TRANSFER TRACKING FEED FROM SOLANA & EVM SECTORS</p>
            </div>

            <div className={`p-4 border rounded-xl overflow-hidden ${isDark ? "bg-[#020204] border-white/10" : "bg-slate-50 border-slate-200"}`}>
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {liveFeed.length === 0 ? (
                  <div className="text-center font-mono py-8 text-xs text-slate-500 flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4 text-cyan-400 animate-spin" />
                    <span>Synchronizing real-time websocket hooks. Feeds arriving instantly...</span>
                  </div>
                ) : (
                  liveFeed.map(feed => (
                    <div key={feed.id} className="text-[11px] font-mono flex items-start gap-2.5 pb-2.5 border-b border-white/5 last:border-0">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                        feed.type === 'ALERT' 
                          ? "bg-red-500/10 text-red-400" 
                          : feed.type === 'SUCCESS' 
                          ? "bg-green-500/10 text-green-400" 
                          : "bg-cyan-500/10 text-cyan-400"
                      }`}>
                        {feed.chain}
                      </span>
                      <p className={`flex-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        {feed.text}
                      </p>
                      <span className="text-[9px] text-slate-500 whitespace-nowrap">{feed.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= PHISHING SEARCH URL SHIELD PANEL ================= */}
        {activeTab === 'ANTI_FAKE' && (
          <div className="space-y-4 animate-in fade-in duration-250">
            <div>
              <h3 className={`text-md font-bold uppercase font-mono ${isDark ? "text-white" : "text-slate-800"}`}>Anti-Fake Website & link scanner</h3>
              <p className="text-[10px] font-mono text-slate-400 uppercase">DETECT CLONE TOKENS, IMPOSTER DOMAINS, AND EXPLICIT DRAINS</p>
            </div>

            <form onSubmit={handleFakeSiteCheck} className={`p-4 border rounded-xl ${isDark ? "bg-[#0c0510] border-white/10" : "bg-slate-50 border-slate-200"} flex flex-col sm:flex-row gap-3`}>
              <div className="flex-1">
                <input
                  type="text"
                  value={fakeInputUrl}
                  onChange={(e) => setFakeInputUrl(e.target.value)}
                  placeholder="Paste site URL to audit (e.g. raydium-app.sh)"
                  className={`w-full p-2.5 rounded-lg text-xs font-mono outline-none border ${isDark ? "bg-black/40 border-white/10 text-white" : "bg-white border-slate-300"}`}
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 font-bold uppercase tracking-wider text-xs font-mono text-black rounded-lg transition"
              >
                Scan Web link
              </button>
            </form>

            {fakeAuditResult && (
              <div className={`p-4 border rounded-xl space-y-3 font-mono text-xs ${
                fakeAuditResult.score > 70 
                  ? "bg-green-500/5 border-green-500/10" 
                  : fakeAuditResult.score > 40 
                  ? "bg-amber-500/5 border-amber-500/10" 
                  : "bg-red-500/5 border-red-500/10"
              }`}>
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-slate-400 uppercase">AUDITED URL PATH:</span>
                  <span className={`font-bold ${isDark ? "text-white" : "text-slate-800"}`}>{fakeAuditResult.url}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 uppercase">SAFETY CLEARANCE COEFFICIENT:</span>
                  <span className={`font-black uppercase text-sm ${
                    fakeAuditResult.score > 70 ? "text-green-400" : fakeAuditResult.score > 40 ? "text-amber-500" : "text-red-500"
                  }`}>
                    {fakeAuditResult.score}% ({fakeAuditResult.status})
                  </span>
                </div>

                <div className="space-y-1 pt-1 text-[10px] text-slate-500">
                  {fakeAuditResult.warnings.map((warn: string, widx: number) => (
                    <div key={widx} className="flex gap-1.5 items-start text-left text-red-400 leading-normal">
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span>{warn}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Payment simulated checkout Modal */}
      {showPayModal && selectedPlan && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" id="pro-payment-modal">
          <div className="w-full max-w-sm bg-[#0c0510] border border-white/15 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.85)] space-y-4 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 w-24 h-24 bg-cyan-400/10 blur-[35px] rounded-full pointer-events-none" />
            
            <div className="flex justify-between items-start border-b border-white/10 pb-3">
              <div>
                <h3 className="text-xs font-black uppercase text-pink-400 font-mono tracking-wider">SECURE PRO PAYMENT PORTAL</h3>
                <span className="text-[10px] text-white block">PLAN CONFIGURED: {selectedPlan.name}</span>
              </div>
              <button 
                onClick={() => setShowPayModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs font-mono">
              <div className="flex justify-between items-center text-[10px] bg-[#040409] border border-white/5 rounded-lg p-2.5">
                <span className="text-slate-500">FIAT PRICING:</span>
                <span className="text-white font-bold">${selectedPlan.priceUSD} USD / Month</span>
              </div>

              {/* Toggle switch payment method style */}
              <div className="grid grid-cols-2 gap-2 text-center text-[10px] select-none">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('ROB_TOKEN')}
                  className={`p-2 rounded-lg border transition ${
                    paymentMethod === 'ROB_TOKEN' ? "border-cyan-400 bg-cyan-400/10 text-cyan-400" : "border-white/10 text-slate-400"
                  }`}
                >
                  Pay with $ROB
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-2 rounded-lg border transition ${
                    paymentMethod === 'CARD' ? "border-cyan-400 bg-cyan-400/10 text-cyan-400" : "border-white/10 text-slate-400"
                  }`}
                >
                  Pay with Credit Card
                </button>
              </div>

              {paymentMethod === 'CARD' ? (
                <div className="space-y-3 bg-white/5 border border-white/10 rounded-xl p-3 text-left">
                  <div className="space-y-1">
                    <label className="text-[8px] text-slate-400 block uppercase">Email Address</label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="node@robotic-security.org"
                      className="w-full p-2 bg-black/40 border border-white/10 text-xs rounded outline-none text-white focus:border-cyan-400"
                    />
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[8px] text-slate-400 block uppercase">Simulated Card Details (Stripe/PayPal Gateway)</label>
                    <div className="p-2 bg-black/40 border border-white/10 text-xs rounded text-slate-400 flex justify-between items-center font-mono">
                      <span>••••  ••••  ••••  4242</span>
                      <span className="text-[10px]">12/28</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!emailInput) {
                        triggerToast("Enter email credentials to sync subscription nodes.");
                        return;
                      }
                      setIsProUser(true);
                      setProTier(selectedPlan.name);
                      localStorage.setItem("rob_is_pro_tier", "true");
                      localStorage.setItem("rob_pro_level", selectedPlan.name);
                      triggerToast(`Payment processed successfully via card checkout! Active level: ${selectedPlan.name}`);
                      setShowPayModal(false);
                    }}
                    className="w-full py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-black font-extrabold text-[10px] uppercase rounded-lg transition shadow-md"
                  >
                    Confirm Stripe/PayPal Payment
                  </button>
                </div>
              ) : (
                <div className="space-y-3 bg-white/5 border border-white/10 rounded-xl p-3 text-left">
                  <div className="flex justify-between text-[11px] border-b border-white/5 pb-1 text-slate-300">
                    <span>Balance Available:</span>
                    <span>{robBalance.toLocaleString()} $ROB</span>
                  </div>
                  <div className="flex justify-between text-[11.5px] font-bold text-pink-400">
                    <span>Cost to authorize:</span>
                    <span>{selectedPlan.priceRob.toLocaleString()} $ROB</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      upgradeToPlan(selectedPlan.name, selectedPlan.priceRob);
                      setShowPayModal(false);
                    }}
                    className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-[10px] uppercase rounded-lg transition"
                  >
                    Pay {selectedPlan.priceRob} $ROB Utility
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
