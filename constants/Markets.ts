export const MAJOR_PAIRS = [
  { symbol: 'EURUSD', name: 'Euro/US Dollar', category: 'Major' },
  { symbol: 'GBPUSD', name: 'British Pound/US Dollar', category: 'Major' },
  { symbol: 'USDJPY', name: 'US Dollar/Japanese Yen', category: 'Major' },
  { symbol: 'AUDUSD', name: 'Australian Dollar/US Dollar', category: 'Major' },
  { symbol: 'USDCAD', name: 'US Dollar/Canadian Dollar', category: 'Major' },
  { symbol: 'USDCHF', name: 'US Dollar/Swiss Franc', category: 'Major' },
  { symbol: 'NZDUSD', name: 'New Zealand Dollar/US Dollar', category: 'Major' },
];

export const MINOR_PAIRS = [
  { symbol: 'EURGBP', name: 'Euro/British Pound', category: 'Minor' },
  { symbol: 'EURJPY', name: 'Euro/Japanese Yen', category: 'Minor' },
  { symbol: 'GBPJPY', name: 'British Pound/Japanese Yen', category: 'Minor' },
  { symbol: 'EURAUD', name: 'Euro/Australian Dollar', category: 'Minor' },
  { symbol: 'EURCHF', name: 'Euro/Swiss Franc', category: 'Minor' },
];

export const TIMEFRAMES = [
  { value: '1min', label: '1 Minute', shortLabel: '1m' },
  { value: '5min', label: '5 Minutes', shortLabel: '5m' },
  { value: '15min', label: '15 Minutes', shortLabel: '15m' },
  { value: '30min', label: '30 Minutes', shortLabel: '30m' },
  { value: '1hour', label: '1 Hour', shortLabel: '1h' },
  { value: '4hour', label: '4 Hours', shortLabel: '4h' },
  { value: 'daily', label: 'Daily', shortLabel: '1D' },
  { value: 'weekly', label: 'Weekly', shortLabel: '1W' },
];

export const TRADING_SESSIONS = {
  SYDNEY: { start: '21:00', end: '06:00', timezone: 'GMT' },
  TOKYO: { start: '00:00', end: '09:00', timezone: 'GMT' },
  LONDON: { start: '08:00', end: '17:00', timezone: 'GMT' },
  NEW_YORK: { start: '13:00', end: '22:00', timezone: 'GMT' },
};