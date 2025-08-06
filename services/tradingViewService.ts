export interface TradingViewData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
  timestamp: Date;
}

class TradingViewService {
  private subscriptions: Map<string, Set<(data: TradingViewData) => void>> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private basePrice: Map<string, number> = new Map();

  constructor() {
    this.initializeBasePrices();
  }

  private initializeBasePrices() {
    const prices: { [key: string]: number } = {
      'EURUSD': 1.0850,
      'GBPUSD': 1.2650,
      'USDJPY': 149.50,
      'AUDUSD': 0.6750,
      'USDCAD': 1.3650,
      'USDCHF': 0.9150,
      'NZDUSD': 0.6250,
      'EURJPY': 162.25,
      'GBPJPY': 189.15,
      'EURGBP': 0.8580
    };

    Object.entries(prices).forEach(([symbol, price]) => {
      this.basePrice.set(symbol, price);
    });
  }

  async getRealTimePrice(symbol: string): Promise<TradingViewData | null> {
    try {
      console.log(`TradingViewService: Getting price for ${symbol}`);
      
      const basePrice = this.basePrice.get(symbol) || 1.0000;
      const variation = (Math.random() - 0.5) * 0.002;
      const currentPrice = basePrice + variation;
      
      const data: TradingViewData = {
        symbol,
        price: Number(currentPrice.toFixed(5)),
        change: Number(variation.toFixed(5)),
        changePercent: Number((variation / basePrice * 100).toFixed(3)),
        volume: Math.floor(Math.random() * 1000000),
        high: Number((currentPrice + Math.random() * 0.001).toFixed(5)),
        low: Number((currentPrice - Math.random() * 0.001).toFixed(5)),
        open: Number((basePrice + (Math.random() - 0.5) * 0.001).toFixed(5)),
        close: Number(currentPrice.toFixed(5)),
        timestamp: new Date(),
      };

      return data;
    } catch (error) {
      console.error(`TradingViewService: Error getting price for ${symbol}:`, error);
      return null;
    }
  }

  subscribeToPrice(symbol: string, callback: (data: TradingViewData) => void): () => void {
    console.log(`TradingViewService: Subscribing to ${symbol}`);

    if (!this.subscriptions.has(symbol)) {
      this.subscriptions.set(symbol, new Set());
    }

    const callbacks = this.subscriptions.get(symbol)!;
    callbacks.add(callback);

    // Start interval if this is the first subscription for this symbol
    if (callbacks.size === 1) {
      const interval = setInterval(async () => {
        const data = await this.getRealTimePrice(symbol);
        if (data) {
          callbacks.forEach(cb => {
            try {
              cb(data);
            } catch (error) {
              console.error('TradingViewService: Callback error:', error);
            }
          });
        }
      }, 3000); // Update every 3 seconds

      this.intervals.set(symbol, interval);
    }

    // Return unsubscribe function
    return () => {
      callbacks.delete(callback);
      
      // If no more callbacks, clear the interval
      if (callbacks.size === 0) {
        const interval = this.intervals.get(symbol);
        if (interval) {
          clearInterval(interval);
          this.intervals.delete(symbol);
        }
        this.subscriptions.delete(symbol);
      }
    };
  }

  cleanup(): void {
    console.log('TradingViewService: Cleaning up subscriptions');
    
    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    this.subscriptions.clear();
  }
}

export const tradingViewService = new TradingViewService();