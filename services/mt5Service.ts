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
  server: string;
  loginNumber: string;
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

// Real MT5 server configurations for demo purposes
const MT5_DEMO_SERVERS = [
  {
    name: 'MetaQuotes-Demo',
    company: 'MetaQuotes Software Corp.',
    description: 'Official MetaQuotes Demo Server',
    ping: 45,
  },
  {
    name: 'Forex-Demo',
    company: 'Demo Forex Broker Ltd.',
    description: 'Professional Demo Trading Environment',
    ping: 32,
  },
  {
    name: 'MT5-Live-Demo',
    company: 'Global Trading Solutions',
    description: 'Live Demo Server with Real Market Conditions',
    ping: 28,
  }
];

class MT5Service {
  private isConnected: boolean = false;
  private credentials: MT5Credentials | null = null;
  private eventHandlers: { [key: string]: Function[] } = {};
  private simulationInterval: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private accountData: MT5AccountInfo | null = null;
  private positions: MT5Position[] = [];
  private symbols: { [key: string]: MT5Symbol } = {};
  private connectionStartTime: Date | null = null;

  async connect(credentials: MT5Credentials): Promise<boolean> {
    console.log('MT5 Terminal: Attempting connection to server:', credentials.server);
    this.connectionStartTime = new Date();
    
    try {
      this.credentials = credentials;
      
      // Enhanced credential validation with MT5-like checks
      const validationResult = await this.authenticateWithServer(credentials);
      if (!validationResult.success) {
        throw new Error(validationResult.error);
      }
      
      // Simulate realistic connection process
      await this.performConnectionHandshake(credentials);
      
      console.log('MT5 Terminal: Authentication successful, initializing account...');
      this.isConnected = true;
      
      // Initialize account data based on server and login
      await this.initializeAccountData(credentials);
      
      // Start real-time data feeds
      this.startRealTimeFeeds();
      
      this.emit('connected', { 
        credentials,
        server: this.getServerInfo(credentials.server),
        connectionTime: new Date()
      });
      
      return true;
      
    } catch (error) {
      console.error('MT5 Terminal Connection Error:', error);
      this.isConnected = false;
      
      this.emit('error', {
        type: 'authentication_failed',
        message: error instanceof Error ? error.message : 'Connection failed',
        server: credentials.server,
        login: credentials.login,
        timestamp: new Date()
      });
      
      throw error;
    }
  }

  private async authenticateWithServer(credentials: MT5Credentials): Promise<{ success: boolean; error?: string }> {
    // Simulate server lookup and validation
    await this.delay(1500);

    // Validate server format - must look like real MT5 server
    const serverValidation = this.validateServerName(credentials.server);
    if (!serverValidation.isValid) {
      return { success: false, error: serverValidation.error };
    }

    // Validate login - must be numeric and proper length
    const loginValidation = this.validateLoginNumber(credentials.login);
    if (!loginValidation.isValid) {
      return { success: false, error: loginValidation.error };
    }

    // Validate password strength
    const passwordValidation = this.validatePassword(credentials.password);
    if (!passwordValidation.isValid) {
      return { success: false, error: passwordValidation.error };
    }

    // Demo authentication logic - accepts specific demo credentials or realistic looking ones
    return this.performDemoAuthentication(credentials);
  }

  private validateServerName(server: string): { isValid: boolean; error?: string } {
    if (!server || server.trim().length === 0) {
      return { 
        isValid: false, 
        error: 'Server name is required. Enter your broker\'s MT5 server (e.g., YourBroker-Demo, YourBroker-Live01)' 
      };
    }

    const cleanServer = server.trim();
    
    // Check for common MT5 server patterns
    const validPatterns = [
      /^[A-Za-z0-9]+(-Demo|-Live\d*|-Server\d*)$/,
      /^MT5-[A-Za-z0-9-]+$/,
      /^MetaQuotes-[A-Za-z0-9-]+$/,
      /^[A-Za-z0-9]+-MT5(-\w+)?$/,
      /^demo$/i,
      /^test$/i
    ];

    const isValidFormat = validPatterns.some(pattern => pattern.test(cleanServer));
    
    if (!isValidFormat) {
      return { 
        isValid: false, 
        error: 'Invalid server name format. MT5 servers typically use formats like "BrokerName-Demo", "MT5-Server01", or "MetaQuotes-Demo"' 
      };
    }

    if (cleanServer.length < 3 || cleanServer.length > 50) {
      return { 
        isValid: false, 
        error: 'Server name must be between 3-50 characters' 
      };
    }

    return { isValid: true };
  }

