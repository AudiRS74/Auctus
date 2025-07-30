
// Placeholder type definitions - these would ideally be in a separate types.ts file or similar
interface PriceData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: Date;
}

interface AutomationSignal {
  id: string;
  strategyId: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  strength: number;
  timestamp: Date;
  indicatorValues: any; // More specific type could be defined for this
  conditions: string[];
}

interface IndicatorValues {
  rsi: number;
  macd: {
    line: number;
    signal: number;
    histogram: number;
  };
  movingAverage: {
    sma20: number;
    sma50: number;
    ema12: number;
    ema26: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  stochastic: {
    k: number;
    d: number;
  };
  adx: {
    adx: number;
    plusDI: number;
    minusDI: number;
  };
}

class AutomationEngine {
  private priceHistory: Record<string, PriceData[]> = {};
  private indicators: Record<string, IndicatorValues> = {};
  private signals: AutomationSignal[] = [];
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  // Placeholder methods for indicator calculations. In a real application, these would have implementations.
  private calculateRSI(closes: number[]): number { return 0; }
  private calculateMACD(closes: number[]): { line: number; signal: number; histogram: number; } { return { line: 0, signal: 0, histogram: 0 }; }
  private calculateSMA(closes: number[], period: number): number { return 0; }
  private calculateEMA(closes: number[], period: number): number { return 0; }
  private calculateBollingerBands(closes: number[]): { upper: number; middle: number; lower: number; } { return { upper: 0, middle: 0, lower: 0 }; }
  private calculateStochastic(highs: number[], lows: number[], closes: number[]): { k: number; d: number; } { return { k: 0, d: 0 }; }
  private calculateADX(highs: number[], lows: number[], closes: number[]): { adx: number; plusDI: number; minusDI: number; } { return { adx: 0, plusDI: 0, minusDI: 0 }; }

