export interface MarketInfo {
  symbol: string;
  name: string;
  category: string;
  description?: string;
  baseAsset?: string;
  quoteAsset?: string;
  minLotSize?: number;
  maxLotSize?: number;
  lotStep?: number;
  pipSize?: number;
  spread?: number;
}

// Quick access symbols for main trading interface
export const QUICK_ACCESS_SYMBOLS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 
  'USDCHF', 'NZDUSD', 'EURGBP', 'XAUUSD', 'BTCUSD'
];

// Market categories for filtering
export const MARKET_CATEGORIES = [
  'Major Pairs', 'Minor Pairs', 'Exotic Pairs', 'Commodities', 
  'Cryptocurrencies', 'Stocks', 'Indices', 'Metals', 'Energy'
];

// Comprehensive market definitions
export const ALL_MARKETS: MarketInfo[] = [
  // Major Currency Pairs
  {
    symbol: 'EURUSD',
    name: 'Euro vs US Dollar',
    category: 'Major Pairs',
    description: 'The most traded currency pair in the world',
    baseAsset: 'EUR',
    quoteAsset: 'USD',
    minLotSize: 0.01,
    maxLotSize: 100,
    lotStep: 0.01,
    pipSize: 0.0001,
    spread: 1.2
  },
  {
    symbol: 'GBPUSD',
    name: 'British Pound vs US Dollar',
    category: 'Major Pairs',
    description: 'Cable - One of the most volatile major pairs',
    baseAsset: 'GBP',
    quoteAsset: 'USD',
    minLotSize: 0.01,
    maxLotSize: 100,
    lotStep: 0.01,
    pipSize: 0.0001,
    spread: 1.5
  },
  {
    symbol: 'USDJPY',
    name: 'US Dollar vs Japanese Yen',
    category: 'Major Pairs',
    description: 'Popular pair with good liquidity and tight spreads',
    baseAsset: 'USD',
    quoteAsset: 'JPY',
    minLotSize: 0.01,
    maxLotSize: 100,
    lotStep: 0.01,
    pipSize: 0.01,
    spread: 1.1
  },
  {
    symbol: 'AUDUSD',
    name: 'Australian Dollar vs US Dollar',
    category: 'Major Pairs',
    description: 'Commodity-linked currency pair',
    baseAsset: 'AUD',
    quoteAsset: 'USD',
    minLotSize: 0.01,
    maxLotSize: 100,
    lotStep: 0.01,
    pipSize: 0.0001,
    spread: 1.4
  },
  {
    symbol: 'USDCAD',
    name: 'US Dollar vs Canadian Dollar',
    category: 'Major Pairs',
    description: 'Oil-correlated currency pair',
    baseAsset: 'USD',
    quoteAsset: 'CAD',
    minLotSize: 0.01,
    maxLotSize: 100,
    lotStep: 0.01,
    pipSize: 0.0001,
    spread: 1.3
  },
  {
    symbol: 'USDCHF',
    name: 'US Dollar vs Swiss Franc',
    category: 'Major Pairs',
    description: 'Safe-haven currency pair',
    baseAsset: 'USD',
    quoteAsset: 'CHF',
    minLotSize: 0.01,
    maxLotSize: 100,
    lotStep: 0.01,
    pipSize: 0.0001,
    spread: 1.2
  },
  {
    symbol: 'NZDUSD',
    name: 'New Zealand Dollar vs US Dollar',
    category: 'Major Pairs',
    description: 'Kiwi - Commodity currency with higher volatility',
    baseAsset: 'NZD',
    quoteAsset: 'USD',
    minLotSize: 0.01,
    maxLotSize: 100,
    lotStep: 0.01,
    pipSize: 0.0001,
    spread: 1.6
  },

  // Minor Currency Pairs (Cross Pairs)
  {
    symbol: 'EURGBP',
    name: 'Euro vs British Pound',
    category: 'Minor Pairs',
    description: 'Popular European cross pair',
    baseAsset: 'EUR',
    quoteAsset: 'GBP',
    minLotSize: 0.01,
    maxLotSize: 100,
    lotStep: 0.01,
    pipSize: 0.0001,
    spread: 1.1
  },
  {
    symbol: 'EURJPY',
    name: 'Euro vs Japanese Yen',
    category: 'Minor Pairs',
    description: 'High volatility cross pair',
    baseAsset: 'EUR',
    quoteAsset: 'JPY',
    minLotSize: 0.01,
    maxLotSize: 100,
    lotStep: 0.01,
    pipSize: 0.01,
    spread: 1.4
  },
  {
    symbol: 'EURCHF',
    name: 'Euro vs Swiss Franc',
    category: 'Minor Pairs',
    description: 'European stability cross',
    baseAsset: 'EUR',
    quoteAsset: 'CHF',
    minLotSize: 0.01,
    maxLotSize: 100,
    lotStep: 0.01,
    pipSize: 0.0001,
    spread: 1.5
  },
  {
    symbol: 'GBPJPY',
    name: 'British Pound vs Japanese Yen',
    category: 'Minor Pairs',
    description: 'Highly volatile "Dragon" pair',
    baseAsset: 'GBP',
    quoteAsset: 'JPY',
    minLotSize: 0.01,
    maxLotSize: 100,
    lotStep: 0.01,
    pipSize: 0.01,
    spread: 2.1
  },
  {
    symbol: 'AUDCAD',
    name: 'Australian Dollar vs Canadian Dollar',
    category: 'Minor Pairs',
    description: 'Commodity currencies cross',
    baseAsset: 'AUD',
    quoteAsset: 'CAD',
    minLotSize: 0.01,
    maxLotSize: 100,
    lotStep: 0.01,
    pipSize: 0.0001,
    spread: 2.0
  },
  {
    symbol: 'AUDJPY',
    name: 'Australian Dollar vs Japanese Yen',
    category: 'Minor Pairs',
    description: 'Carry trade favorite',
    baseAsset: 'AUD',
    quoteAsset: 'JPY',
    minLotSize: 0.01,
    maxLotSize: 100,
    lotStep: 0.01,
    pipSize: 0.01,
    spread: 1.8
  },

  // Exotic Pairs
  {
    symbol: 'USDTRY',
    name: 'US Dollar vs Turkish Lira',
    category: 'Exotic Pairs',
    description: 'Emerging market currency with high volatility',
    baseAsset: 'USD',
    quoteAsset: 'TRY',
    minLotSize: 0.01,
    maxLotSize: 10,
    lotStep: 0.01,
    pipSize: 0.0001,
    spread: 15.0
  },
  {
    symbol: 'USDZAR',
    name: 'US Dollar vs South African Rand',
    category: 'Exotic Pairs',
    description: 'African emerging market currency',
    baseAsset: 'USD',
    quoteAsset: 'ZAR',
    minLotSize: 0.01,
    maxLotSize: 10,
    lotStep: 0.01,
    pipSize: 0.0001,
    spread: 25.0
  },
  {
    symbol: 'EURTRY',
    name: 'Euro vs Turkish Lira',
    category: 'Exotic Pairs',
    description: 'European-Turkish cross pair',
    baseAsset: 'EUR',
    quoteAsset: 'TRY',
    minLotSize: 0.01,
    maxLotSize: 10,
    lotStep: 0.01,
    pipSize: 0.0001,
    spread: 18.0
  },
  {
    symbol: 'USDSEK',
    name: 'US Dollar vs Swedish Krona',
    category: 'Exotic Pairs',
    description: 'Scandinavian currency pair',
    baseAsset: 'USD',
    quoteAsset: 'SEK',
    minLotSize: 0.01,
    maxLotSize: 50,
    lotStep: 0.01,
    pipSize: 0.0001,
    spread: 8.0
  },

  // Precious Metals
  {
    symbol: 'XAUUSD',
    name: 'Gold vs US Dollar',
    category: 'Metals',
    description: 'Premier safe-haven precious metal',
    baseAsset: 'XAU',
    quoteAsset: 'USD',
    minLotSize: 0.01,
    maxLotSize: 100,
    lotStep: 0.01,
    pipSize: 0.01,
    spread: 0.3
  },
  {
    symbol: 'XAGUSD',
    name: 'Silver vs US Dollar',
    category: 'Metals',
    description: 'Industrial and precious metal',
    baseAsset: 'XAG',
    quoteAsset: 'USD',
    minLotSize: 0.01,
    maxLotSize: 100,
    lotStep: 0.01,
    pipSize: 0.001,
    spread: 0.05
  },
  {
    symbol: 'XPTUSD',
    name: 'Platinum vs US Dollar',
    category: 'Metals',
    description: 'Rare industrial precious metal',
    baseAsset: 'XPT',
    quoteAsset: 'USD',
    minLotSize: 0.01,
    maxLotSize: 50,
    lotStep: 0.01,
    pipSize: 0.01,
    spread: 5.0
  },

  // Energy Commodities
  {
    symbol: 'USOIL',
    name: 'Crude Oil (WTI)',
    category: 'Energy',
    description: 'West Texas Intermediate crude oil',
    baseAsset: 'Oil',
    quoteAsset: 'USD',
    minLotSize: 0.01,
    maxLotSize: 100,
    lotStep: 0.01,
    pipSize: 0.01,
    spread: 0.03
  },
  {
    symbol: 'UKOIL',
    name: 'Brent Oil',
    category: 'Energy',
    description: 'Brent crude oil benchmark',
    baseAsset: 'Oil',
    quoteAsset: 'USD',
    minLotSize: 0.01,
    maxLotSize: 100,
    lotStep: 0.01,
    pipSize: 0.01,
    spread: 0.03
  },
  {
    symbol: 'NATGAS',
    name: 'Natural Gas',
    category: 'Energy',
    description: 'Natural gas commodity',
    baseAsset: 'Gas',
    quoteAsset: 'USD',
    minLotSize: 0.1,
    maxLotSize: 100,
    lotStep: 0.1,
    pipSize: 0.001,
    spread: 0.03
  },

  // Cryptocurrencies
  {
    symbol: 'BTCUSD',
    name: 'Bitcoin vs US Dollar',
    category: 'Cryptocurrencies',
    description: 'Leading cryptocurrency',
    baseAsset: 'BTC',
    quoteAsset: 'USD',
    minLotSize: 0.01,
    maxLotSize: 10,
    lotStep: 0.01,
    pipSize: 1,
    spread: 15.0
  },
  {
    symbol: 'ETHUSD',
    name: 'Ethereum vs US Dollar',
    category: 'Cryptocurrencies',
    description: 'Second largest cryptocurrency',
    baseAsset: 'ETH',
    quoteAsset: 'USD',
    minLotSize: 0.01,
    maxLotSize: 20,
    lotStep: 0.01,
    pipSize: 0.01,
    spread: 2.5
  },
  {
    symbol: 'ADAUSD',
    name: 'Cardano vs US Dollar',
    category: 'Cryptocurrencies',
    description: 'Third-generation blockchain platform',
    baseAsset: 'ADA',
    quoteAsset: 'USD',
    minLotSize: 10,
    maxLotSize: 10000,
    lotStep: 10,
    pipSize: 0.0001,
    spread: 0.01
  },
  {
    symbol: 'DOTUSD',
    name: 'Polkadot vs US Dollar',
    category: 'Cryptocurrencies',
    description: 'Multi-chain blockchain protocol',
    baseAsset: 'DOT',
    quoteAsset: 'USD',
    minLotSize: 0.1,
    maxLotSize: 1000,
    lotStep: 0.1,
    pipSize: 0.001,
    spread: 0.05
  },

  // US Stocks
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    category: 'Stocks',
    description: 'Technology giant - iPhone manufacturer',
    baseAsset: 'AAPL',
    quoteAsset: 'USD',
    minLotSize: 0.01,
    maxLotSize: 1000,
    lotStep: 0.01,
    pipSize: 0.01,
    spread: 0.02
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    category: 'Stocks',
    description: 'Google parent company',
    baseAsset: 'GOOGL',
    quoteAsset: 'USD',
    minLotSize: 0.01,
    maxLotSize: 100,
    lotStep: 0.01,
    pipSize: 0.01,
    spread: 1.5
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    category: 'Stocks',
    description: 'Software and cloud computing leader',
    baseAsset: 'MSFT',
    quoteAsset: 'USD',
    minLotSize: 0.01,
    maxLotSize: 1000,
    lotStep: 0.01,
    pipSize: 0.01,
    spread: 0.02
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    category: 'Stocks',
    description: 'Electric vehicle and clean energy company',
    baseAsset: 'TSLA',
    quoteAsset: 'USD',
    minLotSize: 0.01,
    maxLotSize: 500,
    lotStep: 0.01,
    pipSize: 0.01,
    spread: 0.05
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    category: 'Stocks',
    description: 'E-commerce and cloud computing giant',
    baseAsset: 'AMZN',
    quoteAsset: 'USD',
    minLotSize: 0.01,
    maxLotSize: 100,
    lotStep: 0.01,
    pipSize: 0.01,
    spread: 2.0
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    category: 'Stocks',
    description: 'GPU and AI computing leader',
    baseAsset: 'NVDA',
    quoteAsset: 'USD',
    minLotSize: 0.01,
    maxLotSize: 500,
    lotStep: 0.01,
    pipSize: 0.01,
    spread: 0.10
  },

  // Stock Indices
  {
    symbol: 'SPX500',
    name: 'S&P 500 Index',
    category: 'Indices',
    description: 'US large-cap stock index',
    baseAsset: 'SPX',
    quoteAsset: 'USD',
    minLotSize: 0.1,
    maxLotSize: 100,
    lotStep: 0.1,
    pipSize: 0.1,
    spread: 0.5
  },
  {
    symbol: 'US30',
    name: 'Dow Jones Industrial Average',
    category: 'Indices',
    description: 'US blue-chip stock index',
    baseAsset: 'DJI',
    quoteAsset: 'USD',
    minLotSize: 0.1,
    maxLotSize: 100,
    lotStep: 0.1,
    pipSize: 1,
    spread: 3.0
  },
  {
    symbol: 'NAS100',
    name: 'NASDAQ 100 Index',
    category: 'Indices',
    description: 'US technology stock index',
    baseAsset: 'NDX',
    quoteAsset: 'USD',
    minLotSize: 0.1,
    maxLotSize: 100,
    lotStep: 0.1,
    pipSize: 0.1,
    spread: 1.0
  },
  {
    symbol: 'DE40',
    name: 'DAX 40 Index',
    category: 'Indices',
    description: 'German stock market index',
    baseAsset: 'DAX',
    quoteAsset: 'EUR',
    minLotSize: 0.1,
    maxLotSize: 100,
    lotStep: 0.1,
    pipSize: 0.1,
    spread: 1.5
  },
  {
    symbol: 'UK100',
    name: 'FTSE 100 Index',
    category: 'Indices',
    description: 'UK stock market index',
    baseAsset: 'UKX',
    quoteAsset: 'GBP',
    minLotSize: 0.1,
    maxLotSize: 100,
    lotStep: 0.1,
    pipSize: 0.1,
    spread: 2.0
  },
  {
    symbol: 'JP225',
    name: 'Nikkei 225 Index',
    category: 'Indices',
    description: 'Japanese stock market index',
    baseAsset: 'NKY',
    quoteAsset: 'JPY',
    minLotSize: 0.1,
    maxLotSize: 100,
    lotStep: 0.1,
    pipSize: 1,
    spread: 5.0
  },
];

