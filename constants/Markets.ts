export interface MarketInfo {
  symbol: string;
  name: string;
  category: 'Major Forex' | 'Minor Forex' | 'Exotic Forex' | 'Commodities' | 'Indices' | 'Cryptocurrencies';
  description: string;
}

export const QUICK_ACCESS_SYMBOLS = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];

export const ALL_MARKETS: MarketInfo[] = [
  // Major Forex Pairs
  { symbol: 'EURUSD', name: 'EUR/USD', category: 'Major Forex', description: 'Euro vs US Dollar' },
  { symbol: 'GBPUSD', name: 'GBP/USD', category: 'Major Forex', description: 'British Pound vs US Dollar' },
  { symbol: 'USDJPY', name: 'USD/JPY', category: 'Major Forex', description: 'US Dollar vs Japanese Yen' },
  { symbol: 'AUDUSD', name: 'AUD/USD', category: 'Major Forex', description: 'Australian Dollar vs US Dollar' },
  { symbol: 'USDCAD', name: 'USD/CAD', category: 'Major Forex', description: 'US Dollar vs Canadian Dollar' },
  { symbol: 'USDCHF', name: 'USD/CHF', category: 'Major Forex', description: 'US Dollar vs Swiss Franc' },
  { symbol: 'NZDUSD', name: 'NZD/USD', category: 'Major Forex', description: 'New Zealand Dollar vs US Dollar' },

  // Minor Forex Pairs
  { symbol: 'EURGBP', name: 'EUR/GBP', category: 'Minor Forex', description: 'Euro vs British Pound' },
  { symbol: 'EURJPY', name: 'EUR/JPY', category: 'Minor Forex', description: 'Euro vs Japanese Yen' },
  { symbol: 'EURAUD', name: 'EUR/AUD', category: 'Minor Forex', description: 'Euro vs Australian Dollar' },
  { symbol: 'EURCAD', name: 'EUR/CAD', category: 'Minor Forex', description: 'Euro vs Canadian Dollar' },
  { symbol: 'EURCHF', name: 'EUR/CHF', category: 'Minor Forex', description: 'Euro vs Swiss Franc' },
  { symbol: 'GBPJPY', name: 'GBP/JPY', category: 'Minor Forex', description: 'British Pound vs Japanese Yen' },
  { symbol: 'GBPAUD', name: 'GBP/AUD', category: 'Minor Forex', description: 'British Pound vs Australian Dollar' },
  { symbol: 'GBPCAD', name: 'GBP/CAD', category: 'Minor Forex', description: 'British Pound vs Canadian Dollar' },
  { symbol: 'GBPCHF', name: 'GBP/CHF', category: 'Minor Forex', description: 'British Pound vs Swiss Franc' },
  { symbol: 'AUDCAD', name: 'AUD/CAD', category: 'Minor Forex', description: 'Australian Dollar vs Canadian Dollar' },
  { symbol: 'AUDCHF', name: 'AUD/CHF', category: 'Minor Forex', description: 'Australian Dollar vs Swiss Franc' },
  { symbol: 'AUDJPY', name: 'AUD/JPY', category: 'Minor Forex', description: 'Australian Dollar vs Japanese Yen' },
  { symbol: 'CADCHF', name: 'CAD/CHF', category: 'Minor Forex', description: 'Canadian Dollar vs Swiss Franc' },
  { symbol: 'CADJPY', name: 'CAD/JPY', category: 'Minor Forex', description: 'Canadian Dollar vs Japanese Yen' },
  { symbol: 'CHFJPY', name: 'CHF/JPY', category: 'Minor Forex', description: 'Swiss Franc vs Japanese Yen' },
  { symbol: 'NZDCAD', name: 'NZD/CAD', category: 'Minor Forex', description: 'New Zealand Dollar vs Canadian Dollar' },
  { symbol: 'NZDCHF', name: 'NZD/CHF', category: 'Minor Forex', description: 'New Zealand Dollar vs Swiss Franc' },
  { symbol: 'NZDJPY', name: 'NZD/JPY', category: 'Minor Forex', description: 'New Zealand Dollar vs Japanese Yen' },

  // Exotic Forex Pairs
  { symbol: 'USDTRY', name: 'USD/TRY', category: 'Exotic Forex', description: 'US Dollar vs Turkish Lira' },
  { symbol: 'USDZAR', name: 'USD/ZAR', category: 'Exotic Forex', description: 'US Dollar vs South African Rand' },
  { symbol: 'USDMXN', name: 'USD/MXN', category: 'Exotic Forex', description: 'US Dollar vs Mexican Peso' },
  { symbol: 'USDSEK', name: 'USD/SEK', category: 'Exotic Forex', description: 'US Dollar vs Swedish Krona' },
  { symbol: 'USDNOK', name: 'USD/NOK', category: 'Exotic Forex', description: 'US Dollar vs Norwegian Krone' },
  { symbol: 'USDDKK', name: 'USD/DKK', category: 'Exotic Forex', description: 'US Dollar vs Danish Krone' },
  { symbol: 'USDPLN', name: 'USD/PLN', category: 'Exotic Forex', description: 'US Dollar vs Polish Zloty' },
  { symbol: 'USDCZK', name: 'USD/CZK', category: 'Exotic Forex', description: 'US Dollar vs Czech Koruna' },
  { symbol: 'USDHUF', name: 'USD/HUF', category: 'Exotic Forex', description: 'US Dollar vs Hungarian Forint' },
  { symbol: 'USDSGD', name: 'USD/SGD', category: 'Exotic Forex', description: 'US Dollar vs Singapore Dollar' },
  { symbol: 'USDHKD', name: 'USD/HKD', category: 'Exotic Forex', description: 'US Dollar vs Hong Kong Dollar' },
  { symbol: 'EURTRY', name: 'EUR/TRY', category: 'Exotic Forex', description: 'Euro vs Turkish Lira' },
  { symbol: 'EURZAR', name: 'EUR/ZAR', category: 'Exotic Forex', description: 'Euro vs South African Rand' },
  { symbol: 'GBPTRY', name: 'GBP/TRY', category: 'Exotic Forex', description: 'British Pound vs Turkish Lira' },

  // Commodities
  { symbol: 'XAUUSD', name: 'Gold', category: 'Commodities', description: 'Gold vs US Dollar' },
  { symbol: 'XAGUSD', name: 'Silver', category: 'Commodities', description: 'Silver vs US Dollar' },
  { symbol: 'XPTUSD', name: 'Platinum', category: 'Commodities', description: 'Platinum vs US Dollar' },
  { symbol: 'XPDUSD', name: 'Palladium', category: 'Commodities', description: 'Palladium vs US Dollar' },
  { symbol: 'XTIUSD', name: 'WTI Oil', category: 'Commodities', description: 'West Texas Intermediate Crude Oil' },
  { symbol: 'XBRUSD', name: 'Brent Oil', category: 'Commodities', description: 'Brent Crude Oil' },
  { symbol: 'XNGUSD', name: 'Natural Gas', category: 'Commodities', description: 'Natural Gas' },
  { symbol: 'COPPER', name: 'Copper', category: 'Commodities', description: 'Copper' },
  { symbol: 'WHEAT', name: 'Wheat', category: 'Commodities', description: 'Wheat Futures' },
  { symbol: 'CORN', name: 'Corn', category: 'Commodities', description: 'Corn Futures' },
  { symbol: 'SOYBEANS', name: 'Soybeans', category: 'Commodities', description: 'Soybeans Futures' },
  { symbol: 'SUGAR', name: 'Sugar', category: 'Commodities', description: 'Sugar Futures' },
  { symbol: 'COFFEE', name: 'Coffee', category: 'Commodities', description: 'Coffee Futures' },
  { symbol: 'COCOA', name: 'Cocoa', category: 'Commodities', description: 'Cocoa Futures' },
  { symbol: 'COTTON', name: 'Cotton', category: 'Commodities', description: 'Cotton Futures' },

  // Indices
  { symbol: 'US30', name: 'Dow Jones', category: 'Indices', description: 'Dow Jones Industrial Average' },
  { symbol: 'US500', name: 'S&P 500', category: 'Indices', description: 'S&P 500 Index' },
  { symbol: 'US100', name: 'NASDAQ', category: 'Indices', description: 'NASDAQ 100 Index' },
  { symbol: 'UK100', name: 'FTSE 100', category: 'Indices', description: 'Financial Times Stock Exchange 100' },
  { symbol: 'GER30', name: 'DAX', category: 'Indices', description: 'German Stock Index DAX 30' },
  { symbol: 'FRA40', name: 'CAC 40', category: 'Indices', description: 'French Stock Index CAC 40' },
  { symbol: 'ESP35', name: 'IBEX 35', category: 'Indices', description: 'Spanish Stock Index IBEX 35' },
  { symbol: 'ITA40', name: 'FTSE MIB', category: 'Indices', description: 'Italian Stock Index FTSE MIB' },
  { symbol: 'AUS200', name: 'ASX 200', category: 'Indices', description: 'Australian Securities Exchange 200' },
  { symbol: 'JPN225', name: 'Nikkei 225', category: 'Indices', description: 'Japanese Stock Index Nikkei 225' },
  { symbol: 'HK50', name: 'Hang Seng', category: 'Indices', description: 'Hong Kong Hang Seng Index' },
  { symbol: 'EUSTX50', name: 'Euro Stoxx 50', category: 'Indices', description: 'Euro Stoxx 50 Index' },
  { symbol: 'SUI30', name: 'SMI', category: 'Indices', description: 'Swiss Market Index' },
  { symbol: 'NED25', name: 'AEX', category: 'Indices', description: 'Amsterdam Exchange Index' },

  // Cryptocurrencies
  { symbol: 'BTCUSD', name: 'Bitcoin', category: 'Cryptocurrencies', description: 'Bitcoin vs US Dollar' },
  { symbol: 'ETHUSD', name: 'Ethereum', category: 'Cryptocurrencies', description: 'Ethereum vs US Dollar' },
  { symbol: 'LTCUSD', name: 'Litecoin', category: 'Cryptocurrencies', description: 'Litecoin vs US Dollar' },
  { symbol: 'XRPUSD', name: 'Ripple', category: 'Cryptocurrencies', description: 'Ripple vs US Dollar' },
  { symbol: 'BCHUSD', name: 'Bitcoin Cash', category: 'Cryptocurrencies', description: 'Bitcoin Cash vs US Dollar' },
  { symbol: 'ADAUSD', name: 'Cardano', category: 'Cryptocurrencies', description: 'Cardano vs US Dollar' },
  { symbol: 'DOTUSD', name: 'Polkadot', category: 'Cryptocurrencies', description: 'Polkadot vs US Dollar' },
  { symbol: 'LINKUSD', name: 'Chainlink', category: 'Cryptocurrencies', description: 'Chainlink vs US Dollar' },
  { symbol: 'BNBUSD', name: 'Binance Coin', category: 'Cryptocurrencies', description: 'Binance Coin vs US Dollar' },
  { symbol: 'SOLUSD', name: 'Solana', category: 'Cryptocurrencies', description: 'Solana vs US Dollar' },
  { symbol: 'MATICUSD', name: 'Polygon', category: 'Cryptocurrencies', description: 'Polygon vs US Dollar' },
  { symbol: 'AVAXUSD', name: 'Avalanche', category: 'Cryptocurrencies', description: 'Avalanche vs US Dollar' },
];

export const getMarketsByCategory = (category: string): MarketInfo[] => {
  return ALL_MARKETS.filter(market => market.category === category);
};

export const searchMarkets = (query: string): MarketInfo[] => {
  const lowerQuery = query.toLowerCase();
  return ALL_MARKETS.filter(market =>
    market.symbol.toLowerCase().includes(lowerQuery) ||
    market.name.toLowerCase().includes(lowerQuery) ||
    market.description.toLowerCase().includes(lowerQuery)
  );
};

export const getMarketInfo = (symbol: string): MarketInfo | undefined => {
  return ALL_MARKETS.find(market => market.symbol === symbol);
};

export const MARKET_CATEGORIES = [
  'Major Forex',
  'Minor Forex', 
  'Exotic Forex',
  'Commodities',
  'Indices',
  'Cryptocurrencies'
];