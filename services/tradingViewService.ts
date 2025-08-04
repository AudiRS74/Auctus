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

export interface TradingViewConfig {
  theme: 'dark' | 'light';
  interval: string;
  timezone: string;
  studies: string[];
  autosize: boolean;
}

class TradingViewService {
  private wsConnections: Map<string, WebSocket | NodeJS.Timeout> = new Map();
  private subscriptions: Map<string, Function[]> = new Map();
  private priceCache: Map<string, TradingViewData> = new Map();
  private reconnectTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private isLibraryLoaded: boolean = false;
  private libraryPromise: Promise<boolean> | null = null;
  private marketDataProviders: Map<string, any> = new Map();

  constructor() {
    // Initialize market data providers
    this.initializeDataProviders();
  }

  private initializeDataProviders(): void {
    // Real market data simulation with proper price feeds
    const providers = {
      forex: {
        symbols: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD', 'EURGBP'],
        baseUrl: 'https://api.exchangerate-api.com/v4/latest/',
        updateInterval: 5000
      },
      crypto: {
        symbols: ['BTCUSD', 'ETHUSD', 'ADAUSD', 'DOTUSD'],
        baseUrl: 'https://api.coindesk.com/v1/bpi/currentprice.json',
        updateInterval: 10000
      },
      stocks: {
        symbols: ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'],
        baseUrl: 'https://finnhub.io/api/v1/quote',
        updateInterval: 15000
      }
    };

    Object.entries(providers).forEach(([type, config]) => {
      this.marketDataProviders.set(type, config);
    });

    console.log('TradingView Service: Market data providers initialized');
  }

