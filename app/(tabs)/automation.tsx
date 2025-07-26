import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, TextInput, Switch, Chip, Divider, ProgressBar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTrading } from '../../hooks/useTrading';
import { Colors, Gradients } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

interface AutomationStrategy {
  id: string;
  name: string;
  isActive: boolean;
  indicator: 'RSI' | 'MACD' | 'MA' | 'BB' | 'STOCH' | 'ADX';
  symbol: string;
  timeframe: string;
  entryCondition: string;
  exitCondition: string;
  tradeType: 'BUY' | 'SELL' | 'BOTH';
  positionSize: number;
  stopLoss?: number;
  takeProfit?: number;
  createdAt: Date;
  triggeredCount: number;
  successRate: number;
  totalProfit: number;
}

export default function Automation() {
  const { 
    selectedSymbol, 
    setSelectedSymbol, 
    indicators, 
    realTimeData, 
    mt5Config,
    automationStrategies,
    addAutomationStrategy,
    toggleAutomationStrategy,
    deleteAutomationStrategy,
    automationStatus,
    startAutomation,
    stopAutomation
  } = useTrading();

  const [showCreateStrategy, setShowCreateStrategy] = useState(false);
  const [newStrategy, setNewStrategy] = useState({
    name: '',
    indicator: 'RSI' as const,
    symbol: selectedSymbol,
    timeframe: '1H',
    entryCondition: '',
    exitCondition: '',
    tradeType: 'BOTH' as const,
    positionSize: 0.1,
    stopLoss: 0,
    takeProfit: 0,
  });

  const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];
  const timeframes = ['5M', '15M', '1H', '4H', '1D'];
  const indicatorOptions = [
    { key: 'RSI', label: 'RSI (Relative Strength Index)', icon: 'speed' },
    { key: 'MACD', label: 'MACD (Moving Average Convergence)', icon: 'trending-up' },
    { key: 'MA', label: 'Moving Averages', icon: 'timeline' },
    { key: 'BB', label: 'Bollinger Bands', icon: 'architecture' },
    { key: 'STOCH', label: 'Stochastic Oscillator', icon: 'waves' },
    { key: 'ADX', label: 'Average Directional Index', icon: 'insights' },
  ];

  const getIndicatorPresets = (indicator: string) => {
    switch (indicator) {
      case 'RSI':
        return {
          entry: 'RSI < 30 (Oversold)',
          exit: 'RSI > 70 (Overbought)',
          description: 'Buy when oversold, sell when overbought'
        };
      case 'MACD':
        return {
          entry: 'MACD Line crosses above Signal Line',
          exit: 'MACD Line crosses below Signal Line',
          description: 'Follow MACD crossover signals'
        };
      case 'MA':
        return {
          entry: 'Price crosses above Moving Average',
          exit: 'Price crosses below Moving Average',
          description: 'Trend following with moving averages'
        };
      case 'BB':
        return {
          entry: 'Price touches lower Bollinger Band',
          exit: 'Price touches upper Bollinger Band',
          description: 'Mean reversion using Bollinger Bands'
        };
      case 'STOCH':
        return {
          entry: 'Stochastic < 20 and rising',
          exit: 'Stochastic > 80 and falling',
          description: 'Momentum-based entries and exits'
        };
      case 'ADX':
        return {
          entry: 'ADX > 25 with strong trend',
          exit: 'ADX < 20 or trend weakening',
          description: 'Trade strong trending markets only'
        };
      default:
        return { entry: '', exit: '', description: '' };
    }
  };

  const handleIndicatorChange = (indicator: string) => {
    const presets = getIndicatorPresets(indicator);
    setNewStrategy(prev => ({
      ...prev,
      indicator: indicator as any,
      entryCondition: presets.entry,
      exitCondition: presets.exit,
    }));
  };

  const handleCreateStrategy = () => {
    if (!newStrategy.name.trim()) {
      const message = 'Please enter a strategy name';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Error', message);
      }
      return;
    }

    if (!newStrategy.entryCondition.trim() || !newStrategy.exitCondition.trim()) {
      const message = 'Please define both entry and exit conditions';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Error', message);
      }
      return;
    }

    if (newStrategy.positionSize <= 0) {
      const message = 'Position size must be greater than 0';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Error', message);
      }
      return;
    }

    addAutomationStrategy({
      ...newStrategy,
      id: Date.now().toString(),
      isActive: false,
      createdAt: new Date(),
      triggeredCount: 0,
      successRate: 0,
      totalProfit: 0,
    });

    // Reset form
    setNewStrategy({
      name: '',
      indicator: 'RSI',
      symbol: selectedSymbol,
      timeframe: '1H',
      entryCondition: '',
      exitCondition: '',
      tradeType: 'BOTH',
      positionSize: 0.1,
      stopLoss: 0,
      takeProfit: 0,
    });
    setShowCreateStrategy(false);

    const message = 'Automation strategy created successfully!';
    if (Platform.OS === 'web') {
      alert(message);
    } else {
      Alert.alert('Success', message);
    }
  };

  const handleDeleteStrategy = (strategyId: string) => {
    const message = 'Are you sure you want to delete this automation strategy?';
    if (Platform.OS === 'web') {
      if (confirm(message)) {
        deleteAutomationStrategy(strategyId);
      }
    } else {
      Alert.alert('Confirm Delete', message, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteAutomationStrategy(strategyId) }
      ]);
    }
  };

  const activeStrategies = automationStrategies.filter(s => s.isActive);
  const totalTriggered = automationStrategies.reduce((sum, s) => sum + s.triggeredCount, 0);
  const averageSuccessRate = automationStrategies.length > 0 
    ? automationStrategies.reduce((sum, s) => sum + s.successRate, 0) / automationStrategies.length 
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={Gradients.header}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Trading Automation</Text>
            <Text style={styles.subtitle}>Indicator-based trading strategies</Text>
          </View>
          <View style={styles.headerActions}>
            <View style={[styles.automationStatus, { 
              backgroundColor: automationStatus.isRunning ? Colors.bullish + '20' : Colors.textMuted + '20' 
            }]}>
              <MaterialIcons 
                name={automationStatus.isRunning ? "play-circle-filled" : "pause-circle-filled"} 
                size={16} 
                color={automationStatus.isRunning ? Colors.bullish : Colors.textMuted} 
              />
              <Text style={[styles.automationStatusText, { 
                color: automationStatus.isRunning ? Colors.bullish : Colors.textMuted 
              }]}>
                {automationStatus.isRunning ? 'Active' : 'Inactive'}
              </Text>
            </View>
            <MaterialIcons name="smart-toy" size={28} color={Colors.primary} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Automation Control Panel */}
        <Card style={styles.controlCard}>
          <LinearGradient
            colors={[Colors.primary + '10', Colors.surface]}
            style={styles.controlGradient}
          >
            <View style={styles.controlHeader}>
              <Text style={styles.controlTitle}>Automation Engine</Text>
              <Text style={styles.controlSubtitle}>
                {activeStrategies.length} active strategies • {totalTriggered} total triggers
              </Text>
            </View>

            <View style={styles.controlStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{activeStrategies.length}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{automationStrategies.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: Colors.bullish }]}>
                  {averageSuccessRate.toFixed(0)}%
                </Text>
                <Text style={styles.statLabel}>Success</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { 
                  color: mt5Config.connected ? Colors.bullish : Colors.bearish 
                }]}>
                  {mt5Config.connected ? 'Live' : 'Demo'}
                </Text>
                <Text style={styles.statLabel}>Mode</Text>
              </View>
            </View>

            <View style={styles.controlButtons}>
              <Button
                mode="contained"
                onPress={automationStatus.isRunning ? stopAutomation : startAutomation}
                style={[styles.controlButton, { 
                  backgroundColor: automationStatus.isRunning ? Colors.bearish : Colors.bullish 
                }]}
                textColor={Colors.background}
                icon={automationStatus.isRunning ? "stop" : "play-arrow"}
                disabled={activeStrategies.length === 0}
              >
                {automationStatus.isRunning ? 'Stop Automation' : 'Start Automation'}
              </Button>
              
              <Button
                mode="outlined"
                onPress={() => setShowCreateStrategy(true)}
                style={styles.createButton}
                textColor={Colors.primary}
                icon="add"
              >
                New Strategy
              </Button>
            </View>
          </LinearGradient>
        </Card>

        {/* Create Strategy Modal */}
        {showCreateStrategy && (
          <Card style={styles.createCard}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.sectionHeader}>
                <Text style={styles.cardTitle}>Create Automation Strategy</Text>
                <Button
                  mode="text"
                  onPress={() => setShowCreateStrategy(false)}
                  textColor={Colors.textMuted}
                  compact
                >
                  Cancel
                </Button>
              </View>

              <TextInput
                label="Strategy Name"
                value={newStrategy.name}
                onChangeText={(text) => setNewStrategy(prev => ({ ...prev, name: text }))}
                mode="outlined"
                style={styles.input}
                placeholder="e.g., RSI Oversold Recovery"
                theme={{
                  colors: {
                    primary: Colors.primary,
                    onSurface: Colors.textPrimary,
                    outline: Colors.border,
                    surface: Colors.inputBackground,
                  }
                }}
                textColor={Colors.textPrimary}
              />

              <View style={styles.selectionContainer}>
                <Text style={styles.selectionLabel}>Technical Indicator</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  style={styles.chipScroll}
                >
                  {indicatorOptions.map((option) => (
                    <Chip
                      key={option.key}
                      selected={newStrategy.indicator === option.key}
                      onPress={() => handleIndicatorChange(option.key)}
                      style={[
                        styles.chip,
                        newStrategy.indicator === option.key && styles.selectedChip
                      ]}
                      textStyle={[
                        styles.chipText,
                        newStrategy.indicator === option.key && styles.selectedChipText
                      ]}
                      icon={option.icon}
                    >
                      {option.key}
                    </Chip>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.rowContainer}>
                <View style={styles.halfWidth}>
                  <Text style={styles.selectionLabel}>Symbol</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    style={styles.chipScroll}
                  >
                    {symbols.map((symbol) => (
                      <Chip
                        key={symbol}
                        selected={newStrategy.symbol === symbol}
                        onPress={() => setNewStrategy(prev => ({ ...prev, symbol }))}
                        style={[
                          styles.smallChip,
                          newStrategy.symbol === symbol && styles.selectedChip
                        ]}
                        textStyle={[
                          styles.chipText,
                          newStrategy.symbol === symbol && styles.selectedChipText
                        ]}
                      >
                        {symbol}
                      </Chip>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.halfWidth}>
                  <Text style={styles.selectionLabel}>Timeframe</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    style={styles.chipScroll}
                  >
                    {timeframes.map((timeframe) => (
                      <Chip
                        key={timeframe}
                        selected={newStrategy.timeframe === timeframe}
                        onPress={() => setNewStrategy(prev => ({ ...prev, timeframe }))}
                        style={[
                          styles.smallChip,
                          newStrategy.timeframe === timeframe && styles.selectedChip
                        ]}
                        textStyle={[
                          styles.chipText,
                          newStrategy.timeframe === timeframe && styles.selectedChipText
                        ]}
                      >
                        {timeframe}
                      </Chip>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <TextInput
                label="Entry Condition"
                value={newStrategy.entryCondition}
                onChangeText={(text) => setNewStrategy(prev => ({ ...prev, entryCondition: text }))}
                mode="outlined"
                multiline
                numberOfLines={2}
                style={styles.input}
                theme={{
                  colors: {
                    primary: Colors.primary,
                    onSurface: Colors.textPrimary,
                    outline: Colors.border,
                    surface: Colors.inputBackground,
                  }
                }}
                textColor={Colors.textPrimary}
              />

              <TextInput
                label="Exit Condition"
                value={newStrategy.exitCondition}
                onChangeText={(text) => setNewStrategy(prev => ({ ...prev, exitCondition: text }))}
                mode="outlined"
                multiline
                numberOfLines={2}
                style={styles.input}
                theme={{
                  colors: {
                    primary: Colors.primary,
                    onSurface: Colors.textPrimary,
                    outline: Colors.border,
                    surface: Colors.inputBackground,
                  }
                }}
                textColor={Colors.textPrimary}
              />

              <View style={styles.rowContainer}>
                <View style={styles.halfWidth}>
                  <TextInput
                    label="Position Size"
                    value={newStrategy.positionSize.toString()}
                    onChangeText={(text) => setNewStrategy(prev => ({ 
                      ...prev, 
                      positionSize: parseFloat(text) || 0 
                    }))}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.input}
                    theme={{
                      colors: {
                        primary: Colors.primary,
                        onSurface: Colors.textPrimary,
                        outline: Colors.border,
                        surface: Colors.inputBackground,
                      }
                    }}
                    textColor={Colors.textPrimary}
                  />
                </View>

                <View style={styles.halfWidth}>
                  <Text style={styles.selectionLabel}>Trade Type</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    style={styles.chipScroll}
                  >
                    {['BUY', 'SELL', 'BOTH'].map((type) => (
                      <Chip
                        key={type}
                        selected={newStrategy.tradeType === type}
                        onPress={() => setNewStrategy(prev => ({ 
                          ...prev, 
                          tradeType: type as any 
                        }))}
                        style={[
                          styles.smallChip,
                          newStrategy.tradeType === type && styles.selectedChip
                        ]}
                        textStyle={[
                          styles.chipText,
                          newStrategy.tradeType === type && styles.selectedChipText
                        ]}
                      >
                        {type}
                      </Chip>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <View style={styles.rowContainer}>
                <View style={styles.halfWidth}>
                  <TextInput
                    label="Stop Loss (pips)"
                    value={newStrategy.stopLoss?.toString() || ''}
                    onChangeText={(text) => setNewStrategy(prev => ({ 
                      ...prev, 
                      stopLoss: parseFloat(text) || undefined 
                    }))}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.input}
                    placeholder="Optional"
                    theme={{
                      colors: {
                        primary: Colors.primary,
                        onSurface: Colors.textPrimary,
                        outline: Colors.border,
                        surface: Colors.inputBackground,
                      }
                    }}
                    textColor={Colors.textPrimary}
                  />
                </View>

                <View style={styles.halfWidth}>
                  <TextInput
                    label="Take Profit (pips)"
                    value={newStrategy.takeProfit?.toString() || ''}
                    onChangeText={(text) => setNewStrategy(prev => ({ 
                      ...prev, 
                      takeProfit: parseFloat(text) || undefined 
                    }))}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.input}
                    placeholder="Optional"
                    theme={{
                      colors: {
                        primary: Colors.primary,
                        onSurface: Colors.textPrimary,
                        outline: Colors.border,
                        surface: Colors.inputBackground,
                      }
                    }}
                    textColor={Colors.textPrimary}
                  />
                </View>
              </View>

              <Button
                mode="contained"
                onPress={handleCreateStrategy}
                style={styles.createStrategyButton}
                buttonColor={Colors.primary}
                textColor={Colors.background}
                icon="check"
              >
                Create Strategy
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Active Strategies */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Automation Strategies</Text>
              <Text style={styles.sectionSubtitle}>
                {automationStrategies.length} strategies
              </Text>
            </View>

            {automationStrategies.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="psychology" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyStateText}>No automation strategies</Text>
                <Text style={styles.emptyStateSubtext}>
                  Create your first strategy to start automated trading
                </Text>
              </View>
            ) : (
              <View style={styles.strategiesContainer}>
                {automationStrategies.map((strategy, index) => (
                  <View key={strategy.id}>
                    <View style={styles.strategyItem}>
                      <View style={styles.strategyHeader}>
                        <View style={styles.strategyInfo}>
                          <View style={styles.strategyTitleRow}>
                            <Text style={styles.strategyName}>{strategy.name}</Text>
                            <View style={[styles.indicatorBadge, { 
                              backgroundColor: Colors.primary + '20' 
                            }]}>
                              <Text style={[styles.indicatorBadgeText, { 
                                color: Colors.primary 
                              }]}>
                                {strategy.indicator}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.strategyDetails}>
                            {strategy.symbol} • {strategy.timeframe} • {strategy.tradeType}
                          </Text>
                          <Text style={styles.strategyCondition}>
                            Entry: {strategy.entryCondition}
                          </Text>
                        </View>
                        <Switch
                          value={strategy.isActive}
                          onValueChange={() => toggleAutomationStrategy(strategy.id)}
                          thumbColor={strategy.isActive ? Colors.bullish : Colors.textMuted}
                          trackColor={{
                            false: Colors.border,
                            true: Colors.bullish + '40'
                          }}
                        />
                      </View>

                      <View style={styles.strategyStats}>
                        <View style={styles.statRow}>
                          <View style={styles.strategyStat}>
                            <Text style={styles.strategyStatValue}>
                              {strategy.triggeredCount}
                            </Text>
                            <Text style={styles.strategyStatLabel}>Triggers</Text>
                          </View>
                          <View style={styles.strategyStat}>
                            <Text style={[styles.strategyStatValue, { 
                              color: strategy.successRate >= 60 ? Colors.bullish : 
                                     strategy.successRate >= 40 ? Colors.primary : Colors.bearish 
                            }]}>
                              {strategy.successRate.toFixed(0)}%
                            </Text>
                            <Text style={styles.strategyStatLabel}>Success</Text>
                          </View>
                          <View style={styles.strategyStat}>
                            <Text style={[styles.strategyStatValue, { 
                              color: strategy.totalProfit >= 0 ? Colors.bullish : Colors.bearish 
                            }]}>
                              {strategy.totalProfit >= 0 ? '+' : ''}${strategy.totalProfit.toFixed(2)}
                            </Text>
                            <Text style={styles.strategyStatLabel}>P&L</Text>
                          </View>
                          <Button
                            mode="text"
                            onPress={() => handleDeleteStrategy(strategy.id)}
                            textColor={Colors.bearish}
                            compact
                            icon="delete"
                          >
                            Delete
                          </Button>
                        </View>
                      </View>
                    </View>
                    {index < automationStrategies.length - 1 && <Divider style={styles.divider} />}
                  </View>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Current Market Conditions */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Market Conditions</Text>
              <MaterialIcons name="visibility" size={24} color={Colors.secondary} />
            </View>

            <View style={styles.conditionsGrid}>
              <View style={styles.conditionItem}>
                <MaterialIcons name="speed" size={20} color={Colors.primary} />
                <Text style={styles.conditionLabel}>RSI</Text>
                <Text style={styles.conditionValue}>{indicators.rsi.toFixed(1)}</Text>
              </View>
              <View style={styles.conditionItem}>
                <MaterialIcons name="trending-up" size={20} color={Colors.secondary} />
                <Text style={styles.conditionLabel}>MACD</Text>
                <Text style={styles.conditionValue}>{indicators.macd.signal.toFixed(4)}</Text>
              </View>
              <View style={styles.conditionItem}>
                <MaterialIcons name="timeline" size={20} color={Colors.accent} />
                <Text style={styles.conditionLabel}>MA</Text>
                <Text style={styles.conditionValue}>{indicators.movingAverage.toFixed(4)}</Text>
              </View>
              <View style={styles.conditionItem}>
                <MaterialIcons name="show-chart" size={20} color={Colors.bullish} />
                <Text style={styles.conditionLabel}>Price</Text>
                <Text style={styles.conditionValue}>
                  {realTimeData.symbols[selectedSymbol]?.bid.toFixed(5) || 'N/A'}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  automationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  automationStatusText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  controlCard: {
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 8,
  },
  controlGradient: {
    borderRadius: 16,
    padding: 20,
  },
  controlHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  controlTitle: {
    ...Typography.h5,
    color: Colors.textPrimary,
  },
  controlSubtitle: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  controlStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...Typography.h4,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 4,
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    flex: 2,
    borderRadius: 12,
  },
  createButton: {
    flex: 1,
    borderRadius: 12,
    borderColor: Colors.primary,
  },
  createCard: {
    marginBottom: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    elevation: 4,
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
  sectionSubtitle: {
    ...Typography.body2,
    color: Colors.textMuted,
  },
  input: {
    marginBottom: 16,
    backgroundColor: Colors.inputBackground,
  },
  selectionContainer: {
    marginBottom: 16,
  },
  selectionLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: 8,
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
  smallChip: {
    marginRight: 8,
    backgroundColor: Colors.cardElevated,
    height: 32,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
  },
  createStrategyButton: {
    marginTop: 8,
    borderRadius: 12,
  },
  strategiesContainer: {
    gap: 0,
  },
  strategyItem: {
    paddingVertical: 16,
  },
  strategyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  strategyInfo: {
    flex: 1,
    marginRight: 16,
  },
  strategyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  strategyName: {
    ...Typography.body1,
    color: Colors.textPrimary,
    fontWeight: '500',
    marginRight: 8,
  },
  indicatorBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  indicatorBadgeText: {
    ...Typography.caption,
    fontWeight: '600',
    fontSize: 10,
  },
  strategyDetails: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  strategyCondition: {
    ...Typography.body2,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  strategyStats: {
    marginTop: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  strategyStat: {
    alignItems: 'center',
    flex: 1,
  },
  strategyStatValue: {
    ...Typography.body2,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  strategyStatLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  divider: {
    backgroundColor: Colors.border,
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
  },
  conditionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  conditionItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardElevated,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  conditionLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  conditionValue: {
    ...Typography.body2,
    color: Colors.textPrimary,
    fontWeight: '600',
    ...Typography.number,
  },
});