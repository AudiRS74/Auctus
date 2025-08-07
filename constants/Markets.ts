export interface MarketPair {
  symbol: string;
  name: string;
  category: 'MAJOR' | 'MINOR' | 'EXOTIC' | 'CRYPTO' | 'COMMODITY';
  baseAsset: string;
  quoteAsset: string;
  minLotSize: number;
  maxLotSize: number;
  lotStep: number;
  pipDecimalPlaces: number;
  spreadTypical: number; // in pips
}

export const FOREX_MAJORS: MarketPair[] = [
  {
    symbol: 'EURUSD',
    name: 'Euro / US Dollar',
    category: 'MAJOR',
    baseAsset: 'EUR',
    quoteAsset: 'USD',
    minLotSize: 0.01,
    maxLotSize: 100,
    lotStep: 0.01,
    pipDecimalPlaces: 5,
    spreadTypical: 1.5,
  },
  {
    symbol: 'GBPUSD',
    name: 'British Pound / US Dollar',
    category: 'MAJOR',
    baseAsset: 'GBP',
    quoteAsset: 'USD',
    minLotSize: 0.01,
    maxLotSize: 100,
    lotStep: 0.01,
    pipDecimalPlaces: 5,
    spreadTypical: 2.0,
  },
  {
    symbol: 'USDJPY',
    name: 'US Dollar / Japanese Yen',
    category: 'MAJOR',
    baseAsset: 'USD',
    quoteAsset: 'JPY',
    minLotSize: 0.01,
    maxLotSize: 100,
    lotStep: 0.01,
    pipDecimalPlaces: 3,
    spreadTypical: 1.5,
  },
  {
    symbol: 'USDCHF',
    name: 'US Dollar / Swiss Franc',
    category: 'MAJOR',
    baseAsset: 'USD',
    quoteAsset: 'CHF',
    minLotSize: 0.01,
    maxLotSize: 100,
    lotStep: 0.01,
    pipDecimalPlaces: 5,
    spreadTypical: 2.5,
  },
  {
    symbol: 'AUDUSD',
    name: 'Australian Dollar / US Dollar',
    category: 'MAJOR',
    baseAsset: 'AUD',
    quoteAsset: 'USD',
    minLotSize: 0.01,
    maxLotSize: 100,
    lotStep: 0.01,
    pipDecimalPlaces: 5,
    spreadTypical: 2.0,
  },
  {
    symbol: 'USDCAD',
    name: 'US Dollar / Canadian Dollar',
    category: 'MAJOR',
    baseAsset: 'USD',
    quoteAsset: 'CAD',
    minLotSize: 0.01,
    maxLotSize: 100,
    lotStep: 0.01,
    pipDecimalPlaces: 5,
    spreadTypical: 2.0,
  },
  {
    symbol: 'NZDUSD',
    name: 'New Zealand Dollar / US Dollar',
    category: 'MAJOR',
    baseAsset: 'NZD',
    quoteAsset: 'USD',
    minLotSize: 0.01,
    maxLotSize: 100,
    lotStep: 0.01,
    pipDecimalPlaces: 5,
    spreadTypical: 2.5,
  },
];

export const FOREX_MINORS: MarketPair[] = [
  {
    symbol: 'EURGBP',
    name: 'Euro / British Pound',
    category: 'MINOR',
    baseAsset: 'EUR',
    quoteAsset: 'GBP',
    minLotSize: 0.01,
    maxLotSize: 100,
    lotStep: 0.01,
    pipDecimalPlaces: 5,
    spreadTypical: 3.0,
  },
  {
    symbol: 'EURJPY',
    name: 'Euro / Japanese Yen',
    category: 'MINOR',
    baseAsset: 'EUR',
    quoteAsset: 'JPY',
    minLotSize: 0.01,
    maxLotSize: 100,
    lotStep: 0.01,
    pipDecimalPlaces: 3,
    spreadTypical: 2.5,
  },
  {
    symbol: 'GBPJPY',
    name: 'British Pound / Japanese Yen',
    category: 'MINOR',
    baseAsset: 'GBP',
    quoteAsset: 'JPY',
    minLotSize: 0.01,
    maxLotSize: 100,
    lotStep: 0.01,
    pipDecimalPlaces: 3,
    spreadTypical: 3.5,
  },
];

