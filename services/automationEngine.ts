export interface TradingSignal {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  strength: number; // 0-100
  indicator: string;
  timeframe: string;
  timestamp: Date;
  price?: number;
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

class AutomationEngine {
  private isRunning: boolean = false;
  private signals: TradingSignal[] = [];
  private maxSignals: number = 1000;

  start(): void {
    console.log('AutomationEngine: Starting');
    this.isRunning = true;
  }

  stop(): void {
    console.log('AutomationEngine: Stopping');
    this.isRunning = false;
  }

  isEngineRunning(): boolean {
    return this.isRunning;
  }

  evaluateStrategy(strategy: AutomationStrategy, symbol: string): TradingSignal | null {
    try {
      if (!this.isRunning || !strategy.isActive) {
        return null;
      }

      console.log(`AutomationEngine: Evaluating strategy ${strategy.name} for ${symbol}`);

      // Generate mock signal based on strategy
      const shouldTrigger = Math.random() > 0.85; // 15% chance of signal
      
      if (!shouldTrigger) {
        return null;
      }

      // Generate signal strength based on indicator
      const baseStrength = this.calculateIndicatorStrength(strategy.indicator);
      const randomVariation = (Math.random() - 0.5) * 20;
      const strength = Math.max(0, Math.min(100, baseStrength + randomVariation));

      // Only return strong signals
      if (strength < 60) {
        return null;
      }

      const signal: TradingSignal = {
        id: `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        symbol,
        action: strategy.tradeType === 'BOTH' ? 
          (Math.random() > 0.5 ? 'BUY' : 'SELL') : 
          strategy.tradeType as 'BUY' | 'SELL',
        strength: Number(strength.toFixed(1)),
        indicator: strategy.indicator,
        timeframe: strategy.timeframe,
        timestamp: new Date(),
        price: 1.0850 + (Math.random() - 0.5) * 0.01,
      };

      console.log(`AutomationEngine: Signal generated:`, signal);
      return signal;

    } catch (error) {
      console.error('AutomationEngine: Error evaluating strategy:', error);
      return null;
    }
  }

  private calculateIndicatorStrength(indicator: string): number {
    // Mock indicator strength calculation
    const indicatorStrengths: { [key: string]: number } = {
      'RSI': 70 + Math.random() * 20,
      'MACD': 65 + Math.random() * 25,
      'MA': 60 + Math.random() * 30,
      'BB': 75 + Math.random() * 15,
      'STOCH': 68 + Math.random() * 22,
      'ADX': 72 + Math.random() * 18,
    };

    return indicatorStrengths[indicator] || 50;
  }

  addSignal(signal: TradingSignal): void {
    this.signals.unshift(signal);
    
    // Keep only the most recent signals
    if (this.signals.length > this.maxSignals) {
      this.signals = this.signals.slice(0, this.maxSignals);
    }

    console.log(`AutomationEngine: Signal added. Total signals: ${this.signals.length}`);
  }

  getSignals(): TradingSignal[] {
    return [...this.signals];
  }

  getRecentSignals(limit: number = 10): TradingSignal[] {
    return this.signals.slice(0, limit);
  }

  clearSignals(): void {
    this.signals = [];
    console.log('AutomationEngine: All signals cleared');
  }

  cleanup(): void {
    console.log('AutomationEngine: Cleaning up');
    this.stop();
    this.clearSignals();
  }
}

export const automationEngine = new AutomationEngine();