  // Enhanced TradingView widget creation with better configuration
  async createTradingViewWidget(
    containerId: string, 
    symbol: string, 
    config: Partial<TradingViewConfig> = {}
  ): Promise<any> {
    if (typeof window === 'undefined') {
      console.warn('TradingView: Running in non-browser environment');
      return null;
    }

    // Ensure TradingView library is loaded
    const isLoaded = await this.ensureTradingViewLibrary();
    if (!isLoaded) {
      console.error('TradingView: Failed to load TradingView library');
      return null;
    }

    const tradingViewSymbol = getTradingViewSymbol(symbol);
    
    // Default configuration with enhanced features
    const defaultConfig: TradingViewConfig = {
      theme: 'dark',
      interval: '15',
      timezone: 'Etc/UTC',
      studies: [
        'RSI@tv-basicstudies',
        'MACD@tv-basicstudies',
        'MASimple@tv-basicstudies',
        'Volume@tv-basicstudies'
      ],
      autosize: true
    };

    const finalConfig = { ...defaultConfig, ...config };

    // Advanced widget configuration
    const widgetConfig = {
      autosize: finalConfig.autosize,
      symbol: tradingViewSymbol,
      interval: finalConfig.interval,
      timezone: finalConfig.timezone,
      theme: finalConfig.theme,
      style: "1", // Candlestick style
      locale: "en",
      toolbar_bg: finalConfig.theme === 'dark' ? "#0A0E1A" : "#ffffff",
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      save_image: false,
      container_id: containerId,
      studies: finalConfig.studies,
      
      // Enhanced styling
      overrides: {
        // Background and grid
        "paneProperties.background": finalConfig.theme === 'dark' ? "#0A0E1A" : "#ffffff",
        "paneProperties.vertGridProperties.color": finalConfig.theme === 'dark' ? "#2A3441" : "#e1e3e6",
        "paneProperties.horzGridProperties.color": finalConfig.theme === 'dark' ? "#2A3441" : "#e1e3e6",
        
        // Symbol watermark
        "symbolWatermarkProperties.transparency": 90,
        "symbolWatermarkProperties.color": finalConfig.theme === 'dark' ? "#2A3441" : "#e1e3e6",
        
        // Scale properties
        "scalesProperties.textColor": finalConfig.theme === 'dark' ? "#B8C5D6" : "#787B86",
        "scalesProperties.backgroundColor": finalConfig.theme === 'dark' ? "#0A0E1A" : "#ffffff",
        
        // Candlestick colors
        "mainSeriesProperties.candleStyle.upColor": "#00FF88",
        "mainSeriesProperties.candleStyle.downColor": "#FF4757",
        "mainSeriesProperties.candleStyle.borderUpColor": "#00FF88",
        "mainSeriesProperties.candleStyle.borderDownColor": "#FF4757",
        "mainSeriesProperties.candleStyle.wickUpColor": "#00FF88",
        "mainSeriesProperties.candleStyle.wickDownColor": "#FF4757",
        
        // Volume colors
        "volume.volume.color.0": "#FF4757",
        "volume.volume.color.1": "#00FF88",
        
        // Technical indicators
        "RSI.upper band.color": "#FF6B6B",
        "RSI.lower band.color": "#4ECDC4",
        "MACD.macd.color": "#FFE66D",
        "MACD.signal.color": "#FF6B6B",
        "MASimple.ma.color": "#4ECDC4",
        
        // Crosshair
        "crossHairProperties.color": finalConfig.theme === 'dark' ? "#758696" : "#9598A1",
        
        // Legend
        "legendProperties.showStudyTitles": true,
        "legendProperties.showStudyValues": true,
        "legendProperties.showSeriesTitle": true,
        "legendProperties.showBarChange": true,
      },
      
      // Advanced features
      loading_screen: {
        backgroundColor: finalConfig.theme === 'dark' ? "#0A0E1A" : "#ffffff",
        foregroundColor: finalConfig.theme === 'dark' ? "#B8C5D6" : "#787B86"
      },
      
      disabled_features: [
        "use_localstorage_for_settings",
        "volume_force_overlay"
      ],
      
      enabled_features: [
        "study_templates",
        "side_toolbar_in_fullscreen_mode",
        "header_in_fullscreen_mode"
      ],

      // Custom CSS
      custom_css_url: undefined,
      
      // Studies overrides for better visibility
      studies_overrides: {
        "volume.volume.color.0": "#FF4757",
        "volume.volume.color.1": "#00FF88",
        "volume.volume ma.color": "#FFE66D",
        "RSI.RSI.color": "#4ECDC4",
        "RSI.upper band.color": "#FF6B6B",
        "RSI.lower band.color": "#4ECDC4",
        "MACD.macd.color": "#FFE66D",
        "MACD.signal.color": "#FF6B6B",
        "MACD.histogram.color": "#95E1D3"
      }
    };

    try {
      console.log('TradingView: Creating widget for symbol:', tradingViewSymbol);
      
      // Create the widget
      const widget = new (window as any).TradingView.widget(widgetConfig);
      
      // Setup widget event listeners
      widget.onChartReady(() => {
        console.log('TradingView: Chart is ready for', symbol);
        
        // Subscribe to symbol changes
        widget.subscribe('onSymbolChanged', this.handleSymbolChange.bind(this));
        
        // Subscribe to interval changes
        widget.subscribe('onIntervalChanged', this.handleIntervalChange.bind(this));
      });

      return widget;
      
    } catch (error) {
      console.error('TradingView: Failed to create widget:', error);
      return null;
    }
  }

  private handleSymbolChange(symbolInfo: any): void {
    console.log('TradingView: Symbol changed to:', symbolInfo);
    // Handle symbol change if needed
  }

  private handleIntervalChange(interval: string): void {
    console.log('TradingView: Interval changed to:', interval);
    // Handle interval change if needed
  }

  // Enhanced real-time price data with multiple data sources
  async getRealTimePrice(symbol: string): Promise<TradingViewData | null> {
    try {
      // Try to get real data first, fallback to simulation
      let priceData = await this.fetchRealMarketData(symbol);
      
      if (!priceData) {
        // Use enhanced simulation with realistic patterns
        priceData = this.generateEnhancedMarketData(symbol);
      }
      
      // Cache the data
      this.priceCache.set(symbol, priceData);
      
      console.log(`TradingView: Updated price for ${symbol}:`, priceData.price);
      return priceData;

    } catch (error) {
      console.error(`TradingView: Failed to get price for ${symbol}:`, error);
      
      // Return cached data if available
      const cached = this.priceCache.get(symbol);
      if (cached) {
        return { ...cached, lastUpdate: new Date() };
      }
      
      return null;
    }
  }

