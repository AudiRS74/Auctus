import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useTrading } from '../../hooks/useTrading';

export default function AnalysisScreen() {
  const { 
    indicators, 
    selectedSymbol, 
    setSelectedSymbol, 
    updateIndicators,
    getMarketData 
  } = useTrading();
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeTimeframe, setActiveTimeframe] = useState('1H');

  const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD'];
  const timeframes = ['1M', '5M', '15M', '30M', '1H', '4H', '1D'];

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await updateIndicators(selectedSymbol);
    } catch (error) {
      console.error('Analysis refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    updateIndicators(selectedSymbol);
  }, [selectedSymbol]);

  const getRSIColor = (rsi: number) => {
    if (rsi >= 70) return Colors.bearish; // Overbought
    if (rsi <= 30) return Colors.bullish; // Oversold
    return Colors.textPrimary; // Neutral
  };

  const getRSISignal = (rsi: number) => {
    if (rsi >= 70) return 'SELL - Overbought';
    if (rsi <= 30) return 'BUY - Oversold';
    return 'NEUTRAL';
  };

  const getMASignal = () => {
    const marketData = getMarketData(selectedSymbol);
    if (!marketData) return 'NO DATA';
    
    if (marketData.price > indicators.movingAverage) {
      return 'BUY - Above MA';
    } else if (marketData.price < indicators.movingAverage) {
      return 'SELL - Below MA';
    }
    return 'NEUTRAL';
  };

  const getMACDSignal = () => {
    const { signal, histogram } = indicators.macd;
    if (signal > 0 && histogram > 0) return 'BUY - Bullish';
    if (signal < 0 && histogram < 0) return 'SELL - Bearish';
    return 'NEUTRAL';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Technical Analysis</Text>
          <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
            <MaterialIcons 
              name="refresh" 
              size={24} 
              color={refreshing ? Colors.textMuted : Colors.primary} 
            />
          </TouchableOpacity>
        </View>

        {/* Symbol Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Symbol</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {symbols.map((symbol) => (
              <TouchableOpacity
                key={symbol}
                style={[
                  styles.symbolButton,
                  selectedSymbol === symbol && styles.symbolButtonActive
                ]}
                onPress={() => setSelectedSymbol(symbol)}
              >
                <Text style={[
                  styles.symbolButtonText,
                  selectedSymbol === symbol && styles.symbolButtonTextActive
                ]}>
                  {symbol}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Timeframe Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeframe</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {timeframes.map((timeframe) => (
              <TouchableOpacity
                key={timeframe}
                style={[
                  styles.timeframeButton,
                  activeTimeframe === timeframe && styles.timeframeButtonActive
                ]}
                onPress={() => setActiveTimeframe(timeframe)}
              >
                <Text style={[
                  styles.timeframeButtonText,
                  activeTimeframe === timeframe && styles.timeframeButtonTextActive
                ]}>
                  {timeframe}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Technical Indicators */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technical Indicators</Text>
          
          {/* RSI */}
          <View style={styles.indicatorCard}>
            <View style={styles.indicatorHeader}>
              <Text style={styles.indicatorName}>RSI (14)</Text>
              <Text style={[styles.indicatorValue, { color: getRSIColor(indicators.rsi) }]}>
                {indicators.rsi.toFixed(2)}
              </Text>
            </View>
            <View style={styles.rsiBar}>
              <View style={styles.rsiBarBackground}>
                <View 
                  style={[
                    styles.rsiBarFill,
                    { 
                      width: `${indicators.rsi}%`,
                      backgroundColor: getRSIColor(indicators.rsi)
                    }
                  ]} 
                />
                <View style={[styles.rsiLevel, { left: '30%' }]} />
                <View style={[styles.rsiLevel, { left: '70%' }]} />
              </View>
            </View>
            <Text style={[styles.indicatorSignal, { color: getRSIColor(indicators.rsi) }]}>
              {getRSISignal(indicators.rsi)}
            </Text>
          </View>

          {/* Moving Average */}
          <View style={styles.indicatorCard}>
            <View style={styles.indicatorHeader}>
              <Text style={styles.indicatorName}>Moving Average (20)</Text>
              <Text style={styles.indicatorValue}>
                {indicators.movingAverage.toFixed(5)}
              </Text>
            </View>
            <Text style={styles.indicatorSignal}>
              {getMASignal()}
            </Text>
          </View>

          {/* MACD */}
          <View style={styles.indicatorCard}>
            <View style={styles.indicatorHeader}>
              <Text style={styles.indicatorName}>MACD (12,26,9)</Text>
              <Text style={styles.indicatorValue}>
                {indicators.macd.signal.toFixed(6)}
              </Text>
            </View>
            <View style={styles.macdDetails}>
              <Text style={styles.macdLabel}>Signal: {indicators.macd.signal.toFixed(6)}</Text>
              <Text style={styles.macdLabel}>Histogram: {indicators.macd.histogram.toFixed(6)}</Text>
            </View>
            <Text style={styles.indicatorSignal}>
              {getMACDSignal()}
            </Text>
          </View>

          {/* Fibonacci Levels */}
          <View style={styles.indicatorCard}>
            <View style={styles.indicatorHeader}>
              <Text style={styles.indicatorName}>Fibonacci Retracements</Text>
            </View>
            <View style={styles.fibonacciLevels}>
              {indicators.fibonacciLevels.map((level, index) => (
                <View key={index} style={styles.fibonacciLevel}>
                  <Text style={styles.fibonacciLevelText}>{level.toFixed(3)}</Text>
                  <Text style={styles.fibonacciPrice}>
                    {(indicators.movingAverage * level).toFixed(5)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Market Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Market Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <MaterialIcons name="trending-up" size={20} color={Colors.bullish} />
              <Text style={styles.summaryText}>
                Strong momentum detected on {selectedSymbol}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <MaterialIcons name="analytics" size={20} color={Colors.primary} />
              <Text style={styles.summaryText}>
                Multiple timeframe analysis available
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <MaterialIcons name="schedule" size={20} color={Colors.accent} />
              <Text style={styles.summaryText}>
                Last updated: {new Date().toLocaleTimeString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  horizontalScroll: {
    flexGrow: 0,
  },
  symbolButton: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  symbolButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  symbolButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  symbolButtonTextActive: {
    color: Colors.textPrimary,
  },
  timeframeButton: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeframeButtonActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  timeframeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  timeframeButtonTextActive: {
    color: Colors.textPrimary,
  },
  indicatorCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  indicatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  indicatorName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  indicatorValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: 'monospace',
  },
  indicatorSignal: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
    marginTop: 8,
  },
  rsiBar: {
    marginVertical: 12,
  },
  rsiBarBackground: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    position: 'relative',
  },
  rsiBarFill: {
    height: 6,
    borderRadius: 3,
  },
  rsiLevel: {
    position: 'absolute',
    top: -2,
    width: 2,
    height: 10,
    backgroundColor: Colors.textMuted,
  },
  macdDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  macdLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
  },
  fibonacciLevels: {
    marginTop: 12,
  },
  fibonacciLevel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  fibonacciLevelText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  fibonacciPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    fontFamily: 'monospace',
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 12,
  },
  bottomPadding: {
    height: 20,
  },
});