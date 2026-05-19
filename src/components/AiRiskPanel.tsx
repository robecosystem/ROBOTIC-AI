import { Cpu, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle, CornerDownRight } from "lucide-react";
import { AIScoringDetails } from "../types";

interface Props {
  ai: AIScoringDetails;
}

export default function AiRiskPanel({ ai }: Props) {
  const getRatingColor = (rating: AIScoringDetails['rating']) => {
    switch (rating) {
      case 'Very Safe':
        return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', ring: 'border-emerald-500' };
      case 'Safe':
        return { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', ring: 'border-cyan-500' };
      case 'Moderate Risk':
        return { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', ring: 'border-yellow-500' };
      case 'High Risk':
        return { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', ring: 'border-orange-500' };
      case 'Dangerous':
      default:
        return { text: 'text-red-400 bg-red-500/10 border-red-500/30', bg: 'bg-red-500/10', border: 'border-red-500/30', ring: 'border-red-500' };
    }
  };

  const ratingColors = getRatingColor(ai.rating);

  return (
    <div className="relative border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md p-6 overflow-hidden h-full flex flex-col justify-between shadow-[0_0_15px_rgba(6,182,212,0.1)]">
      {/* Visual neon backlights */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-400/20 to-transparent pointer-events-none rounded-tr-xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-500/10 to-transparent pointer-events-none rounded-bl-xl" />

      <div>
        {/* Module Title */}
        <div className="flex items-center justify-between border-b border-cyan-500/10 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h4 className="text-md font-bold text-white uppercase tracking-wider">ROBOTIC Gemini Safety Audit</h4>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-400/20">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" /> AI ANALYSIS ACTIVE
          </span>
        </div>

        {/* Primary Safety Dashboard - Large Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Main Security Score circle gauge */}
          <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/80 flex flex-col items-center justify-center text-center">
            <div className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center ${ratingColors.ring} shadow-[0_0_10px_rgba(6,182,212,0.1)]`}>
              <span className="text-3xl font-mono font-bold text-white leading-none">{ai.securityScore}</span>
              <span className="text-[9px] font-mono text-slate-500 mt-1 uppercase">Safety Score</span>
            </div>
            
            <div className={`mt-3 px-2.5 py-1 rounded text-xs font-mono font-bold tracking-tight uppercase ${ratingColors.bg} ${ratingColors.text} ${ratingColors.border}`}>
              {ai.rating}
            </div>
          </div>

          {/* Progress Indicators meters */}
          <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/80 md:col-span-3 space-y-3.5 flex flex-col justify-center">
            {/* Trust Meter */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-400 uppercase">System Trust Score</span>
                <span className="text-cyan-400 font-bold">{ai.trustScore}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${ai.trustScore}%` }} />
              </div>
            </div>

            {/* Buy Opportunity Meter */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-400 uppercase">Trading Momentum Score</span>
                <span className="text-purple-400 font-bold">{ai.momentumScore}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                <div className="h-full bg-purple-400 rounded-full" style={{ width: `${ai.momentumScore}%` }} />
              </div>
            </div>

            {/* Risk Probability Split */}
            <div className="grid grid-cols-2 gap-3 pt-1.5">
              <div className="p-2.5 rounded bg-slate-950/40 border border-slate-900 font-mono text-center">
                <span className="text-[10px] text-slate-500 uppercase">Rug Probability</span>
                <p className={`text-sm font-bold mt-0.5 ${ai.rugProbability > 40 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {ai.rugProbability}%
                </p>
              </div>

              <div className="p-2.5 rounded bg-slate-950/40 border border-slate-900 font-mono text-center">
                <span className="text-[10px] text-slate-500 uppercase">Scam Probability</span>
                <p className={`text-sm font-bold mt-0.5 ${ai.scamProbability > 40 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {ai.scamProbability}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Advisor text paragraph */}
        <div className="p-4 rounded-xl bg-slate-900/25 border border-slate-800/80 mb-6 col-span-1">
          <h5 className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <CornerDownRight className="w-3.5 h-3.5" /> AI Diagnostic Advisory
          </h5>
          <p className="text-xs text-slate-300 leading-relaxed font-sans select-text">
            {ai.recommendation}
          </p>
        </div>

        {/* Checker breakdown: Strengths vs Red Flags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {/* Key Strengths (Green) */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-mono uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Diagnostic Strengths ({ai.keyStrengths.length})</span>
            </h5>
            
            <div className="space-y-2">
              {ai.keyStrengths.map((ks, index) => (
                <div key={index} className="flex gap-2 p-2 bg-emerald-500/5 rounded border border-emerald-500/10 text-xs text-slate-300">
                  <span className="text-emerald-400 font-bold font-mono">✓</span>
                  <span className="leading-normal">{ks}</span>
                </div>
              ))}
              {ai.keyStrengths.length === 0 && (
                <p className="text-xs font-mono text-slate-600 italic">No significant strengths isolated.</p>
              )}
            </div>
          </div>

          {/* Red Flags (Orange/Red) */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-mono uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>System Vulnerabilities ({ai.redFlags.length})</span>
            </h5>
            
            <div className="space-y-2">
              {ai.redFlags.map((rf, index) => (
                <div key={index} className="flex gap-2 p-2 bg-rose-500/5 rounded border border-rose-500/10 text-xs text-slate-300">
                  <span className="text-rose-400 font-bold font-mono">!</span>
                  <span className="leading-normal">{rf}</span>
                </div>
              ))}
              {ai.redFlags.length === 0 && (
                <p className="text-xs font-mono text-slate-650 italic text-emerald-550">Zero contract flags isolated. Code shows high integrity parameters.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Suggested protocol actions */}
      <div className="pt-4 border-t border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3.5 bg-slate-900/20 border border-slate-800 rounded-lg flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
          <div className="font-mono text-xs">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest block">Action protocol</span>
            <span className="text-white font-bold uppercase">{ai.suggestedAction}</span>
          </div>
        </div>

        <div className="p-3.5 bg-slate-900/20 border border-slate-800 rounded-lg flex items-center gap-3">
          <HelpCircle className="w-5 h-5 text-purple-400 shrink-0" />
          <div className="font-mono text-xs">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest block">Risk/Reward Profile</span>
            <span className="text-white font-bold uppercase">{ai.riskReward}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
