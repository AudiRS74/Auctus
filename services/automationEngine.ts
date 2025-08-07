import { EventEmitter } from 'events';

export interface TradingSignal {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  strength: number; // 0-100
  price: number;
  timestamp: Date;
  strategy: string;
  confidence: number;
  stopLoss?: number;
  takeProfit?: number;
}

export interface AutomationStrategy {
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

export interface MarketCondition {
  rsi: number;
  macd: { signal: number; histogram: number };
  movingAverage: number;
  bollingerBands?: { upper: number; middle: number; lower: number };
  stochastic?: { k: number; d: number };
  adx?: number;
}

class AutomationEngine extends EventEmitter {
  private isRunning: boolean = false;
  private signals: TradingSignal[] = [];
  private strategies: Map<string, AutomationStrategy> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    console.log('AutomationEngine initialized');
  }

  start() {
    console.log('AutomationEngine: Starting...');
    this.isRunning = true;
    this.emit('started');
    
    // Start monitoring for signals
    this.startMonitoring();
  }

  stop() {
    console.log('AutomationEngine: Stopping...');
    this.isRunning = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.emit('stopped');
  }

  private startMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(() => {
      if (this.isRunning) {
        this.evaluateActiveStrategies();
      }
    }, 10000); // Check every 10 seconds
  }

  private evaluateActiveStrategies() {
    const activeStrategies = Array.from(this.strategies.values()).filter(s => s.isActive);
    
    activeStrategies.forEach(strategy => {
      try {
        const signal = this.evaluateStrategy(strategy, strategy.symbol);
        if (signal && signal.strength >= 70) {
          this.addSignal(signal);
          this.emit('signal', signal);
        }
      } catch (error) {
        console.error(`Error evaluating strategy ${strategy.name}:`, error);
      }
    });
  }

  evaluateStrategy(strategy: AutomationStrategy, symbol: string): TradingSignal | null {
    try {
      // Generate realistic market conditions for evaluation
      const marketConditions = this.generateMarketConditions();
      
      const signal = this.analyzeConditions(strategy, symbol, marketConditions);
      
      if (signal) {
        console.log(`Signal generated for ${strategy.name}:`, signal);
      }
      
      return signal;
    } catch (error) {
      console.error(`Error in strategy evaluation:`, error);
      return null;
    }
  }

  private generateMarketConditions(): MarketCondition {
    // Generate realistic technical indicator values
    return {
      rsi: Math.random() * 100,
      macd: {
        signal: (Math.random() - 0.5) * 0.002,
        histogram: (Math.random() - 0.5) * 0.001,
      },
      movingAverage: 1.0850 + (Math.random() - 0.5) * 0.01,
      bollingerBands: {
        upper: 1.0900,
        middle: 1.0850,
        lower: 1.0800,
      },
      stochastic: {
        k: Math.random() * 100,
        d: Math.random() * 100,
      },
      adx: Math.random() * 100,
    };
  }

  private analyzeConditions(
    strategy: AutomationStrategy,
    symbol: string,
    conditions: MarketCondition
  ): TradingSignal | null {
    let signalStrength = 0;
    let action: 'BUY' | 'SELL' | null = null;

    // Evaluate based on strategy indicator
    switch (strategy.indicator) {
      case 'RSI':
        if (conditions.rsi < 30 && (strategy.tradeType === 'BUY' || strategy.tradeType === 'BOTH')) {
          signalStrength = 100 - conditions.rsi; // Stronger signal when more oversold
          action = 'BUY';
        } else if (conditions.rsi > 70 && (strategy.tradeType === 'SELL' || strategy.tradeType === 'BOTH')) {
          signalStrength = conditions.rsi - 30; // Stronger signal when more overbought
          action = 'SELL';
        }
        break;

      case 'MACD':
        if (conditions.macd.signal > 0 && conditions.macd.histogram > 0 && 
            (strategy.tradeType === 'BUY' || strategy.tradeType === 'BOTH')) {
          signalStrength = Math.min(85, Math.abs(conditions.macd.signal * 10000));
          action = 'BUY';
        } else if (conditions.macd.signal < 0 && conditions.macd.histogram < 0 && 
                   (strategy.tradeType === 'SELL' || strategy.tradeType === 'BOTH')) {
          signalStrength = Math.min(85, Math.abs(conditions.macd.signal * 10000));
          action = 'SELL';
        }
        break;

      case 'MA':
        const currentPrice = conditions.movingAverage + (Math.random() - 0.5) * 0.001;
        if (currentPrice > conditions.movingAverage && 
            (strategy.tradeType === 'BUY' || strategy.tradeType === 'BOTH')) {
          signalStrength = Math.min(80, Math.abs((currentPrice - conditions.movingAverage) * 10000));
          action = 'BUY';
        } else if (currentPrice < conditions.movingAverage && 
                   (strategy.tradeType === 'SELL' || strategy.tradeType === 'BOTH')) {
          signalStrength = Math.min(80, Math.abs((conditions.movingAverage - currentPrice) * 10000));
          action = 'SELL';
        }
        break;

      case 'STOCH':
        if (conditions.stochastic && conditions.stochastic.k < 20 && 
            (strategy.tradeType === 'BUY' || strategy.tradeType === 'BOTH')) {
          signalStrength = 90 - conditions.stochastic.k;
          action = 'BUY';
        } else if (conditions.stochastic && conditions.stochastic.k > 80 && 
                   (strategy.tradeType === 'SELL' || strategy.tradeType === 'BOTH')) {
          signalStrength = conditions.stochastic.k - 20;
          action = 'SELL';
        }
        break;

      default:
        signalStrength = Math.random() * 60 + 20; // Random signal 20-80
        action = Math.random() > 0.5 ? 'BUY' : 'SELL';
    }

    // Only return signal if strength is above minimum threshold
    if (!action || signalStrength < 50) {
      return null;
    }

    const signal: TradingSignal = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      symbol,
      action,
      strength: Math.round(signalStrength),
      price: conditions.movingAverage + (Math.random() - 0.5) * 0.001,
      timestamp: new Date(),
      strategy: strategy.name,
      confidence: Math.round(signalStrength * 0.85), // Slightly lower than strength
      stopLoss: strategy.stopLoss,
      takeProfit: strategy.takeProfit,
    };

    return signal;
  }

  addSignal(signal: TradingSignal) {
    this.signals.unshift(signal);
    
    // Keep only last 100 signals
    if (this.signals.length > 100) {
      this.signals = this.signals.slice(0, 100);
    }
    
    console.log(`AutomationEngine: Signal added for ${signal.symbol}`, signal);
  }

  getSignals(): TradingSignal[] {
    return [...this.signals];
  }

  getRecentSignals(limit: number = 10): TradingSignal[] {
    return this.signals.slice(0, limit);
  }

  addStrategy(strategy: AutomationStrategy) {
    this.strategies.set(strategy.id, strategy);
    console.log(`AutomationEngine: Strategy added - ${strategy.name}`);
  }

  removeStrategy(strategyId: string) {
    const strategy = this.strategies.get(strategyId);
    if (strategy) {
      this.strategies.delete(strategyId);
      console.log(`AutomationEngine: Strategy removed - ${strategy.name}`);
    }
  }

  getStrategies(): AutomationStrategy[] {
    return Array.from(this.strategies.values());
  }

  isEngineRunning(): boolean {
    return this.isRunning;
  }

  getStats() {
    const activeStrategies = Array.from(this.strategies.values()).filter(s => s.isActive);
    const recentSignals = this.signals.filter(s => 
      Date.now() - s.timestamp.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
    );

    return {
      totalStrategies: this.strategies.size,
      activeStrategies: activeStrategies.length,
      totalSignals: this.signals.length,
      recentSignals: recentSignals.length,
      isRunning: this.isRunning,
    };
  }

  cleanup() {
    console.log('AutomationEngine: Cleaning up...');
    
    this.stop();
    this.signals = [];
    this.strategies.clear();
    this.removeAllListeners();
  }
}

export const automationEngine = new AutomationEngine();
export default automationEngine;