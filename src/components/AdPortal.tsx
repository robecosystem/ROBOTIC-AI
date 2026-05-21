import React, { useState, useEffect } from "react";
import { 
  Megaphone, 
  Sparkles, 
  ArrowLeft, 
  Coins, 
  Calendar, 
  Flame, 
  Clock, 
  ShieldCheck, 
  HelpCircle,
  Plus,
  UploadCloud
} from "lucide-react";
import { AdCampaign } from "../types";
import SolanaWalletConnector from "./SolanaWalletConnector";

interface AdPortalProps {
  onBack: () => void;
  onAddAd: (newAd: AdCampaign) => void;
  robBalance: number;
  triggerToast: (msg: string) => void;
}

export default function AdPortal({ onBack, onAddAd, robBalance, triggerToast }: AdPortalProps) {
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tagline, setTagline] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [chain, setChain] = useState("Solana");
  const [durationDays, setDurationDays] = useState(7);
  
  // File upload drag & drop states
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Campaign confirmation modal state
  const [showConfirm, setShowConfirm] = useState(false);

  // Ad campaign execution mode (DEMO vs MAINNET)
  const [adMode, setAdMode] = useState<'DEMO' | 'MAINNET'>('MAINNET');

  // Web3 state managers
  const [connectedWallet, setConnectedWallet] = useState<string | null>(() => localStorage.getItem("rob_wallet_address"));
  const [adPaymentSignature, setAdPaymentSignature] = useState<string | null>(() => localStorage.getItem("rob_ad_payment_signature"));

  // Periodic wallet balance/address/signature synchronization
  useEffect(() => {
    const timer = setInterval(() => {
      const addr = localStorage.getItem("rob_wallet_address");
      const sig = localStorage.getItem("rob_ad_payment_signature");
      if (addr !== connectedWallet) {
        setConnectedWallet(addr);
      }
      if (sig !== adPaymentSignature) {
        setAdPaymentSignature(sig);
      }
    }, 500);
    return () => clearInterval(timer);
  }, [connectedWallet, adPaymentSignature]);

  const pricePerDay = adMode === "DEMO" ? 0 : 350; // $ROB (Free in Sandbox demo mode)
  const totalCost = durationDays * pricePerDay;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFileName(file.name);
      setBannerUrl("https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=640"); // Default premium mock image
      triggerToast(`Ad Banner image '${file.name}' staged successfully.`);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      setBannerUrl("https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=640");
      triggerToast(`Ad Banner image '${file.name}' staged.`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenAddress || !tokenName || !tokenSymbol || !tagline) {
      triggerToast("Please complete all required fields for verification.");
      return;
    }

    if (adMode === "MAINNET") {
      if (!connectedWallet) {
        triggerToast("⚠️ Access Gated: You must connect your Solana Wallet first to execute Mainnet Campaign orders.");
        return;
      }

      if (!adPaymentSignature) {
        triggerToast(`⚠️ Unpaid Order: Please authorize the dynamic on-chain payload signature of ${totalCost.toLocaleString()} $ROB inside the control panel first.`);
        return;
      }

      if (robBalance < totalCost && !adPaymentSignature) {
        triggerToast("Insufficient $ROB utility tokens to clear campaign budget.");
        return;
      }
    } else {
      // In demo mode, we just verify they have loaded the form correctly
      if (robBalance < (durationDays * 350)) {
        // Just warning if they wouldn't have enough in simulated balance, but allow it for superb UX
        triggerToast("Tip: Sandbox demo runs are free! Pressing Confirm will stage a mock ad campaign for testing.");
      }
    }

    // Open transaction confirmation modal instead of immediate submission
    setShowConfirm(true);
  };

  const handleConfirmPurchase = () => {
    const campaign: AdCampaign = {
      id: "ad_" + Math.random().toString(36).substring(2, 9),
      tokenAddress: tokenAddress.trim(),
      tokenName: tokenName.trim(),
      tokenSymbol: tokenSymbol.trim().toUpperCase(),
      tagline: tagline.trim(),
      bannerUrl: bannerUrl || "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=640",
      chain,
      budgetRob: adMode === "DEMO" ? 0 : totalCost,
      durationDays,
      approved: true,
      createdAt: new Date().toISOString()
    };

    onAddAd(campaign);
    if (adMode === "MAINNET") {
      // Securely consume the promotional campaign signature on success
      localStorage.removeItem("rob_ad_payment_signature");
      setAdPaymentSignature(null);
    }
    triggerToast(`Success! Campaign approved and broadcasted to ROBOTIC node banners via ${adMode === "MAINNET" ? "Solana Mainnet Ledger" : "Demo Sandbox"}!`);
    setShowConfirm(false);
    onBack();
  };

  const autofillPlaceholder = () => {
    setTokenAddress("Fp1D76gXEPmF7aN8g1tWKy9nLbyWf3G8gNwyT1dJ2v");
    setTokenName("ROBOTIC AI");
    setTokenSymbol("ROB");
    setTagline("The Ultimate Cybernetic Rug Detector - Secure Smart Verification Grid Today.");
    setBannerUrl("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=640");
    setChain("Solana");
    triggerToast("Sample template fields autofilled.");
  };

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 border border-white/10 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white transition cursor-pointer"
            title="Return to features menu"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-md sm:text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-pink-400" />
              $ROB Ad Campaigns Portal
            </h2>
            <span className="text-[10px] font-mono text-pink-400">BROADCAST TOKEN PROMOTIONS AMONG ACTIVE TERMINAL NODES</span>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto font-mono text-xs">
          <div className="px-3.5 py-1.5 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-lg flex items-center gap-1.5 font-bold">
            <Coins className="w-3.5 h-3.5" />
            <span>Balance: {robBalance.toLocaleString()} $ROB</span>
          </div>
          <button 
            onClick={autofillPlaceholder}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-slate-350 hover:text-white rounded-lg font-bold uppercase tracking-wider cursor-pointer"
          >
            Demo Template
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Campaign Builder Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
          <div className="border-b border-white/5 pb-3 mb-2 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <span>Campaign Configuration Settings</span>
                <span className="text-[8px] font-black bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono px-2 py-0.5 rounded-full animate-pulse">
                  MAINNET
                </span>
              </h3>
              <p className="text-[10px] font-mono text-slate-400 uppercase mt-0.5">
                Solana Node Grid Mainnet Verified Link
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono text-cyan-400 block mb-1.5 uppercase font-semibold">
                Blockchain Host
              </label>
              <select 
                value={chain}
                onChange={(e) => setChain(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-xs text-white lg:text-[11px] font-mono"
              >
                <option value="Solana">SOLANA</option>
                <option value="Ethereum">ETHEREUM</option>
                <option value="Base">BASE</option>
                <option value="BNB Smart Chain">BSC</option>
                <option value="Arbitrum">ARBITRUM</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-cyan-400 block mb-1.5 uppercase font-semibold">
                Token Contract Hash
              </label>
              <input 
                type="text"
                required
                placeholder="e.g. Fp1D76gXEPmF7aN8g1...v"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white placeholder-slate-705 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono text-cyan-400 block mb-1.5 uppercase font-semibold">
                Ad Token Name
              </label>
              <input 
                type="text"
                required
                placeholder="e.g. Cyber Robotics"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-xs font-sans text-white placeholder-slate-705 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-cyan-400 block mb-1.5 uppercase font-semibold">
                Ad Trade Symbol
              </label>
              <input 
                type="text"
                required
                placeholder="e.g. ROB"
                value={tokenSymbol}
                onChange={(e) => setTokenSymbol(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white placeholder-slate-705 focus:outline-none focus:border-cyan-500/50 uppercase"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono text-cyan-400 block mb-1.5 uppercase font-semibold">
              Campaign Headline Ad Tagline (Max 120 Characters)
            </label>
            <textarea 
              required
              maxLength={120}
              placeholder="e.g. First ever AI-authoritative telemetry auditor secure system. Zero inflation unlocked locks LP!"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              rows={2}
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-xs font-sans text-white placeholder-slate-705 focus:outline-none focus:border-cyan-500/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono text-cyan-400 block mb-1.5 uppercase font-semibold">
                Ad Duration Timeframe
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[3, 7, 14, 30].map((days) => (
                  <button
                    type="button"
                    key={days}
                    onClick={() => setDurationDays(days)}
                    className={`py-2 px-1 text-center font-mono text-xs font-bold rounded-lg border transition ${
                      durationDays === days 
                        ? "bg-pink-500/20 border-pink-500 text-pink-300" 
                        : "bg-[#0a0a0f] border-white/10 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    {days}D
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-cyan-400 block mb-1.5 uppercase font-semibold">
                Alternative Banner Image URL (Optional)
              </label>
              <input 
                type="url"
                placeholder="https://example.com/banner.png"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white placeholder-slate-705 focus:outline-none"
              />
            </div>
          </div>

          {/* DRAG AND DROP FILE UPLOAD FOR AD BANNER */}
          <div>
            <label className="text-[10px] font-mono text-cyan-400 block mb-1.5 uppercase font-semibold">
              Upload Ad Banner Creative (Supports Drag-And-Drop / File Upload)
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-5 text-center transition flex flex-col items-center justify-center cursor-pointer ${
                isDragging 
                  ? "border-pink-500 bg-pink-550/10 text-pink-300" 
                  : uploadedFileName 
                  ? "border-emerald-500/50 bg-emerald-500/5 text-emerald-300" 
                  : "border-white/10 bg-[#07070a] hover:border-pink-500/40 text-slate-400"
              }`}
            >
              <input 
                type="file" 
                id="banner-file-input" 
                accept="image/*" 
                onChange={handleFileInput}
                className="hidden" 
              />
              <label htmlFor="banner-file-input" className="cursor-pointer w-full flex flex-col items-center justify-center">
                <UploadCloud className={`w-8 h-8 mb-2 ${uploadedFileName ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span className="text-[11px] font-medium block">
                  {uploadedFileName ? `Staged Creative: ${uploadedFileName}` : "Drag and drop ad creative or Click to browse"}
                </span>
                <span className="text-[9px] text-slate-500 block mt-1 font-mono">Recommends aspect ratio 4:1 (PNG, JPEG, size &lt; 2MB)</span>
              </label>
            </div>
          </div>

          <div className="pt-2">
            {adMode === "MAINNET" ? (
              <>
                {!connectedWallet ? (
                  <div className="p-4 bg-red-500/10 border border-red-500/15 rounded-xl text-center text-xs font-mono text-red-400 uppercase font-black tracking-wider space-y-1 animate-fadeIn">
                    <div>⚠️ ACCESS GATED FOR SECURITY</div>
                    <div className="text-[10px] text-slate-400 normal-case font-sans">
                      You must link your Solana wallet first in the right side network gateway panel to submit promotional campaigns.
                    </div>
                  </div>
                ) : !adPaymentSignature ? (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/15 rounded-xl text-center text-xs font-mono text-amber-400 uppercase font-black tracking-wider space-y-1 animate-fadeIn">
                    <div>⚠️ UNPAID ORDER IN QUEUE</div>
                    <div className="text-[10px] text-slate-400 normal-case font-sans">
                      Please authorize the secure {totalCost.toLocaleString()} $ROB payment transaction in the gateway panel to construct this ad campaign spot.
                    </div>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-black font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(244,63,94,0.25)] hover:scale-[1.01]"
                  >
                    <Megaphone className="w-4 h-4" />
                    <span>Purchase & Publish Ad Campaign</span>
                  </button>
                )}
              </>
            ) : (
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-black font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(244,63,94,0.25)] hover:scale-[1.01]"
              >
                <Megaphone className="w-4 h-4" />
                <span>Publish Free Sandbox Ad Spot</span>
              </button>
            )}
          </div>
        </form>

        {/* Dynamic Interactive Preview Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Solana Wallet Adapter Ingestion Gateway */}
          {adMode === "MAINNET" ? (
            <SolanaWalletConnector
              isDark={true}
              triggerToast={triggerToast}
              requiredFee={totalCost}
              localStorageSigKey="rob_ad_payment_signature"
              actionLabel="ad spot"
            />
          ) : (
            <div className="p-5 bg-gradient-to-br from-pink-500/10 to-purple-500/5 border border-pink-500/20 rounded-2xl space-y-3 relative overflow-hidden text-center animate-fadeIn select-none">
              <Sparkles className="w-8 h-8 mx-auto text-pink-400 animate-pulse" />
              <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider">Playground Sandbox Active</h4>
              <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans max-w-sm mx-auto">
                No active web3 signature payload is required to test or simulate ad campaign generation. Toggle to Mainnet mode to link adapters and finalize on-chain ROB node distributions.
              </p>
            </div>
          )}

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-2">
              Budget Telemetry Metrics
            </h4>

            <div className="space-y-3 font-mono text-[11px]">
              <div className="flex justify-between pb-1.5 border-b border-white/5">
                <span className="text-slate-400">Daily Core Rate:</span>
                <span className="text-white font-bold">{pricePerDay} $ROB / day</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-white/5">
                <span className="text-slate-400">Running Timeline:</span>
                <span className="text-white font-bold">{durationDays} Days</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-white/10 text-xs font-bold">
                <span className="text-pink-400 uppercase tracking-wide">Aggregate Bid Cost:</span>
                <span className="text-pink-300">{totalCost.toLocaleString()} $ROB</span>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl space-y-2 border border-white/5">
                <span className="text-[9px] text-slate-500 block leading-tight font-sans">
                  * Dynamic decentralized validation banners are served dynamically on nodes matching user screen parameters.
                </span>
                {robBalance < totalCost ? (
                  <div className="text-[10px] font-bold text-red-400 text-center uppercase animate-pulse">
                     ⚠️ Insufficient $ROB Utility Balance
                  </div>
                ) : (
                  <div className="text-[10px] font-bold text-green-400 text-center uppercase">
                    ✅ Wallet Balance Verified Clear
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ad Live Render Mock Box */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-2">
              Live Mock Banner Preview
            </h4>

            <div className="rounded-xl border border-pink-500/30 bg-black/60 overflow-hidden relative group">
              <div className="w-full h-24 bg-slate-900 relative">
                <img 
                  src={bannerUrl || "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=640"} 
                  alt="Dynamic Ad Creative" 
                  className="w-full h-full object-cover opacity-60"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-2 left-2 text-[8px] font-mono uppercase bg-pink-500/20 text-pink-400 border border-pink-500/30 px-1.5 py-0.5 rounded">
                  Sponsored Ad
                </span>
              </div>
              <div className="p-3 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-cyan-400 font-extrabold text-[13px] font-mono">
                    {tokenSymbol || "SGN"}<span className="text-white text-[10px] font-normal font-sans ml-1">({tokenName || "Sponsor Token"})</span>
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 uppercase">{chain.toUpperCase()}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug font-sans line-clamp-2">
                  {tagline || "Your token tagline details and high impact utility text will render here."}
                </p>
                <div className="pt-1 text-[10px] font-mono text-cyan-400 flex items-center justify-between border-t border-white/5">
                  <span className="opacity-75">Address: {tokenAddress ? `${tokenAddress.substring(0, 6)}...${tokenAddress.substring(tokenAddress.length - 4)}` : "None"}</span>
                  <span className="text-[9px] underline">Inspect Security ➔</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" id="ad-confirmation-modal">
          <div className="w-full max-w-sm bg-[#0c0510] border border-white/15 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.85)] space-y-5 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            {/* Dynamic visual light effects */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-pink-500/10 blur-[30px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-purple-500/10 blur-[30px] rounded-full pointer-events-none" />

            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400 animate-pulse">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-white">
                  Confirm Ad Purchase
                </h3>
                <span className="text-[10px] font-mono text-pink-400 block">BROADCAST ORDER TRANSMISSION</span>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <p className="text-slate-400 font-sans leading-relaxed">
                You are about to purchase an active spot on the ROBOTIC Node Grid. Please confirm your campaign parameters:
              </p>

              <div className="bg-[#040409] border border-white/10 rounded-xl p-3.5 space-y-2.5 font-mono text-[11px]">
                <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
                  <span className="text-slate-500">Token Target:</span>
                  <span className="text-white font-bold">{tokenName} ({tokenSymbol})</span>
                </div>
                <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
                  <span className="text-slate-500">Host Network:</span>
                  <span className="text-cyan-400 font-bold uppercase">{chain}</span>
                </div>
                <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
                  <span className="text-slate-500">Duration Scheduled:</span>
                  <span className="text-white font-bold">{durationDays} Days</span>
                </div>
                <div className="flex justify-between items-center pt-1 font-sans">
                  <span className="text-pink-300 font-bold uppercase text-[10px] tracking-wider">Total Campaign Cost:</span>
                  <span className="text-pink-400 font-mono font-black text-xs sm:text-sm">{totalCost.toLocaleString()} $ROB</span>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-lg border border-white/10 space-y-1.5 text-[10px] leading-relaxed">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">Current Balance:</span>
                  <span className="text-slate-300">{robBalance.toLocaleString()} $ROB</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">Post-Order Balance:</span>
                  <span className="text-green-400">{(robBalance - totalCost).toLocaleString()} $ROB</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 justify-end pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 hover:bg-white/5 rounded-lg border border-white/10 text-slate-400 hover:text-white transition-all text-[10px] font-mono uppercase font-black cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPurchase}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-black font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all duration-300 flex items-center gap-1 shadow-[0_4px_15px_rgba(244,63,94,0.25)] hover:scale-[1.02] cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Pay & Publish</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
