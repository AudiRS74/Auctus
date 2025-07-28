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
    console.log('Attempting to connect to MT5 with server:', credentials.server);
    
    try {
      this.credentials = credentials;
      
      // Pre-validate credentials before attempting connection
      const validationError = this.validateCredentials(credentials);
      if (validationError) {
        console.error('Credential validation failed:', validationError);
        throw new Error(validationError);
      }
      
      // Get broker API URL with enhanced mapping
      const apiUrl = this.getBrokerApiUrl(credentials.server);
      
      if (!apiUrl) {
        const errorMsg = `Cannot find API endpoint for broker server: ${credentials.server}. Please verify the server name with your broker.`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      console.log('Connecting to API URL:', apiUrl);

      // Establish WebSocket connection with retry logic
      await this.connectWebSocketWithRetry(apiUrl, credentials);
      
      // Authenticate with the broker using improved authentication
      console.log('WebSocket connected, starting authentication...');
      const authResult = await this.authenticate(credentials);
      
      if (authResult.success) {
        console.log('Authentication successful, connection established');
        this.isConnected = true;
        this.startHeartbeat();
        this.emit('connected', { credentials });
        return true;
      } else {
        console.error('Authentication failed:', authResult.error);
        // Close WebSocket if authentication failed
        if (this.websocket) {
          this.websocket.close();
          this.websocket = null;
        }
        throw new Error(authResult.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('MT5 Connection Error:', error);
      this.isConnected = false;
      
      // Cleanup on connection failure
      if (this.websocket) {
        this.websocket.close();
        this.websocket = null;
      }
      
      // Emit error event with detailed information
      this.emit('error', {
        type: 'connection_error',
        message: error instanceof Error ? error.message : 'Unknown connection error',
        server: credentials.server,
        timestamp: new Date()
      });
      
      throw error;
    }
  }

  private async connectWebSocketWithRetry(apiUrl: string, credentials: MT5Credentials): Promise<void> {
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        await this.connectWebSocket(apiUrl, credentials);
        return; // Success, exit retry loop
      } catch (error) {
        retryCount++;
        console.error(`WebSocket connection attempt ${retryCount} failed:`, error);
        
        if (retryCount >= maxRetries) {
          throw new Error(`Failed to establish connection after ${maxRetries} attempts. ${error instanceof Error ? error.message : 'Connection error'}`);
        }
        
        // Wait before retry (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
        console.log(`Retrying connection in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
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
    console.log('Resolving API URL for server:', server);
    
    // Normalize server name for better matching
    const serverLower = server.toLowerCase().trim();
    
    // Map common broker servers to their API endpoints
    const brokerEndpoints: { [key: string]: string } = {
      // MetaQuotes official demo servers
      'metaquotes-demo': 'wss://mt5-demo-01.metaquotes.net:443/ws',
      'metaquotes-demo01': 'wss://mt5-demo-01.metaquotes.net:443/ws',
      'metaquotes-demo02': 'wss://mt5-demo-02.metaquotes.net:443/ws',
      'metaquotes-demo03': 'wss://mt5-demo-03.metaquotes.net:443/ws',
      
      // Popular broker patterns (these would need to be updated with real endpoints)
      // IC Markets
      'icmarkets-demo': 'wss://webapi-demo.icmarkets.com/ws',
      'icmarkets-live': 'wss://webapi.icmarkets.com/ws',
      'icmarkets-live01': 'wss://webapi.icmarkets.com/ws',
      'icmarkets-live02': 'wss://webapi2.icmarkets.com/ws',
      
      // XM
      'xm-demo': 'wss://mt5-demo.xm.com/ws',
      'xm-real': 'wss://mt5.xm.com/ws',
      'xm-live': 'wss://mt5.xm.com/ws',
      
      // XTB
      'xtb-demo': 'wss://ws-demo.xtb.com/mt5',
      'xtb-real': 'wss://ws.xtb.com/mt5',
      
      // FXCM
      'fxcm-demo': 'wss://demo-api.fxcm.com/ws',
      'fxcm-real': 'wss://api.fxcm.com/ws',
      
      // Oanda
      'oanda-demo': 'wss://stream-fxpractice.oanda.com/ws',
      'oanda-live': 'wss://stream-fxtrade.oanda.com/ws',
      
      // FXTM
      'fxtm-demo': 'wss://demo-mt5.fxtm.com/ws',
      'fxtm-live': 'wss://mt5.fxtm.com/ws',
      
      // Exness
      'exness-demo': 'wss://demo-mt5.exness.com/ws',
      'exness-real': 'wss://mt5.exness.com/ws',
      
      // Pepperstone
      'pepperstone-demo': 'wss://demo-mt5.pepperstone.com/ws',
      'pepperstone-live': 'wss://mt5.pepperstone.com/ws',
    };
    
    // Try exact match first
    let apiUrl = brokerEndpoints[serverLower];
    
    if (!apiUrl) {
      // Try pattern matching for common server naming conventions
      for (const [pattern, url] of Object.entries(brokerEndpoints)) {
        if (serverLower.includes(pattern.split('-')[0])) {
          console.log(`Matched server pattern: ${pattern} for ${server}`);
          apiUrl = url;
          break;
        }
      }
    }
    
    // If still no match, try to construct a reasonable default
    if (!apiUrl) {
      console.log('No specific endpoint found, constructing default URL');
      
      // Extract broker name from server string
      const brokerName = serverLower.split('-')[0];
      
      // Check if it's a demo or live server
      const isDemo = serverLower.includes('demo') || serverLower.includes('test');
      const subdomain = isDemo ? 'demo-mt5' : 'mt5';
      
      // Try different common URL patterns
      const possibleUrls = [
        `wss://${subdomain}.${brokerName}.com/ws`,
        `wss://webapi${isDemo ? '-demo' : ''}.${brokerName}.com/ws`,
        `wss://mt5${isDemo ? '-demo' : ''}.${brokerName}.com/ws`,
        `wss://api${isDemo ? '-demo' : ''}.${brokerName}.com/mt5/ws`,
      ];
      
      // For now, return the first constructed URL
      // In a real implementation, you might want to test connectivity
      apiUrl = possibleUrls[0];
      
      console.log(`Constructed API URL: ${apiUrl} for server: ${server}`);
    }
    
    return apiUrl;
  }

    private async connectWebSocket(apiUrl: string, credentials: MT5Credentials): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('Creating WebSocket connection to:', apiUrl);
        
        // Clean up existing connection if any
        if (this.websocket) {
          this.websocket.close();
          this.websocket = null;
        }
        
        this.websocket = new WebSocket(apiUrl);
        
        const connectionTimeout = setTimeout(() => {
          if (this.websocket && this.websocket.readyState !== WebSocket.OPEN) {
            console.error('WebSocket connection timeout');
            this.websocket.close();
            reject(new Error(`Connection timeout to ${credentials.server}. Please check your internet connection and verify the server name with your broker.`));
          }
        }, 12000); // Increased timeout for slower connections
        
        this.websocket.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log('MT5 WebSocket connection established successfully');
          resolve();
        };
        
        this.websocket.onmessage = (event) => {
          try {
            this.handleWebSocketMessage(event.data);
          } catch (error) {
            console.error('Error handling WebSocket message:', error);
          }
        };
        
        this.websocket.onclose = (event) => {
          clearTimeout(connectionTimeout);
          console.log('MT5 WebSocket connection closed:', event.code, event.reason);
          
          // Provide specific error messages based on close codes
          if (event.code === 1006) {
            console.error('WebSocket closed abnormally - possible network issue or server unavailable');
          } else if (event.code === 1002) {
            console.error('WebSocket closed due to protocol error');
          } else if (event.code === 1003) {
            console.error('WebSocket closed due to unsupported data type');
          }
          
          this.handleDisconnection();
        };
        
        this.websocket.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.error('MT5 WebSocket connection error:', error);
          
          // Provide more helpful error messages
          let errorMessage = 'Failed to connect to broker server';
          
          if (apiUrl.includes('demo')) {
            errorMessage += '. If using a demo account, verify the demo server name with your broker';
          } else {
            errorMessage += '. If using a live account, verify the live server name with your broker';
          }
          
          errorMessage += `. Server: ${credentials.server}`;
          
          reject(new Error(errorMessage));
        };
        
      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        reject(error);
      }
    });
  }

    private async authenticate(credentials: MT5Credentials): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
        throw new Error('WebSocket connection not established');
      }

      // Validate credentials format before attempting authentication
      const validationError = this.validateCredentials(credentials);
      if (validationError) {
        return { success: false, error: validationError };
      }

      // Determine broker-specific authentication method
      const authMethod = this.getBrokerAuthMethod(credentials.server);
      
      return new Promise((resolve) => {
        // Increased timeout for broker authentication
        const timeout = setTimeout(() => {
          resolve({ 
            success: false, 
            error: 'Authentication timeout. Please check your internet connection and broker server status.' 
          });
        }, 15000); // Increased to 15 seconds

        const handleAuthResponse = (data: any) => {
          clearTimeout(timeout);
          if (data.type === 'auth_response' || data.type === 'login_response') {
            if (data.success) {
              resolve({ success: true });
            } else {
              // Provide specific error messages based on broker response
              const errorMsg = this.parseAuthenticationError(data.error, data.errorCode);
              resolve({ success: false, error: errorMsg });
            }
          }
        };

        // Set up response handler
        this.once('message', handleAuthResponse);

        // Send broker-specific authentication request
        const authRequest = this.createAuthRequest(credentials, authMethod);
        console.log('Sending authentication request for broker:', credentials.server);
        
        this.websocket!.send(JSON.stringify(authRequest));
      });
    } catch (error) {
      console.error('Authentication error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication process failed' 
      };
    }
  }

  private validateCredentials(credentials: MT5Credentials): string | null {
    // Validate server format
    if (!credentials.server || credentials.server.trim().length === 0) {
      return 'Server name is required. Please enter your broker\'s server name (e.g., YourBroker-Demo, YourBroker-Live01)';
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

  private getBrokerAuthMethod(server: string): string {
    const serverLower = server.toLowerCase();
    
    // Different brokers may use different authentication methods
    if (serverLower.includes('metaquotes') || serverLower.includes('demo')) {
      return 'standard';
    } else if (serverLower.includes('icmarkets')) {
      return 'icmarkets';
    } else if (serverLower.includes('xm') || serverLower.includes('xtb')) {
      return 'european';
    } else if (serverLower.includes('oanda') || serverLower.includes('fxcm')) {
      return 'us_regulated';
    } else {
      return 'standard'; // Default method
    }
  }

  private createAuthRequest(credentials: MT5Credentials, authMethod: string): any {
    const baseRequest = {
      timestamp: Date.now(),
      client_version: '1.0.0',
      platform: 'mobile_app'
    };

    switch (authMethod) {
      case 'icmarkets':
        return {
          ...baseRequest,
          type: 'login',
          account: parseInt(credentials.login),
          password: credentials.password,
          server: credentials.server,
          protocol_version: '2.0'
        };
      
      case 'european':
        return {
          ...baseRequest,
          type: 'authenticate',
          login: credentials.login,
          password: credentials.password,
          server_name: credentials.server,
          auth_type: 'mt5_native'
        };
      
      case 'us_regulated':
        return {
          ...baseRequest,
          type: 'connect',
          credentials: {
            account_id: credentials.login,
            password: credentials.password,
            server: credentials.server,
          },
          compliance_check: true
        };
      
      default: // standard
        return {
          ...baseRequest,
          type: 'auth',
          login: credentials.login,
          password: credentials.password,
          server: credentials.server
        };
    }
  }

  private parseAuthenticationError(errorMsg: string, errorCode?: number): string {
    // Parse common MT5 authentication error codes and messages
    if (errorCode) {
      switch (errorCode) {
        case 4:
          return 'Invalid login credentials. Please check your account number and password';
        case 5:
          return 'Account disabled or suspended. Please contact your broker';
        case 6:
          return 'Server not found. Please check your server name with your broker';
        case 7:
          return 'Connection rejected by server. Please try again later';
        case 8:
          return 'Invalid account type or trading not allowed';
        case 9:
          return 'Account expired. Please contact your broker to renew';
        case 10:
          return 'Maximum connections exceeded. Close other MT5 connections and try again';
        case 64:
          return 'Account blocked. Please contact your broker immediately';
        case 65:
          return 'Wrong account password. Please check your password';
        case 128:
          return 'Trading disabled for this account. Contact your broker';
        case 129:
          return 'Account not certified. Complete broker verification process';
        case 130:
          return 'Invalid server or server temporarily unavailable';
        default:
          return `Authentication failed (Error ${errorCode}). Please contact your broker for assistance`;
      }
    }

    // Parse common error messages
    if (errorMsg) {
      const msgLower = errorMsg.toLowerCase();
      
      if (msgLower.includes('invalid login') || msgLower.includes('wrong login')) {
        return 'Invalid account number. Please verify your MT5 account number with your broker';
      } else if (msgLower.includes('invalid password') || msgLower.includes('wrong password')) {
        return 'Incorrect password. Please check your MT5 account password';
      } else if (msgLower.includes('server') && msgLower.includes('not found')) {
        return 'Server not found. Please verify the server name with your broker (e.g., YourBroker-Demo, YourBroker-Live01)';
      } else if (msgLower.includes('connection') && msgLower.includes('refused')) {
        return 'Connection refused by server. Check if your account is active and try again';
      } else if (msgLower.includes('timeout')) {
        return 'Connection timeout. Please check your internet connection and broker server status';
      } else if (msgLower.includes('blocked') || msgLower.includes('suspended')) {
        return 'Account blocked or suspended. Please contact your broker immediately';
      } else if (msgLower.includes('expired')) {
        return 'Account or password expired. Please contact your broker to reset';
      }
    }

    // Return original error with additional context
    return `Authentication failed: ${errorMsg || 'Unknown error'}. Please verify your credentials with your broker and ensure your account is active.`;
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