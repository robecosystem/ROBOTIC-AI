import { useState } from "react";
import { Copy, Check, Globe, Send, Twitter, Coins, DollarSign, Activity, Database, ExternalLink } from "lucide-react";
import { TokenDetails } from "../types";

interface Props {
  token: TokenDetails;
}

export default function TokenOverviewCard({ token }: Props) {
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(token.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const padAddress = (addr: string) => {
    if (addr.length < 16) return addr;
    return `${addr.substring(0, 8)}...${addr.substring(addr.length - 8)}`;
  };

  const formatCurrency = (val: number) => {
    if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(2)}B`;
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(2)}K`;
    if (val === 0) return "$0.00";
    return `$${val.toFixed(2)}`;
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "$0.00";
    if (price < 0.0001) return `$${price.toFixed(8)}`;
    if (price < 0.01) return `$${price.toFixed(6)}`;
    return `$${price.toFixed(4)}`;
  };

  const circulatingPercent = token.totalSupply > 0 
    ? Math.min(100, Math.round((token.circulatingSupply / token.totalSupply) * 100))
    : 100;

  return (
    <div className="relative border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md p-6 overflow-hidden h-full flex flex-col justify-between">
      {/* Decorative neon corner */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-400/10 to-transparent pointer-events-none rounded-tr-xl" />

      {/* Primary Header */}
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-lg flex items-center justify-center text-cyan-400 font-bold scale-100 hover:scale-110 transition-transform duration-200">
              {token.logoUrl ? (
                <img src={token.logoUrl} alt={token.symbol} className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
              ) : (
                token.symbol.substring(0, 3)
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight text-white">{token.name}</h3>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 uppercase">
                  {token.chain}
                </span>
              </div>
              <p className="text-xs font-mono text-cyan-300 font-medium">{token.symbol}</p>
            </div>
          </div>
          
          {/* Main Price display */}
          <div className="text-right">
            <div className="text-2xl font-mono font-bold tracking-tight text-white">
              {formatPrice(token.price)}
            </div>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              token.priceChange24h >= 0 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            }`}>
              {token.priceChange24h >= 0 ? "+" : ""}
              {token.priceChange24h.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Copy Contract Address */}
        <div className="mt-4 flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2">
          <span className="text-xs font-mono text-slate-500 uppercase">ADD:</span>
          <span className="text-xs font-mono text-slate-300 select-all truncate flex-1 md:block hidden">
            {token.address}
          </span>
          <span className="text-xs font-mono text-slate-300 select-all truncate flex-1 md:hidden block">
            {padAddress(token.address)}
          </span>
          <button 
            onClick={copyAddress}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-cyan-400 transition"
            title="Copy Contract Address"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Metric grids */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="p-3 bg-slate-900/30 border border-slate-800/50 rounded-lg flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase">Market Cap</p>
              <p className="text-sm font-semibold text-white font-mono">{formatCurrency(token.marketCap)}</p>
            </div>
          </div>

          <div className="p-3 bg-slate-900/30 border border-slate-800/50 rounded-lg flex items-center gap-3">
            <Coins className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase">FDV</p>
              <p className="text-sm font-semibold text-white font-mono">{formatCurrency(token.fdv)}</p>
            </div>
          </div>

          <div className="p-3 bg-slate-900/30 border border-slate-800/50 rounded-lg flex items-center gap-3">
            <Activity className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase">24h Volume</p>
              <p className="text-sm font-semibold text-white font-mono">{formatCurrency(token.volume24h)}</p>
            </div>
          </div>

          <div className="p-3 bg-slate-900/30 border border-slate-800/50 rounded-lg flex items-center gap-3">
            <Database className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase">Pool Liquidity</p>
              <p className="text-sm font-semibold text-white font-mono">{formatCurrency(token.liquidityUSD)}</p>
            </div>
          </div>
        </div>

        {/* Circulating vs Total Supply Meter */}
        <div className="mt-6 border border-slate-800/60 rounded-lg p-3.5 bg-slate-950/20">
          <div className="flex justify-between text-xs mb-1.5 font-mono">
            <span className="text-slate-400">CIRCULATING SUPPLY</span>
            <span className="text-cyan-400 font-bold">{circulatingPercent}%</span>
          </div>
          
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
              style={{ width: `${circulatingPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-2">
            <span>{token.circulatingSupply.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            <span>Total: {token.totalSupply.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      </div>

      {/* Social Links External Panel */}
      <div className="mt-6 pt-4 border-t border-slate-800/55 flex justify-between items-center bg-transparent">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Social channels</span>
        <div className="flex gap-2.5">
          {token.websiteUrl ? (
            <a 
              href={token.websiteUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="p-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded text-cyan-400 hover:text-white transition"
              title="Official Website"
            >
              <Globe className="w-4 h-4" />
            </a>
          ) : (
            <span className="p-1.5 bg-slate-800/20 border border-slate-800 rounded text-slate-700 cursor-not-allowed">
              <Globe className="w-4 h-4" />
            </span>
          )}

          {token.telegramUrl ? (
            <a 
              href={token.telegramUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="p-1.5 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded text-sky-400 hover:text-white transition"
              title="Telegram Portal"
            >
              <Send className="w-4 h-4" />
            </a>
          ) : (
            <span className="p-1.5 bg-slate-800/20 border border-slate-800 rounded text-slate-700 cursor-not-allowed">
              <Send className="w-4 h-4" />
            </span>
          )}

          {token.twitterUrl ? (
            <a 
              href={token.twitterUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-slate-350 hover:text-white transition"
              title="Twitter Feed"
            >
              <Twitter className="w-4 h-4" />
            </a>
          ) : (
            <span className="p-1.5 bg-slate-800/20 border border-slate-800 rounded text-slate-700 cursor-not-allowed">
              <Twitter className="w-4 h-4" />
            </span>
          )}
          
          <a 
            href={`https://dexscreener.com/${token.chain.toLowerCase()}/${token.address}`} 
            target="_blank" 
            rel="noreferrer" 
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1 transition"
          >
            DexScreener <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
