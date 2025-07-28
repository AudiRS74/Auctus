
import React, { createContext, ReactNode, useState, useEffect } from 'react';
import { mt5Service, MT5Credentials, MT5AccountInfo, MT5Position, MT5Symbol } from '../services/mt5Service';
import { marketDataService, Quote } from '../services/marketDataService';
import { brokerService, BrokerCredentials, BrokerAccount, BrokerPosition } from '../services/brokerService';
import { automationEngine } from '../services/automationEngine';

interface Trade {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  timestamp: Date;
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED';
  profit?: number;
}

interface MT5Config {
  server: string;
  login: string;
  password: string;
  connected: boolean;
}

interface BrokerConfig {
  apiKey: string;
  accountId: string;
  environment: 'sandbox' | 'live';
  connected: boolean;
}

interface TechnicalIndicators {
  rsi: number;
  fibonacciLevels: number[];
  movingAverage: number;
  macd: { signal: number; histogram: number };
}

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
}

interface AutomationStrategy {
  id: string;
  name: string;
  isActive: boolean;
  indicator: 'RSI' | 'MACD' | 'MA' | 'BB' | 'STOCH' | 'ADX';
  symbol: string;
  timeframe: string;
  entryCondition: string;
  exitCondition: string;
  tradeType: 'BUY' | 'SELL' | 'BOTH';
  positionSize: number;
  stopLoss?: number;
  takeProfit?: number;
  createdAt: Date;
  triggeredCount: number;
  successRate: number;
  totalProfit: number;
}

interface AutomationStatus {
  isRunning: boolean;
  activeStrategies: number;
  totalSignals: number;
  lastUpdate: Date | null;
}

interface RealTimeData {
  accountInfo: MT5AccountInfo | BrokerAccount | null;
  positions: MT5Position[] | BrokerPosition[];
  quotes: { [key: string]: Quote };
  lastUpdate: Date | null;
  dataProvider: string | null;
}

interface TradingContextType {
  trades: Trade[];
  mt5Config: MT5Config;
  brokerConfig: BrokerConfig;
  indicators: TechnicalIndicators;
  selectedSymbol: string;
  automationRules: AutomationRule[];
  automationStrategies: AutomationStrategy[];
  automationStatus: AutomationStatus;
  realTimeData: RealTimeData;
  isConnecting: boolean;
  connectionError: string | null;
  tradingMode: 'demo' | 'live';
  executeTrade: (symbol: string, type: 'BUY' | 'SELL', quantity: number) => Promise<void>;
  connectMT5: (config: Omit<MT5Config, 'connected'>) => Promise<void>;
  connectBroker: (config: Omit<BrokerConfig, 'connected'>) => Promise<void>;
  connectMarketData: (provider?: string) => Promise<void>;
  disconnectMT5: () => void;
  disconnectBroker: () => void;
  disconnectMarketData: () => void;
  switchTradingMode: (mode: 'demo' | 'live') => void;
  updateIndicators: (symbol: string) => Promise<void>;
  setSelectedSymbol: (symbol: string) => void;
  addAutomationRule: (name: string, description: string) => void;
  toggleAutomationRule: (id: string) => void;
  deleteAutomationRule: (id: string) => void;
  addAutomationStrategy: (strategy: AutomationStrategy) => void;
  toggleAutomationStrategy: (id: string) => void;
  deleteAutomationStrategy: (id: string) => void;
  startAutomation: () => void;
  stopAutomation: () => void;
  refreshAccountData: () => Promise<void>;
}

export const TradingContext = createContext<TradingContextType | undefined>(undefined);

