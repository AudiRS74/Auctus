import { EventEmitter } from 'events';

export interface MT5Credentials {
  server: string;
  login: string;
  password: string;
}

export interface MT5AccountInfo {
  balance: number;
  equity: number;
  freeMargin: number;
  leverage: number;
  currency: string;
  company: string;
  name: string;
  server: string;
}

export interface MT5Position {
  ticket: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  volume: number;
  price: number;
  profit: number;
  swap: number;
  commission: number;
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

export interface TradeRequest {
  action: 'DEAL';
  symbol: string;
  volume: number;
  type: 'BUY' | 'SELL';
  comment?: string;
}

export interface TradeResult {
  deal?: number;
  price: number;
  volume: number;
  retcode: number;
}

class MT5Service extends EventEmitter {
  private connected: boolean = false;
  private credentials: MT5Credentials | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3;
  private mockData: boolean = true; // Always use mock data for demo

  constructor() {
    super();
    console.log('MT5Service initialized in demo mode');
  }

  async connect(credentials: MT5Credentials): Promise<boolean> {
    try {
      console.log('MT5Service: Attempting connection...', { 
        server: credentials.server, 
        login: credentials.login 
      });

      // Validate inputs
      if (!credentials.server?.trim()) {
        throw new Error('Server name is required');
      }
      if (!credentials.login?.trim()) {
        throw new Error('Account number is required');
      }
      if (!credentials.password) {
        throw new Error('Password is required');
      }

      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For demo purposes, always succeed but validate reasonable inputs
      if (credentials.server.length < 3) {
        throw new Error('Invalid server name format');
      }
      if (credentials.login.length < 4) {
        throw new Error('Invalid account number format');
      }

      this.credentials = credentials;
      this.connected = true;
      this.reconnectAttempts = 0;

      console.log('MT5Service: Connection successful');
      this.emit('connected');

      // Start mock data simulation
      this.startMockDataSimulation();

      return true;
    } catch (error) {
      console.error('MT5Service: Connection failed', error);
      this.connected = false;
      this.emit('error', error);
      throw error;
    }
  }

  private startMockDataSimulation() {
    // Simulate account info
    setTimeout(() => {
      const mockAccountInfo: MT5AccountInfo = {
        balance: 10000.00,
        equity: 10000.00 + (Math.random() - 0.5) * 100,
        freeMargin: 9500.00,
        leverage: 100,
        currency: 'USD',
        company: 'Demo Server',
        name: this.credentials?.login || 'Demo Account',
        server: this.credentials?.server || 'Demo-Server',
      };
      this.emit('account_info', mockAccountInfo);
    }, 500);

    // Simulate market data
    this.simulateMarketData();
  }

  private simulateMarketData() {
    const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];
    const baseRates: { [key: string]: number } = {
      'EURUSD': 1.0850,
      'GBPUSD': 1.2650,
      'USDJPY': 149.50,
      'AUDUSD': 0.6750,
      'USDCAD': 1.3650
    };

    symbols.forEach(symbol => {
      const baseRate = baseRates[symbol] || 1.0000;
      const variation = (Math.random() - 0.5) * 0.001;
      const bid = baseRate + variation;
      const ask = bid + 0.00015; // 1.5 pip spread
      
      const symbolData: MT5Symbol = {
        name: symbol,
        bid: Number(bid.toFixed(5)),
        ask: Number(ask.toFixed(5)),
        spread: Number(((ask - bid) * 100000).toFixed(1)),
        digits: 5,
        point: 0.00001,
        last: Number(bid.toFixed(5)),
        volume: Math.floor(Math.random() * 1000000),
      };

      this.emit('tick', symbolData);
    });

    // Continue simulation if connected
    if (this.connected) {
      setTimeout(() => this.simulateMarketData(), 2000);
    }
  }

  disconnect(): void {
    console.log('MT5Service: Disconnecting...');
    this.connected = false;
    this.credentials = null;
    this.emit('disconnected');
  }

  isConnectedToMT5(): boolean {
    return this.connected;
  }

  async getAccountInfo(): Promise<MT5AccountInfo> {
    if (!this.connected) {
      throw new Error('Not connected to MT5');
    }

    // Return mock account info
    return {
      balance: 10000.00 + (Math.random() - 0.5) * 200,
      equity: 10000.00 + (Math.random() - 0.5) * 150,
      freeMargin: 9500.00 + (Math.random() - 0.5) * 300,
      leverage: 100,
      currency: 'USD',
      company: 'Demo Server',
      name: this.credentials?.login || 'Demo Account',
      server: this.credentials?.server || 'Demo-Server',
    };
  }

  async getPositions(): Promise<MT5Position[]> {
    if (!this.connected) {
      return [];
    }

    // Return mock positions (sometimes empty, sometimes with data)
    const hasPositions = Math.random() > 0.7;
    if (!hasPositions) return [];

    return [
      {
        ticket: Math.floor(Math.random() * 1000000),
        symbol: 'EURUSD',
        type: Math.random() > 0.5 ? 'BUY' : 'SELL',
        volume: 0.1,
        price: 1.0850 + (Math.random() - 0.5) * 0.01,
        profit: (Math.random() - 0.5) * 50,
        swap: 0.00,
        commission: -0.50,
      }
    ];
  }

  async subscribeToSymbol(symbol: string): Promise<void> {
    console.log(`MT5Service: Subscribed to ${symbol}`);
    // Mock subscription - no real connection needed
    return Promise.resolve();
  }

  async executeTrade(request: TradeRequest): Promise<TradeResult> {
    if (!this.connected) {
      throw new Error('Not connected to MT5');
    }

    console.log('MT5Service: Executing trade', request);

    // Simulate trade execution delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock trade result
    const result: TradeResult = {
      deal: Math.floor(Math.random() * 1000000),
      price: 1.0850 + (Math.random() - 0.5) * 0.001,
      volume: request.volume,
      retcode: 10009, // TRADE_RETCODE_DONE
    };

    console.log('MT5Service: Trade executed', result);
    return result;
  }
}

export const mt5Service = new MT5Service();