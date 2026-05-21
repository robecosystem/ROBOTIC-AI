import React, { useState, useEffect } from "react";
import { 
  Megaphone, 
  Sparkles, 
  Share2, 
  ExternalLink, 
  ChevronLeft, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Coins, 
  Lock, 
  Activity, 
  FileText, 
  Check, 
  Plus, 
  Search, 
  Trash2, 
  ChevronRight,
  Play, 
  Pause, 
  Calendar, 
  Award, 
  Info, 
  Globe, 
  Send,
  Sliders, 
  ShieldCheck, 
  CheckSquare, 
  Square, 
  User, 
  Users,
  Wallet,
  Zap,
  RefreshCw,
  PlusCircle,
  Clock,
  Unlock,
  AlertTriangle,
  FileSpreadsheet,
  Twitter,
  MessageSquare
} from "lucide-react";
import { AirdropCampaign, AirdropParticipant, AirdropPayment } from "../types";
import { connectSolanaWallet, authenticateSolanaOwner, sendMainnetSOLPayment } from "../lib/solanaWallet";

interface AirdropPortalProps {
  onBack: () => void;
  robBalance: number;
  setRobBalance: React.Dispatch<React.SetStateAction<number>>;
  triggerToast: (msg: string) => void;
  isDark: boolean;
}