export function TradingProvider({ children }: { children: ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [mt5Config, setMT5Config] = useState<MT5Config>({
    server: '',
    login: '',
    password: '',
    connected: false,
  });
  const [brokerConfig, setBrokerConfig] = useState<BrokerConfig>({
    apiKey: '',
    accountId: '',
    environment: 'sandbox',
    connected: false,
  });
  const [indicators, setIndicators] = useState<TechnicalIndicators>({
    rsi: 65.4,
    fibonacciLevels: [1.618, 1.382, 1.236, 1.000, 0.786, 0.618, 0.500, 0.382, 0.236],
    movingAverage: 1.2543,
    macd: { signal: 0.0012, histogram: -0.0003 },
  });
  const [selectedSymbol, setSelectedSymbol] = useState('EURUSD');
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [automationStrategies, setAutomationStrategies] = useState<AutomationStrategy[]>([]);
  const [automationStatus, setAutomationStatus] = useState<AutomationStatus>({
    isRunning: false,
    activeStrategies: 0,
    totalSignals: 0,
    lastUpdate: null,
  });
  const [realTimeData, setRealTimeData] = useState<RealTimeData>({
    accountInfo: null,
    positions: [],
    quotes: {},
    lastUpdate: null,
    dataProvider: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [tradingMode, setTradingMode] = useState<'demo' | 'live'>('demo');

  // Set up market data service event listeners
  useEffect(() => {
    const handleMarketDataConnected = (data: { provider: string }) => {
      console.log('Market data connected:', data.provider);
      setRealTimeData(prev => ({
        ...prev,
        dataProvider: data.provider,
      }));
    };

    const handleQuote = (quote: Quote) => {
      setRealTimeData(prev => ({
        ...prev,
        quotes: {
          ...prev.quotes,
          [quote.symbol]: quote,
        },
        lastUpdate: new Date(),
      }));
    };

    const handleMarketDataDisconnected = () => {
      console.log('Market data disconnected');
      setRealTimeData(prev => ({
        ...prev,
        quotes: {},
        dataProvider: null,
      }));
    };

    marketDataService.on('connected', handleMarketDataConnected);
    marketDataService.on('quote', handleQuote);
    marketDataService.on('disconnected', handleMarketDataDisconnected);

    return () => {
      marketDataService.off('connected', handleMarketDataConnected);
      marketDataService.off('quote', handleQuote);
      marketDataService.off('disconnected', handleMarketDataDisconnected);
    };
  }, []);

  // Set up broker service event listeners
  useEffect(() => {
    const handleBrokerConnected = (data: { environment: string }) => {
      console.log('Broker connected:', data.environment);
      setIsConnecting(false);
      setConnectionError(null);
      setBrokerConfig(prev => ({ ...prev, connected: true }));
    };

    const handleAccountUpdate = (account: BrokerAccount) => {
      console.log('Broker account update:', account);
      setRealTimeData(prev => ({
        ...prev,
        accountInfo: account,
        lastUpdate: new Date(),
      }));
    };

    const handlePositionsUpdate = (positions: BrokerPosition[]) => {
      console.log('Broker positions update:', positions);
      setRealTimeData(prev => ({
        ...prev,
        positions,
        lastUpdate: new Date(),
      }));
    };

    const handleTradeExecuted = (result: any) => {
      console.log('Trade executed:', result);
      // Add to trades list
      const newTrade: Trade = {
        id: result.orderId,
        symbol: result.instrument,
        type: result.units > 0 ? 'BUY' : 'SELL',
        quantity: Math.abs(result.units),
        price: result.price || 0,
        // Ensure result.time is a valid Date or can be converted to one. If it's a timestamp, use new Date(result.time).
        // For simplicity, assuming it's already a Date object or can be directly used.
        timestamp: result.time instanceof Date ? result.time : new Date(result.time), 
        status: 'EXECUTED',
        profit: result.pl || 0,
      };
      setTrades(prev => [newTrade, ...prev]);
    };

    const handleBrokerDisconnected = () => {
      console.log('Broker disconnected');
      setBrokerConfig(prev => ({ ...prev, connected: false }));
    };

    const handleBrokerError = (error: any) => {
      console.error('Broker error:', error);
      setConnectionError(error.message || 'Broker connection error');
      setIsConnecting(false);
    };

    brokerService.on('connected', handleBrokerConnected);
    brokerService.on('account_update', handleAccountUpdate);
    brokerService.on('positions_update', handlePositionsUpdate);
    brokerService.on('trade_executed', handleTradeExecuted);
    brokerService.on('disconnected', handleBrokerDisconnected);
    brokerService.on('error', handleBrokerError);

    return () => {
      brokerService.off('connected', handleBrokerConnected);
      brokerService.off('account_update', handleAccountUpdate);
      brokerService.off('positions_update', handlePositionsUpdate);
      brokerService.off('trade_executed', handleTradeExecuted);
      brokerService.off('disconnected', handleBrokerDisconnected);
      brokerService.off('error', handleBrokerError);
    };
  }, []);

  // Keep existing MT5 service event listeners for demo mode
  useEffect(() => {
    const handleConnected = () => {
      console.log('MT5 Demo Connected successfully');
      setIsConnecting(false);
      setConnectionError(null);
      refreshAccountData();
    };

    const handleDisconnected = () => {
      console.log('MT5 Demo Disconnected');
      setMT5Config(prev => ({ ...prev, connected: false }));
      if (tradingMode === 'demo') {
        setRealTimeData({
          accountInfo: null,
          positions: [],
          quotes: {},
          lastUpdate: null,
          dataProvider: null,
        });
      }
    };

    const handleAccountInfo = (accountInfo: MT5AccountInfo) => {
      if (tradingMode === 'demo') {
        console.log('Received MT5 account info:', accountInfo);
        setRealTimeData(prev => ({
          ...prev,
          accountInfo,
          lastUpdate: new Date(),
        }));
      }
    };

    const handlePositionUpdate = (positions: MT5Position[]) => {
      if (tradingMode === 'demo') {
        console.log('Received MT5 position update:', positions);
        setRealTimeData(prev => ({
          ...prev,
          positions,
          lastUpdate: new Date(),
        }));
      }
    };

    const handleTick = (symbolData: MT5Symbol) => {
      if (tradingMode === 'demo') {
        console.log('Received MT5 tick data:', symbolData);
        // Convert MT5 symbol to Quote format
        const quote: Quote = {
          symbol: symbolData.name,
          bid: symbolData.bid,
          ask: symbolData.ask,
          last: (symbolData.bid + symbolData.ask) / 2,
          volume: 0,
          change: 0,
          changePercent: 0,
          timestamp: symbolData.lastUpdate,
          provider: 'MT5 Demo',
        };
        
        setRealTimeData(prev => ({
          ...prev,
          quotes: {
            ...prev.quotes,
            [symbolData.name]: quote,
          },
          lastUpdate: new Date(),
        }));
      }
    };

    const handleError = (error: any) => {
      console.error('MT5 Service Error:', error);
      setConnectionError(error.message || 'Unknown error occurred');
      setIsConnecting(false);
    };

    // Register event listeners
    mt5Service.on('connected', handleConnected);
    mt5Service.on('disconnected', handleDisconnected);
    mt5Service.on('account_info', handleAccountInfo);
    mt5Service.on('position_update', handlePositionUpdate);
    mt5Service.on('tick', handleTick);
    mt5Service.on('error', handleError);

    // Cleanup
    return () => {
      mt5Service.off('connected', handleConnected);
      mt5Service.off('disconnected', handleDisconnected);
      mt5Service.off('account_info', handleAccountInfo);
      mt5Service.off('position_update', handlePositionUpdate);
      mt5Service.off('tick', handleTick);
      mt5Service.off('error', handleError);
    };
  }, [tradingMode]);

  const connectMarketData = async (provider?: string) => {
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      await marketDataService.connect(provider);
      
      // Subscribe to common symbols
      const commonSymbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];
      for (const symbol of commonSymbols) {
        try {
          await marketDataService.subscribeToSymbol(symbol);
        } catch (error) {
          console.warn(`Failed to subscribe to ${symbol}:`, error);
        }
      }
      
      setIsConnecting(false);
    } catch (error) {
      console.error('Market data connection failed:', error);
      setConnectionError(error instanceof Error ? error.message : 'Market data connection failed');
      setIsConnecting(false);
      throw error;
    }
  };

  const connectBroker = async (config: Omit<BrokerConfig, 'connected'>) => {
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      const credentials: BrokerCredentials = {
        apiKey: config.apiKey,
        accountId: config.accountId,
        environment: config.environment,
      };
      
      await brokerService.connect(credentials);
      setBrokerConfig({ ...config, connected: true });
      
      // Switch to live mode if connecting to live broker
      if (config.environment === 'live') {
        setTradingMode('live');
      }
      
    } catch (error) {
      console.error('Broker connection failed:', error);
      setConnectionError(error instanceof Error ? error.message : 'Broker connection failed');
      setIsConnecting(false);
      throw error;
    }
  };

  const disconnectMarketData = () => {
    marketDataService.disconnect();
  };

  const disconnectBroker = () => {
    brokerService.disconnect();
    setBrokerConfig(prev => ({ ...prev, connected: false }));
  };

  const switchTradingMode = (mode: 'demo' | 'live') => {
    setTradingMode(mode);
    
    if (mode === 'demo') {
      // Disconnect from live broker if connected
      if (brokerConfig.connected) {
        disconnectBroker();
      }
    } else {
      // Disconnect from demo MT5 if connected
      if (mt5Config.connected) {
        disconnectMT5();
      }
    }
    
    // Clear data when switching modes
    setRealTimeData({
      accountInfo: null,
      positions: [],
      quotes: {},
      lastUpdate: null,
      dataProvider: null,
    });
  };

  const executeTrade = async (symbol: string, type: 'BUY' | 'SELL', quantity: number) => {
    try {
      if (tradingMode === 'live' && brokerConfig.connected) {
        // Execute real trade through broker API
        console.log('🚨 EXECUTING REAL TRADE 🚨');
        console.log(`${type} ${quantity} units of ${symbol}`);
        
        const result = await brokerService.executeTrade({
          instrument: symbol,
          units: type === 'BUY' ? quantity : -quantity,
          type: 'market',
        });
        
        console.log('Real trade executed:', result);
        
      } else if (tradingMode === 'demo' && mt5Config.connected) {
        // Execute demo trade through MT5
        const tradeRequest = {
          action: 'DEAL' as const,
          symbol,
          volume: quantity,
          type,
          comment: `App Demo Trade - ${new Date().toISOString()}`,
        };

        const result = await mt5Service.executeTrade(tradeRequest);
        
        const newTrade: Trade = {
          id: result.deal?.toString() || Date.now().toString(),
          symbol,
          type,
          quantity,
          price: result.price || 0,
          timestamp: new Date(), // Assuming current time for demo trades
          status: 'EXECUTED',
          profit: 0,
        };

        setTrades(prev => [newTrade, ...prev]);
        
        setTimeout(() => {
          refreshAccountData();
        }, 1000);
        
      } else {
        throw new Error(`No connection available for ${tradingMode} trading`);
      }
    } catch (error) {
      console.error('Trade execution failed:', error);
      throw error;
    }
  };

  const refreshAccountData = async () => {
    try {
      if (tradingMode === 'live' && brokerConfig.connected) {
        const account = await brokerService.getAccount();
        const positions = await brokerService.getPositions();
        
        setRealTimeData(prev => ({
          ...prev,
          accountInfo: account,
          positions,
          lastUpdate: new Date(),
        }));
        
      } else if (tradingMode === 'demo' && mt5Config.connected) {
        const accountInfo = await mt5Service.getAccountInfo();
        const positions = await mt5Service.getPositions();
        
        setRealTimeData(prev => ({
          ...prev,
          accountInfo: accountInfo,
          positions,
          lastUpdate: new Date(),
        }));
      }
    } catch (error) {
      console.error('Failed to refresh account data:', error);
      setConnectionError('Failed to refresh account data');
    }
  };

  // Keep existing MT5 and automation methods unchanged...
  const connectMT5 = async (config: Omit<MT5Config, 'connected'>) => {
    console.log('Starting MT5 connection process...', { server: config.server, login: config.login });
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      const credentials: MT5Credentials = {
        server: config.server.trim(),
        login: config.login.trim(),
        password: config.password,
      };

      console.log('Attempting MT5 connection with credentials:', { 
        server: credentials.server, 
        login: credentials.login,
      });

      const connected = await mt5Service.connect(credentials);
      
      if (connected) {
        console.log('MT5 connection successful');
        setMT5Config({ ...config, connected: true });
        setTradingMode('demo');
        
        const commonSymbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];
        const subscriptionPromises = commonSymbols.map(async (symbol) => {
          try {
            await mt5Service.subscribeToSymbol(symbol);
            console.log(`Successfully subscribed to ${symbol}`);
          } catch (error) {
            console.warn(`Failed to subscribe to ${symbol}:`, error);
          }
        });
        
        await Promise.allSettled(subscriptionPromises); // Wait for all subscriptions
        console.log('MT5 symbol subscription process completed');
        
      } else {
        throw new Error('Connection failed - unknown error');
      }
    } catch (error) {
      console.error('MT5 connection failed:', error);
      setIsConnecting(false);
      
      let userFriendlyError = 'Connection failed';
      
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('timeout')) {
          userFriendlyError = 'Connection timeout. Please check your internet connection and try again.';
        } else if (errorMsg.includes('server') && errorMsg.includes('not found')) {
          userFriendlyError = `Server "${config.server}" not found. Please verify the server name with your broker.`;
        } else if (errorMsg.includes('invalid login') || errorMsg.includes('wrong login')) {
          userFriendlyError = 'Invalid account number. Please check your MT5 account number.';
        } else if (errorMsg.includes('invalid password') || errorMsg.includes('wrong password')) {
          userFriendlyError = 'Incorrect password. Please check your MT5 account password.';
        } else if (errorMsg.includes('blocked') || errorMsg.includes('suspended')) {
          userFriendlyError = 'Account blocked or suspended. Please contact your broker.';
        } else if (errorMsg.includes('validation')) {
          userFriendlyError = error.message;
        } else {
          userFriendlyError = error.message;
        }
      }
      
      setConnectionError(userFriendlyError);
      throw new Error(userFriendlyError);
    }
  };

  const disconnectMT5 = () => {
    try {
      mt5Service.disconnect();
      setMT5Config(prev => ({ ...prev, connected: false }));
      if (tradingMode === 'demo') {
        setRealTimeData({
          accountInfo: null,
          positions: [],
          quotes: {},
          lastUpdate: null,
          dataProvider: null,
        });
      }
      setConnectionError(null);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  // Keep all existing automation methods unchanged...
  const updateIndicators = async (symbol: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setIndicators({
      rsi: Math.random() * 100,
      fibonacciLevels: [1.618, 1.382, 1.236, 1.000, 0.786, 0.618, 0.500, 0.382, 0.236],
      movingAverage: Math.random() * 2,
      macd: { 
        signal: (Math.random() - 0.5) * 0.01, 
        histogram: (Math.random() - 0.5) * 0.01 
      },
    });
  };

  const addAutomationRule = (name: string, description: string) => {
    const newRule: AutomationRule = {
      id: Date.now().toString(),
      name,
      description,
      isActive: true,
      createdAt: new Date(),
    };
    setAutomationRules(prev => [newRule, ...prev]);
  };

  const toggleAutomationRule = (id: string) => {
    setAutomationRules(prev =>
      prev.map(rule =>
        rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
      )
    );
  };

  const deleteAutomationRule = (id: string) => {
    setAutomationRules(prev => prev.filter(rule => rule.id !== id));
  };

  const addAutomationStrategy = (strategy: AutomationStrategy) => {
    setAutomationStrategies(prev => [strategy, ...prev]);
  };

  const toggleAutomationStrategy = (id: string) => {
    setAutomationStrategies(prev =>
      prev.map(strategy =>
        strategy.id === id ? { ...strategy, isActive: !strategy.isActive } : strategy
      )
    );
    updateAutomationStatus();
  };

  const deleteAutomationStrategy = (id: string) => {
    setAutomationStrategies(prev => prev.filter(strategy => strategy.id !== id));
    updateAutomationStatus();
  };

  const startAutomation = () => {
    const activeStrategies = automationStrategies.filter(s => s.isActive);
    if (activeStrategies.length === 0) {
      console.warn('No active strategies to run');
      return;
    }

    automationEngine.start();
    setAutomationStatus(prev => ({
      ...prev,
      isRunning: true,
      lastUpdate: new Date(),
    }));

    startSignalMonitoring();
  };

  const stopAutomation = () => {
    automationEngine.stop();
    setAutomationStatus(prev => ({
      ...prev,
      isRunning: false,
      lastUpdate: new Date(),
    }));

    if (signalMonitoringInterval) {
      clearInterval(signalMonitoringInterval);
      setSignalMonitoringInterval(null);
    }
  };

  const updateAutomationStatus = () => {
    const activeStrategies = automationStrategies.filter(s => s.isActive);
    const totalSignals = automationEngine.getSignals().length;

    setAutomationStatus(prev => ({
      ...prev,
      activeStrategies: activeStrategies.length,
      totalSignals,
      lastUpdate: new Date(),
    }));
  };

  const [signalMonitoringInterval, setSignalMonitoringInterval] = useState<NodeJS.Timeout | null>(null);

  const startSignalMonitoring = () => {
    if (signalMonitoringInterval) {
      clearInterval(signalMonitoringInterval);
    }

    const interval = setInterval(() => {
      monitorAutomationSignals();
    }, 15000);

    setSignalMonitoringInterval(interval);
  };

  const monitorAutomationSignals = async () => {
    const activeStrategies = automationStrategies.filter(s => s.isActive);
    
    if (activeStrategies.length === 0) {
      return;
    }
    
    const signalPromises = activeStrategies.map(async (strategy) => {
      try {
        const signal = automationEngine.evaluateStrategy(strategy, strategy.symbol);
        
        if (signal && signal.strength >= 65) {
          console.log('Automation signal generated:', signal);
          
          try {
            await executeTrade(strategy.symbol, signal.action, strategy.positionSize);
            
            setAutomationStrategies(prev =>
              prev.map(s =>
                s.id === strategy.id
                  ? {
                      ...s,
                      triggeredCount: s.triggeredCount + 1,
                      successRate: Math.max(0, Math.min(100, 
                        s.successRate + (Math.random() > 0.35 ? 
                          Math.random() * 3 : -Math.random() * 2)
                      )),
                      totalProfit: s.totalProfit + (Math.random() - 0.25) * 30
                    }
                  : s
              )
            );

            automationEngine.addSignal(signal);
            return true;
          } catch (tradeError) {
            console.error(`Trade execution failed for signal ${signal.id}:`, tradeError);
            return false;
          }
        }
      } catch (error) {
        console.error(`Error evaluating strategy ${strategy.name}:`, error);
        return false;
      }
      return false;
    });

    await Promise.allSettled(signalPromises);
    updateAutomationStatus();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      updateIndicators(selectedSymbol);
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedSymbol]);

  useEffect(() => {
    if ((tradingMode === 'demo' && mt5Config.connected) || (tradingMode === 'live' && brokerConfig.connected)) {
      const interval = setInterval(() => {
        refreshAccountData();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [mt5Config.connected, brokerConfig.connected, tradingMode]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateAutomationStatus();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [automationStrategies]);

  useEffect(() => {
    return () => {
      if (signalMonitoringInterval) {
        clearInterval(signalMonitoringInterval);
      }
      automationEngine.cleanup();
    };
  }, [signalMonitoringInterval]); // Added signalMonitoringInterval to dependencies

  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setTrades(prev => prev.slice(-100));
      
      if (automationRules.length > 50) {
        setAutomationRules(prev => prev.slice(-50));
      }
    }, 300000);

    return () => clearInterval(cleanupInterval);
  }, [automationRules.length]); // Added automationRules.length to dependencies

  const value = {
    trades,
    mt5Config,
    brokerConfig,
    indicators,
    selectedSymbol,
    automationRules,
    automationStrategies,
    automationStatus,
    realTimeData,
    isConnecting,
    connectionError,
    tradingMode,
    executeTrade,
    connectMT5,
    connectBroker,
    connectMarketData,
    disconnectMT5,
    disconnectBroker,
    disconnectMarketData,
    switchTradingMode,
    updateIndicators,
    setSelectedSymbol,
    addAutomationRule,
    toggleAutomationRule,
    deleteAutomationRule,
    addAutomationStrategy,
    toggleAutomationStrategy,
    deleteAutomationStrategy,
    startAutomation,
    stopAutomation,
    refreshAccountData,
  };

  return <TradingContext.Provider value={value}>{children}</TradingContext.Provider>;
}
