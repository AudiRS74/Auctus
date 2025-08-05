import { Platform } from 'react-native';

export const Typography = {
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
    letterSpacing: -0.25,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: 0,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  h6: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
    letterSpacing: 0,
  },

  // Body text
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  
  // Specialized text
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  overline: {
    fontSize: 10,
    fontWeight: '500' as const,
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  
  // Number formatting (for prices, values)
  number: {
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      web: 'Monaco, Consolas, monospace',
      default: 'monospace'
    }),
    fontSize: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.25,
  },
  
  // Large numbers (for balances, profits)
  largeNumber: {
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      web: 'Monaco, Consolas, monospace',
      default: 'monospace'
    }),
    fontSize: 24,
    fontWeight: '600' as const,
    letterSpacing: -0.25,
  }
};

// Font weight mappings for consistency across platforms
export const FontWeights = {
  light: Platform.select({ ios: '300', android: '300', default: '300' }),
  regular: Platform.select({ ios: '400', android: '400', default: '400' }),
  medium: Platform.select({ ios: '500', android: '500', default: '500' }),
  semibold: Platform.select({ ios: '600', android: '600', default: '600' }),
  bold: Platform.select({ ios: '700', android: '700', default: '700' }),
  heavy: Platform.select({ ios: '800', android: '800', default: '800' }),
};