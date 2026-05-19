import { Users, AlertCircle, Award, CheckCircle, ShieldAlert } from "lucide-react";
import { HolderAnalysis } from "../types";

interface Props {
  holders: HolderAnalysis;
}

export default function HolderList({ holders }: Props) {
  const getInsiderColor = (risk: 'Low' | 'Medium' | 'High') => {
    if (risk === 'High') return { text: 'text-red-400 bg-red-500/10 border-red-500/20', label: 'High Concentrated Risk' };
    if (risk === 'Medium') return { text: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', label: 'Medium Concentrated Risk' };
    return { text: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', label: 'Excellent Decentralization' };
  };

  const riskProfile = getInsiderColor(holders.insiderRisk);

  return (
    <div className="relative border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md p-6 overflow-hidden h-full flex flex-col justify-between">
      {/* Visual top bar glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-transparent pointer-events-none rounded-tr-xl" />

      <div>
        {/* Module Title */}
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h4 className="text-md font-bold text-white uppercase tracking-wider">Holder Distribution</h4>
          </div>
          <span className="text-xs font-mono text-cyan-300">LEDGER SCANS</span>
        </div>

        {/* Ledger decentralization tags */}
        <div className={`p-3.5 rounded-lg border flex items-center justify-between mb-5 ${riskProfile.text}`}>
          <div className="flex items-center gap-2.5">
            {holders.insiderRisk === 'High' ? (
              <ShieldAlert className="w-5 h-5 shrink-0" />
            ) : (
              <CheckCircle className="w-5 h-5 shrink-0" />
            )}
            <div>
              <p className="text-[10px] font-mono opacity-80 uppercase leading-none mb-1">Concentration Risk</p>
              <h5 className="text-xs font-bold font-mono uppercase">{riskProfile.label}</h5>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-mono font-bold text-white">{holders.top10Concentration}%</span>
            <p className="text-[10px] font-mono opacity-80">Held by Top 10</p>
          </div>
        </div>

        {/* Top level stats */}
        <div className="grid grid-cols-2 gap-3.5 mb-5">
          <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-800/40">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Tracked Wallets</span>
            <div className="text-lg font-mono font-bold text-white mt-1">
              {holders.totalHolders.toLocaleString()}
            </div>
            <p className="text-[9px] text-slate-500">Unique holder nodes</p>
          </div>

          <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-800/40">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Whale Entities</span>
            <div className="text-lg font-mono font-bold text-white mt-1">
              {holders.whaleCount} WALLETS
            </div>
            <p className="text-[9px] text-slate-500">Hold &gt;1% of total supply</p>
          </div>
        </div>

        {/* Wallet ledger list */}
        <div>
          <h5 className="text-xs font-mono uppercase text-slate-500 mb-2.5">Scrutinized Top Wallets</h5>
          <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1 no-scrollbar">
            {holders.holdersList.map((wallet, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-2 rounded bg-slate-900/20 border border-slate-800/40 hover:bg-slate-900/40 transition"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500">#{index + 1}</span>
                  <span className="text-xs font-mono text-slate-300 truncate select-all">{wallet.address}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Share badge */}
                  <span className="text-xs font-mono font-bold text-white">
                    {wallet.share.toFixed(2)}%
                  </span>
                  
                  {/* Custom tag styling */}
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded leading-none ${
                    wallet.tag === 'Developer' 
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                      : wallet.tag === 'Insider' 
                      ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' 
                      : wallet.tag === 'Liquidity Pool' 
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                      : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {wallet.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Extreme centralization alert */}
      {holders.top10Concentration > 50 && (
        <div className="mt-4 p-3 rounded bg-yellow-500/5 border border-yellow-500/25 text-yellow-500 text-xs font-mono flex items-start gap-2 leading-snug">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Insider Warning: Top 10 wallets hold {holders.top10Concentration}% of circulating capital. High risk of whale market manipulation or dump.
          </span>
        </div>
      )}
    </div>
  );
}
