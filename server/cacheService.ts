import { FullAnalysisResponse } from "./types";

class CacheService {
  private memoryCache = new Map<string, { data: FullAnalysisResponse; ts: number }>();
  private CACHE_TTL = 3 * 60 * 1000; // 3 minutes cache TTL

  public get(key: string): FullAnalysisResponse | null {
    const entry = this.memoryCache.get(key.toLowerCase());
    if (!entry) return null;
    
    const isExpired = Date.now() - entry.ts > this.CACHE_TTL;
    if (isExpired) {
      this.memoryCache.delete(key.toLowerCase());
      return null;
    }
    return entry.data;
  }

  public set(key: string, data: FullAnalysisResponse): void {
    this.memoryCache.set(key.toLowerCase(), {
      data,
      ts: Date.now()
    });
  }

  public clear(): void {
    this.memoryCache.clear();
  }
}

export const cacheService = new CacheService();
