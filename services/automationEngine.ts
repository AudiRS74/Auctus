interface TradingSignal {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  strength: number; // 0-100
  price: number;
  timestamp: Date;
  strategy: string;
  reason: string;
}

interface StrategyTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Trend Following' | 'Mean Reversion' | 'Momentum' | 'Oscillator' | 'Breakout';
  parameters: { [key: string]: any };
  riskLevel: 'Low' | 'Medium' | 'High';
  successRate: number;
  profitPotential: number;
}

class AutomationEngine {
  private signals: TradingSignal[] = [];
  private isRunning: boolean = false;
  private strategies: Map<string, StrategyTemplate> = new Map();

  constructor() {
    this.initializeStrategyTemplates();
  }

  private initializeStrategyTemplates(): void {
    const templates: StrategyTemplate[] = [
      {
        id: 'rsi_oversold',
        name: 'RSI Oversold/Overbought',
        description: 'Trades based on RSI reaching extreme levels (30/70)',
        category: 'Oscillator',
        parameters: {
          rsiPeriod: 14,
          oversoldLevel: 30,
          overboughtLevel: 70,
          confirmationBars: 2
        },
        riskLevel: 'Medium',
        successRate: 68.5,
        profitPotential: 2.8
      },
      {
        id: 'macd_crossover',
        name: 'MACD Signal Crossover',
        description: 'Trades on MACD signal line crossover with momentum confirmation',
        category: 'Momentum',
        parameters: {
          fastPeriod: 12,
          slowPeriod: 26,
          signalPeriod: 9,
          minStrength: 60
        },
        riskLevel: 'Medium',
        successRate: 72.3,
        profitPotential: 3.2
      },
      {
        id: 'moving_average_cross',
        name: 'Moving Average Crossover',
        description: 'Simple trend following based on MA crossover',
        category: 'Trend Following',
        parameters: {
          fastMA: 20,
          slowMA: 50,
          confirmationPeriod: 3
        },
        riskLevel: 'Low',
        successRate: 65.8,
        profitPotential: 2.5
      },
      {
        id: 'bollinger_bands',
        name: 'Bollinger Bands Squeeze',
        description: 'Mean reversion strategy using Bollinger Bands',
        category: 'Mean Reversion',
        parameters: {
          period: 20,
          standardDeviations: 2,
          squeezeThreshold: 0.1
        },
        riskLevel: 'Medium',
        successRate: 70.1,
        profitPotential: 2.9
      },
      {
        id: 'stochastic_divergence',
        name: 'Stochastic Oscillator',
        description: 'Momentum strategy using Stochastic %K and %D crossover',
        category: 'Oscillator',
        parameters: {
          kPeriod: 14,
          dPeriod: 3,
          oversoldLevel: 20,
          overboughtLevel: 80
        },
        riskLevel: 'Medium',
        successRate: 66.7,
        profitPotential: 2.6
      },
      {
        id: 'adx_trend_strength',
        name: 'ADX Trend Strength',
        description: 'Directional movement with trend strength confirmation',
        category: 'Trend Following',
        parameters: {
          adxPeriod: 14,
          minAdxValue: 25,
          diCrossoverConfirmation: true
        },
        riskLevel: 'Low',
        successRate: 74.2,
        profitPotential: 3.5
      }
    ];

    templates.forEach(template => {
      this.strategies.set(template.id, template);
    });
  }

  getStrategyTemplates(): StrategyTemplate[] {
    return Array.from(this.strategies.values());
  }

  evaluateStrategy(strategy: any, symbol: string): TradingSignal | null {
    try {
      // Simulate strategy evaluation with realistic signal generation
      const template = this.strategies.get(strategy.indicator.toLowerCase());
      if (!template) {
        return null;
      }

      // Generate signals based on strategy type with realistic probability
      const shouldGenerateSignal = Math.random() < this.getSignalProbability(strategy.indicator);
      
      if (!shouldGenerateSignal) {
        return null;
      }

      const actions: ('BUY' | 'SELL')[] = strategy.tradeType === 'BOTH' 
        ? ['BUY', 'SELL'] 
        : [strategy.tradeType];
      
      const action = actions[Math.floor(Math.random() * actions.length)];
      
      // Calculate signal strength based on strategy type
      const baseStrength = this.calculateSignalStrength(strategy.indicator);
      const marketConditionAdjustment = (Math.random() - 0.5) * 20; // -10 to +10
      const finalStrength = Math.max(0, Math.min(100, baseStrength + marketConditionAdjustment));

      const signal: TradingSignal = {
        id: `${strategy.id}_${Date.now()}`,
        symbol,
        action,
        strength: Math.round(finalStrength),
        price: this.getSimulatedPrice(symbol),
        timestamp: new Date(),
        strategy: strategy.name,
        reason: this.generateSignalReason(strategy.indicator, action, finalStrength)
      };

      return signal;
    } catch (error) {
      console.error('Strategy evaluation error:', error);
      return null;
    }
  }

  private getSignalProbability(indicator: string): number {
    const probabilities: { [key: string]: number } = {
      'RSI': 0.15,      // 15% chance per evaluation
      'MACD': 0.12,     // 12% chance per evaluation
      'MA': 0.08,       // 8% chance per evaluation
      'BB': 0.10,       // 10% chance per evaluation
      'STOCH': 0.13,    // 13% chance per evaluation
      'ADX': 0.09       // 9% chance per evaluation
    };
    
    return probabilities[indicator] || 0.08;
  }

