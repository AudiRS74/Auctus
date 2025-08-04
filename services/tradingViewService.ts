import { getTradingViewSymbol } from '../constants/Markets';

export interface TradingViewData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  lastUpdate: Date;
}

export interface TradingViewQuote {
  c: number; // close/current price
  h: number; // high
  l: number; // low  
  o: number; // open
  pc: number; // previous close
  t: number; // timestamp
}

class TradingViewService {
  private wsConnections: Map<string, WebSocket> = new Map();
  private subscriptions: Map<string, Function[]> = new Map();
  private priceCache: Map<string, TradingViewData> = new Map();
  private reconnectTimeouts: Map<string, NodeJS.Timeout> = new Map();

  // Initialize TradingView widget for charts
  createTradingViewWidget(containerId: string, symbol: string, theme: 'dark' | 'light' = 'dark') {
    if (typeof window === 'undefined') return null;

    const tradingViewSymbol = getTradingViewSymbol(symbol);

    // TradingView Widget Configuration
    const widgetConfig = {
      autosize: true,
      symbol: tradingViewSymbol,
      interval: "15",
      timezone: "Etc/UTC",
      theme: theme,
      style: "1",
      locale: "en",
      toolbar_bg: theme === 'dark' ? "#0A0E1A" : "#ffffff",
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      container_id: containerId,
      studies: [
        "RSI@tv-basicstudies",
        "MACD@tv-basicstudies",
        "MASimple@tv-basicstudies"
      ],
      overrides: {
        "paneProperties.background": theme === 'dark' ? "#0A0E1A" : "#ffffff",
        "paneProperties.vertGridProperties.color": theme === 'dark' ? "#2A3441" : "#e1e3e6",
        "paneProperties.horzGridProperties.color": theme === 'dark' ? "#2A3441" : "#e1e3e6",
        "symbolWatermarkProperties.transparency": 90,
        "scalesProperties.textColor": theme === 'dark' ? "#B8C5D6" : "#787B86",
        "mainSeriesProperties.candleStyle.upColor": "#00FF88",
        "mainSeriesProperties.candleStyle.downColor": "#FF4757",
        "mainSeriesProperties.candleStyle.borderUpColor": "#00FF88",
        "mainSeriesProperties.candleStyle.borderDownColor": "#FF4757",
        "mainSeriesProperties.candleStyle.wickUpColor": "#00FF88",
        "mainSeriesProperties.candleStyle.wickDownColor": "#FF4757"
      }
    };

    try {
      // Create TradingView widget
      if ((window as any).TradingView) {
        return new (window as any).TradingView.widget(widgetConfig);
      } else {
        console.warn('TradingView library not loaded');
        return null;
      }
    } catch (error) {
      console.error('Failed to create TradingView widget:', error);
      return null;
    }
  }

  // Get real-time price data using Finnhub API (free tier)
  async getRealTimePrice(symbol: string): Promise<TradingViewData | null> {
    try {
      // Convert symbol to Finnhub format
      const finnhubSymbol = this.convertToFinnhubSymbol(symbol);
      
      // Simulate real-time data for demo purposes
      // In production, you would use actual API calls
      const mockData = this.generateRealisticPrice(symbol);
      
      const tradingData: TradingViewData = {
        symbol,
        price: mockData.price,
        change: mockData.change,
        changePercent: mockData.changePercent,
        volume: mockData.volume,
        high: mockData.high,
        low: mockData.low,
        open: mockData.open,
        lastUpdate: new Date()
      };

      this.priceCache.set(symbol, tradingData);
      return tradingData;

    } catch (error) {
      console.error(`Failed to get price for ${symbol}:`, error);
      return null;
    }
  }

