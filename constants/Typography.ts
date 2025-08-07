import { Platform } from 'react-native';

export const FontFamily = {
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium', 
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'System',
  }),
  monospace: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }),
};

export const FontSize = {
  // Headers
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  h5: 18,
  h6: 16,
  
  // Body text
  body: 16,
  bodySmall: 14,
  caption: 12,
  overline: 10,
  
  // Special
  display: 40,
  subtitle: 14,
  button: 16,
  input: 16,
  label: 14,
};

export const FontWeight = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
  black: '900' as const,
};

export const LineHeight = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,
};

export const LetterSpacing = {
  tighter: -0.5,
  tight: -0.25,
  normal: 0,
  wide: 0.25,
  wider: 0.5,
  widest: 1,
};

// Pre-defined text styles
export const TextStyles = {
  // Display styles
  display: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.bold,
    lineHeight: FontSize.display * LineHeight.tight,
    letterSpacing: LetterSpacing.tighter,
  },
  
  // Header styles
  h1: {
    fontSize: FontSize.h1,
    fontWeight: FontWeight.bold,
    lineHeight: FontSize.h1 * LineHeight.tight,
    letterSpacing: LetterSpacing.tighter,
  },
  h2: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.bold,
    lineHeight: FontSize.h2 * LineHeight.tight,
    letterSpacing: LetterSpacing.tight,
  },
  h3: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.semiBold,
    lineHeight: FontSize.h3 * LineHeight.normal,
  },
  h4: {
    fontSize: FontSize.h4,
    fontWeight: FontWeight.semiBold,
    lineHeight: FontSize.h4 * LineHeight.normal,
  },
  h5: {
    fontSize: FontSize.h5,
    fontWeight: FontWeight.medium,
    lineHeight: FontSize.h5 * LineHeight.normal,
  },
  h6: {
    fontSize: FontSize.h6,
    fontWeight: FontWeight.medium,
    lineHeight: FontSize.h6 * LineHeight.normal,
  },
  
  // Body styles
  body: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.body * LineHeight.normal,
  },
  bodySmall: {
    fontSize: FontSize.bodySmall,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.bodySmall * LineHeight.normal,
  },
  
  // UI component styles
  button: {
    fontSize: FontSize.button,
    fontWeight: FontWeight.semiBold,
    lineHeight: FontSize.button * LineHeight.tight,
    letterSpacing: LetterSpacing.wide,
  },
  buttonSmall: {
    fontSize: FontSize.bodySmall,
    fontWeight: FontWeight.medium,
    lineHeight: FontSize.bodySmall * LineHeight.tight,
  },
  
  // Form styles
  input: {
    fontSize: FontSize.input,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.input * LineHeight.normal,
  },
  label: {
    fontSize: FontSize.label,
    fontWeight: FontWeight.medium,
    lineHeight: FontSize.label * LineHeight.normal,
    letterSpacing: LetterSpacing.wide,
  },
  
  // Support text styles
  caption: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.caption * LineHeight.normal,
    letterSpacing: LetterSpacing.wide,
  },
  overline: {
    fontSize: FontSize.overline,
    fontWeight: FontWeight.semiBold,
    lineHeight: FontSize.overline * LineHeight.normal,
    letterSpacing: LetterSpacing.widest,
    textTransform: 'uppercase' as const,
  },
  
  // Special text styles
  subtitle: {
    fontSize: FontSize.subtitle,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.subtitle * LineHeight.relaxed,
  },
  monospace: {
    fontFamily: FontFamily.monospace,
    fontSize: FontSize.bodySmall,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.bodySmall * LineHeight.relaxed,
  },
  
  // Trading specific styles
  price: {
    fontFamily: FontFamily.monospace,
    fontSize: FontSize.body,
    fontWeight: FontWeight.medium,
    lineHeight: FontSize.body * LineHeight.tight,
  },
  priceSmall: {
    fontFamily: FontFamily.monospace,
    fontSize: FontSize.bodySmall,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.bodySmall * LineHeight.tight,
  },
  currency: {
    fontFamily: FontFamily.monospace,
    fontSize: FontSize.h5,
    fontWeight: FontWeight.bold,
    lineHeight: FontSize.h5 * LineHeight.tight,
  },
  percentage: {
    fontSize: FontSize.bodySmall,
    fontWeight: FontWeight.semiBold,
    lineHeight: FontSize.bodySmall * LineHeight.tight,
  },
};

// Helper function to create responsive text sizes
export const getResponsiveFontSize = (baseSize: number, scale: number = 1): number => {
  return Math.round(baseSize * scale);
};

// Helper function to calculate line height from font size
export const getLineHeight = (fontSize: number, ratio: number = LineHeight.normal): number => {
  return Math.round(fontSize * ratio);
};

export default {
  FontFamily,
  FontSize,
  FontWeight,
  LineHeight,
  LetterSpacing,
  TextStyles,
  getResponsiveFontSize,
  getLineHeight,
};