// Trading symbols and market data
export const QUICK_ACCESS_SYMBOLS = [
  'EURUSD',
  'GBPUSD', 
  'USDJPY',
  'AUDUSD',
  'USDCAD',
  'USDCHF',
  'NZDUSD',
  'EURJPY'
];

export interface MarketInfo {
  symbol: string;
  name: string;
  category: string;
}

export const ALL_MARKETS: MarketInfo[] = [
  { symbol: 'EURUSD', name: 'Euro / US Dollar', category: 'Forex' },
  { symbol: 'GBPUSD', name: 'British Pound / US Dollar', category: 'Forex' },
  { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen', category: 'Forex' },
  { symbol: 'AUDUSD', name: 'Australian Dollar / US Dollar', category: 'Forex' },
  { symbol: 'USDCAD', name: 'US Dollar / Canadian Dollar', category: 'Forex' },
  { symbol: 'USDCHF', name: 'US Dollar / Swiss Franc', category: 'Forex' },
  { symbol: 'NZDUSD', name: 'New Zealand Dollar / US Dollar', category: 'Forex' },
  { symbol: 'EURJPY', name: 'Euro / Japanese Yen', category: 'Forex' },
  { symbol: 'GBPJPY', name: 'British Pound / Japanese Yen', category: 'Forex' },
  { symbol: 'EURGBP', name: 'Euro / British Pound', category: 'Forex' },
  { symbol: 'XAUUSD', name: 'Gold / US Dollar', category: 'Commodities' },
  { symbol: 'XAGUSD', name: 'Silver / US Dollar', category: 'Commodities' },
  { symbol: 'US30', name: 'Dow Jones Industrial Average', category: 'Indices' },
  { symbol: 'SPX500', name: 'S&P 500', category: 'Indices' },
  { symbol: 'NAS100', name: 'NASDAQ 100', category: 'Indices' },
  { symbol: 'BTCUSD', name: 'Bitcoin / US Dollar', category: 'Crypto' },
  { symbol: 'ETHUSD', name: 'Ethereum / US Dollar', category: 'Crypto' },
];

export const MARKET_CATEGORIES = ['Forex', 'Commodities', 'Indices', 'Crypto'];

export function searchMarkets(query: string): MarketInfo[] {
  if (!query.trim()) return ALL_MARKETS;
  
  const lowerQuery = query.toLowerCase();
  return ALL_MARKETS.filter(market => 
    market.symbol.toLowerCase().includes(lowerQuery) ||
    market.name.toLowerCase().includes(lowerQuery)
  );
}

export function getTradingViewSymbol(symbol: string): string {
  const symbolMap: { [key: string]: string } = {
    'EURUSD': 'FX:EURUSD',
    'GBPUSD': 'FX:GBPUSD',
    'USDJPY': 'FX:USDJPY',
    'AUDUSD': 'FX:AUDUSD',
    'USDCAD': 'FX:USDCAD',
    'USDCHF': 'FX:USDCHF',
    'NZDUSD': 'FX:NZDUSD',
    'EURJPY': 'FX:EURJPY',
    'GBPJPY': 'FX:GBPJPY',
    'EURGBP': 'FX:EURGBP',
    'XAUUSD': 'OANDA:XAUUSD',
    'XAGUSD': 'OANDA:XAGUSD',
    'US30': 'DJ:DJI',
    'SPX500': 'SP:SPX',
    'NAS100': 'NASDAQ:NDX',
    'BTCUSD': 'COINBASE:BTCUSD',
    'ETHUSD': 'COINBASE:ETHUSD',
  };
  
  return symbolMap[symbol] || `FX:${symbol}`;
}