export const CRYPTO_PAIRS: MarketPair[] = [
  {
    symbol: 'BTCUSD',
    name: 'Bitcoin / US Dollar',
    category: 'CRYPTO',
    baseAsset: 'BTC',
    quoteAsset: 'USD',
    minLotSize: 0.001,
    maxLotSize: 10,
    lotStep: 0.001,
    pipDecimalPlaces: 2,
    spreadTypical: 50,
  },
  {
    symbol: 'ETHUSD',
    name: 'Ethereum / US Dollar',
    category: 'CRYPTO',
    baseAsset: 'ETH',
    quoteAsset: 'USD',
    minLotSize: 0.01,
    maxLotSize: 100,
    lotStep: 0.01,
    pipDecimalPlaces: 2,
    spreadTypical: 30,
  },
];

export const ALL_MARKET_PAIRS = [
  ...FOREX_MAJORS,
  ...FOREX_MINORS,
  ...CRYPTO_PAIRS,
];

export const TRADING_SESSIONS = {
  SYDNEY: {
    name: 'Sydney',
    timezone: 'Australia/Sydney',
    openTime: '22:00',
    closeTime: '07:00',
    utcOffset: '+11:00',
  },
  TOKYO: {
    name: 'Tokyo',
    timezone: 'Asia/Tokyo',
    openTime: '00:00',
    closeTime: '09:00',
    utcOffset: '+09:00',
  },
  LONDON: {
    name: 'London',
    timezone: 'Europe/London',
    openTime: '08:00',
    closeTime: '17:00',
    utcOffset: '+00:00',
  },
  NEW_YORK: {
    name: 'New York',
    timezone: 'America/New_York',
    openTime: '13:00',
    closeTime: '22:00',
    utcOffset: '-05:00',
  },
};

export const TIMEFRAMES = [
  { label: '1M', value: '1M', seconds: 60 },
  { label: '5M', value: '5M', seconds: 300 },
  { label: '15M', value: '15M', seconds: 900 },
  { label: '30M', value: '30M', seconds: 1800 },
  { label: '1H', value: '1H', seconds: 3600 },
  { label: '4H', value: '4H', seconds: 14400 },
  { label: '1D', value: '1D', seconds: 86400 },
  { label: '1W', value: '1W', seconds: 604800 },
  { label: '1MN', value: '1MN', seconds: 2592000 },
];

export const TECHNICAL_INDICATORS = {
  RSI: {
    name: 'Relative Strength Index',
    shortName: 'RSI',
    defaultPeriod: 14,
    overboughtLevel: 70,
    oversoldLevel: 30,
  },
  MACD: {
    name: 'MACD',
    shortName: 'MACD',
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
  },
  MA: {
    name: 'Moving Average',
    shortName: 'MA',
    defaultPeriod: 20,
    types: ['Simple', 'Exponential', 'Weighted'],
  },
  BB: {
    name: 'Bollinger Bands',
    shortName: 'BB',
    defaultPeriod: 20,
    standardDeviations: 2,
  },
  STOCH: {
    name: 'Stochastic',
    shortName: 'STOCH',
    kPeriod: 14,
    dPeriod: 3,
    overboughtLevel: 80,
    oversoldLevel: 20,
  },
  ADX: {
    name: 'Average Directional Index',
    shortName: 'ADX',
    defaultPeriod: 14,
    trendStrengthLevel: 25,
  },
};

// Helper functions
export const getMarketPairBySymbol = (symbol: string): MarketPair | undefined => {
  return ALL_MARKET_PAIRS.find(pair => pair.symbol === symbol);
};

export const getMarketPairsByCategory = (category: MarketPair['category']): MarketPair[] => {
  return ALL_MARKET_PAIRS.filter(pair => pair.category === category);
};

export const formatPrice = (price: number, symbol: string): string => {
  const pair = getMarketPairBySymbol(symbol);
  if (!pair) return price.toFixed(5);
  
  return price.toFixed(pair.pipDecimalPlaces);
};

export const calculatePipValue = (symbol: string, lotSize: number = 1): number => {
  const pair = getMarketPairBySymbol(symbol);
  if (!pair) return 0;
  
  // Basic pip value calculation (simplified)
  if (pair.quoteAsset === 'USD') {
    return lotSize * 10; // $10 per pip for standard lot in USD pairs
  }
  
  return lotSize * 10; // Simplified for demo
};

export default {
  FOREX_MAJORS,
  FOREX_MINORS,
  CRYPTO_PAIRS,
  ALL_MARKET_PAIRS,
  TRADING_SESSIONS,
  TIMEFRAMES,
  TECHNICAL_INDICATORS,
  getMarketPairBySymbol,
  getMarketPairsByCategory,
  formatPrice,
  calculatePipValue,
};