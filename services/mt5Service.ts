export interface MT5Credentials {
  server: string;
  login: string;
  password: string;
}

export interface MT5AccountInfo {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  leverage: number;
  currency: string;
  company: string;
  name: string;
  server: string;
  login: string;
}

export interface MT5Position {
  ticket: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  volume: number;
  openPrice: number;
  currentPrice: number;
  profit: number;
  swap: number;
  commission: number;
  openTime: Date;
}

export interface MT5Symbol {
  name: string;
  bid: number;
  ask: number;
  last: number;
  volume: number;
  time: Date;
  lastUpdate: Date;
}

export interface MT5TradeRequest {
  action: 'DEAL';
  symbol: string;
  volume: number;
  type: 'BUY' | 'SELL';
  comment?: string;
}

export interface MT5TradeResult {
  retcode: number;
  deal?: number;
  order?: number;
  volume?: number;
  price?: number;
  comment?: string;
  request_id?: number;
}

class MT5Service {
  private connected = false;
  private credentials: MT5Credentials | null = null;
  private eventHandlers: { [key: string]: Function[] } = {};
  private symbols: Map<string, MT5Symbol> = new Map();
  private positions: MT5Position[] = [];
  private accountInfo: MT5AccountInfo | null = null;
  private updateInterval: NodeJS.Timeout | null = null;

  async connect(credentials: MT5Credentials): Promise<boolean> {
    console.log('MT5Service: Attempting connection...');
    
    try {
      // Validate credentials
      if (!credentials.server || !credentials.login || !credentials.password) {
        throw new Error('Invalid credentials: All fields are required');
      }

      if (credentials.server.trim().length === 0) {
        throw new Error('Server name cannot be empty');
      }

      if (credentials.login.trim().length === 0) {
        throw new Error('Login cannot be empty');
      }

      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000));

      this.credentials = credentials;
      this.connected = true;

      // Initialize demo account data
      this.accountInfo = {
        balance: 10000.00,
        equity: 10000.00,
        margin: 0.00,
        freeMargin: 10000.00,
        leverage: 100,
        currency: 'USD',
        company: 'Demo MetaTrader 5',
        name: 'Demo Account',
        server: credentials.server,
        login: credentials.login,
      };

      this.startDataUpdates();
      this.emit('connected');
      
