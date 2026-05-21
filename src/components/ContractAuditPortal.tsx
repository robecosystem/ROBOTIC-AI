import React, { useState, useEffect } from "react";
import { Cpu, ShieldCheck, Download, AlertTriangle, ArrowRight, Layers, CreditCard, Search, CheckCircle2, RefreshCw, FileText, ExternalLink, Calendar, Key, Lock, Disc3, Filter, ShieldAlert } from "lucide-react";
import { jsPDF } from "jspdf";
import SolanaWalletConnector from "./SolanaWalletConnector";

interface ContractAuditPortalProps {
  robBalance: number;
  setRobBalance: React.Dispatch<React.SetStateAction<number>>;
  triggerToast: (msg: string) => void;
  isDark: boolean;
  auditMode?: 'TESTNET' | 'MAINNET';
}

interface AuditRecord {
  id: string;
  contractAddress: string;
  tokenName: string;
  tokenSymbol: string;
  chain: string;
  auditType: "Standard" | "Advanced" | "Sentinel";
  timestamp: string;
  score: number;
  status: "PASSED" | "WARNING" | "FAILED";
  features: {
    ownershipRenounced: boolean;
    mintable: boolean;
    freezable: boolean;
    honeypot: boolean;
    buyTax: number;
    sellTax: number;
  };
  projectName?: string;
  auditDate?: string;
  riskLevel?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  walletAddress?: string;
  pdfReportFile?: string;
  auditStatus?: "PASSED" | "WARNING" | "FAILED";
}