  private validateLoginNumber(login: string): { isValid: boolean; error?: string } {
    if (!login || login.trim().length === 0) {
      return { 
        isValid: false, 
        error: 'Login number is required. Enter your MT5 account number provided by your broker' 
      };
    }

    const cleanLogin = login.trim();

    // Must be numeric for most brokers
    if (!/^\d+$/.test(cleanLogin)) {
      return { 
        isValid: false, 
        error: 'Invalid login format. MT5 account numbers must be numeric (e.g., 1234567, 50123456)' 
      };
    }

    // Realistic login number length (most brokers use 6-10 digits)
    if (cleanLogin.length < 5 || cleanLogin.length > 12) {
      return { 
        isValid: false, 
        error: 'Invalid login length. MT5 account numbers are typically 5-12 digits long' 
      };
    }

    // Check for obviously fake numbers
    if (cleanLogin === '123456' || cleanLogin === '1234567' || cleanLogin.match(/^1{5,}$/)) {
      // Allow these for demo purposes, but in production they might be rejected
      console.log('Demo Mode: Accepting test login number');
    }

    return { isValid: true };
  }

  private validatePassword(password: string): { isValid: boolean; error?: string } {
    if (!password || password.length === 0) {
      return { 
        isValid: false, 
        error: 'Password is required. Enter the password for your MT5 trading account' 
      };
    }

    if (password.length < 6) {
      return { 
        isValid: false, 
        error: 'Password too short. Most brokers require passwords to be at least 6 characters long' 
      };
    }

    if (password.length > 50) {
      return { 
        isValid: false, 
        error: 'Password too long. Passwords should not exceed 50 characters' 
      };
    }

    // Check for basic password strength (in real MT5, this varies by broker)
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    if (!hasLetter && !hasNumber) {
      console.log('Demo Mode: Weak password detected, but allowing for demo purposes');
    }

    return { isValid: true };
  }

  private performDemoAuthentication(credentials: MT5Credentials): { success: boolean; error?: string } {
    const server = credentials.server.toLowerCase();
    const login = credentials.login;
    const password = credentials.password;

    // Always working demo credentials for testing
    const demoCredentials = [
      { server: 'demo', login: '12345', password: 'demo123' },
      { server: 'metaquotes-demo', login: '123456', password: 'password' },
      { server: 'mt5-demo', login: '1234567', password: 'demo123' },
      { server: 'test', login: '98765', password: 'test123' },
    ];

    // Check exact demo credentials
    const isExactDemo = demoCredentials.some(demo => 
      server === demo.server.toLowerCase() && 
      login === demo.login && 
      password === demo.password
    );

    if (isExactDemo) {
      return { success: true };
    }

    // Accept reasonable looking demo credentials
    if (server.includes('demo') || server.includes('test')) {
      // For demo servers, be more lenient but still validate format
      if (login.length >= 5 && password.length >= 6) {
        return { success: true };
      }
    }

    // Simulate realistic broker authentication errors
    if (login.length < 6) {
      return { 
        success: false, 
        error: 'Invalid account number. Please check your login credentials with your broker.' 
      };
    }

    if (password.length < 6) {
      return { 
        success: false, 
        error: 'Invalid password. Please verify your account password.' 
      };
    }

    // For live-looking servers, show educational message
    if (!server.includes('demo') && !server.includes('test')) {
      return { 
        success: false, 
        error: `Demo Mode: Cannot connect to live server "${credentials.server}". This demonstration requires demo server credentials:\n\nServer: demo\nLogin: 12345\nPassword: demo123` 
      };
    }

    // Generic authentication failure
    return { 
      success: false, 
      error: 'Authentication failed. Please verify your server name, login number, and password. For demo testing, use:\nServer: demo\nLogin: 12345\nPassword: demo123' 
    };
  }

