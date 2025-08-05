export const Colors = {
  // Primary brand colors
  primary: '#007AFF',
  secondary: '#5AC8FA',
  accent: '#FF9500',
  
  // Background colors
  background: '#0A0E1A',
  surface: '#1A1F2E',
  cardElevated: '#242B3D',
  inputBackground: '#2A3441',
  
  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#B8C5D6',
  textMuted: '#6B7280',
  
  // Trading colors
  bullish: '#00FF88',
  bearish: '#FF4757',
  
  // UI element colors
  border: '#2A3441',
  divider: '#374151',
  error: '#FF4757',
  warning: '#FF9500',
  success: '#00FF88',
  info: '#5AC8FA',
  
  // Chart colors
  chartGreen: '#00FF88',
  chartRed: '#FF4757',
  chartBlue: '#5AC8FA',
  chartYellow: '#FFD700',
  chartPurple: '#AF52DE',
};

export const Gradients = {
  header: [Colors.primary + '40', Colors.background],
  card: [Colors.surface, Colors.cardElevated],
  button: [Colors.primary, Colors.secondary],
  bullish: [Colors.bullish + '20', Colors.surface],
  bearish: [Colors.bearish + '20', Colors.surface],
};

// Theme variations for different contexts
export const DarkTheme = {
  ...Colors,
  background: '#0A0E1A',
  surface: '#1A1F2E',
  textPrimary: '#FFFFFF',
};

export const LightTheme = {
  ...Colors,
  background: '#FFFFFF',
  surface: '#F8F9FA',
  textPrimary: '#1A1F2E',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
};