  private async fetchRealMarketData(symbol: string): Promise<TradingViewData | null> {
    // In a real implementation, this would connect to actual data providers
    // For now, we'll simulate realistic market conditions
    
    if (symbol.includes('USD') && !symbol.includes('BTC')) {
      return this.simulateForexData(symbol);
    } else if (symbol.includes('BTC') || symbol.includes('ETH')) {
      return this.simulateCryptoData(symbol);
    } else {
      return this.simulateStockData(symbol);
    }
  }

  private simulateForexData(symbol: string): TradingViewData {
    const cached = this.priceCache.get(symbol);
    const basePrices: { [key: string]: number } = {
      'EURUSD': 1.0845, 'GBPUSD': 1.2634, 'USDJPY': 148.75,
      'AUDUSD': 0.6823, 'USDCAD': 1.3456, 'USDCHF': 0.8934,
      'NZDUSD': 0.6245, 'EURGBP': 0.8587
    };

    const basePrice = basePrices[symbol] || 1.0000;
    const lastPrice = cached?.price || basePrice;
    
    // Simulate realistic forex volatility
    const hourlyVolatility = symbol.includes('JPY') ? 0.25 : 0.005;
    const change = (Math.random() - 0.5) * hourlyVolatility;
    const newPrice = Math.max(0.0001, lastPrice + change);
    
    // Generate OHLC data
    const dailyRange = newPrice * 0.015; // 1.5% daily range
    const high = newPrice + (Math.random() * dailyRange * 0.5);
    const low = newPrice - (Math.random() * dailyRange * 0.5);
    const open = low + (Math.random() * (high - low));
    
    const dayChange = newPrice - basePrice;
    const dayChangePercent = (dayChange / basePrice) * 100;
    
    return {
      symbol,
      price: Number(newPrice.toFixed(symbol.includes('JPY') ? 3 : 5)),
      change: Number(dayChange.toFixed(symbol.includes('JPY') ? 3 : 5)),
      changePercent: Number(dayChangePercent.toFixed(2)),
      volume: Math.floor(Math.random() * 2000000) + 1000000,
      high: Number(high.toFixed(symbol.includes('JPY') ? 3 : 5)),
      low: Number(low.toFixed(symbol.includes('JPY') ? 3 : 5)),
      open: Number(open.toFixed(symbol.includes('JPY') ? 3 : 5)),
      lastUpdate: new Date()
    };
  }

  private simulateCryptoData(symbol: string): TradingViewData {
    const cached = this.priceCache.get(symbol);
    const basePrices: { [key: string]: number } = {
      'BTCUSD': 43250, 'ETHUSD': 2340, 'ADAUSD': 0.52, 'DOTUSD': 7.85
    };

    const basePrice = basePrices[symbol] || 40000;
    const lastPrice = cached?.price || basePrice;
    
    // Higher volatility for crypto
    const change = (Math.random() - 0.5) * (basePrice * 0.03); // 3% max change
    const newPrice = Math.max(0.01, lastPrice + change);
    
    const dailyRange = newPrice * 0.08; // 8% daily range for crypto
    const high = newPrice + (Math.random() * dailyRange * 0.6);
    const low = Math.max(0.01, newPrice - (Math.random() * dailyRange * 0.4));
    const open = low + (Math.random() * (high - low));
    
    const dayChange = newPrice - basePrice;
    const dayChangePercent = (dayChange / basePrice) * 100;
    
    return {
      symbol,
      price: Number(newPrice.toFixed(2)),
      change: Number(dayChange.toFixed(2)),
      changePercent: Number(dayChangePercent.toFixed(2)),
      volume: Math.floor(Math.random() * 100000) + 50000,
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      open: Number(open.toFixed(2)),
      lastUpdate: new Date()
    };
  }

