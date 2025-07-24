import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Card, Button, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTrading } from '@/hooks/useTrading';

const { width } = Dimensions.get('window');

const TIMEFRAMES = ['1M', '5M', '15M', '30M', '1H', '4H', '1D'];
const CHART_TYPES = ['Candlestick', 'Line', 'Area'];

// Mock price data generator
const generateMockData = (points: number) => {
  const data = [];
  let price = 1.2500 + Math.random() * 0.1;
  
  for (let i = 0; i < points; i++) {
    const change = (Math.random() - 0.5) * 0.01;
    price += change;
    data.push({
      timestamp: Date.now() - (points - i) * 60000,
      price: price,
      high: price + Math.random() * 0.005,
      low: price - Math.random() * 0.005,
      volume: Math.random() * 1000000,
    });
  }
  return data;
};

export default function ChartsPage() {
  const { selectedSymbol, setSelectedSymbol, indicators } = useTrading();
  const [timeframe, setTimeframe] = useState('1H');
  const [chartType, setChartType] = useState('Candlestick');
  const [priceData, setPriceData] = useState(generateMockData(50));

  useEffect(() => {
    const interval = setInterval(() => {
      setPriceData(prev => {
        const newData = [...prev];
        const lastPrice = newData[newData.length - 1].price;
        const change = (Math.random() - 0.5) * 0.01;
        newData.push({
          timestamp: Date.now(),
          price: lastPrice + change,
          high: lastPrice + change + Math.random() * 0.005,
          low: lastPrice + change - Math.random() * 0.005,
          volume: Math.random() * 1000000,
        });
        return newData.slice(-50);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentPrice = priceData[priceData.length - 1]?.price || 0;
  const priceChange = priceData.length > 1 ? currentPrice - priceData[priceData.length - 2].price : 0;
  const priceChangePercent = ((priceChange / currentPrice) * 100);

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B']}
      style={styles.container}
    >
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Charts & Analysis</Text>
          <MaterialIcons name="fullscreen" size={24} color="#94A3B8" />
        </View>

        <ScrollView style={styles.content}>
          <Card style={styles.priceCard}>
            <Card.Content>
              <View style={styles.priceHeader}>
                <Text style={styles.symbolText}>{selectedSymbol}</Text>
                <View style={styles.priceInfo}>
                  <Text style={styles.currentPrice}>{currentPrice.toFixed(5)}</Text>
                  <Text style={[
                    styles.priceChange,
                    { color: priceChange >= 0 ? '#10B981' : '#EF4444' }
                  ]}>
                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(5)} ({priceChangePercent.toFixed(2)}%)
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.controlsCard}>
            <Card.Content>
              <View style={styles.controlSection}>
                <Text style={styles.controlLabel}>Timeframe</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipContainer}>
                    {TIMEFRAMES.map((tf) => (
                      <Chip
                        key={tf}
                        selected={timeframe === tf}
                        onPress={() => setTimeframe(tf)}
                        style={[
                          styles.timeframeChip,
                          timeframe === tf && styles.selectedChip
                        ]}
                        textStyle={[
                          styles.chipText,
                          timeframe === tf && styles.selectedChipText
                        ]}
                      >
                        {tf}
                      </Chip>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.controlSection}>
                <Text style={styles.controlLabel}>Chart Type</Text>
                <View style={styles.chartTypeButtons}>
                  {CHART_TYPES.map((type) => (
                    <Button
                      key={type}
                      mode={chartType === type ? 'contained' : 'outlined'}
                      onPress={() => setChartType(type)}
                      style={[
                        styles.chartTypeButton,
                        chartType === type && styles.selectedButton
                      ]}
                      labelStyle={styles.buttonText}
                    >
                      {type}
                    </Button>
                  ))}
                </View>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.chartCard}>
            <Card.Content>
              <View style={styles.mockChart}>
                <Text style={styles.chartPlaceholder}>
                  📊 Interactive {chartType} Chart
                </Text>
                <Text style={styles.chartSubtext}>
                  {selectedSymbol} - {timeframe} Timeframe
                </Text>
                
                {/* Mock price bars */}
                <View style={styles.priceBarContainer}>
                  {priceData.slice(-20).map((point, index) => {
                    const height = 30 + (point.price - 1.2) * 1000;
                    const isGreen = index === 0 || point.price > priceData[priceData.length - 21 + index - 1]?.price;
                    return (
                      <View
                        key={index}
                        style={[
                          styles.priceBar,
                          {
                            height: Math.max(5, height),
                            backgroundColor: isGreen ? '#10B981' : '#EF4444',
                          }
                        ]}
                      />
                    );
                  })}
                </View>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.indicatorsCard}>
            <Card.Title
              title="Technical Indicators"
              titleStyle={styles.cardTitle}
              left={() => <MaterialIcons name="timeline" size={24} color="#8B5CF6" />}
            />
            <Card.Content>
              <View style={styles.indicatorGrid}>
                <View style={styles.indicatorItem}>
                  <Text style={styles.indicatorLabel}>RSI (14)</Text>
                  <Text style={[
                    styles.indicatorValue,
                    { color: indicators.rsi > 70 ? '#EF4444' : indicators.rsi < 30 ? '#10B981' : '#F59E0B' }
                  ]}>
                    {indicators.rsi.toFixed(1)}
                  </Text>
                  <Text style={styles.indicatorStatus}>
                    {indicators.rsi > 70 ? 'Overbought' : indicators.rsi < 30 ? 'Oversold' : 'Neutral'}
                  </Text>
                </View>

                <View style={styles.indicatorItem}>
                  <Text style={styles.indicatorLabel}>MACD</Text>
                  <Text style={[
                    styles.indicatorValue,
                    { color: indicators.macd.signal > 0 ? '#10B981' : '#EF4444' }
                  ]}>
                    {indicators.macd.signal.toFixed(4)}
                  </Text>
                  <Text style={styles.indicatorStatus}>
                    {indicators.macd.signal > 0 ? 'Bullish' : 'Bearish'}
                  </Text>
                </View>

                <View style={styles.indicatorItem}>
                  <Text style={styles.indicatorLabel}>MA (20)</Text>
                  <Text style={styles.indicatorValue}>
                    {indicators.movingAverage.toFixed(5)}
                  </Text>
                  <Text style={styles.indicatorStatus}>
                    {currentPrice > indicators.movingAverage ? 'Above MA' : 'Below MA'}
                  </Text>
                </View>

                <View style={styles.indicatorItem}>
                  <Text style={styles.indicatorLabel}>Volume</Text>
                  <Text style={styles.indicatorValue}>
                    {(priceData[priceData.length - 1]?.volume || 0).toLocaleString()}
                  </Text>
                  <Text style={styles.indicatorStatus}>High</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.fibonacciCard}>
            <Card.Title
              title="Fibonacci Retracement"
              titleStyle={styles.cardTitle}
              left={() => <MaterialIcons name="show-chart" size={24} color="#F59E0B" />}
            />
            <Card.Content>
              <View style={styles.fibLevels}>
                {indicators.fibonacciLevels.map((level, index) => (
                  <View key={index} style={styles.fibLevel}>
                    <Text style={styles.fibLabel}>{(level * 100).toFixed(1)}%</Text>
                    <Text style={styles.fibPrice}>{(currentPrice * level).toFixed(5)}</Text>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  priceCard: {
    backgroundColor: '#1E293B',
    marginBottom: 16,
    borderRadius: 12,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  symbolText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  priceChange: {
    fontSize: 14,
    fontWeight: '500',
  },
  controlsCard: {
    backgroundColor: '#1E293B',
    marginBottom: 16,
    borderRadius: 12,
  },
  controlSection: {
    marginBottom: 16,
  },
  controlLabel: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  timeframeChip: {
    backgroundColor: '#334155',
  },
  selectedChip: {
    backgroundColor: '#00C896',
  },
  chipText: {
    color: '#94A3B8',
  },
  selectedChipText: {
    color: '#FFFFFF',
  },
  chartTypeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  chartTypeButton: {
    flex: 1,
    borderColor: '#475569',
  },
  selectedButton: {
    backgroundColor: '#00C896',
  },
  buttonText: {
    fontSize: 12,
  },
  chartCard: {
    backgroundColor: '#1E293B',
    marginBottom: 16,
    borderRadius: 12,
  },
  mockChart: {
    alignItems: 'center',
    paddingVertical: 40,
    minHeight: 250,
  },
  chartPlaceholder: {
    fontSize: 24,
    color: '#F8FAFC',
    marginBottom: 8,
  },
  chartSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 20,
  },
  priceBarContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    marginTop: 20,
  },
  priceBar: {
    width: 8,
    borderRadius: 2,
  },
  indicatorsCard: {
    backgroundColor: '#1E293B',
    marginBottom: 16,
    borderRadius: 12,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
  },
  indicatorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  indicatorItem: {
    width: '48%',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#334155',
    borderRadius: 8,
  },
  indicatorLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 4,
  },
  indicatorValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  indicatorStatus: {
    color: '#64748B',
    fontSize: 12,
  },
  fibonacciCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
  },
  fibLevels: {
    gap: 8,
  },
  fibLevel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#334155',
    borderRadius: 6,
  },
  fibLabel: {
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  fibPrice: {
    color: '#F8FAFC',
    fontWeight: '500',
  },
});