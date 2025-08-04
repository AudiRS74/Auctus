import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, TextInput, Chip, Switch, Divider, ProgressBar } from 'react-native-paper';
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
    automationRules,
    automationStatus,
    startAutomation,
    stopAutomation,
    toggleAutomationRule,
    deleteAutomationRule,
    addAutomationRule,
    mt5Config
  } = useTrading();

  const [strategies, setStrategies] = useState<AutomationStrategy[]>([
    {
      id: '1',
      name: 'RSI Reversal Strategy',
      isActive: true,
      indicator: 'RSI',
      symbol: 'EURUSD',
      timeframe: '1H',
      entryCondition: 'RSI < 30 (Oversold)',
      exitCondition: 'RSI > 70 (Overbought)',
      tradeType: 'BUY',
      positionSize: 0.1,
      stopLoss: 50,
      takeProfit: 100,
      createdAt: new Date(Date.now() - 86400000),
      triggeredCount: 8,
      successRate: 75.0,
      totalProfit: 234.50,
    },
    {
      id: '2',
      name: 'MACD Momentum',
      isActive: false,
      indicator: 'MACD',
      symbol: 'GBPUSD',
      timeframe: '4H',
      entryCondition: 'MACD Signal Cross Above',
      exitCondition: 'MACD Signal Cross Below',
      tradeType: 'BOTH',
      positionSize: 0.2,
      stopLoss: 75,
      takeProfit: 150,
      createdAt: new Date(Date.now() - 172800000),
      triggeredCount: 5,
      successRate: 60.0,
      totalProfit: 89.25,
    },
    {
      id: '3',
      name: 'Moving Average Crossover',
      isActive: true,
      indicator: 'MA',
      symbol: 'USDJPY',
      timeframe: '15M',
      entryCondition: 'Fast MA > Slow MA',
      exitCondition: 'Fast MA < Slow MA',
      tradeType: 'BOTH',
      positionSize: 0.15,
      stopLoss: 30,
      takeProfit: 60,
      createdAt: new Date(Date.now() - 259200000),
      triggeredCount: 12,
      successRate: 66.7,
      totalProfit: 156.75,
    },
  ]);

  // New strategy form state
  const [showNewStrategy, setShowNewStrategy] = useState(false);
  const [newStrategy, setNewStrategy] = useState({
    name: '',
    indicator: 'RSI' as const,
    symbol: 'EURUSD',
    timeframe: '1H',
    tradeType: 'BUY' as const,
    positionSize: '0.1',
    stopLoss: '',
    takeProfit: '',
  });

  // Cross-platform alert state
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onOk?: () => void;
    onCancel?: () => void;
    showCancel?: boolean;
  }>({ visible: false, title: '', message: '' });

  const showAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ visible: true, title, message, onOk });
    } else {
      const Alert = require('react-native').Alert;
      Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
    }
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ 
        visible: true, 
        title, 
        message, 
        onOk: onConfirm, 
        onCancel,
        showCancel: true 
      });
    } else {
      const Alert = require('react-native').Alert;
      Alert.alert(title, message, [
        { text: 'Cancel', style: 'cancel', onPress: onCancel },
        { text: 'OK', onPress: onConfirm }
      ]);
    }
  };

  const handleStartAutomation = () => {
    if (!mt5Config.connected) {
      showAlert('MT5 Not Connected', 'Please connect to MT5 in Settings before starting automation.');
      return;
    }

    const activeStrategies = strategies.filter(s => s.isActive);
    if (activeStrategies.length === 0) {
      showAlert('No Active Strategies', 'Please enable at least one strategy before starting automation.');
      return;
    }

    showConfirm(
      'Start Automation',
      `Start automated trading with ${activeStrategies.length} active strategies? This will begin executing trades automatically.`,
      () => {
        startAutomation();
        showAlert('Automation Started', 'Trading automation is now running. Monitor your strategies in the real-time section.');
      }
    );
  };

  const handleStopAutomation = () => {
    showConfirm(
      'Stop Automation',
      'Are you sure you want to stop automated trading? Current positions will remain open.',
      () => {
        stopAutomation();
        showAlert('Automation Stopped', 'Trading automation has been stopped successfully.');
      }
    );
  };

  const toggleStrategy = (strategyId: string) => {
    setStrategies(prev =>
      prev.map(strategy =>
        strategy.id === strategyId ? { ...strategy, isActive: !strategy.isActive } : strategy
      )
    );
  };

  const deleteStrategy = (strategyId: string) => {
    const strategy = strategies.find(s => s.id === strategyId);
    if (!strategy) return;

    showConfirm(
      'Delete Strategy',
      `Are you sure you want to delete "${strategy.name}"? This action cannot be undone.`,
      () => {
        setStrategies(prev => prev.filter(s => s.id !== strategyId));
        showAlert('Strategy Deleted', 'The strategy has been removed successfully.');
      }
    );
  };

  const handleCreateStrategy = () => {
    if (!newStrategy.name.trim()) {
      showAlert('Validation Error', 'Please enter a strategy name.');
      return;
    }

    const positionSize = parseFloat(newStrategy.positionSize);
    if (isNaN(positionSize) || positionSize <= 0 || positionSize > 10) {
      showAlert('Validation Error', 'Position size must be between 0.01 and 10.00');
      return;
    }

    const strategy: AutomationStrategy = {
      id: Date.now().toString(),
      name: newStrategy.name.trim(),
      isActive: true,
      indicator: newStrategy.indicator,
      symbol: newStrategy.symbol,
      timeframe: newStrategy.timeframe,
      entryCondition: `${newStrategy.indicator} Signal Entry`,
      exitCondition: `${newStrategy.indicator} Signal Exit`,
      tradeType: newStrategy.tradeType,
      positionSize: positionSize,
      stopLoss: newStrategy.stopLoss ? parseFloat(newStrategy.stopLoss) : undefined,
      takeProfit: newStrategy.takeProfit ? parseFloat(newStrategy.takeProfit) : undefined,
      createdAt: new Date(),
      triggeredCount: 0,
      successRate: 0,
      totalProfit: 0,
    };

    setStrategies(prev => [strategy, ...prev]);
    setShowNewStrategy(false);
    setNewStrategy({
      name: '',
      indicator: 'RSI',
      symbol: 'EURUSD',
      timeframe: '1H',
      tradeType: 'BUY',
      positionSize: '0.1',
      stopLoss: '',
      takeProfit: '',
    });

    showAlert('Strategy Created', 'New automation strategy has been created and activated.');
  };

  const getIndicatorColor = (indicator: string) => {
    const colors: { [key: string]: string } = {
      RSI: Colors.primary,
      MACD: Colors.secondary,
      MA: Colors.accent,
      BB: Colors.bullish,
      STOCH: Colors.bearish,
      ADX: '#FF9500',
    };
    return colors[indicator] || Colors.primary;
  };

  const activeStrategies = strategies.filter(s => s.isActive);
  const totalProfit = strategies.reduce((sum, s) => sum + s.totalProfit, 0);
  const avgSuccessRate = strategies.length > 0 
    ? strategies.reduce((sum, s) => sum + s.successRate, 0) / strategies.length 
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={Gradients.header}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Automation</Text>
            <Text style={styles.subtitle}>Smart trading strategies</Text>
          </View>
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
              {automationStatus.isRunning ? 'RUNNING' : 'STOPPED'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Automation Control */}
        <Card style={styles.controlCard}>
          <LinearGradient
            colors={[Colors.primary + '10', Colors.surface]}
            style={styles.controlGradient}
          >
            <View style={styles.controlHeader}>
              <Text style={styles.controlTitle}>Automation Control</Text>
              <MaterialIcons name="smart-toy" size={24} color={Colors.primary} />
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{activeStrategies.length}</Text>
                <Text style={styles.statLabel}>Active Strategies</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: totalProfit >= 0 ? Colors.bullish : Colors.bearish }]}>
                  ${totalProfit.toFixed(2)}
                </Text>
                <Text style={styles.statLabel}>Total Profit</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{avgSuccessRate.toFixed(1)}%</Text>
                <Text style={styles.statLabel}>Avg Success Rate</Text>
              </View>
            </View>

            <View style={styles.controlButtons}>
              {!automationStatus.isRunning ? (
                <Button
                  mode="contained"
                  onPress={handleStartAutomation}
                  style={styles.startButton}
                  buttonColor={Colors.bullish}
                  textColor={Colors.background}
                  icon="play-arrow"
                >
                  Start Automation
                </Button>
              ) : (
                <Button
                  mode="contained"
                  onPress={handleStopAutomation}
                  style={styles.stopButton}
                  buttonColor={Colors.bearish}
                  textColor={Colors.background}
                  icon="stop"
                >
                  Stop Automation
                </Button>
              )}

              <Button
                mode="outlined"
                onPress={() => setShowNewStrategy(true)}
                style={styles.newStrategyButton}
                textColor={Colors.primary}
                icon="add"
              >
                New Strategy
              </Button>
            </View>
          </LinearGradient>
        </Card>

        {/* Connection Status */}
        {!mt5Config.connected && (
          <Card style={styles.warningCard}>
            <Card.Content style={styles.warningContent}>
              <View style={styles.warningHeader}>
                <MaterialIcons name="warning" size={24} color={Colors.accent} />
                <Text style={styles.warningTitle}>MT5 Not Connected</Text>
              </View>
              <Text style={styles.warningText}>
                Connect to MT5 in Settings to enable automated trading. 
                Strategies will be simulated without live connection.
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Trading Strategies */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Trading Strategies</Text>
              <Text style={styles.strategiesCount}>{strategies.length} strategies</Text>
            </View>

            {strategies.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="psychology" size={64} color={Colors.textMuted} />
                <Text style={styles.emptyStateText}>No strategies configured</Text>
                <Text style={styles.emptyStateSubtext}>
                  Create your first automation strategy to begin
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => setShowNewStrategy(true)}
                  style={styles.emptyStateButton}
                  textColor={Colors.primary}
                  icon="add"
                >
                  Create Strategy
                </Button>
              </View>
            ) : (
              <View style={styles.strategiesContainer}>
                {strategies.map((strategy, index) => (
                  <View key={strategy.id}>
                    <View style={styles.strategyCard}>
                      <View style={styles.strategyHeader}>
                        <View style={styles.strategyInfo}>
                          <View style={styles.strategyTitleRow}>
                            <Text style={styles.strategyName}>{strategy.name}</Text>
                            <Chip 
                              style={[styles.indicatorChip, { 
                                backgroundColor: getIndicatorColor(strategy.indicator) + '20' 
                              }]}
                              textStyle={[styles.indicatorChipText, { 
                                color: getIndicatorColor(strategy.indicator) 
                              }]}
                            >
                              {strategy.indicator}
                            </Chip>
                          </View>
                          <View style={styles.strategyDetails}>
                            <Text style={styles.strategyDetail}>
                              {strategy.symbol} • {strategy.timeframe} • {strategy.tradeType}
                            </Text>
                            <Text style={styles.strategyCondition}>
                              Entry: {strategy.entryCondition}
                            </Text>
                          </View>
                        </View>
                        <Switch
                          value={strategy.isActive}
                          onValueChange={() => toggleStrategy(strategy.id)}
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
                            <Text style={styles.strategyStatValue}>{strategy.triggeredCount}</Text>
                            <Text style={styles.strategyStatLabel}>Triggers</Text>
                          </View>
                          <View style={styles.strategyStat}>
                            <Text style={[styles.strategyStatValue, { 
                              color: strategy.successRate >= 60 ? Colors.bullish : strategy.successRate >= 40 ? Colors.primary : Colors.bearish 
                            }]}>
                              {strategy.successRate.toFixed(1)}%
                            </Text>
                            <Text style={styles.strategyStatLabel}>Success</Text>
                          </View>
                          <View style={styles.strategyStat}>
                            <Text style={[styles.strategyStatValue, { 
                              color: strategy.totalProfit >= 0 ? Colors.bullish : Colors.bearish 
                            }]}>
                              ${strategy.totalProfit.toFixed(0)}
                            </Text>
                            <Text style={styles.strategyStatLabel}>Profit</Text>
                          </View>
                        </View>

                        <ProgressBar 
                          progress={strategy.successRate / 100} 
                          color={strategy.successRate >= 60 ? Colors.bullish : strategy.successRate >= 40 ? Colors.primary : Colors.bearish}
                          style={styles.strategyProgressBar}
                        />
                      </View>

                      <View style={styles.strategyActions}>
                        <Button
                          mode="text"
                          onPress={() => deleteStrategy(strategy.id)}
                          textColor={Colors.bearish}
                          compact
                          icon="delete"
                        >
                          Delete
                        </Button>
                        
                        <View style={styles.strategyActionInfo}>
                          <Text style={styles.strategyCreatedDate}>
                            Created {strategy.createdAt.toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {index < strategies.length - 1 && <Divider style={styles.strategyDivider} />}
                  </View>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* New Strategy Modal */}
      <Modal
        visible={showNewStrategy}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNewStrategy(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Button
              mode="text"
              onPress={() => setShowNewStrategy(false)}
              textColor={Colors.textSecondary}
              compact
            >
              Cancel
            </Button>
            <Text style={styles.modalTitle}>New Strategy</Text>
            <Button
              mode="text"
              onPress={handleCreateStrategy}
              textColor={Colors.primary}
              compact
            >
              Create
            </Button>
          </View>

          <ScrollView style={styles.modalContent}>
            <TextInput
              label="Strategy Name *"
              value={newStrategy.name}
              onChangeText={(text) => setNewStrategy(prev => ({ ...prev, name: text }))}
              mode="outlined"
              style={styles.modalInput}
              placeholder="e.g., RSI Reversal EURUSD"
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

            <View style={styles.chipSection}>
              <Text style={styles.chipSectionTitle}>Technical Indicator</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {['RSI', 'MACD', 'MA', 'BB', 'STOCH', 'ADX'].map((indicator) => (
                  <Chip
                    key={indicator}
                    selected={newStrategy.indicator === indicator}
                    onPress={() => setNewStrategy(prev => ({ ...prev, indicator: indicator as any }))}
                    style={[
                      styles.selectionChip,
                      newStrategy.indicator === indicator && styles.selectedChip
                    ]}
                    textStyle={[
                      styles.selectionChipText,
                      newStrategy.indicator === indicator && styles.selectedChipText
                    ]}
                  >
                    {indicator}
                  </Chip>
                ))}
              </ScrollView>
            </View>

            <View style={styles.chipSection}>
              <Text style={styles.chipSectionTitle}>Symbol</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'].map((symbol) => (
                  <Chip
                    key={symbol}
                    selected={newStrategy.symbol === symbol}
                    onPress={() => setNewStrategy(prev => ({ ...prev, symbol }))}
                    style={[
                      styles.selectionChip,
                      newStrategy.symbol === symbol && styles.selectedChip
                    ]}
                    textStyle={[
                      styles.selectionChipText,
                      newStrategy.symbol === symbol && styles.selectedChipText
                    ]}
                  >
                    {symbol}
                  </Chip>
                ))}
              </ScrollView>
            </View>

            <View style={styles.chipSection}>
              <Text style={styles.chipSectionTitle}>Timeframe</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {['5M', '15M', '1H', '4H', '1D'].map((timeframe) => (
                  <Chip
                    key={timeframe}
                    selected={newStrategy.timeframe === timeframe}
                    onPress={() => setNewStrategy(prev => ({ ...prev, timeframe }))}
                    style={[
                      styles.selectionChip,
                      newStrategy.timeframe === timeframe && styles.selectedChip
                    ]}
                    textStyle={[
                      styles.selectionChipText,
                      newStrategy.timeframe === timeframe && styles.selectedChipText
                    ]}
                  >
                    {timeframe}
                  </Chip>
                ))}
              </ScrollView>
            </View>

            <View style={styles.chipSection}>
              <Text style={styles.chipSectionTitle}>Trade Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {['BUY', 'SELL', 'BOTH'].map((type) => (
                  <Chip
                    key={type}
                    selected={newStrategy.tradeType === type}
                    onPress={() => setNewStrategy(prev => ({ ...prev, tradeType: type as any }))}
                    style={[
                      styles.selectionChip,
                      newStrategy.tradeType === type && styles.selectedChip
                    ]}
                    textStyle={[
                      styles.selectionChipText,
                      newStrategy.tradeType === type && styles.selectedChipText
                    ]}
                  >
                    {type}
                  </Chip>
                ))}
              </ScrollView>
            </View>

            <TextInput
              label="Position Size (lots) *"
              value={newStrategy.positionSize}
              onChangeText={(text) => setNewStrategy(prev => ({ ...prev, positionSize: text }))}
              mode="outlined"
              keyboardType="decimal-pad"
              style={styles.modalInput}
              placeholder="0.1"
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

            <View style={styles.inputRow}>
              <TextInput
                label="Stop Loss (pips)"
                value={newStrategy.stopLoss}
                onChangeText={(text) => setNewStrategy(prev => ({ ...prev, stopLoss: text }))}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.modalInput, { flex: 1, marginRight: 8 }]}
                placeholder="50"
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
                label="Take Profit (pips)"
                value={newStrategy.takeProfit}
                onChangeText={(text) => setNewStrategy(prev => ({ ...prev, takeProfit: text }))}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.modalInput, { flex: 1, marginLeft: 8 }]}
                placeholder="100"
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
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Cross-platform Alert Modal */}
      {Platform.OS === 'web' && (
        <Modal visible={alertConfig.visible} transparent animationType="fade">
          <View style={styles.alertOverlay}>
            <View style={styles.alertContainer}>
              <Text style={styles.alertTitle}>{alertConfig.title}</Text>
              <Text style={styles.alertMessage}>{alertConfig.message}</Text>
              <View style={styles.alertButtons}>
                {alertConfig.showCancel && (
                  <TouchableOpacity
                    style={[styles.alertButton, styles.alertCancelButton]}
                    onPress={() => {
                      alertConfig.onCancel?.();
                      setAlertConfig(prev => ({ ...prev, visible: false }));
                    }}
                  >
                    <Text style={styles.alertCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.alertButton, styles.alertOkButton]}
                  onPress={() => {
                    alertConfig.onOk?.();
                    setAlertConfig(prev => ({ ...prev, visible: false }));
                  }}
                >
                  <Text style={styles.alertOkButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
    fontWeight: '700',
    letterSpacing: 0.5,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  controlTitle: {
    ...Typography.h5,
    color: Colors.textPrimary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...Typography.h5,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  startButton: {
    flex: 2,
  },
  stopButton: {
    flex: 2,
  },
  newStrategyButton: {
    flex: 1,
    borderColor: Colors.primary,
  },
  warningCard: {
    marginBottom: 16,
    backgroundColor: Colors.accent + '10',
    borderWidth: 1,
    borderColor: Colors.accent + '30',
  },
  warningContent: {
    paddingVertical: 16,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningTitle: {
    ...Typography.body1,
    color: Colors.accent,
    fontWeight: '600',
    marginLeft: 8,
  },
  warningText: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 20,
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
  strategiesCount: {
    ...Typography.body2,
    color: Colors.textMuted,
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
    marginBottom: 20,
  },
  emptyStateButton: {
    borderColor: Colors.primary,
  },
  strategiesContainer: {
    gap: 0,
  },
  strategyCard: {
    paddingVertical: 16,
  },
  strategyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  strategyInfo: {
    flex: 1,
    marginRight: 16,
  },
  strategyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  strategyName: {
    ...Typography.h6,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 12,
  },
  indicatorChip: {
    height: 28,
  },
  indicatorChipText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '600',
  },
  strategyDetails: {
    gap: 4,
  },
  strategyDetail: {
    ...Typography.body2,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  strategyCondition: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  strategyStats: {
    backgroundColor: Colors.cardElevated,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  strategyStat: {
    alignItems: 'center',
  },
  strategyStatValue: {
    ...Typography.body1,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },
  strategyStatLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  strategyProgressBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  strategyActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  strategyActionInfo: {
    alignItems: 'flex-end',
  },
  strategyCreatedDate: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  strategyDivider: {
    backgroundColor: Colors.border,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    ...Typography.h6,
    color: Colors.textPrimary,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalInput: {
    marginBottom: 16,
    backgroundColor: Colors.inputBackground,
  },
  chipSection: {
    marginBottom: 20,
  },
  chipSectionTitle: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: 12,
    fontWeight: '500',
  },
  chipScroll: {
    marginBottom: 4,
  },
  selectionChip: {
    marginRight: 8,
    backgroundColor: Colors.cardElevated,
  },
  selectedChip: {
    backgroundColor: Colors.primary,
  },
  selectionChipText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  selectedChipText: {
    color: Colors.background,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  // Cross-platform alert styles
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 12,
    minWidth: 300,
    maxWidth: '90%',
    elevation: 8,
  },
  alertTitle: {
    ...Typography.h6,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  alertMessage: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  alertButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  alertButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  alertCancelButton: {
    backgroundColor: Colors.border,
  },
  alertOkButton: {
    backgroundColor: Colors.primary,
  },
  alertCancelButtonText: {
    ...Typography.body2,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  alertOkButtonText: {
    ...Typography.body2,
    color: Colors.background,
    fontWeight: '500',
  },
});