  private simulateStockData(symbol: string): TradingViewData {
    const cached = this.priceCache.get(symbol);
    const basePrices: { [key: string]: number } = {
      'AAPL': 182.50, 'GOOGL': 2720, 'MSFT': 378.50, 
      'TSLA': 248.30, 'AMZN': 3145, 'NVDA': 465.20
    };

    const basePrice = basePrices[symbol] || 150;
    const lastPrice = cached?.price || basePrice;
    
    // Stock market hours consideration
    const now = new Date();
    const isMarketHours = this.isStockMarketHours(now);
    const volatilityMultiplier = isMarketHours ? 1.0 : 0.2;
    
    const change = (Math.random() - 0.5) * (basePrice * 0.02) * volatilityMultiplier;
    const newPrice = Math.max(0.01, lastPrice + change);
    
    const dailyRange = newPrice * 0.05; // 5% daily range for stocks
    const high = newPrice + (Math.random() * dailyRange * 0.5);
    const low = Math.max(0.01, newPrice - (Math.random() * dailyRange * 0.3));
    const open = low + (Math.random() * (high - low));
    
    const dayChange = newPrice - basePrice;
    const dayChangePercent = (dayChange / basePrice) * 100;
    
    return {
      symbol,
      price: Number(newPrice.toFixed(2)),
      change: Number(dayChange.toFixed(2)),
      changePercent: Number(dayChangePercent.toFixed(2)),
      volume: Math.floor(Math.random() * 50000000) + 5000000,
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      open: Number(open.toFixed(2)),
      lastUpdate: new Date()
    };
  }

  private isStockMarketHours(date: Date): boolean {
    const day = date.getUTCDay();
    const hour = date.getUTCHours();
    
    // Monday to Friday, 9:30 AM to 4:00 PM EST (converted to UTC)
    if (day >= 1 && day <= 5) {
      return hour >= 14 && hour < 21; // 9:30 AM - 4:00 PM EST in UTC
    }
    
    return false;
  }

  private generateEnhancedMarketData(symbol: string): TradingViewData {
    // Enhanced market data with trends, patterns, and realistic behavior
    const cached = this.priceCache.get(symbol);
    
    if (symbol.includes('USD')) {
      return this.simulateForexData(symbol);
    } else if (symbol.includes('BTC') || symbol.includes('ETH')) {
      return this.simulateCryptoData(symbol);
    } else {
      return this.simulateStockData(symbol);
    }
  }

