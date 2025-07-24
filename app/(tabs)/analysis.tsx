import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import { Text, Card, Button, Switch, TextInput, FAB, Dialog, Portal, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTrading } from '../../hooks/useTrading';

const ANALYSIS_TYPES = [
  { id: 'technical', name: 'Technical Analysis', icon: 'timeline' },
  { id: 'fundamental', name: 'Fundamental Analysis', icon: 'assessment' },
  { id: 'sentiment', name: 'Market Sentiment', icon: 'psychology' },
  { id: 'pattern', name: 'Pattern Recognition', icon: 'show-chart' },
];

const STRATEGIES = [
  { id: 'scalping', name: 'Scalping', description: 'Quick profits from small price changes' },
  { id: 'swing', name: 'Swing Trading', description: 'Hold positions for days to weeks' },
  { id: 'trend', name: 'Trend Following', description: 'Follow the major market direction' },
  { id: 'mean_reversion', name: 'Mean Reversion', description: 'Trade against extreme moves' },
];

const AUTOMATION_EXAMPLES = [
  'Buy EURUSD when RSI < 30 and MACD crosses above signal line',
  'Sell when price breaks below 20-period moving average with volume confirmation',
  'Enter long position when Fibonacci 61.8% level acts as support with bullish candlestick pattern',
  'Close all positions when daily loss exceeds 2% of account balance',
  'Scale in on pullbacks to 50% Fibonacci level during uptrend',
];

