import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Chip, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTrading } from '../../hooks/useTrading';
import { Colors, Gradients } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

export default function Charts() {
  const { selectedSymbol, setSelectedSymbol, indicators } = useTrading();
  
  const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];
  const timeframes = ['1M', '5M', '15M', '1H', '4H', '1D'];

  // Mock price data for visualization
  const mockPriceData = Array.from({ length: 20 }, (_, i) => ({
    time: new Date(Date.now() - (19 - i) * 60000).toLocaleTimeString(),
    price: 1.2000 + (Math.random() - 0.5) * 0.02,
    change: (Math.random() - 0.5) * 0.001,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={Gradients.header}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Market Charts</Text>
            <Text style={styles.subtitle}>Technical analysis & insights</Text>
          </View>
          <MaterialIcons name="show-chart" size={28} color={Colors.primary} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Symbol Selection */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Market Selection</Text>
              <MaterialIcons name="language" size={24} color={Colors.primary} />
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.symbolScroll}
              contentContainerStyle={styles.symbolScrollContent}
            >
              {symbols.map((symbol) => (
                <Chip
                  key={symbol}
                  selected={selectedSymbol === symbol}
                  onPress={() => setSelectedSymbol(symbol)}
                  style={[
                    styles.symbolChip,
                    selectedSymbol === symbol && styles.selectedSymbolChip
                  ]}
                  textStyle={[
                    styles.symbolChipText,
                    selectedSymbol === symbol && styles.selectedSymbolChipText
                  ]}
                  selectedColor={Colors.background}
                >
                  {symbol}
                </Chip>
              ))}
            </ScrollView>
            
            <View style={styles.timeframeSection}>
              <Text style={styles.sectionSubtitle}>Timeframes</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.timeframeScroll}
              >
                {timeframes.map((timeframe) => (
                  <Chip
                    key={timeframe}
                    style={styles.timeframeChip}
                    textStyle={styles.timeframeChipText}
                  >
                    {timeframe}
                  </Chip>
                ))}
              </ScrollView>
            </View>
          </Card.Content>
        </Card>

        {/* Price Chart */}
        <Card style={styles.chartCard}>
          <LinearGradient
            colors={[Colors.surface, Colors.cardElevated]}
            style={styles.chartGradient}
          >
            <View style={styles.chartHeader}>
              <View>
                <Text style={styles.chartTitle}>{selectedSymbol} Chart</Text>
                <Text style={styles.chartSubtitle}>Real-time price action</Text>
              </View>
              <Button
                mode="outlined"
                compact
                textColor={Colors.primary}
                style={styles.refreshButton}
                icon="refresh"
              >
                Refresh
              </Button>
            </View>
            
            <View style={styles.chartContainer}>
              <View style={styles.chartPlaceholder}>
                <MaterialIcons name="timeline" size={64} color={Colors.textMuted} />
                <Text style={styles.chartPlaceholderText}>Interactive Chart</Text>
                <Text style={styles.chartPlaceholderSubtext}>Professional trading charts coming soon</Text>
              </View>
              
              {/* Price Feed Simulation */}
              <View style={styles.priceList}>
                <Text style={styles.priceListTitle}>Recent Prices</Text>
                {mockPriceData.slice(-8).map((data, index) => (
                  <View key={index} style={styles.priceRow}>
                    <Text style={styles.priceTime}>{data.time}</Text>
                    <Text style={styles.priceValue}>{data.price.toFixed(5)}</Text>
                    <Text style={[
                      styles.priceChange,
                      { color: data.change >= 0 ? Colors.bullish : Colors.bearish }
                    ]}>
                      {data.change >= 0 ? '+' : ''}{(data.change * 10000).toFixed(1)} pips
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </LinearGradient>
        </Card>

        {/* Technical Indicators */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Technical Indicators</Text>
              <MaterialIcons name="analytics" size={24} color={Colors.accent} />
            </View>
            
            <View style={styles.indicatorsGrid}>
              <View style={styles.indicatorCard}>
                <View style={styles.indicatorHeader}>
                  <MaterialIcons name="speed" size={20} color={Colors.primary} />
                  <Text style={styles.indicatorName}>RSI (14)</Text>
                </View>
                <Text style={[styles.indicatorValue, { 
                  color: indicators.rsi > 70 ? Colors.bearish : indicators.rsi < 30 ? Colors.bullish : Colors.textPrimary 
                }]}>
                  {indicators.rsi.toFixed(2)}
                </Text>
                <View style={styles.rsiBar}>
                  <View style={[styles.rsiIndicator, { 
                    left: `${Math.min(100, Math.max(0, indicators.rsi))}%`,
                    backgroundColor: indicators.rsi > 70 ? Colors.bearish : indicators.rsi < 30 ? Colors.bullish : Colors.primary
                  }]} />
                </View>
              </View>
              
              <View style={styles.indicatorCard}>
                <View style={styles.indicatorHeader}>
                  <MaterialIcons name="timeline" size={20} color={Colors.secondary} />
                  <Text style={styles.indicatorName}>Moving Average</Text>
                </View>
                <Text style={styles.indicatorValue}>{indicators.movingAverage.toFixed(5)}</Text>
                <Text style={styles.indicatorDescription}>50-period SMA</Text>
              </View>
              
              <View style={styles.indicatorCard}>
                <View style={styles.indicatorHeader}>
                  <MaterialIcons name="trending-up" size={20} color={Colors.accent} />
                  <Text style={styles.indicatorName}>MACD</Text>
                </View>
                <Text style={[styles.indicatorValue, { 
                  color: indicators.macd.signal > 0 ? Colors.bullish : Colors.bearish 
                }]}>
                  {indicators.macd.signal.toFixed(5)}
                </Text>
                <Text style={styles.indicatorDescription}>
                  Signal: {indicators.macd.signal > 0 ? 'Bullish' : 'Bearish'}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Market Sentiment */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Market Sentiment</Text>
              <MaterialIcons name="psychology" size={24} color={Colors.secondary} />
            </View>
            
            <View style={styles.sentimentContainer}>
              <View style={styles.sentimentItem}>
                <MaterialIcons 
                  name={indicators.rsi > 50 ? "trending-up" : "trending-down"} 
                  size={32} 
                  color={indicators.rsi > 50 ? Colors.bullish : Colors.bearish} 
                />
                <Text style={styles.sentimentLabel}>Trend</Text>
                <Text style={[styles.sentimentValue, { 
                  color: indicators.rsi > 50 ? Colors.bullish : Colors.bearish 
                }]}>
                  {indicators.rsi > 50 ? 'Bullish' : 'Bearish'}
                </Text>
              </View>
              
              <View style={styles.sentimentDivider} />
              
              <View style={styles.sentimentItem}>
                <MaterialIcons 
                  name="show-chart" 
                  size={32} 
                  color={Colors.primary} 
                />
                <Text style={styles.sentimentLabel}>Volatility</Text>
                <Text style={[styles.sentimentValue, { color: Colors.primary }]}>
                  {indicators.rsi > 70 || indicators.rsi < 30 ? 'High' : 'Moderate'}
                </Text>
              </View>
            </View>
            
            <View style={styles.marketOverview}>
              <Text style={styles.marketText}>
                The {selectedSymbol} pair is currently showing{' '}
                <Text style={{ color: indicators.rsi > 50 ? Colors.bullish : Colors.bearish }}>
                  {indicators.rsi > 50 ? 'bullish' : 'bearish'}
                </Text>
                {' '}momentum based on technical indicators. RSI at {indicators.rsi.toFixed(2)} suggests the market is{' '}
                <Text style={{ 
                  color: indicators.rsi > 70 ? Colors.bearish : indicators.rsi < 30 ? Colors.bullish : Colors.textPrimary 
                }}>
                  {indicators.rsi > 70 ? 'overbought' : indicators.rsi < 30 ? 'oversold' : 'in neutral territory'}
                </Text>.
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerGradient: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    marginBottom: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    elevation: 4,
  },
  cardContent: {
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    ...Typography.h6,
    color: Colors.textPrimary,
  },
  symbolScroll: {
    marginTop: 8,
  },
  symbolScrollContent: {
    paddingRight: 16,
  },
  symbolChip: {
    marginRight: 12,
    backgroundColor: Colors.cardElevated,
    borderColor: Colors.border,
  },
  selectedSymbolChip: {
    backgroundColor: Colors.primary,
  },
  symbolChipText: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  selectedSymbolChipText: {
    color: Colors.background,
    fontWeight: '600',
  },
  timeframeSection: {
    marginTop: 20,
  },
  sectionSubtitle: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  timeframeScroll: {
    marginBottom: 8,
  },
  timeframeChip: {
    marginRight: 8,
    backgroundColor: Colors.cardElevated,
  },
  timeframeChipText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  chartCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 8,
  },
  chartGradient: {
    borderRadius: 16,
    padding: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    ...Typography.h5,
    color: Colors.textPrimary,
  },
  chartSubtitle: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  refreshButton: {
    borderColor: Colors.primary,
  },
  chartContainer: {
    height: 300,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 20,
  },
  chartPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartPlaceholderText: {
    ...Typography.h6,
    color: Colors.textMuted,
    marginTop: 16,
  },
  chartPlaceholderSubtext: {
    ...Typography.body2,
    color: Colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  priceList: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
  },
  priceListTitle: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: 12,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  priceTime: {
    ...Typography.caption,
    color: Colors.textMuted,
    flex: 1,
  },
  priceValue: {
    ...Typography.body2,
    color: Colors.textPrimary,
    fontWeight: '500',
    ...Typography.number,
    flex: 1,
    textAlign: 'center',
  },
  priceChange: {
    ...Typography.caption,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  indicatorsGrid: {
    gap: 16,
  },
  indicatorCard: {
    backgroundColor: Colors.cardElevated,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  indicatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  indicatorName: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginLeft: 8,
    fontWeight: '500',
  },
  indicatorValue: {
    ...Typography.h5,
    color: Colors.textPrimary,
    ...Typography.number,
    marginBottom: 8,
  },
  indicatorDescription: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  rsiBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    position: 'relative',
  },
  rsiIndicator: {
    position: 'absolute',
    top: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: -4,
  },
  sentimentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  sentimentItem: {
    alignItems: 'center',
    flex: 1,
  },
  sentimentDivider: {
    width: 1,
    height: 60,
    backgroundColor: Colors.border,
  },
  sentimentLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  sentimentValue: {
    ...Typography.h6,
    marginTop: 4,
    fontWeight: '600',
  },
  marketOverview: {
    backgroundColor: Colors.cardElevated,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  marketText: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});