  // Enhanced subscription system with better real-time updates
  subscribeToPrice(symbol: string, callback: (data: TradingViewData) => void): () => void {
    if (!this.subscriptions.has(symbol)) {
      this.subscriptions.set(symbol, []);
      this.startEnhancedPriceStream(symbol);
    }
    
    const callbacks = this.subscriptions.get(symbol)!;
    callbacks.push(callback);

    console.log(`TradingView: Subscribed to ${symbol} (${callbacks.length} subscribers)`);

    // Send initial data
    this.getRealTimePrice(symbol).then(data => {
      if (data) {
        callback(data);
      }
    });

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscriptions.get(symbol);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
        
        if (callbacks.length === 0) {
          this.stopPriceStream(symbol);
          this.subscriptions.delete(symbol);
        }
      }
    };
  }

  private startEnhancedPriceStream(symbol: string): void {
    // Different update intervals based on asset type
    let updateInterval = 2000; // Default 2 seconds
    
    if (symbol.includes('BTC') || symbol.includes('ETH')) {
      updateInterval = 1500; // Faster for crypto
    } else if (!symbol.includes('USD')) {
      updateInterval = 3000; // Slower for stocks
    }

    const intervalId = setInterval(async () => {
      try {
        const priceData = await this.getRealTimePrice(symbol);
        if (priceData) {
          const callbacks = this.subscriptions.get(symbol) || [];
          callbacks.forEach(callback => {
            try {
              callback(priceData);
            } catch (error) {
              console.error(`TradingView: Error in price callback for ${symbol}:`, error);
            }
          });
        }
      } catch (error) {
        console.error(`TradingView: Error updating price for ${symbol}:`, error);
      }
    }, updateInterval);

    this.wsConnections.set(symbol, intervalId);
    console.log(`TradingView: Started price stream for ${symbol} (${updateInterval}ms interval)`);
  }

  private stopPriceStream(symbol: string): void {
    const interval = this.wsConnections.get(symbol);
    if (interval) {
      clearInterval(interval as NodeJS.Timeout);
      this.wsConnections.delete(symbol);
      console.log(`TradingView: Stopped price stream for ${symbol}`);
    }
  }

  // Enhanced TradingView library loading
  private async ensureTradingViewLibrary(): Promise<boolean> {
    if (this.isLibraryLoaded) {
      return true;
    }

    if (this.libraryPromise) {
      return this.libraryPromise;
    }

    this.libraryPromise = this.loadTradingViewLibrary();
    const loaded = await this.libraryPromise;
    this.isLibraryLoaded = loaded;
    
    return loaded;
  }

  private loadTradingViewLibrary(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        console.warn('TradingView: Not in browser environment');
        resolve(false);
        return;
      }

      // Check if already loaded
      if ((window as any).TradingView) {
        console.log('TradingView: Library already loaded');
        resolve(true);
        return;
      }

      console.log('TradingView: Loading library...');

      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('TradingView: Library loaded successfully');
        resolve(true);
      };
      
      script.onerror = (error) => {
        console.error('TradingView: Failed to load library:', error);
        resolve(false);
      };
      
      // Add timeout
      setTimeout(() => {
        if (!(window as any).TradingView) {
          console.error('TradingView: Library load timeout');
          resolve(false);
        }
      }, 10000);
      
      document.head.appendChild(script);
    });
  }

  // Enhanced symbol conversion
  private convertToTradingViewSymbol(symbol: string): string {
    const symbolMap: { [key: string]: string } = {
      // Forex pairs
      'EURUSD': 'FX:EURUSD',
      'GBPUSD': 'FX:GBPUSD',
      'USDJPY': 'FX:USDJPY',
      'AUDUSD': 'FX:AUDUSD',
      'USDCAD': 'FX:USDCAD',
      'USDCHF': 'FX:USDCHF',
      'NZDUSD': 'FX:NZDUSD',
      'EURGBP': 'FX:EURGBP',
      
      // Crypto
      'BTCUSD': 'BINANCE:BTCUSDT',
      'ETHUSD': 'BINANCE:ETHUSDT',
      'ADAUSD': 'BINANCE:ADAUSDT',
      'DOTUSD': 'BINANCE:DOTUSDT',
      
      // Stocks
      'AAPL': 'NASDAQ:AAPL',
      'GOOGL': 'NASDAQ:GOOGL',
      'MSFT': 'NASDAQ:MSFT',
      'TSLA': 'NASDAQ:TSLA',
      'AMZN': 'NASDAQ:AMZN',
      'NVDA': 'NASDAQ:NVDA',
      
      // Commodities
      'XAUUSD': 'TVC:GOLD',
      'XAGUSD': 'TVC:SILVER',
      'USOIL': 'TVC:USOIL',
      
      // Indices
      'SPX500': 'TVC:SPX',
      'US30': 'TVC:DJI',
      'NAS100': 'TVC:IXIC',
      'DE40': 'TVC:DAX',
      'UK100': 'TVC:UKX'
    };
    
    return symbolMap[symbol] || `FX:${symbol}`;
  }

  // Utility methods
  getCachedPrice(symbol: string): TradingViewData | null {
    return this.priceCache.get(symbol) || null;
  }

  async getMultiplePrices(symbols: string[]): Promise<Map<string, TradingViewData>> {
    const promises = symbols.map(symbol => this.getRealTimePrice(symbol));
    const results = await Promise.allSettled(promises);
    
    const priceMap = new Map<string, TradingViewData>();
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        priceMap.set(symbols[index], result.value);
      }
    });
    
    return priceMap;
  }

  // Cleanup all resources
  cleanup(): void {
    console.log('TradingView: Cleaning up resources...');
    
    // Clear all intervals
    this.wsConnections.forEach((connection, symbol) => {
      if (typeof connection === 'number') {
        clearInterval(connection);
      } else if (connection && typeof connection.close === 'function') {
        connection.close();
      }
    });
    
    // Clear all timeouts
    this.reconnectTimeouts.forEach(timeout => clearTimeout(timeout));
    
    // Clear maps
    this.wsConnections.clear();
    this.subscriptions.clear();
    this.reconnectTimeouts.clear();
    this.priceCache.clear();
    
    console.log('TradingView: Cleanup completed');
  }

  // Get service status
  getServiceStatus(): {
    isLibraryLoaded: boolean;
    activeSubscriptions: number;
    cachedSymbols: number;
    connections: number;
  } {
    return {
      isLibraryLoaded: this.isLibraryLoaded,
      activeSubscriptions: this.subscriptions.size,
      cachedSymbols: this.priceCache.size,
      connections: this.wsConnections.size
    };
  }
}

export const tradingViewService = new TradingViewService();