      console.log('MT5Service: Connected successfully');
      return true;
    } catch (error) {
      console.error('MT5Service: Connection failed:', error);
      this.connected = false;
      this.emit('error', error);
      throw error;
    }
  }

  disconnect(): void {
    console.log('MT5Service: Disconnecting...');
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    this.connected = false;
    this.credentials = null;
    this.accountInfo = null;
    this.positions = [];
    this.symbols.clear();
    
    this.emit('disconnected');
    console.log('MT5Service: Disconnected');
  }

  async getAccountInfo(): Promise<MT5AccountInfo> {
    if (!this.connected || !this.accountInfo) {
      throw new Error('MT5 not connected');
    }
    return { ...this.accountInfo };
  }

  async getPositions(): Promise<MT5Position[]> {
    if (!this.connected) {
      throw new Error('MT5 not connected');
    }
    return [...this.positions];
  }

  async subscribeToSymbol(symbol: string): Promise<void> {
    if (!this.connected) {
      throw new Error('MT5 not connected');
    }

    console.log(`MT5Service: Subscribing to ${symbol}`);
    
    // Initialize symbol data
    const symbolData: MT5Symbol = {
      name: symbol,
      bid: this.generateRandomPrice(symbol),
      ask: this.generateRandomPrice(symbol) + 0.0001,
      last: this.generateRandomPrice(symbol),
      volume: Math.floor(Math.random() * 1000000),
      time: new Date(),
      lastUpdate: new Date(),
    };

    symbolData.ask = symbolData.bid + 0.0001; // Ensure ask > bid
    this.symbols.set(symbol, symbolData);
  }

  async executeTrade(request: MT5TradeRequest): Promise<MT5TradeResult> {
    if (!this.connected) {
      throw new Error('MT5 not connected');
    }

    console.log('MT5Service: Executing trade:', request);

    // Simulate trade execution
    await new Promise(resolve => setTimeout(resolve, 500));

    const symbol = this.symbols.get(request.symbol);
    const price = symbol ? (request.type === 'BUY' ? symbol.ask : symbol.bid) : this.generateRandomPrice(request.symbol);
    
    const result: MT5TradeResult = {
      retcode: 10009, // TRADE_RETCODE_DONE
      deal: Date.now(),
      order: Date.now() + 1,
      volume: request.volume,
      price: price,
      comment: request.comment || 'Demo trade executed',
      request_id: Date.now(),
    };

    // Add position
    const newPosition: MT5Position = {
      ticket: result.deal!,
      symbol: request.symbol,
      type: request.type,
      volume: request.volume,
      openPrice: price,
      currentPrice: price,
      profit: 0,
      swap: 0,
      commission: 0,
      openTime: new Date(),
    };

    this.positions.push(newPosition);
    this.emit('position_update', this.positions);

    console.log('MT5Service: Trade executed successfully:', result);
    return result;
  }

  private startDataUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.updateSymbolPrices();
      this.updatePositions();
      this.updateAccountInfo();
    }, 1000);
  }

  private updateSymbolPrices(): void {
    for (const [symbolName, symbol] of this.symbols) {
      const newBid = this.generateRandomPrice(symbolName, symbol.bid);
      const newAsk = newBid + 0.0001;
      
      const updatedSymbol: MT5Symbol = {
        ...symbol,
        bid: newBid,
        ask: newAsk,
        last: newBid,
        lastUpdate: new Date(),
      };

      this.symbols.set(symbolName, updatedSymbol);
      this.emit('tick', updatedSymbol);
    }
  }

  private updatePositions(): void {
    this.positions.forEach(position => {
      const symbol = this.symbols.get(position.symbol);
      if (symbol) {
        position.currentPrice = position.type === 'BUY' ? symbol.bid : symbol.ask;
        position.profit = this.calculateProfit(position);
      }
    });

    if (this.positions.length > 0) {
      this.emit('position_update', this.positions);
    }
  }

  private updateAccountInfo(): void {
    if (!this.accountInfo) return;

    const totalProfit = this.positions.reduce((sum, pos) => sum + pos.profit, 0);
    
    this.accountInfo = {
      ...this.accountInfo,
      equity: this.accountInfo.balance + totalProfit,
    };

    this.emit('account_info', this.accountInfo);
  }

  private generateRandomPrice(symbol: string, currentPrice?: number): number {
    const basePrice = currentPrice || this.getBasePrice(symbol);
    const change = (Math.random() - 0.5) * 0.0010; // Max 10 pip change
    return Math.max(0.0001, basePrice + change);
  }

  private getBasePrice(symbol: string): number {
    const basePrices: { [key: string]: number } = {
      'EURUSD': 1.0950,
      'GBPUSD': 1.2650,
      'USDJPY': 149.50,
      'AUDUSD': 0.6750,
      'USDCAD': 1.3450,
      'USDCHF': 0.8850,
      'NZDUSD': 0.6150,
      'EURGBP': 0.8650,
    };
    return basePrices[symbol] || 1.0000;
  }

  private calculateProfit(position: MT5Position): number {
    const pointValue = 10; // Simplified point value
    const priceDiff = position.type === 'BUY' 
      ? position.currentPrice - position.openPrice
      : position.openPrice - position.currentPrice;
    
    return priceDiff * position.volume * pointValue;
  }

  isConnected(): boolean {
    return this.connected;
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
          console.error(`Error in MT5 event handler for ${event}:`, error);
        }
      });
    }
  }
}

export const mt5Service = new MT5Service();