  private async performConnectionHandshake(credentials: MT5Credentials): Promise<void> {
    // Simulate realistic MT5 connection steps
    console.log('MT5 Terminal: Connecting to server...');
    await this.delay(800);
    
    console.log('MT5 Terminal: Authenticating account...');
    await this.delay(1200);
    
    console.log('MT5 Terminal: Synchronizing account data...');
    await this.delay(600);
    
    console.log('MT5 Terminal: Requesting symbol information...');
    await this.delay(400);
    
    console.log('MT5 Terminal: Subscribing to market data...');
    await this.delay(300);
    
    console.log('MT5 Terminal: Connection established successfully');
  }

  private async initializeAccountData(credentials: MT5Credentials): Promise<void> {
    const serverInfo = this.getServerInfo(credentials.server);
    
    // Create realistic account based on server and login
    const baseBalance = this.generateRealisticBalance(credentials.login);
    
    this.accountData = {
      balance: baseBalance,
      equity: baseBalance,
      margin: 0.00,
      freeMargin: baseBalance,
      marginLevel: 0,
      currency: 'USD',
      leverage: 100,
      name: `Demo Account ${credentials.login}`,
      company: serverInfo.company,
      server: credentials.server,
      loginNumber: credentials.login
    };

    // Initialize realistic market symbols with proper pricing
    await this.initializeMarketSymbols();
    
    // Create some initial positions if account has trading history
    this.initializeDemoPositions();
    
    console.log('MT5 Terminal: Account data initialized:', {
      balance: this.accountData.balance,
      server: this.accountData.server,
      login: this.accountData.loginNumber
    });
  }

  private generateRealisticBalance(login: string): number {
    // Generate consistent balance based on login number
    const seed = parseInt(login) || 12345;
    const random = (seed * 9301 + 49297) % 233280 / 233280;
    
    // Demo accounts typically range from $1,000 to $50,000
    const minBalance = 1000;
    const maxBalance = 50000;
    
    return Math.round(minBalance + (random * (maxBalance - minBalance)));
  }

  private getServerInfo(serverName: string): { company: string; description: string; ping: number } {
    const server = serverName.toLowerCase();
    
    if (server.includes('metaquotes')) {
      return { company: 'MetaQuotes Software Corp.', description: 'MetaQuotes Demo Server', ping: 45 };
    }
    if (server.includes('demo')) {
      return { company: 'Demo Trading Solutions Ltd.', description: 'Professional Demo Environment', ping: 32 };
    }
    if (server.includes('mt5')) {
      return { company: 'Global MT5 Brokers', description: 'MT5 Demo Trading Platform', ping: 28 };
    }
    
    return { company: 'Demo Broker Ltd.', description: 'Trading Demo Server', ping: 35 };
  }

  private async initializeMarketSymbols(): Promise<void> {
    const symbolConfigs = [
      { name: 'EURUSD', basePrice: 1.0845, spread: 1.2 },
      { name: 'GBPUSD', basePrice: 1.2634, spread: 1.5 },
      { name: 'USDJPY', basePrice: 148.75, spread: 1.1, digits: 3 },
      { name: 'AUDUSD', basePrice: 0.6823, spread: 1.4 },
      { name: 'USDCAD', basePrice: 1.3456, spread: 1.3 },
      { name: 'USDCHF', basePrice: 0.8934, spread: 1.2 },
      { name: 'NZDUSD', basePrice: 0.6245, spread: 1.6 },
      { name: 'EURGBP', basePrice: 0.8587, spread: 1.1 },
      { name: 'XAUUSD', basePrice: 2024.50, spread: 0.3, digits: 2 },
      { name: 'BTCUSD', basePrice: 43250.00, spread: 15.0, digits: 2 },
    ];

    symbolConfigs.forEach(config => {
      const digits = config.digits || 5;
      const point = Math.pow(10, -digits);
      const spreadInPrice = config.spread * point;
      
      const bid = config.basePrice - spreadInPrice / 2;
      const ask = config.basePrice + spreadInPrice / 2;

      this.symbols[config.name] = {
        name: config.name,
        bid: Number(bid.toFixed(digits)),
        ask: Number(ask.toFixed(digits)),
        spread: Number((ask - bid).toFixed(digits)),
        digits: digits,
        point: point,
        lastUpdate: new Date(),
      };
    });

    console.log(`MT5 Terminal: Initialized ${Object.keys(this.symbols).length} trading symbols`);
  }

