import { useContext } from 'react';
import { TradingContext } from '../contexts/TradingProvider';

export function useTrading() {
  const context = useContext(TradingContext);
  
  if (context === undefined) {
    console.error('useTrading must be used within a TradingProvider');
    // Return safe defaults instead of throwing
    return {
      trades: [],
      mt5Config: {
        server: '',
        login: '',
        password: '',
        connected: false,
      },
      indicators: {
        rsi: 50,
        fibonacciLevels: [1.618, 1.382, 1.236, 1.000, 0.786, 0.618, 0.500, 0.382, 0.236],
        movingAverage: 1.0000,
        macd: { signal: 0, histogram: 0 },
      },
      selectedSymbol: 'EURUSD',
      automationRules: [],
      automationStrategies: [],
      automationStatus: {
        isRunning: false,
        activeStrategies: 0,
        totalSignals: 0,
        lastUpdate: null,
      },
      realTimeData: {
        accountInfo: null,
        positions: [],
        symbols: {},
        marketData: {},
        lastUpdate: null,
      },
      isConnecting: false,
      connectionError: 'Trading context not available',
      initialized: false,
      loading: false,
      error: 'Trading context not available',
      executeTrade: async () => { throw new Error('Trading not available'); },
      connectMT5: async () => { throw new Error('MT5 connection not available'); },
      disconnectMT5: () => {},
      updateIndicators: async () => {},
      setSelectedSymbol: () => {},
      addAutomationRule: () => {},
      toggleAutomationRule: () => {},
      deleteAutomationRule: () => {},
      addAutomationStrategy: () => {},
      toggleAutomationStrategy: () => {},
      deleteAutomationStrategy: () => {},
      startAutomation: () => {},
      stopAutomation: () => {},
      refreshAccountData: async () => {},
      getMarketData: () => null,
    };
  }
  
  return context;
}