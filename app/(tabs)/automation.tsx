import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useTrading } from '../../hooks/useTrading';
import { AutomationStrategy } from '../../services/automationEngine';

export default function AutomationScreen() {
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
  const [newStrategy, setNewStrategy] = useState({
    name: '',
    indicator: 'RSI' as const,
    symbol: 'EURUSD',
    timeframe: '1H',
    entryCondition: '',
    exitCondition: '',
    tradeType: 'BOTH' as const,
    positionSize: 0.1,
    stopLoss: 0,
    takeProfit: 0,
  });

  const indicators = ['RSI', 'MACD', 'MA', 'BB', 'STOCH', 'ADX'];
  const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];
  const timeframes = ['1M', '5M', '15M', '30M', '1H', '4H', '1D'];
  const tradeTypes = ['BUY', 'SELL', 'BOTH'];

  const handleCreateStrategy = () => {
    if (!newStrategy.name.trim()) {
      Alert.alert('Error', 'Please enter a strategy name');
      return;
    }

    const strategy: AutomationStrategy = {
      id: Date.now().toString(),
      name: newStrategy.name,
      isActive: true,
      indicator: newStrategy.indicator,
      symbol: newStrategy.symbol,
      timeframe: newStrategy.timeframe,
      entryCondition: newStrategy.entryCondition || getDefaultEntryCondition(newStrategy.indicator),
      exitCondition: newStrategy.exitCondition || getDefaultExitCondition(newStrategy.indicator),
      tradeType: newStrategy.tradeType,
      positionSize: newStrategy.positionSize,
      stopLoss: newStrategy.stopLoss > 0 ? newStrategy.stopLoss : undefined,
      takeProfit: newStrategy.takeProfit > 0 ? newStrategy.takeProfit : undefined,
      createdAt: new Date(),
      triggeredCount: 0,
      successRate: 0,
      totalProfit: 0,
    };

    addAutomationStrategy(strategy);
    setShowCreateModal(false);
    
    // Reset form
    setNewStrategy({
      name: '',
      indicator: 'RSI',
      symbol: 'EURUSD',
      timeframe: '1H',
      entryCondition: '',
      exitCondition: '',
      tradeType: 'BOTH',
      positionSize: 0.1,
      stopLoss: 0,
      takeProfit: 0,
    });

    Alert.alert('Success', 'Strategy created successfully!');
  };

  const getDefaultEntryCondition = (indicator: string): string => {
    switch (indicator) {
      case 'RSI':
        return 'RSI < 30 (Oversold)';
      case 'MACD':
        return 'MACD Signal > 0 && Histogram > 0';
      case 'MA':
        return 'Price > Moving Average';
      case 'STOCH':
        return 'Stochastic < 20';
      default:
        return 'Custom condition';
    }
  };

  const getDefaultExitCondition = (indicator: string): string => {
    switch (indicator) {
      case 'RSI':
        return 'RSI > 70 (Overbought)';
      case 'MACD':
        return 'MACD Signal < 0 || Histogram < 0';
      case 'MA':
        return 'Price < Moving Average';
      case 'STOCH':
        return 'Stochastic > 80';
      default:
        return 'Take profit or stop loss';
    }
  };

  const handleDeleteStrategy = (strategyId: string, strategyName: string) => {
    Alert.alert(
      'Delete Strategy',
      `Are you sure you want to delete "${strategyName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAutomationStrategy(strategyId),
        },
      ]
    );
  };

  const StrategyCard = ({ strategy }: { strategy: AutomationStrategy }) => (
    <View style={styles.strategyCard}>
      <View style={styles.strategyHeader}>
        <View style={styles.strategyInfo}>
          <Text style={styles.strategyName}>{strategy.name}</Text>
          <Text style={styles.strategyDetails}>
            {strategy.indicator} • {strategy.symbol} • {strategy.timeframe}
          </Text>
        </View>
        <Switch
          value={strategy.isActive}
          onValueChange={() => toggleAutomationStrategy(strategy.id)}
          trackColor={{ false: Colors.textMuted, true: Colors.bullish }}
          thumbColor={strategy.isActive ? Colors.textPrimary : Colors.textSecondary}
        />
      </View>

      <View style={styles.strategyStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{strategy.triggeredCount}</Text>
          <Text style={styles.statLabel}>Signals</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[
            styles.statValue,
            { color: strategy.successRate >= 50 ? Colors.bullish : Colors.bearish }
          ]}>
            {strategy.successRate.toFixed(1)}%
          </Text>
          <Text style={styles.statLabel}>Success Rate</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[
            styles.statValue,
            { color: strategy.totalProfit >= 0 ? Colors.bullish : Colors.bearish }
          ]}>
            ${strategy.totalProfit.toFixed(2)}
          </Text>
          <Text style={styles.statLabel}>P&L</Text>
        </View>
      </View>

      <View style={styles.strategyConditions}>
        <Text style={styles.conditionLabel}>Entry:</Text>
        <Text style={styles.conditionText}>{strategy.entryCondition}</Text>
        <Text style={styles.conditionLabel}>Exit:</Text>
        <Text style={styles.conditionText}>{strategy.exitCondition}</Text>
      </View>

      <View style={styles.strategyActions}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteStrategy(strategy.id, strategy.name)}
        >
          <MaterialIcons name="delete" size={16} color={Colors.error} />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const CreateStrategyModal = () => (
    <Modal
      visible={showCreateModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCreateModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Strategy</Text>
            <TouchableOpacity 
              onPress={() => setShowCreateModal(false)}
              style={styles.modalCloseButton}
            >
              <MaterialIcons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Strategy Name</Text>
              <TextInput
                style={styles.formInput}
                value={newStrategy.name}
                onChangeText={(text) => setNewStrategy(prev => ({ ...prev, name: text }))}
                placeholder="e.g. RSI Oversold Buy"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Indicator</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {indicators.map((indicator) => (
                  <TouchableOpacity
                    key={indicator}
                    style={[
                      styles.optionButton,
                      newStrategy.indicator === indicator && styles.optionButtonActive
                    ]}
                    onPress={() => setNewStrategy(prev => ({ ...prev, indicator: indicator as any }))}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      newStrategy.indicator === indicator && styles.optionButtonTextActive
                    ]}>
                      {indicator}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Symbol</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {symbols.map((symbol) => (
                    <TouchableOpacity
                      key={symbol}
                      style={[
                        styles.optionButton,
                        newStrategy.symbol === symbol && styles.optionButtonActive
                      ]}
                      onPress={() => setNewStrategy(prev => ({ ...prev, symbol }))}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        newStrategy.symbol === symbol && styles.optionButtonTextActive
                      ]}>
                        {symbol}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Timeframe</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {timeframes.map((timeframe) => (
                    <TouchableOpacity
                      key={timeframe}
                      style={[
                        styles.optionButton,
                        newStrategy.timeframe === timeframe && styles.optionButtonActive
                      ]}
                      onPress={() => setNewStrategy(prev => ({ ...prev, timeframe }))}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        newStrategy.timeframe === timeframe && styles.optionButtonTextActive
                      ]}>
                        {timeframe}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Trade Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {tradeTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.optionButton,
                      newStrategy.tradeType === type && styles.optionButtonActive
                    ]}
                    onPress={() => setNewStrategy(prev => ({ ...prev, tradeType: type as any }))}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      newStrategy.tradeType === type && styles.optionButtonTextActive
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Position Size (Lots)</Text>
              <TextInput
                style={styles.formInput}
                value={newStrategy.positionSize.toString()}
                onChangeText={(text) => setNewStrategy(prev => ({ ...prev, positionSize: parseFloat(text) || 0.1 }))}
                placeholder="0.1"
                keyboardType="decimal-pad"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.formLabel}>Stop Loss (pips)</Text>
                <TextInput
                  style={styles.formInput}
                  value={newStrategy.stopLoss.toString()}
                  onChangeText={(text) => setNewStrategy(prev => ({ ...prev, stopLoss: parseFloat(text) || 0 }))}
                  placeholder="Optional"
                  keyboardType="decimal-pad"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.formLabel}>Take Profit (pips)</Text>
                <TextInput
                  style={styles.formInput}
                  value={newStrategy.takeProfit.toString()}
                  onChangeText={(text) => setNewStrategy(prev => ({ ...prev, takeProfit: parseFloat(text) || 0 }))}
                  placeholder="Optional"
                  keyboardType="decimal-pad"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateStrategy}
          >
            <Text style={styles.createButtonText}>Create Strategy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Automation</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreateModal(true)}
          >
            <MaterialIcons name="add" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Automation Status */}
        <View style={styles.section}>
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusTitle}>Automation Engine</Text>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  { backgroundColor: automationStatus.isRunning ? Colors.bearish : Colors.bullish }
                ]}
                onPress={automationStatus.isRunning ? stopAutomation : startAutomation}
              >
                <MaterialIcons 
                  name={automationStatus.isRunning ? 'stop' : 'play-arrow'} 
                  size={20} 
                  color={Colors.textPrimary} 
                />
                <Text style={styles.toggleButtonText}>
                  {automationStatus.isRunning ? 'Stop' : 'Start'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statusStats}>
              <View style={styles.statusStat}>
                <Text style={styles.statusStatValue}>{automationStatus.activeStrategies}</Text>
                <Text style={styles.statusStatLabel}>Active Strategies</Text>
              </View>
              <View style={styles.statusStat}>
                <Text style={styles.statusStatValue}>{automationStatus.totalSignals}</Text>
                <Text style={styles.statusStatLabel}>Total Signals</Text>
              </View>
              <View style={styles.statusStat}>
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: automationStatus.isRunning ? Colors.bullish : Colors.textMuted }
                ]} />
                <Text style={styles.statusStatLabel}>
                  {automationStatus.isRunning ? 'Running' : 'Stopped'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Strategies List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Trading Strategies ({automationStrategies.length})
          </Text>
          
          {automationStrategies.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="smart-toy" size={64} color={Colors.textMuted} />
              <Text style={styles.emptyStateTitle}>No Strategies Yet</Text>
              <Text style={styles.emptyStateMessage}>
                Create your first automated trading strategy to get started
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => setShowCreateModal(true)}
              >
                <Text style={styles.emptyStateButtonText}>Create Strategy</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.strategiesList}>
              {automationStrategies.map((strategy) => (
                <StrategyCard key={strategy.id} strategy={strategy} />
              ))}
            </View>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <CreateStrategyModal />
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
  statusCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  statusStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statusStat: {
    alignItems: 'center',
  },
  statusStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statusStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  strategyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  strategyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  strategyInfo: {
    flex: 1,
  },
  strategyName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  strategyDetails: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  strategyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  strategyConditions: {
    marginBottom: 12,
  },
  conditionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: 8,
    marginBottom: 4,
  },
  conditionText: {
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
    padding: 8,
    borderRadius: 6,
  },
  strategyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  deleteButtonText: {
    fontSize: 12,
    color: Colors.error,
  },
  strategiesList: {
    // Container for strategies
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  emptyStateButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalForm: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  optionButton: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  optionButtonTextActive: {
    color: Colors.textPrimary,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  bottomPadding: {
    height: 20,
  },
});