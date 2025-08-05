export interface TradingViewData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  volume: number;
  timestamp: Date;
}

class TradingViewService {
  private subscriptions: Map<string, Set<(data: TradingViewData) => void>> = new Map();
  private priceCache: Map<string, TradingViewData> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startPriceUpdates();
  }

  async getRealTimePrice(symbol: string): Promise<TradingViewData | null> {
    try {
      // Simulate real TradingView API call
      const basePrice = this.getBasePrice(symbol);
      const volatility = this.getVolatility(symbol);
      
      // Generate realistic price data
      const data: TradingViewData = {
        symbol,
        price: basePrice + (Math.random() - 0.5) * volatility,
        change: (Math.random() - 0.5) * volatility * 2,
        changePercent: (Math.random() - 0.5) * 2,
        high: basePrice + Math.random() * volatility,
        low: basePrice - Math.random() * volatility,
        open: basePrice + (Math.random() - 0.5) * volatility * 0.5,
        volume: Math.floor(Math.random() * 1000000) + 100000,
        timestamp: new Date(),
      };

      this.priceCache.set(symbol, data);
      return data;
    } catch (error) {
      console.error('Failed to fetch real-time price:', error);
      return null;
    }
  }

  subscribeToPrice(symbol: string, callback: (data: TradingViewData) => void): () => void {
    if (!this.subscriptions.has(symbol)) {
      this.subscriptions.set(symbol, new Set());
    }
    
    this.subscriptions.get(symbol)!.add(callback);
    
    // Send initial data if cached
    const cachedData = this.priceCache.get(symbol);
    if (cachedData) {
      callback(cachedData);
    } else {
      // Fetch initial data
      this.getRealTimePrice(symbol).then(data => {
        if (data) {
          callback(data);
        }
      });
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscriptions.get(symbol);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscriptions.delete(symbol);
        }
      }
    };
  }

  private startPriceUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.subscriptions.forEach((callbacks, symbol) => {
        if (callbacks.size > 0) {
          this.getRealTimePrice(symbol).then(data => {
            if (data) {
              callbacks.forEach(callback => {
                try {
                  callback(data);
                } catch (error) {
                  console.error('Callback error:', error);
                }
              });
            }
          });
        }
      });
    }, 2000); // Update every 2 seconds
  }

  private getBasePrice(symbol: string): number {
    const basePrices: { [key: string]: number } = {
      // Forex Major Pairs
      'EURUSD': 1.08500,
      'GBPUSD': 1.27000,
      'USDJPY': 148.500,
      'AUDUSD': 0.66500,
      'USDCAD': 1.36000,
      'USDCHF': 0.87500,
      'NZDUSD': 0.61500,
      
      // Forex Minor Pairs
      'EURGBP': 0.85300,
      'EURJPY': 161.200,
      'GBPJPY': 188.500,
      
      // Crypto
      'BTCUSD': 43250.00,
      'ETHUSD': 2650.00,
      'ADAUSD': 0.48500,
      'SOLUSD': 98.500,
      'DOTUSD': 6.8500,
      
      // Stocks
      'AAPL': 195.50,
      'GOOGL': 142.80,
      'MSFT': 415.20,
      'TSLA': 248.50,
      'AMZN': 155.80,
      'NVDA': 875.60,
      
      // Indices
      'SPX500': 4750.20,
      'NAS100': 16850.40,
      'US30': 37250.80,
      'GER40': 16980.50,
      'UK100': 7650.30,
      
      // Commodities
      'XAUUSD': 2035.50, // Gold
      'XAGUSD': 23.850,  // Silver
      'USOIL': 72.500,   // WTI Crude Oil
      'UKOIL': 78.200,   // Brent Crude Oil
    };

    return basePrices[symbol] || (Math.random() * 100 + 1);
  }

  private getVolatility(symbol: string): number {
    const volatilities: { [key: string]: number } = {
      // Forex - low volatility
      'EURUSD': 0.003,
      'GBPUSD': 0.004,
      'USDJPY': 0.8,
      'AUDUSD': 0.003,
      'USDCAD': 0.003,
      
      // Crypto - high volatility
      'BTCUSD': 1500,
      'ETHUSD': 80,
      'ADAUSD': 0.03,
      'SOLUSD': 8,
      
      // Stocks - medium volatility
      'AAPL': 5,
      'GOOGL': 4,
      'MSFT': 8,
      'TSLA': 15,
      'NVDA': 25,
      
      // Indices - low to medium volatility
      'SPX500': 25,
      'NAS100': 80,
      'US30': 180,
      
      // Commodities - medium volatility
      'XAUUSD': 15,
      'XAGUSD': 0.8,
      'USOIL': 2.5,
    };

    return volatilities[symbol] || 1;
  }

  cleanup(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.subscriptions.clear();
    this.priceCache.clear();
  }
}

export const tradingViewService = new TradingViewService();

// Utility function to convert our symbols to TradingView format
export function getTradingViewSymbol(symbol: string): string {
  const symbolMappings: { [key: string]: string } = {
    'EURUSD': 'FX:EURUSD',
    'GBPUSD': 'FX:GBPUSD',
    'USDJPY': 'FX:USDJPY',
    'AUDUSD': 'FX:AUDUSD',
    'USDCAD': 'FX:USDCAD',
    'BTCUSD': 'BINANCE:BTCUSDT',
    'ETHUSD': 'BINANCE:ETHUSDT',
    'AAPL': 'NASDAQ:AAPL',
    'GOOGL': 'NASDAQ:GOOGL',
    'MSFT': 'NASDAQ:MSFT',
    'TSLA': 'NASDAQ:TSLA',
    'SPX500': 'SP:SPX',
    'XAUUSD': 'TVC:GOLD',
  };

  return symbolMappings[symbol] || `FX:${symbol}`;
}