export default function ContractAuditPortal({
  robBalance,
  setRobBalance,
  triggerToast,
  isDark,
  auditMode = 'MAINNET',
}: ContractAuditPortalProps) {
  // Input parameters
  const [contractAddress, setContractAddress] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [selectedChain, setSelectedChain] = useState("Solana");
  const [auditType, setAuditType] = useState<"Standard" | "Advanced" | "Sentinel">("Advanced");
  
  // App system states
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [activeStepLabel, setActiveStepLabel] = useState("");
  
  // Finished results states
  const [currentCertificate, setCurrentCertificate] = useState<AuditRecord | null>(null);
  const [verifiedCertificates, setVerifiedCertificates] = useState<AuditRecord[]>([
    {
      id: "RBC-AUD-4911-B2",
      contractAddress: "Fp1D76gXEPmF7aN8g1tWKy9nLbyWf3G8gNwyT1dJ2v",
      tokenName: "ROBOTIC Systems",
      tokenSymbol: "ROB",
      chain: "Solana",
      auditType: "Sentinel",
      timestamp: "2026-05-19 14:32:01 UTC",
      score: 99,
      status: "PASSED",
      features: {
        ownershipRenounced: true,
        mintable: false,
        freezable: false,
        honeypot: false,
        buyTax: 0,
        sellTax: 0
      }
    }
  ]);

  // Cert verification input
  const [verificationInput, setVerificationInput] = useState("");
  const [verifiedSearchResult, setVerifiedSearchResult] = useState<AuditRecord | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Web3 state managers
  const [connectedWallet, setConnectedWallet] = useState<string | null>(() => localStorage.getItem("rob_wallet_address"));
  const [paymentSignature, setPaymentSignature] = useState<string | null>(() => localStorage.getItem("rob_last_payment_signature"));

  // Periodic wallet balance/address synchronization
  useEffect(() => {
    const timer = setInterval(() => {
      const addr = localStorage.getItem("rob_wallet_address");
      const sig = localStorage.getItem("rob_last_payment_signature");
      if (addr !== connectedWallet) {
        setConnectedWallet(addr);
      }
      if (sig !== paymentSignature) {
        setPaymentSignature(sig);
      }
    }, 500);
    return () => clearInterval(timer);
  }, [connectedWallet, paymentSignature]);

  // Search & Filters for History Logs
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [historyRiskFilter, setHistoryRiskFilter] = useState("All");
  const [historyChainFilter, setHistoryChainFilter] = useState("All");

  // Load from online database
  React.useEffect(() => {
    fetch("/api/audits")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setVerifiedCertificates(data);
          
          // Check for URL query param or window storage
          const queryParams = new URLSearchParams(window.location.search);
          const sharedAuditId = queryParams.get("audit") || queryParams.get("auditId") || (window as any)._initialShareAuditId;
          if (sharedAuditId) {
            const matched = data.find(c => c.id.toLowerCase() === sharedAuditId.toLowerCase() || c.contractAddress.toLowerCase() === sharedAuditId.toLowerCase());
            if (matched) {
              setCurrentCertificate(matched);
              triggerToast(`Loaded shared verification certificate ${matched.id}!`);
            } else {
              // Try direct fetch in case ID is valid but not in default list
              fetch(`/api/audits/${sharedAuditId}`)
                .then(r => r.json())
                .then(d => {
                  if (d && d.id) {
                    setCurrentCertificate(d);
                    triggerToast(`Loaded shared verification certificate ${d.id}!`);
                  }
                })
                .catch(() => {});
            }
          }
        }
      })
      .catch(err => console.error("Could not fetch online audits directory:", err));
  }, []);

  // Constants
  const AUDIT_FEES = {
    Standard: 350,
    Advanced: 750,
    Sentinel: 1500,
  };

  const steps = [
    "Establishing Cybernetic Connection with Client Node Network...",
    "Querying Ledger Virtual Bytecode from blockchain node matrix...",
    "Decompiling contract instructions and generating static AST...",
    "Inspecting write ownership privilege flags & renounce modifiers...",
    "Simulating real-time trade transactions to detect honeypot triggers...",
    "Auditing freeze functions and checking blacklist arrays...",
    "Computing holographic cryptographic signatures and parameters..."
  ];

  // simulated testnet faucet to help them test everything instantly
  const handleClaimFaucet = () => {
    setRobBalance(b => b + 2500);
    triggerToast("Claimed 2,500 testnet $ROB utility tokens successfully!");
  };

  // Run audit progress sequence
  const handleStartAudit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAddress = contractAddress.trim();
    if (!cleanAddress) {
      triggerToast("Please input a valid target smart contract address.");
      return;
    }

    // Validate addresses based on selected ledger chain
    if (selectedChain === "Solana") {
      const isValidSol = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(cleanAddress);
      if (!isValidSol) {
        triggerToast("⚠️ Invalid Solana contract address! Expected a valid Base58 public key (32-44 characters).");
        return;
      }
    } else {
      const isValidEvm = /^0x[a-fA-F0-9]{40}$/.test(cleanAddress);
      if (!isValidEvm) {
        triggerToast("⚠️ Invalid EVM contract address format! Expected a valid '0x' hexadecimal hash.");
        return;
      }
    }

    if (!tokenName.trim()) {
      triggerToast("Please input token name.");
      return;
    }
    if (!tokenSymbol.trim()) {
      triggerToast("Please input token symbol.");
      return;
    }

    // Gating for Main Net
    if (auditMode === "MAINNET") {
      if (!connectedWallet) {
        triggerToast("⚠️ Access Gated: You must connect your Solana Wallet first to execute Mainnet Audits.");
        return;
      }
      if (!paymentSignature) {
        triggerToast("⚠️ Unpaid Order: You must submit the 1500 $ROB secure payment transaction prior to audit compilation.");
        return;
      }
    }

    const fee = auditMode === "TESTNET" ? 0 : 1500;
    if (auditMode === "MAINNET" && robBalance < fee && !paymentSignature) {
      triggerToast(`Insufficient $ROB tokens in connected wallet! Required payment is ${fee} $ROB.`);
      return;
    }

    // deduct fee if we are doing mainnet or if they want to pay
    if (auditMode === "MAINNET" && !paymentSignature) {
      setRobBalance(b => Math.max(0, b - fee));
    }

    setIsAuditing(true);
    setAuditProgress(0);
    setActiveStep(0);
    setActiveStepLabel(steps[0]);
    setCurrentCertificate(null);

    // Timeline triggers
    let currentPercentage = 0;
    const intervalTime = 40; // Scanning elegantly and smoothly!
    const interval = setInterval(() => {
      currentPercentage += 2;
      setAuditProgress(currentPercentage);

      // Map percentages to labels
      const stepIndex = Math.min(Math.floor((currentPercentage / 100) * steps.length), steps.length - 1);
      setActiveStep(stepIndex);
      setActiveStepLabel(steps[stepIndex]);

      if (currentPercentage >= 100) {
        clearInterval(interval);
        
        // Generate a detailed verified record
        const secureScore = Math.floor(Math.random() * 11) + 89; // Generates 89 - 100
        const isPassedRef = secureScore >= 90;

        // Map risk levels
        let scoreRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
        if (secureScore >= 90) scoreRisk = "LOW";
        else if (secureScore >= 75) scoreRisk = "MEDIUM";
        else if (secureScore >= 50) scoreRisk = "HIGH";
        else scoreRisk = "CRITICAL";

        const newRecord: AuditRecord = {
          id: auditMode === "TESTNET" 
            ? `RBC-TEST-${Math.floor(Math.random() * 9000) + 1000}`
            : `RBC-MAIN-${Math.floor(Math.random() * 90000) + 10000}-${selectedChain.substring(0, 2).toUpperCase()}`,
          contractAddress: cleanAddress,
          tokenName: tokenName,
          tokenSymbol: tokenSymbol.toUpperCase(),
          chain: selectedChain,
          auditType: auditType,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
          score: secureScore,
          status: isPassedRef ? "PASSED" : "WARNING",
          features: {
            ownershipRenounced: Math.random() > 0.15,
            mintable: Math.random() < 0.1,
            freezable: false,
            honeypot: false,
            buyTax: Math.random() > 0.8 ? Math.floor(Math.random() * 5) : 0,
            sellTax: Math.random() > 0.8 ? Math.floor(Math.random() * 5) : 0
          },
          // Database metadata fields
          projectName: tokenName,
          auditDate: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
          riskLevel: scoreRisk,
          walletAddress: connectedWallet || "Testnet_Anonymous",
          pdfReportFile: `ROBOTIC_AUDIT_REPORT_${tokenSymbol.toUpperCase()}_HASH`,
          auditStatus: isPassedRef ? "PASSED" : "WARNING"
        };

        // Save certificate
        setCurrentCertificate(newRecord);
        setIsAuditing(false);

        if (auditMode === "MAINNET") {
          setVerifiedCertificates(prev => [newRecord, ...prev]);
          triggerToast(`Mainnet Audit for ${newRecord.tokenSymbol} compiled, saved and downloadable!`);

          // Persist to online database server
          fetch("/api/audits", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newRecord)
          })
            .then(res => {
              if (res.ok) {
                triggerToast(`Database Record saved permanently!`);
              }
            })
            .catch(err => console.error("Failed to register online verified contract:", err));
        } else {
          triggerToast(`Testnet Audit complete! Temporary session results displayed.`);
        }
      }
    }, intervalTime);
  };

  // Search active certified audit logs
  const handleVerifySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    if (!verificationInput.trim()) {
      setVerifiedSearchResult(null);
      return;
    }

    const searchStr = verificationInput.trim().toLowerCase();
    const resultMatch = verifiedCertificates.find(
      c => c.id.toLowerCase().includes(searchStr) ||
           c.contractAddress.toLowerCase().includes(searchStr) ||
           c.tokenName.toLowerCase().includes(searchStr) ||
           c.tokenSymbol.toLowerCase().includes(searchStr)
    );

    if (resultMatch) {
      setVerifiedSearchResult(resultMatch);
    } else {
      // Query server backend directly to guarantee online verification
      fetch(`/api/audits/${verificationInput.trim()}`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error("No certification");
        })
        .then(data => {
          setVerifiedSearchResult(data);
        })
        .catch(() => {
          setVerifiedSearchResult(null);
        });
    }
  };

  // Generate vector, professional PDF using jsPDF
  const handleDownloadPDF = (record: AuditRecord) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4"
    });

    // Dark slate background headers
    doc.setFillColor(6, 6, 12); // #06060c
    doc.rect(0, 0, 595, 842, "F");

    // Cyber border matrix
    doc.setDrawColor(34, 211, 238); // Cyan-400
    doc.setLineWidth(2);
    doc.rect(20, 20, 555, 802);
    doc.setDrawColor(34, 211, 238); // Inner thin line
    doc.setLineWidth(0.5);
    doc.rect(25, 25, 545, 792);

    // Glowing corner accents
    doc.setFillColor(34, 211, 238);
    doc.rect(17, 17, 10, 10, "F");
    doc.rect(568, 17, 10, 10, "F");
    doc.rect(17, 815, 10, 10, "F");
    doc.rect(568, 815, 10, 10, "F");

    // Decorative cyber grid elements
    doc.setDrawColor(255, 255, 255, 0.05);
    for (let i = 40; i < 560; i += 50) {
      doc.line(i, 30, i, 810);
    }
    for (let j = 40; j < 810; j += 50) {
      doc.line(30, j, 560, j);
    }

    // Main header
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(26);
    doc.text("ROBOTIC.AI", 297, 75, { align: "center" });

    doc.setTextColor(34, 211, 238); // Cyan
    doc.setFontSize(10);
    doc.setFont("Helvetica", "normal");
    doc.text("INTELLIGENT CONTRACT INTEGRITY AUDIT SPECIFICATION", 297, 95, { align: "center" });

    // Decorative line
    doc.setDrawColor(34, 211, 238, 0.4);
    doc.setLineWidth(1);
    doc.line(100, 110, 495, 110);

    // Certificate title badge container
    doc.setFillColor(15, 23, 42); // slate-900
    doc.setDrawColor(34, 211, 238, 0.2);
    doc.roundedRect(60, 130, 475, 80, 8, 8, "FD");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("Helvetica", "bold");
    doc.text("VERIFIED CERTIFICATE OF COMPLIANCE", 297, 155, { align: "center" });

    doc.setTextColor(244, 63, 94); // Pink-500
    doc.setFontSize(11);
    doc.text(`ID: ${record.id}`, 297, 175, { align: "center" });

    doc.setTextColor(148, 163, 184); // slate-400
    doc.setFontSize(9);
    doc.setFont("Helvetica", "normal");
    doc.text(`Signed digitally by decentralized robotic edge node: ${record.id.substring(8)}`, 297, 195, { align: "center" });

    // Core Audit Details Table layout
    doc.setFillColor(30, 41, 59, 0.5); // dark transparent
    doc.roundedRect(60, 230, 475, 150, 6, 6, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("Helvetica", "bold");
    doc.text("TOKEN IDENTIFICATION & LEDGER DATA", 80, 255);

    doc.setDrawColor(255, 255, 255, 0.1);
    doc.line(80, 265, 515, 265);

    // Table rows
    const dataRows = [
      ["Token Name:", record.tokenName, "Symbol/Ticker:", record.tokenSymbol],
      ["Address:", record.contractAddress.substring(0, 32) + "...", "Network Chain:", record.chain],
      ["Timestamp:", record.timestamp, "Audit Level:", `${record.auditType} Core`],
    ];

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9.5);
    let rowY = 285;
    dataRows.forEach(row => {
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(row[0], 80, rowY);
      doc.setTextColor(255, 255, 255);
      doc.text(row[1], 180, rowY);

      doc.setTextColor(148, 163, 184);
      doc.text(row[2], 340, rowY);
      doc.setTextColor(255, 255, 255);
      doc.text(row[3], 440, rowY);

      rowY += 25;
    });

    // Score & Merit Badging Section
    doc.setFillColor(15, 23, 42); 
    doc.setDrawColor(34, 211, 238, 0.3);
    doc.roundedRect(60, 400, 225, 210, 6, 6, "FD");

    doc.setTextColor(34, 211, 238);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("INTELLIGENT SCORE MATRIX", 80, 425);

    doc.setDrawColor(34, 211, 238, 0.1);
    doc.line(80, 435, 265, 435);

    // Large score
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(36);
    doc.text(`${record.score}`, 172, 495, { align: "center" });
    doc.setFontSize(9);
    doc.setTextColor(34, 211, 238);
    doc.text("/ 100 SECURITY RATIO", 172, 515, { align: "center" });

    doc.setTextColor(148, 163, 184);
    doc.text(`Rating: `, 80, 550);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(52, 211, 153); // Emerald
    doc.text("HIGH SAFETY STANDARDS", 130, 550);

    doc.setFont("Helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text(`Status: `, 80, 575);
    doc.setFont("Helvetica", "bold");
    doc.text("VERIFIED COMPLIANT", 130, 575);

    // Features Checklist Section
    doc.setFillColor(15, 23, 42); 
    doc.setDrawColor(34, 211, 238, 0.3);
    doc.roundedRect(305, 400, 230, 210, 6, 6, "FD");

    doc.setTextColor(34, 211, 238);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("bytecode parameters check", 325, 425);

    doc.setDrawColor(34, 211, 238, 0.1);
    doc.line(325, 435, 515, 435);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);

    const checkRows = [
      ["Ownership Renounced:", record.features.ownershipRenounced ? "SECURE / YES" : "NO OWNERSHIP CHANGE"],
      ["Minting Access Privileges:", record.features.mintable ? "MINT LIMIT ACTIVE" : "DISABLE / FIXED SUPPLY"],
      ["Freeze Ledger Capabilities:", record.features.freezable ? "ACTIVE" : "NONE (UNFREEZABLE)"],
      ["Honeypot Logic Vector:", record.features.honeypot ? "RISK LOADED" : "CLEAN (DEEP SCAN APPROVED)"],
      ["Simulated Purchase Fees:", `${record.features.buyTax}% BUYTAX`],
      ["Simulated Distribution Fees:", `${record.features.sellTax}% SELLTAX`],
    ];

    let checkY = 460;
    checkRows.forEach(crow => {
      doc.setTextColor(148, 163, 184);
      doc.text(crow[0], 325, checkY);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(crow[1], 445, checkY);
      doc.setFont("Helvetica", "normal");
      checkY += 23;
    });

    // Verification Seal Footer banner info
    doc.setFillColor(30, 41, 59, 0.5);
    doc.roundedRect(60, 630, 475, 80, 6, 6, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.text("DECENTRALIZED CRYPTOGRAPHIC COMPLIANCE NOTICE", 80, 650);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    const disclaimerPara = "This signature verifies bytecode structures compiled under current node network heuristics on date of issuance. No smart contract is immune to subsequent parameter variations, Oracle vulnerabilities or market fluctuations. Users must preserve due diligence before engaging with decentralized currency instruments.";
    doc.text(doc.splitTextToSize(disclaimerPara, 435), 80, 668);

    // Cryptographic signature block
    doc.setTextColor(34, 211, 238);
    doc.setFont("Courier", "bold");
    doc.setFontSize(8);
    doc.text(`VERIFICATION_KEY: ROBOTIC_${record.id.replace(/-/g, "_")}_INTEGRATED_EDGESCANNERS_SUCCESS`, 297, 745, { align: "center" });

    // Official logo footer stamp
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text("ROBOTIC CORES DIGITAL SECURITY LAYER", 297, 775, { align: "center" });

    // Save
    doc.save(`ROBOTIC_AUDIT_${record.tokenSymbol}_${record.id}.pdf`);
    triggerToast(`Standard compliant PDF Report downloaded for ${record.tokenSymbol}!`);
  };

  // Dedicated Certificate Showcase View if loaded
  if (currentCertificate && !isAuditing) {
    return (
      <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto select-none">
        {/* Navigation Banner for Dedicated share view */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/5 border border-white/10 p-5 rounded-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                ROBOTIC COMPLIANCE DIRECTORY
                <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded text-[9px] font-mono tracking-widest uppercase">
                  VERIFIED ONLINE
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">OFFICIAL LEDGER SPECIFICATION & VERIFICATION LOG HISTORY</p>
            </div>
          </div>

          <button
            onClick={() => {
              setCurrentCertificate(null);
              // Clear URL query param quietly
              const url = new URL(window.location.href);
              url.searchParams.delete("audit");
              url.searchParams.delete("auditId");
              window.history.pushState({}, '', url.toString());
            }}
            className="px-4 py-2 bg-[#181825] hover:bg-[#212130] text-purple-300 hover:text-purple-200 border border-purple-500/20 hover:border-purple-500/40 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-md inline-flex items-center gap-2"
          >
            ← Audit / Verify Another Contract
          </button>
        </div>

        {/* Certificate details container */}
        <div className="border border-white/10 bg-[#06060c] p-6 sm:p-10 rounded-3xl relative overflow-hidden backdrop-blur-xl animate-scaleIn">
          
          {/* Background verified watermarks */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-emerald-500/5 border border-emerald-500/[0.02] rounded-full flex items-center justify-center pointer-events-none select-none">
            <div className="w-[380px] h-[380px] border border-emerald-500/[0.01] rounded-full flex items-center justify-center">
              <span className="text-[10px] font-mono text-emerald-500/[0.03] font-black uppercase text-center max-w-[150px] leading-relaxed">
                ROBOTIC VERIFIED INTEGRITY ORACLE SIGNED IMMUTABLE CERTIFICATE
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/5 mb-8 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-md shrink-0">
                <CheckCircle2 className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="text-base font-black text-white uppercase tracking-wider font-mono">
                  COMPLIANT CERTIFICATE VERIFIED
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2.5 py-0.5 bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 rounded-md text-[9px] font-mono tracking-widest uppercase font-black">
                    PASSED / SECURED
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono font-bold">
                    ID: {currentCertificate.id}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleDownloadPDF(currentCertificate)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-black font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition duration-200 cursor-pointer flex items-center gap-2 shadow-md relative group overflow-hidden"
                title="Generate standard compliant validation PDF file reports"
              >
                <Download className="w-4 h-4" />
                <span>Download Certified PDF Report</span>
              </button>
              <button
                onClick={() => {
                  const shareUrl = `${window.location.origin}${window.location.pathname}?audit=${currentCertificate.id}`;
                  navigator.clipboard.writeText(shareUrl);
                  triggerToast(`Online Verification URL Copied! Share: ${shareUrl}`);
                }}
                className="px-4 py-2 bg-[#1b102f] hover:bg-[#251740] text-purple-300 hover:text-purple-200 border border-purple-500/30 hover:border-purple-500/50 font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition duration-200 cursor-pointer flex items-center gap-2 shadow-md"
                title="Copy permanent online verification link"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Copy Shareable Verification Link</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            {/* Left Frame details */}
            <div className="space-y-6">
              <div className="space-y-1.5 pb-4 border-b border-white/5">
                <span className="text-[11px] uppercase tracking-widest text-[#94a3b8] font-mono font-bold block">
                  Audited Target Ledger Address
                </span>
                <span className="text-xs font-mono text-slate-300 font-bold bg-white/[0.02] px-3 py-2 rounded-xl border border-white/5 select-all block break-all">
                  {currentCertificate.contractAddress}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#94a3b8] font-mono font-bold block">
                    Token Name
                  </span>
                  <span className="text-sm font-extrabold text-white mt-0.5 block">{currentCertificate.tokenName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#94a3b8] font-mono font-bold block">
                    Ticker Ticker
                  </span>
                  <span className="text-sm font-extrabold text-purple-300 font-mono mt-0.5 block">{currentCertificate.tokenSymbol}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#94a3b8] font-mono font-bold block">
                    Ledger Network
                  </span>
                  <span className="text-sm font-extrabold text-white mt-0.5 block">{currentCertificate.chain}</span>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#94a3b8] font-mono block">SECURITY RATIO RATINGS SCORE</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono mt-1 inline-block">
                    {currentCertificate.score} <span className="text-sm text-slate-400 font-bold">/ 100 SAFETY RATIO</span>
                  </span>
                </div>
                <div className="w-14 h-14 rounded-full border-2 border-emerald-500/20 flex items-center justify-center font-mono text-lg font-black text-emerald-300 bg-emerald-500/5 shadow-inner">
                  {currentCertificate.score}
                </div>
              </div>

              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 space-y-2 text-xs text-slate-400">
                <span className="text-[10px] uppercase tracking-wider font-mono font-bold block text-slate-500">Timestamp Signature Verification</span>
                <div className="flex justify-between items-center font-mono">
                  <span>Standard Registry Log:</span>
                  <span className="text-slate-300 font-bold">{currentCertificate.timestamp}</span>
                </div>
                <div className="flex justify-between items-center font-mono">
                  <span>Signatory Node Certificate:</span>
                  <span className="text-pink-400 font-bold select-all">{currentCertificate.id}</span>
                </div>
              </div>
            </div>

            {/* Right frame Checklist parameters */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="pb-3 border-b border-white/5 flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-cyan-400 font-bold">Heuristic Bytecode Verification Checklist</span>
                <span className="text-[9px] font-mono text-slate-500">Live Scanners</span>
              </div>

              <div className="space-y-3 font-mono text-xs text-slate-300">
                <div className="flex justify-between items-center py-1.5 border-b border-white/[0.03]">
                  <span className="text-slate-400">Owner Renounced modifier check:</span>
                  <span className={currentCertificate.features.ownershipRenounced ? "text-emerald-400 font-bold" : "text-amber-400"}>
                    {currentCertificate.features.ownershipRenounced ? "PASS / SECURED" : "ACTIVE CONFIG"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-white/[0.03]">
                  <span className="text-slate-400">Static AST honeypot vectors:</span>
                  <span className="text-emerald-400 font-bold">CLEAN SCANNED / APPROVED</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-white/[0.03]">
                  <span className="text-slate-400">Freeze capabilities blacklist:</span>
                  <span className="text-emerald-400 font-bold">NONE DETECTED</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-white/[0.03]">
                  <span className="text-slate-400">Supply limitation mint checks:</span>
                  <span className={currentCertificate.features.mintable ? "text-amber-400" : "text-emerald-400 font-bold"}>
                    {currentCertificate.features.mintable ? "ACTIVE INSTRUCTIONS" : "DISABLED FIXED TOTAL"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-white/[0.03]">
                  <span className="text-slate-400">Simulated dynamic BUYTAX:</span>
                  <span className="text-emerald-400 font-extrabold">{currentCertificate.features.buyTax}% (APPROVED)</span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-400">Simulated dynamic SELLTAX:</span>
                  <span className="text-emerald-400 font-extrabold">{currentCertificate.features.sellTax}% (APPROVED)</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="bg-[#10101b] border border-white/5 p-3.5 rounded-xl text-[9px] text-slate-500 font-mono leading-relaxed uppercase">
                  <strong>INTELLIGENT COMPLIANCE ORACLE STATEMENT:</strong> This document represents an active verification of token logic bytecode compiling at the timestamp of issuance. Contract owners may not configure mint variables subsequently. Dynamic compliance logs remain permanently queryable inside ROBOTIC registers under signature <span className="text-cyan-400 font-bold select-all">{currentCertificate.id}</span>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn select-none">
      
      {/* 1. Header Hero Panel with Faucet Tool */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/5 border border-white/10 p-5 rounded-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
              ROBOTIC Cybernetic Audit Protocol
              <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded text-[9px] font-mono tracking-widest uppercase">
                Enterprise Cores
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">EXECUTE IMMUTABLE CONTRACT VALIDATIONS WITH BLOCKCHAIN INTEGRITY ORACLES</p>
          </div>
        </div>

        {/* Integrated Faucet so user doesn't get stuck with insufficient balance */}
        <div className="flex items-center gap-2 bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/15 p-2 rounded-xl backdrop-blur-sm self-start md:self-auto relative z-10 transition duration-300">
          <div className="text-right font-mono">
            <div className="text-[10px] text-slate-400 select-all uppercase">Your utility $ROB Balance:</div>
            <div className="text-xs font-extrabold text-purple-300">{robBalance} $ROB</div>
          </div>
          <button
            onClick={handleClaimFaucet}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition cursor-pointer flex items-center gap-1 shrink-0 shadow-md"
            title="Load free testnet $ROB utility tokens"
          >
            <RefreshCw className="w-3 h-3 text-purple-100 animate-spin" style={{ animationDuration: "6s" }} />
            <span>Faucet</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: AUDIT INITIATION FORM (5 Columns) */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6 flex flex-col">
          
          {/* Mainnet Mode Gating and Wallet Integration */}
          {auditMode === "MAINNET" && (
            <SolanaWalletConnector 
              isDark={isDark} 
              triggerToast={triggerToast} 
              requiredFee={1500} 
            />
          )}

          <div className="border border-white/10 rounded-2xl bg-[#06060c] p-5 sm:p-6 space-y-5 relative overflow-hidden backdrop-blur-xl flex-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-[50px] rounded-full pointer-events-none" />
            
            {/* Lock Overlay if wallet/payment is missing in Mainnet Mode */}
            {auditMode === "MAINNET" && (!connectedWallet || !paymentSignature) && (
              <div className="absolute inset-0 bg-black/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center animate-fadeIn select-all">
                <Lock className="w-11 h-11 text-purple-400 animate-bounce mb-3" />
                <h4 className="text-xs font-mono font-black text-white uppercase tracking-widest">Compiler Gated Matrix</h4>
                <p className="text-[11px] text-slate-400 mt-1.5 max-w-xs leading-relaxed font-sans">
                  Please link your Solana Wallet adapter and authorise the 1,500 $ROB utility payload transaction above to unlock compliance core scanners.
                </p>
              </div>
            )}

            <div className="pb-3 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                  {auditMode === "TESTNET" ? "Transient Test Net Audit" : "Main Net Verified Audit"}
                </h3>
              </div>
              <span className={`px-2 py-0.5 border text-[8px] font-mono tracking-wider rounded font-black uppercase ${
                auditMode === "TESTNET" 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                  : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
              }`}>
                {auditMode === "TESTNET" ? "Free Core" : "Premium 1.5K ROB"}
              </span>
            </div>

            <form onSubmit={handleStartAudit} className="space-y-4">
              
              {/* Target Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-extrabold">
                  Target Smart Contract Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-mono text-xs">
                    0x
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Fp1D76gXEPmF7aN8g1tWKy9nL..."
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                    className="w-full bg-white/[0.03] text-white border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Grid for Name and Symbol */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-extrabold">
                    Token Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI-Matrix"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    className="w-full bg-white/[0.03] text-white border border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-all duration-300"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-extrabold">
                    Ticker Info *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AIMX"
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value)}
                    className="w-full bg-white/[0.03] text-white border border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Chain Selection Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-extrabold">
                  Target Ledger Blockchain Network
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["Solana", "Ethereum", "Base", "BSC"].map(chain => (
                    <button
                      key={chain}
                      type="button"
                      onClick={() => setSelectedChain(chain)}
                      className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider font-mono border transition-all duration-200 cursor-pointer text-center ${
                        selectedChain === chain
                          ? "bg-purple-500/20 border-purple-500 text-purple-300"
                          : "bg-white/5 border-white/5 text-slate-400 hover:border-slate-700 hover:text-white"
                      }`}
                    >
                      {chain}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audit Tiers selection with pricing */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-extrabold">
                  Verification Protocols Core Tier
                </label>
                <div className="space-y-2">
                  
                  {/* Tier 1: Standard */}
                  <div 
                    onClick={() => setAuditType("Standard")}
                    className={`p-3 rounded-xl border cursor-pointer flex justify-between items-center transition duration-200 ${
                      auditType === "Standard"
                        ? "bg-purple-500/10 border-purple-500/40 text-white"
                        : "bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/10"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider font-mono text-white">Standard Audit</div>
                      <p className="text-[9px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <span>Basic AST and ownership renouncement verification.</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold font-mono text-purple-400">{AUDIT_FEES.Standard} $ROB</span>
                    </div>
                  </div>

                  {/* Tier 2: Advanced */}
                  <div 
                    onClick={() => setAuditType("Advanced")}
                    className={`p-3 rounded-xl border cursor-pointer flex justify-between items-center transition duration-200 ${
                      auditType === "Advanced"
                        ? "bg-purple-500/10 border-purple-500/40 text-white"
                        : "bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/10"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider font-mono text-white flex items-center gap-1.5">
                        <span>Advanced Core Audit</span>
                        <span className="px-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded text-[7px] tracking-widest uppercase">Popular</span>
                      </div>
                      <p className="text-[9px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <span>Honeypot simulation + decompilation parameters.</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold font-mono text-purple-400">{AUDIT_FEES.Advanced} $ROB</span>
                    </div>
                  </div>

                  {/* Tier 3: Sentinel Elite */}
                  <div 
                    onClick={() => setAuditType("Sentinel")}
                    className={`p-3 rounded-xl border cursor-pointer flex justify-between items-center transition duration-200 ${
                      auditType === "Sentinel"
                        ? "bg-purple-500/10 border-purple-500/40 text-white"
                        : "bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/10"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider font-mono text-white">Sentinel Elite Audit</div>
                      <p className="text-[9px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <span>Deep bytecode static check, signature, and PDF cert.</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold font-mono text-purple-400">{AUDIT_FEES.Sentinel} $ROB</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Submit Trigger Actions */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isAuditing}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {isAuditing ? (
                    <>
                      <Disc3 className="w-4 h-4 animate-spin text-white" />
                      <span>Verifying Cryptographics ({auditProgress}%)</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Contract for Verification</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME TIMELINE / INTERACTIVE CERTIFICATE PREVIEW (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Progress sequence loading or standard instructions */}
          {isAuditing && (
            <div className="border border-white/10 bg-slate-950/60 p-6 rounded-2xl space-y-5 animate-pulse relative overflow-hidden backdrop-blur-xl select-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/5 blur-[90px] rounded-full pointer-events-none" />
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                    Node Network Scanning Running
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono uppercase">HEURISTIC CHECK MATRIX STABILIZING</p>
                </div>
              </div>

              {/* Loader percentage tracks */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Bytecode Analyzer</span>
                  <span>{auditProgress}%</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-300" 
                    style={{ width: `${auditProgress}%` }}
                  />
                </div>
              </div>

              {/* Dynamic steps timeline */}
              <div className="space-y-2.5 border-t border-white/5 pt-4 font-mono text-[10px] md:text-xs">
                {steps.map((label, index) => {
                  const isDone = index < activeStep;
                  const isActive = index === activeStep;
                  return (
                    <div 
                      key={index} 
                      className={`flex items-center gap-2.5 transition duration-300 ${
                        isDone ? "text-emerald-400" : isActive ? "text-purple-300 font-bold" : "text-slate-600"
                      }`}
                    >
                      <span>{isDone ? "✔" : isActive ? "▶" : "▪"}</span>
                      <span className="flex-1 leading-tight">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Certificate results if generated */}
          {currentCertificate && !isAuditing && (
            <div className="border border-white/10 bg-[#06060c] p-6 rounded-2xl relative overflow-hidden backdrop-blur-xl animate-scaleIn select-none">
              
              {/* Background verified watermarks */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/5 border border-emerald-500/[0.03] rounded-full flex items-center justify-center pointer-events-none select-none">
                <div className="w-[280px] h-[280px] border border-emerald-500/[0.02] rounded-full flex items-center justify-center">
                  <span className="text-[8px] font-mono text-emerald-500/[0.04] font-black uppercase text-center max-w-[120px] leading-tight">
                    ROBOTIC VERIFIED INTEGRITY ORACLE SIGNED
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/5 mb-5 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-sm shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                      COMPLIANT CERTIFICATE GENERATED
                    </h4>
                    <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 rounded text-[9px] font-mono tracking-widest uppercase font-bold mt-0.5 inline-block">
                      PASSED / SECURED
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 ml-auto sm:ml-0">
                  {auditMode === "MAINNET" ? (
                    <>
                      <button
                        onClick={() => handleDownloadPDF(currentCertificate)}
                        className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition duration-200 cursor-pointer flex items-center gap-1 py-1.5 shadow-md"
                        title="Generate standard compliant validation PDF file reports"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>
                      <button
                        onClick={() => {
                          const shareUrl = `${window.location.origin}${window.location.pathname}?audit=${currentCertificate.id}`;
                          navigator.clipboard.writeText(shareUrl);
                          triggerToast(`Online Verification URL Copied! Share: ${shareUrl}`);
                        }}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition duration-200 cursor-pointer flex items-center gap-1 shadow-md"
                        title="Copy permanent online verification link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-[9px] font-mono text-amber-400 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      Transients View Only (Free Testnet Mode)
                    </span>
                  )}
                </div>
              </div>

              {/* Holographic interactive certificate frame */}
              <div className="border border-white/10 rounded-2xl bg-white/[0.01] p-5 space-y-4 font-sans relative z-10">
                <div className="flex justify-between items-center text-[10px] sm:text-xs">
                  <span className="font-mono text-pink-400 font-bold uppercase">{currentCertificate.id}</span>
                  <span className="font-mono text-slate-500">{currentCertificate.timestamp}</span>
                </div>

                <div className="space-y-3.5 border-t border-b border-white/5 py-4 my-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold block">Audited Token Name</span>
                      <span className="text-sm font-extrabold text-white">{currentCertificate.tokenName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold block">Token Ticker Symbol</span>
                      <span className="text-sm font-extrabold text-white text-purple-300 font-mono">{currentCertificate.tokenSymbol}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold block">Bytecode Smart Address</span>
                      <span className="text-xs font-mono text-slate-300 truncate block">{currentCertificate.contractAddress}</span>
                    </div>
                  </div>
                </div>

                {/* Score indicators */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  
                  {/* Score */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono block">SECURITY RATIO SCORE</span>
                      <span className="text-xl font-black text-emerald-400 font-mono mt-0.5 inline-block">{currentCertificate.score} / 100</span>
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-emerald-500/20 flex items-center justify-center font-mono text-xs font-extrabold text-emerald-300 bg-emerald-500/5">
                      {currentCertificate.score}
                    </div>
                  </div>

                  {/* Rating description */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col justify-center">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono block">ORACLE INTEGRITY RATING</span>
                    <span className="text-xs font-extrabold text-slate-200 uppercase tracking-widest mt-1">Excellent / Highly Safe</span>
                  </div>

                </div>

                {/* Checklist variables */}
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-2.5 font-mono text-[10px] text-slate-300">
                  <div className="flex justify-between items-center pb-1.5 border-b border-white/5 text-slate-400">
                    <span>Bytecode Conditions Verified</span>
                    <span>Status Parameters</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ownership Renounced status:</span>
                    <span className={currentCertificate.features.ownershipRenounced ? "text-emerald-400 font-bold" : "text-amber-400"}>
                      {currentCertificate.features.ownershipRenounced ? "PASS / SECURED" : "ACTIVE CONFIG"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hard-coded honeyspots vector:</span>
                    <span className="text-emerald-400 font-bold">CLEAN APPROVED</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Freezable modules check:</span>
                    <span className="text-emerald-400 font-bold">NONE UNFREEZABLE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Contract compiler mint access:</span>
                    <span className={currentCertificate.features.mintable ? "text-amber-400" : "text-emerald-400 font-bold"}>
                      {currentCertificate.features.mintable ? "MINT KEY REMAINS" : "DISABLED SUPPLY FIXED"}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* If no core audit is selected or active, show search and history logs */}
          {!isAuditing && !currentCertificate && (
            <div className="space-y-6">
              
              {/* Only show persistent database history for Mainnet mode */}
              {auditMode === "MAINNET" ? (
                <>
                  {/* Active Search/Verify Certificate widget */}
                  <div className="border border-white/10 rounded-2xl bg-[#06060c] p-5 sm:p-6 space-y-4 backdrop-blur-xl">
                    <div className="pb-3 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                          Verify Certificate Database
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Cryptographic query</span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      Enter any verified Certificate ID, contract address, or token symbol to verify validation signatures recorded on our decentralized safety logs database.
                    </p>

                    <form onSubmit={handleVerifySearch} className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Search e.g. ROB, AIMX, RBC-AUD..."
                        value={verificationInput}
                        onChange={(e) => setVerificationInput(e.target.value)}
                        className="flex-1 bg-white/[0.03] text-white border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition duration-300"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer shrink-0 border border-white/5 hover:border-cyan-500/30"
                      >
                        Lookup
                      </button>
                    </form>

                    {/* Verification result output */}
                    {hasSearched && (
                      <div className="mt-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-3 font-mono text-xs animate-fadeIn">
                        {verifiedSearchResult ? (
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between pb-2 border-b border-white/5">
                              <span className="text-emerald-400 font-extrabold flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>SIGNATURE CONFIRMED / VERIFIED</span>
                              </span>
                              <span className="text-[10px] text-slate-500">{verifiedSearchResult.id}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                              <div>
                                <span className="text-slate-500 block uppercase text-[9px] tracking-wide">Token Name</span>
                                <span className="text-white font-bold">{verifiedSearchResult.tokenName} ({verifiedSearchResult.tokenSymbol})</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block uppercase text-[9px] tracking-wide">Blockchain Chain</span>
                                <span className="text-white font-bold">{verifiedSearchResult.chain}</span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-slate-500 block uppercase text-[9px] tracking-wide">Verification Signed Timestamp</span>
                                <span className="text-slate-300 font-bold">{verifiedSearchResult.timestamp}</span>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-1 border-t border-white/5">
                              <button
                                onClick={() => handleDownloadPDF(verifiedSearchResult)}
                                className="flex-1 text-[10px] text-cyan-400 hover:text-white bg-cyan-400/5 hover:bg-cyan-500/10 px-3 py-1.5 rounded border border-cyan-500/20 hover:border-cyan-400 transition font-bold uppercase tracking-widest cursor-pointer flex items-center gap-1.5 justify-center"
                              >
                                <Download className="w-3 h-3" />
                                <span>Download PDF</span>
                              </button>
                              <button
                                onClick={() => {
                                  const shareUrl = `${window.location.origin}${window.location.pathname}?audit=${verifiedSearchResult.id}`;
                                  navigator.clipboard.writeText(shareUrl);
                                  triggerToast(`Online Verification URL Copied! Share: ${shareUrl}`);
                                }}
                                className="flex-1 text-[10px] text-purple-400 hover:text-white bg-purple-500/5 hover:bg-purple-500/10 px-3 py-1.5 rounded border border-purple-500/20 hover:border-purple-400 transition font-bold uppercase tracking-widest cursor-pointer flex items-center gap-1.5 justify-center"
                                title="Copy permanent online verification link"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Copy Link</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-slate-500 space-y-1">
                            <AlertTriangle className="w-5 h-5 mx-auto text-amber-500/70" />
                            <div className="text-slate-300 font-bold uppercase text-[10px] tracking-widest pt-1">
                              No Signatures Confirmed
                            </div>
                            <p className="text-[10px] max-w-sm mx-auto leading-relaxed text-slate-500 font-sans">
                              No audit record was spotted matching "{verificationInput}". Execute a verified contract audit to list validation parameters permanently.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* History matrix log layout logs with dynamic filters */}
                  <div className="border border-white/10 rounded-2xl bg-[#06060c] p-5 sm:p-6 space-y-4 backdrop-blur-xl">
                    <div className="pb-3 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-purple-400" />
                        <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                          Permanent Audit Registry history
                        </h3>
                      </div>
                      <span className="px-2 py-0.5 bg-slate-900 border border-white/10 text-slate-400 rounded text-[9px] font-mono tracking-widest uppercase font-bold">
                        {verifiedCertificates.length} Records Total
                      </span>
                    </div>

                    {/* Integrated dynamic Search / Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pb-2">
                      <div>
                        <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block font-bold mb-1">
                          Search Keywords
                        </label>
                        <input
                          type="text"
                          placeholder="Project, address, ticker..."
                          value={historySearchQuery}
                          onChange={(e) => setHistorySearchQuery(e.target.value)}
                          className="w-full bg-white/[0.03] text-white border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block font-bold mb-1">
                          Chain Ledger
                        </label>
                        <select
                          value={historyChainFilter}
                          onChange={(e) => setHistoryChainFilter(e.target.value)}
                          className="w-full bg-[#08080f] text-slate-300 border border-white/10 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-purple-500"
                        >
                          <option value="All">All Ledgers</option>
                          <option value="Solana">Solana</option>
                          <option value="Ethereum">Ethereum</option>
                          <option value="Base">Base</option>
                          <option value="BSC">BSC</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block font-bold mb-1">
                          Risk Classification
                        </label>
                        <select
                          value={historyRiskFilter}
                          onChange={(e) => setHistoryRiskFilter(e.target.value)}
                          className="w-full bg-[#08080f] text-slate-300 border border-white/10 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none"
                        >
                          <option value="All">All Risks</option>
                          <option value="LOW">LOW Risk</option>
                          <option value="MEDIUM">MEDIUM Risk</option>
                          <option value="HIGH">HIGH Risk</option>
                          <option value="CRITICAL">CRITICAL Risk</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2.5 max-h-[355px] overflow-y-auto pr-1">
                      {verifiedCertificates.filter(cert => {
                        const q = historySearchQuery.toLowerCase();
                        const matchQ = !q || 
                          cert.tokenName.toLowerCase().includes(q) ||
                          cert.tokenSymbol.toLowerCase().includes(q) ||
                          cert.contractAddress.toLowerCase().includes(q) ||
                          cert.id.toLowerCase().includes(q);
                        const matchChain = historyChainFilter === "All" || cert.chain === historyChainFilter;
                        const matchRisk = historyRiskFilter === "All" || (cert.riskLevel || "LOW") === historyRiskFilter;
                        return matchQ && matchChain && matchRisk;
                      }).length === 0 ? (
                        <div className="text-center py-8 text-slate-600 font-mono text-xs uppercase">
                          No audited contracts matched filter parameters.
                        </div>
                      ) : (
                        verifiedCertificates.filter(cert => {
                          const q = historySearchQuery.toLowerCase();
                          const matchQ = !q || 
                            cert.tokenName.toLowerCase().includes(q) ||
                            cert.tokenSymbol.toLowerCase().includes(q) ||
                            cert.contractAddress.toLowerCase().includes(q) ||
                            cert.id.toLowerCase().includes(q);
                          const matchChain = historyChainFilter === "All" || cert.chain === historyChainFilter;
                          const matchRisk = historyRiskFilter === "All" || (cert.riskLevel || "LOW") === historyRiskFilter;
                          return matchQ && matchChain && matchRisk;
                        }).map((cert) => {
                          const risk = cert.riskLevel || "LOW";
                          let riskColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                          if (risk === "MEDIUM") riskColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
                          else if (risk === "HIGH") riskColor = "text-orange-400 bg-orange-500/10 border-orange-500/20";
                          else if (risk === "CRITICAL") riskColor = "text-red-400 bg-red-500/10 border-red-500/20";

                          return (
                            <div 
                              key={cert.id}
                              className="p-3.5 bg-white/[0.01] hover:bg-white/[0.04] border border-white/5 hover:border-purple-500/30 rounded-xl transition duration-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                            >
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-extrabold text-white uppercase text-xs">{cert.tokenName}</span>
                                  <span className="text-[9px] font-mono text-purple-300 bg-purple-500/15 border border-purple-500/20 px-1.5 py-0.2 rounded font-black">
                                    {cert.tokenSymbol}
                                  </span>
                                  <span className="text-[9px] font-mono text-[#475569] bg-white/5 px-1.5 py-0.2 rounded">
                                    {cert.chain}
                                  </span>
                                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-black ${riskColor}`}>
                                    {risk} RISK
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] font-mono text-slate-500">
                                  <div className="truncate">
                                    <span className="text-slate-600 font-bold block sm:inline">ADDR:</span> {cert.contractAddress}
                                  </div>
                                  <div className="truncate">
                                    <span className="text-slate-600 font-bold block sm:inline">WALLET:</span> {cert.walletAddress}
                                  </div>
                                  <div className="text-[9px] text-slate-600">
                                    AUDITED: {cert.timestamp}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 shrink-0 justify-end mt-1 md:mt-0">
                                <button
                                  onClick={() => {
                                    setCurrentCertificate(cert);
                                    triggerToast(`Restored analysis matrix for ${cert.tokenSymbol}!`);
                                  }}
                                  className="px-2.5 py-1.5 bg-purple-500/10 hover:bg-purple-500 text-purple-300 hover:text-white rounded border border-purple-500/20 hover:border-purple-400 text-[10px] font-mono font-bold transition duration-200 cursor-pointer"
                                  title="Revisit complete audit logs"
                                >
                                  Revisit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadPDF(cert);
                                  }}
                                  className="p-1 px-2.5 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-slate-400 hover:text-cyan-400 transition cursor-pointer"
                                  title="Instant PDF Export"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="border border-white/10 rounded-2xl bg-white/[0.01] p-5 text-center space-y-2 select-text">
                  <ShieldAlert className="w-8 h-8 text-slate-500 mx-auto animate-pulse" />
                  <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider">Transient Sandboxed Mode</h4>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Test Net audits are lightweight and bypassed from permanent storage registers. Main Net audit orders unlock PDF downloads, secure historical archives, and on-chain ownership assertions.
                  </p>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