  private initializeDemoPositions(): void {
    // Create some realistic demo positions based on account
    if (!this.accountData || this.accountData.balance < 5000) {
      this.positions = []; // Small accounts start with no positions
      return;
    }

    const samplePositions: Partial<MT5Position>[] = [
      {
        symbol: 'EURUSD',
        type: 'BUY',
        volume: 0.1,
        openPrice: 1.0832,
        comment: 'Demo position',
        openTime: new Date(Date.now() - 3600000), // 1 hour ago
      },
      {
        symbol: 'GBPUSD',
        type: 'SELL',
        volume: 0.05,
        openPrice: 1.2642,
        comment: 'Demo position',
        openTime: new Date(Date.now() - 7200000), // 2 hours ago
      }
    ];

    this.positions = samplePositions.map((pos, index) => {
      const symbol = this.symbols[pos.symbol!];
      const currentPrice = pos.type === 'BUY' ? symbol.bid : symbol.ask;
      
      const priceDiff = pos.type === 'BUY' 
        ? currentPrice - pos.openPrice! 
        : pos.openPrice! - currentPrice;
      
      const profit = priceDiff * pos.volume! * 100000;

      return {
        ticket: 10000 + index + 1,
        symbol: pos.symbol!,
        type: pos.type!,
        volume: pos.volume!,
        openPrice: pos.openPrice!,
        currentPrice: currentPrice,
        profit: Number(profit.toFixed(2)),
        swap: 0.00,
        commission: -Math.abs(pos.volume! * 0.7),
        comment: pos.comment!,
        openTime: pos.openTime!,
      } as MT5Position;
    });

    console.log(`MT5 Terminal: Initialized ${this.positions.length} demo positions`);
  }

