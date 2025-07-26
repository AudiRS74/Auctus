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
  private websocket: WebSocket | null = null;
  private eventHandlers: { [key: string]: Function[] } = {};
  private reconnectInterval: NodeJS.Timeout | null = null;

  async connect(credentials: MT5Credentials): Promise<boolean> {
    try {
      this.credentials = credentials;
      
      // For real implementation, this would connect to the broker's WebAPI
      // Different brokers have different endpoints and authentication methods
      const apiUrl = this.getBrokerApiUrl(credentials.server);
      
      if (!apiUrl) {
        throw new Error(`Unsupported broker server: ${credentials.server}`);
      }

      // Establish WebSocket connection for real-time data
      await this.connectWebSocket(apiUrl, credentials);
      
      // Authenticate with the broker
      const authResult = await this.authenticate(credentials);
      
      if (authResult.success) {
        this.isConnected = true;
        this.startHeartbeat();
        this.emit('connected', { credentials });
        return true;
      } else {
        throw new Error(authResult.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('MT5 Connection Error:', error);
      this.isConnected = false;
      throw error;
    }
  }

  disconnect(): void {
    this.isConnected = false;
    
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    
    this.emit('disconnected');
  }

  private getBrokerApiUrl(server: string): string | null {
    // Map common broker servers to their API endpoints
    const brokerEndpoints: { [key: string]: string } = {
      // MetaQuotes demo servers
      'MetaQuotes-Demo': 'wss://mt5-demo-01.metaquotes.net:443/ws',
      'MetaQuotes-Demo02': 'wss://mt5-demo-02.metaquotes.net:443/ws',
      
      // Add real broker endpoints here
      // 'ICMarkets-Demo': 'wss://demo.icmarkets.com/mt5/ws',
      // 'ICMarkets-Live': 'wss://live.icmarkets.com/mt5/ws',
      // 'XM-Demo': 'wss://demo.xm.com/mt5/ws',
      // 'XM-Live': 'wss://live.xm.com/mt5/ws',
      
      // Generic fallback for custom servers
      'default': `wss://${server}/mt5/ws`
    };
    
    return brokerEndpoints[server] || brokerEndpoints['default'];
  }

  private async connectWebSocket(apiUrl: string, credentials: MT5Credentials): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.websocket = new WebSocket(apiUrl);
        
        this.websocket.onopen = () => {
          console.log('MT5 WebSocket connected');
          resolve();
        };
        
        this.websocket.onmessage = (event) => {
          this.handleWebSocketMessage(event.data);
        };
        
        this.websocket.onclose = () => {
          console.log('MT5 WebSocket disconnected');
          this.handleDisconnection();
        };
        
        this.websocket.onerror = (error) => {
          console.error('MT5 WebSocket error:', error);
          reject(error);
        };
        
        // Set connection timeout
        setTimeout(() => {
          if (this.websocket && this.websocket.readyState !== WebSocket.OPEN) {
            reject(new Error('Connection timeout'));
          }
        }, 10000);
        
      } catch (error) {
        reject(error);
      }
    });
  }

  private async authenticate(credentials: MT5Credentials): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
        throw new Error('WebSocket not connected');
      }

      // Send authentication request
      const authRequest = {
        type: 'auth',
        login: credentials.login,
        password: credentials.password,
        server: credentials.server,
        timestamp: Date.now()
      };

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve({ success: false, error: 'Authentication timeout' });
        }, 5000);

        const handleAuthResponse = (data: any) => {
          clearTimeout(timeout);
          if (data.type === 'auth_response') {
            resolve({
              success: data.success,
              error: data.error
            });
          }
        };

        this.once('message', handleAuthResponse);
        this.websocket!.send(JSON.stringify(authRequest));
      });
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Authentication failed' };
    }
  }

  private handleWebSocketMessage(data: string): void {
    try {
      const message = JSON.parse(data);
      this.emit('message', message);
      
      switch (message.type) {
        case 'tick':
          this.emit('tick', message.data);
          break;
        case 'account_info':
          this.emit('account_info', message.data);
          break;
        case 'position_update':
          this.emit('position_update', message.data);
          break;
        case 'trade_result':
          this.emit('trade_result', message.data);
          break;
        case 'error':
          this.emit('error', message.data);
          break;
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  private handleDisconnection(): void {
    this.isConnected = false;
    this.emit('disconnected');
    
    // Auto-reconnect if credentials are available
    if (this.credentials) {
      this.reconnectInterval = setTimeout(() => {
        console.log('Attempting to reconnect to MT5...');
        this.connect(this.credentials!).catch(console.error);
      }, 5000);
    }
  }

  private startHeartbeat(): void {
    const heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      } else {
        clearInterval(heartbeatInterval);
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  async getAccountInfo(): Promise<MT5AccountInfo> {
    if (!this.isConnected) {
      throw new Error('Not connected to MT5');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 5000);

      this.once('account_info', (data: MT5AccountInfo) => {
        clearTimeout(timeout);
        resolve(data);
      });

      this.sendRequest({ type: 'get_account_info' });
    });
  }

  async getPositions(): Promise<MT5Position[]> {
    if (!this.isConnected) {
      throw new Error('Not connected to MT5');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 5000);

      this.once('positions', (data: MT5Position[]) => {
        clearTimeout(timeout);
        resolve(data);
      });

      this.sendRequest({ type: 'get_positions' });
    });
  }

  async getSymbolInfo(symbol: string): Promise<MT5Symbol> {
    if (!this.isConnected) {
      throw new Error('Not connected to MT5');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 5000);

      this.once('symbol_info', (data: MT5Symbol) => {
        clearTimeout(timeout);
        resolve(data);
      });

      this.sendRequest({ type: 'get_symbol_info', symbol });
    });
  }

  async executeTrade(request: MT5TradeRequest): Promise<MT5TradeResult> {
    if (!this.isConnected) {
      throw new Error('Not connected to MT5');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Trade execution timeout'));
      }, 10000);

      this.once('trade_result', (data: MT5TradeResult) => {
        clearTimeout(timeout);
        
        if (data.retcode === 10009) { // TRADE_RETCODE_DONE
          resolve(data);
        } else {
          reject(new Error(`Trade failed with code: ${data.retcode}, ${data.comment || ''}`));
        }
      });

      this.sendRequest({
        type: 'trade',
        request: {
          ...request,
          magic: request.magic || 12345, // Default magic number
          deviation: 10, // Default deviation in points
          type_filling: 'FOK', // Fill or Kill
          type_time: 'GTC' // Good Till Cancelled
        }
      });
    });
  }

  async subscribeToSymbol(symbol: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Not connected to MT5');
    }

    this.sendRequest({
      type: 'subscribe',
      symbol,
      subscription_type: 'ticks'
    });
  }

  async unsubscribeFromSymbol(symbol: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Not connected to MT5');
    }

    this.sendRequest({
      type: 'unsubscribe',
      symbol
    });
  }

  private sendRequest(request: any): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        ...request,
        id: Date.now() + Math.random(),
        timestamp: Date.now()
      }));
    } else {
      throw new Error('WebSocket not connected');
    }
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