  // Update price data and calculate indicators - optimized version
  updatePriceData(symbol: string, priceData: PriceData): void {
    if (!this.priceHistory[symbol]) {
      this.priceHistory[symbol] = [];
    }

    this.priceHistory[symbol].push(priceData);
    
    // Keep only last 100 candles for better performance
    if (this.priceHistory[symbol].length > 100) {
      this.priceHistory[symbol] = this.priceHistory[symbol].slice(-100);
    }

    // Only calculate indicators if we have enough data
    if (this.priceHistory[symbol].length >= 26) {
      this.calculateAllIndicators(symbol);
    }
  }
  private calculateAllIndicators(symbol: string): void {
    const history = this.priceHistory[symbol];
    if (!history || history.length < 50) return;

    const closes = history.map(candle => candle.close);
    const highs = history.map(candle => candle.high);
    const lows = history.map(candle => candle.low);

    // Calculate all indicators
    const rsi = this.calculateRSI(closes);
    const macd = this.calculateMACD(closes);
    const movingAverage = {
      sma20: this.calculateSMA(closes, 20),
      sma50: this.calculateSMA(closes, 50),
      ema12: this.calculateEMA(closes, 12),
      ema26: this.calculateEMA(closes, 26)
    };
    const bollingerBands = this.calculateBollingerBands(closes);
    const stochastic = this.calculateStochastic(highs, lows, closes);
    const adx = this.calculateADX(highs, lows, closes);

    this.indicators[symbol] = {
      rsi,
      macd,
      movingAverage,
      bollingerBands,
      stochastic,
      adx
    };
  }
  // Strategy evaluation - optimized version
  evaluateStrategy(strategy: any, symbol: string): AutomationSignal | null {
    const indicators = this.indicators[symbol];
    if (!indicators) return null;

    const currentPrice = this.priceHistory[symbol]?.[this.priceHistory[symbol].length - 1]?.close;
    if (!currentPrice) return null;

    let signal: 'BUY' | 'SELL' | null = null;
    let strength = 0;
    const conditions: string[] = [];

    try {
      // Evaluate based on indicator type with improved error handling
      switch (strategy.indicator) {
        case 'RSI':
          if (indicators.rsi < 30 && (strategy.tradeType === 'BUY' || strategy.tradeType === 'BOTH')) {
            signal = 'BUY';
            strength = Math.max(30, 100 - indicators.rsi);
            conditions.push(`RSI oversold: ${indicators.rsi.toFixed(1)}`);
          } else if (indicators.rsi > 70 && (strategy.tradeType === 'SELL' || strategy.tradeType === 'BOTH')) {
            signal = 'SELL';
            strength = Math.max(30, indicators.rsi - 50);
            conditions.push(`RSI overbought: ${indicators.rsi.toFixed(1)}`);
          }
          break;

        case 'MACD':
          const macdStrength = Math.abs(indicators.macd.histogram) * 10000;
          if (indicators.macd.line > indicators.macd.signal && indicators.macd.histogram > 0) {
            if (strategy.tradeType === 'BUY' || strategy.tradeType === 'BOTH') {
              signal = 'BUY';
              strength = Math.min(Math.max(50, macdStrength), 100);
              conditions.push('MACD bullish crossover');
            }
          } else if (indicators.macd.line < indicators.macd.signal && indicators.macd.histogram < 0) {
            if (strategy.tradeType === 'SELL' || strategy.tradeType === 'BOTH') {
              signal = 'SELL';
              strength = Math.min(Math.max(50, macdStrength), 100);
              conditions.push('MACD bearish crossover');
            }
          }
          break;

        case 'MA':
          const ma20 = indicators.movingAverage.sma20;
          const ma50 = indicators.movingAverage.sma50;
          if (currentPrice > ma20 && ma20 > ma50) {
            if (strategy.tradeType === 'BUY' || strategy.tradeType === 'BOTH') {
              signal = 'BUY';
              strength = 75;
              conditions.push('Price above MA20, bullish trend');
            }
          } else if (currentPrice < ma20 && ma20 < ma50) {
            if (strategy.tradeType === 'SELL' || strategy.tradeType === 'BOTH') {
              signal = 'SELL';
              strength = 75;
              conditions.push('Price below MA20, bearish trend');
            }
          } 
          break; 

        case 'BB':
          const { upper, lower } = indicators.bollingerBands;
          if (currentPrice <= lower && (strategy.tradeType === 'BUY' || strategy.tradeType === 'BOTH')) {
            signal = 'BUY';
            strength = Math.min(Math.max(50, ((lower - currentPrice) / lower) * 1000), 100);
            conditions.push('Price at lower Bollinger Band');
          } else if (currentPrice >= upper && (strategy.tradeType === 'SELL' || strategy.tradeType === 'BOTH')) {
            signal = 'SELL';
            strength = Math.min(Math.max(50, ((currentPrice - upper) / upper) * 1000), 100);
            conditions.push('Price at upper Bollinger Band');
          }
          break;

        case 'STOCH':
          const { k, d } = indicators.stochastic;
          if (k < 20 && d < 20 && k > d) {
            if (strategy.tradeType === 'BUY' || strategy.tradeType === 'BOTH') {
              signal = 'BUY';
              strength = Math.max(50, 100 - k);
              conditions.push('Stochastic oversold and rising');
            }
          } else if (k > 80 && d > 80 && k < d) {
            if (strategy.tradeType === 'SELL' || strategy.tradeType === 'BOTH') {
              signal = 'SELL';
              strength = Math.max(50, k - 30);
              conditions.push('Stochastic overbought and falling');
            }
          }
          break;

        case 'ADX':
          const { adx, plusDI, minusDI } = indicators.adx;
          if (adx > 25) {
            if (plusDI > minusDI && (strategy.tradeType === 'BUY' || strategy.tradeType === 'BOTH')) {
              signal = 'BUY';
              strength = Math.min(adx, 100);
              conditions.push(`Strong uptrend: ADX ${adx.toFixed(1)}`);
            } else if (minusDI > plusDI && (strategy.tradeType === 'SELL' || strategy.tradeType === 'BOTH')) {
              signal = 'SELL';
              strength = Math.min(adx, 100);
              conditions.push(`Strong downtrend: ADX ${adx.toFixed(1)}`);
            }
          }
          break;
      }

      // Only generate signals with sufficient strength and valid conditions
      if (signal && strength >= 60 && !isNaN(strength)) {
        return {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          strategyId: strategy.id,
          symbol,
          action: signal,
          strength: Math.round(strength),
          timestamp: new Date(),
          indicatorValues: indicators,
          conditions
        };
      }
    } catch (error) {
      console.error('Error evaluating strategy:', error);
    }

    return null;
  }
  // Generate price data simulation (for demo purposes)
  generateSimulatedPriceData(symbol: string, basePrice: number): PriceData {
    const volatility = 0.001; // 0.1% volatility
    const trend = (Math.random() - 0.5) * 0.0005; // Small trend component
    
    const change = (Math.random() - 0.5) * volatility + trend;
    const newPrice = basePrice * (1 + change);
    
    const high = newPrice * (1 + Math.random() * 0.0002);
    const low = newPrice * (1 - Math.random() * 0.0002);
    
    return {
      open: basePrice,
      high: Math.max(high, newPrice),
      low: Math.min(low, newPrice),
      close: newPrice,
      volume: Math.floor(Math.random() * 1000) + 100,
      timestamp: new Date()
    };
  }
  // Control methods - improved with proper cleanup
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('Automation Engine started');

