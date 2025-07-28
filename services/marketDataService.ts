export interface MarketDataProvider {
  name: string;
  connect(): Promise<boolean>;
  disconnect(): void;
  subscribeToSymbol(symbol: string): Promise<void>;
  unsubscribeFromSymbol(symbol: string): Promise<void>;
  getQuote(symbol: string): Promise<Quote>;
  getHistoricalData(symbol: string, timeframe: string, limit: number): Promise<HistoricalData[]>;
}

export interface Quote {
  symbol: string;
  bid: number;
  ask: number;
  last: number;
  volume: number;
  change: number;
  changePercent: number;
  timestamp: Date;
  provider: string;
}

export interface HistoricalData {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketNews {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  relevantSymbols: string[];
  publishedAt: Date;
}

class AlphaVantageProvider implements MarketDataProvider {
  name = 'Alpha Vantage';
  private apiKey: string;
  private baseUrl = 'https://www.alphavantage.co/query';
  private connected = false;
  private websocket: WebSocket | null = null;
  private subscriptions = new Set<string>();

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async connect(): Promise<boolean> {
    try {
      // Test connection with a simple API call
      const testResponse = await fetch(
        `${this.baseUrl}?function=GLOBAL_QUOTE&symbol=EURUSD&apikey=${this.apiKey}`
      );
      
      if (!testResponse.ok) {
        throw new Error(`HTTP ${testResponse.status}: ${testResponse.statusText}`);
      }

      const data = await testResponse.json();
      
      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }

      if (data['Note']) {
        throw new Error('API call frequency limit reached. Please try again later or upgrade your plan.');
      }

      this.connected = true;
      console.log('Alpha Vantage API connected successfully');
      return true;
    } catch (error) {
      console.error('Alpha Vantage connection failed:', error);
      this.connected = false;
      throw error;
    }
  }

  disconnect(): void {
    this.connected = false;
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    this.subscriptions.clear();
  }

  async subscribeToSymbol(symbol: string): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected to Alpha Vantage');
    }

    this.subscriptions.add(symbol);
    console.log(`Subscribed to ${symbol} via Alpha Vantage`);
  }

  async unsubscribeFromSymbol(symbol: string): Promise<void> {
    this.subscriptions.delete(symbol);
    console.log(`Unsubscribed from ${symbol} via Alpha Vantage`);
  }

  async getQuote(symbol: string): Promise<Quote> {
    if (!this.connected) {
      throw new Error('Not connected to Alpha Vantage');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }

      if (data['Note']) {
        throw new Error('API rate limit exceeded');
      }

      const quote = data['Global Quote'];
      if (!quote) {
        throw new Error('Invalid symbol or no data available');
      }

      const price = parseFloat(quote['05. price']);
      const change = parseFloat(quote['09. change']);
      const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));

      return {
        symbol,
        bid: price - 0.0001, // Simulated spread
        ask: price + 0.0001,
        last: price,
        volume: parseInt(quote['06. volume'] || '0'),
        change,
        changePercent,
        timestamp: new Date(),
        provider: this.name,
      };
    } catch (error) {
      console.error(`Failed to get quote for ${symbol}:`, error);
      throw error;
    }
  }

  async getHistoricalData(symbol: string, timeframe: string, limit: number): Promise<HistoricalData[]> {
    if (!this.connected) {
      throw new Error('Not connected to Alpha Vantage');
    }

    const functionMap: { [key: string]: string } = {
      '1min': 'TIME_SERIES_INTRADAY&interval=1min',
      '5min': 'TIME_SERIES_INTRADAY&interval=5min',
      '15min': 'TIME_SERIES_INTRADAY&interval=15min',
      '30min': 'TIME_SERIES_INTRADAY&interval=30min',
      '60min': 'TIME_SERIES_INTRADAY&interval=60min',
      'daily': 'TIME_SERIES_DAILY',
      'weekly': 'TIME_SERIES_WEEKLY',
      'monthly': 'TIME_SERIES_MONTHLY',
    };

    const functionParam = functionMap[timeframe] || functionMap['daily'];

    try {
      const response = await fetch(
        `${this.baseUrl}?function=${functionParam}&symbol=${symbol}&apikey=${this.apiKey}&outputsize=compact`
      );

      const data = await response.json();

      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }

      const timeSeriesKey = Object.keys(data).find(key => key.includes('Time Series'));
      if (!timeSeriesKey) {
        throw new Error('No time series data found');
      }

      const timeSeries = data[timeSeriesKey];
      const historicalData: HistoricalData[] = [];

      const entries = Object.entries(timeSeries).slice(0, limit);
      for (const [timestamp, values] of entries) {
        const candle = values as any;
        historicalData.push({
          timestamp: new Date(timestamp),
          open: parseFloat(candle['1. open']),
          high: parseFloat(candle['2. high']),
          low: parseFloat(candle['3. low']),
          close: parseFloat(candle['4. close']),
          volume: parseInt(candle['5. volume'] || '0'),
        });
      }

      return historicalData.reverse(); // Return in chronological order
    } catch (error) {
      console.error(`Failed to get historical data for ${symbol}:`, error);
      throw error;
    }
  }
}