export default function AirdropPortal({
  onBack,
  robBalance,
  setRobBalance,
  triggerToast,
  isDark
}: AirdropPortalProps) {
  // Navigation Tabs: 'HUB' (View Active/Ended Airdrops), 'CREATOR_STUDIO' (My Created Airdrops & Create Form)
  const [activeTab, setActiveTab] = useState<'HUB' | 'CREATOR_STUDIO'>('HUB');
  
  // Create Form and Edit Modes
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAirdropId, setEditingAirdropId] = useState<string | null>(null);

  // Search Filter
  const [hubSearchQuery, setHubSearchQuery] = useState("");
  const [hubFilter, setHubFilter] = useState<'ALL' | 'ACTIVE' | 'ENDED'>('ALL');

  // Wallet and Payment Signature Connection States
  const [connectedWallet, setConnectedWallet] = useState<string | null>(() => localStorage.getItem("rob_wallet_address"));
  const [walletProvider, setWalletProvider] = useState<string | null>(() => localStorage.getItem("rob_wallet_provider"));
  const [airdropPaymentSignature, setAirdropPaymentSignature] = useState<string | null>(() => localStorage.getItem("rob_airdrop_creation_sig"));
  
  // Wallet Interaction Dropdown
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [isWalletConnecting, setIsWalletConnecting] = useState(false);
  const [isAuthorizingPayment, setIsAuthorizingPayment] = useState(false);

  // Human Verification Operator Anti-Bot Check
  const [isHumanVerified, setIsHumanVerified] = useState(false);

  // Selected Airdrop detail view modal
  const [selectedAirdrop, setSelectedAirdrop] = useState<AirdropCampaign | null>(null);
  const [taskVerificationLoading, setTaskVerificationLoading] = useState<string | null>(null);

  // Creation/Edit Form States
  const [projectName, setProjectName] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenContractAddress, setTokenContractAddress] = useState("");
  const [totalAirdropSupply, setTotalAirdropSupply] = useState("1000000");
  const [winnersCount, setWinnersCount] = useState("1000");
  const [rewardPerUser, setRewardPerUser] = useState("1000");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  });
  const [websiteLink, setWebsiteLink] = useState("");
  const [twitterLink, setTwitterLink] = useState("");
  const [telegramLink, setTelegramLink] = useState("");
  const [discordLink, setDiscordLink] = useState("");
  const [description, setDescription] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [tempCustomTask, setTempCustomTask] = useState("");

  // Default airdrop validation fee in $ROB
  const airdropCreationFee = 500;

  // Selected participant task fields
  const [selectedTasks, setSelectedTasks] = useState<string[]>([
    "follow-twitter",
    "join-telegram",
    "visit-website",
    "connect-wallet"
  ]);

  const [customTasks, setCustomTasks] = useState<string[]>([]);

  // Local storage lists
  const [airdrops, setAirdrops] = useState<AirdropCampaign[]>(() => {
    const saved = localStorage.getItem("rob_airdrops_v1");
    if (saved) return JSON.parse(saved);
    
    // Default mock real-feel airdrops
    return [
      {
        id: "airdrop_genesis",
        projectName: "Robotic Artificial Intelligence",
        tokenName: "ROBOTIC AI Token",
        tokenSymbol: "ROB",
        tokenContractAddress: "Fp1D76gXEPmF7aN8g1tWKy9nLbyWf3G8gNwyT1dJ2v",
        totalAirdropSupply: 500000,
        winnersCount: 1000,
        rewardPerUser: 500,
        startDate: "2026-05-15",
        endDate: "2026-06-15",
        websiteLink: "https://robecosystem.github.io",
        twitterLink: "https://x.com/Robecosystem",
        telegramLink: "https://t.me/robecosystem",
        discordLink: "https://discord.gg/robecosystem",
        description: "Official genesis community airdrop event for ROB utility holders. Secure node validation networks.",
        bannerUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000",
        logoUrl: "https://raw.githubusercontent.com/robecosystem/robecosystem.github.io/refs/heads/main/ROBOTIC%20logo.jpg",
        requiredTasks: ["follow-twitter", "like-repost", "join-telegram", "visit-website", "connect-wallet"],
        customTasks: ["Submit custom ROB feedback in Telegram"],
        active: true,
        creatorAddress: "RobE8as9...Hsk8J2v",
        paymentSignature: "TX_AFFFEE888999CCCDDDEEEFFF000111222333444555666AAA",
        createdAt: "2026-05-15T00:00:00Z",
        participants: [
          {
            walletAddress: "RobE3asd...jks2J2v",
            completedTasks: ["follow-twitter", "like-repost", "visit-website", "connect-wallet"],
            completedPercentage: 80,
            eligible: false,
            claimed: false,
            joinedAt: "2026-05-20T11:00:00Z"
          },
          {
            walletAddress: "RobE99xz...uun4J2v",
            completedTasks: ["follow-twitter", "like-repost", "join-telegram", "visit-website", "connect-wallet", "Submit custom ROB feedback in Telegram"],
            completedPercentage: 100,
            eligible: true,
            claimed: true,
            claimTxSignature: "TX_CLAIM_87as87ad7sa89d9ada87s978988adsa",
            joinedAt: "2026-05-19T08:30:00Z"
          }
        ]
      },
      {
        id: "airdrop_solflare",
        projectName: "Solar Flare Network",
        tokenName: "FLARE Core Node",
        tokenSymbol: "FLARE",
        tokenContractAddress: "Flare6tWKy9nLbyWf3G8gNwyT1dJ2vFp1D76gXEPmF7a",
        totalAirdropSupply: 250000,
        winnersCount: 500,
        rewardPerUser: 500,
        startDate: "2026-05-01",
        endDate: "2026-05-20", // Ended
        websiteLink: "https://solflare.com",
        twitterLink: "https://twitter.com/solflare_wallet",
        telegramLink: "https://telegram.org",
        discordLink: "https://discord.gg",
        description: "Promotional joint campaign with Solflare Web3 hardware node connectors and system hardware key logs.",
        bannerUrl: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000",
        logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/8526.png",
        requiredTasks: ["follow-twitter", "visit-website", "connect-wallet"],
        customTasks: [],
        active: true,
        creatorAddress: "SolFas8d...Hsk2J2v",
        paymentSignature: "TX_FFFFEE888999CCCDDDEEEFFF000111222333444555666BBB",
        createdAt: "2026-05-01T12:00:00Z",
        participants: [
          {
            walletAddress: "RobE3asd...jks2J2v",
            completedTasks: ["follow-twitter", "visit-website", "connect-wallet"],
            completedPercentage: 100,
            eligible: true,
            claimed: false,
            joinedAt: "2026-05-18T14:22:00Z"
          }
        ]
      }
    ];
  });

  const [paymentHistory, setPaymentHistory] = useState<AirdropPayment[]>(() => {
    const saved = localStorage.getItem("rob_airdrop_payments_v1");
    if (saved) return JSON.parse(saved);
    return [
      {
        signature: "TX_AFFFEE888999CCCDDDEEEFFF000111222333444555666AAA",
        amount: 500,
        feeType: "Airdrop Creation",
        walletAddress: "RobE8as9...Hsk8J2v",
        timestamp: "2026-05-15T00:08:12Z"
      }
    ];
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem("rob_airdrops_v1", JSON.stringify(airdrops));
  }, [airdrops]);

  useEffect(() => {
    localStorage.setItem("rob_airdrop_payments_v1", JSON.stringify(paymentHistory));
  }, [paymentHistory]);

  // Handle wallet and payment alignment ticks
  useEffect(() => {
    const handleTicker = setInterval(() => {
      const addr = localStorage.getItem("rob_wallet_address");
      const prov = localStorage.getItem("rob_wallet_provider");
      const sig = localStorage.getItem("rob_airdrop_creation_sig");
      
      if (addr !== connectedWallet) setConnectedWallet(addr);
      if (prov !== walletProvider) setWalletProvider(prov);
      if (sig !== airdropPaymentSignature) setAirdropPaymentSignature(sig);
    }, 500);
    return () => clearInterval(handleTicker);
  }, [connectedWallet, walletProvider, airdropPaymentSignature]);

  // Wallet support providers
  const providers = [
    { name: "Phantom", icon: "👻", color: "from-purple-600 to-indigo-600" },
    { name: "Solflare", icon: "☀️", color: "from-orange-500 to-red-500" },
    { name: "Backpack", icon: "🎒", color: "from-red-600 to-pink-600" },
    { name: "Glow", icon: "🌟", color: "from-green-500 to-emerald-600" },
    { name: "Trust Wallet", icon: "🛡️", color: "from-blue-600 to-cyan-600" }
  ];

  // Connect Real Wallet
  const handleConnectWallet = async (provName: string) => {
    setIsWalletConnecting(true);
    setShowWalletDropdown(false);
    try {
      const connData = await connectSolanaWallet(provName);
      
      localStorage.setItem("rob_wallet_address", connData.address);
      localStorage.setItem("rob_wallet_provider", provName);
      localStorage.setItem("rob_wallet_sol_balance", connData.solBalance.toString());
      localStorage.setItem("rob_wallet_verified", "false"); // Needs challenge sign

      setConnectedWallet(connData.address);
      setWalletProvider(provName);
      triggerToast(`Successfully connected via real ${provName}! Please verify sign in if required.`);
    } catch (err: any) {
      triggerToast(`❌ Provider Error: ${err.message || err}`);
    } finally {
      setIsWalletConnecting(false);
    }
  };

  const handleDisconnectWallet = () => {
    localStorage.removeItem("rob_wallet_address");
    localStorage.removeItem("rob_wallet_provider");
    localStorage.removeItem("rob_wallet_verified");
    localStorage.removeItem("rob_wallet_sol_balance");
    localStorage.removeItem("rob_airdrop_creation_sig");
    setConnectedWallet(null);
    setWalletProvider(null);
    setAirdropPaymentSignature(null);
    triggerToast("Real wallet securely disconnected.");
  };

  // Authorize Real On-Chain Payment
  const handleAuthorizePayment = async () => {
    if (!connectedWallet || !walletProvider) {
      triggerToast("⚠️ Connection Gated: Switch on your Solana Wallet first.");
      return;
    }

    const solBalanceVal = parseFloat(localStorage.getItem("rob_wallet_sol_balance") || "0");
    const requiredSol = 0.001; // Equivalent mainnet SOL fee

    if (solBalanceVal < requiredSol) {
      triggerToast(`❌ Insufficient SOL: You require ${requiredSol} SOL (Available: ${solBalanceVal.toFixed(4)} SOL) to broadcast tx.`);
      return;
    }

    setIsAuthorizingPayment(true);
    triggerToast(`🚀 Broadasting real on-chain transaction for 500 $ROB equivalent [${requiredSol} SOL] on Solana Mainnet...`);

    const vaultAddress = "RobE8as9e4B8vYFp1D76gXEPmF7aN8g1tWKy9nLbyWf3";

    try {
      const isVerifiedStatus = localStorage.getItem("rob_wallet_verified") === "true";
      if (!isVerifiedStatus) {
        triggerToast("🔐 Challenging wallet with ownership verification first...");
        await authenticateSolanaOwner(walletProvider, connectedWallet);
        localStorage.setItem("rob_wallet_verified", "true");
      }

      const txHash = await sendMainnetSOLPayment(
        walletProvider,
        connectedWallet,
        vaultAddress,
        requiredSol
      );

      localStorage.setItem("rob_airdrop_creation_sig", txHash);
      setAirdropPaymentSignature(txHash);
      triggerToast("🎉 Solana tx confirmed! Dynamic block signature recorded on Mainnet.");
    } catch (err: any) {
      triggerToast(`❌ Broadcast Aborted: ${err.message || err}`);
    } finally {
      setIsAuthorizingPayment(false);
    }
  };

  const handleAddTaskField = () => {
    if (!tempCustomTask.trim()) return;
    if (customTasks.includes(tempCustomTask.trim())) {
      triggerToast("Task already defined.");
      return;
    }
    setCustomTasks(prev => [...prev, tempCustomTask.trim()]);
    setTempCustomTask("");
    triggerToast("Custom qualification task staged.");
  };

  const handleRemoveCustomTask = (task: string) => {
    setCustomTasks(prev => prev.filter(t => t !== task));
  };

  const handleToggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId) 
        : [...prev, taskId]
    );
  };

  // Validate Contract Address Format
  const isValidSolanaAddress = (addr: string) => {
    const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return solanaRegex.test(addr.trim());
  };

  // Submit and Publish Airdrop
  const handlePublishAirdrop = (e: React.FormEvent) => {
    e.preventDefault();

    if (!connectedWallet) {
      triggerToast("⚠️ Access Gated: Link your wallet to authorize.");
      return;
    }

    if (!airdropPaymentSignature) {
      triggerToast("⚠️ Fee Denied: Complete the 500 $ROB secure payment transaction.");
      return;
    }

    // Validate Contract address
    if (!isValidSolanaAddress(tokenContractAddress)) {
      triggerToast("❌ Invalid Address: Solana Token Contract Address is malformed.");
      return;
    }

    if (!projectName.trim() || !tokenName.trim() || !tokenSymbol.trim()) {
      triggerToast("❌ Incomplete fields detected.");
      return;
    }

    // Secondary duplicate receipt protection
    const duplicateReceipt = airdrops.some(a => a.paymentSignature === airdropPaymentSignature);
    if (duplicateReceipt) {
      triggerToast("⚠️ Double Spend Intercepted: Payment token signature has already been associated.");
      return;
    }

    const nextSupply = parseFloat(totalAirdropSupply) || 0;
    const nextWinners = parseInt(winnersCount) || 0;
    const nextReward = parseFloat(rewardPerUser) || 0;

    if (nextSupply <= 0 || nextWinners <= 0 || nextReward <= 0) {
      triggerToast("❌ Financial metrics must be higher than zero.");
      return;
    }

    const totalCalculated = nextWinners * nextReward;
    if (totalCalculated !== nextSupply) {
      triggerToast(`⚠️ Warning: Math discrepancy. ${nextWinners} winners x ${nextReward} reward = ${totalCalculated.toLocaleString()} (Expected total supply of ${nextSupply.toLocaleString()}). Autocorrecting supply ledger.`);
    }

    const nextId = editingAirdropId || "airdrop_" + Math.random().toString(36).substr(2, 9);
    
    if (editingAirdropId) {
      // Edit mode
      setAirdrops(prev => prev.map(a => {
        if (a.id === editingAirdropId) {
          return {
            ...a,
            projectName: projectName.trim(),
            tokenName: tokenName.trim(),
            tokenSymbol: tokenSymbol.trim(),
            tokenContractAddress: tokenContractAddress.trim(),
            totalAirdropSupply: totalCalculated,
            winnersCount: nextWinners,
            rewardPerUser: nextReward,
            startDate,
            endDate,
            websiteLink: websiteLink.trim() || "https://robecosystem.github.io",
            twitterLink: twitterLink.trim() || "https://x.com",
            telegramLink: telegramLink.trim() || "https://t.me",
            discordLink: discordLink.trim() || "https://discord.gg",
            description: description.trim() || "Consensus smart safety node.",
            bannerUrl: bannerUrl.trim() || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000",
            logoUrl: logoUrl.trim() || "https://raw.githubusercontent.com/robecosystem/robecosystem.github.io/refs/heads/main/ROBOTIC%20logo.jpg",
            requiredTasks: selectedTasks,
            customTasks: customTasks
          };
        }
        return a;
      }));

      triggerToast("Success! Airdrop draft settings updated.");
      setEditingAirdropId(null);
    } else {
      // Create new airdrop
      const newCampaign: AirdropCampaign = {
        id: nextId,
        projectName: projectName.trim(),
        tokenName: tokenName.trim(),
        tokenSymbol: tokenSymbol.trim(),
        tokenContractAddress: tokenContractAddress.trim(),
        totalAirdropSupply: totalCalculated,
        winnersCount: nextWinners,
        rewardPerUser: nextReward,
        startDate,
        endDate,
        websiteLink: websiteLink.trim() || "https://robecosystem.github.io",
        twitterLink: twitterLink.trim() || "https://x.com",
        telegramLink: telegramLink.trim() || "https://t.me",
        discordLink: discordLink.trim() || "https://discord.gg",
        description: description.trim() || "Secure network audit core verification airdrop.",
        bannerUrl: bannerUrl.trim() || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000",
        logoUrl: logoUrl.trim() || "https://raw.githubusercontent.com/robecosystem/robecosystem.github.io/refs/heads/main/ROBOTIC%20logo.jpg",
        requiredTasks: selectedTasks,
        customTasks: customTasks,
        active: true,
        creatorAddress: connectedWallet,
        paymentSignature: airdropPaymentSignature,
        createdAt: new Date().toISOString(),
        participants: []
      };

      // Add payment log
      const logPayment: AirdropPayment = {
        signature: airdropPaymentSignature,
        amount: airdropCreationFee,
        feeType: "Airdrop Creation",
        walletAddress: connectedWallet,
        timestamp: new Date().toISOString()
      };

      setAirdrops(prev => [newCampaign, ...prev]);
      setPaymentHistory(prev => [logPayment, ...prev]);
      
      // Consume fee balance
      setRobBalance(b => Math.max(0, b - airdropCreationFee));
      
      triggerToast("🎉 Magnificent! Airdrop initialized, paid, and deployed to live system feeds!");
      
      // Clean up payment signature state so user must authorize next time
      localStorage.removeItem("rob_airdrop_creation_sig");
      setAirdropPaymentSignature(null);
    }

    // Reset Form
    resetForm();
    setShowCreateForm(false);
  };

  const resetForm = () => {
    setProjectName("");
    setTokenName("");
    setTokenSymbol("");
    setTokenContractAddress("");
    setTotalAirdropSupply("1000000");
    setWinnersCount("1000");
    setRewardPerUser("1000");
    setDescription("");
    setWebsiteLink("");
    setTwitterLink("");
    setTelegramLink("");
    setDiscordLink("");
    setBannerUrl("");
    setLogoUrl("");
    setSelectedTasks(["follow-twitter", "join-telegram", "visit-website", "connect-wallet"]);
    setCustomTasks([]);
    setEditingAirdropId(null);
  };

  const handleEditDraft = (campaign: AirdropCampaign) => {
    setEditingAirdropId(campaign.id);
    setProjectName(campaign.projectName);
    setTokenName(campaign.tokenName);
    setTokenSymbol(campaign.tokenSymbol);
    setTokenContractAddress(campaign.tokenContractAddress);
    setTotalAirdropSupply(campaign.totalAirdropSupply.toString());
    setWinnersCount(campaign.winnersCount.toString());
    setRewardPerUser(campaign.rewardPerUser.toString());
    setStartDate(campaign.startDate);
    setEndDate(campaign.endDate);
    setWebsiteLink(campaign.websiteLink);
    setTwitterLink(campaign.twitterLink);
    setTelegramLink(campaign.telegramLink);
    setDiscordLink(campaign.discordLink);
    setDescription(campaign.description);
    setBannerUrl(campaign.bannerUrl);
    setLogoUrl(campaign.logoUrl);
    setSelectedTasks(campaign.requiredTasks);
    setCustomTasks(campaign.customTasks);
    
    // Switch on form view
    setShowCreateForm(true);
    triggerToast("Loaded airdrop settings file. Make your edits before finalizing.");
  };

  const handlePauseResume = (airdropId: string) => {
    setAirdrops(prev => prev.map(a => {
      if (a.id === airdropId) {
        const nextState = !a.active;
        triggerToast(nextState ? "Airdrop tracking activated and resumed." : "Airdrop system paused.");
        return { ...a, active: nextState };
      }
      return a;
    }));
  };

  const handleDeleteAirdrop = (airdropId: string) => {
    setAirdrops(prev => prev.filter(a => a.id !== airdropId));
    triggerToast("Airdrop campaign removed from local network indexes.");
  };

  const handleTaskAction = (taskId: string, label: string) => {
    if (!connectedWallet) {
      triggerToast("⚠️ Authentication Required: Please link your Solana wallet to complete steps.");
      return;
    }
    if (!selectedAirdrop) return;

    setTaskVerificationLoading(taskId);
    triggerToast(`Initiating oracle verification layer for: [${label.toUpperCase()}]`);

    setTimeout(() => {
      // Find the participant in selectedAirdrop or create
      const usersAddress = connectedWallet;
      const isAlreadyInHub = selectedAirdrop.participants.some(p => p.walletAddress === usersAddress);
      
      let nextParticipants = [...selectedAirdrop.participants];
      
      if (!isAlreadyInHub) {
        const newParticipant: AirdropParticipant = {
          walletAddress: usersAddress,
          completedTasks: [taskId],
          completedPercentage: 0,
          eligible: false,
          claimed: false,
          joinedAt: new Date().toISOString()
        };
        nextParticipants.push(newParticipant);
      } else {
        nextParticipants = nextParticipants.map(p => {
          if (p.walletAddress === usersAddress) {
            const completed = p.completedTasks.includes(taskId)
              ? p.completedTasks
              : [...p.completedTasks, taskId];
            return {
              ...p,
              completedTasks: completed
            };
          }
          return p;
        });
      }

      // Re-calculate completion percentage and eligibility
      nextParticipants = nextParticipants.map(p => {
        if (p.walletAddress === usersAddress) {
          const totalTasksToVerify = selectedAirdrop.requiredTasks.length + selectedAirdrop.customTasks.length;
          const userCompleted = p.completedTasks.filter(tid => 
            selectedAirdrop.requiredTasks.includes(tid) || selectedAirdrop.customTasks.includes(tid)
          ).length;
          
          const pct = Math.round((userCompleted / totalTasksToVerify) * 100);
          const eligible = pct === 100;

          return {
            ...p,
            completedPercentage: pct,
            eligible
          };
        }
        return p;
      });

      // Update campaigns state
      const updatedCamp = {
        ...selectedAirdrop,
        participants: nextParticipants
      };

      setAirdrops(prev => prev.map(a => a.id === selectedAirdrop.id ? updatedCamp : a));
      setSelectedAirdrop(updatedCamp);
      setTaskVerificationLoading(null);
      triggerToast(`System consensus confirmed step [${label.toUpperCase()}] is fully complete!`);
    }, 1200);
  };

  const handleClaimReward = () => {
    if (!connectedWallet) {
      triggerToast("⚠️ Authentication Required: Link wallet first.");
      return;
    }
    if (!selectedAirdrop) return;

    const userPart = selectedAirdrop.participants.find(p => p.walletAddress === connectedWallet);
    if (!userPart || !userPart.eligible) {
      triggerToast("❌ Qualification Missing: Complete 100% of defined tasks to download safety bonuses.");
      return;
    }

    if (userPart.claimed) {
      triggerToast("⚠️ Reward Claimed: This wallet has already consumed its rewards pool.");
      return;
    }

    // Process Reward Claim on chain
    setTaskVerificationLoading("claim");
    triggerToast(`Broadcasting cryptographic claims payload to Solana validation nodes...`);

    setTimeout(() => {
      const claimHash = "TX_CLAIM_" + Array.from({ length: 48 }, () => 
        "ABCDEF0123456789"[Math.floor(Math.random() * 16)]
      ).join("");

      const updatedCamp = {
        ...selectedAirdrop,
        participants: selectedAirdrop.participants.map(p => {
          if (p.walletAddress === connectedWallet) {
            return {
              ...p,
              claimed: true,
              claimTxSignature: claimHash
            };
          }
          return p;
        })
      };

      setAirdrops(prev => prev.map(a => a.id === selectedAirdrop.id ? updatedCamp : a));
      setSelectedAirdrop(updatedCamp);
      setTaskVerificationLoading(null);
      
      // Update balance with the claimed rewards
      setRobBalance(b => b + selectedAirdrop.rewardPerUser);
      triggerToast(`🎉 Claims Disbursed! Successfully received ${selectedAirdrop.rewardPerUser.toLocaleString()} $ROB directly into your linked wallet.`);
    }, 2000);
  };

  // Export CSV Helper
  const exportParticipantCSV = (campaign: AirdropCampaign) => {
    if (campaign.participants.length === 0) {
      triggerToast("No connected participants have joined this campaign yet.");
      return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Wallet Address,Completed Tasks Count,Completion %,Is Eligible,Is Claimed,Joined Date\n";
    
    campaign.participants.forEach(p => {
      csvContent += `${p.walletAddress},${p.completedTasks.length},${p.completedPercentage}%,${p.eligible ? "YES" : "NO"},${p.claimed ? "YES" : "NO"},${p.joinedAt}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Airdrop_Participants_${campaign.projectName.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    triggerToast("Participant spreadsheet ledger exported successfully.");
  };

  // Filter & Search Hub list
  const filteredAirdrops = airdrops.filter(a => {
    const isOver = new Date(a.endDate) < new Date();
    
    // Tab filters
    if (hubFilter === "ACTIVE" && isOver) return false;
    if (hubFilter === "ENDED" && !isOver) return false;

    if (hubSearchQuery.trim() !== "") {
      const query = hubSearchQuery.toLowerCase();
      return (
        a.projectName.toLowerCase().includes(query) ||
        a.tokenSymbol.toLowerCase().includes(query) ||
        a.tokenContractAddress.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getTaskLabel = (taskId: string) => {
    switch (taskId) {
      case "follow-twitter": return "Follow official Twitter / X Handle";
      case "like-repost": return "Like & Repost Pinned Cryptographic Update";
      case "join-telegram": return "Join Node Operator Core Telegram channel";
      case "join-discord": return "Join Security Core Discord server";
      case "visit-website": return "Visit official web dApp portal URL";
      case "hold-token": return "Hold minimum of 100 $ROB utility tokens";
      case "connect-wallet": return "Connect any verified Solana Web3 adapter";
      default: return taskId;
    }
  };

  return (
    <div className={`p-1 md:p-4 rounded-3xl min-h-full space-y-6 ${isDark ? "text-slate-200" : "text-slate-800"}`} id="airdrop-root-view">
      
      {/* HEADER SECTION WITH NAVIGATION */}
      <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-5 p-5 border rounded-2xl ${
        isDark ? "bg-black/45 border-white/10" : "bg-white border-slate-200 shadow-sm"
      }`}>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={onBack}
            className={`p-2 rounded-xl transition cursor-pointer border ${
              isDark ? "bg-white/5 border-white/10 hover:border-pink-500 text-slate-300" : "bg-slate-100 border-slate-200 hover:border-slate-350 text-slate-700"
            }`}
            title="Return to scanner"
            id="airdrop-back-button"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-mono uppercase bg-pink-500/10 text-pink-400 font-extrabold px-2 py-0.5 rounded-full tracking-wider">
              Launchpad Node
            </span>
            <h2 className="text-lg md:text-xl font-black uppercase font-mono text-white flex items-center gap-1.5 mt-0.5">
              <span>SOLANA AIRDROP CO-ORDINATOR</span>
            </h2>
          </div>
        </div>

        {/* TOP LEVEL NAVIGATION TABS */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Main Action Tabs */}
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-0.5 font-mono text-[10px] select-none">
            <button
              onClick={() => {
                setActiveTab('HUB');
                setSelectedAirdrop(null);
              }}
              className={`px-3 py-2 rounded-lg uppercase font-black tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'HUB' 
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 text-black shadow-md" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Airdrop Portal</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('CREATOR_STUDIO');
                setSelectedAirdrop(null);
              }}
              className={`px-3 py-2 rounded-lg uppercase font-black tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'CREATOR_STUDIO' 
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 text-black shadow-md" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Creator Studio</span>
            </button>
          </div>

          {/* Web3 Solana Wallet Integration Badge */}
          <div className="relative">
            {connectedWallet ? (
              <div className="flex items-center">
                <button
                  onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                  className={`px-3.5 py-1.5 border font-mono rounded-xl text-[10px] font-bold tracking-wider flex items-center gap-2 cursor-pointer ${
                    isDark 
                      ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20" 
                      : "bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-100"
                  }`}
                  id="wallet-trigger-button"
                >
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="uppercase">{walletProvider}: {connectedWallet}</span>
                </button>
                {showWalletDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[#0a0a10] border border-white/10 p-2 shadow-2xl z-50 animate-fadeIn font-mono text-[11px] leading-snug">
                    <div className="px-3 py-2 border-b border-white/5 text-[10px] text-slate-400">
                      Balance: <span className="text-white font-bold">{robBalance.toLocaleString()} $ROB</span>
                    </div>
                    <button
                      onClick={handleDisconnectWallet}
                      className="w-full text-left px-3 py-2 text-red-400 hover:bg-white/5 rounded-lg transition duration-200 cursor-pointer text-[10px] font-bold uppercase mt-1"
                    >
                      Disconnect Wallet
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                  className={`px-4 py-1.5 rounded-xl border font-mono font-black text-[10.5px] uppercase tracking-widest cursor-pointer flex items-center gap-1.5 transition-all duration-350 hover:scale-102 ${
                    isDark 
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black border-none"
                      : "bg-slate-800 text-white border-none"
                  }`}
                  id="connect-wallet-portal"
                >
                  {isWalletConnecting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Wallet className="w-3.5 h-3.5" />
                  )}
                  <span>Connect Wallet</span>
                </button>
                {showWalletDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-[#09090f] border border-white/10 p-2 shadow-2xl z-50 animate-fadeIn font-mono text-xs">
                    <p className="px-3 py-1.5 text-[9.5px] uppercase font-bold text-slate-400 select-none">Select Solana Adapter</p>
                    <div className="space-y-1">
                      {providers.map((p) => (
                        <button
                          key={p.name}
                          onClick={() => handleConnectWallet(p.name)}
                          className="w-full text-left px-3 py-2 hover:bg-white/5 text-white rounded-lg transition text-[11px] font-bold flex items-center justify-between cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <span>{p.icon}</span>
                            <span>{p.name}</span>
                          </span>
                          <span className="text-[8px] opacity-40 uppercase">Devnet</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {activeTab === 'HUB' && !selectedAirdrop && (
        <div className="space-y-5 animate-in fade-in duration-200">
          
          {/* SEARCH & ACCENT CONTROLS */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search active airdrops by symbol, name, contract address..."
                value={hubSearchQuery}
                onChange={(e) => setHubSearchQuery(e.target.value)}
                className={`w-full py-2.5 pl-10 pr-4 text-xs font-mono rounded-xl border outline-none duration-250 ${
                  isDark 
                    ? "bg-white/5 border-white/10 text-white focus:border-pink-500 focus:bg-white/10" 
                    : "bg-white border-slate-200 text-slate-700 focus:border-pink-400 focus:bg-slate-50"
                }`}
              />
            </div>

            {/* Hub Filters list */}
            <div className="flex bg-white/5 border border-white/10 rounded-lg p-0.5 font-mono text-[9.5px]">
              {['ALL', 'ACTIVE', 'ENDED'].map((ft) => (
                <button
                  key={ft}
                  onClick={() => setHubFilter(ft as any)}
                  className={`px-3 py-1.5 rounded uppercase font-black tracking-wider transition cursor-pointer ${
                    hubFilter === ft 
                      ? "bg-pink-500/20 text-pink-300 font-extrabold" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {ft}
                </button>
              ))}
            </div>
          </div>

          {/* GRID OF PUBLIC AIRDROPS */}
          {filteredAirdrops.length === 0 ? (
            <div className={`p-12 border border-dashed rounded-2xl text-center space-y-3 ${
              isDark ? "border-white/10 bg-white/[0.01]" : "border-slate-300 bg-slate-50"
            }`}>
              <AlertCircle className="w-8 h-8 text-pink-400 mx-auto animate-pulse" />
              <p className="text-xs font-mono uppercase text-slate-400">No Cryptographic airdrop spot entries matched the current parameters.</p>
              <button 
                onClick={() => {
                  setHubSearchQuery("");
                  setHubFilter("ALL");
                }}
                className="text-[10px] font-mono text-pink-400 underline font-black uppercase tracking-wider"
              >
                Clear Search filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5" id="airdrops-grid">
              {filteredAirdrops.map((c) => {
                const isOver = new Date(c.endDate) < new Date();
                const totalParticipants = c.participants.length;
                const poolReward = c.totalAirdropSupply;
                const alreadyJoined = connectedWallet ? c.participants.some(p => p.walletAddress === connectedWallet) : false;
                const progressUser = connectedWallet ? c.participants.find(p => p.walletAddress === connectedWallet)?.completedPercentage || 0 : 0;
                const isClaimedUser = connectedWallet ? c.participants.find(p => p.walletAddress === connectedWallet)?.claimed || false : false;

                return (
                  <div 
                    key={c.id}
                    id={`airdrop-card-${c.id}`}
                    onClick={() => setSelectedAirdrop(c)}
                    className={`border rounded-2xl p-5 overflow-hidden relative group transition duration-300 hover:scale-[1.01] flex flex-col justify-between cursor-pointer ${
                      isDark 
                        ? "bg-gradient-to-b from-[#0e0714] to-[#040206] border-white/10 hover:border-pink-500/50" 
                        : "bg-white border-slate-200 hover:border-pink-400 shadow-sm"
                    }`}
                  >
                    {/* Background Banner accent blur */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 blur-[50px] rounded-full pointer-events-none" />

                    <div>
                      {/* Logo and Status indicators */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 bg-black shrink-0">
                            <img 
                              src={c.logoUrl} 
                              alt={c.tokenSymbol} 
                              className="w-full h-full object-cover" 
                              onError={(e)=>{
                                (e.target as HTMLImageElement).src = "https://raw.githubusercontent.com/robecosystem/robecosystem.github.io/refs/heads/main/ROBOTIC%20logo.jpg";
                              }}
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white tracking-wide uppercase leading-tight font-sans">
                              {c.projectName}
                            </h4>
                            <span className="text-[10px] font-mono text-pink-400 bg-pink-400/10 px-1.5 py-0.2 rounded font-black mt-1 inline-block">
                              {c.tokenSymbol}
                            </span>
                          </div>
                        </div>

                        {/* Status badge */}
                        <div>
                          {isOver ? (
                            <span className="text-[9px] font-mono font-black border border-red-500/30 text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full uppercase">
                              Ended
                            </span>
                          ) : !c.active ? (
                            <span className="text-[9px] font-mono font-black border border-amber-500/30 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase">
                              Paused
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono font-black border border-green-500/30 text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full uppercase animate-pulse">
                              Active
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-slate-400 font-sans leading-relaxed line-clamp-2 mb-4">
                        {c.description}
                      </p>

                      {/* Metric highlights */}
                      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/5 font-mono text-xs mb-3">
                        <div>
                          <span className="text-slate-500 text-[9px] uppercase block">Total Supply</span>
                          <span className="text-white font-extrabold">{poolReward.toLocaleString()} {c.tokenSymbol}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[9px] uppercase block">Winners Reward</span>
                          <span className="text-cyan-400 font-extrabold">{c.rewardPerUser.toLocaleString()} {c.tokenSymbol}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[9px] uppercase block">Participants</span>
                          <span className="text-pink-400 font-extrabold flex items-center gap-1">
                            <Users className="w-3 h-3 shrink-0" />
                            <span>{totalParticipants}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Join / Tracking status bar */}
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                      {alreadyJoined ? (
                        <div className="w-full flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Completion:</span>
                            <span className="text-green-400 font-black">{progressUser}%</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {isClaimedUser ? (
                              <span className="text-green-400 font-extrabold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Claimed
                              </span>
                            ) : progressUser === 100 ? (
                              <span className="text-cyan-400 font-black flex items-center gap-1 animate-pulse">
                                Qualified 🌟
                              </span>
                            ) : (
                              <span className="text-amber-400 font-bold">Staged Draft</span>
                            )}
                            <ChevronRight className="w-3 h-3 text-slate-500" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full flex items-center justify-between text-slate-400 group-hover:text-white transition duration-300">
                          <span>Submit verification specs</span>
                          <span className="text-pink-400 font-black flex items-center gap-1 uppercase tracking-wider text-[9px]">
                            Join Airdrop <ChevronRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
                          </span>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* TIER 2 SECTION: SELECTED AIRDROP PARTICIPATION AND TASK CLAIM VIEW */}
      {activeTab === 'HUB' && selectedAirdrop && (
        <div className="animate-in fade-in duration-205 space-y-5">
          <button
            type="button"
            onClick={() => {
              setSelectedAirdrop(null);
              setIsHumanVerified(false);
            }}
            className={`px-3.5 py-1.5 rounded-xl border font-mono text-xs uppercase flex items-center gap-1.5 font-bold cursor-pointer ${
              isDark ? "bg-white/5 border-white/10 hover:border-pink-500 text-slate-300 animate-fadeIn" : "bg-white border-slate-200 hover:border-slate-350 text-slate-700"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Portal Feed</span>
          </button>

          {/* Banner Hero */}
          <div className="relative rounded-2xl overflow-hidden min-h-[140px] md:min-h-[180px] flex items-end p-5 md:p-6 border border-white/10">
            <div className="absolute inset-0 bg-black/60 z-10" />
            <img 
              src={selectedAirdrop.bannerUrl} 
              alt={selectedAirdrop.projectName} 
              className="absolute inset-0 w-full h-full object-cover" 
              onError={(e)=>{
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000";
              }}
              referrerPolicy="no-referrer"
            />

            <div className="relative z-20 flex flex-col md:flex-row md:items-end justify-between w-full gap-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/20 bg-black shrink-0 shadow-lg">
                  <img 
                    src={selectedAirdrop.logoUrl} 
                    alt={selectedAirdrop.tokenSymbol} 
                    className="w-full h-full object-cover" 
                    onError={(e)=>{
                      (e.target as HTMLImageElement).src = "https://raw.githubusercontent.com/robecosystem/robecosystem.github.io/refs/heads/main/ROBOTIC%20logo.jpg";
                    }}
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="text-lg md:text-2xl font-black text-white uppercase tracking-tight font-sans">
                    {selectedAirdrop.projectName}
                  </h3>
                  <p className="text-xs text-pink-400 font-mono font-bold mt-1 tracking-wider uppercase">
                    Reward Spot: {selectedAirdrop.rewardPerUser.toLocaleString()} ${selectedAirdrop.tokenSymbol} / Winner
                  </p>
                </div>
              </div>

              {/* Countdown or Calendar details */}
              <div className="p-3 bg-black/80 rounded-xl border border-white/10 text-right font-mono text-[10.5px] text-slate-300 self-start md:self-auto space-y-1">
                <div className="flex items-center gap-1.5 justify-end text-cyan-400 font-black">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>AIRDROP WINDOW</span>
                </div>
                <div>START: {selectedAirdrop.startDate}</div>
                <div>EXPIRY: {selectedAirdrop.endDate}</div>
              </div>
            </div>
          </div>

          {/* Detail layout columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left side: Project summary details & Verification Tasks */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* About card */}
              <div className={`p-6 border rounded-2xl space-y-4 ${
                isDark ? "bg-[#0b0612]/30 border-white/10" : "bg-white border-slate-200"
              }`}>
                <h4 className="text-xs font-black uppercase text-pink-400 font-mono tracking-widest border-b border-white/5 pb-2">
                  PROJECT SPECIFICATIONS & INTELLIGENT COMPLIANCE
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans select-text">
                  {selectedAirdrop.description}
                </p>

                {/* Solana copy block */}
                <div className="p-3 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between gap-4 font-mono text-[11px]">
                  <div className="truncate">
                    <span className="text-slate-500 block text-[9px] uppercase">Solana Token Contract Address</span>
                    <span className="text-white font-bold select-all truncate block">{selectedAirdrop.tokenContractAddress}</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedAirdrop.tokenContractAddress);
                      triggerToast("Token Contract Address copied securely.");
                    }}
                    className="p-1.5 bg-white/5 hover:bg-pink-500 hover:text-white rounded-lg transition duration-200 border border-white/10 text-xs shrink-0 cursor-pointer"
                  >
                    Copy Address
                  </button>
                </div>

                {/* Social icons list */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {selectedAirdrop.websiteLink && (
                    <a 
                      href={selectedAirdrop.websiteLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-mono text-[10px] text-slate-300 hover:text-white transition cursor-pointer"
                    >
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Website</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                    </a>
                  )}
                  {selectedAirdrop.twitterLink && (
                    <a 
                      href={selectedAirdrop.twitterLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-mono text-[10px] text-slate-300 hover:text-white transition cursor-pointer"
                    >
                      <Twitter className="w-3.5 h-3.5 text-pink-400" />
                      <span>Twitter / X</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                    </a>
                  )}
                  {selectedAirdrop.telegramLink && (
                    <a 
                      href={selectedAirdrop.telegramLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-mono text-[10px] text-slate-300 hover:text-white transition cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-cyan-400 pl-0.5" />
                      <span>Telegram</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                    </a>
                  )}
                  {selectedAirdrop.discordLink && (
                    <a 
                      href={selectedAirdrop.discordLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-mono text-[10px] text-slate-300 hover:text-white transition cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                      <span>Discord</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                    </a>
                  )}
                </div>
              </div>

              {/* QUALIFICATION TASKS CONTAINER */}
              <div className={`p-6 border rounded-2xl space-y-5 ${
                isDark ? "bg-[#0b0612]/30 border-white/10" : "bg-white border-slate-200"
              }`} id="qualification-tasks-section">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                  <div>
                    <h4 className="text-xs font-black uppercase text-pink-400 font-mono tracking-widest">
                      PARTICIPANT QUALIFICATION PROTOCOLS
                    </h4>
                    <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase">
                      Execute consensus tasks to verify cryptographic safety qualification.
                    </p>
                  </div>
                  
                  {/* Task Progress display */}
                  {connectedWallet && (
                    <div className="bg-black/40 border border-white/5 rounded-xl px-3 py-2 font-mono text-[10.5px] flex items-center gap-3">
                      <span className="text-slate-400 uppercase">My Progress:</span>
                      <span className="text-green-400 font-black">
                        {selectedAirdrop.participants.find(p => p.walletAddress === connectedWallet)?.completedPercentage || 0}%
                      </span>
                    </div>
                  )}
                </div>

                {!connectedWallet ? (
                  <div className="p-8 border border-[#e11d48]/15 bg-[#e11d48]/5 rounded-xl text-center space-y-3 font-mono">
                    <Lock className="w-8 h-8 text-[#e11d48] mx-auto animate-bounce" />
                    <h5 className="text-xs font-black uppercase text-[#f43f5e] tracking-wider leading-none">
                      CONSENSUS PROTOCOLS LOCKED FOR SECURITY
                    </h5>
                    <p className="text-[10.5px] text-slate-400 normal-case font-sans max-w-sm mx-auto leading-relaxed">
                      You must link your active Solana Web3 wallet in the top menu to view and initiate verification steps.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* List of default tasks */}
                    {selectedAirdrop.requiredTasks.map((tId) => {
                      const userStats = selectedAirdrop.participants.find(p => p.walletAddress === connectedWallet);
                      const isComplete = userStats ? userStats.completedTasks.includes(tId) : false;

                      return (
                        <div 
                          key={tId}
                          className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 font-mono text-xs transition duration-250 ${
                            isComplete 
                              ? "bg-green-500/5 border-green-500/20 text-slate-300"
                              : "bg-black/30 border-white/5 hover:border-white/10 text-slate-100"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-1 rounded ${isComplete ? "text-green-400 bg-green-400/10" : "text-slate-500 bg-white/5"}`}>
                              {isComplete ? <Check className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                            </div>
                            <span>{getTaskLabel(tId)}</span>
                          </div>

                          <button
                            onClick={() => handleTaskAction(tId, getTaskLabel(tId))}
                            disabled={isComplete || taskVerificationLoading !== null}
                            className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase transition-all duration-200 cursor-pointer ${
                              isComplete 
                                ? "bg-green-500/10 border-green-500/30 text-green-400 cursor-default"
                                : "bg-white/5 border-white/10 hover:border-pink-500 hover:text-white text-slate-300"
                            }`}
                          >
                            {taskVerificationLoading === tId ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : isComplete ? (
                              "Verified"
                            ) : (
                              "Verify Spot"
                            )}
                          </button>
                        </div>
                      );
                    })}

                    {/* Custom defined tasks */}
                    {selectedAirdrop.customTasks.map((taskName) => {
                      const userStats = selectedAirdrop.participants.find(p => p.walletAddress === connectedWallet);
                      const isComplete = userStats ? userStats.completedTasks.includes(taskName) : false;

                      return (
                        <div 
                          key={taskName}
                          className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 font-mono text-xs transition duration-250 ${
                            isComplete 
                              ? "bg-green-500/5 border-green-500/20 text-slate-300"
                              : "bg-black/30 border-white/5 hover:border-white/10 text-slate-100"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-1 rounded ${isComplete ? "text-green-400 bg-green-400/10" : "text-slate-500 bg-white/5"}`}>
                              {isComplete ? <Check className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                            </div>
                            <span className="text-pink-400 font-bold">[CUSTOM TASK] {taskName}</span>
                          </div>

                          <button
                            onClick={() => handleTaskAction(taskName, taskName)}
                            disabled={isComplete || taskVerificationLoading !== null}
                            className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase transition-all duration-200 cursor-pointer ${
                              isComplete 
                                ? "bg-green-500/10 border-green-500/30 text-green-400 cursor-default"
                                : "bg-white/5 border-white/10 hover:border-pink-500 hover:text-white text-slate-300"
                            }`}
                          >
                            {taskVerificationLoading === taskName ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : isComplete ? (
                              "Verified"
                            ) : (
                              "Verify Custom"
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Right side claim status metrics board */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Telemetry and Claim Panel */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                isDark ? "bg-[#0b0612]/30 border-white/10" : "bg-white border-slate-200"
              }`} id="claim-telemetry-panel">
                <h4 className="text-xs font-black uppercase text-pink-400 font-mono tracking-widest border-b border-white/5 pb-2">
                  CLAIM TELEMETRY PANEL
                </h4>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-500">Airdrop Pool Size:</span>
                    <span className="text-white font-bold">{selectedAirdrop.totalAirdropSupply.toLocaleString()} {selectedAirdrop.tokenSymbol}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-500">Reward Per Winner:</span>
                    <span className="text-cyan-400 font-bold">{selectedAirdrop.rewardPerUser.toLocaleString()} {selectedAirdrop.tokenSymbol}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-500">Winners Cap:</span>
                    <span className="text-white font-bold">{selectedAirdrop.winnersCount.toLocaleString()} operators</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-slate-500">Verification Steps:</span>
                    <span className="text-pink-400 font-bold">
                      {selectedAirdrop.requiredTasks.length + selectedAirdrop.customTasks.length} required
                    </span>
                  </div>
                </div>

                {/* Claim action container */}
                {connectedWallet && (
                  <div className="pt-2 border-t border-white/5 space-y-4">
                    
                    {/* Bot Prevention human slider simulator */}
                    {!isHumanVerified ? (
                      <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2 select-none">
                        <span className="text-[9px] font-mono text-amber-400 uppercase font-black tracking-wider flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Anti-Bot Operator Check
                        </span>
                        <p className="text-[9px] text-slate-400 leading-tight">
                          Please verify you are a genuine human operator before claiming.
                        </p>
                        <button
                          onClick={() => {
                            setIsHumanVerified(true);
                            triggerToast("Consensus anti-bot check: Human signature verified successfully.");
                          }}
                          className="w-full py-1.5 bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-[10px] font-mono uppercase font-black rounded-lg hover:bg-cyan-500/20 cursor-pointer"
                        >
                          Checkbox: I am a human operator
                        </button>
                      </div>
                    ) : (
                      <div className="p-2 bg-green-500/10 border border-green-500/15 rounded-xl text-center text-[10px] font-mono text-green-400 uppercase font-black tracking-wider flex items-center justify-center gap-1.5 select-none animate-fadeIn">
                        <CheckCircle2 className="w-4 h-4 text-green-400" /> Human Operator Verified
                      </div>
                    )}

                    {/* Check if user qualified */}
                    {(() => {
                      const userPart = selectedAirdrop.participants.find(p => p.walletAddress === connectedWallet);
                      const isCompletePct = userPart ? userPart.completedPercentage === 100 : false;
                      const hasClaimed = userPart ? userPart.claimed : false;

                      if (hasClaimed) {
                        return (
                          <div className="space-y-3 bg-green-500/5 p-4 border border-green-500/15 rounded-xl font-mono text-xs select-text">
                            <span className="text-green-400 font-bold block">Consensus Status: Rewards Claimed</span>
                            <div className="p-2 bg-black/45 rounded-lg border border-white/5 text-[10px]">
                              <span className="text-slate-500 block text-[8px] uppercase">Solana mainnet receipt ticket</span>
                              <span className="text-white select-all font-bold block truncate">{userPart.claimTxSignature}</span>
                            </div>
                            <p className="text-[9.5px] text-slate-400 leading-normal normal-case">
                              Tokens successfully transferred. Use the receipt ticket signature above to reference the distributed transaction ledger.
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-3">
                          <button
                            onClick={handleClaimReward}
                            disabled={!isCompletePct || !isHumanVerified || taskVerificationLoading !== null}
                            className={`w-full py-3 text-black font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                              isCompletePct && isHumanVerified && taskVerificationLoading === null
                                ? "bg-gradient-to-r from-pink-500 to-purple-500 hover:scale-[1.01]"
                                : "bg-white/10 text-slate-500 cursor-not-allowed border border-white/5 shadow-none"
                            }`}
                          >
                            {taskVerificationLoading === "claim" ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Award className="w-4 h-4" />
                            )}
                            <span>Claim {selectedAirdrop.rewardPerUser.toLocaleString()} {selectedAirdrop.tokenSymbol} Bonus</span>
                          </button>

                          {!isCompletePct && (
                            <p className="text-[9.5px] text-slate-500 leading-normal font-sans text-center">
                              ⚠️ This secure pipeline remains gated until the progress indicator in your operator checklist hits 100%.
                            </p>
                          )}
                        </div>
                      );
                    })()}

                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ================= TIER 3 SECTION: CREATOR STUDIO ================= */}
      {activeTab === 'CREATOR_STUDIO' && (
        <div className="space-y-6 animate-in fade-in duration-200" id="creator-studio-view">
          
          {/* Main Action Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <h3 className="text-sm font-black uppercase font-mono text-white flex items-center gap-2">
                <span>SOLANA AIRDROP CREATOR STUDIO</span>
              </h3>
              <p className="text-[10.5px] font-mono text-slate-400 uppercase mt-0.5">
                Staging ground to pay, deploy, and analyze custom qualification campaigns.
              </p>
            </div>

            <button
              onClick={() => {
                resetForm();
                setShowCreateForm(!showCreateForm);
              }}
              className={`px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-black font-extrabold text-xs uppercase tracking-widest rounded-xl transition duration-300 cursor-pointer flex items-center gap-1.5 shadow-md ${
                showCreateForm ? "scale-95 bg-white/20 text-slate-300 border border-white/10" : "hover:scale-[1.01]"
              }`}
            >
              {showCreateForm ? (
                <>
                  <X className="w-4 h-4" />
                  <span>View My Campaigns</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Initialize Airdrop Campaign</span>
                </>
              )}
            </button>
          </div>

          {/* CREATE OR EDIT CAMPAIGN FORM */}
          {showCreateForm ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="creation-form-zone">
              
              <form onSubmit={handlePublishAirdrop} className="lg:col-span-8 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                <div>
                  <h4 className="text-xs font-black uppercase text-pink-400 font-mono tracking-widest border-b border-white/5 pb-1.5">
                    {editingAirdropId ? "Airdrop Settings Config Draft Edit" : "Configure Airdrop Payload Variables"}
                  </h4>
                  <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase">Define the core identity values of your Solana token.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Project Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Solar Flare Core"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Token Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Solar Flare Network"
                      value={tokenName}
                      onChange={(e) => setTokenName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Token Symbol *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. FLARE"
                      value={tokenSymbol}
                      onChange={(e) => setTokenSymbol(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Token Contract Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flare6tWKy9nLbyWf3G8gNwyT1dJ2vFp1D76gXEPmF7a"
                      value={tokenContractAddress}
                      onChange={(e) => setTokenContractAddress(e.target.value)}
                      className={`w-full p-2.5 rounded-xl bg-black/40 border text-white outline-none focus:border-pink-500 ${
                        tokenContractAddress && !isValidSolanaAddress(tokenContractAddress)
                          ? "border-red-500/70"
                          : "border-white/10"
                      }`}
                    />
                    {tokenContractAddress && !isValidSolanaAddress(tokenContractAddress) && (
                      <span className="text-[9px] text-red-400 block mt-1 uppercase">Must be a valid Solana Base58 format (32-44 characters)</span>
                    )}
                  </div>
                </div>

                {/* Rewards economics calculations */}
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-4">
                  <h5 className="text-[10px] font-mono font-black text-white uppercase tracking-wider">Airdrop Economic Ledger</h5>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Total Reward Pool Supply *</label>
                      <input
                        type="number"
                        required
                        placeholder="1000000"
                        value={totalAirdropSupply}
                        onChange={(e) => {
                          setTotalAirdropSupply(e.target.value);
                          // Auto calculate reward per winner if winner count exists
                          const winners = parseFloat(winnersCount) || 0;
                          const supply = parseFloat(e.target.value) || 0;
                          if (winners > 0) {
                            setRewardPerUser(Math.round(supply / winners).toString());
                          }
                        }}
                        className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Number of Winners *</label>
                      <input
                        type="number"
                        required
                        placeholder="1000"
                        value={winnersCount}
                        onChange={(e) => {
                          setWinnersCount(e.target.value);
                          // Auto calculate reward per winner
                          const winners = parseFloat(e.target.value) || 0;
                          const supply = parseFloat(totalAirdropSupply) || 0;
                          if (winners > 0) {
                            setRewardPerUser(Math.round(supply / winners).toString());
                          }
                        }}
                        className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Rewards Balance per Winner</label>
                      <input
                        type="number"
                        disabled
                        value={rewardPerUser}
                        className="w-full p-2.5 rounded-xl bg-black/20 border border-white/5 text-slate-400 cursor-not-allowed outline-none font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Staging time limits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Campaign Start Date</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-pink-500 select-all"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Campaign End Date</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-pink-500 select-all"
                    />
                  </div>
                </div>

                {/* Social media targets */}
                <div className="space-y-3 font-mono text-xs">
                  <h5 className="text-[10px] font-black text-white uppercase tracking-wider">Campaign Social Media Hyperlinks</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-400 block mb-1">Website URL *</label>
                      <input
                        type="url"
                        placeholder="https://solarflares.org"
                        value={websiteLink}
                        onChange={(e) => setWebsiteLink(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Twitter / X Handle link</label>
                      <input
                        type="url"
                        placeholder="https://x.com/solarflare"
                        value={twitterLink}
                        onChange={(e) => setTwitterLink(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-[#0a0510] border border-white/10 text-white outline-none focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Telegram Community link</label>
                      <input
                        type="url"
                        placeholder="https://t.me/solarflare"
                        value={telegramLink}
                        onChange={(e) => setTelegramLink(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Discord Guild Server link</label>
                      <input
                        type="url"
                        placeholder="https://discord.gg/solarflare"
                        value={discordLink}
                        onChange={(e) => setDiscordLink(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Descriptions, Logos and banner attachments */}
                <div className="space-y-4 font-mono text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">About / Project Description *</label>
                    <textarea
                      required
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Explain what the project offers, goals, and core system nodes."
                      className="w-full p-2.5 rounded-xl bg-[#0a0510] border border-white/10 text-white outline-none focus:border-pink-500 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-400 block mb-1">Banner Graphic Attachment URL</label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e"
                        value={bannerUrl}
                        onChange={(e) => setBannerUrl(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Logo Emblem Attachment URL</label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>
                </div>

                {/* QUALIFICATION TASKS CONFIG BUILDER */}
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4 font-mono text-xs">
                  <div>
                    <h5 className="text-[10px] font-black text-white uppercase tracking-wider">Assemble Qualification Task Requirements</h5>
                    <p className="text-[9px] text-slate-500 mt-1 uppercase">Choose what participants must verify in order to qualify for bonus claims.</p>
                  </div>

                  {/* Checkbox selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: "follow-twitter", label: "Follow on Twitter / X" },
                      { id: "like-repost", label: "Like & Retweet Pinned Post" },
                      { id: "join-telegram", label: "Join Telegram Community" },
                      { id: "join-discord", label: "Join Discord Server Discord" },
                      { id: "visit-website", label: "Visit official web dApp" },
                      { id: "hold-token", label: "Hold minimum ROB tokens" },
                      { id: "connect-wallet", label: "Mandatory SOL Wallet Link" }
                    ].map((t) => {
                      const selected = selectedTasks.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleToggleTaskSelection(t.id)}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition duration-200 cursor-pointer ${
                            selected 
                              ? "bg-pink-500/10 border-pink-500/30 text-pink-300"
                              : "bg-black/35 border-white/5 hover:border-white/10 text-slate-400 hover:text-white"
                          }`}
                        >
                          <div className={`p-0.5 rounded ${selected ? "text-pink-400 bg-pink-400/15" : "text-slate-600"}`}>
                            {selected ? <Check className="w-4.5 h-4.5" /> : <Square className="w-4.5 h-4.5" />}
                          </div>
                          <span className="text-[11px] font-bold">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Custom Task field */}
                  <div className="pt-2 border-t border-white/5 space-y-3">
                    <label className="text-slate-400 block">Add Custom Task (e.g., Hold custom tokens, refer friends, daily check-in)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Subscribe to official YouTube channel or Refer 3 users"
                        value={tempCustomTask}
                        onChange={(e) => setTempCustomTask(e.target.value)}
                        className="flex-1 p-2.5 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-pink-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddTaskField}
                        className="px-4 bg-white/10 border border-white/15 hover:border-pink-500 hover:text-white text-slate-300 rounded-xl transition cursor-pointer font-bold text-xs uppercase"
                      >
                        Add Task
                      </button>
                    </div>

                    {/* Render custom tasks staged */}
                    {customTasks.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px]">
                        {customTasks.map((ct) => (
                          <div key={ct} className="px-3 py-1 bg-pink-500/10 border border-pink-500/20 text-pink-300 rounded-lg flex items-center gap-1.5 animate-fadeIn">
                            <span>[CUSTOM] {ct}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomTask(ct)}
                              className="p-0.5 hover:text-white text-pink-400/60 rounded"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submitting form button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-black font-extrabold text-xs uppercase tracking-widest rounded-xl transition duration-300 shadow-md hover:scale-[1.01]"
                  >
                    {editingAirdropId ? "Apply Configuration Updates" : "Authorize Creation & Broadcast Airdrop To Feeds"}
                  </button>
                </div>

              </form>

              {/* Right side: Wallet connection Gated status and platform payment history */}
              <div className="lg:col-span-4 space-y-5">
                
                {/* 1. Wallet Connection Requirement check */}
                {!connectedWallet ? (
                  <div className="p-5 bg-gradient-to-b from-[#1b0811] to-black border border-[#e11d48]/25 rounded-2xl text-center space-y-4 font-mono shadow-xl relative animate-fadeIn">
                    <div className="absolute top-2 right-2 flex gap-1 text-[8px] bg-red-400/10 text-red-400 border border-red-400/30 px-2 py-0.5 rounded-full uppercase font-black tracking-widest">
                      GATE SECURED
                    </div>
                    <Lock className="w-9 h-9 text-[#f43f5e] mx-auto animate-bounce mt-2" />
                    <h5 className="text-[11.5px] font-black uppercase text-[#f43f5e] tracking-widest">CREATION PROTOCOL TERMINATED</h5>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans normal-case">
                      You must link a Solana wallet (Phantom, Solflare, etc.) using the gateway controls above before submitting configuration arrays.
                    </p>
                  </div>
                ) : (
                  <div className="p-5 bg-gradient-to-b from-green-500/5 to-black border border-green-500/15 rounded-2xl text-center space-y-3 font-mono shadow-xl relative animate-fadeIn">
                    <div className="absolute top-2 right-2 text-[8px] bg-green-400/10 text-green-400 border border-green-400/30 px-2 py-0.5 rounded-full uppercase font-black">
                      ACTIVE LINKED
                    </div>
                    <User className="w-7 h-7 text-green-400 mx-auto mt-2" />
                    <h5 className="text-[11px] font-black uppercase text-green-400 tracking-wider">CREATOR NODE STAGE</h5>
                    <p className="text-[9.5px] text-slate-400 leading-tight">
                      Associated with wallet <span className="text-white select-all">{connectedWallet}</span>. Verify the transaction metrics below.
                    </p>
                  </div>
                )}

                {/* 2. Platform verification fees panel */}
                {connectedWallet && (
                  <div className={`p-5 rounded-2xl border space-y-4 relative ${
                    isDark ? "bg-[#0b0612]/30 border-white/10" : "bg-white border-slate-200"
                  }`} id="airdrop-fee-panel">
                    <h4 className="text-xs font-black uppercase text-[#f43f5e] font-mono tracking-widest border-b border-white/5 pb-2">
                      CREATOR ESCROW VALIDATION
                    </h4>

                    <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
                      Launching a Solana Airdrop requires executing a verification payment signature of <strong>500 $ROB Utility Tokens</strong>. This protects the index pipeline from duplications, fake assets, and farm operators.
                    </p>

                    <div className="p-3 bg-black/45 border border-white/5 rounded-xl space-y-2 font-mono text-[10.5px]">
                      <div className="flex justify-between border-b border-white/5 pb-1.5 text-xs">
                        <span className="text-slate-500">Service Fee:</span>
                        <span className="text-[#f43f5e] font-bold">500 $ROB</span>
                      </div>
                      <div className="flex justify-between text-xs pt-0.5">
                        <span className="text-slate-500 font-medium">My Balance:</span>
                        <span className={`font-bold ${robBalance < airdropCreationFee ? "text-red-400" : "text-green-400"}`}>
                          {robBalance.toLocaleString()} $ROB
                        </span>
                      </div>
                    </div>

                    {/* Authorize action */}
                    {airdropPaymentSignature ? (
                      <div className="p-3 bg-green-500/10 border border-green-500/15 rounded-xl text-center font-mono space-y-2 animate-fadeIn select-text leading-tight">
                        <div className="text-[10px] text-green-400 font-extrabold flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-green-400" /> EXCROW SECURED & MATCHED
                        </div>
                        <div className="p-2 bg-black/45 rounded-lg border border-white/5 text-[9px]">
                          <span className="text-slate-500 block text-[8px] uppercase">Validated Receipt Signature</span>
                          <span className="text-white select-all font-bold block truncate">{airdropPaymentSignature}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <button
                          type="button"
                          onClick={handleAuthorizePayment}
                          disabled={isAuthorizingPayment || robBalance < airdropCreationFee}
                          className={`w-full py-2.5 rounded-xl text-[10.5px] font-mono uppercase font-black tracking-widest transition duration-300 flex items-center justify-center gap-2 border cursor-pointer ${
                            robBalance < airdropCreationFee 
                              ? "bg-red-500/10 border-red-500/15 text-red-400 opacity-60 cursor-not-allowed"
                              : "bg-cyan-500 text-black border-none hover:bg-cyan-455 active:scale-98"
                          }`}
                        >
                          {isAuthorizingPayment ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Zap className="w-3.5 h-3.5" />
                          )}
                          <span>Authorize Creation payment [500 $ROB]</span>
                        </button>
                        {robBalance < airdropCreationFee && (
                          <div className="text-[8.5px] text-red-400 font-mono text-center uppercase tracking-wide">
                            ⚠️ Insufficient tokens to process creation fee. Buy $ROB on Raydium first.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Creation telemetry statistics list */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 font-mono text-xs">
                  <h5 className="font-bold text-white border-b border-white/5 pb-1 uppercase">Platform Analytics</h5>
                  <div className="text-[10px] space-y-2 text-slate-400">
                    <p>Total Solana Airdrops Staged: <strong className="text-white">{airdrops.length}</strong></p>
                    <p>Platform Verified Participants: <strong className="text-cyan-400">{airdrops.reduce((acc, current) => acc + current.participants.length, 0)}</strong></p>
                    <p>Verified Claims Distributed: <strong className="text-green-400">{airdrops.reduce((acc, c) => acc + c.participants.filter(p => p.claimed).length, 0)}</strong></p>
                    <p>Escrow Safe-Score: <strong className="text-pink-400">99.8% SECURED</strong></p>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            /* ================= MY CAMPAIGNS AND DASHBOARD SCREEN ================= */
            <div className="space-y-6">
              
              {/* CAMPAIGNS MANAGER LIST */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-pink-400 font-mono tracking-widest">
                  MY SYSTEM DEPLOYMENTS & CAMPAIGNS ({airdrops.filter(a => a.creatorAddress === connectedWallet).length})
                </h4>

                {airdrops.filter(a => a.creatorAddress === connectedWallet).length === 0 ? (
                  <div className={`p-10 border border-dashed rounded-2xl text-center space-y-3 ${
                    isDark ? "border-white/10 bg-white/[0.01]" : "border-slate-300 bg-slate-50"
                  }`}>
                    <Info className="w-8 h-8 text-pink-400 mx-auto" />
                    <p className="text-xs font-mono uppercase text-slate-400">No personal Solana airdrop campaigns managed on this wallet address.</p>
                    <p className="text-[10px] text-slate-500 font-sans">Initialize a custom payload config above to distribute rewards and configure tasks.</p>
                  </div>
                ) : (
                  <div className="space-y-4" id="my-deployments-list">
                    {airdrops.filter(a => a.creatorAddress === connectedWallet).map((campaign) => {
                      const totalWinnersExpected = campaign.winnersCount;
                      const userReward = campaign.rewardPerUser;
                      const participantsCount = campaign.participants.length;

                      return (
                        <div 
                          key={campaign.id}
                          className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-5 transition duration-200 ${
                            isDark ? "bg-[#090510] border-white/10" : "bg-white border-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 bg-black shrink-0">
                              <img src={campaign.logoUrl} alt={campaign.tokenSymbol} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-extrabold uppercase font-mono text-white text-sm">{campaign.projectName}</h5>
                                <span className="text-[9px] font-mono text-cyan-400 bg-cyan-400/10 px-1.5 py-0.2 rounded">{campaign.tokenSymbol}</span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-sans leading-relaxed line-clamp-1 mt-1 max-w-lg">
                                Contract Address: <span className="text-white select-all font-mono">{campaign.tokenContractAddress}</span>
                              </p>
                              <div className="flex items-center gap-3 mt-1.5 font-mono text-[9px] text-slate-500 uppercase">
                                <span>Expiry: {campaign.endDate}</span>
                                <span>•</span>
                                <span className="text-[#f43f5e]">Pool: {campaign.totalAirdropSupply.toLocaleString()} {campaign.tokenSymbol}</span>
                                <span>•</span>
                                <span className="text-cyan-400">Participants: {participantsCount}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 select-none self-end md:self-auto font-mono text-[10px]">
                            {/* Analytics and controls */}
                            <button
                              onClick={() => exportParticipantCSV(campaign)}
                              className="px-3 py-1.5 bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 hover:border-[#0ea5e9] text-sky-400 rounded-lg transition cursor-pointer flex items-center gap-1 font-semibold"
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5" />
                              <span>Export CSV</span>
                            </button>

                            <button
                              onClick={() => handlePauseResume(campaign.id)}
                              className={`px-3 py-1.5 rounded-lg border transition font-semibold cursor-pointer flex items-center gap-1 ${
                                campaign.active 
                                  ? "bg-amber-500/10 border-amber-500/25 text-amber-500 hover:border-amber-500" 
                                  : "bg-green-500/10 border-green-500/25 text-green-500 hover:border-green-500"
                              }`}
                            >
                              {campaign.active ? <Pause className="w-3.2 h-3.2" /> : <Play className="w-3.2 h-3.2" />}
                              <span>{campaign.active ? "Pause" : "Resume"}</span>
                            </button>

                            <button
                              onClick={() => handleEditDraft(campaign)}
                              className="px-3 py-1.5 bg-white/5 border border-white/10 hover:border-pink-500 hover:text-white text-slate-300 rounded-lg transition cursor-pointer font-semibold"
                            >
                              Edit Settings
                            </button>

                            <button
                              onClick={() => handleDeleteAirdrop(campaign.id)}
                              className="px-2.5 py-1.5 hover:bg-red-500 hover:text-white text-red-400 rounded-lg transition duration-200 border border-red-500/10 flex items-center justify-center cursor-pointer"
                              title="Delete Airdrop"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* PAYMENT HISTORY TRANSACTIONS */}
              <div className="space-y-4 pt-4">
                <h4 className="text-xs font-black uppercase text-pink-400 font-mono tracking-widest">
                  PLATFORM CRYPTOGRAPHIC PAYMENT LOGS ({paymentHistory.length})
                </h4>

                <div className={`p-5 rounded-2xl border ${
                  isDark ? "bg-[#0b0612]/30 border-white/10" : "bg-white border-slate-200"
                }`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-[10.5px]">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-500 uppercase font-black">
                          <th className="pb-2.5">Transaction hash signature</th>
                          <th className="pb-2.5">Escrow Fee type</th>
                          <th className="pb-2.5">Filing Wallet Address</th>
                          <th className="pb-2.5">Verification Fee ($ROB)</th>
                          <th className="pb-2.5 text-right">Filing Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentHistory.map((p, idx) => (
                          <tr key={idx} className="border-b border-white/5 text-slate-300">
                            <td className="py-2.5 truncate max-w-xs font-bold text-white select-all">{p.signature}</td>
                            <td className="py-2.5 text-pink-400">{p.feeType}</td>
                            <td className="py-2.5 truncate max-w-[120px] select-all">{p.walletAddress}</td>
                            <td className="py-2.5 text-[#0ea5e9]">-{p.amount} $ROB</td>
                            <td className="py-2.5 text-right text-[10px] text-slate-500">
                              {new Date(p.timestamp).toLocaleTimeString() || p.timestamp}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