  // Subscribe to real-time price updates
  subscribeToPrice(symbol: string, callback: (data: TradingViewData) => void): () => void {
    if (!this.subscriptions.has(symbol)) {
      this.subscriptions.set(symbol, []);
    }
    
    this.subscriptions.get(symbol)!.push(callback);

    // Start price updates for this symbol
    this.startPriceUpdates(symbol);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscriptions.get(symbol);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
        
        // Stop updates if no more subscribers
        if (callbacks.length === 0) {
          this.stopPriceUpdates(symbol);
        }
      }
    };
  }

  private startPriceUpdates(symbol: string) {
    // Use interval for demo mode real-time simulation
    const updateInterval = setInterval(async () => {
      const priceData = await this.getRealTimePrice(symbol);
      if (priceData) {
        const callbacks = this.subscriptions.get(symbol) || [];
        callbacks.forEach(callback => {
          try {
            callback(priceData);
          } catch (error) {
            console.error('Error in price callback:', error);
          }
        });
      }
    }, 2000); // Update every 2 seconds

    // Store interval for cleanup
    this.wsConnections.set(symbol, updateInterval as any);
  }

  private stopPriceUpdates(symbol: string) {
    const interval = this.wsConnections.get(symbol);
    if (interval) {
      clearInterval(interval as any);
      this.wsConnections.delete(symbol);
    }
  }

  private convertToFinnhubSymbol(symbol: string): string {
    // Convert MT5 symbols to Finnhub format
    const symbolMap: { [key: string]: string } = {
      'EURUSD': 'OANDA:EUR_USD',
      'GBPUSD': 'OANDA:GBP_USD',
      'USDJPY': 'OANDA:USD_JPY',
      'AUDUSD': 'OANDA:AUD_USD',
      'USDCAD': 'OANDA:USD_CAD',
      'USDCHF': 'OANDA:USD_CHF',
      'NZDUSD': 'OANDA:NZD_USD',
      'EURGBP': 'OANDA:EUR_GBP',
      'BTCUSD': 'BINANCE:BTCUSDT',
      'ETHUSD': 'BINANCE:ETHUSDT',
      'AAPL': 'AAPL',
      'GOOGL': 'GOOGL',
      'MSFT': 'MSFT',
      'TSLA': 'TSLA'
    };
    
    return symbolMap[symbol] || symbol;
  }

  private generateRealisticPrice(symbol: string): TradingViewData {
    // Get base prices for different asset types
    const basePrices: { [key: string]: number } = {
      'EURUSD': 1.0845, 'GBPUSD': 1.2634, 'USDJPY': 148.75, 'AUDUSD': 0.6823,
      'USDCAD': 1.3456, 'USDCHF': 0.8934, 'NZDUSD': 0.6245, 'EURGBP': 0.8587,
      'BTCUSD': 43250, 'ETHUSD': 2340, 'AAPL': 182.50, 'GOOGL': 2720,
      'MSFT': 378.50, 'TSLA': 248.30, 'XAUUSD': 2024.50, 'SPX500': 4535.20
    };

    const basePrice = basePrices[symbol] || 1.0000;
    const cached = this.priceCache.get(symbol);
    const lastPrice = cached?.price || basePrice;

    // Generate realistic price movement
    const volatility = this.getVolatility(symbol);
    const change = (Math.random() - 0.5) * volatility;
    const newPrice = Math.max(0.0001, lastPrice + change);

    // Calculate other values
    const dayChange = newPrice - basePrice;
    const dayChangePercent = (dayChange / basePrice) * 100;

    // Generate OHLC data
    const high = Math.max(newPrice, lastPrice) + Math.abs(change * 0.3);
    const low = Math.min(newPrice, lastPrice) - Math.abs(change * 0.3);
    const open = basePrice + (Math.random() - 0.5) * volatility * 0.5;
    
    // Volume varies by asset type
    let volume = 0;
    if (symbol.includes('USD')) {
      volume = Math.floor(Math.random() * 1000000) + 500000; // Forex volume
    } else if (symbol.includes('BTC') || symbol.includes('ETH')) {
      volume = Math.floor(Math.random() * 50000) + 10000; // Crypto volume
    } else {
      volume = Math.floor(Math.random() * 10000000) + 1000000; // Stock volume
    }

    return {
      symbol,
      price: Number(newPrice.toFixed(this.getDecimalPlaces(symbol))),
      change: Number(dayChange.toFixed(this.getDecimalPlaces(symbol))),
      changePercent: Number(dayChangePercent.toFixed(2)),
      volume,
      high: Number(high.toFixed(this.getDecimalPlaces(symbol))),
      low: Number(low.toFixed(this.getDecimalPlaces(symbol))),
      open: Number(open.toFixed(this.getDecimalPlaces(symbol))),
      lastUpdate: new Date()
    };
  }

  private getVolatility(symbol: string): number {
    // Different volatility for different asset classes
    if (symbol.includes('JPY')) return 0.15;
    if (symbol.includes('USD') && !symbol.includes('JPY')) return 0.003;
    if (symbol.includes('BTC')) return 200;
    if (symbol.includes('ETH')) return 15;
    if (symbol.includes('XAU')) return 5;
    return 2; // Default for stocks
  }

  private getDecimalPlaces(symbol: string): number {
    if (symbol.includes('JPY')) return 3;
    if (symbol.includes('USD') && !symbol.includes('JPY')) return 5;
    if (symbol.includes('BTC') || symbol.includes('ETH')) return 2;
    return 2;
  }

  // Load TradingView library
  loadTradingViewLibrary(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(false);
        return;
      }

      if ((window as any).TradingView) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  }

  // Cleanup all connections
  cleanup() {
    this.wsConnections.forEach((connection) => {
      if (typeof connection === 'number') {
        clearInterval(connection);
      } else if (connection && connection.close) {
        connection.close();
      }
    });
    this.wsConnections.clear();
    this.subscriptions.clear();
    this.reconnectTimeouts.forEach(timeout => clearTimeout(timeout));
    this.reconnectTimeouts.clear();
  }

  // Get cached price data
  getCachedPrice(symbol: string): TradingViewData | null {
    return this.priceCache.get(symbol) || null;
  }

  // Get multiple symbols at once
  async getMultiplePrices(symbols: string[]): Promise<Map<string, TradingViewData>> {
    const promises = symbols.map(symbol => this.getRealTimePrice(symbol));
    const results = await Promise.all(promises);
    
    const priceMap = new Map<string, TradingViewData>();
    results.forEach((data, index) => {
      if (data) {
        priceMap.set(symbols[index], data);
      }
    });
    
    return priceMap;
  }
}

export const tradingViewService = new TradingViewService();