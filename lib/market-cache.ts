import yahooFinance from 'yahoo-finance2';

// Global cache for market data to prevent rate limits
// Vercel serverless functions are stateless, but they maintain state for the lifetime of a warm instance.
// For Next.js dev server or self-hosted Node.js, this cache works globally.
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL_MS = 10000; // 10 seconds

export async function getMarketQuote(symbol: string) {
  const now = Date.now();
  if (cache[symbol] && now - cache[symbol].timestamp < CACHE_TTL_MS) {
    return cache[symbol].data;
  }

  try {
    const quote = await yahooFinance.quote(symbol);
    cache[symbol] = { data: quote, timestamp: now };
    return quote;
  } catch (error) {
    console.error(`Failed to fetch Yahoo Finance for ${symbol}:`, error);
    // return cached data even if expired if fetch fails
    return cache[symbol]?.data || null;
  }
}

export async function getMarketQuotes(symbols: string[]) {
  const now = Date.now();
  const toFetch: string[] = [];
  const results: Record<string, any> = {};

  for (const sym of symbols) {
    if (cache[sym] && now - cache[sym].timestamp < CACHE_TTL_MS) {
      results[sym] = cache[sym].data;
    } else {
      toFetch.push(sym);
    }
  }

  if (toFetch.length > 0) {
    try {
      const quotes = await yahooFinance.quote(toFetch);
      // quote returns array if multiple symbols requested, or single object if 1 symbol.
      const quotesArray = Array.isArray(quotes) ? quotes : [quotes];
      for (const q of quotesArray) {
        if (q && q.symbol) {
          cache[q.symbol] = { data: q, timestamp: now };
          results[q.symbol] = q;
        }
      }
    } catch (error) {
      console.error(`Failed to fetch Yahoo Finance quotes for ${toFetch.join(',')}:`, error);
      // Fallback to expired cache if available
      for (const sym of toFetch) {
        if (cache[sym]) {
          results[sym] = cache[sym].data;
        }
      }
    }
  }

  return results;
}
