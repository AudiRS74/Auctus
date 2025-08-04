export interface MarketInfo {
  symbol: string;
  name: string;
  category: 'Forex' | 'Crypto' | 'Stocks' | 'Indices' | 'Commodities' | 'Bonds';
  tradingViewSymbol?: string;
}

export const QUICK_ACCESS_SYMBOLS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD', 'EURGBP'
];

export const MARKET_CATEGORIES = [
  'Forex', 'Crypto', 'Stocks', 'Indices', 'Commodities', 'Bonds'
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
  { symbol: 'EURGBP', name: 'Euro / British Pound', category: 'Forex', tradingViewSymbol: 'FX:EURGBP' },
  
  // Minor Forex Pairs
  { symbol: 'EURJPY', name: 'Euro / Japanese Yen', category: 'Forex', tradingViewSymbol: 'FX:EURJPY' },
  { symbol: 'EURCHF', name: 'Euro / Swiss Franc', category: 'Forex', tradingViewSymbol: 'FX:EURCHF' },
  { symbol: 'EURAUD', name: 'Euro / Australian Dollar', category: 'Forex', tradingViewSymbol: 'FX:EURAUD' },
  { symbol: 'EURCAD', name: 'Euro / Canadian Dollar', category: 'Forex', tradingViewSymbol: 'FX:EURCAD' },
  { symbol: 'GBPJPY', name: 'British Pound / Japanese Yen', category: 'Forex', tradingViewSymbol: 'FX:GBPJPY' },
  { symbol: 'GBPCHF', name: 'British Pound / Swiss Franc', category: 'Forex', tradingViewSymbol: 'FX:GBPCHF' },
  { symbol: 'GBPAUD', name: 'British Pound / Australian Dollar', category: 'Forex', tradingViewSymbol: 'FX:GBPAUD' },
  { symbol: 'GBPCAD', name: 'British Pound / Canadian Dollar', category: 'Forex', tradingViewSymbol: 'FX:GBPCAD' },
  { symbol: 'CHFJPY', name: 'Swiss Franc / Japanese Yen', category: 'Forex', tradingViewSymbol: 'FX:CHFJPY' },
  { symbol: 'CADJPY', name: 'Canadian Dollar / Japanese Yen', category: 'Forex', tradingViewSymbol: 'FX:CADJPY' },
  { symbol: 'AUDJPY', name: 'Australian Dollar / Japanese Yen', category: 'Forex', tradingViewSymbol: 'FX:AUDJPY' },
  { symbol: 'NZDJPY', name: 'New Zealand Dollar / Japanese Yen', category: 'Forex', tradingViewSymbol: 'FX:NZDJPY' },

  // Cryptocurrencies
  { symbol: 'BTCUSD', name: 'Bitcoin / US Dollar', category: 'Crypto', tradingViewSymbol: 'BINANCE:BTCUSDT' },
  { symbol: 'ETHUSD', name: 'Ethereum / US Dollar', category: 'Crypto', tradingViewSymbol: 'BINANCE:ETHUSDT' },
  { symbol: 'ADAUSD', name: 'Cardano / US Dollar', category: 'Crypto', tradingViewSymbol: 'BINANCE:ADAUSDT' },
  { symbol: 'DOTUSD', name: 'Polkadot / US Dollar', category: 'Crypto', tradingViewSymbol: 'BINANCE:DOTUSDT' },
  { symbol: 'LINKUSD', name: 'Chainlink / US Dollar', category: 'Crypto', tradingViewSymbol: 'BINANCE:LINKUSDT' },
  { symbol: 'LTCUSD', name: 'Litecoin / US Dollar', category: 'Crypto', tradingViewSymbol: 'BINANCE:LTCUSDT' },
  { symbol: 'BNBUSD', name: 'Binance Coin / US Dollar', category: 'Crypto', tradingViewSymbol: 'BINANCE:BNBUSDT' },
  { symbol: 'XRPUSD', name: 'Ripple / US Dollar', category: 'Crypto', tradingViewSymbol: 'BINANCE:XRPUSDT' },

  // Major Stock Indices
  { symbol: 'SPX500', name: 'S&P 500 Index', category: 'Indices', tradingViewSymbol: 'SP:SPX' },
  { symbol: 'US30', name: 'Dow Jones Industrial Average', category: 'Indices', tradingViewSymbol: 'DJ:DJI' },
  { symbol: 'NAS100', name: 'NASDAQ 100 Index', category: 'Indices', tradingViewSymbol: 'NASDAQ:NDX' },
  { symbol: 'UK100', name: 'FTSE 100 Index', category: 'Indices', tradingViewSymbol: 'TVC:UKX' },
  { symbol: 'GER40', name: 'DAX 40 Index', category: 'Indices', tradingViewSymbol: 'TVC:DAX' },
  { symbol: 'JPN225', name: 'Nikkei 225 Index', category: 'Indices', tradingViewSymbol: 'TVC:NI225' },
  { symbol: 'AUS200', name: 'ASX 200 Index', category: 'Indices', tradingViewSymbol: 'TVC:AS51' },
  { symbol: 'FRA40', name: 'CAC 40 Index', category: 'Indices', tradingViewSymbol: 'TVC:CAC' },

  // Popular Stocks
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'Stocks', tradingViewSymbol: 'NASDAQ:AAPL' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', category: 'Stocks', tradingViewSymbol: 'NASDAQ:GOOGL' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', category: 'Stocks', tradingViewSymbol: 'NASDAQ:MSFT' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', category: 'Stocks', tradingViewSymbol: 'NASDAQ:AMZN' },
  { symbol: 'TSLA', name: 'Tesla Inc.', category: 'Stocks', tradingViewSymbol: 'NASDAQ:TSLA' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', category: 'Stocks', tradingViewSymbol: 'NASDAQ:NVDA' },
  { symbol: 'META', name: 'Meta Platforms Inc.', category: 'Stocks', tradingViewSymbol: 'NASDAQ:META' },
  { symbol: 'NFLX', name: 'Netflix Inc.', category: 'Stocks', tradingViewSymbol: 'NASDAQ:NFLX' },

  // Commodities
  { symbol: 'XAUUSD', name: 'Gold / US Dollar', category: 'Commodities', tradingViewSymbol: 'TVC:GOLD' },
  { symbol: 'XAGUSD', name: 'Silver / US Dollar', category: 'Commodities', tradingViewSymbol: 'TVC:SILVER' },
  { symbol: 'USOIL', name: 'US Crude Oil', category: 'Commodities', tradingViewSymbol: 'TVC:USOIL' },
  { symbol: 'UKOIL', name: 'UK Brent Oil', category: 'Commodities', tradingViewSymbol: 'TVC:UKOIL' },
  { symbol: 'NATGAS', name: 'Natural Gas', category: 'Commodities', tradingViewSymbol: 'TVC:NATURALGAS' },
  { symbol: 'COPPER', name: 'Copper', category: 'Commodities', tradingViewSymbol: 'COMEX:HG1!' },
  { symbol: 'PLATINUM', name: 'Platinum', category: 'Commodities', tradingViewSymbol: 'TVC:PLATINUM' },
  { symbol: 'PALLADIUM', name: 'Palladium', category: 'Commodities', tradingViewSymbol: 'TVC:PALLADIUM' },

  // Government Bonds
  { symbol: 'US10Y', name: 'US 10 Year Treasury Note', category: 'Bonds', tradingViewSymbol: 'TVC:TNX' },
  { symbol: 'US30Y', name: 'US 30 Year Treasury Bond', category: 'Bonds', tradingViewSymbol: 'TVC:TYX' },
  { symbol: 'UK10Y', name: 'UK 10 Year Gilt', category: 'Bonds', tradingViewSymbol: 'TVC:UK10Y' },
  { symbol: 'DE10Y', name: 'German 10 Year Bund', category: 'Bonds', tradingViewSymbol: 'TVC:DE10Y' },
  { symbol: 'JP10Y', name: 'Japan 10 Year Bond', category: 'Bonds', tradingViewSymbol: 'TVC:JP10Y' },
];

// Search function for markets
export const searchMarkets = (query: string): MarketInfo[] => {
  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) return ALL_MARKETS;

  return ALL_MARKETS.filter(market => 
    market.symbol.toLowerCase().includes(searchTerm) ||
    market.name.toLowerCase().includes(searchTerm) ||
    market.category.toLowerCase().includes(searchTerm)
  );
};

