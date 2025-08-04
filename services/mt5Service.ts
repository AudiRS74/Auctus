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
  marginLevel: number;
  currency: string;
  leverage: number;
  name: string;
  company: string;
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
  comment: string;
  openTime: Date;
}

export interface MT5Symbol {
  name: string;
  bid: number;
  ask: number;
  spread: number;
  digits: number;
  point: number;
  lastUpdate: Date;
}

export interface MT5TradeRequest {
  action: 'DEAL' | 'PENDING';
  symbol: string;
  volume: number;
  type: 'BUY' | 'SELL' | 'BUY_LIMIT' | 'SELL_LIMIT' | 'BUY_STOP' | 'SELL_STOP';
  price?: number;
  stoploss?: number;
  takeprofit?: number;
  comment?: string;
  magic?: number;
}

export interface MT5TradeResult {
  retcode: number;
  deal?: number;
  order?: number;
  volume?: number;
  price?: number;
  bid?: number;
  ask?: number;
  comment?: string;
  request_id?: number;
}

class MT5Service {
  private isConnected: boolean = false;
  private credentials: MT5Credentials | null = null;
  private eventHandlers: { [key: string]: Function[] } = {};
  private simulationInterval: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private accountData: MT5AccountInfo | null = null;
  private positions: MT5Position[] = [];
  private symbols: { [key: string]: MT5Symbol } = {};

  async connect(credentials: MT5Credentials): Promise<boolean> {
    console.log('MT5 Demo Mode: Simulating connection to broker server:', credentials.server);
    
    try {
      this.credentials = credentials;
      
      // Validate credentials format
      const validationError = this.validateCredentials(credentials);
      if (validationError) {
        console.error('Credential validation failed:', validationError);
        throw new Error(validationError);
      }
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate authentication based on credentials
      const authResult = this.simulateAuthentication(credentials);
      
      if (authResult.success) {
        console.log('Demo Mode: Authentication successful');
        this.isConnected = true;
        this.initializeSimulatedData();
        this.startSimulation();
        this.emit('connected', { credentials });
        return true;
      } else {
        console.error('Demo Mode: Authentication failed:', authResult.error);
        throw new Error(authResult.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('MT5 Demo Connection Error:', error);
      this.isConnected = false;
      
      this.emit('error', {
        type: 'connection_error',
        message: error instanceof Error ? error.message : 'Unknown connection error',
        server: credentials.server,
        timestamp: new Date()
      });
      
      throw error;
    }
  }

  private validateCredentials(credentials: MT5Credentials): string | null {
    // Validate server format
    if (!credentials.server || credentials.server.trim().length === 0) {
      return 'Server name is required. Please enter your broker server name (e.g., YourBroker-Demo, YourBroker-Live01)';
    }

    // Validate login format (should be numeric for most brokers)
    if (!credentials.login || credentials.login.trim().length === 0) {
      return 'Login number is required. Please enter your MT5 account number';
    }

    // Check if login is numeric (most brokers use numeric account IDs)
    const loginNum = credentials.login.trim();
    if (!/^\d+$/.test(loginNum)) {
      return 'Invalid login format. MT5 account numbers are typically numeric (e.g., 12345678)';
    }

    // Validate login length (typically 6-10 digits for most brokers)
    if (loginNum.length < 4 || loginNum.length > 12) {
      return 'Invalid login length. MT5 account numbers are typically 4-12 digits long';
    }

    // Validate password
    if (!credentials.password || credentials.password.length === 0) {
      return 'Password is required. Please enter your MT5 account password';
    }

    // Check password length (most brokers require minimum 6 characters)
    if (credentials.password.length < 4) {
      return 'Password too short. Most brokers require passwords to be at least 4 characters long';
    }

    return null; // No validation errors
  }

  private simulateAuthentication(credentials: MT5Credentials): { success: boolean; error?: string } {
    // Demo mode authentication logic
    const serverLower = credentials.server.toLowerCase();
    const login = credentials.login;
    const password = credentials.password;

    // Demo credentials that always work for testing
    const demoCredentials = [
      { server: 'demo', login: '12345', password: 'demo123' },
      { server: 'metaquotes-demo', login: '123456', password: 'password' },
      { server: 'test', login: '1234567', password: 'test123' },
    ];

    // Check if using demo credentials
    const isDemoCredentials = demoCredentials.some(demo => 
      serverLower.includes(demo.server.toLowerCase()) && 
      login === demo.login && 
      password === demo.password
    );

    if (isDemoCredentials) {
      return { success: true };
    }

    // Simulate realistic validation errors for demo purposes
    if (login.length < 5) {
      return { success: false, error: 'Invalid account number. Account numbers must be at least 5 digits long.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Invalid password. Password must be at least 6 characters long.' };
    }

    // For demo purposes, accept any reasonable looking credentials
    if (serverLower.includes('demo') || serverLower.includes('test')) {
      return { success: true };
    }

    // Show helpful message for live server attempts
    return { 
      success: false, 
      error: `Demo Mode: Cannot connect to live server "${credentials.server}". This is a demonstration version. Use server "demo" with login "12345" and password "demo123" to test the application.` 
    };
  }

  private initializeSimulatedData(): void {
    // Initialize demo account data
    this.accountData = {
      balance: 10000.00,
      equity: 10000.00,
      margin: 0.00,
      freeMargin: 10000.00,
      marginLevel: 0,
      currency: 'USD',
      leverage: 100,
      name: 'Demo Trader',
      company: 'Demo Broker Ltd.',
    };

    // Initialize common forex symbols with realistic prices
    const symbolData = [
      { name: 'EURUSD', basePrice: 1.0845 },
      { name: 'GBPUSD', basePrice: 1.2634 },
      { name: 'USDJPY', basePrice: 148.75 },
      { name: 'AUDUSD', basePrice: 0.6823 },
      { name: 'USDCAD', basePrice: 1.3456 },
      { name: 'USDCHF', basePrice: 0.8934 },
      { name: 'NZDUSD', basePrice: 0.6245 },
      { name: 'EURGBP', basePrice: 0.8587 },
    ];

    symbolData.forEach(symbol => {
      const spread = 0.0002; // 2 pips spread
      const bid = symbol.basePrice - spread / 2;
      const ask = symbol.basePrice + spread / 2;

      this.symbols[symbol.name] = {
        name: symbol.name,
        bid: Number(bid.toFixed(5)),
        ask: Number(ask.toFixed(5)),
        spread: Number((ask - bid).toFixed(5)),
        digits: 5,
        point: 0.00001,
        lastUpdate: new Date(),
      };
    });

    // Initialize some demo positions
    this.positions = [
      {
        ticket: 12345,
        symbol: 'EURUSD',
        type: 'BUY',
        volume: 0.1,
        openPrice: 1.0832,
        currentPrice: 1.0845,
        profit: 13.00,
        swap: 0.00,
        commission: -1.00,
        comment: 'Demo trade',
        openTime: new Date(Date.now() - 3600000), // 1 hour ago
      },
      {
        ticket: 12346,
        symbol: 'GBPUSD',
        type: 'SELL',
        volume: 0.05,
        openPrice: 1.2642,
        currentPrice: 1.2634,
        profit: 4.00,
        swap: 0.00,
        commission: -0.50,
        comment: 'Demo trade',
        openTime: new Date(Date.now() - 7200000), // 2 hours ago
      },
    ];

    console.log('Demo data initialized:', { account: this.accountData, symbolCount: Object.keys(this.symbols).length });
  }

  private startSimulation(): void {
    // Start price simulation
    this.simulationInterval = setInterval(() => {
      this.updateSimulatedPrices();
      this.updateSimulatedPositions();
      this.updateSimulatedAccount();
    }, 2000); // Update every 2 seconds

    // Start heartbeat
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        console.log('Demo Mode: Heartbeat - Connection active');
      }
    }, 30000); // Every 30 seconds