export default function AnalysisPage() {
  const { indicators, selectedSymbol, automationRules, addAutomationRule, toggleAutomationRule, deleteAutomationRule } = useTrading();
  const [activeAnalysis, setActiveAnalysis] = useState<string[]>(['technical']);
  const [autoTrading, setAutoTrading] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState('trend');
  const [showAutomationDialog, setShowAutomationDialog] = useState(false);
  const [automationName, setAutomationName] = useState('');
  const [automationInstructions, setAutomationInstructions] = useState('');

  const toggleAnalysis = (analysisId: string) => {
    setActiveAnalysis(prev => 
      prev.includes(analysisId)
        ? prev.filter(id => id !== analysisId)
        : [...prev, analysisId]
    );
  };

  const getTechnicalSignal = () => {
    const rsi = indicators.rsi;
    const macd = indicators.macd.signal;
    
    if (rsi > 70 && macd < 0) return { signal: 'SELL', strength: 'Strong', color: '#EF4444' };
    if (rsi < 30 && macd > 0) return { signal: 'BUY', strength: 'Strong', color: '#10B981' };
    if (rsi > 60) return { signal: 'SELL', strength: 'Weak', color: '#F59E0B' };
    if (rsi < 40) return { signal: 'BUY', strength: 'Weak', color: '#F59E0B' };
    return { signal: 'HOLD', strength: 'Neutral', color: '#64748B' };
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      // For web, we'll use a simple alert for now
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSaveAutomation = () => {
    if (!automationName.trim() || !automationInstructions.trim()) {
      showAlert('Validation Error', 'Please fill in both rule name and instructions.');
      return;
    }

    addAutomationRule(automationName.trim(), automationInstructions.trim());
    setAutomationName('');
    setAutomationInstructions('');
    setShowAutomationDialog(false);
    showAlert('Success', 'Automation rule has been saved successfully!');
  };

  const handleDeleteRule = (id: string, name: string) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Are you sure you want to delete the rule "${name}"?`);
      if (confirmed) {
        deleteAutomationRule(id);
      }
    } else {
      Alert.alert(
        'Delete Rule',
        `Are you sure you want to delete the rule "${name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => deleteAutomationRule(id) }
        ]
      );
    }
  };

  const insertExample = (example: string) => {
    setAutomationInstructions(example);
  };

  const signal = getTechnicalSignal();

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B']}
      style={styles.container}
    >
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Auctus Analysis</Text>
            <Text style={styles.subtitle}>Advanced Trading Intelligence</Text>
          </View>
          <MaterialIcons name="auto-awesome" size={28} color="#8B5CF6" />
        </View>

        <ScrollView style={styles.content}>
          <Card style={styles.signalCard}>
            <Card.Title
              title="Trading Signal"
              titleStyle={styles.cardTitle}
              left={() => <MaterialIcons name="traffic" size={24} color={signal.color} />}
            />
            <Card.Content>
              <View style={styles.signalContent}>
                <View style={styles.signalMain}>
                  <Text style={[styles.signalText, { color: signal.color }]}>
                    {signal.signal}
                  </Text>
                  <Text style={styles.signalStrength}>
                    {signal.strength} Signal
                  </Text>
                </View>
                <View style={styles.signalDetails}>
                  <Text style={styles.symbolText}>{selectedSymbol}</Text>
                  <Text style={styles.timestampText}>
                    Updated: {new Date().toLocaleTimeString()}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.analysisCard}>
            <Card.Title
              title="Analysis Types"
              titleStyle={styles.cardTitle}
              left={() => <MaterialIcons name="analytics" size={24} color="#00C896" />}
            />
            <Card.Content>
              <Text style={styles.sectionDescription}>
                Select multiple analysis types to combine for better accuracy
              </Text>
              <View style={styles.analysisTypes}>                {ANALYSIS_TYPES.map((analysis) => (
                  <View key={analysis.id} style={styles.analysisItem}>
                    <View style={styles.analysisInfo}>
                      <MaterialIcons
                        name={analysis.icon}
                        size={20}
                        color="#94A3B8"
                      />
                      <Text style={styles.analysisName}>{analysis.name}</Text>
                    </View>
                    <Switch
                      value={activeAnalysis.includes(analysis.id)}
                      onValueChange={() => toggleAnalysis(analysis.id)}
                      color="#00C896"
                    />
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.strategiesCard}>
            <Card.Title
              title="Trading Strategies"
              titleStyle={styles.cardTitle}
              left={() => <MaterialIcons name="psychology" size={24} color="#F59E0B" />}
            />
            <Card.Content>
              <Text style={styles.sectionDescription}>
                Choose your preferred trading strategy
              </Text>
              <View style={styles.strategyList}>
                {STRATEGIES.map((strategy) => (
                  <View
                    key={strategy.id}
                    style={[
                      styles.strategyItem,
                      selectedStrategy === strategy.id && styles.selectedStrategy
                    ]}
                  >
                    <View style={styles.strategyHeader}>
                      <Text style={[
                        styles.strategyName,
                        selectedStrategy === strategy.id && styles.selectedStrategyText
                      ]}>
                        {strategy.name}
                      </Text>
                      <Button
                        mode={selectedStrategy === strategy.id ? 'contained' : 'outlined'}
                        onPress={() => setSelectedStrategy(strategy.id)}
                        compact
                        style={selectedStrategy === strategy.id && styles.selectedButton}
                      >
                        {selectedStrategy === strategy.id ? 'Active' : 'Select'}
                      </Button>
                    </View>
                    <Text style={styles.strategyDescription}>
                      {strategy.description}
                    </Text>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.automationCard}>
            <Card.Title
              title="Automated Trading"
              titleStyle={styles.cardTitle}
              left={() => <MaterialIcons name="auto-mode" size={24} color="#8B5CF6" />}
            />
            <Card.Content>
              <View style={styles.automationToggle}>
                <View style={styles.automationInfo}>
                  <Text style={styles.automationLabel}>Enable Auto Trading</Text>
                  <Text style={styles.automationDescription}>
                    Execute trades automatically based on your custom rules
                  </Text>
                </View>
                <Switch
                  value={autoTrading}
                  onValueChange={setAutoTrading}
                  color="#8B5CF6"
                />
              </View>
              
              {autoTrading && (
                <View style={styles.automationSettings}>
                  <Text style={styles.settingsTitle}>Auto Trading Settings</Text>
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Max Risk per Trade</Text>
                    <Text style={styles.settingValue}>2%</Text>
                  </View>
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Signal Confidence</Text>
                    <Text style={styles.settingValue}>High Only</Text>
                  </View>
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Daily Trade Limit</Text>
                    <Text style={styles.settingValue}>5 trades</Text>
                  </View>
                </View>
              )}
            </Card.Content>
          </Card>

          <Card style={styles.customAutomationCard}>
            <Card.Title
              title="Custom Automation Rules"
              titleStyle={styles.cardTitle}
              left={() => <MaterialIcons name="rule" size={24} color="#8B5CF6" />}
              right={() => (
                <Button
                  mode="contained"
                  onPress={() => setShowAutomationDialog(true)}
                  style={styles.addRuleButton}
                  compact
                >
                  Add Rule
                </Button>
              )}
            />
            <Card.Content>
              <Text style={styles.sectionDescription}>
                Define custom trading automation using indicators, patterns, and your trading logic
              </Text>
              
              {automationRules.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialIcons name="psychology" size={48} color="#64748B" />
                  <Text style={styles.emptyStateText}>No automation rules yet</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Create your first rule to start automated trading
                  </Text>
                </View>
              ) : (
                <View style={styles.rulesList}>
                  {automationRules.map((rule) => (
                    <View key={rule.id} style={styles.ruleItem}>
                      <View style={styles.ruleHeader}>
                        <View style={styles.ruleInfo}>
                          <Text style={styles.ruleName}>{rule.name}</Text>
                          <Text style={styles.ruleDate}>
                            Created: {rule.createdAt.toLocaleDateString()}
                          </Text>
                        </View>
                        <View style={styles.ruleActions}>
                          <Switch
                            value={rule.isActive}
                            onValueChange={() => toggleAutomationRule(rule.id)}
                            color="#8B5CF6"
                          />
                          <IconButton
                            icon="delete"
                            size={20}
                            iconColor="#EF4444"
                            onPress={() => handleDeleteRule(rule.id, rule.name)}
                          />
                        </View>
                      </View>
                      <Text style={styles.ruleDescription}>{rule.description}</Text>
                      <Text style={[styles.ruleStatus, { color: rule.isActive ? '#10B981' : '#64748B' }]}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </Card.Content>
          </Card>

          <Card style={styles.insightsCard}>
            <Card.Title
              title="Market Insights"
              titleStyle={styles.cardTitle}
              left={() => <MaterialIcons name="lightbulb" size={24} color="#F59E0B" />}
            />
            <Card.Content>
              <View style={styles.insightsList}>
                <View style={styles.insightItem}>
                  <MaterialIcons name="trending-up" size={16} color="#10B981" />
                  <Text style={styles.insightText}>
                    Strong bullish momentum detected on {selectedSymbol}
                  </Text>
                </View>
                <View style={styles.insightItem}>
                  <MaterialIcons name="warning" size={16} color="#F59E0B" />
                  <Text style={styles.insightText}>
                    RSI approaching overbought levels
                  </Text>
                </View>
                <View style={styles.insightItem}>
                  <MaterialIcons name="info" size={16} color="#3B82F6" />
                  <Text style={styles.insightText}>
                    Economic news release scheduled at 2:00 PM
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>

        <Portal>
          <Dialog visible={showAutomationDialog} onDismiss={() => setShowAutomationDialog(false)}>
            <Dialog.Title style={styles.dialogTitle}>Create Automation Rule</Dialog.Title>
            <Dialog.Content>
              <Text style={styles.dialogDescription}>
                Define how Auctus should automate your trading using indicators, patterns, and conditions.
              </Text>
              
              <TextInput
                label="Rule Name"
                value={automationName}
                onChangeText={setAutomationName}
                style={styles.input}
                mode="outlined"
                placeholder="e.g., RSI Oversold Strategy"
              />
              
              <TextInput
                label="Trading Instructions"
                value={automationInstructions}
                onChangeText={setAutomationInstructions}
                style={[styles.input, styles.textArea]}
                mode="outlined"
                multiline
                numberOfLines={6}
                placeholder="Describe your trading logic using indicators, price action, risk management..."
              />
              
              <Text style={styles.examplesTitle}>Example Instructions:</Text>
              <ScrollView style={styles.examplesContainer} horizontal showsHorizontalScrollIndicator={false}>
                {AUTOMATION_EXAMPLES.map((example, index) => (
                  <Button
                    key={index}
                    mode="outlined"
                    onPress={() => insertExample(example)}
                    style={styles.exampleButton}
                    compact
                  >
                    Example {index + 1}
                  </Button>
                ))}
              </ScrollView>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowAutomationDialog(false)}>Cancel</Button>
              <Button mode="contained" onPress={handleSaveAutomation} style={styles.saveButton}>
                Save Rule
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 14,
    color: '#8B5CF6',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  signalCard: {
    backgroundColor: '#1E293B',
    marginBottom: 16,
    borderRadius: 12,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signalContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  signalMain: {
    flex: 1,
  },
  signalText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  signalStrength: {
    color: '#94A3B8',
    fontSize: 16,
  },
  signalDetails: {
    alignItems: 'flex-end',
  },
  symbolText: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
  },
  timestampText: {
    color: '#64748B',
    fontSize: 12,
  },
  analysisCard: {
    backgroundColor: '#1E293B',
    marginBottom: 16,
    borderRadius: 12,
  },
  sectionDescription: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 16,
  },
  analysisTypes: {
    gap: 12,
  },
  analysisItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  analysisInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  analysisName: {
    color: '#F8FAFC',
    fontSize: 16,
  },
  strategiesCard: {
    backgroundColor: '#1E293B',
    marginBottom: 16,
    borderRadius: 12,
  },
  strategyList: {
    gap: 12,
  },
  strategyItem: {
    padding: 16,
    backgroundColor: '#334155',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedStrategy: {
    borderColor: '#00C896',
  },
  strategyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  strategyName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedStrategyText: {
    color: '#00C896',
  },
  selectedButton: {
    backgroundColor: '#00C896',
  },
  strategyDescription: {
    color: '#94A3B8',
    fontSize: 14,
  },
  automationCard: {
    backgroundColor: '#1E293B',
    marginBottom: 16,
    borderRadius: 12,
  },
  automationToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  automationInfo: {
    flex: 1,
  },
  automationLabel: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
  },
  automationDescription: {
    color: '#94A3B8',
    fontSize: 14,
  },
  automationSettings: {
    padding: 16,
    backgroundColor: '#334155',
    borderRadius: 8,
  },
  settingsTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    color: '#94A3B8',
    fontSize: 14,
  },
  settingValue: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '500',
  },
  customAutomationCard: {
    backgroundColor: '#1E293B',
    marginBottom: 16,
    borderRadius: 12,
  },
  addRuleButton: {
    backgroundColor: '#8B5CF6',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyStateSubtext: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  rulesList: {
    gap: 12,
  },
  ruleItem: {
    padding: 16,
    backgroundColor: '#334155',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ruleInfo: {
    flex: 1,
  },
  ruleName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ruleDate: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  ruleActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ruleDescription: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  ruleStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  insightsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    marginBottom: 20,
  },
  insightsList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#334155',
    borderRadius: 6,
  },
  insightText: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
  },
  dialogTitle: {
    color: '#F8FAFC',
  },
  dialogDescription: {
    color: '#94A3B8',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#334155',
  },
  textArea: {
    minHeight: 120,
  },
  examplesTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  examplesContainer: {
    marginBottom: 16,
  },
  exampleButton: {
    marginRight: 8,
    borderColor: '#8B5CF6',
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
  },
});