// Get market info by symbol
export const getMarketInfo = (symbol: string): MarketInfo | undefined => {
  return ALL_MARKETS.find(market => market.symbol === symbol);
};

// Get TradingView symbol for a market
export const getTradingViewSymbol = (symbol: string): string => {
  const market = getMarketInfo(symbol);
  return market?.tradingViewSymbol || `FX:${symbol}`;
};

// MT5 Server configurations - authentic MT5 servers
export const MT5_SERVERS = [
  // Demo Servers
  { name: 'MetaQuotes-Demo', type: 'demo', region: 'Global' },
  { name: 'Demo-MetaTrader5', type: 'demo', region: 'Global' },
  { name: 'MT5-Demo', type: 'demo', region: 'Global' },
  
  // Popular Broker Servers (for reference - these would be actual broker servers)
  { name: 'IC-Markets-Demo', type: 'demo', region: 'Australia' },
  { name: 'FXTM-Demo', type: 'demo', region: 'Cyprus' },
  { name: 'XM-Demo', type: 'demo', region: 'Cyprus' },
  { name: 'Pepperstone-Demo', type: 'demo', region: 'Australia' },
  { name: 'IG-Demo', type: 'demo', region: 'UK' },
  { name: 'OANDA-Demo', type: 'demo', region: 'US' },
  { name: 'FxPro-Demo', type: 'demo', region: 'Cyprus' },
  { name: 'Admiral-Markets-Demo', type: 'demo', region: 'Estonia' },
];

// Demo account credentials for testing
export const DEMO_CREDENTIALS = [
  { server: 'MetaQuotes-Demo', login: '12345', password: 'demo123' },
  { server: 'Demo-MetaTrader5', login: '123456', password: 'password' },
  { server: 'MT5-Demo', login: '1234567', password: 'test123' },
  { server: 'demo', login: '12345', password: 'demo123' }, // Simple demo for testing
];