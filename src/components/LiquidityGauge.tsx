import { Compass, Key, Lock, Unlock, Calendar, Flame, RefreshCw } from "lucide-react";
import { LiquidityDetails } from "../types";

interface Props {
  liquidity: LiquidityDetails;
}

export default function LiquidityGauge({ liquidity }: Props) {
  const formatUSD = (val: number) => {
    if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(2)}B`;
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(2)}K`;
    return `$${val.toFixed(2)}`;
  };

  const getLockLevel = (percent: number) => {
    if (percent >= 90) return { label: 'Excellent Protection', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
    if (percent >= 70) return { label: 'Good Protection', text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' };
    if (percent >= 40) return { label: 'Moderate Vulnerability', text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
    return { label: 'Extremely Vulnerable', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
  };

  const lpSafety = getLockLevel(liquidity.lpLocked);

  return (
    <div className="relative border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md p-6 overflow-hidden h-full flex flex-col justify-between">
      {/* Visual background neon touch */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/10 to-transparent pointer-events-none rounded-tr-xl" />

      <div>
        {/* Module Title */}
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <h4 className="text-md font-bold text-white uppercase tracking-wider">Liquidity Pool Metrics</h4>
          </div>
          <span className="text-xs font-mono text-slate-500">LP AUDIT</span>
        </div>

        {/* Lock Rating Tag */}
        <div className={`p-3.5 rounded-lg border flex items-center justify-between mb-5 ${lpSafety.bg} ${lpSafety.border}`}>
          <div className="flex items-center gap-2.5">
            <Lock className={`w-5 h-5 ${lpSafety.text}`} />
            <div>
              <p className="text-xs font-mono text-slate-400 uppercase">LP Protection Level</p>
              <h5 className={`text-sm font-semibold ${lpSafety.text}`}>{lpSafety.label}</h5>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-mono font-bold text-white">{liquidity.lpLocked}%</span>
            <p className="text-[10px] font-mono text-slate-400">Locked</p>
          </div>
        </div>

        {/* Locked vs Unlocked progress layout */}
        <div className="space-y-4 mb-5">
          {/* Locked bar */}
          <div>
            <div className="flex justify-between text-xs mb-1 font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-cyan-400" /> Locked Supply
              </span>
              <span className="text-white font-bold">{liquidity.lpLocked}%</span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                style={{ width: `${liquidity.lpLocked}%` }}
              />
            </div>
          </div>

          {/* Unlocked bar */}
          <div>
            <div className="flex justify-between text-xs mb-1 font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <Unlock className="w-3 h-3 text-red-400" /> Unlocked (Circulating)
              </span>
              <span className="text-white font-bold">{liquidity.lpUnlocked}%</span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-red-400 rounded-full"
                style={{ width: `${liquidity.lpUnlocked}%` }}
              />
            </div>
          </div>
        </div>

        {/* Multi informational grids */}
        <div className="grid grid-cols-2 gap-3.5 mt-2">
          <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-800/40">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Flame className="w-3.5 h-3.5 text-orange-400" /> Burned LP
            </div>
            <div className="text-lg font-mono font-bold text-white mt-1">
              {liquidity.lpBurned > 0 ? `${liquidity.lpBurned}%` : "0%"}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {liquidity.lpBurned > 0 ? "Irreversibly destroyed" : "No tokens burned yet"}
            </p>
          </div>

          <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-800/40">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Calendar className="w-3.5 h-3.5 text-purple-400" /> Lock Expiration
            </div>
            <div className="text-sm font-mono font-bold text-white mt-1.5 truncate">
              {liquidity.lockExpiration || "Unlocked/Perpetual"}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {liquidity.lockExpiration ? "Funds locked until date" : "Tokens fully loose"}
            </p>
          </div>

          <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-800/40">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} /> Pool Age
            </div>
            <div className="text-lg font-mono font-bold text-white mt-1">
              {liquidity.poolAgeDays} Days
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {liquidity.poolAgeDays > 60 ? "Solid established pool" : "Newly seeded pool"}
            </p>
          </div>

          <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-800/40">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Key className="w-3.5 h-3.5 text-emerald-400" /> DEX Interface
            </div>
            <div className="text-sm font-mono font-bold text-white mt-1.5 truncate">
              {liquidity.dexName}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Pair: {liquidity.pairAddress}
            </p>
          </div>
        </div>
      </div>

      {/* Warning on high unlocked liquidity USD */}
      {liquidity.lpUnlocked > 30 && (
        <div className="mt-5 p-3 rounded bg-red-500/5 border border-red-500/20 text-red-400 text-xs font-mono leading-tight flex items-start gap-2">
          <Unlock className="w-4 h-4 shrink-0 mt-0.5 animate-pulse" />
          <span>
            CAUTION: Unlocked LP exceeds 30% (${formatUSD(liquidity.unlockedLiquidityUSD)}). Developer can drain liquidity instantly (Rug Pull risk).
          </span>
        </div>
      )}
    </div>
  );
}
