import React, { useState, Platform } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, TextInput, Switch, Divider, List, Portal, Dialog } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTrading } from '../../hooks/useTrading';
import { Colors, Gradients } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

export default function Settings() {
  const { 
    mt5Config, 
    brokerConfig, 
    tradingMode,
    realTimeData,
    isConnecting,
    connectionError,
    connectMT5, 
    connectBroker,
    connectMarketData,
    disconnectMT5, 
    disconnectBroker,
    disconnectMarketData,
    switchTradingMode 
  } = useTrading();

  // MT5 Demo Connection State
  const [mt5Server, setMt5Server] = useState('');
  const [mt5Login, setMt5Login] = useState('');
  const [mt5Password, setMt5Password] = useState('');

  // Broker API Connection State
  const [brokerApiKey, setBrokerApiKey] = useState('');
  const [brokerAccountId, setBrokerAccountId] = useState('');
  const [brokerEnvironment, setBrokerEnvironment] = useState<'sandbox' | 'live'>('sandbox');

  // UI State
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [showMT5Config, setShowMT5Config] = useState(false);
  const [showBrokerConfig, setShowBrokerConfig] = useState(false);
  const [showRiskWarning, setShowRiskWarning] = useState(false);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleMT5Connect = async () => {
    if (!mt5Server.trim() || !mt5Login.trim() || !mt5Password.trim()) {
      showAlert('Missing Information', 'Please fill in all MT5 connection fields.');
      return;
    }

    try {
      await connectMT5({
        server: mt5Server.trim(),
        login: mt5Login.trim(),
        password: mt5Password.trim(),
      });
      showAlert('Success', 'Connected to MT5 demo server successfully!');
      setShowMT5Config(false);
    } catch (error) {
      showAlert('Connection Failed', error instanceof Error ? error.message : 'Failed to connect to MT5');
    }
  };

  const handleBrokerConnect = async () => {
    if (!brokerApiKey.trim() || !brokerAccountId.trim()) {
      showAlert('Missing Information', 'Please provide both API key and account ID.');
      return;
    }

    if (brokerEnvironment === 'live') {
      setShowRiskWarning(true);
      return;
    }

    try {
      await connectBroker({
        apiKey: brokerApiKey.trim(),
        accountId: brokerAccountId.trim(),
        environment: brokerEnvironment,
      });
      showAlert('Success', `Connected to ${brokerEnvironment} broker successfully!`);
      setShowBrokerConfig(false);
    } catch (error) {
      showAlert('Connection Failed', error instanceof Error ? error.message : 'Failed to connect to broker');
    }
  };

  const handleLiveTradingConfirm = async () => {
    setShowRiskWarning(false);
    
    try {
      await connectBroker({
        apiKey: brokerApiKey.trim(),
        accountId: brokerAccountId.trim(),
        environment: 'live',
      });
      showAlert('Live Trading Active', 'You are now connected to live trading. Real money is at risk!');
      setShowBrokerConfig(false);
    } catch (error) {
      showAlert('Connection Failed', error instanceof Error ? error.message : 'Failed to connect to live broker');
    }
  };

  const handleMarketDataConnect = async () => {
    try {
      await connectMarketData();
      showAlert('Success', 'Connected to real-time market data successfully!');
    } catch (error) {
      showAlert('Connection Failed', error instanceof Error ? error.message : 'Failed to connect to market data');
    }
  };

  const ConnectionStatus = ({ title, connected, onConnect, onDisconnect, environment }: {
    title: string;
    connected: boolean;
    onConnect: () => void;
    onDisconnect: () => void;
    environment?: string;
  }) => (
    <View style={styles.connectionItem}>
      <View style={styles.connectionHeader}>
        <Text style={styles.connectionTitle}>{title}</Text>
        <View style={[styles.statusBadge, { 
          backgroundColor: connected ? Colors.bullish + '20' : Colors.bearish + '20' 
        }]}>
          <MaterialIcons 
            name={connected ? "check-circle" : "cancel"} 
            size={16} 
            color={connected ? Colors.bullish : Colors.bearish} 
          />
          <Text style={[styles.statusText, { 
            color: connected ? Colors.bullish : Colors.bearish 
          }]}>
            {connected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
      </View>
      {environment && (
        <Text style={styles.environmentText}>Environment: {environment}</Text>
      )}
      <View style={styles.connectionButtons}>
        <Button
          mode="outlined"
          onPress={onConnect}
          disabled={isConnecting || connected}
          loading={isConnecting}
          style={styles.connectionButton}
          textColor={Colors.primary}
        >
          Connect
        </Button>
        <Button
          mode="text"
          onPress={onDisconnect}
          disabled={!connected}
          textColor={Colors.bearish}
        >
          Disconnect
        </Button>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={Gradients.header}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Configure your trading environment</Text>
          </View>
          <MaterialIcons name="settings" size={28} color={Colors.primary} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Trading Mode */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Trading Mode</Text>
              <MaterialIcons name="swap-horiz" size={24} color={Colors.primary} />
            </View>
            
            <View style={styles.tradingModeContainer}>
              <View style={styles.modeOption}>
                <View style={styles.modeInfo}>
                  <Text style={styles.modeTitle}>Demo Trading</Text>
                  <Text style={styles.modeDescription}>Practice with simulated data</Text>
                </View>
                <Switch
                  value={tradingMode === 'demo'}
                  onValueChange={() => switchTradingMode('demo')}
                />
              </View>
              
              <Divider style={styles.divider} />
              
              <View style={styles.modeOption}>
                <View style={styles.modeInfo}>
                  <Text style={styles.modeTitle}>Live Trading</Text>
                  <Text style={styles.modeDescription}>Real money at risk</Text>
                </View>
                <Switch
                  value={tradingMode === 'live'}
                  onValueChange={() => switchTradingMode('live')}
                />
              </View>
            </View>
            
            {tradingMode === 'live' && (
              <View style={styles.warningContainer}>
                <MaterialIcons name="warning" size={20} color={Colors.bearish} />
                <Text style={styles.warningText}>
                  Live trading mode is active. Your real money is at risk.
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Connection Status */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Connection Status</Text>
              <MaterialIcons name="cloud" size={24} color={Colors.accent} />
            </View>
            
            <ConnectionStatus
              title="Market Data Feed"
              connected={realTimeData.dataProvider !== null}
              onConnect={handleMarketDataConnect}
              onDisconnect={disconnectMarketData}
              environment={realTimeData.dataProvider || undefined}
            />
            
            <Divider style={styles.divider} />
            
            {tradingMode === 'demo' ? (
              <ConnectionStatus
                title="MT5 Demo Server"
                connected={mt5Config.connected}
                onConnect={() => setShowMT5Config(true)}
                onDisconnect={disconnectMT5}
                environment="Demo"
              />
            ) : (
              <ConnectionStatus
                title="Live Broker API"
                connected={brokerConfig.connected}
                onConnect={() => setShowBrokerConfig(true)}
                onDisconnect={disconnectBroker}
                environment={brokerConfig.environment}
              />
            )}
          </Card.Content>
        </Card>

        {/* API Configuration */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>API Configuration</Text>
              <MaterialIcons name="key" size={24} color={Colors.secondary} />
            </View>
            
            <List.Item
              title="Market Data API Keys"
              description="Configure Alpha Vantage, Polygon.io API keys"
              left={(props) => <MaterialIcons name="trending-up" size={24} color={Colors.primary} {...props} />}
              right={(props) => <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} {...props} />}
              onPress={() => setShowApiKeys(true)}
              style={styles.listItem}
            />
            
            <List.Item
              title="Broker API Settings"
              description="OANDA API configuration"
              left={(props) => <MaterialIcons name="account-balance" size={24} color={Colors.accent} {...props} />}
              right={(props) => <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} {...props} />}
              onPress={() => setShowBrokerConfig(true)}
              style={styles.listItem}
            />
            
            {tradingMode === 'demo' && (
              <List.Item
                title="MT5 Demo Connection"
                description="Configure demo trading server"
                left={(props) => <MaterialIcons name="computer" size={24} color={Colors.secondary} {...props} />}
                right={(props) => <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} {...props} />}
                onPress={() => setShowMT5Config(true)}
                style={styles.listItem}
              />
            )}
          </Card.Content>
        </Card>

        {/* Account Information */}
        {realTimeData.accountInfo && (
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.sectionHeader}>
                <Text style={styles.cardTitle}>Account Information</Text>
                <MaterialIcons name="account-circle" size={24} color={Colors.primary} />
              </View>
              
              <View style={styles.accountGrid}>
                <View style={styles.accountItem}>
                  <Text style={styles.accountLabel}>Balance</Text>
                  <Text style={styles.accountValue}>
                    {'currency' in realTimeData.accountInfo ? realTimeData.accountInfo.currency : 'USD'} {
                      ('balance' in realTimeData.accountInfo ? realTimeData.accountInfo.balance : 0).toFixed(2)
                    }
                  </Text>
                </View>
                
                <View style={styles.accountItem}>
                  <Text style={styles.accountLabel}>Equity</Text>
                  <Text style={styles.accountValue}>
                    {'currency' in realTimeData.accountInfo ? realTimeData.accountInfo.currency : 'USD'} {
                      ('equity' in realTimeData.accountInfo ? realTimeData.accountInfo.equity : 0).toFixed(2)
                    }
                  </Text>
                </View>
                
                <View style={styles.accountItem}>
                  <Text style={styles.accountLabel}>Open Positions</Text>
                  <Text style={styles.accountValue}>{realTimeData.positions.length}</Text>
                </View>
                
                <View style={styles.accountItem}>
                  <Text style={styles.accountLabel}>Environment</Text>
                  <Text style={[styles.accountValue, { 
                    color: tradingMode === 'live' ? Colors.bearish : Colors.bullish 
                  }]}>
                    {tradingMode === 'live' ? 'LIVE' : 'DEMO'}
                  </Text>
                </View>
              </View>
              
              {connectionError && (
                <View style={styles.errorContainer}>
                  <MaterialIcons name="error" size={20} color={Colors.bearish} />
                  <Text style={styles.errorText}>{connectionError}</Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* MT5 Configuration Modal */}
      <Portal>
        <Modal
          visible={showMT5Config}
          onDismiss={() => setShowMT5Config(false)}
          contentContainerStyle={styles.modalContent}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>MT5 Demo Connection</Text>
            <Button onPress={() => setShowMT5Config(false)} textColor={Colors.textMuted}>
              <MaterialIcons name="close" size={24} />
            </Button>
          </View>
          
          <View style={styles.modalBody}>
            <Text style={styles.modalDescription}>
              Connect to your MT5 demo server for practice trading.
            </Text>
            
            <TextInput
              label="Server Name"
              placeholder="e.g., MetaQuotes-Demo, YourBroker-Demo"
              value={mt5Server}
              onChangeText={setMt5Server}
              style={styles.input}
            />
            
            <TextInput
              label="Login (Account Number)"
              placeholder="e.g., 12345678"
              value={mt5Login}
              onChangeText={setMt5Login}
              keyboardType="numeric"
              style={styles.input}
            />
            
            <TextInput
              label="Password"
              placeholder="Your MT5 password"
              value={mt5Password}
              onChangeText={setMt5Password}
              secureTextEntry
              style={styles.input}
            />
            
            <View style={styles.demoCredentials}>
              <Text style={styles.demoTitle}>Demo Credentials:</Text>
              <Text style={styles.demoText}>Server: demo</Text>
              <Text style={styles.demoText}>Login: 12345</Text>
              <Text style={styles.demoText}>Password: demo123</Text>
            </View>
            
            <Button
              mode="contained"
              onPress={handleMT5Connect}
              loading={isConnecting}
              disabled={isConnecting}
              style={styles.connectButton}
            >
              Connect to Demo
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Broker Configuration Modal */}
      <Portal>
        <Modal
          visible={showBrokerConfig}
          onDismiss={() => setShowBrokerConfig(false)}
          contentContainerStyle={styles.modalContent}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Broker API Configuration</Text>
            <Button onPress={() => setShowBrokerConfig(false)} textColor={Colors.textMuted}>
              <MaterialIcons name="close" size={24} />
            </Button>
          </View>
          
          <View style={styles.modalBody}>
            <Text style={styles.modalDescription}>
              Configure your OANDA API credentials for live trading.
            </Text>
            
            <TextInput
              label="API Key"
              placeholder="Your OANDA API key"
              value={brokerApiKey}
              onChangeText={setBrokerApiKey}
              secureTextEntry
              style={styles.input}
            />
            
            <TextInput
              label="Account ID"
              placeholder="Your OANDA account ID"
              value={brokerAccountId}
              onChangeText={setBrokerAccountId}
              style={styles.input}
            />
            
            <View style={styles.environmentSelector}>
              <Text style={styles.environmentLabel}>Environment:</Text>
              <View style={styles.environmentButtons}>
                <Button
                  mode={brokerEnvironment === 'sandbox' ? 'contained' : 'outlined'}
                  onPress={() => setBrokerEnvironment('sandbox')}
                  style={styles.environmentButton}
                  textColor={brokerEnvironment === 'sandbox' ? Colors.background : Colors.primary}
                >
                  Sandbox
                </Button>
                <Button
                  mode={brokerEnvironment === 'live' ? 'contained' : 'outlined'}
                  onPress={() => setBrokerEnvironment('live')}
                  style={styles.environmentButton}
                  buttonColor={brokerEnvironment === 'live' ? Colors.bearish : undefined}
                  textColor={brokerEnvironment === 'live' ? Colors.background : Colors.bearish}
                >
                  Live
                </Button>
              </View>
            </View>
            
            <Button
              mode="contained"
              onPress={handleBrokerConnect}
              loading={isConnecting}
              disabled={isConnecting}
              style={styles.connectButton}
              buttonColor={brokerEnvironment === 'live' ? Colors.bearish : Colors.primary}
            >
              Connect to {brokerEnvironment === 'live' ? 'Live' : 'Sandbox'}
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* API Keys Information Modal */}
      <Portal>
        <Modal
          visible={showApiKeys}
          onDismiss={() => setShowApiKeys(false)}
          contentContainerStyle={styles.modalContent}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Market Data API Keys</Text>
            <Button onPress={() => setShowApiKeys(false)} textColor={Colors.textMuted}>
              <MaterialIcons name="close" size={24} />
            </Button>
          </View>
          
          <View style={styles.modalBody}>
            <Text style={styles.modalDescription}>
              Configure your market data provider API keys in Supabase environment variables.
            </Text>
            
            <View style={styles.apiKeyInfo}>
              <Text style={styles.apiKeyTitle}>Required Variables:</Text>
              <Text style={styles.apiKeyItem}>• EXPO_PUBLIC_ALPHA_VANTAGE_API_KEY</Text>
              <Text style={styles.apiKeyItem}>• EXPO_PUBLIC_POLYGON_API_KEY</Text>
              <Text style={styles.apiKeyItem}>• EXPO_PUBLIC_OANDA_API_KEY</Text>
              <Text style={styles.apiKeyItem}>• EXPO_PUBLIC_OANDA_ACCOUNT_ID</Text>
            </View>
            
            <Text style={styles.apiKeyNote}>
              These keys should be configured in your Supabase project settings for security.
            </Text>
            
            <Button
              mode="outlined"
              onPress={handleMarketDataConnect}
              style={styles.connectButton}
              textColor={Colors.primary}
            >
              Test Market Data Connection
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Risk Warning Dialog */}
      <Portal>
        <Dialog visible={showRiskWarning} onDismiss={() => setShowRiskWarning(false)}>
          <Dialog.Icon icon="warning" size={48} />
          <Dialog.Title style={styles.warningTitle}>Live Trading Risk Warning</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.warningDialogText}>
              You are about to connect to a LIVE trading environment where REAL MONEY is at risk.
            </Text>
            <Text style={styles.warningDialogText}>
              • All trades will be executed with real funds
            </Text>
            <Text style={styles.warningDialogText}>
              • Losses can exceed your initial investment
            </Text>
            <Text style={styles.warningDialogText}>
              • Ensure you understand the risks involved
            </Text>
            <Text style={styles.warningDialogText}>
              • Only trade with money you can afford to lose
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowRiskWarning(false)}>Cancel</Button>
            <Button 
              onPress={handleLiveTradingConfirm}
              textColor={Colors.bearish}
              buttonColor={Colors.bearish + '20'}
            >
              I Understand the Risks
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    marginBottom: 20,
  },
  cardTitle: {
    ...Typography.h6,
    color: Colors.textPrimary,
  },
  tradingModeContainer: {
    gap: 16,
  },
  modeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeInfo: {
    flex: 1,
  },
  modeTitle: {
    ...Typography.body1,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  modeDescription: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  divider: {
    backgroundColor: Colors.border,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bearish + '10',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  warningText: {
    ...Typography.body2,
    color: Colors.bearish,
    flex: 1,
  },
  connectionItem: {
    marginBottom: 16,
  },
  connectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  connectionTitle: {
    ...Typography.body1,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  environmentText: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  connectionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  connectionButton: {
    borderColor: Colors.primary,
  },
  listItem: {
    paddingVertical: 8,
  },
  accountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  accountItem: {
    flex: 1,
    minWidth: '45%',
  },
  accountLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  accountValue: {
    ...Typography.body1,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bearish + '10',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  errorText: {
    ...Typography.body2,
    color: Colors.bearish,
    flex: 1,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    margin: 20,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  modalTitle: {
    ...Typography.h6,
    color: Colors.textPrimary,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalDescription: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  input: {
    marginBottom: 16,
    backgroundColor: Colors.inputBackground,
  },
  demoCredentials: {
    backgroundColor: Colors.primary + '10',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  demoTitle: {
    ...Typography.body2,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  demoText: {
    ...Typography.caption,
    color: Colors.primary,
    fontFamily: 'monospace',
  },
  environmentSelector: {
    marginBottom: 20,
  },
  environmentLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  environmentButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  environmentButton: {
    flex: 1,
  },
  connectButton: {
    marginTop: 8,
  },
  apiKeyInfo: {
    backgroundColor: Colors.cardElevated,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  apiKeyTitle: {
    ...Typography.body2,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 8,
  },
  apiKeyItem: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  apiKeyNote: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  warningTitle: {
    color: Colors.bearish,
    textAlign: 'center',
  },
  warningDialogText: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
});