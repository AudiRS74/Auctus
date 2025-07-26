import React, { createContext, ReactNode, useState, useEffect } from 'react';
import { mt5Service, MT5Credentials, MT5AccountInfo, MT5Position, MT5Symbol } from '../services/mt5Service';

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

interface RealTimeData {
  accountInfo: MT5AccountInfo | null;
  positions: MT5Position[];
  symbols: { [key: string]: MT5Symbol };
  lastUpdate: Date | null;
}

interface TradingContextType {
  trades: Trade[];
  mt5Config: MT5Config;
  indicators: TechnicalIndicators;
  selectedSymbol: string;
  automationRules: AutomationRule[];
  realTimeData: RealTimeData;
  isConnecting: boolean;
  connectionError: string | null;
  executeTrade: (symbol: string, type: 'BUY' | 'SELL', quantity: number) => Promise<void>;
  connectMT5: (config: Omit<MT5Config, 'connected'>) => Promise<void>;
  disconnectMT5: () => void;
  updateIndicators: (symbol: string) => Promise<void>;
  setSelectedSymbol: (symbol: string) => void;
  addAutomationRule: (name: string, description: string) => void;
  toggleAutomationRule: (id: string) => void;
  deleteAutomationRule: (id: string) => void;
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
  const [indicators, setIndicators] = useState<TechnicalIndicators>({
    rsi: 65.4,
    fibonacciLevels: [1.618, 1.382, 1.236, 1.000, 0.786, 0.618, 0.500, 0.382, 0.236],
    movingAverage: 1.2543,
    macd: { signal: 0.0012, histogram: -0.0003 },
  });
  const [selectedSymbol, setSelectedSymbol] = useState('EURUSD');
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [realTimeData, setRealTimeData] = useState<RealTimeData>({
    accountInfo: null,
    positions: [],
    symbols: {},
    lastUpdate: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Set up MT5 service event listeners
  useEffect(() => {
    const handleConnected = () => {
      console.log('MT5 Connected successfully');
      setIsConnecting(false);
      setConnectionError(null);
      refreshAccountData();
    };

    const handleDisconnected = () => {
      console.log('MT5 Disconnected');
      setMT5Config(prev => ({ ...prev, connected: false }));
      setRealTimeData({
        accountInfo: null,
        positions: [],
        symbols: {},
        lastUpdate: null,
      });
    };

    const handleAccountInfo = (accountInfo: MT5AccountInfo) => {
      console.log('Received account info:', accountInfo);
      setRealTimeData(prev => ({
        ...prev,
        accountInfo,
        lastUpdate: new Date(),
      }));
    };

    const handlePositionUpdate = (positions: MT5Position[]) => {
      console.log('Received position update:', positions);
      setRealTimeData(prev => ({
        ...prev,
        positions,
        lastUpdate: new Date(),
      }));
    };

    const handleTick = (symbolData: MT5Symbol) => {
      console.log('Received tick data:', symbolData);
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
  }, []);

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
        // Fallback to simulation mode
        const newTrade: Trade = {
          id: Date.now().toString(),
          symbol,
          type,
          quantity,
          price: Math.random() * 100 + 1,
          timestamp: new Date(),
          status: 'PENDING',
        };

        setTrades(prev => [newTrade, ...prev]);

        // Simulate trade execution
        setTimeout(() => {
          setTrades(prev => 
            prev.map(trade => 
              trade.id === newTrade.id 
                ? { ...trade, status: 'EXECUTED' as const, profit: (Math.random() - 0.5) * 100 }
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
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      const credentials: MT5Credentials = {
        server: config.server,
        login: config.login,
        password: config.password,
      };

      const connected = await mt5Service.connect(credentials);
      
      if (connected) {
        setMT5Config({ ...config, connected: true });
        
        // Subscribe to common symbols for real-time data
        const commonSymbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];
        for (const symbol of commonSymbols) {
          try {
            await mt5Service.subscribeToSymbol(symbol);
          } catch (error) {
            console.warn(`Failed to subscribe to ${symbol}:`, error);
          }
        }
      } else {
        throw new Error('Connection failed');
      }
    } catch (error) {
      console.error('MT5 connection error:', error);
      setIsConnecting(false);
      setConnectionError(error instanceof Error ? error.message : 'Connection failed');
      throw error;
    }
  };

  const disconnectMT5 = () => {
    try {
      mt5Service.disconnect();
      setMT5Config(prev => ({ ...prev, connected: false }));
      setRealTimeData({
        accountInfo: null,
        positions: [],
        symbols: {},
        lastUpdate: null,
      });
      setConnectionError(null);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const refreshAccountData = async () => {
    if (!mt5Config.connected || !mt5Service.isConnectedToMT5()) {
      return;
    }

    try {
      // Get account info
      const accountInfo = await mt5Service.getAccountInfo();
      setRealTimeData(prev => ({
        ...prev,
        accountInfo,
        lastUpdate: new Date(),
      }));

      // Get positions
      const positions = await mt5Service.getPositions();
      setRealTimeData(prev => ({
        ...prev,
        positions,
        lastUpdate: new Date(),
      }));

    } catch (error) {
      console.error('Failed to refresh account data:', error);
      setConnectionError('Failed to refresh account data');
    }
  };

  const updateIndicators = async (symbol: string) => {
    // Simulate fetching real-time indicators
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

  // Auto-refresh indicators
  useEffect(() => {
    const interval = setInterval(() => {
      updateIndicators(selectedSymbol);
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedSymbol]);

  // Auto-refresh account data when connected
  useEffect(() => {
    if (mt5Config.connected) {
      const interval = setInterval(() => {
        refreshAccountData();
      }, 10000); // Refresh every 10 seconds

      return () => clearInterval(interval);
    }
  }, [mt5Config.connected]);

  const value = {
    trades,
    mt5Config,
    indicators,
    selectedSymbol,
    automationRules,
    realTimeData,
    isConnecting,
    connectionError,
    executeTrade,
    connectMT5,
    disconnectMT5,
    updateIndicators,
    setSelectedSymbol,
    addAutomationRule,
    toggleAutomationRule,
    deleteAutomationRule,
    refreshAccountData,
  };

  return <TradingContext.Provider value={value}>{children}</TradingContext.Provider>;
}