import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Modal, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, TextInput, Chip, FAB, Switch, Divider } from 'react-native-paper';
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
    automationStrategies, 
    automationStatus,
    addAutomationRule,
    toggleAutomationRule,
    deleteAutomationRule,
    addAutomationStrategy,
    toggleAutomationStrategy,
    deleteAutomationStrategy,
    startAutomation,
    stopAutomation,
  } = useTrading();

  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleDescription, setNewRuleDescription] = useState('');

  // Strategy form state
  const [strategyForm, setStrategyForm] = useState({
    name: '',
    indicator: 'RSI' as AutomationStrategy['indicator'],
    symbol: 'EURUSD',
    timeframe: '15',
    entryCondition: '',
    exitCondition: '',
    tradeType: 'BOTH' as AutomationStrategy['tradeType'],
    positionSize: 0.01,
    stopLoss: undefined as number | undefined,
    takeProfit: undefined as number | undefined,
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

  const handleAddRule = () => {
    if (!newRuleName.trim()) {
      showAlert('Invalid Input', 'Please enter a rule name');
      return;
    }

    addAutomationRule(newRuleName.trim(), newRuleDescription.trim());
    setNewRuleName('');
    setNewRuleDescription('');
    setShowRuleModal(false);
    showAlert('Success', 'Automation rule created successfully');
  };

  const handleAddStrategy = () => {
    if (!strategyForm.name.trim()) {
      showAlert('Invalid Input', 'Please enter a strategy name');
      return;
    }

    if (!strategyForm.entryCondition.trim()) {
      showAlert('Invalid Input', 'Please enter entry condition');
      return;
    }

    if (!strategyForm.exitCondition.trim()) {
      showAlert('Invalid Input', 'Please enter exit condition');
      return;
    }

    const newStrategy: AutomationStrategy = {
      id: Date.now().toString(),
      ...strategyForm,
      isActive: true,
      createdAt: new Date(),
      triggeredCount: 0,
      successRate: Math.random() * 30 + 60, // Random initial success rate
      totalProfit: 0,
    };

    addAutomationStrategy(newStrategy);

    // Reset form
    setStrategyForm({
      name: '',
      indicator: 'RSI',
      symbol: 'EURUSD',
      timeframe: '15',
      entryCondition: '',
      exitCondition: '',
      tradeType: 'BOTH',
      positionSize: 0.01,
      stopLoss: undefined,
      takeProfit: undefined,
    });

    setShowStrategyModal(false);
    showAlert('Success', 'Automation strategy created successfully');
  };

  const handleToggleAutomation = () => {
    if (automationStatus.isRunning) {
      stopAutomation();
      showAlert('Automation Stopped', 'All automation strategies have been stopped');
    } else {
      if (automationStatus.activeStrategies === 0) {
        showAlert('No Active Strategies', 'Please create and activate at least one strategy before starting automation');
        return;
      }
      startAutomation();
      showAlert('Automation Started', 'Automation engine is now running your active strategies');
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
            <Text style={styles.title}>AI Automation</Text>
            <Text style={styles.subtitle}>Intelligent trading automation</Text>
          </View>
          <MaterialIcons name="smart-toy" size={28} color={Colors.primary} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Automation Status */}
        <Card style={styles.statusCard}>
          <LinearGradient
            colors={[automationStatus.isRunning ? Colors.bullish + '20' : Colors.bearish + '20', Colors.surface]}
            style={styles.statusGradient}
          >
            <View style={styles.statusHeader}>
              <View>
                <Text style={styles.statusTitle}>Automation Engine</Text>
                <Text style={styles.statusSubtitle}>
                  {automationStatus.isRunning ? 'Running' : 'Stopped'}
                </Text>
              </View>
              <Switch
                value={automationStatus.isRunning}
                onValueChange={handleToggleAutomation}
                thumbColor={automationStatus.isRunning ? Colors.bullish : Colors.textMuted}
                trackColor={{ false: Colors.border, true: Colors.bullish + '40' }}
              />
            </View>

            <View style={styles.statusGrid}>
              <View style={styles.statusItem}>
                <Text style={styles.statusValue}>{automationStatus.activeStrategies}</Text>
                <Text style={styles.statusLabel}>Active Strategies</Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusValue}>{automationStatus.totalSignals}</Text>
                <Text style={styles.statusLabel}>Signals Generated</Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusValue}>
                  {automationStatus.lastUpdate ? automationStatus.lastUpdate.toLocaleTimeString() : '--:--'}
                </Text>
                <Text style={styles.statusLabel}>Last Update</Text>
              </View>
            </View>
          </LinearGradient>
        </Card>

        {/* Automation Strategies */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Trading Strategies</Text>
              <Button
                mode="text"
                onPress={() => setShowStrategyModal(true)}
                textColor={Colors.primary}
                icon="plus"
                compact
              >
                Add Strategy
              </Button>
            </View>

            {automationStrategies.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="psychology" size={64} color={Colors.textMuted} />
                <Text style={styles.emptyStateText}>No strategies created</Text>
                <Text style={styles.emptyStateSubtext}>
                  Create your first automated trading strategy to get started
                </Text>
              </View>
            ) : (
              <FlatList
                data={automationStrategies}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={styles.strategyItem}>
                    <View style={styles.strategyHeader}>
                      <View style={styles.strategyInfo}>
                        <Text style={styles.strategyName}>{item.name}</Text>
                        <View style={styles.strategyTags}>
                          <Chip
                            style={styles.indicatorChip}
                            textStyle={styles.indicatorChipText}
                          >
                            {item.indicator}
                          </Chip>
                          <Chip
                            style={styles.symbolChip}
                            textStyle={styles.symbolChipText}
                          >
                            {item.symbol}
                          </Chip>
                          <Chip
                            style={styles.timeframeChip}
                            textStyle={styles.timeframeChipText}
                          >
                            {item.timeframe}M
                          </Chip>
                        </View>
                      </View>
                      <Switch
                        value={item.isActive}
                        onValueChange={() => toggleAutomationStrategy(item.id)}
                        thumbColor={item.isActive ? Colors.bullish : Colors.textMuted}
                        trackColor={{ false: Colors.border, true: Colors.bullish + '40' }}
                      />
                    </View>

                    <View style={styles.strategyStats}>
                      <View style={styles.strategyStat}>
                        <Text style={styles.strategyStatValue}>{item.triggeredCount}</Text>
                        <Text style={styles.strategyStatLabel}>Triggered</Text>
                      </View>
                      <View style={styles.strategyStat}>
                        <Text style={[styles.strategyStatValue, { 
                          color: item.successRate >= 60 ? Colors.bullish : item.successRate >= 40 ? Colors.accent : Colors.bearish 
                        }]}>
                          {item.successRate.toFixed(1)}%
                        </Text>
                        <Text style={styles.strategyStatLabel}>Success Rate</Text>
                      </View>
                      <View style={styles.strategyStat}>
                        <Text style={[styles.strategyStatValue, { 
                          color: item.totalProfit >= 0 ? Colors.bullish : Colors.bearish 
                        }]}>
                          {item.totalProfit >= 0 ? '+' : ''}${item.totalProfit.toFixed(2)}
                        </Text>
                        <Text style={styles.strategyStatLabel}>Total P&L</Text>
                      </View>
                    </View>

                    <View style={styles.strategyConditions}>
                      <Text style={styles.conditionText}>
                        Entry: {item.entryCondition}
                      </Text>
                      <Text style={styles.conditionText}>
                        Exit: {item.exitCondition}
                      </Text>
                    </View>

                    <Button
                      mode="text"
                      onPress={() => {
                        showAlert(
                          'Delete Strategy',
                          `Are you sure you want to delete "${item.name}"?`,
                          () => deleteAutomationStrategy(item.id)
                        );
                      }}
                      textColor={Colors.bearish}
                      icon="delete"
                      compact
                      style={styles.deleteButton}
                    >
                      Delete
                    </Button>
                  </View>
                )}
                ItemSeparatorComponent={() => <Divider style={styles.divider} />}
              />
            )}
          </Card.Content>
        </Card>

        {/* Basic Rules (Legacy) */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Basic Rules</Text>
              <Button
                mode="text"
                onPress={() => setShowRuleModal(true)}
                textColor={Colors.secondary}
                icon="plus"
                compact
              >
                Add Rule
              </Button>
            </View>

            {automationRules.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="rule" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyStateText}>No rules created</Text>
              </View>
            ) : (
              <FlatList
                data={automationRules}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={styles.ruleItem}>
                    <View style={styles.ruleHeader}>
                      <Text style={styles.ruleName}>{item.name}</Text>
                      <Switch
                        value={item.isActive}
                        onValueChange={() => toggleAutomationRule(item.id)}
                        thumbColor={item.isActive ? Colors.secondary : Colors.textMuted}
                        trackColor={{ false: Colors.border, true: Colors.secondary + '40' }}
                      />
                    </View>
                    <Text style={styles.ruleDescription}>{item.description}</Text>
                    <Button
                      mode="text"
                      onPress={() => deleteAutomationRule(item.id)}
                      textColor={Colors.bearish}
                      icon="delete"
                      compact
                    >
                      Delete
                    </Button>
                  </View>
                )}
                ItemSeparatorComponent={() => <Divider style={styles.divider} />}
              />
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Strategy Modal */}
      <Modal
        visible={showStrategyModal}
        onDismiss={() => setShowStrategyModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>Create Trading Strategy</Text>
          
          <TextInput
            label="Strategy Name"
            value={strategyForm.name}
            onChangeText={(text) => setStrategyForm(prev => ({ ...prev, name: text }))}
            mode="outlined"
            style={styles.modalInput}
            theme={{ colors: { primary: Colors.primary, outline: Colors.border, surface: Colors.inputBackground } }}
          />

          {/* Indicator Selection */}
          <Text style={styles.sectionLabel}>Technical Indicator</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {['RSI', 'MACD', 'MA', 'BB', 'STOCH', 'ADX'].map(indicator => (
              <Chip
                key={indicator}
                selected={strategyForm.indicator === indicator}
                onPress={() => setStrategyForm(prev => ({ ...prev, indicator: indicator as any }))}
                style={[styles.modalChip, strategyForm.indicator === indicator && styles.selectedModalChip]}
                textStyle={[styles.modalChipText, strategyForm.indicator === indicator && styles.selectedModalChipText]}
              >
                {indicator}
              </Chip>
            ))}
          </ScrollView>

          <TextInput
            label="Symbol"
            value={strategyForm.symbol}
            onChangeText={(text) => setStrategyForm(prev => ({ ...prev, symbol: text.toUpperCase() }))}
            mode="outlined"
            style={styles.modalInput}
            theme={{ colors: { primary: Colors.primary, outline: Colors.border, surface: Colors.inputBackground } }}
          />

          <TextInput
            label="Entry Condition"
            value={strategyForm.entryCondition}
            onChangeText={(text) => setStrategyForm(prev => ({ ...prev, entryCondition: text }))}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={styles.modalInput}
            placeholder="e.g., RSI < 30 and price above MA"
            theme={{ colors: { primary: Colors.primary, outline: Colors.border, surface: Colors.inputBackground } }}
          />

          <TextInput
            label="Exit Condition"
            value={strategyForm.exitCondition}
            onChangeText={(text) => setStrategyForm(prev => ({ ...prev, exitCondition: text }))}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={styles.modalInput}
            placeholder="e.g., RSI > 70 or 2% profit target"
            theme={{ colors: { primary: Colors.primary, outline: Colors.border, surface: Colors.inputBackground } }}
          />

          <TextInput
            label="Position Size (Lots)"
            value={strategyForm.positionSize.toString()}
            onChangeText={(text) => setStrategyForm(prev => ({ ...prev, positionSize: parseFloat(text) || 0.01 }))}
            mode="outlined"
            keyboardType="numeric"
            style={styles.modalInput}
            theme={{ colors: { primary: Colors.primary, outline: Colors.border, surface: Colors.inputBackground } }}
          />

          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setShowStrategyModal(false)}
              style={styles.modalButton}
              textColor={Colors.textSecondary}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleAddStrategy}
              style={styles.modalButton}
              buttonColor={Colors.primary}
            >
              Create Strategy
            </Button>
          </View>
        </ScrollView>
      </Modal>

      {/* Rule Modal */}
      <Modal
        visible={showRuleModal}
        onDismiss={() => setShowRuleModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Text style={styles.modalTitle}>Create Automation Rule</Text>
        
        <TextInput
          label="Rule Name"
          value={newRuleName}
          onChangeText={setNewRuleName}
          mode="outlined"
          style={styles.modalInput}
          theme={{ colors: { primary: Colors.primary, outline: Colors.border, surface: Colors.inputBackground } }}
        />

        <TextInput
          label="Description"
          value={newRuleDescription}
          onChangeText={setNewRuleDescription}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.modalInput}
          theme={{ colors: { primary: Colors.primary, outline: Colors.border, surface: Colors.inputBackground } }}
        />

        <View style={styles.modalButtons}>
          <Button
            mode="outlined"
            onPress={() => setShowRuleModal(false)}
            style={styles.modalButton}
            textColor={Colors.textSecondary}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleAddRule}
            style={styles.modalButton}
            buttonColor={Colors.secondary}
          >
            Create Rule
          </Button>
        </View>
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
    marginBottom: 16,
    borderRadius: 12,
    elevation: 4,
  },
  statusGradient: {
    padding: 20,
    borderRadius: 12,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusTitle: {
    ...Typography.h5,
    color: Colors.textPrimary,
  },
  statusSubtitle: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusValue: {
    ...Typography.h6,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  statusLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 4,
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
  cardHeader: {
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
    textAlign: 'center',
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
  },
  strategyName: {
    ...Typography.h6,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  strategyTags: {
    flexDirection: 'row',
    gap: 8,
  },
  indicatorChip: {
    backgroundColor: Colors.primary + '20',
    height: 24,
  },
  indicatorChipText: {
    ...Typography.caption,
    color: Colors.primary,
    fontSize: 10,
  },
  symbolChip: {
    backgroundColor: Colors.bullish + '20',
    height: 24,
  },
  symbolChipText: {
    ...Typography.caption,
    color: Colors.bullish,
    fontSize: 10,
  },
  timeframeChip: {
    backgroundColor: Colors.accent + '20',
    height: 24,
  },
  timeframeChipText: {
    ...Typography.caption,
    color: Colors.accent,
    fontSize: 10,
  },
  strategyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  strategyStat: {
    alignItems: 'center',
  },
  strategyStatValue: {
    ...Typography.body1,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  strategyStatLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  strategyConditions: {
    marginBottom: 12,
  },
  conditionText: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  deleteButton: {
    alignSelf: 'flex-start',
  },
  ruleItem: {
    paddingVertical: 16,
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ruleName: {
    ...Typography.body1,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  ruleDescription: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  divider: {
    backgroundColor: Colors.border,
  },
  modalContainer: {
    backgroundColor: Colors.surface,
    margin: 20,
    padding: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalTitle: {
    ...Typography.h5,
    color: Colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 12,
  },
  chipScroll: {
    marginBottom: 16,
  },
  modalChip: {
    marginRight: 8,
    backgroundColor: Colors.cardElevated,
  },
  selectedModalChip: {
    backgroundColor: Colors.primary,
  },
  modalChipText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  selectedModalChipText: {
    color: Colors.background,
  },
  modalInput: {
    marginBottom: 16,
    backgroundColor: Colors.inputBackground,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
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