import { EventEmitter } from 'events';

export interface MT5Credentials {
  server: string;
  login: string;
  password: string;
}

export interface MT5AccountInfo {
  login: number;
  name: string;
  server: string;
  currency: string;
  company: string;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  credit: number;
  profit: number;
  leverage: number;
}

export interface MT5Position {
  ticket: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  volume: number;
  priceOpen: number;
  priceCurrent: number;
  stopLoss: number;
  takeProfit: number;
  profit: number;
  swap: number;
  commission: number;
  comment: string;
  time: Date;
}

export interface MT5Symbol {
  name: string;
  bid: number;
  ask: number;
  spread: number;
  digits: number;
  point: number;
  last: number;
  volume: number;
}

export interface MT5TradeRequest {
  action: 'DEAL';
  symbol: string;
  volume: number;
  type: 'BUY' | 'SELL';
  comment?: string;
  stopLoss?: number;
  takeProfit?: number;
}

export interface MT5TradeResult {
  deal?: number;
  order?: number;
  price: number;
  volume: number;
  comment?: string;
}

class MT5Service extends EventEmitter {
  private connected: boolean = false;
  private credentials: MT5Credentials | null = null;
  private symbols: Map<string, MT5Symbol> = new Map();
  private positions: MT5Position[] = [];
  private accountInfo: MT5AccountInfo | null = null;
  private priceUpdateInterval: NodeJS.Timeout | null = null;

  async connect(credentials: MT5Credentials): Promise<boolean> {
    try {
      // Validate credentials format
      this.validateCredentials(credentials);
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.credentials = credentials;
      this.connected = true;
      
      // Set up demo account info
      this.accountInfo = {
        login: parseInt(credentials.login),
        name: 'Demo Account',
        server: credentials.server,
        currency: 'USD',
        company: 'Demo Broker',
        balance: 10000.00,
        equity: 10000.00,
        margin: 0.00,
        freeMargin: 10000.00,
        marginLevel: 0,
        credit: 0.00,
        profit: 0.00,
        leverage: 500,
      };
      
      // Start price simulation
      this.startPriceSimulation();
      
      this.emit('connected');
      this.emit('account_info', this.accountInfo);
      
      return true;
    } catch (error) {
      this.emit('error', error);
      return false;
    }
  }

  private validateCredentials(credentials: MT5Credentials) {
    if (!credentials.server || credentials.server.trim().length === 0) {
      throw new Error('Server name is required');
    }
    
    if (!credentials.login || credentials.login.trim().length === 0) {
      throw new Error('Login is required');
    }
    
    if (!/^\d+$/.test(credentials.login.trim())) {
      throw new Error('Login must be numeric');
    }
    
    if (!credentials.password || credentials.password.length === 0) {
      throw new Error('Password is required');
    }
    
    // Simulate server validation
    const validServers = ['MetaQuotes-Demo', 'Demo-Server', 'MT5-Demo'];
    const serverValid = validServers.some(server => 
      credentials.server.toLowerCase().includes(server.toLowerCase())
    );
    
    if (!serverValid) {
      throw new Error(`Server "${credentials.server}" not found. Please check with your broker for correct server name.`);
    }
  }

  disconnect(): void {
    this.connected = false;
    this.credentials = null;
    this.symbols.clear();
    this.positions = [];
    this.accountInfo = null;
    
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
      this.priceUpdateInterval = null;
    }
    
    this.emit('disconnected');
  }

  isConnectedToMT5(): boolean {
    return this.connected;
  }

  async getAccountInfo(): Promise<MT5AccountInfo | null> {
    if (!this.connected || !this.accountInfo) {
      throw new Error('Not connected to MT5');
    }
    
    // Update balance with any profits/losses from positions
    const totalProfit = this.positions.reduce((sum, pos) => sum + pos.profit, 0);
    this.accountInfo.profit = totalProfit;
    this.accountInfo.equity = this.accountInfo.balance + totalProfit;
    this.accountInfo.freeMargin = this.accountInfo.equity - this.accountInfo.margin;
    
    return this.accountInfo;
  }

  async getPositions(): Promise<MT5Position[]> {
    if (!this.connected) {
      throw new Error('Not connected to MT5');
    }
    
    // Update position profits based on current prices
    this.positions.forEach(position => {
      const symbol = this.symbols.get(position.symbol);
      if (symbol) {
        const currentPrice = position.type === 'BUY' ? symbol.bid : symbol.ask;
        const priceDiff = position.type === 'BUY' 
          ? currentPrice - position.priceOpen
          : position.priceOpen - currentPrice;
        
        // Simplified profit calculation (not accounting for contract size)
        position.priceCurrent = currentPrice;
        position.profit = priceDiff * position.volume * 100; // Simplified multiplier
      }
    });
    
    return this.positions;
  }

  async subscribeToSymbol(symbol: string): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected to MT5');
    }
    
    // Initialize symbol with demo data
    const symbolData: MT5Symbol = {
      name: symbol,
      bid: this.getInitialPrice(symbol),
      ask: this.getInitialPrice(symbol) + 0.00020,
      spread: 2.0,
      digits: 5,
      point: 0.00001,
      last: this.getInitialPrice(symbol),
      volume: Math.floor(Math.random() * 1000000),
    };
    
    this.symbols.set(symbol, symbolData);
    this.emit('tick', symbolData);
  }

  private getInitialPrice(symbol: string): number {
    const basePrices: { [key: string]: number } = {
      'EURUSD': 1.08500,
      'GBPUSD': 1.27000,
      'USDJPY': 148.500,
      'AUDUSD': 0.66500,
      'USDCAD': 1.36000,
      'USDCHF': 0.87500,
      'NZDUSD': 0.61500,
    };
    
    return basePrices[symbol] || (Math.random() * 2 + 0.5);
  }

  async executeTrade(request: MT5TradeRequest): Promise<MT5TradeResult> {
    if (!this.connected) {
      throw new Error('Not connected to MT5');
    }
    
    const symbol = this.symbols.get(request.symbol);
    if (!symbol) {
      throw new Error(`Symbol ${request.symbol} not available`);
    }
    
    const price = request.type === 'BUY' ? symbol.ask : symbol.bid;
    const ticket = Date.now() + Math.floor(Math.random() * 1000);
    
    // Create position
    const position: MT5Position = {
      ticket,
      symbol: request.symbol,
      type: request.type,
      volume: request.volume,
      priceOpen: price,
      priceCurrent: price,
      stopLoss: request.stopLoss || 0,
      takeProfit: request.takeProfit || 0,
      profit: 0,
      swap: 0,
      commission: -request.volume * 7, // Simplified commission
      comment: request.comment || '',
      time: new Date(),
    };
    
    this.positions.push(position);
    this.emit('position_update', this.positions);
    
    return {
      deal: ticket,
      price,
      volume: request.volume,
      comment: request.comment,
    };
  }

  private startPriceSimulation(): void {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
    }
    
    this.priceUpdateInterval = setInterval(() => {
      this.symbols.forEach((symbolData, symbolName) => {
        // Simulate price movement
        const volatility = 0.0001;
        const change = (Math.random() - 0.5) * volatility;
        
        symbolData.bid += change;
        symbolData.ask = symbolData.bid + (symbolData.spread * symbolData.point);
        symbolData.last = symbolData.bid;
        symbolData.volume += Math.floor(Math.random() * 1000);
        
        this.emit('tick', symbolData);
      });
    }, 1000); // Update every second
  }
}

export const mt5Service = new MT5Service();