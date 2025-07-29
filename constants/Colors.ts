export const Colors = {
  // Primary colors
  primary: '#1976D2',
  primaryDark: '#1565C0',
  accent: '#FF6B35',
  
  // Trading colors
  bullish: '#4CAF50',
  bearish: '#F44336',
  
  // Background colors
  background: '#F5F5F5',
  surface: '#FFFFFF',
  
  // Text colors
  textPrimary: '#212121',
  textSecondary: '#757575',
  textMuted: '#9E9E9E',
  
  // Border colors
  border: '#E0E0E0',
  
  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
};

export const Gradients = {
  header: [Colors.primary, Colors.primaryDark],
  card: [Colors.surface, Colors.background],
  bullish: [Colors.bullish + '20', Colors.surface],
  bearish: [Colors.bearish + '20', Colors.surface],
};