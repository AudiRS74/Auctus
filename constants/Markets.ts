export interface MarketInfo {
  symbol: string;
  name: string;
  category: string;
  tradingViewSymbol?: string;
}

export const QUICK_ACCESS_SYMBOLS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD'
];

export const MARKET_CATEGORIES = [
  'Forex', 'Stocks', 'Crypto', 'Commodities', 'Indices'
];

export const ALL_MARKETS: MarketInfo[] = [
  // Major Forex Pairs
  { symbol: 'EURUSD', name: 'Euro / US Dollar', category: 'Forex', tradingViewSymbol: 'FX:EURUSD' },
  { symbol: 'GBPUSD', name: 'British Pound / US Dollar', category: 'Forex', tradingViewSymbol: 'FX:GBPUSD' },
  { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen', category: 'Forex', tradingViewSymbol: 'FX:USDJPY' },
  { symbol: 'AUDUSD', name: 'Australian Dollar / US Dollar', category: 'Forex', tradingViewSymbol: 'FX:AUDUSD' },
  { symbol: 'USDCAD', name: 'US Dollar / Canadian Dollar', category: 'Forex', tradingViewSymbol: 'FX:USDCAD' },
  { symbol: 'USDCHF', name: 'US Dollar / Swiss Franc', category: 'Forex', tradingViewSymbol: 'FX:USDCHF' },
  { symbol: 'NZDUSD', name: 'New Zealand Dollar / US Dollar', category: 'Forex', tradingViewSymbol: 'FX:NZDUSD' },
  
  // Cross Currency Pairs
  { symbol: 'EURGBP', name: 'Euro / British Pound', category: 'Forex', tradingViewSymbol: 'FX:EURGBP' },
  { symbol: 'EURJPY', name: 'Euro / Japanese Yen', category: 'Forex', tradingViewSymbol: 'FX:EURJPY' },
  { symbol: 'GBPJPY', name: 'British Pound / Japanese Yen', category: 'Forex', tradingViewSymbol: 'FX:GBPJPY' },
  
  // Major Stocks
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'Stocks', tradingViewSymbol: 'NASDAQ:AAPL' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', category: 'Stocks', tradingViewSymbol: 'NASDAQ:GOOGL' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', category: 'Stocks', tradingViewSymbol: 'NASDAQ:MSFT' },
  { symbol: 'TSLA', name: 'Tesla Inc.', category: 'Stocks', tradingViewSymbol: 'NASDAQ:TSLA' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', category: 'Stocks', tradingViewSymbol: 'NASDAQ:AMZN' },
  { symbol: 'META', name: 'Meta Platforms Inc.', category: 'Stocks', tradingViewSymbol: 'NASDAQ:META' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', category: 'Stocks', tradingViewSymbol: 'NASDAQ:NVDA' },
  
  // Cryptocurrencies
  { symbol: 'BTCUSD', name: 'Bitcoin / US Dollar', category: 'Crypto', tradingViewSymbol: 'BINANCE:BTCUSDT' },
  { symbol: 'ETHUSD', name: 'Ethereum / US Dollar', category: 'Crypto', tradingViewSymbol: 'BINANCE:ETHUSDT' },
  { symbol: 'ADAUSD', name: 'Cardano / US Dollar', category: 'Crypto', tradingViewSymbol: 'BINANCE:ADAUSDT' },
  { symbol: 'SOLUSD', name: 'Solana / US Dollar', category: 'Crypto', tradingViewSymbol: 'BINANCE:SOLUSDT' },
  
  // Commodities
  { symbol: 'XAUUSD', name: 'Gold / US Dollar', category: 'Commodities', tradingViewSymbol: 'FX:XAUUSD' },
  { symbol: 'XAGUSD', name: 'Silver / US Dollar', category: 'Commodities', tradingViewSymbol: 'FX:XAGUSD' },
  { symbol: 'WTIUSD', name: 'WTI Crude Oil', category: 'Commodities', tradingViewSymbol: 'NYMEX:CL1!' },
  { symbol: 'NATGAS', name: 'Natural Gas', category: 'Commodities', tradingViewSymbol: 'NYMEX:NG1!' },
  
  // Indices
  { symbol: 'SPX500', name: 'S&P 500', category: 'Indices', tradingViewSymbol: 'SP:SPX' },
  { symbol: 'NAS100', name: 'NASDAQ 100', category: 'Indices', tradingViewSymbol: 'NASDAQ:NDX' },
  { symbol: 'DAX30', name: 'DAX 30', category: 'Indices', tradingViewSymbol: 'XETR:DAX' },
  { symbol: 'FTSE100', name: 'FTSE 100', category: 'Indices', tradingViewSymbol: 'LSE:UKX' },
];

export function searchMarkets(query: string): MarketInfo[] {
  const lowercaseQuery = query.toLowerCase();
  return ALL_MARKETS.filter(market => 
    market.symbol.toLowerCase().includes(lowercaseQuery) ||
    market.name.toLowerCase().includes(lowercaseQuery) ||
    market.category.toLowerCase().includes(lowercaseQuery)
  );
}

export function getMarketBySymbol(symbol: string): MarketInfo | undefined {
  return ALL_MARKETS.find(market => market.symbol === symbol);
}

export function getTradingViewSymbol(symbol: string): string {
  const market = getMarketBySymbol(symbol);
  return market?.tradingViewSymbol || `FX:${symbol}`;
}

export function getMarketsByCategory(category: string): MarketInfo[] {
  return ALL_MARKETS.filter(market => market.category === category);
}

// Popular symbols for different categories
export const POPULAR_FOREX = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'];
export const POPULAR_STOCKS = ['AAPL', 'GOOGL', 'MSFT', 'TSLA'];
export const POPULAR_CRYPTO = ['BTCUSD', 'ETHUSD', 'ADAUSD', 'SOLUSD'];
export const POPULAR_COMMODITIES = ['XAUUSD', 'XAGUSD', 'WTIUSD'];
export const POPULAR_INDICES = ['SPX500', 'NAS100', 'DAX30'];