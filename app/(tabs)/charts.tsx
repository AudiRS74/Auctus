import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Chip } from 'react-native-paper';
import { useTrading } from '../../hooks/useTrading';

export default function Charts() {
  const { selectedSymbol, setSelectedSymbol, indicators } = useTrading();
  
  const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];
  const timeframes = ['1M', '5M', '15M', '1H', '4H', '1D'];

  // Mock price data for visualization
  const mockPriceData = Array.from({ length: 20 }, (_, i) => ({
    time: new Date(Date.now() - (19 - i) * 60000).toLocaleTimeString(),
    price: 1.2000 + Math.random() * 0.01,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Charts</Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Symbol Selection</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.symbolScroll}>
              {symbols.map((symbol) => (
                <Chip
                  key={symbol}
                  selected={selectedSymbol === symbol}
                  onPress={() => setSelectedSymbol(symbol)}
                  style={styles.symbolChip}
                >
                  {symbol}
                </Chip>
              ))}
            </ScrollView>
            
            <Text style={styles.sectionTitle}>Timeframes</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {timeframes.map((timeframe) => (
                <Chip
                  key={timeframe}
                  style={styles.timeframeChip}
                >
                  {timeframe}
                </Chip>
              ))}
            </ScrollView>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>{selectedSymbol} Price Chart</Text>
            <View style={styles.chartContainer}>
              <View style={styles.chartArea}>
                <Text style={styles.chartPlaceholder}>Price Chart Visualization</Text>
                <Text style={styles.chartSubtext}>Real-time chart would be displayed here</Text>
                
                {/* Simple price visualization */}
                <View style={styles.priceList}>
                  {mockPriceData.slice(-5).map((data, index) => (
                    <View key={index} style={styles.priceRow}>
                      <Text style={styles.priceTime}>{data.time}</Text>
                      <Text style={styles.priceValue}>{data.price.toFixed(5)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Technical Indicators Overlay</Text>
            <View style={styles.indicatorOverlay}>
              <View style={styles.indicatorItem}>
                <Text style={styles.indicatorName}>RSI</Text>
                <Text style={[styles.indicatorValue, { 
                  color: indicators.rsi > 70 ? '#F44336' : indicators.rsi < 30 ? '#4CAF50' : '#FF9800' 
                }]}>
                  {indicators.rsi.toFixed(2)}
                </Text>
              </View>
              
              <View style={styles.indicatorItem}>
                <Text style={styles.indicatorName}>MA</Text>
                <Text style={styles.indicatorValue}>{indicators.movingAverage.toFixed(4)}</Text>
              </View>
              
              <View style={styles.indicatorItem}>
                <Text style={styles.indicatorName}>MACD</Text>
                <Text style={[styles.indicatorValue, { 
                  color: indicators.macd.signal > 0 ? '#4CAF50' : '#F44336' 
                }]}>
                  {indicators.macd.signal.toFixed(4)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Market Overview</Text>
            <View style={styles.marketOverview}>
              <Text style={styles.marketText}>
                The {selectedSymbol} pair is currently showing {indicators.rsi > 50 ? 'bullish' : 'bearish'} momentum
                based on technical indicators. RSI at {indicators.rsi.toFixed(2)} suggests the market is 
                {indicators.rsi > 70 ? ' overbought' : indicators.rsi < 30 ? ' oversold' : ' in neutral territory'}.
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
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  card: {
    margin: 15,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 15,
    marginBottom: 10,
    color: '#666',
  },
  symbolScroll: {
    marginBottom: 10,
  },
  symbolChip: {
    marginRight: 10,
  },
  timeframeChip: {
    marginRight: 10,
  },
  chartContainer: {
    height: 200,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 15,
  },
  chartArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholder: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  chartSubtext: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  priceList: {
    width: '100%',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  priceTime: {
    fontSize: 12,
    color: '#666',
  },
  priceValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  indicatorOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  indicatorItem: {
    alignItems: 'center',
  },
  indicatorName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  indicatorValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  marketOverview: {
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  marketText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
});