// Search function for markets
export function searchMarkets(query: string): MarketInfo[] {
  if (!query.trim()) {
    return ALL_MARKETS;
  }

  const searchTerm = query.toLowerCase().trim();
  
  return ALL_MARKETS.filter(market => 
    market.symbol.toLowerCase().includes(searchTerm) ||
    market.name.toLowerCase().includes(searchTerm) ||
    market.category.toLowerCase().includes(searchTerm) ||
    (market.description && market.description.toLowerCase().includes(searchTerm)) ||
    (market.baseAsset && market.baseAsset.toLowerCase().includes(searchTerm)) ||
    (market.quoteAsset && market.quoteAsset.toLowerCase().includes(searchTerm))
  );
}

// Get markets by category
export function getMarketsByCategory(category: string): MarketInfo[] {
  if (category === 'All') {
    return ALL_MARKETS;
  }
  
  return ALL_MARKETS.filter(market => market.category === category);
}

// Get market info by symbol
export function getMarketInfo(symbol: string): MarketInfo | undefined {
  return ALL_MARKETS.find(market => market.symbol === symbol);
}

// TradingView symbol mapping for charts
export function getTradingViewSymbol(symbol: string): string {
  const tradingViewMap: { [key: string]: string } = {
    // Forex - Using FX provider
    'EURUSD': 'FX:EURUSD',
    'GBPUSD': 'FX:GBPUSD',
    'USDJPY': 'FX:USDJPY',
    'AUDUSD': 'FX:AUDUSD',
    'USDCAD': 'FX:USDCAD',
    'USDCHF': 'FX:USDCHF',
    'NZDUSD': 'FX:NZDUSD',
    'EURGBP': 'FX:EURGBP',
    'EURJPY': 'FX:EURJPY',
    'EURCHF': 'FX:EURCHF',
    'GBPJPY': 'FX:GBPJPY',
    'AUDCAD': 'FX:AUDCAD',
    'AUDJPY': 'FX:AUDJPY',
    'USDTRY': 'FX:USDTRY',
    'USDZAR': 'FX:USDZAR',
    'EURTRY': 'FX:EURTRY',
    'USDSEK': 'FX:USDSEK',

    // Metals - Using TVC provider
    'XAUUSD': 'TVC:GOLD',
    'XAGUSD': 'TVC:SILVER',
    'XPTUSD': 'TVC:PLATINUM',

    // Energy - Using TVC provider  
    'USOIL': 'TVC:USOIL',
    'UKOIL': 'TVC:UKOIL',
    'NATGAS': 'TVC:NATURALGAS',

    // Cryptocurrencies - Using Binance
    'BTCUSD': 'BINANCE:BTCUSDT',
    'ETHUSD': 'BINANCE:ETHUSDT',
    'ADAUSD': 'BINANCE:ADAUSDT',
    'DOTUSD': 'BINANCE:DOTUSDT',

    // US Stocks - Using NASDAQ
    'AAPL': 'NASDAQ:AAPL',
    'GOOGL': 'NASDAQ:GOOGL',
    'MSFT': 'NASDAQ:MSFT',
    'TSLA': 'NASDAQ:TSLA',
    'AMZN': 'NASDAQ:AMZN',
    'NVDA': 'NASDAQ:NVDA',

    // Indices - Using TVC provider
    'SPX500': 'TVC:SPX',
    'US30': 'TVC:DJI',
    'NAS100': 'TVC:IXIC',
    'DE40': 'TVC:DAX',
    'UK100': 'TVC:UKX',
    'JP225': 'TVC:NI225',
  };

  return tradingViewMap[symbol] || `FX:${symbol}`;
}

