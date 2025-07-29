export interface TradingSignal {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  strength: number;
  price: number;
  timestamp: Date;
  strategy: string;
  reason: string;
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

class AutomationEngine {
  private isRunning = false;
  private signals: TradingSignal[] = [];
  private strategies: AutomationStrategy[] = [];

  start(): void {
    console.log('Automation Engine: Starting...');
    this.isRunning = true;
  }

  stop(): void {
    console.log('Automation Engine: Stopping...');
    this.isRunning = false;
  }

  isEngineRunning(): boolean {
    return this.isRunning;
  }

  addSignal(signal: TradingSignal): void {
    this.signals.push(signal);
    
    // Keep only last 100 signals
    if (this.signals.length > 100) {
      this.signals = this.signals.slice(-100);
    }
  }

  getSignals(): TradingSignal[] {
    return [...this.signals];
  }

  evaluateStrategy(strategy: AutomationStrategy, symbol: string): TradingSignal | null {
    if (!this.isRunning || !strategy.isActive) {
      return null;
    }

    // Simulate strategy evaluation
    const shouldTrigger = Math.random() > 0.85; // 15% chance of signal
    
    if (!shouldTrigger) {
      return null;
    }

    const actions: ('BUY' | 'SELL')[] = strategy.tradeType === 'BOTH' 
      ? ['BUY', 'SELL'] 
      : [strategy.tradeType];
    
    const action = actions[Math.floor(Math.random() * actions.length)];
    
    const signal: TradingSignal = {
      id: `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      symbol,
      action,
      strength: Math.floor(Math.random() * 35) + 65, // 65-100
      price: this.getRandomPrice(symbol),
      timestamp: new Date(),
      strategy: strategy.name,
      reason: this.generateSignalReason(strategy.indicator, action),
    };

    return signal;
  }

  private generateSignalReason(indicator: string, action: 'BUY' | 'SELL'): string {
    const reasons = {
      RSI: {
        BUY: 'RSI oversold condition detected',
        SELL: 'RSI overbought condition detected',
      },
      MACD: {
        BUY: 'MACD bullish crossover',
        SELL: 'MACD bearish crossover',
      },
      MA: {
        BUY: 'Price above moving average',
        SELL: 'Price below moving average',
      },
      BB: {
        BUY: 'Price bounced off lower Bollinger Band',
        SELL: 'Price bounced off upper Bollinger Band',
      },
      STOCH: {
        BUY: 'Stochastic oversold reversal',
        SELL: 'Stochastic overbought reversal',
      },
      ADX: {
        BUY: 'ADX trending strength confirmed',
        SELL: 'ADX trending strength confirmed',
      },
    };

    return reasons[indicator]?.[action] || `${indicator} ${action} signal generated`;
  }

  private getRandomPrice(symbol: string): number {
    const basePrices: { [key: string]: number } = {
      'EURUSD': 1.0950,
      'GBPUSD': 1.2650,
      'USDJPY': 149.50,
      'AUDUSD': 0.6750,
      'USDCAD': 1.3450,
    };
    
    const basePrice = basePrices[symbol] || 1.0000;
    const variation = (Math.random() - 0.5) * 0.01;
    return basePrice + variation;
  }

  cleanup(): void {
    this.stop();
    this.signals = [];
    console.log('Automation Engine: Cleaned up');
  }
}

export const automationEngine = new AutomationEngine();