export interface TradingSignal {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  strength: number; // 0-100
  indicator: string;
  reason: string;
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
  private strategies: AutomationStrategy[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;

  start(): void {
    this.isRunning = true;
    console.log('Automation Engine: Started');
  }

  stop(): void {
    this.isRunning = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log('Automation Engine: Stopped');
  }

  addSignal(signal: TradingSignal): void {
    this.signals.unshift(signal);
    // Keep only last 100 signals
    if (this.signals.length > 100) {
      this.signals = this.signals.slice(0, 100);
    }
  }

  getSignals(): TradingSignal[] {
    return [...this.signals];
  }

  evaluateStrategy(strategy: AutomationStrategy, symbol: string): TradingSignal | null {
    if (!strategy.isActive || strategy.symbol !== symbol) {
      return null;
    }

    try {
      const signal = this.generateSignalForStrategy(strategy);
      return signal;
    } catch (error) {
      console.error(`Error evaluating strategy ${strategy.name}:`, error);
      return null;
    }
  }

  private generateSignalForStrategy(strategy: AutomationStrategy): TradingSignal | null {
    // Simulate technical analysis based on strategy indicator
    const indicators = this.simulateIndicators();
    let signalStrength = 0;
    let action: 'BUY' | 'SELL' = 'BUY';
    let reason = '';

    switch (strategy.indicator) {
      case 'RSI':
        if (indicators.rsi < 30) {
          signalStrength = Math.random() * 40 + 60; // 60-100
          action = 'BUY';
          reason = `RSI oversold at ${indicators.rsi.toFixed(1)}`;
        } else if (indicators.rsi > 70) {
          signalStrength = Math.random() * 40 + 60; // 60-100
          action = 'SELL';
          reason = `RSI overbought at ${indicators.rsi.toFixed(1)}`;
        }
        break;

      case 'MACD':
        if (indicators.macd.signal > 0 && indicators.macd.histogram > indicators.macd.signal) {
          signalStrength = Math.random() * 35 + 65; // 65-100
          action = 'BUY';
          reason = `MACD bullish crossover (${indicators.macd.signal.toFixed(4)})`;
        } else if (indicators.macd.signal < 0 && indicators.macd.histogram < indicators.macd.signal) {
          signalStrength = Math.random() * 35 + 65; // 65-100
          action = 'SELL';
          reason = `MACD bearish crossover (${indicators.macd.signal.toFixed(4)})`;
        }
        break;

      case 'MA':
        const priceAboveMA = Math.random() > 0.5;
        if (priceAboveMA) {
          signalStrength = Math.random() * 30 + 50; // 50-80
          action = 'BUY';
          reason = 'Price above Moving Average - uptrend confirmed';
        } else {
          signalStrength = Math.random() * 30 + 50; // 50-80
          action = 'SELL';
          reason = 'Price below Moving Average - downtrend confirmed';
        }
        break;

      case 'BB':
        const bbPosition = Math.random();
        if (bbPosition < 0.2) {
          signalStrength = Math.random() * 25 + 60; // 60-85
          action = 'BUY';
          reason = 'Price near Bollinger Band lower bound - bounce expected';
        } else if (bbPosition > 0.8) {
          signalStrength = Math.random() * 25 + 60; // 60-85
          action = 'SELL';
          reason = 'Price near Bollinger Band upper bound - reversal expected';
        }
        break;

      case 'STOCH':
        const stochK = Math.random() * 100;
        const stochD = Math.random() * 100;
        if (stochK < 20 && stochD < 20) {
          signalStrength = Math.random() * 30 + 55; // 55-85
          action = 'BUY';
          reason = `Stochastic oversold (%K: ${stochK.toFixed(1)})`;
        } else if (stochK > 80 && stochD > 80) {
          signalStrength = Math.random() * 30 + 55; // 55-85
          action = 'SELL';
          reason = `Stochastic overbought (%K: ${stochK.toFixed(1)})`;
        }
        break;

      case 'ADX':
        const adx = Math.random() * 100;
        const diPlus = Math.random() * 50;
        const diMinus = Math.random() * 50;
        if (adx > 25 && diPlus > diMinus) {
          signalStrength = Math.random() * 25 + 60; // 60-85
          action = 'BUY';
          reason = `Strong uptrend detected (ADX: ${adx.toFixed(1)})`;
        } else if (adx > 25 && diMinus > diPlus) {
          signalStrength = Math.random() * 25 + 60; // 60-85
          action = 'SELL';
          reason = `Strong downtrend detected (ADX: ${adx.toFixed(1)})`;
        }
        break;
    }

    // Apply strategy trade type filter
    if (strategy.tradeType !== 'BOTH' && strategy.tradeType !== action) {
      return null;
    }

    // Only generate signals with sufficient strength
    if (signalStrength < 55) {
      return null;
    }

    return {
      id: `${strategy.id}_${Date.now()}`,
      symbol: strategy.symbol,
      action,
      strength: Math.round(signalStrength),
      indicator: strategy.indicator,
      reason,
      timestamp: new Date(),
      stopLoss: strategy.stopLoss,
      takeProfit: strategy.takeProfit,
    };
  }

  private simulateIndicators() {
    // Simulate realistic technical indicators
    return {
      rsi: Math.random() * 100,
      macd: {
        signal: (Math.random() - 0.5) * 0.002,
        histogram: (Math.random() - 0.5) * 0.001,
      },
      movingAverage: 1.0800 + (Math.random() - 0.5) * 0.01,
      bollingerBands: {
        upper: 1.0900,
        middle: 1.0850,
        lower: 1.0800,
      },
      stochastic: {
        k: Math.random() * 100,
        d: Math.random() * 100,
      },
      adx: {
        adx: Math.random() * 100,
        diPlus: Math.random() * 50,
        diMinus: Math.random() * 50,
      },
    };
  }

  // Strategy template generators
  generateRSIStrategy(symbol: string, name?: string): AutomationStrategy {
    return {
      id: `rsi_${Date.now()}`,
      name: name || `RSI Strategy for ${symbol}`,
      isActive: true,
      indicator: 'RSI',
      symbol,
      timeframe: '15M',
      entryCondition: 'RSI < 30 (oversold) or RSI > 70 (overbought)',
      exitCondition: 'RSI returns to 30-70 range',
      tradeType: 'BOTH',
      positionSize: 0.01,
      stopLoss: 20, // pips
      takeProfit: 40, // pips
      createdAt: new Date(),
      triggeredCount: 0,
      successRate: 65,
      totalProfit: 0,
    };
  }

  generateMACDStrategy(symbol: string, name?: string): AutomationStrategy {
    return {
      id: `macd_${Date.now()}`,
      name: name || `MACD Strategy for ${symbol}`,
      isActive: true,
      indicator: 'MACD',
      symbol,
      timeframe: '1H',
      entryCondition: 'MACD signal line crossover',
      exitCondition: 'Opposite MACD crossover or S/L, T/P hit',
      tradeType: 'BOTH',
      positionSize: 0.05,
      stopLoss: 30,
      takeProfit: 60,
      createdAt: new Date(),
      triggeredCount: 0,
      successRate: 58,
      totalProfit: 0,
    };
  }

  generateMovingAverageStrategy(symbol: string, name?: string): AutomationStrategy {
    return {
      id: `ma_${Date.now()}`,
      name: name || `MA Trend Strategy for ${symbol}`,
      isActive: true,
      indicator: 'MA',
      symbol,
      timeframe: '4H',
      entryCondition: 'Price crosses above/below 50-period MA',
      exitCondition: 'Price crosses back or S/L, T/P hit',
      tradeType: 'BOTH',
      positionSize: 0.02,
      stopLoss: 25,
      takeProfit: 50,
      createdAt: new Date(),
      triggeredCount: 0,
      successRate: 62,
      totalProfit: 0,
    };
  }

  cleanup(): void {
    this.stop();
    this.signals = [];
    this.strategies = [];
  }

  isEngineRunning(): boolean {
    return this.isRunning;
  }

  getActiveStrategiesCount(): number {
    return this.strategies.filter(s => s.isActive).length;
  }

  getTotalSignalsCount(): number {
    return this.signals.length;
  }
}

export const automationEngine = new AutomationEngine();