class PolygonProvider implements MarketDataProvider {
  name = 'Polygon.io';
  private apiKey: string;
  private baseUrl = 'https://api.polygon.io';
  private connected = false;
  private websocket: WebSocket | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async connect(): Promise<boolean> {
    try {
      // Test connection
      const testResponse = await fetch(
        `${this.baseUrl}/v2/aggs/ticker/C:EURUSD/prev?adjusted=true&apikey=${this.apiKey}`
      );
      
      if (!testResponse.ok) {
        throw new Error(`HTTP ${testResponse.status}: ${testResponse.statusText}`);
      }

      const data = await testResponse.json();
      
      if (data.status === 'ERROR') {
        throw new Error(data.error || 'Polygon API error');
      }

      this.connected = true;
      console.log('Polygon.io connected successfully');
      return true;
    } catch (error) {
      console.error('Polygon connection failed:', error);
      this.connected = false;
      throw error;
    }
  }

  disconnect(): void {
    this.connected = false;
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  async subscribeToSymbol(symbol: string): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected to Polygon');
    }
    console.log(`Subscribed to ${symbol} via Polygon`);
  }

  async unsubscribeFromSymbol(symbol: string): Promise<void> {
    console.log(`Unsubscribed from ${symbol} via Polygon`);
  }

  async getQuote(symbol: string): Promise<Quote> {
    if (!this.connected) {
      throw new Error('Not connected to Polygon');
    }

    try {
      // Convert symbol format (EURUSD -> C:EURUSD for forex)
      const polygonSymbol = symbol.length === 6 ? `C:${symbol}` : symbol;
      
      const response = await fetch(
        `${this.baseUrl}/v2/last/trade/${polygonSymbol}?apikey=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === 'ERROR') {
        throw new Error(data.error || 'Failed to get quote');
      }

      const trade = data.results;
      const price = trade.p;

      return {
        symbol,
        bid: price - 0.0001,
        ask: price + 0.0001,
        last: price,
        volume: trade.s || 0,
        change: 0, // Would need additional API call for change
        changePercent: 0,
        timestamp: new Date(trade.t),
        provider: this.name,
      };
    } catch (error) {
      console.error(`Failed to get quote for ${symbol}:`, error);
      throw error;
    }
  }

  async getHistoricalData(symbol: string, timeframe: string, limit: number): Promise<HistoricalData[]> {
    if (!this.connected) {
      throw new Error('Not connected to Polygon');
    }

    const polygonSymbol = symbol.length === 6 ? `C:${symbol}` : symbol;
    const timeframeMap: { [key: string]: string } = {
      '1min': '1/minute',
      '5min': '5/minute',
      '15min': '15/minute',
      '30min': '30/minute',
      '60min': '1/hour',
      'daily': '1/day',
    };

    const timespan = timeframeMap[timeframe] || '1/day';
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      const response = await fetch(
        `${this.baseUrl}/v2/aggs/ticker/${polygonSymbol}/range/${timespan}/${startDate}/${endDate}?adjusted=true&sort=desc&limit=${limit}&apikey=${this.apiKey}`
      );

      const data = await response.json();

      if (data.status === 'ERROR') {
        throw new Error(data.error || 'Failed to get historical data');
      }

      return (data.results || []).map((candle: any) => ({
        timestamp: new Date(candle.t),
        open: candle.o,
        high: candle.h,
        low: candle.l,
        close: candle.c,
        volume: candle.v,
      })).reverse();
    } catch (error) {
      console.error(`Failed to get historical data for ${symbol}:`, error);
      throw error;
    }
  }
}

class MarketDataService {
  private providers: MarketDataProvider[] = [];
  private activeProvider: MarketDataProvider | null = null;
  private eventHandlers: { [key: string]: Function[] } = {};
  private updateInterval: NodeJS.Timeout | null = null;
  private subscribedSymbols = new Set<string>();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Initialize providers based on available API keys
    const alphaVantageKey = process.env.EXPO_PUBLIC_ALPHA_VANTAGE_API_KEY;
    const polygonKey = process.env.EXPO_PUBLIC_POLYGON_API_KEY;

    if (alphaVantageKey) {
      this.providers.push(new AlphaVantageProvider(alphaVantageKey));
    }

    if (polygonKey) {
      this.providers.push(new PolygonProvider(polygonKey));
    }

    if (this.providers.length === 0) {
      console.warn('No market data providers configured. Please add API keys.');
    }
  }

  async connect(preferredProvider?: string): Promise<boolean> {
    if (this.providers.length === 0) {
      throw new Error('No market data providers available. Please configure API keys.');
    }

    // Try to connect to preferred provider first
    if (preferredProvider) {
      const provider = this.providers.find(p => p.name.toLowerCase().includes(preferredProvider.toLowerCase()));
      if (provider) {
        try {
          await provider.connect();
          this.activeProvider = provider;
          this.startRealTimeUpdates();
          this.emit('connected', { provider: provider.name });
          return true;
        } catch (error) {
          console.warn(`Failed to connect to preferred provider ${provider.name}:`, error);
        }
      }
    }

    // Try other providers
    for (const provider of this.providers) {
      if (provider === this.activeProvider) continue;
      
      try {
        await provider.connect();
        this.activeProvider = provider;
        this.startRealTimeUpdates();
        this.emit('connected', { provider: provider.name });
        return true;
      } catch (error) {
        console.warn(`Failed to connect to ${provider.name}:`, error);
      }
    }

    throw new Error('Failed to connect to any market data provider');
  }

  disconnect(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    if (this.activeProvider) {
      this.activeProvider.disconnect();
      this.activeProvider = null;
    }

    this.subscribedSymbols.clear();
    this.emit('disconnected');
  }

  async subscribeToSymbol(symbol: string): Promise<void> {
    if (!this.activeProvider) {
      throw new Error('No active market data provider');
    }

    await this.activeProvider.subscribeToSymbol(symbol);
    this.subscribedSymbols.add(symbol);
    console.log(`Subscribed to ${symbol} market data`);
  }

  async unsubscribeFromSymbol(symbol: string): Promise<void> {
    if (!this.activeProvider) {
      return;
    }

    await this.activeProvider.unsubscribeFromSymbol(symbol);
    this.subscribedSymbols.delete(symbol);
    console.log(`Unsubscribed from ${symbol} market data`);
  }

  async getQuote(symbol: string): Promise<Quote> {
    if (!this.activeProvider) {
      throw new Error('No active market data provider');
    }

    return await this.activeProvider.getQuote(symbol);
  }

  async getHistoricalData(symbol: string, timeframe: string, limit: number = 100): Promise<HistoricalData[]> {
    if (!this.activeProvider) {
      throw new Error('No active market data provider');
    }

    return await this.activeProvider.getHistoricalData(symbol, timeframe, limit);
  }

  private startRealTimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    // Update quotes every 5 seconds for subscribed symbols
    this.updateInterval = setInterval(async () => {
      if (!this.activeProvider || this.subscribedSymbols.size === 0) {
        return;
      }

      for (const symbol of this.subscribedSymbols) {
        try {
          const quote = await this.activeProvider.getQuote(symbol);
          this.emit('quote', quote);
        } catch (error) {
          console.error(`Failed to get real-time quote for ${symbol}:`, error);
        }
      }
    }, 5000);
  }

  getActiveProvider(): string | null {
    return this.activeProvider?.name || null;
  }

  isConnected(): boolean {
    return this.activeProvider !== null;
  }

  getAvailableProviders(): string[] {
    return this.providers.map(p => p.name);
  }

  // Event system
  on(event: string, handler: Function): void {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }

  off(event: string, handler: Function): void {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler);
    }
  }

  private emit(event: string, ...args: any[]): void {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(handler => {
        try {
          handler(...args);
        } catch (error) {
          console.error(`Error in market data event handler for ${event}:`, error);
        }
      });
    }
  }
}

export const marketDataService = new MarketDataService();