import { EventEmitter } from 'events';

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

class TradingViewService extends EventEmitter {
  private subscriptions: Map<string, NodeJS.Timeout> = new Map();
  private priceData: Map<string, TradingViewData> = new Map();

  subscribeToPrice(symbol: string, callback: (data: TradingViewData) => void): () => void {
    // Clean up existing subscription
    this.unsubscribeFromPrice(symbol);

    // Generate initial price data
    const basePrice = this.getBasePriceForSymbol(symbol);
    let currentPrice = basePrice;

    const generatePriceUpdate = () => {
      // Simulate realistic price movement
      const volatility = this.getVolatilityForSymbol(symbol);
      const change = (Math.random() - 0.5) * volatility;
      currentPrice += change;

      // Ensure price doesn't go negative
      currentPrice = Math.max(currentPrice, 0.0001);

      const data: TradingViewData = {
        symbol,
        price: currentPrice,
        change: currentPrice - basePrice,
        changePercent: ((currentPrice - basePrice) / basePrice) * 100,
        volume: Math.floor(Math.random() * 1000000) + 100000,
        high: currentPrice * (1 + Math.random() * 0.001),
        low: currentPrice * (1 - Math.random() * 0.001),
        open: basePrice,
        close: currentPrice,
        timestamp: new Date(),
      };

      this.priceData.set(symbol, data);
      callback(data);
    };

    // Initial call
    generatePriceUpdate();

    // Set up interval for updates
    const interval = setInterval(generatePriceUpdate, 2000 + Math.random() * 3000);
    this.subscriptions.set(symbol, interval);

    // Return unsubscribe function
    return () => this.unsubscribeFromPrice(symbol);
  }

  unsubscribeFromPrice(symbol: string): void {
    const interval = this.subscriptions.get(symbol);
    if (interval) {
      clearInterval(interval);
      this.subscriptions.delete(symbol);
    }
  }

  async getRealTimePrice(symbol: string): Promise<TradingViewData | null> {
    const cached = this.priceData.get(symbol);
    if (cached && Date.now() - cached.timestamp.getTime() < 10000) {
      return cached;
    }

    // Generate fresh data
    const basePrice = this.getBasePriceForSymbol(symbol);
    const data: TradingViewData = {
      symbol,
      price: basePrice,
      change: 0,
      changePercent: 0,
      volume: Math.floor(Math.random() * 1000000) + 100000,
      high: basePrice * 1.001,
      low: basePrice * 0.999,
      open: basePrice,
      close: basePrice,
      timestamp: new Date(),
    };

    this.priceData.set(symbol, data);
    return data;
  }

  private getBasePriceForSymbol(symbol: string): number {
    const basePrices: { [key: string]: number } = {
      'EURUSD': 1.08500,
      'GBPUSD': 1.27000,
      'USDJPY': 148.500,
      'AUDUSD': 0.66500,
      'USDCAD': 1.36000,
      'USDCHF': 0.87500,
      'NZDUSD': 0.61500,
      'EURGBP': 0.85400,
      'EURJPY': 161.200,
      'GBPJPY': 188.400,
    };
    
    return basePrices[symbol] || (Math.random() * 100 + 1);
  }

  private getVolatilityForSymbol(symbol: string): number {
    const volatilities: { [key: string]: number } = {
      'EURUSD': 0.0001,
      'GBPUSD': 0.00015,
      'USDJPY': 0.01,
      'AUDUSD': 0.0001,
      'USDCAD': 0.0001,
      'USDCHF': 0.0001,
      'NZDUSD': 0.0001,
    };
    
    return volatilities[symbol] || 0.0001;
  }

  cleanup(): void {
    this.subscriptions.forEach((interval) => clearInterval(interval));
    this.subscriptions.clear();
    this.priceData.clear();
  }
}

export const tradingViewService = new TradingViewService();