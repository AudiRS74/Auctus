export interface BrokerCredentials {
  apiKey: string;
  accountId: string;
  environment: 'sandbox' | 'live';
  server?: string;
}

export interface BrokerAccount {
  id: string;
  currency: string;
  balance: number;
  equity: number;
  unrealizedPL: number;
  realizedPL: number;
  marginUsed: number;
  marginAvailable: number;
  marginRate: number;
  openTradeCount: number;
  openPositionCount: number;
  lastTransactionId: string;
}

export interface BrokerPosition {
  id: string;
  instrument: string;
  side: 'long' | 'short';
  units: number;
  averagePrice: number;
  unrealizedPL: number;
  openTime: Date;
}

export interface BrokerOrder {
  id: string;
  instrument: string;
  units: number;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_loss' | 'take_profit';
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  timeInForce: 'GTC' | 'IOC' | 'FOK' | 'GTD';
  state: 'pending' | 'filled' | 'cancelled' | 'rejected';
  createTime: Date;
  fillTime?: Date;
  filledPrice?: number;
}

export interface TradeRequest {
  instrument: string;
  units: number;
  type: 'market' | 'limit' | 'stop';
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
}

export interface TradeResult {
  orderId: string;
  transactionId: string;
  price?: number;
  time: Date;
  units: number;
  instrument: string;
  reason: string;
  pl?: number;
}

class OandaProvider {
  private apiKey: string;
  private accountId: string;
  private baseUrl: string;
  private environment: 'sandbox' | 'live';
  private connected = false;

  constructor(credentials: BrokerCredentials) {
    this.apiKey = credentials.apiKey;
    this.accountId = credentials.accountId;
    this.environment = credentials.environment;
    this.baseUrl = credentials.environment === 'live' 
      ? 'https://api-fxtrade.oanda.com'
      : 'https://api-fxpractice.oanda.com';
  }

