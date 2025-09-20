import { crypto } from "crypto"

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>()
  private readonly defaultTTL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

  async generateKey(data: any): Promise<string> {
    const encoder = new TextEncoder()
    const dataString = JSON.stringify(data)
    const dataBuffer = encoder.encode(dataString)

    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

    return hashHex
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now()
    const expiresAt = now + (ttl || this.defaultTTL)

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
    })

    // Clean up expired entries periodically
    this.cleanup()
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)

    if (!entry) {
      return false
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private cleanup(): void {
    const now = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  getStats() {
    const now = Date.now()
    let validEntries = 0
    let expiredEntries = 0

    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expiredEntries++
      } else {
        validEntries++
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
    }
  }
}

// Global cache instance
const globalCache = new MemoryCache()

export interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  prefix?: string // Key prefix for namespacing
}

export class SmartCache {
  private cache: MemoryCache
  private prefix: string

  constructor(prefix = "default") {
    this.cache = globalCache
    this.prefix = prefix
  }

  private async getKey(data: any): Promise<string> {
    const baseKey = await this.cache.generateKey(data)
    return `${this.prefix}:${baseKey}`
  }

  async getOrSet<T>(
    keyData: any,
    fetchFunction: () => Promise<T>,
    options: CacheOptions = {},
  ): Promise<{ data: T; fromCache: boolean }> {
    const key = await this.getKey(keyData)

    // Try to get from cache first
    const cachedData = this.cache.get<T>(key)
    if (cachedData !== null) {
      console.log(`[v0] Cache HIT for key: ${key.substring(0, 16)}...`)
      return { data: cachedData, fromCache: true }
    }

    console.log(`[v0] Cache MISS for key: ${key.substring(0, 16)}...`)

    // Fetch fresh data
    const freshData = await fetchFunction()

    // Store in cache
    this.cache.set(key, freshData, options.ttl)

    return { data: freshData, fromCache: false }
  }

  async set<T>(keyData: any, data: T, options: CacheOptions = {}): Promise<void> {
    const key = await this.getKey(keyData)
    this.cache.set(key, data, options.ttl)
  }

  async get<T>(keyData: any): Promise<T | null> {
    const key = await this.getKey(keyData)
    return this.cache.get<T>(key)
  }

  async has(keyData: any): Promise<boolean> {
    const key = await this.getKey(keyData)
    return this.cache.has(key)
  }

  async delete(keyData: any): Promise<boolean> {
    const key = await this.getKey(keyData)
    return this.cache.delete(key)
  }

  clear(): void {
    // Only clear entries with this prefix
    const keysToDelete: string[] = []

    for (const key of (this.cache as any).cache.keys()) {
      if (key.startsWith(`${this.prefix}:`)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach((key) => (this.cache as any).cache.delete(key))
  }

  getStats() {
    return this.cache.getStats()
  }
}

// Pre-configured cache instances for different use cases
export const searchCache = new SmartCache("google-search")
export const analysisCache = new SmartCache("gpt-analysis")
export const resultsCache = new SmartCache("final-results")

// Cache TTL constants
export const CACHE_TTL = {
  GOOGLE_SEARCH: 24 * 60 * 60 * 1000, // 24 hours
  GPT_ANALYSIS: 12 * 60 * 60 * 1000, // 12 hours
  FINAL_RESULTS: 6 * 60 * 60 * 1000, // 6 hours
  SHORT_TERM: 30 * 60 * 1000, // 30 minutes
} as const
