interface TradingSignal {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  strength: number;
  price: number;
  timestamp: Date;
  strategy: string;
}

interface StrategyConfig {
  id: string;
  name: string;
  indicator: string;
  symbol: string;
  timeframe: string;
  entryCondition: string;
  exitCondition: string;
}

class AutomationEngine {
  private isRunning: boolean = false;
  private signals: TradingSignal[] = [];
  private strategies: Map<string, StrategyConfig> = new Map();

  start(): void {
    this.isRunning = true;
    console.log('Automation engine started');
  }

  stop(): void {
    this.isRunning = false;
    console.log('Automation engine stopped');
  }

  isEngineRunning(): boolean {
    return this.isRunning;
  }

  evaluateStrategy(strategy: any, symbol: string): TradingSignal | null {
    if (!this.isRunning) return null;

    // Simulate strategy evaluation
    const shouldTrigger = Math.random() > 0.85; // 15% chance of signal
    
    if (!shouldTrigger) return null;

    const signal: TradingSignal = {
      id: Date.now().toString(),
      symbol,
      action: Math.random() > 0.5 ? 'BUY' : 'SELL',
      strength: 65 + Math.random() * 30, // 65-95% strength
      price: Math.random() * 2 + 1, // Dummy price
      timestamp: new Date(),
      strategy: strategy.name,
    };

    return signal;
  }

  addSignal(signal: TradingSignal): void {
    this.signals.push(signal);
    
    // Keep only last 100 signals
    if (this.signals.length > 100) {
      this.signals = this.signals.slice(-100);
    }
  }

  getSignals(): TradingSignal[] {
    return this.signals;
  }

  cleanup(): void {
    this.stop();
    this.signals = [];
    this.strategies.clear();
  }
}

export const automationEngine = new AutomationEngine();