    // Update indicators every 10 seconds for better performance
    this.intervalId = setInterval(() => {
      try {
        this.updateMarketData();
      } catch (error) {
        console.error('Error updating market data:', error);
      }
    }, 10000);
  }

  stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('Automation Engine stopped');
  }

  // Clean up resources
  cleanup(): void {
    this.stop();
    this.priceHistory = {};
    this.indicators = {};
    this.signals = [];
  }  
  private updateMarketData(): void {
    // Simulate market data updates for common symbols with improved realism
    const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];
    const basePrices = {
      'EURUSD': 1.2000,
      'GBPUSD': 1.3500,
      'USDJPY': 110.00,
      'AUDUSD': 0.7500,
      'USDCAD': 1.2500
    };

    symbols.forEach(symbol => {
      try {
        // Get last price for continuity
        const lastPrice = this.priceHistory[symbol]?.slice(-1)[0]?.close || basePrices[symbol as keyof typeof basePrices];
        const priceData = this.generateSimulatedPriceData(symbol, lastPrice);
        this.updatePriceData(symbol, priceData);
      } catch (error) {
        console.error(`Error updating data for ${symbol}:`, error);
      }
    });
  }  
  getIndicators(symbol: string): IndicatorValues | null {
    return this.indicators[symbol] || null;
  }

  getSignals(): AutomationSignal[] {
    return [...this.signals.slice(-50)]; // Return copy of last 50 signals
  }

  addSignal(signal: AutomationSignal): void {
    if (!signal || !signal.id || !signal.strategyId) {
      console.error('Invalid signal data');
      return;
    }

    this.signals.push(signal);
    
    // Keep only last 50 signals for better memory management
    if (this.signals.length > 50) {
      this.signals = this.signals.slice(-50);
    }
  }

  isEngineRunning(): boolean {
    return this.isRunning;
  }

  // Get performance metrics
  getPerformanceMetrics(): {
    totalSignals: number;
    signalsToday: number;
    averageStrength: number;
  } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const signalsToday = this.signals.filter(signal => 
      signal.timestamp >= today
    ).length;

    const averageStrength = this.signals.length > 0 
      ? this.signals.reduce((sum, signal) => sum + signal.strength, 0) / this.signals.length 
      : 0;

    return {
      totalSignals: this.signals.length,
      signalsToday,
      averageStrength: Math.round(averageStrength)
    };
  }
}

export const automationEngine = new AutomationEngine();
