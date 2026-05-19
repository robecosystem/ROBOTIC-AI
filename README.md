# ROBOTIC — AI-Powered Crypto Intelligence & Rug Detection

ROBOTIC is a futuristic, production-grade, full-stack single-page crypto contract address analyzer. Built on modern React 19, Express, Recharts, and Google's advanced Gemini-3.5-Flash model, it provides instant, comprehensive, and visually stunning diagnostics on any smart contract entered, evaluating real-time security risks, honeypots, liquidity pools, and whale concentration layouts.

---

## 🚀 Key Features

- **Automated Blockchain Format Auto-Detection**: Automatically identifies if a contract address belongs to Solana, EVM-based networks (Ethereum, Base, BNB Chain, Polygon, Arbitrum, Avalanche), or Tron based on regex signatures.
- **Real-Time Market Tracking**: Interacts with the DexScreener API to fetch live index prices, pools, capital liquidity, trading volume, and 24h delta percentages.
- **Automated Cyber Security audit**: Scans code structures to verify ownership status, minting permissions, wallet freeze flags, pausable modes, and Upgradable Proxies.
- **Whale Ledger Analysis**: Tracks the ledger's distribution, highlighting smart money groupings, developer pools, and insider risk ratings.
- **Interactive Price Graphs**: Draws smooth, high-fidelity Area and Volume charts utilizing Recharts.
- **Gemini AI Audits**: Leverages `gemini-3.5-flash` to evaluate complex parameters, generating custom safety ratings (Very Safe to Dangerous), strengths lists, red flags, and risk/reward multipliers.
- **Robust Algorithmic Fallback**: Integrates deterministic, cryptographically stable heuristic fallback scores if the `GEMINI_API_KEY` is not yet configured, ensuring high-grade local sandboxed analytics.
- **Search Vault History**: Preserves previous scanning logs for instant relative search lookups.
- **Report Exporter**: Includes high-fidelity raw JSON report exporters and quick sharing link generators.

---

## 🗂️ Architectural File Tree

```
├── /server.ts                 # Full-stack Node.js / Express entrypoint
├── /server/
│   ├── types.ts               # Shared server type interfaces
│   ├── addressDetector.ts     # Regex chain detector service
│   ├── cacheService.ts        # Memory search index cache
│   ├── tokenService.ts        # DexScreener connection + fallback engine
│   └── aiScoringService.ts    # Secure Gemini-3.5-Flash integration helper
│
├── /src/                      # Client React SPA source
│   ├── App.tsx                # Client State controller & Layout deck
│   ├── types.ts               # UI telemetry models
│   ├── main.tsx               # SPA entry point
│   ├── index.css              # Custom Tailwind import
│   └── components/
│       ├── RoboBackground.tsx # 3D SVG Android body & matrix particle loop
│       ├── TokenOverviewCard.tsx # Base stats and socials metrics
│       ├── SecurityConsole.tsx   # Static rule checklist
│       ├── LiquidityGauge.tsx    # Locked LP indices
│       ├── HolderList.tsx        # Ledger whale distributions
│       ├── PriceChart.tsx        # Recharts area graph & trend lines
│       └── AiRiskPanel.tsx       # Gemini safety rating rings & advisor
│
├── .env.example               # Secrets boilerplate
├── package.json               # Full-stack scripts & dependencies
└── tsconfig.json              # TS modules compiler definitions
```

---

## 🛠️ API Endpoints

- **`POST /api/analyze`**: Unified single-call analyzer endpoint. Takes `{ "address": "...", "chain": "..." }` in the body.
- **`GET /api/trending`**: Returns a static, pre-curated array of high-volume trending assets.
- **`GET /api/history`**: Returns the list of last scanned contract records.
- **`GET /api/token/:address`**: Fetch raw metadata info.
- **`GET /api/security/:address`**: Direct bytecode safety audit details.
- **`GET /api/liquidity/:address`**: Direct locked LP telemetry data.
- **`GET /api/holders/:address`**: Ledger top-holders list.
- **`GET /api/social/:address`**: Website scoring sentiment indexes.

---

## 🛡️ Setup & Environment Configuration

The application automatically configures the Gemini API client securely in backend space:

1. Copy `.env.example` to `.env`.
2. Provide your API secret:
   ```env
   GEMINI_API_KEY="your_actual_gemini_api_key"
   ```
3. To launch the high-performance dev container:
   ```bash
   npm run dev
   ```
4. To build the production-ready esbuild single-bundled image:
   ```bash
   npm run build
   ```
   This generates the built assets in `dist/` and compiles the backend into `dist/server.cjs` for standalone Node.js and container speed.
