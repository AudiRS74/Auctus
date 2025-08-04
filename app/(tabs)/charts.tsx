import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Chip, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useTrading } from '../../hooks/useTrading';
import { tradingViewService, TradingViewData } from '../../services/tradingViewService';
import { Colors, Gradients } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { QUICK_ACCESS_SYMBOLS, getTradingViewSymbol } from '../../constants/Markets';

const { width, height } = Dimensions.get('window');

export default function Charts() {
  const { selectedSymbol, setSelectedSymbol, indicators } = useTrading();
  const [selectedTimeframe, setSelectedTimeframe] = useState('15');
  const [priceData, setPriceData] = useState<TradingViewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const chartContainerRef = useRef<View>(null);

  const symbols = QUICK_ACCESS_SYMBOLS;
  const timeframes = [
    { label: '1M', value: '1' },
    { label: '5M', value: '5' },
    { label: '15M', value: '15' },
    { label: '1H', value: '60' },
    { label: '4H', value: '240' },
    { label: '1D', value: '1D' }
  ];

  // Load real-time price data
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const loadPriceData = async () => {
      setIsLoading(true);
      
      // Subscribe to real-time price updates
      unsubscribe = tradingViewService.subscribeToPrice(selectedSymbol, (data: TradingViewData) => {
        setPriceData(data);
        setIsLoading(false);
      });

      // Get initial price data
      const initialData = await tradingViewService.getRealTimePrice(selectedSymbol);
      if (initialData) {
        setPriceData(initialData);
        setIsLoading(false);
      }
    };

    loadPriceData();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [selectedSymbol]);

  // Generate TradingView widget HTML for WebView
  const getTradingViewHTML = () => {
    const tradingViewSymbol = getTradingViewSymbol(selectedSymbol);
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TradingView Chart</title>
        <style>
            body { margin: 0; padding: 0; background-color: #0A0E1A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
            #tradingview_chart { width: 100%; height: 100vh; }
            .loading { 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                height: 100vh; 
                color: #B8C5D6; 
                font-size: 16px;
            }
        </style>
    </head>
    <body>
        <div id="loading" class="loading">Loading Chart...</div>
        <div id="tradingview_chart" style="display: none;"></div>
        
        <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
        <script type="text/javascript">
            function initChart() {
                try {
                    document.getElementById('loading').style.display = 'none';
                    document.getElementById('tradingview_chart').style.display = 'block';
                    
                    new TradingView.widget({
                        "width": "100%",
                        "height": "100%",
                        "symbol": "${tradingViewSymbol}",
                        "interval": "${selectedTimeframe}",
                        "timezone": "Etc/UTC",
                        "theme": "dark",
                        "style": "1",
                        "locale": "en",
                        "toolbar_bg": "#0A0E1A",
                        "enable_publishing": false,
                        "hide_top_toolbar": false,
                        "hide_legend": false,
                        "save_image": false,
                        "container_id": "tradingview_chart",
                        "studies": [
                            "RSI@tv-basicstudies",
                            "MACD@tv-basicstudies",
                            "MASimple@tv-basicstudies"
                        ],
                        "overrides": {
                            "paneProperties.background": "#0A0E1A",
                            "paneProperties.vertGridProperties.color": "#2A3441",
                            "paneProperties.horzGridProperties.color": "#2A3441",
                            "symbolWatermarkProperties.transparency": 90,
                            "scalesProperties.textColor": "#B8C5D6",
                            "mainSeriesProperties.candleStyle.upColor": "#00FF88",
                            "mainSeriesProperties.candleStyle.downColor": "#FF4757",
                            "mainSeriesProperties.candleStyle.borderUpColor": "#00FF88",
                            "mainSeriesProperties.candleStyle.borderDownColor": "#FF4757",
                            "mainSeriesProperties.candleStyle.wickUpColor": "#00FF88",
                            "mainSeriesProperties.candleStyle.wickDownColor": "#FF4757"
                        }
                    });
                } catch (error) {
                    console.error('TradingView widget error:', error);
                    document.getElementById('loading').innerHTML = 'Chart loading failed';
                }
            }
            
            // Initialize when DOM is loaded
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initChart);
            } else {
                initChart();
            }
        </script>
    </body>
    </html>
    `;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={Gradients.header}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Professional Charts</Text>
            <Text style={styles.subtitle}>Real-time market analysis powered by TradingView</Text>
          </View>
          <MaterialIcons name="show-chart" size={28} color={Colors.primary} />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Market & Timeframe Selection */}
        <View style={styles.controlsContainer}>
          {/* Symbol Selection */}
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

          {/* Timeframe Selection */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.timeframeScroll}
            contentContainerStyle={styles.timeframeScrollContent}
          >
            {timeframes.map((timeframe) => (
              <Chip
                key={timeframe.value}
                selected={selectedTimeframe === timeframe.value}
                onPress={() => setSelectedTimeframe(timeframe.value)}
                style={[
                  styles.timeframeChip,
                  selectedTimeframe === timeframe.value && styles.selectedTimeframeChip
                ]}
                textStyle={[
                  styles.timeframeChipText,
                  selectedTimeframe === timeframe.value && styles.selectedTimeframeChipText
                ]}
              >
                {timeframe.label}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* Price Information */}
        {priceData && (
          <Card style={styles.priceCard}>
            <LinearGradient
              colors={[Colors.primary + '10', Colors.surface]}
              style={styles.priceGradient}
            >
              <View style={styles.priceHeader}>
                <View>
                  <Text style={styles.priceSymbol}>{selectedSymbol}</Text>
                  <Text style={styles.priceValue}>{priceData.price.toFixed(5)}</Text>
                </View>
                <View style={styles.priceChange}>
                  <MaterialIcons 
                    name={priceData.change >= 0 ? "trending-up" : "trending-down"} 
                    size={24} 
                    color={priceData.change >= 0 ? Colors.bullish : Colors.bearish} 
                  />
                  <View style={styles.changeValues}>
                    <Text style={[styles.changeValue, { 
                      color: priceData.change >= 0 ? Colors.bullish : Colors.bearish 
                    }]}>
                      {priceData.change >= 0 ? '+' : ''}{priceData.change.toFixed(5)}
                    </Text>
                    <Text style={[styles.changePercent, { 
                      color: priceData.change >= 0 ? Colors.bullish : Colors.bearish 
                    }]}>
                      ({priceData.changePercent >= 0 ? '+' : ''}{priceData.changePercent.toFixed(2)}%)
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.priceDetails}>
                <View style={styles.priceDetailItem}>
                  <Text style={styles.priceDetailLabel}>High</Text>
                  <Text style={styles.priceDetailValue}>{priceData.high.toFixed(5)}</Text>
                </View>
                <View style={styles.priceDetailItem}>
                  <Text style={styles.priceDetailLabel}>Low</Text>
                  <Text style={styles.priceDetailValue}>{priceData.low.toFixed(5)}</Text>
                </View>
                <View style={styles.priceDetailItem}>
                  <Text style={styles.priceDetailLabel}>Open</Text>
                  <Text style={styles.priceDetailValue}>{priceData.open.toFixed(5)}</Text>
                </View>
                <View style={styles.priceDetailItem}>
                  <Text style={styles.priceDetailLabel}>Volume</Text>
                  <Text style={styles.priceDetailValue}>{priceData.volume.toLocaleString()}</Text>
                </View>
              </View>
            </LinearGradient>
          </Card>
        )}

        {/* TradingView Chart */}
        <View style={styles.chartContainer} ref={chartContainerRef}>
          {Platform.OS === 'web' ? (
            <iframe
              src={`data:text/html;charset=utf-8,${encodeURIComponent(getTradingViewHTML())}`}
              style={{ width: '100%', height: '100%', border: 'none', borderRadius: 12 }}
            />
          ) : (
            <WebView
              source={{ html: getTradingViewHTML() }}
              style={styles.webview}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.webviewLoading}>
                  <MaterialIcons name="timeline" size={64} color={Colors.textMuted} />
                  <Text style={styles.webviewLoadingText}>Loading Professional Chart...</Text>
                </View>
              )}
            />
          )}
        </View>
      </View>

      {/* Technical Indicators Summary */}
      <Card style={styles.indicatorsCard}>
        <Card.Content style={styles.indicatorsContent}>
          <View style={styles.indicatorsHeader}>
            <Text style={styles.indicatorsTitle}>Technical Analysis</Text>
            <MaterialIcons name="analytics" size={20} color={Colors.accent} />
          </View>
          
          <View style={styles.indicatorsGrid}>
            <View style={styles.indicatorItem}>
              <Text style={styles.indicatorLabel}>RSI (14)</Text>
              <Text style={[styles.indicatorValue, { 
                color: indicators.rsi > 70 ? Colors.bearish : indicators.rsi < 30 ? Colors.bullish : Colors.textPrimary 
              }]}>
                {indicators.rsi.toFixed(1)}
              </Text>
              <Text style={styles.indicatorSignal}>
                {indicators.rsi > 70 ? 'Overbought' : indicators.rsi < 30 ? 'Oversold' : 'Neutral'}
              </Text>
            </View>
            
            <View style={styles.indicatorItem}>
              <Text style={styles.indicatorLabel}>MACD</Text>
              <Text style={[styles.indicatorValue, { 
                color: indicators.macd.signal > 0 ? Colors.bullish : Colors.bearish 
              }]}>
                {indicators.macd.signal.toFixed(5)}
              </Text>
              <Text style={styles.indicatorSignal}>
                {indicators.macd.signal > 0 ? 'Bullish' : 'Bearish'}
              </Text>
            </View>
            
            <View style={styles.indicatorItem}>
              <Text style={styles.indicatorLabel}>MA (50)</Text>
              <Text style={styles.indicatorValue}>{indicators.movingAverage.toFixed(5)}</Text>
              <Text style={styles.indicatorSignal}>
                {priceData && priceData.price > indicators.movingAverage ? 'Above MA' : 'Below MA'}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerGradient: {
    paddingBottom: 16,
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  controlsContainer: {
    marginBottom: 12,
  },
  symbolScroll: {
    marginBottom: 12,
  },
  symbolScrollContent: {
    paddingRight: 16,
  },
  symbolChip: {
    marginRight: 8,
    backgroundColor: Colors.cardElevated,
    borderColor: Colors.border,
  },
  selectedSymbolChip: {
    backgroundColor: Colors.primary,
  },
  symbolChipText: {
    color: Colors.textSecondary,
    fontWeight: '500',
    fontSize: 13,
  },
  selectedSymbolChipText: {
    color: Colors.background,
    fontWeight: '600',
  },
  timeframeScroll: {
    marginBottom: 8,
  },
  timeframeScrollContent: {
    paddingRight: 16,
  },
  timeframeChip: {
    marginRight: 6,
    backgroundColor: Colors.cardElevated,
    height: 32,
  },
  selectedTimeframeChip: {
    backgroundColor: Colors.secondary,
  },
  timeframeChipText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  selectedTimeframeChipText: {
    color: Colors.background,
    fontWeight: '600',
  },
  priceCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 4,
  },
  priceGradient: {
    padding: 16,
    borderRadius: 12,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  priceSymbol: {
    ...Typography.h6,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  priceValue: {
    ...Typography.h4,
    color: Colors.textPrimary,
    fontWeight: '700',
    ...Typography.number,
  },
  priceChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  changeValues: {
    alignItems: 'flex-end',
  },
  changeValue: {
    ...Typography.body1,
    fontWeight: '600',
    ...Typography.number,
  },
  changePercent: {
    ...Typography.caption,
    fontWeight: '500',
    marginTop: 2,
  },
  priceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  priceDetailItem: {
    alignItems: 'center',
  },
  priceDetailLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  priceDetailValue: {
    ...Typography.body2,
    color: Colors.textPrimary,
    fontWeight: '500',
    ...Typography.number,
  },
  chartContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    marginBottom: 12,
    minHeight: 400,
  },
  webview: {
    backgroundColor: Colors.background,
    borderRadius: 12,
  },
  webviewLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  webviewLoadingText: {
    ...Typography.body2,
    color: Colors.textMuted,
    marginTop: 12,
  },
  indicatorsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  indicatorsContent: {
    paddingVertical: 16,
  },
  indicatorsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  indicatorsTitle: {
    ...Typography.body1,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  indicatorsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  indicatorItem: {
    alignItems: 'center',
    flex: 1,
  },
  indicatorLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  indicatorValue: {
    ...Typography.body1,
    color: Colors.textPrimary,
    fontWeight: '600',
    ...Typography.number,
    marginBottom: 2,
  },
  indicatorSignal: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 10,
    textAlign: 'center',
  },
});