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
  timestamp: Date;
}

export interface ChartData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

class TradingViewService extends EventEmitter {
  private subscriptions: Map<string, any> = new Map();
  private marketData: Map<string, TradingViewData> = new Map();
  private priceIntervals: Map<string, NodeJS.Timeout> = new Map();
  private initialized: boolean = false;

  constructor() {
    super();
    console.log('TradingViewService initialized');
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('TradingViewService: Initializing...');
      
      // Initialize base market data
      this.initializeMarketData();
      this.initialized = true;
      
      console.log('TradingViewService: Initialized successfully');
      return true;
    } catch (error) {
      console.error('TradingViewService: Initialization failed:', error);
      return false;
    }
  }

  private initializeMarketData() {
    const symbols = [
      { name: 'EURUSD', basePrice: 1.0850 },
      { name: 'GBPUSD', basePrice: 1.2650 },
      { name: 'USDJPY', basePrice: 149.50 },
      { name: 'AUDUSD', basePrice: 0.6750 },
      { name: 'USDCAD', basePrice: 1.3650 },
      { name: 'USDCHF', basePrice: 0.8920 },
      { name: 'NZDUSD', basePrice: 0.6150 },
      { name: 'EURJPY', basePrice: 162.30 },
    ];

    symbols.forEach(({ name, basePrice }) => {
      const initialData = this.generateMarketData(name, basePrice);
      this.marketData.set(name, initialData);
      this.emit('price_update', initialData);
    });
  }

  private generateMarketData(symbol: string, basePrice: number): TradingViewData {
    const variation = (Math.random() - 0.5) * 0.02; // 2% max variation
    const currentPrice = basePrice * (1 + variation);
    const change = currentPrice - basePrice;
    const changePercent = (change / basePrice) * 100;

    const high = currentPrice * (1 + Math.random() * 0.005);
    const low = currentPrice * (1 - Math.random() * 0.005);
    const open = basePrice * (1 + (Math.random() - 0.5) * 0.01);

    return {
      symbol,
      price: Number(currentPrice.toFixed(symbol.includes('JPY') ? 3 : 5)),
      change: Number(change.toFixed(symbol.includes('JPY') ? 3 : 5)),
      changePercent: Number(changePercent.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000),
      high: Number(high.toFixed(symbol.includes('JPY') ? 3 : 5)),
      low: Number(low.toFixed(symbol.includes('JPY') ? 3 : 5)),
      open: Number(open.toFixed(symbol.includes('JPY') ? 3 : 5)),
      timestamp: new Date(),
    };
  }

  async getRealTimePrice(symbol: string): Promise<TradingViewData | null> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      return this.marketData.get(symbol) || null;
    } catch (error) {
      console.error(`Error getting real-time price for ${symbol}:`, error);
      return null;
    }
  }

  subscribeToPrice(symbol: string, callback: (data: TradingViewData) => void): () => void {
    console.log(`TradingViewService: Subscribing to ${symbol}`);

    // Clear existing interval if any
    const existingInterval = this.priceIntervals.get(symbol);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Create new price update interval
    const interval = setInterval(() => {
      const currentData = this.marketData.get(symbol);
      if (currentData) {
        const updatedData = this.generateMarketData(symbol, currentData.price);
        this.marketData.set(symbol, updatedData);
        callback(updatedData);
        this.emit('price_update', updatedData);
      }
    }, 3000); // Update every 3 seconds

    this.priceIntervals.set(symbol, interval);

    // Return unsubscribe function
    return () => {
      console.log(`TradingViewService: Unsubscribing from ${symbol}`);
      const interval = this.priceIntervals.get(symbol);
      if (interval) {
        clearInterval(interval);
        this.priceIntervals.delete(symbol);
      }
    };
  }

  async getChartData(symbol: string, timeframe: string = '1H'): Promise<ChartData[]> {
    try {
      console.log(`TradingViewService: Getting chart data for ${symbol} (${timeframe})`);

      const currentData = await this.getRealTimePrice(symbol);
      if (!currentData) {
        throw new Error(`No data available for ${symbol}`);
      }

      // Generate mock historical data
      const chartData: ChartData[] = [];
      const now = new Date();
      const intervals = 50; // Number of data points

      for (let i = intervals; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000); // Hourly data
        const basePrice = currentData.price * (1 + (Math.random() - 0.5) * 0.03);
        const volatility = 0.005;

        const open = basePrice * (1 + (Math.random() - 0.5) * volatility);
        const close = open * (1 + (Math.random() - 0.5) * volatility);
        const high = Math.max(open, close) * (1 + Math.random() * volatility);
        const low = Math.min(open, close) * (1 - Math.random() * volatility);
        const volume = Math.floor(Math.random() * 100000);

        chartData.push({
          time: time.toISOString(),
          open: Number(open.toFixed(symbol.includes('JPY') ? 3 : 5)),
          high: Number(high.toFixed(symbol.includes('JPY') ? 3 : 5)),
          low: Number(low.toFixed(symbol.includes('JPY') ? 3 : 5)),
          close: Number(close.toFixed(symbol.includes('JPY') ? 3 : 5)),
          volume,
        });
      }

      return chartData;
    } catch (error) {
      console.error(`Error getting chart data for ${symbol}:`, error);
      return [];
    }
  }

  getAvailableSymbols(): string[] {
    return Array.from(this.marketData.keys());
  }

  cleanup() {
    console.log('TradingViewService: Cleaning up...');
    
    // Clear all intervals
    this.priceIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.priceIntervals.clear();

    // Clear subscriptions
    this.subscriptions.clear();
    this.marketData.clear();
    
    // Remove all listeners
    this.removeAllListeners();
    
    this.initialized = false;
  }
}

export const tradingViewService = new TradingViewService();
export default tradingViewService;