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
  private subscriptions: Map<string, (() => void)[]> = new Map();
  private priceData: Map<string, TradingViewData> = new Map();
  private updateIntervals: Map<string, NodeJS.Timeout> = new Map();

  subscribeToPrice(symbol: string, callback: (data: TradingViewData) => void): () => void {
    // Initialize subscription list for symbol if not exists
    if (!this.subscriptions.has(symbol)) {
      this.subscriptions.set(symbol, []);
      this.startPriceUpdates(symbol);
    }

    const callbacks = this.subscriptions.get(symbol)!;
    callbacks.push(callback);

    // Send initial data if available
    const existingData = this.priceData.get(symbol);
    if (existingData) {
      callback(existingData);
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscriptions.get(symbol);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
        
        // If no more subscribers, stop updates
        if (callbacks.length === 0) {
          this.stopPriceUpdates(symbol);
          this.subscriptions.delete(symbol);
          this.priceData.delete(symbol);
        }
      }
    };
  }

  async getRealTimePrice(symbol: string): Promise<TradingViewData | null> {
    // Return cached data or generate new data
    let data = this.priceData.get(symbol);
    
    if (!data) {
      data = this.generatePriceData(symbol);
      this.priceData.set(symbol, data);
    }
    
    return data;
  }

  private startPriceUpdates(symbol: string): void {
    // Generate initial data
    const initialData = this.generatePriceData(symbol);
    this.priceData.set(symbol, initialData);

    // Start periodic updates
    const interval = setInterval(() => {
      const currentData = this.priceData.get(symbol);
      if (currentData) {
        const updatedData = this.updatePriceData(currentData);
        this.priceData.set(symbol, updatedData);
        
        // Notify all subscribers
        const callbacks = this.subscriptions.get(symbol);
        if (callbacks) {
          callbacks.forEach(callback => callback(updatedData));
        }
      }
    }, 2000); // Update every 2 seconds

    this.updateIntervals.set(symbol, interval);
  }

  private stopPriceUpdates(symbol: string): void {
    const interval = this.updateIntervals.get(symbol);
    if (interval) {
      clearInterval(interval);
      this.updateIntervals.delete(symbol);
    }
  }

  private generatePriceData(symbol: string): TradingViewData {
    const basePrices: { [key: string]: number } = {
      'EURUSD': 1.08500,
      'GBPUSD': 1.27000,
      'USDJPY': 148.500,
      'AUDUSD': 0.66500,
      'USDCAD': 1.36000,
      'USDCHF': 0.87500,
      'NZDUSD': 0.61500,
      'EURGBP': 0.85400,
      'EURJPY': 161.000,
      'GBPJPY': 188.500,
      'XAUUSD': 2045.50,
      'XAGUSD': 24.85,
      'BTCUSD': 43250.00,
      'ETHUSD': 2380.50,
      'SPX500': 4450.00,
      'NAS100': 15200.00,
      'AAPL': 195.50,
      'GOOGL': 142.80,
      'MSFT': 380.75,
      'TSLA': 248.50,
    };

    const basePrice = basePrices[symbol] || (Math.random() * 100 + 50);
    const volatility = this.getVolatility(symbol);
    
    // Generate daily price action
    const openPrice = basePrice + (Math.random() - 0.5) * volatility;
    const currentPrice = openPrice + (Math.random() - 0.5) * volatility;
    const high = Math.max(openPrice, currentPrice) + Math.random() * volatility * 0.5;
    const low = Math.min(openPrice, currentPrice) - Math.random() * volatility * 0.5;
    
    const change = currentPrice - openPrice;
    const changePercent = (change / openPrice) * 100;

    return {
      symbol,
      price: currentPrice,
      change,
      changePercent,
      high,
      low,
      open: openPrice,
      volume: Math.floor(Math.random() * 1000000 + 100000),
      timestamp: new Date(),
    };
  }

  private updatePriceData(currentData: TradingViewData): TradingViewData {
    const volatility = this.getVolatility(currentData.symbol);
    const maxMove = volatility * 0.1; // Limit movement per update
    
    // Generate realistic price movement
    const priceMove = (Math.random() - 0.48) * maxMove; // Slight upward bias
    const newPrice = Math.max(0.01, currentData.price + priceMove);
    
    // Update high/low if necessary
    const newHigh = Math.max(currentData.high, newPrice);
    const newLow = Math.min(currentData.low, newPrice);
    
    // Recalculate change from open
    const change = newPrice - currentData.open;
    const changePercent = (change / currentData.open) * 100;
    
    // Update volume incrementally
    const volumeIncrease = Math.floor(Math.random() * 10000);

    return {
      ...currentData,
      price: newPrice,
      change,
      changePercent,
      high: newHigh,
      low: newLow,
      volume: currentData.volume + volumeIncrease,
      timestamp: new Date(),
    };
  }

  private getVolatility(symbol: string): number {
    const volatilities: { [key: string]: number } = {
      // Forex pairs (typical daily range in pips)
      'EURUSD': 0.01,
      'GBPUSD': 0.015,
      'USDJPY': 1.5,
      'AUDUSD': 0.012,
      'USDCAD': 0.01,
      'USDCHF': 0.01,
      'NZDUSD': 0.015,
      'EURGBP': 0.008,
      'EURJPY': 1.8,
      'GBPJPY': 2.2,
      
      // Commodities
      'XAUUSD': 25.0,
      'XAGUSD': 1.5,
      
      // Crypto
      'BTCUSD': 2000.0,
      'ETHUSD': 150.0,
      
      // Indices
      'SPX500': 40.0,
      'NAS100': 150.0,
      
      // Stocks
      'AAPL': 5.0,
      'GOOGL': 8.0,
      'MSFT': 7.0,
      'TSLA': 15.0,
    };

    return volatilities[symbol] || 1.0;
  }

  cleanup(): void {
    // Clear all intervals
    this.updateIntervals.forEach(interval => clearInterval(interval));
    this.updateIntervals.clear();
    
    // Clear all subscriptions
    this.subscriptions.clear();
    this.priceData.clear();
  }
}

export const tradingViewService = new TradingViewService();