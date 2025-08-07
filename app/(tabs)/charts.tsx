
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useTrading } from '../../hooks/useTrading';

const { width } = Dimensions.get('window');

export default function ChartsScreen() {
  const { 
    selectedSymbol, 
    setSelectedSymbol, 
    getMarketData,
    realTimeData 
  } = useTrading();
  
  const [activeTimeframe, setActiveTimeframe] = useState('1H');
  const [chartType, setChartType] = useState('candlestick');

  const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];
  const timeframes = ['1M', '5M', '15M', '30M', '1H', '4H', '1D'];
  const chartTypes = [
    { id: 'candlestick', name: 'Candlestick', icon: 'show-chart' },
    { id: 'line', name: 'Line', icon: 'timeline' },
    { id: 'area', name: 'Area', icon: 'area-chart' },
  ];

  // Mock price data for demonstration
  const generateMockPriceData = () => {
    const marketData = getMarketData(selectedSymbol);
    const basePrice = marketData ? marketData.price : 1.0850;
    
    const data = [];
    for (let i = 50; i >= 0; i--) {
      const time = new Date(Date.now() - i * 3600000); // Hourly data
      const variation = (Math.random() - 0.5) * 0.01;
      const open = basePrice + variation;
      const close = open + (Math.random() - 0.5) * 0.005;
      const high = Math.max(open, close) + Math.random() * 0.002;
      const low = Math.min(open, close) - Math.random() * 0.002;
      
      data.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        open,
        high,
        low,
        close,
        volume: Math.floor(Math.random() * 100000),
      });
    }
    return data;
  };

  const [priceData, setPriceData] = useState(generateMockPriceData());

  useEffect(() => {
    setPriceData(generateMockPriceData());
  }, [selectedSymbol, activeTimeframe]);

  // Simple chart visualization
  const renderChart = () => {
    const maxPrice = Math.max(...priceData.map(d => d.high));
    const minPrice = Math.min(...priceData.map(d => d.low));
    const priceRange = maxPrice - minPrice;
    const chartHeight = 200;
    const chartWidth = width - 40;

    return (
      <View style={styles.chartContainer}>
        <View style={styles.priceAxis}>
          <Text style={styles.axisText}>{maxPrice.toFixed(5)}</Text>
          <Text style={styles.axisText}>{((maxPrice + minPrice) / 2).toFixed(5)}</Text>
          <Text style={styles.axisText}>{minPrice.toFixed(5)}</Text>
        </View>
        
        <View style={[styles.chartArea, { width: chartWidth, height: chartHeight }]}>
          {chartType === 'line' ? (
            // Line chart
            <View style={styles.lineChart}>
              {priceData.map((point, index) => {
                const x = (index / (priceData.length - 1)) * (chartWidth - 20);
                const y = ((maxPrice - point.close) / priceRange) * (chartHeight - 20) + 10;
                
                return (
                  <View
                    key={index}
                    style={[
                      styles.linePoint,
                      { left: x, top: y }
                    ]}
                  />
                );
              })}
            </View>
          ) : (
            // Candlestick chart
            <View style={styles.candlestickChart}>
              {priceData.slice(0, 20).map((candle, index) => {
                const x = (index / 19) * (chartWidth - 40) + 20;
                const openY = ((maxPrice - candle.open) / priceRange) * (chartHeight - 20) + 10;
                const closeY = ((maxPrice - candle.close) / priceRange) * (chartHeight - 20) + 10;
                const highY = ((maxPrice - candle.high) / priceRange) * (chartHeight - 20) + 10;
                const lowY = ((maxPrice - candle.low) / priceRange) * (chartHeight - 20) + 10;
                
                const isGreen = candle.close > candle.open;
                const bodyHeight = Math.abs(closeY - openY);
                const bodyTop = Math.min(openY, closeY);
                
                return (
                  <View key={index} style={{ position: 'absolute', left: x - 3 }}>
                    {/* Wick */}
                    <View
                      style={[
                        styles.wick,
                        {
                          top: highY,
                          height: lowY - highY,
                          backgroundColor: isGreen ? Colors.bullish : Colors.bearish,
                        }
                      ]}
                    />
                    {/* Body */}
                    <View
                      style={[
                        styles.candleBody,
                        {
                          top: bodyTop,
                          height: Math.max(bodyHeight, 2),
                          backgroundColor: isGreen ? Colors.bullish : Colors.bearish,
                        }
                      ]}
                    />
                  </View>
                );
              })}
            </View>
          )}
          
          {/* Grid lines */}
          <View style={styles.gridLines}>
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <View
                key={ratio}
                style={[
                  styles.gridLine,
                  { top: ratio * (chartHeight - 20) + 10 }
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    );
  };

  const currentPrice = getMarketData(selectedSymbol);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Charts</Text>
          <View style={styles.headerInfo}>
            {currentPrice && (
              <>
                <Text style={styles.currentPrice}>
                  {currentPrice.price.toFixed(5)}
                </Text>
                <Text style={[
                  styles.priceChange,
                  { color: currentPrice.change >= 0 ? Colors.bullish : Colors.bearish }
                ]}>
                  {currentPrice.change >= 0 ? '+' : ''}{currentPrice.changePercent.toFixed(2)}%
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Symbol Selector */}
        <View style={styles.section}>
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

        {/* Chart Type & Timeframe */}
        <View style={styles.controlsSection}>
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Chart Type</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
            >
              {chartTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.chartTypeButton,
                    chartType === type.id && styles.chartTypeButtonActive
                  ]}
                  onPress={() => setChartType(type.id)}
                >
                  <MaterialIcons 
                    name={type.icon as any} 
                    size={16} 
                    color={chartType === type.id ? Colors.textPrimary : Colors.textSecondary} 
                  />
                  <Text style={[
                    styles.chartTypeText,
                    chartType === type.id && styles.chartTypeTextActive
                  ]}>
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>{/* This was the missing closing tag */}

          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Timeframe</Text>
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
        </View>

        {/* Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedSymbol} - {activeTimeframe}
          </Text>
          {renderChart()}
        </View>

        {/* Chart Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Market Statistics</Text>
          <View style={styles.statsGrid}>
            {currentPrice && (
              <>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>High</Text>
                  <Text style={styles.statValue}>
                    {currentPrice.high.toFixed(5)}
                  </Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Low</Text>
                  <Text style={styles.statValue}>
                    {currentPrice.low.toFixed(5)}
                  </Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Open</Text>
                  <Text style={styles.statValue}>
                    {currentPrice.open.toFixed(5)}
                  </Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Volume</Text>
                  <Text style={styles.statValue}>
                    {(currentPrice.volume / 1000).toFixed(0)}K
                  </Text>
                </View>
              </>
            )}
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
  headerInfo: {
    alignItems: 'flex-end',
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: 'monospace',
  },
  priceChange: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  controlsSection: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  controlGroup: {
    marginBottom: 16,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 8,
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
  chartTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartTypeButtonActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  chartTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  chartTypeTextActive: {
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
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeframeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  timeframeButtonTextActive: {
    color: Colors.textPrimary,
  },
  chartContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  priceAxis: {
    width: 60,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: 10,
    paddingRight: 8,
    backgroundColor: Colors.card,
  },
  axisText: {
    fontSize: 10,
    color: Colors.textMuted,
    fontFamily: 'monospace',
  },
  chartArea: {
    backgroundColor: Colors.surface,
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.border,
    opacity: 0.3,
  },
  lineChart: {
    flex: 1,
    position: 'relative',
  },
  linePoint: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: Colors.primary,
    borderRadius: 1,
  },
  candlestickChart: {
    flex: 1,
    position: 'relative',
  },
  wick: {
    position: 'absolute',
    width: 1,
    left: 2.5,
  },
  candleBody: {
    position: 'absolute',
    width: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: 'monospace',
  },
  bottomPadding: {
    height: 20,
  },
});