  private calculateSignalStrength(indicator: string): number {
    const baseStrengths: { [key: string]: number } = {
      'RSI': 72,        // RSI signals tend to be strong
      'MACD': 68,       // MACD crossovers are reliable
      'MA': 65,         // Moving average signals are moderate
      'BB': 70,         // Bollinger Band signals can be strong
      'STOCH': 66,      // Stochastic signals are moderate
      'ADX': 75         // ADX trend signals are very strong
    };
    
    return baseStrengths[indicator] || 65;
  }

  private generateSignalReason(indicator: string, action: string, strength: number): string {
    const reasons: { [key: string]: { [key: string]: string[] } } = {
      'RSI': {
        'BUY': [
          'RSI crossed above oversold level (30)',
          'RSI showing bullish divergence',
          'RSI momentum turning positive'
        ],
        'SELL': [
          'RSI crossed below overbought level (70)',
          'RSI showing bearish divergence',
          'RSI momentum turning negative'
        ]
      },
      'MACD': {
        'BUY': [
          'MACD line crossed above signal line',
          'MACD histogram turning positive',
          'MACD bullish momentum confirmation'
        ],
        'SELL': [
          'MACD line crossed below signal line',
          'MACD histogram turning negative',
          'MACD bearish momentum confirmation'
        ]
      },
      'MA': {
        'BUY': [
          'Price crossed above moving average',
          'Fast MA crossed above slow MA',
          'Moving average slope turning bullish'
        ],
        'SELL': [
          'Price crossed below moving average',
          'Fast MA crossed below slow MA',
          'Moving average slope turning bearish'
        ]
      },
      'BB': {
        'BUY': [
          'Price bounced off lower Bollinger Band',
          'Bollinger Band squeeze breakout upward',
          'Price reversal at support level'
        ],
        'SELL': [
          'Price bounced off upper Bollinger Band',
          'Bollinger Band squeeze breakout downward',
          'Price reversal at resistance level'
        ]
      },
      'STOCH': {
        'BUY': [
          'Stochastic %K crossed above %D',
          'Stochastic moving up from oversold',
          'Stochastic bullish momentum'
        ],
        'SELL': [
          'Stochastic %K crossed below %D',
          'Stochastic moving down from overbought',
          'Stochastic bearish momentum'
        ]
      },
      'ADX': {
        'BUY': [
          'ADX confirming strong upward trend',
          '+DI crossed above -DI with ADX > 25',
          'Trend strength increasing (bullish)'
        ],
        'SELL': [
          'ADX confirming strong downward trend',
          '-DI crossed above +DI with ADX > 25',
          'Trend strength increasing (bearish)'
        ]
      }
    };

    const actionReasons = reasons[indicator]?.[action] || ['Technical signal generated'];
    const selectedReason = actionReasons[Math.floor(Math.random() * actionReasons.length)];
    
    if (strength >= 80) {
      return `Strong signal: ${selectedReason}`;
    } else if (strength >= 70) {
      return `Good signal: ${selectedReason}`;
    } else {
      return selectedReason;
    }
  }

  private getSimulatedPrice(symbol: string): number {
    // Simulate realistic prices for different symbols
    const basePrices: { [key: string]: number } = {
      'EURUSD': 1.085,
      'GBPUSD': 1.270,
      'USDJPY': 148.5,
      'AUDUSD': 0.665,
      'BTCUSD': 43250,
      'ETHUSD': 2650,
      'XAUUSD': 2035
    };
    
    const basePrice = basePrices[symbol] || 1.000;
    const volatility = basePrice * 0.001; // 0.1% volatility
    
    return basePrice + (Math.random() - 0.5) * volatility * 2;
  }

  addSignal(signal: TradingSignal): void {
    this.signals.push(signal);
    
    // Keep only last 100 signals to prevent memory issues
    if (this.signals.length > 100) {
      this.signals = this.signals.slice(-100);
    }
  }

  getSignals(): TradingSignal[] {
    return [...this.signals].reverse(); // Most recent first
  }

  getSignalsBySymbol(symbol: string): TradingSignal[] {
    return this.signals.filter(signal => signal.symbol === symbol).reverse();
  }

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

  getEngineStats(): {
    totalSignals: number;
    strongSignals: number;
    averageStrength: number;
    topPerformingStrategy: string;
  } {
    const strongSignals = this.signals.filter(s => s.strength >= 75);
    const averageStrength = this.signals.length > 0 
      ? this.signals.reduce((sum, s) => sum + s.strength, 0) / this.signals.length
      : 0;

    // Find most frequently used strategy
    const strategyCounts = this.signals.reduce((acc, signal) => {
      acc[signal.strategy] = (acc[signal.strategy] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const topStrategy = Object.entries(strategyCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

    return {
      totalSignals: this.signals.length,
      strongSignals: strongSignals.length,
      averageStrength: Math.round(averageStrength),
      topPerformingStrategy: topStrategy
    };
  }

  cleanup(): void {
    this.stop();
    this.signals = [];
    console.log('Automation engine cleaned up');
  }
}

export const automationEngine = new AutomationEngine();