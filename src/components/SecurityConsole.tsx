import { Shield, AlertTriangle, CheckCircle, Skull, Lock, Unlock, Zap } from "lucide-react";
import { SecurityFeatures } from "../types";

interface Props {
  security: SecurityFeatures;
}

export default function SecurityConsole({ security }: Props) {
  return (
    <div className="relative border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md p-6 overflow-hidden h-full flex flex-col justify-between">
      {/* Dynamic corner aesthetic */}
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl pointer-events-none rounded-tr-xl ${
        security.honeypot ? "from-red-500/10" : (security.risksCount > 1 ? "from-yellow-500/10" : "from-emerald-400/10")
      }`} />

      <div>
        {/* Module title alignment */}
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h4 className="text-md font-bold text-white uppercase tracking-wider">Contract Security Audit</h4>
          </div>
          <span className="text-xs font-mono text-slate-500 uppercase">Static Scans V3</span>
        </div>

        {/* Honeypot indicator */}
        {security.honeypot ? (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 mb-5 flex items-start gap-3.5 animate-pulse">
            <Skull className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-sm font-bold text-red-200">HONEYPOT SIGNATURE DETECTED</h5>
              <p className="text-xs text-red-350">
                Trading restriction algorithms detected. Liquidity cannot be cashed out. Extreme scam risk. Do NOT buy.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 mb-5 flex items-start gap-3.5">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-sm font-semibold text-emerald-200">No Honeypot Traps Found</h5>
              <p className="text-xs text-slate-400">
                Asset can be traded normally. Sell taxes are standard and do not prevent token transfers.
              </p>
            </div>
          </div>
        )}

        {/* Taxes and Upgrades indicators */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Buy Tax</div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-xl font-mono font-bold ${security.buyTax > 10 ? 'text-red-400' : 'text-white'}`}>
                {security.buyTax}%
              </span>
              <span className="text-[10px] font-mono text-slate-400">rate</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {security.buyTax > 10 ? 'Critical tax penalty' : 'Normal fee limits'}
            </p>
          </div>

          <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Sell Tax</div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-xl font-mono font-bold ${security.sellTax > 10 ? 'text-red-400' : 'text-white'}`}>
                {security.sellTax}%
              </span>
              <span className="text-[10px] font-mono text-slate-400">rate</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {security.sellTax > 10 ? 'Critical tax penalty' : 'Normal fee limits'}
            </p>
          </div>
        </div>

        {/* Static Privileges checklist */}
        <div className="space-y-3">
          <h5 className="text-xs font-mono uppercase text-slate-500 mb-2">Authority privileges</h5>
          
          <div className="flex items-center justify-between p-2.5 rounded bg-slate-900/20 border border-slate-800/50">
            <div className="flex items-center gap-2.5">
              {security.ownershipRenounced ? (
                <Lock className="w-4 h-4 text-emerald-400" />
              ) : (
                <Unlock className="w-4 h-4 text-yellow-400" />
              )}
              <span className="text-xs font-medium text-slate-300">Contract Ownership</span>
            </div>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${
              security.ownershipRenounced 
                ? 'bg-emerald-500/10 text-emerald-400' 
                : 'bg-yellow-500/10 text-yellow-400'
            }`}>
              {security.ownershipRenounced ? 'RENOUNCED' : 'OWNER ACTIVE'}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded bg-slate-900/20 border border-slate-800/50">
            <div className="flex items-center gap-2.5">
              {security.mintable ? (
                <AlertTriangle className="w-4 h-4 text-red-400" />
              ) : (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              )}
              <span className="text-xs font-medium text-slate-300">Mint Authority</span>
            </div>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${
              security.mintable 
                ? 'bg-red-500/10 text-red-400 animate-pulse' 
                : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              {security.mintable ? 'INTENSE RISK (MINTABLE)' : 'DISABLED'}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded bg-slate-900/20 border border-slate-800/50">
            <div className="flex items-center gap-2.5">
              {security.freezable ? (
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
              ) : (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              )}
              <span className="text-xs font-medium text-slate-300">Freeze Authority</span>
            </div>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${
              security.freezable 
                ? 'bg-yellow-500/10 text-yellow-400' 
                : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              {security.freezable ? 'AVOID (ENABLED)' : 'LOCKED'}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded bg-slate-900/20 border border-slate-800/50">
            <div className="flex items-center gap-2.5">
              {security.isProxy ? (
                <Zap className="w-4 h-4 text-yellow-400" />
              ) : (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              )}
              <span className="text-xs font-medium text-slate-300">Contract Upgradeability (Proxy)</span>
            </div>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${
              security.isProxy 
                ? 'bg-yellow-500/10 text-yellow-400' 
                : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              {security.isProxy ? 'UPGRADABLE PROXY' : 'STATIC CODE'}
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Security Warnings console log list */}
      {security.warnings.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-800/60">
          <div className="flex items-center gap-1.5 text-xs text-yellow-400 font-bold uppercase mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Audit Failures & Flags ({security.warnings.length})</span>
          </div>
          <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1 no-scrollbar text-[11px] font-mono">
            {security.warnings.map((w, idx) => (
              <div key={idx} className="flex gap-1.5 items-start text-slate-300">
                <span className="text-yellow-400/80 mt-0.5">▶</span>
                <span className="leading-tight">{w}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
