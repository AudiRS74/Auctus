import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Chip, ProgressBar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTrading } from '../../hooks/useTrading';
import { Colors, Gradients } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

export default function Analysis() {
  const { selectedSymbol, setSelectedSymbol, indicators, trades, mt5Config, realTimeData } = useTrading();
  const [selectedTimeframe, setSelectedTimeframe] = useState('1H');
  
  const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];
  const timeframes = ['5M', '15M', '1H', '4H', '1D'];

  // Calculate trading statistics
  const executedTrades = trades.filter(trade => trade.status === 'EXECUTED');
  const profitableTrades = executedTrades.filter(trade => (trade.profit || 0) > 0);
  const winRate = executedTrades.length > 0 ? (profitableTrades.length / executedTrades.length) * 100 : 0;
  const totalProfit = executedTrades.reduce((sum, trade) => sum + (trade.profit || 0), 0);

  // Get current symbol price from real-time data
  const currentSymbolData = realTimeData.symbols[selectedSymbol];

  const getFibonacciSignal = () => {
    const price = currentSymbolData?.bid || 1.2000;
    const level618 = indicators.fibonacciLevels[5]; // 0.618 level
    return price > level618 ? 'Bullish' : 'Bearish';
  };

  const getRSISignal = () => {
    if (indicators.rsi > 70) return { signal: 'Overbought', color: Colors.bearish };
    if (indicators.rsi < 30) return { signal: 'Oversold', color: Colors.bullish };
    return { signal: 'Neutral', color: Colors.textPrimary };
  };

  const getMACDSignal = () => {
    const isPositive = indicators.macd.signal > 0;
    return {
      signal: isPositive ? 'Bullish' : 'Bearish',
      color: isPositive ? Colors.bullish : Colors.bearish
    };
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={Gradients.header}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Technical Analysis</Text>
            <Text style={styles.subtitle}>Market insights & signals</Text>
          </View>
          <MaterialIcons name="analytics" size={28} color={Colors.primary} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Symbol & Timeframe Selection */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Analysis Setup</Text>
              <MaterialIcons name="tune" size={24} color={Colors.primary} />
            </View>
            
            <View style={styles.selectionContainer}>
              <Text style={styles.selectionLabel}>Market Pair</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.chipScroll}
              >
                {symbols.map((symbol) => (
                  <Chip
                    key={symbol}
                    selected={selectedSymbol === symbol}
                    onPress={() => setSelectedSymbol(symbol)}
                    style={[
                      styles.chip,
                      selectedSymbol === symbol && styles.selectedChip
                    ]}
                    textStyle={[
                      styles.chipText,
                      selectedSymbol === symbol && styles.selectedChipText
                    ]}
                  >
                    {symbol}
                  </Chip>
                ))}
              </ScrollView>
            </View>

            <View style={styles.selectionContainer}>
              <Text style={styles.selectionLabel}>Timeframe</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.chipScroll}
              >
                {timeframes.map((timeframe) => (
                  <Chip
                    key={timeframe}
                    selected={selectedTimeframe === timeframe}
                    onPress={() => setSelectedTimeframe(timeframe)}
                    style={[
                      styles.chip,
                      selectedTimeframe === timeframe && styles.selectedChip
                    ]}
                    textStyle={[
                      styles.chipText,
                      selectedTimeframe === timeframe && styles.selectedChipText
                    ]}
                  >
                    {timeframe}
                  </Chip>
                ))}
              </ScrollView>
            </View>
          </Card.Content>
        </Card>

        {/* Technical Signals Summary */}
        <Card style={styles.signalCard}>
          <LinearGradient
            colors={[Colors.primary + '10', Colors.surface]}
            style={styles.signalGradient}
          >
            <View style={styles.signalHeader}>
              <Text style={styles.signalTitle}>Technical Signals</Text>
              <Text style={styles.signalSubtitle}>{selectedSymbol} • {selectedTimeframe}</Text>
            </View>

            <View style={styles.signalsGrid}>
              <View style={styles.signalItem}>
                <View style={styles.signalIcon}>
                  <MaterialIcons name="speed" size={20} color={getRSISignal().color} />
                </View>
                <View style={styles.signalContent}>
                  <Text style={styles.signalName}>RSI</Text>
                  <Text style={[styles.signalValue, { color: getRSISignal().color }]}>
                    {getRSISignal().signal}
                  </Text>
                  <Text style={styles.signalDetail}>{indicators.rsi.toFixed(2)}</Text>
                </View>
              </View>

              <View style={styles.signalItem}>
                <View style={styles.signalIcon}>
                  <MaterialIcons name="trending-up" size={20} color={getMACDSignal().color} />
                </View>
                <View style={styles.signalContent}>
                  <Text style={styles.signalName}>MACD</Text>
                  <Text style={[styles.signalValue, { color: getMACDSignal().color }]}>
                    {getMACDSignal().signal}
                  </Text>
                  <Text style={styles.signalDetail}>{indicators.macd.signal.toFixed(4)}</Text>
                </View>
              </View>

              <View style={styles.signalItem}>
                <View style={styles.signalIcon}>
                  <MaterialIcons name="timeline" size={20} color={Colors.secondary} />
                </View>
                <View style={styles.signalContent}>
                  <Text style={styles.signalName}>MA</Text>
                  <Text style={styles.signalValue}>Trend</Text>
                  <Text style={styles.signalDetail}>{indicators.movingAverage.toFixed(4)}</Text>
                </View>
              </View>

              <View style={styles.signalItem}>
                <View style={styles.signalIcon}>
                  <MaterialIcons name="architecture" size={20} color={Colors.accent} />
                </View>
                <View style={styles.signalContent}>
                  <Text style={styles.signalName}>Fibonacci</Text>
                  <Text style={styles.signalValue}>{getFibonacciSignal()}</Text>
                  <Text style={styles.signalDetail}>61.8% Level</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Card>

        {/* Price Action Analysis */}
        {currentSymbolData && (
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.sectionHeader}>
                <Text style={styles.cardTitle}>Price Action</Text>
                <MaterialIcons name="show-chart" size={24} color={Colors.secondary} />
              </View>
              
              <View style={styles.priceActionContainer}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Current Bid</Text>
                  <Text style={[styles.priceValue, { color: Colors.bearish }]}>
                    {currentSymbolData.bid.toFixed(5)}
                  </Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Current Ask</Text>
                  <Text style={[styles.priceValue, { color: Colors.bullish }]}>
                    {currentSymbolData.ask.toFixed(5)}
                  </Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Spread</Text>
                  <Text style={styles.priceValue}>
                    {(currentSymbolData.spread * Math.pow(10, currentSymbolData.digits)).toFixed(1)} pips
                  </Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Last Update</Text>
                  <Text style={styles.priceValue}>
                    {currentSymbolData.lastUpdate.toLocaleTimeString()}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Trading Performance */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Trading Performance</Text>
              <MaterialIcons name="assessment" size={24} color={Colors.accent} />
            </View>
            
            <View style={styles.performanceContainer}>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>Win Rate</Text>
                <Text style={[styles.performanceValue, { 
                  color: winRate >= 60 ? Colors.bullish : winRate >= 40 ? Colors.primary : Colors.bearish 
                }]}>
                  {winRate.toFixed(1)}%
                </Text>
                <ProgressBar 
                  progress={winRate / 100} 
                  color={winRate >= 60 ? Colors.bullish : winRate >= 40 ? Colors.primary : Colors.bearish}
                  style={styles.progressBar}
                />
              </View>
              
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>Total P&L</Text>
                <Text style={[styles.performanceValue, { 
                  color: totalProfit >= 0 ? Colors.bullish : Colors.bearish 
                }]}>
                  {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
                </Text>
              </View>
              
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>Total Trades</Text>
                <Text style={styles.performanceValue}>{trades.length}</Text>
              </View>
              
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>Active Positions</Text>
                <Text style={styles.performanceValue}>
                  {mt5Config.connected ? realTimeData.positions.length : executedTrades.length}
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
              <Text style={styles.sentimentText}>
                Based on current technical indicators, {selectedSymbol} is showing{' '}
                <Text style={{ 
                  color: indicators.rsi > 50 ? Colors.bullish : Colors.bearish,
                  fontWeight: '600' 
                }}>
                  {indicators.rsi > 50 ? 'bullish' : 'bearish'}
                </Text>
                {' '}momentum. The RSI at {indicators.rsi.toFixed(2)} indicates the market is{' '}
                <Text style={{ 
                  color: indicators.rsi > 70 ? Colors.bearish : indicators.rsi < 30 ? Colors.bullish : Colors.textPrimary,
                  fontWeight: '600' 
                }}>
                  {indicators.rsi > 70 ? 'overbought' : indicators.rsi < 30 ? 'oversold' : 'in neutral territory'}
                </Text>
                . MACD signals suggest a{' '}
                <Text style={{ 
                  color: indicators.macd.signal > 0 ? Colors.bullish : Colors.bearish,
                  fontWeight: '600' 
                }}>
                  {indicators.macd.signal > 0 ? 'bullish' : 'bearish'}
                </Text>
                {' '}trend continuation.
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
  selectionContainer: {
    marginBottom: 16,
  },
  selectionLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: 12,
    fontWeight: '500',
  },
  chipScroll: {
    marginBottom: 4,
  },
  chip: {
    marginRight: 8,
    backgroundColor: Colors.cardElevated,
  },
  selectedChip: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  selectedChipText: {
    color: Colors.background,
    fontWeight: '600',
  },
  signalCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 8,
  },
  signalGradient: {
    borderRadius: 16,
    padding: 20,
  },
  signalHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  signalTitle: {
    ...Typography.h5,
    color: Colors.textPrimary,
  },
  signalSubtitle: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  signalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  signalItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardElevated,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  signalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  signalContent: {
    flex: 1,
  },
  signalName: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  signalValue: {
    ...Typography.body1,
    fontWeight: '600',
    marginBottom: 2,
  },
  signalDetail: {
    ...Typography.caption,
    color: Colors.textMuted,
    ...Typography.number,
  },
  priceActionContainer: {
    backgroundColor: Colors.cardElevated,
    padding: 16,
    borderRadius: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  priceValue: {
    ...Typography.body1,
    color: Colors.textPrimary,
    fontWeight: '600',
    ...Typography.number,
  },
  performanceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  performanceItem: {
    width: '48%',
    backgroundColor: Colors.cardElevated,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  performanceLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  performanceValue: {
    ...Typography.h5,
    color: Colors.textPrimary,
    ...Typography.number,
    fontWeight: '600',
  },
  progressBar: {
    marginTop: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  sentimentContainer: {
    backgroundColor: Colors.cardElevated,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  sentimentText: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});