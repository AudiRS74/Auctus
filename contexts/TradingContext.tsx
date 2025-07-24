import React, { createContext, ReactNode, useState, useEffect } from 'react';

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

interface TradingContextType {
  trades: Trade[];
  mt5Config: MT5Config;
  indicators: TechnicalIndicators;
  selectedSymbol: string;
  automationRules: AutomationRule[];
  executeTrade: (symbol: string, type: 'BUY' | 'SELL', quantity: number) => Promise<void>;
  connectMT5: (config: Omit<MT5Config, 'connected'>) => Promise<void>;
  updateIndicators: (symbol: string) => Promise<void>;
  setSelectedSymbol: (symbol: string) => void;
  addAutomationRule: (name: string, description: string) => void;
  toggleAutomationRule: (id: string) => void;
  deleteAutomationRule: (id: string) => void;
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

  const executeTrade = async (symbol: string, type: 'BUY' | 'SELL', quantity: number) => {
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
  };

  const connectMT5 = async (config: Omit<MT5Config, 'connected'>) => {
    // Simulate MT5 connection
    await new Promise(resolve => setTimeout(resolve, 1500));
    setMT5Config({ ...config, connected: true });
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

  useEffect(() => {
    const interval = setInterval(() => {
      updateIndicators(selectedSymbol);
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedSymbol]);

    const value = {
    trades,
    mt5Config,
    indicators,
    selectedSymbol,
    automationRules,
    executeTrade,
    connectMT5,
    updateIndicators,
    setSelectedSymbol,
    addAutomationRule,
    toggleAutomationRule,
    deleteAutomationRule,
  };

  return <TradingContext.Provider value={value}>{children}</TradingContext.Provider>;
}