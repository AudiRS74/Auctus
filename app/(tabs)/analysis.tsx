import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTrading } from '../../hooks/useTrading';
import { Colors, Gradients } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

export default function Analysis() {
  const { indicators, selectedSymbol, updateIndicators, automationRules } = useTrading();

  const handleRefresh = () => {
    updateIndicators(selectedSymbol);
  };

  const getSignalStrength = (rsi: number, macd: number) => {
    if ((rsi > 70 && macd < 0) || (rsi < 30 && macd > 0)) return 'Strong';
    if ((rsi > 60 && macd > 0) || (rsi < 40 && macd < 0)) return 'Moderate';
    return 'Weak';
  };

  const getSignalColor = (strength: string) => {
    switch (strength) {
      case 'Strong': return Colors.bullish;
      case 'Moderate': return Colors.accent;
      default: return Colors.textMuted;
    }
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
            <Text style={styles.subtitle}>{selectedSymbol} • Advanced Analytics</Text>
          </View>
          <MaterialIcons name="analytics" size={28} color={Colors.primary} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Key Indicators Dashboard */}
        <Card style={styles.dashboardCard}>
          <LinearGradient
            colors={[Colors.primary + '15', Colors.surface]}
            style={styles.dashboardGradient}
          >
            <View style={styles.dashboardHeader}>
              <Text style={styles.dashboardTitle}>Key Indicators</Text>
              <Button 
                mode="outlined" 
                onPress={handleRefresh} 
                compact
                textColor={Colors.primary}
                style={styles.refreshButton}
                icon="refresh"
              >
                Update
              </Button>
            </View>
            
            <View style={styles.indicatorsRow}>
              <View style={styles.indicatorItem}>
                <View style={styles.indicatorIcon}>
                  <MaterialIcons name="speed" size={24} color={Colors.primary} />
                </View>
                <View style={styles.indicatorContent}>
                  <Text style={styles.indicatorLabel}>RSI (14)</Text>
                  <Text style={[styles.indicatorValue, { 
                    color: indicators.rsi > 70 ? Colors.bearish : indicators.rsi < 30 ? Colors.bullish : Colors.textPrimary 
                  }]}>
                    {indicators.rsi.toFixed(2)}
                  </Text>
                  <Text style={styles.indicatorStatus}>
                    {indicators.rsi > 70 ? 'Overbought' : indicators.rsi < 30 ? 'Oversold' : 'Neutral'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.indicatorDivider} />
              
              <View style={styles.indicatorItem}>
                <View style={styles.indicatorIcon}>
                  <MaterialIcons name="timeline" size={24} color={Colors.secondary} />
                </View>
                <View style={styles.indicatorContent}>
                  <Text style={styles.indicatorLabel}>Moving Average</Text>
                  <Text style={styles.indicatorValue}>{indicators.movingAverage.toFixed(5)}</Text>
                  <Text style={styles.indicatorStatus}>50-period SMA</Text>
                </View>
              </View>
              
              <View style={styles.indicatorDivider} />
              
              <View style={styles.indicatorItem}>
                <View style={styles.indicatorIcon}>
                  <MaterialIcons name="trending-up" size={24} color={Colors.accent} />
                </View>
                <View style={styles.indicatorContent}>
                  <Text style={styles.indicatorLabel}>MACD</Text>
                  <Text style={[styles.indicatorValue, { 
                    color: indicators.macd.signal > 0 ? Colors.bullish : Colors.bearish 
                  }]}>
                    {indicators.macd.signal.toFixed(5)}
                  </Text>
                  <Text style={styles.indicatorStatus}>
                    {indicators.macd.signal > 0 ? 'Bullish' : 'Bearish'}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Card>

        {/* Trading Signals */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Trading Signals</Text>
              <MaterialIcons name="traffic" size={24} color={Colors.accent} />
            </View>
            
            <View style={styles.signalsContainer}>
              <View style={styles.signalCard}>
                <View style={styles.signalHeader}>
                  <MaterialIcons 
                    name={indicators.rsi > 50 ? "trending-up" : "trending-down"} 
                    size={20} 
                    color={indicators.rsi > 50 ? Colors.bullish : Colors.bearish} 
                  />
                  <Text style={styles.signalType}>Momentum Signal</Text>
                  <Chip 
                    style={[styles.signalChip, { 
                      backgroundColor: getSignalColor(getSignalStrength(indicators.rsi, indicators.macd.signal)) + '20' 
                    }]}
                    textStyle={[styles.signalChipText, { 
                      color: getSignalColor(getSignalStrength(indicators.rsi, indicators.macd.signal)) 
                    }]}
                  >
                    {getSignalStrength(indicators.rsi, indicators.macd.signal)}
                  </Chip>
                </View>
                <Text style={styles.signalDescription}>
                  {indicators.rsi > 50 ? 'Upward momentum detected' : 'Downward momentum detected'} based on RSI and MACD convergence.
                </Text>
              </View>
              
              <View style={styles.signalCard}>
                <View style={styles.signalHeader}>
                  <MaterialIcons 
                    name="show-chart" 
                    size={20} 
                    color={Colors.primary} 
                  />
                  <Text style={styles.signalType}>Trend Signal</Text>
                  <Chip 
                    style={[styles.signalChip, { backgroundColor: Colors.primary + '20' }]}
                    textStyle={[styles.signalChipText, { color: Colors.primary }]}
                  >
                    Active
                  </Chip>
                </View>
                <Text style={styles.signalDescription}>
                  Price action suggests continuation of current trend with moderate volatility.
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Fibonacci Analysis */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Fibonacci Retracement</Text>
              <MaterialIcons name="grain" size={24} color={Colors.secondary} />
            </View>
            
            <View style={styles.fibonacciContainer}>
              {indicators.fibonacciLevels.map((level, index) => (
                <View key={index} style={styles.fibonacciRow}>
                  <Text style={styles.fibonacciLabel}>{(level * 100).toFixed(1)}%</Text>
                  <View style={styles.fibonacciBarContainer}>
                    <View style={[styles.fibonacciBar, { 
                      width: `${level * 100}%`,
                      backgroundColor: level > 0.618 ? Colors.bearish : level > 0.382 ? Colors.accent : Colors.bullish
                    }]} />
                  </View>
                  <Text style={styles.fibonacciValue}>{(1.2000 + level * 0.01).toFixed(5)}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.fibonacciSummary}>
              <Text style={styles.fibonacciSummaryText}>
                Key support/resistance levels based on Fibonacci retracement analysis. 
                Watch for price reactions at these critical levels.
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Automation Rules */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Automation Rules</Text>
              <MaterialIcons name="smart-toy" size={24} color={Colors.accent} />
            </View>
            
            {automationRules.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="psychology" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyStateText}>No automation rules configured</Text>
                <Text style={styles.emptyStateSubtext}>
                  Set up automated trading rules in Settings to enhance your trading strategy
                </Text>
              </View>
            ) : (
              <View style={styles.rulesContainer}>
                {automationRules.map((rule) => (
                  <View key={rule.id} style={styles.ruleCard}>
                    <View style={styles.ruleHeader}>
                      <View style={styles.ruleInfo}>
                        <Text style={styles.ruleName}>{rule.name}</Text>
                        <Text style={styles.ruleDescription}>{rule.description}</Text>
                      </View>
                      <View style={[styles.ruleStatus, { 
                        backgroundColor: rule.isActive ? Colors.bullish + '20' : Colors.bearish + '20' 
                      }]}>
                        <MaterialIcons 
                          name={rule.isActive ? "play-circle-filled" : "pause-circle-filled"} 
                          size={16} 
                          color={rule.isActive ? Colors.bullish : Colors.bearish} 
                        />
                        <Text style={[styles.ruleStatusText, {
                          color: rule.isActive ? Colors.bullish : Colors.bearish
                        }]}>
                          {rule.isActive ? 'Active' : 'Paused'}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.ruleMetrics}>
                      <View style={styles.ruleMetric}>
                        <Text style={styles.ruleMetricLabel}>Triggers</Text>
                        <Text style={styles.ruleMetricValue}>
                          {Math.floor(Math.random() * 10) + 1}
                        </Text>
                      </View>
                      <View style={styles.ruleMetric}>
                        <Text style={styles.ruleMetricLabel}>Success Rate</Text>
                        <Text style={styles.ruleMetricValue}>
                          {(Math.random() * 30 + 60).toFixed(0)}%
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Market Sentiment */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Market Sentiment Analysis</Text>
              <MaterialIcons name="psychology" size={24} color={Colors.primary} />
            </View>
            
            <View style={styles.sentimentContainer}>
              <View style={styles.sentimentMetric}>
                <View style={styles.sentimentIcon}>
                  <MaterialIcons name="trending-up" size={24} color={Colors.bullish} />
                </View>
                <Text style={styles.sentimentLabel}>Bull Strength</Text>
                <Text style={styles.sentimentValue}>{Math.max(0, indicators.rsi - 50).toFixed(0)}%</Text>
              </View>
              
              <View style={styles.sentimentMetric}>
                <View style={styles.sentimentIcon}>
                  <MaterialIcons name="trending-down" size={24} color={Colors.bearish} />
                </View>
                <Text style={styles.sentimentLabel}>Bear Strength</Text>
                <Text style={styles.sentimentValue}>{Math.max(0, 50 - indicators.rsi).toFixed(0)}%</Text>
              </View>
              
              <View style={styles.sentimentMetric}>
                <View style={styles.sentimentIcon}>
                  <MaterialIcons name="horizontal-rule" size={24} color={Colors.textMuted} />
                </View>
                <Text style={styles.sentimentLabel}>Neutral Zone</Text>
                <Text style={styles.sentimentValue}>
                  {indicators.rsi >= 45 && indicators.rsi <= 55 ? 'Yes' : 'No'}
                </Text>
              </View>
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
  dashboardCard: {
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 8,
  },
  dashboardGradient: {
    borderRadius: 16,
    padding: 20,
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  dashboardTitle: {
    ...Typography.h5,
    color: Colors.textPrimary,
  },
  refreshButton: {
    borderColor: Colors.primary,
  },
  indicatorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  indicatorItem: {
    flex: 1,
    alignItems: 'center',
  },
  indicatorDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  indicatorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  indicatorContent: {
    alignItems: 'center',
  },
  indicatorLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  indicatorValue: {
    ...Typography.h6,
    color: Colors.textPrimary,
    ...Typography.number,
    marginBottom: 4,
  },
  indicatorStatus: {
    ...Typography.caption,
    color: Colors.textMuted,
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
    marginBottom: 20,
  },
  cardTitle: {
    ...Typography.h6,
    color: Colors.textPrimary,
  },
  signalsContainer: {
    gap: 16,
  },
  signalCard: {
    backgroundColor: Colors.cardElevated,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  signalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  signalType: {
    ...Typography.body2,
    color: Colors.textPrimary,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  signalChip: {
    height: 24,
  },
  signalChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  signalDescription: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  fibonacciContainer: {
    marginTop: 8,
  },
  fibonacciRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fibonacciLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    width: 60,
    fontWeight: '500',
  },
  fibonacciBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginHorizontal: 12,
  },
  fibonacciBar: {
    height: 6,
    borderRadius: 3,
  },
  fibonacciValue: {
    ...Typography.caption,
    color: Colors.textPrimary,
    ...Typography.number,
    width: 80,
    textAlign: 'right',
  },
  fibonacciSummary: {
    backgroundColor: Colors.cardElevated,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  fibonacciSummaryText: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    ...Typography.h6,
    color: Colors.textMuted,
    marginTop: 16,
  },
  emptyStateSubtext: {
    ...Typography.body2,
    color: Colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  rulesContainer: {
    gap: 16,
  },
  ruleCard: {
    backgroundColor: Colors.cardElevated,
    padding: 16,
    borderRadius: 8,
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ruleInfo: {
    flex: 1,
    marginRight: 12,
  },
  ruleName: {
    ...Typography.body1,
    color: Colors.textPrimary,
    fontWeight: '500',
    marginBottom: 4,
  },
  ruleDescription: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  ruleStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ruleStatusText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  ruleMetrics: {
    flexDirection: 'row',
    gap: 24,
  },
  ruleMetric: {
    alignItems: 'center',
  },
  ruleMetricLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  ruleMetricValue: {
    ...Typography.body2,
    color: Colors.textPrimary,
    fontWeight: '500',
    marginTop: 2,
  },
  sentimentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  sentimentMetric: {
    alignItems: 'center',
    flex: 1,
  },
  sentimentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.cardElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  sentimentLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  sentimentValue: {
    ...Typography.body1,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
});