import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity, Platform, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, TextInput, Chip, Switch, Divider, FAB } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTrading } from '../../hooks/useTrading';
import { Colors, Gradients } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { QUICK_ACCESS_SYMBOLS } from '../../constants/Markets';

interface NewStrategy {
  name: string;
  symbol: string;
  indicator: 'RSI' | 'MACD' | 'MA' | 'BB' | 'STOCH' | 'ADX';
  timeframe: string;
  tradeType: 'BUY' | 'SELL' | 'BOTH';
  positionSize: number;
  stopLoss?: number;
  takeProfit?: number;
}

export default function Automation() {
  const {
    automationStrategies,
    automationStatus,
    addAutomationStrategy,
    toggleAutomationStrategy,
    deleteAutomationStrategy,
    startAutomation,
    stopAutomation,
  } = useTrading();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for new strategy
  const [newStrategy, setNewStrategy] = useState<NewStrategy>({
    name: '',
    symbol: 'EURUSD',
    indicator: 'RSI',
    timeframe: '15',
    tradeType: 'BOTH',
    positionSize: 0.01,
    stopLoss: 50,
    takeProfit: 100,
  });

  // Cross-platform alert state
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onOk?: () => void;
  }>({ visible: false, title: '', message: '' });

  const showAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ visible: true, title, message, onOk });
    } else {
      const Alert = require('react-native').Alert;
      Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
    }
  };

  useEffect(() => {
    setError(null);
  }, []);

  const handleCreateStrategy = async () => {
    try {
      if (!newStrategy.name.trim()) {
        showAlert('Validation Error', 'Strategy name is required');
        return;
      }

      if (newStrategy.positionSize <= 0 || newStrategy.positionSize > 10) {
        showAlert('Validation Error', 'Position size must be between 0.01 and 10.00');
        return;
      }

      setLoading(true);

      const strategy = {
        id: Date.now().toString(),
        name: newStrategy.name.trim(),
        isActive: true,
        indicator: newStrategy.indicator,
        symbol: newStrategy.symbol,
        timeframe: newStrategy.timeframe,
        entryCondition: `${newStrategy.indicator} Signal`,
        exitCondition: 'Take Profit / Stop Loss',
        tradeType: newStrategy.tradeType,
        positionSize: newStrategy.positionSize,
        stopLoss: newStrategy.stopLoss,
        takeProfit: newStrategy.takeProfit,
        createdAt: new Date(),
        triggeredCount: 0,
        successRate: 65 + Math.random() * 25, // Mock success rate
        totalProfit: 0,
      };

      addAutomationStrategy(strategy);

      // Reset form
      setNewStrategy({
        name: '',
        symbol: 'EURUSD',
        indicator: 'RSI',
        timeframe: '15',
        tradeType: 'BOTH',
        positionSize: 0.01,
        stopLoss: 50,
        takeProfit: 100,
      });

      setShowCreateModal(false);
      showAlert('Strategy Created', `${strategy.name} has been created and activated successfully`);
    } catch (error) {
      console.error('Create strategy error:', error);
      showAlert('Creation Failed', 'Failed to create strategy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutomation = () => {
    if (automationStatus.isRunning) {
      showAlert(
        'Stop Automation',
        'Are you sure you want to stop all automation strategies?',
        () => {
          stopAutomation();
          showAlert('Automation Stopped', 'All automation strategies have been stopped');
        }
      );
    } else {
      if (automationStatus.activeStrategies === 0) {
        showAlert('No Active Strategies', 'Please create and activate at least one strategy before starting automation');
        return;
      }
      
      startAutomation();
      showAlert('Automation Started', `Started monitoring ${automationStatus.activeStrategies} active strategies`);
    }
  };

  const handleDeleteStrategy = (id: string, name: string) => {
    showAlert(
      'Delete Strategy',
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      () => {
        deleteAutomationStrategy(id);
        showAlert('Strategy Deleted', `${name} has been deleted successfully`);
      }
    );
  };

  const formatTimeframe = (timeframe: string) => {
    const timeframes: { [key: string]: string } = {
      '1': '1M',
      '5': '5M',
      '15': '15M',
      '30': '30M',
      '60': '1H',
      '240': '4H',
      '1D': '1D',
    };
    return timeframes[timeframe] || timeframe;
  };

  const indicators = ['RSI', 'MACD', 'MA', 'BB', 'STOCH', 'ADX'];
  const timeframes = ['1', '5', '15', '30', '60', '240', '1D'];
  const tradeTypes = ['BUY', 'SELL', 'BOTH'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={Gradients.header}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Trading Automation</Text>
            <Text style={styles.subtitle}>Intelligent trading strategies</Text>
          </View>
          <MaterialIcons name="smart-toy" size={28} color={Colors.primary} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Automation Status */}
        <Card style={styles.statusCard}>
          <LinearGradient
            colors={[Colors.primary + '15', Colors.surface]}
            style={styles.statusGradient}
          >
            <View style={styles.statusHeader}>
              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>Automation Engine</Text>
                <View style={[styles.statusBadge, { 
                  backgroundColor: automationStatus.isRunning ? Colors.bullish + '20' : Colors.textMuted + '20' 
                }]}>
                  <MaterialIcons 
                    name={automationStatus.isRunning ? "play-circle-filled" : "pause-circle-filled"} 
                    size={16} 
                    color={automationStatus.isRunning ? Colors.bullish : Colors.textMuted} 
                  />
                  <Text style={[styles.statusBadgeText, { 
                    color: automationStatus.isRunning ? Colors.bullish : Colors.textMuted 
                  }]}>
                    {automationStatus.isRunning ? 'Running' : 'Stopped'}
                  </Text>
                </View>
              </View>
              
              <Button
                mode={automationStatus.isRunning ? 'outlined' : 'contained'}
                onPress={handleToggleAutomation}
                style={[styles.toggleButton, automationStatus.isRunning && styles.stopButton]}
                buttonColor={automationStatus.isRunning ? 'transparent' : Colors.bullish}
                textColor={automationStatus.isRunning ? Colors.bearish : Colors.background}
                icon={automationStatus.isRunning ? "stop" : "play-arrow"}
                compact
              >
                {automationStatus.isRunning ? 'Stop' : 'Start'}
              </Button>
            </View>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{automationStatus.activeStrategies}</Text>
                <Text style={styles.statLabel}>Active Strategies</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{automationStrategies.length}</Text>
                <Text style={styles.statLabel}>Total Strategies</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{automationStatus.totalSignals}</Text>
                <Text style={styles.statLabel}>Signals Generated</Text>
              </View>
            </View>
          </LinearGradient>
        </Card>

        {/* Demo Notice */}
        <Card style={styles.noticeCard}>
          <Card.Content style={styles.noticeContent}>
            <View style={styles.noticeHeader}>
              <MaterialIcons name="info" size={24} color={Colors.primary} />
              <Text style={styles.noticeTitle}>Demo Mode</Text>
            </View>
            <Text style={styles.noticeText}>
              Automation is running in demo mode with simulated market data. 
              No real trades will be executed.
            </Text>
          </Card.Content>
        </Card>

        {/* Strategies List */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Trading Strategies</Text>
              <MaterialIcons name="list" size={24} color={Colors.accent} />
            </View>
            
            {automationStrategies.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="smart-toy" size={64} color={Colors.textMuted} />
                <Text style={styles.emptyStateText}>No strategies created</Text>
                <Text style={styles.emptyStateSubtext}>
                  Create your first automation strategy to get started
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => setShowCreateModal(true)}
                  style={styles.createFirstButton}
                  textColor={Colors.primary}
                  icon="add"
                >
                  Create Strategy
                </Button>
              </View>
            ) : (
              <View style={styles.strategiesList}>
                {automationStrategies.map((strategy, index) => (
                  <View 
                    key={strategy.id} 
                    style={[
                      styles.strategyItem,
                      index === automationStrategies.length - 1 && styles.lastStrategyItem
                    ]}
                  >
                    <View style={styles.strategyHeader}>
                      <View style={styles.strategyTitleContainer}>
                        <Text style={styles.strategyName}>{strategy.name}</Text>
                        <View style={styles.strategyBadges}>
                          <Chip 
                            style={styles.symbolBadge}
                            textStyle={styles.badgeText}
                          >
                            {strategy.symbol}
                          </Chip>
                          <Chip 
                            style={styles.indicatorBadge}
                            textStyle={styles.badgeText}
                          >
                            {strategy.indicator}
                          </Chip>
                        </View>
                      </View>
                      
                      <View style={styles.strategyControls}>
                        <Switch
                          value={strategy.isActive}
                          onValueChange={() => toggleAutomationStrategy(strategy.id)}
                          thumbColor={strategy.isActive ? Colors.primary : Colors.textMuted}
                          trackColor={{ false: Colors.border, true: Colors.primary + '40' }}
                        />
                        <TouchableOpacity
                          onPress={() => handleDeleteStrategy(strategy.id, strategy.name)}
                          style={styles.deleteButton}
                        >
                          <MaterialIcons name="delete" size={20} color={Colors.bearish} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    <View style={styles.strategyDetails}>
                      <View style={styles.detailRow}>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>Timeframe:</Text>
                          <Text style={styles.detailValue}>{formatTimeframe(strategy.timeframe)}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>Type:</Text>
                          <Text style={styles.detailValue}>{strategy.tradeType}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>Size:</Text>
                          <Text style={styles.detailValue}>{strategy.positionSize}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.performanceRow}>
                        <View style={styles.performanceItem}>
                          <Text style={styles.performanceLabel}>Success Rate</Text>
                          <Text style={[styles.performanceValue, { 
                            color: strategy.successRate > 60 ? Colors.bullish : Colors.bearish 
                          }]}>
                            {strategy.successRate.toFixed(1)}%
                          </Text>
                        </View>
                        <View style={styles.performanceItem}>
                          <Text style={styles.performanceLabel}>Signals</Text>
                          <Text style={styles.performanceValue}>{strategy.triggeredCount}</Text>
                        </View>
                        <View style={styles.performanceItem}>
                          <Text style={styles.performanceLabel}>Profit</Text>
                          <Text style={[styles.performanceValue, { 
                            color: strategy.totalProfit >= 0 ? Colors.bullish : Colors.bearish 
                          }]}>
                            ${strategy.totalProfit.toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
        color={Colors.background}
      />

      {/* Create Strategy Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowCreateModal(false)}
              style={styles.modalCloseButton}
            >
              <MaterialIcons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Strategy</Text>
            <View style={styles.modalHeaderSpacer} />
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <TextInput
              label="Strategy Name"
              value={newStrategy.name}
              onChangeText={(text) => setNewStrategy(prev => ({ ...prev, name: text }))}
              mode="outlined"
              style={styles.modalInput}
              theme={{
                colors: {
                  primary: Colors.primary,
                  onSurface: Colors.textPrimary,
                  outline: Colors.border,
                  surface: Colors.inputBackground,
                }
              }}
              textColor={Colors.textPrimary}
              left={<TextInput.Icon icon="chart-line" iconColor={Colors.textMuted} />}
            />

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Market Symbol</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {QUICK_ACCESS_SYMBOLS.map((symbol) => (
                  <Chip
                    key={symbol}
                    selected={newStrategy.symbol === symbol}
                    onPress={() => setNewStrategy(prev => ({ ...prev, symbol }))}
                    style={[
                      styles.modalChip,
                      newStrategy.symbol === symbol && styles.selectedModalChip
                    ]}
                    textStyle={[
                      styles.modalChipText,
                      newStrategy.symbol === symbol && styles.selectedModalChipText
                    ]}
                  >
                    {symbol}
                  </Chip>
                ))}
              </ScrollView>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Technical Indicator</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {indicators.map((indicator) => (
                  <Chip
                    key={indicator}
                    selected={newStrategy.indicator === indicator}
                    onPress={() => setNewStrategy(prev => ({ ...prev, indicator: indicator as any }))}
                    style={[
                      styles.modalChip,
                      newStrategy.indicator === indicator && styles.selectedModalChip
                    ]}
                    textStyle={[
                      styles.modalChipText,
                      newStrategy.indicator === indicator && styles.selectedModalChipText
                    ]}
                  >
                    {indicator}
                  </Chip>
                ))}
              </ScrollView>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Timeframe</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {timeframes.map((timeframe) => (
                  <Chip
                    key={timeframe}
                    selected={newStrategy.timeframe === timeframe}
                    onPress={() => setNewStrategy(prev => ({ ...prev, timeframe }))}
                    style={[
                      styles.modalChip,
                      newStrategy.timeframe === timeframe && styles.selectedModalChip
                    ]}
                    textStyle={[
                      styles.modalChipText,
                      newStrategy.timeframe === timeframe && styles.selectedModalChipText
                    ]}
                  >
                    {formatTimeframe(timeframe)}
                  </Chip>
                ))}
              </ScrollView>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Trade Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {tradeTypes.map((tradeType) => (
                  <Chip
                    key={tradeType}
                    selected={newStrategy.tradeType === tradeType}
                    onPress={() => setNewStrategy(prev => ({ ...prev, tradeType: tradeType as any }))}
                    style={[
                      styles.modalChip,
                      newStrategy.tradeType === tradeType && styles.selectedModalChip
                    ]}
                    textStyle={[
                      styles.modalChipText,
                      newStrategy.tradeType === tradeType && styles.selectedModalChipText
                    ]}
                  >
                    {tradeType}
                  </Chip>
                ))}
              </ScrollView>
            </View>

            <TextInput
              label="Position Size (Lots)"
              value={newStrategy.positionSize.toString()}
              onChangeText={(text) => {
                const value = parseFloat(text) || 0;
                setNewStrategy(prev => ({ ...prev, positionSize: value }));
              }}
              mode="outlined"
              keyboardType="numeric"
              style={styles.modalInput}
              theme={{
                colors: {
                  primary: Colors.primary,
                  onSurface: Colors.textPrimary,
                  outline: Colors.border,
                  surface: Colors.inputBackground,
                }
              }}
              textColor={Colors.textPrimary}
              left={<TextInput.Icon icon="currency-usd" iconColor={Colors.textMuted} />}
            />

            <View style={styles.modalButtonRow}>
              <Button
                mode="outlined"
                onPress={() => setShowCreateModal(false)}
                style={styles.modalCancelButton}
                textColor={Colors.textSecondary}
              >
                Cancel
              </Button>
              
              <Button
                mode="contained"
                onPress={handleCreateStrategy}
                loading={loading}
                disabled={loading || !newStrategy.name.trim()}
                style={styles.modalCreateButton}
                buttonColor={Colors.primary}
                textColor={Colors.background}
                labelStyle={styles.modalCreateButtonText}
              >
                Create Strategy
              </Button>
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
              <TouchableOpacity
                style={styles.alertButton}
                onPress={() => {
                  alertConfig.onOk?.();
                  setAlertConfig(prev => ({ ...prev, visible: false }));
                }}
              >
                <Text style={styles.alertButtonText}>OK</Text>
              </TouchableOpacity>
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statusCard: {
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 8,
  },
  statusGradient: {
    padding: 20,
    borderRadius: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    ...Typography.h6,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  toggleButton: {
    borderColor: Colors.bearish,
  },
  stopButton: {
    borderColor: Colors.bearish,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  noticeCard: {
    marginBottom: 16,
    backgroundColor: Colors.primary + '10',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  noticeContent: {
    paddingVertical: 16,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  noticeTitle: {
    ...Typography.body1,
    color: Colors.primary,
    fontWeight: '600',
  },
  noticeText: {
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
    marginBottom: 16,
  },
  cardTitle: {
    ...Typography.h6,
    color: Colors.textPrimary,
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
    marginBottom: 24,
    textAlign: 'center',
  },
  createFirstButton: {
    borderColor: Colors.primary,
  },
  strategiesList: {
    marginTop: 8,
  },
  strategyItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lastStrategyItem: {
    borderBottomWidth: 0,
  },
  strategyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  strategyTitleContainer: {
    flex: 1,
  },
  strategyName: {
    ...Typography.h6,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  strategyBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  symbolBadge: {
    backgroundColor: Colors.primary + '20',
    height: 28,
  },
  indicatorBadge: {
    backgroundColor: Colors.secondary + '20',
    height: 28,
  },
  badgeText: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textPrimary,
  },
  strategyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    padding: 4,
  },
  strategyDetails: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  detailValue: {
    ...Typography.body2,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  performanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  performanceLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  performanceValue: {
    ...Typography.body2,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: Colors.primary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    ...Typography.h5,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  modalHeaderSpacer: {
    width: 32,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalInput: {
    marginBottom: 20,
    backgroundColor: Colors.inputBackground,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    ...Typography.body1,
    color: Colors.textPrimary,
    fontWeight: '500',
    marginBottom: 12,
  },
  chipScroll: {
    marginBottom: 8,
  },
  modalChip: {
    marginRight: 8,
    backgroundColor: Colors.cardElevated,
    borderColor: Colors.border,
  },
  selectedModalChip: {
    backgroundColor: Colors.primary,
  },
  modalChipText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  selectedModalChipText: {
    color: Colors.background,
    fontWeight: '600',
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 20,
  },
  modalCancelButton: {
    flex: 1,
    borderColor: Colors.border,
  },
  modalCreateButton: {
    flex: 2,
  },
  modalCreateButtonText: {
    fontSize: 16,
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
  alertButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 80,
  },
  alertButtonText: {
    ...Typography.body2,
    color: Colors.background,
    fontWeight: '500',
  },
});