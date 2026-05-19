import { motion } from "motion/react";
import { useEffect, useState } from "react";

export default function RoboBackground() {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    // Generate a set of dynamic particles floating in the background
    const items = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(items);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#020205] text-slate-400 pointer-events-none z-0">
      {/* Sleek Ambient Light Gradients and Radial Grid */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#ffffff05_1px,_transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* 2. Cyberpunk Radial Ambient Lights */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[140px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-blue-500/5 blur-[160px]" />

      {/* 3. Floating Blockchain Data Particles */}
      <div className="absolute inset-0">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-cyan-400/30"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
            }}
            animate={{
              y: ["0vh", "-100vh"],
              x: ["0vw", `${Math.random() * 10 - 5}vw`],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* 4. Scanning Radar Interface & Glowing Circuit Grid */}
      <div className="absolute bottom-10 right-10 w-96 h-96 opacity-20 border border-cyan-500/20 rounded-full flex items-center justify-center">
        <div className="w-80 h-80 border border-purple-500/10 rounded-full flex items-center justify-center">
          <div className="w-64 h-64 border border-cyan-500/5 rounded-full" />
        </div>
        
        {/* Radar sweep */}
        <motion.div 
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/0 via-cyan-500/10 to-cyan-400/20 origin-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Technical crosshairs */}
        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-cyan-500/25" />
        <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-cyan-500/25" />
      </div>

      {/* 5. Animated 3D Futuristic Robotics Centerpiece SVG */}
      <div className="absolute right-[-10%] top-[10%] w-[55%] h-[80%] opacity-25 hidden xl:block select-none pointer-events-none">
        <svg
          viewBox="0 0 800 1000"
          className="w-full h-full text-cyan-500 filter drop-shadow-[0_0_30px_rgba(6,182,212,0.15)]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          {/* Main Skull Contour Structure */}
          <motion.path
            d="M 300 250 C 300 150, 500 150, 500 250 L 520 450 L 480 580 L 320 580 L 280 450 Z"
            strokeDasharray="1200"
            initial={{ strokeDashoffset: 1200 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
          />

          {/* Forehead circuits */}
          <path d="M 400 180 L 400 240 M 360 200 L 440 200 M 330 220 L 350 250 L 390 250 M 470 220 L 450 250 L 410 250" />
          <circle cx="390" cy="250" r="4" className="fill-cyan-400" />
          <circle cx="410" cy="250" r="4" className="fill-cyan-400" />

          {/* Holographic Cyborg Eye sockets */}
          <rect x="320" y="320" width="60" height="35" rx="5" strokeWidth="2" className="stroke-cyan-400" />
          <rect x="420" y="320" width="60" height="35" rx="5" strokeWidth="2" className="stroke-purple-400" />

          {/* Dynamic Laser Eye Scanners */}
          <motion.circle
            cx="350"
            cy="338"
            animate={{ r: [3, 8, 3], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="fill-cyan-400"
          />
          <motion.circle
            cx="450"
            cy="338"
            animate={{ r: [3, 8, 3], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="fill-purple-400 animate-pulse"
          />

          {/* Scanning alignment laser line crossing the eyes */}
          <motion.line
            x1="220"
            x2="580"
            animate={{ y: [300, 480, 300] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="stroke-cyan-400/70"
            strokeWidth="2.5"
          />

          {/* Cybernetic Nose bridge */}
          <path d="M 400 320 L 400 450 L 380 470 L 420 470 Z" />

          {/* Faceplates lines and hex grid */}
          <path d="M 280 350 L 240 380 L 180 380 M 520 350 L 560 380 L 620 380" strokeDasharray="3 3" />
          <path d="M 280 450 L 220 500 L 150 500 M 520 450 L 580 500 L 650 500" />

          {/* Metallic cyber jaw connector */}
          <path d="M 330 580 L 350 680 L 450 680 L 470 580" />
          <line x1="365" y1="630" x2="435" y2="630" strokeDasharray="4 2" />
          <line x1="375" y1="650" x2="425" y2="650" />

          {/* Neck cyber links & hydraulic tubes */}
          <path d="M 360 680 L 340 820 M 440 680 L 460 820" strokeWidth="3" />
          <path d="M 400 680 L 400 800" strokeWidth="5" className="stroke-purple-500/40" />
          
          {/* Animated spinal power rings */}
          <motion.circle
            cx="400"
            cy="730"
            animate={{ r: [6, 12, 6], opacity: [0.3, 0.9, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            className="stroke-cyan-300"
          />
          <motion.circle
            cx="400"
            cy="770"
            animate={{ r: [6, 12, 6], opacity: [0.3, 0.9, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5, ease: "easeOut" }}
            className="stroke-purple-300"
          />

          {/* Chest Platform Collar */}
          <path d="M 220 820 L 300 820 L 340 780 L 460 780 L 500 820 L 580 820 L 640 950 L 160 950 Z" />
          
          {/* Blockchain Hub Reactor on Android's chest */}
          <circle cx="400" cy="870" r="45" className="stroke-cyan-400" strokeWidth="2.5" />
          <motion.polygon
            points="400,840 425,855 425,885 400,900 375,885 375,855"
            animate={{ rotate: -360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="stroke-purple-400"
            strokeWidth="2"
          />
          <motion.polygon
            points="400,850 417,860 417,880 400,890 383,880 383,860"
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="stroke-cyan-300"
          />
          <circle cx="400" cy="870" r="8" className="fill-cyan-400 animate-ping" style={{ animationDuration: '3s' }} />

          {/* Data packet streams flowing into head */}
          <motion.path
            d="M 160 950 L 220 820 L 280 450 L 300 250"
            strokeWidth="1"
            className="stroke-cyan-500/40"
            strokeDasharray="20 400"
            animate={{ strokeDashoffset: [-420, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <motion.path
            d="M 640 950 L 580 820 L 520 450 L 500 250"
            strokeWidth="1"
            className="stroke-purple-500/40"
            strokeDasharray="20 400"
            animate={{ strokeDashoffset: [420, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </svg>
      </div>
      
      {/* 6. Dynamic matrix code rain effect */}
      <div className="absolute left-6 top-1/4 select-none opacity-[0.03] font-mono text-[10px] leading-relaxed hidden md:block">
        <div>SYS_ADDR_INIT_0X00FEFA</div>
        <div>CHAIN_SOLONA_STABILIZED</div>
        <div>CACHED_MEMORY_ONLINE</div>
        <div>METADATA_LOADED_OK [1]</div>
        <div>BOT_STABILIZER_ACTIVE</div>
        <div>GEMINI_RISK_AUDIT_OK</div>
        <div>WEBSOCKET_ROUTING_LIVE</div>
      </div>
    </div>
  );
}
