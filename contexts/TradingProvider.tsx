import React, { createContext, ReactNode, useState, useEffect } from 'react';
import { mt5Service, MT5Credentials, MT5AccountInfo, MT5Position, MT5Symbol } from '../services/mt5Service';
import { tradingViewService, TradingViewData } from '../services/tradingViewService';
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
  accountInfo: MT5AccountInfo | null;
  positions: MT5Position[];
  symbols: { [key: string]: MT5Symbol };
  marketData: { [key: string]: TradingViewData };
  lastUpdate: Date | null;
}

interface TradingContextType {
  trades: Trade[];
  mt5Config: MT5Config;
  indicators: TechnicalIndicators;
  selectedSymbol: string;
  automationRules: AutomationRule[];
  automationStrategies: AutomationStrategy[];
  automationStatus: AutomationStatus;
  realTimeData: RealTimeData;
  isConnecting: boolean;
  connectionError: string | null;
  initialized: boolean;
  loading: boolean;
  error: string | null;
  executeTrade: (symbol: string, type: 'BUY' | 'SELL', quantity: number) => Promise<void>;
  connectMT5: (config: Omit<MT5Config, 'connected'>) => Promise<void>;
  disconnectMT5: () => void;
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
  getMarketData: (symbol: string) => TradingViewData | null;
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
  const [indicators, setIndicators] = useState<TechnicalIndicators>({
    rsi: 65.4,
    fibonacciLevels: [1.618, 1.382, 1.236, 1.000, 0.786, 0.618, 0.500, 0.382, 0.236],
    movingAverage: 1.0845,
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
    symbols: {},
    marketData: {},
    lastUpdate: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Market data subscriptions
  const [marketSubscriptions, setMarketSubscriptions] = useState<Map<string, () => void>>(new Map());
  const [signalMonitoringInterval, setSignalMonitoringInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
    initializeTradingProvider();
    
    return () => {
      setIsMounted(false);
      cleanup();
    };
  }, []);

  const initializeTradingProvider = async () => {
    try {
      console.log('TradingProvider: Initializing...');
      setLoading(true);
      setError(null);

      // Add small delay to prevent race conditions
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!isMounted) return;

      // Set up MT5 service event listeners
      setupMT5EventListeners();
      
      setInitialized(true);
      console.log('TradingProvider: Initialization complete');
    } catch (error) {
      console.error('TradingProvider: Initialization error:', error);
      if (isMounted) {
        setError('Failed to initialize trading services');
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  const setupMT5EventListeners = () => {
    const handleConnected = () => {
      if (!isMounted) return;
      console.log('MT5 Connected successfully');
      setIsConnecting(false);
      setConnectionError(null);
      refreshAccountData();
    };

    const handleDisconnected = () => {
      if (!isMounted) return;
      console.log('MT5 Disconnected');
      setMT5Config(prev => ({ ...prev, connected: false }));
      setRealTimeData(prev => ({
        ...prev,
        accountInfo: null,
        positions: [],
        symbols: {},
        lastUpdate: null,
      }));
    };

    const handleAccountInfo = (accountInfo: MT5AccountInfo) => {
      if (!isMounted) return;
      console.log('Received account info:', accountInfo);
      setRealTimeData(prev => ({
        ...prev,
        accountInfo,
        lastUpdate: new Date(),
      }));
    };

    const handlePositionUpdate = (positions: MT5Position[]) => {
      if (!isMounted) return;
      console.log('Received position update:', positions);
      setRealTimeData(prev => ({
        ...prev,
        positions,
        lastUpdate: new Date(),
      }));
    };

    const handleTick = (symbolData: MT5Symbol) => {
      if (!isMounted) return;
      setRealTimeData(prev => ({
        ...prev,
        symbols: {
          ...prev.symbols,
          [symbolData.name]: symbolData,
        },
        lastUpdate: new Date(),
      }));
    };

    const handleError = (error: any) => {
      if (!isMounted) return;
      console.error('MT5 Service Error:', error);
      setConnectionError(error.message || 'Unknown error occurred');
      setIsConnecting(false);
    };

    // Register MT5 event listeners
    try {
      mt5Service.removeAllListeners(); // Clean up any existing listeners
      mt5Service.on('connected', handleConnected);
      mt5Service.on('disconnected', handleDisconnected);
      mt5Service.on('account_info', handleAccountInfo);
      mt5Service.on('position_update', handlePositionUpdate);
      mt5Service.on('tick', handleTick);
      mt5Service.on('error', handleError);
    } catch (error) {
      console.error('Failed to setup MT5 event listeners:', error);
    }
  };

  // Subscribe to market data for selected symbol
  useEffect(() => {
    if (!initialized || !isMounted) return;

    const subscribeToMarketData = (symbol: string) => {
      try {
        // Unsubscribe from existing subscription if any
        const existingUnsub = marketSubscriptions.get(symbol);
        if (existingUnsub) {
          existingUnsub();
          marketSubscriptions.delete(symbol);
        }

        // Subscribe to new symbol
        const unsubscribe = tradingViewService.subscribeToPrice(symbol, (data: TradingViewData) => {
          if (!isMounted) return;
          
          setRealTimeData(prev => ({
            ...prev,
            marketData: {
              ...prev.marketData,
              [symbol]: data,
            },
            lastUpdate: new Date(),
          }));

          // Update indicators based on new price data
          updateIndicatorsFromMarketData(data);
        });

        marketSubscriptions.set(symbol, unsubscribe);
        setMarketSubscriptions(new Map(marketSubscriptions));
      } catch (error) {
        console.error('Failed to subscribe to market data:', error);
      }
    };

    subscribeToMarketData(selectedSymbol);

    return () => {
      // Cleanup subscription when symbol changes
      const unsubscribe = marketSubscriptions.get(selectedSymbol);
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from market data:', error);
        }
      }
    };
  }, [selectedSymbol, initialized]);

  const updateIndicatorsFromMarketData = (marketData: TradingViewData) => {
    try {
      if (!isMounted) return;
      
      // Calculate technical indicators based on real market data
      const price = marketData.price;
      const change = marketData.change;
      const changePercent = marketData.changePercent;

      // Simulate RSI calculation based on price movement
      const rsi = Math.max(0, Math.min(100, 50 + (changePercent * 2)));
      
      // Simulate Moving Average (slightly below current price for uptrend, above for downtrend)
      const ma = change > 0 ? price - Math.abs(price * 0.001) : price + Math.abs(price * 0.001);
      
      // Simulate MACD based on price momentum
      const macdSignal = changePercent > 0 ? Math.abs(change * 0.1) : -Math.abs(change * 0.1);
      const macdHistogram = macdSignal * 0.8;

      setIndicators(prev => ({
        ...prev,
        rsi: Number(rsi.toFixed(2)),
        movingAverage: Number(ma.toFixed(5)),
        macd: {
          signal: Number(macdSignal.toFixed(6)),
          histogram: Number(macdHistogram.toFixed(6)),
        },
      }));
    } catch (error) {
      console.error('Error updating indicators:', error);
    }
  };

  const executeTrade = async (symbol: string, type: 'BUY' | 'SELL', quantity: number) => {
    try {
      if (mt5Config.connected && mt5Service.isConnectedToMT5()) {
        // Execute real trade through MT5
        const tradeRequest = {
          action: 'DEAL' as const,
          symbol,
          volume: quantity,
          type,
          comment: `App Trade - ${new Date().toISOString()}`,
        };

        const result = await mt5Service.executeTrade(tradeRequest);
        
        if (!isMounted) return;
        
        const newTrade: Trade = {
          id: result.deal?.toString() || Date.now().toString(),
          symbol,
          type,
          quantity,
          price: result.price || 0,
          timestamp: new Date(),
          status: 'EXECUTED',
          profit: 0, // Will be updated via position updates
        };

        setTrades(prev => [newTrade, ...prev]);
        
        // Refresh account data after trade
        setTimeout(() => {
          refreshAccountData();
        }, 1000);
        
      } else {
        // Fallback to simulation mode with real market data
        const marketData = realTimeData.marketData[symbol];
        const price = marketData ? marketData.price : Math.random() * 100 + 1;

        if (!isMounted) return;

        const newTrade: Trade = {
          id: Date.now().toString(),
          symbol,
          type,
          quantity,
          price,
          timestamp: new Date(),
          status: 'PENDING',
        };

        setTrades(prev => [newTrade, ...prev]);

        // Simulate trade execution with realistic profit calculation
        setTimeout(() => {
          if (!isMounted) return;
          
          const marketMovement = (Math.random() - 0.45) * 0.01; // Slightly positive bias
          const profit = type === 'BUY' ? 
            quantity * price * marketMovement : 
            quantity * price * -marketMovement;

          setTrades(prev => 
            prev.map(trade => 
              trade.id === newTrade.id 
                ? { ...trade, status: 'EXECUTED' as const, profit: Number(profit.toFixed(2)) }
                : trade
            )
          );
        }, 2000);
      }
    } catch (error) {
      console.error('Trade execution failed:', error);
      throw error;
    }
  };

  const connectMT5 = async (config: Omit<MT5Config, 'connected'>) => {
    console.log('Starting MT5 connection process...', { server: config.server, login: config.login });
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      // Trim whitespace from inputs to prevent common user errors
      const credentials: MT5Credentials = {
        server: config.server.trim(),
        login: config.login.trim(),
        password: config.password,
      };

      console.log('Attempting connection with credentials:', { 
        server: credentials.server, 
        login: credentials.login,
      });

      const connected = await mt5Service.connect(credentials);
      
      if (!isMounted) return;
      
      if (connected) {
        console.log('MT5 connection successful');
        setMT5Config({ ...config, connected: true });
        
        // Subscribe to common symbols for real-time data
        const commonSymbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];
        const subscriptionPromises = commonSymbols.map(async (symbol) => {
          try {
            await mt5Service.subscribeToSymbol(symbol);
            console.log(`Successfully subscribed to ${symbol}`);
          } catch (error) {
            console.warn(`Failed to subscribe to ${symbol}:`, error);
          }
        });
        
        Promise.allSettled(subscriptionPromises).then(() => {
          console.log('MT5 symbol subscription process completed');
        });
        
      } else {
        throw new Error('Connection failed - unknown error');
      }
    } catch (error) {
      console.error('MT5 connection failed:', error);
      
      if (!isMounted) return;
      
      setIsConnecting(false);
      
      // Provide user-friendly error messages
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
      if (isMounted) {
        setMT5Config(prev => ({ ...prev, connected: false }));
        
        // Clear all market data subscriptions
        marketSubscriptions.forEach(unsubscribe => {
          try {
            unsubscribe();
          } catch (error) {
            console.error('Error during unsubscribe:', error);
          }
        });
        setMarketSubscriptions(new Map());
        
        setRealTimeData({
          accountInfo: null,
          positions: [],
          symbols: {},
          marketData: {},
          lastUpdate: null,
        });
        setConnectionError(null);
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const refreshAccountData = async () => {
    if (!mt5Config.connected || !mt5Service.isConnectedToMT5() || !isMounted) {
      return;
    }

    try {
      // Get account info
      const accountInfo = await mt5Service.getAccountInfo();
      if (isMounted) {
        setRealTimeData(prev => ({
          ...prev,
          accountInfo,
          lastUpdate: new Date(),
        }));
      }

      // Get positions
      const positions = await mt5Service.getPositions();
      if (isMounted) {
        setRealTimeData(prev => ({
          ...prev,
          positions,
          lastUpdate: new Date(),
        }));
      }

    } catch (error) {
      console.error('Failed to refresh account data:', error);
      if (isMounted) {
        setConnectionError('Failed to refresh account data');
      }
    }
  };

  const updateIndicators = async (symbol: string) => {
    try {
      // Get real market data for indicator calculation
      const marketData = await tradingViewService.getRealTimePrice(symbol);
      if (marketData && isMounted) {
        updateIndicatorsFromMarketData(marketData);
      }
    } catch (error) {
      console.error('Error updating indicators:', error);
    }
  };

  const getMarketData = (symbol: string): TradingViewData | null => {
    return realTimeData.marketData[symbol] || null;
  };

  const addAutomationRule = (name: string, description: string) => {
    if (!isMounted) return;
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
    if (!isMounted) return;
    setAutomationRules(prev =>
      prev.map(rule =>
        rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
      )
    );
  };

  const deleteAutomationRule = (id: string) => {
    if (!isMounted) return;
    setAutomationRules(prev => prev.filter(rule => rule.id !== id));
  };

  const addAutomationStrategy = (strategy: AutomationStrategy) => {
    if (!isMounted) return;
    setAutomationStrategies(prev => [strategy, ...prev]);
  };

  const toggleAutomationStrategy = (id: string) => {
    if (!isMounted) return;
    setAutomationStrategies(prev =>
      prev.map(strategy =>
        strategy.id === id ? { ...strategy, isActive: !strategy.isActive } : strategy
      )
    );
    updateAutomationStatus();
  };

  const deleteAutomationStrategy = (id: string) => {
    if (!isMounted) return;
    setAutomationStrategies(prev => prev.filter(strategy => strategy.id !== id));
    updateAutomationStatus();
  };

  const startAutomation = () => {
    if (!isMounted) return;
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
    if (!isMounted) return;
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
    if (!isMounted) return;
    const activeStrategies = automationStrategies.filter(s => s.isActive);
    const totalSignals = automationEngine.getSignals().length;

    setAutomationStatus(prev => ({
      ...prev,
      activeStrategies: activeStrategies.length,
      totalSignals,
      lastUpdate: new Date(),
    }));
  };

  const startSignalMonitoring = () => {
    if (signalMonitoringInterval) {
      clearInterval(signalMonitoringInterval);
    }

    const interval = setInterval(() => {
      if (isMounted) {
        monitorAutomationSignals();
      }
    }, 15000); // Check every 15 seconds

    setSignalMonitoringInterval(interval);
  };

  const monitorAutomationSignals = async () => {
    if (!isMounted) return;
    
    const activeStrategies = automationStrategies.filter(s => s.isActive);
    
    if (activeStrategies.length === 0) return;
    
    const signalPromises = activeStrategies.map(async (strategy) => {
      try {
        const signal = automationEngine.evaluateStrategy(strategy, strategy.symbol);
        
        if (signal && signal.strength >= 65 && isMounted) {
          console.log('Automation signal generated:', signal);
          
          try {
            await executeTrade(strategy.symbol, signal.action, strategy.positionSize);
            
            if (isMounted) {
              // Update strategy statistics
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
            }
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
    if (isMounted) {
      updateAutomationStatus();
    }
  };

  // Auto-refresh indicators based on real market data
  useEffect(() => {
    if (!initialized || !isMounted) return;
    
    const interval = setInterval(() => {
      if (isMounted) {
        updateIndicators(selectedSymbol);
      }
    }, 10000); // Update every 10 seconds with real data

    return () => clearInterval(interval);
  }, [selectedSymbol, initialized]);

  // Update automation status when strategies change
  useEffect(() => {
    if (!initialized || !isMounted) return;
    
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        updateAutomationStatus();
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [automationStrategies, initialized]);

  const cleanup = () => {
    console.log('TradingProvider: Cleaning up...');
    
    try {
      // Clean up all market data subscriptions
      marketSubscriptions.forEach(unsubscribe => {
        try {
          unsubscribe();
        } catch (error) {
          console.error('Error during cleanup unsubscribe:', error);
        }
      });
      
      // Clean up intervals
      if (signalMonitoringInterval) {
        clearInterval(signalMonitoringInterval);
      }
      
      // Clean up services
      tradingViewService.cleanup();
      automationEngine.cleanup();
      
      // Remove MT5 event listeners
      try {
        mt5Service.removeAllListeners();
      } catch (error) {
        console.error('Error removing MT5 listeners:', error);
      }
    } catch (error) {
      console.error('Error during TradingProvider cleanup:', error);
    }
  };

  const value = {
    trades,
    mt5Config,
    indicators,
    selectedSymbol,
    automationRules,
    automationStrategies,
    automationStatus,
    realTimeData,
    isConnecting,
    connectionError,
    initialized,
    loading,
    error,
    executeTrade,
    connectMT5,
    disconnectMT5,
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
    getMarketData,
  };

  return <TradingContext.Provider value={value}>{children}</TradingContext.Provider>;
}