  async connect(): Promise<boolean> {
    try {
      console.log(`Connecting to OANDA ${this.environment} environment...`);
      
      // Test connection by fetching account info
      const response = await fetch(`${this.baseUrl}/v3/accounts/${this.accountId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.errorMessage || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.account) {
        throw new Error('Invalid account response from OANDA');
      }

      this.connected = true;
      console.log(`Successfully connected to OANDA ${this.environment} account: ${data.account.id}`);
      return true;
    } catch (error) {
      console.error('OANDA connection failed:', error);
      this.connected = false;
      throw error;
    }
  }

  async getAccount(): Promise<BrokerAccount> {
    if (!this.connected) {
      throw new Error('Not connected to OANDA');
    }

    try {
      const response = await fetch(`${this.baseUrl}/v3/accounts/${this.accountId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const account = data.account;

      return {
        id: account.id,
        currency: account.currency,
        balance: parseFloat(account.balance),
        equity: parseFloat(account.NAV),
        unrealizedPL: parseFloat(account.unrealizedPL),
        realizedPL: parseFloat(account.pl),
        marginUsed: parseFloat(account.marginUsed),
        marginAvailable: parseFloat(account.marginAvailable),
        marginRate: parseFloat(account.marginRate),
        openTradeCount: account.openTradeCount,
        openPositionCount: account.openPositionCount,
        lastTransactionId: account.lastTransactionID,
      };
    } catch (error) {
      console.error('Failed to get account info:', error);
      throw error;
    }
  }

  async getPositions(): Promise<BrokerPosition[]> {
    if (!this.connected) {
      throw new Error('Not connected to OANDA');
    }

    try {
      const response = await fetch(`${this.baseUrl}/v3/accounts/${this.accountId}/positions`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const positions: BrokerPosition[] = [];

      for (const position of data.positions) {
        const longUnits = parseInt(position.long.units);
        const shortUnits = parseInt(position.short.units);

        if (longUnits > 0) {
          positions.push({
            id: `${position.instrument}_long`,
            instrument: position.instrument,
            side: 'long',
            units: longUnits,
            averagePrice: parseFloat(position.long.averagePrice),
            unrealizedPL: parseFloat(position.long.unrealizedPL),
            openTime: new Date(), // OANDA doesn't provide position open time directly
          });
        }

        if (shortUnits < 0) {
          positions.push({
            id: `${position.instrument}_short`,
            instrument: position.instrument,
            side: 'short',
            units: Math.abs(shortUnits),
            averagePrice: parseFloat(position.short.averagePrice),
            unrealizedPL: parseFloat(position.short.unrealizedPL),
            openTime: new Date(),
          });
        }
      }

      return positions;
    } catch (error) {
      console.error('Failed to get positions:', error);
      throw error;
    }
  }

  async getOrders(): Promise<BrokerOrder[]> {
    if (!this.connected) {
      throw new Error('Not connected to OANDA');
    }

    try {
      const response = await fetch(`${this.baseUrl}/v3/accounts/${this.accountId}/orders`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return data.orders.map((order: any) => ({
        id: order.id,
        instrument: order.instrument,
        units: Math.abs(parseInt(order.units)),
        side: parseInt(order.units) > 0 ? 'buy' : 'sell',
        type: order.type.toLowerCase(),
        price: order.price ? parseFloat(order.price) : undefined,
        stopLoss: order.stopLossOnFill?.price ? parseFloat(order.stopLossOnFill.price) : undefined,
        takeProfit: order.takeProfitOnFill?.price ? parseFloat(order.takeProfitOnFill.price) : undefined,
        timeInForce: order.timeInForce,
        state: order.state.toLowerCase(),
        createTime: new Date(order.createTime),
        fillTime: order.filledTime ? new Date(order.filledTime) : undefined,
        filledPrice: order.filledPrice ? parseFloat(order.filledPrice) : undefined,
      }));
    } catch (error) {
      console.error('Failed to get orders:', error);
      throw error;
    }
  }

  async executeTrade(request: TradeRequest): Promise<TradeResult> {
    if (!this.connected) {
      throw new Error('Not connected to OANDA');
    }

    console.log('Executing real trade on OANDA:', request);

    try {
      const orderRequest: any = {
        order: {
          type: request.type.toUpperCase(),
          instrument: request.instrument,
          units: request.units.toString(),
          timeInForce: request.timeInForce || 'GTC',
        },
      };

      if (request.price) {
        orderRequest.order.price = request.price.toString();
      }

      if (request.stopLoss) {
        orderRequest.order.stopLossOnFill = {
          price: request.stopLoss.toString(),
        };
      }

      if (request.takeProfit) {
        orderRequest.order.takeProfitOnFill = {
          price: request.takeProfit.toString(),
        };
      }

      const response = await fetch(`${this.baseUrl}/v3/accounts/${this.accountId}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderRequest),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Trade execution failed: ${errorData.errorMessage || response.statusText}`);
      }

      const data = await response.json();
      const transaction = data.orderCreateTransaction || data.orderFillTransaction;

      return {
        orderId: transaction.id,
        transactionId: transaction.id,
        price: transaction.price ? parseFloat(transaction.price) : undefined,
        time: new Date(transaction.time),
        units: Math.abs(parseInt(transaction.units)),
        instrument: transaction.instrument,
        reason: transaction.reason,
        pl: transaction.pl ? parseFloat(transaction.pl) : undefined,
      };
    } catch (error) {
      console.error('Trade execution failed:', error);
      throw error;
    }
  }

  async closePosition(instrument: string, side?: 'long' | 'short'): Promise<TradeResult> {
    if (!this.connected) {
      throw new Error('Not connected to OANDA');
    }

    try {
      const closeRequest: any = {};
      
      if (side === 'long') {
        closeRequest.longUnits = 'ALL';
      } else if (side === 'short') {
        closeRequest.shortUnits = 'ALL';
      } else {
        closeRequest.longUnits = 'ALL';
        closeRequest.shortUnits = 'ALL';
      }

      const response = await fetch(
        `${this.baseUrl}/v3/accounts/${this.accountId}/positions/${instrument}/close`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(closeRequest),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Position close failed: ${errorData.errorMessage || response.statusText}`);
      }

      const data = await response.json();
      const transaction = data.longOrderFillTransaction || data.shortOrderFillTransaction;

      return {
        orderId: transaction.id,
        transactionId: transaction.id,
        price: parseFloat(transaction.price),
        time: new Date(transaction.time),
        units: Math.abs(parseInt(transaction.units)),
        instrument: transaction.instrument,
        reason: 'POSITION_CLOSE',
        pl: parseFloat(transaction.pl),
      };
    } catch (error) {
      console.error('Position close failed:', error);
      throw error;
    }
  }

  disconnect(): void {
    this.connected = false;
    console.log('Disconnected from OANDA');
  }

  isConnected(): boolean {
    return this.connected;
  }

  getEnvironment(): string {
    return this.environment;
  }
}

class BrokerService {
  private provider: OandaProvider | null = null;
  private eventHandlers: { [key: string]: Function[] } = {};
  private accountUpdateInterval: NodeJS.Timeout | null = null;

  async connect(credentials: BrokerCredentials): Promise<boolean> {
    console.log(`Connecting to ${credentials.environment} broker environment...`);
    
    if (credentials.environment === 'live') {
      console.warn('⚠️  CONNECTING TO LIVE TRADING ENVIRONMENT');
      console.warn('⚠️  REAL MONEY WILL BE AT RISK');
      console.warn('⚠️  ENSURE YOU UNDERSTAND THE RISKS INVOLVED');
    }

    try {
      this.provider = new OandaProvider(credentials);
      await this.provider.connect();
      
      this.startAccountUpdates();
      this.emit('connected', { environment: credentials.environment });
      
      return true;
    } catch (error) {
      console.error('Broker connection failed:', error);
      this.provider = null;
      throw error;
    }
  }

  async getAccount(): Promise<BrokerAccount> {
    if (!this.provider) {
      throw new Error('Not connected to broker');
    }
    return await this.provider.getAccount();
  }

  async getPositions(): Promise<BrokerPosition[]> {
    if (!this.provider) {
      throw new Error('Not connected to broker');
    }
    return await this.provider.getPositions();
  }

  async getOrders(): Promise<BrokerOrder[]> {
    if (!this.provider) {
      throw new Error('Not connected to broker');
    }
    return await this.provider.getOrders();
  }

  async executeTrade(request: TradeRequest): Promise<TradeResult> {
    if (!this.provider) {
      throw new Error('Not connected to broker');
    }

    console.log('🚨 EXECUTING REAL TRADE 🚨');
    console.log('Trade details:', request);
    
    const result = await this.provider.executeTrade(request);
    this.emit('trade_executed', result);
    
    return result;
  }

  async closePosition(instrument: string, side?: 'long' | 'short'): Promise<TradeResult> {
    if (!this.provider) {
      throw new Error('Not connected to broker');
    }

    const result = await this.provider.closePosition(instrument, side);
    this.emit('position_closed', result);
    
    return result;
  }

  private startAccountUpdates(): void {
    if (this.accountUpdateInterval) {
      clearInterval(this.accountUpdateInterval);
    }

    // Update account info every 30 seconds
    this.accountUpdateInterval = setInterval(async () => {
      if (!this.provider) return;

      try {
        const account = await this.provider.getAccount();
        this.emit('account_update', account);

        const positions = await this.provider.getPositions();
        this.emit('positions_update', positions);
      } catch (error) {
        console.error('Failed to update account data:', error);
        this.emit('error', error);
      }
    }, 30000);
  }

  disconnect(): void {
    if (this.accountUpdateInterval) {
      clearInterval(this.accountUpdateInterval);
      this.accountUpdateInterval = null;
    }

    if (this.provider) {
      this.provider.disconnect();
      this.provider = null;
    }

    this.emit('disconnected');
  }

  isConnected(): boolean {
    return this.provider?.isConnected() || false;
  }

  getEnvironment(): string | null {
    return this.provider?.getEnvironment() || null;
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
          console.error(`Error in broker event handler for ${event}:`, error);
        }
      });
    }
  }
}

export const brokerService = new BrokerService();