  private startRealTimeFeeds(): void {
    // Start price updates every 2 seconds
    this.simulationInterval = setInterval(() => {
      this.updateMarketPrices();
      this.updatePositions();
      this.updateAccountEquity();
      this.sendMarketUpdates();
    }, 2000);

    // Heartbeat every 30 seconds
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        const uptime = this.connectionStartTime 
          ? Math.floor((Date.now() - this.connectionStartTime.getTime()) / 1000)
          : 0;
        
        console.log(`MT5 Terminal: Heartbeat - Connection active (${uptime}s uptime)`);
        this.emit('heartbeat', { uptime, timestamp: new Date() });
      }
    }, 30000);

    // Send initial data
    setTimeout(() => {
      if (this.accountData) {
        this.emit('account_info', this.accountData);
      }
      this.emit('position_update', this.positions);
      this.emit('symbols_loaded', Object.keys(this.symbols));
    }, 1000);

    console.log('MT5 Terminal: Real-time data feeds started');
  }

  private updateMarketPrices(): void {
    const marketOpenHour = new Date().getUTCHours();
    const isMarketActive = marketOpenHour >= 0 && marketOpenHour < 24; // 24h market for demo

    Object.keys(this.symbols).forEach(symbolName => {
      const symbol = this.symbols[symbolName];
      
      // More realistic price movements during market hours
      const volatilityMultiplier = isMarketActive ? 1.0 : 0.3;
      const maxChange = this.getSymbolVolatility(symbolName) * volatilityMultiplier;
      const change = (Math.random() - 0.5) * maxChange;
      
      const newBid = Math.max(symbol.point, symbol.bid + change);
      const newAsk = newBid + symbol.spread;

      this.symbols[symbolName] = {
        ...symbol,
        bid: Number(newBid.toFixed(symbol.digits)),
        ask: Number(newAsk.toFixed(symbol.digits)),
        lastUpdate: new Date(),
      };
    });
  }

  private getSymbolVolatility(symbol: string): number {
    // Realistic volatility per symbol type
    if (symbol.includes('JPY')) return 0.15;
    if (symbol.includes('USD') && !symbol.includes('JPY')) return 0.003;
    if (symbol === 'XAUUSD') return 2.0;
    if (symbol === 'BTCUSD') return 150.0;
    return 0.002; // Default forex volatility
  }

  private updatePositions(): void {
    this.positions = this.positions.map(position => {
      const symbol = this.symbols[position.symbol];
      if (!symbol) return position;

      const currentPrice = position.type === 'BUY' ? symbol.bid : symbol.ask;
      const priceDiff = position.type === 'BUY' 
        ? currentPrice - position.openPrice 
        : position.openPrice - currentPrice;
      
      const profit = priceDiff * position.volume * 100000;
      
      // Add small swap charges for positions held overnight
      const hoursHeld = (Date.now() - position.openTime.getTime()) / (1000 * 60 * 60);
      const swapCharge = hoursHeld > 24 ? -0.50 : 0.00;

      return {
        ...position,
        currentPrice: Number(currentPrice.toFixed(symbol.digits)),
        profit: Number(profit.toFixed(2)),
        swap: Number(swapCharge.toFixed(2)),
      };
    });
  }

  private updateAccountEquity(): void {
    if (!this.accountData) return;

    const totalProfit = this.positions.reduce((sum, pos) => sum + pos.profit + pos.swap, 0);
    const newEquity = this.accountData.balance + totalProfit;
    
    // Calculate margin (simplified)
    const totalVolume = this.positions.reduce((sum, pos) => sum + pos.volume, 0);
    const requiredMargin = totalVolume * 1000; // Simplified margin calculation
    
    this.accountData = {
      ...this.accountData,
      equity: Number(newEquity.toFixed(2)),
      margin: Number(requiredMargin.toFixed(2)),
      freeMargin: Number((newEquity - requiredMargin).toFixed(2)),
      marginLevel: requiredMargin > 0 ? Number(((newEquity / requiredMargin) * 100).toFixed(2)) : 0,
    };
  }

  private sendMarketUpdates(): void {
    // Emit tick data for subscribed symbols
    Object.values(this.symbols).forEach(symbol => {
      this.emit('tick', symbol);
    });

    // Emit position updates
    this.emit('position_update', this.positions);

    // Emit account updates
    if (this.accountData) {
      this.emit('account_info', this.accountData);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  disconnect(): void {
    console.log('MT5 Terminal: Disconnecting from server...');
    this.isConnected = false;
    this.connectionStartTime = null;
    
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
    this.credentials = null;
    
    this.emit('disconnected', { timestamp: new Date() });
    console.log('MT5 Terminal: Disconnected successfully');
  }

  // Enhanced trading execution
  async executeTrade(request: MT5TradeRequest): Promise<MT5TradeResult> {
    if (!this.isConnected) {
      throw new Error('Not connected to MT5 server');
    }

    if (!this.accountData) {
      throw new Error('Account data not available');
    }

    console.log('MT5 Terminal: Processing trade request:', {
      symbol: request.symbol,
      type: request.type,
      volume: request.volume
    });

    // Validate trade request
    const validation = this.validateTradeRequest(request);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Simulate realistic execution delay
    await this.delay(800 + Math.random() * 400);

    const symbol = this.symbols[request.symbol];
    if (!symbol) {
      throw new Error(`Symbol ${request.symbol} not available`);
    }

    // Check available margin
    const requiredMargin = request.volume * 1000; // Simplified
    if (this.accountData.freeMargin < requiredMargin) {
      throw new Error('Insufficient margin for this trade');
    }

    // Execute the trade
    const executionPrice = request.type === 'BUY' ? symbol.ask : symbol.bid;
    const commission = -Math.abs(request.volume * 0.7);
    
    const newPosition: MT5Position = {
      ticket: Date.now() + Math.floor(Math.random() * 1000),
      symbol: request.symbol,
      type: request.type,
      volume: request.volume,
      openPrice: executionPrice,
      currentPrice: executionPrice,
      profit: 0,
      swap: 0,
      commission: commission,
      comment: request.comment || `${request.type} ${request.volume} ${request.symbol}`,
      openTime: new Date(),
    };

    this.positions.push(newPosition);
    
    // Update account balance
    this.accountData.balance += commission;
    
    // Emit updates
    this.updateAccountEquity();
    this.emit('position_update', this.positions);
    this.emit('account_info', this.accountData);

    console.log('MT5 Terminal: Trade executed successfully:', {
      ticket: newPosition.ticket,
      symbol: request.symbol,
      type: request.type,
      volume: request.volume,
      price: executionPrice
    });

    return {
      retcode: 10009, // TRADE_RETCODE_DONE
      deal: newPosition.ticket,
      volume: request.volume,
      price: executionPrice,
      bid: symbol.bid,
      ask: symbol.ask,
      comment: 'Trade executed successfully',
      request_id: Date.now(),
    };
  }

  private validateTradeRequest(request: MT5TradeRequest): { isValid: boolean; error?: string } {
    if (request.volume <= 0) {
      return { isValid: false, error: 'Invalid volume: must be greater than 0' };
    }

    if (request.volume > 100) {
      return { isValid: false, error: 'Volume too large: maximum 100 lots for demo accounts' };
    }

    if (!this.symbols[request.symbol]) {
      return { isValid: false, error: `Symbol ${request.symbol} not available` };
    }

    return { isValid: true };
  }

  // Public API methods
  async getAccountInfo(): Promise<MT5AccountInfo> {
    if (!this.isConnected || !this.accountData) {
      throw new Error('Not connected to MT5 server');
    }
    return Promise.resolve({ ...this.accountData });
  }

  async getPositions(): Promise<MT5Position[]> {
    if (!this.isConnected) {
      throw new Error('Not connected to MT5 server');
    }
    return Promise.resolve([...this.positions]);
  }

  async getSymbolInfo(symbol: string): Promise<MT5Symbol> {
    if (!this.isConnected) {
      throw new Error('Not connected to MT5 server');
    }

    const symbolData = this.symbols[symbol];
    if (!symbolData) {
      throw new Error(`Symbol ${symbol} not found`);
    }

    return Promise.resolve({ ...symbolData });
  }

  async subscribeToSymbol(symbol: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Not connected to MT5 server');
    }

    if (!this.symbols[symbol]) {
      // Add new symbol if requested
      this.symbols[symbol] = {
        name: symbol,
        bid: 1.0000,
        ask: 1.0002,
        spread: 0.0002,
        digits: 5,
        point: 0.00001,
        lastUpdate: new Date(),
      };
      console.log(`MT5 Terminal: Subscribed to new symbol: ${symbol}`);
    }
  }

  async unsubscribeFromSymbol(symbol: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Not connected to MT5 server');
    }
    console.log(`MT5 Terminal: Unsubscribed from symbol: ${symbol}`);
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

  // Status methods
  isConnectedToMT5(): boolean {
    return this.isConnected;
  }

  getCurrentCredentials(): MT5Credentials | null {
    return this.credentials ? { ...this.credentials } : null;
  }

  getConnectionInfo(): { server?: string; login?: string; connected: boolean; uptime?: number } {
    return {
      server: this.credentials?.server,
      login: this.credentials?.login,
      connected: this.isConnected,
      uptime: this.connectionStartTime 
        ? Math.floor((Date.now() - this.connectionStartTime.getTime()) / 1000)
        : 0
    };
  }

  getDemoServers(): typeof MT5_DEMO_SERVERS {
    return [...MT5_DEMO_SERVERS];
  }
}

export const mt5Service = new MT5Service();