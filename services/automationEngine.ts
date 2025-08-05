export interface AutomationSignal {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  strength: number; // 0-100
  timestamp: Date;
  indicators: {
    rsi?: number;
    macd?: { signal: number; histogram: number };
    ma?: number;
    bb?: { upper: number; lower: number; middle: number };
    stoch?: number;
    adx?: number;
  };
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
  private isRunning: boolean = false;
  private signals: AutomationSignal[] = [];
  private strategiesRunning: Set<string> = new Set();

  start(): void {
    this.isRunning = true;
    console.log('Automation engine started');
  }

  stop(): void {
    this.isRunning = false;
    this.strategiesRunning.clear();
    console.log('Automation engine stopped');
  }

  isEngineRunning(): boolean {
    return this.isRunning;
  }

  evaluateStrategy(strategy: AutomationStrategy, symbol: string): AutomationSignal | null {
    if (!this.isRunning || !strategy.isActive) {
      return null;
    }

    try {
      // Generate realistic indicators based on strategy type
      const indicators = this.generateIndicators(symbol, strategy.indicator);
      const signal = this.analyzeIndicators(strategy, indicators);
      
      if (signal) {
        const automationSignal: AutomationSignal = {
          id: `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          symbol,
          action: signal.action,
          strength: signal.strength,
          timestamp: new Date(),
          indicators,
          reason: signal.reason,
        };
        
        return automationSignal;
      }
    } catch (error) {
      console.error(`Error evaluating strategy ${strategy.name}:`, error);
    }

    return null;
  }

  private generateIndicators(symbol: string, primaryIndicator: string) {
    // Generate realistic technical indicator values
    const indicators: any = {};
    
    // RSI (0-100)
    indicators.rsi = Math.random() * 100;
    
    // MACD
    indicators.macd = {
      signal: (Math.random() - 0.5) * 0.002,
      histogram: (Math.random() - 0.5) * 0.001,
    };
    
    // Moving Average (price-like)
    const basePrice = this.getBasePrice(symbol);
    indicators.ma = basePrice + (Math.random() - 0.5) * basePrice * 0.02;
    
    // Bollinger Bands
    indicators.bb = {
      upper: basePrice * 1.01,
      lower: basePrice * 0.99,
      middle: basePrice,
    };
    
    // Stochastic (0-100)
    indicators.stoch = Math.random() * 100;
    
    // ADX (0-100)
    indicators.adx = Math.random() * 100;
    
    return indicators;
  }

  private getBasePrice(symbol: string): number {
    const basePrices: { [key: string]: number } = {
      'EURUSD': 1.08500,
      'GBPUSD': 1.27000,
      'USDJPY': 148.500,
      'AUDUSD': 0.66500,
      'USDCAD': 1.36000,
      'USDCHF': 0.87500,
      'NZDUSD': 0.61500,
    };
    
    return basePrices[symbol] || 1.0;
  }

  private analyzeIndicators(strategy: AutomationStrategy, indicators: any): { action: 'BUY' | 'SELL', strength: number, reason: string } | null {
    let signalStrength = 0;
    let action: 'BUY' | 'SELL' = 'BUY';
    let reasons: string[] = [];
    
    switch (strategy.indicator) {
      case 'RSI':
        if (indicators.rsi < 30) {
          signalStrength += 40;
          action = 'BUY';
          reasons.push(`RSI oversold at ${indicators.rsi.toFixed(1)}`);
        } else if (indicators.rsi > 70) {
          signalStrength += 40;
          action = 'SELL';
          reasons.push(`RSI overbought at ${indicators.rsi.toFixed(1)}`);
        }
        break;
        
      case 'MACD':
        if (indicators.macd.signal > 0 && indicators.macd.histogram > 0) {
          signalStrength += 35;
          action = 'BUY';
          reasons.push('MACD bullish crossover');
        } else if (indicators.macd.signal < 0 && indicators.macd.histogram < 0) {
          signalStrength += 35;
          action = 'SELL';
          reasons.push('MACD bearish crossover');
        }
        break;
        
      case 'BB':
        const currentPrice = this.getBasePrice(strategy.symbol);
        if (currentPrice <= indicators.bb.lower) {
          signalStrength += 30;
          action = 'BUY';
          reasons.push('Price at lower Bollinger Band');
        } else if (currentPrice >= indicators.bb.upper) {
          signalStrength += 30;
          action = 'SELL';
          reasons.push('Price at upper Bollinger Band');
        }
        break;
        
      case 'STOCH':
        if (indicators.stoch < 20) {
          signalStrength += 25;
          action = 'BUY';
          reasons.push(`Stochastic oversold at ${indicators.stoch.toFixed(1)}`);
        } else if (indicators.stoch > 80) {
          signalStrength += 25;
          action = 'SELL';
          reasons.push(`Stochastic overbought at ${indicators.stoch.toFixed(1)}`);
        }
        break;
        
      case 'ADX':
        if (indicators.adx > 25) {
          signalStrength += 20;
          // ADX shows trend strength, combine with price action
          const priceDirection = Math.random() > 0.5 ? 'BUY' : 'SELL';
          action = priceDirection;
          reasons.push(`Strong trend detected (ADX: ${indicators.adx.toFixed(1)})`);
        }
        break;
        
      default:
        return null;
    }
    
    // Add some randomness to make signals more realistic
    const randomFactor = Math.random() * 20;
    signalStrength += randomFactor;
    
    // Ensure signal strength doesn't exceed 100
    signalStrength = Math.min(100, signalStrength);
    
    // Only return signal if strength is above threshold
    if (signalStrength >= 50) {
      // Check if strategy allows this trade type
      if (strategy.tradeType !== 'BOTH' && strategy.tradeType !== action) {
        return null;
      }
      
      return {
        action,
        strength: signalStrength,
        reason: reasons.join(', ') || `${strategy.indicator} signal detected`,
      };
    }
    
    return null;
  }

  addSignal(signal: AutomationSignal): void {
    this.signals.unshift(signal);
    
    // Keep only last 100 signals
    if (this.signals.length > 100) {
      this.signals = this.signals.slice(0, 100);
    }
  }

  getSignals(): AutomationSignal[] {
    return [...this.signals];
  }

  getSignalsBySymbol(symbol: string): AutomationSignal[] {
    return this.signals.filter(signal => signal.symbol === symbol);
  }

  clearSignals(): void {
    this.signals = [];
  }

  cleanup(): void {
    this.stop();
    this.signals = [];
  }
}

export const automationEngine = new AutomationEngine();