    // Send initial data
    setTimeout(() => {
      if (this.accountData) {
        this.emit('account_info', this.accountData);
      }
      this.emit('position_update', this.positions);
    }, 1000);
  }

  private updateSimulatedPrices(): void {
    Object.keys(this.symbols).forEach(symbolName => {
      const symbol = this.symbols[symbolName];
      
      // Simulate realistic price movement (small random changes)
      const change = (Math.random() - 0.5) * 0.0005; // Max 5 pips movement
      const newBid = Math.max(0.0001, symbol.bid + change);
      const newAsk = newBid + symbol.spread;

      this.symbols[symbolName] = {
        ...symbol,
        bid: Number(newBid.toFixed(5)),
        ask: Number(newAsk.toFixed(5)),
        lastUpdate: new Date(),
      };

      // Emit tick data
      this.emit('tick', this.symbols[symbolName]);
    });
  }

  private updateSimulatedPositions(): void {
    this.positions = this.positions.map(position => {
      const symbol = this.symbols[position.symbol];
      if (!symbol) return position;

      // Update current price based on position type
      const currentPrice = position.type === 'BUY' ? symbol.bid : symbol.ask;
      
      // Calculate profit
      const priceDifference = position.type === 'BUY' 
        ? currentPrice - position.openPrice 
        : position.openPrice - currentPrice;
      
      const profit = priceDifference * position.volume * 100000; // Standard lot size

      return {
        ...position,
        currentPrice: Number(currentPrice.toFixed(5)),
        profit: Number(profit.toFixed(2)),
      };
    });

    this.emit('position_update', this.positions);
  }

  private updateSimulatedAccount(): void {
    if (!this.accountData) return;

    // Calculate total profit from positions
    const totalProfit = this.positions.reduce((sum, position) => sum + position.profit, 0);
    
    // Update equity
    const newEquity = this.accountData.balance + totalProfit;
    
    this.accountData = {
      ...this.accountData,
      equity: Number(newEquity.toFixed(2)),
      freeMargin: Number((newEquity - this.accountData.margin).toFixed(2)),
      marginLevel: this.accountData.margin > 0 ? Number(((newEquity / this.accountData.margin) * 100).toFixed(2)) : 0,
    };

    this.emit('account_info', this.accountData);
  }

  disconnect(): void {
    console.log('Demo Mode: Disconnecting from MT5 simulation');
    this.isConnected = false;
    
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    this.accountData = null;
    this.positions = [];
    this.symbols = {};
    
    this.emit('disconnected');
  }

  async getAccountInfo(): Promise<MT5AccountInfo> {
    if (!this.isConnected || !this.accountData) {
      throw new Error('Not connected to MT5 demo server');
    }
    return Promise.resolve(this.accountData);
  }

  async getPositions(): Promise<MT5Position[]> {
    if (!this.isConnected) {
      throw new Error('Not connected to MT5 demo server');
    }
    return Promise.resolve([...this.positions]);
  }

  async getSymbolInfo(symbol: string): Promise<MT5Symbol> {
    if (!this.isConnected) {
      throw new Error('Not connected to MT5 demo server');
    }

    const symbolData = this.symbols[symbol];
    if (!symbolData) {
      throw new Error(`Symbol ${symbol} not found`);
    }

    return Promise.resolve(symbolData);
  }

  async executeTrade(request: MT5TradeRequest): Promise<MT5TradeResult> {
    if (!this.isConnected) {
      throw new Error('Not connected to MT5 demo server');
    }

    console.log('Demo Mode: Executing trade:', request);

    // Simulate trade execution delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get current symbol price
    const symbol = this.symbols[request.symbol];
    if (!symbol) {
      throw new Error(`Symbol ${request.symbol} not available`);
    }

    // Determine execution price
    const executionPrice = request.type === 'BUY' ? symbol.ask : symbol.bid;

    // Create new position
    const newPosition: MT5Position = {
      ticket: Date.now(),
      symbol: request.symbol,
      type: request.type,
      volume: request.volume,
      openPrice: executionPrice,
      currentPrice: executionPrice,
      profit: 0,
      swap: 0,
      commission: -Math.abs(request.volume * 0.7), // Simulate commission
      comment: request.comment || 'Demo trade',
      openTime: new Date(),
    };

    this.positions.push(newPosition);

    // Update account balance (subtract commission)
    if (this.accountData) {
      this.accountData.balance += newPosition.commission;
    }

    // Emit updates
    this.emit('position_update', this.positions);
    if (this.accountData) {
      this.emit('account_info', this.accountData);
    }

    return {
      retcode: 10009, // TRADE_RETCODE_DONE
      deal: newPosition.ticket,
      volume: request.volume,
      price: executionPrice,
      bid: symbol.bid,
      ask: symbol.ask,
      comment: 'Demo trade executed successfully',
      request_id: Date.now(),
    };
  }

  async subscribeToSymbol(symbol: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Not connected to MT5 demo server');
    }

    console.log(`Demo Mode: Subscribed to ${symbol} price updates`);
    
    // In demo mode, all major symbols are already available
    if (!this.symbols[symbol]) {
      // Add the symbol if not exists
      this.symbols[symbol] = {
        name: symbol,
        bid: 1.0000,
        ask: 1.0002,
        spread: 0.0002,
        digits: 5,
        point: 0.00001,
        lastUpdate: new Date(),
      };
    }
  }

  async unsubscribeFromSymbol(symbol: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Not connected to MT5 demo server');
    }

    console.log(`Demo Mode: Unsubscribed from ${symbol} price updates`);
  }

  // Event system
  on(event: string, handler: Function): void {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }

  once(event: string, handler: Function): void {
    const wrappedHandler = (...args: any[]) => {
      handler(...args);
      this.off(event, wrappedHandler);
    };
    this.on(event, wrappedHandler);
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
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  isConnectedToMT5(): boolean {
    return this.isConnected;
  }

  getCurrentCredentials(): MT5Credentials | null {
    return this.credentials;
  }
}

export const mt5Service = new MT5Service();