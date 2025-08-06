import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Chip, ProgressBar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTrading } from '../../hooks/useTrading';
import { Colors, Gradients } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { QUICK_ACCESS_SYMBOLS } from '../../constants/Markets';

const { width } = Dimensions.get('window');

interface AnalysisData {
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  strength: number;
  support: number;
  resistance: number;
  recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
}

export default function Analysis() {
  const { selectedSymbol, setSelectedSymbol, indicators, getMarketData } = useTrading();
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const symbols = QUICK_ACCESS_SYMBOLS;

  useEffect(() => {
    loadAnalysisData();
    const interval = setInterval(loadAnalysisData, 15000); // Update every 15 seconds
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  const loadAnalysisData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate analysis calculation delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get market data if available
      const marketData = getMarketData(selectedSymbol);
      const currentPrice = marketData?.price || 1.0850;

      // Generate mock analysis based on indicators
      const rsi = indicators.rsi;
      const macd = indicators.macd.signal;

      // Determine trend
      let trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
      if (rsi > 60 && macd > 0) trend = 'BULLISH';
      else if (rsi < 40 && macd < 0) trend = 'BEARISH';

      // Calculate strength (0-100)
      const strength = Math.max(0, Math.min(100, 
        (Math.abs(rsi - 50) + Math.abs(macd * 10000)) * 2
      ));

      // Generate support and resistance levels
      const variation = currentPrice * 0.005; // 0.5% variation
      const support = Number((currentPrice - variation).toFixed(5));
      const resistance = Number((currentPrice + variation).toFixed(5));

      // Determine recommendation
      let recommendation: AnalysisData['recommendation'] = 'HOLD';
      if (rsi > 70 && strength > 80) recommendation = 'STRONG_BUY';
      else if (rsi > 60 && strength > 60) recommendation = 'BUY';
      else if (rsi < 30 && strength > 80) recommendation = 'STRONG_SELL';
      else if (rsi < 40 && strength > 60) recommendation = 'SELL';

      setAnalysisData({
        trend,
        strength: Number(strength.toFixed(1)),
        support,
        resistance,
        recommendation,
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Analysis loading error:', error);
      setError('Failed to load analysis data');
    } finally {
      setLoading(false);
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'BULLISH': return Colors.bullish;
      case 'BEARISH': return Colors.bearish;
      default: return Colors.textMuted;
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'STRONG_BUY': return Colors.bullish;
      case 'BUY': return Colors.bullish;
      case 'STRONG_SELL': return Colors.bearish;
      case 'SELL': return Colors.bearish;
      default: return Colors.textMuted;
    }
  };

  const formatRecommendation = (recommendation: string) => {
    return recommendation.replace('_', ' ');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={Gradients.header}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Market Analysis</Text>
            <Text style={styles.subtitle}>Advanced technical insights</Text>
          </View>
          <MaterialIcons name="analytics" size={28} color={Colors.primary} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Symbol Selection */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Select Market</Text>
              <MaterialIcons name="public" size={24} color={Colors.primary} />
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
          </Card.Content>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.loadingContainer}>
                <MaterialIcons name="analytics" size={48} color={Colors.primary} />
                <Text style={styles.loadingText}>Analyzing Market Data...</Text>
                <Text style={styles.loadingSubtext}>Processing {selectedSymbol} indicators</Text>
                <ProgressBar 
                  progress={0.7} 
                  color={Colors.primary} 
                  style={styles.progressBar} 
                />
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card style={styles.errorCard}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={48} color={Colors.error} />
                <Text style={styles.errorText}>Analysis Error</Text>
                <Text style={styles.errorSubtext}>{error}</Text>
                <Button
                  mode="outlined"
                  onPress={loadAnalysisData}
                  style={styles.retryButton}
                  textColor={Colors.primary}
                  icon="refresh"
                >
                  Retry Analysis
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Analysis Results */}
        {analysisData && !loading && !error && (
          <>
            {/* Market Overview */}
            <Card style={styles.overviewCard}>
              <LinearGradient
                colors={[Colors.primary + '15', Colors.surface]}
                style={styles.overviewGradient}
              >
                <View style={styles.overviewHeader}>
                  <View>
                    <Text style={styles.overviewSymbol}>{selectedSymbol}</Text>
                    <Text style={styles.lastUpdateText}>
                      Last updated: {lastUpdate.toLocaleTimeString()}
                    </Text>
                  </View>
                  <View style={styles.trendContainer}>
                    <View style={[styles.trendBadge, { 
                      backgroundColor: getTrendColor(analysisData.trend) + '20' 
                    }]}>
                      <MaterialIcons 
                        name={
                          analysisData.trend === 'BULLISH' ? 'trending-up' : 
                          analysisData.trend === 'BEARISH' ? 'trending-down' : 'trending-flat'
                        } 
                        size={20} 
                        color={getTrendColor(analysisData.trend)} 
                      />
                      <Text style={[styles.trendText, { 
                        color: getTrendColor(analysisData.trend) 
                      }]}>
                        {analysisData.trend}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.strengthContainer}>
                  <Text style={styles.strengthLabel}>Signal Strength</Text>
                  <View style={styles.strengthBar}>
                    <ProgressBar 
                      progress={analysisData.strength / 100} 
                      color={analysisData.strength > 70 ? Colors.bullish : 
                             analysisData.strength > 40 ? Colors.primary : Colors.bearish}
                      style={styles.strengthProgress} 
                    />
                    <Text style={styles.strengthValue}>{analysisData.strength}%</Text>
                  </View>
                </View>
              </LinearGradient>
            </Card>

            {/* Key Levels */}
            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.cardTitle}>Key Levels</Text>
                  <MaterialIcons name="horizontal-rule" size={24} color={Colors.accent} />
                </View>
                
                <View style={styles.levelsGrid}>
                  <View style={styles.levelItem}>
                    <View style={styles.levelHeader}>
                      <MaterialIcons name="support" size={20} color={Colors.bullish} />
                      <Text style={styles.levelLabel}>Support</Text>
                    </View>
                    <Text style={[styles.levelValue, { color: Colors.bullish }]}>
                      {analysisData.support.toFixed(5)}
                    </Text>
                  </View>
                  
                  <View style={styles.levelDivider} />
                  
                  <View style={styles.levelItem}>
                    <View style={styles.levelHeader}>
                      <MaterialIcons name="trending-up" size={20} color={Colors.bearish} />
                      <Text style={styles.levelLabel}>Resistance</Text>
                    </View>
                    <Text style={[styles.levelValue, { color: Colors.bearish }]}>
                      {analysisData.resistance.toFixed(5)}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Technical Indicators */}
            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.cardTitle}>Technical Indicators</Text>
                  <MaterialIcons name="speed" size={24} color={Colors.secondary} />
                </View>
                
                <View style={styles.indicatorsContainer}>
                  <View style={styles.indicatorRow}>
                    <View style={styles.indicatorItem}>
                      <Text style={styles.indicatorLabel}>RSI (14)</Text>
                      <Text style={[styles.indicatorValue, { 
                        color: indicators.rsi > 70 ? Colors.bearish : 
                               indicators.rsi < 30 ? Colors.bullish : Colors.textPrimary 
                      }]}>
                        {indicators.rsi.toFixed(1)}
                      </Text>
                      <Text style={styles.indicatorSignal}>
                        {indicators.rsi > 70 ? 'Overbought' : 
                         indicators.rsi < 30 ? 'Oversold' : 'Neutral'}
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
                  </View>
                  
                  <View style={styles.indicatorRow}>
                    <View style={styles.indicatorItem}>
                      <Text style={styles.indicatorLabel}>Moving Average</Text>
                      <Text style={styles.indicatorValue}>
                        {indicators.movingAverage.toFixed(5)}
                      </Text>
                      <Text style={styles.indicatorSignal}>50 Period</Text>
                    </View>
                    
                    <View style={styles.indicatorItem}>
                      <Text style={styles.indicatorLabel}>Histogram</Text>
                      <Text style={[styles.indicatorValue, { 
                        color: indicators.macd.histogram > 0 ? Colors.bullish : Colors.bearish 
                      }]}>
                        {indicators.macd.histogram.toFixed(5)}
                      </Text>
                      <Text style={styles.indicatorSignal}>MACD</Text>
                    </View>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Trading Recommendation */}
            <Card style={styles.recommendationCard}>
              <LinearGradient
                colors={[getRecommendationColor(analysisData.recommendation) + '15', Colors.surface]}
                style={styles.recommendationGradient}
              >
                <View style={styles.recommendationHeader}>
                  <MaterialIcons 
                    name="lightbulb-outline" 
                    size={32} 
                    color={getRecommendationColor(analysisData.recommendation)} 
                  />
                  <View style={styles.recommendationContent}>
                    <Text style={styles.recommendationTitle}>Trading Recommendation</Text>
                    <Text style={[styles.recommendationValue, { 
                      color: getRecommendationColor(analysisData.recommendation) 
                    }]}>
                      {formatRecommendation(analysisData.recommendation)}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.recommendationNote}>
                  Based on technical analysis of {selectedSymbol}. 
                  This is educational content for demo trading only.
                </Text>
              </LinearGradient>
            </Card>
          </>
        )}

        {/* Refresh Button */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Button
              mode="contained"
              onPress={loadAnalysisData}
              loading={loading}
              disabled={loading}
              style={styles.refreshButton}
              buttonColor={Colors.primary}
              textColor={Colors.background}
              icon="refresh"
              labelStyle={styles.refreshButtonText}
            >
              {loading ? 'Analyzing...' : 'Refresh Analysis'}
            </Button>
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    ...Typography.h6,
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  loadingSubtext: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  progressBar: {
    width: width - 100,
    height: 8,
    borderRadius: 4,
  },
  errorCard: {
    marginBottom: 16,
    backgroundColor: Colors.error + '10',
    borderRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  errorText: {
    ...Typography.h6,
    color: Colors.error,
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    borderColor: Colors.primary,
  },
  overviewCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 8,
  },
  overviewGradient: {
    padding: 20,
    borderRadius: 16,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  overviewSymbol: {
    ...Typography.h4,
    color: Colors.primary,
    fontWeight: '600',
  },
  lastUpdateText: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 4,
  },
  trendContainer: {
    alignItems: 'flex-end',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  trendText: {
    ...Typography.body2,
    fontWeight: '600',
  },
  strengthContainer: {
    marginTop: 8,
  },
  strengthLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  strengthBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  strengthProgress: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  strengthValue: {
    ...Typography.body2,
    color: Colors.textPrimary,
    fontWeight: '600',
    minWidth: 40,
  },
  levelsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelItem: {
    flex: 1,
    alignItems: 'center',
  },
  levelDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  levelLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  levelValue: {
    ...Typography.h5,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  },
  indicatorsContainer: {
    gap: 20,
  },
  indicatorRow: {
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
    ...Typography.h6,
    fontWeight: '600',
    marginBottom: 2,
  },
  indicatorSignal: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 10,
    textAlign: 'center',
  },
  recommendationCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 8,
  },
  recommendationGradient: {
    padding: 20,
    borderRadius: 16,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    ...Typography.body1,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  recommendationValue: {
    ...Typography.h5,
    fontWeight: '700',
  },
  recommendationNote: {
    ...Typography.body2,
    color: Colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  refreshButton: {
    borderRadius: 12,
    paddingVertical: 4,
  },
  refreshButtonText: {
    ...Typography.button,
    fontSize: 16,
  },
});