import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'SF Pro Display',
  android: 'Roboto',
  default: 'System',
});

const numberFamily = Platform.select({
  ios: 'SF Mono',
  android: 'Roboto Mono',
  default: 'monospace',
});

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 38,
    fontFamily,
  },
  h2: {
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 34,
    fontFamily,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 30,
    fontFamily,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 26,
    fontFamily,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
    fontFamily,
  },
  h6: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
    fontFamily,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    fontFamily,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    fontFamily,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    fontFamily,
  },
  button: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 20,
    fontFamily,
  },
  number: {
    fontFamily: numberFamily,
  },
};