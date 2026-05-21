import fs from "fs";
import path from "path";

export interface AuditRecord {
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
}

const DB_PATH = path.join(process.cwd(), "server", "saved_audits.json");

// Default bootstrap records for verification logs
const DEFAULT_RECORDS: AuditRecord[] = [
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
];

export function getAudits(): AuditRecord[] {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_RECORDS, null, 2), "utf-8");
      return DEFAULT_RECORDS;
    }
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to read audits database. Fallback to defaults:", error);
    return DEFAULT_RECORDS;
  }
}

export function saveAudit(record: AuditRecord): boolean {
  try {
    const records = getAudits();
    const index = records.findIndex(r => r.id === record.id || (r.contractAddress.toLowerCase() === record.contractAddress.toLowerCase() && r.chain.toLowerCase() === record.chain.toLowerCase()));
    
    if (index !== -1) {
      records[index] = record;
    } else {
      records.unshift(record);
    }

    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(records, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Failed to save audit record to JSON database file:", error);
    return false;
  }
}

export function findAuditById(id: string): AuditRecord | null {
  try {
    const records = getAudits();
    const match = records.find(r => r.id.toLowerCase() === id.toLowerCase());
    return match || null;
  } catch (error) {
    console.error("Error seeking audit by ID:", error);
    return null;
  }
}

export function findAuditByAddress(address: string): AuditRecord | null {
  try {
    const records = getAudits();
    const match = records.find(r => r.contractAddress.toLowerCase() === address.toLowerCase());
    return match || null;
  } catch (error) {
    console.error("Error seeking audit by contract address:", error);
    return null;
  }
}