// Get popular symbols for quick access
export function getPopularSymbols(): string[] {
  return QUICK_ACCESS_SYMBOLS;
}

// Get symbols by category
export function getSymbolsByCategory(): { [category: string]: string[] } {
  const symbolsByCategory: { [category: string]: string[] } = {};
  
  MARKET_CATEGORIES.forEach(category => {
    symbolsByCategory[category] = ALL_MARKETS
      .filter(market => market.category === category)
      .map(market => market.symbol);
  });
  
  return symbolsByCategory;
}

// Validate symbol
export function isValidSymbol(symbol: string): boolean {
  return ALL_MARKETS.some(market => market.symbol === symbol);
}

// Get trading session for symbol
export function getTradingSession(symbol: string): {
  name: string;
  isActive: boolean;
  openTime: string;
  closeTime: string;
} {
  const now = new Date();
  const hour = now.getUTCHours();
  const day = now.getUTCDay();

  // Forex market (24/5)
  if (symbol.includes('USD') || symbol.length === 6) {
    const isWeekend = day === 0 || day === 6;
    const isFridayClose = day === 5 && hour >= 21;
    const isSundayOpen = day === 0 && hour >= 21;
    
    return {
      name: 'Forex',
      isActive: !isWeekend && !isFridayClose || isSundayOpen,
      openTime: '21:00 GMT Sunday',
      closeTime: '21:00 GMT Friday'
    };
  }

  // US Stock market
  if (['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA'].includes(symbol)) {
    const isWeekday = day >= 1 && day <= 5;
    const isMarketHours = hour >= 14 && hour < 21; // 9:30 AM - 4:00 PM EST in UTC
    
    return {
      name: 'US Stock Market',
      isActive: isWeekday && isMarketHours,
      openTime: '14:30 GMT (9:30 AM EST)',
      closeTime: '21:00 GMT (4:00 PM EST)'
    };
  }

  // Crypto market (24/7)
  if (symbol.includes('BTC') || symbol.includes('ETH') || symbol.includes('ADA') || symbol.includes('DOT')) {
    return {
      name: 'Cryptocurrency',
      isActive: true,
      openTime: '24/7',
      closeTime: 'Never'
    };
  }

  // Default to Forex hours
  return {
    name: 'Global Markets',
    isActive: true,
    openTime: '24/5',
    closeTime: 'Weekend'
  };
}